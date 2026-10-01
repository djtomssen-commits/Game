(()=>{
'use strict';
if(window.__V7051_ATOMIC_DUNGEON_CLIENT__)return;
window.__V7051_ATOMIC_DUNGEON_CLIENT__=true;

const VERSION='V7.051a';
const C={busy:false,recovering:false,skipReplay:false,lastError:'',lastRunId:null,lastAck:null,lastRecovery:null,buttonOwned:false,stateReady:false,lastCanonicalAt:0,entryGuards:0,blockedCompleted:0};
let stateFlight=null,bootFlight=null,lastState=null,lastStateAt=0,lastReportAt=0,scopeUid='';
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const accountUid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return''}};
function resetAccountScope(reason='account'){
 const u=accountUid();if(u===scopeUid)return false;scopeUid=u;
 stateFlight=null;bootFlight=null;lastState=null;lastStateAt=0;lastReportAt=0;
 C.busy=false;C.recovering=false;C.skipReplay=false;C.lastError='';C.lastRunId=null;C.lastAck=null;C.lastRecovery=null;C.stateReady=false;C.lastCanonicalAt=0;
 try{window.__V7202_LOGIN_DUNGEON_READY__=false;window.__V7203_LOGIN_DUNGEON_READY__=false}catch(_){}
 try{window.__GL_DUNGEON_SKIP_FIGHT__=null}catch(_){}
 try{document.getElementById('v247DungeonReward')?.classList.remove('show')}catch(_){}
 return true;
}
window.v7051ResetAccountScope=resetAccountScope;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const row=d=>Array.isArray(d)?d[0]:d;
const itemId=it=>String(it?.id||it?.uid||'');
const mode=()=>{try{return String(window.v7040AuthorityDiagnostics?.()?.domains?.dungeon||'off')}catch(_){return'off'}};
const enforced=()=>mode()==='enforce';
const toast=(title,type='info',detail='')=>{try{return window.v063Toast?.(title,type,detail)}catch(_){try{return window.v115Alert?.(detail||title,title,type)}catch(__){}}};

