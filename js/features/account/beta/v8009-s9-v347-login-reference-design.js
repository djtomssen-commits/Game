(function(){
  const V347_VERSION='V4.29 Stable';

  function v347PaintLoginLanguage(){
    const T=(key,fallback)=>window.GrowI18n?.t?.(key)||fallback;
    const overlay=document.querySelector('#v075AuthOverlay');if(!overlay)return false;
    const card=overlay.querySelector('.v075-auth-card');if(!card)return false;
    const title=card.querySelector('.v075-auth-title');if(title)title.textContent=T('login.title','Grow Legends Account');
    const sub=card.querySelector('#v075AuthSub');if(sub)sub.textContent=T('login.subtitle','Sichere deinen Charakter dauerhaft und spiele auf jedem Gerät weiter.');
    const login=card.querySelector('#v075LoginTab');if(login)login.textContent=T('login.tabSignIn','Anmelden');
    const reg=card.querySelector('#v075RegisterTab');if(reg)reg.textContent=T('login.tabRegister','Registrieren');
    const labels=card.querySelectorAll('.v075-field label');
    if(labels[0])labels[0].textContent=T('login.email','E-Mail');
    if(labels[1])labels[1].textContent=T('login.passwordLabel','Passwort');
    const email=card.querySelector('#v075Email');if(email)email.setAttribute('placeholder','name@email.de');
    const pass=card.querySelector('#v075Password');if(pass)pass.setAttribute('placeholder',T('login.passwordPlaceholder','Mindestens 6 Zeichen'));
    const divider=card.querySelector('.v075-divider');if(divider)divider.textContent=T('login.or','oder');
    const note=card.querySelector('#v075AccountNote');if(note&&!note.dataset.v347ModeManaged)note.textContent=T('login.anonNote','Bestehende anonyme Charaktere können beim Registrieren direkt übernommen werden.');
    try{window.v075SetAuthMode?.(window.v075AuthMode||'login')}catch(_){}
    return true;
  }

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
    let bar=overlay.querySelector('.v347-topbar');
    if(!bar){
      bar=document.createElement('div');
      bar.className='v347-topbar';
      overlay.appendChild(bar);
    }
    {
      const fallbackLangs=[
        {id:'de',short:'DE',flag:'🇩🇪',label:'Deutsch'},
        {id:'en',short:'EN',flag:'🇬🇧',label:'English'},
        {id:'es',short:'ES',flag:'🇪🇸',label:'Español'},
        {id:'fr',short:'FR',flag:'🇫🇷',label:'Français'},
        {id:'pl',short:'PL',flag:'🇵🇱',label:'Polski'},
        {id:'tr',short:'TR',flag:'🇹🇷',label:'Türkçe'}
      ];
      const fromCore=window.GrowI18n?.languages?.();
      const langs=Array.isArray(fromCore)&&fromCore.length===6?fromCore:fallbackLangs;
      let active=window.GrowI18n?.getLanguage?.()||'de';
      try{if(!window.GrowI18n)active=localStorage.getItem('growLegendsLanguage')||'de'}catch(_){}
      if(!langs.some(x=>x.id===active))active='de';
      let sel=bar.querySelector('#v8143LanguageSelect');
      const needsRebuild=!sel||sel.options.length!==langs.length||langs.some((x,i)=>sel.options[i]?.value!==x.id);
      if(needsRebuild){
        bar.innerHTML='<label class="v347-lang" for="v8143LanguageSelect">🌐 <span class="v347-lang-current">'+String((langs.find(x=>x.id===active)||langs[0])?.short||'DE')+'</span><select id="v8143LanguageSelect" aria-label="Sprache">'+langs.map(x=>'<option value="'+x.id+'" '+(x.id===active?'selected':'')+'>'+x.flag+' '+x.label+'</option>').join('')+'</select></label><div class="v347-version">V4.02 STABLE</div>';
        sel=bar.querySelector('#v8143LanguageSelect');
      }else{
        sel.value=active;
        const short=bar.querySelector('.v347-lang-current');
        if(short)short.textContent=String((langs.find(x=>x.id===active)||langs[0])?.short||'DE');
      }

      /* The topbar can be rebuilt by the login lifecycle. Re-bind the canonical
         language handler every time so a visually intact replacement <select>
         can never lose its change listener. */
      if(sel){
        const applySelectedLanguage=e=>{
          const value=String(e?.target?.value||sel.value||'de').toLowerCase();
          if(window.GrowI18n?.setLanguage){
            window.GrowI18n.setLanguage(value);
          }else{
            try{localStorage.setItem('growLegendsLanguage',value)}catch(_){}
            try{location.reload()}catch(_){}
          }
        };
        sel.onchange=applySelectedLanguage;
        sel.oninput=applySelectedLanguage;
      }
    }

    const title=card.querySelector('.v075-auth-title');
    if(title) title.textContent=window.GrowI18n?.t?.('login.chooseServer')||'Wähle deinen Server';

    /* Helpful login row matching the reference. Visual only; password reset is not
       advertised as functional because no reset handler exists in the current game. */
    if(!card.querySelector('.v347-login-tools')){
      const tools=document.createElement('div');
      tools.className='v347-login-tools';
      tools.innerHTML='<span class="v347-remember"><i class="v347-check"></i> <span data-i18n="login.remember">'+(window.GrowI18n?.t?.('login.remember')||'Angemeldet bleiben')+'</span></span><span class="v347-forgot" data-i18n="login.forgot">'+(window.GrowI18n?.t?.('login.forgot')||'Passwort vergessen?')+'</span>';
      const action=card.querySelector('#v075EmailAction');
      action?.insertAdjacentElement('beforebegin',tools);
    }

    if(!card.querySelector('.v347-register-banner')){
      const banner=document.createElement('div');
      banner.className='v347-register-banner';
      banner.innerHTML='<div class="v347-register-copy"><div class="v347-chest">🧰</div><div><b data-i18n="login.newHere">'+(window.GrowI18n?.t?.('login.newHere')||'Neu hier?')+'</b><span data-i18n="login.newHereText">'+(window.GrowI18n?.t?.('login.newHereText')||'Erstelle einen neuen Account und werde zur Legende!')+'</span></div></div><button type="button" class="v347-register-btn">👤+ <span data-i18n="login.register">'+(window.GrowI18n?.t?.('login.register')||'Registrieren')+'</span></button>';
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
        <div class="v347-feature"><i>🌿</i><div><b data-i18n="login.featureGrowTitle">${window.GrowI18n?.t?.('login.featureGrowTitle')||'Grow.'}</b><span data-i18n="login.featureGrowText">${window.GrowI18n?.t?.('login.featureGrowText')||'Baue die stärksten Pflanzen an.'}</span></div></div>
        <div class="v347-feature"><i>⚔️</i><div><b data-i18n="login.featureFightTitle">${window.GrowI18n?.t?.('login.featureFightTitle')||'Fight.'}</b><span data-i18n="login.featureFightText">${window.GrowI18n?.t?.('login.featureFightText')||'Bezwinge Monster in epischen Dungeons.'}</span></div></div>
        <div class="v347-feature"><i>🏅</i><div><b data-i18n="login.featureBecomeTitle">${window.GrowI18n?.t?.('login.featureBecomeTitle')||'Become.'}</b><span data-i18n="login.featureBecomeText">${window.GrowI18n?.t?.('login.featureBecomeText')||'Werde zur Legende in der Ehrenhalle.'}</span></div></div>
        <div class="v347-feature"><i>💎</i><div><b data-i18n="login.featureLegendTitle">${window.GrowI18n?.t?.('login.featureLegendTitle')||'Legend.'}</b><span data-i18n="login.featureLegendText">${window.GrowI18n?.t?.('login.featureLegendText')||'Schreibe deine eigene Geschichte.'}</span></div></div>`;
      stack.appendChild(features);
    }

    if(!stack.querySelector('.v347-footer')){
      const footer=document.createElement('div');
      footer.className='v347-footer';
      footer.innerHTML='© 2026 Grow Legends &nbsp;|&nbsp; <span data-i18n="login.rights">'+(window.GrowI18n?.t?.('login.rights')||'Alle Rechte vorbehalten')+'</span><br><span class="links"><span data-i18n="login.privacy">'+(window.GrowI18n?.t?.('login.privacy')||'Datenschutz')+'</span> &nbsp; | &nbsp; <span data-i18n="login.imprint">'+(window.GrowI18n?.t?.('login.imprint')||'Impressum')+'</span> &nbsp; | &nbsp; <span data-i18n="login.support">'+(window.GrowI18n?.t?.('login.support')||'Support')+'</span></span>';
      stack.appendChild(footer);
    }

    /* Core applyDocument() already calls this canonical layout owner.
       Do not call GrowI18n.apply() from here or both owners recurse into each other. */
    try{v347PaintLoginLanguage()}catch(_){}
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
  window.v347EnsureLayout=v347EnsureLayout;
  window.v347PaintLoginLanguage=v347PaintLoginLanguage;

  /* Delegated fallback survives any later DOM replacement of the select. */
  document.addEventListener('change',e=>{
    if(e?.target?.id!=='v8143LanguageSelect')return;
    const value=String(e.target.value||'de').toLowerCase();
    if(window.GrowI18n?.setLanguage)window.GrowI18n.setLanguage(value);
    else{
      try{localStorage.setItem('growLegendsLanguage',value)}catch(_){}
      try{location.reload()}catch(_){}
    }
  },true);

  window.addEventListener('growlegends:language-changed',()=>{v347EnsureLayout();v347PaintLoginLanguage()},{passive:true});

  function version(){
    document.querySelectorAll('.version').forEach(el=>el.textContent=V347_VERSION);
    const v=document.querySelector('#v075AuthOverlay .v347-version');
    if(v)v.textContent='V4.02 STABLE';
  }
  version();
  setTimeout(version,350);
  setTimeout(version,1200);
})();
