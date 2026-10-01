(()=>{
'use strict';
if(window.__GL_RUNTIME_WATCHDOG__)return;
const VERSION=String(window.GROW_LEGENDS_VERSION?.short||'V7.127');
const currentBuild=()=>String(window.GROW_LEGENDS_VERSION?.short||window.__GROW_LEGENDS_RELEASE__||VERSION);
const state={
  version:VERSION,seq:0,actions:new Map(),recent:[],lastReportAt:{},
  longTasks:[],errors:[],startedAt:Date.now()
};
const now=()=>{try{return performance.now()}catch(_){return Date.now()}};
const wall=()=>Date.now();
const currentScreen=()=>{
  try{
    const ids=['world','character','inventory','shop','grow','quests','dungeon','tower','pvp','guild','mail','friends','hall','harzforge','settings'];
    for(const id of ids)if(document.getElementById(id)?.classList?.contains('active'))return id;
    return document.querySelector('main > section.active,.screen.active')?.id||'unknown';
  }catch(_){return'unknown'}
};
const safe=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return {value:String(v)}}};
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const authed=()=>{try{return !!db()&&typeof v073User!=='undefined'&&v073User?.id&&!v073User?.is_anonymous}catch(_){return false}};
function remember(x){
  state.recent.push(x);
  if(state.recent.length>80)state.recent.splice(0,state.recent.length-80);
}
async function report(kind,severity='warn',details={},opt={}){
  kind=String(kind||'runtime_issue').slice(0,80);
  const screen=String(opt.screen||currentScreen()||'unknown').slice(0,40);
  const incidentKey=String(opt.incidentKey||details?.rpc||details?.action||'').slice(0,120);
  const key=`${kind}|${screen}|${incidentKey}`;
  const t=wall(),last=Number(state.lastReportAt[key])||0;
  if(t-last<45000)return {ok:true,deduped:true,local:true};
  state.lastReportAt[key]=t;
  const payload={
    at:t,kind,severity,screen,incidentKey,
    details:safe(details),
    metrics:{
      domNodes:document.getElementsByTagName('*').length,
      visibility:document.visibilityState,
      actionCount:state.actions.size,
      longTaskMax:state.longTasks.reduce((m,x)=>Math.max(m,Number(x.duration)||0),0)
    }
  };
  remember(payload);
  if(!authed())return {ok:false,queued:true};
  try{
    const {data,error}=await db().rpc('v7092_report_runtime_incident',{
      p_client_version:currentBuild(),
      p_kind:kind,
      p_screen:screen,
      p_severity:String(severity||'warn'),
      p_incident_key:incidentKey||null,
      p_details:payload.details,
      p_metrics:payload.metrics
    });
    if(error)throw error;
    return Array.isArray(data)?data[0]:data;
  }catch(e){
    console.warn('[V7092 watchdog report]',e);
    return {ok:false,error:String(e?.message||e)};
  }
}
function begin(name,meta={},opt={}){
  const id=++state.seq,start=now();
  const rec={
    id,name:String(name||'action'),meta:safe(meta),screen:String(meta?.screen||currentScreen()),
    start,startedAt:wall(),phase:'start',phaseAt:start,slow:false,stalled:false,
    slowMs:Math.max(500,Number(opt?.slowMs)||1500),
    stallMs:Math.max(1500,Number(opt?.stallMs)||6000)
  };
  state.actions.set(id,rec);
  const slowTimer=setTimeout(()=>{
    const r=state.actions.get(id);if(!r)return;r.slow=true;
    void report('slow_action','warn',{
      action:r.name,elapsedMs:Math.round(now()-r.start),phase:r.phase,meta:r.meta
    },{screen:r.screen,incidentKey:r.name});
  },rec.slowMs);
  const stallTimer=setTimeout(()=>{
    const r=state.actions.get(id);if(!r)return;r.stalled=true;
    void report('stalled_action','error',{
      action:r.name,elapsedMs:Math.round(now()-r.start),phase:r.phase,meta:r.meta
    },{screen:r.screen,incidentKey:r.name});
  },rec.stallMs);
  function finish(ok,extra={}){
    const r=state.actions.get(id);if(!r)return;
    clearTimeout(slowTimer);clearTimeout(stallTimer);
    const elapsed=Math.round(now()-r.start);
    state.actions.delete(id);
    remember({at:wall(),kind:'action',action:r.name,ok,elapsedMs:elapsed,phase:r.phase,screen:r.screen,extra:safe(extra)});
    if(elapsed>r.slowMs*1.5)void report('slow_action_complete','warn',{
      action:r.name,elapsedMs:elapsed,phase:r.phase,ok,extra:safe(extra)
    },{screen:r.screen,incidentKey:r.name});
  }
  return{
    id,
    phase(p,extra={}){const r=state.actions.get(id);if(!r)return;r.phase=String(p||'');r.phaseAt=now();r.phaseExtra=safe(extra)},
    end(extra={}){finish(true,extra)},
    fail(e){finish(false,{error:String(e?.message||e)})}
  };
}
try{
  window.addEventListener('error',e=>{
    const msg=String(e?.message||'JavaScript error');
    state.errors.push({at:wall(),msg,src:String(e?.filename||''),line:Number(e?.lineno)||0});
    if(state.errors.length>30)state.errors.shift();
    void report('javascript_error','error',{message:msg,source:String(e?.filename||''),line:Number(e?.lineno)||0},{incidentKey:msg.slice(0,80)});
  });
  window.addEventListener('unhandledrejection',e=>{
    const msg=String(e?.reason?.message||e?.reason||'Unhandled promise rejection');
    state.errors.push({at:wall(),msg});
    if(state.errors.length>30)state.errors.shift();
    void report('unhandled_rejection','error',{message:msg},{incidentKey:msg.slice(0,80)});
  });
}catch(_){}
try{
  if(typeof PerformanceObserver==='function'){
    const po=new PerformanceObserver(list=>{
      for(const x of list.getEntries()){
        const d=Math.round(Number(x.duration)||0);
        if(d<350)continue;
        state.longTasks.push({at:wall(),duration:d,screen:currentScreen()});
        if(state.longTasks.length>40)state.longTasks.shift();
        if(d>=700)void report('long_main_thread_task','warn',{durationMs:d},{incidentKey:currentScreen()});
      }
    });
    po.observe({entryTypes:['longtask']});
  }
}catch(_){}

