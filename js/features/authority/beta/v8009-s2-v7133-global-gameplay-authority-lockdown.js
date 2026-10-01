(()=>{
'use strict';
if(window.__V7133_GLOBAL_AUTHORITY_LOCKDOWN__)return;
window.__V7133_GLOBAL_AUTHORITY_LOCKDOWN__=true;
const VERSION='V7.214'; /* consolidated gameplay authority owner */
const GAMEPLAY_DOMAINS=Object.freeze([
 'achievements','billing','build','daily','dungeon','endgame','grow_dealer','grow_orders','guild','items','liveops',
 'pets','profile','progress','pvp','quest','seeds','shop','social','tower','weekly','worldboss'
]);
const CAP_NAMES=new Set([
 'items','grow','grow_orders','tower','weekly','worldboss','daily','endgame','pets','achievements','progress',
 'guild_rewards','guild','social','billing','shop','grow_dealer','profile','liveops','quest','dungeon','pvp','build','seeds'
]);
const D={fullAuthority:false,fullAuthorityChecks:0,legacyCloudWritesSuppressed:0,legacyCloudAppliesBlocked:0,legacyGameplayFallbacksBlocked:0,
 dungeonRoutes:0,pvpRoutes:0,buildRoutes:0,legacyLegendarySeedBlocks:0,legacyKeyBlocks:0,rehydrates:0,fullHydrates:0,coreHydrating:false,lastFullHydrateAt:0,suppressedHydrates:0,lastCloudApplyBlockAt:0,lastError:'',lastDomains:{},localDailyGuardVersion:'V7.174'};
let hydrateTimer=0,buildChain=Promise.resolve();
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const auth=()=>!!uid();
const one=d=>Array.isArray(d)?d[0]:d;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
const toast=(t,type='info',d='')=>{try{return window.v063Toast?.(t,type,d)}catch(_){try{return window.v115Alert?.(d||t,t,type)}catch(__){}}};
const stop=e=>{try{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}catch(_){}};
function serialBuild(fn){const run=()=>Promise.resolve().then(fn);buildChain=buildChain.then(run,run);return buildChain}
function mapCapToDomain(name){
 const n=String(name||'');
 if(n==='grow')return'seeds';
 if(n==='guild_rewards')return'guild';
 return n;
}
function currentDomains(){
 try{return clone(window.v7040AuthorityDiagnostics?.()?.domains||{})}catch(_){return{}}
}
function allEnforced(domains){return GAMEPLAY_DOMAINS.every(d=>String(domains?.[d]||'')==='enforce')}
function authorityKnownEnforced(){const d=currentDomains();return !!D.fullAuthority||allEnforced(d)}
async function refreshAuthority(){
 if(!auth())return false;
 try{await window.v7040AuthorityRefresh?.()}catch(_){ }
 try{await window.v7081CapabilitiesRefresh?.()}catch(_){ }
 const domains=currentDomains();D.fullAuthorityChecks++;D.lastDomains=domains;
 if(allEnforced(domains))D.fullAuthority=true;
 return D.fullAuthority;
}

/* Global fail-closed capability owner.
   For an authenticated account this game no longer permits a temporary return to
   historical local gameplay while capability RPCs are still connecting. */
const previousUseAuthority=window.v7081UseAuthority;
window.v7081UseAuthority=function(name){
 const n=String(name||'');
 if(auth()&&CAP_NAMES.has(n))return true;
 try{return typeof previousUseAuthority==='function'?!!previousUseAuthority(n):false}catch(_){return false}
};

/* player_saves is compatibility/backup only after all 22 domains are confirmed
   enforce. Stop the old monolithic cloud writer from touching it during gameplay. */
const previousCloudWrite=window.v075WriteCloudSave||((typeof v075WriteCloudSave==='function')?v075WriteCloudSave:null);
if(typeof previousCloudWrite==='function'){
 const cloudOwner=async function(force=false){
   if(auth()&&authorityKnownEnforced()){D.legacyCloudWritesSuppressed++;return true}
   return previousCloudWrite.apply(this,arguments);
 };
 cloudOwner.__v7133AuthorityLock=true;cloudOwner.__v7133Base=previousCloudWrite;
 window.v075WriteCloudSave=cloudOwner;try{v075WriteCloudSave=cloudOwner}catch(_){ }
}

/* V7.174: once all gameplay domains are enforced, player_saves/local snapshots are
   compatibility caches only. A late legacy cloud/local restore must never replace the
   canonical runtime state. Block the apply and rehydrate the active server domain. */
const previousCloudApply=window.v075ApplyCloudSave||((typeof v075ApplyCloudSave==='function')?v075ApplyCloudSave:null);
if(typeof previousCloudApply==='function'){
 const applyOwner=async function(data){
   if(auth()&&authorityKnownEnforced()){
     D.legacyCloudAppliesBlocked++;D.lastCloudApplyBlockAt=Date.now();
     scheduleHydrate();
     return true;
   }
   return previousCloudApply.apply(this,arguments);
 };
 applyOwner.__v7133CloudApplyLock=true;applyOwner.__v7133Base=previousCloudApply;
 window.v075ApplyCloudSave=applyOwner;try{v075ApplyCloudSave=applyOwner}catch(_){ }
}

async function rpc(name,args={}){
 const x=db();if(!x||!auth())throw new Error('SERVER_NOT_READY');
 const {data,error}=await x.rpc(name,args);if(error)throw error;return one(data);
}
async function requireDomain(domain){
 if(!auth())return false;
 let domains=currentDomains();
 if(String(domains?.[domain]||'')!=='enforce'){
   await refreshAuthority();domains=currentDomains();
 }
 if(String(domains?.[domain]||'')!=='enforce')throw new Error('AUTHORITY_NOT_READY:'+domain);
 return true;
}

/* Build was the last major bridge that still explicitly called its original local
   function when its gate had not loaded. Warm its server gate first; never allow
   that local fallback for authenticated gameplay. */
function protectBuildFunction(name){
 const base=window[name]||((typeof globalThis[name]==='function')?globalThis[name]:null);
 if(typeof base!=='function'||base.__v7133BuildLock)return;
 const wrapped=function(){const ctx=this,args=arguments;return serialBuild(async()=>{
   if(!auth())return base.apply(ctx,args);
   try{
     await requireDomain('build');
     await window.v7033BuildAuthorityRefresh?.();
     D.buildRoutes++;
     return await base.apply(ctx,args);
   }catch(e){D.lastError=String(e?.message||e);D.legacyGameplayFallbacksBlocked++;toast('Änderung nicht ausgeführt','error','Serverautorität ist noch nicht bereit. Lokal wurde nichts verändert.');return false}
 });};
 wrapped.__v7133BuildLock=true;wrapped.__v7133Base=base;window[name]=wrapped;try{globalThis[name]=wrapped}catch(_){ }
}
['incAttr','upgradeSkill','v314Upgrade','v314Reset'].forEach(protectBuildFunction);

/* Dungeon and PvP had short startup windows where the older capture handler could
   still reach a local fight before v7040 had loaded. Own those clicks unconditionally
   for authenticated accounts and wait for the canonical server owner. */
window.addEventListener('click',ev=>{
 if(!auth())return;
 const t=ev.target instanceof Element?ev.target:null;if(!t)return;
 const d=t.closest('#fightBtn,#dungeonFightBtn,#v7051FightBtn,[data-v7051-server-fight],[data-dungeon-fight]');
 if(d&&document.getElementById('dungeon')?.classList.contains('active')){
   stop(ev);D.dungeonRoutes++;
   void (async()=>{
     try{
       await requireDomain('dungeon');await requireDomain('progress');
       const fn=window.v7051RunServerDungeon||window.v7040RunServerDungeon;
       if(typeof fn!=='function')throw new Error('DUNGEON_SERVER_OWNER_MISSING');
       await fn();
     }catch(e){D.lastError=String(e?.message||e);D.legacyGameplayFallbacksBlocked++;toast('Dungeon nicht gestartet','error','Serverautorität ist noch nicht bereit. Lokal wurde nichts verändert.')}
   })();return;
 }
 const p=t.closest('#v204FightBtn');
 if(p&&document.getElementById('pvp')?.classList.contains('active')){
   stop(ev);D.pvpRoutes++;
   void (async()=>{
     try{await requireDomain('pvp');const fn=window.v7053RunServerPvp;if(typeof fn!=='function')throw new Error('PVP_SERVER_OWNER_MISSING');await fn()}
     catch(e){D.lastError=String(e?.message||e);D.legacyGameplayFallbacksBlocked++;toast('PvP nicht gestartet','error','Serverautorität ist noch nicht bereit. Lokal wurde nichts verändert.')}
   })();return;
 }
},true);

/* Final PvP callable owner as protection against buttons/scripts that invoke the
   global function directly instead of using the captured button. */
const previousPvpFight=window.v204Fight||((typeof v204Fight==='function')?v204Fight:null);
window.v204Fight=function(){
 if(!auth())return typeof previousPvpFight==='function'?previousPvpFight.apply(this,arguments):false;
 return (async()=>{try{await requireDomain('pvp');D.pvpRoutes++;return await window.v7053RunServerPvp?.()}catch(e){D.lastError=String(e?.message||e);D.legacyGameplayFallbacksBlocked++;toast('PvP nicht gestartet','error','Keine lokale Ersatzaktion wurde ausgeführt.');return false}})();
};
try{v204Fight=window.v204Fight}catch(_){ }

/* Retire two known V4.x local gameplay sources that predate server authority and
   can still be called by stale inline handlers. The legendary Wundertüte feature
   was removed from the live design; dungeon keys now come only from server state. */
['v077BuySeed','v077Plant','v077Harvest','v077QuestFind'].forEach(name=>{
 const base=window[name]||globalThis[name];if(typeof base!=='function')return;
 const w=function(){if(auth()){D.legacyLegendarySeedBlocks++;D.legacyGameplayFallbacksBlocked++;return false}return base.apply(this,arguments)};
 window[name]=w;try{globalThis[name]=w}catch(_){ }
});
try{
 const base=window.v250GrantKey||((typeof v250GrantKey==='function')?v250GrantKey:null);
 if(typeof base==='function'){
   const w=function(){if(auth()){D.legacyKeyBlocks++;D.legacyGameplayFallbacksBlocked++;setTimeout(()=>void window.v7040AuthorityRefresh?.(),0);return false}return base.apply(this,arguments)};
   window.v250GrantKey=w;try{v250GrantKey=w}catch(_){ }
 }
}catch(_){ }

/* Safety net: old code may still call persist() for UI reasons. Keep the local cache,
   but immediately re-hydrate the active gameplay domain from canonical server state.
   This does not perform or reward an action; it only prevents an old local mutation
   from surviving long enough to become the visible source of truth. */
function activeScreen(){return String(document.querySelector('.screen.active,main > section.active')?.id||'')}
async function hydrateActive(){
 if(!auth())return;D.rehydrates++;
 const screen=activeScreen();
 try{await window.v7077ProgressRefresh?.()}catch(_){ }
 try{
   if(screen==='character'){await window.v7033BuildAuthorityRefresh?.();await (window.v7074ItemAuthorityRefresh?.()||window.v7063ItemStageRefresh?.());}
   else if(screen==='shop'||screen==='forge'||screen==='harzForge')await (window.v7074ItemAuthorityRefresh?.()||window.v7063ItemStageRefresh?.());
   else if(screen==='quests')await window.v7110SyncQuestAuthority?.(true);
   else if(screen==='dungeon'){await window.v7040AuthorityRefresh?.();const di=Math.max(0,Math.min(19,Number(s?.dungeon?.selected??s?.dungeon?.lastActive??0)||0));await window.v7051EnsureDungeonState?.(di,{force:false,paint:false,reason:'active-hydrate'});}
   else if(screen==='grow'){await window.v7065GrowAuthorityRefresh?.(true);await window.v7070GrowHydrationRefresh?.();}
   else if(screen==='tower'||screen==='worldboss'||screen==='weekly')await window.v7072AuthorityRefresh?.();
   else if(screen==='endgame')await window.v7073EndgameRefresh?.();
   else if(screen==='guild'){try{await window.v254LoadGuild?.()}catch(_){ }try{await window.v255LoadBoss?.()}catch(_){ }try{await window.v262LoadWar?.()}catch(_){ }}
 }catch(e){D.lastError=String(e?.message||e)}
}
/* Manual/system-test only: one complete canonical read pass, deliberately no interval. */
async function hydrateAllCore(){
 if(!auth())return {ok:false,reason:'AUTH_REQUIRED'};
 D.fullHydrates++;D.coreHydrating=true;
 const jobs=[
  ['progress',()=>window.v7077ProgressRefresh?.(false)],
  ['build',()=>window.v7033BuildAuthorityRefresh?.(false)],
  ['items',()=>window.v7074ItemAuthorityRefresh?.(false,false)||window.v7063ItemStageRefresh?.(false)],
  ['quest',()=>window.v7110SyncQuestAuthority?.(true,false)],
  ['dungeon',async()=>{
    await window.v7040AuthorityRefresh?.(false);
    const di=Math.max(0,Math.min(19,Number(s?.dungeon?.selected??s?.dungeon?.lastActive??0)||0));
    if(typeof window.v7051EnsureDungeonState==='function')return await window.v7051EnsureDungeonState(di,{force:true,paint:false,reason:'login-hydrate'});
    /* Cold OAuth return fallback: read the same canonical RPC directly. */
    const x=(typeof v073Db!=='undefined'&&v073Db)||null;if(!x)throw new Error('DUNGEON_SERVER_OFFLINE');
    const {data,error}=await x.rpc('v7051_get_dungeon_state',{});if(error)throw error;
    const q=Array.isArray(data)?(data[0]??null):data;if(!q?.ok)throw new Error('DUNGEON_STATE_UNAVAILABLE');
    try{window.v7051SeedCanonicalState?.(q)}catch(_){}
    return q;
  }]
 ];
 const result={};
 try{
  for(const [name,fn] of jobs){
   try{const r=await fn();result[name]={ok:true,value:r??null}}
   catch(e){result[name]={ok:false,error:String(e?.message||e)};D.lastError=String(e?.message||e)}
  }
 }finally{D.coreHydrating=false;D.lastFullHydrateAt=Date.now()}
 return {ok:Object.values(result).every(x=>x.ok),result};
}
function scheduleHydrate(){
 const screen=activeScreen();
 /* V7.207: canonical login already refreshes the critical first-frame domains. Do not let the
    many legacy persist() calls fired by first-paint decorators immediately start a
    second hydration wave while the app is settling. */
 if(D.coreHydrating||Date.now()-Number(D.lastFullHydrateAt||0)<1400){D.suppressedHydrates++;return}
 /* V7.136: Grow has a fail-closed action owner that applies RPC responses directly.
    Generic persist() calls (seed selection, UI state, old decorators) must not fan
    out into two extra Grow state RPCs. */
 if(screen==='grow'&&window.__V7065_GROW_FAIL_CLOSED__)return;
 clearTimeout(hydrateTimer);hydrateTimer=setTimeout(()=>void hydrateActive(),80)
}
try{
 const base=window.persist||((typeof persist==='function')?persist:null);
 if(typeof base==='function'&&!base.__v7133AuthorityHydrate){
   const w=function(){const out=base.apply(this,arguments);if(auth())scheduleHydrate();return out};
   w.__v7133AuthorityHydrate=true;w.__v7133Base=base;window.persist=w;try{persist=w}catch(_){ }
 }
}catch(_){ }

async function boot(){
 if(!auth())return;
 if(window.v7206StartupBusy?.()){D.suppressedHydrates++;return}
 if(window.v7204StartupQuiet?.()&&Date.now()-Number(D.lastFullHydrateAt||0)<7000){D.suppressedHydrates++;return}
 try{await refreshAuthority();if(D.fullAuthority&&Date.now()-Number(D.lastFullHydrateAt||0)>7000)scheduleHydrate()}
 catch(e){D.lastError=String(e?.message||e)}
}
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>void boot(),120),{passive:true});
window.addEventListener('pageshow',()=>setTimeout(()=>void boot(),350),{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>void boot(),180)},{passive:true});
setTimeout(()=>void boot(),700);

