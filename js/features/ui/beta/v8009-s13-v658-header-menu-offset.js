(()=>{
  'use strict';
  let resetRaf=0,lastOpen=false,observedPanel=null,menuObserver=null;

  function measureHud(){
    const hud=document.getElementById('v372TopbarShell');
    if(!hud)return;
    const bottom=Math.max(0,Math.round(hud.getBoundingClientRect().bottom));
    if(bottom>0){
      document.documentElement.style.setProperty('--v654-hud-bottom',bottom+'px');
      document.body?.classList.add('v654-hud-measured');
    }
  }

  function resetMenuTop(){
    const panel=document.getElementById('v032MenuPanel');
    if(!panel)return;
    if(!(panel.classList.contains('open')||panel.classList.contains('show')))return;
    panel.scrollTop=0;
    try{panel.scrollTo({top:0,left:0,behavior:'instant'})}catch(e){try{panel.scrollTo(0,0)}catch(_){} }
    measureHud();
  }

  function queueReset(){
    if(resetRaf)return;
    resetRaf=requestAnimationFrame(()=>{
      resetRaf=0;
      const panel=document.getElementById('v032MenuPanel');
      if(!panel)return;
      const open=panel.classList.contains('open')||panel.classList.contains('show');
      if(open&&!lastOpen)resetMenuTop();
      else measureHud();
      lastOpen=open;
    });
  }

  function bind(){
    const panel=document.getElementById('v032MenuPanel');
    if(panel&&panel!==observedPanel){
      try{menuObserver?.disconnect?.()}catch(_){}
      observedPanel=panel;
      lastOpen=panel.classList.contains('open')||panel.classList.contains('show');
      menuObserver=new MutationObserver(queueReset);
      menuObserver.observe(panel,{attributes:true,attributeFilter:['class']});
    }
    measureHud();
  }

  /* Reset directly from the actual authoritative hamburger as well as historical
     fallback menu buttons. Capture phase makes this run before the drawer paints. */
  document.addEventListener('click',e=>{
    if(e.target.closest?.('#v372TopbarShell .v372-menu,#v032MenuBtn,.v366-menu')){
      const panel=document.getElementById('v032MenuPanel');
      if(panel&&!panel.classList.contains('open')&&!panel.classList.contains('show'))panel.scrollTop=0;
      requestAnimationFrame(queueReset);
    }
  },true);

  window.addEventListener('resize',()=>setTimeout(measureHud,0),{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(measureHud,80),{passive:true});
  document.addEventListener('DOMContentLoaded',()=>{bind();queueReset()},{once:true});
  window.addEventListener('pageshow',()=>{bind();queueReset()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{bind();queueReset()},{passive:true});
})();
