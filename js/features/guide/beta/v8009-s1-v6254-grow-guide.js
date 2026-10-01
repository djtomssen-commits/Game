(()=>{
 'use strict';
 if(window.__V6254_GROW_GUIDE__)return;
 window.__V6254_GROW_GUIDE__=true;

 const GUIDES={
  world:{label:'Startseite',icon:'🏠',steps:[
   ['Alles auf einen Blick','Auf der Startseite siehst du aktive Events, wichtige Ressourcen und Hinweise zu deinem Charakter.'],
   ['Deine nächsten Aufgaben','Achte auf freie Talentpunkte, unverzauberte oder ungesockelte Ausrüstung und aktive Set-Boni.'],
   ['Direkt ins Abenteuer','Von hier kommst du schnell zu Quests, Dungeons, Growroom, Turm und den anderen großen Spielsystemen.']
  ]},
  character:{label:'Charakter',icon:'🧙',steps:[
   ['Ausrüstung','Hier legst du Waffen, Rüstung und Schmuck an. Vergleiche neue Gegenstände immer mit deiner aktuell getragenen Ausrüstung.'],
   ['Verzaubern & Edelsteine','Jeder Gegenstand kann verbessert werden. Verzauberungen und Edelsteine geben zusätzliche Werte.'],
   ['Hauptattribut','Deine Klasse hat ein Hauptattribut. Stärke, Geschick oder Intelligenz bestimmt einen großen Teil deiner Kampfkraft.'],
   ['Talente','Talentpunkte werden mit deinem Level freigeschaltet. Manche Knoten brauchen zusätzlich ein Mindestlevel oder vorherige Schlüsseltalente.']
  ]},
  grow:{label:'Growroom',icon:'🌿',steps:[
   ['Samen pflanzen','Kaufe oder finde Samen und pflanze sie in freie Plätze im Growroom.'],
   ['Pflegen','Pflanzen brauchen Pflege. Regelmäßige Pflege verbessert deinen Grow und verhindert, dass du Ertrag verschenkst.'],
   ['Wetter & Sorten','Wetter und besondere Sorten verändern Wachstum, Ertrag und andere Effekte.'],
   ['Ernten','Erntereife Pflanzen einsammeln. Grow-Aktivitäten können außerdem Aufgaben, Gildenfortschritt und andere Systeme beeinflussen.']
  ]},
  quests:{label:'Quests',icon:'📜',steps:[
   ['Dampf einsetzen','Quests kosten Dampf. Dein Dampf ist deshalb eine deiner wichtigsten täglichen Ressourcen.'],
   ['Quest auswählen','Du bekommst mehrere Quests zur Auswahl. Dauer und Schwierigkeit beeinflussen Belohnung und Fortschritt.'],
   ['Zeit-Samen','Mit Zeit-Samen kannst du laufende Questzeit überspringen. Hebe sie dir für Situationen auf, in denen sie dir wirklich helfen.']
  ]},
  dungeon:{label:'Dungeons',icon:'👹',steps:[
   ['10 Gegner pro Dungeon','Jeder Dungeon besteht aus 10 Kämpfen. Der zehnte Gegner ist der Boss.'],
   ['Versuche','Dungeonversuche regenerieren sich. Plane schwierige Gegner, statt alle Versuche sofort zu verbrauchen.'],
   ['Fortschritt & Beute','Mit jedem Sieg arbeitest du dich zum Boss vor und kannst wertvolle Ausrüstung und andere Belohnungen finden.']
  ]},
  tower:{label:'Anbau-Turm',icon:'🗼',steps:[
   ['Ein Lauf – eine HP-Leiste','Ein Turmlauf startet mit deiner aktuell regenerierten Turm-HP. Nach dem Lauf muss sie sich wieder erholen.'],
   ['Regeneration','Kleinere Charaktere regenerieren Turm-HP schneller. Ab Level 50 gelten 5 % Regeneration pro Stunde.'],
   ['Höher = wertvoller','Je weiter du kommst, desto anspruchsvoller werden die Kämpfe und desto interessanter die Turmbelohnungen.']
  ]},
  shop:{label:'Händler',icon:'🛒',steps:[
   ['Zwei Händler','Bei den Händlern findest du Ausrüstung sowie Schmuck, Edelsteine und Verzauberungsrollen.'],
   ['Angebot wechselt','Das Angebot wird regelmäßig erneuert. Prüfe Werte und Klasse, bevor du Gold ausgibst.'],
   ['Vergleichen','Nutze den Gegenstandsvergleich. Ein höheres Level allein bedeutet nicht automatisch, dass ein Item für deine Klasse besser ist.']
  ]},
  forge:{label:'Harzschmiede',icon:'🔨',steps:[
   ['Unbrauchbares verwerten','Zerlege nicht benötigte Gegenstände und erhalte Materialien für die Schmiede.'],
   ['Herstellen','Aus gesammelten Ressourcen kannst du besondere Ausrüstung herstellen.'],
   ['Seltene Projekte','Einige Schmiede-Projekte sind langfristige Ziele. Prüfe die benötigten Materialien, bevor du wertvolle Items zerlegst.']
  ]},
  pvp:{label:'PvP-Arena',icon:'⚔️',steps:[
   ['Andere Spieler herausfordern','Im PvP tritt dein Charakter gegen andere Grow-Legenden an.'],
   ['Klasse & Ausrüstung zählen','Deine Ausrüstung, Klasse und Talente wirken sich direkt auf den Kampf aus.'],
   ['PvP-Buds','Siege können PvP-Buds und weiteren Fortschritt bringen.']
  ]},
  hall:{label:'Hall of Haze',icon:'🏆',steps:[
   ['Rangliste','Hier vergleichst du deinen Fortschritt mit anderen Spielern.'],
   ['Spielerprofile','Tippe einen Spieler an, um sein öffentliches Profil, seine Ausrüstung und weitere Fortschrittsdaten zu sehen.'],
   ['Spielersuche','Über die Suche findest du gezielt andere Charaktere.']
  ]},
  guild:{label:'Gilde',icon:'🏰',steps:[
   ['Gemeinsam stärker','In einer Gilde sammelst du gemeinsam Fortschritt und kannst Gildenaktivitäten spielen.'],
   ['Gildenboss','Nehmt gemeinsam am Gildenboss teil und sichert euch Gildenbelohnungen.'],
   ['Krieg & Verwaltung','Gildenkriege, Mitglieder und Einladungen werden in den jeweiligen Gildenbereichen verwaltet.']
  ]},
  friends:{label:'Nebel-Crew',icon:'🤝',steps:[
   ['Freunde verwalten','In der Nebel-Crew behältst du andere Spieler im Blick und verwaltest deine Kontakte.'],
   ['Profile öffnen','Von hier kannst du schnell zu den Profilen deiner Kontakte wechseln.']
  ]},
  mail:{label:'Nebel-Post',icon:'✉️',steps:[
   ['Nachrichten & Berichte','Hier landen persönliche Nachrichten und verschiedene Spielberichte.'],
   ['Regelmäßig prüfen','Schau nach Kämpfen, Einladungen oder wichtigen Systemmeldungen regelmäßig in deine Post.']
  ]},
  harzDealer:{label:'Harz & Gold & Rahmen Dealer',icon:'🟢',steps:[
   ['Harz-Taler','Harz-Taler sind eine besondere Ressource für ausgewählte Komfort- und Bonusfunktionen.'],
   ['Bewusst einsetzen','Prüfe immer die Kosten und Wirkung, bevor du Harz-Taler ausgibst.']
  ]},
  endgame:{label:'Endgame',icon:'🌌',steps:[
   ['Späte Herausforderungen','Der Endgame-Bereich richtet sich an fortgeschrittene Charaktere und baut auf deinem bisherigen Fortschritt auf.'],
   ['Vorbereitung zählt','Ausrüstung, Talente und andere langfristige Systeme werden hier besonders wichtig.']
  ]},
  book:{label:'Illegales Buch',icon:'📕',steps:[
   ['Langzeit-Erfolge','Das Illegale Buch sammelt langfristige Erfolge und deinen Fortschritt.'],
   ['Dauerhafte Boni','Abgeschlossene Erfolge geben dauerhafte Vorteile. Einige Ziele brauchen bewusst längere Zeit.'],
   ['Pets sammeln','Auch deine Pet-Sammlung ist ein Langzeitziel. Seltenere Qualitätsstufen sollen nach und nach vervollständigt werden.']
  ]}
 };

 let currentKey='',step=0,manual=false,openTimer=0;

 const q=id=>document.getElementById(id);
 const overlay=()=>q('v6254TutorialOverlay');
 const complete=()=>{try{return typeof v200CharacterComplete==='function'?!!v200CharacterComplete():!!(s?.playerClass&&s?.characterNameSet)}catch(_){return false}};
 const durable=()=>{try{return !!v073User&&!v073User.is_anonymous&&window.__V200_AUTH_READY__===true}catch(_){return false}};

 function state(create=true){
  try{
   if(!s||typeof s!=='object')return null;
   if(!s.v6254Tutorial&&create){
    s.v6254Tutorial={version:1,enabled:false,welcomeSeen:false,pages:{},createdAt:Date.now()};
   }
   const z=s.v6254Tutorial||null;
   if(z){
    z.pages=(z.pages&&typeof z.pages==='object')?z.pages:{};
    if(typeof z.enabled!=='boolean')z.enabled=false;
    if(typeof z.welcomeSeen!=='boolean')z.welcomeSeen=false;
   }
   return z;
  }catch(_){return null}
 }

 function save(reason='tutorial'){
  try{
   if(typeof v213LocalCheckpoint==='function')return v213LocalCheckpoint('v6254-'+reason);
  }catch(_){}
  try{if(typeof persist==='function')persist(false)}catch(_){}
  try{if(typeof KEY!=='undefined'&&s)localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
 }

 function setSeen(key){
  const z=state();if(!z)return;
  z.pages[key]=true;save('seen-'+key);
 }

 function currentPage(){
  try{
   const active=document.querySelector('.screen.active');
   if(active?.id&&GUIDES[active.id])return active.id;
   if(document.getElementById('v106Overlay')?.classList.contains('show'))return'book';
  }catch(_){}
  return'world';
 }

 function close(mark=true){
  clearTimeout(openTimer);
  if(mark&&currentKey&&currentKey!=='welcome')setSeen(currentKey);
  overlay()?.classList.remove('show');
  overlay()?.setAttribute('aria-hidden','true');
  currentKey='';step=0;manual=false;
 }

 function render(){
  const content=q('v6254TutorialContent');if(!content)return;
  const g=GUIDES[currentKey];if(!g)return;
  const sstep=g.steps[Math.max(0,Math.min(step,g.steps.length-1))];
  q('v6254TutTitle').textContent=`${g.label} – Tutorial`;
  content.innerHTML=`
   <div class="v6254-tut-body">
    <div class="v6254-tut-kicker">🌿 GROW-GUIDE · ${manual?'HILFE':'ERSTER BESUCH'}</div>
    <div class="v6254-tut-icon">${g.icon}</div>
    <div class="v6254-tut-copy">
     <h3>${sstep[0]}</h3>
     <p>${sstep[1]}</p>
    </div>
    <div class="v6254-tut-progress">${g.steps.map((_,i)=>`<i class="v6254-tut-dot ${i===step?'active':''}"></i>`).join('')}</div>
    <div class="v6254-tut-count">${step+1} / ${g.steps.length}</div>
   </div>
   <div class="v6254-tut-actions">
    <button type="button" class="btn" id="v6254TutBack" ${step===0?'disabled':''}>Zurück</button>
    <button type="button" class="btn" id="v6254TutNext">${step===g.steps.length-1?'Fertig':'Weiter'}</button>
    <button type="button" class="btn" id="v6254TutSkip">Überspringen</button>
   </div>`;
  q('v6254TutBack').onclick=()=>{if(step>0){step--;render()}};
  q('v6254TutNext').onclick=()=>{
   if(step<g.steps.length-1){step++;render();return}
   setSeen(currentKey);close(false);
  };
  q('v6254TutSkip').onclick=()=>{setSeen(currentKey);close(false)};
 }

 function openGuide(key,asManual=false){
  if(!GUIDES[key])return false;
  currentKey=key;step=0;manual=!!asManual;
  q('v6254TutTitle').textContent=`${GUIDES[key].label} – Tutorial`;
  render();
  overlay()?.classList.add('show');
  overlay()?.setAttribute('aria-hidden','false');
  return true;
 }

 function showWelcome(){
  const z=state();if(!z||!z.enabled||z.welcomeSeen||!complete()||!durable())return false;
  if(overlay()?.classList.contains('show'))return false;
  currentKey='welcome';manual=false;step=0;
  q('v6254TutTitle').textContent='Willkommen';
  q('v6254TutorialContent').innerHTML=`
   <div id="v6254Welcome" class="v6254-tut-body">
    <div class="v6254-welcome-mascot">🧙‍♂️</div>
    <div class="v6254-welcome-title">Willkommen bei <b>GROW LEGENDS</b></div>
    <div class="v6254-welcome-copy">
     Schön, dass du da bist! Du musst nicht alles sofort verstehen.<br><br>
     Jede wichtige Seite erklärt sich beim ersten Besuch kurz selbst.
    </div>
    <button type="button" class="btn" id="v6254WelcomeStart">Los geht's! ➜</button>
    <div class="v6254-welcome-note">Mit dem ?-Symbol kannst du die Anleitung jeder Seite später erneut öffnen.</div>
   </div>`;
  q('v6254WelcomeStart').onclick=()=>{
    const zz=state();if(zz){zz.welcomeSeen=true;save('welcome')}
    overlay()?.classList.remove('show');currentKey='';
    setTimeout(()=>openGuide('world',false),180);
  };
  overlay()?.classList.add('show');overlay()?.setAttribute('aria-hidden','false');
  return true;
 }

 function maybeAuto(key,delay=260){
  clearTimeout(openTimer);
  openTimer=setTimeout(()=>{
   const z=state(false);
   if(!z||!z.enabled||!z.welcomeSeen||z.pages?.[key]||!GUIDES[key]||!complete()||!durable())return;
   if(overlay()?.classList.contains('show'))return;
   openGuide(key,false);
  },delay);
 }

 function updateHelp(){
  const b=q('v6254HelpBtn');if(!b)return;
  b.classList.toggle('show',durable()&&complete()&&!q('v075AuthOverlay')?.classList.contains('show'));
 }

 function armForNewCharacter(){
  if(!durable())return;
  const existing=state(false);
  if(!complete()){
   const z=state();z.enabled=true;z.legacy=false;save('armed-new-character');
   return;
  }
  /* Bestehende Charaktere beim Update nicht automatisch mit Tutorials überfallen.
     Das ?-Symbol bleibt aber für jeden verfügbar. */
  if(!existing){
   const z=state();z.enabled=false;z.legacy=true;z.welcomeSeen=true;save('legacy-character');
  }
 }

 function afterCharacterSync(){
  const z=state(false);
  if(z?.enabled&&complete()&&durable()){
   setTimeout(()=>{updateHelp();showWelcome()},520);
  }else updateHelp();
 }

 // Close/X: automatic tutorials count as seen so they do not nag on every visit.
 q('v6254TutClose')?.addEventListener('click',()=>{
  if(currentKey==='welcome'){
   const z=state();if(z){z.welcomeSeen=true;save('welcome-close')}
   overlay()?.classList.remove('show');currentKey='';
   return;
  }
  close(true);
 });
 overlay()?.addEventListener('click',e=>{if(e.target===overlay())close(true)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay()?.classList.contains('show'))close(true)});
 q('v6254HelpBtn')?.addEventListener('click',()=>openGuide(currentPage(),true));

 // Shared navigation owner: update help and schedule a guide after the destination page rendered.
 window.addEventListener('growlegends:navigation-open-v7119',e=>{
  const id=String(e?.detail?.id||'');
  updateHelp();
  if(GUIDES[id])maybeAuto(id,300);
 },{passive:true});

 // Forge may be opened through its own function.
 if(typeof window.v488OpenForge==='function'){
  const baseForge=window.v488OpenForge;
  window.v488OpenForge=function(){
   const r=baseForge.apply(this,arguments);
   updateHelp();maybeAuto('forge',340);return r;
  };
 }

 // Illegales Buch is an overlay rather than a normal screen.
 if(typeof v106OpenBook==='function'){
  const baseBook=v106OpenBook;
  v106OpenBook=function(){
   const r=baseBook.apply(this,arguments);
   updateHelp();maybeAuto('book',260);return r;
  };
  try{window.v106OpenBook=v106OpenBook}catch(_){}
 }

 // New-character creation eventually performs a profile sync.
 if(typeof v073SyncProfile==='function'){
  const baseProfileSync=v073SyncProfile;
  v073SyncProfile=async function(){
   const r=await baseProfileSync.apply(this,arguments);
   if(r)afterCharacterSync();
   return r;
  };
  try{window.v073SyncProfile=v073SyncProfile}catch(_){}
 }

 window.addEventListener('growlegends:account-ready',()=>{
  armForNewCharacter();updateHelp();
  if(complete())afterCharacterSync();
 },{passive:true});
 window.addEventListener('growlegends:foreground-ready',()=>{updateHelp()},{passive:true});
 window.addEventListener('pageshow',()=>{updateHelp()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateHelp()},{passive:true});

 // If this script loads after an already restored session, classify that account once.
 setTimeout(()=>{armForNewCharacter();updateHelp()},150);
 setTimeout(()=>{armForNewCharacter();updateHelp()},900);

 window.v6254OpenTutorial=(key=currentPage())=>openGuide(key,true);
 window.v6254ResetTutorialForCurrentCharacter=()=>{
  if(!durable()||!complete())return false;
  s.v6254Tutorial={version:1,enabled:true,welcomeSeen:false,pages:{},createdAt:Date.now(),manualReset:true};
  save('manual-reset');showWelcome();return true;
 };
 window.v6254TutorialDiagnostics=()=>({
  authReady:window.__V200_AUTH_READY__===true,
  complete:complete(),
  page:currentPage(),
  state:state(false),
  helpVisible:q('v6254HelpBtn')?.classList.contains('show')||false,
  overlayOpen:overlay()?.classList.contains('show')||false,
  guideKeys:Object.keys(GUIDES)
 });
})();
