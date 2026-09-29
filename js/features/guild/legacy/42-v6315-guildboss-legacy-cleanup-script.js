/* === v6315-guildboss-legacy-cleanup-script === */
(()=>{
  'use strict';
  if(window.__V6315_GUILD_BOSS_LEGACY_CLEANUP__)return;
  window.__V6315_GUILD_BOSS_LEGACY_CLEANUP__=true;
  const trash=['v6308HeroHud','v6308BossHud','v6308ArenaPrompt','v260HeroImpact','v260BossImpact'];
  function clean(){
    trash.forEach(id=>document.getElementById(id)?.remove());
    document.querySelectorAll('#v260DailyBossArena .v6305-kicker').forEach(n=>n.remove());
    const vs=document.querySelector('#v260DailyBossArena .v259-vs');
    if(vs)vs.setAttribute('aria-hidden','true');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean,{once:true});else clean();
  setTimeout(clean,300);setTimeout(clean,1200);setTimeout(clean,2600);
})();

