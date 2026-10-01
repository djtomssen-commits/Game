
(function(){
  const VERSION='V4.77',SHORT='V4.77';
  function stamp(){}
  function exposeModernHome(){
    try{
      const world=document.querySelector('#world');if(!world)return;
      const modern=world.querySelector(':scope > .v366-world')||world.querySelector('.v366-world');
      if(modern){
        if(modern.parentElement!==world)world.insertBefore(modern,world.firstChild);
        modern.style.setProperty('display','grid','important');
        modern.style.setProperty('visibility','visible','important');
        modern.style.setProperty('opacity','1','important');
        world.classList.add('v474-home-ready');
      }
    }catch(e){}
  }
  stamp();exposeModernHome();
  document.addEventListener('DOMContentLoaded',()=>{stamp();exposeModernHome()},{once:true});
  window.addEventListener('pageshow',()=>{stamp();exposeModernHome()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{stamp();exposeModernHome()},{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='world'){stamp();exposeModernHome()}},{passive:true});
})();
