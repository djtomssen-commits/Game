
(function(){
  'use strict';
  if(window.__V600_CLEAN_TEMPLATE_STAGE__)return;
  window.__V600_CLEAN_TEMPLATE_STAGE__=true;

  function sync(){
    const card=document.getElementById('dungeonBattleCard');
    const stage=document.getElementById('battleStage');
    if(!card||!stage)return;
    card.classList.add('v575-combat','v599-clean');
    /* Phase 2G cleanup: V6.00 no longer owns either fighter artwork. */
    stage.querySelectorAll(':scope > .v600-bg').forEach(n=>n.remove());
    const pf=document.getElementById('playerFighter');
    if(pf)pf.classList.remove('v600-barbar');
    pf?.querySelectorAll('.v600-barbar-art').forEach(n=>n.remove());
    const title=stage.querySelector('.v575-stage-title');
    if(title&&title.textContent!=='DUNGEON DUELL')title.textContent='DUNGEON DUELL';
  }

  document.addEventListener('click',e=>{if(e.target?.closest?.('#dungeon,#dungeonBattleCard,#fightBtn'))setTimeout(sync,0)},true);
  window.addEventListener('pageshow',sync,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()},{passive:true});
  setTimeout(sync,0);
})();
