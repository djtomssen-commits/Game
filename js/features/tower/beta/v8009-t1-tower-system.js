(()=>{
'use strict';
const TKEY='growLegendsTowerUiV1';
const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const fmt=n=>Math.round(Number(n)||0).toLocaleString('de-DE');
const pick=a=>a[Math.floor(Math.random()*a.length)];
const chance=p=>Math.random()<p;
const deep=x=>{try{return structuredClone(x)}catch(e){return JSON.parse(JSON.stringify(x))}};
let towerTab='run', battleToken=0, syncTimer=0, lastMirror='';

const SEASON_RULES=[
 {name:'Purple-Haze-Zyklus',icon:'🟣',desc:'Elite-Etagen geben +20 % Turmpunkte.',eliteScore:.20},
 {name:'Schädlingsbefall',icon:'🪲',desc:'Normale Gegner sind +10 % stärker, Belohnungen +12 %.',enemy:.10,reward:.12},
 {name:'Harzmond',icon:'🌕',desc:'Bossbelohnungen +25 % und Boss-Score +15 %.',bossReward:.25,bossScore:.15},
 {name:'Trockene Wochen',icon:'☀️',desc:'Heilung −20 %, Turmblätter +25 %.',heal:-.20,tokens:.25},
 {name:'Genetik-Rausch',icon:'🧬',desc:'Mutationen erscheinen häufiger. Score +8 %.',mutation:true,score:.08}
];
const WEDNESDAY_EVENTS=[
 {id:'mutation',name:'Mutationssturm',icon:'🧬',desc:'Jeder neue Run startet mit 1 positiver Mutation · zusätzliche Mutationschancen.',mutationChance:.18},
 {id:'elite',name:'Elite-Invasion',icon:'☠️',desc:'Elite-Türen erscheinen deutlich häufiger · Elite gibt +50 % Turmblätter.',eliteDoors:true,eliteTokens:.50},
 {id:'growth',name:'Überwucherung',icon:'🌿',desc:'Grow-/Laborräume häufiger · Heilung +20 % · Gegner +10 % Leben.',heal:.20,enemyHp:.10,growthRooms:true},
 {id:'risk',name:'Risikotag',icon:'🔥',desc:'Gegnerschaden +15 % · Score +25 % · Turmblätter +25 %.',enemyDamage:.15,score:.25,tokens:.25}
];
const WED_TASKS=[
 {id:'floor10',label:'Etage 10 schaffen',kind:'floor',target:10,leaves:3},
 {id:'elite3',label:'3 Elitegegner besiegen',kind:'elite',target:3,leaves:5},
 {id:'floor30',label:'Etage 30 schaffen',kind:'floor',target:30,leaves:8,recovery:20}
];
function berlinTowerDay(){
 try{
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const m={};for(const p of parts)if(p.type!=='literal')m[p.type]=p.value;
  const y=Number(m.year),mo=Number(m.month),d=Number(m.day),ord=Math.floor(Date.UTC(y,mo-1,d)/86400000);
  return{key:`${m.year}-${m.month}-${m.day}`,y,mo,d,ord,dow:new Date(Date.UTC(y,mo-1,d)).getUTCDay()}
 }catch(e){
  const x=new Date(),y=x.getFullYear(),mo=x.getMonth()+1,d=x.getDate(),ord=Math.floor(Date.UTC(y,mo-1,d)/86400000);
  return{key:`${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`,y,mo,d,ord,dow:new Date(Date.UTC(y,mo-1,d)).getUTCDay()}
 }
}
function towerWednesdayEvent(){
 const day=berlinTowerDay(),active=day.dow===3,idx=((Math.floor(day.ord/7)%WEDNESDAY_EVENTS.length)+WEDNESDAY_EVENTS.length)%WEDNESDAY_EVENTS.length;
 const rule=WEDNESDAY_EVENTS[idx];
 return{...rule,active,key:day.key,index:idx,timezone:'Europe/Berlin'}
}
function towerEventFromOrd(ord){
 ord=Math.floor(Number(ord)||0);
 const d=new Date(ord*86400000),y=d.getUTCFullYear(),mo=d.getUTCMonth()+1,da=d.getUTCDate();
 const idx=((Math.floor(ord/7)%WEDNESDAY_EVENTS.length)+WEDNESDAY_EVENTS.length)%WEDNESDAY_EVENTS.length;
 return{...WEDNESDAY_EVENTS[idx],active:false,key:`${y}-${String(mo).padStart(2,'0')}-${String(da).padStart(2,'0')}`,index:idx,timezone:'Europe/Berlin',ord}
}
function lastCompletedWednesdayEvent(){
 const day=berlinTowerDay();
 let back=(day.dow-3+7)%7;
 if(back===0)back=7;
 return towerEventFromOrd(day.ord-back)
}
function wednesdayHistory(){
 const t=ensure();
 t.wednesdayHistory=(t.wednesdayHistory&&typeof t.wednesdayHistory==='object')?t.wednesdayHistory:{};
 return t.wednesdayHistory
}
function archiveWednesdayState(w){
 if(!w||!w.key)return;
 const h=wednesdayHistory();
 h[w.key]=JSON.parse(JSON.stringify(w));
 const keys=Object.keys(h).sort().slice(-8);
 Object.keys(h).forEach(k=>{if(!keys.includes(k))delete h[k]});
}
function localWednesdayStateFor(key){
 const t=ensure(),w=t.wednesday||{};
 if(w.key===key)return w;
 return wednesdayHistory()[key]||null
}
const WED_PLACE_REWARDS=[
 {max:1,label:'1. Platz',xp:6000,gold:3500,harz:8,time:6,fragments:80,seeds:5},
 {max:2,label:'2. Platz',xp:5000,gold:2800,harz:7,time:5,fragments:65,seeds:4},
 {max:3,label:'3. Platz',xp:4000,gold:2200,harz:6,time:4,fragments:50,seeds:4},
 {max:10,label:'Platz 4–10',xp:2800,gold:1500,harz:4,time:3,fragments:35,seeds:3},
 {max:25,label:'Platz 11–25',xp:1800,gold:900,harz:3,time:2,fragments:25,seeds:2},
 {max:50,label:'Platz 26–50',xp:1000,gold:500,harz:2,time:1,fragments:15,seeds:1}
];
function wednesdayPlacementReward(rank){
 rank=Math.max(0,Math.floor(Number(rank)||0));
 return WED_PLACE_REWARDS.find(x=>rank>0&&rank<=x.max)||null
}
function wednesdayPlacementRewardText(r){
 if(!r)return'Keine Platzierungsbelohnung';
 return `⭐ ${fmt(r.xp)} EXP · 🪙 ${fmt(r.gold)} Gold · 🟢 ${r.harz} Harz-Taler · 🌱 ${r.time} Zeit-Samen · 💠 ${r.fragments} Fragmente · 🌰 ${r.seeds} Samen`
}
function wednesdayRewardTable(){
 return `<details class="v6276-wed-prizes"><summary>🎁 Platzierungsbelohnungen</summary><div class="v6276-wed-prize-grid">${WED_PLACE_REWARDS.map(r=>`<div><b>${esc(r.label)}</b><span>${esc(wednesdayPlacementRewardText(r))}</span></div>`).join('')}</div><small>Keine Items. Die Belohnung wird nach Ende des Mittwochs anhand der finalen Platzierung freigeschaltet.</small></details>`
}
function profileWednesdayState(p,key){
 const t=p?.dungeon_progress?.tower||{},w=t.wednesday||{};
 if(w?.key===key)return w;
 return t.wednesday_history?.[key]||{}
}

/* V6.314: leaderboard source must not silently stop after the first 150/180 profiles.
   Load profiles page-by-page so season and Wednesday rankings are complete. */
let v6314TowerProfilesCache={at:0,rows:null};
async function v6314FetchAllTowerProfiles(force=false){
 if(!force&&Array.isArray(v6314TowerProfilesCache.rows)&&Date.now()-v6314TowerProfilesCache.at<15000){
  return v6314TowerProfilesCache.rows;
 }
 if(typeof v073Init==='function')await v073Init();
 if(typeof v073Db==='undefined'||!v073Db)throw new Error('offline');
 const PAGE=500,rows=[];
 for(let from=0;;from+=PAGE){
  const {data,error}=await v073Db.from('profiles')
   .select('id,character_name,class_id,class_name,level,combat_power,dungeon_progress')
   .range(from,from+PAGE-1);
  if(error)throw error;
  const batch=Array.isArray(data)?data:[];
  rows.push(...batch);
  if(batch.length<PAGE)break;
 }
 v6314TowerProfilesCache={at:Date.now(),rows};
 return rows;
}
window.v6314FetchAllTowerProfiles=v6314FetchAllTowerProfiles;

/* V7.054: Wednesday rankings use a dedicated server ledger. Profile JSON is
   deliberately not the source of truth here because guarded tower profiles
   are rewritten from player_tower_state and could otherwise hide local event
   progress from every other player. */
let v7054WednesdaySubmitTimer=0;
let v7054WednesdaySubmitSignature='';
let v7054WednesdaySubmitAt=0;
async function v7054SubmitWednesdayResult(force=false){
 const ev=towerWednesdayEvent();
 if(!ev.active)return false;
 const w=wednesdayState();
 const bestFloor=Math.max(0,Math.floor(Number(w.bestFloor??w.best_floor)||0));
 const bestScore=Math.max(0,Math.round(Number(w.bestScore??w.best_score)||0));
 const eliteKills=Math.max(0,Math.floor(Number(w.eliteKills??w.elite_kills)||0));
 if(bestFloor<=0&&bestScore<=0)return true;
 const signature=`${ev.key}|${ev.id}|${bestFloor}|${bestScore}|${eliteKills}`;
 if(!force&&signature===v7054WednesdaySubmitSignature&&Date.now()-v7054WednesdaySubmitAt<20000)return true;
 try{
  if(typeof v073Init==='function')await v073Init();
  const uid=(()=>{try{return !v073User?.is_anonymous&&v073User?.id?String(v073User.id):''}catch(_){return''}})();
  if(!uid||typeof v073Db==='undefined'||!v073Db)return false;
  const {data,error}=await v073Db.rpc('v7054_submit_wednesday_result',{
   p_event_key:String(ev.key||''),
   p_event_id:String(ev.id||''),
   p_best_floor:bestFloor,
   p_best_score:bestScore,
   p_elite_kills:eliteKills
  });
  if(error)throw error;
  if(!data?.ok)throw new Error(String(data?.reason||'WEDNESDAY_SUBMIT_REJECTED'));
  v7054WednesdaySubmitSignature=signature;
  v7054WednesdaySubmitAt=Date.now();
  return true;
 }catch(e){
  console.warn('V7.054 Mittwochs-Wert konnte nicht gespeichert werden',e);
  return false;
 }
}
function v7054ScheduleWednesdaySubmit(force=false){
 clearTimeout(v7054WednesdaySubmitTimer);
 v7054WednesdaySubmitTimer=setTimeout(()=>void v7054SubmitWednesdayResult(force),force?80:650);
}
async function fetchWednesdayRows(target){
 await syncProfile(true);
 if(typeof v073Init==='function')await v073Init();
 if(typeof v073Db==='undefined'||!v073Db)throw new Error('offline');
 const live=towerWednesdayEvent();
 if(live.active&&String(live.key)===String(target?.key))await v7054SubmitWednesdayResult(true);
 const {data,error}=await v073Db.rpc('v7054_wednesday_leaderboard',{p_event_key:String(target?.key||'')});
 if(error)throw error;
 if(!data?.ok)throw new Error(String(data?.reason||'WEDNESDAY_LEADERBOARD_REJECTED'));
 return (Array.isArray(data.rows)?data.rows:[]).map(p=>({
  ...p,
  w:{
   key:String(p?.w?.key||target?.key||''),
   event_id:String(p?.w?.event_id||''),
   best_floor:Math.max(0,Number(p?.w?.best_floor)||0),
   best_score:Math.max(0,Number(p?.w?.best_score)||0),
   elite_kills:Math.max(0,Number(p?.w?.elite_kills)||0)
  }
 }))
}
function placementSeedPool(rank){
 return rank<=3?['critical','violet','blue','jack','lime']:rank<=10?['jack','violet','blue','lime']:['moss','lime','jack','violet']
}
function grantPlacementSeeds(count,rank,eventKey){
 s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};
 s.grow.seeds=(s.grow.seeds&&typeof s.grow.seeds==='object')?s.grow.seeds:{};
 const pool=placementSeedPool(rank),drops={};
 let h=0;for(const c of String(eventKey||''))h=(h*31+c.charCodeAt(0))|0;
 for(let i=0;i<count;i++){
  const id=pool[Math.abs(h+rank*17+i*13)%pool.length]||'moss';
  s.grow.seeds[id]=Math.max(0,Number(s.grow.seeds[id])||0)+1;
  drops[id]=(drops[id]||0)+1;
  try{
   s.grow.v492=(s.grow.v492&&typeof s.grow.v492==='object')?s.grow.v492:{};
   s.grow.v492.discovered=(s.grow.v492.discovered&&typeof s.grow.v492.discovered==='object')?s.grow.v492.discovered:{};
   s.grow.v492.discovered[id]=true;
  }catch(_){}
 }
 return drops
}
async function claimWednesdayPlacement(){
 const target=lastCompletedWednesdayEvent(),state=localWednesdayStateFor(target.key);
 if(!state)return toast('Für den letzten Mittwoch ist auf diesem Account kein Turm-Ergebnis gespeichert.','warn');
 if(state.placementClaimedAt)return toast('Diese Mittwochs-Belohnung wurde bereits abgeholt.','info');
 try{
  const rows=await fetchWednesdayRows(target),uid=(()=>{try{return String(v073User?.id||'')}catch(e){return''}})();
  const idx=rows.findIndex(p=>String(p.id)===uid),rank=idx>=0?idx+1:0,reward=wednesdayPlacementReward(rank);
  if(!reward)return toast(rank?`Platz ${rank} liegt außerhalb der Top 50.`:'Du bist in dieser Mittwochs-Rangliste nicht platziert.','warn');
  s.gold=Math.max(0,Number(s.gold)||0)+reward.gold;
  try{if(typeof addXp==='function')addXp(reward.xp);else s.xp=Math.max(0,Number(s.xp)||0)+reward.xp}catch(_){s.xp=Math.max(0,Number(s.xp)||0)+reward.xp}
  s.harzTaler=Math.max(0,Number(s.harzTaler)||0)+reward.harz;
  s.timeSeeds=Math.max(0,Number(s.timeSeeds)||0)+reward.time;
  s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
  s.v488Forge.fragments=Math.max(0,Number(s.v488Forge.fragments)||0)+reward.fragments;
  const seedDrops=grantPlacementSeeds(reward.seeds,rank,target.key);
  state.placementClaimedAt=Date.now();state.placementRank=rank;state.placementReward={...reward,seedDrops};
  save(false);try{v069SyncCurrencies?.()}catch(_){}try{v441PaintResources?.()}catch(_){}await syncProfile(true);render();
  toast(`Mittwochs-Rangliste · Platz ${rank}`,'success');
 }catch(e){
  console.warn('Mittwochs-Platzierungsbelohnung',e);
  toast('Die finale Mittwochs-Rangliste konnte gerade nicht geprüft werden.','warn')
 }
}
function paintWednesdayPlacementReward(rows,target,uid){
 const box=document.getElementById('vTWednesdayReward');if(!box)return;
 const idx=(rows||[]).findIndex(p=>String(p.id)===String(uid)),rank=idx>=0?idx+1:0,state=localWednesdayStateFor(target.key),reward=wednesdayPlacementReward(rank);
 if(state?.placementClaimedAt){
  const claimedRank=Number(state.placementRank)||rank;
  box.innerHTML=`<div class="v6276-wed-claim done"><small>LETZTER MITTWOCH · ${esc(target.key)}</small><b>✓ Platz ${claimedRank} abgeholt</b><span>${esc(wednesdayPlacementRewardText(state.placementReward||wednesdayPlacementReward(claimedRank)))}</span></div>`;
  return
 }
 if(!rank){
  box.innerHTML=`<div class="v6276-wed-claim"><small>LETZTER MITTWOCH · ${esc(target.key)}</small><b>Keine Platzierung gefunden</b><span>Eine Belohnung gibt es nur mit gespeichertem Event-Ranglistenwert.</span></div>`;return
 }
 if(!reward){
  box.innerHTML=`<div class="v6276-wed-claim"><small>LETZTER MITTWOCH · ${esc(target.key)}</small><b>Deine Platzierung: ${rank}</b><span>Platzierungsbelohnungen gehen bis Platz 50.</span></div>`;return
 }
 box.innerHTML=`<div class="v6276-wed-claim ready"><small>LETZTER MITTWOCH · ${esc(target.key)}</small><b>🏆 Platz ${rank} · Belohnung bereit</b><span>${esc(wednesdayPlacementRewardText(reward))}</span><button class="vT-btn gold" data-vt-wed-place-claim>Belohnung abholen</button></div>`;
 box.querySelector('[data-vt-wed-place-claim]')?.addEventListener('click',()=>void claimWednesdayPlacement())
}
async function loadWednesdayPlacementReward(){
 const box=document.getElementById('vTWednesdayReward');if(!box)return;
 const target=lastCompletedWednesdayEvent(),uid=(()=>{try{return String(v073User?.id||'')}catch(e){return''}})();
 box.innerHTML='<div class="vT-empty">Letzte Mittwochs-Platzierung wird geprüft …</div>';
 try{paintWednesdayPlacementReward(await fetchWednesdayRows(target),target,uid)}
 catch(e){box.innerHTML='<div class="vT-empty">Letzte Mittwochs-Platzierung momentan nicht erreichbar.</div>'}
}
function wednesdayState(){
 const ev=towerWednesdayEvent();
 s.tower=(s.tower&&typeof s.tower==='object')?s.tower:{};
 s.tower.wednesday=(s.tower.wednesday&&typeof s.tower.wednesday==='object')?s.tower.wednesday:{};
 const w=s.tower.wednesday;
 if(ev.active&&w.key!==ev.key){
  if(w?.key)archiveWednesdayState(w);
  s.tower.wednesday={key:ev.key,eventId:ev.id,bestFloor:0,bestScore:0,eliteKills:0,claimed:{},createdAt:Date.now()};
 }
 const z=s.tower.wednesday;
 z.claimed=(z.claimed&&typeof z.claimed==='object')?z.claimed:{};
 z.bestFloor=Math.max(0,Number(z.bestFloor)||0);
 z.bestScore=Math.max(0,Number(z.bestScore)||0);
 z.eliteKills=Math.max(0,Number(z.eliteKills)||0);
 return z
}
function wednesdayMutationRoll(){
 const ev=towerWednesdayEvent();
 return !!(ev.active&&Number(ev.mutationChance)>0&&chance(ev.mutationChance))
}
function updateWednesdayProgress(r,type=''){
 const ev=towerWednesdayEvent();if(!ev.active||!r)return false;
 const w=wednesdayState(),before=`${w.bestFloor}|${w.bestScore}|${w.eliteKills}`;
 w.bestFloor=Math.max(w.bestFloor,Number(r.cleared)||0);
 w.bestScore=Math.max(w.bestScore,Math.round(Number(r.score)||0));
 if(type==='elite')w.eliteKills++;
 const changed=before!==`${w.bestFloor}|${w.bestScore}|${w.eliteKills}`;
 if(changed)v7054ScheduleWednesdaySubmit(false);
 return changed
}
function wednesdayTaskValue(w,task){return task.kind==='elite'?Number(w.eliteKills)||0:Number(w.bestFloor)||0}
function grantWednesdayRecovery(t,pct){
 pct=Math.max(0,Number(pct)||0);if(!pct)return;
 const m=t.meta||(t.meta={});
 if(t.run?.active)m.pendingWednesdayRecovery=Math.min(100,(Number(m.pendingWednesdayRecovery)||0)+pct);
 else{const cur=normalizeTowerRecovery(t);m.recoveryPct=Math.min(100,cur+pct);m.recoveryAt=Date.now()}
}
function claimWednesdayTask(id){
 const ev=towerWednesdayEvent();if(!ev.active)return toast('Das Mittwochs-Event ist nicht aktiv.','warn');
 const t=ensure(),w=wednesdayState(),task=WED_TASKS.find(x=>x.id===id);if(!task||w.claimed[id])return;
 if(wednesdayTaskValue(w,task)<task.target)return toast('Aufgabe noch nicht abgeschlossen.','warn');
 w.claimed[id]={at:Date.now(),event:ev.id};
 t.meta.tokens=Math.max(0,Number(t.meta.tokens)||0)+task.leaves;
 if(task.recovery)grantWednesdayRecovery(t,task.recovery);
 save(false);syncProfile(true);render();
 toast(`Mittwochs-Aufgabe: +${task.leaves} Turmblätter${task.recovery?` · +${task.recovery} % Erholung`:''}`,'success')
}
function wednesdayPanel(){
 const ev=towerWednesdayEvent();if(!ev.active)return'';
 const w=wednesdayState();
 const tasks=WED_TASKS.map(task=>{
  const val=wednesdayTaskValue(w,task),done=val>=task.target,claimed=!!w.claimed?.[task.id];
  const reward=`+${task.leaves} 🍃${task.recovery?` · +${task.recovery} % Erholung`:''}`;
  return `<div class="vT-wed-task ${done?'done':''} ${claimed?'claimed':''}"><small>MITTWOCHS-AUFGABE</small><b>${esc(task.label)}</b><div class="vT-wed-progress">${Math.min(val,task.target)} / ${task.target} · ${reward}</div><button class="vT-btn ${done&&!claimed?'gold':''}" data-vt-wed-claim="${task.id}" ${done&&!claimed?'':'disabled'}>${claimed?'✓ Abgeholt':done?'Belohnung holen':'In Arbeit'}</button></div>`
 }).join('');
 return `<section class="vT-wed"><div class="vT-wed-head"><div class="vT-wed-icon">${ev.icon}</div><div><small>MITTWOCHS-TURM-ANOMALIE · 00:00–23:59 DEUTSCHE ZEIT</small><b>${esc(ev.name)}</b><p>${esc(ev.desc)}</p></div><span class="vT-wed-live">● EVENT AKTIV</span></div><div class="vT-wed-tasks">${tasks}</div><div class="vT-wed-foot"><span>Mittwochs-Bestwert: <b>Etage ${w.bestFloor} · ${fmt(w.bestScore)} Score</b></span><span>Elite-Siege heute: <b>${w.eliteKills}</b></span></div></section>`
}

const MUTATIONS=[
 {id:'gorilla',name:'Gorilla Glue',icon:'🦍',desc:'+12 % Schaden · Gegner verursachen +7 % Schaden.',fx:{damage:.12,incoming:.07},tone:'risky'},
 {id:'widow',name:'White-Widow-Panzer',icon:'🕷️',desc:'−9 % eingehender Schaden.',fx:{armor:.09},tone:'good'},
 {id:'northern',name:'Northern-Lights-Regeneration',icon:'🌌',desc:'Nach jedem Sieg +4 % maximales Leben.',fx:{afterHeal:.04},tone:'good'},
 {id:'purplecrit',name:'Purple-Haze-Fokus',icon:'🟣',desc:'+6 % Krit-Chance · +4 % Turm-Score.',fx:{crit:.06,score:.04},tone:'good'},
 {id:'amnesia',name:'Amnesia',icon:'🧠',desc:'+14 % Gold & EXP · Heilung −20 %.',fx:{reward:.14,healPenalty:.20},tone:'risky'},
 {id:'diesel',name:'Sour-Diesel-Antrieb',icon:'⛽',desc:'+8 % Schaden · +3 % Ausweichen.',fx:{damage:.08,evade:.03},tone:'good'},
 {id:'kush',name:'Kush-Wurzeln',icon:'🌱',desc:'+10 % maximales Turm-Leben.',fx:{maxHp:.10},tone:'good'},
 {id:'resin',name:'Harzhaut',icon:'🟢',desc:'−5 % Schaden · 4 % Lebensraub.',fx:{damage:-.05,lifesteal:.04},tone:'good'},
 {id:'trichome',name:'Trichom-Spiegel',icon:'✨',desc:'Krits verursachen +25 % zusätzlichen Schaden.',fx:{critDmg:.25},tone:'good'},
 {id:'roots',name:'Wurzelnetz',icon:'🪴',desc:'+6 % maximales Leben · Heilung +10 %.',fx:{maxHp:.06,healBoost:.10},tone:'good'},
 {id:'spore',name:'Sporensprung',icon:'🍄',desc:'+5 % Ausweichen · +4 % Gold & EXP.',fx:{evade:.05,reward:.04},tone:'good'},
 {id:'glass',name:'Glashaus-Klinge',icon:'🔪',desc:'+18 % Schaden · maximales Leben −10 %.',fx:{damage:.18,maxHp:-.10},tone:'risky'},
 {id:'cash',name:'Schwarzmarkt-Kontakt',icon:'💰',desc:'+10 % Gold · Händlerpreise −10 %.',fx:{gold:.10,shopDiscount:.10},tone:'good'},
 {id:'book',name:'Verbotene Genetik',icon:'📕',desc:'+6 % Turm-Score · Turmblätter +6 %.',fx:{score:.06,tokens:.06},tone:'good'},
 {id:'mist',name:'Nebeltritt',icon:'🌫️',desc:'+7 % Ausweichen · Schaden −4 %.',fx:{evade:.07,damage:-.04},tone:'good'},
 {id:'fury',name:'Blütenraserei',icon:'🔥',desc:'Unter 40 % Leben: +22 % Schaden.',fx:{lowHpDamage:.22},tone:'risky'},
 {id:'insurance',name:'Versiegelte Beute',icon:'🔐',desc:'Bei Niederlage gehen nur 15 % statt 25 % der ungesicherten Beute verloren.',fx:{lossReduce:.10},tone:'good'},
 {id:'crown',name:'Growmaster-Krone',icon:'👑',desc:'+5 % Schaden, +5 % Leben, +5 % Score.',fx:{damage:.05,maxHp:.05,score:.05},tone:'good'}
];
const ENEMIES=[
 ['Trauermücken-Schwarm','midge'],['Harzkriecher','slug'],['Sporenwächter','spore'],['Wurzelbeißer','root'],['Blattlaus-Räuber','beetle'],['Schimmelgolem','golem'],['Dornenspinne','spider'],['Nachtfalter','moth'],['Giftorchidee','flower'],['Hydro-Mutant','mutant'],['Klebegeist','ghost'],['Düngerbestie','beast'],['Milbenritter','knight'],['Rankenjäger','vine'],['Lampenfresser','moth'],['Glaswächter','golem'],['Säurespore','spore'],['Harzberserker','beast'],['Nebelkriecher','ghost'],['Wurzelkoloss','root']
];
const BOSSES=[
 {name:'Der Schädlingskönig',kind:'beetle',mechanic:'gift',desc:'Sein Gift wird jede Runde gefährlicher.'},
 {name:'Der Stromdieb',kind:'mutant',mechanic:'power',desc:'Die ersten Angriffe werden geschwächt.'},
 {name:'Der Genetiker',kind:'knight',mechanic:'copy',desc:'Je mehr Mutationen du trägst, desto stärker wird er.'},
 {name:'Die Schimmelbrut',kind:'spore',mechanic:'rage',desc:'Mit jeder Runde steigt ihr Schaden.'},
 {name:'Der Harztitan',kind:'golem',mechanic:'armor',desc:'Eine dicke Harzschicht reduziert Schaden.'},
 {name:'Die Nachtblüte',kind:'flower',mechanic:'dodge',desc:'Weicht einem Teil deiner Angriffe aus.'},
 {name:'Die Milbenkaiserin',kind:'spider',mechanic:'multi',desc:'Jeder dritte Angriff trifft doppelt.'},
 {name:'Der Wurzeltyrann',kind:'root',mechanic:'thorns',desc:'Ein Teil deines Schadens schlägt auf dich zurück.'},
 {name:'Der Nebelmeister',kind:'ghost',mechanic:'blind',desc:'Der Nebel senkt deine Krit-Chance.'},
 {name:'Der Turmgärtner',kind:'beast',mechanic:'final',desc:'Eine aggressive Mischung aller Turmregeln.'}
];
const UPGRADES={
 roots:{name:'Tiefenwurzeln',icon:'🌱',desc:'+4 % maximales Turm-Leben pro Rang.',max:5,costMult:1,effect:4,effectUnit:'% Leben'},
 heal:{name:'Saubere Nährlösung',icon:'💧',desc:'+6 % Heilwirkung pro Rang.',max:5,costMult:1,effect:6,effectUnit:'% Heilung'},
 harvest:{name:'Harz-Extraktor',icon:'🧪',desc:'+4 % Gold & XP im Turm pro Rang.',max:5,costMult:1.10,effect:4,effectUnit:'% Gold & XP'},
 leaves:{name:'Blattpresse',icon:'🍃',desc:'+5 % Turmblätter pro Rang.',max:5,costMult:1.25,effect:5,effectUnit:'% Turmblätter'},
 mutation:{name:'Genetik-Archiv',icon:'🧬',desc:'+1 Mutations-Neuwurf pro Lauf und Rang.',max:5,costMult:1.35,effect:1,effectUnit:' Neuwurf'}
};
const TOWER_UPGRADE_BASE_COSTS=[25,60,120,220,360];
function towerUpgradeCost(k,lv){
 const u=UPGRADES[k];
 if(!u||lv<0||lv>=u.max)return 0;
 return Math.max(1,Math.round(TOWER_UPGRADE_BASE_COSTS[lv]*(Number(u.costMult)||1)));
}
function seasonId(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function seasonRule(){const id=seasonId();let h=0;for(const c of id)h=(h*31+c.charCodeAt(0))|0;return SEASON_RULES[Math.abs(h)%SEASON_RULES.length]}
function buffFx(run,key){return (run?.buffs||[]).reduce((n,id)=>n+(MUTATIONS.find(x=>x.id===id)?.fx?.[key]||0),0)}
function primaryAttr(){try{return s.playerClass==='scout'?'geschick':(s.playerClass==='bruiser'||s.playerClass==='summoner')?'intelligenz':'staerke'}catch(e){return'staerke'}}
function playerName(){return String(s?.characterName||'Deine Legende')}
function baseMaxHp(){try{return Math.max(100,Number(maxHp())||100)}catch(e){return 100}}
function towerMaxHp(run){const meta=ensure().meta;const mult=1+(Number(meta.upgrades.roots)||0)*.04+buffFx(run,'maxHp');return Math.max(50,Math.round(baseMaxHp()*mult))}
function ensure(){
 s.tower=(s.tower&&typeof s.tower==='object')?s.tower:{};
 s.tower.meta=(s.tower.meta&&typeof s.tower.meta==='object')?s.tower.meta:{};
 s.tower.wednesdayHistory=(s.tower.wednesdayHistory&&typeof s.tower.wednesdayHistory==='object')?s.tower.wednesdayHistory:{};
 s.tower.seasonHistory=(s.tower.seasonHistory&&typeof s.tower.seasonHistory==='object')?s.tower.seasonHistory:{};
 s.tower.meta.tokens=Math.max(0,Number(s.tower.meta.tokens)||0);
 s.tower.meta.upgrades=(s.tower.meta.upgrades&&typeof s.tower.meta.upgrades==='object')?s.tower.meta.upgrades:{};
 Object.keys(UPGRADES).forEach(k=>s.tower.meta.upgrades[k]=clamp(s.tower.meta.upgrades[k],0,UPGRADES[k].max));
 const sid=seasonId();
 if(!s.tower.season||s.tower.season.id!==sid){
   const prev=s.tower.season;
   if(prev?.id){
     s.tower.seasonHistory[String(prev.id)]={
       id:String(prev.id),
       bestFloor:Math.max(0,Number(prev.bestFloor)||0),
       bestScore:Math.max(0,Number(prev.bestScore)||0),
       bestTime:Math.max(0,Number(prev.bestTime)||0),
       runs:Math.max(0,Number(prev.runs)||0),
       bossKills:Math.max(0,Number(prev.bossKills)||0),
       eliteKills:Math.max(0,Number(prev.eliteKills)||0)
     };
     const keep=Object.keys(s.tower.seasonHistory).sort().slice(-6);
     Object.keys(s.tower.seasonHistory).forEach(k=>{if(!keep.includes(k))delete s.tower.seasonHistory[k]});
   }
   s.tower.season={id:sid,bestFloor:0,bestScore:0,bestTime:0,runs:0,bossKills:0,eliteKills:0};
   if(s.tower.run?.active)s.tower.run=null;
 }
 const z=s.tower.season;z.bestFloor=Math.max(0,Number(z.bestFloor)||0);z.bestScore=Math.max(0,Number(z.bestScore)||0);z.runs=Math.max(0,Number(z.runs)||0);z.bossKills=Math.max(0,Number(z.bossKills)||0);z.eliteKills=Math.max(0,Number(z.eliteKills)||0);
 if(s.tower.run&&typeof s.tower.run==='object'){
   const r=s.tower.run;
   r.buffs=Array.isArray(r.buffs)?r.buffs:[];
   r.unbanked=(r.unbanked&&typeof r.unbanked==='object')?r.unbanked:{gold:0,xp:0,tokens:0,items:[]};r.unbanked.items=Array.isArray(r.unbanked.items)?r.unbanked.items:[];
   r.floor=Math.max(1,Number(r.floor)||1);r.score=Math.max(0,Number(r.score)||0);r.maxHp=Math.max(1,Number(r.maxHp)||towerMaxHp(r));r.hp=clamp(r.hp,0,r.maxHp);r.mode=r.mode||'route';r.mutationRerolls=Math.max(0,Number(r.mutationRerolls)||0);
   r.forceCombat=!!r.forceCombat;r.lastRoomType=typeof r.lastRoomType==='string'?r.lastRoomType:'combat';
   r.stats=(r.stats&&typeof r.stats==='object')?r.stats:{};['fights','damage','damageTaken','healing','crits','dodges','maxHit'].forEach(k=>r.stats[k]=Math.max(0,Number(r.stats[k])||0));
   r.startBestFloor=Math.max(0,Number(r.startBestFloor??z.bestFloor)||0);r.startBestScore=Math.max(0,Number(r.startBestScore??z.bestScore)||0);
   if(!r.v6359ServerRun&&r.balanceVersion!==2){const oldMax=Math.max(1,Number(r.maxHp)||1),ratio=clamp((Number(r.hp)||0)/oldMax,0,1);r.buffs=[...new Set(r.buffs)].slice(0,6);const hpMult=1+(Number(s.tower.meta.upgrades.roots)||0)*.04+buffFx(r,'maxHp');const freshMax=Math.max(50,Math.round(baseMaxHp()*hpMult));r.maxHp=freshMax;r.hp=clamp(Math.round(freshMax*ratio),0,freshMax);r.balanceVersion=2;}
   if(r.mode==='battle'&&!r.combat)r.mode='route';
   if(r.mode==='mutation'){
     const owned=new Set(r.buffs.filter(id=>MUTATIONS.some(m=>m.id===id)));
     const valid=[...new Set(Array.isArray(r.mutationChoices)?r.mutationChoices:[])].filter(id=>MUTATIONS.some(m=>m.id===id)&&!owned.has(id));r.mutationChoices=valid.slice(0,3);
     if(!r.mutationChoices.length){const pool=MUTATIONS.filter(m=>!owned.has(m.id));while(pool.length&&r.mutationChoices.length<3){const ix=Math.floor(Math.random()*pool.length);r.mutationChoices.push(pool.splice(ix,1)[0].id)}if(!r.mutationChoices.length){r.mode='route';r.geneticsComplete=true}}
   }
   if(r.mode==='route'){
     const wanted=r.floor%10===0?1:2;
     if(!Array.isArray(r.choices)||r.choices.length!==wanted||r.choices.some(x=>!x||!x.type))r.choices=seededChoiceFloor(r.floor);
   }
 }
 return s.tower;
}
function saveLocal(){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
function save(draw=false){try{if(typeof persist==='function')persist(draw);else saveLocal()}catch(e){saveLocal()}scheduleSync(false)}
function svgData(svg){return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg)}
function towerBg(){return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 620"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#13251a"/><stop offset="1" stop-color="#060b08"/></linearGradient><radialGradient id="r"><stop stop-color="#78ff72" stop-opacity=".55"/><stop offset="1" stop-color="#1a4b27" stop-opacity="0"/></radialGradient></defs><rect width="900" height="620" fill="url(#g)"/><circle cx="670" cy="120" r="180" fill="url(#r)"/><path d="M500 600 555 90h155l54 510" fill="#151d18" stroke="#53624b" stroke-width="10"/><path d="M560 160h142M550 250h163M540 350h185M525 470h214" stroke="#895d2e" stroke-width="18"/><path d="M495 600h275" stroke="#322317" stroke-width="34"/><path d="M610 80v-55h45v55M670 80v-72h42v72" stroke="#51664d" stroke-width="18"/><g fill="#4bad50" opacity=".62"><path d="M535 245c-90-70-120 28-20 40-80 55 14 102 50 20 55 67 116 2 49-45 73-50 0-102-50-35-15-80-100-55-29 20z"/><path d="M660 435c-65-50-90 20-15 30-60 40 10 80 38 15 42 50 85 1 37-34 55-38 0-76-38-26-10-60-75-40-22 15z"/></g><g fill="#d39b45" opacity=".8"><circle cx="634" cy="153" r="6"/><circle cx="634" cy="255" r="6"/><circle cx="634" cy="354" r="6"/><circle cx="634" cy="470" r="6"/></g></svg>`)}
const TOWER_ASSET_REV='tower2doors-realassets-20260913';
function towerAsset(path){
 try{const proto=String(location?.protocol||'');if(/^(file:|capacitor:|ionic:)$/i.test(proto))return path}catch(e){}
 return `${path}${path.includes('?')?'&':'?'}gl=${TOWER_ASSET_REV}`;
}
function towerVisualDungeon(floor){return 2+((Math.max(1,Math.floor(Number(floor)||1))-1)%19)}
function towerBossDungeon(floor){return 10+((Math.max(1,Math.floor(Number(floor)||10))/10|0)-1)%11}
function towerFloorBackground(floor,boss=false){const d=boss?towerBossDungeon(floor):towerVisualDungeon(floor);return towerAsset(`v474_dungeon_assets/d${d}_bg.jpg`)}
function towerEnemyRoom(floor,type){if(type==='miniboss')return 9;return 1+((Math.max(1,Number(floor)||1)*5+(type==='elite'?3:0))%9)}
function towerEnemyArt(floor,type){if(type==='boss'){const d=towerBossDungeon(floor);return towerAsset(`v474_dungeon_assets/d${d}_boss.png`)}const d=towerVisualDungeon(floor),room=towerEnemyRoom(floor,type);return towerAsset(`v474_dungeon_assets/d${d}_${room}.png`)}
const v7191TowerPreloaded=new Set();
const v8009TowerPreloadKeep=new Map();
function v7191PreloadTowerAsset(src,priority='high'){
 src=String(src||'');if(!src)return null;
 const held=v8009TowerPreloadKeep.get(src);
 if(held){try{if(priority==='high')held.fetchPriority='high'}catch(_){}return held}
 v7191TowerPreloaded.add(src);
 try{
  const im=new Image();
  im.decoding='async';im.loading='eager';
  try{im.fetchPriority=priority}catch(_){}
  v8009TowerPreloadKeep.set(src,im);
  const release=()=>setTimeout(()=>{try{if(v8009TowerPreloadKeep.get(src)===im)v8009TowerPreloadKeep.delete(src)}catch(_){}},30000);
  im.onload=release;im.onerror=release;
  im.src=src;
  try{im.decode?.().catch(()=>{})}catch(_){}
  return im;
 }catch(_){return null}
}
function v7191PreloadTowerRoute(r){
 if(!r?.active||!Array.isArray(r.choices))return;
 try{
  for(const choice of r.choices){
   if(!choice)continue;
   const type=choice.miniboss?'miniboss':String(choice.type||'normal');
   if(!['normal','elite','boss','miniboss'].includes(type))continue;
   v7191PreloadTowerAsset(towerFloorBackground(r.floor,type==='boss'),'high');
   v7191PreloadTowerAsset(towerEnemyArt(r.floor,type),'high');
  }
 }catch(_){}
}
window.v7191PreloadTowerAsset=v7191PreloadTowerAsset;
window.v7191PreloadTowerRoute=v7191PreloadTowerRoute;

function towerAssetEnemyName(floor,type){
 try{const d=type==='boss'?towerBossDungeon(floor):towerVisualDungeon(floor),room=type==='boss'?10:towerEnemyRoom(floor,type);const gd=(window.dungeons||dungeons)?.[d-1],e=gd?.enemies?.[room-1];const name=String(e?.short||e?.name||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();if(name)return name}catch(e){}
 return '';
}
function routeArt(type,meta={}){
 const m={normal:['#60431f','#2d1b0e','#79945d','#8ed56a','KAMPF'],elite:['#4b283c','#211025','#9b56b5','#d68cff','ELITE'],grow:['#5a4221','#182117','#599b55','#83dc77','GROW'],lab:['#43483f','#101d20','#4f9d9c','#72e0d8','LABOR'],merchant:['#6a4b20','#21170b','#c08e3f','#efc86f','MARKT'],mystery:['#41304f','#16101d','#73518e','#c19bfa','MYSTERY'],secret:['#315849','#0b1e18','#3caa82','#74eec0','GEHEIM'],boss:['#5b3219','#211207','#b47b31','#f0be62','BOSS']};
 const [wood,deep,metal,glow,label]=m[type]||m.normal;const title=meta?.miniboss?'MINIBOSS':label;
 return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 600"><defs><linearGradient id="w" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${wood}"/><stop offset=".5" stop-color="${deep}"/><stop offset="1" stop-color="${wood}"/></linearGradient><linearGradient id="m" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#332a20"/><stop offset=".5" stop-color="${metal}"/><stop offset="1" stop-color="#332a20"/></linearGradient><filter id="g"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path d="M60 560V205Q60 74 260 34Q460 74 460 205V560Z" fill="#17130f" stroke="#80643c" stroke-width="22"/><path d="M91 558V209Q91 104 260 69Q429 104 429 209V558Z" fill="url(#w)" stroke="#3b2b19" stroke-width="8"/><path d="M148 101V558M205 78V558M315 78V558M372 101V558" stroke="#24160d" stroke-width="8" opacity=".68"/><path d="M101 230H419M97 367H423M94 493H426" stroke="url(#m)" stroke-width="24"/><g fill="#c9a965" stroke="#3b2b19" stroke-width="3"><circle cx="120" cy="230" r="8"/><circle cx="400" cy="230" r="8"/><circle cx="116" cy="367" r="8"/><circle cx="404" cy="367" r="8"/><circle cx="112" cy="493" r="8"/><circle cx="408" cy="493" r="8"/></g><path d="M260 185l-25 62 25-17 25 17-25-62Zm0 2-66 31 43 8-27 37 50-22 50 22-27-37 43-8-66-31Z" fill="${glow}" opacity=".92" filter="url(#g)"/><rect x="160" y="292" width="200" height="54" rx="12" fill="#0e130f" stroke="${metal}" stroke-width="5"/><text x="260" y="327" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="900" fill="#f0dfb1">${title}</text><circle cx="386" cy="426" r="15" fill="${glow}" stroke="#1c160e" stroke-width="5" filter="url(#g)"/></svg>`)
}
function monsterArt(kind,seed=1,boss=false){const hue=(seed*47+kind.length*21)%360,c1=`hsl(${hue} 45% ${boss?38:32}%)`,c2=`hsl(${(hue+70)%360} 62% ${boss?58:50}%)`;let body='';
 if(kind==='spider')body='<ellipse cx="300" cy="210" rx="90" ry="70"/><circle cx="300" cy="130" r="55"/><path d="M230 180 120 110M230 210 105 200M235 235 120 290M370 180 480 110M370 210 495 200M365 235 480 290" fill="none" stroke-width="24" stroke-linecap="round"/>';
 else if(kind==='golem')body='<path d="M205 285 175 170l65-85h125l65 85-35 120-72 55h-70z"/><path d="M220 155h160M240 240h120" fill="none" stroke-width="18"/>';
 else if(kind==='moth')body='<ellipse cx="300" cy="190" rx="38" ry="105"/><path d="M270 170Q110 45 125 245q75 10 145-28M330 170Q490 45 475 245q-75 10-145-28"/>';
 else if(kind==='flower')body='<circle cx="300" cy="175" r="48"/><g><ellipse cx="300" cy="86" rx="46" ry="75"/><ellipse cx="390" cy="145" rx="46" ry="75" transform="rotate(65 390 145)"/><ellipse cx="355" cy="250" rx="46" ry="75" transform="rotate(130 355 250)"/><ellipse cx="245" cy="250" rx="46" ry="75" transform="rotate(230 245 250)"/><ellipse cx="210" cy="145" rx="46" ry="75" transform="rotate(295 210 145)"/></g>';
 else if(kind==='ghost')body='<path d="M190 315Q180 75 300 70t110 245l-55-40-55 45-55-45z"/>';
 else if(kind==='root'||kind==='vine')body='<path d="M280 330q-85-55-35-130-80-95 35-130 115 35 35 130 50 80-35 130z"/><path d="M250 250 125 330M335 245 470 325M265 120 190 40M330 125 410 40" fill="none" stroke-width="24" stroke-linecap="round"/>';
 else if(kind==='spore')body='<path d="M190 175Q300 35 410 175z"/><rect x="260" y="170" width="80" height="150" rx="35"/><circle cx="245" cy="125" r="15"/><circle cx="325" cy="105" r="13"/><circle cx="365" cy="145" r="11"/>';
 else if(kind==='slug')body='<path d="M110 290q55-135 190-85 85-120 185 20l35 65z"/><path d="M355 190 390 95M405 195 455 105" fill="none" stroke-width="16" stroke-linecap="round"/>';
 else if(kind==='knight')body='<path d="M220 310 195 145l105-75 105 75-25 165z"/><path d="M220 150h160M300 80v230" fill="none" stroke-width="18"/><path d="M365 245 485 105" fill="none" stroke-width="22"/>';
 else body='<path d="M180 310q-30-160 75-215 45-55 90 0 105 55 75 215z"/><path d="M220 130 160 60M380 130 445 60M205 260 120 330M395 260 485 330" fill="none" stroke-width="22" stroke-linecap="round"/>';
 return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><defs><radialGradient id="bg"><stop stop-color="${c2}" stop-opacity=".38"/><stop offset="1" stop-color="#08100b" stop-opacity="0"/></radialGradient><filter id="gl"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="600" height="400" fill="#0b120d"/><circle cx="300" cy="190" r="210" fill="url(#bg)"/><g fill="${c1}" stroke="${c2}" stroke-width="9" filter="url(#gl)">${body}</g><g fill="#f0e6b3"><circle cx="275" cy="175" r="8"/><circle cx="325" cy="175" r="8"/></g><path d="M272 220q28 22 56 0" fill="none" stroke="#1b120e" stroke-width="8" stroke-linecap="round"/><g fill="${c2}" opacity=".55"><circle cx="90" cy="80" r="8"/><circle cx="520" cy="110" r="6"/><circle cx="80" cy="300" r="5"/><circle cx="515" cy="315" r="9"/></g></svg>`)}
function mutationArt(m,i){const hue=(i*51+100)%360;return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 260"><defs><radialGradient id="r"><stop stop-color="hsl(${hue} 68% 58%)" stop-opacity=".65"/><stop offset="1" stop-color="#08100b" stop-opacity="0"/></radialGradient></defs><rect width="500" height="260" fill="#0b120d"/><circle cx="250" cy="120" r="150" fill="url(#r)"/><text x="250" y="165" font-size="120" text-anchor="middle">${m.icon}</text><path d="M0 230q80-40 160 0t160 0 160 0 160 0v30H0z" fill="#071008"/></svg>`)}
function playerAvatar(){try{if(typeof v080AvatarFor==='function')return v080AvatarFor(s.playerClass||'grower')}catch(e){}return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="none"/><circle cx="150" cy="95" r="55" fill="#b8794b"/><path d="M65 370q15-210 85-210t85 210" fill="#354c32" stroke="#76b55c" stroke-width="8"/><text x="150" y="245" text-anchor="middle" font-size="80">⚔️</text></svg>`)}
function typeMeta(type){return ({normal:['Kampftür','Direkter Kampf. Solider Fortschritt und normale Beute.','⚔️'],elite:['Elite-Tür','Härterer Kampf – deutlich mehr Score und bessere Beute.','☠️'],grow:['Grow-Tür','Versorgung und Heilung. Danach folgt zwingend wieder Kampf.','🌿'],lab:['Labor-Tür','Verändere deinen Run gezielt. Danach folgt zwingend wieder Kampf.','🧪'],merchant:['Schwarzmarkt-Tür','Tausche ungesichertes Gold gegen Vorteile. Danach wieder Kampf.','💰'],mystery:['Unbekannte Tür','Kann helfen oder schaden – Lebensverlust kann den Run beenden. Danach folgt wieder Kampf.','❓'],secret:['Versiegelte Tür','Sehr seltene Sonderetage mit besonderer Genetik.','🔐'],boss:['Boss-Tor','Alle 10 Etagen. Kein Ausweg – der Boss muss fallen.','👑']})[type]||['Etage','','']}
function seededChoiceFloor(floor){
 floor=Math.max(1,Math.floor(Number(floor)||1));
 if(floor%10===0)return [{type:'boss',id:`boss_${floor}`}];
 const r=s?.tower?.run||null,wed=towerWednesdayEvent();
 const marketSoldOut=!!(r?.shopFlags?.heal&&r?.shopFlags?.damage&&r?.shopFlags?.insurance);
 const combat=(type='normal',miniboss=false)=>({type,miniboss,id:`${floor}_${type}_${miniboss?'mini_':''}${Math.random().toString(36).slice(2,7)}`});
 const special=()=>{
  const geneticsFull=(r?.buffs?.length||0)>=6;
  const pool=geneticsFull
    ? ((wed.active&&wed.growthRooms)?['grow','grow','grow','mystery','mystery']:['grow','grow','mystery','mystery'])
    : ((wed.active&&wed.growthRooms)?['grow','grow','grow','lab','lab','mystery']:['grow','grow','mystery','mystery','lab']);
  if(!marketSoldOut)pool.push('merchant',...(wed.active&&wed.growthRooms?[]:['merchant']));
  const type=!geneticsFull&&floor>15&&chance(.055)?'secret':pick(pool);
  return {type,id:`${floor}_${type}_${Math.random().toString(36).slice(2,7)}`}
 };
 if(floor%5===0)return [combat('elite',true),combat('elite',false)];
 if(r?.forceCombat||r?.lastRoomType==='special')return wed.active&&wed.eliteDoors?[combat('elite'),combat('normal')]:[combat('normal'),combat('elite')];
 const eliteChance=wed.active&&wed.eliteDoors?(floor>3?.55:.25):(floor>8?.28:0);
 const fight=combat(chance(eliteChance)?'elite':'normal'),other=special();
 return chance(.5)?[fight,other]:[other,fight];
}
const TOWER_SUMMONER_AVATAR='assets/v7198-base64/11e78462c9373c3e267d.webp';
function canonicalTowerEnemyArt(name){
 const n=String(name||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss');
 if(n.includes('milbenkrieger'))return towerAsset('v474_dungeon_assets/d2_5.png');
 if(n.includes('trauermuecke'))return towerAsset('v474_dungeon_assets/d2_9.png');
 return '';
}
function towerEnemyVisual(enemy){return canonicalTowerEnemyArt(enemy?.name)||String(enemy?.art||'')}
function makeEnemy(floor,type){
 const miniboss=type==='miniboss',elite=type==='elite'||miniboss,boss=type==='boss';
 if(boss){const b=BOSSES[(Math.floor(floor/10)-1)%BOSSES.length],real=towerAssetEnemyName(floor,'boss');return {...b,name:real?`Turmboss: ${real}`:b.name,boss:true,elite:true,art:towerEnemyArt(floor,'boss'),bg:towerFloorBackground(floor,true)}}
 const [fallback,kind]=ENEMIES[(floor*3+Math.floor(Math.random()*ENEMIES.length))%ENEMIES.length];
 const visual=miniboss?'miniboss':elite?'elite':'normal',real=towerAssetEnemyName(floor,visual);
 const enemy={name:`${miniboss?'Miniboss: ':elite?'Elite ':''}${real||fallback}`,kind,elite,boss:false,miniboss,mechanic:elite?pick(['armor','rage','dodge','thorns']):'',desc:miniboss?'Zwischenboss – deutlich härter, aber mit starker Wertung.':elite?'Elite-Mutation aktiv.':'Turmgegner',art:towerEnemyArt(floor,visual),bg:towerFloorBackground(floor,false)};
 enemy.art=towerEnemyVisual(enemy);
 return enemy;
}
window.v6300CanonicalTowerEnemyArt=canonicalTowerEnemyArt;
window.V6333_HARZ_TOWER_AVATAR=TOWER_SUMMONER_AVATAR;
/* V8.009-T3: recovery math/state has one external Beta owner.
   The public V6.250 compatibility names remain available to the rest of the tower. */
function v8009RecoveryOwner(){
 const o=window.v8009TowerRecoveryOwner;
 if(!o)throw new Error('V8.009 Tower recovery owner missing');
 return o;
}
function v6250TowerRecoveryStep(level=Number(s?.level)||1){
 return v8009RecoveryOwner().step(level);
}
window.v6250TowerRecoveryStep=v6250TowerRecoveryStep;
function normalizeTowerRecovery(t){
 return v8009RecoveryOwner().normalize(t,Number(s?.level)||1);
}
function towerRecoveryInfo(){
 return v8009RecoveryOwner().info(
   ensure(),
   Number(s?.level)||1,
   Number(s?.harzTaler)||0
 );
}
function recoveryPanel(){return v8009RecoveryOwner().panel(towerRecoveryInfo(),fmt)}
window.v6250TowerRecoveryDiagnostics=()=>({
 level:Math.max(1,Math.floor(Number(s?.level)||1)),
 regenPerHour:v6250TowerRecoveryStep(),
 tiers:[
  {levels:'1–9',pctPerHour:25,fullFromZeroHours:4},
  {levels:'10–19',pctPerHour:20,fullFromZeroHours:5},
  {levels:'20–29',pctPerHour:15,fullFromZeroHours:7},
  {levels:'30–39',pctPerHour:10,fullFromZeroHours:10},
  {levels:'40–49',pctPerHour:7,fullFromZeroHours:15},
  {levels:'50+',pctPerHour:5,fullFromZeroHours:20}
 ],
 current:towerRecoveryInfo(),
 owner:'v8009TowerRecoveryOwner'
});
const v8009ChromeOwner=window.v8009CreateTowerChromeOwner?.({
 esc,
 towerWednesdayEvent:()=>towerWednesdayEvent(),
 setTowerTab:v=>{towerTab=v},
 render:()=>render()
});
if(!v8009ChromeOwner)throw new Error('V8.009 T7 tower chrome owner missing');
const v8009LobbyController=window.v8009CreateTowerLobbyController?.({
 getState:()=>s,
 ensure,
 recoveryOwner:()=>v8009RecoveryOwner(),
 normalizeRecovery:t=>normalizeTowerRecovery(t),
 recoveryInfo:()=>towerRecoveryInfo(),
 save:x=>save(x),
 render:()=>render(),
 toast:(...a)=>toast(...a),
 syncProfile:x=>syncProfile(x),
 towerMaxHp:r=>towerMaxHp(r),
 towerWednesdayEvent:()=>towerWednesdayEvent(),
 applyTowerMutation:(r,id)=>applyTowerMutation(r,id),
 seededChoiceFloor:f=>seededChoiceFloor(f),
 pick,
 setTowerTab:v=>{towerTab=v},
 fetchAllTowerProfiles:force=>v6314FetchAllTowerProfiles(force),
 seasonId:()=>seasonId(),
 esc,
 fmt,
 getUserId:()=>{try{return String(v073User?.id||'')}catch(e){return''}},
 fetchWednesdayRows:target=>fetchWednesdayRows(target),
 lastCompletedWednesdayEvent:()=>lastCompletedWednesdayEvent(),
 wednesdayState:()=>wednesdayState(),
 head:v6259Head,
 rewardTable:wednesdayRewardTable,
 paintWednesdayPlacementReward:(rows,target,uid)=>paintWednesdayPlacementReward(rows,target,uid)
});
if(!v8009LobbyController)throw new Error('V8.009 T4 tower lobby controller missing');
function buyTowerRecovery(){return v8009LobbyController.buyRecovery()}
function resetTowerRecovery(t){return v8009RecoveryOwner().reset(t)}
function scheduleTowerRecoveryRender(){return v8009LobbyController.scheduleRecoveryRender()}
function startRun(){return v8009LobbyController.startRun()}
function healRun(r,pct){const rule=seasonRule(),wed=towerWednesdayEvent();const mul=Math.max(.1,1+(tMeta('heal')*.06)+buffFx(r,'healBoost')-buffFx(r,'healPenalty')+(rule.heal||0)+(wed.active?(wed.heal||0):0));const amount=Math.round(r.maxHp*pct*mul),before=Math.max(0,Number(r.hp)||0);r.hp=Math.min(r.maxHp,r.hp+amount);const actual=Math.max(0,r.hp-before);if(r.stats)r.stats.healing=(Number(r.stats.healing)||0)+actual;return actual}
function tMeta(k){return Number(ensure().meta.upgrades[k])||0}
function rewardMult(r,type,risk=0){const rule=seasonRule();let m=1+buffFx(r,'reward')+tMeta('harvest')*.04;if(type==='boss')m+=rule.bossReward||0;else m+=rule.reward||0;return m*[1,1.32,1.72][risk]}
function scoreMult(r,type,risk=0){const rule=seasonRule(),wed=towerWednesdayEvent();let m=1+buffFx(r,'score')+(rule.score||0)+(wed.active?(wed.score||0):0);if(type==='elite')m+=rule.eliteScore||0;if(type==='boss')m+=rule.bossScore||0;return m*[1,1.60,2.15][risk]}
function tokenMult(r){const wed=towerWednesdayEvent();return 1+tMeta('leaves')*.05+buffFx(r,'tokens')+(seasonRule().tokens||0)+(wed.active?(wed.tokens||0):0)}
function addRunReward(r,type,risk){const f=r.floor,rm=rewardMult(r,type,risk),sm=scoreMult(r,type,risk),special=['grow','lab','merchant','mystery'].includes(type),secret=type==='secret',miniboss=!!r.currentChoice?.miniboss;let roomScale=special?.08:secret?.35:1;const goldType=type==='boss'?1.8:miniboss?1.45:type==='elite'?1.25:1;const goldRisk=[1,1.25,1.55][risk]||1;const rule=seasonRule();const goldBoost=1+buffFx(r,'gold')+buffFx(r,'reward')+tMeta('harvest')*.04+(rule.reward||0)*.35+(type==='boss'?(rule.bossReward||0)*.35:0);let gold=Math.round((6+f*1.8)*goldType*goldRisk*goldBoost*roomScale),xp=Math.max(1,Math.round((25+f*7.2)*rm*roomScale)),tokens=0;if(type==='elite')tokens=Math.max(1,Math.round((1+f/35)*tokenMult(r)))+(miniboss?1:0);if(type==='boss')tokens=Math.max(3,Math.round((4+f/20)*tokenMult(r)));if(secret)tokens=Math.max(2,Math.round(3*tokenMult(r)));const wed=towerWednesdayEvent();if(wed.active&&type==='elite'&&wed.eliteTokens)tokens=Math.max(1,Math.round(tokens*(1+wed.eliteTokens)));const factor=type==='elite'?(miniboss?1.75:1.35):type==='boss'?2.2:special?.28:secret?.8:1;const score=Math.round((90+f*34)*factor*sm);r.unbanked.gold+=gold;r.unbanked.xp+=xp;r.unbanked.tokens+=tokens;r.score+=score;const itemChance=type==='boss'?.30:(type==='elite'?(miniboss?.20:.12):(special?0:secret?.05:.025)),itemCap=Math.max(1,Math.ceil(f/18));if((r.unbanked.items?.length||0)<itemCap&&chance(itemChance)){try{if(typeof makeClassLoot==='function'){const it=makeClassLoot(s.playerClass||'grower','dungeon');if(type==='boss'){it.quality=chance(Math.min(.65,.25+f*.004))?'purple':'blue';it.rarity=it.quality==='purple'?'epic':'rare';if(it.quality==='purple')it.name=`Turm-Epic: ${String(it.name||'Item').replace(/^.*?:\s*/,'')}`}else if(type==='elite'&&chance(miniboss?.55:.35)){it.quality='purple';it.rarity='epic'}try{if(typeof window.v447ApplyItemCurve==='function')window.v447ApplyItemCurve(it)}catch(e){}r.unbanked.items.push(it)}}catch(e){}}
 r.lastReward={gold,xp,tokens,score,type};return r.lastReward}

function updateBest(r){const z=ensure().season;z.bestFloor=Math.max(z.bestFloor,r.cleared||0);z.bestScore=Math.max(z.bestScore,Math.round(r.score||0));z.bossKills=Math.max(z.bossKills,Number(r.bossKills)||0);z.eliteKills=Math.max(z.eliteKills,Number(r.eliteKills)||0);const dur=Date.now()-r.startedAt;if((r.cleared||0)>=z.bestFloor&&(!z.bestTime||dur<z.bestTime))z.bestTime=dur}
function chooseRoute(i){const r=ensure().run;if(!r?.active||r.mode!=='route')return;const wanted=r.floor%10===0?1:2;if(!Array.isArray(r.choices)||r.choices.length!==wanted)r.choices=seededChoiceFloor(r.floor);const c=r.choices?.[i];if(!c)return;r.currentChoice=c;r.routeChoiceIndex=i;r.transitionNonce=(Number(r.transitionNonce)||0)+1;if(['normal','elite','boss'].includes(c.type)){r.enemy=makeEnemy(r.floor,c.miniboss?'miniboss':c.type);r.mode='doorTransition'}else if(c.type==='grow'){r.mode='growEvent'}else if(c.type==='lab'){r.mode='lab'}else if(c.type==='merchant'){r.mode='merchant'}else if(c.type==='secret'){r.mode='secret'}else mysteryEvent(r);saveLocal();render()}
function mysteryEvent(r){const rolls=[
 {name:'Defektes Bewässerungsrohr',text:'Du fängst sauberes Wasser auf.',do:()=>`+${healRun(r,.16)} Leben`},
 {name:'Versteckter Harzbeutel',text:'Jemand hat Beute liegen lassen.',do:()=>{const g=10+r.floor*2;r.unbanked.gold+=g;return `+${g} Gold`}},
 {name:'Sporenwolke',text:'Die Luft war doch nicht sauber.',do:()=>{const d=Math.round(r.maxHp*.12);r.hp=Math.max(1,r.hp-d);return `−${d} Leben`}},
 {name:'Alter Turmplan',text:'Du findest einen kürzeren Weg.',do:()=>{r.score+=120+r.floor*10;return `+${120+r.floor*10} Score`}},
 {name:'Verbotene Kiste',text:'Die Kiste enthält gepresste Blätter.',do:()=>{const n=Math.max(1,Math.round(tokenMult(r)));r.unbanked.tokens+=n;return `+${n} Turmblatt`}}
 ];const ev=pick(rolls),result=ev.do();r.event={title:ev.name,text:ev.text,result};r.mode='mysteryResult';saveLocal();render()}
function completeNonCombat(extraMutation=false){const r=ensure().run;if(!r)return;r.cleared=r.floor;addRunReward(r,r.currentChoice?.type||'normal',0);updateBest(r);updateWednesdayProgress(r,'');const cleared=r.floor;try{window.v6239WeeklyChestTowerFloor?.(cleared,r.currentChoice?.type||'special',r)}catch(_){}r.floor++;r.lastRoomType='special';r.forceCombat=true;r.choices=seededChoiceFloor(r.floor);v7191PreloadTowerRoute(r);r.currentChoice=null;r.enemy=null;if(extraMutation||cleared%7===0||seasonRule().mutation&&chance(.12)||wednesdayMutationRoll()){prepareMutation(r)}else r.mode='route';save(false);syncProfile(false);render()}
function prepareMutation(r){const owned=new Set((r.buffs||[]).filter(id=>MUTATIONS.some(m=>m.id===id)));if(owned.size>=6){r.mutationChoices=[];r.geneticsComplete=true;r.mode='route';return false}const pool=MUTATIONS.filter(m=>!owned.has(m.id));const opts=[];while(pool.length&&opts.length<3){const ix=Math.floor(Math.random()*pool.length);opts.push(pool.splice(ix,1)[0].id)}r.mutationChoices=opts;if(!opts.length){r.geneticsComplete=true;r.mode='route';return false}r.mode='mutation';return true}

function normalizeTowerMutationCap(){
 const r=ensure().run;
 if(!r)return false;
 const next=[...new Set(Array.isArray(r.buffs)?r.buffs:[])].slice(0,6);
 const changed=next.length!==(Array.isArray(r.buffs)?r.buffs.length:0);
 if(changed){
  r.buffs=next;
  r.mutationChoices=[];
  r.geneticsComplete=true;
 }
 return changed;
}
window.v6269NormalizeTowerMutationCap=normalizeTowerMutationCap;
window.v6300RepairCurrentTowerEnemy=()=>{
 const r=ensure().run;
 if(!r?.enemy)return false;
 const art=canonicalTowerEnemyArt(r.enemy.name);
 if(!art)return false;
 const changed=String(r.enemy.art||'')!==art;
 r.enemy.art=art;
 return changed;
};

function applyTowerMutation(r,id){
 if(!r||!MUTATIONS.some(m=>m.id===id)||r.buffs?.includes(id)||(r.buffs?.length||0)>=6)return false;
 const oldMax=Math.max(1,Number(r.maxHp)||towerMaxHp(r));
 const oldHp=clamp(Number(r.hp)||0,0,oldMax);
 r.buffs=Array.isArray(r.buffs)?r.buffs:[];
 r.buffs.push(id);
 const nextMax=towerMaxHp(r);
 r.maxHp=nextMax;
 if(nextMax>oldMax)r.hp=Math.min(nextMax,oldHp+(nextMax-oldMax));
 else r.hp=Math.min(oldHp,nextMax);
 return true
}
function selectMutation(id){const r=ensure().run;if(!r||!r.mutationChoices?.includes(id))return;if(!applyTowerMutation(r,id))return;r.mutationChoices=[];r.mode='route';save(false);render()}
function rerollMutation(){const r=ensure().run;if(!r||r.mode!=='mutation'||r.mutationRerolls<1)return;r.mutationRerolls--;prepareMutation(r);saveLocal();render()}
function startFight(risk){risk=0;const r=ensure().run;if(!r||!['prep','doorTransition'].includes(r.mode)||!r.enemy)return;const type=r.currentChoice.type,f=r.floor,rule=seasonRule(),wed=towerWednesdayEvent(),riskEnemy=[1,1.28,1.62][risk]||1,elite=type==='elite',boss=type==='boss',miniboss=!!r.currentChoice?.miniboss;const lvl=Math.max(1,Number(s.level)||1),main=Math.max(5,Number(totalAttr?.(primaryAttr()))||5),dex=Math.max(0,Number(totalAttr?.('geschick'))||0);const expectedHit=Math.max(10,main*2.1+lvl*2.15+dex*.25+5);const targetHits=3.6+Math.min(6.4,f*.07);const graceFloor=8+lvl*.45;const overDepth=Math.max(0,f-graceFloor);const depthPressure=Math.pow(1.045,overDepth);const bossTier=boss?Math.max(0,Math.floor(f/10)-1):0;const bossHpGate=boss?(1+Math.min(.60,bossTier*.04)):1,bossDmgGate=boss?(1+Math.min(.35,bossTier*.025)):1;const classHp=(boss?1.82:miniboss?1.52:elite?1.27:1)*bossHpGate;const classDmg=(boss?1.34:miniboss?1.25:elite?1.15:1)*bossDmgGate;if(r.stats)r.stats.fights=(Number(r.stats.fights)||0)+1;let hp=Math.round(expectedHit*targetHits*classHp*depthPressure*riskEnemy*(1+(rule.enemy||0))*(1+(wed.active?(wed.enemyHp||0):0)));const basePct=.072+Math.min(.048,f*.0005);let dmg=Math.max(1,Math.round(r.maxHp*basePct*classDmg*Math.pow(depthPressure,.45)*riskEnemy*(1+(rule.enemy||0))*(1+(wed.active?(wed.enemyDamage||0):0))));let talent=null;try{if(typeof v318NewCombatState==='function')talent=v318NewCombatState('tower',r.maxHp)}catch(e){}r.combat={risk,enemyHp:hp,enemyMax:hp,enemyDmg:dmg,round:0,log:[boss?`Boss-Stärkeprüfung ${Math.floor(f/10)} · Turmdruck ×${depthPressure.toFixed(2)}.`:`Der Kampf beginnt. Turmdruck ×${depthPressure.toFixed(2)}.`],type,talent,depthPressure,graceFloor:Math.round(graceFloor),bossTier};r.mode='battle';saveLocal();render();setTimeout(()=>resumeCombat(),180)}

function setVal(k){try{return Number(setBonusValue?.(k))||0}catch(e){return 0}}
function critChance(r,c){let crit=.06+(Number(totalAttr?.('glueck'))||0)*.0025+buffFx(r,'crit');if(s.playerClass==='bruiser')crit+=.06+setVal('critChance');if(c?.mechanic==='blind')crit-=.08;return clamp(crit,.02,.65)}
function playerDamage(r,c){const pk=primaryAttr();const base=Math.max(1,(Number(totalAttr?.(pk))||5)*2.1+(Number(s.level)||1)*2.15+(Number(totalAttr?.('geschick'))||0)*.25+Math.random()*10);let resolved=null;try{if(c?.talent&&typeof v318ResolvePlayerAttack==='function'){resolved=v318ResolvePlayerAttack(c.talent,{baseDamage:base,enemyHp:c.enemyHp,enemyMax:c.enemyMax,playerHp:r.hp,playerMax:r.maxHp,baseCrit:critChance(r,c),setCrit:s.playerClass==='bruiser'?(.07+setVal('critChance')):0,baseWucht:(s.playerClass==='grower'||s.playerClass==='frost')?(.13+setVal('wuchtChance')):0,baseDouble:s.playerClass==='scout'?(.15+setVal('doubleChance')):0,setDoubleDamage:setVal('doubleDamage')})}}catch(e){console.warn('Anbauturm Talentangriff',e)}let dmg=Math.max(1,Math.round(Number(resolved?.damage)||base)),heal=Math.max(0,Math.round(Number(resolved?.heal)||0)),special=String(resolved?.text||'TREFFER'),crit=!!resolved?.crit;if(!resolved&&chance(critChance(r,c))){dmg=Math.round(dmg*1.65);crit=true;special='KRIT'}let mult=1+buffFx(r,'damage');if(r.hp/r.maxHp<.4)mult+=buffFx(r,'lowHpDamage');dmg=Math.max(1,Math.round(dmg*mult));if(crit)dmg=Math.round(dmg*(1+buffFx(r,'critDmg')));heal+=Math.round(dmg*buffFx(r,'lifesteal'));return{dmg,heal,crit,special}}
function enemyRawDamage(r,c){let d=c.enemyDmg*(.88+Math.random()*.24);let red=buffFx(r,'armor');d*=Math.max(.25,1-red+buffFx(r,'incoming'));if(c.mechanic==='rage')d*=1+Math.min(.7,c.round*.035);if(c.mechanic==='copy')d*=1+Math.min(.4,(r.buffs?.length||0)*.035);if(c.mechanic==='final')d*=1.12;return Math.max(1,Math.round(d))}
function anim(sel,cl,ms=420){const el=document.querySelector(sel);if(!el)return;el.classList.remove(cl);void el.offsetWidth;el.classList.add(cl);setTimeout(()=>el.classList.remove(cl),ms)}
function pop(sel,text){const el=document.querySelector(sel);if(!el)return;el.textContent=text;anim(sel,'pop',700)}
function battlePaint(r,c){const p=document.querySelector('#vTPlayerBar i'),e=document.querySelector('#vTEnemyBar i');if(p)p.style.width=`${clamp(r.hp/r.maxHp*100,0,100)}%`;if(e)e.style.width=`${clamp(c.enemyHp/c.enemyMax*100,0,100)}%`;const pt=document.querySelector('#vTPlayerHp'),et=document.querySelector('#vTEnemyHp');if(pt)pt.textContent=`${fmt(r.hp)} / ${fmt(r.maxHp)}`;if(et)et.textContent=`${fmt(c.enemyHp)} / ${fmt(c.enemyMax)}`;const log=document.querySelector('#vTBattleLog');if(log)log.textContent=c.log.slice(-2).join(' ')}
function resumeCombat(){const r=ensure().run;if(!r||r.mode!=='battle'||!r.combat)return;if(window.v7081UseAuthority?.('tower')||r?.v7085ServerReplay)return;const token=++battleToken,c=r.combat;const loop=()=>{if(token!==battleToken||ensure().run!==r||r.mode!=='battle')return;c.round++;
   if(c.mechanic==='dodge'&&chance(.15)){anim('#vTEnemyFighter','dodge',450);c.log.push(`Runde ${c.round}: ${r.enemy.name} weicht aus.`);battlePaint(r,c);try{window.v6230TowerCombatFx?.({phase:'enemyDodge',raw:'AUSGEWICHEN',round:c.round})}catch(_){}try{window.v6111Sfx?.('dodge')}catch(e){}return setTimeout(enemyTurn,430)}
   const hit=playerDamage(r,c);if(c.mechanic==='armor')hit.dmg=Math.round(hit.dmg*.80);if(c.mechanic==='power'&&c.round<=2)hit.dmg=Math.round(hit.dmg*.75);anim('#vTPlayerFighter','attack-r');setTimeout(()=>{c.enemyHp=Math.max(0,c.enemyHp-hit.dmg);const hpBeforeHitHeal=Math.max(0,Number(r.hp)||0);r.hp=Math.min(r.maxHp,r.hp+(hit.heal||0));if(r.stats){r.stats.damage=(Number(r.stats.damage)||0)+Math.max(0,Number(hit.dmg)||0);r.stats.maxHit=Math.max(Number(r.stats.maxHit)||0,Math.max(0,Number(hit.dmg)||0));if(hit.crit)r.stats.crits=(Number(r.stats.crits)||0)+1;r.stats.healing=(Number(r.stats.healing)||0)+Math.max(0,r.hp-hpBeforeHitHeal)}pop('#vTDmgEnemy',`${hit.crit?'KRIT! ':''}-${hit.dmg}`);anim('#vTEnemyFighter','hit');c.log.push(`Runde ${c.round}: ${hit.special||'Treffer'} · ${hit.dmg} Schaden${hit.heal?` · +${hit.heal} LP`:''}.`);try{window.v6230TowerCombatFx?.({phase:'player',raw:hit.special,damage:hit.dmg,heal:hit.heal,crit:hit.crit,round:c.round})}catch(_){}try{window.v6225ExtraHitVisual?.('tower',hit.special,{round:c.round})}catch(_){}if(c.mechanic==='thorns'){const th=Math.max(1,Math.round(hit.dmg*.08));r.hp=Math.max(0,r.hp-th);if(r.stats)r.stats.damageTaken=(Number(r.stats.damageTaken)||0)+th;c.log.push(`Dornen werfen ${th} Schaden zurück.`)}battlePaint(r,c);saveLocal();try{window.v6111Sfx?.(hit.crit?'crit':'hit');if(hit.heal)window.v6111Sfx?.('heal')}catch(e){}if(c.enemyHp<=0)return winFight();if(r.hp<=0)return loseFight();setTimeout(enemyTurn,360)},260)};
   const enemyTurn=()=>{if(token!==battleToken||r.mode!=='battle')return;const towerEvade=clamp(buffFx(r,'evade'),0,.45);if(chance(towerEvade)){if(r.stats)r.stats.dodges=(Number(r.stats.dodges)||0)+1;anim('#vTPlayerFighter','dodge',450);c.log.push('Turm-Mutation: Du weichst dem Angriff aus.');battlePaint(r,c);try{window.v6230TowerCombatFx?.({phase:'playerDodge',raw:'AUSGEWICHEN',round:c.round})}catch(_){}try{window.v6111Sfx?.('dodge')}catch(e){}return setTimeout(loop,480)}let raw=enemyRawDamage(r,c);if(c.mechanic==='multi'&&c.round%3===0)raw=Math.round(raw*1.65);if(c.mechanic==='gift')raw=Math.round(raw*(1+Math.min(.45,c.round*.025)));let d=raw,heal=0,counter=0,prevent=false,label='TREFFER';try{if(c.talent&&typeof v318ResolveEnemyAttack==='function'){const out=v318ResolveEnemyAttack(c.talent,{damage:raw,playerHp:r.hp,playerMax:r.maxHp})||{};d=Math.max(0,Math.round(Number(out.damage)||0));heal=Math.max(0,Math.round(Number(out.heal)||0));counter=Math.max(0,Math.round(Number(out.counterDamage)||0));prevent=!!out.preventLethal;label=String(out.text||label)}}catch(e){console.warn('Anbauturm Talentverteidigung',e)}anim('#vTEnemyFighter','attack-l');setTimeout(()=>{const hpBeforeDefHeal=Math.max(0,Number(r.hp)||0);r.hp=Math.min(r.maxHp,r.hp+heal);const actualDefHeal=Math.max(0,r.hp-hpBeforeDefHeal);r.hp=Math.max(0,r.hp-d);if(prevent&&r.hp<=0)r.hp=1;if(counter)c.enemyHp=Math.max(0,c.enemyHp-counter);if(r.stats){r.stats.healing=(Number(r.stats.healing)||0)+actualDefHeal;r.stats.damageTaken=(Number(r.stats.damageTaken)||0)+Math.max(0,Number(d)||0);r.stats.damage=(Number(r.stats.damage)||0)+Math.max(0,Number(counter)||0)}if(d>0){pop('#vTDmgPlayer',`-${d}`);anim('#vTPlayerFighter','hit')}else{anim('#vTPlayerFighter','dodge',420);pop('#vTDmgPlayer','AUS')}c.log.push(`${r.enemy.name}: ${label} · ${d} Schaden${heal?` · +${heal} LP`:''}${counter?` · Konter ${counter}`:''}.`);try{window.v6230TowerCombatFx?.({phase:'enemy',raw:label,damage:d,heal,counter,prevent,round:c.round})}catch(_){}try{window.v6225ExtraHitVisual?.('tower',label,{round:c.round,actor:'defender'})}catch(_){}battlePaint(r,c);saveLocal();try{window.v6111Sfx?.(d?'enemyHit':'dodge');if(counter)window.v6111Sfx?.('block');if(heal)window.v6111Sfx?.('heal')}catch(e){}if(c.enemyHp<=0)return winFight();if(r.hp<=0)return loseFight();setTimeout(loop,430)},260)};
 loop()}
function winFight(){battleToken++;const r=ensure().run;if(!r)return;const type=r.combat.type,risk=r.combat.risk,cleared=r.floor;const rw=addRunReward(r,type,risk);r.cleared=cleared;if(type==='elite')r.eliteKills++;if(type==='boss')r.bossKills++;const healPct=buffFx(r,'afterHeal');if(healPct>0)healRun(r,healPct);updateBest(r);updateWednesdayProgress(r,type);try{window.v6239WeeklyChestTowerFloor?.(cleared,type,r)}catch(_){}r.floor=cleared+1;r.lastRoomType='combat';r.forceCombat=false;r.choices=seededChoiceFloor(r.floor);v7191PreloadTowerRoute(r);r.combat=null;r.enemy=null;r.currentChoice=null;r.lastReward=rw;if(type==='boss'){r.pendingMutationAfterCheckpoint=true;r.mode='checkpoint'}else if(cleared%5===0||(type==='elite'&&chance(.35))||(seasonRule().mutation&&chance(.12))||wednesdayMutationRoll()){prepareMutation(r)}else{r.mode='reward'}save(false);syncProfile(true);render()}
function loseFight(){battleToken++;const r=ensure().run;if(!r)return;finishRun('death')}
function nextAfterReward(){const r=ensure().run;if(!r)return;r.mode='route';saveLocal();render()}
function checkpointContinue(){const r=ensure().run;if(!r)return;if(r.pendingMutationAfterCheckpoint){r.pendingMutationAfterCheckpoint=false;prepareMutation(r)}else r.mode='route';save(false);render()}
function bankAndFinish(){finishRun('secured')}
function finishRun(reason){const t=ensure(),r=t.run;if(!r)return;battleToken++;const baseLoss=reason==='secured'?0:.25;const loss=Math.max(0,baseLoss-buffFx(r,'lossReduce'));const keep=1-loss;const gold=Math.floor(r.unbanked.gold*keep),xp=Math.floor(r.unbanked.xp*keep),tokens=Math.floor(r.unbanked.tokens*keep);s.gold=(Number(s.gold)||0)+gold;try{if(typeof addXp==='function')addXp(xp);else s.xp=(Number(s.xp)||0)+xp}catch(e){s.xp=(Number(s.xp)||0)+xp}t.meta.tokens+=tokens;const items=(r.unbanked.items||[]).filter(()=>reason==='secured'||Math.random()<keep);for(const it of items){try{s.inventory.push(it)}catch(e){}}const previousBestFloor=Math.max(0,Number(r.startBestFloor)||0),previousBestScore=Math.max(0,Number(r.startBestScore)||0),finalFloor=Math.max(0,Number(r.cleared)||0),finalScore=Math.max(0,Math.round(Number(r.score)||0));updateBest(r);const result={reason,floor:finalFloor,score:finalScore,gold,xp,tokens,items:items.length,lostPct:Math.round(loss*100),duration:Date.now()-r.startedAt,previousBestFloor,previousBestScore,newFloorRecord:finalFloor>previousBestFloor,newScoreRecord:finalScore>previousBestScore,buffs:[...(r.buffs||[])].slice(0,6),stats:{...(r.stats||{})},eliteKills:Number(r.eliteKills)||0,bossKills:Number(r.bossKills)||0};t.lastResult=result;resetTowerRecovery(t);t.run=null;towerTab='result';save(false);syncProfile(true);render();toast(reason==='secured'?'Beute gesichert.':'Turmlauf beendet.',reason==='secured'?'success':'warn')}
function confirmAbort(){const go=async()=>{let ok=true;try{if(typeof v115Confirm==='function'){ok=await v115Confirm('Lauf wirklich abbrechen? 25 % der ungesicherten Beute gehen verloren.',{title:'Anbauturm verlassen',type:'warn',okText:'Lauf beenden'});}else{ok=confirm('Lauf wirklich abbrechen?')}}catch(e){}if(ok)finishRun('aborted')};void go()}
function growOption(kind){const r=ensure().run;if(!r)return;if(kind==='heal'){const n=healRun(r,.28);r.event={title:'Frische Nährlösung',text:`Du regenerierst ${n} Leben.`}}else if(kind==='leaves'){const n=Math.max(1,Math.round((1+r.floor/25)*tokenMult(r)));r.unbanked.tokens+=n;r.event={title:'Blätterernte',text:`+${n} Turmblätter.`}}else{const g=15+r.floor*3;r.unbanked.gold+=g;r.event={title:'Erntekiste',text:`+${g} Gold.`}}completeNonCombat(false)}
function labOption(kind){const r=ensure().run;if(!r)return;const buffs=Array.isArray(r.buffs)?r.buffs:[],atCap=buffs.length>=6;if(kind==='heal'){if(r.hp>=r.maxHp){toast('Dein Turm-Leben ist bereits voll.','warn');return}healRun(r,.20);r.event={title:'Stabilisator',text:'Leben wiederhergestellt.'};completeNonCombat(false)}else if(kind==='boost'){if(buffs.includes('roots')){toast('Wurzelnetz ist bereits aktiv.','warn');return}if(atCap){toast('Dein Mutationslimit ist erreicht.','warn');return}if(!applyTowerMutation(r,'roots'))return;r.event={title:'Wurzelinjektion',text:'Wurzelnetz für diesen Lauf erhalten.'};completeNonCombat(false)}else{const available=MUTATIONS.some(x=>!buffs.includes(x.id));if(atCap||!available){toast(atCap?'Dein Mutationslimit ist erreicht.':'Keine weitere Genetik verfügbar.','warn');return}const cleared=r.floor;r.cleared=cleared;addRunReward(r,'lab',0);updateBest(r);updateWednesdayProgress(r,'');r.floor=cleared+1;r.lastRoomType='special';r.forceCombat=true;r.choices=seededChoiceFloor(r.floor);v7191PreloadTowerRoute(r);r.currentChoice=null;prepareMutation(r);save(false);syncProfile(false);render()}}
function towerMerchantPrices(r){const disc=1-buffFx(r,'shopDiscount');return{heal:Math.round((55+r.floor*3)*disc),damage:Math.round((80+r.floor*4)*disc),insurance:Math.round((110+r.floor*5)*disc)}}
function merchantBuy(kind){
 const r=ensure().run;if(!r)return;
 const prices=towerMerchantPrices(r),p=prices[kind];
 if(!['heal','damage','insurance'].includes(kind)||!Number.isFinite(p))return;
 r.shopFlags=r.shopFlags&&typeof r.shopFlags==='object'?r.shopFlags:{};
 if(r.shopFlags[kind])return;
 const buffs=Array.isArray(r.buffs)?r.buffs:[];
 if(kind==='heal'&&Number(r.hp)>=Number(r.maxHp)){
  toast('Dein Turm-Leben ist bereits voll.','warn');return;
 }
 if(kind==='damage'){
  if(buffs.includes('diesel')){toast('Sour-Diesel-Antrieb ist bereits aktiv.','warn');return;}
  if(buffs.length>=6){toast('Dein Mutationslimit ist erreicht. Kauf nicht möglich.','warn');return;}
 }
 if(kind==='insurance'){
  if(buffs.includes('insurance')){toast('Beuteversicherung ist bereits aktiv.','warn');return;}
  if(buffs.length>=6){toast('Dein Mutationslimit ist erreicht. Kauf nicht möglich.','warn');return;}
 }
 if((Number(r.unbanked?.gold)||0)<p){toast('Nicht genug ungesichertes Turm-Gold.','warn');return;}
 let applied=false;
 if(kind==='heal')applied=Number(healRun(r,.30))>0;
 else if(kind==='damage')applied=applyTowerMutation(r,'diesel');
 else if(kind==='insurance')applied=applyTowerMutation(r,'insurance');
 if(!applied){toast('Kauf konnte nicht angewendet werden. Es wurde kein Gold abgezogen.','warn');return;}
 r.unbanked.gold=Math.max(0,(Number(r.unbanked.gold)||0)-p);
 r.shopFlags[kind]=true;
 const soldOut=!!(r.shopFlags.heal&&r.shopFlags.damage&&r.shopFlags.insurance);
 saveLocal();
 if(soldOut){toast('Schwarzmarkt leergekauft – er erscheint in diesem Run nicht mehr.','success');leaveMerchant();return}
 render();
}
function leaveMerchant(){completeNonCombat(false)}
function secretOption(kind){const r=ensure().run;if(!r)return;if(kind==='rest'){healRun(r,.38);r.unbanked.tokens+=Math.max(1,Math.round(2*tokenMult(r)))}else if(kind==='genes'){const pool=MUTATIONS.filter(m=>!r.buffs.includes(m.id));if(pool.length&&(r.buffs?.length||0)<6)applyTowerMutation(r,pick(pool).id);r.unbanked.tokens+=1}else{if(chance(.58)){r.unbanked.gold+=60+r.floor*6;r.unbanked.tokens+=Math.max(2,Math.round(3*tokenMult(r)))}else r.hp=Math.max(1,r.hp-Math.round(r.maxHp*.24))}completeNonCombat(true)}
function buyUpgrade(k){const t=ensure(),u=UPGRADES[k],lv=t.meta.upgrades[k]||0;if(!u||lv>=u.max)return;const cost=towerUpgradeCost(k,lv);if(t.meta.tokens<cost){toast('Nicht genug Turmblätter.','warn');return}t.meta.tokens-=cost;t.meta.upgrades[k]=lv+1;save(false);render()}
function towerMirror(){
 const t=ensure(),r=t.run,z=t.season,w=t.wednesday||{},hist=t.wednesdayHistory||{};
 const clean=x=>x?.key?{key:String(x.key),event_id:String(x.eventId||x.event_id||''),best_floor:Number(x.bestFloor??x.best_floor)||0,best_score:Number(x.bestScore??x.best_score)||0,elite_kills:Number(x.eliteKills??x.elite_kills)||0}:null;
 const history={};Object.keys(hist).sort().slice(-8).forEach(k=>{const x=clean(hist[k]);if(x)history[k]=x});
 const seasonHistory={};
 Object.entries(t.seasonHistory||{}).sort(([a],[b])=>a.localeCompare(b)).slice(-6).forEach(([id,x])=>{
   seasonHistory[id]={
     best_floor:Math.max(0,Number(x?.bestFloor??x?.best_floor)||0),
     best_score:Math.max(0,Number(x?.bestScore??x?.best_score)||0),
     best_time:Math.max(0,Number(x?.bestTime??x?.best_time)||0),
     runs:Math.max(0,Number(x?.runs)||0),
     boss_kills:Math.max(0,Number(x?.bossKills??x?.boss_kills)||0),
     elite_kills:Math.max(0,Number(x?.eliteKills??x?.elite_kills)||0)
   };
 });
 return{season:z.id,best_floor:z.bestFloor,best_score:z.bestScore,active_floor:r?.active?r.floor:0,active_score:r?.active?r.score:0,boss_kills:z.bossKills,elite_kills:z.eliteKills,season_history:seasonHistory,wednesday:clean(w),wednesday_history:history}
}
function fullDungeonProgress(){let d=null;try{const fn=window.v4130LiveDungeonProgress||window.v4124LiveDungeonProgress;if(typeof fn==='function')d=fn()}catch(e){}if(!d||typeof d!=='object')d=s.dungeon||{};const out={completed:[...(d.completed||[])],progress:{...(d.progress||{})},selected:Number(d.selected)||0,room:Number(d.room)||0,lastActive:Number(d.lastActive??d.selected)||0,unlocked:[...(d.unlocked||[])],tower:towerMirror()};try{if(typeof v6113PetProfileStats==='function')out.pet_stats=v6113PetProfileStats()}catch(e){}return out}
async function syncProfile(force=false){
 const id=(()=>{try{return v073User&&!v073User.is_anonymous&&v073User.id?String(v073User.id):''}catch(e){return''}})();
 if(!id)return false;
 try{
  if(typeof v073Init==='function')await v073Init();
  if(typeof v073Db==='undefined'||!v073Db)return false;
  const mirror=towerMirror(),json=JSON.stringify(mirror);
  if(!force&&json===lastMirror)return true;

  /* V6.313: Tower owns ONLY dungeon_progress.tower.
     Read the newest remote JSON first and preserve every unrelated dungeon/pet key.
     updated_at is used as an optimistic compare-and-swap guard so a concurrent
     Dungeon/Pet/Profile write cannot be silently overwritten between read + write. */
  for(let attempt=0;attempt<3;attempt++){
   const {data:remote,error:readError}=await v073Db.from('profiles')
    .select('dungeon_progress,updated_at')
    .eq('id',id)
    .maybeSingle();
   if(readError)throw readError;

   let base=remote?.dungeon_progress;
   if(!base||typeof base!=='object'||Array.isArray(base))base=fullDungeonProgress();
   const merged={...base,tower:mirror};
   const nextUpdatedAt=new Date().toISOString();

   let q=window.v7101ProfileUpdate({dungeon_progress:merged,updated_at:nextUpdatedAt})
    .eq('id',id);
   if(remote?.updated_at==null)q=q.is('updated_at',null);
   else q=q.eq('updated_at',remote.updated_at);

   const {data:written,error:writeError}=await q.select('id,updated_at').maybeSingle();
   if(writeError)throw writeError;
   if(written){lastMirror=json;return true}

   /* Another writer changed the profile after our read. Re-read and merge again. */
   await new Promise(resolve=>setTimeout(resolve,45*(attempt+1)));
  }
  console.warn('Anbauturm Profil-Sync: Konflikt nach 3 Merge-Versuchen');
  return false;
 }catch(e){console.warn('Anbauturm Profil-Sync',e);return false}
}
function scheduleSync(force=false){clearTimeout(syncTimer);syncTimer=setTimeout(()=>void syncProfile(force),force?30:1250)}
async function loadRanking(){return v8009LobbyController.loadRanking()}
async function loadWednesdayRanking(){return v8009LobbyController.loadWednesdayRanking()}

function toast(msg,type='success'){try{if(typeof v063Toast==='function')v063Toast(msg,type);else console.log(msg)}catch(e){}}
function runTop(r){return `<div class="vT-topstats"><div class="vT-stat good"><small>Etage</small><b>${r.floor}</b></div><div class="vT-stat"><small>Leben</small><b>${fmt(r.hp)} / ${fmt(r.maxHp)}</b></div><div class="vT-stat gold"><small>Turm-Score</small><b>${fmt(r.score)}</b></div><div class="vT-stat"><small>Ungesichert</small><b>💰 ${fmt(r.unbanked.gold)} · 🍃 ${fmt(r.unbanked.tokens)}</b></div></div><div class="vT-hpbox"><div class="vT-hpline"><span>Run-Leben bleibt zwischen Etagen erhalten</span><span>${Math.round(r.hp/r.maxHp*100)} %</span></div><div class="vT-bar"><i style="width:${clamp(r.hp/r.maxHp*100,0,100)}%"></i></div></div>${r.buffs.length?`<div class="vT-buffs" style="margin-top:8px">${r.buffs.map(id=>{const m=MUTATIONS.find(x=>x.id===id);return m?`<div class="vT-buffchip">${m.icon} <b>${esc(m.name)}</b></div>`:''}).join('')}</div>`:''}`}
/* V8.009-T7: dead hero/toolbar legacy removed; shared header/guide delegated to chrome owner. */
function v6259Head(r,sub,back=true,title=''){return v8009ChromeOwner.head(r,sub,back,title)}
function v6279OpenGuide(){return v8009ChromeOwner.openGuide()}

function v6259BuffBar(r){
 const all=Array.isArray(r?.buffs)?r.buffs:[];
 const cells=Array.from({length:6},(_,i)=>{
   const id=all[i],m=MUTATIONS.find(x=>x.id===id);
   return `<div class="v6259-buff ${m?'on':''}">${m?`<i>${m.icon}</i><b>${esc(m.name)}</b>`:'<i>＋</i><b>frei</b>'}</div>`;
 }).join('');
 const full=all.length>=6;return `<div class="v6259-buffs-title ${full?'v6347-genetics-full':''}">Aktive Mutationen (${all.length}/6)${full?' · GENETIK VOLL':''}</div><div class="v6259-buffs">${cells}</div>${full?'<div class="v6347-strength-mode">🧬 6/6 erreicht · Keine weiteren Mutationen. Ab jetzt zählt, wie weit dein Charakter kommt.</div>':''}`;
}
function v6259RiskBox(r){
 return `<details class="v6259-risk-more"><summary>🔥 Höheres Risiko / höhere Belohnung</summary>
   <div class="v6259-risk-grid">
    <button class="vT-btn gold" data-vt-fight="1"><b>Überdüngung</b><small>Gegner +28 % · Belohnung ×1,32 · Score ×1,60</small></button>
    <button class="vT-btn danger" data-vt-fight="2"><b>Maximale Überdüngung</b><small>Gegner +62 % · Belohnung ×1,72 · Score ×2,15</small></button>
   </div>
 </details>`;
}
function v6259RunLine(r){
 const pct=Math.round(clamp(r.hp/r.maxHp*100,0,100));
 return `<div class="v6259-runline"><span>❤️ Run-HP</span><div class="v6259-hp"><i style="width:${pct}%"></i></div><b>${pct}%</b><em>🍃 ${fmt(ensure().meta.tokens)}</em></div>`;
}

function lobby(){return v8009LobbyController.renderLobby()}
function routeView(r){
 const wanted=r.floor%10===0?1:2,marketSoldOut=!!(r?.shopFlags?.heal&&r?.shopFlags?.damage&&r?.shopFlags?.insurance);
 if(!Array.isArray(r.choices)||r.choices.length!==wanted||(marketSoldOut&&r.choices.some(c=>c?.type==='merchant')))r.choices=seededChoiceFloor(r.floor);
 const choices=r.choices||[],bossIx=Math.max(0,(Math.floor(r.floor/10)-1)%BOSSES.length),forced=r.forceCombat||r.lastRoomType==='special';
 const doors=choices.map((c,i)=>{
   const [name,desc,ico]=typeMeta(c.type),title=c.type==='boss'?BOSSES[bossIx].name:c.miniboss?'Miniboss-Tür':name;
   const hint=c.type==='boss'?'Kein Ausweg – der Boss muss fallen.':c.miniboss?'Ein besonders harter Wächter wartet dahinter.':desc;
   return `<div class="v6263-door-ui ${choices.length===1?'solo':''} side-${i}">
     <div class="v6263-door-room">${ico} Raum ${i+1}</div>
     <div class="v6263-door-copy"><b>${esc(title)}</b><span>${esc(hint)}</span></div>
     <button class="vT-btn ${c.type==='boss'?'gold':c.type==='elite'||c.miniboss?'danger':'primary'}" data-vt-route="${i}">${c.type==='boss'?'Boss-Tor öffnen':c.type==='elite'||c.miniboss?'Herausfordern':'Tür wählen'}</button>
   </div>`;
 }).join('');
 return `${v6259Head(r,`Etage ${r.floor} · ${r.floor%10===0?'Boss-Tor öffnen':'Wähle eine Tür …'}`,true,'ANBAU-TURM')}
 ${v6259RunLine(r)}
 <div class="v6263-door-stage ${choices.length===1?'single':''}">
   <div class="v6263-door-picture"></div>
   <div class="v6263-door-ui-layer">${doors}</div>
 </div>
 <div class="v6263-mutation-panel">
   ${v6259BuffBar(r)}
 </div>
 <div class="v6263-route-foot">
   <span>${forced?'Nach diesem Spezialraum folgt zwingend wieder ein Kampf.':'Zwei Wege. Eine Entscheidung.'}</span>
   <button class="v6263-abort-link" data-vt-abort>Run aufgeben</button>
 </div>`;
}
function doorTransitionView(r){
 const e=r.enemy||{},hard=!!r.currentChoice?.miniboss,boss=!!e.boss,idx=Math.max(0,Number(r.routeChoiceIndex)||0);
 return `${v6259Head(r,`Etage ${r.floor} · Tür betreten`,true,'ANBAU-TURM')}
 ${v6259RunLine(r)}
 <div class="v6281-door-enter ${boss?'boss':''}">
   <div class="v6281-door-enter-bg" style="background-image:url('${e.bg||towerFloorBackground(r.floor,e.boss)}')"></div>
   <div class="v6281-door-enter-vignette"></div>
   <div class="v6281-door-leaf left"></div>
   <div class="v6281-door-leaf right"></div>
   <div class="v6281-door-crack"></div>
   <div class="v6281-door-step">
     <small>${boss?'BOSS-TOR':'GEWÄHLTE TÜR'}</small>
     <b>${idx+1}. Tür bestätigt</b>
     <span>${boss?'Kein Ausweg – der Boss wartet dahinter.':hard?'Ein harter Wächter steht direkt hinter dieser Tür.':'Du gehst direkt durch die Tür in den Kampf.'}</span>
   </div>
   <div class="v6281-enter-enemy">
     <img loading="eager" decoding="async" fetchpriority="high" src="${e.art||''}" alt="${esc(e.name||'Gegner')}">
   </div>
   <div class="v6281-enter-tag"><b>${esc(e.name||'Gegner')}</b><span>${boss?'BOSS':hard?'MINIBOSS':e.elite?'ELITE':'GEGNER'} · Etage ${r.floor}</span></div>
 </div>
 <div class="v6281-enter-note">🚪 Tür gewählt · direkter Übergang in den Kampf …</div>`;
}

/* V7.308: server-authoritative Tower still shows the old slow door-opening presentation.
   The fight is already resolved server-side; this is presentation-only and never mutates gameplay state. */
window.v7298TowerDoorPreview=async function(run,routeIndex=0,ms=1350){
 try{
   const root=document.getElementById('tower');
   if(!root||!root.classList.contains('active')||!run)return false;
   const rr=deep(run);
   rr.mode='doorTransition';
   rr.routeChoiceIndex=Math.max(0,Number(routeIndex)||0);
   root.innerHTML=`<div class="vT-wrap">${doorTransitionView(rr)}</div>`;
   try{v6260TowerChrome(true)}catch(_){}
   document.body?.classList.add('v6259-tower-focus');
   await new Promise(resolve=>setTimeout(resolve,Math.max(900,Number(ms)||1350)));
   return true;
 }catch(err){
   console.warn('[V7.308] Tower door preview',err);
   return false;
 }
};
function prepView(r){
 const e=r.enemy,hard=!!r.currentChoice?.miniboss,boss=!!e.boss;
 return `${v6259Head(r,boss?`BOSS · ${e.name}`:hard?'MINIBOSS · Kampfvorbereitung':'Kampfvorbereitung')}
 ${v6259RunLine(r)}
 <div class="v6259-prep ${boss?'boss':''}">
   <div class="v6259-prep-bg" style="background-image:url('${e.bg||towerFloorBackground(r.floor,e.boss)}')"></div>
   <img class="v6259-prep-enemy" loading="eager" decoding="async" fetchpriority="high" src="${towerEnemyVisual(e)}" alt="${esc(e.name)}">
   <div class="v6259-enemy-tag"><b>${esc(e.name)}</b><span>${e.boss?'BOSS':hard?'MINIBOSS':e.elite?'ELITE':'GEGNER'} · Etage ${r.floor}</span></div>
   ${boss?'<div class="v6259-speech">„Alles wächst … und alles gehört mir!“</div>':''}
 </div>
 <div class="v6280-locked-choice">🔒 Tür gewählt · Gegner festgelegt</div>
 <button class="vT-btn primary v6259-fight-main" data-vt-fight="0">⚔️ Kampf beginnen</button>`;
}
function battleView(r){
 const c=r.combat,e=r.enemy;
 return `${v6259Head(r,`Etage ${r.floor} · Kampf · Runde ${c.round+1}`,true,'ANBAU-TURM')}
 <div class="v6259-battle vT-battle-stage ${s.playerClass==='summoner'?'v6294-summoner-tower':''}">
   <div class="v6259-battle-bg vT-battle-bg" style="background-image:url('${e.bg||towerFloorBackground(r.floor,e.boss)}')"></div>
   <div class="vT-battle-vignette"></div>
   <div class="v6276-clash-light"></div>
   <div class="v6275-battle-floor player"></div>
   <div class="v6275-battle-floor enemy"></div>
   <div class="v6276-battle-mist"></div>

   <div id="vTPlayerFighter" class="vT-fighter player v6259-fighter">
     ${s.playerClass==='summoner'
       ?`<img class="v6333-tower-harz-avatar" loading="eager" decoding="async" fetchpriority="high" src="${TOWER_SUMMONER_AVATAR}" alt="Harzruferin">`
       :`<img class="v6294-tower-player-img" loading="eager" decoding="async" fetchpriority="high" src="${playerAvatar()}" alt="Spieler" onerror="window.v6294TowerImgFallback?.(this,'player')">`}<div class="vT-fighter-name">${esc(playerName())}</div>
   </div>
   <div id="vTEnemyFighter" class="vT-fighter enemy v6259-fighter" data-enemy="${esc(e.name)}">
     <img class="v6294-tower-enemy-img" loading="eager" decoding="async" fetchpriority="high" src="${towerEnemyVisual(e)}" alt="${esc(e.name)}" onerror="window.v6294TowerImgFallback?.(this,'enemy')"><div class="vT-fighter-name">${esc(e.name)}</div>
   </div>

   <div id="vTDmgPlayer" class="vT-damage p"></div>
   <div id="vTDmgEnemy" class="vT-damage e"></div>

   <div class="v6259-hud player">
     <div class="vT-hpline"><b>${esc(playerName())}</b><span id="vTPlayerHp">${fmt(r.hp)} / ${fmt(r.maxHp)}</span></div>
     <div id="vTPlayerBar" class="vT-bar"><i style="width:${r.hp/r.maxHp*100}%"></i></div>
   </div>
   <div class="v6259-hud enemy">
     <div class="vT-hpline"><b>${esc(e.name)}</b><span id="vTEnemyHp">${fmt(c.enemyHp)} / ${fmt(c.enemyMax)}</span></div>
     <div id="vTEnemyBar" class="vT-bar enemy"><i style="width:${c.enemyHp/c.enemyMax*100}%"></i></div>
   </div>
 </div>
 <div id="vTBattleLog" class="v6259-battle-log vT-log">${esc(c.log.slice(-2).join(' '))}</div>`;
}
function rewardView(r){
 const x=r.lastReward||{};
 return `${v6259Head(r,'Kampf gewonnen')}
 <div class="v6259-result"><div class="v6259-result-icon">🏆</div><h2>SIEG · ETAGE ${r.cleared}</h2>
 <div class="v6259-result-grid"><div><small>Gold</small><b>+${fmt(x.gold||0)}</b></div><div><small>XP</small><b>+${fmt(x.xp||0)}</b></div><div><small>Score</small><b>+${fmt(x.score||0)}</b></div></div>
 ${x.tokens?`<p>🍃 +${fmt(x.tokens)} Turmblätter ungesichert</p>`:''}
 <div class="v7308-activity-reward" data-v7308-kind="tower">
   <div class="v7308-weekly-line pending">⭐ Wochen-Truhen-EP werden geprüft …</div>
   <div class="v7308-guild-line tower-zero">🏰 Gilden-EP · im Turm aktuell keine Vergabe</div>
 </div>
 <button class="vT-btn primary v6259-main-btn" data-vt-next>Weiter zu Etage ${r.floor}</button></div>`;
}
function mutationView(r){
 let opts=(r.mutationChoices||[]).map(id=>MUTATIONS.find(x=>x.id===id)).filter(Boolean);
 if(!opts.length){const pool=MUTATIONS.filter(m=>!(r.buffs||[]).includes(m.id));if(pool.length){prepareMutation(r);opts=(r.mutationChoices||[]).map(id=>MUTATIONS.find(x=>x.id===id)).filter(Boolean)}else{r.geneticsComplete=true;r.mode='route';return routeView(r)}}
 return `${v6259Head(r,'Labor · Wähle eine Mutation')}
 ${v6259RunLine(r)}
 <div class="v6259-lab-scene"><div class="v6259-lab-art"></div></div>
 <div class="v6259-mutation-grid">${opts.map((m,i)=>`<div class="v6259-mut ${m.tone||''}"><div class="v6259-mut-icon">${m.icon}</div><h4>${esc(m.name)}</h4><p>${esc(m.desc)}</p><button class="vT-btn primary" data-vt-mut="${m.id}">Auswählen</button></div>`).join('')}</div>
 ${r.mutationRerolls>0?`<button class="vT-btn v6259-reroll" data-vt-reroll>🔄 Neu würfeln · ${r.mutationRerolls} übrig</button>`:''}
 <div class="v6259-note">Die Mutation gilt nur für diesen Turm-Run.</div>`;
}
function checkpointView(r){
 const u=r.unbanked;
 return `${v6259Head(r,'BOSS-CHECKPOINT')}
 <div class="v6259-result checkpoint"><div class="v6259-result-icon">🏆</div><h2>BOSS BESIEGT · ETAGE ${r.cleared}</h2>
 <p>Jetzt kommt die Entscheidung: Alles sichern und den Lauf beenden – oder mit der kompletten ungesicherten Beute weiter nach oben.</p>
 <div class="v6259-result-grid"><div><small>UNGESICHERTES GOLD</small><b>${fmt(u.gold)}</b></div><div><small>UNGESICHERTE XP</small><b>${fmt(u.xp)}</b></div><div><small>TURMBLÄTTER</small><b>${fmt(u.tokens)}</b></div></div>
 <div class="v6259-check-actions"><button class="vT-btn gold" data-vt-bank>🔐 Beute sichern & Lauf beenden</button><button class="vT-btn danger" data-vt-continue>🔥 Weiter zu Etage ${r.floor}</button></div></div>`;
}
function growView(r){
 return `${v6259Head(r,'Grow-Etage · Eine Entscheidung')}
 ${v6259RunLine(r)}
 <div class="v6260-grow-scene"><div class="v6260-grow-art"></div><div class="v6260-scene-tag">🌿 GROW-ETAGE</div><div class="v6260-grow-copy">Ein überwucherter Zuchtraum liegt vor dir. Du kannst nur eine Aktion wählen.</div></div>
 <div class="v6259-shop-list v6260-grow-actions">
  <div><i>💧</i><section><b>Nährlösung</b><span>Heilt etwa 28 % deines maximalen Turm-Lebens.</span></section><button class="vT-btn primary" data-vt-grow="heal">Heilen</button></div>
  <div><i>🍃</i><section><b>Blätter ernten</b><span>Direkte Turmblätter für den Aufstieg.</span></section><button class="vT-btn" data-vt-grow="leaves">Ernten</button></div>
  <div><i>📦</i><section><b>Erntekiste</b><span>Mehr ungesichertes Gold für diesen Run.</span></section><button class="vT-btn gold" data-vt-grow="gold">Kiste nehmen</button></div>
 </div>`;
}
function labView(r){
 const buffs=Array.isArray(r.buffs)?r.buffs:[],atCap=buffs.length>=6,rootsOwned=buffs.includes('roots'),hasMutation=MUTATIONS.some(x=>!buffs.includes(x.id)),
 hpPct=Math.round((r.hp/r.maxHp)*100),healMul=Math.max(.1,1+(tMeta('heal')*.06)+buffFx(r,'healBoost')-buffFx(r,'healPenalty')+(seasonRule().heal||0)),
 healPreview=Math.max(0,Math.min(r.maxHp-r.hp,Math.round(r.maxHp*.20*healMul))),healOff=r.hp>=r.maxHp,rootOff=rootsOwned||atCap,mutOff=atCap||!hasMutation;
 return `${v6259Head(r,'Labor · Wähle einen Eingriff')}
 ${v6259RunLine(r)}
 <div class="v6259-lab-scene"><div class="v6259-lab-art"></div></div>
 <div class="v6259-mutation-grid lab">
  <div class="v6259-mut"><div class="v6259-mut-icon">💉</div><h4>Stabilisator</h4><p>${healOff?'Leben bereits voll':`+${fmt(healPreview)} HP`}</p><button class="vT-btn primary" data-vt-lab="heal" ${healOff?'disabled':''}>${healOff?'Nicht nötig':'Auswählen'}</button></div>
  <div class="v6259-mut"><div class="v6259-mut-icon">🌱</div><h4>Wurzelinjektion</h4><p>${rootsOwned?'Bereits aktiv':atCap?'Mutationslimit erreicht':'+6 % max. HP · +10 % Heilung'}</p><button class="vT-btn" data-vt-lab="boost" ${rootOff?'disabled':''}>${rootOff?'Nicht verfügbar':'Auswählen'}</button></div>
  <div class="v6259-mut"><div class="v6259-mut-icon">🧬</div><h4>Genetik öffnen</h4><p>${atCap?'Mutationslimit erreicht':!hasMutation?'Keine Genetik übrig':'1 aus 3 Mutationen wählen'}</p><button class="vT-btn gold" data-vt-lab="mut" ${mutOff?'disabled':''}>${mutOff?'Nicht verfügbar':'Auswählen'}</button></div>
 </div>
 <div class="v6259-note">Der Laborraum zählt als Spezialetage. Danach wartet wieder ein Pflichtkampf.</div>`;
}
function merchantView(r){
 const p=towerMerchantPrices(r),buffs=Array.isArray(r.buffs)?r.buffs:[],
 dieselOwned=buffs.includes('diesel'),insuranceOwned=buffs.includes('insurance'),
 damageOff=!!r.shopFlags.damage||dieselOwned,insuranceOff=!!r.shopFlags.insurance||insuranceOwned,
 soldOut=!!(r.shopFlags.heal&&damageOff&&insuranceOff);
 if(soldOut)return `${v6259Head(r,'Händler · Der Schwarzmarkt')}<div class="v6259-result"><div class="v6259-result-icon">💰</div><h2>Schwarzmarkt leergekauft</h2><p>Du hast in diesem Run bereits alle nutzbaren Angebote gekauft oder besitzt deren Mutation schon.</p><button class="vT-btn primary" data-vt-shop-leave>Weiter</button></div>`;
 return `${v6259Head(r,'Händler · Der Schwarzmarkt')}
 <div class="v6259-wallet">💰 ${fmt(r.unbanked.gold)} ungesichertes Gold</div>
 <div class="v6259-merchant-scene"><div class="v6259-merchant-art"></div></div>
 <div class="v6259-shop-list">
  <div><i>🧪</i><section><b>Regenerationsmix</b><span>Heilt 30 % Turm-Leben.</span></section><button class="vT-btn primary" data-vt-buy="heal" ${r.shopFlags.heal?'disabled':''}>${r.shopFlags.heal?'Gekauft':`${fmt(p.heal)} 💰`}</button></div>
  <div><i>🧬</i><section><b>Sour-Diesel-Antrieb</b><span>Mehr Schaden und Ausweichen.</span></section><button class="vT-btn gold" data-vt-buy="damage" ${damageOff?'disabled':''}>${r.shopFlags.damage?'Gekauft':dieselOwned?'Mutation aktiv':`${fmt(p.damage)} 💰`}</button></div>
  <div><i>🔐</i><section><b>Beuteversicherung</b><span>Reduziert Verlust bei Niederlage.</span></section><button class="vT-btn" data-vt-buy="insurance" ${insuranceOff?'disabled':''}>${r.shopFlags.insurance?'Gekauft':insuranceOwned?'Mutation aktiv':`${fmt(p.insurance)} 💰`}</button></div>
 </div>
 <button class="vT-btn primary v6259-main-btn" data-vt-shop-leave>Etage verlassen</button>`;
}
function mysteryView(r){
 return `${v6259Head(r,'Unbekannter Raum')}
 ${v6259RunLine(r)}
 <div class="v6269-mystery-scene"><div class="v6269-mystery-glow">?</div><div class="v6269-scene-tag">❓ UNBEKANNTER RAUM</div></div>
 <div class="v6259-result v6269-story-result"><div class="v6259-result-icon">❓</div><h2>${esc(r.event?.title||'Unbekannte Etage')}</h2><p>${esc(r.event?.text||'')} <b>${esc(r.event?.result||'')}</b></p><button class="vT-btn primary" data-vt-event-next>Weiter</button></div>`;
}
function secretView(r){
 const buffs=Array.isArray(r.buffs)?r.buffs:[],genesOff=buffs.length>=6||!MUTATIONS.some(x=>!buffs.includes(x.id));
 return `${v6259Head(r,'Versiegelter Growraum')}
 ${v6259RunLine(r)}
 <div class="v6269-secret-scene"><div class="v6260-grow-art"></div><div class="v6269-scene-tag">🔐 VERBOTENER GROWROOM</div><div class="v6269-secret-copy">Ein versiegelter Raum voller illegaler Genetik. Du darfst genau eine Entscheidung treffen.</div></div>
 <div class="v6259-shop-list v6269-secret-actions">
  <div><i>🌿</i><section><b>Ernte stehlen</b><span>58 % Chance auf viel Gold + Blätter. Sonst 24 % Leben verlieren – das kann den Run beenden.</span></section><button class="vT-btn danger" data-vt-secret="steal">Riskieren</button></div>
  <div><i>🧬</i><section><b>Genetik klauen</b><span>${genesOff?'Mutationslimit erreicht.':'Eine zufällige noch nicht vorhandene Mutation.'}</span></section><button class="vT-btn gold" data-vt-secret="genes" ${genesOff?'disabled':''}>${genesOff?'Nicht verfügbar':'Nehmen'}</button></div>
  <div><i>💚</i><section><b>Ruhiger Raum</b><span>38 % heilen und sichere Turmblätter mitnehmen.</span></section><button class="vT-btn primary" data-vt-secret="rest">Ausruhen</button></div>
 </div>`;
}
function rankView(){
 const z=ensure().season,ev=towerWednesdayEvent(),target=ev.active?ev:lastCompletedWednesdayEvent();
 return `${v6259Head(null,'Rangliste',false)}
 <div class="v6259-panel v6276-wed-rank-panel"><h3>${ev.active?`${ev.icon} Mittwochs-Rangliste · ${esc(ev.name)}`:`🏁 Finale Mittwochs-Rangliste · ${esc(target.name)}`}</h3><p>${ev.active?'Nur heutige Event-Werte · Belohnungen werden nach 23:59 Uhr nach Platz vergeben.':`Abgeschlossen am ${esc(target.key)} · Platzierungsbelohnung kann jetzt abgeholt werden.`}</p><div id="vTWednesdayRanking" class="vT-leader"><div class="vT-empty">Mittwochs-Rangliste wird geladen …</div></div><div id="vTWednesdayReward"><div class="vT-empty">Platzierungsbelohnung wird geprüft …</div></div>${wednesdayRewardTable()}</div>
 <div class="v6259-panel"><h3>🏆 Saison-Rangliste</h3><div class="v6259-result-grid"><div><small>Beste Etage</small><b>${z.bestFloor}</b></div><div><small>Bestscore</small><b>${fmt(z.bestScore)}</b></div><div><small>Boss-Siege</small><b>${z.bossKills}</b></div></div><div id="vTRanking" class="vT-leader"><div class="vT-empty">Rangliste wird geladen …</div></div></div>`;
}
function metaView(){
 const t=ensure(),tokens=Math.max(0,Number(t.meta.tokens)||0);
 const cards=Object.entries(UPGRADES).map(([k,u])=>{
   const lv=Math.max(0,Number(t.meta.upgrades[k])||0),maxed=lv>=u.max,cost=maxed?0:towerUpgradeCost(k,lv);
   const current=u.effect*lv,next=u.effect*Math.min(u.max,lv+1),canBuy=!maxed&&tokens>=cost;
   const currentText=k==='mutation'?`${current} Neuwurf${current===1?'':'s'}`:`+${current} ${u.effectUnit}`;
   const nextText=maxed?'Maximum erreicht':(k==='mutation'?`${next} Neuwürfe pro Lauf`:`+${next} ${u.effectUnit}`);
   return `<article class="v6273-upgrade ${maxed?'maxed':''} ${canBuy?'affordable':'locked'}">
     <div class="v6273-upgrade-top">
       <div class="v6273-upgrade-icon">${u.icon}</div>
       <div class="v6273-upgrade-title"><small>DAUERHAFTER BONUS</small><h4>${esc(u.name)}</h4><p>${esc(u.desc)}</p></div>
       <div class="v6273-rank"><small>RANG</small><b>${lv}<i>/ ${u.max}</i></b></div>
     </div>
     <div class="v6273-upgrade-progress">
       ${Array.from({length:u.max},(_,i)=>`<i class="${i<lv?'on':''}"></i>`).join('')}
     </div>
     <div class="v6273-upgrade-effect">
       <div><small>AKTUELL</small><b>${esc(currentText)}</b></div>
       <span>→</span>
       <div><small>${maxed?'STATUS':'NÄCHSTER RANG'}</small><b>${esc(nextText)}</b></div>
     </div>
     <button class="vT-btn v6273-buy ${canBuy?'primary':''}" data-vt-up="${k}" ${maxed?'disabled':''}>
       ${maxed?`✓ MAXIMAL AUSGEBAUT`:`Rang ${lv+1} freischalten <strong>${fmt(cost)} 🍃</strong>`}
     </button>
   </article>`;
 }).join('');
 return `${v6259Head(null,'Dauerhafter Turm-Aufstieg',false)}
 <section class="v6273-meta-hero">
   <div class="v6273-meta-copy"><small>PERMANENTE TURM-BONI</small><h2>🍃 Turm-Aufstieg</h2><p>Verbessere deinen Anbauturm dauerhaft. Jeder Rang gilt für alle zukünftigen Runs.</p></div>
   <div class="v6273-stock">
     <span>🍃</span>
     <div><small>DEIN BESTAND</small><strong>${fmt(tokens)}</strong><b>Turmblätter</b></div>
   </div>
 </section>
 <div class="v6273-economy-note">Upgrades werden mit jedem Rang deutlich teurer. Turmblätter bleiben damit eine langfristige Run-Ressource.</div>
 <div class="v6273-upgrade-list">${cards}</div>`;
}
function v6347Duration(ms){const sec=Math.max(0,Math.floor((Number(ms)||0)/1000)),m=Math.floor(sec/60),s=sec%60,h=Math.floor(m/60);return h?`${h}h ${String(m%60).padStart(2,'0')}m`:`${m}m ${String(s).padStart(2,'0')}s`}
function resultView(){
 const x=ensure().lastResult;if(!x)return lobby();
 const cleared=Math.max(0,Number(x.floor)||0),st=x.stats&&typeof x.stats==='object'?x.stats:{};
 const headline=cleared>0?`Du hast Etage ${cleared} erreicht!`:'Keine Etage abgeschlossen';
 const sub=cleared>0?'Dein Charakter wurde als Turm-Build ausgewertet.':'Der Run wurde beendet, bevor Etage 1 abgeschlossen war.';
 const muts=(Array.isArray(x.buffs)?x.buffs:[]).map(id=>MUTATIONS.find(m=>m.id===id)).filter(Boolean);
 const record=x.newFloorRecord||x.newScoreRecord;
 return `${v6259Head(null,'Run abgeschlossen',false)}
 <div class="v6260-result-scene"><div class="v6260-result-art"></div></div>
 <div class="v6259-result v6260-result-box v6347-result-box">
   ${record?`<div class="v6347-record">🏆 NEUER PERSÖNLICHER REKORD${x.newFloorRecord?` · Etage ${fmt(x.previousBestFloor||0)} → ${fmt(cleared)}`:''}${x.newScoreRecord?` · Score ${fmt(x.previousBestScore||0)} → ${fmt(x.score)}`:''}</div>`:''}
   <h2>${headline}</h2>
   <p class="v6266-result-sub">${sub}</p>
   <div class="v6260-reward-row">
    <div><i>🏆</i><small>Score</small><b>${fmt(x.score)}</b></div>
    <div><i>🍃</i><small>Turmblätter</small><b>+${fmt(x.tokens)}</b></div>
    <div><i>XP</i><small>Erfahrung</small><b>+${fmt(x.xp)}</b></div>
    <div><i>🪙</i><small>Gold</small><b>+${fmt(x.gold)}</b></div>
   </div>
   <div class="v6347-performance">
     <div><small>⚔️ Kämpfe</small><b>${fmt(st.fights||0)}</b></div>
     <div><small>💥 Gesamtschaden</small><b>${fmt(st.damage||0)}</b></div>
     <div><small>🔥 Stärkster Treffer</small><b>${fmt(st.maxHit||0)}</b></div>
     <div><small>🩸 Schaden erhalten</small><b>${fmt(st.damageTaken||0)}</b></div>
     <div><small>💚 Heilung/Lebensraub</small><b>${fmt(st.healing||0)}</b></div>
     <div><small>🎯 Krits · Ausweichen</small><b>${fmt(st.crits||0)} · ${fmt(st.dodges||0)}</b></div>
     <div><small>☠️ Elite besiegt</small><b>${fmt(x.eliteKills||0)}</b></div>
     <div><small>👑 Bosse besiegt</small><b>${fmt(x.bossKills||0)}</b></div>
     <div><small>⏱️ Laufzeit</small><b>${v6347Duration(x.duration)}</b></div>
     <div><small>🎁 Items erhalten</small><b>${fmt(x.items||0)}</b></div>
   </div>
   <div class="v6347-final-build">
     <b>🧬 Finaler Mutations-Build · ${muts.length}/6</b>
     <div>${muts.length?muts.map(m=>`<span>${m.icon} ${esc(m.name)}</span>`).join(''):'<span>Keine Mutation aktiv</span>'}</div>
   </div>
   ${recoveryPanel()}
 </div>`;
}
function v6260TowerChrome(on){
 /* V6.271: Tower is a normal app page again. The old V6.260 fullscreen mode
    hid the global HUD/topbar and could leave it hidden after returning. */
 document.body?.classList.remove('v6260-tower-fullscreen');
 const restoreSelectors=[
   '#v372TopbarShell','.app > header','#v371TopbarShell','.v366-topbar',
   '.v358-global-header','.v358-subbar','.v351-topbar','.bottom'
 ];
 restoreSelectors.forEach(sel=>document.querySelectorAll(sel).forEach(el=>{
   try{
     el.style.removeProperty('display');
     el.style.removeProperty('visibility');
     delete el.dataset.v6262PrevDisplay;
     delete el.dataset.v6262PrevVisibility;
   }catch(_){ }
 }));
}

function render(){
 normalizeTowerMutationCap();
 const root=document.getElementById('tower');if(!root)return;
 const towerVisible=root.classList.contains('active');

 if(!towerVisible){
   try{v6260TowerChrome(false)}catch(_){}
   document.body?.classList.remove('v6259-tower-focus');
   document.body?.classList.remove('v6260-tower-fullscreen');
   return;
 }

 try{
   const t=ensure(),r=t.run;let html;
   const flowGuard=window.__V8009_TOWER_ROUTE_GUARD__;
   if(flowGuard?.routeBusy){
     const mode=String(r?.mode||'');
     const hasBattle=!!root.querySelector('.vT-battle-stage,.v6259-battle-stage,[data-vt-battle]');
     if(mode==='battle'){
       if(!flowGuard.battleSeen){
         flowGuard.battleSeen=true;
         try{flowGuard.battleShownAt=performance.now()}catch(_){flowGuard.battleShownAt=Date.now()}
       }
     }else if(flowGuard.battleSeen&&hasBattle){
       flowGuard.suppressedRenders=(Number(flowGuard.suppressedRenders)||0)+1;
       return false;
     }
   }
   if(towerTab==='rank')html=rankView();
   else if(towerTab==='meta')html=metaView();
   else if(towerTab==='result'&&!r)html=resultView();
   else if(!r?.active)html=lobby();
   else if(r.mode==='route'){v7191PreloadTowerRoute(r);html=routeView(r);}
   else if(r.mode==='doorTransition')html=doorTransitionView(r);
   else if(r.mode==='prep')html=prepView(r);
   else if(r.mode==='battle')html=battleView(r);
   else if(r.mode==='reward')html=rewardView(r);
   else if(r.mode==='mutation')html=mutationView(r);
   else if(r.mode==='checkpoint')html=checkpointView(r);
   else if(r.mode==='growEvent')html=growView(r);
   else if(r.mode==='lab')html=labView(r);
   else if(r.mode==='merchant')html=merchantView(r);
   else if(r.mode==='mysteryResult')html=mysteryView(r);
   else if(r.mode==='secret')html=secretView(r);
   else html=routeView(r);

   root.innerHTML=`<div class="vT-wrap">${html}</div>`;
   bind();
   if(flowGuard?.routeBusy&&r?.mode==='battle'&&!flowGuard.arenaWarmQueued){
     flowGuard.arenaWarmQueued=true;
     requestAnimationFrame(()=>{
       try{
         if(!root.querySelector('.vT-battle-stage,.v6259-battle-stage,[data-vt-battle]'))return;
         window.v7175CombatArenaRefresh?.();
         root.querySelectorAll('.vT-battle-stage img').forEach(img=>{try{img.decode?.().catch(()=>{})}catch(_){}});
         flowGuard.arenaPrewarms=(Number(flowGuard.arenaPrewarms)||0)+1;
       }catch(_){}
     });
   }
   if(r?.mode==='reward')queueMicrotask(()=>{try{window.v7308PrepareReward?.('tower')}catch(_){} });
   if(r?.mode==='route')v7191PreloadTowerRoute(r);

   /* V8.009-T10F: this 720 ms timer belongs to the old local Tower path.
      Server-authoritative Tower already owns door -> fight -> replay. Never let
      the legacy timer submit/start a second client fight in authority mode. */
   const authorityTower=!!window.v7081UseAuthority?.('tower');
   if(r?.mode==='doorTransition'&&!authorityTower&&!root.dataset.v6281TransitionLock){
     const nonce=String(r.transitionNonce||'');
     root.dataset.v6281TransitionLock=nonce;
     setTimeout(()=>{
       const rt=ensure().run;
       if(rt?.active&&rt.mode==='doorTransition'&&String(rt.transitionNonce||'')===nonce){
         startFight(0);
       }
       if(root.dataset.v6281TransitionLock===nonce)delete root.dataset.v6281TransitionLock;
     },720);
   }else if(r?.mode!=='doorTransition'||authorityTower){
     delete root.dataset.v6281TransitionLock;
   }

   const legal=document.getElementById('v337LegalFooter');
   if(legal&&legal.parentElement===root.parentElement&&root.nextElementSibling!==legal){
     root.insertAdjacentElement('afterend',legal);
   }

   /* Only enter tower fullscreen AFTER the tower UI rendered successfully. */
   v6260TowerChrome(true);
   document.body?.classList.add('v6259-tower-focus');

   /* V8.009-T10D: keep first-playable/Tower combat smooth.
      Ranking/profile work is useful in the lobby, but it must not start on the
      same frames as login restore or an immediately-started Tower run. */
   if(towerTab==='rank'){
     queueMicrotask(()=>{
       void loadRanking();
       if(document.getElementById('vTWednesdayRanking'))void loadWednesdayRanking();
       if(document.getElementById('vTWednesdayReward'))void loadWednesdayPlacementReward();
     });
   }else if(!r?.active&&towerTab==='run'&&!root.dataset.v8009LobbyWarmupQueued){
     root.dataset.v8009LobbyWarmupQueued='1';
     const stillIdleLobby=()=> {
       const liveRoot=document.getElementById('tower');
       return !!liveRoot?.classList.contains('active') && towerTab==='run' && !ensure().run?.active;
     };
     const idle=(fn,delay)=>{
       const fire=()=>{if(stillIdleLobby())try{fn()}catch(_){}};
       if(typeof requestIdleCallback==='function'){
         try{return requestIdleCallback(fire,{timeout:Math.max(1200,delay+900)})}catch(_){}
       }
       return setTimeout(fire,delay);
     };
     idle(loadRanking,1800);
     if(document.getElementById('vTWednesdayRanking'))idle(loadWednesdayRanking,2150);
     if(document.getElementById('vTWednesdayReward'))idle(loadWednesdayPlacementReward,2500);
     setTimeout(()=>{try{delete root.dataset.v8009LobbyWarmupQueued}catch(_){}},3200);
   }
   if(r?.mode==='battle'&&!window.v7081UseAuthority?.('tower')&&!r?.v7085ServerReplay)setTimeout(resumeCombat,120);
   else scheduleTowerRecoveryRender();
 }catch(e){
   console.error('V6.262 tower render failed',e);
   try{v6260TowerChrome(false)}catch(_){}
   document.body?.classList.remove('v6259-tower-focus');
   document.body?.classList.remove('v6260-tower-fullscreen');

   root.innerHTML=`<div style="max-width:520px;margin:18px auto;padding:18px;border:1px solid #70552b;border-radius:14px;background:#071009;color:#dfe8dc;text-align:center">
     <h2 style="margin:0 0 8px;color:#efd17d">Anbau-Turm konnte nicht geladen werden</h2>
     <p style="font-size:12px;color:#9cab9b">Der Turm wurde sicher abgebrochen, damit die restliche App bedienbar bleibt.</p>
     <button class="btn" id="v6262TowerBack" style="margin-top:8px">Zur Startseite</button>
   </div>`;
   document.getElementById('v6262TowerBack')?.addEventListener('click',()=>typeof v032Go==='function'&&v032Go('world'));
 }
}
function bind(){const root=document.getElementById('tower');if(!root)return;root.querySelectorAll('[data-vt-guide]').forEach(b=>b.onclick=v6279OpenGuide);v8009LobbyController.bindLobby(root);const authorityTower=!!window.v7081UseAuthority?.('tower');root.querySelectorAll('[data-vt-route]').forEach(b=>b.onclick=authorityTower?null:()=>chooseRoute(Number(b.dataset.vtRoute)));root.querySelectorAll('[data-vt-fight]').forEach(b=>b.onclick=authorityTower?null:()=>startFight(Number(b.dataset.vtFight)));root.querySelectorAll('[data-vt-mut]').forEach(b=>b.onclick=()=>selectMutation(b.dataset.vtMut));root.querySelector('[data-vt-reroll]')?.addEventListener('click',rerollMutation);root.querySelector('[data-vt-next]')?.addEventListener('click',nextAfterReward);root.querySelector('[data-vt-bank]')?.addEventListener('click',bankAndFinish);root.querySelector('[data-vt-continue]')?.addEventListener('click',checkpointContinue);root.querySelectorAll('[data-vt-grow]').forEach(b=>b.onclick=()=>growOption(b.dataset.vtGrow));root.querySelectorAll('[data-vt-lab]').forEach(b=>b.onclick=()=>labOption(b.dataset.vtLab));root.querySelectorAll('[data-vt-buy]').forEach(b=>b.onclick=()=>merchantBuy(b.dataset.vtBuy));root.querySelector('[data-vt-shop-leave]')?.addEventListener('click',leaveMerchant);root.querySelector('[data-vt-event-next]')?.addEventListener('click',()=>completeNonCombat(false));root.querySelectorAll('[data-vt-secret]').forEach(b=>b.onclick=()=>secretOption(b.dataset.vtSecret));root.querySelectorAll('[data-vt-up]').forEach(b=>b.onclick=()=>buyUpgrade(b.dataset.vtUp));root.querySelectorAll('[data-vt-wed-claim]').forEach(b=>b.onclick=()=>claimWednesdayTask(b.dataset.vtWedClaim));root.querySelectorAll('[data-vt-wed-place-claim]').forEach(b=>b.onclick=()=>void claimWednesdayPlacement());root.querySelector('[data-vt-abort]')?.addEventListener('click',confirmAbort);root.querySelectorAll('[data-vt-exit]').forEach(b=>b.onclick=()=>{
 if((towerTab==='result'||towerTab==='meta'||towerTab==='rank')&&!ensure().run?.active){
   const t=ensure();
   if(towerTab==='result')t.lastResult=null;
   towerTab='run';save(false);render();return;
 }
 v6260TowerChrome(false);document.body?.classList.remove('v6259-tower-focus');typeof v032Go==='function'&&v032Go('world')
})}
function installSection(){if(document.getElementById('tower'))return;const sec=document.createElement('section');sec.id='tower';sec.className='screen';const host=document.querySelector('main')||document.querySelector('.content')||document.body;host.appendChild(sec);const legal=document.getElementById('v337LegalFooter');if(legal&&legal.parentElement===host)host.appendChild(legal)}
function installNav(){
 try{
  if(!window.__vTowerGo){
   window.addEventListener('growlegends:navigation-open-v7119',e=>{
    const id=String(e?.detail?.id||'');
    if(id!=='tower'&&ensure().run?.mode==='battle')battleToken++;
    if(id!=='tower'&&towerTab==='result'&&!ensure().run?.active){
      const t=ensure();t.lastResult=null;towerTab='run';save(false);
    }
    const towerVisible=id==='tower'&&!!document.getElementById('tower')?.classList.contains('active');
    v6260TowerChrome(towerVisible);
    document.body?.classList.toggle('v6259-tower-focus',towerVisible);
    if(towerVisible){
      towerTab=ensure().run?.active?'run':(towerTab==='result'?'result':'run');
      try{render()}catch(err){console.error('V6.261 tower render',err);v6260TowerChrome(false)}
    }
   },{passive:true});
   window.__vTowerGo=true;
  }
 }catch(e){}
 const add=()=>{const p=document.getElementById('v032MenuPanel');if(!p||p.querySelector('[data-screen="tower"]'))return;const d=p.querySelector('[data-screen="dungeon"]'),b=document.createElement('button');b.type='button';b.className='top-menu-item';b.dataset.screen='tower';b.innerHTML='<span>🗼</span>Anbauturm';b.onclick=e=>{e.preventDefault();e.stopPropagation();typeof v032Go==='function'&&v032Go('tower')};if(d?.nextSibling)p.insertBefore(b,d.nextSibling);else p.appendChild(b)};add();document.addEventListener('click',e=>{if(e.target?.closest?.('#v032MenuBtn,#v032MenuToggle'))requestAnimationFrame(add)},true);window.addEventListener('growlegends:account-ready',add);window.addEventListener('pageshow',add,{passive:true});window.vTowerEnsureMenu=add
}
function wrapProfile(){try{if(typeof v073ProfilePayload==='function'&&!window.__vTowerProfilePayload){const base=v073ProfilePayload;v073ProfilePayload=function(){const p=base.apply(this,arguments)||{};p.dungeon_progress=(p.dungeon_progress&&typeof p.dungeon_progress==='object')?{...p.dungeon_progress}:{};p.dungeon_progress.tower=towerMirror();return p};try{window.v073ProfilePayload=v073ProfilePayload}catch(e){}window.__vTowerProfilePayload=true}}catch(e){}
 try{if(typeof v649SyncDungeonProgress==='function'&&!window.__vTowerDungeonSync){const base=window.v649SyncDungeonProgress;window.v649SyncDungeonProgress=async function(){const out=await base.apply(this,arguments);await syncProfile(true);return out};window.__vTowerDungeonSync=true}}catch(e){}
}
installSection();ensure();installNav();wrapProfile();
window.v6272TowerResultToLobby=()=>{
 try{
  const t=ensure();
  if(towerTab==='result'&&!t.run?.active){
   t.lastResult=null;
   towerTab='run';
   save(false);
   render();
   return true;
  }
 }catch(e){console.error('V6.272 result->lobby',e)}
 return false;
};
window.v6274TowerBackToLobby=()=>{
 try{
  const t=ensure();
  if(towerTab==='run')return false;
  if(towerTab==='result')t.lastResult=null;
  towerTab='run';
  save(false);
  render();
  return true;
 }catch(e){
  console.error('V6.274 tower back->lobby',e);
  return false;
 }
};
/* V7.111: authority bridges live outside this closure and therefore must never
   write the lexical towerTab directly. This is the single public transition
   into the historic V6.272/V6.347 one-shot Run-End/Schatzmeister screen. */
window.vTowerShowResult=(result)=>{
 try{
  const t=ensure();
  const x=result&&typeof result==='object'?deep(result):(t.lastResult?deep(t.lastResult):null);
  if(!x)return false;
  t.lastResult=x;
  t.run=null;
  towerTab='result';
  save(false);
  render();
  return !!document.querySelector('#tower .v6260-result-box');
 }catch(e){
  console.error('[V7.111] tower result transition',e);
  return false;
 }
};
window.v7111TowerResultDiagnostics=()=>{
 const t=ensure();
 return {version:'V7.111',tab:towerTab,hasResult:!!t.lastResult,runActive:!!t.run?.active,resultVisible:!!document.querySelector('#tower .v6260-result-box'),resultSceneVisible:!!document.querySelector('#tower .v6260-result-scene')};
};
window.vTowerRender=render;window.vTowerSync=syncProfile;window.vTowerWednesdayEventInfo=()=>deep(towerWednesdayEvent());window.v6237WednesdayTowerDiagnostics=()=>{const ev=towerWednesdayEvent(),w=wednesdayState();return{event:ev,state:deep(w),tasks:WED_TASKS.map(t=>({id:t.id,value:wednesdayTaskValue(w,t),target:t.target,claimed:!!w.claimed?.[t.id]})),mirror:towerMirror(),serverLedger:{version:'V7.054',lastSignature:v7054WednesdaySubmitSignature,lastSubmitAt:v7054WednesdaySubmitAt}}};window.vTowerDiagnostics=()=>{const t=ensure(),r=t.run;return{season:t.season.id,bestFloor:t.season.bestFloor,bestScore:t.season.bestScore,tokens:t.meta.tokens,active:!!r?.active,floor:r?.floor||0,mode:r?.mode||'none',buffs:r?.buffs?.length||0,menu:!!document.querySelector('#v032MenuPanel [data-screen="tower"]'),screen:!!document.getElementById('tower'),recovery:towerRecoveryInfo().pct,wednesday:towerWednesdayEvent(),mirror:towerMirror()}};
window.v7054SubmitWednesdayResult=()=>v7054SubmitWednesdayResult(true);
window.addEventListener('growlegends:account-ready',()=>{
 ensure();wrapProfile();
 /* V8.009-T10D: the old code forced a profile write ~30 ms after account-ready
    and a Wednesday ledger submit ~550 ms later. On mobile those requests and
    their JSON/DOM follow-up competed with the first Tower combat. Defer this
    non-visual work until startup is quiet, and never start it mid-replay. */
 const backgroundSync=()=>{
  const busy=!!window.__V8009_TOWER_ROUTE_GUARD__?.routeBusy;
  const battle=String(ensure().run?.mode||'')==='battle';
  if(busy||battle){setTimeout(backgroundSync,900);return}
  scheduleSync(true);
  setTimeout(()=>{
   const busyNow=!!window.__V8009_TOWER_ROUTE_GUARD__?.routeBusy;
   const battleNow=String(ensure().run?.mode||'')==='battle';
   if(!busyNow&&!battleNow)void v7054SubmitWednesdayResult(true);
   else setTimeout(()=>void v7054SubmitWednesdayResult(true),1200);
  },900);
 };
 if(typeof window.v7204AfterStartupQuiet==='function')window.v7204AfterStartupQuiet(backgroundSync,1600);
 else setTimeout(backgroundSync,1800);
});
window.addEventListener('pageshow',()=>setTimeout(()=>void v7054SubmitWednesdayResult(true),950),{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>void v7054SubmitWednesdayResult(true),700)},{passive:true});
})();
