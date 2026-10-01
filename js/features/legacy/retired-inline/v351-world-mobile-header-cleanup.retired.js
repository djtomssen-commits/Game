
(function(){
  const V351_VERSION='V4.29 Stable';

  function v351TopbarHtml(){
    const gold=Math.max(0,Math.round(Number(s?.gold)||0)).toLocaleString('de-DE');
    const harz=Math.max(0,Math.round(Number(s?.harzTaler)||0)).toLocaleString('de-DE');
    let max=100;
    try{if(typeof v271DampfCap==='function')max=v271DampfCap()}catch(e){}
    const dampf=Math.max(0,Math.round(Number(s?.energy)||0));
    return `
      <div class="v351-topbar">
        <button type="button" class="v351-menu" aria-label="Menü">☰</button>
        <div class="v351-logo"><strong>🌿 GROW</strong><span>LEGENDS</span></div>
        <div class="v351-res"><small>Gold</small><b>🪙 ${gold}</b></div>
        <div class="v351-res harz"><small>Harz</small><b>💎 ${harz}</b></div>
        <div class="v351-res dampf"><small>Dampf</small><b>💨 ${dampf}/${max}</b></div>
      </div>`;
  }

  function v351Install(){
    const world=document.querySelector('#world');
    const home=world?.querySelector(':scope > .v349-home');
    if(!world||!home)return false;

    let top=home.querySelector(':scope > .v351-topbar');
    const fresh=document.createElement('div');
    fresh.innerHTML=v351TopbarHtml();
    const next=fresh.firstElementChild;

    if(!top){
      home.insertBefore(next,home.firstChild);
      top=next;
    }else{
      /* Only replace when a resource value actually changed. */
      const oldSig=top.textContent.replace(/\s+/g,' ').trim();
      const newSig=next.textContent.replace(/\s+/g,' ').trim();
      if(oldSig!==newSig){
        top.replaceWith(next);
        top=next;
      }
    }

    const btn=top.querySelector('.v351-menu');
    if(btn && !btn.dataset.bound){
      btn.dataset.bound='1';
      btn.onclick=(e)=>{
        e.preventDefault();e.stopPropagation();
        document.querySelector('#v032MenuPanel')?.classList.toggle('open');
      };
    }

    world.classList.add('v350-isolated');
    return true;
  }

  const baseInstall=v085InstallWorld;
  v085InstallWorld=function(force){
    const r=baseInstall.apply(this,arguments);
    v351Install();
    return r;
  };

  function version(){
    document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version]').forEach(el=>{
      if(el)el.textContent=V351_VERSION;
    });
  }

  v351Install();version();
  document.addEventListener('DOMContentLoaded',()=>{v351Install();version()},{once:true});
  window.addEventListener('pageshow',()=>{v351Install();version()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{v351Install();version()},{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='world')v351Install()},{passive:true});
})();
