from pathlib import Path
import hashlib,json

stable_path=Path('index.html')
beta_path=Path('beta.html')
system_path=Path('js/features/tower/beta/v8009-t1-tower-system.js')
owner_path=Path('js/features/tower/beta/v8009-t2-tower-lobby.js')

stable=stable_path.read_text(encoding='utf-8')
beta=beta_path.read_text(encoding='utf-8')
system=system_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
beta_before=hashlib.sha256(beta.encode()).hexdigest()

def extract_function(src,name):
    marks=['function '+name+'(','function '+name+' (']
    starts=[src.find(x) for x in marks]
    starts=[x for x in starts if x>=0]
    if not starts: raise RuntimeError(name+' not found')
    i=min(starts)
    brace=src.find('{',i)
    depth=1;quote=None;esc=False;k=brace+1;template=chr(96)
    while k<len(src) and depth:
        ch=src[k]
        if quote is not None:
            if esc: esc=False
            elif ch==chr(92): esc=True
            elif ch==quote: quote=None
        else:
            if ch in ("'",'"',template): quote=ch
            elif ch=='{': depth+=1
            elif ch=='}': depth-=1
        k+=1
    if depth: raise RuntimeError('unterminated '+name)
    return i,k,src[i:k]

i,k,old_lobby=extract_function(system,'lobby')
required=['v6259-lobby-card','vTRanking','vTWednesdayRanking','data-vt-start','wednesdayRewardTable']
for token in required:
    if token not in old_lobby: raise RuntimeError('old lobby missing '+token)

delegate="""function lobby(){
 const t=ensure(),z=t.season;normalizeTowerRecovery(t);
 const x=towerRecoveryInfo(),canStart=x.pct>0,startFloor=1;
 const ev=towerWednesdayEvent(),lastWed=lastCompletedWednesdayEvent(),w=ev.active?wednesdayState():(t.wednesday||{});
 const view=window.v8009TowerLobbyView;
 if(typeof view!=='function')throw new Error('V8.009 Tower lobby owner missing');
 return view({
   t,z,x,canStart,startFloor,ev,lastWed,w,
   esc,fmt,head:v6259Head,rewardTable:wednesdayRewardTable
 });
}"""
system=system[:i]+delegate+system[k:]
system_path.write_text(system,encoding='utf-8')

owner="""(()=>{'use strict';
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
"""
owner_path.write_text(owner,encoding='utf-8')

tag='<script id="vTower-system" src="js/features/tower/beta/v8009-t1-tower-system.js"></script>'
if beta.count(tag)!=1: raise RuntimeError('tower system tag expected once')
owner_tag='<script id="v8009-tower-lobby-owner" src="js/features/tower/beta/v8009-t2-tower-lobby.js"></script>\n'
if 'js/features/tower/beta/v8009-t2-tower-lobby.js' not in beta:
    beta=beta.replace(tag,owner_tag+tag,1)

if "window.GROW_BETA_TECH_BUILD='V8.009-T1'" in beta:
    beta=beta.replace("window.GROW_BETA_TECH_BUILD='V8.009-T1'","window.GROW_BETA_TECH_BUILD='V8.009-T2'",1)
elif "window.GROW_BETA_TECH_BUILD='V8.009-T2'" not in beta:
    raise RuntimeError('T1 marker missing')

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('stable changed')

report={
 'build':'V8.009-T2-BETA',
 'phase':'Tower T2 startpage lobby owner',
 'scope':'beta only',
 'owner':owner_path.as_posix(),
 'main_system':system_path.as_posix(),
 'old_lobby_bytes':len(old_lobby.encode()),
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':beta_before,
 'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
 'gameplay_changed':False,
 'server_authority_changed':False
}
Path('V8009_TOWER_T2_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
