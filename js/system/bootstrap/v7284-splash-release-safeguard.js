(()=>{
 'use strict';
 if(window.__V7284_SPLASH_RELEASE__)return;
 window.__V7284_SPLASH_RELEASE__=true;
 function accountReady(){
  try{
   const id=String(v073User?.id||'');
   if(!(!!id && window.__V200_AUTH_READY__===true && String(v075CloudLoadedFor||'')===id))return false;
   try{
    const hasCharacter=typeof v200CharacterComplete==='function'&&v200CharacterComplete();
    if(hasCharacter&&window.__V8088_CRITICAL_BOOT_READY__!==true)return false;
   }catch(_){}
   return true;
  }catch(_){return false}
 }
 function release(){
  if(!accountReady())return false;
  const ov=document.getElementById('v075AuthOverlay');
  if(!ov)return false;
  try{window.__V4143_AUTH_BOOTING__=false}catch(_){}
  ov.classList.remove('show','v4143-restoring');
  try{window.v660SetBootProgress?.(100)}catch(_){}
  return true;
 }
 window.addEventListener('growlegends:first-playable',()=>{release();setTimeout(release,80);setTimeout(release,450)},{passive:true});
 /* If an older delayed boot callback races after first-playable, release again —
    but only for a fully verified logged-in account. */
 [1200,2600,5200].forEach(ms=>setTimeout(release,ms));
 window.v7284ReleaseSplash=release;
})();
