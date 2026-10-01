(()=>{
'use strict';
const VERSION=window.GROW_LEGENDS_VERSION?.label||'V4.159 Stable',SHORT=window.GROW_LEGENDS_VERSION?.short||'V4.159',STORE='growLegendsQA:v4107:';
const baseRun=window.v4106RunQA||window.v4102RunQA;
const oldOpen=window.v4102OpenQA;
let last=null,selectedGroup='',filter='problems',storageEstimate=null,lastNav='',renderTimer=0,historicCountCache=null;
const network={calls:[],errors:0,slow:0};
const reaction={ui:[],eventTiming:false};
const errlog=[];
function currentScreenId(){
 try{return document.querySelector('section.screen.active')?.id||document.querySelector('.screen.active')?.id||'unknown'}catch(_){return'unknown'}
}
function pushUiReaction(name,ms,screen=currentScreenId()){
 const n=Number(ms);if(!Number.isFinite(n)||n<0)return;
 reaction.ui.push({at:Date.now(),name:String(name||'interaction'),ms:Math.round(n),screen:String(screen||'unknown')});
 while(reaction.ui.length>120)reaction.ui.shift();
}
try{
 if(typeof PerformanceObserver==='function'&&PerformanceObserver.supportedEntryTypes?.includes?.('event')){
  const po=new PerformanceObserver(list=>{
   for(const e of list.getEntries()){
    const d=Number(e.duration)||0;if(d<16)continue;
    pushUiReaction(e.name||'event',d,currentScreenId());
   }
  });
  po.observe({type:'event',buffered:true,durationThreshold:16});
  reaction.eventTiming=true;
 }
}catch(_){}
if(!reaction.eventTiming){
 document.addEventListener('click',e=>{
  const started=performance.now(),target=e.target instanceof Element?e.target.closest('button,[data-screen],[role="button"],a')||e.target:null;
  requestAnimationFrame(()=>pushUiReaction(target?.id||target?.getAttribute?.('data-screen')||target?.tagName||'click',performance.now()-started,currentScreenId()));
 },true);
}
/* V7.174: user-action latency traces. This measures click -> network settlement -> paint,
   so sporadic "ruckelig" reports can be separated into network vs main-thread/UI time. */
const actions={records:[],open:new Map(),active:null,seq:0};
function actionLabel(el){
 try{
  if(!(el instanceof Element))return 'Interaktion';
  const id=String(el.id||'');
  const named={
   v204FindBtn:'PvP · Gegner suchen',v204FightBtn:'PvP · Kampf starten',
   v255ClaimBossReward:'Gildenboss · Belohnung',v480AutoEquip:'Items · Auto-Ausrüsten',
   v480AutoMaterials:'Items · Auto-Sockeln/Rollen',v461RerollGear:'Händler · Waffen neu würfeln',
   v461RerollMagic:'Händler · Magie neu würfeln',v488Craft:'Harzschmiede · Schmieden',
   v381Send:'Postfach · Nachricht senden'
  };
  if(named[id])return named[id];
  if(el.matches?.('[data-v492-harvest]'))return 'Growroom · Ernten';
  if(el.matches?.('[data-v492-plant]'))return 'Growroom · Pflanzen';
  if(el.matches?.('[data-v492-care]'))return 'Growroom · Pflegen';
  if(el.matches?.('[data-v492-upgrade]'))return 'Growroom · Upgrade';
  if(el.matches?.('[data-vt-route]'))return 'Anbau-Turm · Route';
  if(el.matches?.('[data-v381-tab]'))return 'Postfach · '+String(el.dataset.v381Tab||'Tab');
  const txt=String(el.getAttribute?.('aria-label')||el.textContent||id||el.tagName||'Interaktion').replace(/\s+/g,' ').trim();
  return txt.slice(0,64)||'Interaktion';
 }catch(_){return 'Interaktion'}
}
function actionCause(a){
 const total=Math.max(1,Number(a?.totalMs)||1),net=Math.max(0,Number(a?.networkMaxMs)||0),paint=Math.max(0,Number(a?.firstPaintMs)||0);
 if(net>=700&&net>=total*.55)return 'Server/Netz';
 if(paint>=120)return 'UI/Main Thread';
 if(total>=800)return 'Client/Async';
 return 'schnell';
}
function finishAction(a,reason='settled'){
 if(!a||a.done)return;
 a.done=true;
 try{clearTimeout(a.noNetTimer);clearTimeout(a.settleTimer);clearTimeout(a.guardTimer)}catch(_){}
 a.totalMs=Math.max(0,Math.round(performance.now()-a.started));
 a.reason=reason;a.cause=actionCause(a);
 const rec={
  at:a.at,label:a.label,screen:a.screen,totalMs:a.totalMs,firstPaintMs:Math.round(a.firstPaintMs||0),
  networkCount:Number(a.networkCount)||0,networkMaxMs:Math.round(a.networkMaxMs||0),networkTotalMs:Math.round(a.networkTotalMs||0),
  status:Number(a.worstStatus)||0,cause:a.cause,endpoints:[...(a.endpoints||new Set())].slice(0,5),reason
 };
 actions.records.push(rec);while(actions.records.length>160)actions.records.shift();
 actions.open.delete(a.id);if(actions.active===a)actions.active=null;
 if(rec.totalMs>=1800)pushErr('SLOW_ACTION',`${rec.totalMs} ms · ${rec.label} · ${rec.cause}`,'warn');
 scheduleRender();
}
function settleAction(a,delay=90){
 if(!a||a.done)return;
 clearTimeout(a.settleTimer);
 a.settleTimer=setTimeout(()=>{
  if(a.done||a.networkPending>0)return;
  requestAnimationFrame(()=>requestAnimationFrame(()=>finishAction(a,a.networkCount?'network-settled':'paint-settled')));
 },Math.max(30,Number(delay)||90));
}
function startAction(el){
 try{
  if(!(el instanceof Element)||el.closest('#systemtech'))return null;
  const a={id:++actions.seq,at:Date.now(),started:performance.now(),label:actionLabel(el),screen:currentScreenId(),networkPending:0,networkCount:0,networkMaxMs:0,networkTotalMs:0,worstStatus:0,endpoints:new Set(),done:false,lastNetworkDone:0,lastNetworkStart:0,firstPaintMs:0};
  actions.open.set(a.id,a);actions.active=a;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!a.done)a.firstPaintMs=Math.max(0,performance.now()-a.started)}));
  a.noNetTimer=setTimeout(()=>{if(!a.done&&a.networkCount===0)settleAction(a,0)},520);
  a.guardTimer=setTimeout(()=>finishAction(a,'guard-timeout'),15000);
  return a;
 }catch(_){return null}
}
function actionNetworkStart(url,method){
 try{
  const a=actions.active;if(!a||a.done)return null;
  const now=performance.now(),age=now-a.started;
  const u=String(url||'');
  /* Do not attribute known background housekeeping to the user's click. */
  if(/\/rest\/v1\/(?:push_jobs)(?:\?|$)/i.test(u))return null;
  if(/\/rest\/v1\/rpc\/(?:v7068_admin_change_state|v7101_sync_public_profile|v7080_achievement_state|v7107_golden_master_qa|v7084_authority_health)(?:\?|$)/i.test(u))return null;
  if(/\/rest\/v1\/player_messages(?:\?|$)/i.test(u)&&a.screen!=='mail'&&!/mail|postfach|nachricht/i.test(a.label))return null;
  const chained=a.networkCount>0&&(now-(a.lastNetworkDone||a.lastNetworkStart||a.started)<700);
  if(age>950&&!chained)return null;
  clearTimeout(a.noNetTimer);clearTimeout(a.settleTimer);
  a.networkPending++;a.networkCount++;a.lastNetworkStart=now;
  a.endpoints.add(endpointName(u));
  return a;
 }catch(_){return null}
}
function actionNetworkDone(a,ms,status){
 if(!a||a.done)return;
 a.networkPending=Math.max(0,a.networkPending-1);a.lastNetworkDone=performance.now();
 a.networkTotalMs+=Math.max(0,Number(ms)||0);a.networkMaxMs=Math.max(a.networkMaxMs,Math.max(0,Number(ms)||0));
 a.worstStatus=Math.max(a.worstStatus,Number(status)||0);
 if(a.networkPending===0)settleAction(a,100);
}
function actionStats(){
 const rows=actions.records.slice(-120),ms=rows.map(x=>Number(x.totalMs)||0),slow=rows.filter(x=>Number(x.totalMs)>=700).sort((a,b)=>Number(b.totalMs)-Number(a.totalMs)).slice(0,8);
 return{count:rows.length,p50:Math.round(percentile(ms,.50)),p95:Math.round(percentile(ms,.95)),max:Math.round(Math.max(0,...ms)),slow,last:rows.at(-1)||null,active:[...actions.open.values()].filter(x=>!x.done).length};
}
document.addEventListener('click',e=>{
 try{const el=e.target instanceof Element?e.target.closest('button,[role="button"],a,[data-screen],[data-v492-harvest],[data-v492-plant],[data-v492-care],[data-v492-upgrade],[data-vt-route]'):null;if(el)startAction(el)}catch(_){}
},true);
window.v7174ActionLatencyDiagnostics=()=>actionStats();
function percentile(values,p){
 const a=(values||[]).map(Number).filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return 0;
 const i=Math.min(a.length-1,Math.max(0,Math.ceil(a.length*p)-1));return a[i];
}
function endpointName(url){
 const s=String(url||'');const rpc=s.match(/\/rest\/v1\/rpc\/([^?/#]+)/i);if(rpc)return 'RPC '+decodeURIComponent(rpc[1]);
 const rest=s.match(/\/rest\/v1\/([^?/#]+)/i);if(rest)return 'REST '+decodeURIComponent(rest[1]);
 try{return new URL(s,location.href).pathname.split('/').filter(Boolean).slice(-2).join('/')||s.slice(0,60)}catch(_){return s.slice(0,60)}
}
function reactionStats(){
 const net=network.calls.slice(-80),ui=reaction.ui.slice(-120);
 const nms=net.map(x=>Number(x.ms)||0),ums=ui.map(x=>Number(x.ms)||0);
 const slowNet=net.filter(x=>Number(x.ms)>=1200).sort((a,b)=>Number(b.ms)-Number(a.ms)).slice(0,6);
 const slowUi=ui.filter(x=>Number(x.ms)>=120).sort((a,b)=>Number(b.ms)-Number(a.ms)).slice(0,6);
 return{
  network:{count:net.length,p50:Math.round(percentile(nms,.50)),p95:Math.round(percentile(nms,.95)),max:Math.round(Math.max(0,...nms)),slow:slowNet},
  ui:{count:ui.length,p50:Math.round(percentile(ums,.50)),p95:Math.round(percentile(ums,.95)),max:Math.round(Math.max(0,...ums)),slow:slowUi},
  eventTiming:reaction.eventTiming
 };
}
const tech=()=>window.__V4106_TECH__||{intervals:new Map(),timeouts:new Map(),listeners:new Map(),longTasks:[],renderSamples:{},mutations:0,maxDom:0};
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(e){return null}};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const owner=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||s?.__accountOwnerId||s?.social?.playerId||'local')}catch(e){return'local'}};
const key=()=>STORE+owner(),runtimeKey=()=>key()+':runtime';
function result(category,name,pass,detail='',severity='error'){return{category,name,pass:!!pass,detail:String(detail||''),severity}}
function test(c,n,fn,severity='error'){try{const x=fn();if(x&&typeof x==='object'&&'pass'in x)return result(c,n,x.pass,x.detail||'',x.severity||severity);return result(c,n,!!x,'',severity)}catch(e){return result(c,n,false,e?.message||String(e),severity)}}
function source(){try{return [...document.scripts].map(x=>x.textContent||'').join('\n')}catch(e){return''}}
function pushErr(code,detail,severity='error'){
 const rec={at:Date.now(),code:String(code),detail:String(detail||''),severity};
 window.v4125QaPushErr=pushErr;
 const prev=errlog.at(-1);if(prev&&prev.code===rec.code&&prev.detail===rec.detail&&rec.at-prev.at<10000)return;
 errlog.push(rec);while(errlog.length>80)errlog.shift();
 try{const a=JSON.parse(localStorage.getItem(runtimeKey())||'[]');a.push(rec);while(a.length>80)a.shift();localStorage.setItem(runtimeKey(),JSON.stringify(a))}catch(e){}
 scheduleRender();
}
function allRuntime(){
 let a=[];try{a=JSON.parse(localStorage.getItem(runtimeKey())||'[]')}catch(e){}
 try{if(typeof window.v4102RuntimeIssues==='function')a=a.concat(window.v4102RuntimeIssues()||[])}catch(e){}
 try{
  const old=JSON.parse(localStorage.getItem(`growLegendsQA:v4106:${owner()}:runtime`)||'[]');
  if(Array.isArray(old))a=a.concat(old);
 }catch(e){}
 /* The report says "since start": do not count persisted errors from older page loads. */
 const since=Math.max(0,Number(tech()?.startedAt)||0);
 if(since)a=a.filter(x=>Number(x?.at||0)>=since-1000);
 return a.sort((x,y)=>(x.at||0)-(y.at||0)).slice(-100);
}
function safeNum(v){const n=Number(v);return Number.isFinite(n)?n:null}
function visible(el){if(!el)return false;try{const c=getComputedStyle(el);return c.display!=='none'&&c.visibility!=='hidden'&&Number(c.opacity)!==0&&!!el.getClientRects().length}catch(e){return false}}
function duplicateIds(){const m=new Map();document.querySelectorAll('[id]').forEach(e=>{if(e.closest('svg'))return;m.set(e.id,(m.get(e.id)||0)+1)});return [...m].filter(([,n])=>n>1)}
function timerInfo(){
 const t=tech(),now=Date.now(),ints=[...t.intervals.values()],tos=[...t.timeouts.values()];
 const sig=x=>`${x.delay}|${String(x.callback||'').slice(0,120)}|${String(x.site||'').slice(0,120)}`;
 const countDup=a=>{const m=new Map();a.forEach(x=>m.set(sig(x),(m.get(sig(x))||0)+1));return [...m].filter(([,n])=>n>1)};
 const legacy=ints.filter(x=>/keepVersion|stamp|V4\.(?:0[0-9]|[12][0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9]|10[0-6])\b/i.test(`${x.callback||''} ${x.site||''}`));
 const staleTimeouts=tos.filter(x=>x.createdAt&&x.delay<60000&&now>x.createdAt+x.delay+15000);
 const fast=ints.filter(x=>x.delay>0&&x.delay<200);
 return{ints,tos,dupInts:countDup(ints),legacy,staleTimeouts,fast};
}
function renderStats(){
 const rows=[];Object.entries(tech().renderSamples||{}).forEach(([name,a])=>(a||[]).forEach(ms=>rows.push({name,ms:Number(ms)||0})));
 rows.sort((a,b)=>b.ms-a.ms);return{count:rows.length,max:rows[0]||{name:'—',ms:0},avg:rows.length?rows.reduce((n,x)=>n+x.ms,0)/rows.length:0}
}
function imageProblems(){return [...document.images].filter(i=>i.complete&&i.naturalWidth===0&&visible(i))}
function localStorageKb(){let n=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||'';n+=k.length+(localStorage.getItem(k)||'').length}}catch(e){}return Math.round(n*2/1024)}
function talentSegmentEffect(classId,branch,i){
 const original=s;try{
  s=clone(s)||{};s.playerClass=classId;s.v314Talents=clone(s.v314Talents||{})||{};s.v314Talents[classId]={};if(s.grow?.v492)s.grow.v492.active=null;
  const before=typeof v319ExactTalentStats==='function'?v319ExactTalentStats():{};
  s.v314Talents[classId][`${branch}.s${i}`]=1;
  const after=typeof v319ExactTalentStats==='function'?v319ExactTalentStats():{};
  return Object.keys(after||{}).some(k=>Number(after[k]||0)>Number(before[k]||0)+1e-12);
 }catch(e){return false}finally{s=original}
}
function safeArt(it){try{return String(window.v4106ComicItemArtUri?.(it)||window.v466ItemArtUri?.(it)||'')}catch(e){return''}}
function itemValidBonus(it){return !it?.bonus||Object.values(it.bonus).every(v=>Number.isFinite(Number(v)))}
function corePowerSignature(){try{return JSON.stringify({level:s.level,attrs:s.attrs,equipment:s.equipment,talents:s.v314Talents,set:s.v088SetState,growActive:s.grow?.v492?.active,skills:s.classSkills})}catch(e){return''}}
function questTripletForLevel(lvl){
 if(typeof makeQuest!=='function')return[];const oldLevel=s.level,oldCursor=typeof v309QuestCursor!=='undefined'?v309QuestCursor:null,oldNames=typeof v309BatchNames!=='undefined'?new Set(v309BatchNames):null;
 try{s.level=lvl;if(typeof v309QuestCursor!=='undefined')v309QuestCursor=0;if(typeof v309BatchNames!=='undefined')v309BatchNames=new Set();return[makeQuest(),makeQuest(),makeQuest()]}
 finally{s.level=oldLevel;if(oldCursor!==null)v309QuestCursor=oldCursor;if(oldNames!==null)v309BatchNames=oldNames}
}
function fullReport(){
 const __qaTech=tech(),__qaStart=performance.now();__qaTech.qaActive=true;
 try{ensureScreen();installMenu()}catch(e){}
 const out=[],T=(c,n,f,se='error')=>out.push(test(c,n,f,se));
 const caps=(()=>{try{return window.v7081CapabilitiesDiagnostics?.()?.caps||{}}catch(_){return{}}})();
 const domains=(()=>{try{return window.v7133AuthorityDiagnostics?.()?.domains||window.v7040AuthorityDiagnostics?.()?.domains||{}}catch(_){return{}}})();
 const clientQa=(()=>{try{return window.v7084SystemTestDiagnostics?.()||null}catch(_){return null}})();
 const serverQa=window.__V7098_SERVER_QA__||null;
 const watchdog=(()=>{try{return window.__GL_RUNTIME_WATCHDOG__?.diagnostics?.()||null}catch(_){return null}})();
 const rs=reactionStats();
 const tinfo=timerInfo(),rstats=renderStats(),logs=allRuntime();
 const activeScreens=[...document.querySelectorAll('section.screen.active')];

 T('Build & Authority','Aktuelle Build-ID vorhanden',()=>({pass:/^V7\./.test(String(window.GROW_LEGENDS_VERSION?.short||'')),detail:String(window.GROW_LEGENDS_VERSION?.short||'keine Version')}));
 T('Build & Authority','Server-Authority-Diagnose geladen',()=>({pass:Object.keys(caps).length>0||Object.keys(domains).length>0,detail:`Capabilities ${Object.keys(caps).length} · Domains ${Object.keys(domains).length}`}));
 Object.entries(domains).forEach(([name,mode])=>{
  const m=String(mode||'');
  T('Build & Authority',`${name}: ${m||'unbekannt'}`,()=>({pass:m==='enforce',detail:m==='enforce'?'Server ist maßgeblich':`Modus ${m||'unbekannt'}`,severity:'warn'}),'warn');
 });
 const falseCaps=Object.entries(caps).filter(([,v])=>v===false).map(([k])=>k);
 T('Build & Authority','Keine deaktivierte geladene Authority-Capability',()=>({pass:falseCaps.length===0,detail:falseCaps.length?falseCaps.join(', '):'alle geladenen Capabilities aktiv',severity:'warn'}),'warn');
 const ad=(()=>{try{return window.v7133AuthorityDiagnostics?.()||null}catch(_){return null}})();
 const ap=window.__V7133_AUTHORITY_POLICY__||null;
 const requiredDomains=['achievements','billing','build','daily','dungeon','endgame','grow_dealer','grow_orders','guild','items','liveops','pets','profile','progress','pvp','quest','seeds','shop','social','tower','weekly','worldboss'];
 const missingEnforce=requiredDomains.filter(d=>String(domains?.[d]||'')!=='enforce');
 T('Build & Authority','Alle 22 Gameplay-Domains serverautoritativ',()=>({pass:missingEnforce.length===0,detail:missingEnforce.length?`Nicht enforce: ${missingEnforce.join(', ')}`:'22/22 enforce'}));
 T('Build & Authority','Globaler Fail-Closed-Owner aktiv',()=>({pass:!!ad&&ap?.gameplayWrites==='server-only'&&ap?.unknownAuthority==='fail-closed',detail:ad?`Owner ${ad.version}`:'Diagnose fehlt'}));
 T('Build & Authority','Persist ohne doppelten Whole-Save-Write',()=>({pass:window.__V7192_UI_LATENCY__?.persistWholeSave==='single-checkpoint-write',detail:window.__V7192_UI_LATENCY__?.persistWholeSave||'nicht aktiv'}));
 T('Build & Authority','Alter player_saves-Schreiber nach Rollout blockiert',()=>({pass:!!window.v075WriteCloudSave?.__v7133AuthorityLock,detail:ad?`${Number(ad.legacyCloudWritesSuppressed)||0} alte Schreibversuche abgefangen`:'Guard fehlt'}));
 T('Build & Authority','Alter Cloud/Local-Restore nach Rollout blockiert',()=>({pass:!!window.v075ApplyCloudSave?.__v7133CloudApplyLock,detail:ad?`${Number(ad.legacyCloudAppliesBlocked)||0} Restore-Versuche abgefangen`:'Guard fehlt'}));
 T('Build & Authority','player_saves nur noch Kompatibilitäts-Cache',()=>({pass:ap?.playerSavesAfterFullEnforce==='read-compatibility-only'&&ap?.cloudApplyAfterFullEnforce==='blocked-and-server-rehydrated',detail:String(ap?.playerSavesAfterFullEnforce||'Policy fehlt')}));
 const loginAuth=window.__V4139_LOGIN_AUTHORITY__||null,loginDiag=(()=>{try{return window.v4139LoginAuthorityDiagnostics?.()||null}catch(_){return null}})();
 T('Build & Authority','Login lädt keinen Local/player_saves-Whole-Save mehr',()=>({pass:!!window.v075ResolveCloudAfterLogin?.__v7194ServerOnlyLogin&&loginAuth?.playerSavesGameplayRestore===false&&loginAuth?.localGameplayRestore===false,detail:loginDiag?`${loginAuth.mode} · Server-Hydrates ${Number(loginDiag.canonicalHydrates)||0} · Blocks ${Number(loginDiag.legacyWholeSaveBlocks)||0}`:'V7.199 Login-Guard fehlt'}));
 T('Build & Authority','Admin-Synchronisierung nutzt Server-Signal statt player_saves-Restore',()=>{try{const f=Function.prototype.toString.call(window.v200AdminPoll||v200AdminPoll||(()=>{}));return{pass:/v7068_admin_change_state/.test(f)&&!/v075ApplyCloudSave/.test(f),detail:/v7068_admin_change_state/.test(f)?'v7068 Server-Signal aktiv':'alter Admin-Poll aktiv'}}catch(e){return{pass:false,detail:String(e?.message||e)}}});
 T('Build & Authority','Items server-only inkl. Auto-Funktionen',()=>({pass:window.__V7132_ITEM_AUTHORITY__?.manualEquip==='server-only'&&window.__V7132_ITEM_AUTHORITY__?.autoMaterials==='server-only',detail:window.__V7132_ITEM_AUTHORITY__?.localStorageRole||'Owner fehlt'}));
 T('Build & Authority','Growroom fail-closed serverseitig',()=>({pass:!!window.__V7065_GROW_FAIL_CLOSED__,detail:window.__V7065_GROW_FAIL_CLOSED__?'aktiv':'fehlt'}));
 const lg=window.__V7173_LEGACY_LOCAL_GUARD__||null;
 T('Build & Authority','Legacy-Dampf/Mitternacht-Timer unter Serverautorität stillgelegt',()=>({pass:!!lg&&(!ad?.authenticated||(!lg.v026TimerActive&&!lg.v127TimerActive)),detail:lg?`Dampf ${lg.v026TimerActive?'AKTIV':'aus'} · Mitternacht ${lg.v127TimerActive?'AKTIV':'aus'} · beendet ${Number(lg.retiredTimers)||0}`:'Guard fehlt'}));
 T('Build & Authority','Alter Weltboss-State-Timer unter Authority beendet',()=>({pass:!!lg&&(!ad?.authenticated||!lg.v112TimerActive),detail:lg?`Weltboss ${lg.v112TimerActive?'AKTIV':'aus'} · Blocks ${Number(lg.worldbossTimerBlocks)||0}`:'Guard fehlt'}));
 T('Build & Authority','Legacy-Dampfregeneration unter Authority blockiert',()=>({pass:!!ad?.legacyEnergyGuarded&&!!ad?.legacyDampfResetGuarded,detail:`Regen ${ad?.legacyEnergyGuarded?'guarded':'off'} · Daily ${ad?.legacyDampfResetGuarded?'guarded':'off'}`}));
 T('Build & Authority','Legacy-Mitternachts-/Worldboss-Reset lokal blockiert',()=>({pass:!!ad?.legacyMidnightGuarded&&!!ad?.legacyWorldbossResetGuarded,detail:`Midnight ${ad?.legacyMidnightGuarded?'guarded':'off'} · Worldboss ${ad?.legacyWorldbossResetGuarded?'guarded':'off'}`}));
 if(ad&&(Number(ad.legacyGameplayFallbacksBlocked)||Number(ad.legacyCloudAppliesBlocked)||Number(ad.legacyCloudWritesSuppressed))){
  T('Build & Authority','Legacy-Pfade wurden zur Laufzeit abgefangen',()=>({pass:true,detail:`Fallback ${Number(ad.legacyGameplayFallbacksBlocked)||0} · Cloud-Write ${Number(ad.legacyCloudWritesSuppressed)||0} · Restore ${Number(ad.legacyCloudAppliesBlocked)||0}`,severity:'warn'}),'warn');
 }

 const rg=(()=>{try{return window.__V477_RUNTIME_DIAGNOSTICS__?.()||null}catch(_){return null}})();
 T('Performance','Runtime-Timer tatsächlich instrumentiert',()=>({pass:!!rg,detail:rg?`${rg.activeIntervals} aktive Intervalle · ${rg.activeObservers} aktive Observer`:'Runtime-Diagnose fehlt'}));
 T('Performance','Keine ungegovernten aktiven Sub-500-ms-Timer',()=>({pass:!!rg&&Number(rg.fastNonCombat||0)===0,detail:rg?`${Number(rg.fastNonCombat)||0} problematisch · ${Number(rg.nativeCombat)||0} Combat`:'Runtime-Diagnose fehlt',severity:'warn'}),'warn');
 T('Performance','Runtime-Timer CPU im Blick',()=>({pass:!!rg&&(Number(rg.cpuMs)||0)<1500,detail:rg?`${Number(rg.calls)||0} Aufrufe · ${Number(rg.cpuMs||0).toFixed(1)} ms Callback-CPU`:'Runtime-Diagnose fehlt',severity:'warn'}),'warn');

 T('Server QA','Server-Golden-Master geladen',()=>({pass:!!serverQa,detail:serverQa?`fehlgeschlagene Checks: ${Number(serverQa.failed_checks)||0}`:'noch nicht geladen',severity:'warn'}),'warn');
 if(serverQa)T('Server QA','Server-Golden-Master ohne Fehler',()=>({pass:Number(serverQa.failed_checks||0)===0,detail:`failed_checks=${Number(serverQa.failed_checks)||0}`}));
 T('Server QA','Client→Server Systemcheck vorhanden',()=>({pass:!!clientQa,detail:clientQa?String(clientQa.status||'unbekannt'):'noch kein Lauf',severity:'warn'}),'warn');
 if(clientQa){
  T('Server QA','Authority-Health RPC erfolgreich',()=>({pass:clientQa.checks?.serverHealth!==false,detail:`Status ${String(clientQa.status||'')}`}));
  T('Server QA','Keine RPC-Fehler im Prüflauf',()=>({pass:clientQa.checks?.noRpcErrors!==false,detail:`Fehler ${clientQa.errors?.filter?.(x=>x?.step&&x.step!=='ui_stability')?.length||0}`}));
  const drift=Object.entries(clientQa.checks||{}).filter(([k,v])=>k.endsWith('LocalMatch')&&v===false).map(([k])=>k.replace('LocalMatch',''));
  T('Server QA','Client-Kopie nach Hydration deckungsgleich',()=>({pass:drift.length===0,detail:drift.length?`Abweichung: ${drift.join(', ')}`:'kein erkannter Drift',severity:'warn'}),'warn');
  Object.entries(clientQa.metrics?.timings||{}).forEach(([name,ms])=>{
   const n=Number(ms)||0;
   T('Reaktionszeiten',`Server ${name}: ${n} ms`,()=>({pass:n<2500,detail:n<800?'schnell':n<1600?'auffällig, aber noch okay':n<2500?'langsam':'sehr langsam',severity:n>=5000?'error':'warn'}),n>=5000?'error':'warn');
  });
 }

 T('Spielzustand','Spielzustand geladen',()=>typeof s==='object'&&!!s);
 T('Spielzustand','Level gültig',()=>({pass:Number.isFinite(Number(s?.level))&&Number(s.level)>=1&&Number(s.level)<=300,detail:`Level ${Number(s?.level)||0}`}));
 T('Spielzustand','Gold nicht negativ',()=>({pass:Number.isFinite(Number(s?.gold))&&Number(s.gold)>=0,detail:String(Number(s?.gold)||0)}));
 T('Spielzustand','Harz-Taler nicht negativ',()=>({pass:Number.isFinite(Number(s?.harzTaler))&&Number(s.harzTaler)>=0,detail:String(Number(s?.harzTaler)||0)}));
 T('Spielzustand','Dampf nicht negativ',()=>({pass:Number.isFinite(Number(s?.energy))&&Number(s.energy)>=0,detail:String(Number(s?.energy)||0)}));
 T('Spielzustand','Klasse gültig',()=>({pass:['grower','scout','bruiser','summoner','frost'].includes(String(s?.playerClass||'')),detail:String(s?.playerClass||'fehlt')}));
 T('Spielzustand','Inventar ohne doppelte IDs',()=>{const ids=(s?.inventory||[]).map(x=>String(x?.id||x?.uid||'')).filter(Boolean);return{pass:new Set(ids).size===ids.length,detail:`${ids.length} Items`}});
 T('Spielzustand','Samenbestände nicht negativ',()=>({pass:Object.values(s?.grow?.seeds||{}).every(v=>Number.isFinite(Number(v))&&Number(v)>=0),detail:`${Object.keys(s?.grow?.seeds||{}).length} Sorten`}));
 T('Spielzustand','Pflanzen ohne doppelte UID',()=>{const ids=(s?.grow?.plants||[]).filter(Boolean).map(p=>String(p?.uid||'')).filter(Boolean);return{pass:new Set(ids).size===ids.length,detail:`${ids.length} Pflanzen`}});

 T('UI & Navigation','Genau eine Hauptseite aktiv',()=>({pass:activeScreens.length===1,detail:`aktiv: ${activeScreens.map(x=>x.id).join(', ')||'keine'}`}));
 T('UI & Navigation','Aktive Seite sichtbar',()=>({pass:activeScreens.length===1&&visible(activeScreens[0]),detail:activeScreens[0]?.id||'keine'}));
 const dups=duplicateIds();
 T('UI & Navigation','Keine doppelten DOM-IDs',()=>({pass:dups.length===0,detail:dups.length?dups.slice(0,8).map(([id,n])=>`${id}×${n}`).join(', '):'keine',severity:'warn'}),'warn');
 const broken=imageProblems();
 T('UI & Navigation','Keine kaputten sichtbaren Bilder',()=>({pass:broken.length===0,detail:broken.length?`${broken.length} sichtbare Bilder ohne Asset`:'keine',severity:'warn'}),'warn');

 const diagList=[
  ['Dungeon',()=>window.v7051DungeonAuthorityDiagnostics?.()],
  ['Grow',()=>window.v7065GrowAuthorityDiagnostics?.()],
  ['Items',()=>window.v7132ItemAuthorityDiagnostics?.()],
  ['Quest',()=>window.v7110QuestDiagnostics?.()],
  ['Seeds',()=>window.v7128SeedAuthorityDiagnostics?.()],
  ['Kampf',()=>window.v7158CombatDiagnostics?.()]
 ];
 for(const [name,get] of diagList){
  let d=null;try{d=get()}catch(_){}
  T('Subsysteme',`${name}-Diagnose erreichbar`,()=>({pass:!!d,detail:d?`Version ${String(d.version||'—')}`:'nicht verfügbar',severity:'warn'}),'warn');
  if(d&&'lastError'in d)T('Subsysteme',`${name} ohne Bridge-Fehler`,()=>({pass:!String(d.lastError||''),detail:String(d.lastError||'kein Fehler')}));
 }
 const combat=(()=>{try{return window.v7158CombatDiagnostics?.()}catch(_){return null}})();
 T('Subsysteme','Einziger aktueller 2D-Kampfbesitzer aktiv',()=>({pass:!!combat&&combat.singleRenderer===true&&String(combat.owner||'')==='v7175',detail:combat?`Owner ${String(combat.owner||'—')} · ${String(combat.version||'—')}`:'Diagnose fehlt'}));
 T('Subsysteme','Zentraler Text-/Namensfilter aktiv',()=>({pass:!!window.__V7185_MODERATION__?.clientGuard,detail:window.__V7185_MODERATION__?.clientGuard?'Charakter · Gilde · Gildenchat · Postfach':'Client-Guard fehlt'}));

 const hardLogs=logs.filter(x=>x?.severity!=='warn');
 T('Laufzeit','Keine JS-/Promise-Fehler seit Seitenstart',()=>({pass:hardLogs.length===0,detail:hardLogs.length?`${hardLogs.length} Fehler · ${String(hardLogs.at(-1)?.code||'')}`:'keine'}));
 T('Laufzeit','Keine hängende Watchdog-Aktion',()=>({pass:!(watchdog?.active||[]).some(x=>Number(x.elapsedMs)>7000),detail:`aktive Aktionen ${(watchdog?.active||[]).length}`}));
 const recentLong=(watchdog?.longTasks||[]).filter(x=>Number(x.duration)>=350);
 T('Laufzeit','Keine schweren Main-Thread-Hänger',()=>({pass:recentLong.filter(x=>Number(x.duration)>=700).length===0,detail:recentLong.length?`max ${Math.max(...recentLong.map(x=>Number(x.duration)||0))} ms`:'keine',severity:'warn'}),'warn');
 T('Laufzeit','Keine doppelten laufenden Timer',()=>({pass:tinfo.dupInts.length===0,detail:String(tinfo.dupInts.length),severity:'warn'}),'warn');
 T('Laufzeit','Keine verwaisten kurzen Timeouts',()=>({pass:tinfo.staleTimeouts.length===0,detail:String(tinfo.staleTimeouts.length),severity:'warn'}),'warn');
 T('Laufzeit','Render-Spitze unter 120 ms',()=>({pass:Number(rstats.max?.ms||0)<120,detail:`${Number(rstats.max?.ms||0).toFixed(1)} ms · ${String(rstats.max?.name||'—')}`,severity:'warn'}),'warn');

 const as=actionStats();
 T('Reaktionszeiten','Aktionen P95 unter 1,5 s',()=>({pass:as.p95<1500||as.count<3,detail:`P50 ${as.p50} ms · P95 ${as.p95} ms · Max ${as.max} ms · ${as.count} Aktionen`,severity:'warn'}),'warn');
 T('Reaktionszeiten','Keine Aktion über 5 s',()=>({pass:!as.slow.some(x=>Number(x.totalMs)>=5000),detail:as.slow[0]?`${as.slow[0].totalMs} ms · ${as.slow[0].label} · ${as.slow[0].cause}`:'keine',severity:'warn'}),'warn');
 T('Reaktionszeiten','Netzwerk P95 unter 2,5 s',()=>({pass:rs.network.p95<2500||rs.network.count<3,detail:`P50 ${rs.network.p50} ms · P95 ${rs.network.p95} ms · Max ${rs.network.max} ms · ${rs.network.count} Samples`,severity:'warn'}),'warn');
 T('Reaktionszeiten','UI-Interaktionen P95 unter 200 ms',()=>({pass:rs.ui.p95<200||rs.ui.count<3,detail:`P50 ${rs.ui.p50} ms · P95 ${rs.ui.p95} ms · Max ${rs.ui.max} ms · ${rs.ui.count} Samples`,severity:'warn'}),'warn');
 T('Reaktionszeiten','Keine extrem langsame Anfrage > 5 s',()=>({pass:!rs.network.slow.some(x=>Number(x.ms)>=5000),detail:rs.network.slow[0]?`${Math.round(rs.network.slow[0].ms)} ms · ${endpointName(rs.network.slow[0].url)}`:'keine'}));

 const fails=out.filter(x=>!x.pass&&x.severity!=='warn'),warns=out.filter(x=>!x.pass&&x.severity==='warn'),passed=out.filter(x=>x.pass).length;
 const report={version:SHORT,at:Date.now(),total:out.length,passed,failed:fails.length,warnings:warns.length,ok:fails.length===0,results:out,authorityAware:true};
 try{(__qaTech.qaWindows??=[]).push({start:__qaStart,end:performance.now()});while(__qaTech.qaWindows.length>12)__qaTech.qaWindows.shift()}catch(e){}__qaTech.qaActive=false;
 last=report;try{localStorage.setItem(key(),JSON.stringify(report))}catch(e){}
 return report;
}
function groupData(report){
 const m={};(report?.results||[]).forEach(x=>{const g=m[x.category]??={name:x.category,total:0,passed:0,failed:0,warnings:0,rows:[]};g.total++;g.rows.push(x);if(x.pass)g.passed++;else if(x.severity==='warn')g.warnings++;else g.failed++});
 return Object.values(m);
}
function statusText(r){if(!r)return['PRÜFUNG LÄUFT…','Noch kein Ergebnis.','warn'];if(r.failed)return[`${r.failed} FEHLER GEFUNDEN`,`${r.passed}/${r.total} Tests bestanden · Fehler zuerst beheben.`,'bad'];if(r.warnings)return['STABIL · HINWEISE GEFUNDEN',`${r.passed}/${r.total} Tests bestanden · ${r.warnings} technische Warnungen.`,'warn'];return['ALLE TESTS BESTANDEN!','Kein automatischer Fehler erkannt.','ok']}
function perfMetrics(){
 const t=timerInfo(),r=renderStats(),dom=document.getElementsByTagName('*').length,heap=performance.memory?performance.memory.usedJSHeapSize/1048576:null,long=(tech().longTasks||[]).filter(x=>x.at>Number(tech().startedAt||0)+6000&&Date.now()-x.at<60000&&!window.__V4122_IS_QA_LONG_TASK__?.(x)),ls=localStorageKb();
 const score=Math.max(0,100-Math.min(25,t.dupInts.length*8)-Math.min(20,t.legacy.length*2)-Math.min(15,long.filter(x=>x.duration>150).length*4)-Math.min(20,Math.max(0,r.max.ms-60)/4)-Math.min(20,Math.max(0,dom-5000)/150));
 const state=score>=85?'OPTIMAL':score>=65?'BEOBACHTEN':'BELASTET';
 return{score,state,dom,ints:t.ints.length,timeouts:t.tos.length,dup:t.dupInts.length,legacy:t.legacy.length,legacyListeners:(typeof legacyListenerInfo==='function'?legacyListenerInfo():[]).length,historicScripts:(typeof historicalScriptCount==='function'?historicalScriptCount():0),stale:t.staleTimeouts.length,listeners:(typeof window.__V4122_LIVE_LISTENER_COUNT__==='function'?window.__V4122_LIVE_LISTENER_COUNT__():tech().listeners.size),long:long.length,renderMax:r.max.ms,renderAvg:r.avg,heap,ls,network:network.calls.length,netErrors:network.errors};
}
function ensureScreen(){
 const main=document.querySelector('main');if(!main)return null;
 let sec=document.getElementById('systemtech');if(!sec){sec=document.createElement('section');sec.id='systemtech';sec.className='screen';const footer=document.getElementById('v337LegalFooter');if(footer&&footer.parentElement===main)main.insertBefore(sec,footer);else main.appendChild(sec)}
 if(!sec.dataset.built){sec.dataset.built='1';sec.innerHTML=`<div class="v4107-page">
  <div class="v4107-top"><div class="v4107-brand"><div class="v4107-brand-mark">🌿⚙️</div><div><h1>GROW LEGENDS <span>SYSTEMTEST & TECHNIK</span></h1><p>SERVERAUTORITÄT · SPIELZUSTAND · REAKTIONSZEITEN · UI · FEHLER · PERFORMANCE</p></div></div><div class="v4107-version">V7.214</div></div>
  <div class="v4107-layout">
   <aside class="v4107-sidebar"><div class="v4107-side-title">⚙️ SYSTEMTECHNIK</div>
    <button class="v4107-nav active" data-v4107-jump="status"><i>🧪</i>Systemtest</button>
    <button class="v4107-nav" data-v4107-jump="groups"><i>🎮</i>Spielabläufe</button>
    <button class="v4107-nav" data-v4107-jump="tests"><i>👁️</i>UI & Pixel</button>
    <button class="v4107-nav" data-v4107-jump="performance"><i>⚙️</i>Performance</button>
    <button class="v4107-nav" data-v4107-jump="errors"><i>🛡️</i>Fehlerlog</button>
    <button class="v4107-nav" data-v4107-jump="codedebug"><i>🔎</i>Code-Diagnose</button>
    <div class="v4107-left-foot">Die aktuelle Prüfung ist serverautoritativ und lesend. Sie simuliert keine alten lokalen Käufe, Quests oder Dungeon-Fortschritte.</div>
   </aside>
   <div class="v4107-main">
    <div class="v4107-panel" id="v4107Status"><div class="v4110-loading"><b>🧪 Systemtest wird vorbereitet…</b>Letzter gespeicherter Bericht wird geladen. Danach startet die Tiefenprüfung im Hintergrund.</div></div>
    <div class="v4107-panel" id="v4107Groups"><div class="v4110-loading"><b>🎮 Test-Matrix</b>Bereiche werden geladen…</div></div>
    <div class="v4107-panel" id="v4107Tests"><div class="v4110-loading"><b>🛡️ Fehlerdetails</b>Fehler und Warnungen werden hier immer sichtbar aufgelistet.</div></div>
    <div class="v4107-panel gl-code-diag-shell" id="glCodeDiag"><div class="gl-code-diag-intro"><div><b>🔎 CODE-DIAGNOSE · NUR LESEN</b><span>Findet sichere Konflikte, Timer-/Observer-Hotspots und Owner-Ketten. Es wird nichts gelöscht, repariert oder am Spielstand verändert.</span></div><div class="gl-code-diag-actions"><button class="btn" id="glCodeDiagRun">Diagnose starten</button><button class="btn secondary" id="glCodeDiagCopy" disabled>📋 Bericht kopieren</button></div></div><div id="glCodeDiagBody" class="gl-code-diag-empty">Die Prüfung startet nur auf Knopfdruck, damit im normalen Spiel kein zusätzlicher Hintergrund-Scan läuft.</div><div class="gl-profiler" id="glRuntimeProfiler"><div class="gl-profiler-head"><div><b>⏱️ 30-SEKUNDEN LAUFZEIT-PROFILER · NUR MESSEN</b><span>Misst echte Timer-/MutationObserver-Aufrufe und zentrale Renderer. Während der Messung ruhig durch Startseite → Charakter → Quest → Dungeon → Gilde wechseln.</span></div><div class="gl-profiler-actions"><button class="btn" id="glProfilerStart">▶ 30 s Profil starten</button><button class="btn secondary" id="glProfilerStop" disabled>■ Stop</button><button class="btn secondary" id="glProfilerCopy" disabled>📋 Profil kopieren</button></div></div><div id="glProfilerStatus" class="gl-profiler-status">Noch keine Messung gestartet. Es wird nichts gestoppt, gelöscht oder am Spielstand verändert.</div><div id="glProfilerBody" class="gl-profiler-body"></div></div></div>
   </div>
   <aside class="v4107-right" id="v4107Right"></aside>
  </div>
  <div class="v4107-footerbar" id="v4107Footerbar"></div>
 </div>`;
 sec.addEventListener('click',e=>{
  const b=e.target.closest?.('[data-v4107-jump]');if(b){const map={status:'v4107Status',groups:'v4107Groups',tests:'v4107Tests',performance:'v4107PerfCard',errors:'v4107ErrorCard',codedebug:'glCodeDiag'};document.getElementById(map[b.dataset.v4107Jump])?.scrollIntoView({behavior:'smooth',block:'start'});sec.querySelectorAll('.v4107-nav').forEach(x=>x.classList.toggle('active',x===b));return}
  const g=e.target.closest?.('[data-v4107-group]');if(g){selectedGroup=decodeURIComponent(g.dataset.v4107Group);renderPage(last||fullReport());document.getElementById('v4107Tests')?.scrollIntoView({behavior:'smooth',block:'start'});return}
  const f=e.target.closest?.('[data-v4107-filter]');if(f){filter=f.dataset.v4107Filter;renderPage(last||fullReport());return}
  if(e.target.closest?.('#v4107Run')){renderLoading();void runAndRender(true);return}
  if(e.target.closest?.('#v7173Hydrate')){renderLoading();void (async()=>{try{await window.v7133HydrateAllCore?.();await window.v7084RunSystemTest?.(false);last=fullReport();renderPage(last);try{window.v063Toast?.('🛡️ Serverstand geladen','success','Kanonische Zustände wurden neu vom Server übernommen.')}catch(_){}}catch(err){renderFatal(err)}})();return}
  if(e.target.closest?.('#v4107Clear')){try{localStorage.removeItem(runtimeKey());localStorage.removeItem(`growLegendsQA:v4106:${owner()}:runtime`)}catch(_){}errlog.length=0;renderPage(last||fullReport());return}
  if(e.target.closest?.('#v4107Copy')){copyReport(last||fullReport());return}
 });
 }
 return sec
}
function cachedReport(){
 try{const r=JSON.parse(localStorage.getItem(key())||'null');return r&&Array.isArray(r.results)?r:null}catch(e){return null}
}
function problemSummaryHtml(r){
 const all=(r?.results||[]).filter(x=>!x.pass),fails=all.filter(x=>x.severity!=='warn'),warns=all.filter(x=>x.severity==='warn');
 if(!fails.length&&!warns.length)return `<div class="v4110-problems clean"><div class="v4110-problems-head"><b>✅ AKTUELLE FEHLER</b><span>0 Fehler · 0 Warnungen</span></div><div class="v4107-clean">Kein automatischer Fehler im letzten vollständigen Lauf.</div></div>`;
 const rows=[...fails,...warns].slice(0,30);
 return `<div class="v4110-problems ${fails.length?'':'warnonly'}"><div class="v4110-problems-head"><b>${fails.length?'❌ AKTUELLE FEHLER':'⚠️ AKTUELLE WARNUNGEN'}</b><span>${fails.length} Fehler · ${warns.length} Warnungen</span></div>${rows.map(x=>`<div class="v4110-problem-row ${x.severity==='warn'?'warn':''}"><span class="ico">${x.severity==='warn'?'⚠️':'❌'}</span><div><b>${esc(x.category)} · ${esc(x.name)}</b>${x.detail?`<small>${esc(x.detail)}</small>`:''}</div><em>${x.severity==='warn'?'WARNUNG':'FEHLER'}</em></div>`).join('')}${all.length>30?`<div class="v4110-loading">Weitere ${all.length-30} Meldungen stehen in der jeweiligen Testgruppe.</div>`:''}</div>`
}
function renderFatal(e){
 const msg=String(e?.stack||e?.message||e||'Unbekannter Fehler');
 const status=document.getElementById('v4107Status'),groups=document.getElementById('v4107Groups'),tests=document.getElementById('v4107Tests'),right=document.getElementById('v4107Right');
 if(status)status.innerHTML=`<div class="v4110-fatal"><b>❌ SYSTEMTECHNIK KONNTE DEN TEST NICHT VOLLSTÄNDIG RENDERN</b><small>${esc(msg)}</small></div>`;
 if(groups)groups.innerHTML='<div class="v4110-loading"><b>Testlauf abgebrochen</b>Die Seite bleibt sichtbar. Der technische Fehler steht oben und kann gemeldet werden.</div>';
 if(tests)tests.innerHTML='<div class="v4110-loading"><b>Keine leere Fehlerseite mehr</b>Ein interner Testfehler wird jetzt selbst als Fehler angezeigt.</div>';
 if(right)right.innerHTML=`<div class="v4107-right-card"><h3>🛡️ TEST-ENGINE-FEHLER</h3><div class="v4110-fatal"><small>${esc(msg)}</small></div></div>`;
 try{pushErr('SYSTEMTECH_RENDER_ERROR',msg,'error')}catch(_){}
}
function renderLoading(){
 const status=document.getElementById('v4107Status');if(status&&!status.querySelector('.v4107-status'))status.innerHTML='<div class="v4110-loading"><b>🧪 Tiefentest läuft…</b>Die letzten bekannten Fehler werden zuerst angezeigt; der neue vollständige Bericht folgt automatisch.</div>'
}
let v4110RunPending=false;
async function runAndRender(force=false){
 if(v4110RunPending){const cached=last||cachedReport();if(cached){try{renderPage(cached)}catch(e){renderFatal(e)}}return}
 const cached=last||cachedReport();
 if(cached&&!force){try{last=cached;renderPage(cached)}catch(e){renderFatal(e);return}}
 else renderLoading();
 v4110RunPending=true;
 try{
  const jobs=[];
  if(typeof window.v7084RunSystemTest==='function')jobs.push(Promise.resolve(window.v7084RunSystemTest(false)));
  if(typeof window.v7098RefreshServerQA==='function')jobs.push(Promise.resolve(window.v7098RefreshServerQA(!!force)));
  if(jobs.length)await Promise.allSettled(jobs);
  const r=fullReport();renderPage(r);
 }catch(e){renderFatal(e)}
 finally{v4110RunPending=false}
}
function rowsForGroup(g){
 let rows=g?.rows||[];if(filter==='problems')rows=rows.filter(x=>!x.pass);else if(filter==='errors')rows=rows.filter(x=>!x.pass&&x.severity!=='warn');else if(filter==='warnings')rows=rows.filter(x=>!x.pass&&x.severity==='warn');
 if(!rows.length&&filter!=='all')return `<div class="v4107-clean">✅ In diesem Filter keine Treffer.</div>`;
 return `<div class="v4107-test-list">${rows.map(x=>`<div class="v4107-test-row ${x.pass?'':x.severity==='warn'?'warn':'fail'}"><div class="ico">${x.pass?'✅':x.severity==='warn'?'⚠️':'❌'}</div><div><b>${esc(x.name)}</b>${x.detail?`<small>${esc(x.detail)}</small>`:''}</div><em>${x.pass?'OK':x.severity==='warn'?'WARNUNG':'FEHLER'}</em></div>`).join('')}</div>`
}
function renderPage(r){
 const sec=ensureScreen();if(!sec||!r)return;
 const groups=groupData(r);if(!selectedGroup||!groups.some(x=>x.name===selectedGroup)){selectedGroup=(groups.find(x=>x.failed)?.name||groups.find(x=>x.warnings)?.name||groups[0]?.name||'')}
 const st=statusText(r),pct=r.total?Math.round(r.passed/r.total*100):0;
 const status=document.getElementById('v4107Status');if(status)status.innerHTML=`<div class="v4107-status" data-v4107-anchor="status"><div class="v4107-shield">${r.failed?'!':'✓'}</div><div class="v4107-status-copy"><small>SYSTEMSTATUS</small><h2 class="${st[2]==='bad'?'v4107-bad':st[2]==='warn'?'v4107-warn':'v4107-ok'}">${esc(st[0])}</h2><p>${esc(st[1])}</p></div><div class="v4107-score"><small>TESTABDECKUNG</small><strong>${pct}%</strong><span>${r.passed} / ${r.total}</span></div><div class="v4107-progress"><i style="width:${pct}%"></i></div></div><div class="v4107-summary"><div class="v4107-stat"><small>TESTS</small><b>${r.total}</b></div><div class="v4107-stat"><small>BESTANDEN</small><b class="v4107-ok">${r.passed}</b></div><div class="v4107-stat"><small>WARNUNGEN</small><b class="v4107-warn">${r.warnings}</b></div><div class="v4107-stat"><small>FEHLER</small><b class="v4107-bad">${r.failed}</b></div></div><div class="v4107-actions"><button class="btn" id="v4107Run">↻ Tests erneut starten</button><button class="btn secondary" id="v7173Hydrate">🛡️ Serverstand neu laden</button><button class="btn secondary" id="v4107Copy">📋 Bericht kopieren</button><button class="btn secondary" id="v4107Clear">🧹 Fehlerlog löschen</button></div>${problemSummaryHtml(r)}`;
 const grp=document.getElementById('v4107Groups');if(grp)grp.innerHTML=`<div class="v4107-section-head"><h3>TEST-MATRIX · ${groups.length} BEREICHE</h3><span>Gruppe antippen für Details</span></div><div class="v4107-groups">${groups.map(g=>`<div class="v4107-group ${g.name===selectedGroup?'active':''}" data-v4107-group="${encodeURIComponent(g.name)}"><div class="v4107-group-top"><div class="v4107-group-title">${esc(g.name)}</div><div class="v4107-group-score">${g.passed}/${g.total}</div></div><div class="v4107-group-mini"><span>${g.passed} ✅</span>${g.warnings?` · <span class="warn">${g.warnings} ⚠️</span>`:''}${g.failed?` · <span class="fail">${g.failed} ❌</span>`:''}<br>${g.failed?'Fehler vorhanden':g.warnings?'Technische Hinweise':'Bereich ohne Fehler'}</div></div>`).join('')}</div>`;
 const cur=groups.find(x=>x.name===selectedGroup);const tests=document.getElementById('v4107Tests');if(tests)tests.innerHTML=`<div class="v4107-section-head"><h3>${esc(selectedGroup||'TESTDETAILS')}</h3><span>${cur?.total||0} Prüfungen</span></div><div class="v4107-test-tools"><button class="v4107-filter ${filter==='problems'?'active':''}" data-v4107-filter="problems">FEHLER + WARNUNGEN</button><button class="v4107-filter ${filter==='errors'?'active':''}" data-v4107-filter="errors">NUR FEHLER</button><button class="v4107-filter ${filter==='warnings'?'active':''}" data-v4107-filter="warnings">NUR WARNUNGEN</button><button class="v4107-filter ${filter==='all'?'active':''}" data-v4107-filter="all">ALLE</button></div>${rowsForGroup(cur)}`;
 renderRight(r);
 const foot=document.getElementById('v4107Footerbar'),pm=perfMetrics();if(foot)foot.innerHTML=`<span>✅ QA <b>${r.passed}/${r.total}</b></span><span>❌ Fehler <b>${r.failed}</b></span><span>⚠️ Warnungen <b>${r.warnings}</b></span><span>⚡ Render <b>${pm.renderMax.toFixed(0)} ms</b></span><span>🧠 Speicher <b>${pm.heap==null?'—':pm.heap.toFixed(0)+' MB'}</b></span><span>🛡️ Wächter <b>AKTIV</b></span>`;
 paintSettingsBadge(r);
}
function renderRight(r){
 const box=document.getElementById('v4107Right');if(!box)return;const p=perfMetrics(),logs=allRuntime(),ti=timerInfo(),errors=logs.filter(x=>x.severity!=='warn'),rs=reactionStats();
 const needle=-70+Math.min(100,p.score)*1.4;
 const check=(ok,label,val)=>`<div class="v4107-check"><span>${ok?'✅':'⚠️'}</span><span>${esc(label)}</span><span class="${ok?'v4107-ok':'v4107-warn'}">${esc(val)}</span></div>`;
 box.innerHTML=`<div class="v4107-right-card" id="v4107PerfCard"><h3>⚡ PERFORMANCE</h3><div class="v4107-gauge"><div class="v4107-gauge-ring"></div><div class="v4107-gauge-needle" style="transform:rotate(${needle}deg)"></div><div class="v4107-gauge-dot"></div></div><div class="v4107-perf-state">${esc(p.state)} · ${Math.round(p.score)}%</div><div class="v4107-metrics"><span>DOM-Knoten</span><b>${p.dom.toLocaleString('de-DE')}</b><span>Intervalle</span><b class="${p.ints>45?'warn':''}">${p.ints}</b><span>Timeouts</span><b>${p.timeouts}</b><span>Listener</span><b>${p.listeners}</b><span>Render max</span><b class="${p.renderMax>120?'warn':''}">${p.renderMax.toFixed(0)} ms</b><span>JS-Speicher</span><b>${p.heap==null?'—':p.heap.toFixed(0)+' MB'}</b><span>LocalStorage</span><b>${p.ls} KB</b><span>Netzwerkaufrufe</span><b>${p.network}</b><span>Legacy-Listener</span><b class="${p.legacyListeners?'warn':''}">${p.legacyListeners}</b><span>Historische Scripts</span><b class="${p.historicScripts>120?'warn':''}">${p.historicScripts}</b></div></div>
 <div class="v4107-right-card"><h3>🧹 HINTERGRUND-CHECK</h3><div class="v4107-checks">${check(!p.dup,'Doppelte Timer',p.dup)}${check(!p.legacy,'Legacy-Timer aktiv',p.legacy)}${check(!p.legacyListeners,'Legacy-Listener aktiv',p.legacyListeners)}${check(!p.stale,'Verwaiste Timeouts',p.stale)}${check(!imageProblems().length,'Kaputte Bilder',imageProblems().length)}${check(duplicateIds().length===0,'Doppelte DOM-IDs',duplicateIds().length)}${check(network.errors===0,'Netzwerkfehler',network.errors)}</div>${ti.legacy.length?`<div class="v4107-legacy-list"><b>Aktive alte Timer:</b>${ti.legacy.slice(0,5).map(x=>`<small>${esc((x.callback||x.site||'Timer').slice(0,80))} · ${x.delay} ms</small>`).join('')}</div>`:''}${(typeof legacyListenerInfo==='function'?legacyListenerInfo():[]).length?`<div class="v4107-legacy-list"><b>Aktive alte Listener:</b>${(typeof legacyListenerInfo==='function'?legacyListenerInfo():[]).slice(0,5).map(x=>`<small>${esc((x.handler||x.site||'Listener').slice(0,80))}</small>`).join('')}</div>`:''}</div>
 <div class="v4107-right-card" id="v4107ErrorCard"><h3>🛡️ LETZTE FEHLER / WARNUNGEN</h3>${logs.length?`<div class="v4107-log">${logs.slice(-10).reverse().map(x=>`<div class="v4107-log-row ${x.severity==='warn'?'warn':'err'}"><b>${esc(x.code||'MELDUNG')}</b><small>${new Date(x.at||Date.now()).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',second:'2-digit'})} · ${esc(x.detail||'')}</small></div>`).join('')}</div>`:`<div class="v4107-clean">✅ Keine Laufzeitfehler erkannt</div>`}</div>`;
 const netRows=rs.network.slow.map(x=>`<small>${Math.round(Number(x.ms)||0)} ms · ${esc(endpointName(x.url))}</small>`).join('');
 const uiRows=rs.ui.slow.map(x=>`<small>${Math.round(Number(x.ms)||0)} ms · ${esc(x.screen)} · ${esc(x.name)}</small>`).join('');
 box.insertAdjacentHTML('beforeend',`<div class="v4107-right-card" id="v7170ReactionCard"><h3>⏱️ REAKTIONSMONITOR</h3><div class="v4107-metrics"><span>Netz P50</span><b>${rs.network.p50} ms</b><span>Netz P95</span><b class="${rs.network.p95>=2500?'warn':''}">${rs.network.p95} ms</b><span>Netz Max</span><b class="${rs.network.max>=5000?'warn':''}">${rs.network.max} ms</b><span>UI P50</span><b>${rs.ui.p50} ms</b><span>UI P95</span><b class="${rs.ui.p95>=200?'warn':''}">${rs.ui.p95} ms</b><span>UI Max</span><b class="${rs.ui.max>=500?'warn':''}">${rs.ui.max} ms</b></div>${netRows?`<div class="v4107-legacy-list"><b>Langsame Server-/Netzwerkaufrufe:</b>${netRows}</div>`:''}${uiRows?`<div class="v4107-legacy-list"><b>Langsame UI-Reaktionen:</b>${uiRows}</div>`:''}<div class="v4107-clean">${reaction.eventTiming?'Browser Event Timing aktiv':'RAF-Fallback aktiv'} · Messung läuft ereignisbasiert ohne zusätzlichen Dauer-Renderer.</div></div>`);
 const act=actionStats();
 const actionRows=act.slow.map(x=>`<small>${Math.round(Number(x.totalMs)||0)} ms · ${esc(x.label)} · ${esc(x.cause)}${x.networkMaxMs?` · Netz max ${Math.round(x.networkMaxMs)} ms`:''}${x.firstPaintMs?` · Paint ${Math.round(x.firstPaintMs)} ms`:''}${x.endpoints?.length?` · ${esc(x.endpoints.join(', '))}`:''}</small>`).join('');
 box.insertAdjacentHTML('beforeend',`<div class="v4107-right-card" id="v7174ActionCard"><h3>🎮 AKTIONS-LATENZ</h3><div class="v4107-metrics"><span>Aktionen</span><b>${act.count}</b><span>P50 gesamt</span><b>${act.p50} ms</b><span>P95 gesamt</span><b class="${act.p95>=1500?'warn':''}">${act.p95} ms</b><span>Max</span><b class="${act.max>=5000?'warn':''}">${act.max} ms</b><span>Gerade offen</span><b>${act.active}</b><span>Letzte Ursache</span><b>${esc(act.last?.cause||'—')}</b></div>${actionRows?`<div class="v4107-legacy-list"><b>Langsamste gemessene Aktionen:</b>${actionRows}</div>`:''}<div class="v4107-clean">Misst Klick → Server/Netz → nächster stabiler Paint. Keine Polling-Schleife.</div></div>`);
 const ad=(()=>{try{return window.v7133AuthorityDiagnostics?.()||null}catch(_){return null}})(),ap=window.__V7133_AUTHORITY_POLICY__||null;
 if(ad){const ds=ad.domains||{},enf=Object.values(ds).filter(x=>String(x)==='enforce').length,total=Object.keys(ds).length;box.insertAdjacentHTML('beforeend',`<div class="v4107-right-card" id="v7173AuthorityCard"><h3>🛡️ AUTHORITY-WÄCHTER</h3><div class="v4107-metrics"><span>Domains enforce</span><b class="${enf===22?'':'bad'}">${enf}/22</b><span>Fail-Closed</span><b>${ap?.unknownAuthority==='fail-closed'?'JA':'NEIN'}</b><span>Alte Cloud-Writes blockiert</span><b>${Number(ad.legacyCloudWritesSuppressed)||0}</b><span>Alte Restores blockiert</span><b>${Number(ad.legacyCloudAppliesBlocked)||0}</b><span>Local-Fallbacks blockiert</span><b>${Number(ad.legacyGameplayFallbacksBlocked)||0}</b><span>Rehydrations</span><b>${Number(ad.rehydrates)||0}</b><span>Legacy-Dampf</span><b class="${ad.legacyEnergyGuarded&&ad.legacyDampfResetGuarded?'':'bad'}">${ad.legacyEnergyGuarded&&ad.legacyDampfResetGuarded?'BLOCKIERT':'OFFEN'}</b><span>Legacy-Tagesreset</span><b class="${ad.legacyMidnightGuarded&&ad.legacyWorldbossResetGuarded?'':'bad'}">${ad.legacyMidnightGuarded&&ad.legacyWorldbossResetGuarded?'BLOCKIERT':'OFFEN'}</b><span>Alter Whole-Save-Monitor</span><b>${ad.legacySaveMonitorRetired?'BEENDET':'läuft bis Authority bereit'}</b><span>Login Whole-Save-Restore</span><b class="${ad.accountResolverGuarded?'':'bad'}">${ad.accountResolverGuarded?'BLOCKIERT':'OFFEN'}</b></div><div class="v4107-clean">${enf===22&&ad.cloudWriterGuarded&&ad.cloudApplyGuarded&&ad.accountResolverGuarded&&ad.legacyEnergyGuarded&&ad.legacyDampfResetGuarded&&ad.legacyMidnightGuarded&&ad.legacyWorldbossResetGuarded?'Server ist alleinige Gameplay-Wahrheit':'Authority-Schutz unvollständig – Systemtest starten'}</div></div>`)}
 const rg=(()=>{try{return window.__V477_RUNTIME_DIAGNOSTICS__?.()||null}catch(_){return null}})(),lg=window.__V7173_LEGACY_LOCAL_GUARD__||null;
 if(rg){const tops=(rg.top||[]).slice(0,6).map(x=>`<small>${esc(x.site)} · ${Math.round(x.actualDelay)} ms · ${Number(x.calls)||0}× · ${Number(x.cpuMs||0).toFixed(1)} ms CPU${x.nativeBypass?' · COMBAT':''}</small>`).join('');box.insertAdjacentHTML('beforeend',`<div class="v4107-right-card" id="v7173RuntimeTimerCard"><h3>⏱️ ECHTE RUNTIME-TIMER</h3><div class="v4107-metrics"><span>Aktive Intervalle</span><b>${rg.activeIntervals}</b><span>Aktive Observer</span><b>${rg.activeObservers}</b><span>&lt;500 ms ungegoverned</span><b class="${rg.fastNonCombat?'warn':''}">${rg.fastNonCombat}</b><span>Native Combat-Timer</span><b>${rg.nativeCombat}</b><span>Callback-Aufrufe</span><b>${rg.calls}</b><span>Gemessene CPU</span><b>${Number(rg.cpuMs||0).toFixed(1)} ms</b></div>${tops?`<div class="v4107-legacy-list"><b>Aktivste Timer:</b>${tops}</div>`:''}${lg?`<div class="v4107-clean">Legacy lokal aktiv: Dampf ${lg.v026TimerActive?'JA':'NEIN'} · Mitternacht ${lg.v127TimerActive?'JA':'NEIN'} · Weltboss ${lg.v112TimerActive?'JA':'NEIN'} · beendet ${Number(lg.retiredTimers)||0}</div>`:''}</div>`)}
}
function copyReport(r){
 const groups=groupData(r),p=perfMetrics(),logs=allRuntime(),rs=reactionStats(),as=actionStats();
 const diag=typeof window.v4123TimerDiagnostics==='function'?window.v4123TimerDiagnostics().slice(0,8):[],slow=typeof window.v4123SlowRenders==='function'?window.v4123SlowRenders().slice(-6):[];const text=[`Grow Legends ${SHORT} – Systemtechnik`,`Tests: ${r.total} | Bestanden: ${r.passed} | Fehler: ${r.failed} | Warnungen: ${r.warnings}`,`Performance: ${p.state} ${Math.round(p.score)}% | DOM ${p.dom} | Intervalle ${p.ints} | Listener ${p.listeners} | Render max ${p.renderMax.toFixed(1)} ms`,`Reaktion: Netz P50 ${rs.network.p50} ms | P95 ${rs.network.p95} ms | Max ${rs.network.max} ms | UI P50 ${rs.ui.p50} ms | P95 ${rs.ui.p95} ms | Max ${rs.ui.max} ms`,`Aktionen: P50 ${as.p50} ms | P95 ${as.p95} ms | Max ${as.max} ms | Samples ${as.count}`,'',...groups.map(g=>`${g.name}: ${g.passed}/${g.total} | Fehler ${g.failed} | Warnungen ${g.warnings}`),'',...r.results.filter(x=>!x.pass).map(x=>`${x.severity==='warn'?'WARN':'FEHLER'} | ${x.category} | ${x.name}${x.detail?' | '+x.detail:''}`),'',...logs.slice(-20).map(x=>`RUNTIME | ${x.code} | ${x.detail}`),...(as.slow.length?['','LANGSAME AKTIONEN',...as.slow.map(x=>`AKTION | ${x.totalMs} ms | ${x.label} | ${x.cause} | Netz max ${x.networkMaxMs||0} ms | Paint ${x.firstPaintMs||0} ms | ${(x.endpoints||[]).join(', ')}`)]:[]),...(diag.length?['','TIMER-DIAGNOSE',...diag.map(x=>`TIMER | ${x.kind||'timer'} | ${x.count} aktiv | ${x.delay} ms | calls ${x.calls||0} | CPU ${Number(x.cpu||0).toFixed(1)} ms | max ${Number(x.max||0).toFixed(1)} ms${x.nativeBypass?' | NATIVE':''} | ${x.callback} | ${x.site}`)]:[]),...(slow.length?['','LANGSAME RENDER',...slow.map(x=>`RENDER | ${x.name} | ${Number(x.ms).toFixed(1)} ms | Seite ${x.screen}`)]:[])].join('\n');
 try{navigator.clipboard?.writeText(text).then(()=>window.v063Toast?.('QA-Bericht kopiert','success','Kann direkt geschickt werden.')).catch(()=>{})}catch(e){}
}
function openPage(){
 if(typeof v093IsAdmin==='undefined'||v093IsAdmin!==true)return false;
 const sec=ensureScreen();if(!sec)return false;
 lastNav=document.querySelector('section.screen.active')?.id||'world';
 try{v032Go('systemtech')}catch(e){document.querySelectorAll('section.screen').forEach(x=>x.classList.remove('active'));sec.classList.add('active')}
 runAndRender();return true
}
function installMenu(){
 const admin=typeof v093IsAdmin!=='undefined'&&v093IsAdmin===true;
 const panel=document.getElementById('v032MenuPanel');
 if(!admin){panel?.querySelectorAll('[data-screen="systemtech"]').forEach(x=>x.remove());document.getElementById('v4104QaRow')?.remove();return}
 if(panel&&!panel.querySelector('[data-screen="systemtech"]')){const b=document.createElement('button');b.className='top-menu-item';b.dataset.screen='systemtech';b.innerHTML='<span>⚙️</span>Systemtechnik';b.onclick=()=>openPage();panel.appendChild(b)}
 /* V4.160: keep Systemtechnik out of the settings dropdown even for admins. */
 document.getElementById('v4104QaRow')?.remove();
}
function paintSettingsBadge(r=last){
 const b=document.getElementById('v4104QaStatus');if(!b||!r)return;b.className='';if(r.failed){b.classList.add('bad');b.textContent=`${r.failed} FEHLER`}else if(r.warnings){b.classList.add('warn');b.textContent=`${r.warnings} WARN.`}else{b.classList.add('ok');b.textContent='OK'}
}
function scheduleRender(){if(renderTimer)return;renderTimer=setTimeout(()=>{renderTimer=0;if(document.getElementById('systemtech')?.classList.contains('active'))renderPage(last||fullReport());paintSettingsBadge(last)},250)}
/* Catch future browser/runtime errors. */
window.addEventListener('error',e=>pushErr('JS_ERROR',`${e.message||'Fehler'}${e.filename?` · ${String(e.filename).split('/').pop()}:${e.lineno||0}`:''}`,'error'));
window.addEventListener('unhandledrejection',e=>pushErr('UNHANDLED_REJECTION',String(e.reason?.message||e.reason||'Promise abgelehnt'),'error'));
/* Network timing without changing request semantics. */
try{if(typeof window.fetch==='function'&&!window.fetch.__v4107){
 const nf=window.fetch.bind(window),w=async function(){
  const started=performance.now();let ok=false,status=0,url='',retried=false,expectedRpcReject=false,action=null;
  const input=arguments[0],init=arguments[1]||{};
  let method=String(init?.method||input?.method||'GET').toUpperCase();
  try{
   url=String(input?.url||input||'').slice(0,180);
   action=actionNetworkStart(url,method);
   /* Safe transport retry only for idempotent GETs. PvP cooldown reads can
      sporadically fail before reaching Supabase; a single retry hides that hiccup. */
   const canRetry=method==='GET'&&/\/rest\/v1\/(?:player_saves|pvp_attacks)(?:\?|$)/i.test(url);
   let r;
   try{r=await nf(...arguments)}catch(first){
    if(!canRetry)throw first;
    retried=true;await new Promise(resolve=>setTimeout(resolve,/pvp_attacks/i.test(url)?180:350));r=await nf(...arguments);
   }
   ok=r.ok;status=r.status;
   if(status===400&&/\/rest\/v1\/rpc\/v254_(?:buy_guild_upgrade|set_guild_signup)(?:\?|$)/.test(url)){
    try{const body=await r.clone().text();if(/Nicht genug Gilden-Buds|Gildenkrieg-Anmeldung.*geschlossen/i.test(body))expectedRpcReject=true}catch(_){}}
   if(retried){network.retries=(network.retries||0)+1}
   return r;
  }catch(e){network.errors++;pushErr('NETWORK_ERROR',`${url} · ${e.message||e}`,'warn');throw e}
  finally{
   const ms=performance.now()-started;
   network.calls.push({at:Date.now(),url,ms,status,ok,retried,actionId:action?.id||0});while(network.calls.length>120)network.calls.shift();
   actionNetworkDone(action,ms,status);
   if(ms>2500){network.slow++;pushErr('SLOW_NETWORK',`${Math.round(ms)} ms · ${url}`,'warn')}
   if(status>=400&&!expectedRpcReject){network.errors++;pushErr('HTTP_'+status,url,'warn')}
   else if(status>=400&&expectedRpcReject){pushErr('RPC_REJECTED',url,'warn')}
  }
 };
 w.__v4107=true;w.__v4123PlayerSaveGetRetry=true;w.__v7174PvpGetRetry=true;window.fetch=w
}}catch(e){}
/* Cache Storage estimate where supported. */
try{navigator.storage?.estimate?.().then(x=>storageEstimate=x).catch(()=>{})}catch(e){}
/* Make Systemtechnik the canonical QA destination. */
window.v4107RunQA=fullReport;window.v4107OpenSystemtechnik=openPage;window.v4102OpenQA=openPage;window.v4102RunQA=(opts={})=>{const r=fullReport();if(opts.open)openPage();return r};
/* Keep our page integrated with the many historical navigation wrappers. */
try{if(typeof v032Go==='function'&&!window.__v4107Go){const base=v032Go;const wrap=function(id){ensureScreen();installMenu();if(id==='systemtech'&&(typeof v093IsAdmin==='undefined'||v093IsAdmin!==true))return base.call(this,'world');let p0=null,sig='';try{const pf=window.v4125StableCombatPower;p0=typeof pf==='function'?Number(pf()):(typeof combatPower==='function'?Number(combatPower()):null);sig=corePowerSignature()}catch(e){}const r=base.apply(this,arguments);if(id==='systemtech')setTimeout(runAndRender,0);else lastNav=id||lastNav;setTimeout(()=>{try{if(id!=='systemtech'&&p0!=null&&sig===corePowerSignature()){const pf=window.v4125StableCombatPower;const p1=typeof pf==='function'?Number(pf()):Number(combatPower());if(Number.isFinite(p1)&&p1!==p0)pushErr('POWER_NAVIGATION_DRIFT',`Kampfkraft änderte sich nur durch Seitenwechsel: ${p0} → ${p1}`,'warn')}}catch(e){}},180);return r};v032Go=wrap;window.v032Go=wrap;window.__v4107Go=true}}catch(e){}
/* Lightweight live refresh; no full source scan unless Systemtechnik is open. */
setInterval(()=>{try{
 const st=!!document.getElementById('systemtech')?.classList.contains('active');
 const sm=!!document.getElementById('v141SettingsMenu')?.classList.contains('open');
 if(document.hidden||(!st&&!sm))return;
 installMenu();paintSettingsBadge(last);
 if(st){const r=last||cachedReport();if(r)renderRight(r)}
}catch(e){}},6000);
function stamp(){}
ensureScreen();installMenu();stamp();
setTimeout(()=>{try{const c=cachedReport();if(c){last=c;paintSettingsBadge(c);if(document.getElementById('systemtech')?.classList.contains('active'))renderPage(c)}}catch(e){pushErr('QA_CACHE_ERROR',e.message||String(e),'warn')}},2600); /* V4.159: never run ~3k QA tests during normal boot/login. */
window.addEventListener('growlegends:account-ready',()=>{stamp();installMenu()},{passive:true});
window.addEventListener('pageshow',()=>{stamp();installMenu();setTimeout(()=>{try{const c=last||cachedReport();if(c){last=c;paintSettingsBadge(c)}}catch(e){}},700)},{passive:true}); /* V4.159: no full QA on pageshow. */
document.addEventListener('visibilitychange',()=>{if(!document.hidden){stamp();installMenu();scheduleRender()}},{passive:true});
})();
