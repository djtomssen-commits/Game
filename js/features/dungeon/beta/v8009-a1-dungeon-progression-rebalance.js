/* ===== V4.02 DUNGEON PROGRESSION REBALANCE =====
   Dungeon 1 is intended to occupy roughly levels 1-19.
   Players may attempt every reached enemy early, but large level gaps
   now create a serious combat disadvantage instead of a hard lock.
*/

const V060_D1_REC=[2,4,6,8,10,12,14,16,18,20];

v025RecommendedLevel=function(dungeonIndex,roomIndex){
  roomIndex=Math.max(0,Math.min(9,Number(roomIndex)||0));
  if(dungeonIndex===0)return V060_D1_REC[roomIndex];
  const start=20+(dungeonIndex-1)*10;
  return start+Math.round(roomIndex*(9/9));
};

v025EnemyStats=function(dungeonIndex,roomIndex,enemy){
  const rec=v025RecommendedLevel(dungeonIndex,roomIndex);
  const boss=roomIndex===9||enemy?.boss;
  const dungeonMult=1+dungeonIndex*.14;

  /* Dungeon 1 curve is deliberately much steeper than before.
     At Lv.6 with weak gear, the Milbenkönigin should be far out of reach. */
  let hp,attack;
  if(dungeonIndex===0){
    const hpCurve=[95,145,215,300,405,535,690,875,1090,1450];
    const atkCurve=[15,20,27,35,44,54,66,79,94,125];
    hp=hpCurve[roomIndex];
    attack=atkCurve[roomIndex];
  }else{
    hp=Math.round((85+rec*22+roomIndex*13)*dungeonMult*(boss?1.42:1));
    attack=Math.round((10+rec*3.8+roomIndex*1.15)*dungeonMult*(boss?1.22:1));
  }

  return {rec,hp,attack};
};

/* Underlevel scaling is applied in the actual active V4.02 battle handler
   through these helpers. It does NOT prevent an attempt. */
function v060Gap(rec){
  return Math.max(0,rec-(Number(s.level)||1));
}
function v060PlayerDamageFactor(rec){
  const gap=v060Gap(rec);
  if(gap<=1)return 1;
  return Math.max(.32,1-(gap-1)*.075);
}
function v060EnemyDamageFactor(rec){
  const gap=v060Gap(rec);
  if(gap<=1)return 1;
  return Math.min(2.05,1+(gap-1)*.075);
}

