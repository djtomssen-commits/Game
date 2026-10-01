(()=>{
 'use strict';
 if(window.__GL_PUSH_MASTER_SWITCH_V1__)return;
 window.__GL_PUSH_MASTER_SWITCH_V1__=true;

 function enabled(){
  try{return !(typeof v141Settings==='object'&&v141Settings&&v141Settings.pushNotifications===false)}catch(e){return true}
 }
 window.glPushEnabled=enabled;

 async function user(){
  try{
   if(typeof v073Db==='undefined'||!v073Db?.auth)return null;
   const r=await v073Db.auth.getSession();
   if(r?.data?.session?.user)return r.data.session.user;
   const u=await v073Db.auth.getUser();
   return u?.data?.user||null;
  }catch(e){return null}
 }

 async function cancelAllPending(){
  try{
   const u=await user();
   if(!u?.id||typeof v073Db==='undefined')return false;
   const nowIso=new Date().toISOString();
   const {error}=await v073Db.from('push_jobs')
    .update({cancelled_at:nowIso,updated_at:nowIso})
    .eq('user_id',u.id)
    .is('sent_at',null)
    .is('cancelled_at',null);
   if(error)throw error;
   console.info('[GL Push] alle offenen Push-Jobs deaktiviert');
   return true;
  }catch(e){
   console.warn('[GL Push] offene Jobs konnten nicht deaktiviert werden',e);
   return false;
  }
 }

 async function resyncAll(){
  try{if(typeof window.glRegisterNativePushDevice==='function')await window.glRegisterNativePushDevice()}catch(e){}
  try{if(typeof window.glSyncGrowPushJob==='function')await window.glSyncGrowPushJob()}catch(e){}
  try{if(typeof window.glSyncGrowCarePushJob==='function')await window.glSyncGrowCarePushJob()}catch(e){}
  try{if(typeof window.glSyncQuestPushJob==='function')await window.glSyncQuestPushJob()}catch(e){}
  try{if(typeof window.glSyncDungeonPushJob==='function')await window.glSyncDungeonPushJob()}catch(e){}
  try{if(typeof window.glSyncWorldBossPushJob==='function')await window.glSyncWorldBossPushJob()}catch(e){}
 }

 window.glSetPushEnabled=async function(on){
  const value=!!on;
  try{
   if(typeof v141Settings==='object'&&v141Settings){
    v141Settings.pushNotifications=value;
    localStorage.setItem('growLegendsSettingsV141',JSON.stringify(v141Settings));
   }
  }catch(e){}

  if(!value){
   await cancelAllPending();
   return true;
  }

  try{
   if(typeof Notification!=='undefined'&&Notification.permission==='default')
    await Notification.requestPermission();
  }catch(e){}
  await resyncAll();
  return true;
 };

 window.addEventListener('growlegends:account-ready',()=>{
  setTimeout(()=>{if(!enabled())void cancelAllPending()},1200);
 });
})();
