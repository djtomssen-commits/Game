(()=>{
  'use strict';
  const root=document.documentElement;
  const body=document.body;
  let raf=0,hudObserver=null,menuObserver=null,observedHud=null,observedPanel=null;

  function measure(){
    raf=0;
    const hud=document.getElementById('v372TopbarShell');
    if(!hud||!body)return;
    const r=hud.getBoundingClientRect();
    /* Sticky HUD is at viewport top while visible. Its bottom is the only safe
       anchor for fixed dropdowns/modals on every Android status-bar size. */
    const bottom=Math.max(0,Math.round(r.bottom));
    if(bottom>0){
      root.style.setProperty('--v654-hud-bottom',bottom+'px');
      body.classList.add('v654-hud-measured');
    }
  }
  function queue(){
    if(raf)return;
    raf=requestAnimationFrame(measure);
  }

  function normalizeMenu(){
    const panel=document.getElementById('v032MenuPanel');
    if(!panel)return;
    /* Re-opening an already scrolled drawer could make its first entry look as
       if it were hidden by the HUD. Always open at the top. */
    if(panel.classList.contains('open')||panel.classList.contains('show')){
      panel.scrollTop=0;
    }
    queue();
  }

  queue();
  document.addEventListener('DOMContentLoaded',queue,{once:true});
  window.addEventListener('resize',queue,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(queue,80),{passive:true});
  window.addEventListener('pageshow',queue,{passive:true});

  const boot=()=>{
    const hud=document.getElementById('v372TopbarShell');
    if(hud&&typeof ResizeObserver==='function'&&hud!==observedHud){
      try{hudObserver?.disconnect?.()}catch(_){}
      observedHud=hud;hudObserver=new ResizeObserver(queue);hudObserver.observe(hud);
    }
    const panel=document.getElementById('v032MenuPanel');
    if(panel&&panel!==observedPanel){
      try{menuObserver?.disconnect?.()}catch(_){}
      observedPanel=panel;menuObserver=new MutationObserver(normalizeMenu);
      menuObserver.observe(panel,{attributes:true,attributeFilter:['class']});
    }
    queue();
  };
  window.addEventListener('growlegends:account-ready',boot,{passive:true});

  document.addEventListener('click',e=>{
    if(e.target.closest?.('.v372-menu,#v032MenuBtn')) setTimeout(normalizeMenu,0);
  },true);
})();
