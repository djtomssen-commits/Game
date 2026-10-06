(()=>{
'use strict';
if(window.__V7077_PROGRESS_ENFORCE__)return;
window.__V7077_PROGRESS_ENFORCE__=true;

const VERSION='V7.091';
const P={ready:false,enforce:false,lastSync:0,lastError:'',refreshes:0,scheduled:0};
let inflight=null,timer=null;

const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const one=d=>Array.isArray(d)?d[0]:d;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};

function apply(r,{paint=true}={}){
  if(!r?.ok||typeof s==='undefined'||!s)return false;
  P.ready=true;
  P.enforce=String(r.mode||'')==='enforce';
  P.lastSync=Date.now();
  P.lastError='';
  if(!P.enforce)return true;

  if(Number.isFinite(Number(r.level)))s.level=Math.max(1,Number(r.level));
  if(Number.isFinite(Number(r.xp)))s.xp=Math.max(0,Number(r.xp));
  if(Number.isFinite(Number(r.gold)))s.gold=Math.max(0,Number(r.gold));
  if(Number.isFinite(Number(r.harz)))s.harzTaler=Math.max(0,Number(r.harz));

  try{
    if(typeof KEY!=='undefined'&&KEY)localStorage.setItem(KEY,JSON.stringify(s));
    localStorage.setItem('grow_idle_save_v1',JSON.stringify(s));
  }catch(_){}

  if(paint){
    try{window.v069SyncCurrencies?.()}catch(_){}
    try{window.v441PaintResources?.()}catch(_){}
    try{window.v446PaintCombatPower?.()}catch(_){}
    try{
      if(document.getElementById('character')?.classList.contains('active')){
        window.v446PaintCombatPower?.();
        window.v7124PaintCharacterSummary?.();
      }
    }catch(_){}
  }
  return true;
}

async function refresh({paint=true}={}){
  if(!window.v7081UseAuthority?.('progress')){P.ready=true;P.enforce=false;return null;}
  if(inflight)return inflight;
  const x=db(),id=uid();
  if(!x||!id)return null;

  inflight=(async()=>{
    try{
      const {data,error}=await x.rpc('v7077_progress_state');
      if(error)throw error;
      const r=one(data);
      apply(r,{paint});
      P.refreshes++;
      return r;
    }catch(e){
      P.lastError=String(e?.message||e);
      console.warn('[V7077] progress hydrate',e);
      return null;
    }finally{inflight=null}
  })();
  return inflight;
}

function schedule(ms=180,paint=true){
  P.scheduled++;
  clearTimeout(timer);
  timer=setTimeout(()=>void refresh({paint}),Math.max(60,Number(ms)||180));
}

/* Historical systems may still add XP/Gold/Harz locally for presentation.
   The backend save guards already reject those values. This late wrapper simply
   re-hydrates the canonical server balances immediately after persistence. */
try{
  const base=window.persist||((typeof persist==='function')?persist:null);
  if(typeof base==='function'&&!base.__v7077ProgressHydrate){
    const wrapped=function(){
      const result=base.apply(this,arguments);
      if(Date.now()-Number(P.lastSync||0)>30000)schedule(1200,false);
      return result;
    };
    wrapped.__v7077ProgressHydrate=true;
    window.persist=wrapped;
    try{persist=wrapped}catch(_){}
  }
}catch(e){console.warn('[V7077] persist wrapper',e)}

try{
  const bus=window.GL_EVENTS;
  if(bus&&typeof bus.on==='function'){
    ['questCompleted','dungeonWon','pvpWon','growHarvested','guildBossWon'].forEach(type=>{
      try{bus.on(type,()=>{if(Date.now()-Number(P.lastSync||0)>5000)schedule(900,true)})}catch(_){}
    });
  }
}catch(e){console.warn('[V7077] event hydrate',e)}

window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>{if(window.v7206StartupBusy?.())return;if(Date.now()-Number(P.lastSync||0)>5000)void refresh({paint:true})},420),{passive:true});
window.addEventListener('pageshow',()=>{if(Date.now()-P.lastSync>60000)setTimeout(()=>void refresh({paint:true}),850)},{passive:true});
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&Date.now()-P.lastSync>60000)setTimeout(()=>void refresh({paint:true}),320);
},{passive:true});
setInterval(()=>{
  if(document.hidden||!P.enforce||!uid()||Date.now()-P.lastSync<120000)return;
  const active=document.querySelector('main > section.active,.screen.active')?.id||'';
  if(active==='world'||active==='character'||active==='inventory')void refresh({paint:true});
},30000);
setTimeout(()=>{if(!P.lastSync&&!window.v7206StartupBusy?.())void refresh({paint:true})},2600);

window.v7077ProgressRefresh=(paint=true)=>refresh({paint:paint!==false});
window.v7077ProgressDiagnostics=()=>clone({version:VERSION,...P,uid:uid()});
})();
