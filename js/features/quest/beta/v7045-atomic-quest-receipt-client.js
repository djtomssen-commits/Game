
/* ===== V7.045 atomic Quest authority client =====
   Safe while Quest=mirror: all legacy/local behavior remains untouched.
   When Quest=enforce, V7.045 exclusively uses the V7.044 receipt-based server APIs.
*/
(()=>{
'use strict';
if(window.__V7045_ATOMIC_QUEST_CLIENT__)return;
window.__V7045_ATOMIC_QUEST_CLIENT__=true;

const VERSION='V7.045';
const C={busy:false,recovering:false,lastError:'',lastRunId:null,lastAck:null,lastRecovery:null};
let questStateFlight=null,questStateCache=null,questStateAt=0;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const row=d=>Array.isArray(d)?d[0]:d;
const itemId=it=>String(it?.id||it?.uid||'');
const mode=()=>{try{return String(window.v7040AuthorityDiagnostics?.()?.domains?.quest||'off')}catch(_){return'off'}};
const enforced=()=>mode()==='enforce';
const toast=(title,type='info',detail='')=>{try{return window.v063Toast?.(title,type,detail)}catch(_){try{return window.v115Alert?.(detail||title,title,type)}catch(__){}}};

function ensureShape(){
 s.quests=(s?.quests&&typeof s.quests==='object')?s.quests:{offers:[],active:null,eliteOffer:null};
 s.inventory=Array.isArray(s?.inventory)?s.inventory:[];
 s.materials=Array.isArray(s?.materials)?s.materials:[];
 s.equipment=(s?.equipment&&typeof s.equipment==='object')?s.equipment:{};
 s.grow=(s?.grow&&typeof s.grow==='object')?s.grow:{};
 s.grow.seeds=(s.grow.seeds&&typeof s.grow.seeds==='object')?s.grow.seeds:{};
 s.dungeon=(s?.dungeon&&typeof s.dungeon==='object')?s.dungeon:{};
 s.v488Forge=(s?.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
 s.v686PetAlbum=(s?.v686PetAlbum&&typeof s.v686PetAlbum==='object')?s.v686PetAlbum:{};
 s.v686PetAlbum.found=(s.v686PetAlbum.found&&typeof s.v686PetAlbum.found==='object')?s.v686PetAlbum.found:{};
 s.v686PetAlbum.dropState=(s.v686PetAlbum.dropState&&typeof s.v686PetAlbum.dropState==='object')?s.v686PetAlbum.dropState:{};
}
function rpcTimeout(name,args={},ms=9000){
 const x=db();if(!x)return Promise.reject(new Error('SERVER_OFFLINE'));
 return Promise.race([
  x.rpc(name,args).then(({data,error})=>{if(error)throw error;return row(data)}),
  new Promise((_,rej)=>setTimeout(()=>rej(new Error('RPC_TIMEOUT:'+name)),ms))
 ]);
}
async function refreshModes(){
 try{await window.v7040AuthorityRefresh?.()}catch(_){}
 return mode();
}
function persistLocal(){
 try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
 try{persist(false)}catch(_){}
}
async function writeCloud(){
 try{
  if(typeof v075WriteCloudSave==='function'){
   return await Promise.race([
    Promise.resolve(v075WriteCloudSave(false)),
    new Promise((_,rej)=>setTimeout(()=>rej(new Error('CLOUD_SAVE_TIMEOUT')),7000))
   ]);
  }
  try{v075ScheduleSave?.()}catch(_){}
 }catch(e){console.warn('[V7045] cloud write',e);throw e}
}
function paintAll(){
 try{window.v069SyncCurrencies?.()}catch(_){}
 try{v271PaintDampf?.()}catch(_){}
 try{renderInventory?.()}catch(_){}
 try{renderQuests?.()}catch(_){}
 try{render?.()}catch(_){}
}

function applyQuestState(q){
 if(!q||typeof q!=='object')return;
 ensureShape();
 if(Number.isFinite(Number(q.energy)))s.energy=Math.max(0,Number(q.energy));
 if(Array.isArray(q.offers))s.quests.offers=clone(q.offers);
 if('active' in q)s.quests.active=q.active?clone(q.active):null;
 if('eliteOffer' in q)s.quests.eliteOffer=q.eliteOffer?clone(q.eliteOffer):null;
 if(q.day){
  const day=String(q.day);s.v026DampfDay=day;
  s.v271DampfRefill={day,count:Math.max(0,Number(q.refills)||0)};
  const d=q.daily||{};
  s.v109HarzDaily={day,firstQuest:!!d.firstQuest,questEnergy:Math.max(0,Number(d.questEnergy)||0),energyHarz:Math.max(0,Number(d.energyHarz)||0)};
 }
}
function addItemExact(it){
 if(!it||typeof it!=='object')return false;
 ensureShape();const id=itemId(it);
 if(id&&s.inventory.some(x=>itemId(x)===id))return false;
 if(id&&Object.values(s.equipment||{}).some(x=>itemId(x)===id))return false;
 s.inventory.push(clone(it));return true;
}
function addMaterialExact(it){
 if(!it||typeof it!=='object')return false;
 ensureShape();const id=itemId(it);
 if(id&&s.materials.some(x=>itemId(x)===id))return false;
 s.materials.push(clone(it));return true;
}
function applyPetExact(p,source){
 if(!p||typeof p!=='object')return;
 ensureShape();
 if(p.drop&&p.pet_id&&p.quality){
  const already=!!s.v686PetAlbum?.found?.[p.pet_id]?.[p.quality];
  if(!already){
   try{window.v7079PresentServerPet?.(p.pet_id,p.quality,source||'quest')}catch(e){console.warn('[V7045] pet popup/grant',e)}
  }
 }
 if(p.found&&typeof p.found==='object')s.v686PetAlbum.found=clone(p.found);
 if(Number.isFinite(Number(p.standardSinceLegendary))){
  s.v686PetAlbum.dropState.standardSinceLegendary=Math.max(0,Number(p.standardSinceLegendary));
 }
 try{window.v686InvalidatePetCache?.()}catch(_){}
 try{if(document.getElementById('v686PetAlbumOverlay')?.classList.contains('show'))window.v686RefreshPetAlbum?.(true)}catch(_){}
 try{window.v6104UpdatePetIndicators?.()}catch(_){}
}
function applyDungeonUnlock(u){
 if(!u||typeof u!=='object')return;
 ensureShape();
 if(Array.isArray(u.unlocked))s.dungeon.unlocked=u.unlocked.map(Number);
 if(u.keyQuestCounts&&typeof u.keyQuestCounts==='object')s.dungeon.keyQuestCounts=clone(u.keyQuestCounts);
 if(u.won&&Number.isInteger(Number(u.target))){
  const i=Number(u.target);s.dungeon.keys=(s.dungeon.keys&&typeof s.dungeon.keys==='object')?s.dungeon.keys:{};s.dungeon.keys[i]=true;
 }
}
function applyBundle(b){
 if(!b||typeof b!=='object')return;
 ensureShape();
 if(Number.isFinite(Number(b.level)))s.level=Math.max(1,Number(b.level));
 if(Number.isFinite(Number(b.level_xp)))s.xp=Math.max(0,Number(b.level_xp));
 if(Number.isFinite(Number(b.gold_balance)))s.gold=Math.max(0,Number(b.gold_balance));
 if(Number.isFinite(Number(b.harz_balance)))s.harzTaler=Math.max(0,Number(b.harz_balance));
 if(Number.isFinite(Number(b.energy)))s.energy=Math.max(0,Number(b.energy));
 if(Array.isArray(b.offers))s.quests.offers=clone(b.offers);
 if('eliteOffer' in b)s.quests.eliteOffer=b.eliteOffer?clone(b.eliteOffer):null;
 if('active' in b)s.quests.active=b.active?clone(b.active):null;
 const d=b.daily||{};
 if(s.v109HarzDaily&&typeof s.v109HarzDaily==='object'){
  s.v109HarzDaily.firstQuest=!!d.firstQuest;
  s.v109HarzDaily.questEnergy=Math.max(0,Number(d.questEnergy)||0);
  s.v109HarzDaily.energyHarz=Math.max(0,Number(d.energyHarz)||0);
 }
 addItemExact(b.item);
 (Array.isArray(b.materials)?b.materials:[]).forEach(addMaterialExact);
 if(Number.isFinite(Number(b.fragments_balance)))s.v488Forge.fragments=Math.max(0,Number(b.fragments_balance));
 const sr=b.seed_reward;
 if(sr&&typeof sr==='object'){
  if(Number.isFinite(Number(sr.time_seeds)))s.timeSeeds=Math.max(0,Number(sr.time_seeds));
  if(sr.grow_seeds&&typeof sr.grow_seeds==='object')s.grow.seeds=clone(sr.grow_seeds);
 }
 applyPetExact(b.pet,b?.pet?.elite?'elite':((b?.item?.v310EliteReward||false)?'elite':'quest'));
 applyDungeonUnlock(b.dungeon_unlock);
}
function markQuestSideEffects(runId,q,b){
 if(!runId)return;
 ensureShape();
 s.v7045QuestSideEffectsSeen=(s.v7045QuestSideEffectsSeen&&typeof s.v7045QuestSideEffectsSeen==='object')?s.v7045QuestSideEffectsSeen:{};
 const key=String(runId);if(s.v7045QuestSideEffectsSeen[key])return;
 s.v7045QuestSideEffectsSeen[key]=Date.now();
 const keys=Object.keys(s.v7045QuestSideEffectsSeen);if(keys.length>80)keys.sort((a,b)=>Number(s.v7045QuestSideEffectsSeen[a])-Number(s.v7045QuestSideEffectsSeen[b])).slice(0,keys.length-80).forEach(k=>delete s.v7045QuestSideEffectsSeen[k]);
 s.v106Achievements=(s.v106Achievements&&typeof s.v106Achievements==='object')?s.v106Achievements:{done:{},stats:{}};
 s.v106Achievements.done=(s.v106Achievements.done&&typeof s.v106Achievements.done==='object')?s.v106Achievements.done:{};
 s.v106Achievements.stats=(s.v106Achievements.stats&&typeof s.v106Achievements.stats==='object')?s.v106Achievements.stats:{};
 s.v106Achievements.stats.questsDone=Math.max(0,Number(s.v106Achievements.stats.questsDone)||0)+1;
 /* Existing V4.02 counter records the offer's base Gold, not event-doubled payout. */
 s.v106Achievements.stats.goldEarned=Math.max(0,Number(s.v106Achievements.stats.goldEarned)||0)+Math.max(0,Number(q?.gold??b?.gold_base)||0);
 try{v106CheckAchievements?.(true)}catch(_){}
 try{
  if(typeof window.v474AwardGuildActivity==='function')void window.v474AwardGuildActivity('quest','server:'+key);
  else if(typeof window.v411AwardGuildActivity==='function')void window.v411AwardGuildActivity('quest');
 }catch(_){}
 try{window.v6239WeeklyChestActivity?.('quest',{quest:clone(q||{}),elite:!!q?.v310Elite,runId},'server:'+key)}catch(_){}
}
function secondaryToasts(b){
 if(typeof window.v7136ShowServerReward==='function')return;
 try{
  const sr=b?.seed_reward||{};
  if(Number(sr.time_amount)>0)toast('🌱 Zeit-Samen gefunden!','success',`+${Number(sr.time_amount)} Zeit-Samen · Bestand: ${Number(sr.time_seeds)||0}`);
  if(Number(sr.grow_amount)>0)toast('🌰 Grow-Samen gefunden','success',`+${Number(sr.grow_amount)} Samen · ${String(sr.grow_seed||'Questfund')}`);
  const mc=Array.isArray(b?.materials)?b.materials.length:0;if(mc)toast('💎 Material gefunden','success',`${mc} Quest-Material${mc===1?'':'ien'} erhalten.`);
  if(Number(b?.fragments_awarded)>0)toast('🧩 Fragmente gefunden','success',`+${Number(b.fragments_awarded)} Fragmente`);
 }catch(_){}
}
async function canonicalQuestState(force=false){
 if(questStateFlight)return questStateFlight;
 if(!force&&questStateCache&&Date.now()-questStateAt<900){
  const q=clone(questStateCache);if(q?.ok)applyQuestState(q);return q;
 }
 questStateFlight=(async()=>{
  const q=await rpcTimeout('v7044_get_quest_state',{},7000);
  if(q?.ok){questStateCache=clone(q);questStateAt=Date.now();applyQuestState(q)}
  return q;
 })().finally(()=>{questStateFlight=null});
 return questStateFlight;
}
function invalidateQuestState(){questStateAt=0;questStateCache=null}
window.v7045QuestCanonicalState=(force=false)=>canonicalQuestState(!!force);
async function receipt(runId){
 if(!runId)return null;
 try{return await rpcTimeout('v7044_quest_receipt',{p_run_id:Number(runId)},6000)}catch(_){return null}
}
async function pendingReceipt(){
 try{return await rpcTimeout('v7044_pending_quest_receipt',{},6000)}catch(_){return null}
}
async function ack(runId){
 let last=null;
 for(let i=0;i<3;i++){
  try{last=await rpcTimeout('v7102_ack_quest_receipt',{p_run_id:Number(runId)},5000)}catch(e){last={ok:false,reason:String(e?.message||e)}}
  if(last?.ok){C.lastAck={runId:Number(runId),at:Date.now()};return last}
  await sleep(220+220*i);
 }
 return last;
}
async function commitRecoveredBundle(b,{showRecovery=true,qSnapshot=null}={}){
 if(!b?.ok||!b?.run_id)return false;
 const runId=Number(b.run_id);C.lastRunId=runId;

 /* The receipt can be old while the server already owns a newer offer batch.
    Apply rewards, but never let a stale receipt overwrite offers/active quest UI. */
 const rewardOnly=clone(b)||{};
 delete rewardOnly.offers;delete rewardOnly.eliteOffer;delete rewardOnly.active;

 const a=await ack(runId);
 applyBundle(rewardOnly);
 try{const qs=await canonicalQuestState();if(qs?.ok)applyQuestState(qs)}catch(_){}
 markQuestSideEffects(runId,qSnapshot||{},b);
 persistLocal();paintAll();
 secondaryToasts(b);

 if(showRecovery){
  if(a?.ok)toast('📜 Quest-Belohnung wiederhergestellt','success','Die bestätigte Server-Belohnung wurde übernommen.');
  else toast('📜 Quest-Belohnung gesichert','warn','Die Belohnung ist serverseitig gespeichert. Die Bestätigung wird automatisch nachgeholt.');
 }
 return true;
}
async function recoverPending({quiet=false}={}){
 if(C.recovering||!enforced())return false;C.recovering=true;
 try{
  const p=await pendingReceipt();
  if(p?.pending&&p?.resolved&&p?.run_id){C.lastRecovery={runId:Number(p.run_id),at:Date.now()};return await commitRecoveredBundle(p,{showRecovery:!quiet})}
  return false;
 }catch(e){C.lastError=String(e?.message||e);return false}
 finally{C.recovering=false}
}
async function recoverClaimAfterTimeout(runId,qSnapshot,before){
 for(let i=0;i<6;i++){
  const r=await receipt(runId);
  if(r?.resolved&&r?.ok){
   if(qSnapshot&&typeof v311PlayFight==='function'){
    try{await Promise.race([Promise.resolve(v311PlayFight(clone(qSnapshot))),sleep(6000)])}catch(_){}
   }
   const rewardOnly=clone(r)||{};delete rewardOnly.active;
   applyBundle(rewardOnly);try{await canonicalQuestState(true)}catch(_){};markQuestSideEffects(runId,qSnapshot,r);persistLocal();paintAll();secondaryToasts(r);
   try{
    if(typeof window.v7136ShowServerReward==='function')window.v7136ShowServerReward('quest',r,{quest:qSnapshot||before?.q,recovered:true});
    else if(before&&typeof v235ShowQuestReward==='function')v235ShowQuestReward(before);
   }catch(_){}
   await ack(runId);return r;
  }
  await sleep(500);
 }
 return null;
}

const baseStart=window.startQuest;
async function startServerQuest(i,argsThis,argsObj){
 if(C.busy)return false;C.busy=true;window.__V7214_QUEST_MUTATION_BUSY__=true;invalidateQuestState();
 try{
  let r;
  try{r=await rpcTimeout('v7044_start_quest',{p_index:Number(i)},8500)}catch(e){
   C.lastError=String(e?.message||e);
   for(let n=0;n<5;n++){await sleep(400);try{const st=await canonicalQuestState();if(st?.active?.serverRunId){persistLocal();paintAll();return st}}catch(_){}}
   toast('Quest-Server nicht erreichbar','error','Es wurde keine zweite Quest gestartet. Bitte erneut versuchen.');return false;
  }
  if(!r?.ok&&/PENDING|RECEIPT/i.test(String(r?.reason||''))){
   await recoverPending({quiet:true});
   try{r=await rpcTimeout('v7044_start_quest',{p_index:Number(i)},8500)}catch(e){C.lastError=String(e?.message||e)}
  }
  if(!r?.ok){
   if(Number.isFinite(Number(r?.energy)))s.energy=Math.max(0,Number(r.energy));
   persistLocal();paintAll();
   const why=String(r?.reason||'');
   const detail=why==='INSUFFICIENT_DAMPF'
     ?`Nicht genug Dampf. Serverstand: ${Math.max(0,Number(r?.energy)||0)} · benötigt: ${Math.max(1,Number(r?.cost)||1)}.`
     :why==='INVALID_QUEST'?'Diese Quest ist nicht mehr aktuell. Die Angebote werden neu abgeglichen.'
     :why==='QUEST_ALREADY_ACTIVE'?'Es läuft bereits eine Quest.'
     :(why||'Serveraktion fehlgeschlagen.');
   toast('Quest nicht gestartet','warn',detail);return false
  }
  applyQuestState(r);persistLocal();paintAll();
  try{window.v4127EnsureQuestSkip?.()}catch(_){}
  try{if(s.quests?.active?.ends)window.glSyncQuestPushJob?.(Number(s.quests.active.ends))}catch(_){}
  return r;
 }finally{C.busy=false;window.__V7214_QUEST_MUTATION_BUSY__=false}
}
if(typeof baseStart==='function'){
 const w=async function(i){
  if(!enforced()){try{return baseStart.apply(this,arguments)}catch(e){throw e}}
  return startServerQuest(i,this,arguments);
 };
 w.__v7045Atomic=true;w.__v7045Base=baseStart;window.startQuest=w;try{startQuest=w}catch(_){}
}

const base233=window.v233ClaimQuest||((typeof v233ClaimQuest==='function')?v233ClaimQuest:null);
const baseClaim=window.claimQuest||((typeof claimQuest==='function')?claimQuest:null);
async function claimServerQuest(){
 if(C.busy)return false;
 const q=s?.quests?.active;if(!q||Date.now()<Number(q.ends||0))return false;
 const runId=Number(q.serverRunId)||0;if(!runId){toast('Quest-Serverfehler','error','Server-Quest-ID fehlt.');return false}
 C.busy=true;window.__V7214_QUEST_MUTATION_BUSY__=true;invalidateQuestState();C.lastRunId=runId;
 const before=(()=>{try{
  const snap=typeof v235RewardSnapshot==='function'?v235RewardSnapshot(q):{q:clone(q),gold:Number(s.gold)||0,harz:Number(s.harzTaler)||0,inventory:(s.inventory||[]).map(itemId)};
  snap.level=Math.max(1,Number(s.level)||1);
  return snap;
 }catch(_){return{q:clone(q),level:Math.max(1,Number(s?.level)||1)}}})();
 try{
  let b;
  try{b=await rpcTimeout('v7044_claim_quest',{},9000)}catch(e){
   C.lastError=String(e?.message||e);
   const recovered=await recoverClaimAfterTimeout(runId,q,before);
   if(recovered)return recovered;
   toast('Quest-Belohnung wird geprüft','warn','Keine zweite Belohnung wird ausgelöst. Beim nächsten Start wird der Serverstatus erneut geprüft.');return false;
  }
  if(!b?.ok){toast('Quest nicht abgeschlossen','warn',String(b?.reason||'Serveraktion fehlgeschlagen.'));return false}
  if(b.won===false)return false;
  /* A successful server claim has consumed the active run. Clear the local
     projection immediately so a failed/stale follow-up state fetch cannot
     leave the finished Quest card visible. Any explicit server bundle/state
     below may still replace this value authoritatively. */
  ensureShape();s.quests.active=null;
  /* Presentation is never allowed to block the committed server reward. */
  try{if(typeof v311PlayFight==='function')await Promise.race([Promise.resolve(v311PlayFight(clone(q))),sleep(6000)])}catch(e){console.warn('[V7045] quest presentation',e)}
  /* A resolved claim must never resurrect the consumed run from a stale
     receipt/bundle. Rewards are applied, while active quest state is fetched
     separately from the canonical server state below. */
  const rewardOnly=clone(b)||{};delete rewardOnly.active;
  const oldLevel=Math.max(1,Number(before?.level)||Number(s.level)||1);
  const newLevel=Math.max(1,Number(rewardOnly.level)||oldLevel);
  applyBundle(rewardOnly);
  try{await canonicalQuestState(true)}catch(_){}
  if(newLevel>oldLevel){
   try{
    if(typeof window.v420ShowLevelUp==='function')await Promise.resolve(window.v420ShowLevelUp(oldLevel,newLevel));
   }catch(e){console.warn('[V7045] level-up presentation',e)}
  }
  markQuestSideEffects(runId,q,b);
  persistLocal();paintAll();secondaryToasts(b);
  try{window.glCancelQuestPushJob?.()}catch(_){}
  try{
   if(typeof window.v7136ShowServerReward==='function')window.v7136ShowServerReward('quest',b,{quest:q});
   else if(typeof v235ShowQuestReward==='function')v235ShowQuestReward(before);
   else toast('📜 Quest abgeschlossen','success',`+${Number(b.xp_awarded)||0} EXP · +${Number(b.gold_awarded)||0} Gold`);
  }catch(e){console.warn('[V7045] reward popup',e)}
  const a=await ack(runId);
  if(!a?.ok)toast('Belohnung serverseitig gesichert','warn','Der Spielstand wird weiter abgeglichen; es wird nichts doppelt vergeben.');
  return b;
 }finally{C.busy=false;window.__V7214_QUEST_MUTATION_BUSY__=false}
}
function claimWrapper(base){
 if(typeof base!=='function')return null;
 const w=async function(){
  const rewardArtBefore=(()=>{try{return window.v4121QuestRewardSnapshot?.()||null}catch(_){return null}})();
  try{
   if(!enforced())return await base.apply(this,arguments);
   return await claimServerQuest();
  }finally{
   try{window.v4121AfterQuestClaim?.(rewardArtBefore)}catch(_){}
   try{window.v229QuestClaimSync?.()}catch(_){}
   try{window.v392PaintActive?.()}catch(_){}
   try{window.v4127EnsureQuestSkip?.()}catch(_){}
   try{if(!s?.quests?.active)void window.glCancelQuestPushJob?.()}catch(_){}
  }
 };
 w.__v7045Atomic=true;w.__v7045Base=base;return w;
}
const w233=claimWrapper(base233);if(w233){window.v233ClaimQuest=w233;try{v233ClaimQuest=w233}catch(_){} }
const wClaim=claimWrapper(baseClaim);if(wClaim){window.claimQuest=wClaim;try{claimQuest=wClaim}catch(_){} }

const baseSkip=window.v316SkipActiveQuest;
if(typeof baseSkip==='function'){
 const w=async function(){
  if(!enforced()){
   const r=await baseSkip.apply(this,arguments);
   try{void window.glCancelQuestPushJob?.()}catch(_){}
   return r;
  }
  if(C.busy)return false;C.busy=true;window.__V7214_QUEST_MUTATION_BUSY__=true;invalidateQuestState();
  try{
   let r;
   for(let attempt=0;attempt<2;attempt++){
    try{r=await rpcTimeout('v7044_skip_quest',{},7500);break}catch(e){C.lastError=String(e?.message||e);if(attempt===0)await sleep(500)}
   }
   if(!r?.ok){toast('Quest nicht übersprungen','warn',r?.reason==='NO_TIME_SEED'?'Du brauchst 1 Zeit-Samen.':String(r?.reason||C.lastError||'Serveraktion fehlgeschlagen.'));return false}
   if(r.active){ensureShape();s.quests.active=clone(r.active)}
   if(Number.isFinite(Number(r.time_seeds)))s.timeSeeds=Math.max(0,Number(r.time_seeds));
   persistLocal();paintAll();
   try{window.v4127EnsureQuestSkip?.()}catch(_){};try{window.glCancelQuestPushJob?.()}catch(_){}
   return r;
  }finally{C.busy=false;window.__V7214_QUEST_MUTATION_BUSY__=false}
 };
 w.__v7045Atomic=true;w.__v7045Base=baseSkip;window.v316SkipActiveQuest=w;try{v316SkipActiveQuest=w}catch(_){}
}

const baseRefill=(typeof v271RefillDampf==='function')?v271RefillDampf:window.v271RefillDampf;
if(typeof baseRefill==='function'){
 const w=async function(){
  if(!enforced())return baseRefill.apply(this,arguments);
  if(C.busy)return false;
  try{if(typeof v271DampfEventActive==='function'&&v271DampfEventActive()){try{v271PaintDampf?.()}catch(_){};return false}}catch(_){}
  const current=Math.max(0,Number(s.energy)||0),used=Math.max(0,Number(s.v271DampfRefill?.count)||0);
  if(used>=10)return v115Alert?.('Du hast heute bereits 10× Dampf aufgefüllt.');
  if(current>=100)return v115Alert?.('Dein Dampf ist bereits voll: 100/100.');
  if((Number(s.harzTaler)||0)<1)return v115Alert?.('Du hast keinen Harz-Taler mehr.');
  const add=Math.min(20,100-current);
  let ok=false;
  try{ok=typeof v115Confirm==='function'?await v115Confirm(`Du erhältst +${add} Dampf.\n\nAuffüllungen heute: ${used}/10`,{title:'Dampf auffüllen?',type:'confirm',okText:'1 Harz-Taler nutzen'}):confirm(`1 Harz-Taler einsetzen und +${add} Dampf erhalten?`)}catch(_){ok=false}
  if(!ok)return false;
  C.busy=true;
  const req=(globalThis.crypto?.randomUUID?.()||(`r${Date.now()}_${Math.random().toString(36).slice(2)}`)).replace(/[^a-zA-Z0-9_-]/g,'');
  try{
   let r=null;
   for(let attempt=0;attempt<2;attempt++){
    try{r=await rpcTimeout('v7044_refill_dampf',{p_request_id:req},8000);break}catch(e){C.lastError=String(e?.message||e);if(attempt===0)await sleep(550)}
   }
   if(!r?.ok){toast('Dampf nicht aufgefüllt','warn',String(r?.reason||C.lastError||'Serveraktion fehlgeschlagen.'));return false}
   s.energy=Math.max(0,Number(r.energy)||0);s.harzTaler=Math.max(0,Number(r.harz)||0);
   const day=s.v271DampfRefill?.day||s.v026DampfDay||'';s.v271DampfRefill={day,count:Math.max(0,Number(r.refills)||0)};
   persistLocal();paintAll();return r;
  }finally{C.busy=false}
 };
 w.__v7045Atomic=true;w.__v7045Base=baseRefill;try{v271RefillDampf=w}catch(_){};window.v271RefillDampf=w;try{v026Refill=w}catch(_){};window.v026Refill=w;
}

async function boot(){
 try{
  await refreshModes();
  if(!enforced())return;
  const recovered=await recoverPending({quiet:false});
  if(!recovered){try{await canonicalQuestState();persistLocal();paintAll()}catch(e){console.warn('[V7045] quest boot state',e)}}
 }catch(e){C.lastError=String(e?.message||e);console.warn('[V7045] boot',e)}
}
window.v7045QuestAuthorityDiagnostics=()=>clone({...C,version:VERSION,mode:mode()});
window.v7045RecoverQuestReceipt=()=>recoverPending({quiet:false});
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>void boot(),320));
window.addEventListener('pageshow',()=>setTimeout(()=>{try{if(document.getElementById('quests')?.classList.contains('active'))void canonicalQuestState().then(()=>{persistLocal();paintAll()})}catch(_){}},950),{passive:true});
setTimeout(()=>{try{if(typeof v073User!=='undefined'&&v073User?.id&&!v073User?.is_anonymous)void boot()}catch(_){}},3300);
})();

