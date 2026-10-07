
(()=>{
'use strict';
if(window.__V7053_ATOMIC_PVP_CLIENT__)return;
window.__V7053_ATOMIC_PVP_CLIENT__=true;

const VERSION='V7.057';
const C={busy:false,recovering:false,lastError:'',lastAttackId:null,lastAck:null,lastRecovery:null,fightOwned:false,reportId:null};
const clone=v=>{try{return structuredClone(v)}catch(_){try{return JSON.parse(JSON.stringify(v))}catch(__){return v}}};
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const row=d=>Array.isArray(d)?(d[0]??null):d;
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const online=()=>{try{return !!db()&&typeof v073User!=='undefined'&&v073User?.id&&!v073User?.is_anonymous}catch(_){return false}};
const mode=()=>{try{return String(window.v7040AuthorityDiagnostics?.()?.domains?.pvp||'off')}catch(_){return'off'}};
const enforced=()=>mode()==='enforce';
const toast=(title,type='info',detail='')=>{try{return window.v063Toast?.(title,type,detail)}catch(_){try{return window.v115Alert?.(detail||title,title,type)}catch(__){}}};

function rpcTimeout(name,args={},ms=11000){
 const x=db();if(!x)return Promise.reject(new Error('SERVER_OFFLINE'));
 return Promise.race([
  x.rpc(name,args).then(({data,error})=>{if(error)throw error;return row(data)}),
  new Promise((_,rej)=>setTimeout(()=>rej(new Error('RPC_TIMEOUT:'+name)),ms))
 ]);
}
async function refreshModes(){try{await window.v7040AuthorityRefresh?.()}catch(_){}return mode()}
function requestId(){return (globalThis.crypto?.randomUUID?.()||(`p${Date.now()}_${Math.random().toString(36).slice(2)}`)).replace(/[^A-Za-z0-9_-]/g,'')}
function ensureShape(){
 s.v204Pvp=(s?.v204Pvp&&typeof s.v204Pvp==='object')?s.v204Pvp:{buds:0,wins:0,losses:0,fights:0,lastOpponent:null};
 s.v488Forge=(s?.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
 s.grow=(s?.grow&&typeof s.grow==='object')?s.grow:{};
 s.grow.seeds=(s.grow.seeds&&typeof s.grow.seeds==='object')?s.grow.seeds:{};
}
function applyBundle(b){
 if(!b||typeof b!=='object')return;
 ensureShape();
 if(Number.isFinite(Number(b.level)))s.level=Math.max(1,Number(b.level));
 if(Number.isFinite(Number(b.level_xp)))s.xp=Math.max(0,Number(b.level_xp));
 if(Number.isFinite(Number(b.gold_balance)))s.gold=Math.max(0,Number(b.gold_balance));
 if(Number.isFinite(Number(b.harz_balance)))s.harzTaler=Math.max(0,Number(b.harz_balance));
 if(Number.isFinite(Number(b.pvp_buds)))s.v204Pvp.buds=Math.max(0,Number(b.pvp_buds));
 if(Number.isFinite(Number(b.pvp_wins)))s.v204Pvp.wins=Math.max(0,Number(b.pvp_wins));
 if(Number.isFinite(Number(b.pvp_losses)))s.v204Pvp.losses=Math.max(0,Number(b.pvp_losses));
 if(Number.isFinite(Number(b.pvp_fights)))s.v204Pvp.fights=Math.max(0,Number(b.pvp_fights));
 if(Number.isFinite(Number(b.buds_awarded)))s.v204Pvp.lastBudReward=Math.max(0,Number(b.buds_awarded));
 if(Number.isFinite(Number(b.fragments_balance)))s.v488Forge.fragments=Math.max(0,Number(b.fragments_balance));
 if(b.grow_seeds&&typeof b.grow_seeds==='object')s.grow.seeds=clone(b.grow_seeds);
 const target=b?.replay?.defender?.id;if(target)s.v204Pvp.lastOpponent=String(target);
}
function markSideEffects(b){
 const id=String(b?.attack_id||'');if(!id)return;
 s.v7053PvpSideEffectsSeen=(s?.v7053PvpSideEffectsSeen&&typeof s.v7053PvpSideEffectsSeen==='object')?s.v7053PvpSideEffectsSeen:{};
 if(s.v7053PvpSideEffectsSeen[id])return;
 s.v7053PvpSideEffectsSeen[id]=Date.now();
 const keys=Object.keys(s.v7053PvpSideEffectsSeen);
 if(keys.length>80)keys.sort((a,b)=>num(s.v7053PvpSideEffectsSeen[a])-num(s.v7053PvpSideEffectsSeen[b])).slice(0,keys.length-80).forEach(k=>delete s.v7053PvpSideEffectsSeen[k]);
 s.v106Achievements=(s?.v106Achievements&&typeof s.v106Achievements==='object')?s.v106Achievements:{done:{},stats:{}};
 s.v106Achievements.stats=(s.v106Achievements.stats&&typeof s.v106Achievements.stats==='object')?s.v106Achievements.stats:{};
 s.v106Achievements.stats.pvpFights=Math.max(0,num(s.v106Achievements.stats.pvpFights))+1;
 if(b.won)s.v106Achievements.stats.pvpWins=Math.max(0,num(s.v106Achievements.stats.pvpWins))+1;
 try{v106CheckAchievements?.(false)}catch(_){}
}
function persistLocal(){
 try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
 try{persist(false)}catch(_){}
}
async function writeCloud(){
 if(typeof v075WriteCloudSave==='function'){
  return Promise.race([
   Promise.resolve(v075WriteCloudSave(false)),
   new Promise((_,rej)=>setTimeout(()=>rej(new Error('CLOUD_SAVE_TIMEOUT')),7500))
  ]);
 }
 try{v075ScheduleSave?.()}catch(_){}
}
function paintAll(){
 try{window.v069SyncCurrencies?.()}catch(_){}
 try{window.v441PaintResources?.()}catch(_){}
 try{window.v204RenderPage?.()}catch(_){try{v204RenderPage?.()}catch(__){}}
 try{window.v072RenderOwnProfile?.()}catch(_){}
 try{render?.()}catch(_){}
}
function setBattleBusy(v){C.busy=!!v;try{v204BattleBusy=!!v}catch(_){}try{window.v204BattleBusy=!!v}catch(_){}}
function setCooldown(seconds,{paint=true}={}){const ms=Math.max(0,Math.ceil(num(seconds))*1000);try{v204CooldownLeft=ms}catch(_){}try{window.v204CooldownLeft=ms}catch(_){}if(paint)try{v204RenderPage?.()}catch(_){}try{window.v4162PaintMenuAttentionLocal?.()}catch(_){}}

function enemyFromBundle(b,fallback=null){
 const d=b?.replay?.defender||{};
 return {
  ...(fallback||{}),
  id:String(d.id||fallback?.id||''),
  character_name:String(d.name||fallback?.character_name||'Gegner'),
  class_id:String(d.classId||fallback?.class_id||'grower'),
  class_name:String(d.className||fallback?.class_name||''),
  level:Math.max(1,num(d.level||fallback?.level)||1),
  combat_power:Math.max(1,num(d.power||fallback?.combat_power)||1)
 };
}
function clearFightUi(){
 try{window.v610PvpVisualReset?.()}catch(_){}
 const strip=document.querySelector('#v209PvpBattleOverlay .v610-pvp-procs');if(strip)strip.innerHTML='';
 const host=document.querySelector('#v209PvpBattleOverlay .v610-pvp-log-lines');if(host)host.innerHTML='';
}
function hp(bar,txt,value,max){
 const v=Math.max(0,Math.round(num(value))),m=Math.max(1,num(max));
 if(bar)bar.style.width=`${Math.max(0,Math.min(100,v/m*100))}%`;
 if(txt)txt.textContent=v;
}
function anim(el,cls){try{window.v209Anim?.(el,cls)}catch(_){try{el?.classList.remove(cls);void el?.offsetWidth;el?.classList.add(cls)}catch(__){}}}
function pop(el,text,crit=false){
 if(!el)return;el.classList.toggle('v620-crit',!!crit);
 try{window.v209Pop?.(el,text)}catch(_){el.textContent=text;el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop')}
 setTimeout(()=>el.classList.remove('v620-crit'),780);
}
function chip(label,kind='power',side='player'){
 const strip=document.querySelector('#v209PvpBattleOverlay .v610-pvp-procs');if(!strip||!label)return;
 const same=[...strip.querySelectorAll('.v7053-proc')].filter(x=>x.dataset.side===side).length;
 const el=document.createElement('span');el.className=`v610-pvp-chip v672-proc v7053-proc ${kind} v618-side-${side}`;el.dataset.side=side;el.textContent=label;el.style.setProperty('top',`${same*28}px`,'important');strip.appendChild(el);setTimeout(()=>el.remove(),1900);
}
function eventFx(e){
 const tags=Array.isArray(e?.tags)?e.tags.filter(Boolean).map(String):[];
 const comp=String(e?.companion||'').toLowerCase(),comp2=String(e?.second_companion||'').toLowerCase();
 const label=String(e?.label||tags.join(' + ')||'').toUpperCase(),actor=String(e?.actor||'');
 if(actor==='attacker'){
  if(e?.dodge)chip('💨 AUSGEWICHEN','dodge','enemy');
  if(e?.crit||/KRIT/.test(label))chip('💥 KRITISCHER TREFFER','crit','player');
  if(/WUCHT|RASEREI|ZUSATZTREFFER|BRUTALE ERNTE/.test(label))chip('⚔️ '+label,'power','player');
  if(/SALVE|SCHNELLFEUER|DRITTTREFFER|KETTENTREFFER|KOPFSCHUSS|PERFEKTER SCHUSS|GRÜNER HAGEL/.test(label))chip('🏹 '+label,'power','player');
  if(/FROST|KÄLTEMARKE|DOPPELREIF|EISBRUCH|NULLPUNKT|SEELENSCHNITT|NEBENHAND/.test(label))chip('❄️ '+label,'frost','player');
  if(/DETONATION|KETTENFUNKE|EXPLOSION|SUPERNOVA|TODESNEBEL|DOT|RAUCH/.test(label))chip('🔮 '+label,'magic','player');
  try{
    if(comp)window.v6287ShowSummon?.(comp,num(e?.companion_damage),false,{heal:comp==='bud'?num(e?.heal):0,crit:!!e?.companion_crit,note:e?.forced_summon?'GARANTIERTER RUF':''});
    if(comp2)setTimeout(()=>window.v6287ShowSummon?.(comp2,num(e?.second_damage),true,{note:'2. RUF'}),120);
  }catch(_){}
  if(/BONE/.test(label))chip('🦴 KNOCHENGEFÄHRTE','power','player');
  if(/BUD/.test(label))chip('🌿 BUD-GEFÄHRTE','heal','player');
  if(/SPORE/.test(label))chip('🍄 SPORENGEFÄHRTE','magic','player');
  if(/CROW|KRÄHE/.test(label))chip('🐦 KRÄHENGEFÄHRTE','magic','player');
  if(e?.forced_summon)chip('⭐ GARANTIERTER 5. RUF','power','player');
  if(/FLUCH|DOT|NEBEL/.test(label))chip('☠️ RAUCH-/FLUCHSCHADEN','magic','player');
  if(num(e?.heal)>0)chip(`💚 HEILUNG +${num(e.heal)} LP`,'heal','player');
 }else{
  if(e?.dodge)chip('💨 AUSGEWICHEN','dodge','player');
  if(e?.crit)chip('💥 KRITISCHER TREFFER','crit','enemy');
  if(num(e?.offhand)>0)chip('❄️ NEBENHAND','frost','enemy');
  if(/BARRIERE|BLOCK|SCHILD|REDUZIERT|UNKRAUT|EIS|RAUCH/.test(label))chip('🛡️ '+(label||'GEBLOCKT'),'guard','player');
  if(num(e?.heal)>0)chip(`💚 HEILUNG +${num(e.heal)} LP`,'heal','player');
  if(num(e?.counter)>0)chip(`↩️ KONTER ${num(e.counter)}`,'dodge','player');
 }
}
function renderRound(e){
 const round=Math.max(1,num(e?.round)||1),text=String(e?.text||'Kampfaktion');
 const host=document.querySelector('#v209PvpBattleOverlay .v610-pvp-log-lines');
 if(host){const r=document.createElement('div');r.className=`v610-pvp-line ${e?.crit?'crit':e?.dodge?'dodge':''}`;const b=document.createElement('b');b.textContent=`R${round}`;const span=document.createElement('span');span.textContent=text;r.append(b,span);host.prepend(r);while(host.children.length>4)host.lastElementChild?.remove()}
 const rc=document.querySelector('#v209PvpBattleOverlay .v610-pvp-round');if(rc)rc.textContent=`RUNDE ${round}`;
 const hidden=document.getElementById('v209BattleLog');if(hidden)hidden.textContent=text;
}
async function animateReplay(b,enemy){
 const replay=b?.replay||{},events=Array.isArray(replay.events)?replay.events:[];
 try{v209OpenBattle(enemy)}catch(e){try{window.v209OpenBattle?.(enemy)}catch(_){}}
 try{window.v610EnsurePvpVisual?.()}catch(_){}
 try{window.v7141CombatArenaRefresh?.()}catch(_){}
 clearFightUi();
 const v7103SummonTrack=window.v7103CompanionReplay?.begin?.('pvp')||null;
 const a=replay.attacker||{},d=replay.defender||{};
 const maxA=Math.max(1,num(a.maxHp)||1),maxD=Math.max(1,num(d.maxHp)||1);
 const pBar=document.getElementById('v209PlayerHpBar'),eBar=document.getElementById('v209EnemyHpBar');
 const pTxt=document.getElementById('v209PlayerHpText'),eTxt=document.getElementById('v209EnemyHpText');
 const pDmg=document.getElementById('v209DamagePlayer'),eDmg=document.getElementById('v209DamageEnemy');
 const pf=document.getElementById('v209PlayerFighter'),ef=document.getElementById('v209EnemyFighter');
 hp(pBar,pTxt,maxA,maxA);hp(eBar,eTxt,maxD,maxD);
 const cadence=window.v7269DungeonCadence?.(events.length)||{frameDelay:220,attackDelay:97,settleDelay:123,visualAttackMs:400,visualHitMs:400,visualPopMs:650,startDelayMs:90};
 const frameDelay=cadence.frameDelay;
 const hitDelay=cadence.attackDelay;
 const settleDelay=cadence.settleDelay;
 await sleep(cadence.startDelayMs);
 for(const e of events){
  const attacker=String(e?.actor)==='attacker',damage=Math.max(0,Math.round(num(e?.damage)));
  try{window.animClass?.(attacker?pf:ef,attacker?'attack-right':'attack-left',cadence.visualAttackMs)}catch(_){anim(attacker?pf:ef,attacker?'attack-right':'attack-left')}
  await sleep(hitDelay);
  if(e?.dodge){try{window.v617PvpDodge?.(attacker?ef:pf)}catch(_){}}
  else{
   try{window.animClass?.(attacker?ef:pf,'hit',cadence.visualHitMs)}catch(_){anim(attacker?ef:pf,'hit')}
   if(damage>0){
    const txt=`${e?.crit?'KRIT! ':''}-${damage}${num(e?.offhand)>0?' +NH':''}`;
    try{window.popDamage?.(attacker?eDmg:pDmg,txt)}catch(_){pop(attacker?eDmg:pDmg,txt,!!e?.crit)}
   }
  }
  hp(pBar,pTxt,e?.attackerHp,maxA);hp(eBar,eTxt,e?.defenderHp,maxD);
  const tags=Array.isArray(e?.tags)?e.tags.filter(Boolean).map(String):[];
  const structured=[...tags,e?.companion?String(e.companion).toUpperCase():'',e?.second_companion?String(e.second_companion).toUpperCase()+' · ZWEITER RUF':'',e?.forced_summon?'GARANTIERTER RUF':''].filter(Boolean);
  const raw=String(e?.label||structured.join(' + ')||(e?.crit?'KRIT':'TREFFER'));
  if(attacker)try{window.v7103CompanionReplay?.step?.(v7103SummonTrack,e)}catch(_){}
  try{window.v7175CombatReplayStep?.('pvp',{...e,side:attacker?'player':'enemy',label:raw,round:num(e?.round),damage,heal:num(e?.heal),player_hp:num(e?.attackerHp),enemy_hp:num(e?.defenderHp)})}catch(_){}
  eventFx(e);renderRound({...e,label:raw,text:String(e?.text||raw)});
  try{window.v6225ExtraHitVisual?.('pvp',raw,{round:num(e?.round),actor:String(e?.actor||'')})}catch(_){}
  try{window.v6232CombatParityFx?.('pvp',{phase:attacker?'player':'enemy',raw,damage,heal:num(e?.heal),counter:num(e?.counter),crit:!!e?.crit,offhand:num(e?.offhand),round:num(e?.round)})}catch(_){}
  await sleep(settleDelay);
 }
 try{window.v7103CompanionReplay?.finish?.(v7103SummonTrack)}catch(_){}
 hp(pBar,pTxt,a.hpAfter,maxA);hp(eBar,eTxt,d.hpAfter,maxD);
}
function secondaryRewards(b){
 if(num(b?.fragments_awarded)>0)toast('💠 PvP-Fragmente','success',`+${num(b.fragments_awarded)} Samenfragmente`);
 if(num(b?.seed_reward?.grow_amount)>0)toast('⚡ Green Crack gefunden','success',`+${num(b.seed_reward.grow_amount)} Samen`);
}
function showResult(b,enemy,{recovered=false}={}){
 const won=!!b?.won,gold=Math.max(0,num(b?.gold_awarded)),xp=Math.max(0,num(b?.xp_awarded)),buds=Math.max(0,num(b?.buds_awarded));
 try{v211ShowResult(won,enemy,gold,xp,buds)}catch(_){try{window.v211ShowResult?.(won,enemy,gold,xp,buds)}catch(__){toast(recovered?'PvP-Kampf wiederhergestellt':(won?'PvP-Sieg':'PvP-Niederlage'),won?'success':'warn',`+${gold} Gold · +${xp} XP · +${buds} Buds`)}}
 try{window.v6111Sfx?.(won?'win':'lose')}catch(_){}
}
async function ack(attackId){
 let out=null;
 for(let i=0;i<4;i++){
  try{await writeCloud()}catch(e){C.lastError=String(e?.message||e);console.warn('[V7053] cloud write',e)}
  try{out=await rpcTimeout('v7053_ack_pvp_receipt',{p_attack_id:Number(attackId)},8000)}catch(e){out={ok:false,reason:String(e?.message||e)}}
  if(out?.ok){C.lastAck=clone(out);return out}
  await sleep(450+i*320);
 }
 C.lastAck=clone(out);return out;
}
async function pendingReceipt(){return rpcTimeout('v7053_pending_pvp_receipt',{},8000)}
async function canonicalState(){const q=await rpcTimeout('v7053_get_pvp_state',{},8000);if(q?.ok){applyBundle(q);setCooldown(q.remaining_seconds)}return q}
async function finalizeReceipt(b,{recovered=false,show=true}={}){
 const attackId=Number(b?.attack_id)||0;if(!attackId)return false;C.lastAttackId=attackId;
 applyBundle(b);setCooldown(num(b?.cooldown_seconds),{paint:false});setBattleBusy(false);
 const enemy=enemyFromBundle(b,typeof v204Opponent!=='undefined'?v204Opponent:null);
 if(show)showResult(b,enemy,{recovered});
 secondaryRewards(b);
 requestAnimationFrame(()=>{
  const work=()=>{try{markSideEffects(b)}catch(_){}try{persistLocal()}catch(_){}try{paintAll()}catch(_){}};
  if(typeof requestIdleCallback==='function')requestIdleCallback(work,{timeout:500});else setTimeout(work,45);
 });
 void ack(attackId).then(a=>{
  if(!a?.ok)toast('PvP-Ergebnis serverseitig gesichert','warn','Der Hintergrund-Abgleich läuft weiter.');
 }).catch(e=>{C.lastError=String(e?.message||e)});
 return true;
}
async function recoverPending({quiet=false}={}){
 if(C.recovering||!enforced()||!online())return false;C.recovering=true;
 try{
  const p=await pendingReceipt();if(!p?.pending)return false;
  C.lastRecovery=clone(p);const ok=await finalizeReceipt(p,{recovered:true,show:!quiet});
  if(ok&&!quiet)toast('PvP-Kampf wiederhergestellt','success','Server-Ergebnis und Belohnungen wurden vollständig übernommen.');
  return ok;
 }catch(e){C.lastError=String(e?.message||e);console.warn('[V7053] recover',e);return false}
 finally{C.recovering=false}
}
async function callRun(target,req){
 try{return await rpcTimeout('v7053_run_pvp',{p_target_user:target,p_request_id:req},14000)}catch(e){
  C.lastError=String(e?.message||e);
  for(let i=0;i<4;i++){await sleep(450+i*250);try{const p=await pendingReceipt();if(p?.pending)return p}catch(_){}}
  return rpcTimeout('v7053_run_pvp',{p_target_user:target,p_request_id:req},14000);
 }
}
function reasonText(b){return ({PVP_COOLDOWN:'PvP-Cooldown aktiv.',MATCH_RANGE_CHANGED:'Der Gegner liegt nicht mehr im Matchmaking-Bereich.',CLASS_PARITY_NOT_READY:'Diese Klasse ist für Server-PvP noch nicht freigegeben.',PVP_INTERLOCK_NOT_READY:'Die PvP-Sicherheitsfreigabe fehlt.',PVP_NOT_ENFORCED:'Server-PvP ist noch nicht aktiv.'})[String(b?.reason||'')]||String(b?.reason||'Serveraktion fehlgeschlagen.')}
async function runServerPvp(){
 if(C.busy||!enforced()||!online())return false;
 const enemy=typeof v204Opponent!=='undefined'&&v204Opponent?{...v204Opponent}:null;if(!enemy?.id)return false;
 setBattleBusy(true);const btn=document.getElementById('v204FightBtn');if(btn){btn.disabled=true;btn.textContent='⚔️ KAMPF WIRD VORBEREITET …'}
 try{
  const req=requestId();let b=await callRun(String(enemy.id),req);
  if(!b?.ok&&/PENDING|RECEIPT/i.test(String(b?.reason||''))){
   await recoverPending({quiet:true});
   b=await callRun(String(enemy.id),req);
  }
  if(!b?.ok||!b?.allowed){if(num(b?.remaining_seconds)>0)setCooldown(b.remaining_seconds);toast('PvP nicht gestartet','warn',reasonText(b));return false}
  C.lastAttackId=Number(b.attack_id)||null;setCooldown(num(b.cooldown_seconds)||1800,{paint:false});
  await animateReplay(b,enemyFromBundle(b,enemy));
  return finalizeReceipt(b,{recovered:false,show:true});
 }catch(e){
  C.lastError=String(e?.message||e);console.error('[V7053] server PvP',e);
  try{const p=await pendingReceipt();if(p?.pending)return await finalizeReceipt(p,{recovered:true,show:true})}catch(_){}
  toast('PvP-Serverfehler','error','Ein bereits bestätigtes Ergebnis wird beim nächsten Öffnen automatisch wiederhergestellt.');return false;
 }finally{
  setBattleBusy(false);const b=document.getElementById('v204FightBtn');if(b){b.disabled=false;b.textContent='⚔️ Kampf starten'}paintAll();bindOwner();
 }
}

const baseFight=window.v204Fight||((typeof v204Fight==='function')?v204Fight:null);
const routedFight=function(){if(enforced())return runServerPvp();if(typeof baseFight==='function')return baseFight.apply(this,arguments)};
routedFight.__v7053Atomic=true;routedFight.__v7053Base=baseFight;
function bindOwner(){
 try{
  window.v204Fight=routedFight;try{v204Fight=routedFight}catch(_){}
  const b=document.getElementById('v204FightBtn');if(!b)return;
  if(enforced()){b.onclick=routedFight;b.dataset.v7053ServerFight='1';C.fightOwned=true}
  else{delete b.dataset.v7053ServerFight;C.fightOwned=false}
 }catch(e){console.warn('[V7053] fight owner',e)}
}
window.v204Fight=routedFight;try{v204Fight=routedFight}catch(_){}
document.addEventListener('click',ev=>{
 const b=ev.target?.closest?.('#v204FightBtn');if(!b||!enforced())return;
 ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();void runServerPvp();queueMicrotask(bindOwner);
},true);
document.addEventListener('click',ev=>{if(ev.target?.closest?.('#pvp,#v204FindBtn'))queueMicrotask(bindOwner)},false);

async function reportReadiness(){
 if(!online())return;
 try{
  const q=await rpcTimeout('v7053_get_pvp_state',{},7000),pending=q?.pendingAttackId==null?null:Number(q.pendingAttackId);
  const r=await rpcTimeout('v7053_report_client_bridge',{
   p_client_version:VERSION,p_pvp_mode:mode(),p_fight_owned:!!C.fightOwned,
   p_pending_attack_id:Number.isFinite(pending)?pending:null,
   p_details:{bridgeLoaded:true,atomicOwner:true,legacyFinishBypassed:enforced(),serverReplay:true,receiptAck:true,
     shadowParity:typeof window.v7052PvpShadowDiagnostics==='function'?window.v7052PvpShadowDiagnostics():null}
  },7000);C.reportId=Number(r?.report_id)||null;
 }catch(e){console.warn('[V7053] readiness report',e)}
}
async function boot(){
 if(!online())return;
 try{
  await refreshModes();bindOwner();
  if(!enforced())return;
  /* V7.168: account boot may reconcile a finished server receipt, but must never
     open a PvP fight/result UI just because the player logged in. Manual recovery
     stays visible through window.v7053RecoverPvpReceipt(). */
  const recovered=await recoverPending({quiet:true});
  if(!recovered){try{await canonicalState();persistLocal();paintAll()}catch(e){console.warn('[V7053] canonical state',e)}}
  bindOwner();
 }catch(e){C.lastError=String(e?.message||e);console.warn('[V7053] boot',e)}
}
window.v7053PvpAuthorityDiagnostics=()=>clone({...C,version:VERSION,mode:mode()});
window.v7053RecoverPvpReceipt=()=>recoverPending({quiet:false});
window.v7053RunServerPvp=()=>runServerPvp();
window.v7053SyncPvpState=async()=>{
 if(!online())return null;
 try{
  const q=await canonicalState();
  if(q?.ok){persistLocal();try{window.v204RenderPage?.()}catch(_){}}
  return q;
 }catch(e){C.lastError=String(e?.message||e);return null}
};
window.addEventListener('growlegends:account-ready',()=>{const run=()=>void boot();if(typeof window.v7204AfterStartupQuiet==='function')window.v7204AfterStartupQuiet(run,900);else queueMicrotask(run)},{passive:true});
window.addEventListener('pageshow',()=>queueMicrotask(bindOwner),{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)queueMicrotask(bindOwner)},{passive:true});
queueMicrotask(()=>{bindOwner();try{if(typeof v073User!=='undefined'&&v073User?.id&&!v073User?.is_anonymous&&!C.fightOwned)void boot()}catch(_){}});
})();
