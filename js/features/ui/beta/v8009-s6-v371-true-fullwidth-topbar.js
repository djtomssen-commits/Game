(function(){
  const V371_VERSION='V4.29 Stable';

  const num=v=>Math.max(0,Math.round(Number(v)||0)).toLocaleString('de-DE');
  function cap(){try{return typeof v271DampfCap==='function'?v271DampfCap():100}catch(e){return 100}}

  function isGameVisible(){
    const active=document.querySelector('.screen.active');
    return !!active && active.id!=='login' && active.id!=='auth' && active.id!=='register';
  }

  function ensureShell(){
    let shell=document.querySelector('#v371TopbarShell');
    if(!shell){
      shell=document.createElement('div');
      shell.id='v371TopbarShell';
      shell.innerHTML=`
        <div class="v371-topbar">
          <button type="button" class="v371-menu" aria-label="Menü">☰</button>
          <div class="v371-logo"><strong>🌿 GROW</strong><span>LEGENDS</span><em>V4.21</em></div>

          <div class="v371-res gold">
            <span class="ico">🪙</span>
            <div><small>Gold</small><b id="v371Gold">0</b></div>
            <button type="button" class="v371-plus" data-v371-plus="gold">+</button>
          </div>

          <div class="v371-res harz">
            <span class="ico">💎</span>
            <div><small>Harz</small><b id="v371Harz">0</b></div>
            <button type="button" class="v371-plus" data-v371-plus="harz">+</button>
          </div>

          <div class="v371-res dampf">
            <span class="ico">💨</span>
            <div><small>Dampf</small><b id="v371Dampf">0/100</b></div>
            <button type="button" class="v371-plus" data-v371-plus="dampf">+</button>
          </div>

          <button type="button" class="v371-iconbtn" data-v371-head="mail" aria-label="Nachrichten">✉️</button>
          <button type="button" class="v371-iconbtn" data-v371-head="friends" aria-label="Freunde">👥</button>
          <button type="button" class="v371-iconbtn" data-v371-head="settings" aria-label="Einstellungen">⚙️</button>
        </div>`;
      document.body.insertBefore(shell,document.body.firstChild);

      const menu=shell.querySelector('.v371-menu');
      menu.onclick=e=>{
        e.preventDefault();e.stopPropagation();
        const panel=document.querySelector('#v032MenuPanel');
        if(!panel)return;
        const willOpen=!panel.classList.contains('open');
        panel.classList.toggle('open',willOpen);
        panel.classList.toggle('show',willOpen);
        if(willOpen){
          panel.style.setProperty('display','block','important');
          panel.style.setProperty('visibility','visible','important');
          panel.style.setProperty('opacity','1','important');
          panel.style.setProperty('pointer-events','auto','important');
        }else{
          panel.style.removeProperty('display');
          panel.style.removeProperty('visibility');
          panel.style.removeProperty('opacity');
          panel.style.removeProperty('pointer-events');
        }
      };

      shell.querySelector('[data-v371-plus="gold"]').onclick=()=>{try{v032Go('shop')}catch(e){}};
      shell.querySelector('[data-v371-plus="harz"]').onclick=()=>{try{v032Go('harzDealer')}catch(e){}};
      shell.querySelector('[data-v371-plus="dampf"]').onclick=()=>{
        const b=document.querySelector('#v026RefillBtn');
        if(b)try{b.click()}catch(e){}
      };
      shell.querySelector('[data-v371-head="friends"]').onclick=()=>{try{v032Go('friends')}catch(e){}};
      shell.querySelector('[data-v371-head="mail"]').onclick=()=>{try{v032Go('mail')}catch(e){}};
      shell.querySelector('[data-v371-head="settings"]').onclick=()=>{
        const b=document.querySelector('[data-settings],#settingsBtn,.settings-btn');
        if(b)try{b.click()}catch(e){}
      };
    }
    return shell;
  }

  function paint(){
    const shell=ensureShell();
    const visible=isGameVisible();
    document.body.classList.toggle('v371-game-ui',visible);
    shell.style.display=visible?'block':'none';

    const g=shell.querySelector('#v371Gold');
    const h=shell.querySelector('#v371Harz');
    const d=shell.querySelector('#v371Dampf');
    if(g)g.textContent=num(s?.gold);
    if(h)h.textContent=num(s?.harzTaler);
    if(d)d.textContent=num(s?.energy)+'/'+num(cap());

    shell.querySelectorAll('.v371-logo em').forEach(el=>el.textContent='V4.11');
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
    ).forEach(el=>{if(el)el.textContent=V371_VERSION});
  }

  paint();
  document.addEventListener('DOMContentLoaded',paint,{once:true});
  window.addEventListener('pageshow',paint,{passive:true});
  window.addEventListener('growlegends:account-ready',paint,{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',paint,{passive:true});
})();
