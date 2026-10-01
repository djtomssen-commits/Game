
(function(){
  function reorder(){
    const center=document.querySelector('#v510HeroRoot .v510-center');
    if(!center)return;
    const portrait=center.querySelector('.v510-portrait');
    const name=document.getElementById('avatarTitle');
    const sub=document.getElementById('avatarSubtitle');
    const level=center.querySelector('.level-shield');
    const xp=center.querySelector('.center-xp');
    /* V6.115: don't move the Illegal Book. V5.14 owns Book + Pet. */
    [portrait,name,sub,level,xp].forEach(n=>{if(n)center.appendChild(n)});
  }
  reorder();
  document.addEventListener('DOMContentLoaded',reorder,{once:true});
  window.addEventListener('pageshow',()=>{if(document.getElementById('character')?.classList.contains('active'))reorder()},{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')reorder()},{passive:true});
})();
