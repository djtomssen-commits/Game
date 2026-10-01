/* ===== V4.02 CLEAN DUNGEON STATE MACHINE =====
   One flow only: map -> battle -> reward -> map.
   No MutationObserver. No post-battle polling. No recurring battle timers.
*/

s.dungeon ??= {};
s.dungeon.view ??= 'map';

function v048DungeonIndex(){
  return Math.max(0, Math.min(dungeons.length-1, Number(s.dungeon.selected)||0));
}
function v048RoomIndex(di=v048DungeonIndex()){
  return Math.max(0, Math.min(9, Number(s.dungeon.progress?.[di] ?? s.dungeon.room ?? 0)||0));
}
function v048GoMap(){
  s.dungeon.view='map';
  const loot=document.querySelector('#loot');
  if(loot) loot.innerHTML='';
  localStorage.setItem(KEY,JSON.stringify(s));
  render();
  window.scrollTo({top:0,behavior:'smooth'});
}
function v048GoBattle(i){
  const d=dungeons[i];
  if(!d)return;
  if(dungeonCompleted(i))return v115Alert(`${d.name} wurde bereits abgeschlossen.`);
  if(s.level<d.minLevel)return v115Alert(`Dieser Dungeon ist erst ab Level ${d.minLevel} verfügbar.`);
  if(!dungeonUnlocked(i))return v115Alert(`${d.keyName} fehlt. Den Stein kannst du beim Questen finden.`);

  s.dungeon.selected=i;
  s.dungeon.room=Math.max(0,Math.min(9,s.dungeon.progress?.[i]??0));
  s.dungeon.view='battle';

  const loot=document.querySelector('#loot');
  if(loot)loot.innerHTML='';

  localStorage.setItem(KEY,JSON.stringify(s));
  render();
  window.scrollTo({top:0,behavior:'smooth'});
}

window.selectDungeon=v048GoBattle;

/* V7.118 cleanup: retired dead pre-canonical v048 navigation wrapper.
   v6101 defines the navigation base later; final dungeon owners handle map entry. */

/* Phase 2 retired: v048 renderDungeon visibility wrapper. The final canonical dungeon owner replaces this render layer. */

