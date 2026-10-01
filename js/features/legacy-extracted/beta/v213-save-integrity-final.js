
/* Final V4.02 safety hooks */
window.addEventListener('pagehide',()=>{
  try{
    if(v200DurableUser() && v075CloudLoadedFor===v073User.id){
      v213LocalCheckpoint('pagehide');
    }
  }catch(e){}
});

document.addEventListener('visibilitychange',()=>{
  try{
    if(document.visibilityState==='hidden' &&
       v200DurableUser() &&
       v075CloudLoadedFor===v073User.id){
      v213LocalCheckpoint('hidden');
      v075WriteCloudSave(false);
    }
  }catch(e){}
});

/* Once auth/cloud are ready, the monitor catches direct state mutations
   that bypass the old persist() helper. */
setTimeout(()=>{
  try{
    if(v200DurableUser() && v075CloudLoadedFor===v073User.id){
      v213StartMonitor();
    }
  }catch(e){}
},1200);

/* V7.113: retired render wrapper whose only job was an obsolete version paint. */
