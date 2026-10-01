
(function(){
  const V362_VERSION='V4.29 Stable';

  function update(){
    const num=v=>Math.max(0,Math.round(Number(v)||0)).toLocaleString('de-DE');
    let cap=100;
    try{if(typeof v271DampfCap==='function')cap=v271DampfCap()}catch(e){}

    const gold=document.querySelector('#v358Gold');
    const harz=document.querySelector('#v358Harz');
    const dampf=document.querySelector('#v358Dampf');

    if(gold)gold.textContent='🪙 '+num(s?.gold);
    if(harz)harz.textContent='💎 '+num(s?.harzTaler);
    if(dampf)dampf.textContent='💨 '+num(s?.energy)+'/'+num(cap);
  }

  /* Shared navigation owns passive header refreshes. */
  update();
  document.addEventListener('DOMContentLoaded',update,{once:true});
  window.addEventListener('pageshow',update,{passive:true});
  window.addEventListener('growlegends:account-ready',update,{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',update,{passive:true});
})();
