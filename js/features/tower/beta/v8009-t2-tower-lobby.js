/* V8.009-T3 BETA · Tower startpage owner bundle.
   Recovery state + lobby view + one live HP painter. Stable index remains untouched. */
(()=>{'use strict';
if(window.__V8009_TOWER_RECOVERY_OWNER__)return;
window.__V8009_TOWER_RECOVERY_OWNER__=true;

const HOUR=60*60*1000;
const REFILL=20;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

function step(level){
 level=Math.max(1,Math.floor(Number(level)||1));
 if(level<10)return 25;
 if(level<20)return 20;
 if(level<30)return 15;
 if(level<40)return 10;
 if(level<50)return 7;
 return 5;
}

function normalize(t,level,now=Date.now()){
 if(!t||typeof t!=='object')return 100;
 const m=t.meta||(t.meta={});
 if(!Number.isFinite(Number(m.recoveryPct))||!Number.isFinite(Number(m.recoveryAt))){
   m.recoveryPct=100;
   m.recoveryAt=now;
   m.recoveryVersion=1;
   return 100;
 }
 let pct=clamp(Number(m.recoveryPct)||0,0,100);
 let at=Math.max(0,Number(m.recoveryAt)||now);
 if(pct<100){
   const ticks=Math.max(0,Math.floor((now-at)/HOUR));
   const perHour=step(level);
   if(ticks>0){
     pct=Math.min(100,pct+ticks*perHour);
     at+=ticks*HOUR;
     m.recoveryPct=pct;
     m.recoveryAt=at;
   }
 }else{
   m.recoveryPct=100;
 }
 return pct;
}

function info(t,level,harz,now=Date.now()){
 const pct=normalize(t,level,now);
 const m=t.meta||(t.meta={});
 const perHour=step(level);
 let nextMs=0,fullMs=0;
 if(pct<100){
   const elapsed=Math.max(0,now-(Number(m.recoveryAt)||now));
   nextMs=Math.max(0,HOUR-(elapsed%HOUR));
   const steps=Math.ceil((100-pct)/perHour);
   fullMs=Math.max(0,nextMs+(steps-1)*HOUR);
 }
 return{
   pct,
   nextMs,
   fullMs,
   step:perHour,
   level:Math.max(1,Math.floor(Number(level)||1)),
   harz:Math.max(0,Number(harz)||0)
 };
}

function formatTime(ms){
 ms=Math.max(0,Number(ms)||0);
 const totalMin=Math.max(1,Math.ceil(ms/60000));
 const h=Math.floor(totalMin/60),m=totalMin%60;
 if(h<=0)return `${m} Min.`;
 return `${h} Std. ${m} Min.`;
}

function panel(x,fmt){
 x=x&&typeof x==='object'?x:{pct:100,step:5,nextMs:0,fullMs:0,harz:0};
 fmt=typeof fmt==='function'?fmt:(n=>String(Math.round(Number(n)||0)));
 const pct=Math.max(0,Math.min(100,Number(x.pct)||0)),canStart=pct>0,full=pct>=100;
 const stepPct=Math.max(0,Number(x.step)||0);
 const startLabel=canStart?`🗼 Mit ${Math.round(pct)} % HP starten`:'🕒 Erste Regeneration abwarten';
 return `<div class="vT-recovery"><div class="vT-recovery-head"><b>💚 Turm-Erholung</b><strong>${Math.round(pct)} %</strong></div><div class="vT-recovery-bar"><i style="width:${pct}%"></i></div><div class="vT-recovery-meta"><span>+${Math.round(stepPct)} % pro Stunde</span><span>${full?'Vollständig erholt':`Nächste +${Math.round(stepPct)} % in ${formatTime(x.nextMs)} · 100 % in ${formatTime(x.fullMs)}`}</span></div><div class="vT-recovery-actions"><button class="vT-btn primary" data-vt-start ${canStart?'':'disabled'}>${startLabel}</button><button class="vT-btn gold" data-vt-recover ${full?'disabled':''}>🟢 +20 % auffüllen · 1 Harz-Taler <small style="display:block;opacity:.75">Bestand: ${fmt(x.harz)}</small></button></div></div>`;
}

function reset(t){
 if(!t||typeof t!=='object')return 0;
 const m=t.meta||(t.meta={});
 const bonus=Math.max(0,Math.min(100,Number(m.pendingWednesdayRecovery)||0));
 m.recoveryPct=bonus;
 m.recoveryAt=Date.now();
 m.recoveryVersion=1;
 m.pendingWednesdayRecovery=0;
 return bonus;
}

window.v8009TowerRecoveryOwner=Object.freeze({
 version:'V8.009-T3',
 HOUR,
 REFILL,
 step,
 normalize,
 info,
 formatTime,
 panel,
 reset
});

window.v8009TowerRecoveryDiagnostics=()=>({
 owner:true,
 version:'V8.009-T3',
 hourMs:HOUR,
 refillPct:REFILL
});
})();

