/* ===== V7.042 unified authority bridge =====
   One client bridge for staged server authority. Domain switches live in the backend,
   so later pilot cutovers no longer require a new HTML build for every subsystem.
   Current safe default: build=enforce; progress/quest/dungeon/items/seeds=mirror.
*/
(()=>{
 'use strict';
 if(window.__V7040_UNIFIED_AUTHORITY__)return;
 window.__V7040_UNIFIED_AUTHORITY__=true;

 const S={version:'V7.042',enabled:false,ready:false,uid:'',domains:{},lastError:'',lastLoad:0,lastRow:null,syncs:0,questBusy:false,dungeonBusy:false};
 let loadPromise=null,cloudTimer=0,cloudBusy=false;
 const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
 const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
 const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
 const mode=d=>String(S.domains?.[d]||'off');
 const enforce=d=>mode(d)==='enforce';
 const row=data=>Array.isArray(data)?data[0]:data;
 const toast=(title,type='info',detail='')=>{try{return window.v063Toast?.(title,type,detail)}catch(_){try{return window.v115Alert?.(detail||title,title,type)}catch(__){}}};

 function ensureShape(){
  s.quests=(s?.quests&&typeof s.quests==='object')?s.quests:{offers:[],active:null,eliteOffer:null};
  s.dungeon=(s?.dungeon&&typeof s.dungeon==='object')?s.dungeon:{};
  s.inventory=Array.isArray(s?.inventory)?s.inventory:[];
  s.v488Forge=(s?.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
 }
 function itemId(it){return String(it?.id||it?.uid||'')}
 function addReturnedItem(it){
  if(!it||typeof it!=='object')return false;
  ensureShape();const id=itemId(it);
  if(id&&s.inventory.some(x=>itemId(x)===id))return false;
  if(id&&Object.values(s.equipment||{}).some(x=>itemId(x)===id))return false;
  s.inventory.push(clone(it));return true;
 }
 function applyQuest(q){
  if(!q||typeof q!=='object')return;
  ensureShape();
  s.energy=Math.max(0,Number(q.energy)||0);
  s.quests.offers=Array.isArray(q.offers)?clone(q.offers):[];
  s.quests.active=q.active?clone(q.active):null;
  s.quests.eliteOffer=q.eliteOffer?clone(q.eliteOffer):null;
  if(q.day){
   const day=String(q.day);s.v026DampfDay=day;
   s.v271DampfRefill={day,count:Math.max(0,Number(q.refills)||0)};
   const daily=q.daily||{};
   s.v109HarzDaily={day,firstQuest:!!daily.firstQuest,questEnergy:Math.max(0,Number(daily.questEnergy)||0),energyHarz:Math.max(0,Number(daily.energyHarz)||0)};
  }
 }
 function applyDungeon(d){
  if(!d||typeof d!=='object')return;
  ensureShape();
  if(d.progress&&typeof d.progress==='object')s.dungeon.progress=clone(d.progress);
  if(Array.isArray(d.completed))s.dungeon.completed=d.completed.map(Number);
  if(Array.isArray(d.unlocked))s.dungeon.unlocked=d.unlocked.map(Number);
  if(d.nextFreeAt)s.dungeonPass={...(s.dungeonPass||{}),lastFree:Date.parse(d.nextFreeAt)-3600000};
 }
 function applyProgress(p){
  if(!p||typeof p!=='object')return;
  if(Number.isFinite(Number(p.level)))s.level=Math.max(1,Number(p.level));
  if(Number.isFinite(Number(p.xp)))s.xp=Math.max(0,Number(p.xp));
  if(Number.isFinite(Number(p.gold)))s.gold=Math.max(0,Number(p.gold));
  if(Number.isFinite(Number(p.harzTaler)))s.harzTaler=Math.max(0,Number(p.harzTaler));
 }
 function applySeedInfo(x){if(x&&Number.isFinite(Number(x.timeSeeds)))s.timeSeeds=Math.max(0,Number(x.timeSeeds))}
 function applyState(x,{paint=true}={}){
  if(!x||x.enabled!==true)return;
  S.enabled=true;S.ready=true;S.domains=x.domains||{};S.lastLoad=Date.now();S.uid=uid();
  if(enforce('progress'))applyProgress(x.progress);
  if(enforce('quest'))applyQuest(x.quest);
  if(enforce('dungeon'))applyDungeon(x.dungeon);
  if(enforce('seeds'))applySeedInfo(x.seeds);
  if(enforce('items')&&x.items&&Number.isFinite(Number(x.items.fragments)))s.v488Forge.fragments=Math.max(0,Number(x.items.fragments));
  if(paint){
   try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
   try{render()}catch(_){}
   try{window.v069SyncCurrencies?.()}catch(_){}
  }
 }
 async function load(force=false){
  const id=uid();
  if(!id){S.ready=true;S.enabled=false;return null}
  if(loadPromise)return loadPromise;
  if(S.lastRow&&S.lastLoad&&Date.now()-S.lastLoad<12000)return S.lastRow;
  const x=db();if(!x){S.ready=true;S.enabled=false;return null}
  loadPromise=(async()=>{
   try{
    const {data,error}=await x.rpc('v7040_client_state');if(error)throw error;
    const r=row(data);S.lastError='';S.lastRow=r||null;
    if(!r?.enabled){S.enabled=false;S.ready=true;S.domains={};return r}
    applyState(r,{paint:false});return r;
   }catch(e){S.lastError=String(e?.message||e);S.ready=true;console.warn('[V7042] gate',e);return null}
   finally{loadPromise=null}
  })();
  return loadPromise;
 }
 async function refresh({paint=true}={}){const r=await load(true);if(r?.enabled)applyState(r,{paint});return r}

 function scheduleCloud(delay=1100){
  if(!S.enabled||cloudBusy)return;
  clearTimeout(cloudTimer);
  /* V7.093: server-authoritative gameplay must never contend with the 28-trigger
     legacy full-save mirror. Keep that mirror as an idle compatibility backup only. */
  const wait=Math.max(30000,Number(delay)||1100);
  cloudTimer=setTimeout(()=>{
   const run=async()=>{
    if(cloudBusy)return;cloudBusy=true;
    try{if(typeof v075WriteCloudSave==='function'){await v075WriteCloudSave(false);S.syncs++}}
    catch(e){console.warn('[V7042] idle mirror cloud sync',e)}finally{cloudBusy=false}
   };
   try{
    if(typeof requestIdleCallback==='function')requestIdleCallback(()=>void run(),{timeout:2500});
    else void run();
   }catch(_){void run()}
  },wait);
 }

 /* Pilot mirror: keep the backend transition ledger fresh without blocking gameplay. */
 try{
  if(typeof persist==='function'&&!persist.__v7040Mirror){
   const base=persist;
   const w=function(){const r=base.apply(this,arguments);if(S.enabled)scheduleCloud();return r};
   w.__v7040Mirror=true;persist=w;try{window.persist=w}catch(_){}
  }
 }catch(e){console.warn('[V7042] persist mirror',e)}

 async function ensureQuestGuard(){
  let st=await refresh({paint:false});
  if(!enforce('quest'))return st;
  if(st?.quest?.guard)return st;
  const x=db();if(!x)return st;
  const {data,error}=await x.rpc('v6359_enable_quest_guard');if(error)throw error;
  return await refresh({paint:false});
 }
 function questReason(r){
  const m={QUEST_ALREADY_ACTIVE:'Es läuft bereits eine Quest.',INVALID_QUEST:'Diese Quest ist nicht mehr verfügbar.',INSUFFICIENT_DAMPF:'Nicht genug Dampf.',QUEST_NOT_READY:'Die Quest ist noch nicht fertig.',NO_ACTIVE_QUEST:'Keine aktive Quest.'};
  return m[r?.reason]||String(r?.reason||'Serveraktion fehlgeschlagen.');
 }

 /* Quest start is server-side when the quest domain alone is switched to enforce.
    Progress can remain mirror during the controlled pilot; claim responses apply the
    server-awarded balances directly to the client before the normal cloud save. */
 try{
  const base=window.startQuest;
  if(typeof base==='function'&&!base.__v7040Authority){
   const w=async function(i){
    if(!S.ready)await load();
    if(!enforce('quest'))return base.apply(this,arguments);
    if(S.questBusy)return false;S.questBusy=true;
    try{
     await ensureQuestGuard();
     const x=db();if(!x)throw new Error('SERVER_OFFLINE');
     const {data,error}=await x.rpc('v6359_start_quest',{p_index:Number(i)});if(error)throw error;
     const r=row(data);if(!r?.ok){toast('Quest nicht gestartet','warn',questReason(r));return false}
     await refresh({paint:false});
     try{persist(false)}catch(_){};try{renderQuests()}catch(_){};try{window.v4127ScheduleQuestSkip?.()}catch(_){};
     try{if(s.quests?.active?.ends)window.glSyncQuestPushJob?.(Number(s.quests.active.ends))}catch(_){}
     return r;
    }catch(e){S.lastError=String(e?.message||e);console.error('[V7042] quest start',e);toast('Server-Quest fehlgeschlagen','error',S.lastError);return false}
    finally{S.questBusy=false}
   };
   w.__v7040Authority=true;w.__v7040Base=base;window.startQuest=w;try{startQuest=w}catch(_){}
  }
 }catch(e){console.warn('[V7042] quest start install',e)}

 async function serverQuestClaim(){
  if(S.questBusy)return false;
  const q=s?.quests?.active;if(!q||Date.now()<Number(q.ends||0))return false;
  S.questBusy=true;
  const before=(()=>{try{return typeof v235RewardSnapshot==='function'?v235RewardSnapshot(q):{q:clone(q),gold:Number(s.gold)||0,xp:Number(s.xp)||0,inventoryIds:(s.inventory||[]).map(itemId)}}catch(_){return{q:clone(q)}}})();
  try{
   const x=db();if(!x)throw new Error('SERVER_OFFLINE');
   const {data,error}=await x.rpc('v6359_claim_quest');if(error)throw error;
   const r=row(data);if(!r?.ok){toast('Quest nicht abgeschlossen','warn',questReason(r));return false}
   if(r.won===false){await refresh({paint:true});toast('Quest-Kampf verloren','warn','Du kannst den Kampf erneut versuchen.');return false}
   /* Preserve the existing quest-finale presentation, but only after the server
      has confirmed the win so the animation can never pay rewards itself. */
   try{if(typeof v311PlayFight==='function')await v311PlayFight(clone(q))}catch(e){console.warn('[V7042] quest fight presentation',e)}
   applyProgress({level:r.level,xp:r.level_xp,gold:r.gold_balance,harzTaler:r.harz_balance});
   addReturnedItem(r.item);
   if(r.seed_reward&&typeof r.seed_reward==='object'){
    if(Number.isFinite(Number(r.seed_reward.time_seeds)))s.timeSeeds=Math.max(0,Number(r.seed_reward.time_seeds));
    if(r.seed_reward.grow_seeds&&typeof r.seed_reward.grow_seeds==='object'){s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};s.grow.seeds=clone(r.seed_reward.grow_seeds)}
   }
   await refresh({paint:false});
   try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
   try{window.glCancelQuestPushJob?.()}catch(_){}
   try{window.v069SyncCurrencies?.()}catch(_){};try{renderInventory?.()}catch(_){};try{renderQuests?.()}catch(_){};
   try{if(typeof v235ShowQuestReward==='function')v235ShowQuestReward(before);else toast('📜 Quest abgeschlossen','success',`+${Number(r.xp_awarded)||0} EXP · +${Number(r.gold_awarded)||0} Gold`)}catch(e){console.warn('[V7042] reward popup',e)}
   scheduleCloud(250);return r;
  }catch(e){S.lastError=String(e?.message||e);console.error('[V7042] quest claim',e);toast('Quest-Serverfehler','error',S.lastError);return false}
  finally{S.questBusy=false}
 }
 try{
  const base=window.v233ClaimQuest||((typeof v233ClaimQuest==='function')?v233ClaimQuest:null);
  if(typeof base==='function'&&!base.__v7040Authority){
   const w=async function(){if(!S.ready)await load();if(!enforce('quest'))return base.apply(this,arguments);return serverQuestClaim()};
   w.__v7040Authority=true;w.__v7040Base=base;window.v233ClaimQuest=w;try{v233ClaimQuest=w}catch(_){}
  }
 }catch(e){console.warn('[V7042] quest claim install',e)}

 try{
  const base=window.v316SkipActiveQuest;
  if(typeof base==='function'&&!base.__v7040Authority){
   const w=async function(){
    if(!S.ready)await load();if(!enforce('quest'))return base.apply(this,arguments);
    if(S.questBusy)return false;S.questBusy=true;
    try{
     const x=db();if(!x)throw new Error('SERVER_OFFLINE');
     const {data,error}=await x.rpc('v6359_skip_quest');if(error)throw error;
     const r=row(data);if(!r?.ok){toast('Quest nicht übersprungen','warn',r?.reason==='NO_TIME_SEED'?'Du brauchst 1 Zeit-Samen.':questReason(r));return false}
     if(r.active){ensureShape();s.quests.active=clone(r.active)}
     if(Number.isFinite(Number(r.time_seeds)))s.timeSeeds=Math.max(0,Number(r.time_seeds));
     try{persist(false)}catch(_){};try{renderQuests()}catch(_){};try{window.v4127ScheduleQuestSkip?.()}catch(_){};try{window.glCancelQuestPushJob?.()}catch(_){};
     return r;
    }catch(e){console.error('[V7042] quest skip',e);toast('Quest-Skip fehlgeschlagen','error',String(e?.message||e));return false}
    finally{S.questBusy=false}
   };
   w.__v7040Authority=true;w.__v7040Base=base;window.v316SkipActiveQuest=w;try{v316SkipActiveQuest=w}catch(_){}
  }
 }catch(e){console.warn('[V7042] quest skip install',e)}

 function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
 async function animateDungeonReplay(r){
  const replay=Array.isArray(r?.replay)?r.replay:[];
  const p0=Math.max(1,Number(r?.player_hp_start)||1),e0=Math.max(1,Number(r?.enemy_hp_start)||1);
  const pBar=document.querySelector('#playerHpBar'),eBar=document.querySelector('#enemyHpBar'),pTxt=document.querySelector('#playerHpText'),eTxt=document.querySelector('#enemyHpText'),log=document.querySelector('#battleLog');
  if(pBar)pBar.style.width='100%';if(eBar)eBar.style.width='100%';if(pTxt)pTxt.textContent=p0;if(eTxt)eTxt.textContent=e0;
  for(const a of replay){
   const side=String(a?.side||'');
   if(side==='player'){
    try{animClass?.(document.querySelector('#playerFighter'),'attack-right')}catch(_){};await sleep(90);
    try{popDamage?.(document.querySelector('#damageEnemy'),`-${Math.max(0,Number(a.damage)||0)}`)}catch(_){};
   }else{
    if(a?.dodge){if(log)log.textContent='Ausgewichen!'}else{try{animClass?.(document.querySelector('#enemyFighter'),'attack-left')}catch(_){};await sleep(90);try{popDamage?.(document.querySelector('#damagePlayer'),`-${Math.max(0,Number(a.damage)||0)}`)}catch(_){};}
   }
   const ph=Math.max(0,Number(a?.player_hp ?? p0)),eh=Math.max(0,Number(a?.enemy_hp ?? e0));
   if(pBar)pBar.style.width=`${Math.max(0,Math.min(100,ph/p0*100))}%`;if(eBar)eBar.style.width=`${Math.max(0,Math.min(100,eh/e0*100))}%`;
   if(pTxt)pTxt.textContent=Math.round(ph);if(eTxt)eTxt.textContent=Math.round(eh);
   if(log)log.textContent=`Runde ${Number(a?.r)||''}: ${side==='player'?'Du':'Gegner'} ${Number(a?.damage)>0?'trifft für '+Number(a.damage):'verfehlt'}.`;
   await sleep(120);
  }
 }
 async function runServerDungeon(useHarz=false){
  if(S.dungeonBusy)return false;S.dungeonBusy=true;
  const btn=document.querySelector('#fightBtn,#dungeonFightBtn,[data-dungeon-fight]');if(btn)btn.disabled=true;
  try{
   const di=Math.max(0,Math.min(19,Number(s?.dungeon?.selected)||0));
   const x=db();if(!x)throw new Error('SERVER_OFFLINE');
   let {data,error}=await x.rpc('v6358_run_dungeon',{p_dungeon_index:di,p_use_harz:!!useHarz});if(error)throw error;
   let r=row(data);
   if(r?.reason==='HARZ_CONFIRM_REQUIRED'){
    let ok=false;try{ok=await v115Confirm(`Kein Gratisversuch bereit. Für ${Number(r.harz_cost)||1} Harz-Taler kämpfen?`,{title:'Dungeon-Versuch',type:'confirm',okText:'Kämpfen'})}catch(_){ok=confirm('Für 1 Harz-Taler kämpfen?')}
    if(!ok)return false;
    ({data,error}=await x.rpc('v6358_run_dungeon',{p_dungeon_index:di,p_use_harz:true}));if(error)throw error;r=row(data);
   }
   if(!r?.ok){toast('Dungeon nicht gestartet','warn',String(r?.reason||'Serveraktion fehlgeschlagen'));return false}
   await animateDungeonReplay(r);
   if(r.won){
    applyProgress({level:r.level,xp:r.level_xp,gold:r.gold_balance,harzTaler:r.harz_balance});addReturnedItem(r.item);
    ensureShape();if(r.progress)s.dungeon.progress=clone(r.progress);if(Array.isArray(r.completed))s.dungeon.completed=r.completed.map(Number);if(Array.isArray(r.unlocked))s.dungeon.unlocked=r.unlocked.map(Number);
    s.dungeon.room=r.boss?9:Math.min(9,(Number(r.room_index)||0)+1);s.dungeon.view='reward';
    await refresh({paint:false});try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){};
    const enemy=dungeons?.[di]?.enemies?.[Number(r.room_index)||0]||{};
    try{v247ShowDungeonReward?.({dungeonIndex:di,roomIndex:Number(r.room_index)||0,enemy,xp:Number(r.xp)||0,gold:Number(r.gold)||0,item:r.item||null,harz:Number(r.harz_reward)||0,boss:!!r.boss})}catch(e){console.warn('[V7042] dungeon reward',e)}
   }else{
    try{document.querySelector('#loot').innerHTML='<div class="loot" style="color:#ff9895">💀 Niederlage. Verbessere Attribute oder Ausrüstung.</div>'}catch(_){}
   }
   try{window.v069SyncCurrencies?.()}catch(_){};try{renderInventory?.()}catch(_){};scheduleCloud(250);return r;
  }catch(e){S.lastError=String(e?.message||e);console.error('[V7042] dungeon',e);toast('Dungeon-Serverfehler','error',S.lastError);return false}
  finally{S.dungeonBusy=false;if(btn)btn.disabled=false}
 }
 document.addEventListener('click',e=>{
  const b=e.target instanceof Element?e.target.closest('#fightBtn,#dungeonFightBtn,[data-dungeon-fight]'):null;if(!b)return;
  if(!S.ready||!enforce('dungeon')||!enforce('progress'))return;
  e.preventDefault();e.stopImmediatePropagation();void runServerDungeon(false);
 },true);

 /* One build now contains all staged paths. Backend flags can be changed without another APK/index build. */
 window.v7040AuthorityRefresh=(paint=true)=>refresh({paint:paint!==false});
 window.v7040AuthorityDiagnostics=()=>clone({...S,domains:S.domains});
 window.v7040RunServerDungeon=()=>runServerDungeon(false);

 async function boot(){await load();if(S.enabled){S.ready=true;scheduleCloud(450);if(enforce('quest')){try{await ensureQuestGuard();applyState(await load(true),{paint:true})}catch(e){console.warn('[V7042] quest guard boot',e)}}}}
 window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>void boot(),180));
 window.addEventListener('pageshow',()=>{if(!S.ready)setTimeout(()=>void boot(),700)},{passive:true});
 document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&Date.now()-Number(S.lastLoad||0)>120000)setTimeout(()=>void load(true),700);
 },{passive:true});
 setTimeout(()=>{if(!S.ready)void boot()},2600);
})();
