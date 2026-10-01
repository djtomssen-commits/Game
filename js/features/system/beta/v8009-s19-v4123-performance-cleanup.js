(()=>{
 'use strict';
 const VERSION=window.GROW_LEGENDS_VERSION?.label||'V4.159 Stable',SHORT=window.GROW_LEGENDS_VERSION?.short||'V4.159';
 function stamp(){}
 window.v4122LiveListenerCount=()=>typeof window.__V4122_LIVE_LISTENER_COUNT__==='function'?window.__V4122_LIVE_LISTENER_COUNT__():window.__V4106_TECH__?.listeners?.size||0;
 window.v4122PerformanceCleanup={version:SHORT,liveListeners:window.v4122LiveListenerCount};
 window.v4123LiveListenerCount=window.v4122LiveListenerCount;
 window.v4123TimerDiagnostics=()=>{const t=window.__V4106_TECH__||{};const rows=[...(t.intervals?.values?.()||[]),...(t.timeouts?.values?.()||[])];const map=new Map();for(const x of rows){const key=`${x.kind||'timer'}|${x.delay}|${String(x.callback||'').slice(0,90)}`;const r=map.get(key)||{kind:x.kind||'timer',delay:x.delay,count:0,calls:0,cpu:0,max:0,nativeBypass:false,callback:String(x.callback||'').slice(0,120),site:String(x.site||'').slice(0,180)};r.count++;r.calls+=Number(x.calls)||0;r.cpu+=Number(x.cpu)||0;r.max=Math.max(r.max,Number(x.max)||0);r.nativeBypass=r.nativeBypass||!!x.nativeBypass;map.set(key,r)}return[...map.values()].sort((a,b)=>b.calls-a.calls||b.count-a.count||a.delay-b.delay).slice(0,30)};
 window.v4123SlowRenders=()=>[...((window.__V4106_TECH__?.slowRenders)||[])];
 window.v4123PerformanceCleanup={version:SHORT,liveListeners:window.v4123LiveListenerCount,timers:window.v4123TimerDiagnostics,slowRenders:window.v4123SlowRenders};
 stamp(); /* V4.123: single settle pass; pageshow/visibility own later refreshes. */
})();
