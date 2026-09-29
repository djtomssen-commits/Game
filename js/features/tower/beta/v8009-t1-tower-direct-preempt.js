(()=>{
'use strict';
if(window.__V7096_TOWER_DIRECT_PREEMPT__)return;
window.__V7096_TOWER_DIRECT_PREEMPT__=true;

/* V8.009-T10: authoritative Tower route owner.
   A door choice only chooses the room. Combat starts only from the visible
   "Kampf beginnen" button. This prevents choose+fight collapsing into one tap. */
const G=window.__V8009_TOWER_ROUTE_GUARD__||(window.__V8009_TOWER_ROUTE_GUARD__={
  routeBusy:false,prepared:false,floor:0,duplicateTaps:0,chooseCalls:0,lastError:''
});
const clone=x=>{try{return structuredClone(x)}catch(_){try{return JSON.parse(JSON.stringify(x))}catch(__){return x}}};
const state=()=>{try{return typeof s!=='undefined'?s:(window.s||null)}catch(_){return window.s||null}};
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return''}};
const one=x=>Array.isArray(x)?x[0]:x;
const toast=(t,type='info',d='')=>{try{return window.v063Toast?.(t,type,d)}catch(_){}};

function visualDungeon(floor){return 2+((Math.max(1,Math.floor(Number(floor)||1))-1)%19)}
function bossDungeon(floor){return 10+((((Math.max(1,Math.floor(Number(floor)||10))/10)|0)-1)%11)}
function enrichRun(run){
 if(!run||typeof run!=='object'||!run.enemy)return run;
 const e=run.enemy,type=String(e.type||run.currentChoice?.type||'normal').toLowerCase();
 const miniboss=!!(e.miniboss||run.currentChoice?.miniboss),f=Math.max(1,Number(run.floor)||1);
 e.boss=type==='boss';e.elite=type==='elite'||miniboss;e.miniboss=miniboss;
 if(!e.bg){const d=type==='boss'?bossDungeon(f):visualDungeon(f);e.bg=`v474_dungeon_assets/d${d}_bg.jpg`}
 if(!e.art){
  if(type==='boss'){const d=bossDungeon(f);e.art=`v474_dungeon_assets/d${d}_boss.png`}
  else{const d=visualDungeon(f),room=miniboss?9:1+((f*5+(type==='elite'?3:0))%9);e.art=`v474_dungeon_assets/d${d}_${room}.png`}
 }
 return run;
}
function ensureShape(st){
 if(!st)return false;
 st.tower=(st.tower&&typeof st.tower==='object')?st.tower:{};
 st.tower.meta=(st.tower.meta&&typeof st.tower.meta==='object')?st.tower.meta:{};
 st.tower.season=(st.tower.season&&typeof st.tower.season==='object')?st.tower.season:{};
 st.v6239WeeklyChest=(st.v6239WeeklyChest&&typeof st.v6239WeeklyChest==='object')?st.v6239WeeklyChest:{};
 st.v110WorldBoss=(st.v110WorldBoss&&typeof st.v110WorldBoss==='object')?st.v110WorldBoss:{};
 st.v488Forge=(st.v488Forge&&typeof st.v488Forge==='object')?st.v488Forge:{};
 st.grow=(st.grow&&typeof st.grow==='object')?st.grow:{};
 st.grow.seeds=(st.grow.seeds&&typeof st.grow.seeds==='object')?st.grow.seeds:{};
 return true;
}
function applySnapshot(snapshot){
 const st=state();if(!snapshot?.ok||!ensureShape(st))return false;
 const tw=snapshot.tower?.state;
 if(tw&&typeof tw==='object'){
  const t=st.tower;
  t.meta.tokens=Math.max(0,Number(tw.tokens)||0);
  t.meta.upgrades=clone(tw.upgrades||{heal:0,roots:0,leaves:0,harvest:0,mutation:0});
  t.meta.recoveryPct=Math.max(0,Math.min(100,Number(tw.recovery_pct)||0));
  t.meta.recoveryAt=tw.recovery_at?Date.parse(tw.recovery_at):Date.now();
  t.meta.pendingWednesdayRecovery=Math.max(0,Number(tw.pending_recovery)||0);
  t.season.id=String(tw.season_id||'');
  t.season.bestFloor=Math.max(0,Number(tw.best_floor)||0);
  t.season.bestScore=Math.max(0,Number(tw.best_score)||0);
  t.season.bestTime=Math.max(0,Number(tw.best_time_ms)||0);
  t.season.runs=Math.max(0,Number(tw.runs)||0);
  t.season.bossKills=Math.max(0,Number(tw.boss_kills)||0);
  t.season.eliteKills=Math.max(0,Number(tw.elite_kills)||0);
  let run=tw.run==null?null:enrichRun(clone(tw.run));
  if(run&&['doorTransition','prep'].includes(String(run.mode||''))){
    run.v7072ServerMode=String(run.mode||'prep');
    G.prepared=true;G.floor=Math.max(1,Number(run.floor)||1);
    run.mode='v8009prep';
  }else if(!run||String(run.mode||'')!=='v8009prep'){
    G.prepared=false;G.floor=0;
  }
  t.run=run;
  t.lastResult=tw.last_result==null?null:clone(tw.last_result);
  t.wednesday=clone(tw.wednesday||{});
  t.wednesdayHistory=clone(tw.wednesday_history||{});
 }
 const wc=snapshot.weekly?.state;
 if(wc&&typeof wc==='object'){
  const z=st.v6239WeeklyChest;
  z.cycleKey=String(wc.cycle_key||'');z.xp=Math.max(0,Number(wc.xp)||0);
  z.maxLevelEver=Math.max(1,Number(wc.max_level_ever)||1);
  z.totalOpened=Math.max(0,Number(wc.total_opened)||0);
  z.lifetimeXp=Math.max(0,Number(wc.lifetime_xp)||0);
  z.towerMaxFloor=Math.max(0,Number(wc.tower_max_floor)||0);
  z.daily={key:String(wc.daily_key||''),pvpWins:Math.max(0,Number(wc.daily_pvp_wins)||0),plants:Math.max(0,Number(wc.daily_plants)||0)};
  z.pending=wc.pending==null?null:clone(wc.pending);z.lastOpened=wc.last_opened==null?null:clone(wc.last_opened);
 }
 const p=snapshot.progress||{};
 if(Number.isFinite(Number(p.level)))st.level=Math.max(1,Number(p.level));
 if(Number.isFinite(Number(p.xp)))st.xp=Math.max(0,Number(p.xp));
 if(Number.isFinite(Number(p.gold)))st.gold=Math.max(0,Number(p.gold));
 if(Number.isFinite(Number(p.harz)))st.harzTaler=Math.max(0,Number(p.harz));
 const it=snapshot.items||{};
 if(Array.isArray(it.inventory))st.inventory=clone(it.inventory);
 if(Array.isArray(it.materials))st.materials=clone(it.materials);
 if(it.equipment&&typeof it.equipment==='object')st.equipment=clone(it.equipment);
 if(Number.isFinite(Number(it.fragments)))st.v488Forge.fragments=Math.max(0,Number(it.fragments));
 const sd=snapshot.seeds||{};
 if(sd.grow_seeds&&typeof sd.grow_seeds==='object')st.grow.seeds=clone(sd.grow_seeds);
 if(Number.isFinite(Number(sd.time_seeds)))st.timeSeeds=Math.max(0,Number(sd.time_seeds));
 try{
  const k=(typeof KEY!=='undefined'&&KEY)?KEY:'grow_idle_save_v1';
  localStorage.setItem(k,JSON.stringify(st));
 }catch(_){}
 return true;
}
function installPreparedRenderGuard(){
 const base=window.vTowerRender;
 if(typeof base!=='function'||base.__v8009PreparedGuard)return;
 const wrapped=function(){
  const st=state(),run=st?.tower?.run;
  if(G.prepared&&run?.active&&Number(run.floor)===Number(G.floor)&&['prep','doorTransition','v8009prep'].includes(String(run.mode||''))){
   run.mode='prep';
   try{return base.apply(this,arguments)}
   finally{if(G.prepared&&st?.tower?.run===run)run.mode='v8009prep'}
  }
  return base.apply(this,arguments);
 };
 wrapped.__v8009PreparedGuard=true;wrapped.__v8009Base=base;
 window.vTowerRender=wrapped;
}
function setBusy(on){
 G.routeBusy=!!on;
 try{document.querySelectorAll('#tower [data-vt-route]').forEach(b=>{b.disabled=G.routeBusy;if(G.routeBusy)b.setAttribute('aria-busy','true');else b.removeAttribute('aria-busy')})}catch(_){}
}
function previewFor(idx){
 const st=state(),run=clone(st?.tower?.run);if(!run?.active)return null;
 const choice=Array.isArray(run.choices)?run.choices[Math.max(0,Number(idx)||0)]:null;
 if(!choice||!['normal','elite','boss'].includes(String(choice.type||'')))return null;
 run.routeChoiceIndex=Math.max(0,Number(idx)||0);run.currentChoice=choice;
 const type=String(choice.type||'normal').toLowerCase(),f=Math.max(1,Number(run.floor)||1),miniboss=!!choice.miniboss;
 const d=type==='boss'?bossDungeon(f):visualDungeon(f),room=miniboss?9:1+((f*5+(type==='elite'?3:0))%9);
 run.enemy={type,boss:type==='boss',elite:type==='elite'||miniboss,miniboss,name:type==='boss'?'Turm-Boss':miniboss?'Turmwächter':type==='elite'?'Elite-Wächter':'Turmwächter',bg:`v474_dungeon_assets/d${d}_bg.jpg`,art:type==='boss'?`v474_dungeon_assets/d${d}_boss.png`:`v474_dungeon_assets/d${d}_${room}.png`};
 return run;
}
async function chooseRoute(idx){
 if(G.routeBusy){G.duplicateTaps++;return false}
 const x=db(),id=uid();if(!x||!id){toast('Turm-Server nicht erreichbar','error','Serververbindung fehlt.');return false}
 setBusy(true);G.chooseCalls++;
 const preview=previewFor(idx);
 const previewPromise=preview?Promise.resolve(window.v7298TowerDoorPreview?.(preview,idx,900)).catch(()=>false):Promise.resolve(false);
 try{
  const {data,error}=await x.rpc('v7072_tower_action',{p_action:'choose',p_arg:String(idx??'0')});
  if(error)throw error;
  const r=one(data);
  if(!r?.ok){
   G.lastError=String(r?.reason||'SERVER_REJECTED');
   toast('Turm-Aktion abgelehnt','warn',G.lastError);
   try{window.vTowerRender?.()}catch(_){}
   return false;
  }
  if(preview)await previewPromise;
  if(!applySnapshot(r.snapshot)){
   G.lastError='SNAPSHOT_MISSING';
   toast('Turmstatus wird neu geladen','warn','Serverantwort war unvollständig.');
   try{await window.v7072AuthorityRefresh?.()}catch(_){}
   return false;
  }
  installPreparedRenderGuard();
  try{window.v069SyncCurrencies?.()}catch(_){}
  try{window.v441PaintResources?.()}catch(_){}
  try{window.vTowerRender?.()}catch(e){console.warn('[V8.009-T10] Tower render',e)}
  G.lastError='';
  return true;
 }catch(e){
  G.lastError=String(e?.message||e);
  toast('Turm-Server nicht erreichbar','error',G.lastError);
  try{window.vTowerRender?.()}catch(_){}
  return false;
 }finally{setBusy(false)}
}

/* Install after the rest of the page has established the final render wrappers. */
setTimeout(installPreparedRenderGuard,0);
window.addEventListener('growlegends:account-ready',()=>setTimeout(installPreparedRenderGuard,80),{passive:true});

window.addEventListener('click',e=>{
 try{
  const t=e.target instanceof Element?e.target:null;if(!t)return;
  const fight=t.closest?.('#tower [data-vt-fight]');
  if(fight&&window.v7081UseAuthority?.('tower')){G.prepared=false;G.floor=0;return}
  const b=t.closest?.('#tower [data-vt-route]');
  if(!b||!window.v7081UseAuthority?.('tower'))return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  if(G.routeBusy||b.disabled){G.duplicateTaps++;return}
  void chooseRoute(String(b.dataset.vtRoute||'0'));
 }catch(err){G.lastError=String(err?.message||err);setBusy(false);console.warn('[V8.009-T10] tower route owner',err)}
},true);

window.v8009TowerRouteGuardDiagnostics=()=>({...G,version:'V8.009-T10',renderGuard:!!window.vTowerRender?.__v8009PreparedGuard});
})();
