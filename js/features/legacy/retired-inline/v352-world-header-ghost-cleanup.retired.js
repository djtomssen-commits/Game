
(function(){
  const V352_VERSION='V4.29 Stable';

  function v352CleanWorld(){
    const world=document.querySelector('#world');
    const home=world?.querySelector(':scope > .v349-home');
    if(!world||!home)return false;

    world.classList.add('v350-isolated');

    [...world.children].forEach(el=>{
      if(el===home)return;
      if(
        el.classList.contains('v052-scene-banner') ||
        el.classList.contains('v085-dashboard') ||
        el.classList.contains('v118-worldboss-hero') ||
        el.id==='v118WorldBossHero' ||
        el.id==='v111WorldBossCard'
      ) el.remove();
    });

    return true;
  }

  function v352Version(){/* V7.113: obsolete version painter retired. */}

  const baseInstall=v085InstallWorld;
  v085InstallWorld=function(force){
    const r=baseInstall.apply(this,arguments);
    v352CleanWorld();
    return r;
  };

  v352CleanWorld();
  v352Version();
  document.addEventListener('DOMContentLoaded',()=>{v352CleanWorld();v352Version()},{once:true});
  window.addEventListener('pageshow',()=>{v352CleanWorld();v352Version()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{v352CleanWorld();v352Version()},{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='world'){v352CleanWorld();v352Version()}},{passive:true});
})();
