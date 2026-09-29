/* === v6321-guildboss-combat-animation-script === */
(()=>{
  'use strict';
  if(window.__V6321_GUILD_BOSS_COMBAT_ANIM__)return;
  window.__V6321_GUILD_BOSS_COMBAT_ANIM__=true;
  function ensureFx(){
    const stage=document.querySelector('#v260DailyBossArena .v259-stage');
    if(!stage)return;
    const defs=[
      ['v6321GroundPulse',''],
      ['v6321HeroSlash',''],
      ['v6321BossClaw',''],
      ['v6321ImpactFlash','']
    ];
    for(const [id,txt] of defs){
      if(document.getElementById(id))continue;
      const el=document.createElement('span');el.id=id;el.setAttribute('aria-hidden','true');if(txt)el.textContent=txt;stage.appendChild(el);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureFx,{once:true});else ensureFx();
  setTimeout(ensureFx,500);
})();

