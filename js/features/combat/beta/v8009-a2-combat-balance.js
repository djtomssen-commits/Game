/* ===== V4.02 Combat Balance =====
   Gegner-Level sind Empfehlungen, keine harten Sperren.
   Schwierigkeit entsteht über HP/Schaden und kontrollierte Item-Skalierung.
*/
const V025_D1_RECOMMENDED=[1,3,5,7,9,11,13,15,17,19];

function v025RecommendedLevel(dungeonIndex, roomIndex){
  if(dungeonIndex===0) return V025_D1_RECOMMENDED[Math.max(0,Math.min(9,roomIndex))];
  const start=20+(dungeonIndex-1)*10;
  return start + Math.floor(roomIndex*9/9);
}

/* V4.02 item growth was intentionally generous.
   V4.02 flattens it so one lucky item cannot skip several progression steps. */
v024Scale=function(level){
  level=Math.max(1,Number(level)||1);
  return 1+(level-1)*0.055;
};
v024Bonus=function(baseBonus,q,l){
  const rarityMult={gray:1.00,green:1.10,blue:1.23,purple:1.40,orange:1.62,cyan:1.85};
  const scale=v024Scale(l)*(rarityMult[q]||1);
  const out={};
  Object.entries(baseBonus||{}).forEach(([k,v])=>{
    out[k]=Math.max(1,Math.round((Number(v)||0)*scale));
  });
  return out;
};

/* Rebuild enemy stats around their recommended level.
   A player several levels below recommendation can still try,
   but normally gets punished heavily. */
function v025EnemyStats(dungeonIndex, roomIndex, enemy){
  const rec=v025RecommendedLevel(dungeonIndex,roomIndex);
  const boss=roomIndex===9 || enemy?.boss;
  const dungeonMult=1+dungeonIndex*.12;

  // HP grows strongly enough that under-level damage cannot race the enemy.
  const hp=Math.round((55 + rec*18 + roomIndex*9) * dungeonMult * (boss?1.32:1));

  // Attack is stored separately and used by the V4.02 fight engine.
  const attack=Math.round((8 + rec*3.35 + roomIndex*.8) * dungeonMult * (boss?1.18:1));

  return {rec,hp,attack};
}

/* Phase 2 retired: v025 renderDungeon label wrapper. The final canonical dungeon owner replaces this render layer. */

/* Replace only the fight click handler.
   No room-level lock is checked here: reaching the enemy is enough. */
