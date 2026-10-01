(function(){
  const V358_VERSION='V4.29 Stable';

  function num(v){
    return Math.max(0,Math.round(Number(v)||0)).toLocaleString('de-DE');
  }
  function dampfCap(){
    try{return typeof v271DampfCap==='function'?v271DampfCap():100}catch(e){return 100}
  }
  function power(){
    try{return typeof combatPower==='function'?num(combatPower()):'0'}catch(e){return '0'}
  }

  function build(){
    const header=document.querySelector('.app > header');
    if(!header)return false;

    let root=header.querySelector('.v358-global-header');
    if(!root){
      root=document.createElement('div');
      root.className='v358-global-header';
      root.innerHTML=`
        <button type="button" class="v358-menu" aria-label="Menü">☰</button>
        <div class="v358-logo"><strong>🌿 GROW</strong><span>LEGENDS</span></div>
        <div class="v358-res gold"><small>Gold</small><b id="v358Gold">🪙 0</b></div>
        <div class="v358-res harz"><small>Harz</small><b id="v358Harz">💎 0</b></div>
        <div class="v358-res dampf"><small>Dampf</small><b id="v358Dampf">💨 0/100</b></div>
      `;
      header.appendChild(root);

      const sub=document.createElement('div');
      sub.className='v358-subbar';
      sub.innerHTML=`
        <span class="v358-version">V4.29 Stable</span>
        <span class="v358-power">Kampfkraft <b id="v358Power">0</b></span>
        <button type="button" class="v358-settings">⚙️ Einstellungen</button>
      `;
      header.appendChild(sub);

      root.querySelector('.v358-menu').onclick=(e)=>{
        e.preventDefault();e.stopPropagation();
        document.querySelector('#v032MenuPanel')?.classList.toggle('open');
      };

      sub.querySelector('.v358-settings').onclick=(e)=>{
        e.preventDefault();e.stopPropagation();
        const settingsBtn=document.querySelector('[data-settings],#settingsBtn,.settings-btn');
        if(settingsBtn && settingsBtn!==e.currentTarget){
          try{settingsBtn.click();return}catch(err){}
        }
        try{
          if(typeof v032Go==='function' && document.querySelector('#settings'))v032Go('settings');
        }catch(err){}
      };
    }

    update();
    return true;
  }

  function update(){
    const g=document.querySelector('#v358Gold');
    const h=document.querySelector('#v358Harz');
    const d=document.querySelector('#v358Dampf');
    const p=document.querySelector('#v358Power');
    if(g)g.textContent='🪙 '+num(s?.gold);
    if(h)h.textContent='💎 '+num(s?.harzTaler);
    if(d)d.textContent='💨 '+num(s?.energy)+'/'+num(dampfCap());
    if(p)p.textContent=power();

    document.querySelectorAll('.v358-version').forEach(el=>el.textContent=V358_VERSION);
  }

  /* V8.009: shared navigation owns header refresh; no v032Go wrapper. */
  window.addEventListener('growlegends:navigation-open-v7119',()=>{build();update()},{passive:true});

  function version(){
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version]'
    ).forEach(el=>{if(el)el.textContent=V358_VERSION});
  }

  build();
  version();
  document.addEventListener('DOMContentLoaded',()=>{build();version()},{once:true});
  window.addEventListener('pageshow',()=>{build();update();version()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{build();update();version()},{passive:true});
})();
