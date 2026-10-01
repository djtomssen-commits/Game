(function(){
  const V359_VERSION='V4.29 Stable';

  function hideLegacyHeaderPieces(){
    const header=document.querySelector('.app > header');
    if(!header)return;

    /* Inline !important beats the old highly-specific !important rules that
       caused the giant Gold/Dampf/Harz cards to remain visible in V4.02. */
    header.querySelectorAll(':scope > .brand,:scope > .stats.resource-stats').forEach(el=>{
      el.style.setProperty('display','none','important');
      el.style.setProperty('visibility','hidden','important');
      el.style.setProperty('height','0','important');
      el.style.setProperty('min-height','0','important');
      el.style.setProperty('max-height','0','important');
      el.style.setProperty('margin','0','important');
      el.style.setProperty('padding','0','important');
      el.style.setProperty('overflow','hidden','important');
    });
  }

  function moveRealMenuButton(){
    const root=document.querySelector('.app > header > .v358-global-header');
    if(!root)return;

    const fake=root.querySelector(':scope > .v358-menu');
    if(fake)fake.remove();

    const real=document.querySelector('#v032MenuBtn');
    if(real && real.parentElement!==root){
      root.insertBefore(real,root.firstChild);
    }

    if(real){
      /* Remove positioning left over from the old fixed menu CSS. */
      real.style.setProperty('display','flex','important');
      real.style.setProperty('position','static','important');
      real.style.removeProperty('top');
      real.style.removeProperty('left');
      real.style.removeProperty('right');
      real.style.removeProperty('bottom');
    }
  }

  function updateCompactValues(){
    const g=document.querySelector('#v358Gold');
    const h=document.querySelector('#v358Harz');
    const d=document.querySelector('#v358Dampf');
    const p=document.querySelector('#v358Power');

    const num=v=>Math.max(0,Math.round(Number(v)||0)).toLocaleString('de-DE');
    let cap=100;
    try{if(typeof v271DampfCap==='function')cap=v271DampfCap()}catch(e){}
    let cp=0;
    try{if(typeof combatPower==='function')cp=combatPower()}catch(e){}

    if(g)g.textContent='🪙 '+num(s?.gold);
    if(h)h.textContent='💎 '+num(s?.harzTaler);
    if(d)d.textContent='💨 '+num(s?.energy)+'/'+num(cap);
    if(p)p.textContent=num(cp);
  }

  function fix(){
    /* V8.009: duplicate header producer retired.
       v358 is the only compact-header builder; v359 only fixes legacy pieces/layout. */

    hideLegacyHeaderPieces();
    moveRealMenuButton();
    updateCompactValues();

    document.querySelectorAll('#world .v351-topbar').forEach(el=>el.remove());
  }

  /* V8.009: shared navigation owns header fix; no v032Go wrapper. */
  window.addEventListener('growlegends:navigation-open-v7119',fix,{passive:true});

  function version(){
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
    ).forEach(el=>{if(el)el.textContent=V359_VERSION});
  }

  fix();version();
  document.addEventListener('DOMContentLoaded',()=>{fix();version()},{once:true});
  window.addEventListener('pageshow',()=>{fix();version()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{fix();version()},{passive:true});
})();
