(function(){
  /* V7.174: existing timer governor + real runtime telemetry. Static code scans
     count definitions; this registry measures only intervals/observers that are
     actually installed and executing. */
  const nativeSetInterval=window.setInterval.bind(window);
  const nativeClearInterval=window.clearInterval.bind(window);
  const runtime={seq:0,intervals:new Map(),observers:new Map(),createdAt:Date.now()};
  let fastSeq=0;
  const site=()=>{try{return String(document.currentScript?.id||'runtime')}catch(_){return'runtime'}};
  const cbName=fn=>{try{return String(fn?.name||Function.prototype.toString.call(fn).replace(/\s+/g,' ').slice(0,150))}catch(_){return'callback'}};
  function installInterval(fn,delay,args,nativeBypass=false){
    const requested=Math.max(0,Number(delay)||0);let actual=requested;
    try{const src=typeof fn==='function'?Function.prototype.toString.call(fn):String(fn||'');if(/\bv077(?:Buff|Inject|Now|Fmt|Seed|Plant|Harvest|Quest|fx|badge)/.test(src))actual=2147483647}
    catch(_){ }
    if(!nativeBypass&&actual>0&&actual<800)actual=2200+(fastSeq++%6)*180;
    const rec={id:null,site:site(),callback:cbName(fn),requestedDelay:requested,actualDelay:actual,nativeBypass:!!nativeBypass,createdAt:Date.now(),calls:0,cpuMs:0,maxMs:0,lastAt:0,active:true};
    const wrapped=function(){const t0=performance.now();rec.calls++;rec.lastAt=Date.now();try{return fn.apply(this,args)}finally{const ms=Math.max(0,performance.now()-t0);rec.cpuMs+=ms;rec.maxMs=Math.max(rec.maxMs,ms)}};
    const id=nativeSetInterval(wrapped,actual);rec.id=id;runtime.intervals.set(id,rec);return id;
  }
  window.setInterval=function(fn,delay){return installInterval(fn,delay,[].slice.call(arguments,2),false)};
  /* Combat may keep its native cadence, but it is now measured too. */
  window.__V477_NATIVE_SET_INTERVAL__=function(fn,delay){return installInterval(fn,delay,[].slice.call(arguments,2),true)};
  window.clearInterval=function(id){const rec=runtime.intervals.get(id);if(rec){rec.active=false;rec.clearedAt=Date.now()}return nativeClearInterval(id)};

  const NativeMO=window.MutationObserver;
  if(typeof NativeMO==='function'){
    function SafeMO(cb){
      const key=++runtime.seq,rec={key,site:site(),createdAt:Date.now(),active:false,observeCalls:0,batches:0,records:0,targets:[]};
      const obs=new NativeMO(function(list,observer){rec.batches++;rec.records+=Number(list?.length)||0;return cb(list,observer)});
      runtime.observers.set(key,rec);
      const nativeObserve=obs.observe.bind(obs),nativeDisconnect=obs.disconnect.bind(obs);
      obs.observe=function(target,opts){
        try{if(target&&target.nodeType===1&&(target.matches?.('.app > header,#shop')||target.closest?.('.app > header,#shop'))){rec.blocked=true;return}}
        catch(_){ }
        rec.active=true;rec.observeCalls++;try{rec.targets.push(String(target?.id||target?.className||target?.nodeName||'target').slice(0,90))}catch(_){ }
        return nativeObserve(target,opts);
      };
      obs.disconnect=function(){rec.active=false;rec.disconnectedAt=Date.now();return nativeDisconnect()};
      return obs;
    }
    SafeMO.prototype=NativeMO.prototype;try{Object.setPrototypeOf(SafeMO,NativeMO)}catch(_){ }
    window.MutationObserver=SafeMO;
  }
  window.__V477_RUNTIME_DIAGNOSTICS__=()=>{
    const now=Date.now(),active=[...runtime.intervals.values()].filter(x=>x.active).map(x=>({...x,ageMs:Math.max(0,now-x.createdAt),callsPerMin:x.calls/Math.max(1/60,(now-x.createdAt)/60000)}));
    const observers=[...runtime.observers.values()].filter(x=>x.active);
    return {version:'V7.174',activeIntervals:active.length,activeObservers:observers.length,fastActual:active.filter(x=>x.actualDelay>0&&x.actualDelay<500).length,fastNonCombat:active.filter(x=>x.actualDelay>0&&x.actualDelay<500&&!x.nativeBypass).length,nativeCombat:active.filter(x=>x.nativeBypass).length,calls:active.reduce((n,x)=>n+x.calls,0),cpuMs:Number(active.reduce((n,x)=>n+x.cpuMs,0).toFixed(2)),top:active.slice().sort((a,b)=>(b.cpuMs-a.cpuMs)||(b.calls-a.calls)).slice(0,12),observers:observers.slice(0,12)};
  };
  window.__V477_RUNTIME_GOVERNOR__=true;
})();
