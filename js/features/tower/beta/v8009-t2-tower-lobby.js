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