window.v7133AuthorityRefresh=boot;
window.v7133HydrateAllCore=hydrateAllCore;
window.v7133AuthorityDiagnostics=()=>clone({version:VERSION,...D,authenticated:auth(),domains:currentDomains(),capabilities:window.v7081CapabilitiesDiagnostics?.()||null,cloudWriterGuarded:!!window.v075WriteCloudSave?.__v7133AuthorityLock,cloudApplyGuarded:!!window.v075ApplyCloudSave?.__v7133CloudApplyLock,accountResolverGuarded:!!window.v075ResolveCloudAfterLogin?.__v7194ServerOnlyLogin&&window.__V4139_LOGIN_AUTHORITY__?.playerSavesGameplayRestore===false&&window.__V4139_LOGIN_AUTHORITY__?.localGameplayRestore===false,accountLogin:window.v4139LoginAuthorityDiagnostics?.()||null,legacyEnergyGuarded:!!window.regenEnergy?.__v7173ServerGuard,legacyDampfResetGuarded:!!window.v026DailyReset?.__v7173ServerGuard,legacyMidnightGuarded:!!window.v127ApplyDailyReset?.__v7173ServerGuard,legacyWorldbossResetGuarded:!!window.v110ResetDay?.__v7173ServerGuard,legacySaveMonitorRetired:!!window.__V7176_LEGACY_SAVE_MONITOR_RETIRED__});
window.__V7173_LOCAL_RUNTIME_HARDENING__=Object.freeze({version:'V7.177',legacyDailyTimers:'retire-on-authority',legacyWholeSaveMonitor:'retire-on-full-authority',runtimeIntervals:'measured',nativeCombatIntervals:'measured-not-throttled'});
window.__V7133_AUTHORITY_POLICY__=Object.freeze({
 gameplayWrites:'server-only',unknownAuthority:'fail-closed',playerSavesAfterFullEnforce:'read-compatibility-only',
 cloudApplyAfterFullEnforce:'blocked-and-server-rehydrated',accountLoginAfterFullEnforce:'server-identity-plus-canonical-hydration',legacyAccountWholeSaveRestore:'blocked',
 localStorage:'ui-and-confirmed-server-cache-only',domains:GAMEPLAY_DOMAINS
});
})();