/* Detect orphaned combat UIs even if a specific bridge throws before it can
   finish its own action timer. */
const combatSeen=new WeakMap();
setInterval(()=>{
  try{
    const d=document.getElementById('v7051FightBtn');
    if(d?.disabled&&/KAMPF/i.test(d.textContent||'')){
      let t=combatSeen.get(d);if(!t){t=wall();combatSeen.set(d,t)}
      if(wall()-t>7000)void report('dungeon_ui_stuck','error',{text:String(d.textContent||''),disabled:true},{screen:'dungeon',incidentKey:'fight-button'});
    }else if(d)combatSeen.delete(d);

    const active=document.getElementById('tower')?.classList.contains('active');
    const log=document.getElementById('vTBattleLog');
    if(active&&log&&/kampf beginnt/i.test(String(log.textContent||''))){
      let t=combatSeen.get(log);if(!t){t=wall();combatSeen.set(log,t)}
      if(wall()-t>7000)void report('tower_ui_stuck','error',{text:String(log.textContent||'')},{screen:'tower',incidentKey:'battle-log'});
    }else if(log)combatSeen.delete(log);
  }catch(_){}
},2000);

async function selfCheck(){
  try{
    const duplicates=[];
    const seen=new Set();
    for(const el of document.querySelectorAll('[id]')){
      if(seen.has(el.id))duplicates.push(el.id);else seen.add(el.id);
      if(duplicates.length>=20)break;
    }
    if(duplicates.length)await report('duplicate_dom_ids','warn',{ids:duplicates},{incidentKey:duplicates.slice(0,4).join(',')});
    const dd=window.v7051DungeonAuthorityDiagnostics?.();
    if(dd?.lastError)await report('dungeon_bridge_error','warn',{lastError:dd.lastError},{screen:'dungeon',incidentKey:'bridge'});
    const gd=window.v7065GrowAuthorityDiagnostics?.();
    if(gd?.lastError)await report('grow_bridge_error','warn',{lastError:gd.lastError},{screen:'grow',incidentKey:'bridge'});
  }catch(e){console.warn('[V7092 selfcheck]',e)}
}
window.__GL_RUNTIME_WATCHDOG__=Object.freeze({
  version:VERSION,begin,report,selfCheck,
  diagnostics:()=>safe({
    version:currentBuild(),startedAt:state.startedAt,
    active:[...state.actions.values()].map(x=>({...x,elapsedMs:Math.round(now()-x.start)})),
    recent:state.recent.slice(-40),longTasks:state.longTasks.slice(-20),errors:state.errors.slice(-20)
  })
});
window.v7092RuntimeDiagnostics=()=>window.__GL_RUNTIME_WATCHDOG__.diagnostics();
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>void selfCheck(),1200),{passive:true});
window.addEventListener('pageshow',()=>setTimeout(()=>void selfCheck(),2200),{passive:true});
setTimeout(()=>void selfCheck(),5500);
})();
