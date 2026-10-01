
(function(){
  const V361_VERSION='V4.29 Stable';

  function updateValues(){
    const num=v=>Math.max(0,Math.round(Number(v)||0)).toLocaleString('de-DE');
    let cap=100;
    try{if(typeof v271DampfCap==='function')cap=v271DampfCap()}catch(e){}

    const gold=document.querySelector('#v358Gold');
    const harz=document.querySelector('#v358Harz');
    const dampf=document.querySelector('#v358Dampf');

    if(gold)gold.textContent='🪙 '+num(s?.gold);
    if(harz)harz.textContent='💎 '+num(s?.harzTaler);
    if(dampf)dampf.textContent='💨 '+num(s?.energy)+' / '+num(cap);
  }

  function version(){
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
    ).forEach(el=>{if(el)el.textContent=V361_VERSION});
  }

  updateValues();
  version();
  document.addEventListener('DOMContentLoaded',()=>{updateValues();version()},{once:true});
  window.addEventListener('pageshow',()=>{updateValues();version()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{updateValues();version()},{passive:true});
})();
