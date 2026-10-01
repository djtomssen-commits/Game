(function(){
  const V347_VERSION='V4.29 Stable';

  function v347EnsureLayout(){
    const overlay=document.querySelector('#v075AuthOverlay');
    const stack=overlay?.querySelector('.v200-login-stack');
    const card=overlay?.querySelector('.v075-auth-card');
    if(!overlay||!stack||!card)return false;

    if(!overlay.querySelector('.v347-top-art')){
      const art=document.createElement('div'); art.className='v347-top-art'; overlay.prepend(art);
    }
    if(!overlay.querySelector('.v347-side-art.left')){
      const l=document.createElement('div'); l.className='v347-side-art left'; overlay.appendChild(l);
    }
    if(!overlay.querySelector('.v347-side-art.right')){
      const r=document.createElement('div'); r.className='v347-side-art right'; overlay.appendChild(r);
    }
    if(!overlay.querySelector('.v347-topbar')){
      const bar=document.createElement('div');
      bar.className='v347-topbar';
      bar.innerHTML='<div class="v347-lang">🌐 <span>DE</span>⌄</div><div class="v347-version">V4.02 STABLE</div>';
      overlay.appendChild(bar);
    }

    const title=card.querySelector('.v075-auth-title');
    if(title) title.textContent='Wähle deinen Server';

    /* Helpful login row matching the reference. Visual only; password reset is not
       advertised as functional because no reset handler exists in the current game. */
    if(!card.querySelector('.v347-login-tools')){
      const tools=document.createElement('div');
      tools.className='v347-login-tools';
      tools.innerHTML='<span class="v347-remember"><i class="v347-check"></i> Angemeldet bleiben</span><span class="v347-forgot">Passwort vergessen?</span>';
      const action=card.querySelector('#v075EmailAction');
      action?.insertAdjacentElement('beforebegin',tools);
    }

    if(!card.querySelector('.v347-register-banner')){
      const banner=document.createElement('div');
      banner.className='v347-register-banner';
      banner.innerHTML='<div class="v347-register-copy"><div class="v347-chest">🧰</div><div><b>Neu hier?</b><span>Erstelle einen neuen Account und werde zur Legende!</span></div></div><button type="button" class="v347-register-btn">👤+ Registrieren</button>';
      const google=card.querySelector('#v075GoogleAction');
      google?.insertAdjacentElement('afterend',banner);
      banner.querySelector('.v347-register-btn')?.addEventListener('click',()=>{
        document.querySelector('#v075RegisterTab')?.click();
      });
    }

    if(!stack.querySelector('.v347-features')){
      const features=document.createElement('div');
      features.className='v347-features';
      features.innerHTML=`
        <div class="v347-feature"><i>🌿</i><div><b>Grow.</b><span>Baue die stärksten Pflanzen an.</span></div></div>
        <div class="v347-feature"><i>⚔️</i><div><b>Fight.</b><span>Bezwinge Monster in epischen Dungeons.</span></div></div>
        <div class="v347-feature"><i>🏅</i><div><b>Become.</b><span>Werde zur Legende in der Ehrenhalle.</span></div></div>
        <div class="v347-feature"><i>💎</i><div><b>Legend.</b><span>Schreibe deine eigene Geschichte.</span></div></div>`;
      stack.appendChild(features);
    }

    if(!stack.querySelector('.v347-footer')){
      const footer=document.createElement('div');
      footer.className='v347-footer';
      footer.innerHTML='© 2026 Grow Legends &nbsp;|&nbsp; Alle Rechte vorbehalten<br><span class="links">Datenschutz &nbsp; | &nbsp; Impressum &nbsp; | &nbsp; Support</span>';
      stack.appendChild(footer);
    }

    return true;
  }

  const baseBuild=typeof v200BuildLogin==='function'?v200BuildLogin:null;
  if(baseBuild){
    v200BuildLogin=function(){
      const r=baseBuild.apply(this,arguments);
      v347EnsureLayout();
      return r;
    };
  }

  /* No observer and no recurring interval: one-shot setup only, to avoid another
     login loading regression. */
  v347EnsureLayout();
  document.addEventListener('DOMContentLoaded',v347EnsureLayout,{once:true});
  setTimeout(v347EnsureLayout,250);
  setTimeout(v347EnsureLayout,900);
  setTimeout(v347EnsureLayout,1800);

  function version(){
    document.querySelectorAll('.version').forEach(el=>el.textContent=V347_VERSION);
    const v=document.querySelector('#v075AuthOverlay .v347-version');
    if(v)v.textContent='V4.02 STABLE';
  }
  version();
  setTimeout(version,350);
  setTimeout(version,1200);
})();
