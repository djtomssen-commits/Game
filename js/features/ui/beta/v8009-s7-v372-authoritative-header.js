(function(){
  const VERSION='V4.29 Stable';
  const SHORT='V4.29';
  const num=v=>Math.max(0,Math.round(Number(v)||0)).toLocaleString('de-DE');
  function cap(){try{return typeof v271DampfCap==='function'?v271DampfCap():100}catch(e){return 100}}

  function gameIsVisible(){
    const world=document.querySelector('#world');
    if(world?.classList.contains('active'))return true;
    const active=document.querySelector('.screen.active');
    if(!active)return false;
    return !/login|auth|register/i.test(active.id||'');
  }

  function build(){
    let shell=document.querySelector('#v372TopbarShell');
    if(!shell){
      shell=document.createElement('div');
      shell.id='v372TopbarShell';
      shell.innerHTML=`
        <div class="v372-topbar">
          <button type="button" class="v372-menu" aria-label="Menü">☰</button>
          <div class="v372-logo"><strong>🌿 GROW</strong><span>LEGENDS</span><em>${SHORT}</em></div>
          <div class="v372-res"><span class="ico">🪙</span><div><small>Gold</small><b id="v372Gold">0</b></div><button class="v372-plus" data-plus="gold">+</button></div>
          <div class="v372-res"><span class="ico">💎</span><div><small>Harz</small><b id="v372Harz">0</b></div><button class="v372-plus" data-plus="harz">+</button></div>
          <div class="v372-res"><span class="ico">💨</span><div><small>Dampf</small><b id="v372Dampf">0/100</b></div><button class="v372-plus" data-plus="dampf">+</button></div>
          <button type="button" class="v372-iconbtn" data-head="mail">✉️</button>
          <button type="button" class="v372-iconbtn" data-head="friends">👥</button>
          <button type="button" class="v372-iconbtn" data-head="settings">⚙️</button>
        </div>`;
      document.body.insertBefore(shell,document.body.firstChild);

      shell.querySelector('.v372-menu').onclick=e=>{
        e.preventDefault();e.stopPropagation();
        const panel=document.querySelector('#v032MenuPanel'); if(!panel)return;
        const open=!panel.classList.contains('open');
        panel.classList.toggle('open',open);
        panel.classList.toggle('show',open);
        if(open){
          panel.style.setProperty('display','block','important');
          panel.style.setProperty('visibility','visible','important');
          panel.style.setProperty('opacity','1','important');
          panel.style.setProperty('pointer-events','auto','important');
        }else{
          panel.style.removeProperty('display');panel.style.removeProperty('visibility');
          panel.style.removeProperty('opacity');panel.style.removeProperty('pointer-events');
        }
      };
      shell.querySelector('[data-plus="gold"]').onclick=()=>{try{v032Go('shop')}catch(e){}};
      shell.querySelector('[data-plus="harz"]').onclick=()=>{try{v032Go('harzDealer')}catch(e){}};
      shell.querySelector('[data-plus="dampf"]').onclick=()=>{const b=document.querySelector('#v026RefillBtn');if(b)try{b.click()}catch(e){}};
      shell.querySelector('[data-head="friends"]').onclick=()=>{try{v032Go('friends')}catch(e){}};
      shell.querySelector('[data-head="mail"]').onclick=()=>{try{v032Go('mail')}catch(e){}};
      shell.querySelector('[data-head="settings"]').onclick=()=>{
        const b=document.querySelector('[data-settings],#settingsBtn,.settings-btn');if(b)try{b.click()}catch(e){}
      };
    }
    return shell;
  }

  function paint(){
    const shell=build();
    shell.style.setProperty('display',gameIsVisible()?'block':'none','important');
    const g=shell.querySelector('#v372Gold'),h=shell.querySelector('#v372Harz'),d=shell.querySelector('#v372Dampf');
    if(g)g.textContent=num(s?.gold); if(h)h.textContent=num(s?.harzTaler); if(d)d.textContent=num(s?.energy)+'/'+num(cap());
    shell.querySelectorAll('.v372-logo em').forEach(el=>el.textContent=SHORT);
    document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version,.v366-ver').forEach(el=>{
      if(el)el.textContent=el.classList?.contains('v366-ver')?SHORT:VERSION;
    });
  }

  paint();
  document.addEventListener('DOMContentLoaded',paint,{once:true});
  window.addEventListener('pageshow',paint,{passive:true});
  window.addEventListener('growlegends:account-ready',paint,{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',paint,{passive:true});
})();
