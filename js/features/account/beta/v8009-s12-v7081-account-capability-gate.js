(()=>{
'use strict';
if(window.__V7081_CAPABILITY_GATE__)return;
window.__V7081_CAPABILITY_GATE__=true;

const C={
  ready:false,loading:false,uid:'',lastError:'',lastSync:0,
  caps:{
    items:false,grow:false,tower:false,weekly:false,worldboss:false,
    daily:false,endgame:false,pets:false,achievements:false,
    progress:false,guild_rewards:false
  }
};
let inflight=null;

const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const one=d=>Array.isArray(d)?d[0]:d;
const emptyCaps=()=>({
  items:false,grow:false,tower:false,weekly:false,worldboss:false,
  daily:false,endgame:false,pets:false,achievements:false,
  progress:false,guild_rewards:false
});
const cacheKey=id=>`gl_v7081_caps_${id}`;

function publish(r,id){
  C.uid=id||'';
  C.ready=!!r?.ok;
  C.lastSync=Date.now();
  C.lastError=String(r?.reason||'');
  C.caps={...emptyCaps(),...(r?.caps&&typeof r.caps==='object'?r.caps:{})};
  try{if(id)localStorage.setItem(cacheKey(id),JSON.stringify({at:Date.now(),caps:C.caps}))}catch(_){}
  try{window.dispatchEvent(new CustomEvent('growlegends:authority-capabilities-ready',{detail:{uid:id,caps:{...C.caps}}}))}catch(_){}
}
function loadCache(id){
  if(!id)return;
  try{
    const x=JSON.parse(localStorage.getItem(cacheKey(id))||'null');
    if(x&&Date.now()-Number(x.at||0)<6*60*60*1000&&x.caps){
      C.uid=id;C.ready=true;C.caps={...emptyCaps(),...x.caps};
    }
  }catch(_){}
}
async function refresh(force=false){
  const id=uid(),x=db();
  if(!id||!x){
    C.ready=false;C.uid='';C.caps=emptyCaps();
    return null;
  }
  if(C.uid!==id){C.ready=false;C.uid=id;C.caps=emptyCaps();loadCache(id)}
  if(!force&&C.ready&&Date.now()-C.lastSync<30000)return C;
  if(inflight)return inflight;
  C.loading=true;
  inflight=(async()=>{
    try{
      const {data,error}=await x.rpc('v7081_client_capabilities');
      if(error)throw error;
      const r=one(data)||{};
      publish(r,id);
      return r;
    }catch(e){
      C.lastError=String(e?.message||e);
      C.lastSync=Date.now();
      /* Important: on any capability/auth failure, preserve legacy gameplay
         and stop all authority modules from hammering RPC endpoints. */
      C.ready=true;
      C.caps=emptyCaps();
      console.warn('[V7081] capability check',e);
      return null;
    }finally{
      C.loading=false;inflight=null;
    }
  })();
  return inflight;
}

window.v7081UseAuthority=(name)=>{
  const id=uid();
  if(!id)return false;
  if(C.uid!==id){C.ready=false;C.uid=id;C.caps=emptyCaps();loadCache(id)}
  return !!(C.ready&&C.caps?.[String(name||'')]);
};
window.v7081CapabilitiesRefresh=(force=false)=>refresh(!!force);
window.v7081CapabilitiesDiagnostics=()=>JSON.parse(JSON.stringify(C));

function boot(){
  const id=uid();
  if(id&&C.uid!==id)loadCache(id);
  if(window.v7206StartupBusy?.())return;
  if(C.ready&&Date.now()-Number(C.lastSync||0)<60000)return;
  void refresh(false);
}
window.addEventListener('growlegends:account-ready',()=>setTimeout(boot,20),{passive:true});
window.addEventListener('growlegends:first-playable',()=>setTimeout(boot,700),{passive:true});
window.addEventListener('pageshow',()=>setTimeout(boot,80),{passive:true});
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&Date.now()-C.lastSync>60000)setTimeout(()=>void refresh(true),120);
},{passive:true});
setTimeout(boot,30);
})();
