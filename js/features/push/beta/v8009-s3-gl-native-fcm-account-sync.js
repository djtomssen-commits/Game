(()=>{
 'use strict';
 if(window.__GL_NATIVE_FCM_ACCOUNT_SYNC_V1__)return;
 window.__GL_NATIVE_FCM_ACCOUNT_SYNC_V1__=true;

 let lastRegisteredKey='';
 let registering=false;
 let retryTimer=0;

 function token(){
  try{return String(window.__GROW_LEGENDS_NATIVE_FCM_TOKEN__||'').trim()}catch(e){return ''}
 }

 async function currentUser(){
  try{
   if(typeof v073Db==='undefined'||!v073Db?.auth)return null;
   const {data}=await v073Db.auth.getSession();
   if(data?.session?.user)return data.session.user;
   const r=await v073Db.auth.getUser();
   return r?.data?.user||null;
  }catch(e){
   console.warn('[GL FCM] Benutzer konnte nicht gelesen werden',e);
   return null;
  }
 }

 async function syncNativeToken(force=false){
  if(typeof window.glPushEnabled==='function'&&!window.glPushEnabled())return false;
  if(registering)return false;
  const t=token();
  if(!t)return false;
  const user=await currentUser();
  if(!user?.id)return false;
  const key=user.id+'|'+t;
  if(key===lastRegisteredKey)return true;
  let tokenHash='0';
  try{
   let h=2166136261;
   for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)}
   tokenHash=(h>>>0).toString(36);
  }catch(_){}
  const cacheKey=`gl:fcm:${user.id}:${tokenHash}`;
  try{
   const last=Number(localStorage.getItem(cacheKey)||0);
   const age=Date.now()-last;
   if(last>0 && age<(force?10*60*1000:24*60*60*1000)){
    lastRegisteredKey=key;
    return true;
   }
  }catch(_){}

  registering=true;
  try{
   const {error}=await v073Db.rpc('v520_register_push_device',{p_fcm_token:t});
   if(error)throw error;
   lastRegisteredKey=key;
   try{localStorage.setItem(cacheKey,String(Date.now()))}catch(_){}
   console.info('[GL FCM] Gerät für aktuellen Account registriert',user.id);
   try{window.dispatchEvent(new CustomEvent('growlegends:push-device-ready',{detail:{user_id:user.id}}))}catch(e){}
   return true;
  }catch(e){
   console.warn('[GL FCM] Geräte-Registrierung fehlgeschlagen',e);
   return false;
  }finally{
   registering=false;
  }
 }

 function soon(force=false,delay=150){
  clearTimeout(retryTimer);
  retryTimer=setTimeout(()=>{void syncNativeToken(force)},delay);
 }

 window.glRegisterNativePushDevice=()=>syncNativeToken(true);

 window.addEventListener('growlegends:native-fcm-token',()=>soon(true,50));
 window.addEventListener('growlegends:account-ready',()=>soon(true,250));
 window.addEventListener('pageshow',()=>soon(false,500),{passive:true});
 document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible')soon(false,500);
 },{passive:true});

 /* The native shell injects the token several times while the WebView boots.
    These checks also cover a token event that happened before this script loaded. */
 [0,500,1500,3000,6000,10000].forEach(ms=>setTimeout(()=>{void syncNativeToken(false)},ms));

 /* Supabase may restore/switch the session after the native token already exists. */
 try{
  if(typeof v073Db!=='undefined'&&v073Db?.auth?.onAuthStateChange){
   v073Db.auth.onAuthStateChange(()=>setTimeout(()=>{void syncNativeToken(true)},250));
  }
 }catch(e){console.warn('[GL FCM] Auth listener',e)}
})();