(()=>{'use strict';
if(window.__V8009_TOWER_LOBBY_OWNER__)return;
window.__V8009_TOWER_LOBBY_OWNER__=true;

window.v8009TowerLobbyView=function(c){
 const {t,z,x,canStart,startFloor,ev,lastWed,w,esc,fmt,head,rewardTable}=c;
 const wedState=ev.active
   ? `<div class="v6269-event-state active v6277-live-state"><b>🔴 LIVE · ${ev.icon} ${esc(ev.name)}</b><span>MITTWOCHS-EVENT AKTIV · Beste Etage ${fmt(w.bestFloor||0)} · Score ${fmt(w.bestScore||0)}</span></div>`
   : `<div class="v6269-event-state"><b>🏁 Letztes Mittwochs-Event abgeschlossen</b><span>${esc(lastWed.name)} · ${esc(lastWed.key)} · finale Rangliste und Belohnung</span></div>`;
 const wedLiveBanner=ev.active?`<section class="v6277-wed-live-banner">
   <div class="v6277-wed-live-icon">${ev.icon}</div>
   <div class="v6277-wed-live-copy">
     <small>🔴 LIVE · NUR HEUTE</small>
     <strong>MITTWOCHS-EVENT AKTIV</strong>
     <b>${esc(ev.name)}</b>
     <span>${esc(ev.desc)}</span>
     <em>🏆 Event-Rangliste läuft · Platzierungsbelohnung nach Eventende</em>
   </div>
   <div class="v6278-wed-live-actions">
     <button class="vT-btn gold" data-vt-tab="rank">🏆 Event-Rangliste</button>
     <button class="vT-btn" data-vt-wed-rewards>🎁 Belohnungen ansehen</button>
   </div>
 </section>`:'';
 return `${head(null,'TURM-LOBBY · Jeder neue Run startet auf Etage 1.',false,'ANBAU-TURM')}
 ${wedLiveBanner}
 <div class="v6259-lobby">
   <div class="v6259-tower-picture"></div>
   <div class="v6259-lobby-card">
     <small>Start-Etage</small><strong>${startFloor}</strong>
     <div class="v6259-lobby-row"><span>❤️ Run-HP</span><b>${Math.round(x.pct)}%</b></div>
     <div class="v6259-hp"><i style="width:${x.pct}%"></i></div>
     <div class="v6267-recovery-note">Automatisch +${x.step}% pro Stunde</div>
     <button class="vT-btn gold v6267-recover-inline" data-vt-recover ${x.pct>=100?'disabled':''}>
       🟢 +20 % Run-HP · 1 Harz-Taler
       <small>Bestand: ${fmt(x.harz)}</small>
     </button>
     <div class="v6259-lobby-row"><span>🏆 Bestetage</span><b>${fmt(z.bestFloor||0)}</b></div>
     <div class="v6259-lobby-row"><span>⭐ Bestscore</span><b>${fmt(z.bestScore||0)}</b></div>
     <div class="v6259-lobby-row"><span>🍃 Turmblätter</span><b>${fmt(t.meta.tokens)}</b></div>
     <button class="vT-btn primary v6259-main-btn" data-vt-start ${canStart?'':'disabled'}>${z.bestFloor>0?'Run starten':'Ersten Run starten'}</button>
   </div>
 </div>

 <div class="v6269-lobby-nav">
   <button class="vT-btn gold" data-vt-tab="rank">🏆 Komplette Ranglisten</button>
   <button class="vT-btn" data-vt-tab="meta">🍃 Turm-Aufstieg</button>
 </div>

 <div class="v6269-lobby-rank-grid">
   <section class="v6269-lobby-rank-card">
     <header><div><small>SAISON</small><b>🏆 Turm-Rangliste</b></div><button data-vt-tab="rank">Alle</button></header>
     <div class="v6269-own-rank"><span>Dein Rekord</span><b>Etage ${fmt(z.bestFloor||0)} · ${fmt(z.bestScore||0)} Score</b></div>
     <div id="vTRanking" class="vT-leader v6269-lobby-leader"><div class="vT-empty">Rangliste wird geladen …</div></div>
   </section>

   <section class="v6269-lobby-rank-card event ${ev.active?'active':''}">
     <header><div><small>${ev.active?'🔴 LIVE · MITTWOCH':'MITTWOCH'}</small><b>${ev.active?`MITTWOCHS-EVENT AKTIV · ${ev.icon} ${esc(ev.name)}`:'🏁 Finale Event-Rangliste'}</b></div><button data-vt-tab="rank">${ev.active?'LIVE':'Alle'}</button></header>
     ${wedState}
     <div id="vTWednesdayRanking" class="vT-leader v6269-lobby-leader"><div class="vT-empty">Mittwochs-Rangliste wird geladen …</div></div>
     <div id="vTWednesdayReward"><div class="vT-empty">Platzierungsbelohnung wird geprüft …</div></div>
     ${rewardTable()}
   </section>
 </div>

 `;
};

window.v8009TowerLobbyDiagnostics=()=>({
 owner:true,
 version:'V8.009-T2',
 separatedFromMainTowerSystem:true
});
})();


