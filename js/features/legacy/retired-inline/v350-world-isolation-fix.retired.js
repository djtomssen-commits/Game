
(function(){
  const V350_VERSION='V4.29 Stable';

  function v350InstallCleanWorld(force){
    const world=document.querySelector('#world');
    if(!world)return false;

    /* Ask the final V4.02 installer for the real live dashboard first. */
    try{
      if(typeof v085InstallWorld==='function'){
        v085InstallWorld(!!force);
      }
    }catch(e){
      console.error('V4.02 world install',e);
    }

    const home=world.querySelector(':scope > .v349-home') || world.querySelector('.v349-home');
    if(!home)return false;

    /* If a legacy installer placed the new home inside one of its own wrappers,
       move the new home back to the actual #world root. */
    if(home.parentElement!==world){
      world.insertBefore(home,world.firstChild);
    }else if(world.firstElementChild!==home){
      world.insertBefore(home,world.firstChild);
    }

    world.classList.add('v350-isolated');

    /* Remove only obsolete world-dashboard presentation nodes.
       No game state, handlers or other screens are touched. */
    [...world.children].forEach(el=>{
      if(el===home)return;
      if(
        el.classList.contains('v085-dashboard') ||
        el.classList.contains('v118-worldboss-hero') ||
        el.id==='v118WorldBossHero' ||
        el.id==='v111WorldBossCard'
      ){
        el.remove();
      }
    });

    return true;
  }

  /* World navigation: clean after the full historical navigation chain has run. */
  const v350BaseGo=v032Go;
  v032Go=function(id){
    const result=v350BaseGo.apply(this,arguments);
    if(id==='world'){
      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>v350InstallCleanWorld(true));
      });
    }
    return result;
  };

  /* We do not replace render(). A one-shot post-render hook through the existing
     world installer is enough and avoids another global render regression. */
  const v350BaseInstall=v085InstallWorld;
  v085InstallWorld=function(force){
    const result=v350BaseInstall.apply(this,arguments);
    const world=document.querySelector('#world');
    const home=world?.querySelector('.v349-home');
    if(home){
      if(home.parentElement!==world)world.insertBefore(home,world.firstChild);
      world.classList.add('v350-isolated');
    }
    return result;
  };

  function version(){
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version]'
    ).forEach(el=>{
      if(el)el.textContent=V350_VERSION;
    });
  }

  v350InstallCleanWorld(true);
  version();
  document.addEventListener('DOMContentLoaded',()=>{
    v350InstallCleanWorld(true);
    version();
  },{once:true});
  setTimeout(()=>{v350InstallCleanWorld(true);version()},350);
  setTimeout(()=>{v350InstallCleanWorld(true);version()},1200);
})();
