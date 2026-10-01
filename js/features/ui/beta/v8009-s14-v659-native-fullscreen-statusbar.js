(()=>{
  'use strict';
  function fullscreenBuild(){
    try{
      const u=new URL(location.href);
      if(u.searchParams.get('gl_fullscreen')==='1')return true;
    }catch(e){}
    try{
      const C=window.Capacitor;
      if(!C)return false;
      if(typeof C.isNativePlatform==='function')return !!C.isNativePlatform();
      if(typeof C.getPlatform==='function')return C.getPlatform()!=='web';
      return !!C.platform && C.platform!=='web';
    }catch(e){return false}
  }
  function measureHud(){
    requestAnimationFrame(()=>{
      const hud=document.getElementById('v372TopbarShell');
      if(!hud)return;
      const bottom=Math.max(0,Math.round(hud.getBoundingClientRect().bottom));
      if(bottom>0){
        document.documentElement.style.setProperty('--v654-hud-bottom',bottom+'px');
        document.body?.classList.add('v654-hud-measured');
      }
      const panel=document.getElementById('v032MenuPanel');
      if(panel&&(panel.classList.contains('open')||panel.classList.contains('show')))panel.scrollTop=0;
    });
  }
  function apply(){
    if(!fullscreenBuild())return;
    document.body?.classList.add('v659-native-fullscreen');
    document.documentElement.style.setProperty('--v650-safe-top','0px');
    measureHud();
  }
  apply();
  document.addEventListener('DOMContentLoaded',apply,{once:true});
  window.addEventListener('pageshow',apply,{passive:true});
  window.addEventListener('resize',measureHud,{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{apply();measureHud()},{passive:true});
})();
