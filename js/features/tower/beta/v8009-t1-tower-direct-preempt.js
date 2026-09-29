(()=>{
'use strict';
if(window.__V7096_TOWER_DIRECT_PREEMPT__)return;
window.__V7096_TOWER_DIRECT_PREEMPT__=true;

/* V8.009-T10A: one-tap authoritative Tower flow.
   Door choice -> longer door opening -> automatic server replay.
   No separate "Kampf beginnen" step. */
const G=window.__V8009_TOWER_ROUTE_GUARD__||(window.__V8009_TOWER_ROUTE_GUARD__={
  routeBusy:false,duplicateTaps:0,chooseCalls:0,lastError:'',doorPreviewMinMs:1500
});

function setBusy(on){
 G.routeBusy=!!on;
 try{
   document.querySelectorAll('#tower [data-vt-route]').forEach(b=>{
     b.disabled=G.routeBusy;
     if(G.routeBusy)b.setAttribute('aria-busy','true');
     else b.removeAttribute('aria-busy');
   });
 }catch(_){}
}

function installDoorPreviewPacing(){
 try{
   const base=window.v7298TowerDoorPreview;
   if(typeof base!=='function'||base.__v8009T10A)return false;
   const wrapped=function(run,routeIndex=0,ms=900){
     return base.call(this,run,routeIndex,Math.max(G.doorPreviewMinMs,Number(ms)||0));
   };
   wrapped.__v8009T10A=true;
   wrapped.__v8009Base=base;
   window.v7298TowerDoorPreview=wrapped;
   return true;
 }catch(e){
   G.lastError=String(e?.message||e);
   return false;
 }
}

async function directRoute(idx){
 if(G.routeBusy){G.duplicateTaps++;return false}
 setBusy(true);G.chooseCalls++;
 try{
   installDoorPreviewPacing();
   let fn=window.__V7096_TOWER_DIRECT_ROUTE__;
   if(typeof fn!=='function'){
     await new Promise(resolve=>setTimeout(resolve,0));
     fn=window.__V7096_TOWER_DIRECT_ROUTE__;
   }
   if(typeof fn!=='function')throw new Error('TOWER_ROUTE_OWNER_NOT_READY');
   const result=fn(String(idx??'0'));
   if(result&&typeof result.then==='function')await result;
   G.lastError='';
   return true;
 }catch(e){
   G.lastError=String(e?.message||e);
   try{window.v063Toast?.('Turm-Server nicht erreichbar','error',G.lastError)}catch(_){}
   return false;
 }finally{
   setBusy(false);
 }
}

window.addEventListener('click',e=>{
 try{
   const t=e.target instanceof Element?e.target:null;
   const b=t?.closest?.('#tower [data-vt-route]');
   if(!b||!window.v7081UseAuthority?.('tower'))return;
   e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
   if(G.routeBusy||b.disabled){G.duplicateTaps++;return}
   void directRoute(String(b.dataset.vtRoute||'0'));
 }catch(err){
   G.lastError=String(err?.message||err);
   setBusy(false);
   console.warn('[V8.009-T10A] tower direct route',err);
 }
},true);

setTimeout(installDoorPreviewPacing,0);
setTimeout(installDoorPreviewPacing,500);
window.addEventListener('growlegends:account-ready',()=>setTimeout(installDoorPreviewPacing,80),{passive:true});
window.addEventListener('pageshow',()=>setTimeout(installDoorPreviewPacing,80),{passive:true});

window.v8009TowerRouteGuardDiagnostics=()=>({
 ...G,
 version:'V8.009-T10A',
 oneTapFight:true,
 separateFightButton:false,
 previewWrapped:!!window.v7298TowerDoorPreview?.__v8009T10A
});
})();
