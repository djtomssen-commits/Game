/* === v6305-guildboss-layout-script === */
(()=>{
  'use strict';
  if(window.__V6305_GUILDBOSS_LAYOUT__)return;
  window.__V6305_GUILDBOSS_LAYOUT__=true;
  function boot(){
    const arena=document.getElementById('v260DailyBossArena');if(!arena)return;
    const fighter=arena.querySelector('.v259-fighter-side'),boss=arena.querySelector('.v259-boss-side'),hpbar=arena.querySelector('.v259-boss-hp');
    
    
    if(hpbar&&!document.getElementById('v260BattleTop')){const top=document.createElement('div');top.id='v260BattleTop';top.innerHTML='<div id="v260BattleState" data-state="idle">Gildenboss bereit</div><div id="v260BattlePhase">Warte auf Wiedergabe</div>';hpbar.insertAdjacentElement('afterend',top)}
    const fightText=document.getElementById('v260FightText');
    if(fightText&&!document.getElementById('v260BattleLog')){const log=document.createElement('div');log.id='v260BattleLog';fightText.insertAdjacentElement('afterend',log)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  setTimeout(boot,650);
})();

