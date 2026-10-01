(()=>{
'use strict';
if(window.__V7098_SYSTEM_QA_BRIDGE__)return;window.__V7098_SYSTEM_QA_BRIDGE__=true;
const VERSION='V7.109';let inflight=null,lastAt=0;
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const row=d=>Array.isArray(d)?d[0]:d;
async function refresh(force=false){
 if(typeof v093IsAdmin!=='undefined'&&v093IsAdmin!==true)return null;
 const now=Date.now();if(!force&&window.__V7098_SERVER_QA__&&now-lastAt<15000)return window.__V7098_SERVER_QA__;
 if(inflight)return inflight;
 const x=db();if(!x)return null;
 inflight=(async()=>{
  try{
   const since=new Date(Date.now()-24*60*60*1000).toISOString();
   const {data,error}=await x.rpc('v7107_golden_master_qa',{p_since:since});
   if(error)throw error;
   const r=row(data);if(!r?.ok)throw new Error(String(r?.reason||'SERVER_QA_REJECTED'));
   window.__V7098_SERVER_QA__=r;lastAt=Date.now();
   window.dispatchEvent(new CustomEvent('growlegends:server-qa-ready',{detail:{version:VERSION,failed:Number(r.failed_checks)||0}}));
   if(document.getElementById('systemtech')?.classList.contains('active'))setTimeout(()=>document.getElementById('v4107Run')?.click(),30);
   return r;
  }catch(e){console.warn('[V7098] server QA',e);window.__V7098_SERVER_QA_ERROR__=String(e?.message||e);return null}
  finally{inflight=null}
 })();
 return inflight;
}
window.v7098RefreshServerQA=refresh;
function maybeRefresh(){if(document.getElementById('systemtech')?.classList.contains('active'))void refresh(false)}
document.addEventListener('click',e=>{if(e.target?.closest?.('[data-screen="systemtech"]'))setTimeout(()=>void refresh(true),120)},true);
window.addEventListener('growlegends:account-ready',()=>setTimeout(maybeRefresh,500),{passive:true});
window.addEventListener('pageshow',()=>setTimeout(maybeRefresh,350),{passive:true});
setTimeout(maybeRefresh,1400);
window.v7098QaDiagnostics=()=>({version:VERSION,loaded:!!window.__V7098_SERVER_QA__,failed:Number(window.__V7098_SERVER_QA__?.failed_checks)||0,lastAt,error:window.__V7098_SERVER_QA_ERROR__||''});
})();
