(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 const ACCOUNT_PREFIX='growLegendsAccountSave:';
 const ID_PREFIX='growLegendsCharacterIdentity:';
 const LOCK_PREFIX='growLegendsCharacterLockV4139:';
 const TRANSITION_PREFIX='growLegendsAccountTransitionBackup:';
 let resolvePromise=null,resolveUid='',writeChain=Promise.resolve(),writeInFlight=null,writeQueued=false,lastCloudWriteAt=0,lastProfileMirrorAt=0,cloudFailCount=0,outerFinalizePromise=null,outerFinalizeUid='',lastError='',lastErrorAt=0;
 const AUTH_DOMAINS=Object.freeze(['achievements','billing','build','daily','dungeon','endgame','grow_dealer','grow_orders','guild','items','liveops','pets','profile','progress','pvp','quest','seeds','shop','social','tower','weekly','worldboss']);
 const VALID_CLASSES=new Set(['grower','scout','bruiser','summoner','frost']);
 const LOGIN={serverFirstLogins:0,profileIdentityReads:0,canonicalHydrates:0,canonicalHydrateFailures:0,legacyWholeSaveBlocks:0,legacyResolverRuns:0,lastMode:'',lastHydrateOk:false,lastError:''};

 function uid(){try{return v073User&&!v073User.is_anonymous&&v073User.id?String(v073User.id):''}catch(e){return''}}
 function clone(x){try{return typeof structuredClone==='function'?structuredClone(x):JSON.parse(JSON.stringify(x))}catch(e){try{return JSON.parse(JSON.stringify(x||{}))}catch(_){return null}}}
 function clean(x){try{return typeof v071CleanName==='function'?v071CleanName(x):String(x||'').trim()}catch(e){return String(x||'').trim()}}
 function validName(x){try{return typeof v071NameValid==='function'?v071NameValid(x):clean(x).length>=2}catch(e){return clean(x).length>=2}}
 function complete(x){return !!(x&&x.playerClass&&x.characterNameSet&&validName(x.characterName))}
 function owner(x){return String(x?.__accountOwnerId||'')}
 function socialOwner(x){return String(x?.social?.playerId||'')}
 function exactOwned(x,id){return !!(x&&id&&owner(x)===id&&socialOwner(x)===id)}
 function containerAllowed(x,id){if(!x||typeof x!=='object'||!id)return false;const o=owner(x),so=socialOwner(x);return !(o&&o!==id)&&!(so&&so!==id)}
 function identity(x){return complete(x)?`${clean(x.characterName).toLocaleLowerCase()}|${String(x.playerClass||'')}`:''}
 function savedAt(x){return Math.max(0,Number(x?.__savedAt)||0)}
 function rev(x){return Math.max(0,Number(x?.__saveRevision)||0)}
 function scopedKey(id){return ACCOUNT_PREFIX+id+':server:'+serverId()}
 function lockKey(id){return LOCK_PREFIX+id+':server:'+serverId()}
 function readJson(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
 function serverId(){try{return String(window.v343CurrentServer||s?.__serverId||'beta')}catch(e){return'beta'}}
 function warn(title,detail){const k=title+'|'+detail,now=Date.now();if(k===lastError&&now-lastErrorAt<12000)return;lastError=k;lastErrorAt=now;try{v063Toast(title,'error',detail)}catch(e){}}

 function ownedCopy(x,id){
  if(!containerAllowed(x,id))return null;
  const y=clone(x);if(!y)return null;
  y.__accountOwnerId=id;y.social=(y.social&&typeof y.social==='object')?y.social:{};y.social.playerId=id;
  return y;
 }

 const ACCOUNT_STATE_SCHEMA=1;
 let lastHealth={ok:true,at:0,uid:'',server:'',issues:[],repairs:[],schema:ACCOUNT_STATE_SCHEMA};

 function accountStateHealthCheck({repair=true,reason='manual'}={}){
  const id=uid(),issues=[],repairs=[];
  const issue=(code,detail='')=>issues.push({code,detail:String(detail||'')});
  const fix=(code,fn)=>{
   if(!repair)return;
   try{fn();repairs.push(code)}catch(e){issue('REPAIR_FAILED:'+code,e?.message||e)}
  };
  if(!s||typeof s!=='object'){
   issue('STATE_NOT_OBJECT');
   lastHealth={ok:false,at:Date.now(),uid:id,server:serverId(),reason,issues,repairs,schema:ACCOUNT_STATE_SCHEMA};
   return lastHealth;
  }

  if(id){
   if(owner(s)!==id)issue('OWNER_MISMATCH',owner(s));
   if(socialOwner(s)!==id)issue('SOCIAL_OWNER_MISMATCH',socialOwner(s));
  }

  const classId=String(s.playerClass||'');
  if(classId&&!VALID_CLASSES.has(classId))issue('INVALID_CLASS',classId);
  if(s.characterNameSet&&!validName(s.characterName))issue('INVALID_CHARACTER_NAME',s.characterName);

  const ensureObj=(key)=>{
   if(!s[key]||typeof s[key]!=='object'||Array.isArray(s[key])){
    issue('INVALID_OBJECT:'+key,typeof s[key]);
    fix('NORMALIZE_OBJECT:'+key,()=>{s[key]={}});
   }
  };
  const ensureArr=(key)=>{
   if(!Array.isArray(s[key])){
    issue('INVALID_ARRAY:'+key,typeof s[key]);
    fix('NORMALIZE_ARRAY:'+key,()=>{s[key]=[]});
   }
  };
  const ensureNum=(key,min=0)=>{
   const n=Number(s[key]);
   if(!Number.isFinite(n)||n<min){
    issue('INVALID_NUMBER:'+key,String(s[key]));
    fix('NORMALIZE_NUMBER:'+key,()=>{s[key]=Math.max(min,Number.isFinite(n)?n:min)});
   }
  };

  ensureObj('social');
  ensureObj('equipment');
  ensureArr('inventory');
  ensureArr('materials');
  ensureObj('grow');
  ensureObj('dungeon');
  ensureNum('level',1);
  ensureNum('xp',0);
  ensureNum('gold',0);
  ensureNum('harzTaler',0);
  ensureNum('timeSeeds',0);

  if(!Array.isArray(s.dungeon?.completed)){
   issue('INVALID_DUNGEON_COMPLETED',typeof s.dungeon?.completed);
   fix('NORMALIZE_DUNGEON_COMPLETED',()=>{s.dungeon.completed=[]});
  }
  if(!s.dungeon?.progress||typeof s.dungeon.progress!=='object'||Array.isArray(s.dungeon.progress)){
   issue('INVALID_DUNGEON_PROGRESS',typeof s.dungeon?.progress);
   fix('NORMALIZE_DUNGEON_PROGRESS',()=>{s.dungeon.progress={}});
  }

  if(!Array.isArray(s.grow?.plants)){
   issue('INVALID_GROW_PLANTS',typeof s.grow?.plants);
   fix('NORMALIZE_GROW_PLANTS',()=>{s.grow.plants=[]});
  }

  const eq=s.equipment||{};
  const aliases={
   head:['helmet'],
   body:['armor','chest'],
   boots:['shoes'],
   amulet:['necklace'],
   weapon2:['offhand','secondaryWeapon','weaponSecondary']
  };
  for(const [slot,alts] of Object.entries(aliases)){
   if(eq[slot])continue;
   const alt=alts.find(k=>eq[k]&&typeof eq[k]==='object');
   if(alt){
    issue('LEGACY_EQUIPMENT_KEY:'+alt,slot);
    fix('MIGRATE_EQUIPMENT:'+alt+'>'+slot,()=>{eq[slot]=eq[alt]});
   }
  }

  const validSlots=new Set(['head','weapon','weapon2','ring','body','boots','amulet']);
  for(const [slot,it] of Object.entries(eq)){
   if(!it||typeof it!=='object')continue;
   if(validSlots.has(slot)&&it.slot&&String(it.slot)!==slot){
    issue('ITEM_SLOT_MISMATCH:'+slot,String(it.slot));
   }
  }

  if(id&&repair){
   if(owner(s)!==id&&containerAllowed(s,id))fix('RESTORE_ACCOUNT_OWNER',()=>{s.__accountOwnerId=id});
   if(socialOwner(s)!==id&&containerAllowed(s,id))fix('RESTORE_SOCIAL_OWNER',()=>{s.social=(s.social&&typeof s.social==='object')?s.social:{};s.social.playerId=id});
  }

  if(Number(s.__accountStateSchema)!==ACCOUNT_STATE_SCHEMA){
   issue('SCHEMA_VERSION',String(s.__accountStateSchema||0));
   fix('STAMP_SCHEMA_VERSION',()=>{s.__accountStateSchema=ACCOUNT_STATE_SCHEMA});
  }

  lastHealth={
   ok:!issues.some(x=>/MISMATCH|INVALID_CLASS|INVALID_CHARACTER_NAME|STATE_NOT_OBJECT|REPAIR_FAILED/.test(x.code)),
   at:Date.now(),uid:id,server:serverId(),reason,issues,repairs,schema:ACCOUNT_STATE_SCHEMA,
   equipmentSlots:Object.fromEntries(['head','weapon','weapon2','ring','body','boots','amulet'].map(k=>[k,!!s.equipment?.[k]])),
   inventoryCount:Array.isArray(s.inventory)?s.inventory.length:0,
   materialsCount:Array.isArray(s.materials)?s.materials.length:0
  };
  try{window.__V4139_ACCOUNT_HEALTH__=clone(lastHealth)}catch(_){}
  if(issues.length||repairs.length)queueMicrotask(()=>void reportAccountHealth(clone(lastHealth)));
  return lastHealth;
 }
 window.v4139AccountStateHealthCheck=accountStateHealthCheck;
 window.v4139AccountHealthDiagnostics=()=>clone(lastHealth);

 async function reportAccountHealth(report){
  try{
   if(!report||(!report.issues?.length&&!report.repairs?.length))return {ok:true,stored:false,reason:'CLEAN'};
   if(!(await db()))return {ok:false,stored:false,reason:'DB_UNAVAILABLE'};
   const payload={
    server:String(report.server||serverId()),
    reason:String(report.reason||'login'),
    schema:Number(report.schema)||ACCOUNT_STATE_SCHEMA,
    ok:!!report.ok,
    issues:Array.isArray(report.issues)?report.issues.slice(0,50):[],
    repairs:Array.isArray(report.repairs)?report.repairs.slice(0,50):[],
    equipmentSlots:report.equipmentSlots&&typeof report.equipmentSlots==='object'?report.equipmentSlots:{},
    inventoryCount:Math.max(0,Number(report.inventoryCount)||0),
    materialsCount:Math.max(0,Number(report.materialsCount)||0),
    clientVersion:String(window.GROW_LEGENDS_VERSION?.short||window.__GL_CURRENT_BUILD__||'')
   };
   const {data,error}=await v073Db.rpc('v8080_report_account_state_health',{p_report:payload});
   if(error)throw error;
   return Array.isArray(data)?(data[0]||null):data;
  }catch(e){
   console.warn('[V4139] account health report failed',e);
   return {ok:false,stored:false,reason:String(e?.message||e)};
  }
 }
 window.v4139ReportAccountHealth=reportAccountHealth;
 function fresh(id=''){
  const f=clone(defaultState)||{};
  f.playerClass=null;f.classLocked=false;f.characterName='';f.characterNameSet=false;
  f.level=1;f.xp=0;f.social=(f.social&&typeof f.social==='object')?f.social:{};
  if(id){f.__accountOwnerId=id;f.social.playerId=id;f.v315NeedsInitialDampfGrant=true}
  else{delete f.__accountOwnerId;delete f.social.playerId}
  delete f.__savedAt;delete f.__saveRevision;
  return f;
 }
 function replaceState(x){
  if(!x||typeof x!=='object')return false;
  Object.keys(s).forEach(k=>delete s[k]);Object.assign(s,clone(x));return true;
 }
 function resetRuntime(afterLoad=false){
  try{clearTimeout(v075SaveTimer);v075SaveTimer=null}catch(e){}
  try{v075Saving=false;v075ApplyingCloud=false;v200AdminBusy=false}catch(e){}
  try{v073LastProfileJson=''}catch(e){}
  try{v093IsAdmin=false;v273AdminCheckUserId='';document.documentElement.classList.remove('v4142-systemtech-admin');document.querySelectorAll('#v032MenuPanel [data-screen=\"systemtech\"]').forEach(x=>x.remove());document.getElementById('v4104QaRow')?.remove()}catch(e){}
  try{v254Guild=null;v254Membership=null;v254Members=[];v254Loading=false}catch(e){}
  try{v255BossRound=null;v255BossParticipants=[]}catch(e){}
  try{v257Requests=[]}catch(e){}
  try{v262War=null;v262WarDuels=[]}catch(e){}
  try{v269Tickets=[]}catch(e){}
  try{v204Opponent=null;v204BattleBusy=false;v204CooldownLeft=0}catch(e){}
  try{v103SelectedPlayer=null}catch(e){}
  try{v102PendingLevelups=[];v102LevelPopupBusy=false;v102ObservedLevel=afterLoad?Math.max(1,Number(s?.level)||1):1}catch(e){}
  try{v077QuestSnapshot={gold:afterLoad?(Number(s?.gold)||0):0,xp:afterLoad?(Number(s?.xp)||0):0}}catch(e){}
  try{v231PvpPrevious=0;v231PvpReadyNotified=false}catch(e){}
  try{if(typeof v210NotifyState==='object'){v210NotifyState.initialized=false;v210NotifyState.dungeonReady=null;v210NotifyState.pvpRemaining=null;v210NotifyState.pvpKnown=false;v210NotifyState.questKey=null;v210NotifyState.plantKeys=new Set();v210NotifyState.pvpChecking=false}}catch(e){}
  try{if(typeof v210Seen!=='undefined')v210Seen=afterLoad&&typeof v210LoadSeen==='function'?(v210LoadSeen()||{}):{}}catch(e){}
  try{if(typeof v269LastRewardSeen!=='undefined')v269LastRewardSeen=''}catch(e){}
 }
 function clearLegacyHelpers(id){
  if(!id)return;
  try{
   localStorage.removeItem('growLegendsBestSave:'+id+':server:'+serverId());
   localStorage.removeItem('growLegendsProgressFloor:'+id+':server:'+serverId());
   /* Auxiliary recovery caches are account-scoped too. A genuinely fresh/repaired
      character must not resurrect Growroom/care data from an older contaminated save. */
   localStorage.removeItem('growLegendsGrowPlantsV498:'+id);
   localStorage.removeItem('growLegendsCareAuthorityV4120:'+id);
   localStorage.removeItem('growLegendsCareLedgerV4114:'+id);
   localStorage.removeItem('growLegendsV210Notifications:'+id);
   localStorage.removeItem('growLegendsLastVisit:'+id);
  }catch(e){}
 }
 function writeLock(id,x){
  if(!exactOwned(x,id)||!complete(x))return false;
  try{localStorage.setItem(lockKey(id),JSON.stringify({userId:id,name:clean(x.characterName),classId:String(x.playerClass||''),identity:identity(x),at:Date.now()}));return true}catch(e){return false}
 }
 function readLock(id){try{const x=readJson(lockKey(id));return x&&String(x.userId||'')===id?x:null}catch(e){return null}}
 function writeMirrors(id,x,{stamp=false,allowIncomplete=true}={}){
  if(!id||!exactOwned(x,id)||( !allowIncomplete && !complete(x)))return false;
  try{
   const y=clone(x);if(stamp){const next=Math.max(Number(y.__saveRevision)||0,Number(typeof v213SaveRevision==='undefined'?0:v213SaveRevision)||0)+1;y.__saveRevision=next;y.__savedAt=Date.now();try{v213SaveRevision=next}catch(e){}}
   localStorage.setItem(KEY,JSON.stringify(y));localStorage.setItem(scopedKey(id),JSON.stringify(y));
   if(complete(y)){localStorage.setItem(ID_PREFIX+id+':server:'+serverId(),JSON.stringify({userId:id,name:clean(y.characterName),classId:String(y.playerClass||''),lockedAt:Date.now()}));writeLock(id,y)}
   else{localStorage.removeItem(ID_PREFIX+id+':server:'+serverId());localStorage.removeItem(lockKey(id))}
   return true;
  }catch(e){console.warn('V4.159 local mirror write',e);return false}
 }
 function backupCurrent(nextId){
  try{const old=owner(s);if(!old||old===nextId||!exactOwned(s,old))return;const snap=clone(s);if(snap)localStorage.setItem(TRANSITION_PREFIX+old+':'+Date.now(),JSON.stringify(snap))}catch(e){}
 }
 function neutralize(reason='transition'){
  try{replaceState(fresh(''));localStorage.removeItem(KEY);localStorage.removeItem('growLegendsPlayerId')}catch(e){}
  try{v075CloudLoadedFor=null;v200LastCloudStamp=null;v213Dirty=false;v213LastComparable='';v200CloudPromise=null;v200CloudPromiseUser=null}catch(e){}
  try{v224Released=false;document.documentElement.classList.remove('v224-app-ready')}catch(e){}
  resetRuntime(false);
  return true;
 }
 window.v4139NeutralizeAccountRuntime=neutralize;

 async function db(){try{if(typeof v073Init==='function')await v073Init();return typeof v073Db!=='undefined'&&!!v073Db}catch(e){return false}}
 async function cloudRow(id){
  if(!id||uid()!==id||!(await db()))return null;
  const {data,error}=await v073Db.from('player_saves').select('save_data,updated_at').eq('user_id',id).maybeSingle();
  if(error)throw error;return data||null;
 }
 function serverLoginPolicy(){
  try{
   const p=window.__V7133_AUTHORITY_POLICY__||null;
   if(!!p&&p.gameplayWrites==='server-only'&&p.unknownAuthority==='fail-closed')return true;
   const n=Number(window.GROW_LEGENDS_VERSION?.number||0);
   return n>=7.194&&document.readyState!=='loading';
  }catch(_){return false}
 }
 async function waitFinalOwners(){
  if(document.readyState!=='loading')return true;
  await new Promise(resolve=>document.addEventListener('DOMContentLoaded',resolve,{once:true}));
  return true;
 }
 function authorityDomains(){
  try{return window.v7133AuthorityDiagnostics?.()?.domains||window.v7040AuthorityDiagnostics?.()?.domains||{}}catch(_){return{}}
 }
 function allAuthorityEnforced(){const d=authorityDomains();return AUTH_DOMAINS.every(x=>String(d?.[x]||'')==='enforce')}
 async function warmAuthority(){
  if(!serverLoginPolicy())return false;
  /* Read only the authority gates here. Do not call v7133AuthorityRefresh(), because
     that owner also schedules an active-screen hydrate and would duplicate login RPCs. */
  try{await window.v7040AuthorityRefresh?.(false)}catch(_){}
  try{await window.v7081CapabilitiesRefresh?.(false)}catch(_){}
  return allAuthorityEnforced();
 }
 async function profileIdentity(id){
  if(!id||uid()!==id||!(await db()))return null;
  LOGIN.profileIdentityReads++;
  const {data,error}=await v073Db.from('profiles').select('id,character_name,class_id,class_name').eq('id',id).maybeSingle();
  if(error)throw error;
  return data||null;
 }
 function applyIdentityShell(id,p){
  const f=fresh(id),name=clean(p?.character_name),classId=String(p?.class_id||'');
  if(validName(name)&&VALID_CLASSES.has(classId)){
   f.characterName=name;f.characterNameSet=true;f.playerClass=classId;f.classLocked=true;
  }
  replaceState(f);s.__accountOwnerId=id;s.social=(s.social&&typeof s.social==='object')?s.social:{};s.social.playerId=id;
  try{localStorage.setItem('growLegendsPlayerId',id)}catch(_){}
  resetRuntime(true);return true;
 }
 async function hydrateDungeonLoginDirect(){
  if(!(await db()))throw new Error('DUNGEON_SERVER_OFFLINE');
  const call=v073Db.rpc('v7051_get_dungeon_state',{});
  const {data,error}=await Promise.race([
   call,
   new Promise((_,rej)=>setTimeout(()=>rej(new Error('RPC_TIMEOUT:v7051_get_dungeon_state')),8000))
  ]);
  if(error)throw error;
  const q=Array.isArray(data)?(data[0]??null):data;
  if(!q?.ok)throw new Error('DUNGEON_STATE_UNAVAILABLE:'+String(q?.reason||'UNKNOWN'));
  try{
   if(typeof window.v7051SeedCanonicalState==='function')window.v7051SeedCanonicalState(q);
   else{
    s.dungeon=(s?.dungeon&&typeof s.dungeon==='object')?s.dungeon:{};
    if(q.progress&&typeof q.progress==='object')s.dungeon.progress=clone(q.progress);
    if(Array.isArray(q.completed))s.dungeon.completed=q.completed.map(Number);
    if(Array.isArray(q.unlocked))s.dungeon.unlocked=q.unlocked.map(Number);
    if(q.keyQuestCounts&&typeof q.keyQuestCounts==='object')s.dungeon.keyQuestCounts=clone(q.keyQuestCounts);
    s.dungeonPass=(s?.dungeonPass&&typeof s.dungeonPass==='object')?s.dungeonPass:{};
    if(Number.isFinite(Number(q.lastFreeMs)))s.dungeonPass.lastFree=Math.max(0,Number(q.lastFreeMs));
   }
  }catch(e){throw new Error('DUNGEON_LOGIN_APPLY_FAILED:'+String(e?.message||e))}
  window.__V7202_LOGIN_DUNGEON_READY__=true;
  window.__V7203_LOGIN_DUNGEON_READY__=true;
  return q;
 }
 async function hydrateCanonicalLogin(id){
  if(!id||uid()!==id)throw new Error('ACCOUNT_CHANGED_DURING_HYDRATION');
  LOGIN.canonicalHydrates++;
  let r=null;
  if(typeof window.v7133HydrateAllCore==='function')r=await window.v7133HydrateAllCore();
  else{
   const jobs=[window.v7077ProgressRefresh,window.v7033BuildAuthorityRefresh,window.v7074ItemAuthorityRefresh||window.v7063ItemStageRefresh,()=>window.v7110SyncQuestAuthority?.(true),async()=>{await window.v7040AuthorityRefresh?.();const di=Math.max(0,Math.min(19,Number(s?.dungeon?.selected??s?.dungeon?.lastActive??0)||0));if(typeof window.v7051EnsureDungeonState==='function')return await window.v7051EnsureDungeonState(di,{force:true,paint:false,reason:'login-fallback'});return await hydrateDungeonLoginDirect()},()=>window.v7065GrowAuthorityRefresh?.(true),window.v7070GrowHydrationRefresh,window.v7079PetAuthorityRefresh,window.v7080AchievementRefresh,window.v7072AuthorityRefresh,window.v7073EndgameRefresh].filter(fn=>typeof fn==='function');
   for(const fn of jobs)await fn();
   r={ok:true};
  }
  /* V7.207: the dungeon owner is parsed much later than the account resolver. On a
     cold OAuth return it can briefly be unavailable even though the canonical RPC
     is healthy. Repair only that missing read directly from the server instead of
     failing the whole login into an empty shell. Gameplay stays fail-closed. */
  if(r?.result){
   const d=r.result.dungeon;
   if(!d?.ok||d?.value==null||d?.value?.ok===false){
    try{
     const q=await hydrateDungeonLoginDirect();
     r.result.dungeon={ok:true,value:q,recovered:true};
     r.ok=Object.values(r.result).every(x=>x?.ok!==false);
    }catch(e){LOGIN.lastError=String(e?.message||e)}
   }
  }
  if(r&&r.ok===false)throw new Error('CANONICAL_LOGIN_HYDRATION_FAILED');
  if(r?.result){
   const critical=['progress','build','items','quest','dungeon'].filter(k=>!r.result?.[k]?.ok||r.result?.[k]?.value==null||r.result?.[k]?.value?.ok===false);
   if(critical.length)throw new Error('CANONICAL_LOGIN_CRITICAL_MISSING:'+critical.join(','));
  }
  const v7204Now=Date.now();
  window.__V7204_CANONICAL_LOGIN_AT__=v7204Now;
  window.__V7204_STARTUP_QUIET_UNTIL__=Math.max(Number(window.__V7204_STARTUP_QUIET_UNTIL__||0),v7204Now+4200);
  LOGIN.lastHydrateOk=true;
  try{requestAnimationFrame(()=>{try{render?.()}catch(_){}try{window.v069SyncCurrencies?.()}catch(_){}try{window.v4149BuildCompleteMenu?.(false)}catch(_){}})}catch(_){}
  return true;
 }
 async function resolveServerFirst(id){
  LOGIN.serverFirstLogins++;LOGIN.lastMode='server-first';LOGIN.lastHydrateOk=false;
  /* V7.276: identity is resolved first. A genuinely new account must not fire every
     gameplay-authority RPC before a character exists. Broken Beta save-only characters
     are repaired once here, then continue through the same canonical login path. */
  let p=await profileIdentity(id);if(uid()!==id)return false;
  let profileName=clean(p?.character_name),profileClass=String(p?.class_id||'');
  let hasIdentity=!!p&&validName(profileName)&&VALID_CLASSES.has(profileClass);
  if(!hasIdentity&&serverId()==='beta'){
   const repaired=await v7274EnsureCharacterReady(id);
   if(repaired){p=await profileIdentity(id);profileName=clean(p?.character_name);profileClass=String(p?.class_id||'');hasIdentity=!!p&&validName(profileName)&&VALID_CLASSES.has(profileClass)}
  }
  applyIdentityShell(id,p);
  if(!hasIdentity){
   v075CloudLoadedFor=id;v200LastCloudStamp=null;
   writeMirrors(id,s,{stamp:false,allowIncomplete:true});
   /* V7.276: do not render the gameplay tree for an account that has no character.
      Historical render wrappers would otherwise fire authority reads (quest/daily/
      achievements/etc.) against states that correctly do not exist yet. */
   LOGIN.lastMode='new-account-shell';LOGIN.lastHydrateOk=true;
   return true;
  }
  await warmAuthority();
  if(serverId()==='beta'&&!(await v7274EnsureCharacterReady(id)))throw new Error('BETA_CHARACTER_BOOTSTRAP_INCOMPLETE');
  try{await hydrateCanonicalLogin(id)}catch(e){
   if(serverId()!=='beta')throw e;
   if(!(await v7274EnsureCharacterReady(id)))throw e;
   await hydrateCanonicalLogin(id);
  }
  if(uid()!==id)return false;
  const canonicalClass=String(s?.playerClass||'');
  if(profileClass&&canonicalClass&&profileClass!==canonicalClass)throw new Error('ACCOUNT_IDENTITY_SERVER_MISMATCH');
  const name=clean(p?.character_name);
  if(validName(name)){s.characterName=name;s.characterNameSet=true}
  if(!canonicalClass&&VALID_CLASSES.has(profileClass))s.playerClass=profileClass;
  if(s.playerClass)s.classLocked=true;
  s.__accountOwnerId=id;s.social=(s.social&&typeof s.social==='object')?s.social:{};s.social.playerId=id;
  const health=accountStateHealthCheck({repair:true,reason:'server-login'});
  if(!health.ok)console.warn('[V4139] account state health',health);
  v075CloudLoadedFor=id;v200LastCloudStamp=null;
  try{v213Dirty=false;v213LastComparable=typeof v213Comparable==='function'?v213Comparable(s):''}catch(_){}
  writeMirrors(id,s,{stamp:false,allowIncomplete:true});if(complete(s))writeLock(id,s);
  try{render()}catch(_){}
  return true;
 }

 function candidate(source,data,id){const y=ownedCopy(data,id);return y?{source,data:y}:null}
 function newer(a,b){if(!a)return b;if(!b)return a;const ta=savedAt(a.data),tb=savedAt(b.data);if(tb!==ta)return tb>ta?b:a;const ra=rev(a.data),rb=rev(b.data);if(rb!==ra)return rb>ra?b:a;return a.source==='cloud'?a:b}
 function choose(id,cloudData,scoped){
  const c=candidate('cloud',cloudData,id),l=candidate('local',scoped,id);
  if(!c&&!l)return {choice:null,conflict:false};
  if(c&&!l)return {choice:c,conflict:false};if(l&&!c)return {choice:l,conflict:false};
  const cc=complete(c.data),lc=complete(l.data);
  if(cc&&!lc)return {choice:c,conflict:false};if(lc&&!cc)return {choice:l,conflict:false};
  if(cc&&lc&&identity(c.data)!==identity(l.data)){
   const lock=readLock(id),li=String(lock?.identity||'');
   if(li&&li===identity(c.data))return {choice:c,conflict:false};
   if(li&&li===identity(l.data))return {choice:l,conflict:false};
   return {choice:null,conflict:true,cloudIdentity:identity(c.data),localIdentity:identity(l.data)};
  }
  return {choice:newer(c,l),conflict:false};
 }
 window.v4139ChooseAccountSave=(id,cloudData,scoped)=>choose(String(id||''),cloudData,scoped);

 async function apply(data,id){
  if(!id||uid()!==id)return false;
  if(serverLoginPolicy()){
   LOGIN.legacyWholeSaveBlocks++;LOGIN.lastMode='blocked-whole-save';
   try{await hydrateCanonicalLogin(id);return true}catch(e){LOGIN.lastError=String(e?.message||e);LOGIN.canonicalHydrateFailures++;return false}
  }
  const y=ownedCopy(data,id);if(!y)return false;
  let loaded=y;try{if(typeof v075SanitizeSave==='function'){const z=v075SanitizeSave(y);if(z)loaded=ownedCopy(z,id)||y}}catch(e){}
  if(uid()!==id)return false;
  replaceState(loaded);s.__accountOwnerId=id;s.social=(s.social&&typeof s.social==='object')?s.social:{};s.social.playerId=id;
  const health=accountStateHealthCheck({repair:true,reason:'legacy-login'});
  if(!health.ok)console.warn('[V4139] account state health',health);
  try{v213SaveRevision=Math.max(Number(v213SaveRevision)||0,rev(s));v213Dirty=false;v213LastComparable=typeof v213Comparable==='function'?v213Comparable(s):''}catch(e){}
  writeMirrors(id,s,{stamp:false,allowIncomplete:true});resetRuntime(true);
  try{render()}catch(e){}
  return true;
 }

 async function resolve(){
  const id=uid();if(!id)return false;
  if(resolvePromise&&resolveUid===id)return resolvePromise;
  resolveUid=id;
  resolvePromise=(async()=>{
   try{
    v075CloudLoadedFor=null;window.__V200_AUTH_READY__=false;resetRuntime(false);
    await waitFinalOwners();
    if(serverLoginPolicy())return await resolveServerFirst(id);
    LOGIN.legacyResolverRuns++;LOGIN.lastMode='legacy-compatibility';
    const row=await cloudRow(id);if(uid()!==id)return false;
    const scoped=readJson(scopedKey(id));
    const picked=choose(id,row?.save_data||null,scoped);
    if(picked.conflict){
      warn('Account-Spielstand-Konflikt','Cloud und lokaler Account-Save enthalten unterschiedliche Charaktere. Aus Sicherheitsgründen wurde keiner überschrieben.');
      return false;
    }
    if(picked.choice?.data){
      if(!(await apply(picked.choice.data,id)))return false;
      v200LastCloudStamp=row?.updated_at||null;
      if(complete(s))writeLock(id,s);
    }else{
      const f=fresh(id);replaceState(f);clearLegacyHelpers(id);writeMirrors(id,s,{stamp:false,allowIncomplete:true});resetRuntime(true);v200LastCloudStamp=null;
    }
    if(uid()!==id||!exactOwned(s,id))return false;
    v075CloudLoadedFor=id;
    try{v213LastComparable=typeof v213Comparable==='function'?v213Comparable(s):'';v213StartMonitor?.()}catch(e){}
    return true;
   }catch(e){LOGIN.lastError=String(e?.message||e);if(serverLoginPolicy())LOGIN.canonicalHydrateFailures++;console.error('V7.199 account resolver',e);warn('Account konnte nicht serverseitig geladen werden',e?.message||String(e));return false}
   finally{resolvePromise=null;resolveUid=''}
  })();
  return resolvePromise;
 }
 resolve.__v7194ServerOnlyLogin=true;
 v075ResolveCloudAfterLogin=resolve;try{window.v075ResolveCloudAfterLogin=resolve}catch(e){}
 window.__V4139_LOGIN_AUTHORITY__=Object.freeze({version:'V7.199',mode:'server-first-fail-closed',playerSavesGameplayRestore:false,localGameplayRestore:false,identitySource:'profiles-server-identity-only',canonicalHydration:'v7133HydrateAllCore'});
 window.v4139LoginAuthorityDiagnostics=()=>({...LOGIN,policy:window.__V4139_LOGIN_AUTHORITY__,allAuthorityEnforced:allAuthorityEnforced(),resolverGuarded:!!window.v075ResolveCloudAfterLogin?.__v7194ServerOnlyLogin,accountHealth:clone(lastHealth)});

 v075ApplyCloudSave=async function(data){const id=uid();if(!id)return false;return await apply(data,id)};
 try{window.v075ApplyCloudSave=v075ApplyCloudSave}catch(e){}

 v200SaveScopedLocal=function(){
  const id=uid();if(!id||!exactOwned(s,id))return false;
  return writeMirrors(id,s,{stamp:false,allowIncomplete:true});
 };
 try{window.v200SaveScopedLocal=v200SaveScopedLocal}catch(e){}

 v200FreshState=function(id=uid()){
  id=String(id||'');const f=fresh(id);replaceState(f);
  if(id){clearLegacyHelpers(id);try{localStorage.removeItem(ID_PREFIX+id+':server:'+serverId());localStorage.removeItem(lockKey(id))}catch(e){};writeMirrors(id,s,{stamp:false,allowIncomplete:true})}
  else try{localStorage.removeItem(KEY)}catch(e){}
  resetRuntime(true);return s;
 };
 try{window.v200FreshState=v200FreshState}catch(e){}

 async function cloudWrite(force=false){
  const id=uid();
  if(!id||!complete(s)||!exactOwned(s,id)||String(v075CloudLoadedFor||'')!==id||!(await db()))return false;
  if(typeof window.v452AccountVerified==='function'&&!window.v452AccountVerified(id))return false;

  /* V7.097: for fully authoritative accounts the per-domain server tables are canonical.
     Do NOT push the 24 MB-era legacy save JSON after gameplay actions: player_saves has
     28 historical triggers and one write can block unrelated RPCs for many seconds. */
  try{
   const c=window.v7081CapabilitiesDiagnostics?.();
   const cp=c?.caps||{};
   const authoritative=!!(c?.ready&&cp.progress&&cp.items&&cp.grow&&cp.tower&&cp.achievements);
   if(authoritative){
    lastCloudWriteAt=Date.now();cloudFailCount=0;
    v075CloudLoadedFor=id;
    try{
     v213Dirty=false;
     v213LastComparable=typeof v213Comparable==='function'?v213Comparable(s):JSON.stringify(s);
     writeMirrors(id,s,{stamp:false,allowIncomplete:false});
     writeLock(id,s);
    }catch(_){}
    return true;
   }
  }catch(_){}

  /* V7.091: one physical player_saves write at a time. Every historical caller
     shares this promise instead of creating another PostgREST upsert. */
  if(writeInFlight){writeQueued=true;return writeInFlight}

  writeInFlight=(async()=>{
   let changedDuringWrite=false;
   try{
    const minGap=force?0:2200;
    const wait=Math.max(0,minGap-(Date.now()-lastCloudWriteAt));
    if(wait)await new Promise(r=>setTimeout(r,wait));
    if(uid()!==id||!exactOwned(s,id)||!complete(s))return false;

    const snapBase=ownedCopy(s,id);if(!snapBase)return false;
    const snapComparable=typeof v213Comparable==='function'?v213Comparable(snapBase):JSON.stringify(snapBase);
    const next=Math.max(rev(snapBase),Number(typeof v213SaveRevision==='undefined'?0:v213SaveRevision)||0)+1;
    snapBase.__saveRevision=next;snapBase.__savedAt=Date.now();

    const now=new Date().toISOString();
    const {error}=await v073Db.from('player_saves').upsert({user_id:id,save_data:snapBase,updated_at:now},{onConflict:'user_id'});
    if(error)throw error;
    if(uid()!==id||!exactOwned(s,id))return false;

    lastCloudWriteAt=Date.now();cloudFailCount=0;
    v075CloudLoadedFor=id;v200LastCloudStamp=now;

    const currentComparable=typeof v213Comparable==='function'?v213Comparable(s):JSON.stringify(s);
    changedDuringWrite=currentComparable!==snapComparable;
    try{
      v213SaveRevision=Math.max(Number(v213SaveRevision)||0,next);
      s.__saveRevision=Math.max(rev(s),next);
      s.__savedAt=Math.max(Number(s.__savedAt)||0,Number(snapBase.__savedAt)||0);
      v213Dirty=changedDuringWrite;
      /* If gameplay changed while the request was in flight, keep the comparable
         at the saved snapshot so the normal monitor schedules one later pass. */
      v213LastComparable=changedDuringWrite?snapComparable:(typeof v213Comparable==='function'?v213Comparable(s):'');
      writeMirrors(id,s,{stamp:false,allowIncomplete:false});
      writeLock(id,s);
    }catch(e){}

    /* profiles is only a public mirror. Never hammer it after every cloud save. */
    if(Date.now()-lastProfileMirrorAt>15000){
      lastProfileMirrorAt=Date.now();
      setTimeout(async()=>{try{if(uid()===id&&window.__V200_AUTH_READY__===true&&typeof v073SyncProfile==='function')await v073SyncProfile(true)}catch(e){}},0);
    }
    return true;
   }catch(e){
    try{v213Dirty=true}catch(_){}
    cloudFailCount++;
    console.warn('V7.091 cloud save delayed',e);
    /* Short lock/timeout bursts retry silently. Only repeated failures surface. */
    if(force||cloudFailCount>=3)warn('Cloud-Speicherung verzögert',e?.message||String(e));
    return false;
   }finally{
    const again=writeQueued||changedDuringWrite;
    writeQueued=false;writeInFlight=null;
    if(again&&uid()===id&&exactOwned(s,id)&&complete(s)){
      try{clearTimeout(v075SaveTimer)}catch(e){}
      try{v075SaveTimer=setTimeout(()=>{try{void cloudWrite(false)}catch(e){}},2600)}catch(e){}
    }
   }
  })();
  return writeInFlight;
 }
 v075WriteCloudSave=cloudWrite;try{window.v075WriteCloudSave=v075WriteCloudSave}catch(e){}
 v075ScheduleSave=function(){
  try{clearTimeout(v075SaveTimer)}catch(e){}
  const id=uid();if(!id||!complete(s)||!exactOwned(s,id)||String(v075CloudLoadedFor||'')!==id)return;
  if(typeof window.v452AccountVerified==='function'&&!window.v452AccountVerified(id))return;
  v075SaveTimer=setTimeout(()=>{void cloudWrite(false)},1800);
 };
 try{window.v075ScheduleSave=v075ScheduleSave}catch(e){}

 /* The generic KEY/current in-memory state is NEVER an account resolver candidate. */
 v213PickNewestSave=function(id,cloudData,scoped,current){return choose(String(id||''),cloudData,scoped).choice};
 try{window.v213PickNewestSave=v213PickNewestSave}catch(e){}

 /* Neutralize before any historical finalizer can stamp the previous account with next uid. */
 try{
  if(typeof v200FinalizeUser==='function'){
   const base=v200FinalizeUser;
   v200FinalizeUser=async function(user){
    const next=String(user?.id||'');if(!next||user?.is_anonymous)return base.apply(this,arguments);
    const v4141Started=(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();
    /* Supabase INITIAL_SESSION + boot getSession can both request finalization. Once this
       exact account is already verified, treat later same-user callbacks as auth refreshes. */
    try{
     if(uid()===next&&window.__V200_AUTH_READY__===true&&exactOwned(s,next)&&String(v075CloudLoadedFor||'')===next&&
        (typeof window.v452AccountVerified!=='function'||window.v452AccountVerified(next))){v073User=user;v073Ready=true;return true}
    }catch(e){}
    if(outerFinalizePromise&&outerFinalizeUid===next)return outerFinalizePromise;
    const ctx=this,args=arguments;outerFinalizeUid=next;
    outerFinalizePromise=(async()=>{
      if(!exactOwned(s,next)){backupCurrent(next);neutralize('account-switch')}
      const r=await base.apply(ctx,args);
      const gateOk=typeof window.v452AccountVerified==='function'?window.v452AccountVerified(next):true;
      if(r&&gateOk&&uid()===next&&exactOwned(s,next)&&String(v075CloudLoadedFor||'')===next){
        resetRuntime(true);try{v224Released=false;v224Release?.()}catch(e){}
      }
      try{
        const now=(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();
        window.__V4141_LOGIN_TIMING__={uid:next,ok:!!r,totalMs:Math.max(0,Math.round(now-v4141Started)),at:Date.now()};
      }catch(e){}
      return r;
    })().finally(()=>{if(outerFinalizeUid===next){outerFinalizeUid='';outerFinalizePromise=null}});
    return outerFinalizePromise;
   };
   try{window.v200FinalizeUser=v200FinalizeUser}catch(e){}
  }
 }catch(e){console.warn('V4.159 finalize authority',e)}

 /* Final logout cleanup: scoped/cloud save survives; generic in-memory session does not. */
 try{
  if(typeof v136Logout==='function'){
   const base=v136Logout;
   v136Logout=async function(reason='manual'){
    const r=await base.apply(this,arguments);
    if(!v073User){neutralize('logout');try{v075Overlay(true)}catch(e){}}
    return r;
   };
   try{window.v136Logout=v136Logout}catch(e){}
  }
 }catch(e){console.warn('V4.159 logout authority',e)}

 /* Account-specific notification memory instead of one browser-wide seen list. */
 try{
  if(typeof v210LoadSeen==='function')v210LoadSeen=function(){const id=uid();if(!id)return{};try{return JSON.parse(localStorage.getItem('growLegendsV210Notifications:'+id)||'{}')||{}}catch(e){return{}}};
  if(typeof v210SaveSeen==='function')v210SaveSeen=function(){const id=uid();if(!id)return;try{localStorage.setItem('growLegendsV210Notifications:'+id,JSON.stringify(v210Seen||{}))}catch(e){}};
 }catch(e){}

 function duplicateProgress(){
  const id=uid();if(!id||!complete(s))return[];const out=[];
  const fp=x=>{try{const y=clone(x);['characterName','playerName','name','playerClass','classLocked','characterNameSet','__accountOwnerId','__savedAt','__saveRevision','social'].forEach(k=>delete y[k]);return JSON.stringify(y)}catch(e){return''}};
  const mine=fp(s);if(!mine||Math.max(1,Number(s.level)||1)<=1)return out;
  try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||'';if(!k.startsWith(ACCOUNT_PREFIX)||k===scopedKey(id))continue;const x=readJson(k);if(x&&complete(x)&&fp(x)===mine)out.push({key:k,name:clean(x.characterName),level:Number(x.level)||1})}}catch(e){}
  return out;
 }
 window.v4139AccountAudit=async()=>{
  const id=uid(),scoped=id?readJson(scopedKey(id)):null,row=id?await cloudRow(id).catch(()=>null):null;
  return {version:V.short,uid:id,authReady:window.__V200_AUTH_READY__===true,verified:!!(id&&window.v452AccountVerified?.(id)),cloudLoaded:String(typeof v075CloudLoadedFor==='undefined'?'':v075CloudLoadedFor||''),state:{owner:owner(s),social:socialOwner(s),name:clean(s?.characterName),classId:String(s?.playerClass||''),level:Number(s?.level)||1,complete:complete(s)},scoped:scoped?{owner:owner(scoped),social:socialOwner(scoped),name:clean(scoped.characterName),classId:String(scoped.playerClass||''),level:Number(scoped.level)||1,complete:complete(scoped)}:null,cloud:row?.save_data?{owner:owner(row.save_data),social:socialOwner(row.save_data),name:clean(row.save_data.characterName),classId:String(row.save_data.playerClass||''),level:Number(row.save_data.level)||1,complete:complete(row.save_data)}:null,duplicateProgress:duplicateProgress()};
 };
 window.v4139AccountIsolationSelfTest=()=>{
  const A='A',B='B',a={level:57,characterName:'A',characterNameSet:true,playerClass:'grower',__accountOwnerId:A,social:{playerId:A},__savedAt:10},b={level:1,characterName:'B',characterNameSet:true,playerClass:'scout',__accountOwnerId:B,social:{playerId:B},__savedAt:20};
  const foreign=choose(B,a,null);const own=choose(B,null,b);return{foreignRejected:!foreign.choice,ownSelected:own.choice?.data?.__accountOwnerId===B,genericIgnored:v213PickNewestSave(B,null,b,a)?.data?.__accountOwnerId===B,freshLevel:Math.max(1,Number(fresh(B).level)||1)===1};
 };

 function stamp(){}
 stamp();
})();
