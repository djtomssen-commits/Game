/* V8.315 – opt-in per-screen renderer/performance tracer.
   Dormant until the developer explicitly starts a trace in Systemtechnik.
   Never captures player names, user IDs, chat, purchases or state payloads. */
(()=>{
'use strict';
if(window.GL_PAGE_AUDIT)return;
const SCREENS=['world','character','grow','quests','dungeon','tower','caravan','endgame','shop','forge','harzDealer','bagDealer','pvp','guild','hall','friends','mail'];
/* V8.361: navigable secondary pages are not counted as extra primary routes. */
const LINKED_SCREENS=['goldShop'];
const EXPECTED_TAB_ROUTES={'harzDealer:gold':'goldShop'};
const betaAudit=()=>String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta';
/* V8.363: additional diagnostic modes are explicitly opt-in on Beta.
   No request bodies, query strings, headers, cookies, IDs or response data
   are read or stored. All instrumentation is cleaned up at STOP. */
const qaState={extended:false,requests:[],rpcStats:{},networkErrors:0,slowRequests:0,layoutChecks:0,visualChecks:0,findings:[],coverage:[]};
let originalFetch=null,wrappedFetch=null,xhrOpen=null,xhrSend=null,wrappedXhrOpen=null,wrappedXhrSend=null;
const state={running:false,sweeping:false,startedAt:0,stoppedAt:0,channel:'',pages:{},log:[],slowTasks:0,shiftCount:0,stopReason:'',sweepDone:0,tabResults:[],tabSkipped:[],tabSweepDone:0,tabSweepDiscovered:0,tabSweepLimited:false};
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
   navMeasuredMs:[],tabClicks:{},imageErrors:0,brokenImageHints:[],mutationTargets:{},layoutShiftTargets:{},mutationTypes:{records:0,textOnly:0,identicalText:0,elementChanged:0,elementAdded:0,elementRemoved:0,owners:{}}
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
/* V8.362 Beta: only currently visible broken images count as visual defects;
   invisible placeholder images remain discoverable in brokenImageHints. */
function summaryImageErrors(root){
 let count=0;
 for(const x of root?.querySelectorAll?.('img')||[]){
  if(x.complete&&x.naturalWidth===0&&(!betaAudit()||(x.getClientRects?.().length&&getComputedStyle(x).visibility!=='hidden')))count++;
 }
 return count;
}
/* V8.361: no account/player names or full external image URLs in reports.
   Local asset paths are safe to report; third-party URLs are only categorized. */
function brokenImageHints(root){
 const out=[];
 for(const img of root?.querySelectorAll?.('img')||[]){
  if(!(img.complete&&img.naturalWidth===0))continue;
  let source='missing-or-invalid-src';
  try{
   const raw=img.getAttribute('src')||'';
   if(raw){
    const url=new URL(raw,location.href);
    source=url.origin===location.origin&&url.pathname.startsWith('/assets/')
      ?url.pathname.slice(0,150)
      :url.origin===location.origin?'local-nonasset':'external-image';
   }
  }catch(_){}
  const visible=!!img.getClientRects?.().length;
  if(!out.some(x=>x.source===source&&x.visible===visible))out.push({source,visible});
  if(out.length>=6)break;
 }
 return out;
}
function relevantMutation(r,root){
 if(!root||isOwn(r.target))return false;
 if(r.target===root||root.contains(r.target))return true;
 /* Includes direct replacement of the active root by another owner. */
 return [...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&(n===root||n.contains?.(root)));
}
/* V8.362: sanitize DOM component names. Never log text, URLs or player IDs.
   Only constant vNNNN-namespace owners and generic fallback category. */
function safeDomOwner(node,root){
 for(let el=node?.nodeType===1?node:node?.parentElement;el&&el!==root;el=el.parentElement){
  if(el.id&&/^v[0-9]{2,5}[A-Za-z][A-Za-z0-9_-]{0,36}$/.test(el.id))return '#'+el.id;
  const cls=[...(el.classList||[])].find(c=>/^v[0-9]{2,5}-[A-Za-z][A-Za-z0-9_-]{0,36}$/.test(c));
  if(cls)return '.'+cls;
 }
 return 'screen-unclassified';
}
function incrementTarget(targets,key,n=1){
 if(Object.prototype.hasOwnProperty.call(targets,key)||Object.keys(targets).length<45)
  targets[key]=(targets[key]||0)+n;
}
function topTargets(targets,max=6){
 return Object.entries(targets).sort((a,b)=>b[1]-a[1]).slice(0,max).map(([component,records])=>({component,records}));
}
function deltaTargets(after,before,max=5){
 const entries=Object.entries(after).map(([component,n])=>({component,records:n-(before[component]||0)})).filter(e=>e.records>0);
 return entries.sort((a,b)=>b.records-a.records).slice(0,max);
}
function observeChanges(records){
 if(!state.running)return;
 const p=createPage(current),root=document.getElementById(current);
 let relevant=0;
 for(const r of records){
  if(r.type!=='childList')continue;
  /* V8.361 Beta: do NOT charge inactive pages' DOM work to the visible
     Forge/Dealer/Guild. Preserve old recorder semantics on Server1. */
  if(betaAudit()&&!relevantMutation(r,root))continue;
  if(isOwn(r.target))continue;
  relevant++;
  if(betaAudit())incrementTarget(p.mutationTargets,safeDomOwner(r.target,root));
  /* V8.370: opt-in, read-only provenance for the Character/Harz Dealer
     childList spikes. Never export the text itself or any player data.
     Record whether a writer replaced a text node by the exact same text,
     or actually inserted/removed HTML elements. */
  if(betaAudit()&&qaState.extended&&['character','harzDealer','forge'].includes(current)){
   const d=p.mutationTypes,owner=safeDomOwner(r.target,root);
   const a=[...r.addedNodes],b=[...r.removedNodes];
   const isTextOnly=a.concat(b).length>0&&a.concat(b).every(n=>n.nodeType===3);
   const identicalText=a.length===1&&b.length===1&&a[0].nodeType===3&&
    b[0].nodeType===3&&a[0].nodeValue===b[0].nodeValue;
   const aEl=a.filter(n=>n.nodeType===1).length,bEl=b.filter(n=>n.nodeType===1).length;
   const inc=(t)=>{
    t.records++;
    if(isTextOnly)t.textOnly++;
    if(identicalText)t.identicalText++;
    if(aEl||bEl)t.elementChanged++;
    t.elementAdded+=aEl;t.elementRemoved+=bEl;
   };
   inc(d);
   if(d.owners[owner]||Object.keys(d.owners).length<35){
    if(!d.owners[owner])d.owners[owner]={records:0,textOnly:0,identicalText:0,elementChanged:0,elementAdded:0,elementRemoved:0};
    inc(d.owners[owner]);
   }
  }
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
  if(added||removed){p.added+=added;p.removed+=removed}
 }
 /* Beta records reflect only childList mutations within the current screen;
    earlier versions used the entire global batch size instead. */
 if(betaAudit())p.mutations+=relevant;
 else if(relevant&&records.some(x=>x.addedNodes.length||x.removedNodes.length))p.mutations+=records.length;
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
  if(betaAudit())p.brokenImageHints=brokenImageHints(el);
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
 const el=e.target.closest('button');
 if(!el||isOwn(el))return;
 const target=semanticTab(el);
 if(!target)return;
 /* Only static, semantic tab IDs; no account or player content. */
 const tab=target.tab;
 const p=createPage(current);p.tabClicks[tab]=(p.tabClicks[tab]||0)+1;
 log('tab_click',current,{tab});
}
/* Passive scope-limited network tracing. This wraps only while the opt-in
   QA sweep runs and returns the untouched original response/promise. */
function endpointLabel(input){
 let raw='';
 try{raw=typeof input==='string'?input:input?.url||''}catch(_){}
 try{
  const base=/^https?:$/.test(location.protocol)?location.href:'https://qa.invalid/';
  const u=new URL(raw,base),p=u.pathname;
  if(p.includes('/rest/v1/'))return 'REST '+(p.split('/').filter(Boolean).pop()||'resource').replace(/[^a-z0-9_-]/gi,'').slice(0,45);
  if(p.includes('/rpc/'))return 'RPC '+(p.split('/').filter(Boolean).pop()||'procedure').replace(/[^a-z0-9_-]/gi,'').slice(0,55);
  if(p.includes('/auth/v1'))return 'AUTH';
  if(p.includes('/storage/v1'))return 'STORAGE';
  return u.origin===location.origin?'LOCAL':'EXTERNAL';
 }catch(_){return 'UNKNOWN'}
}
function recordNetwork(label,ms,status,failed,screen){
 if(!state.running||!qaState.extended)return;
 const key=label.slice(0,65),v=Math.max(0,Math.round(ms));
 const entry={screen:SCREENS.includes(screen)||LINKED_SCREENS.includes(screen)?screen:'other',
   endpoint:key,durationMs:v,status:Number.isFinite(status)?status:0,failed:!!failed};
 qaState.requests.push(entry);
 if(qaState.requests.length>220)qaState.requests.shift();
 const st=qaState.rpcStats[key]||(qaState.rpcStats[key]={calls:0,failures:0,slow:0,longestMs:0});
 st.calls++;st.longestMs=Math.max(st.longestMs,v);
 if(failed||status>=400){st.failures++;qaState.networkErrors++}
 if(v>=1200){st.slow++;qaState.slowRequests++}
 if(failed||status>=500)log('network_problem',screen,{endpoint:key,status:status||0,durationMs:v});
}
function setupNetwork(){
 if(!qaState.extended||!betaAudit())return;
 const f=window.fetch;
 if(typeof f==='function'){
  originalFetch=f;
  wrappedFetch=function(input,init){
   const begin=clock(),label=endpointLabel(input),screen=active();
   let promise;
   try{promise=Reflect.apply(f,this,arguments)}catch(e){recordNetwork(label,clock()-begin,0,true,screen);throw e}
   return Promise.resolve(promise).then(
    response=>{recordNetwork(label,clock()-begin,Number(response?.status)||0,false,screen);return response},
    error=>{recordNetwork(label,clock()-begin,0,true,screen);throw error}
   );
  };
  window.fetch=wrappedFetch;
 }
 try{
  const p=window.XMLHttpRequest?.prototype;
  if(p?.open&&p?.send){
   xhrOpen=p.open;xhrSend=p.send;
   const xhrInfo=new WeakMap();
   wrappedXhrOpen=function(method,url){
    xhrInfo.set(this,{endpoint:endpointLabel(url)});
    return Reflect.apply(xhrOpen,this,arguments);
   };
   wrappedXhrSend=function(){
    const item=xhrInfo.get(this)||{endpoint:'XHR'},begin=clock(),screen=active();
    let done=false;
    const complete=()=>{
     if(done)return;done=true;
     this.removeEventListener('loadend',complete);
     recordNetwork(item.endpoint,clock()-begin,Number(this.status)||0,Number(this.status)===0,screen);
    };
    this.addEventListener('loadend',complete);
    try{return Reflect.apply(xhrSend,this,arguments)}
    catch(e){complete();throw e}
   };
   p.open=wrappedXhrOpen;p.send=wrappedXhrSend;
  }
 }catch(_){/* JS fetch still collected if XHR cannot be patched */}
}
function teardownNetwork(){
 if(originalFetch&&window.fetch===wrappedFetch)window.fetch=originalFetch;
 originalFetch=null;wrappedFetch=null;
 try{
  const p=window.XMLHttpRequest?.prototype;
  if(xhrOpen&&p?.open===wrappedXhrOpen)p.open=xhrOpen;
  if(xhrSend&&p?.send===wrappedXhrSend)p.send=xhrSend;
 }catch(_){}
 xhrOpen=null;xhrSend=null;wrappedXhrOpen=null;wrappedXhrSend=null;
}
function rectSignature(root){
 if(!qaState.extended||!root)return [];
 const elements=[...root.querySelectorAll('button,[role="tab"],.v480-auto-btn,.v667-tab,.v8010-dealer-tabs')].slice(0,80);
 return elements.filter(el=>el.isConnected&&el.getClientRects().length>0).slice(0,32)
  .map((el,i)=>{
    const r=el.getBoundingClientRect(),style=getComputedStyle(el);
    /* V8.364 Beta: normalize viewport and inner-panel scroll so an
       ordinary scroll does not become '17 moving buttons' with zero
       DOM or layout changes. True CSS transform/layout motion remains. */
    let x=r.x+(window.scrollX||0),y=r.y+(window.scrollY||0);
    if(betaAudit())for(let parent=el.parentElement;parent;parent=parent.parentElement){
      x+=parent.scrollLeft||0;y+=parent.scrollTop||0;
      if(parent===root)break;
    }
    return {k:safeDomOwner(el,root)+':'+i,
     x:Math.round(x),y:Math.round(y),w:Math.round(r.width),h:Math.round(r.height),
     display:style.display,opacity:Math.round(Number(style.opacity||1)*100)};
  });
}
function visualDelta(a,b){
 const lookup=new Map(a.map(x=>[x.k,x]));
 let moved=0,appeared=0,vanished=0,opacityChanged=0;
 for(const next of b){
  const old=lookup.get(next.k);
  if(!old){appeared++;continue}
  lookup.delete(next.k);
  if(Math.abs(next.x-old.x)>5||Math.abs(next.y-old.y)>5||
    Math.abs(next.w-old.w)>5||Math.abs(next.h-old.h)>5)moved++;
  if(Math.abs(next.opacity-old.opacity)>15||next.display!==old.display)opacityChanged++;
 }
 vanished=lookup.size;
 return {moved,appeared,vanished,opacityChanged};
}
function layoutSample(root){
 const info={clipped:0,overflow:0,examples:[]};
 if(!qaState.extended||!root)return info;
 qaState.layoutChecks++;
 const viewW=document.documentElement.clientWidth||window.innerWidth||390;
 const candidates=[root,...root.querySelectorAll('button,[role="tab"],.v667-tabs,.v254-tabs,.v514HeroTabs,.v8010-dealer-tabs,.v8184HallTabs')];
 for(const el of candidates.slice(0,120)){
  if(!el.isConnected||!el.getClientRects().length)continue;
  const css=getComputedStyle(el),r=el.getBoundingClientRect();
  if(css.visibility==='hidden'||css.display==='none')continue;
  let kind='';
  if((el===root||/tabs|tablist/.test(String(el.className)))&&el.clientWidth>0&&
     el.scrollWidth>el.clientWidth+10&&css.overflowX!=='auto'&&css.overflowX!=='scroll')kind='horizontal_overflow';
  if(el.tagName==='BUTTON'&&r.width>10&&r.left<viewW&&r.right>0&&
     (r.left< -8||r.right>viewW+8)&&css.position!=='fixed')kind='clipped_button';
  if(!kind)continue;
  if(kind==='horizontal_overflow')info.overflow++;else info.clipped++;
  if(info.examples.length<4)info.examples.push({component:safeDomOwner(el,root),kind});
 }
 return info;
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
      if(betaAudit())for(const source of e.sources||[]){
       const root=document.getElementById(current);
       if(source.node&&root?.contains(source.node))incrementTarget(p.layoutShiftTargets,safeDomOwner(source.node,root));
      }
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
 teardownNetwork();
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
 state.stoppedAt=0;state.pages={};state.log=[];state.slowTasks=0;state.shiftCount=0;state.sweepDone=0;state.stopReason='';state.tabResults=[];state.tabSkipped=[];state.tabSweepDone=0;state.tabSweepDiscovered=0;state.tabSweepLimited=false;
 state.channel=String(window.GROW_RELEASE_CHANNEL||'unknown');
 qaState.extended=false;qaState.requests=[];qaState.rpcStats={};qaState.networkErrors=0;qaState.slowRequests=0;
 qaState.layoutChecks=0;qaState.visualChecks=0;qaState.findings=[];qaState.coverage=[];
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
/* The QA center ranks observed failures without claiming that expected
   tab-content rebuilds, transitions or hidden image placeholders are bugs. */
function consistencySnapshot(){
 if(!qaState.extended)return {available:false};
 try{
  const r=window.v8330DataConsistencyReport?.();
  if(!r)return {available:false};
  return {available:true,observations:Number(r.observations)||0,checks:Number(r.checks)||0,
    suspectedIssues:Array.isArray(r.issues)?r.issues.length:0,accountSwitches:Number(r.accountSwitches)||0,
    note:'Passive confirmed server-response comparison only; no extra RPC or full balance verification'};
 }catch(_){return {available:false}}
}
function rankedFindings(pages){
 const findings=[];
 const cons=consistencySnapshot();
 const add=(severity,screen,tab,code,detail={})=>{
  if(findings.length<95)findings.push({severity,screen,tab:tab||null,code,...detail});
 };
 for(const p of pages){
  if(p.brokenImages>0)add('medium',p.screen,null,'visible_broken_images',{count:p.brokenImages});
  if(p.longestTaskMs>=250)add('medium',p.screen,null,'slow_main_thread',{longestMs:p.longestTaskMs});
  if(p.rootReplacements>0)add('high',p.screen,null,'page_root_replaced',{count:p.rootReplacements});
 }
 for(const t of state.tabResults){
  if(t.status==='unexpected_navigation'||t.status==='click_error')add('high',t.screen,t.tab,t.status);
  if(t.javascriptErrors)add('high',t.screen,t.tab,'javascript_error',{count:t.javascriptErrors});
  if(t.idleMutationRecords>=120)add('medium',t.screen,t.tab,'idle_dom_churn',
   {records:t.idleMutationRecords,owner:t.idleMutationHotspots?.[0]?.component||'unclassified'});
  if(t.idleVisualDelta&&(t.idleVisualDelta.moved+t.idleVisualDelta.opacityChanged>=2))
   add('medium',t.screen,t.tab,'idle_control_geometry_changed',{detail:t.idleVisualDelta});
  if(t.layoutAudit?.clipped)add('medium',t.screen,t.tab,'clipped_controls',{count:t.layoutAudit.clipped});
  if(t.layoutAudit?.overflow)add('low',t.screen,t.tab,'horizontal_overflow',{count:t.layoutAudit.overflow});
 }
 for(const [endpoint,st]of Object.entries(qaState.rpcStats)){
  if(st.failures)add('high','network',null,'rpc_http_failures',{endpoint,count:st.failures,requests:st.calls});
  else if(st.slow>=3)add('low','network',null,'repeated_slow_rpc',{endpoint,count:st.slow,maxMs:st.longestMs});
 }
 if(state.sweeping===false&&state.stopReason==='sweep_complete'){
  const present=new Set(pages.map(p=>p.screen));
  for(const id of SCREENS)if(!present.has(id))add('high',id,null,'screen_not_observed');
 }
 if(state.tabSweepLimited)add('medium','audit',null,'tab_coverage_limit');
 if(cons.available&&cons.suspectedIssues>0)add('high','consistency',null,'suspected_server_ui_mismatch',{count:cons.suspectedIssues});
 if(!cons.available)add('low','consistency',null,'server_comparison_not_available');
 findings.sort((a,b)=>({critical:0,high:1,medium:2,low:3}[a.severity]||4)-({critical:0,high:1,medium:2,low:3}[b.severity]||4));
 return findings;
}
function report(){
 const pages=Object.entries(state.pages).map(([screen,p])=>({
  screen,visits:p.visits,durationMs:Math.round(p.observedMs+(state.running&&screen===current?clock()-screenAt:0)),
  domNodesMin:Number.isFinite(p.domNodesMin)?p.domNodesMin:0,domNodesMax:p.domNodesMax,
  mutationRecords:p.mutations,added:p.added,removed:p.removed,rootReplacements:p.rootReplacements,
  aktuellesReplacements:p.currentReplacements,visibilityChanges:p.visibilityChanges,
  layoutShifts:p.layoutShifts,longTasks:p.longTasks,longestTaskMs:p.longestTaskMs,
  frameCount:p.frames,jankFrames:p.jankFrames,maxFrameGapMs:p.maxFrameGapMs,
  p95FrameGapMs:percentile(p.frameGaps,0.95),renderMarks:{...p.renderMarks},tabClicks:{...p.tabClicks},brokenImages:p.imageErrors,
  ...(betaAudit()?{brokenImageHints:p.brokenImageHints||[],mutationHotspots:topTargets(p.mutationTargets),layoutShiftHotspots:topTargets(p.layoutShiftTargets)}:{} )
 })).filter(p=>p.visits>0&&(SCREENS.includes(p.screen)||(betaAudit()&&LINKED_SCREENS.includes(p.screen))));
 const findings=qaState.extended?rankedFindings(pages):[];
 const counts={high:0,medium:0,low:0};
 for(const f of findings)if(counts[f.severity]!==undefined)counts[f.severity]++;
 return {version:betaAudit()?'V8.370':'V8.360',mode:'opt-in-device',server:state.channel,
  running:state.running,sweeping:state.sweeping,elapsedMs:Math.round((state.stoppedAt||clock())-state.startedAt),
  pages,totalScreens:pages.length,primaryScreens:pages.filter(p=>SCREENS.includes(p.screen)).length,
  linkedScreens:pages.filter(p=>LINKED_SCREENS.includes(p.screen)).map(p=>p.screen),slowTasks:state.slowTasks,layoutShiftEvents:state.shiftCount,
  sweepDone:state.sweepDone,stopReason:state.stopReason,tabSweepDone:state.tabSweepDone,tabSweepDiscovered:state.tabSweepDiscovered,tabSweepLimited:state.tabSweepLimited,tabResults:state.tabResults,tabSkipped:state.tabSkipped,events:state.log.slice(-220),
  ...(qaState.extended?{qaCenter:{
    mode:'safe-readonly-diagnostics',network:{requests:qaState.requests.length,errors:qaState.networkErrors,slow:qaState.slowRequests,
      endpoints:Object.entries(qaState.rpcStats).sort((a,b)=>b[1].failures-a[1].failures||b[1].calls-a[1].calls).slice(0,35).map(([endpoint,value])=>({endpoint,...value}))},
    layoutChecks:qaState.layoutChecks,visualChecks:qaState.visualChecks,consistency:consistencySnapshot(),
    growRenderer:(()=>{try{return window.__V8365_GROW_RENDER_QA__?.()||null}catch(_){return null}})(),
    forgeShell:(()=>{try{return window.__V8367_FORGE_QA__?.()||null}catch(_){return null}})(),
    itemFx:(()=>{try{return window.__V8368_ITEM_FX_QA__?.()||null}catch(_){return null}})(),
    itemCompare:(()=>{try{return window.__V8369_COMPARE_QA__?.()||null}catch(_){return null}})(),
    mutationDetail:(()=>{const out={};
      for(const screen of ['character','harzDealer','forge']){
       const d=state.pages[screen]?.mutationTypes;if(!d)continue;
       const {owners,...totals}=d;
       out[screen]={...totals,hotspots:Object.entries(owners)
        .sort((a,b)=>b[1].records-a[1].records).slice(0,12)
        .map(([component,counts])=>({component,...counts}))};
      }
      return out;
    })(),
    renderOwners:{
      vip:(()=>{try{return window.__V8366_VIP_RENDER_QA__?.()||null}catch(_){return null}})(),
      frames:(()=>{try{return window.__V8366_FRAME_RENDER_QA__?.()||null}catch(_){return null}})()
    },
    findings,counts,coverage:{primaryScreens:pages.filter(p=>SCREENS.includes(p.screen)).length,totalPrimary:SCREENS.length,
      tabs:state.tabSweepDone,discoveredTabs:state.tabSweepDiscovered,skippedTabs:state.tabSkipped.length},
    limitations:['No screenshot/GPU pixel diff','No server-side reward integrity write test','No real purchase or battle mutation','No guarantee of catching intermittent bugs']
  }}:{}),
  note:'Safe beta QA center: page/tab transitions, passive HTTP/RPC, DOM/layout/button geometry, ranked findings; cannot prove full gameplay, real purchases, pixel-level GPU flicker or server persistence.'};
}
function showResult(){
 const data=report();
 let el=document.getElementById('v8315PerfResults');
 if(!el){
  el=document.createElement('div');el.id='v8315PerfResults';
  el.style.cssText='position:fixed;inset:5%;z-index:2147483100;background:#211a14;color:#eee;border:2px solid #927449;border-radius:12px;padding:15px;display:flex;flex-direction:column;gap:7px';
  const title=document.createElement('b');title.textContent='Performance-Test: Ergebnis';
  const summary=document.createElement('div');summary.id='v8315ResultSummary';summary.style.cssText='font:12px sans-serif;color:#e7d6b3;white-space:normal';
  const ta=document.createElement('textarea');ta.style.cssText='width:100%;flex:1;background:#171210;color:#eee;font:10px monospace';
  const row=document.createElement('div');row.style.cssText='display:flex;gap:8px';
  const copy=document.createElement('button');copy.textContent='Bericht kopieren';
  copy.onclick=()=>{ta.select();try{document.execCommand('copy')}catch(_){};try{navigator.clipboard?.writeText(ta.value)}catch(_){}};
  const download=document.createElement('button');download.textContent='JSON speichern';
  download.onclick=()=>{try{const a=document.createElement('a'),u=URL.createObjectURL(new Blob([ta.value],{type:'application/json'}));a.href=u;a.download='grow-legends-perf-v8315.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}catch(_){}};
  const close=document.createElement('button');close.textContent='Schließen';close.onclick=()=>el.remove();
  row.append(copy,download,close);el.append(title,summary,ta,row);document.body.appendChild(el);
 }
 const flagged=(data.tabResults||[]).filter(t=>t.warnings?.length);
 const summary=el.querySelector('#v8315ResultSummary');
 if(summary)summary.textContent='Hauptseiten '+data.sweepDone+'/'+SCREENS.length+
   ' · Tabs geprüft '+(data.tabSweepDone||0)+'/'+(data.tabSweepDiscovered||0)+
   ' · Auffällige Tabs '+flagged.length+' · übersprungene Tabs '+(data.tabSkipped||[]).length+
   (data.qaCenter?' · Befunde '+data.qaCenter.counts.high+' hoch / '+data.qaCenter.counts.medium+' mittel / '+data.qaCenter.counts.low+' gering':'')+
   (data.tabSweepLimited?' · PRÜF-LIMIT ERREICHT':'')+
   ' · Nur UI/Performance, kein Gameplay-Funktionstest.';
 el.querySelector('textarea').value=JSON.stringify(data,null,2);
 return data;
}
/* V8.360: opt-in Beta semantic-tab sweep. NEVER click generic game actions.
   Only buttons which explicitly declare tab semantics or occur in a genuine
   multi-button tab navigation container. No gameplay/reward/purchase actions. */
const tabAttr=/^data-(?:tab|grow-tab|subtab|v[0-9]{2,5}-(?:tab|subtab))$/i;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function semanticTab(button){
 if(button.tagName!=='BUTTON'||button.closest('#v8315PerfDock'))return null;
 if(button.getAttribute('type')?.toLowerCase()==='submit'||button.hasAttribute('formaction'))return null;
 const attribute=[...button.attributes].find(a=>tabAttr.test(a.name));
 const parent=button.parentElement;
 const role=button.getAttribute('role')==='tab';
 const inTabList=!!parent?.matches?.('[role="tablist"],.tabs,.tabbar,.tab-nav,[class*="-tabs"],[class*="-tab-nav"]');
 if(!attribute&&!role&&!inTabList)return null;
 if(inTabList&&!attribute&&!role&&[...parent.children].filter(x=>x.tagName==='BUTTON').length<2)return null;
 const raw=String(attribute?.value||(inTabList?button.getAttribute('data-type'):'')||button.id||'');
 const token=/^[a-z0-9_-]{1,40}$/i.test(raw)?raw:'slot'+Math.max(0,[...parent.children].indexOf(button));
 const group=String(parent.id||parent.className||'tabs').split(/\s+/)[0].slice(0,40).replace(/[^a-z0-9_-]/gi,'');
 return {button,tab:token,group,key:(attribute?.name||'role-tab')+':'+token+':'+group};
}
function tabVisible(btn){
 if(!btn.isConnected||btn.closest('[hidden],[inert],[aria-hidden="true"]')||!btn.getClientRects?.().length)return false;
 const css=getComputedStyle(btn);
 return css.display!=='none'&&css.visibility!=='hidden';
}
function availableTabs(id){
 const root=document.getElementById(id);
 return root?[...root.querySelectorAll('button')].map(semanticTab).filter(t=>t&&tabVisible(t.button)):[];
}
function probeSnapshot(id){
 const root=document.getElementById(id);
 return {nodes:root?.getElementsByTagName('*').length||0,images:root?.querySelectorAll('img').length||0,broken:summaryImageErrors(root)};
}
function showProgress(message){if(dock?.firstElementChild)dock.firstElementChild.textContent=message.slice(0,72)}
async function auditTabs(id,opts){
 const dwell=Math.max(250,Math.min(4000,Number(opts.tabDwellMs)||650));
 const limit=Math.max(1,Math.min(50,Number(opts.maxTabsPerScreen)||32));
 const globalLimit=Math.max(1,Math.min(220,Number(opts.maxTabsTotal)||130));
 const seen=new Set();let count=0;
 while(state.running&&!sweepCancelled&&count<limit&&state.tabSweepDone<globalLimit){
  const candidate=availableTabs(id).find(t=>!seen.has(t.key));
  if(!candidate)break;
  seen.add(candidate.key);count++;state.tabSweepDiscovered++;
  if(candidate.button.disabled){state.tabSkipped.push({screen:id,tab:candidate.tab,reason:'disabled'});continue}
  if(active()!==id){state.tabSkipped.push({screen:id,tab:candidate.tab,reason:'route_changed'});break}
  const p=createPage(id),first=probeSnapshot(id);
  const old={mutations:p.mutations,added:p.added,removed:p.removed,layoutShifts:p.layoutShifts,longTasks:p.longTasks,jankFrames:p.jankFrames};
  const ownerBefore={...p.mutationTargets},shiftBefore={...p.layoutShiftTargets};
  const errorBefore=state.log.filter(e=>e.kind==='runtime_error'&&e.screen===id).length;
  const started=clock();
  let status='tested';
  showProgress('SEITE '+id+' / TAB '+candidate.tab+' ('+(state.tabSweepDone+1)+')');
  try{candidate.button.click()}catch(_){status='click_error'}
  if(status==='tested')await pause(Math.max(0,dwell-220));
  const mid={mutations:p.mutations,removed:p.removed,layoutShifts:p.layoutShifts},idleOwnerBefore={...p.mutationTargets};
  const stableBefore=rectSignature(document.getElementById(id));
  await pause(status==='tested'?Math.min(220,dwell):30);
  inspect();
  if(active()!==id){
   const dest=active();
   status=betaAudit()&&EXPECTED_TAB_ROUTES[id+':'+candidate.tab]===dest?'linked_screen':'unexpected_navigation';
   if(status==='linked_screen')inspect();
  }
  const last=probeSnapshot(id),warnings=[];
  const stableAfter=rectSignature(document.getElementById(id)),visual=visualDelta(stableBefore,stableAfter);
  const layout=layoutSample(document.getElementById(id));
  if(qaState.extended)qaState.visualChecks++;
  const delta={};for(const [key,value]of Object.entries(old))delta[key]=Math.max(0,p[key]-value);
  const errors=Math.max(0,state.log.filter(e=>e.kind==='runtime_error'&&e.screen===id).length-errorBefore);
  if(last.broken>first.broken)warnings.push('broken_images');
  if(delta.layoutShifts>=2)warnings.push('multiple_layout_shifts');
  if(delta.removed>=100)warnings.push('heavy_dom_rebuild');
  if(errors)warnings.push('javascript_error');
  if(qaState.extended&&visual.moved+visual.opacityChanged>=2)warnings.push('idle_visual_instability');
  if(qaState.extended&&layout.clipped>0)warnings.push('clipped_controls');
  if(qaState.extended&&layout.overflow>0)warnings.push('horizontal_overflow');
  if(status!=='tested'&&status!=='linked_screen')warnings.push(status);
  state.tabResults.push({screen:id,tab:candidate.tab,group:candidate.group,status,durationMs:Math.round(clock()-started),
   domNodesBefore:first.nodes,domNodesAfter:last.nodes,imagesBefore:first.images,imagesAfter:last.images,
   brokenImages:last.broken,mutationRecords:delta.mutations,nodesAdded:delta.added,nodesRemoved:delta.removed,
   layoutShifts:delta.layoutShifts,longTasks:delta.longTasks,jankFrames:delta.jankFrames,javascriptErrors:errors,
   idleMutationRecords:Math.max(0,p.mutations-mid.mutations),idleNodesRemoved:Math.max(0,p.removed-mid.removed),
   idleLayoutShifts:Math.max(0,p.layoutShifts-mid.layoutShifts),
   mutationHotspots:deltaTargets(p.mutationTargets,ownerBefore),idleMutationHotspots:deltaTargets(p.mutationTargets,idleOwnerBefore,3),
   layoutShiftHotspots:deltaTargets(p.layoutShiftTargets,shiftBefore),
   ...(qaState.extended?{idleVisualDelta:visual,layoutAudit:layout}:{}),warnings});
  log('tab_probe',id,{tab:candidate.tab,status,warnings});
  if(status==='tested'||status==='linked_screen')state.tabSweepDone++;
  if(status==='unexpected_navigation'||status==='linked_screen')break;
 }
 if(count>=limit||state.tabSweepDone>=globalLimit)state.tabSweepLimited=true;
 for(const candidate of availableTabs(id)){
  if(!seen.has(candidate.key)&&!state.tabSkipped.some(e=>e.screen===id&&e.tab===candidate.tab))
   state.tabSkipped.push({screen:id,tab:candidate.tab,reason:'unvisited'});
 }
}
async function sweep(options={}){
 if(!state.running)start();
 if(state.sweeping)return false;
 if(typeof window.v032Go!=='function')throw new Error('Navigation ist noch nicht geladen');
 const ids=Array.isArray(options.ids)?options.ids.filter(x=>SCREENS.includes(x)):SCREENS;
 const dwell=Math.max(150,Math.min(10000,Number(options.dwellMs)||2200));
 const withTabs=options.includeTabs===true&&String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta';
 qaState.extended=withTabs&&options.extended===true;
 if(qaState.extended)setupNetwork();
 state.sweeping=true;sweepCancelled=false;
 const restore=active();
 for(const id of ids){
  if(sweepCancelled||!state.running)break;
  const t=clock();
  try{
   /* Nebelkarawane owns its own async page navigation, not v7119. */
   const go=id==='caravan'&&betaAudit()&&typeof window.v7240OpenCaravan==='function'
     ?window.v7240OpenCaravan():window.v032Go(id);
   if(betaAudit())inspect(); /* caravan becomes visible synchronously before RPC returns */
   if(go&&typeof go.then==='function')await Promise.race([go,pause(3500)]);
   if(betaAudit())inspect(); /* also capture a late async view transition */
   log('sweep_route',id);
   showProgress('SEITE '+id+' ('+(state.sweepDone+1)+'/'+ids.length+')');
   await pause(dwell);
   if(betaAudit())inspect(); /* ensure a short lived but active page is counted */
   const p=createPage(id);p.navMeasuredMs.push(Math.round(clock()-t));
   if(active()!==id)log('route_inactive',id,{actual:active()});
   else{
     state.sweepDone++;
     if(withTabs&&!sweepCancelled)await auditTabs(id,options);
   }
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
