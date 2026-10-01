(()=>{
'use strict';
if(window.__V7084_BACKGROUND_QA__)return;
window.__V7084_BACKGROUND_QA__=true;

const VERSION=String(window.GROW_LEGENDS_VERSION?.short||'V7.127');
const currentBuild=()=>String(window.GROW_LEGENDS_VERSION?.short||window.__GROW_LEGENDS_RELEASE__||VERSION);
const caught=[];
let running=null,last=null,longTasks=[];
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const one=d=>Array.isArray(d)?d[0]:d;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
const sig=arr=>(Array.isArray(arr)?arr:[]).map(x=>String(x?.id||x?.uid||'')).join('|');
const stableJson=v=>{
 try{
  const norm=x=>{
   if(Array.isArray(x))return x.map(norm);
   if(x&&typeof x==='object'){const o={};Object.keys(x).sort().forEach(k=>o[k]=norm(x[k]));return o}
   return x;
  };
  return JSON.stringify(norm(v));
 }catch(_){return ''}
};
const eq=(a,b)=>stableJson(a)===stableJson(b);
const trimErr=e=>String(e?.message||e||'').slice(0,500);

window.addEventListener('error',e=>{
 caught.push({type:'error',message:String(e?.message||''),file:String(e?.filename||''),line:Number(e?.lineno)||0,at:Date.now()});
 if(caught.length>30)caught.shift();
},{passive:true});
window.addEventListener('unhandledrejection',e=>{
 caught.push({type:'rejection',message:trimErr(e?.reason),at:Date.now()});
 if(caught.length>30)caught.shift();
},{passive:true});

try{
 const po=new PerformanceObserver(list=>{
  list.getEntries().forEach(e=>{
   longTasks.push({duration:Math.round(e.duration),start:Math.round(e.startTime)});
   if(longTasks.length>60)longTasks.shift();
  });
 });
 po.observe({entryTypes:['longtask']});
}catch(_){}

async function rpcTimed(name,args={}){
 const x=db();if(!x)throw new Error('SERVER_NOT_READY');
 const t=performance.now();
 const {data,error}=await x.rpc(name,args);
 const ms=Math.round(performance.now()-t);
 if(error)throw Object.assign(new Error(error.message||String(error)),{rpc:name,ms});
 return {data:one(data),ms};
}
function dupIds(){
 const m=new Map();
 document.querySelectorAll('[id]').forEach(el=>m.set(el.id,(m.get(el.id)||0)+1));
 return [...m.entries()].filter(([,n])=>n>1).map(([id,n])=>({id,n})).slice(0,30);
}
function allCaps(){
 try{return window.v7081CapabilitiesDiagnostics?.()?.caps||{}}catch(_){return{}}
}
function isPilot(){
 const c=allCaps();
 return Object.values(c).some(Boolean);
}

async function run(showToast=false){
 if(running)return running;
 const id=uid();
 if(!id||!db())return null;

 running=(async()=>{
  const started=Date.now();
  const errStart=caught.length;
  const longStart=longTasks.length;
  const checks={};
  const timings={};
  const errors=[];

  try{
   await window.v7081CapabilitiesRefresh?.(true);
  }catch(e){errors.push({step:'capabilities',message:trimErr(e)})}
  const caps=allCaps();
  const authorityDiag=(()=>{try{return window.v7133AuthorityDiagnostics?.()||null}catch(_){return null}})();
  const authorityPolicy=window.__V7133_AUTHORITY_POLICY__||null;
  const requiredDomains=['achievements','billing','build','daily','dungeon','endgame','grow_dealer','grow_orders','guild','items','liveops','pets','profile','progress','pvp','quest','seeds','shop','social','tower','weekly','worldboss'];
  const authorityDomains=authorityDiag?.domains||{};
  checks.allAuthorityDomainsEnforced=requiredDomains.every(d=>String(authorityDomains?.[d]||'')==='enforce');
  checks.clientFailClosedOwner=!!authorityDiag&&authorityPolicy?.gameplayWrites==='server-only'&&authorityPolicy?.unknownAuthority==='fail-closed';
  checks.legacyCloudWriterGuarded=!!window.v075WriteCloudSave?.__v7133AuthorityLock;
  checks.legacyCloudApplyGuarded=!!window.v075ApplyCloudSave?.__v7133CloudApplyLock;
  checks.playerSavesReadCompatibilityOnly=authorityPolicy?.playerSavesAfterFullEnforce==='read-compatibility-only';
  const loginPolicy=window.__V4139_LOGIN_AUTHORITY__||null;
  checks.accountLoginServerOnly=!!window.v075ResolveCloudAfterLogin?.__v7194ServerOnlyLogin
   &&loginPolicy?.mode==='server-first-fail-closed'
   &&loginPolicy?.playerSavesGameplayRestore===false
   &&loginPolicy?.localGameplayRestore===false;
  try{
   const aps=Function.prototype.toString.call(window.v200AdminPoll||v200AdminPoll||(()=>{}));
   checks.adminPollServerSignal=/v7068_admin_change_state/.test(aps)&&!/v075ApplyCloudSave/.test(aps);
  }catch(_){checks.adminPollServerSignal=false}
  checks.itemServerOnlyOwner=window.__V7132_ITEM_AUTHORITY__?.manualEquip==='server-only'&&window.__V7132_ITEM_AUTHORITY__?.autoMaterials==='server-only';
  checks.growFailClosedOwner=!!window.__V7065_GROW_FAIL_CLOSED__;
  checks.buildServerOwner=typeof window.v7033BuildAuthorityRefresh==='function';
  checks.questServerOwner=typeof window.v7110SyncQuestAuthority==='function'&&!!window.v7110QuestAuthorityEnforced?.();
  checks.dungeonServerOwner=typeof window.v7051RunServerDungeon==='function'||typeof window.v7040RunServerDungeon==='function';
  checks.pvpServerOwner=typeof window.v7053RunServerPvp==='function';

  try{
   const x=await rpcTimed('v7084_authority_health');
   timings.health=x.ms;
   checks.serverHealth=!!x.data?.ok;
   checks.serverChecks=x.data?.checks||{};
  }catch(e){
   checks.serverHealth=false;
   errors.push({step:'authority_health',message:trimErr(e),ms:e?.ms||0});
  }

  if(caps.progress){
   try{
    const x=await rpcTimed('v7077_progress_state');
    timings.progress=x.ms;
    checks.progressLocalMatch=
      Number(s?.level)===Number(x.data?.level)
      &&Number(s?.xp)===Number(x.data?.xp)
      &&Number(s?.gold)===Number(x.data?.gold)
      &&Number(s?.harzTaler)===Number(x.data?.harz);
   }catch(e){errors.push({step:'progress',message:trimErr(e),ms:e?.ms||0})}
  }

  if(caps.items){
   try{
    const x=await rpcTimed('v7063_shop_state');
    timings.shop=x.ms;
    checks.shopLocalMatch=
      sig(s?.weaponShop)===sig(x.data?.weaponShop)
      &&sig(s?.magicShop)===sig(x.data?.magicShop);
   }catch(e){errors.push({step:'shop',message:trimErr(e),ms:e?.ms||0})}

   try{
    const x=await rpcTimed('v7034_client_item_authority_state');
    timings.items=x.ms;
    checks.itemCountsMatch=
      Number((s?.inventory||[]).length)===Number((x.data?.inventory||[]).length)
      &&Number((s?.materials||[]).length)===Number((x.data?.materials||[]).length);
    checks.itemLocalMatch=
      eq(s?.inventory||[],x.data?.inventory||[])
      &&eq(s?.equipment||{},x.data?.equipment||{})
      &&eq(s?.materials||[],x.data?.materials||[]);
    checks.enchantRepresentationClean=Object.values(x.data?.equipment||{}).filter(Boolean).every(it=>{
      const a=Array.isArray(it?.enchants)&&it.enchants.length?it.enchants[0]:null;
      const b=it?.enchant||null;
      return !a||!b||eq(a,b);
    });
   }catch(e){errors.push({step:'items',message:trimErr(e),ms:e?.ms||0})}
  }

  if(caps.build){
   try{
    const x=await rpcTimed('v7033_client_authority_state');
    timings.build=x.ms;
    checks.buildLocalMatch=
      String(s?.playerClass||'')===String(x.data?.player_class||'')
      &&eq(s?.attrs||{},x.data?.attrs||{})
      &&Number(s?.points||0)===Number(x.data?.points||0)
      &&eq(s?.classSkills||{},x.data?.class_skills||{})
      &&Number(s?.skillPoints||0)===Number(x.data?.skill_points||0)
      &&eq(s?.v314Talents||{},x.data?.talents||{});
    checks.buildServerRevision=Number(x.data?.build_revision)||0;
    checks.talentAvailableServer=Number(x.data?.talent_available)||0;
   }catch(e){errors.push({step:'build',message:trimErr(e),ms:e?.ms||0})}
  }

  if(caps.quest){
   try{
    const x=await rpcTimed('v7044_get_quest_state');
    timings.quest=x.ms;
    checks.questLocalMatch=
      Number(s?.energy||0)===Number(x.data?.energy||0)
      &&sig(s?.quests?.offers||[])===sig(x.data?.offers||[])
      &&String(s?.quests?.active?.id||'')===String(x.data?.active?.id||'')
      &&String(s?.quests?.eliteOffer?.id||'')===String(x.data?.eliteOffer?.id||'');
   }catch(e){errors.push({step:'quest',message:trimErr(e),ms:e?.ms||0})}
  }

  if(caps.dungeon){
   try{
    const x=await rpcTimed('v7051_get_dungeon_state');
    timings.dungeon=x.ms;
    checks.dungeonLocalMatch=
      eq(s?.dungeon?.progress||{},x.data?.progress||{})
      &&eq((s?.dungeon?.completed||[]).map(Number),(x.data?.completed||[]).map(Number))
      &&eq((s?.dungeon?.unlocked||[]).map(Number),(x.data?.unlocked||[]).map(Number));
   }catch(e){errors.push({step:'dungeon',message:trimErr(e),ms:e?.ms||0})}
  }

  if(caps.grow){
   try{
    const x=await rpcTimed('v7064_grow_state');
    timings.grow=x.ms;
    checks.growLocalMatch=
      eq(s?.grow?.plants||[],x.data?.plants||[])
      &&eq(s?.grow?.seeds||{},x.data?.grow_seeds||{});
   }catch(e){errors.push({step:'grow',message:trimErr(e),ms:e?.ms||0})}
  }

  if(caps.grow_orders){
   try{
    const x=await rpcTimed('v6358_get_grow_orders');
    timings.growOrders=x.ms;
    const loc=s?.grow?.v6160||{};
    checks.growOrdersLocalMatch=
      String(loc.dayKey||'')===String(x.data?.dayKey||'')
      &&Number(loc.rerollsLeft??-1)===Number(x.data?.rerollsLeft??-2)
      &&sig(loc.contracts)===sig(x.data?.contracts);
   }catch(e){errors.push({step:'grow_orders',message:trimErr(e),ms:e?.ms||0})}
  }

  if(caps.pets){
   try{
    const x=await rpcTimed('v7079_pet_state');
    timings.pets=x.ms;
    checks.petLocalMatch=eq(s?.v686PetAlbum?.found||{},x.data?.found||{});
   }catch(e){errors.push({step:'pets',message:trimErr(e),ms:e?.ms||0})}
  }

  if(caps.achievements){
   try{
    const x=await rpcTimed('v7080_achievement_state');
    timings.achievements=x.ms;
    checks.achievementLocalMatch=eq(s?.v106Achievements?.done||{},x.data?.done||{});
   }catch(e){errors.push({step:'achievements',message:trimErr(e),ms:e?.ms||0})}
  }

  await new Promise(r=>setTimeout(r,700));

  const dups=dupIds();
  const shopDiag=window.v7063ItemStageDiagnostics?.()||{};
  const newErrors=caught.slice(errStart);
  const newLong=longTasks.slice(longStart);
  const maxLong=newLong.reduce((m,x)=>Math.max(m,Number(x.duration)||0),0);
  const slowRpcs=Object.entries(timings).filter(([,ms])=>Number(ms)>1600);
  const uiDiag=window.v7125UiStabilityDiagnostics?.()||null;
  const uiResults=Array.isArray(uiDiag?.results)?uiDiag.results:[];
  const uiErrors=uiResults.filter(x=>x?.severity==='error').slice(-10);
  const uiWarnings=uiResults.filter(x=>x?.severity==='warn').slice(-10);

  checks.noDuplicateDomIds=dups.length===0;
  checks.noRuntimeErrors=newErrors.length===0;
  checks.noRpcErrors=errors.length===0;
  checks.noSlowRpc=slowRpcs.length===0;
  checks.noRenderStorm=Number(shopDiag.shopPaintCalls||0)<=12;
  checks.noUiFlicker=uiErrors.length===0;
  checks.uiStabilityClean=(uiErrors.length+uiWarnings.length)===0;

  const localDrift=Object.entries(checks).filter(([k,v])=>k.endsWith('LocalMatch')&&v===false).map(([k])=>k);
  const authorityClientFailures=[
   'allAuthorityDomainsEnforced','clientFailClosedOwner','legacyCloudWriterGuarded','legacyCloudApplyGuarded',
   'playerSavesReadCompatibilityOnly','accountLoginServerOnly','adminPollServerSignal','itemServerOnlyOwner','growFailClosedOwner',
   'buildServerOwner','questServerOwner','dungeonServerOwner','pvpServerOwner'
  ].filter(k=>checks[k]===false);
  const hardFail=
    checks.serverHealth===false
    ||authorityClientFailures.length>0
    ||errors.length>0
    ||newErrors.length>0
    ||uiErrors.length>0;

  const warn=
    !hardFail&&(
      localDrift.length>0
      ||dups.length>0
      ||slowRpcs.length>0
      ||maxLong>180
      ||uiWarnings.length>0
      ||checks.noRenderStorm===false
    );

  const status=hardFail?'fail':warn?'warn':'pass';
  const metrics={
   durationMs:Date.now()-started,
   timings,
   slowRpcs,
   domNodes:document.querySelectorAll('*').length,
   duplicateIds:dups,
   longTaskCount:newLong.length,
   maxLongTaskMs:maxLong,
   shopPaintCalls:Number(shopDiag.shopPaintCalls||0),
   shopPaintExec:Number(shopDiag.shopPaintExec||0),
   uiStability:{
    samples:uiResults.length,
    warnings:uiWarnings.length,
    errors:uiErrors.length,
    last:uiResults.at(-1)||null
   },
   localDrift,
   authorityClientFailures,
   authorityRuntime:authorityDiag?{
    fullAuthority:!!authorityDiag.fullAuthority,
    accountResolverGuarded:!!authorityDiag.accountResolverGuarded,
    accountLogin:window.v4139LoginAuthorityDiagnostics?.()||null,
    legacyCloudWritesSuppressed:Number(authorityDiag.legacyCloudWritesSuppressed)||0,
    legacyCloudAppliesBlocked:Number(authorityDiag.legacyCloudAppliesBlocked)||0,
    legacyGameplayFallbacksBlocked:Number(authorityDiag.legacyGameplayFallbacksBlocked)||0,
    rehydrates:Number(authorityDiag.rehydrates)||0,
    fullHydrates:Number(authorityDiag.fullHydrates)||0
   }:null,
   userAgent:String(navigator.userAgent||'').slice(0,300)
  };
  const allErrors=[...errors,...newErrors,...uiErrors.map(x=>({step:'ui_stability',screen:x.screen,message:x.summary||'UI flicker detected',metrics:x}))].slice(0,30);

  try{
   await rpcTimed('v7084_submit_client_qa',{
    p_version:currentBuild(),
    p_status:status,
    p_checks:checks,
    p_metrics:metrics,
    p_errors:allErrors
   });
  }catch(e){
   allErrors.push({step:'submit',message:trimErr(e)});
  }

  last={version:currentBuild(),status,checks,metrics,errors:allErrors,at:Date.now()};
  try{localStorage.setItem(`gl_v7084_qa_${currentBuild()}_${id}`,JSON.stringify(last))}catch(_){}

  if(showToast){
   try{
    window.v063Toast?.(
      status==='pass'?'✅ Systemtest bestanden':status==='warn'?'⚠️ Systemtest mit Hinweisen':'❌ Systemtest: Fehler gefunden',
      status==='pass'?'success':status==='warn'?'warn':'error',
      status==='pass'
        ?'Serverzustand und Client stimmen überein.'
        :`${allErrors.length} harte Fehler · ${localDrift.length} Client-Drift · ${slowRpcs.length} langsame RPCs`
    );
   }catch(_){}
  }

  return last;
 })().finally(()=>{running=null});
 return running;
}

function auto(){
 /* V7.095 production: exhaustive QA is manual only. */
 return false;
}

window.v7084RunSystemTest=(showToast=true)=>run(!!showToast);
window.v7084SystemTestDiagnostics=()=>clone(last);

window.addEventListener('growlegends:authority-capabilities-ready',()=>setTimeout(auto,8000),{passive:true});
window.addEventListener('growlegends:account-ready',()=>setTimeout(auto,10000),{passive:true});
setTimeout(auto,15000);
})();