document.querySelector('#fightBtn').onclick=()=>{
  if(battleBusy)return;
  const di=Math.max(0,Math.min(dungeons.length-1,s.dungeon.selected||0));
  if(dungeonCompleted(di))return v115Alert('Dieser Dungeon ist bereits abgeschlossen.');
  if(!dungeonAvailable(di))return v115Alert('Dieser Dungeon ist noch nicht betretbar.');
  if(!s.playerClass)return v115Alert('Wähle zuerst im Heldenquartier deine Klasse.');
  if(!consumeDungeonAttempt())return;

  persist(false);
  battleBusy=true;

  const btn=document.querySelector('#fightBtn');
  btn.disabled=true;
  document.querySelector('#loot').innerHTML='';

  const d=dungeons[di];
  const idx=Math.max(0,Math.min(9,(s.dungeon.progress?.[di] ?? s.dungeon.room ?? 0)));
  const e=d.enemies[idx];
  const bal=v025EnemyStats(di,idx,e);

  const maxP=maxHp();
  let pHp=maxP,eHp=bal.hp,round=0;

  const pBar=document.querySelector('#playerHpBar'),
        eBar=document.querySelector('#enemyHpBar'),
        pTxt=document.querySelector('#playerHpText'),
        eTxt=document.querySelector('#enemyHpText'),
        log=document.querySelector('#battleLog');

  eTxt.textContent=eHp;
  eBar.style.width='100%';
  pTxt.textContent=pHp;
  pBar.style.width='100%';

  const finish=win=>{
    setTimeout(()=>{
      battleBusy=false;
      btn.disabled=false;

      if(win){
        s.gold+=e.gold;
        addXp(e.xp);
        let html=`<div class="loot good">🏆 Sieg gegen empfohlen Lv. ${bal.rec}! +${e.xp} XP · +${e.gold} Gold</div>`;

        if(e.boss||Math.random()<.22){
          let found;
          if(e.boss){
            if(Math.random()<.12){
              const slot=setBases[Math.floor(Math.random()*setBases.length)].slot;
              found=makeSetItem(s.playerClass||'grower',slot);
            }else{
              found=makeClassLoot(s.playerClass||'grower','boss');
            }
          }else{
            if(Math.random()<.8){
              found=makeClassLoot(s.playerClass||'grower','dungeon');
            }else{
              const other=['grower','bruiser','scout','frost','summoner'].filter(x=>x!==s.playerClass);
              found=makeClassLoot(other[Math.floor(Math.random()*other.length)],'dungeon');
            }
          }
          s.inventory.push(found);
          html+=`<div class="loot">🎁 ${found.icon||'🎁'} ${found.name}<br><span class="tiny">${itemBonus(found)}</span></div>`;
        }

        if(e.boss){
          s.story.bossesDefeated++;
          s.story.chapter=Math.min(4,1+Math.floor(s.story.bossesDefeated/2));
          if(Math.random()<.22){
            s.harzTaler++;
            html+=`<div class="loot">🟢 Harz-Taler gefunden!</div>`;
          }
          if(!s.dungeon.completed.includes(di))s.dungeon.completed.push(di);
          s.dungeon.room=9;
          s.dungeon.progress[di]=9;
          html+=`<div class="loot good">⛓️ Dungeon abgeschlossen!</div>`;
        }else{
          s.dungeon.room=idx+1;
          s.dungeon.progress[di]=idx+1;
        }

        document.querySelector('#loot').innerHTML=html;
        log.textContent=e.boss?'Boss besiegt.':'Gegner besiegt. Der nächste Gegner ist jetzt erreichbar.';
        persist();
      }else{
        document.querySelector('#loot').innerHTML='<div class="loot" style="color:#ff9895">💀 Niederlage. Der Gegner war zu stark. Verbessere Level, Skills oder Ausrüstung und versuche es erneut.</div>';
        log.textContent=`Niederlage gegen empfohlen Level ${bal.rec}.`;
      }
    },400);
  };

  const step=()=>{
    round++;

    let critChance=Math.min(.30,.04+totalAttr('glueck')*.012);
    if(s.playerClass==='bruiser')critChance+=.07+setBonusValue('critChance')+skillValue('nebel')*.025;
    if(s.playerClass==='scout')critChance+=skillValue('praez')*.018;

    const crit=Math.random()<critChance;

    // Controlled player damage: gear helps, but level remains important.
    let pDmg=Math.max(4,Math.floor(
      totalAttr('staerke')*1.45 +
      totalAttr('geschick')*.58 +
      s.level*1.65 +
      Math.random()*7
    ));

    if(crit)pDmg=Math.floor(pDmg*1.75);

    let special='';
    if((s.playerClass==='grower'||s.playerClass==='frost')&&Math.random()<(.13+setBonusValue('wuchtChance')+skillValue('wucht')*.025)){
      pDmg=Math.floor(pDmg*1.55);special=' WUCHTSCHLAG!';
    }
    if(s.playerClass==='scout'&&Math.random()<(.15+setBonusValue('doubleChance')+skillValue('schnell')*.025)){
      pDmg=Math.floor(pDmg*(1.42+setBonusValue('doubleDamage')));special=' DOPPELTREFFER!';
    }
    if(s.playerClass==='bruiser'&&crit){
      pDmg=Math.floor(pDmg*(1+setBonusValue('critDamage')+skillValue('overload')*.055));special=' MAGIE-KRIT!';
    }
    if((s.playerClass==='grower'||s.playerClass==='frost')&&skillValue('raserei')){
      pDmg=Math.floor(pDmg*(1+skillValue('raserei')*.03));
    }

    animClass(document.querySelector('#playerFighter'),'attack-right');
    setTimeout(()=>{
      eHp=Math.max(0,eHp-pDmg);
      eBar.style.width=(eHp/bal.hp*100)+'%';
      eTxt.textContent=eHp;
      popDamage(document.querySelector('#damageEnemy'),`${crit||special?'KRIT! ':''}-${pDmg}`);
      animClass(document.querySelector('#enemyFighter'),'hit');
      log.textContent=`Runde ${round}: Du verursachst ${pDmg} Schaden.${special}`;

      if(eHp<=0)return finish(true);

      setTimeout(()=>{
        // Defense helps, but cannot completely erase a much stronger enemy.
        const defense=totalAttr('ausdauer')*.38;
        let eDmg=Math.max(2,Math.floor(bal.attack + Math.random()*7 - defense));

        const skillReduce=(s.playerClass==='grower'||s.playerClass==='frost')?skillValue('fell')*.035:
                          s.playerClass==='bruiser'?skillValue('mantel')*.028:
                          s.playerClass==='scout'?skillValue('tarn')*.028:0;
        eDmg=Math.max(1,Math.floor(eDmg*(1-skillReduce)));

        animClass(document.querySelector('#enemyFighter'),'attack-left');
        setTimeout(()=>{
          pHp=Math.max(0,pHp-eDmg);
          pBar.style.width=(pHp/maxP*100)+'%';
          pTxt.textContent=pHp;
          popDamage(document.querySelector('#damagePlayer'),`-${eDmg}`);
          animClass(document.querySelector('#playerFighter'),'hit');
          log.textContent+=` Gegner trifft dich für ${eDmg}.`;

          if(pHp<=0)return finish(false);
          setTimeout(step,360);
        },240);
      },380);
    },240);
  };

  step();
};

try{renderDungeon()}catch(e){console.error('V4.02 combat balance',e)}
