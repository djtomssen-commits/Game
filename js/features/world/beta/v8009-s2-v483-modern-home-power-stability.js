(function(){
  const VERSION='V4.86',SHORT='V4.86',boot=Date.now();
  let released=false;
  function stamp(){}
  function durableUser(){try{return typeof v073User!=='undefined'&&v073User&&!v073User.is_anonymous&&v073User.id}catch(e){return false}}
  function verified(){
    try{if(typeof v452AccountVerified==='function'&&v452AccountVerified())return true}catch(e){}
    try{if(!durableUser()&&window.__V200_AUTH_READY__===true)return true}catch(e){}
    return false;
  }
  function cleanWorld(){
    try{
      const world=document.querySelector('#world');if(!world)return;
      const modern=world.querySelector(':scope > .v366-world')||world.querySelector('.v366-world');
      if(modern&&modern.parentElement!==world)world.insertBefore(modern,world.firstChild);
      world.querySelectorAll(':scope > .v349-home,:scope > .v085-dashboard').forEach(el=>el.remove());
    }catch(e){}
  }
  function release(force=false){
    if(released)return true;
    stamp();cleanWorld();
    if(!verified()){
      /* Never expose a durable signed-in account's pre-hydration power merely
         because a timeout elapsed. Stable placeholder is better than a false jump. */
      if(!force||durableUser())return false;
    }
    released=true;
    window.__V483_POWER_READY__=true;
    document.documentElement.classList.add('v483-power-ready');
    try{if(typeof v085InstallWorld==='function'&&document.querySelector('#world')?.classList.contains('active'))v085InstallWorld(false)}catch(e){}
    try{if(typeof v446PaintCombatPower==='function')v446PaintCombatPower()}catch(e){}
    try{if(typeof v448PaintPower==='function')v448PaintPower()}catch(e){}
    return true;
  }
  window.v483ReleaseStartupPower=release;
  /* Account/cloud hydration normally ends in a render. Hook only until released;
     afterwards this adds one cheap boolean check and no DOM work. */
  try{
    if(typeof render==='function'&&!window.__v483RenderReleaseWrapped){
      const baseRender=render;
      render=function(){const r=baseRender.apply(this,arguments);release(false);return r};
      try{window.render=render}catch(e){}
      window.__v483RenderReleaseWrapped=true;
    }
  }catch(e){}
  stamp();cleanWorld();release(false);
  document.addEventListener('DOMContentLoaded',()=>{stamp();cleanWorld();release(false)},{once:true});
  window.addEventListener('pageshow',()=>{stamp();cleanWorld();release(false)},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){cleanWorld();release(false)}});
  [120,300,650,1100,1800,2800,4200,6500].forEach(ms=>setTimeout(()=>release(false),ms));
  /* Guest/offline fallback only. A durable signed-in account stays on the stable
     placeholder until V4.52 confirms that its own cloud state is fully resolved. */
  setTimeout(()=>release(!durableUser()),9000);
})();