/* Install one deterministic battle handler. */
function v048InstallFight(){
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
    try{
      document.querySelector('#dungeonBattleCard')?.classList.add('v252-fighting');
      const chip=document.querySelector('#v252RoundChip');if(chip)chip.textContent='KAMPF LÄUFT';
    }catch(_){ }

    const loot=document.querySelector('#loot');
    if(loot)loot.innerHTML='';

    const bal=(typeof v025EnemyStats==='function')
      ? v025EnemyStats(di,idx,e)
      : {rec:e.requiredLevel||d.minLevel,hp:e.hp,attack:Math.max(8,Math.round(e.hp/10))};

    const maxP=maxHp();
    let pHp=maxP;
    let eHp=bal.hp;
    let round=0;

    const pBar=document.querySelector('#playerHpBar');
    const eBar=document.querySelector('#enemyHpBar');
    const pTxt=document.querySelector('#playerHpText');
    const eTxt=document.querySelector('#enemyHpText');
    const log=document.querySelector('#battleLog');

    if(pTxt)pTxt.textContent=pHp;
    if(eTxt)eTxt.textContent=eHp;
    if(pBar)pBar.style.width='100%';
    if(eBar)eBar.style.width='100%';

    const showResult=(win)=>{
      battleBusy=false;
      btn.disabled=false;
      s.dungeon.view='reward';

      if(win){
        s.gold+=e.gold;
        addXp(e.xp);

        let html=`<div class="loot good">🏆 Sieg! +${e.xp} XP · +${e.gold} Gold</div>`;

        if(e.boss || Math.random()<.22){
          let found;
          if(e.boss){
            if(Math.random()<.12){
              const slot=setBases[Math.floor(Math.random()*setBases.length)].slot;
              found=makeSetItem(s.playerClass||'grower',slot);
            }else{
              found=makeClassLoot(s.playerClass||'grower','boss');
            }
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

          if(Math.random()<.22){
            s.harzTaler++;
            html+='<div class="loot">🟢 Harz-Taler gefunden!</div>';
          }

          if(!s.dungeon.completed.includes(di))s.dungeon.completed.push(di);
          s.dungeon.room=9;
          s.dungeon.progress[di]=9;
          html+='<div class="loot good">⛓️ Dungeon abgeschlossen! Der Eingang wurde versiegelt.</div>';
        }else{
          s.dungeon.room=idx+1;
          s.dungeon.progress[di]=idx+1;
        }

        html+='<button class="btn gold" id="v048ReturnMap" style="width:100%;margin-top:10px">🎁 Belohnung bestätigen · Zur Dungeon-Karte</button>';
        loot.innerHTML=html;
        if(log)log.textContent=e.boss
          ? 'Boss besiegt. Bestätige deine Belohnung.'
          : 'Gegner besiegt. Bestätige deine Belohnung.';
      }else{
        loot.innerHTML=
          '<div class="loot" style="color:#ff9895">💀 Niederlage. Der Gegner war zu stark. Verbessere deinen Helden und versuche es erneut.</div>'+
          '<button class="btn secondary" id="v048ReturnMap" style="width:100%;margin-top:10px">🗺️ Zurück zur Dungeon-Karte</button>';
        if(log)log.textContent='Du wurdest besiegt. Es geht nichts verloren.';
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

      const primary=(typeof v029PrimaryStat==='function')
        ? v029PrimaryStat()
        : totalAttr('staerke');

      let pDmg=Math.max(4,Math.floor(primary*1.9+s.level*1.55+Math.random()*7));
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
        if(!battleBusy)return;

        eHp=Math.max(0,eHp-pDmg);
        if(eBar)eBar.style.width=(eHp/bal.hp*100)+'%';
        if(eTxt)eTxt.textContent=eHp;
        popDamage(document.querySelector('#damageEnemy'),`${crit||special?'KRIT! ':''}-${pDmg}`);
        animClass(document.querySelector('#enemyFighter'),'hit');
        if(log)log.textContent=`Runde ${round}: Du verursachst ${pDmg} Schaden.${special}`;

        if(eHp<=0){
          showResult(true);
          return;
        }

        setTimeout(()=>{
          if(!battleBusy)return;

          const defense=totalAttr('ausdauer')*.38;
          let eDmg=Math.max(2,Math.floor(bal.attack+Math.random()*7-defense));

          const skillReduce=
            (s.playerClass==='grower'||s.playerClass==='frost')?skillValue('fell')*.035:
            s.playerClass==='bruiser'?skillValue('mantel')*.028:
            s.playerClass==='scout'?skillValue('tarn')*.028:0;

          eDmg=Math.max(1,Math.floor(eDmg*(1-skillReduce)));

          animClass(document.querySelector('#enemyFighter'),'attack-left');

          setTimeout(()=>{
            if(!battleBusy)return;

            pHp=Math.max(0,pHp-eDmg);
            if(pBar)pBar.style.width=(pHp/maxP*100)+'%';
            if(pTxt)pTxt.textContent=pHp;
            popDamage(document.querySelector('#damagePlayer'),`-${eDmg}`);
            animClass(document.querySelector('#playerFighter'),'hit');
            if(log)log.textContent+=` Gegner trifft dich für ${eDmg}.`;

            if(pHp<=0){
              showResult(false);
              return;
            }

            setTimeout(step,360);
          },240);
        },380);
      },240);
    };

    step();
  };
}

/* V8.009: obsolete global reward-button render wrapper retired.
   The reward creation path already binds #v048ReturnMap directly. */

try{
  if(document.querySelector('#dungeon')?.classList.contains('active')){
    s.dungeon.view='map';
  }
  localStorage.setItem(KEY,JSON.stringify(s));
  render();
}catch(e){
  console.error('V4.02 clean dungeon flow',e);
}
