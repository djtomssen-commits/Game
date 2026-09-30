
(function(){
  'use strict';
  function install(){
    const shell=document.querySelector('#pvp .v204-pvp-shell');
    if(!shell)return;
    if(!shell.querySelector('.v549-pvp-title')){
      const t=document.createElement('div');
      t.className='v549-pvp-title';
      t.textContent='HALL OF HAZE · PVP';
      shell.insertBefore(t,shell.firstChild);
    }
    const kicker=shell.querySelector('.v204-kicker');
    if(kicker)kicker.textContent='⚔️ HALL OF HAZE · PVP';
  }
  install();
  document.addEventListener('DOMContentLoaded',install,{once:true});
  window.addEventListener('pageshow',()=>requestAnimationFrame(install),{passive:true});
  document.addEventListener('click',e=>{
    if(e.target?.closest?.('[data-page="pvp"],#pvp'))requestAnimationFrame(install);
  },true);
  [200,700,1600].forEach(ms=>setTimeout(install,ms));
})();
