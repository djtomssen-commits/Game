
(()=>{
'use strict';
if(String(window.GROW_RELEASE_CHANNEL||'stable')!=='beta')return;
if(window.__V6251_AUTO_WEEKEND_EVENTS__)return;
window.__V6251_AUTO_WEEKEND_EVENTS__=true;

const TZ='Europe/Berlin',DAY=86400000;
const ANCHOR_MONDAY_ORD=Math.floor(Date.UTC(2026,8,14)/DAY); // 18.09.2026 weekend = Gold + Dampf
const AUTO_PREFIX='v6251:auto:';
let lastSignature='';
let uiTimer=0,boundaryTimer=0,uiPending=false,nextBoundaryAt=0;
const diagnostics={applies:0,stateSyncs:0,uiRequests:0,uiCoalesced:0,uiRuns:0,boundaryFires:0};

function berlinParts(ms=Date.now()){
 const parts=new Intl.DateTimeFormat('en-CA',{
  timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',
  hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'
 }).formatToParts(new Date(ms));
 const o={};for(const p of parts)if(p.type!=='literal')o[p.type]=p.value;
 const y=Number(o.year),m=Number(o.month),d=Number(o.day);
 const ord=Math.floor(Date.UTC(y,m-1,d)/DAY);
 const dow=new Date(ord*DAY).getUTCDay(); // 0 Sun ... 6 Sat, based on Berlin calendar date
 return{y,m,d,ord,dow,h:Number(o.hour)||0,min:Number(o.minute)||0,sec:Number(o.second)||0};
}
function ymdFromOrd(ord){const d=new Date(ord*DAY);return{y:d.getUTCFullYear(),m:d.getUTCMonth()+1,d:d.getUTCDate()}}
function tzOffsetAt(ms){
 const p=berlinParts(ms);
 const shownAsUtc=Date.UTC(p.y,p.m-1,p.d,p.h,p.min,p.sec);
 return shownAsUtc-ms;
}
function berlinMidnightMs(y,m,d){
 const wall=Date.UTC(y,m-1,d,0,0,0);
 let target=wall-tzOffsetAt(wall);
 target=wall-tzOffsetAt(target); // second pass handles DST edge safely
 return target;
}
function positiveMod(n,m){return((n%m)+m)%m}
function schedule(ms=Date.now()){
 const p=berlinParts(ms),backToMonday=(p.dow+6)%7,mondayOrd=p.ord-backToMonday;
 const weekIndex=Math.floor((mondayOrd-ANCHOR_MONDAY_ORD)/7),cycle=positiveMod(weekIndex,2);
 const friday=ymdFromOrd(mondayOrd+4),nextMonday=ymdFromOrd(mondayOrd+7);
 const startMs=berlinMidnightMs(friday.y,friday.m,friday.d),endMs=berlinMidnightMs(nextMonday.y,nextMonday.m,nextMonday.d);
 const weekend=p.dow===5||p.dow===6||p.dow===0;
 const pair=cycle===0?'gold-dampf':'xp-koloss';
 return{...p,mondayOrd,weekIndex,cycle,pair,weekend,startMs,endMs};
}
function eventRows(ms=Date.now()){
 const sc=schedule(ms);if(!sc.weekend)return[];
 const common={is_active:true,starts_at:new Date(sc.startMs).toISOString(),ends_at:new Date(sc.endMs).toISOString(),created_at:new Date(sc.startMs).toISOString(),v6251Auto:true};
 if(sc.cycle===0)return[
  {...common,id:`${AUTO_PREFIX}gold:${sc.mondayOrd}`,name:'Gold-Event',description:'Wochenend-Event: Quests, Dungeons und Pflanzen-Ernten geben 2× Gold.'},
  {...common,id:`${AUTO_PREFIX}dampf:${sc.mondayOrd}`,name:'Dampf-Event',description:'Wochenend-Event: Alle Spieler erhalten 200 Dampf gratis und können mit Harz bis 300 auffüllen.'}
 ];
 return[
  {...common,id:`${AUTO_PREFIX}xp:${sc.mondayOrd}`,name:'Erfahrungs-Event',description:'Wochenend-Event: Quests geben 2× Erfahrung.'},
  {...common,id:`${AUTO_PREFIX}koloss:${sc.mondayOrd}`,name:'Smaragd-Koloss-Event',description:'Wochenend-Event: Der Smaragd-Koloss ist bis Sonntag aktiv.'}
 ];
}
function managedType(name){
 const n=String(name||'').toLowerCase();
 if(n.includes('dampf'))return'dampf';
 if(n.includes('gold'))return'gold';
 if(n.includes('erfahrung')||/(^|[^a-z])exp([^a-z]|$)/i.test(n))return'xp';
 if(n.includes('koloss')||n.includes('smaragd')||n.includes('weltboss')||n.includes('mystisch')||n.includes('mystic'))return'koloss';
 return'';
}
function currentAuto(type){return eventRows().find(x=>managedType(x.name)===type)||null}
function autoActive(type){return !!currentAuto(type)}

function syncEventState(){
 diagnostics.stateSyncs++;
 /* The per-character grant must be synchronous, including during startup quiet. */
 try{if(typeof v271EventDataReady!=='undefined')v271EventDataReady=true}catch(_){ }
 try{if(typeof v271SyncDampfEvent==='function')v271SyncDampfEvent()}catch(e){console.warn('V6.251 Dampf sync',e)}
 try{if(typeof v271PaintDampf==='function')v271PaintDampf()}catch(_){ }
}
function redrawEventUi(){
 diagnostics.uiRuns++;
 try{if(typeof renderQuests==='function')renderQuests()}catch(_){ }
 try{if(typeof v276DecorateGold==='function')v276DecorateGold()}catch(_){ }
 try{if(typeof v095DecorateXp==='function')v095DecorateXp()}catch(_){ }
 try{if(document.getElementById('world')?.classList.contains('active')&&typeof v085InstallWorld==='function')v085InstallWorld(false)}catch(_){ }
 try{if(typeof v120RenderWorldBossCard==='function')v120RenderWorldBossCard()}catch(_){ }
}
function queueEventUi(){
 diagnostics.uiRequests++;
 uiPending=true;
 if(uiTimer){diagnostics.uiCoalesced++;return}
 if(document.hidden)return;
 const remaining=Math.max(0,Number(window.v7204StartupQuietRemaining?.()||0));
 uiTimer=setTimeout(()=>{
  uiTimer=0;
  if(document.hidden)return;
  /* Startup quiet can be extended by a later account hydration stage. */
  if(window.v7204StartupQuiet?.()){queueEventUi();return}
  if(!uiPending)return;
  uiPending=false;
  redrawEventUi();
 },remaining+80);
}
function nextBoundary(ms=Date.now()){
 const sc=schedule(ms),candidates=[];
 /* Wednesday start/end, Friday start, Monday end; convert Berlin wall time
    for each candidate separately so DST weekends retain their exact boundary. */
 for(const offset of [2,3,4,7,9,10,11,14]){
  const d=ymdFromOrd(sc.mondayOrd+offset);
  const at=berlinMidnightMs(d.y,d.m,d.d);
  if(at>ms)candidates.push(at);
 }
 return Math.min(...candidates);
}
function armBoundary(){
 clearTimeout(boundaryTimer);boundaryTimer=0;nextBoundaryAt=0;
 if(document.hidden)return;
 nextBoundaryAt=nextBoundary();
 boundaryTimer=setTimeout(()=>{
  boundaryTimer=0;nextBoundaryAt=0;
  diagnostics.boundaryFires++;
  apply({redraw:false});
 },Math.max(80,Math.min(2147480000,nextBoundaryAt-Date.now()+60)));
}
function apply({redraw=true}={}){
 try{
  diagnostics.applies++;
  const old=Array.isArray(v093Events)?v093Events:[];
  /* Gold/Dampf/EXP/Koloss are fully schedule-owned from V6.251 onward.
     Old manually configured rows of those types cannot accidentally overlap. */
  const keep=old.filter(ev=>!String(ev?.id||'').startsWith(AUTO_PREFIX)&&!managedType(ev?.name));
  const auto=eventRows();
  v093Events=[...auto,...keep];
  try{window.v093Events=v093Events}catch(_){ }
  let tw=null;try{tw=window.vTowerWednesdayEventInfo?.()}catch(_){}
  const sig=auto.map(x=>x.id).join('|')+'|'+schedule().pair+'|'+schedule().weekend+'|'+(tw?.active?tw.name:'');
  const changed=sig!==lastSignature;lastSignature=sig;
  if(redraw||changed){syncEventState();queueEventUi()}
  armBoundary();
  return changed;
 }catch(e){console.warn('V6.251 auto events apply',e);return false}
}

/* Hard event owners: stale/manual DB rows cannot override the automatic rotation. */
try{v094XpEventActive=function(){return autoActive('xp')};window.v094XpEventActive=v094XpEventActive}catch(_){ }
try{v274GoldEventActive=function(){return autoActive('gold')};window.v274GoldEventActive=v274GoldEventActive}catch(_){ }
try{v271DampfEventActive=function(){return autoActive('dampf')};window.v271DampfEventActive=v271DampfEventActive}catch(_){ }
try{v271ActiveDampfEvent=function(){return currentAuto('dampf')};window.v271ActiveDampfEvent=v271ActiveDampfEvent}catch(_){ }
try{v110MysticEventActive=function(){return autoActive('koloss')};window.v110MysticEventActive=v110MysticEventActive}catch(_){ }
try{v120ActiveWorldBossEvent=function(){return currentAuto('koloss')};window.v120ActiveWorldBossEvent=v120ActiveWorldBossEvent}catch(_){ }

/* Re-merge after every server content refresh. */
try{
 if(typeof v093LoadPublicContent==='function'&&!v093LoadPublicContent.__v6251Auto){
  const base=v093LoadPublicContent;
  const wrapped=async function(){const r=await base.apply(this,arguments);apply({redraw:true});return r};
  wrapped.__v6251Auto=true;wrapped.__v6251Base=base;
  v093LoadPublicContent=wrapped;window.v093LoadPublicContent=wrapped;
 }
}catch(e){console.warn('V6.251 public event hook',e)}

window.v6251AutomaticWeekendSchedule=schedule;
window.v6251AutomaticWeekendEvents=eventRows;
window.v6251ApplyAutomaticWeekendEvents=apply;
window.v6251AutomaticWeekendDiagnostics=()=>{
 const sc=schedule(),nextPair=sc.cycle===0?'Gold + Dampf':'Erfahrung + Smaragd-Koloss';
 return{timezone:TZ,activeWeekend:sc.weekend,pair:nextPair,weekIndex:sc.weekIndex,start:new Date(sc.startMs).toISOString(),end:new Date(sc.endMs).toISOString(),events:eventRows().map(x=>({id:x.id,name:x.name,starts_at:x.starts_at,ends_at:x.ends_at}))};
};
window.v8009HomeEventSchedulerDiagnostics=()=>({
 version:'V8.009-HOME-14',...diagnostics,uiPending,pendingUiTimer:!!uiTimer,
 pendingBoundaryTimer:!!boundaryTimer,nextBoundaryAt,
 startupRetriesRetired:true,pollingRetired:true
});

apply({redraw:false});
/* Lifecycle signals replace the four startup retries and the 30-second poll. */
document.addEventListener('DOMContentLoaded',queueEventUi,{once:true});
window.addEventListener('pageshow',()=>apply({redraw:true}),{passive:true});
window.addEventListener('growlegends:account-ready',()=>apply({redraw:true}),{passive:true});
window.addEventListener('growlegends:extras-ready',queueEventUi,{passive:true});
window.addEventListener('growlegends:foreground-ready',()=>apply({redraw:true}),{passive:true});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){
  clearTimeout(uiTimer);uiTimer=0;
  clearTimeout(boundaryTimer);boundaryTimer=0;nextBoundaryAt=0;
 }else apply({redraw:true});
},{passive:true});
})();
