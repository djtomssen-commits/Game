/* ===== V4.02 dungeon interaction fixes ===== */

/* Cleanly switch the shared card from world-map styling to 10-room styling. */
const v068BaseRenderMap = v064RenderMap;
v064RenderMap=function(){
  const result = v068BaseRenderMap();

  const card=document.querySelector('#dungeonMapCard');
  if(card){
    card.classList.remove('v065-worldmap-card');
    card.classList.add('v064-detail-map');

    if(!card.querySelector('.v068-detail-terrain')){
      const terrain=document.createElement('div');
      terrain.className='v068-detail-terrain';
      card.insertBefore(terrain,card.firstChild);
    }
  }

  return result;
};

/* And when showing the 20-dungeon world, remove the detail class again. */
const v068BaseWorldRender = v065RenderWorld;
v065RenderWorld=function(){
  v068BaseWorldRender();

  const card=document.querySelector('#dungeonMapCard');
  if(card){
    card.classList.remove('v064-detail-map');
    card.classList.add('v065-worldmap-card');
    card.querySelector('.v068-detail-terrain')?.remove();
  }

  try{v067BindWorldMap();}catch(e){}
};

/* FINAL fight handler:
   consumeDungeonAttempt() is async since V4.02, therefore we MUST await it.
   Otherwise a Promise starts the fight immediately even when the user cancels.
*/
function v068InstallFight(){
  const btn=document.querySelector('#fightBtn');
  if(!btn)return;

  btn.onclick=async()=>{
    if(battleBusy)return;

    const di=v048DungeonIndex();
    const d=dungeons[di];
    const idx=v048RoomIndex(di);
    const e=d?.enemies?.[idx];
    if(!d||!e)return;

    if(dungeonCompleted(di)){
      if(typeof v063Toast==='function')v063Toast('Dieser Dungeon ist bereits abgeschlossen.','warn');
      return;
    }
    if(!dungeonAvailable(di)){
      if(typeof v063Toast==='function')v063Toast('Dieser Dungeon ist noch nicht betretbar.','warn');
      return;
    }
    if(!s.playerClass){
      if(typeof v063Toast==='function')v063Toast('Wähle zuerst deine Klasse.','warn');
      return;
    }

    /* Critical fix: wait for the player's decision. */
    const attemptAllowed = await consumeDungeonAttempt();
    if(!attemptAllowed)return;

    s.dungeon.view='battle';
    localStorage.setItem(KEY,JSON.stringify(s));

    battleBusy=true;
    btn.disabled=true;

    const loot=document.querySelector('#loot');
    if(loot)loot.innerHTML='';

    const bal=v025EnemyStats(di,idx,e);
    const pFactor=v060PlayerDamageFactor(bal.rec);
    const eFactor=v060EnemyDamageFactor(bal.rec);

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
        let html=`<div class="loot good">Sieg! +${e.xp} XP · +${e.gold} Gold</div>`;

        if(e.boss||Math.random()<.22){
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
            html+=`<div class="loot">${found.name}<br><span class="tiny">${itemBonus(found)}</span></div>`;
          }
        }

        if(e.boss){
          s.story.bossesDefeated=(s.story.bossesDefeated||0)+1;
          s.story.chapter=Math.min(4,1+Math.floor(s.story.bossesDefeated/2));

          if(Math.random()<.22){
            s.harzTaler++;
            html+='<div class="loot">Harz-Taler gefunden!</div>';
          }

          if(!s.dungeon.completed.includes(di))s.dungeon.completed.push(di);
          s.dungeon.room=9;
          s.dungeon.progress[di]=9;
          html+='<div class="loot good">Dungeon abgeschlossen! Der Eingang wurde versiegelt.</div>';
        }else{
          s.dungeon.room=idx+1;
          s.dungeon.progress[di]=idx+1;
        }

        html+='<button class="btn gold" id="v068ReturnMap" style="width:100%;margin-top:10px">Belohnung bestätigen · Zur Dungeon-Karte</button>';
        if(loot)loot.innerHTML=html;
        if(log)log.textContent=e.boss?'Boss besiegt. Bestätige deine Belohnung.':'Gegner besiegt. Bestätige deine Belohnung.';
      }else{
        if(loot)loot.innerHTML=
          '<div class="loot" style="color:#ff9895">Niederlage. Der Gegner war zu stark.</div>'+
          '<button class="btn secondary" id="v068ReturnMap" style="width:100%;margin-top:10px">Zurück zur Dungeon-Karte</button>';
        if(log)log.textContent=`Niederlage · Gegner empfohlen Lv. ${bal.rec}.`;
      }

      localStorage.setItem(KEY,JSON.stringify(s));

      const back=document.querySelector('#v068ReturnMap');
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
      if((s.playerClass==='grower'||s.playerClass==='frost')&&Math.random()<(.13+setBonusValue('wuchtChance')+skillValue('wucht')*.025)){
        pDmg=Math.floor(pDmg*1.55);
        special=' WUCHTSCHLAG!';
      }
      if(s.playerClass==='scout'&&Math.random()<(.15+setBonusValue('doubleChance')+skillValue('schnell')*.025)){
        pDmg=Math.floor(pDmg*(1.42+setBonusValue('doubleDamage')));
        special=' DOPPELTREFFER!';
      }
      if(s.playerClass==='bruiser'&&crit){
        pDmg=Math.floor(pDmg*(1+setBonusValue('critDamage')+skillValue('overload')*.055));
        special=' MAGIE-KRIT!';
      }
      if((s.playerClass==='grower'||s.playerClass==='frost')&&skillValue('raserei')){
        pDmg=Math.floor(pDmg*(1+skillValue('raserei')*.03));
      }

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
          let eDmg=0;

          if(Math.random()<evade){
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

          if(round>=45){
            return showResult(pHp/maxP > eHp/bal.hp);
          }

          setTimeout(step,330);
        },300);
      },280);
    };

    step();
  };
}

/* Phase 2 retired: v068 renderDungeon fight wrapper. The final canonical dungeon owner replaces this render layer. */

const v068BaseRender=render;
render=function(){
  v068BaseRender();
  

  if(document.querySelector('#dungeon')?.classList.contains('active')){
    try{renderDungeon();}catch(e){console.error('V4.02 dungeon render',e);}
  }
};

try{render();}catch(e){console.error('V4.02 init',e);}
