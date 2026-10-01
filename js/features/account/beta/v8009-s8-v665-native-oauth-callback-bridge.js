/* V6.65 — Native OAuth callback bridge.
   Android delivers the original custom-scheme callback to the existing WebView.
   We complete either implicit-token or PKCE-code flows without reloading the app. */
(function(){
  if(window.__V665_NATIVE_OAUTH_BRIDGE__) return;
  window.__V665_NATIVE_OAUTH_BRIDGE__=true;

  const completed=new Set();
  let activeUrl='';

  function v665AuthMessage(text,type=''){
    try{ if(typeof v200AuthStatus==='function') v200AuthStatus(text,type); }catch(_){ }
  }

  async function v665FinishNativeOAuth(rawUrl){
    const raw=String(rawUrl||'').trim();
    if(!raw) return false;
    if(completed.has(raw)) return true;
    if(activeUrl===raw) return false;

    activeUrl=raw;
    try{
      v665AuthMessage('Google-Anmeldung wird übernommen …');
      try{ if(typeof v4143SetAuthBoot==='function') v4143SetAuthBoot(true,'Google-Anmeldung wird abgeschlossen …'); }catch(_){ }

      if(typeof v073Init!=='function') throw new Error('Auth-System ist noch nicht bereit.');
      const initOk=await v073Init();
      if(!initOk || !v073Db) throw new Error('Supabase ist nicht erreichbar.');

      const u=new URL(raw);
      const authError=u.searchParams.get('error_description') || u.searchParams.get('error');
      if(authError) throw new Error(authError);

      let session=null;
      const hashParams=new URLSearchParams(String(u.hash||'').replace(/^#/,''));
      const accessToken=hashParams.get('access_token');
      const refreshToken=hashParams.get('refresh_token');

      /* Browser/implicit OAuth: callback carries access + refresh token. */
      if(accessToken && refreshToken && typeof v073Db.auth.setSession==='function'){
        const result=await v073Db.auth.setSession({
          access_token:accessToken,
          refresh_token:refreshToken
        });
        if(result?.error) throw result.error;
        session=result?.data?.session||null;
      }

      /* PKCE OAuth: callback carries a one-time code. */
      if(!session){
        const code=u.searchParams.get('code');
        if(code && typeof v073Db.auth.exchangeCodeForSession==='function'){
          const flowId=u.searchParams.get('sb_flow_id');
          let result;
          if(flowId){
            try{
              result=await v073Db.auth.exchangeCodeForSession(code,{flowId});
            }catch(_){
              result=await v073Db.auth.exchangeCodeForSession(code);
            }
          }else{
            result=await v073Db.auth.exchangeCodeForSession(code);
          }
          if(result?.error) throw result.error;
          session=result?.data?.session||null;
        }
      }

      /* Last check: setSession/onAuthStateChange may already have persisted it. */
      if(!session){
        const result=await v073Db.auth.getSession();
        if(result?.error) throw result.error;
        session=result?.data?.session||null;
      }

      if(!session?.user || session.user.is_anonymous){
        throw new Error('Google hat keine gültige Spielsitzung zurückgegeben.');
      }

      completed.add(raw);
      window.__GROW_LEGENDS_OAUTH_CALLBACK__='';
      try{ sessionStorage.removeItem('v200OAuthPending'); }catch(_){ }
      try{ v200AuthBusy=false; }catch(_){ }

      /* Finalize directly. The existing cloud resolver serializes duplicates, so
         an auth-state event racing us cannot create two independent save loads. */
      let loaded=true;
      if(typeof v200FinalizeUser==='function'){
        loaded=await v200FinalizeUser(session.user);
      }
      if(loaded===false) throw new Error('Spielstand konnte nach Google-Login nicht geladen werden.');

      try{ if(typeof v4143SetAuthBoot==='function') v4143SetAuthBoot(false); }catch(_){ }
      try{ if(typeof v075Overlay==='function') v075Overlay(false); }catch(_){ }
      v665AuthMessage('Google-Anmeldung erfolgreich.','success');
      return true;
    }catch(e){
      console.error('V6.65 native OAuth callback',e);
      try{ v200AuthBusy=false; }catch(_){ }
      try{ if(typeof v4143SetAuthBoot==='function') v4143SetAuthBoot(false); }catch(_){ }
      const msg=e?.message||'Google-Anmeldung konnte nicht abgeschlossen werden.';
      v665AuthMessage(msg,'error');
      try{ if(typeof v063Toast==='function') v063Toast('Google-Anmeldung fehlgeschlagen','error',msg); }catch(_){ }
      return false;
    }finally{
      if(activeUrl===raw) activeUrl='';
    }
  }

  window.v665FinishNativeOAuth=v665FinishNativeOAuth;

  window.addEventListener('growlegends:oauth-callback',function(ev){
    const url=ev?.detail?.url || window.__GROW_LEGENDS_OAUTH_CALLBACK__ || '';
    if(url) void v665FinishNativeOAuth(url);
  });

  /* Cold-start safety: native may have injected the URL before this script ran. */
  if(window.__GROW_LEGENDS_OAUTH_CALLBACK__){
    setTimeout(()=>void v665FinishNativeOAuth(window.__GROW_LEGENDS_OAUTH_CALLBACK__),0);
  }

  /* Boot-time safety: consume a pending native callback before normal URL parsing. */
  if(typeof v200HandleOAuthReturn==='function'){
    const baseHandleOAuthReturn=v200HandleOAuthReturn;
    v200HandleOAuthReturn=async function(){
      const pending=window.__GROW_LEGENDS_OAUTH_CALLBACK__;
      if(pending){
        const ok=await v665FinishNativeOAuth(pending);
        if(ok) return true;
      }
      return await baseHandleOAuthReturn.apply(this,arguments);
    };
  }
})();
