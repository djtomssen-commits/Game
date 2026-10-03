(()=>{
 'use strict';
 if(window.__V6254_GROW_GUIDE__)return;
 window.__V6254_GROW_GUIDE__=true;

 const GUIDES={
  world:{label:'Startseite',icon:'🏠',steps:[
   ['Übersicht','Die Startseite bündelt aktive Events, Live-Wetter, deine wichtigsten Abenteuer und die unteren Schnellzugriffe.'],
   ['Aktuelle Events','Im Bereich „Aktuelles“ siehst du laufende Boni wie Gold-, EXP-, Dampf-, Turm- oder Koloss-Events.'],
   ['Schnell weiter','Von hier springst du direkt zu Quests, Dungeons, Anbauturm, Growroom, Weltboss, Buch, Schmiede, Freund werben, Shop und Wetter.']
  ]},
  character:{label:'Charakter',icon:'🧙',steps:[
   ['Ausrüstung','Tippe ein angelegtes Item an, um Details zu öffnen. Waffen, Rüstung und Schmuck können Edelsteine und Verzauberungen tragen.'],
   ['Inventar & Materialien','Unter Inventar verwaltest du Beute. Im Materialien-Tab findest du Edelsteine und Verzauberungsrollen.'],
   ['Attribute','Stärke, Geschick oder Intelligenz ist je nach Klasse dein Hauptattribut. Ausdauer erhöht deine Lebenspunkte.'],
   ['Talente & Sets','Talentpunkte schalten deinen Talentbaum frei. Klassensets geben zusätzliche Boni, wenn mehrere passende Teile getragen werden.'],
   ['Freund werben','Über das Freunde-Symbol am Helden öffnest du dein persönliches Empfehlungsprogramm und dessen Belohnungen.']
  ]},
  grow:{label:'Growroom',icon:'🌿',steps:[
   ['Growroom','Pflanze Samen, pflege deine Pflanzen und ernte Gold, EXP, Samenfortschritt und Blüten.'],
   ['Wetter','Das Live-Wetter beeinflusst je nach Lage unter anderem Wachstum, Ertrag oder besondere Samen-Chancen.'],
   ['Blütenlager','Geerntete Blüten landen im Lager. Dort kannst du Buffs aktivieren, Blüten veredeln oder für andere Systeme verwenden.'],
   ['Weitere Tabs','Grow-Aufträge, Genetik und Blüten-Dealer besitzen eigene Bereiche. Das ? im jeweiligen Growroom-Bereich erklärt die Details passend zum aktiven Tab.']
  ]},
  quests:{label:'Quest & Schicht',icon:'📜',steps:[
   ['Quest-Auswahl','Du erhältst drei normale Questangebote; Elite-Quests werden separat hervorgehoben. Dauer, Schwierigkeit und Dampfkosten unterscheiden sich.'],
   ['Dampf & Zeit-Samen','Quests verbrauchen Dampf. Mit Zeit-Samen kannst du eine laufende Quest verkürzen bzw. überspringen.'],
   ['Belohnungen','Quests geben Gold und EXP und können Items, Edelsteine, Rollen sowie weitere Fortschritte auslösen. Die erste Tagesquest bringt zusätzlich Harz-Taler.'],
   ['Schicht','Im Schicht-Tab kannst du deinen Charakter bis zu mehrere Stunden arbeiten oder chillen lassen und später die angesammelte Belohnung abholen.']
  ]},
  dungeon:{label:'Dungeons',icon:'👹',steps:[
   ['20 Dungeons','Die Weltkarte enthält 20 Dungeons. Jeder Dungeon besitzt neun normale Gegner und als zehnten Kampf einen Boss.'],
   ['Freie Versuche','Ein Dungeonversuch regeneriert mit der Zeit. Zusätzliche Versuche können Harz-Taler kosten.'],
   ['Schlüsselsteine','Spätere Dungeons brauchen neben dem passenden Level auch ihren freigeschalteten Schlüsselstein bzw. Fortschritt.'],
   ['Belohnungen','Siege bringen Gold, EXP, Beute und Fortschritt für weitere Systeme wie Wochenziele oder Gildenaktivitäten.']
  ]},
  tower:{label:'Anbauturm',icon:'🗼',steps:[
   ['Turm-HP','Ein Lauf verwendet deine aktuelle Turm-HP. Nach einem Lauf regeneriert sie serverseitig weiter.'],
   ['Heilen','Wenn du nicht warten möchtest, kannst du fehlende Turm-HP gegen Harz-Taler wiederherstellen.'],
   ['Türen & Etagen','Auf den Etagen entscheidest du dich zwischen verschiedenen Türen und Begegnungen wie Gegnern oder Labor-Ereignissen.'],
   ['Rangliste','Deine erreichte Turmhöhe fließt in die Turm-Rangliste ein. Höhere Etagen werden zunehmend anspruchsvoller.']
  ]},
  caravan:{label:'Nebelkarawane',icon:'🚚',steps:[
   ['Route wählen','Es gibt mehrere Routen mit unterschiedlichem Eintritt, Risiko und Belohnung. Höhere Routen werden mit deinem Level freigeschaltet.'],
   ['Fünf Stationen','Jede Fahrt besteht aus fünf Stationen. Dort triffst du Entscheidungen zwischen sicheren und riskanteren Wegen.'],
   ['Ladung & Risiko','Je nach Entscheidung kannst du Goldladung, Samenfragmente oder Zeit-Samen gewinnen – riskante Optionen können auch Ladung kosten.'],
   ['Belohnung','Nach Abschluss der Route wird die serverseitig bestätigte Karawanen-Belohnung ausgezahlt.']
  ]},
  endgame:{label:'Endgame · Nebelrisse',icon:'🌌',steps:[
   ['Freischaltung','Die Nebelrisse beginnen nach Dungeon 20 und öffnen sich ab Level 211.'],
   ['9 Nebelrisse','Das Endgame umfasst neun Risse für den Bereich Level 211–300. Jeder Riss besteht aus zehn Gegnerstufen.'],
   ['Level-Fortschritt','Die Gegner folgen deiner Endgame-Levelkurve. Der nächste Kampf kann ein bestimmtes Mindestlevel verlangen.'],
   ['Bossbeute','Riss-Bosse geben besondere Belohnungen. Mystische Ausrüstung bleibt weiterhin dem Smaragd-Koloss vorbehalten.']
  ]},
  shop:{label:'Händler',icon:'🛒',steps:[
   ['Zwei Händler','Die Händler bieten unterschiedliche Ausrüstung, Schmuck und Verbesserungsmaterialien an.'],
   ['Angebote wechseln','Das Sortiment wird regelmäßig erneuert und kann zusätzlich manuell neu gewürfelt werden.'],
   ['Vergleich','Prüfe beim Kauf Attribute, Klasse, Seltenheit und den Vergleich mit deinem aktuell angelegten Item.'],
   ['Direkt anlegen','Bei passenden Käufen kannst du Ausrüstung direkt übernehmen; Händlerware bleibt beim späteren Verwerten besonders gekennzeichnet.']
  ]},
  forge:{label:'Harzschmiede',icon:'🔨',steps:[
   ['Zerlegen','Nicht benötigte Ausrüstung lässt sich in Samenfragmente zerlegen. Geschützte hochwertige Gegenstände werden nicht einfach verwertet.'],
   ['Prismatisch schmieden','Aus Samenfragmenten und Gold kannst du ein prismatisches Item deiner Klasse herstellen; der Slot wird zufällig bestimmt.'],
   ['Klassenset','Im Klassen-Set-Bereich stellst und verbesserst du passende Set-Ausrüstung mit den benötigten Ressourcen.'],
   ['Nebelschmied','Im Nebelschmied kannst du gegen Gold die natürlichen Werte eines Items neu verteilen. Gesamtwert, Seltenheit, Edelstein, Rolle und Spezialeffekt bleiben erhalten.']
  ]},
  harzDealer:{label:'Harz, Gold & Rahmen',icon:'🟢',steps:[
   ['Harz-Taler','Hier findest du die Premium-Währung und die dazugehörigen Angebote.'],
   ['Goldlager','Über den Goldbereich kannst du Harz-Taler gegen levelskalierendes Gold tauschen. Aktive Gold-Events werden berücksichtigt.'],
   ['Avatar-Rahmen','Freigeschaltete oder gekaufte Rahmen kannst du für deinen Avatar aktivieren; sie erscheinen auch in öffentlichen Profilen und Ranglisten.'],
   ['Kosten prüfen','Harz-Taler werden auch für Komfortfunktionen in anderen Systemen genutzt. Prüfe deshalb vor einem Kauf immer den Preis.']
  ]},
  goldShop:{label:'Goldlager',icon:'🪙',steps:[
   ['Gold gegen Harz','Das Goldlager tauscht Harz-Taler gegen Gold. Die Goldmenge skaliert mit deinem aktuellen Level.'],
   ['Pakete','Größere Pakete können einen besseren Paketbonus besitzen.'],
   ['Gold-Event','Ist ein Gold-Event aktiv, wird dessen Bonus direkt in der angezeigten Goldmenge berücksichtigt.']
  ]},
  bagDealer:{label:'Hinterhof-Dealer',icon:'🏪',steps:[
   ['Tütchen','Im Tütchen-Bereich sammelst du freiwillige Werbe-Fortschritte und erhältst dafür die jeweils angezeigten Belohnungen.'],
   ['Harz Lotto','Der zweite Tab enthält das wöchentliche Harz Lotto: ein Schein, sechs Zahlen aus 50 und 25 Harz-Taler Einsatz.'],
   ['Tippschluss & Ziehung','Der Lottoschein muss vor dem Tippschluss bestätigt sein. Danach sind die Zahlen für diese Runde fest.'],
   ['Gewinne','Nach der Ziehung kannst du einen vorhandenen Gewinn im Lotto-Bereich abholen. Nicht vergebene Anteile fließen nach den Lotto-Regeln weiter.']
  ]},
  pvp:{label:'PvP-Arena',icon:'⚔️',steps:[
   ['Gegner suchen','Das Matchmaking sucht bevorzugt Spieler in einem ähnlichen Level- und Kampfkraftbereich.'],
   ['30-Minuten-Cooldown','Nach einem PvP-Kampf beginnt ein serverseitiger Cooldown von 30 Minuten.'],
   ['PvP-Buds','Siege geben PvP-Buds. Niederlagen ziehen dir keine PvP-Buds ab.'],
   ['Ligen','Deine gesammelten PvP-Buds bestimmen deine Liga und bilden einen eigenen langfristigen PvP-Fortschritt.']
  ]},
  guild:{label:'Gilde',icon:'🏰',steps:[
   ['Übersicht','In der Gilde verwaltest du Mitglieder, Einladungen und permanente Gildenboni.'],
   ['Grow-Aufträge','Gemeinsame Grow-Aktivitäten tragen zu den Gilden-Grow-Aufträgen und deren Belohnungen bei.'],
   ['Gildenboss','Für den täglichen Gildenboss meldest du dich an. Offene Belohnungen aus der vorherigen Runde müssen zuerst abgeholt werden.'],
   ['Gildenkrieg','Angriff, Verteidigung und Kriegsablauf werden im Krieg-Tab verwaltet.'],
   ['Wochenfortschritt','Gemeinsame Aktivitäten füllen außerdem den Wochenfortschritt bzw. die Wochentruhe der Gilde.']
  ]},
  hall:{label:'Hall of Haze',icon:'🏆',steps:[
   ['Top 3 & Rangliste','Die Hall zeigt die Top 3 und danach die restliche Rangliste mit Level, Kampfkraft und PvP-Fortschritt.'],
   ['Dein Rang','Du kannst direkt zu deinem eigenen Rang springen oder dir dein Rangumfeld anzeigen lassen.'],
   ['Profile','Tippe Spieler an, um öffentliche Daten wie Klasse, Ausrüstung, Dungeonfortschritt und Avatar-Rahmen anzusehen.'],
   ['Rahmen','Aktive Avatar-Rahmen werden sowohl im eigenen Profil als auch in Top 3 und Rangliste dargestellt.']
  ]},
  friends:{label:'Nebel-Crew',icon:'🤝',steps:[
   ['Freunde','Hier siehst du deine bestätigten Kontakte und deren Online-/Aktivitätsstatus.'],
   ['Anfragen','Eingehende Freundschaftsanfragen kannst du annehmen oder ablehnen.'],
   ['Profile & Nachrichten','Von der Crew aus kannst du Spielerprofile öffnen und Kontakte für Nachrichten weiterverwenden.']
  ]},
  mail:{label:'Nebel-Post',icon:'✉️',steps:[
   ['Posteingang','Ungelesene Nachrichten werden markiert und zählen zur Nachrichtenanzeige oben.'],
   ['Gesendet & Schreiben','Du kannst gesendete Nachrichten ansehen und neue Nachrichten direkt an einen Charakternamen schicken.'],
   ['Antworten','Aus einer geöffneten Nachricht kannst du direkt eine Antwort an den anderen Spieler beginnen.'],
   ['Kampfberichte','Der zusätzliche Kampfbericht-Tab sammelt deine relevanten Kampfprotokolle.']
  ]},
  book:{label:'Illegales Buch',icon:'📕',steps:[
   ['Erfolge','Das Illegale Buch sammelt langfristige Erfolge aus vielen Spielsystemen.'],
   ['Dauerhafte Boni','Abgeschlossene Ziele geben dauerhafte Fortschritte und Boni.'],
   ['Weltboss & Endgame','Auch Weltboss-, Dungeon-, PvP- und andere Langzeitziele fließen in das Buch ein.']
  ]},
  pets:{label:'Pet Sammelalbum',icon:'🐾',steps:[
   ['20 Begleiter','Das Album enthält verschiedene Pets mit sechs Qualitätsstufen. Jede Kombination wird nur einmal gesammelt.'],
   ['Sammelbonus','Ist eine Pet-Reihe von Normal bis Legendär komplett, wird ihr dauerhafter Reihen-Bonus aktiv.'],
   ['Mythisch & Titel','Mit der mythischen Qualitätsstufe wird die Reihe vollständig und der zugehörige Titel freigeschaltet.'],
   ['Fundquellen','Pets können aus unterschiedlichen Spielaktivitäten stammen; mythische Pets sind besonders selten und an spezielle Quellen gebunden.']
  ]},
  referral:{label:'Freund werben',icon:'🤝',steps:[
   ['Einladen','Teile deinen persönlichen Grow-Legends-Link. Ein eingeladener Account wird deinem Empfehlungsprogramm zugeordnet.'],
   ['Stufe 35','Für jeden geworbenen Freund, der Stufe 35 erreicht, wird ein Slot mit 25 Harz-Talern freigeschaltet.'],
   ['10 Freunde','Bei zehn qualifizierten Freunden wartet das große Paket mit Gold, Samen, Zeit-Samen, Harz, Fragmenten, mythischem Item und exklusivem Avatar-Rahmen.']
  ]},
  worldboss:{label:'Smaragd-Koloss',icon:'🗿',steps:[
   ['Event','Der Smaragd-Koloss ist nur während seines aktiven Weltboss-Events verfügbar.'],
   ['Versuche','Der erste Versuch des Tages ist kostenlos. Weitere Versuche kosten Harz-Taler.'],
   ['Skalierung','Der Boss reagiert auf deine tatsächliche Charakterstärke. Ausrüstung, Attribute und Kampfkraft sind deshalb entscheidend.'],
   ['Mystische Beute','Ein Sieg gibt garantierte mystische Beute; sehr selten kann zusätzlich ein mystisches Set-Teil entstehen.']
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
   if(document.getElementById('v6254TutorialOverlay')?.classList.contains('show'))return currentKey||'';
   if(document.getElementById('v110Overlay')?.classList.contains('show'))return'worldboss';
   if(document.getElementById('v686PetAlbumOverlay')?.classList.contains('show'))return'pets';
   if(document.getElementById('v7129ReferralOverlay')?.classList.contains('open'))return'referral';
   if(document.getElementById('v106Overlay')?.classList.contains('show'))return'book';
   const active=document.querySelector('section.screen.active,.screen.active');
   if(active?.id&&GUIDES[active.id])return active.id;
  }catch(_){}
  return'';
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
  const key=currentPage();
  const visible=durable()&&complete()&&!q('v075AuthOverlay')?.classList.contains('show')&&!!key&&!!GUIDES[key];
  b.classList.toggle('show',visible);
  b.dataset.v6254GuideKey=visible?key:'';
  b.setAttribute('aria-label',visible?`${GUIDES[key].label} – Guide öffnen`:'Guide');
  b.title=visible?`${GUIDES[key].label} – Hilfe`:'';
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
 q('v6254HelpBtn')?.addEventListener('click',()=>{const key=currentPage();if(key&&GUIDES[key])openGuide(key,true)});

 // Shared navigation owner: update help and schedule a guide after the destination page rendered.
 window.addEventListener('growlegends:navigation-open-v7119',e=>{
  const id=String(e?.detail?.id||'');
  updateHelp();
  if(GUIDES[id])maybeAuto(id,300);
  else close(false);
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
  activeScreen:document.querySelector('section.screen.active,.screen.active')?.id||'',
  state:state(false),
  helpVisible:q('v6254HelpBtn')?.classList.contains('show')||false,
  overlayOpen:overlay()?.classList.contains('show')||false,
  guideKeys:Object.keys(GUIDES)
 });
})();
