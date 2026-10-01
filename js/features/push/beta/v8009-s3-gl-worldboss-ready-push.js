(()=>{
 'use strict';
 if(window.__glWorldBossReadyPushV2)return;
 window.__glWorldBossReadyPushV2=true;
 /* Retire V1 flag as well so only this implementation owns future scheduling. */
 window.__glWorldBossReadyPushV1=true;

 let wbSyncPromise=null;
 let wbCleanupTimer=0;

 async function wbUser(){
  try{
   if(typeof v073Db==='undefined'||!v073Db?.auth)return null;
   let session=null;
   try{
    const r=await v073Db.auth.getSession();session=r?.data?.session||null;
    if(session){
     try{const rr=await v073Db.auth.refreshSession();if(rr?.data?.session)session=rr.data.session}catch(e){}
     if(session?.user)return session.user;
    }
   }catch(e){}
   const {data,error}=await v073Db.auth.getUser();
   return error?null:(data?.user||null);
  }catch(e){console.warn('[GL Worldboss Push] user',e);return null}
 }

 function nextLocalMidnight(){
  const d=new Date();
  d.setHours(24,0,0,0);
  return d.getTime();
 }

 async function pending(user){
  const {data,error}=await v073Db.from('push_jobs')
   .select('id')
   .eq('user_id',user.id).eq('type','worldboss_ready')
   .is('sent_at',null).is('cancelled_at',null);
  if(error)throw error;
  const rows=Array.isArray(data)?data:[];
  rows.sort((a,b)=>String(a?.id||'').localeCompare(String(b?.id||'')));
  return rows;
 }

 async function cancelForUser(user){
  const nowIso=new Date().toISOString();
  const {error}=await v073Db.from('push_jobs')
   .update({cancelled_at:nowIso,updated_at:nowIso})
   .eq('user_id',user.id).eq('type','worldboss_ready')
   .is('sent_at',null).is('cancelled_at',null);
  if(error)throw error;
  return true;
 }

 async function cancel(){
  try{
   const user=await wbUser();if(!user)return false;
   return await cancelForUser(user);
  }catch(e){console.warn('[GL Worldboss Push] cancel',e);return false}
 }

 async function normalizePending(user,payload){
  let jobs=await pending(user);
  if(!jobs.length)return null;

  /* All clients choose the oldest pending row as the canonical job. */
  const keep=jobs[0];
  const extras=jobs.slice(1).map(x=>x.id).filter(Boolean);
  const nowIso=new Date().toISOString();

  const {error:updateError}=await v073Db.from('push_jobs')
   .update({...payload,updated_at:nowIso})
   .eq('id',keep.id)
   .eq('user_id',user.id)
   .is('sent_at',null).is('cancelled_at',null);
  if(updateError)throw updateError;

  if(extras.length){
   const {error:cancelError}=await v073Db.from('push_jobs')
    .update({cancelled_at:nowIso,updated_at:nowIso})
    .eq('user_id',user.id)
    .in('id',extras)
    .is('sent_at',null).is('cancelled_at',null);
   if(cancelError)throw cancelError;
   console.info('[GL Worldboss Push] doppelte worldboss_ready Jobs entfernt:',extras.length);
  }
  return keep.id;
 }

 async function doSync(){
  if(typeof window.glPushEnabled==='function'&&!window.glPushEnabled()){
   return cancel();
  }
  try{
   const user=await wbUser();if(!user)return false;
   const wb=(typeof s!=='undefined'&&s?.v110WorldBoss)||null;
   if(!wb?.freeUsed)return cancelForUser(user);

   const sendAt=new Date(nextLocalMidnight()).toISOString();
   const payload={
    title:'Grow Legends',
    body:'💎 Dein kostenloser Versuch gegen den Smaragd-Koloss ist wieder verfügbar!',
    send_at:sendAt
   };

   /* First collapse any duplicates that may already exist from older versions. */
   let keepId=await normalizePending(user,payload);

   if(!keepId){
    const {data:inserted,error:insertError}=await v073Db.from('push_jobs')
     .insert({user_id:user.id,type:'worldboss_ready',...payload})
     .select('id');
    if(insertError){
     /* A unique index may exist on some installs. In that case another sync won. */
     if(String(insertError.code||'')!=='23505')throw insertError;
    }else if(Array.isArray(inserted)&&inserted[0]?.id){
     keepId=inserted[0].id;
    }
   }

   /* A second pass closes the race where two tabs/devices inserted together. */
   await normalizePending(user,payload);
   clearTimeout(wbCleanupTimer);
   wbCleanupTimer=setTimeout(()=>{
    void (async()=>{
     try{
      const u=await wbUser();if(!u)return;
      const state=(typeof s!=='undefined'&&s?.v110WorldBoss)||null;
      if(state?.freeUsed)await normalizePending(u,payload);
      else await cancelForUser(u);
     }catch(e){console.warn('[GL Worldboss Push] delayed dedupe',e)}
    })();
   },900);

   console.info('[GL Worldboss Push] genau ein worldboss_ready geplant',sendAt);
   return true;
  }catch(e){console.warn('[Grow Legends] Weltboss-Push konnte nicht geplant werden:',e);return false}
 }

 async function sync(){
  /* Serialize all account-ready/pageshow/visibility/fight sync triggers in this client. */
  if(wbSyncPromise)return wbSyncPromise;
  wbSyncPromise=doSync();
  try{return await wbSyncPromise}finally{wbSyncPromise=null}
 }

 window.glSyncWorldBossPushJob=sync;
 window.glCancelWorldBossPushJob=cancel;

 function resync(){
  try{
   const wb=(typeof s!=='undefined'&&s?.v110WorldBoss)||null;
   if(wb?.freeUsed)void sync(); else void cancel();
  }catch(e){}
 }
 window.addEventListener('growlegends:account-ready',()=>setTimeout(resync,1700));
 window.addEventListener('pageshow',()=>setTimeout(resync,1100),{passive:true});
 document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible')setTimeout(resync,1200);
 },{passive:true});
 window.addEventListener('growlegends:push-device-ready',()=>setTimeout(resync,500));

 /* Only a real daily free attempt schedules tomorrow's notification. Paid retries do not. */
 try{
  if(typeof v110Fight==='function'&&!v110Fight.__glWorldBossPushV2){
   const base=v110Fight;
   const wrapped=function(...args){
    const before=!!((typeof s!=='undefined'&&s?.v110WorldBoss)?.freeUsed);
    const r=base.apply(this,args);
    setTimeout(()=>{
     try{
      const after=!!((typeof s!=='undefined'&&s?.v110WorldBoss)?.freeUsed);
      if(!before&&after)void sync();
     }catch(e){}
    },100);
    return r;
   };
   wrapped.__glWorldBossPushV2=true;wrapped.__glWorldBossPushBase=base;
   v110Fight=wrapped;try{window.v110Fight=wrapped}catch(e){}
  }
 }catch(e){console.warn('[GL Worldboss Push] fight hook',e)}
})();
