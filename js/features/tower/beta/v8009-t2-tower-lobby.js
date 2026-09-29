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
