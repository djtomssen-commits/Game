(()=>{
'use strict';
if(window.__V7071_GROW_DEALER_BRIDGE__)return;
window.__V7071_GROW_DEALER_BRIDGE__=true;

const VERSION='V7.091';
const S={ready:false,busy:false,lastError:'',actions:0,lastAction:null};
let chain=Promise.resolve(),refreshP=null;

const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const row=d=>Array.isArray(d)?d[0]:d;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
const toast=(t,type='info',d='')=>{try{return window.v063Toast?.(t,type,d)}catch(_){try{return window.v115Alert?.(d||t,t,type)}catch(__){}}};
const req=prefix=>{let x='';try{x=crypto.randomUUID().replaceAll('-','')}catch(_){x=Math.random().toString(36).slice(2)+Date.now().toString(36)}return `${prefix}_${Date.now()}_${x.slice(0,24)}`};
function q(fn){const job=()=>Promise.resolve().then(fn);chain=chain.then(job,job);return chain}
function stop(ev){ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation()}

function ensure(){
 if(typeof s==='undefined'||!s)return false;
 s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};
 s.grow.v492=(s.grow.v492&&typeof s.grow.v492==='object')?s.grow.v492:{};
 s.grow.v492.bag=Array.isArray(s.grow.v492.bag)?s.grow.v492.bag:[];
 s.grow.v6282=(s.grow.v6282&&typeof s.grow.v6282==='object')?s.grow.v6282:{};
 s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
 s.inventory=Array.isArray(s.inventory)?s.inventory:[];
 s.materials=Array.isArray(s.materials)?s.materials:[];
 return true;
}
async function rpc(name,args={}){
 const x=db();if(!x||!uid())throw new Error('SERVER_NOT_READY');
 const {data,error}=await x.rpc(name,args);if(error)throw error;return row(data);
}
function apply(r,{paint=true}={}){
 if(!r||r.ok!==true||!ensure())return false;
 if(Array.isArray(r.bag))s.grow.v492.bag=clone(r.bag);
 if(r.active===null||typeof r.active==='object')s.grow.v492.active=clone(r.active);
 if(r.dealer&&typeof r.dealer==='object'){
   const old=s.grow.v6282||{};
   s.grow.v6282={
     ...old,
     day:String(r.dealer.day||old.day||''),
     offers:Array.isArray(r.dealer.offers)?clone(r.dealer.offers):[],
     claimed:r.dealer.claimed&&typeof r.dealer.claimed==='object'?clone(r.dealer.claimed):{},
     drying:Array.isArray(r.dealer.drying)?clone(r.dealer.drying):[null,null]
   };
   while(s.grow.v6282.drying.length<2)s.grow.v6282.drying.push(null);
 }
 if(Number.isFinite(Number(r.gold)))s.gold=Math.max(0,Number(r.gold));
 if(Number.isFinite(Number(r.fragments)))s.v488Forge.fragments=Math.max(0,Number(r.fragments));
 if(Number.isFinite(Number(r.time_seeds)))s.timeSeeds=Math.max(0,Number(r.time_seeds));
 if(Array.isArray(r.inventory))s.inventory=clone(r.inventory);
 if(Array.isArray(r.materials))s.materials=clone(r.materials);
 try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
 if(paint){
   try{window.v6282GrowEconomy?.refresh?.()}catch(_){}
   try{window.v6163GrowTabs?.refresh?.()}catch(_){}
   try{renderInventory?.()}catch(_){}
   try{window.v069SyncCurrencies?.()}catch(_){}
   try{window.v488ForgeRender?.()}catch(_){}
 }
 return true;
}
async function refresh(){
  if(!window.v7081UseAuthority?.('grow')){S.ready=true;S.enabled=false;return null;}
 if(refreshP)return refreshP;
 refreshP=(async()=>{
   try{
     const r=await rpc('v7071_grow_dealer_state');
     if(!r?.ok)throw new Error(String(r?.reason||'DEALER_STATE_FAILED'));
     apply(r);S.ready=true;S.lastError='';return r;
   }catch(e){
     S.ready=false;S.lastError=String(e?.message||e);console.warn('[V7071] dealer refresh',e);return null;
   }finally{refreshP=null}
 })();
 return refreshP;
}
async function act(name,args,label,success){
 return q(async()=>{
   S.busy=true;
   try{
     const r=await rpc(name,args);
     if(!r?.ok)throw new Error(String(r?.reason||'SERVER_REJECTED'));
     apply(r);S.actions++;S.lastAction={name,at:Date.now(),result:clone(r)};
     if(success)toast(success,'success',label||'Server bestätigt');
     return r;
   }catch(e){
     S.lastError=String(e?.message||e);toast(label||'Aktion abgelehnt','error',S.lastError);
     try{await refresh()}catch(_){}
     return null;
   }finally{S.busy=false}
 });
}

/* Window capture runs before the historical document capture listener, so the
   old local dealer can no longer consume blooms or mint rewards first. */
window.addEventListener('click',ev=>{
  if(!window.v7081UseAuthority?.('grow'))return;
 const t=ev.target instanceof Element?ev.target:null;
 if(!t||!t.closest('#grow'))return;

 const ref=t.closest('[data-v6282-refine]');
 if(ref){
   stop(ev);
   void act(
     'v7071_start_refine',
     {p_bloom_id:String(ref.dataset.v6282Refine||'')},
     'Veredelung',
     '🌬️ Veredelung serverseitig gestartet'
   );
   return;
 }

 const collect=t.closest('[data-v6282-dry-collect]');
 if(collect){
   stop(ev);
   void act(
     'v7071_collect_refine',
     {p_slot:Number(collect.dataset.v6282DryCollect)},
     'Veredelung',
     '✨ Veredelte Blüte serverseitig eingesammelt'
   );
   return;
 }

 const buy=t.closest('[data-v6282-buy]');
 if(buy){
   stop(ev);
   const id=String(buy.dataset.v6282Buy||'');
   void act(
     'v7071_buy_grow_dealer',
     {p_offer_id:id,p_request_id:req('v7071_dealer')},
     'Blüten-Dealer',
     '🕶️ Dealer-Tausch serverseitig abgeschlossen'
   );
   return;
 }

 /* Opening Dealer/Stock gets a silent authoritative refresh first. */
 if(t.closest('[data-v6282-open-dealer],[data-v6282-view]')){
   queueMicrotask(()=>void refresh());
 }
},true);

/* The V4.165 listener still receives canonical quest/dungeon/PvP events and
   rolls a second LOCAL fragment reward. The server already owns those three
   fragment rolls. Preserve the server-provided balance around the old bus. */
try{
 const oldBus=window.GL_EVENTS;
 if(oldBus&&typeof oldBus.emit==='function'&&!window.__V7071_FRAGMENT_BUS_GUARD__){
   const oldEmit=oldBus.emit;
   const guardedEmit=function(type,detail={},token=''){
     const protectedType=type==='questCompleted'||type==='dungeonWon'||type==='pvpWon';
     const staged=!!window.v7063ItemStageDiagnostics?.()?.ready;
     const before=protectedType&&staged&&ensure()?Number(s.v488Forge.fragments)||0:null;
     const result=oldEmit(type,detail,token);
     if(before!==null){
       s.v488Forge.fragments=Math.max(0,before);
       try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
       try{window.v441PaintResources?.()}catch(_){}
       try{window.v488ForgeRender?.()}catch(_){}
     }
     return result;
   };
   window.GL_EVENTS=Object.freeze({
     on:(...a)=>oldBus.on(...a),
     emit:guardedEmit,
     stats:(...a)=>oldBus.stats(...a)
   });
   if(typeof window.glEmitGameEvent==='function')window.glEmitGameEvent=guardedEmit;
   window.__V7071_FRAGMENT_BUS_GUARD__=true;
 }
}catch(e){console.warn('[V7071] fragment bus guard',e)}

window.addEventListener('growlegends:account-ready',()=>{const run=()=>void refresh();if(typeof window.v7204AfterStartupQuiet==='function')window.v7204AfterStartupQuiet(run,900);else queueMicrotask(run)},{passive:true});
window.addEventListener('pageshow',()=>{if(window.v7204StartupQuiet?.())return;queueMicrotask(()=>void refresh())},{passive:true});
document.addEventListener('click',e=>{
 const t=e.target instanceof Element?e.target:null;
 if(t?.closest?.('[data-v6163-tab="stock"]'))queueMicrotask(()=>void refresh());
},true);

window.v7071StartRefine=id=>act('v7071_start_refine',{p_bloom_id:String(id||'')},'Veredelung','🌬️ Veredelung serverseitig gestartet');
window.v7071CollectRefine=i=>act('v7071_collect_refine',{p_slot:Number(i)},'Veredelung','✨ Veredelte Blüte serverseitig eingesammelt');
window.v7071BuyGrowDealer=id=>act('v7071_buy_grow_dealer',{p_offer_id:String(id||''),p_request_id:req('v7071_dealer')},'Blüten-Dealer','🕶️ Dealer-Tausch serverseitig abgeschlossen');
window.v7071GrowDealerRefresh=refresh;
window.v7071GrowDealerDiagnostics=()=>clone({version:VERSION,...S});
})();
