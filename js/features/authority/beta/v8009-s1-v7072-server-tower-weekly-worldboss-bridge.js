(()=>{
'use strict';
if(window.__V7072_TOWER_WEEKLY_WORLDBOSS__)return;
window.__V7072_TOWER_WEEKLY_WORLDBOSS__=true;

const VERSION='V7.091';
const bridge={
  ready:false,busy:false,lastSync:0,lastError:'',
  towerActions:0,weeklyActions:0,worldbossActions:0
};
let refreshPromise=null;
let actionChain=Promise.resolve();

const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const one=d=>Array.isArray(d)?d[0]:d;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const n=v=>Math.max(0,Number(v)||0);
const stop=e=>{try{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}catch(_){}};
const toast=(title,type='info',detail='')=>{
  try{return window.v063Toast?.(title,type,detail)}
  catch(_){try{return v115Alert?.(detail||title,title,type)}catch(__){}}
};
function serial(fn){
  const run=()=>Promise.resolve().then(fn);
  actionChain=actionChain.then(run,run);
  return actionChain;
}
function ensure(){
  if(typeof s==='undefined'||!s)return false;
  s.tower=(s.tower&&typeof s.tower==='object')?s.tower:{};
  s.tower.meta=(s.tower.meta&&typeof s.tower.meta==='object')?s.tower.meta:{};
  s.tower.season=(s.tower.season&&typeof s.tower.season==='object')?s.tower.season:{};
  s.v6239WeeklyChest=(s.v6239WeeklyChest&&typeof s.v6239WeeklyChest==='object')?s.v6239WeeklyChest:{};
  s.v110WorldBoss=(s.v110WorldBoss&&typeof s.v110WorldBoss==='object')?s.v110WorldBoss:{};
  s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
  s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};
  s.grow.seeds=(s.grow.seeds&&typeof s.grow.seeds==='object')?s.grow.seeds:{};
  s.inventory=Array.isArray(s.inventory)?s.inventory:[];
  s.materials=Array.isArray(s.materials)?s.materials:[];
  s.equipment=(s.equipment&&typeof s.equipment==='object')?s.equipment:{};
  return true;
}
async function rpc(name,args={}){
  const x=db(),id=uid();
  if(!x||!id)throw new Error('SERVER_NOT_READY');
  const {data,error}=await x.rpc(name,args);
  if(error)throw error;
  return one(data);
}
function persistLocal(){
  try{
    if(typeof KEY!=='undefined'&&KEY)localStorage.setItem(KEY,JSON.stringify(s));
    else localStorage.setItem('growLegendsV020',JSON.stringify(s));
  }catch(_){}
}

function v7085TowerAsset(path){
  return String(path||'');
}
function v7085TowerVisualDungeon(floor){
  return 2+((Math.max(1,Math.floor(Number(floor)||1))-1)%19);
}
function v7085TowerBossDungeon(floor){
  return 10+(((Math.max(1,Math.floor(Number(floor)||10))/10)|0)-1)%11;
}
function v7085TowerEnemyArt(floor,type,miniboss=false){
  const f=Math.max(1,Number(floor)||1),t=String(type||'normal').toLowerCase();
  if(t==='boss'){
    const d=v7085TowerBossDungeon(f);
    return v7085TowerAsset(`v474_dungeon_assets/d${d}_boss.png`);
  }
  const d=v7085TowerVisualDungeon(f);
  const room=miniboss?9:1+((f*5+(t==='elite'?3:0))%9);
  return v7085TowerAsset(`v474_dungeon_assets/d${d}_${room}.png`);
}
function v7085TowerBackground(floor,type){
  const f=Math.max(1,Number(floor)||1),t=String(type||'normal').toLowerCase();
  const d=t==='boss'?v7085TowerBossDungeon(f):v7085TowerVisualDungeon(f);
  return v7085TowerAsset(`v474_dungeon_assets/d${d}_bg.jpg`);
}
function v7085EnrichTowerVisuals(run){
  if(!run||typeof run!=='object'||!run.enemy)return run;
  const e=run.enemy;
  const type=String(e.type||run.currentChoice?.type||'normal').toLowerCase();
  const miniboss=!!(e.miniboss||run.currentChoice?.miniboss);
  e.boss=type==='boss';
  e.elite=type==='elite';
  e.miniboss=miniboss;
  if(!e.bg)e.bg=v7085TowerBackground(run.floor,type);
  if(!e.art)e.art=v7085TowerEnemyArt(run.floor,type,miniboss);
  return run;
}

function applyTower(st){
  if(!st||typeof st!=='object'||!ensure())return;
  const t=s.tower;
  t.meta.tokens=Math.max(0,Number(st.tokens)||0);
  t.meta.upgrades=clone(st.upgrades||{heal:0,roots:0,leaves:0,harvest:0,mutation:0});
  t.meta.recoveryPct=Math.max(0,Math.min(100,Number(st.recovery_pct)||0));
  t.meta.recoveryAt=st.recovery_at?Date.parse(st.recovery_at):Date.now();
  t.meta.pendingWednesdayRecovery=Math.max(0,Number(st.pending_recovery)||0);

  t.season.id=String(st.season_id||'');
  t.season.bestFloor=Math.max(0,Number(st.best_floor)||0);
  t.season.bestScore=Math.max(0,Number(st.best_score)||0);
  t.season.bestTime=Math.max(0,Number(st.best_time_ms)||0);
  t.season.runs=Math.max(0,Number(st.runs)||0);
  t.season.bossKills=Math.max(0,Number(st.boss_kills)||0);
  t.season.eliteKills=Math.max(0,Number(st.elite_kills)||0);

  let run=st.run==null?null:v7085EnrichTowerVisuals(clone(st.run));
  /* Historical renderer auto-launches its local battle from doorTransition.
     Render the exact server state as PREP instead; the Fight button then calls
     the server and the local combat engine never gets a chance to mutate state. */
  if(run&&run.mode==='doorTransition'){
    run.v7072ServerMode='doorTransition';
    run.mode='prep';
  }
  t.run=run;
  t.lastResult=st.last_result==null?null:clone(st.last_result);
  t.wednesday=clone(st.wednesday||{});
  t.wednesdayHistory=clone(st.wednesday_history||{});
}
function applyWeekly(st){
  if(!st||typeof st!=='object'||!ensure())return;
  const z=s.v6239WeeklyChest;
  z.cycleKey=String(st.cycle_key||'');
  z.xp=Math.max(0,Number(st.xp)||0);
  z.maxLevelEver=Math.max(1,Number(st.max_level_ever)||1);
  z.totalOpened=Math.max(0,Number(st.total_opened)||0);
  z.lifetimeXp=Math.max(0,Number(st.lifetime_xp)||0);
  z.towerMaxFloor=Math.max(0,Number(st.tower_max_floor)||0);
  z.daily={
    key:String(st.daily_key||''),
    pvpWins:Math.max(0,Number(st.daily_pvp_wins)||0),
    plants:Math.max(0,Number(st.daily_plants)||0)
  };
  z.pending=st.pending==null?null:clone(st.pending);
  z.lastOpened=st.last_opened==null?null:clone(st.last_opened);
  z.seenTokens=Array.isArray(z.seenTokens)?z.seenTokens:[];
}
function applyWorldboss(st){
  if(!st||typeof st!=='object'||!ensure())return;
  s.v110WorldBoss={
    ...(s.v110WorldBoss||{}),
    day:String(st.day_key||''),
    wins:Math.max(0,Number(st.wins)||0),
    attempts:Math.max(0,Number(st.attempts)||0),
    freeUsed:!!st.free_used
  };
}
function v8036TowerPaintSignature(){
  try{
    const t=s?.tower||{};
    return JSON.stringify({
      meta:{
        tokens:Number(t.meta?.tokens)||0,
        upgrades:t.meta?.upgrades||{},
        recoveryPct:Number(t.meta?.recoveryPct)||0,
        recoveryAt:Number(t.meta?.recoveryAt)||0,
        pendingWednesdayRecovery:Number(t.meta?.pendingWednesdayRecovery)||0
      },
      season:t.season||{},
      run:t.run||null,
      lastResult:t.lastResult||null,
      wednesday:t.wednesday||{},
      wednesdayHistory:t.wednesdayHistory||{}
    });
  }catch(_){return ''}
}
function applySnapshot(snapshot,{paint=true}={}){
  if(!snapshot||snapshot.ok!==true||!ensure())return false;
  const towerBefore=v8036TowerPaintSignature();
  const tw=snapshot.tower?.state;
  const wc=snapshot.weekly?.state;
  applyTower(tw);
  const towerChanged=towerBefore!==v8036TowerPaintSignature();
  applyWeekly(wc);
  applyWorldboss(snapshot.worldboss);

  const p=snapshot.progress||{};
  if(Number.isFinite(Number(p.level)))s.level=Math.max(1,Number(p.level));
  if(Number.isFinite(Number(p.xp)))s.xp=Math.max(0,Number(p.xp));
  if(Number.isFinite(Number(p.gold)))s.gold=Math.max(0,Number(p.gold));
  if(Number.isFinite(Number(p.harz)))s.harzTaler=Math.max(0,Number(p.harz));

  const it=snapshot.items||{};
  if(Array.isArray(it.inventory))s.inventory=clone(it.inventory);
  if(Array.isArray(it.materials))s.materials=clone(it.materials);
  if(it.equipment&&typeof it.equipment==='object')s.equipment=clone(it.equipment);
  if(Number.isFinite(Number(it.fragments)))s.v488Forge.fragments=Math.max(0,Number(it.fragments));

  const sd=snapshot.seeds||{};
  if(sd.grow_seeds&&typeof sd.grow_seeds==='object')s.grow.seeds=clone(sd.grow_seeds);
  if(Number.isFinite(Number(sd.time_seeds)))s.timeSeeds=Math.max(0,Number(sd.time_seeds));

  persistLocal();
  bridge.ready=true;
  bridge.lastSync=Date.now();
  bridge.lastError='';

  if(paint){
    try{window.v069SyncCurrencies?.()}catch(_){}
    try{renderInventory?.()}catch(_){}
    try{window.v441PaintResources?.()}catch(_){}
    try{window.v488ForgeRender?.()}catch(_){}
    try{window.v6104UpdatePetIndicators?.()}catch(_){}
    try{
      const towerVisible=!!document.getElementById('tower')?.classList.contains('active');
      if(towerVisible&&towerChanged)window.vTowerRender?.();
      else if(towerVisible){
        /* V8.036: background authority refreshes must not rebuild the lobby.
           Recovery countdown/HP are painted in-place by the live lobby owner. */
        window.v6345PaintTowerTimers?.();
      }
    }catch(_){}
    try{
      if(document.getElementById('v110Overlay')?.classList.contains('show'))v110Refresh?.();
    }catch(_){}
    try{
      if(document.getElementById('world')?.classList.contains('active'))window.v085InstallWorld?.(false);
    }catch(_){}
  }
  try{
    if(document.getElementById('tower')?.classList.contains('active'))
      setTimeout(()=>{try{v7096ResumePreparedFight()}catch(_){}},0);
  }catch(_){}
  return true;
}
async function refresh({paint=true,quiet=true}={}){
  if(!(window.v7081UseAuthority?.('tower')||window.v7081UseAuthority?.('weekly')||window.v7081UseAuthority?.('worldboss'))){bridge.ready=true;return null;}
  if(refreshPromise)return refreshPromise;
  refreshPromise=(async()=>{
    try{
      const r=await rpc('v7072_authority_state');
      if(!r?.ok)throw new Error(String(r?.reason||'AUTHORITY_STATE_FAILED'));
      applySnapshot(r,{paint});
      return r;
    }catch(e){
      bridge.ready=false;
      bridge.lastError=String(e?.message||e);
      console.warn('[V7072] authority refresh',e);
      if(!quiet)toast('Serverstand nicht verfügbar','warn',bridge.lastError);
      return null;
    }finally{
      refreshPromise=null;
    }
  })();
  return refreshPromise;
}
function applyActionResponse(r){
  if(r?.snapshot?.ok)applySnapshot(r.snapshot);
}

function v7191TowerDoorPending(arg){
  const root=document.getElementById('tower');if(!root?.classList.contains('active'))return()=>{};
  const idx=String(arg??'0'),btn=root.querySelector(`[data-vt-route="${idx}"]`),stage=root.querySelector('.v6263-door-stage');
  root.classList.add('v7191-route-busy');root.querySelectorAll('[data-vt-route]').forEach(b=>{b.disabled=true;b.setAttribute('aria-busy','true')});
  if(btn){btn.classList.add('v7191-selected-door');btn.dataset.v7191OldText=btn.textContent||'';btn.textContent='🚪 Öffnet …'}
  let note=stage?.querySelector('.v7191-door-pending');if(stage&&!note){note=document.createElement('div');note.className='v7191-door-pending';note.innerHTML='<b>🚪 TÜR WIRD GEÖFFNET</b><span>Server bestätigt Gegner · Bild wird bereits vorbereitet …</span>';stage.appendChild(note);requestAnimationFrame(()=>note.classList.add('show'))}
  return()=>{try{root.classList.remove('v7191-route-busy');root.querySelectorAll('[data-vt-route]').forEach(b=>{b.disabled=false;b.removeAttribute('aria-busy')});if(btn?.dataset.v7191OldText)btn.textContent=btn.dataset.v7191OldText;btn?.classList.remove('v7191-selected-door');note?.remove()}catch(_){}}
}

function v7085Anim(sel,cl,ms=260){
  const el=document.querySelector(sel);if(!el)return;
  const dur=Math.max(70,Number(ms)||260);
  el.classList.remove(cl);
  try{el.style.animationDuration=`${dur}ms`}catch(_){}
  void el.offsetWidth;el.classList.add(cl);
  setTimeout(()=>{try{el.classList.remove(cl);el.style.animationDuration=''}catch(_){}},dur+24);
}
function v7085Pop(sel,text,ms=300){
  const el=document.querySelector(sel);if(!el)return;
  el.textContent=String(text||'');
  v7085Anim(sel,'pop',ms);
}
function v7085TowerPaint(run,enemyMax,playerHp,enemyHp,logLines){
  try{
    const pbar=document.querySelector('#vTPlayerBar i');
    const ebar=document.querySelector('#vTEnemyBar i');
    if(pbar)pbar.style.width=`${Math.max(0,Math.min(100,playerHp/Math.max(1,Number(run?.maxHp)||1)*100))}%`;
    if(ebar)ebar.style.width=`${Math.max(0,Math.min(100,enemyHp/Math.max(1,enemyMax)*100))}%`;
    const pt=document.getElementById('vTPlayerHp');
    const et=document.getElementById('vTEnemyHp');
    if(pt)pt.textContent=`${Math.max(0,Math.round(playerHp)).toLocaleString('de-DE')} / ${Math.max(1,Math.round(Number(run?.maxHp)||1)).toLocaleString('de-DE')}`;
    if(et)et.textContent=`${Math.max(0,Math.round(enemyHp)).toLocaleString('de-DE')} / ${Math.max(1,Math.round(enemyMax)).toLocaleString('de-DE')}`;
    const log=document.getElementById('vTBattleLog');
    if(log)log.textContent=(logLines||[]).slice(-2).join(' ');
  }catch(_){}
}
async function v7085AnimateTowerFight(response,beforeRun){
  const v7103SummonTrack=window.v7103CompanionReplay?.begin?.('tower')||null;
  const replay=Array.isArray(response?.fight_replay)
    ?response.fight_replay
    :Array.isArray(response?.run?.combatReplay)?response.run.combatReplay:[];
  if(!beforeRun||!replay.length){
    if(beforeRun&&!replay.length)window.__GL_RUNTIME_WATCHDOG__?.report?.('tower_replay_missing','error',
      {floor:Number(beforeRun?.floor)||0,mode:String(beforeRun?.mode||'')},
      {screen:'tower',incidentKey:`floor:${Number(beforeRun?.floor)||0}`}
    );
    return false;
  }

  const vr=v7085EnrichTowerVisuals(clone(beforeRun));
  const enemyMax=Math.max(1,Number(vr?.enemy?.maxHp)||Number(vr?.enemy?.hp)||Number(replay[0]?.enemy_hp)||1);
  let playerHp=Math.max(0,Number(vr.hp)||1);
  let enemyHp=enemyMax,round=0;
  const lines=['Der Kampf beginnt.'];

  vr.mode='battle';
  vr.v7085ServerReplay=true;
  vr.combat={risk:0,enemyHp,enemyMax,round:0,log:[...lines],type:String(vr?.currentChoice?.type||vr?.enemy?.type||'normal')};

  /* V7.214: the authoritative fight is already complete when the replay arrives.
     Keep the combat presentation, but fit it into a short deterministic visual budget
     instead of spending ~640 ms per replay event (which made normal tower clicks take
     6-7 seconds even though the RPC itself returned in ~200 ms). */
  const cadence=window.v7269DungeonCadence?.(replay.length)||{frameDelay:220,attackDelay:97,settleDelay:123,visualAttackMs:400,visualHitMs:400,visualPopMs:650,startDelayMs:90};
  const replayStepMs=cadence.frameDelay;
  const replayAttackMs=cadence.attackDelay;
  const replaySettleMs=cadence.settleDelay;
  const replayVisualAttackMs=cadence.visualAttackMs;
  const replayVisualHitMs=cadence.visualHitMs;
  const replayPopMs=cadence.visualPopMs;
  /* Audio contact is perceived slightly earlier than the damage-number paint on mobile.
     Lead the hit SFX by a small fixed amount so swing/impact and sound feel locked. */
  const replaySoundLeadMs=Math.min(65,Math.max(30,Math.round(replayAttackMs*.28)));
  const replayPreSoundMs=Math.max(0,replayAttackMs-replaySoundLeadMs);

  if(ensure()){s.tower.run=vr;try{window.vTowerRender?.()}catch(e){console.warn('[V7099] tower battle render',e)}}
  await sleep(cadence.startDelayMs);v7085TowerPaint(vr,enemyMax,playerHp,enemyHp,lines);

  for(const ev of replay){
    round=Math.max(round,Number(ev?.round??ev?.r)||round+1);
    const dmg=Math.max(0,Number(ev?.damage)||0),heal=Math.max(0,Number(ev?.heal)||0);
    const tags=Array.isArray(ev?.tags)?ev.tags.filter(Boolean).map(String):[];
    const comp=String(ev?.companion||'').toLowerCase(),comp2=String(ev?.second_companion||'').toLowerCase();
    const raw=String(ev?.label||[...tags,comp?comp.toUpperCase():'',comp2?comp2.toUpperCase()+' · ZWEITER RUF':'',ev?.forced_summon?'GARANTIERTER RUF':''].filter(Boolean).join(' + ')||(ev?.crit?'KRIT':'TREFFER'));

    if(ev?.side==='player'){
      try{window.v7103CompanionReplay?.step?.(v7103SummonTrack,ev)}catch(_){}
      try{window.v7175CombatReplayStep?.('tower',{...ev,side:'player',label:raw,round,damage:dmg,heal,player_hp:Number.isFinite(Number(ev?.player_hp))?Number(ev.player_hp):playerHp+heal,enemy_hp:Number.isFinite(Number(ev?.enemy_hp))?Number(ev.enemy_hp):enemyHp-dmg})}catch(_){}
      v7085Anim('#vTPlayerFighter','attack-r',replayVisualAttackMs);
      await sleep(replayPreSoundMs);
      try{window.v6111Sfx?.(ev?.crit?'crit':'hit')}catch(_){}
      await sleep(replaySoundLeadMs);
      enemyHp=Math.max(0,Number.isFinite(Number(ev?.enemy_hp))?Number(ev.enemy_hp):enemyHp-dmg);
      playerHp=Math.max(0,Number.isFinite(Number(ev?.player_hp))?Number(ev.player_hp):playerHp+heal);
      v7085Pop('#vTDmgEnemy',`${ev?.crit?'KRIT! ':''}-${Math.round(dmg)}`,replayPopMs);v7085Anim('#vTEnemyFighter','hit',replayVisualHitMs);
      lines.push(`Runde ${round}: ${raw} · ${Math.round(dmg)} Schaden${heal?` · +${Math.round(heal)} LP`:''}.`);
      try{
        if(comp)window.v6287ShowSummon?.(comp,Math.max(0,Number(ev?.companion_damage)||0),false,{heal:comp==='bud'?heal:0,crit:!!ev?.companion_crit,note:ev?.forced_summon?'GARANTIERTER RUF':''});
        if(comp2)setTimeout(()=>window.v6287ShowSummon?.(comp2,Math.max(0,Number(ev?.second_damage)||0),true,{note:'2. RUF'}),120);
      }catch(_){}
      try{window.v6230TowerCombatFx?.({phase:'player',raw,damage:dmg,heal,crit:!!ev?.crit,wucht:!!ev?.wucht,round})}catch(_){}
      try{window.v6225ExtraHitVisual?.('tower',raw,{round})}catch(_){}
      try{window.v6232CombatParityFx?.('tower',{phase:'player',raw,damage:dmg,heal,crit:!!ev?.crit,wucht:!!ev?.wucht,offhand:Number(ev?.offhand)||0,round})}catch(_){}
    }else{
      try{window.v7175CombatReplayStep?.('tower',{...ev,side:'enemy',label:raw,round,damage:dmg,heal,player_hp:Number.isFinite(Number(ev?.player_hp))?Number(ev.player_hp):playerHp-dmg,enemy_hp:Number.isFinite(Number(ev?.enemy_hp))?Number(ev.enemy_hp):enemyHp})}catch(_){}
      v7085Anim('#vTEnemyFighter','attack-l',replayVisualAttackMs);
      await sleep(replayPreSoundMs);
      if(!(ev?.dodge||dmg===0))try{window.v6111Sfx?.('enemyHit')}catch(_){}
      await sleep(replaySoundLeadMs);
      playerHp=Math.max(0,Number.isFinite(Number(ev?.player_hp))?Number(ev.player_hp):playerHp-dmg);
      enemyHp=Math.max(0,Number.isFinite(Number(ev?.enemy_hp))?Number(ev.enemy_hp):enemyHp);
      if(ev?.dodge||dmg===0){
        v7085Anim('#vTPlayerFighter','dodge',replayVisualHitMs);lines.push(`Runde ${round}: ${raw||'AUSGEWICHEN'}.`);
        try{window.v6230TowerCombatFx?.({phase:'playerDodge',raw:raw||'AUSGEWICHEN',round})}catch(_){}
        try{window.v6111Sfx?.('dodge')}catch(_){}
      }else{
        v7085Pop('#vTDmgPlayer',`-${Math.round(dmg)}`,replayPopMs);v7085Anim('#vTPlayerFighter','hit',replayVisualHitMs);
        lines.push(`Runde ${round}: Gegner · ${raw} · ${Math.round(dmg)} Schaden${heal?` · +${Math.round(heal)} LP`:''}${Number(ev?.counter)>0?` · Konter ${Number(ev.counter)}`:''}.`);
        try{window.v6230TowerCombatFx?.({phase:'enemy',raw,damage:dmg,heal,counter:Number(ev?.counter)||0,prevent:!!ev?.prevent,round})}catch(_){}
        try{window.v6225ExtraHitVisual?.('tower',raw,{round,actor:'defender'})}catch(_){}
        try{window.v6232CombatParityFx?.('tower',{phase:'enemy',raw,damage:dmg,heal,counter:Number(ev?.counter)||0,prevent:!!ev?.prevent,round})}catch(_){}
      }
    }

    vr.hp=playerHp;if(vr.combat){vr.combat.enemyHp=enemyHp;vr.combat.round=round;vr.combat.log=[...lines]}
    v7085TowerPaint(vr,enemyMax,playerHp,enemyHp,lines);await sleep(replaySettleMs);
  }
  try{window.v7103CompanionReplay?.finish?.(v7103SummonTrack)}catch(_){}
  await sleep(120);return true;
}
function reasonText(r){
  const x=String(r?.reason||'SERVER_REJECTED');
  const map={
    RUN_ACTIVE:'Es läuft bereits ein Turm-Run.',
    NO_ACTIVE_RUN:'Kein aktiver Turm-Run.',
    NO_RECOVERY:'Die Turm-Erholung ist leer.',
    RECOVERY_FULL:'Die Turm-Erholung ist bereits voll.',
    INSUFFICIENT_HARZ:'Nicht genug Harz-Taler.',
    INSUFFICIENT_TOKENS:'Nicht genug Turmblätter.',
    INVALID_CHOICE:'Diese Tür ist nicht mehr verfügbar.',
    NOT_READY_FOR_FIGHT:'Der Server ist noch nicht kampfbereit.',
    NOT_CHECKPOINT:'Diese Aktion ist nur am Kontrollpunkt möglich.',
    NOT_GROW_EVENT:'Diese Grow-Aktion ist in diesem Raum nicht verfügbar.',
    NOT_LAB:'Diese Labor-Aktion ist in diesem Raum nicht verfügbar.',
    NOT_SECRET:'Diese Geheimraum-Aktion ist in diesem Raum nicht verfügbar.',
    NOT_MERCHANT:'Diese Händler-Aktion ist hier nicht verfügbar.',
    MUTATION_CAP:'Das Mutationslimit von 6 ist erreicht.',
    ALREADY_OWNED:'Diese Mutation ist bereits aktiv.',
    NO_MUTATION_AVAILABLE:'Es ist keine weitere Mutation verfügbar.',
    TASK_NOT_COMPLETE:'Die Mittwochs-Aufgabe ist noch nicht erfüllt.',
    ALREADY_CLAIMED:'Bereits abgeholt.',
    NO_PENDING_CHEST:'Keine Wochen-Truhe zur Abholung.',
    CHEST_NOT_OPENED:'Die Wochen-Truhe muss zuerst geöffnet werden.',
    NOTHING_TO_CLAIM:'Nichts mehr abzuholen.',
    WORLDBOSS_EVENT_INACTIVE:'Der mystische Weltboss ist derzeit nicht aktiv.'
  };
  return map[x]||x;
}
async function towerAction(action,arg=null,{success='',silent=false}={}){
  return serial(async()=>{
    bridge.busy=true;
    const beforeRun=(action==='fight'||action==='choose')&&ensure()?clone(s.tower?.run||null):null;
    const wd=window.__GL_RUNTIME_WATCHDOG__?.begin?.(
      action==='fight'?'tower_fight':'tower_action',
      {screen:'tower',action,floor:Number(beforeRun?.floor)||0},
      {slowMs:action==='fight'?2200:1500,stallMs:6500}
    );

    /* Door feedback starts immediately on tap. The authoritative server request
       runs in parallel, so the player never sees the old server-wait interstitial. */
    let doorPreviewPromise=Promise.resolve(false);
    try{
      if(action==='choose'&&beforeRun?.active){
        const idx=Math.max(0,Number(arg)||0);
        const preview=clone(beforeRun);
        const choice=Array.isArray(preview?.choices)?preview.choices[idx]:null;
        preview.routeChoiceIndex=idx;
        preview.currentChoice=choice||preview.currentChoice||{type:'normal'};
        const type=String(preview.currentChoice?.type||'normal').toLowerCase();
        preview.enemy={
          type,
          boss:type==='boss',
          elite:type==='elite',
          miniboss:!!preview.currentChoice?.miniboss,
          name:type==='boss'?'Turm-Boss':preview.currentChoice?.miniboss?'Turmwächter':type==='elite'?'Elite-Wächter':'Turmwächter',
          bg:v7085TowerBackground(preview.floor,type),
          art:v7085TowerEnemyArt(preview.floor,type,!!preview.currentChoice?.miniboss)
        };
        doorPreviewPromise=Promise.resolve(window.v7298TowerDoorPreview?.(preview,idx,900)).catch(()=>false);
      }

      wd?.phase?.('server');
      const r=action==='choose'
        ?await rpc('v7095_tower_choose_and_fight',{p_arg:arg})
        :await rpc('v7072_tower_action',{p_action:action,p_arg:arg});
      if(!r?.ok){
        wd?.end?.({ok:false,reason:String(r?.reason||'server_rejected')});
        applyActionResponse(r);
        if(!silent)toast('Turm-Aktion abgelehnt','warn',reasonText(r));
        return r;
      }
      const replayRun=action==='choose'&&r?.auto_fight&&r?.pre_run
        ?v7085EnrichTowerVisuals(clone(r.pre_run))
        :beforeRun;

      /* The opening animation already started while the RPC was in flight.
         Finish only its remaining visual time, then enter the authoritative replay. */
      if(action==='choose'&&r?.auto_fight&&replayRun){
        wd?.phase?.('door_open');
        try{await doorPreviewPromise}catch(_){}
      }

      if((action==='fight'||(action==='choose'&&r?.auto_fight))&&replayRun){
        wd?.phase?.('replay',{replayCount:Array.isArray(r?.fight_replay)?r.fight_replay.length:0});
        await v7085AnimateTowerFight(r,replayRun);
      }
      wd?.phase?.('apply');
      applyActionResponse(r);
      bridge.towerActions++;
      if(r.result){
        const x=r.result;

        /* V7.111: the pre-authority Tower always opened the full Run-End screen
           after death, securing loot or aborting. Server authority already stores
           last_result; restore only the missing presentation transition here. */
        try{
          const shown=typeof window.vTowerShowResult==='function'
            ?window.vTowerShowResult(clone(x))
            :false;
          if(!shown){
            /* Defensive fallback keeps the authoritative result locally even if
               an unexpected old Tower renderer is active. */
            if(ensure())s.tower.lastResult=clone(x);
            window.vTowerRender?.();
          }
          try{window.v6111Sfx?.('reward')}catch(_){}
        }catch(e){console.warn('[V7.111] tower result screen',e)}

        const label=x.reason==='secured'?'Beute gesichert':x.reason==='death'?'Turm-Lauf beendet':'Turm-Lauf abgebrochen';
        toast(label,x.reason==='death'?'warn':'success',
          `Etage ${Math.max(0,Number(x.floor)||0)} · ${Math.max(0,Number(x.gold)||0).toLocaleString('de-DE')} Gold · ${Math.max(0,Number(x.xp)||0).toLocaleString('de-DE')} EXP · ${Math.max(0,Number(x.tokens)||0)} Turmblätter`);
      }else if(success){
        toast(success,'success');
      }
      wd?.end?.({ok:true});
      return r;
    }catch(e){
      wd?.fail?.(e);
      bridge.lastError=String(e?.message||e);
      toast('Turm-Server nicht erreichbar','error',bridge.lastError);
      await refresh({quiet:true});
      return null;
    }finally{bridge.busy=false}
  });
}
async function weeklyAction(action,rewardId=null){
  return serial(async()=>{
    bridge.busy=true;
    try{
      const r=await rpc('v7072_weekly_action',{p_action:action,p_reward_id:rewardId});
      applyActionResponse(r);
      if(!r?.ok){
        toast('Wochen-Truhe','warn',reasonText(r));
        return r;
      }
      bridge.weeklyActions++;
      try{window.v6239OpenWeeklyChest?.()}catch(_){}
      try{window.v085InstallWorld?.(false)}catch(_){}
      if(action==='open')try{window.v6111Sfx?.('reward')}catch(_){}
      if(action==='claim'||action==='claim_all'){
        const count=Array.isArray(r.claimed)?r.claimed.length:0;
        toast('🧰 Wochen-Belohnung erhalten','success',count>1?`${count} Belohnungen serverseitig gebucht.`:'Belohnung serverseitig gebucht.');
      }
      return r;
    }catch(e){
      bridge.lastError=String(e?.message||e);
      toast('Wochen-Truhe nicht erreichbar','error',bridge.lastError);
      await refresh({quiet:true});
      return null;
    }finally{bridge.busy=false}
  });
}
async function wednesdayClaim(id){
  return serial(async()=>{
    try{
      const r=await rpc('v7072_tower_wednesday_claim',{p_task_id:id});
      applyActionResponse(r);
      if(!r?.ok)return toast('Mittwochs-Aufgabe','warn',reasonText(r));
      toast('Mittwochs-Aufgabe abgeholt','success',`+${Number(r.leaves)||0} Turmblätter${Number(r.recovery)>0?` · +${Number(r.recovery)} % Erholung`:''}`);
      return r;
    }catch(e){
      toast('Mittwochs-Aufgabe','error',String(e?.message||e));
      return null;
    }
  });
}
async function placementClaim(){
  return serial(async()=>{
    try{
      const r=await rpc('v7072_tower_placement_claim');
      applyActionResponse(r);
      if(!r?.ok)return toast('Mittwochs-Rangbelohnung','warn',reasonText(r));
      toast('Mittwochs-Rangbelohnung erhalten','success',`Platz ${Number(r.rank)||0} · serverseitig gebucht.`);
      void window.v7097ShowWednesdayReward?.(r);
      return r;
    }catch(e){
      toast('Mittwochs-Rangbelohnung','error',String(e?.message||e));
      return null;
    }
  });
}
async function confirmAbort(){
  let ok=false;
  try{
    if(typeof v115Confirm==='function'){
      ok=await v115Confirm('Lauf wirklich abbrechen? 25 % der ungesicherten Beute können verloren gehen.',{
        title:'Turm-Run aufgeben',type:'warn',okText:'Run aufgeben'
      });
    }else{
      ok=confirm('Turm-Run wirklich aufgeben?');
    }
  }catch(_){ok=false}
  if(ok)await towerAction('abort',null);
}

function updateWorldbossBars(p,b,pmax,bmax){
  try{
    const pe=document.getElementById('v110PlayerHp'),be=document.getElementById('v110BossHp');
    const pt=document.getElementById('v110PlayerHpTxt'),bt=document.getElementById('v110BossHpTxt');
    if(pe)pe.style.width=`${Math.max(0,Math.min(100,p/Math.max(1,pmax)*100))}%`;
    if(be)be.style.width=`${Math.max(0,Math.min(100,b/Math.max(1,bmax)*100))}%`;
    if(pt)pt.textContent=`${Math.max(0,p)}/${Math.max(1,pmax)}`;
    if(bt)bt.textContent=`${Math.max(0,b)}/${Math.max(1,bmax)}`;
  }catch(_){}
}
async function animateWorldboss(r){
  const replay=Array.isArray(r?.replay)?r.replay:[];
  const pmax=Math.max(1,Number(r?.player_hp_start)||1);
  const bmax=Math.max(1,Number(r?.boss_hp_start)||1);
  let p=pmax,b=bmax,lines=[],lastRound=0;

  const btn=document.getElementById('v110Fight');
  if(btn)btn.disabled=true;
  try{window.v6287ClearSummonerVisuals?.()}catch(_){}
  updateWorldbossBars(p,b,pmax,bmax);

  const grouped=[];
  for(const ev of replay){
    const rn=Math.max(1,Number(ev?.round??ev?.r)||1);
    let g=grouped.find(x=>x.round===rn);
    if(!g){g={round:rn,events:[]};grouped.push(g)}
    g.events.push(ev);
  }

  for(const g of grouped){
    lastRound=g.round;
    const first=g.events[0]||{};
    const phase=Math.max(1,Math.min(3,Number(first?.phase)||1));
    const phaseEl=document.getElementById('v110Phase');
    if(phaseEl)phaseEl.textContent=
      phase===3?'☠️ LETZTE BLÜTE':
      phase===2?'💚 SMARAGD-RASEREI':
      'MYSTISCHES EVENT';

    const scene=document.getElementById('v111BossScene');
    if(scene){
      scene.classList.toggle('phase2',phase===2);
      scene.classList.toggle('phase3',phase===3);
    }

    for(const ev of g.events){
      p=Math.max(0,Number(ev?.player_hp ?? p));
      b=Math.max(0,Number(ev?.enemy_hp ?? b));
      const dmg=Math.max(0,Number(ev?.damage)||0);

      if(ev?.side==='player'){
        const text=ev?.crit
          ?`💥 Kritischer Treffer: ${dmg}`
          :`⚔️ Du triffst für ${dmg}.`;
        lines.push(text);
        try{window.animClass?.(document.getElementById('v110PlayerFighter'),'attack-right',380)}catch(_){}
        try{window.v6111Sfx?.(ev?.crit?'crit':'hit')}catch(_){}
      }else{
        const text=`${phase===3?'☠️':phase===2?'💚':'🗿'} Koloss trifft für ${dmg}.`;
        lines.push(text);
        try{window.v6111Sfx?.('enemyHit')}catch(_){}
      }
    }

    updateWorldbossBars(p,b,pmax,bmax);
    const log=document.getElementById('v110Log');
    if(log)log.textContent=lines.slice(-8).join('\n');

    /* V6.349 final worldboss owner advanced one complete round every 430 ms. */
    await sleep(430);
  }

  const log=document.getElementById('v110Log');
  if(r?.won){
    try{window.v6111Sfx?.('win')}catch(_){}
    if(log){
      log.textContent=
        `🏆 DER SMARAGD-KOLOSS IST GEFALLEN!\n\n`+
        `Level ${Math.max(1,Number(s?.level)||1)} · Ausrüstung ${Math.round((Number(r?.readiness)||0)*100)} % · `+
        `${Math.max(0,Number(r?.crits)||0)} kritische Treffer\n\n`+
        `🔷 Garantierte mystische Beute:\n${r?.item?.name||'Mystische Beute'}`;
    }
  }else{
    try{window.v6111Sfx?.('lose')}catch(_){}
    if(log){
      const rest=bmax>0?Math.round((Math.max(0,Number(r?.boss_hp_end)||0)/bmax)*100):0;
      log.textContent=
        `☠️ Der Smaragd-Koloss hat dich besiegt.\n`+
        `Restleben: ${rest} % · Kritische Treffer: ${Math.max(0,Number(r?.crits)||0)}\n`+
        `Ausrüstungsstand: ${Math.round((Number(r?.readiness)||0)*100)} %.\n`+
        `Verbessere deine Ausrüstung und fordere ihn erneut heraus.`;
    }
  }
  if(btn)btn.disabled=false;
}
async function worldbossRun(){
  return serial(async()=>{
    bridge.busy=true;
    const btn=document.getElementById('v110Fight');
    if(btn)btn.disabled=true;
    try{
      const wb=ensure()?s.v110WorldBoss:null;
      if(wb?.freeUsed){
        if((Number(s.harzTaler)||0)<10){
          toast('Zu wenig Harz-Taler','warn','Ein weiterer Versuch gegen den Smaragd-Koloss kostet 10 Harz-Taler.');
          return {ok:false,reason:'INSUFFICIENT_HARZ'};
        }
        let ok=false;
        try{
          if(typeof v115Confirm==='function'){
            ok=!!(await v115Confirm(
              `Dein kostenloser Versuch wurde bereits verbraucht.\n\nWeiterer Versuch: 10 Harz-Taler\nAktuell: ${Math.max(0,Number(s.harzTaler)||0)} Harz-Taler`,
              {title:'Smaragd-Koloss erneut herausfordern?',type:'confirm',okText:'10 Harz-Taler nutzen',cancelText:'Abbrechen'}
            ));
          }else{
            ok=confirm(
              'Smaragd-Koloss erneut herausfordern?\n\n'+
              'Dein kostenloser Versuch wurde bereits verbraucht.\n'+
              'Dieser Versuch kostet 10 Harz-Taler.\n'+
              `Aktuell: ${Math.max(0,Number(s.harzTaler)||0)} Harz-Taler`
            );
          }
        }catch(_){ok=false}
        if(!ok)return {ok:false,reason:'USER_CANCELLED'};
      }

      const r=await rpc('v7072_worldboss_run');
      if(!r?.ok){
        applyActionResponse(r);
        toast('Weltboss','warn',reasonText(r));
        return r;
      }
      bridge.worldbossActions++;
      await animateWorldboss(r);
      applyActionResponse(r);
      try{v110Refresh?.()}catch(_){}
      if(r.won)toast('🔷 MYSTISCHER SIEG!','success',`${r.item?.name||'Mystische Beute'} erhalten!`);
      return r;
    }catch(e){
      bridge.lastError=String(e?.message||e);
      toast('Weltboss-Server nicht erreichbar','error',bridge.lastError);
      await refresh({quiet:true});
      return null;
    }finally{
      bridge.busy=false;
      if(btn)btn.disabled=false;
    }
  });
}

async function openTower(){
  try{v032Go?.('tower')}catch(e){console.warn('[V7072] open tower',e)}
  void refresh({quiet:true,paint:true}).then(()=>setTimeout(v7096ResumePreparedFight,0));
}
async function openWeekly(){
  try{window.v6239OpenWeeklyChest?.()}catch(e){console.warn('[V7072] open weekly',e)}
  void refresh({quiet:true,paint:true});
}
async function openWorldboss(){
  try{
    if(typeof window.v111OpenWorldBoss==='function')window.v111OpenWorldBoss();
    else window.v110Open?.();
  }catch(e){console.warn('[V7072] open worldboss',e)}
  void refresh({quiet:true,paint:true});
}

/* V7.096: expose the authoritative combat-door path to the preboot capture
   listener registered before all historical tower handlers. */
window.__V7096_TOWER_DIRECT_ROUTE__=idx=>towerAction('choose',String(idx??'0'));

/* If a run was already left in the old prep/doorTransition intermediate state,
   resume it directly when the tower is opened. No preview screen is required. */
function v7096ResumePreparedFight(){
 try{
  if(bridge.busy||bridge.v7096AutoFightBusy)return;
  if(!document.getElementById('tower')?.classList.contains('active'))return;
  const r=ensure()?s.tower?.run:null;
  if(!r?.active||!r?.enemy||!['prep','doorTransition'].includes(String(r.mode||'')))return;
  bridge.v7096AutoFightBusy=true;
  Promise.resolve(towerAction('fight',null)).finally(()=>{bridge.v7096AutoFightBusy=false});
 }catch(_){bridge.v7096AutoFightBusy=false}
}

/* Capture before historical onclick/document handlers. All mutating actions are
   fail-closed: if Supabase is unavailable, the old local mutation never runs. */
window.addEventListener('click',e=>{
  if(!(window.v7081UseAuthority?.('tower')||window.v7081UseAuthority?.('weekly')||window.v7081UseAuthority?.('worldboss')))return;
  const t=e.target instanceof Element?e.target:null;
  if(!t)return;

  if(!t.closest('#tower')){
    const towerNav=t.closest('[data-go="tower"],[data-screen="tower"]');
    if(towerNav){stop(e);void openTower();return}

    const weekly=t.closest('[data-weekly-chest]');
    if(weekly){stop(e);void openWeekly();return}

    const boss=t.closest('#v110WorldBossBtn,#world [data-boss]');
    if(boss){stop(e);void openWorldboss();return}
  }

  const wb=t.closest('#v110Fight');
  if(wb){stop(e);if(!wb.disabled)void worldbossRun();return}

  const wc=t.closest('#v6239WeeklyChestOverlay [data-v6239-open],#v6239WeeklyChestOverlay [data-v6239-claim],#v6239WeeklyChestOverlay [data-v6239-claim-all]');
  if(wc){
    stop(e);
    if(wc.matches('[data-v6239-open]'))void weeklyAction('open',null);
    else if(wc.matches('[data-v6239-claim]'))void weeklyAction('claim',String(wc.dataset.v6239Claim||''));
    else void weeklyAction('claim_all',null);
    return;
  }

  if(!t.closest('#tower'))return;

  const mut=
    t.closest('[data-vt-start],[data-vt-recover],[data-vt-route],[data-vt-fight],[data-vt-mut],[data-vt-reroll],[data-vt-next],[data-vt-bank],[data-vt-continue],[data-vt-grow],[data-vt-lab],[data-vt-buy],[data-vt-shop-leave],[data-vt-event-next],[data-vt-secret],[data-vt-up],[data-vt-wed-claim],[data-vt-wed-place-claim],[data-vt-abort]');
  if(!mut)return;

  stop(e);
  if(mut.matches(':disabled')||bridge.busy)return;

  if(mut.hasAttribute('data-vt-start'))void towerAction('start',null);
  else if(mut.hasAttribute('data-vt-recover'))void towerAction('recover',null,{success:'Turm-Erholung serverseitig aufgefüllt'});
  else if(mut.hasAttribute('data-vt-route'))void towerAction('choose',String(mut.dataset.vtRoute||'0'));
  else if(mut.hasAttribute('data-vt-fight'))void towerAction('fight',null);
  else if(mut.hasAttribute('data-vt-mut'))void towerAction('mutation',String(mut.dataset.vtMut||''));
  else if(mut.hasAttribute('data-vt-reroll'))void towerAction('reroll',null);
  else if(mut.hasAttribute('data-vt-next'))void towerAction('next',null);
  else if(mut.hasAttribute('data-vt-bank'))void towerAction('bank',null);
  else if(mut.hasAttribute('data-vt-continue'))void towerAction('checkpoint_continue',null);
  else if(mut.hasAttribute('data-vt-grow'))void towerAction(`grow_${String(mut.dataset.vtGrow||'')}`,null);
  else if(mut.hasAttribute('data-vt-lab')){
    const x=String(mut.dataset.vtLab||'');
    void towerAction(x==='mut'?'lab_genes':`lab_${x}`,null);
  }
  else if(mut.hasAttribute('data-vt-buy'))void towerAction(`merchant_${String(mut.dataset.vtBuy||'')}`,null);
  else if(mut.hasAttribute('data-vt-shop-leave'))void towerAction('merchant_leave',null);
  else if(mut.hasAttribute('data-vt-event-next'))void towerAction('next',null);
  else if(mut.hasAttribute('data-vt-secret'))void towerAction(`secret_${String(mut.dataset.vtSecret||'')}`,null);
  else if(mut.hasAttribute('data-vt-up'))void towerAction('upgrade',String(mut.dataset.vtUp||''));
  else if(mut.hasAttribute('data-vt-wed-claim'))void wednesdayClaim(String(mut.dataset.vtWedClaim||''));
  else if(mut.hasAttribute('data-vt-wed-place-claim'))void placementClaim();
  else if(mut.hasAttribute('data-vt-abort'))void confirmAbort();
},true);

/* The historical weekly listeners still observe the central event bus. Server
   triggers already award weekly progress, so restore the canonical local chest
   after the old listener returns and then quietly hydrate the server value. */
try{
  const oldBus=window.GL_EVENTS;
  if(oldBus&&typeof oldBus.emit==='function'&&!window.__V7072_WEEKLY_EVENT_GUARD__){
    const oldEmit=oldBus.emit.bind(oldBus);
    const guardedEmit=function(type,detail={},token=''){
      const protect=['questCompleted','dungeonWon','pvpWon','growHarvested','guildBossWon'].includes(type);
      const keep=protect&&ensure()?clone(s.v6239WeeklyChest):null;
      const result=oldEmit(type,detail,token);
      if(keep){
        s.v6239WeeklyChest=keep;
        persistLocal();
        setTimeout(()=>void refresh({quiet:true,paint:true}),180);
      }
      return result;
    };
    window.GL_EVENTS=Object.freeze({
      on:(...a)=>oldBus.on(...a),
      emit:guardedEmit,
      stats:(...a)=>oldBus.stats(...a)
    });
    window.glEmitGameEvent=guardedEmit;
    window.__V7072_WEEKLY_EVENT_GUARD__=true;
  }
}catch(e){console.warn('[V7072] weekly event guard',e)}

/* Calls from older auxiliary modules are now refresh hints only. */
try{
  window.v6239WeeklyChestActivity=function(){setTimeout(()=>void refresh({quiet:true}),120);return false};
  window.v6239WeeklyChestTowerFloor=function(){setTimeout(()=>void refresh({quiet:true}),120);return false};
}catch(_){}

window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>void refresh({quiet:true}),650),{passive:true});
window.addEventListener('pageshow',()=>setTimeout(()=>void refresh({quiet:true}),1000),{passive:true});
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&Date.now()-bridge.lastSync>60000)setTimeout(()=>void refresh({quiet:true}),250);
},{passive:true});
setTimeout(()=>void refresh({quiet:true}),2600);

window.v7072AuthorityRefresh=()=>refresh({quiet:false});
window.v7072AuthorityDiagnostics=()=>clone({
  version:VERSION,...bridge,
  uid:uid(),
  tower:window.vTowerDiagnostics?.()||null,
  weekly:window.v6239WeeklyChestDiagnostics?.()||null,
  worldboss:clone(s?.v110WorldBoss||null)
});
})();
