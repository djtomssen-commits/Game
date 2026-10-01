
let v300LastDampfActive=null;
function v300ReconcileTimedEvents(){
 try{
  if(!v271EventDataReady)return;
  const active=v271DampfEventActive();
  if(v300LastDampfActive===null){v300LastDampfActive=active;v271SyncDampfEvent();v271PaintDampf();return}
  if(active!==v300LastDampfActive){
   v300LastDampfActive=active;v271SyncDampfEvent();v271PaintDampf();
   try{renderQuests()}catch(e){} try{persist(false)}catch(e){}
  }
 }catch(e){}
}
setInterval(()=>{if(!document.hidden)v300ReconcileTimedEvents()},30000);
setTimeout(v300ReconcileTimedEvents,1000);

const v300Line=document.querySelector('#v141VersionLine');
