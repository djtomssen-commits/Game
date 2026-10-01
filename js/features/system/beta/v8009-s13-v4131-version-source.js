window.GROW_LEGENDS_VERSION=Object.freeze({short:'V7.308',label:'V7.308 Beta',number:'7.305'});
window.__V7210_BOOT_PENDING__=true;
window.v7206StartupBusy=()=>window.__V7210_BOOT_PENDING__===true||window.__V7206_CANONICAL_LOGIN_RUNNING__===true||window.__V7206_FIRST_PLAYABLE_PENDING__===true;
/* V7.214: account-ready listeners used to all wake in the same frame and caused
   40+ startup RPCs plus a multi-second DOM/main-thread storm. Queue those legacy
   listeners while the splash gate is active, then drain them progressively after
   first-playable. Core canonical login itself is not delayed. */
if(!window.__V7214_ACCOUNT_READY_QUEUE__){
  window.__V7214_ACCOUNT_READY_QUEUE__=true;
  const nativeAdd=window.addEventListener.bind(window);
  const nativeRemove=window.removeEventListener.bind(window);
  const wrappedMap=new WeakMap();
  const queue=[];
  const stats={queuedTotal:0,drained:0,maxDepth:0,interactionDefers:0};
  let draining=false,busyUntil=0,timer=0;
  const markBusy=(ms=1050)=>{busyUntil=Math.max(busyUntil,Date.now()+Math.max(150,Number(ms)||0))};
  const userBusy=()=>Date.now()<busyUntil||window.__V446_FIGHTING__===true||window.v204BattleBusy===true||window.__V7085_TOWER_FIGHTING__===true;
  ['pointerdown','touchstart','wheel','keydown'].forEach(type=>nativeAdd(type,()=>markBusy(type==='wheel'?700:1150),{capture:true,passive:true}));
  nativeAdd('scroll',()=>markBusy(650),{capture:true,passive:true});
  nativeAdd('growlegends:navigation-open-v7119',()=>markBusy(1200),{passive:true});
  function callListener(job){
    try{
      if(typeof job.listener==='function')job.listener.call(job.ctx,job.ev);
      else job.listener?.handleEvent?.call(job.listener,job.ev);
    }catch(e){console.warn('[V7.214] deferred account-ready listener',job.scriptId,e)}
  }
  function schedule(ms=0){
    clearTimeout(timer);
    timer=setTimeout(()=>{timer=0;drain()},Math.max(0,ms));
  }
  function drain(){
    if(draining||!queue.length)return;
    if(document.hidden||userBusy()){
      stats.interactionDefers++;
      schedule(Math.max(180,busyUntil-Date.now()+90));
      return;
    }
    draining=true;
    const step=(deadline)=>{
      try{
        if(document.hidden||userBusy())return;
        const job=queue.shift();
        if(job){callListener(job);stats.drained++}
      }finally{
        draining=false;
        if(queue.length)schedule(userBusy()?260:45);
      }
    };
    if(typeof requestIdleCallback==='function')requestIdleCallback(step,{timeout:260});
    else setTimeout(()=>step(null),24);
  }
  window.addEventListener=function(type,listener,options){
    if(type!=='growlegends:account-ready'||(!listener))return nativeAdd(type,listener,options);
    const scriptId=document.currentScript?.id||'unknown';
    const wrapped=function(ev){
      if(window.__V7214_ACCOUNT_READY_DRAIN_NOW__===true||!window.v7206StartupBusy?.()){
        if(typeof listener==='function')return listener.call(this,ev);
        return listener?.handleEvent?.call(listener,ev);
      }
      queue.push({listener,ctx:this,ev,scriptId,at:Date.now()});
      stats.queuedTotal++;stats.maxDepth=Math.max(stats.maxDepth,queue.length);
    };
    try{if((typeof listener==='function'||typeof listener==='object')&&!wrappedMap.has(listener))wrappedMap.set(listener,wrapped)}catch(_){}
    return nativeAdd(type,wrapped,options);
  };
  window.removeEventListener=function(type,listener,options){
    let use=listener;
    try{if(type==='growlegends:account-ready'&&listener&&wrappedMap.has(listener))use=wrappedMap.get(listener)}catch(_){}
    return nativeRemove(type,use,options);
  };
  nativeAdd('growlegends:first-playable',()=>{
    window.__V7214_ACCOUNT_READY_DRAIN_NOW__=true;
    markBusy(500);
    schedule(560);
  },{passive:true});
  window.v7214AccountReadyQueueDiagnostics=()=>({queued:queue.length,draining,busyUntil,enabled:true,...stats});
  window.v7214DrainAccountReady=()=>{window.__V7214_ACCOUNT_READY_DRAIN_NOW__=true;schedule(0)};
}
