(function(){
  const VERSION='V4.29 Stable';
  const SHORT='V4.29';
  const T=(key,fallback)=>window.GrowI18n?.t?.(key)||fallback||key;
  const locale=()=>({de:'de-DE',en:'en-GB',es:'es-ES',fr:'fr-FR',pl:'pl-PL',tr:'tr-TR'}[window.GrowI18n?.getLanguage?.()||'de']||'de-DE');
  const num=v=>Math.max(0,Math.round(Number(v)||0)).toLocaleString(locale());
  let navigationScreen='';
  function cap(){try{return typeof v271DampfCap==='function'?v271DampfCap():100}catch(e){return 100}}

  function gameIsVisible(){
    /* Tower owns several internal render states and can momentarily rebuild its
       active screen markup. Navigation remains the stronger visibility signal. */
    if(navigationScreen==='tower')return true;
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
          <button type="button" class="v372-menu" aria-label="${T('top.menu','Menü')}">☰</button>
          <div class="v372-logo"><strong>🌿 GROW</strong><span>LEGENDS</span><em>${SHORT}</em></div>
          <div class="v372-res"><span class="ico">🪙</span><div><small data-v372-label="gold">${T('top.gold','Gold')}</small><b id="v372Gold">0</b></div><button class="v372-plus" data-plus="gold">+</button></div>
          <div class="v372-res"><span class="ico">💎</span><div><small data-v372-label="harz">${T('top.harz','Harz')}</small><b id="v372Harz">0</b></div><button class="v372-plus" data-plus="harz">+</button></div>
          <div class="v372-res"><span class="ico">💨</span><div><small data-v372-label="dampf">${T('top.dampf','Dampf')}</small><b id="v372Dampf">0/100</b></div><button class="v372-plus" data-plus="dampf">+</button></div>
          <button type="button" class="v372-iconbtn" data-head="mail">✉️</button>
          <button type="button" class="v372-iconbtn" data-head="friends">👥</button>
          <button type="button" class="v372-iconbtn" data-head="settings">⚙️</button>
        </div>`;
      document.body.insertBefore(shell,document.body.firstChild);

      shell.querySelector('.v372-menu').onclick=e=>{
        e.preventDefault();e.stopPropagation();
        const toggle=()=>{
          const panel=document.querySelector('#v032MenuPanel'); if(!panel)return;
          try{window.v4148BuildCompleteMenu?.()}catch(_){}
          const open=!(panel.classList.contains('open')||panel.classList.contains('show'));
          panel.classList.toggle('open',open);
          panel.classList.toggle('show',open);
          panel.setAttribute('aria-hidden',open?'false':'true');
          if(open){
            panel.style.setProperty('display','block','important');
            panel.style.setProperty('visibility','visible','important');
            panel.style.setProperty('opacity','1','important');
            panel.style.setProperty('pointer-events','auto','important');
            panel.style.setProperty('z-index','120001','important');
          }else{
            panel.style.removeProperty('display');panel.style.removeProperty('visibility');
            panel.style.removeProperty('opacity');panel.style.removeProperty('pointer-events');
            panel.style.removeProperty('z-index');
          }
        };
        /* v032TopMenu has a document-level outside-click closer. The authoritative
           topbar sits outside that wrapper; in the Grow Cup defer opening until
           that legacy listener has completed the current click. */
        if(document.body.classList.contains('v8210-growcup-open'))requestAnimationFrame(toggle);
        else toggle();
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

  /* V8.338 Beta: the v372 body-level HUD is the only visible header.
     Historical renderers still sometimes force .app > header to display:block
     !important (15px of empty layout under this fixed HUD). Keep its hidden
     original DOM IDs for compatibility, but remove its layout footprint via
     the authoritative header owner rather than a new late CSS override. */
  function retireLegacyHeader(){
    const legacy=document.querySelector('.app > header');
    if(!legacy)return;
    if(legacy.style.getPropertyValue('display')==='none'&&
       legacy.style.getPropertyPriority('display')==='important')return;
    legacy.style.setProperty('display','none','important');
  }

  function paint(){
    const shell=build();
    retireLegacyHeader();
    shell.style.setProperty('display',gameIsVisible()?'block':'none','important');
    const g=shell.querySelector('#v372Gold'),h=shell.querySelector('#v372Harz'),d=shell.querySelector('#v372Dampf');
    if(g)g.textContent=num(s?.gold); if(h)h.textContent=num(s?.harzTaler); if(d)d.textContent=num(s?.energy)+'/'+num(cap());
    const labels={gold:['top.gold','Gold'],harz:['top.harz','Harz'],dampf:['top.dampf','Dampf']};
    shell.querySelectorAll('[data-v372-label]').forEach(el=>{const x=labels[el.dataset.v372Label];if(x)el.textContent=T(x[0],x[1])});
    const menu=shell.querySelector('.v372-menu');if(menu)menu.setAttribute('aria-label',T('top.menu','Menü'));
    shell.querySelectorAll('.v372-logo em').forEach(el=>el.textContent=SHORT);
    document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version,.v366-ver').forEach(el=>{
      if(el)el.textContent=el.classList?.contains('v366-ver')?SHORT:VERSION;
    });
  }

  paint();
  document.addEventListener('DOMContentLoaded',paint,{once:true});
  window.addEventListener('pageshow',paint,{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{navigationScreen='';paint()},{passive:true});
  window.addEventListener('growlegends:account-transition-reset',()=>{navigationScreen='';paint()},{passive:true});
  window.addEventListener('growlegends:language-changed',paint,{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    navigationScreen=String(e?.detail?.id||'');
    /* V8.337: this authoritative menu must close on screen navigation.
       A legacy navigation click could strip .open/.show but leave the
       inline display:block!important written by our own toggle(), keeping
       its wooden menu panel over the Events card as a ghost surface. */
    const panel=document.getElementById('v032MenuPanel');
    if(panel){
      panel.classList.remove('open','show');
      panel.setAttribute('aria-hidden','true');
      for(const prop of ['display','visibility','opacity','pointer-events','z-index']){
        panel.style.removeProperty(prop);
      }
    }
    paint();
    if(navigationScreen==='tower'){
      queueMicrotask(paint);
      try{requestAnimationFrame(paint)}catch(_){}
    }
  },{passive:true});
  window.v372PaintTopbar=paint;
})();