(()=>{'use strict';
if(window.__V8009_TOWER_LOBBY_LIVE_OWNER__)return;
window.__V8009_TOWER_LOBBY_LIVE_OWNER__=true;
/* Preempt the later embedded V6.341/V6.345 painters in beta.html.
   Their public compatibility functions are provided by this single owner. */
window.__V6341_TOWER_RECOVERY_LIVE__=true;
window.__V6345_TOWER_LOBBY_HP_TIMER__=true;

const pad=n=>String(Math.max(0,Math.floor(Number(n)||0))).padStart(2,'0');
const clock=ms=>{
 const sec=Math.max(0,Math.ceil((Number(ms)||0)/1000));
 const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;
 return `${pad(h)}:${pad(m)}:${pad(s)}`;
};
function info(){
 try{
   const d=window.v6250TowerRecoveryDiagnostics?.();
   return d?.current&&typeof d.current==='object'?d.current:null;
 }catch(_){return null}
}
function towerActive(){
 const root=document.getElementById('tower');
 return !document.hidden&&!!root?.classList.contains('active');
}
function paintResultRecovery(){
 if(document.hidden)return false;
 const root=document.getElementById('tower');
 const bar=root?.querySelector('.vT-recovery-bar');
 if(!root||!bar)return false;
 const x=info();if(!x)return false;
 let live=bar.querySelector('.v6341-recovery-live');
 if(!live){
   live=document.createElement('span');
   live.className='v6341-recovery-live';
   bar.appendChild(live);
 }
 const pct=Math.max(0,Math.min(100,Number(x.pct)||0));
 const step=Math.max(0,Number(x.step)||0);
 const next=Math.max(0,Math.min(step,100-pct));
 const full=pct>=100;
 live.classList.toggle('full',full);
 live.innerHTML=full
   ?'💚 100 % · VOLLSTÄNDIG ERHOLT'
   :`💚 ${Math.round(pct)} % HP · <b>+${Math.round(next)} % in ${clock(x.nextMs)}</b>`;
 const fill=bar.querySelector(':scope > i');
 if(fill)fill.style.width=`${pct}%`;
 const head=root.querySelector('.vT-recovery-head strong');
 if(head)head.textContent=`${Math.round(pct)} %`;
 const meta=root.querySelector('.vT-recovery-meta');
 if(meta){
   const spans=meta.querySelectorAll('span');
   if(spans[0])spans[0].textContent=`+${Math.round(step)} % HP pro Stunde`;
   if(spans[1])spans[1].textContent=full
     ?'Vollständig erholt'
     :`Nächste +${Math.round(next)} % in ${clock(x.nextMs)} · 100 % in ${typeof x.fullMs==='number'?clock(x.fullMs):'--:--:--'}`;
 }
 return true;
}
function paintLobby(){
 if(!towerActive())return false;
 const root=document.getElementById('tower');
 const bar=root?.querySelector('.v6259-lobby-card .v6259-hp');
 if(!bar)return false;
 const x=info();if(!x)return false;
 const pct=Math.max(0,Math.min(100,Number(x.pct)||0));
 const step=Math.max(0,Number(x.step)||0);
 const next=Math.max(0,Math.min(step,100-pct));
 const full=pct>=100;
 let live=bar.querySelector('.v6345-lobby-hp-live');
 if(!live){
   live=document.createElement('span');
   live.className='v6345-lobby-hp-live';
   bar.appendChild(live);
 }
 live.classList.toggle('full',full);
 live.innerHTML=full
   ?'💚 100 % · VOLLSTÄNDIG ERHOLT'
   :`💚 ${Math.round(pct)} % HP · <b>+${Math.round(next)} % in ${clock(x.nextMs)}</b>`;
 const fill=bar.querySelector(':scope > i');
 if(fill)fill.style.width=`${pct}%`;
 const row=[...root.querySelectorAll('.v6259-lobby-card .v6259-lobby-row')]
   .find(el=>/Run-HP/i.test(el.textContent||''));
 const val=row?.querySelector('b');
 if(val)val.textContent=`${Math.round(pct)}%`;
 const note=root.querySelector('.v6259-lobby-card .v6267-recovery-note');
 if(note)note.textContent=full
   ?'Turm-Leben vollständig regeneriert'
   :`Automatisch +${Math.round(step)}% pro Stunde · nächste +${Math.round(next)}% in ${clock(x.nextMs)}`;
 return true;
}
function paintAll(){
 if(!towerActive())return false;
 paintLobby();
 paintResultRecovery();
 return true;
}

window.v6341PaintTowerRecoveryTimer=paintResultRecovery;
window.v6345PaintTowerLobbyHpTimer=paintLobby;
window.v6345PaintTowerTimers=paintAll;

let timer=0;
function stop(){
 if(!timer)return;
 clearInterval(timer);
 timer=0;
}
function start(){
 if(timer||!towerActive())return;
 paintAll();
 timer=window.setInterval(()=>{
   if(!towerActive()){stop();return}
   paintAll();
 },1000);
}
function syncTimer(){towerActive()?start():stop()}

document.addEventListener('visibilitychange',()=>{
 syncTimer();
 if(!document.hidden)paintAll();
},{passive:true});
document.addEventListener('click',e=>{
 const el=e.target instanceof Element?e.target:null;
 if(el?.closest?.('[data-go="tower"],[data-screen="tower"],[data-vt-recover],[data-vt-start],[data-vt-tab]')){
   setTimeout(()=>{syncTimer();paintAll()},60);
 }
},true);
window.addEventListener('pageshow',()=>setTimeout(()=>{syncTimer();paintAll()},100),{passive:true});
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>{syncTimer();paintAll()},220),{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',()=>setTimeout(syncTimer,0),{passive:true});

window.v8009TowerLobbyLiveDiagnostics=()=>({
 owner:true,
 version:'V8.009-T3',
 active:towerActive(),
 timerActive:!!timer,
 recoveryOwner:!!window.v8009TowerRecoveryOwner
});

syncTimer();
})();


