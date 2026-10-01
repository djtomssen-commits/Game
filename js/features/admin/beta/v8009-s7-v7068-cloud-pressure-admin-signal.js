(()=>{
'use strict';
if(window.__V7068_CLOUD_ADMIN_SIGNAL__)return;
window.__V7068_CLOUD_ADMIN_SIGNAL__=true;
const VERSION='V7.091';
let lastUid='',lastEventId=null,busy=false,lastPollAt=0;
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const row=d=>Array.isArray(d)?d[0]:d;
async function poll(){
 if(document.hidden||busy)return false;
 if(lastPollAt&&Date.now()-lastPollAt<60000)return true;
 lastPollAt=Date.now();
 const x=db(),id=uid();if(!x||!id||window.__V200_AUTH_READY__!==true)return false;
 if(lastUid!==id){lastUid=id;lastEventId=null}
 busy=true;
 try{
  const {data,error}=await x.rpc('v7068_admin_change_state');if(error)throw error;
  const st=row(data)||{},eid=Math.max(0,Number(st.event_id)||0);
  if(lastEventId===null){lastEventId=eid;return true}
  if(eid<=lastEventId)return true;
  lastEventId=eid;
  /* V7.109: admin actions write canonical authority tables. Never re-apply a
     stale player_saves snapshot here, because that can visually roll gameplay back. */
  try{await window.v7040AuthorityRefresh?.(true)}catch(_){}
  try{await window.v7063ItemStageRefresh?.(true)}catch(_){}
  try{await window.v7065GrowAuthorityRefresh?.(true)}catch(_){}
  try{await window.v7101SyncPublicProfile?.(true)}catch(_){}
  try{window.render?.();window.v032Render?.();window.v069SyncCurrencies?.();window.v441PaintResources?.()}catch(_){}
  try{v063Toast('🛡️ Admin-Änderung übernommen','success','Die autoritativen Serverwerte wurden neu geladen.')}catch(_){}
  return true;
 }catch(e){console.warn('[V7068] admin signal',e);return false}
 finally{busy=false}
}
try{v200AdminPoll=poll;window.v200AdminPoll=poll}catch(e){}
window.addEventListener('growlegends:account-ready',()=>{lastEventId=null;setTimeout(()=>void poll(),900)},{passive:true});
window.v7068SaveDiagnostics=()=>({version:VERSION,uid:uid(),lastEventId,busy,authReady:window.__V200_AUTH_READY__===true});
})();
