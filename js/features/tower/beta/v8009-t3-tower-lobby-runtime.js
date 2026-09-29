(()=>{'use strict';
if(window.__V8009_TOWER_LOBBY_RUNTIME_OWNER__)return;
window.__V8009_TOWER_LOBBY_RUNTIME_OWNER__=true;

window.v8009CreateTowerLobbyRuntime=function(c){
 const HOUR=60*60*1000,REFILL=20;
 let recoveryTimer=0,rankBusy=false;
 const st=()=>c.getState();
 function recoveryStep(level=Number(st()?.level)||1){
  level=Math.max(1,Math.floor(Number(level)||1));
  if(level<10)return 25;
  if(level<20)return 20;
  if(level<30)return 15;
  if(level<40)return 10;
  if(level<50)return 7;
  return 5;
 }
 function normalizeRecovery(t){
  const m=t.meta||(t.meta={}),now=Date.now();
  if(!Number.isFinite(Number(m.recoveryPct))||!Number.isFinite(Number(m.recoveryAt))){
   m.recoveryPct=100;m.recoveryAt=now;m.recoveryVersion=1;return 100;
  }
  let pct=c.clamp(Number(m.recoveryPct)||0,0,100),at=Math.max(0,Number(m.recoveryAt)||now);
  if(pct<100){
   const ticks=Math.max(0,Math.floor((now-at)/HOUR)),step=recoveryStep();
   if(ticks>0){pct=Math.min(100,pct+ticks*step);at+=ticks*HOUR;m.recoveryPct=pct;m.recoveryAt=at}
  }else m.recoveryPct=100;
  return pct;
 }
 function recoveryInfo(){
  const t=c.ensure(),pct=normalizeRecovery(t),m=t.meta,now=Date.now(),step=recoveryStep();
  let nextMs=0,fullMs=0;
  if(pct<100){
   const elapsed=Math.max(0,now-(Number(m.recoveryAt)||now));
   nextMs=Math.max(0,HOUR-(elapsed%HOUR));
   const steps=Math.ceil((100-pct)/step);
   fullMs=Math.max(0,nextMs+(steps-1)*HOUR);
  }
  return{pct,nextMs,fullMs,step,level:Math.max(1,Math.floor(Number(st()?.level)||1)),harz:Math.max(0,Number(st()?.harzTaler)||0)};
 }
 function recoveryTime(ms){
  ms=Math.max(0,Number(ms)||0);
  const totalMin=Math.max(1,Math.ceil(ms/60000)),h=Math.floor(totalMin/60),m=totalMin%60;
  return h<=0?`${m} Min.`:`${h} Std. ${m} Min.`;
 }
 function recoveryDiagnostics(){
  return{
   level:Math.max(1,Math.floor(Number(st()?.level)||1)),
   regenPerHour:recoveryStep(),
   tiers:[
    {levels:'1–9',pctPerHour:25,fullFromZeroHours:4},
    {levels:'10–19',pctPerHour:20,fullFromZeroHours:5},
    {levels:'20–29',pctPerHour:15,fullFromZeroHours:7},
    {levels:'30–39',pctPerHour:10,fullFromZeroHours:10},
    {levels:'40–49',pctPerHour:7,fullFromZeroHours:15},
    {levels:'50+',pctPerHour:5,fullFromZeroHours:20}
   ],
   current:recoveryInfo()
  };
 }
 function buyRecovery(){
  const t=c.ensure(),m=t.meta,pct=normalizeRecovery(t),state=st();
  if(t.run?.active)return c.toast('Während eines laufenden Turms nicht möglich.','warn');
  if(pct>=100)return c.toast('Turm-Erholung ist bereits voll.','info');
  if((Number(state.harzTaler)||0)<1)return c.toast('Du brauchst 1 Harz-Taler.','warn');
  state.harzTaler=Math.max(0,(Number(state.harzTaler)||0)-1);
  m.recoveryPct=Math.min(100,pct+REFILL);m.recoveryAt=Date.now();
  c.save(false);
  try{window.v282PaintHarzCard?.()}catch(e){try{window.v069SyncCurrencies?.()}catch(_){}}
  c.toast(`Turm-Erholung +${REFILL} %.`,'success');
  c.render();
 }
 function resetRecovery(t){
  const bonus=Math.max(0,Math.min(100,Number(t.meta?.pendingWednesdayRecovery)||0));
  t.meta.recoveryPct=bonus;t.meta.recoveryAt=Date.now();t.meta.recoveryVersion=1;t.meta.pendingWednesdayRecovery=0;
 }
 function scheduleRecoveryRender(){
  try{clearTimeout(recoveryTimer)}catch(e){}
  const t=c.ensure();if(t.run?.active)return;
  const x=recoveryInfo();if(x.pct>=100)return;
  recoveryTimer=setTimeout(()=>{
   try{const root=document.getElementById('tower');if(root?.classList.contains('active'))c.render()}catch(e){}
  },Math.max(1000,x.nextMs+250));
 }
 function startRun(){
  const t=c.ensure(),state=st();
  if(!state.playerClass){c.toast('Wähle zuerst deine Klasse.','warn');return}
  const recovery=normalizeRecovery(t);
  if(recovery<=0){c.toast('Dein Turm-Leben ist noch bei 0 %. Warte auf die erste Regeneration oder nutze 1 Harz-Taler für +20 %.','warn');return}
  const r={active:true,id:Date.now(),floor:1,cleared:0,hp:1,maxHp:1,score:0,buffs:[],unbanked:{gold:0,xp:0,tokens:0,items:[]},startedAt:Date.now(),eliteKills:0,bossKills:0,choices:[],mode:'route',mutationRerolls:1+(Number(t.meta.upgrades.mutation)||0),pendingMutationAfterCheckpoint:false,shopFlags:{},lastReward:null,lastRoomType:'combat',forceCombat:false,startBestFloor:Math.max(0,Number(t.season?.bestFloor)||0),startBestScore:Math.max(0,Number(t.season?.bestScore)||0),stats:{fights:0,damage:0,damageTaken:0,healing:0,crits:0,dodges:0,maxHit:0}};
  r.maxHp=c.towerMaxHp(r);r.hp=Math.max(1,Math.round(r.maxHp*recovery/100));r.startRecoveryPct=recovery;t.run=r;
  const wed=c.towerWednesdayEvent();
  if(wed.active&&wed.id==='mutation'){
   const good=['widow','northern','purplecrit','diesel','kush','trichome','roots','spore','cash','book','crown'];
   const id=c.pick(good.filter(x=>!r.buffs.includes(x)));if(id)c.applyTowerMutation(r,id);
  }
  r.choices=c.seededChoiceFloor(1);t.season.runs++;c.setTowerTab('run');c.save(false);c.render();c.syncProfile(true);
 }
 async function loadRanking(){
  if(rankBusy)return;rankBusy=true;
  const box=document.getElementById('vTRanking');
  if(box)box.innerHTML='<div class="vT-empty">Rangliste wird geladen …</div>';
  try{
   await c.syncProfile(true);
   const data=await c.fetchAllTowerProfiles(true),sid=c.seasonId();
   const rows=(data||[]).map(p=>{const t=p.dungeon_progress?.tower||{};return{...p,t}})
    .filter(p=>p.t?.season===sid&&(Number(p.t.best_score)||Number(p.t.active_score)||0)>0)
    .sort((a,b)=>Math.max(Number(b.t.best_score)||0,Number(b.t.active_score)||0)-Math.max(Number(a.t.best_score)||0,Number(a.t.active_score)||0)||Math.max(Number(b.t.best_floor)||0,Number(b.t.active_floor)||0)-Math.max(Number(a.t.best_floor)||0,Number(a.t.active_floor)||0))
    .slice(0,50);
   const uid=c.getUserId();
   if(box)box.innerHTML=rows.length?rows.map((p,i)=>`<div class="vT-leader-row ${String(p.id)===uid?'me':''}" data-class-id="${c.esc(p.class_id||'')}"><div class="vT-rank ${i<3?'top':''}">${i+1}</div><div class="vT-player"><b>${c.esc(p.character_name||'Unbekannt')}</b><span>${c.esc(p.class_name||'')} · Lv. ${Number(p.level)||1} · KP ${c.fmt(p.combat_power||0)}${Number(p.t.active_floor)>0?' · 🟢 Lauf aktiv':''}</span></div><div class="vT-score"><b>${c.fmt(Math.max(Number(p.t.best_score)||0,Number(p.t.active_score)||0))}</b><span>Etage ${Math.max(Number(p.t.best_floor)||0,Number(p.t.active_floor)||0)}</span></div></div>`).join(''):'<div class="vT-empty">In dieser Saison gibt es noch keine Turmwertung.</div>';
  }catch(e){
   if(box)box.innerHTML='<div class="vT-empty">Online-Rangliste momentan nicht erreichbar. Dein eigener Rekord bleibt gespeichert.</div>';
  }finally{rankBusy=false}
 }
 async function loadWednesdayRanking(){
  const live=c.towerWednesdayEvent(),target=live.active?live:c.lastCompletedWednesdayEvent(),box=document.getElementById('vTWednesdayRanking');
  if(!box)return;
  box.innerHTML=`<div class="vT-empty">${live.active?'Mittwochs-Rangliste wird geladen …':'Finale Mittwochs-Rangliste wird geladen …'}</div>`;
  try{
   const rows=(await c.fetchWednesdayRows(target)).slice(0,50),uid=c.getUserId();
   box.innerHTML=rows.length?rows.map((p,i)=>`<div class="vT-leader-row ${String(p.id)===uid?'me':''}" data-class-id="${c.esc(p.class_id||'')}"><div class="vT-rank ${i<3?'top':''}">${i+1}</div><div class="vT-player"><b>${c.esc(p.character_name||'Unbekannt')}</b><span>${c.esc(p.class_name||'')} · Lv. ${Number(p.level)||1} · ${target.icon} ${c.esc(target.name)}</span></div><div class="vT-score"><b>${c.fmt(p.w.best_score||0)}</b><span>Etage ${Number(p.w.best_floor)||0}</span></div></div>`).join(''):`<div class="vT-empty">${live.active?'Heute hat noch niemand einen Mittwochs-Turmwert gespeichert.':'Für den letzten Mittwoch ist noch keine finale Wertung verfügbar.'}</div>`;
   if(!live.active)c.paintWednesdayPlacementReward(rows,target,uid);
  }catch(e){box.innerHTML='<div class="vT-empty">Mittwochs-Rangliste momentan nicht erreichbar.</div>'}
 }
 return{recoveryStep,normalizeRecovery,recoveryInfo,recoveryTime,recoveryDiagnostics,buyRecovery,resetRecovery,scheduleRecoveryRender,startRun,loadRanking,loadWednesdayRanking};
};

window.v8009TowerLobbyRuntimeDiagnostics=()=>({owner:true,version:'V8.009-T3',factory:typeof window.v8009CreateTowerLobbyRuntime==='function'});
})();