(()=>{'use strict';
if(window.__V8009_TOWER_LOBBY_CONTROLLER_OWNER__)return;
window.__V8009_TOWER_LOBBY_CONTROLLER_OWNER__=true;

window.v8009CreateTowerLobbyController=function(c){
 let recoveryTimer=0,rankBusy=false;
 function buyRecovery(){
  const t=c.ensure(),m=t.meta,pct=c.normalizeRecovery(t),state=c.getState();
  if(t.run?.active)return c.toast('Während eines laufenden Turms nicht möglich.','warn');
  if(pct>=100)return c.toast('Turm-Erholung ist bereits voll.','info');
  if((Number(state.harzTaler)||0)<1)return c.toast('Du brauchst 1 Harz-Taler.','warn');
  const refill=Math.max(1,Number(c.recoveryOwner()?.REFILL)||20);
  state.harzTaler=Math.max(0,(Number(state.harzTaler)||0)-1);
  m.recoveryPct=Math.min(100,pct+refill);m.recoveryAt=Date.now();
  c.save(false);
  try{window.v282PaintHarzCard?.()}catch(e){try{window.v069SyncCurrencies?.()}catch(_){}}
  c.toast(`Turm-Erholung +${refill} %.`,'success');
  c.render();
 }
 function scheduleRecoveryRender(){
  try{clearTimeout(recoveryTimer)}catch(e){}
  const t=c.ensure();if(t.run?.active)return;
  const x=c.recoveryInfo();if(x.pct>=100)return;
  recoveryTimer=setTimeout(()=>{
   try{const root=document.getElementById('tower');if(root?.classList.contains('active'))c.render()}catch(e){}
  },Math.max(1000,x.nextMs+250));
 }
 function startRun(){
  const t=c.ensure(),state=c.getState();
  if(!state.playerClass){c.toast('Wähle zuerst deine Klasse.','warn');return}
  const recovery=c.normalizeRecovery(t);
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
 function renderLobby(){
  const t=c.ensure(),z=t.season;
  c.normalizeRecovery(t);
  const x=c.recoveryInfo(),canStart=x.pct>0,startFloor=1;
  const ev=c.towerWednesdayEvent(),lastWed=c.lastCompletedWednesdayEvent(),w=ev.active?c.wednesdayState():(t.wednesday||{});
  const view=window.v8009TowerLobbyView;
  if(typeof view!=='function')throw new Error('V8.009 Tower lobby owner missing');
  return view({
   t,z,x,canStart,startFloor,ev,lastWed,w,
   esc:c.esc,fmt:c.fmt,head:c.head,rewardTable:c.rewardTable
  });
 }
 function bindLobby(root){
  if(!root)return false;
  root.querySelectorAll('[data-vt-tab]').forEach(b=>b.onclick=()=>{c.setTowerTab(b.dataset.vtTab);c.render()});
  root.querySelectorAll('[data-vt-start]').forEach(b=>b.onclick=startRun);
  root.querySelectorAll('[data-vt-recover]').forEach(b=>b.onclick=buyRecovery);
  root.querySelectorAll('[data-vt-wed-rewards]').forEach(b=>b.onclick=()=>{
   c.setTowerTab('rank');c.render();
   setTimeout(()=>{
    const d=document.querySelector('#tower .v6276-wed-prizes');
    if(d){d.open=true;d.scrollIntoView({behavior:'smooth',block:'center'})}
   },40);
  });
  return true;
 }
 return{buyRecovery,scheduleRecoveryRender,startRun,loadRanking,loadWednesdayRanking,renderLobby,bindLobby};
};

window.v8009TowerLobbyControllerDiagnostics=()=>({
 owner:true,
 version:'V8.009-T5',
 factory:typeof window.v8009CreateTowerLobbyController==='function'
});
})();
