(function(){
  'use strict';
  function polish(){
    if(!document.getElementById('character')?.classList.contains('active'))return false;
    const c=document.getElementById('character');
    if(!c)return;
    /* Old location label is created by an early renderer; hide it every time without removing game logic. */
    c.querySelectorAll(':scope > .v038-location,:scope > .v052-scene-banner,:scope > .v052-character,:scope > .v459-page-kicker').forEach(el=>el.style.setProperty('display','none','important'));
    const stats=c.querySelectorAll('#v510HeroRoot .v510-stats .combat-box');
    stats.forEach((box,i)=>{
      box.classList.toggle('hp',i===0);box.classList.toggle('power',i===1);
      const label=box.querySelector('span');
      if(label)label.textContent=i===0?'Lebenspunkte':'Kampfkraft';
    });
  }
  window.v515PolishHero=polish;
  polish();
  document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(polish),{once:true});
  window.addEventListener('pageshow',()=>requestAnimationFrame(polish),{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestAnimationFrame(polish)});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')requestAnimationFrame(polish)},{passive:true});
  window.__v515RenderWrapped='retired';
})();
