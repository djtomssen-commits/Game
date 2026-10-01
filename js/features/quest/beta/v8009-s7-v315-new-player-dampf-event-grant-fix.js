/* ===== V4.02 New-player Dampf event grant fix =====
   Root cause: the global event sync can run while a brand-new account still
   has NO finished character. That can consume/store the per-event grant key
   before character creation is authoritative. If the fresh character state
   later has 100 Dampf, sync sees the same key and correctly avoids a second
   grant -> UI becomes 100/300.
   Fix: mark genuinely fresh account states and apply the initial event grant
   once, after the character/profile has been completed.
*/
if(typeof v200FreshState==='function'){
 const v315BaseFreshState=v200FreshState;
 v200FreshState=function(uid){
   const r=v315BaseFreshState(uid);
   s.v315NeedsInitialDampfGrant=true;
   try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
   return r;
 };
}

if(typeof v073SyncProfile==='function'){
 const v315BaseSyncProfile=v073SyncProfile;
 v073SyncProfile=async function(force=false){
  if(window.__V200_AUTH_READY__!==true)return false;
   const r=await v315BaseSyncProfile(force);
   if(r && s.v315NeedsInitialDampfGrant && v200CharacterComplete?.()){
     try{
       /* Event data is normally ready here through V4.02. Refresh once if not. */
       if(!v271EventDataReady && typeof v093LoadPublicContent==='function'){
         await v093LoadPublicContent();
         v271EventDataReady=true;
       }
       if(v271DampfEventActive()){
         /* This is NOT a repeat refill. It is the deferred first grant belonging
            to this newly completed character. */
         s.v271DampfEventGrantKey='';
         s.v271DampfEventWasActive=false;
         v271SyncDampfEvent();
       }
       s.v315NeedsInitialDampfGrant=false;
       try{persist(false)}catch(e){}
       try{v271PaintDampf()}catch(e){}
     }catch(e){
       console.error('V4.02 initial Dampf event grant',e);
       /* Keep the marker so the next successful profile sync can retry. */
     }
   }
   return r;
 };
}

/* Safety for a fresh character created during an already-running event:
   profile sync above is canonical, this only reconciles display after boot. */
setTimeout(()=>{
 try{
   if(s.v315NeedsInitialDampfGrant && v200CharacterComplete?.() && v271EventDataReady){
     v073SyncProfile(true);
   }
 }catch(e){}
},1200);

/* V8.009: obsolete no-op/version global render wrapper retired. */