function ensureShape(){
 s.inventory=Array.isArray(s?.inventory)?s.inventory:[];
 s.equipment=(s?.equipment&&typeof s.equipment==='object')?s.equipment:{};
 s.dungeon=(s?.dungeon&&typeof s.dungeon==='object')?s.dungeon:{};
 s.dungeon.progress=(s.dungeon.progress&&typeof s.dungeon.progress==='object')?s.dungeon.progress:{};
 s.dungeon.completed=Array.isArray(s.dungeon.completed)?s.dungeon.completed:[];
 s.dungeon.unlocked=Array.isArray(s.dungeon.unlocked)?s.dungeon.unlocked:[];
 s.dungeon.keyQuestCounts=(s.dungeon.keyQuestCounts&&typeof s.dungeon.keyQuestCounts==='object')?s.dungeon.keyQuestCounts:{};
 s.dungeonPass=(s?.dungeonPass&&typeof s.dungeonPass==='object')?s.dungeonPass:{};
 s.v488Forge=(s?.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
 s.grow=(s?.grow&&typeof s.grow==='object')?s.grow:{};
 s.grow.seeds=(s.grow.seeds&&typeof s.grow.seeds==='object')?s.grow.seeds:{};
 s.grow.v492=(s.grow.v492&&typeof s.grow.v492==='object')?s.grow.v492:{};
 s.grow.v492.discovered=(s.grow.v492.discovered&&typeof s.grow.v492.discovered==='object')?s.grow.v492.discovered:{};
 s.grow.v492.stats=(s.grow.v492.stats&&typeof s.grow.v492.stats==='object')?s.grow.v492.stats:{};
 s.v686PetAlbum=(s?.v686PetAlbum&&typeof s.v686PetAlbum==='object')?s.v686PetAlbum:{};
 s.v686PetAlbum.found=(s.v686PetAlbum.found&&typeof s.v686PetAlbum.found==='object')?s.v686PetAlbum.found:{};
 s.v686PetAlbum.dropState=(s.v686PetAlbum.dropState&&typeof s.v686PetAlbum.dropState==='object')?s.v686PetAlbum.dropState:{};
 s.v106Achievements=(s?.v106Achievements&&typeof s.v106Achievements==='object')?s.v106Achievements:{done:{},stats:{}};
 s.v106Achievements.done=(s.v106Achievements.done&&typeof s.v106Achievements.done==='object')?s.v106Achievements.done:{};
 s.v106Achievements.stats=(s.v106Achievements.stats&&typeof s.v106Achievements.stats==='object')?s.v106Achievements.stats:{};
 s.story=(s?.story&&typeof s.story==='object')?s.story:{};
}
function rpcTimeout(name,args={},ms=11000){
 const x=db();if(!x)return Promise.reject(new Error('SERVER_OFFLINE'));
 return Promise.race([
  x.rpc(name,args).then(({data,error})=>{if(error)throw error;return row(data)}),
  new Promise((_,rej)=>setTimeout(()=>rej(new Error('RPC_TIMEOUT:'+name)),ms))
 ]);
}
async function refreshModes(){
 try{await window.v7040AuthorityRefresh?.()}catch(_){}
 claimButton();
 return mode();
}
function persistLocal(){
 /* V7.093: dungeon results are already durable on the authority server.
    Mirror locally without scheduling another full player_saves upload. */
 try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
 try{if(typeof v200SaveScopedLocal==='function')v200SaveScopedLocal()}catch(_){}
 try{
  if(typeof v213Comparable==='function'&&typeof v213Dirty!=='undefined'&&!v213Dirty){
   v213LastComparable=v213Comparable(s);
  }
 }catch(_){}
}
async function writeCloud(){
 if(typeof v075WriteCloudSave==='function'){
  return Promise.race([
   Promise.resolve(v075WriteCloudSave(false)),
   new Promise((_,rej)=>setTimeout(()=>rej(new Error('CLOUD_SAVE_TIMEOUT')),8000))
  ]);
 }
 try{v075ScheduleSave?.()}catch(_){}
 return true;
}
function paintAll(){
 try{window.v069SyncCurrencies?.()}catch(_){}
 try{window.v441PaintResources?.()}catch(_){}
 try{if(document.getElementById('dungeon')?.classList.contains('active'))renderDungeon?.()}catch(_){}
 try{if(document.getElementById('character')?.classList.contains('active'))renderInventory?.()}catch(_){}
 setTimeout(claimButton,0);
}
function currentDungeonIndex(){
 try{return Math.max(0,Math.min(19,Number(typeof v048DungeonIndex==='function'?v048DungeonIndex():s?.dungeon?.selected)||0))}catch(_){return Math.max(0,Math.min(19,Number(s?.dungeon?.selected)||0))}
}
function currentEnemy(di,ri){
 try{return dungeons?.[di]?.enemies?.[ri]||null}catch(_){return null}
}
function makeRequestId(){
 try{return (crypto.randomUUID?.()||'').replace(/[^a-zA-Z0-9_-]/g,'')}catch(_){}
 return `d${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
}
function addItemExact(it){
 if(!it||typeof it!=='object')return false;
 ensureShape();const id=itemId(it);
 if(id&&s.inventory.some(x=>itemId(x)===id))return false;
 if(id&&Object.values(s.equipment||{}).some(x=>itemId(x)===id))return false;
 s.inventory.push(clone(it));return true;
}
function applyPetExact(p){
 if(!p||typeof p!=='object')return;
 ensureShape();
 if(p.drop&&p.pet_id&&p.quality){
  const already=!!s.v686PetAlbum?.found?.[p.pet_id]?.[p.quality];
  if(!already){try{window.v7079PresentServerPet?.(p.pet_id,p.quality,p.source||'dungeon')}catch(e){console.warn('[V7051] pet popup',e)}}
 }
 if(p.found&&typeof p.found==='object')s.v686PetAlbum.found=clone(p.found);
 if(Number.isFinite(Number(p.standardSinceLegendary)))s.v686PetAlbum.dropState.standardSinceLegendary=Math.max(0,Number(p.standardSinceLegendary));
 try{window.v686InvalidatePetCache?.()}catch(_){}
 try{window.v686RefreshPetAlbum?.(true)}catch(_){}
 try{window.v6104UpdatePetIndicators?.()}catch(_){}
}
function applyBundle(b){
 if(!b||typeof b!=='object')return;
 ensureShape();
 if(Number.isFinite(Number(b.level)))s.level=Math.max(1,Number(b.level));
 if(Number.isFinite(Number(b.level_xp)))s.xp=Math.max(0,Number(b.level_xp));
 if(Number.isFinite(Number(b.gold_balance)))s.gold=Math.max(0,Number(b.gold_balance));
 if(Number.isFinite(Number(b.harz_balance)))s.harzTaler=Math.max(0,Number(b.harz_balance));
 if(Number.isFinite(Number(b.fragments_balance)))s.v488Forge.fragments=Math.max(0,Number(b.fragments_balance));
 if(Number.isFinite(Number(b.last_free_ms)))s.dungeonPass.lastFree=Math.max(0,Number(b.last_free_ms));
 if(b.progress&&typeof b.progress==='object')s.dungeon.progress=clone(b.progress);
 if(Array.isArray(b.completed))s.dungeon.completed=b.completed.map(Number);
 if(Array.isArray(b.unlocked))s.dungeon.unlocked=b.unlocked.map(Number);
 const di=Math.max(0,Number(b.dungeon_index)||0),ri=Math.max(0,Number(b.room_index)||0);
 s.dungeon.selected=di;s.dungeon.lastActive=di;s.dungeon.lastActiveAt=Date.now();
 s.dungeon.room=!!b.boss?9:Math.min(9,Number(s.dungeon.progress?.[di]??(ri+1))||0);
 window.__GL_LIVE_DUNGEON_INDEX__=di;window.__GL_LIVE_DUNGEON_ROOM_INDEX__=s.dungeon.room;
 addItemExact(b.item);
 const sr=b.seed_reward;
 if(sr&&typeof sr==='object'){
  if(sr.grow_seeds&&typeof sr.grow_seeds==='object')s.grow.seeds=clone(sr.grow_seeds);
  if(Number.isFinite(Number(sr.time_seeds)))s.timeSeeds=Math.max(0,Number(sr.time_seeds));
  if(Number(sr.grow_amount)>0&&sr.grow_seed)s.grow.v492.discovered[String(sr.grow_seed)]=true;
 }
 applyPetExact(b.pet);
}
function canonicalWins(){
 try{if(typeof v336CanonicalDungeonWins==='function')return Math.max(0,Number(v336CanonicalDungeonWins())||0)}catch(_){}
 ensureShape();const done=new Set(s.dungeon.completed.map(Number));let n=0;for(let i=0;i<20;i++)n+=done.has(i)?10:Math.max(0,Math.min(9,Number(s.dungeon.progress?.[i])||0));return n;
}
function markSideEffects(b){
 if(!b?.won||!b?.run_id)return;
 ensureShape();
 s.v7051DungeonSideEffectsSeen=(s.v7051DungeonSideEffectsSeen&&typeof s.v7051DungeonSideEffectsSeen==='object')?s.v7051DungeonSideEffectsSeen:{};
 const key=String(b.run_id);if(s.v7051DungeonSideEffectsSeen[key])return;
 s.v7051DungeonSideEffectsSeen[key]=Date.now();
 const keys=Object.keys(s.v7051DungeonSideEffectsSeen);if(keys.length>100)keys.sort((a,c)=>Number(s.v7051DungeonSideEffectsSeen[a])-Number(s.v7051DungeonSideEffectsSeen[c])).slice(0,keys.length-100).forEach(k=>delete s.v7051DungeonSideEffectsSeen[k]);
 try{if(typeof v336RepairDungeonWins==='function')v336RepairDungeonWins();else s.v106Achievements.stats.dungeonWins=Math.max(Number(s.v106Achievements.stats.dungeonWins)||0,canonicalWins())}catch(_){}
 try{v106CheckAchievements?.(true)}catch(_){}
 const di=Number(b.dungeon_index)||0,ri=Number(b.room_index)||0,wins=canonicalWins();
 try{void window.v473AwardDungeonGuildXp?.({dungeonIndex:di,roomIndex:ri,boss:!!b.boss,xp:Number(b.xp_awarded)||0,gold:Number(b.gold_awarded)||0,__v7051Server:true})}catch(_){}
 try{window.v6239WeeklyChestActivity?.('dungeon',{dungeonIndex:di,roomIndex:ri,boss:!!b.boss,winsAfter:wins,source:'v7051Server'},`server:${key}`)}catch(_){}
 if(Number(b?.seed_reward?.grow_amount)>0&&b?.seed_reward?.grow_seed){s.grow.v492.stats.seedsFound=Math.max(0,Number(s.grow.v492.stats.seedsFound)||0)+Number(b.seed_reward.grow_amount)}
 if(b.boss){s.story.bossesDefeated=Math.max(0,Number(s.story.bossesDefeated)||0)+1;s.story.chapter=Math.min(4,1+Math.floor(s.story.bossesDefeated/2))}
}
function seedCanonicalState(q){
 if(!q?.ok)return false;
 ensureShape();
 if(q.progress&&typeof q.progress==='object')s.dungeon.progress=clone(q.progress);
 if(Array.isArray(q.completed))s.dungeon.completed=q.completed.map(Number);
 if(Array.isArray(q.unlocked))s.dungeon.unlocked=q.unlocked.map(Number);
 if(q.keyQuestCounts&&typeof q.keyQuestCounts==='object')s.dungeon.keyQuestCounts=clone(q.keyQuestCounts);
 if(Number.isFinite(Number(q.lastFreeMs)))s.dungeonPass.lastFree=Math.max(0,Number(q.lastFreeMs));
 lastState=clone(q);lastStateAt=Date.now();C.stateReady=true;C.lastCanonicalAt=lastStateAt;
 window.__V7202_LOGIN_DUNGEON_READY__=true;
 window.__V7203_LOGIN_DUNGEON_READY__=true;
 try{window.v7144PaintDungeonTimer?.(true)}catch(_){}
 try{
  if(document.getElementById('dungeon')?.classList.contains('active')&&s?.dungeon?.layer!=='dungeon'){
   requestAnimationFrame(()=>{try{window.gl20RenderWorld?.()}catch(_){}});
  }
 }catch(_){}
 return true;
}
window.v7051SeedCanonicalState=seedCanonicalState;
async function canonicalState({force=false}={}){
 resetAccountScope('canonical-state');
 const now=Date.now();
 if(!force&&lastState&&now-lastStateAt<1800)return clone(lastState);
 if(stateFlight)return stateFlight;
 stateFlight=(async()=>{
  const q=await rpcTimeout('v7051_get_dungeon_state',{},8000);
  if(!q?.ok)return q;
  seedCanonicalState(q);
  return q;
 })().finally(()=>{stateFlight=null});
 return stateFlight;
}
/* V7.207: authoritative entry guard belongs to the dungeon owner. */
async function ensureCanonicalEntry(di,{force=true,paint=true,reason='entry'}={}){
 C.entryGuards++;
 if(!enforced())return{ok:true,enforced:false,completed:false};
 try{
  const q=await canonicalState({force:!!force});
  if(!q?.ok){C.lastError=String(q?.reason||'DUNGEON_STATE_UNAVAILABLE');return{ok:false,enforced:true,completed:false,reason:C.lastError}}
  persistLocal();ensureShape();
  const i=Math.max(0,Math.min(19,Number(di)||0));
  const completed=s.dungeon.completed.map(Number).includes(i)&&Number(s.dungeon.progress?.[i])>=9;
  if(paint&&document.getElementById('dungeon')?.classList.contains('active')){
   const layer=String(s?.dungeon?.layer||'world'),view=String(s?.dungeon?.view||'map');
   try{
    if(layer==='world'){
      try{window.v467RebuildDungeonWorld?.('v7051-'+reason)}catch(_){}
      if(typeof window.v467RebuildDungeonWorld!=='function')renderDungeon?.();
    }else if(layer==='dungeon'&&view==='map'){
      /* V7.214: preserve the active 10er map during canonical refresh. */
      if(typeof window.v251RenderDetail==='function')window.v251RenderDetail(i);
      else if(typeof window.v244RenderSelectedDungeonMap==='function')window.v244RenderSelectedDungeonMap();
      else renderDungeon?.();
    }else if(layer==='dungeon'&&view==='battle'){
      try{claimButton()}catch(_){}
    }
   }catch(e){console.warn('[V7051] canonical dungeon repaint',reason,e)}
  }
  if(completed)C.blockedCompleted++;
  return{ok:true,enforced:true,completed,state:q};
 }catch(e){C.lastError=String(e?.message||e);console.warn('[V7051] canonical entry guard',reason,e);return{ok:false,enforced:true,completed:false,reason:C.lastError}}
}
window.v7051EnsureDungeonState=(di,opts={})=>ensureCanonicalEntry(di,opts);

async function ack(runId){
 let last=null;
 for(let i=0;i<4;i++){
  /* V7.093: receipt reconciliation is server-side now. Do not upload the
     entire legacy save before every ack. */
  try{last=await rpcTimeout('v7051_ack_dungeon_receipt',{p_run_id:Number(runId)},8000)}
  catch(e){C.lastError=String(e?.message||e);last=null}
  if(last?.ok){C.lastAck=clone(last);return last}
  await sleep(300+i*220);
 }
 C.lastAck=clone(last);return last;
}
async function pendingReceipt(){return rpcTimeout('v7051_pending_dungeon_receipt',{},8000)}
function petLabel(p){if(!p?.drop)return'';return `${String(p.pet_id||'Pet').replaceAll('_',' ')} · ${String(p.quality||'')}`}
function seedLabel(sr){if(!sr||Number(sr.grow_amount)<=0)return'';return `${String(sr.grow_seed||'Samen').replaceAll('_',' ')} +${Number(sr.grow_amount)||1}`}
function showReward(b,{recovered=false}={}){
 const di=Number(b?.dungeon_index)||0,ri=Number(b?.room_index)||0,enemy=currentEnemy(di,ri);
 const seed=seedLabel(b?.seed_reward),pet=petLabel(b?.pet);
 try{
  return window.v247ShowDungeonReward?.({
   run_id:Number(b?.run_id)||0,
   dungeonIndex:di,
   roomIndex:ri,
   enemy,
   xp:Math.max(0,Number(b?.xp_awarded)||0),
   gold:Math.max(0,Number(b?.gold_awarded)||0),
   item:b?.item||null,
   harz:Math.max(0,Number(b?.harz_awarded)||0),
   fragments:Math.max(0,Number(b?.fragments_awarded)||0),
   seedLabel:seed,
   petLabel:pet,
   boss:!!b?.boss,
   title:recovered?'BELOHNUNG WIEDERHERGESTELLT':undefined,
   bossRewardText:'🟠 Boss-Belohnung · garantiert 1 legendäres Klassenitem'
  });
 }catch(e){
  console.warn('[V7051] canonical reward modal',e);
  const overlay=document.getElementById('v247DungeonReward');
  overlay?.classList.add('show');
  return false;
 }
}
function showDefeat(b){
 const di=Number(b?.dungeon_index)||0,ri=Number(b?.room_index)||0,enemy=currentEnemy(di,ri);
 const loot=document.getElementById('loot'),log=document.getElementById('battleLog');
 if(loot)loot.innerHTML='<div class="loot" style="color:#ff9895">💀 Niederlage. Verbessere Attribute oder Ausrüstung.</div><button class="btn secondary" id="v7051ReturnMap" style="width:100%;margin-top:10px">🗺️ Zurück zur Dungeon-Karte</button>';
 if(log)log.textContent=`Niederlage · Gegner empfohlen Lv. ${Number(b?.rec_level)||''}.`;
 try{window.v587ShowDungeonDefeat?.({dungeonIndex:di,roomIndex:ri,enemy,rec:Number(b?.rec_level)||0})}catch(_){}
 const back=document.getElementById('v7051ReturnMap');if(back)back.onclick=()=>{s.dungeon.layer='dungeon';s.dungeon.view='map';persistLocal();try{renderDungeon?.()}catch(_){}};
}
function replayButton(on){
 let btn=document.getElementById('v446SkipFight');const main=document.getElementById('v7051FightBtn');
 if(on&&main){if(!btn){btn=document.createElement('button');btn.type='button';btn.id='v446SkipFight';btn.className='btn secondary';main.insertAdjacentElement('afterend',btn)}btn.hidden=false;btn.disabled=false;btn.textContent='⏩ KAMPF ÜBERSPRINGEN'}
 else if(btn){btn.hidden=true;btn.disabled=true;btn.textContent='⏩ KAMPF ÜBERSPRINGEN'}
}
function v7269DungeonCadence(eventCount){
 const count=Math.max(1,Number(eventCount)||1);
 /* V8.009: give each hit enough screen time to read. This changes presentation
    only; server combat, damage and rewards are untouched. */
 const frameDelay=Math.max(300,Math.min(430,Math.floor(4200/count)));
 const attackDelay=Math.max(135,Math.round(frameDelay*.46));
 return {
  frameDelay,
  attackDelay,
  settleDelay:Math.max(145,frameDelay-attackDelay),
  visualAttackMs:520,
  visualHitMs:500,
  visualPopMs:780,
  startDelayMs:120
 };
}
window.v7269DungeonCadence=v7269DungeonCadence;

async function animateReplay(b){
 const replay=Array.isArray(b?.replay)?b.replay:[];C.skipReplay=false;
 /* V7.214: combat remains visibly animated, but replay duration is bounded.
    Twelve replay events used to sleep ~7.7 s before any UI work. */
 /* V7.273: Dungeon presentation now uses the same replay cadence as the tower.
    Combat rules/rewards are unchanged; only visual timing is slower. */
 const cadence=v7269DungeonCadence(replay.length);
 const {frameDelay,attackDelay,settleDelay}=cadence;
 const secondSummonDelay=Math.max(45,Math.round(attackDelay*.50));
 const v7103SummonTrack=window.v7103CompanionReplay?.begin?.('dungeon')||null;
 if(!replay.length){
  window.__GL_RUNTIME_WATCHDOG__?.report?.('dungeon_replay_missing','error',{
   runId:Number(b?.run_id)||0,won:!!b?.won,rounds:Number(b?.rounds)||0
  },{screen:'dungeon',incidentKey:`run:${Number(b?.run_id)||0}`});
  return false;
 }
 const p0=Math.max(1,Number(b?.player_hp_start)||1),e0=Math.max(1,Number(b?.enemy_hp_start)||1);
 try{window.v7175CombatReset?.('dungeon')}catch(_){}
 const pBar=document.getElementById('playerHpBar'),eBar=document.getElementById('enemyHpBar'),pTxt=document.getElementById('playerHpText'),eTxt=document.getElementById('enemyHpText'),log=document.getElementById('battleLog');
 if(pBar)pBar.style.width='100%';if(eBar)eBar.style.width='100%';if(pTxt)pTxt.textContent=p0;if(eTxt)eTxt.textContent=e0;
 await sleep(cadence.startDelayMs);
 replayButton(true);window.__GL_DUNGEON_SKIP_FIGHT__=()=>{C.skipReplay=true};
 try{
  for(const a of replay){
   if(C.skipReplay)break;
   const side=String(a?.side||''),dmg=Math.max(0,Number(a?.damage)||0),heal=Math.max(0,Number(a?.heal)||0),r=Number(a?.round??a?.r)||'';
   const tags=Array.isArray(a?.tags)?a.tags.filter(Boolean).map(String):[];
   const comp=String(a?.companion||'').toLowerCase();
   const comp2=String(a?.second_companion||'').toLowerCase();
   const structured=[
    ...tags,
    comp?`${comp.toUpperCase()}${a?.forced_summon?' · GARANTIERTER RUF':''}`:'',
    comp2?`${comp2.toUpperCase()} · ZWEITER RUF`:''
   ].filter(Boolean);
   const raw=String(a?.label||structured.join(' + ')||(a?.crit?'KRIT':'TREFFER'));
   if(side==='player')try{window.v7103CompanionReplay?.step?.(v7103SummonTrack,a)}catch(_){}
   try{(window.v7175CombatReplayStep||window.v7169CombatReplayStep)?.('dungeon',{...a,label:raw,round:r,damage:dmg,heal})}catch(_){}
   if(side==='player'){
    try{animClass?.(document.getElementById('playerFighter'),'attack-right')}catch(_){};await sleep(attackDelay);
    try{popDamage?.(document.getElementById('damageEnemy'),`-${dmg}${a?.crit?'!':''}`)}catch(_){};
    try{
      if(comp)window.v6287ShowSummon?.(comp,Math.max(0,Number(a?.companion_damage)||0),false,{
        heal:comp==='bud'?heal:0,crit:!!a?.companion_crit,note:a?.forced_summon?'GARANTIERTER RUF':''
      });
      if(comp2)setTimeout(()=>window.v6287ShowSummon?.(comp2,Math.max(0,Number(a?.second_damage)||0),true,{note:'2. RUF'}),secondSummonDelay);
    }catch(_){}
    try{window.v6225ExtraHitVisual?.('dungeon',raw,{round:r,actor:'player'})}catch(_){}
    try{window.v6232CombatParityFx?.('dungeon',{phase:'player',raw,damage:dmg,heal,crit:!!a?.crit,wucht:!!a?.wucht,offhand:Number(a?.offhand)||0,round:r})}catch(_){}
   }else{
    try{animClass?.(document.getElementById('enemyFighter'),'attack-left')}catch(_){};await sleep(attackDelay);
    if(dmg)try{popDamage?.(document.getElementById('damagePlayer'),`-${dmg}`)}catch(_){};
    try{window.v6225ExtraHitVisual?.('dungeon',raw,{round:r,actor:'defender'})}catch(_){}
    try{window.v6232CombatParityFx?.('dungeon',{phase:'enemy',raw,damage:dmg,heal,counter:Number(a?.counter)||0,prevent:!!a?.prevent,round:r})}catch(_){}
   }
   const ph=Math.max(0,Number(a?.player_hp??p0)),eh=Math.max(0,Number(a?.enemy_hp??e0));
   if(pBar)pBar.style.width=`${Math.max(0,Math.min(100,ph/p0*100))}%`;if(eBar)eBar.style.width=`${Math.max(0,Math.min(100,eh/e0*100))}%`;
   if(pTxt)pTxt.textContent=Math.round(ph);if(eTxt)eTxt.textContent=Math.round(eh);
   if(log)log.textContent=`Runde ${r}: ${side==='player'?'Du':'Gegner'} · ${raw} · ${dmg>0?dmg+' Schaden':'kein Schaden'}${heal?` · +${heal} LP`:''}${Number(a?.counter)>0?` · Konter ${Number(a.counter)}`:''}`;
   await sleep(settleDelay);
  }
  const ph=Math.max(0,Number(b?.player_hp_end)||0),eh=Math.max(0,Number(b?.enemy_hp_end)||0);
  if(pBar)pBar.style.width=`${Math.max(0,Math.min(100,ph/p0*100))}%`;if(eBar)eBar.style.width=`${Math.max(0,Math.min(100,eh/e0*100))}%`;if(pTxt)pTxt.textContent=Math.round(ph);if(eTxt)eTxt.textContent=Math.round(eh);
  await sleep(120);
 }finally{
  try{window.v7103CompanionReplay?.finish?.(v7103SummonTrack)}catch(_){}
  replayButton(false);if(window.__GL_DUNGEON_SKIP_FIGHT__)window.__GL_DUNGEON_SKIP_FIGHT__=null;C.skipReplay=false
 }
 return true;
}
async function finalizeReceipt(b,{recovered=false,show=true}={}){
 const runId=Number(b?.run_id)||0;if(!runId)return false;C.lastRunId=runId;
 applyBundle(b);
 if(show){if(b.won)showReward(b,{recovered});else showDefeat(b)}
 /* V7.214: reward/result first. Achievement/guild/persistence painters are
    non-critical after the authoritative result is already committed. */
 requestAnimationFrame(()=>{
  const work=()=>{try{markSideEffects(b)}catch(_){}try{persistLocal()}catch(_){}try{paintAll()}catch(_){}};
  if(typeof requestIdleCallback==='function')requestIdleCallback(work,{timeout:450});else setTimeout(work,40);
 });
 /* V7.094: the server result is already committed. Receipt reconciliation is
    bookkeeping and must never hold the reward/result UI hostage. */
 void ack(runId).then(a=>{
  if(!a?.ok)toast('Dungeon-Ergebnis serverseitig gesichert','warn','Der Hintergrund-Abgleich läuft weiter.');
 }).catch(e=>{C.lastError=String(e?.message||e)});
 return true;
}
async function recoverPending({quiet=false}={}){
 if(C.recovering)return false;C.recovering=true;
 try{
  const p=await pendingReceipt();
  if(!p?.pending)return false;
  C.lastRecovery=clone(p);applyBundle(p);markSideEffects(p);persistLocal();paintAll();
  const a=await ack(Number(p.run_id));
  if(a?.ok&&!quiet){toast('Dungeon wiederhergestellt','success','Der letzte Server-Kampf wurde sicher abgeschlossen.');if(p.won)showReward(p,{recovered:true});else showDefeat(p)}
  return !!a?.ok;
 }catch(e){C.lastError=String(e?.message||e);console.warn('[V7051] recover',e);return false}
 finally{C.recovering=false}
}
async function callRun(di,useHarz,req){
 try{return await rpcTimeout('v7051_run_dungeon',{p_dungeon_index:di,p_use_harz:!!useHarz,p_request_id:req},12000)}catch(e){
  C.lastError=String(e?.message||e);
  for(let n=0;n<3;n++){
   await sleep(500+n*350);
   try{const p=await pendingReceipt();if(p?.pending)return p}catch(_){}
  }
  try{return await rpcTimeout('v7051_run_dungeon',{p_dungeon_index:di,p_use_harz:!!useHarz,p_request_id:req},12000)}catch(e2){C.lastError=String(e2?.message||e2);throw e2}
 }
}
async function runServerDungeon(){
 if(C.busy)return false;
 C.busy=true;
 claimButton();
 const di=currentDungeonIndex(),req=makeRequestId();
 const wd=window.__GL_RUNTIME_WATCHDOG__?.begin?.(
  'dungeon_fight',
  {screen:'dungeon',dungeon:di},
  {slowMs:2200,stallMs:6500}
 );
 const returnToMap=()=>{
  try{s.dungeon.view='map';s.dungeon.layer='dungeon';persistLocal();renderDungeon?.();window.v7144PaintDungeonTimer?.(true)}catch(_){}
 };
 try{
  /* V7.199: never open a battle from a transient/stale local dungeon snapshot.
     The authoritative dungeon state is checked before any battle UI is exposed. */
  const gate=await ensureCanonicalEntry(di,{force:Date.now()-Number(C.lastCanonicalAt||0)>1500,paint:false,reason:'fight'});
  if(!gate?.ok){wd?.end?.({ok:false,reason:'state_unavailable'});toast('Dungeonstatus wird geprüft','warn','Der Serverstatus konnte gerade nicht bestätigt werden. Bitte erneut versuchen.');return false}
  if(gate.completed){
   try{window.v467RebuildDungeonWorld?.('v7051-sealed-fight')}catch(_){}
   wd?.end?.({ok:false,reason:'already_completed'});
   toast('Dungeon abgeschlossen','info','Dieser Dungeon ist dauerhaft versiegelt.');
   return false;
  }
  /* V7.145: input feedback is immediate. The server still decides every combat
     result/reward; only the presentation opens before the network round-trip. */
  s.dungeon.view='battle';
  s.dungeon.layer='dungeon';
  s.dungeon.lastActive=di;
  s.dungeon.lastActiveAt=Date.now();
  persistLocal();
  try{renderDungeon?.()}catch(e){console.warn('[V7144] immediate dungeon render',e)}
  await sleep(16);
  claimButton();
  let firstBtn=document.getElementById('v7051FightBtn');
  if(firstBtn){firstBtn.disabled=true;firstBtn.textContent='⚔️ SERVER PRÜFT KAMPF …'}
  try{window.v7141CombatArenaRefresh?.()}catch(_){}

  wd?.phase?.('server');
  let b=await callRun(di,false,req);
  if(!b?.ok&&/PENDING|RECEIPT/i.test(String(b?.reason||''))){
   wd?.phase?.('recover_pending');
   await recoverPending({quiet:true});
   b=await callRun(di,false,req);
  }
  if(b?.reason==='HARZ_CONFIRM_REQUIRED'){
   let ok=false;
   try{ok=typeof v115Confirm==='function'?await v115Confirm(`Kein Gratisversuch bereit. Für ${Number(b.harz_cost)||1} Harz-Taler kämpfen?`,{title:'Dungeon-Versuch',type:'confirm',okText:'Kämpfen'}):confirm('Für 1 Harz-Taler kämpfen?')}catch(_){ok=false}
   if(!ok){returnToMap();wd?.end?.({ok:false,reason:'cancelled'});return false}
   firstBtn=document.getElementById('v7051FightBtn');if(firstBtn)firstBtn.textContent='⚔️ SERVER PRÜFT KAMPF …';
   b=await callRun(di,true,req);
  }
  if(!b?.ok){
   returnToMap();
   wd?.end?.({ok:false,reason:String(b?.reason||'server_rejected')});
   toast('Dungeon nicht gestartet','warn',String(b?.reason||'Serveraktion fehlgeschlagen.'));
   return false
  }

  /* The attempt timestamp is already authoritative and committed at this point.
     Mirror ONLY that timestamp immediately so the free-attempt timer starts now,
     while rewards/progress continue to wait for the normal receipt finalizer. */
  if(Number.isFinite(Number(b.last_free_ms))){
   ensureShape();s.dungeonPass.lastFree=Math.max(0,Number(b.last_free_ms));persistLocal();
   try{window.v7144PaintDungeonTimer?.(true)}catch(_){}
   try{window.v324Paint?.()}catch(_){}
  }
  lastState=null;lastStateAt=0;

  wd?.phase?.('replay');
  const battleBtn=document.getElementById('v7051FightBtn');
  if(battleBtn){battleBtn.disabled=true;battleBtn.textContent='⚔️ KAMPF LÄUFT …'}
  const hasStage=!!document.getElementById('battleStage');
  const replayCount=Array.isArray(b?.replay)?b.replay.length:0;
  if(!hasStage){
   window.__GL_RUNTIME_WATCHDOG__?.report?.('dungeon_battle_dom_missing','error',
    {runId:Number(b?.run_id)||0,replayCount},
    {screen:'dungeon',incidentKey:`run:${Number(b?.run_id)||0}`}
   );
  }
  wd?.phase?.('replay',{replayCount});
  await animateReplay(b);
  wd?.phase?.('receipt');
  const ok=await finalizeReceipt(b,{recovered:false,show:true});
  wd?.end?.({ok:!!ok,replayCount});
  return ok;
 }catch(e){
  returnToMap();
  wd?.fail?.(e);
  C.lastError=String(e?.message||e);
  console.error('[V7051] dungeon run',e);
  toast('Dungeon-Serverfehler','error','Der Serverstatus wird beim nächsten Öffnen erneut geprüft.');
  return false
 }finally{
  C.busy=false;
  claimButton();
  const b=document.getElementById('v7051FightBtn');
  if(b){b.disabled=false;b.textContent='⚔️ ANGREIFEN'}
 }
}
function claimButton(){
 try{
  const own=document.getElementById('v7051FightBtn');
  if(!enforced()){
   if(own){own.id='fightBtn';own.removeAttribute('data-v7051-server-fight');C.buttonOwned=false}
   return;
  }
  const btn=own||document.getElementById('fightBtn');if(!btn)return;
  btn.id='v7051FightBtn';btn.setAttribute('data-v7051-server-fight','1');C.buttonOwned=true;
  if(!C.busy){
   const di=currentDungeonIndex(),sealed=Array.isArray(s?.dungeon?.completed)&&s.dungeon.completed.map(Number).includes(di)&&Number(s?.dungeon?.progress?.[di])>=9;
   btn.disabled=!!sealed;
   if(sealed)btn.textContent='⛓️ ABGESCHLOSSEN';
   else if(!/ANGREIFEN|KAMPF|SIEG|ERNEUT/i.test(btn.textContent||''))btn.textContent='⚔️ ANGREIFEN';
  }
 }catch(e){console.warn('[V7051] button owner',e)}
}

/* Sprint 2: button identity is synchronized directly by the canonical D2
   renderer. Server receipt, authority and click interception remain unchanged. */
window.v7051ClaimButtonSync=claimButton;

/* V4.246's earlier window-capture listener only owns #fightBtn. In enforce mode
   V7.051 renames that button before interaction, so the legacy fight/loot path
   never starts and cannot mint duplicate rewards. */
window.addEventListener('click',ev=>{
 const btn=ev.target?.closest?.('[data-v7051-server-fight]');if(!btn||!enforced())return;
 if(!document.getElementById('dungeon')?.classList.contains('active'))return;
 ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();void runServerDungeon();
},true);

/* V8.009: generic dungeon click -> delayed claimButton retry retired.
   Navigation authority calls syncDungeonOnOpen(), while canonical dungeon renderers
   call v7051ClaimButtonSync directly when the fight button is rebuilt. */

async function syncDungeonOnOpen(reason='navigation'){
 try{
  if(!enforced())await refreshModes();
  if(!enforced())return false;
  const fresh=C.stateReady&&Date.now()-Number(C.lastCanonicalAt||0)<2500;
  const gate=await ensureCanonicalEntry(currentDungeonIndex(),{force:!fresh,paint:!fresh,reason});
  claimButton();
  return !!gate?.ok;
 }catch(e){C.lastError=String(e?.message||e);console.warn('[V7051] dungeon open sync',reason,e);return false}
}
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='dungeon')void syncDungeonOnOpen('navigation')},{passive:true});

async function reportReadiness(){
 if(Date.now()-lastReportAt<60000)return;
 lastReportAt=Date.now();
 try{
  const q=(lastState&&Date.now()-lastStateAt<5000)?clone(lastState):await canonicalState();
  const pending=q?.pendingReceiptRunId==null?null:Number(q.pendingReceiptRunId);
  await rpcTimeout('v7051_report_client_bridge',{
   p_client_version:VERSION,
   p_dungeon_mode:mode(),
   p_button_owned:!!C.buttonOwned,
   p_pending_run_id:Number.isFinite(pending)?pending:null,
   p_details:{bridgeLoaded:true,atomicOwner:true,legacyButtonSuppressed:enforced()?!!document.getElementById('v7051FightBtn'):false}
  },7000);
 }catch(e){console.warn('[V7051] readiness report',e)}
}
async function boot(){
 resetAccountScope('boot');
 if(bootFlight)return bootFlight;
 bootFlight=(async()=>{
  try{
   const fresh=C.stateReady&&Date.now()-Number(C.lastCanonicalAt||0)<5000;
   if(!fresh)await refreshModes();
   if(!enforced()){claimButton();void reportReadiness();return}
   const recovered=await recoverPending({quiet:false});
   if(!recovered&&!fresh){try{await canonicalState();persistLocal();paintAll()}catch(e){console.warn('[V7051] boot state',e)}}
   claimButton();void reportReadiness();
  }catch(e){C.lastError=String(e?.message||e);console.warn('[V7051] boot',e)}
 })().finally(()=>{bootFlight=null});
 return bootFlight;
}
window.v7051DungeonAuthorityDiagnostics=()=>clone({...C,version:VERSION,mode:mode()});
window.v7051RecoverDungeonReceipt=()=>recoverPending({quiet:false});
window.v7051RunServerDungeon=()=>runServerDungeon();
window.addEventListener('growlegends:account-ready',()=>{resetAccountScope('account-ready');void boot()},{passive:true});
window.addEventListener('pageshow',()=>{if(!C.buttonOwned||!C.stateReady)void boot();else claimButton()},{passive:true});
/* V8.009: retired 100/450/1400/3600 ms bootstrap retry cascade.
   One immediate boot plus account-ready/pageshow ownership is sufficient and avoids
   repainting/rebinding the Dungeon UI several times after startup. */
queueMicrotask(()=>{try{void boot()}catch(_){}});
})();
