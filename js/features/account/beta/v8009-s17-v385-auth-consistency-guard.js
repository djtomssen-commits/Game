(function(){
  const VERSION='V4.29 Stable';

  async function v385VerifyLoggedOutState(){
    if(window.__V301_LOGOUT_IN_PROGRESS__)return;
    /* V4.159: pageshow/focus can fire before Supabase restores a persisted session. */
    if(window.__V4143_AUTH_BOOTING__===true)return;
    if(window.__V200_AUTH_READY__ || v073User)return;

    /* If the app considers itself logged out, the login overlay must stay
       authoritative. This prevents a stale screen from looking half logged-in. */
    try{
      document.documentElement.classList.remove('v224-app-ready');
      v075SetAuthMode('login');
      v075Overlay(true);
      const ov=document.querySelector('#v075AuthOverlay');
      if(ov){
        ov.classList.add('show');
        ov.style.pointerEvents='auto';
        ov.style.visibility='visible';
        ov.style.opacity='1';
      }
    }catch(e){}
  }

  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible')v385VerifyLoggedOutState();
  });
  window.addEventListener('pageshow',v385VerifyLoggedOutState,{passive:true});
  window.addEventListener('focus',v385VerifyLoggedOutState,{passive:true});

  document.querySelectorAll(
    '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
  ).forEach(el=>{if(el)el.textContent=VERSION});
  document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11');
})();
