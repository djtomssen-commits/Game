/* V8.315 – opt-in per-screen renderer/performance tracer.
   Dormant until the developer explicitly starts a trace in Systemtechnik.
   Never captures player names, user IDs, chat, purchases or state payloads. */
(()=>{
'use strict';
if(window.GL_PAGE_AUDIT)return;
const SCREENS=['world','character','grow','quests','dungeon','tower','caravan','endgame','shop','forge','harzDealer','bagDealer','pvp','guild','hall','friends','mail'];
const state={running:false,sweeping:false,startedAt:0,stoppedAt:0,channel:'',pages:{},log:[],slowTasks:0,shiftCount:0,stopReason:'',sweepDone:0};
let observer=null,perfObserver=null,ticker=0,raf=0,lastFrame=0,tracked=null,sweepCancelled=false,dock=null,watched=[];
const clock=()=>performance.now();
const active=()=>{
 const els=document.querySelectorAll('.screen.active,section.screen.active');
 for(const el of els)if(el.id&&!el.closest('#v8315PerfDock'))return el.id;
 return document.getElementById('world')?.classList.contains('active')?'world':'unknown';
};
function createPage(id){
 id=SCREENS.includes(id)?id:String(id||'unknown').slice(0,40);
 return state.pages[id]||(state.pages[id]={
   visits:0,observedMs:0,lastSeen:0,domNodesMin:Infinity,domNodesMax:0,
   added:0,removed:0,mutations:0,rootReplacements:0,currentReplacements:0,
   visibilityChanges:0,layoutShifts:0,longTasks:0,longestTaskMs:0,
   frames:0,jankFrames:0,maxFrameGapMs:0,frameGaps:[],renderMarks:{},
   navMeasuredMs:[],tabClicks:{},imageErrors:0
 });
}
let current='unknown',screenAt=0;
function log(kind,id,detail={}){
 if(state.log.length>=260)state.log.shift();
 state.log.push({elapsedMs:Math.round(clock()-state.startedAt),screen:id||current,kind,detail});
}
function switchScreen(id){
 const now=clock();
 if(current===id)return;
 if(state.running&&state.pages[current])state.pages[current].observedMs+=Math.max(0,now-screenAt);
 current=id;screenAt=now;lastFrame=0;
 const p=createPage(id);p.visits++;
 tracked=document.querySelector('#world .v366-lower');
 watchCritical();
 log('screen_open',id);
}
function isOwn(node){return node?.nodeType===1&&(node.id==='v8315PerfDock'||node.closest?.('#v8315PerfDock'))}
function summaryImageErrors(root){
 let count=0;
 for(const x of root?.querySelectorAll?.('img')||[]){
  if(x.complete&&x.naturalWidth===0)count++;
 }
 return count;
}
function observeChanges(records){
 if(!state.running)return;
 const p=createPage(current);
 let changed=false;
 for(const r of records){
  if(isOwn(r.target))continue;
  if(r.type!=='childList')continue;
  let added=0,removed=0;
  for(const n of r.addedNodes)if(n.nodeType===1&&!isOwn(n))added++;
  for(const n of r.removedNodes){
   if(n.nodeType!==1||isOwn(n))continue;
   removed++;
   const el=n;
   if(el.classList?.contains('screen'))p.rootReplacements++;
   if(el.id&&el.id===current)p.rootReplacements++;
   if(current==='world'&&tracked&&(el===tracked||el.contains?.(tracked))){
     p.currentReplacements++;
     log('aktuelles_dom_removed','world',{source:'childList',node:el.id||el.className?.toString().slice(0,60)||el.tagName});
     tracked=null;
   }
  }
  if(added||removed){p.added+=added;p.removed+=removed;changed=true}
 }
 if(changed){p.mutations+=records.length;}
 if(current==='world'&&!tracked)tracked=document.querySelector('#world .v366-lower');
}
function watchCritical(){
 for(const w of watched)w.disconnect();
 watched=[];
 if(!state.running)return;
 const candidates=current==='world'
  ? ['#world','.v366-lower','.v690-current-title','.v8310-cup-results-slot']
  : ['#'+CSS.escape(current)];
 for(const selector of candidates){
  const el=document.querySelector(selector);
  if(!el)continue;
  const mo=new MutationObserver(records=>{
   if(!state.running)return;
   const p=createPage(current);
   for(const rec of records){
    /* V8.317: a repeated assignment of hidden=true can itself produce an
       attribute record without any visual change. Count actual transitions
       so a trace can prove whether the Cup really flashes. */
    if(rec.attributeName==='hidden'){
      const wasHidden=rec.oldValue!==null;
      const isHidden=rec.target.hasAttribute('hidden');
      if(wasHidden===isHidden)continue;
      p.visibilityChanges++;
      log('visibility_attribute',current,{target:selector,attribute:'hidden',wasHidden,isHidden});
      continue;
    }
    if(rec.oldValue===rec.target.getAttribute(rec.attributeName))continue;
    p.visibilityChanges++;
    if(p.visibilityChanges<=4||p.visibilityChanges%8===0)
      log('visibility_attribute',current,{target:selector,attribute:rec.attributeName});
   }
  });
  mo.observe(el,{attributes:true,attributeOldValue:true,attributeFilter:['style','class','hidden']});
  watched.push(mo);
 }
}
function frame(now){
 if(!state.running)return;
 if(!document.hidden){
  if(lastFrame&&now-lastFrame<2000){
   const delta=now-lastFrame,p=createPage(current);
   p.frames++;
   if(delta>=50){p.jankFrames++;p.maxFrameGapMs=Math.max(p.maxFrameGapMs,Math.round(delta));}
   if(p.frameGaps.length<4000)p.frameGaps.push(Math.round(delta*10)/10);
  }
  lastFrame=now;
 }
 raf=requestAnimationFrame(frame);
}
function inspect(){
 if(!state.running)return;
 const id=active();
 if(id!==current)switchScreen(id);
 const p=createPage(current);
 const el=document.getElementById(current);
 if(el){
  const count=el.getElementsByTagName('*').length;
  p.domNodesMax=Math.max(p.domNodesMax,count);
  p.domNodesMin=Math.min(p.domNodesMin,count);
  p.imageErrors=Math.max(p.imageErrors,summaryImageErrors(el));
 }
 if(current==='world'&&!tracked)tracked=document.querySelector('#world .v366-lower');
}
function onNav(e){
 if(!state.running)return;
 const id=String(e?.detail?.id||'');
 if(id&&id!==current){switchScreen(id);inspect();}
}
function renderMark(screen,kind,details={}){
 if(!state.running)return;
 const id=String(screen||current);
 const p=createPage(id);
 const label=String(kind||'render').slice(0,40);
 p.renderMarks[label]=(p.renderMarks[label]||0)+1;
 if(label==='full'||label==='repair'||label==='cup_show'||label==='cup_hide')
   log('render_'+label,id,{owner:String(details.owner||'canonical').slice(0,50)});
}
function onError(e){
 if(!state.running)return;
 log('runtime_error',current,{kind:e?.type==='unhandledrejection'?'promise':'js'});
}
function onTabClick(e){
 if(!state.running||!(e.target instanceof Element))return;
 const el=e.target.closest('[data-tab],[role="tab"],[data-grow-tab],[data-subtab]');
 if(!el||isOwn(el))return;
 const raw=String(el.dataset.tab||el.dataset.growTab||el.dataset.subtab||el.id||'tab');
 /* Never export arbitrary user content or identifiers from element attributes. */
 const tab=/^[a-z0-9_-]{1,36}$/i.test(raw)?raw:'tab';
 const p=createPage(current);p.tabClicks[tab]=(p.tabClicks[tab]||0)+1;
 log('tab_click',current,{tab});
}
function setup(){
 document.addEventListener('visibilitychange',onVisibility,{passive:true});
 document.addEventListener('click',onTabClick,{capture:true,passive:true});
 window.addEventListener('growlegends:navigation-open-v7119',onNav,{passive:true});
 window.addEventListener('error',onError,{passive:true});
 window.addEventListener('unhandledrejection',onError,{passive:true});
 observer=new MutationObserver(observeChanges);
 observer.observe(document.querySelector('main')||document.body,{subtree:true,childList:true});
 if(typeof PerformanceObserver==='function'){
  try{
   perfObserver=new PerformanceObserver(items=>{
    for(const e of items.getEntries()){
     const p=createPage(current);
     if(e.entryType==='longtask'){
      p.longTasks++;state.slowTasks++;
      p.longestTaskMs=Math.max(p.longestTaskMs,Math.round(e.duration));
      if(e.duration>=120)log('longtask',current,{durationMs:Math.round(e.duration)});
     }else if(e.entryType==='layout-shift'&&!e.hadRecentInput){
      p.layoutShifts++;state.shiftCount++;
      if(e.value>=0.01)log('layout_shift',current,{score:Math.round(e.value*10000)/10000});
     }
    }
   });
   for(const type of ['longtask','layout-shift']){
    if(PerformanceObserver.supportedEntryTypes?.includes(type))
      perfObserver.observe({type,buffered:false});
   }
  }catch(_){}
 }
}
function onVisibility(){lastFrame=0;if(!document.hidden)watchCritical();}
function cleanup(){
 document.removeEventListener('visibilitychange',onVisibility);
 document.removeEventListener('click',onTabClick,true);
 window.removeEventListener('growlegends:navigation-open-v7119',onNav);
 window.removeEventListener('error',onError);
 window.removeEventListener('unhandledrejection',onError);
 observer?.disconnect();observer=null;
 perfObserver?.disconnect();perfObserver=null;
 for(const w of watched)w.disconnect();watched=[];
 clearInterval(ticker);ticker=0;
 cancelAnimationFrame(raf);raf=0;
 dock?.remove();dock=null;
}
function dockUI(){
 if(dock)return;
 dock=document.createElement('div');dock.id='v8315PerfDock';
 dock.setAttribute('style','position:fixed;left:8px;bottom:9px;z-index:2147483000;display:flex;gap:4px;align-items:center;background:#21180eea;border:1px solid #9e7a45;padding:5px;border-radius:8px;color:#fff;font:11px sans-serif;max-width:80vw');
 const label=document.createElement('span');label.textContent='PERF-MESSUNG';
 const btn=document.createElement('button');btn.textContent='STOP';
 btn.setAttribute('style','border:1px solid #ddaa77;border-radius:5px;padding:4px;color:white;background:#62331e');
 btn.onclick=()=>{stop('user');showResult();};
 dock.append(label,btn);document.body.appendChild(dock);
}
function start(){
 if(state.running)return false;
 state.running=true;state.sweeping=false;state.startedAt=clock();
 state.stoppedAt=0;state.pages={};state.log=[];state.slowTasks=0;state.shiftCount=0;state.sweepDone=0;state.stopReason='';
 state.channel=String(window.GROW_RELEASE_CHANNEL||'unknown');
 current='__init__';screenAt=state.startedAt;sweepCancelled=false;
 setup();switchScreen(active());dockUI();
 ticker=setInterval(inspect,350);
 raf=requestAnimationFrame(frame);
 return true;
}
function stop(reason='manual'){
 if(!state.running)return report();
 state.sweeping=false;sweepCancelled=true;state.stopReason=reason;
 const now=clock();createPage(current).observedMs+=Math.max(0,now-screenAt);
 state.stoppedAt=now;state.running=false;cleanup();
 return report();
}
function percentile(values,q){
 if(!values.length)return 0;
 const a=[...values].sort((x,y)=>x-y);
 return Math.round((a[Math.min(a.length-1,Math.floor(a.length*q))]||0)*10)/10;
}
function report(){
 const pages=Object.entries(state.pages).map(([screen,p])=>({
  screen,visits:p.visits,durationMs:Math.round(p.observedMs+(state.running&&screen===current?clock()-screenAt:0)),
  domNodesMin:Number.isFinite(p.domNodesMin)?p.domNodesMin:0,domNodesMax:p.domNodesMax,
  mutationRecords:p.mutations,added:p.added,removed:p.removed,rootReplacements:p.rootReplacements,
  aktuellesReplacements:p.currentReplacements,visibilityChanges:p.visibilityChanges,
  layoutShifts:p.layoutShifts,longTasks:p.longTasks,longestTaskMs:p.longestTaskMs,
  frameCount:p.frames,jankFrames:p.jankFrames,maxFrameGapMs:p.maxFrameGapMs,
  p95FrameGapMs:percentile(p.frameGaps,0.95),renderMarks:{...p.renderMarks},tabClicks:{...p.tabClicks},brokenImages:p.imageErrors
 })).filter(p=>p.visits>0&&SCREENS.includes(p.screen));
 return {version:'V8.315',mode:'opt-in-device',server:state.channel,
  running:state.running,sweeping:state.sweeping,elapsedMs:Math.round((state.stoppedAt||clock())-state.startedAt),
  pages,totalScreens:pages.length,slowTasks:state.slowTasks,layoutShiftEvents:state.shiftCount,
  sweepDone:state.sweepDone,stopReason:state.stopReason,events:state.log.slice(-220),
  note:'Only timing/DOM statistics, no player data; trace is opt-in and cannot prove server latency without network instrumentation.'};
}
function showResult(){
 const data=report();
 let el=document.getElementById('v8315PerfResults');
 if(!el){
  el=document.createElement('div');el.id='v8315PerfResults';
  el.style.cssText='position:fixed;inset:5%;z-index:2147483100;background:#211a14;color:#eee;border:2px solid #927449;border-radius:12px;padding:15px;display:flex;flex-direction:column;gap:7px';
  const title=document.createElement('b');title.textContent='Performance-Test: Ergebnis';
  const ta=document.createElement('textarea');ta.style.cssText='width:100%;flex:1;background:#171210;color:#eee;font:10px monospace';
  const row=document.createElement('div');row.style.cssText='display:flex;gap:8px';
  const copy=document.createElement('button');copy.textContent='Bericht kopieren';
  copy.onclick=()=>{ta.select();try{document.execCommand('copy')}catch(_){};try{navigator.clipboard?.writeText(ta.value)}catch(_){}};
  const download=document.createElement('button');download.textContent='JSON speichern';
  download.onclick=()=>{try{const a=document.createElement('a'),u=URL.createObjectURL(new Blob([ta.value],{type:'application/json'}));a.href=u;a.download='grow-legends-perf-v8315.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}catch(_){}};
  const close=document.createElement('button');close.textContent='Schließen';close.onclick=()=>el.remove();
  row.append(copy,download,close);el.append(title,ta,row);document.body.appendChild(el);
 }
 el.querySelector('textarea').value=JSON.stringify(data,null,2);
 return data;
}
async function sweep(options={}){
 if(!state.running)start();
 if(state.sweeping)return false;
 if(typeof window.v032Go!=='function')throw new Error('Navigation ist noch nicht geladen');
 const ids=Array.isArray(options.ids)?options.ids.filter(x=>SCREENS.includes(x)):SCREENS;
 const dwell=Math.max(150,Math.min(10000,Number(options.dwellMs)||2200));
 state.sweeping=true;sweepCancelled=false;
 const restore=active();
 for(const id of ids){
  if(sweepCancelled||!state.running)break;
  const t=clock();
  try{
   window.v032Go(id);
   log('sweep_route',id);
   await new Promise(resolve=>setTimeout(resolve,dwell));
   const p=createPage(id);p.navMeasuredMs.push(Math.round(clock()-t));
   if(active()!==id)log('route_inactive',id,{actual:active()});
   else state.sweepDone++;
  }catch(_){log('route_error',id);}
 }
 if(!sweepCancelled&&state.running&&SCREENS.includes(restore)){
  try{window.v032Go(restore)}catch(_){}
 }
 state.sweeping=false;
 if(state.running)stop('sweep_complete');
 showResult();
 return report();
}
window.GL_PAGE_AUDIT=Object.freeze({start,stop,report,showResult,sweep,
  renderMark,screenIds:()=>[...SCREENS]});
})();