/* Replace V4.02 fight handler while preserving its stable map/reward flow. */
function v060InstallFight(){
  const btn=document.querySelector('#fightBtn');
  if(!btn)return;

  btn.onclick=()=>{
    if(battleBusy)return;

    const di=v048DungeonIndex();
    const d=dungeons[di];
    const idx=v048RoomIndex(di);
    const e=d?.enemies?.[idx];
    if(!d||!e)return;

    if(dungeonCompleted(di))return v115Alert('Dieser Dungeon ist bereits abgeschlossen.');
    if(!dungeonAvailable(di))return v115Alert('Dieser Dungeon ist noch nicht betretbar.');
    if(!s.playerClass)return v115Alert('Wähle zuerst deine Klasse.');
    if(!consumeDungeonAttempt())return;

    s.dungeon.view='battle';
    localStorage.setItem(KEY,JSON.stringify(s));
    battleBusy=true;
    btn.disabled=true;

    const loot=document.querySelector('#loot');
    if(loot)loot.innerHTML='';

    const bal=v025EnemyStats(di,idx,e);
    const gap=v060Gap(bal.rec);
    const pFactor=v060PlayerDamageFactor(bal.rec);
    const eFactor=v060EnemyDamageFactor(bal.rec);

    const maxP=maxHp();
    let pHp=maxP,eHp=bal.hp,round=0;

    const pBar=document.querySelector('#playerHpBar');
    const eBar=document.querySelector('#enemyHpBar');
    const pTxt=document.querySelector('#playerHpText');
    const eTxt=document.querySelector('#enemyHpText');
    const log=document.querySelector('#battleLog');

    if(pTxt)pTxt.textContent=pHp;
    if(eTxt)eTxt.textContent=eHp;
    if(pBar)pBar.style.width='100%';
    if(eBar)eBar.style.width='100%';

    if(log){
      log.textContent=gap>=5
        ? `⚠️ Sehr gefährlich: Gegner empfohlen Lv. ${bal.rec}, du bist Lv. ${s.level}.`
        : gap>=2
          ? `⚠️ Schwieriger Kampf: empfohlen Lv. ${bal.rec}.`
          : `⚔️ Kampf gegen empfohlen Lv. ${bal.rec}.`;
    }

    const showResult=(win)=>{
      battleBusy=false;
      btn.disabled=false;
      s.dungeon.view='reward';

      if(win){
        s.gold+=e.gold;
        addXp(e.xp);
        let html=`<div class="loot good">🏆 Sieg! +${e.xp} XP · +${e.gold} Gold</div>`;

        if(e.boss||Math.random()<.22){
          let found;
          if(e.boss){
            if(Math.random()<.12){
              const slot=setBases[Math.floor(Math.random()*setBases.length)].slot;
              found=makeSetItem(s.playerClass||'grower',slot);
            }else found=makeClassLoot(s.playerClass||'grower','boss');
          }else if(Math.random()<.8){
            found=makeClassLoot(s.playerClass||'grower','dungeon');
          }else{
            const other=['grower','bruiser','scout','frost','summoner'].filter(x=>x!==s.playerClass);
            found=makeClassLoot(other[Math.floor(Math.random()*other.length)],'dungeon');
          }
          if(found){
            s.inventory.push(found);
            html+=`<div class="loot">🎁 ${found.name}<br><span class="tiny">${itemBonus(found)}</span></div>`;
          }
        }

        if(e.boss){
          s.story.bossesDefeated=(s.story.bossesDefeated||0)+1;
          s.story.chapter=Math.min(4,1+Math.floor(s.story.bossesDefeated/2));
          if(Math.random()<.22){s.harzTaler++;html+='<div class="loot">🟢 Harz-Taler gefunden!</div>';}
          if(!s.dungeon.completed.includes(di))s.dungeon.completed.push(di);
          s.dungeon.room=9;s.dungeon.progress[di]=9;
          html+='<div class="loot good">⛓️ Dungeon abgeschlossen! Der Eingang wurde versiegelt.</div>';
        }else{
          s.dungeon.room=idx+1;s.dungeon.progress[di]=idx+1;
        }

        html+='<button class="btn gold" id="v048ReturnMap" style="width:100%;margin-top:10px">🎁 Belohnung bestätigen · Zur Dungeon-Karte</button>';
        loot.innerHTML=html;
        if(log)log.textContent=e.boss?'Boss besiegt. Bestätige deine Belohnung.':'Gegner besiegt. Bestätige deine Belohnung.';
      }else{
        loot.innerHTML='<div class="loot" style="color:#ff9895">💀 Niederlage. Der Gegner war zu stark. Verbessere Level, Skills oder Ausrüstung und versuche es erneut.</div><button class="btn secondary" id="v048ReturnMap" style="width:100%;margin-top:10px">🗺️ Zurück zur Dungeon-Karte</button>';
        if(log)log.textContent=`Niederlage · Gegner empfohlen Lv. ${bal.rec}.`;
      }

      localStorage.setItem(KEY,JSON.stringify(s));
      const back=document.querySelector('#v048ReturnMap');
      if(back)back.onclick=v048GoMap;
    };

    const step=()=>{
      if(!battleBusy)return;
      round++;

      let critChance=Math.min(.30,.04+totalAttr('glueck')*.012);
      if(s.playerClass==='bruiser')critChance+=.07+setBonusValue('critChance')+skillValue('nebel')*.025;
      if(s.playerClass==='scout')critChance+=skillValue('praez')*.018;
      const crit=Math.random()<critChance;

      const primary=(typeof v029PrimaryStat==='function')?v029PrimaryStat():totalAttr('staerke');
      let pDmg=Math.max(3,Math.floor((primary*1.9+s.level*1.55+Math.random()*7)*pFactor));
      if(crit)pDmg=Math.floor(pDmg*1.75);

      let special='';
      if((s.playerClass==='grower'||s.playerClass==='frost')&&Math.random()<(.13+setBonusValue('wuchtChance')+skillValue('wucht')*.025)){pDmg=Math.floor(pDmg*1.55);special=' WUCHTSCHLAG!';}
      if(s.playerClass==='scout'&&Math.random()<(.15+setBonusValue('doubleChance')+skillValue('schnell')*.025)){pDmg=Math.floor(pDmg*(1.42+setBonusValue('doubleDamage')));special=' DOPPELTREFFER!';}
      if(s.playerClass==='bruiser'&&crit){pDmg=Math.floor(pDmg*(1+setBonusValue('critDamage')+skillValue('overload')*.055));special=' MAGIE-KRIT!';}
      if((s.playerClass==='grower'||s.playerClass==='frost')&&skillValue('raserei'))pDmg=Math.floor(pDmg*(1+skillValue('raserei')*.03));

      animClass(document.querySelector('#playerFighter'),'attack-right');

      setTimeout(()=>{
        if(!battleBusy)return;
        eHp=Math.max(0,eHp-pDmg);
        if(eTxt)eTxt.textContent=eHp;
        if(eBar)eBar.style.width=`${Math.max(0,eHp/bal.hp*100)}%`;
        popDamage(document.querySelector('#damageEnemy'),`-${pDmg}${crit?'!':''}`);
        if(log)log.textContent=`Du verursachst ${pDmg} Schaden.${special}`;

        if(eHp<=0)return showResult(true);

        setTimeout(()=>{
          if(!battleBusy)return;

          const armor=totalAttr('ruestung');
          const evade=Math.min(.22,totalAttr('geschick')*.008);
          let eDmg;

          if(Math.random()<evade){
            eDmg=0;
            if(log)log.textContent='Du weichst dem Angriff aus!';
          }else{
            eDmg=Math.max(3,Math.floor((bal.attack+Math.random()*7-armor*.34)*eFactor));
            pHp=Math.max(0,pHp-eDmg);
            if(log)log.textContent=`Der Gegner verursacht ${eDmg} Schaden.`;
          }

          animClass(document.querySelector('#enemyFighter'),'attack-left');
          if(pTxt)pTxt.textContent=pHp;
          if(pBar)pBar.style.width=`${Math.max(0,pHp/maxP*100)}%`;
          if(eDmg)popDamage(document.querySelector('#damagePlayer'),`-${eDmg}`);

          if(pHp<=0)return showResult(false);
          if(round>=45)return showResult(pHp/maxP>eHp/bal.hp);

          setTimeout(step,330);
        },300);
      },280);
    };

    step();
  };
}

/* Phase 2 retired: v060 renderDungeon warning/fight wrapper. The final canonical dungeon owner replaces this render layer. */

/* V8.009: no-op global render wrapper and eager rerender retired.
   Balance helpers and v060InstallFight remain available to the canonical Dungeon chain. */
