(()=>{
'use strict';
if(window.__V8144_GAMEPLAY_I18N__)return;
window.__V8144_GAMEPLAY_I18N__=true;
const G=window.GrowI18n;if(!G)return;

/* Presentation-only migration bridge for legacy renderers.
   Exact, scoped text replacement only; no gameplay/state/RPC changes. */
const M={
 en:{
   "VIP-Truhe geöffnet!":"VIP chest opened!",
   "Das war heute in deiner VIP-Truhe:":"Today's VIP chest contained:",
   "Belohnung einsammeln":"Collect rewards",
   "👑 VIP · Waffen & Rüstung kostenlos neu würfeln":"👑 VIP · Reroll weapons & armor for free",
   "👑 VIP · Schmuck & Materialien kostenlos neu würfeln":"👑 VIP · Reroll jewelry & materials for free",
   "🔄 Waffen & Rüstung neu würfeln · 1 Harz-Taler":"🔄 Reroll weapons & armor · 1 Resin Token",
   "🔄 Schmuck & Materialien neu würfeln · 1 Harz-Taler":"🔄 Reroll jewelry & materials · 1 Resin Token",
   "Harz & Gold & Rahmen & VIP Dealer":"Resin, Gold, Frames & VIP Dealer",
   "VIP-Pakete":"VIP Packages",
   "Deine VIP-Vorteile":"Your VIP Benefits",
   "Tage VIP":"VIP days",
   "VIP kaufen":"Buy VIP",
   "BELIEBT":"POPULAR",
   "VIP Woche":"VIP Week",
   "VIP Zwei Wochen":"VIP Two Weeks",
   "VIP Monat":"VIP Month",
   "Tägliche VIP-Truhe":"Daily VIP Chest",
   "Auf alle Aktivitäten, die Wochentruhen-EP geben.":"Applies to all activities that grant Weekly Chest XP.",
   "1× Shop neu würfeln gratis":"1× free shop reroll",
   "Ein gemeinsamer Freiwurf pro Berliner Tag – Waffen oder Magier/Schmuck.":"One shared free reroll per Berlin day – weapons or magic/jewelry.",
   "VIP-Titel":"VIP Title",
   "„Grow VIP“ ist nur während aktivem VIP auswählbar.":"“Grow VIP” can only be selected while VIP is active.",
   "VIP-Name + Abzeichen":"VIP Name + Badge",
   "Kann über den Sichtbarkeitsschalter vollständig verborgen werden.":"Can be fully hidden with the visibility toggle.",
   "VIP-Kronenrahmen":"VIP Crown Frame",
   "Nur während aktivem VIP nutzbar; nach Ablauf automatisch gesperrt.":"Usable only while VIP is active; automatically locked after expiry.",
   "TÄGLICHER BONUS":"DAILY BONUS",
   "Heute abgeholt":"Claimed today",
   "VIP erforderlich":"VIP required",
   "VIP-Truhe abholen":"Claim VIP chest",
   "VIP öffentlich anzeigen":"Show VIP publicly",
   "Name, VIP-Abzeichen, VIP-Titel und VIP-Rahmen für andere sichtbar.":"Show VIP name color, badge, title and frame to other players.",
   "Mehr Komfort, tägliche Extras und sichtbares Prestige – ohne Kampfkraft-Bonus.":"More convenience, daily extras and visible prestige – without combat power bonuses.",
   "VIP-Zeit wird bei einer Verlängerung hinten angehängt. Nach Ablauf enden alle zeitgebundenen VIP-Vorteile automatisch. Keine zusätzlichen Attribute oder Kampfschadens-Boni.":"VIP time is added to your remaining duration. All timed VIP benefits end automatically when it expires. No extra attributes or combat-damage bonuses.",
   "👑 VIP · Heute gratis neu würfeln":"👑 VIP · Free reroll today",
   "VIP-exklusiv · nur solange dein VIP-Pass aktiv ist.":"VIP exclusive · only while your VIP pass is active.",
   "Exklusiver Titel während dein VIP-Pass aktiv ist.":"Exclusive title while your VIP pass is active.",
  'Guten Morgen':'Good morning','Guten Tag':'Hello','Guten Abend':'Good evening','Willkommen zurück':'Welcome back','Schön, dass du da bist.':'Glad to have you here.','Willkommen zurück.':'Welcome back.',
  'Dein Held wartet auf den nächsten Auftrag. Prüfe Events, Neuigkeiten und deinen Fortschritt.':'Your hero is waiting for the next mission. Check events, news and your progress.',
  'Aktive Events':'Active events','Aktuell kein Event aktiv':'No event is currently active','Sobald ein Event startet, erscheint es hier direkt auf der Startseite.':'As soon as an event starts, it will appear here on the home screen.','KEIN EVENT':'NO EVENT','Update-News':'Update news','Schnellzugriff':'Quick access',
  'Quests':'Quests','Aufträge starten':'Start missions','Gegner besiegen':'Defeat enemies','Pflanzen & ernten':'Plants & harvest','Ausrüstung kaufen':'Buy equipment','Charakter':'Character','Werte & Ausrüstung':'Stats & equipment','Spieler & PvP':'Players & PvP',
  'AUSRÜSTUNG · ATTRIBUTE · SKILLS · DEINE KAMPFKRAFT':'EQUIPMENT · ATTRIBUTES · SKILLS · YOUR COMBAT POWER','Set-Boni ansehen ›':'View set bonuses ›','Inventar':'Inventory','Attribute':'Attributes','Talente':'Talents','Materialien':'Materials','Klasse wählen':'Choose class','Talentpunkte':'Talent points','Leer':'Empty','Ablegen':'Unequip','Kopf':'Head','Waffe':'Weapon','Ring':'Ring','Rüstung':'Armor','Schuhe':'Boots','Amulett':'Amulet',
  'PFLANZEN · PFLEGE · ERNTE':'PLANTS · CARE · HARVEST','Blütenlager':'Bud storage','LAGER · DEALER · VEREDELN':'STORAGE · DEALER · REFINE','Genetik':'Genetics','KREUZUNGEN · HYBRIDE · ESSENZEN':'CROSSES · HYBRIDS · ESSENCES','Aufträge':'Orders','TÄGLICHE GROW-AUFGABEN':'DAILY GROW TASKS','Genetik-Labor':'Genetics lab','Grow-Aufträge':'Grow orders',
  'Neue Aufträge · 10 Gold':'New missions · 10 Gold','Belohnung abholen':'Claim reward','Quest starten':'Start quest','Elite-Quest':'Elite quest','Zeit-Samen':'Time Seeds',
  'Kämpfen':'Fight','Belohnungen':'Rewards','Versuch':'Attempt','Versuche':'Attempts','Zurück':'Back','Weiter':'Continue',
  'ANBAU-TURM':'GROW TOWER','Turm-Erholung':'Tower recovery','Vollständig erholt':'Fully recovered','Turm-Leben vollständig regeneriert':'Tower health fully regenerated','Run starten':'Start run','Ersten Run starten':'Start first run','Komplette Ranglisten':'Full rankings','Turm-Aufstieg':'Tower progression','SAISON':'SEASON','Turm-Rangliste':'Tower ranking','Alle':'All','MITTWOCH':'WEDNESDAY','INFORMATIONEN':'INFORMATION','Anbau-Turm Guide':'Grow Tower guide','Guide schließen':'Close guide','Ranglisten ansehen':'View rankings','Rangliste':'Ranking','Turm verlassen':'Leave tower','Je höher du steigst, desto stärker werden die Mutationen.':'The higher you climb, the stronger the mutations become.'
 },
 es:{
   "VIP-Truhe geöffnet!":"¡Cofre VIP abierto!",
   "Das war heute in deiner VIP-Truhe:":"Tu cofre VIP de hoy contenía:",
   "Belohnung einsammeln":"Recoger recompensas",
   "👑 VIP · Waffen & Rüstung kostenlos neu würfeln":"👑 VIP · Renovar armas y armadura gratis",
   "👑 VIP · Schmuck & Materialien kostenlos neu würfeln":"👑 VIP · Renovar joyas y materiales gratis",
   "🔄 Waffen & Rüstung neu würfeln · 1 Harz-Taler":"🔄 Renovar armas y armadura · 1 ficha de resina",
   "🔄 Schmuck & Materialien neu würfeln · 1 Harz-Taler":"🔄 Renovar joyas y materiales · 1 ficha de resina",
   "Harz & Gold & Rahmen & VIP Dealer":"Tienda de Resina, Oro, Marcos y VIP",
   "VIP-Pakete":"Paquetes VIP",
   "Deine VIP-Vorteile":"Tus ventajas VIP",
   "Tage VIP":"días VIP",
   "VIP kaufen":"Comprar VIP",
   "BELIEBT":"POPULAR",
   "VIP Woche":"Semana VIP",
   "VIP Zwei Wochen":"Dos semanas VIP",
   "VIP Monat":"Mes VIP",
   "Tägliche VIP-Truhe":"Cofre VIP diario",
   "Auf alle Aktivitäten, die Wochentruhen-EP geben.":"Se aplica a todas las actividades que otorgan EXP del cofre semanal.",
   "1× Shop neu würfeln gratis":"1× renovación gratis de tienda",
   "Ein gemeinsamer Freiwurf pro Berliner Tag – Waffen oder Magier/Schmuck.":"Una renovación gratis compartida por día de Berlín: armas o magia/joyas.",
   "VIP-Titel":"Título VIP",
   "„Grow VIP“ ist nur während aktivem VIP auswählbar.":"«Grow VIP» solo se puede elegir mientras el VIP esté activo.",
   "VIP-Name + Abzeichen":"Nombre VIP + insignia",
   "Kann über den Sichtbarkeitsschalter vollständig verborgen werden.":"Puede ocultarse por completo con el interruptor de visibilidad.",
   "VIP-Kronenrahmen":"Marco Corona VIP",
   "Nur während aktivem VIP nutzbar; nach Ablauf automatisch gesperrt.":"Solo se puede usar con VIP activo; se bloquea automáticamente al expirar.",
   "TÄGLICHER BONUS":"BONO DIARIO",
   "Heute abgeholt":"Recogido hoy",
   "VIP erforderlich":"VIP requerido",
   "VIP-Truhe abholen":"Recoger cofre VIP",
   "VIP öffentlich anzeigen":"Mostrar VIP públicamente",
   "Name, VIP-Abzeichen, VIP-Titel und VIP-Rahmen für andere sichtbar.":"Muestra el nombre VIP, insignia, título y marco a otros jugadores.",
   "Mehr Komfort, tägliche Extras und sichtbares Prestige – ohne Kampfkraft-Bonus.":"Más comodidad, extras diarios y prestigio visible, sin bonificación de poder de combate.",
   "VIP-Zeit wird bei einer Verlängerung hinten angehängt. Nach Ablauf enden alle zeitgebundenen VIP-Vorteile automatisch. Keine zusätzlichen Attribute oder Kampfschadens-Boni.":"El tiempo VIP se añade al tiempo restante. Todas las ventajas temporales terminan automáticamente al expirar. Sin atributos ni daño de combate extra.",
   "👑 VIP · Heute gratis neu würfeln":"👑 VIP · Renovación gratis hoy",
   "VIP-exklusiv · nur solange dein VIP-Pass aktiv ist.":"Exclusivo VIP · solo mientras tu pase VIP esté activo.",
   "Exklusiver Titel während dein VIP-Pass aktiv ist.":"Título exclusivo mientras tu pase VIP esté activo.",
  'Guten Morgen':'Buenos días','Guten Tag':'Hola','Guten Abend':'Buenas tardes','Willkommen zurück':'Bienvenido de nuevo','Aktive Events':'Eventos activos','Aktuell kein Event aktiv':'No hay ningún evento activo','Update-News':'Noticias de actualización','Schnellzugriff':'Acceso rápido','Quests':'Misiones','Aufträge starten':'Iniciar misiones','Gegner besiegen':'Derrotar enemigos','Pflanzen & ernten':'Plantas y cosecha','Ausrüstung kaufen':'Comprar equipo','Charakter':'Personaje','Werte & Ausrüstung':'Atributos y equipo','Spieler & PvP':'Jugadores y PvP',
  'AUSRÜSTUNG · ATTRIBUTE · SKILLS · DEINE KAMPFKRAFT':'EQUIPO · ATRIBUTOS · HABILIDADES · TU PODER','Set-Boni ansehen ›':'Ver bonificaciones de set ›','Inventar':'Inventario','Attribute':'Atributos','Talente':'Talentos','Materialien':'Materiales','Klasse wählen':'Elegir clase','Talentpunkte':'Puntos de talento','Leer':'Vacío','Ablegen':'Quitar','Kopf':'Cabeza','Waffe':'Arma','Ring':'Anillo','Rüstung':'Armadura','Schuhe':'Botas','Amulett':'Amuleto',
  'PFLANZEN · PFLEGE · ERNTE':'PLANTAS · CUIDADO · COSECHA','Blütenlager':'Almacén de flores','LAGER · DEALER · VEREDELN':'ALMACÉN · DEALER · REFINAR','Genetik':'Genética','KREUZUNGEN · HYBRIDE · ESSENZEN':'CRUCES · HÍBRIDOS · ESENCIAS','Aufträge':'Encargos','TÄGLICHE GROW-AUFGABEN':'TAREAS DIARIAS DE CULTIVO','Genetik-Labor':'Laboratorio genético','Grow-Aufträge':'Encargos de cultivo',
  'Neue Aufträge · 10 Gold':'Nuevas misiones · 10 Oro','Belohnung abholen':'Recoger recompensa','Quest starten':'Iniciar misión','Elite-Quest':'Misión élite','Zeit-Samen':'Semillas de tiempo','Kämpfen':'Luchar','Belohnungen':'Recompensas','Versuch':'Intento','Versuche':'Intentos','Zurück':'Atrás','Weiter':'Continuar',
  'ANBAU-TURM':'TORRE DE CULTIVO','Turm-Erholung':'Recuperación de torre','Vollständig erholt':'Recuperado por completo','Run starten':'Iniciar run','Ersten Run starten':'Iniciar primer run','Komplette Ranglisten':'Clasificación completa','Turm-Aufstieg':'Progreso de torre','SAISON':'TEMPORADA','Turm-Rangliste':'Clasificación de torre','Alle':'Todos','MITTWOCH':'MIÉRCOLES','INFORMATIONEN':'INFORMACIÓN','Anbau-Turm Guide':'Guía de la Torre','Guide schließen':'Cerrar guía','Ranglisten ansehen':'Ver clasificaciones','Rangliste':'Clasificación','Turm verlassen':'Salir de la torre'
 },
 fr:{
   "VIP-Truhe geöffnet!":"Coffre VIP ouvert !",
   "Das war heute in deiner VIP-Truhe:":"Votre coffre VIP du jour contenait :",
   "Belohnung einsammeln":"Récupérer les récompenses",
   "👑 VIP · Waffen & Rüstung kostenlos neu würfeln":"👑 VIP · Relancer armes et armure gratuitement",
   "👑 VIP · Schmuck & Materialien kostenlos neu würfeln":"👑 VIP · Relancer bijoux et matériaux gratuitement",
   "🔄 Waffen & Rüstung neu würfeln · 1 Harz-Taler":"🔄 Relancer armes et armure · 1 jeton de résine",
   "🔄 Schmuck & Materialien neu würfeln · 1 Harz-Taler":"🔄 Relancer bijoux et matériaux · 1 jeton de résine",
   "Harz & Gold & Rahmen & VIP Dealer":"Marchand Résine, Or, Cadres & VIP",
   "VIP-Pakete":"Packs VIP",
   "Deine VIP-Vorteile":"Vos avantages VIP",
   "Tage VIP":"jours VIP",
   "VIP kaufen":"Acheter VIP",
   "BELIEBT":"POPULAIRE",
   "VIP Woche":"Semaine VIP",
   "VIP Zwei Wochen":"Deux semaines VIP",
   "VIP Monat":"Mois VIP",
   "Tägliche VIP-Truhe":"Coffre VIP quotidien",
   "Auf alle Aktivitäten, die Wochentruhen-EP geben.":"S'applique à toutes les activités donnant de l'EXP de coffre hebdomadaire.",
   "1× Shop neu würfeln gratis":"1× relance gratuite de boutique",
   "Ein gemeinsamer Freiwurf pro Berliner Tag – Waffen oder Magier/Schmuck.":"Une relance gratuite partagée par jour de Berlin : armes ou magie/bijoux.",
   "VIP-Titel":"Titre VIP",
   "„Grow VIP“ ist nur während aktivem VIP auswählbar.":"« Grow VIP » est sélectionnable uniquement lorsque le VIP est actif.",
   "VIP-Name + Abzeichen":"Nom VIP + badge",
   "Kann über den Sichtbarkeitsschalter vollständig verborgen werden.":"Peut être entièrement masqué avec l'option de visibilité.",
   "VIP-Kronenrahmen":"Cadre Couronne VIP",
   "Nur während aktivem VIP nutzbar; nach Ablauf automatisch gesperrt.":"Utilisable uniquement avec VIP actif ; verrouillé automatiquement à l'expiration.",
   "TÄGLICHER BONUS":"BONUS QUOTIDIEN",
   "Heute abgeholt":"Récupéré aujourd'hui",
   "VIP erforderlich":"VIP requis",
   "VIP-Truhe abholen":"Récupérer le coffre VIP",
   "VIP öffentlich anzeigen":"Afficher le VIP publiquement",
   "Name, VIP-Abzeichen, VIP-Titel und VIP-Rahmen für andere sichtbar.":"Affiche le nom VIP, le badge, le titre et le cadre aux autres joueurs.",
   "Mehr Komfort, tägliche Extras und sichtbares Prestige – ohne Kampfkraft-Bonus.":"Plus de confort, des extras quotidiens et du prestige visible, sans bonus de puissance de combat.",
   "VIP-Zeit wird bei einer Verlängerung hinten angehängt. Nach Ablauf enden alle zeitgebundenen VIP-Vorteile automatisch. Keine zusätzlichen Attribute oder Kampfschadens-Boni.":"Le temps VIP s'ajoute à la durée restante. Tous les avantages temporaires prennent fin automatiquement à l'expiration. Aucun attribut ou dégât de combat supplémentaire.",
   "👑 VIP · Heute gratis neu würfeln":"👑 VIP · Relance gratuite aujourd'hui",
   "VIP-exklusiv · nur solange dein VIP-Pass aktiv ist.":"Exclusif VIP · uniquement tant que votre pass VIP est actif.",
   "Exklusiver Titel während dein VIP-Pass aktiv ist.":"Titre exclusif tant que votre pass VIP est actif.",
  'Guten Morgen':'Bonjour','Guten Tag':'Bonjour','Guten Abend':'Bonsoir','Willkommen zurück':'Bon retour','Aktive Events':'Événements actifs','Aktuell kein Event aktiv':'Aucun événement actif','Update-News':'Actualités','Schnellzugriff':'Accès rapide','Quests':'Quêtes','Aufträge starten':'Lancer des missions','Gegner besiegen':'Vaincre des ennemis','Pflanzen & ernten':'Plantes & récolte','Ausrüstung kaufen':'Acheter de l’équipement','Charakter':'Personnage','Werte & Ausrüstung':'Stats & équipement','Spieler & PvP':'Joueurs & PvP',
  'AUSRÜSTUNG · ATTRIBUTE · SKILLS · DEINE KAMPFKRAFT':'ÉQUIPEMENT · ATTRIBUTS · COMPÉTENCES · PUISSANCE','Set-Boni ansehen ›':'Voir les bonus de set ›','Inventar':'Inventaire','Attribute':'Attributs','Talente':'Talents','Materialien':'Matériaux','Klasse wählen':'Choisir une classe','Talentpunkte':'Points de talent','Leer':'Vide','Ablegen':'Retirer','Kopf':'Tête','Waffe':'Arme','Ring':'Anneau','Rüstung':'Armure','Schuhe':'Bottes','Amulett':'Amulette',
  'PFLANZEN · PFLEGE · ERNTE':'PLANTES · SOINS · RÉCOLTE','Blütenlager':'Stock de fleurs','LAGER · DEALER · VEREDELN':'STOCK · DEALER · RAFFINER','Genetik':'Génétique','KREUZUNGEN · HYBRIDE · ESSENZEN':'CROISEMENTS · HYBRIDES · ESSENCES','Aufträge':'Contrats','TÄGLICHE GROW-AUFGABEN':'TÂCHES DE CULTURE QUOTIDIENNES','Genetik-Labor':'Laboratoire génétique','Grow-Aufträge':'Contrats de culture',
  'Neue Aufträge · 10 Gold':'Nouvelles quêtes · 10 Or','Belohnung abholen':'Récupérer la récompense','Quest starten':'Lancer la quête','Elite-Quest':'Quête élite','Zeit-Samen':'Graines temporelles','Kämpfen':'Combattre','Belohnungen':'Récompenses','Versuch':'Essai','Versuche':'Essais','Zurück':'Retour','Weiter':'Continuer',
  'ANBAU-TURM':'TOUR DE CULTURE','Turm-Erholung':'Récupération de la tour','Vollständig erholt':'Entièrement rétabli','Run starten':'Lancer le run','Ersten Run starten':'Lancer le premier run','Komplette Ranglisten':'Classements complets','Turm-Aufstieg':'Progression de la tour','SAISON':'SAISON','Turm-Rangliste':'Classement de la tour','Alle':'Tous','MITTWOCH':'MERCREDI','INFORMATIONEN':'INFORMATIONS','Anbau-Turm Guide':'Guide de la Tour','Guide schließen':'Fermer le guide','Ranglisten ansehen':'Voir les classements','Rangliste':'Classement','Turm verlassen':'Quitter la tour'
 },
 pl:{
   "VIP-Truhe geöffnet!":"Skrzynia VIP otwarta!",
   "Das war heute in deiner VIP-Truhe:":"Dzisiejsza skrzynia VIP zawierała:",
   "Belohnung einsammeln":"Odbierz nagrody",
   "👑 VIP · Waffen & Rüstung kostenlos neu würfeln":"👑 VIP · Darmowe odświeżenie broni i pancerza",
   "👑 VIP · Schmuck & Materialien kostenlos neu würfeln":"👑 VIP · Darmowe odświeżenie biżuterii i materiałów",
   "🔄 Waffen & Rüstung neu würfeln · 1 Harz-Taler":"🔄 Odśwież broń i pancerz · 1 żeton żywicy",
   "🔄 Schmuck & Materialien neu würfeln · 1 Harz-Taler":"🔄 Odśwież biżuterię i materiały · 1 żeton żywicy",
   "Harz & Gold & Rahmen & VIP Dealer":"Sklep Żywicy, Złota, Ramek i VIP",
   "VIP-Pakete":"Pakiety VIP",
   "Deine VIP-Vorteile":"Twoje korzyści VIP",
   "Tage VIP":"dni VIP",
   "VIP kaufen":"Kup VIP",
   "BELIEBT":"POPULARNE",
   "VIP Woche":"Tydzień VIP",
   "VIP Zwei Wochen":"Dwa tygodnie VIP",
   "VIP Monat":"Miesiąc VIP",
   "Tägliche VIP-Truhe":"Codzienna skrzynia VIP",
   "Auf alle Aktivitäten, die Wochentruhen-EP geben.":"Dotyczy wszystkich aktywności dających PD tygodniowej skrzyni.",
   "1× Shop neu würfeln gratis":"1× darmowe odświeżenie sklepu",
   "Ein gemeinsamer Freiwurf pro Berliner Tag – Waffen oder Magier/Schmuck.":"Jedno wspólne darmowe odświeżenie na dzień berliński — broń albo magia/biżuteria.",
   "VIP-Titel":"Tytuł VIP",
   "„Grow VIP“ ist nur während aktivem VIP auswählbar.":"„Grow VIP” można wybrać tylko podczas aktywnego VIP.",
   "VIP-Name + Abzeichen":"Nazwa VIP + odznaka",
   "Kann über den Sichtbarkeitsschalter vollständig verborgen werden.":"Można całkowicie ukryć przełącznikiem widoczności.",
   "VIP-Kronenrahmen":"Ramka Korona VIP",
   "Nur während aktivem VIP nutzbar; nach Ablauf automatisch gesperrt.":"Dostępna tylko podczas aktywnego VIP; po wygaśnięciu automatycznie zablokowana.",
   "TÄGLICHER BONUS":"DZIENNY BONUS",
   "Heute abgeholt":"Odebrane dzisiaj",
   "VIP erforderlich":"Wymagany VIP",
   "VIP-Truhe abholen":"Odbierz skrzynię VIP",
   "VIP öffentlich anzeigen":"Pokazuj VIP publicznie",
   "Name, VIP-Abzeichen, VIP-Titel und VIP-Rahmen für andere sichtbar.":"Pokazuj innym graczom nazwę VIP, odznakę, tytuł i ramkę.",
   "Mehr Komfort, tägliche Extras und sichtbares Prestige – ohne Kampfkraft-Bonus.":"Więcej wygody, codzienne dodatki i widoczny prestiż — bez bonusu do siły bojowej.",
   "VIP-Zeit wird bei einer Verlängerung hinten angehängt. Nach Ablauf enden alle zeitgebundenen VIP-Vorteile automatisch. Keine zusätzlichen Attribute oder Kampfschadens-Boni.":"Czas VIP jest dodawany do pozostałego czasu. Wszystkie czasowe korzyści kończą się automatycznie po wygaśnięciu. Bez dodatkowych atrybutów i obrażeń bojowych.",
   "👑 VIP · Heute gratis neu würfeln":"👑 VIP · Darmowe odświeżenie dzisiaj",
   "VIP-exklusiv · nur solange dein VIP-Pass aktiv ist.":"Ekskluzywne dla VIP · tylko podczas aktywnego karnetu VIP.",
   "Exklusiver Titel während dein VIP-Pass aktiv ist.":"Ekskluzywny tytuł podczas aktywnego karnetu VIP.",
  'Guten Morgen':'Dzień dobry','Guten Tag':'Cześć','Guten Abend':'Dobry wieczór','Willkommen zurück':'Witaj ponownie','Aktive Events':'Aktywne wydarzenia','Aktuell kein Event aktiv':'Brak aktywnego wydarzenia','Update-News':'Aktualności','Schnellzugriff':'Szybki dostęp','Quests':'Misje','Aufträge starten':'Rozpocznij misje','Gegner besiegen':'Pokonaj wrogów','Pflanzen & ernten':'Rośliny i zbiory','Ausrüstung kaufen':'Kup wyposażenie','Charakter':'Postać','Werte & Ausrüstung':'Statystyki i wyposażenie','Spieler & PvP':'Gracze i PvP',
  'AUSRÜSTUNG · ATTRIBUTE · SKILLS · DEINE KAMPFKRAFT':'EKWIPUNEK · ATRYBUTY · UMIEJĘTNOŚCI · SIŁA','Set-Boni ansehen ›':'Pokaż bonusy zestawu ›','Inventar':'Ekwipunek','Attribute':'Atrybuty','Talente':'Talenty','Materialien':'Materiały','Klasse wählen':'Wybierz klasę','Talentpunkte':'Punkty talentów','Leer':'Puste','Ablegen':'Zdejmij','Kopf':'Głowa','Waffe':'Broń','Ring':'Pierścień','Rüstung':'Pancerz','Schuhe':'Buty','Amulett':'Amulet',
  'PFLANZEN · PFLEGE · ERNTE':'ROŚLINY · PIELĘGNACJA · ZBIORY','Blütenlager':'Magazyn kwiatów','LAGER · DEALER · VEREDELN':'MAGAZYN · DEALER · ULEPSZANIE','Genetik':'Genetyka','KREUZUNGEN · HYBRIDE · ESSENZEN':'KRZYŻÓWKI · HYBRYDY · ESENCJE','Aufträge':'Zlecenia','TÄGLICHE GROW-AUFGABEN':'CODZIENNE ZADANIA UPRAWY','Genetik-Labor':'Laboratorium genetyczne','Grow-Aufträge':'Zlecenia uprawy',
  'Neue Aufträge · 10 Gold':'Nowe misje · 10 złota','Belohnung abholen':'Odbierz nagrodę','Quest starten':'Rozpocznij misję','Elite-Quest':'Misja elitarna','Zeit-Samen':'Nasiona czasu','Kämpfen':'Walcz','Belohnungen':'Nagrody','Versuch':'Próba','Versuche':'Próby','Zurück':'Wstecz','Weiter':'Dalej',
  'ANBAU-TURM':'WIEŻA UPRAWY','Turm-Erholung':'Regeneracja wieży','Vollständig erholt':'W pełni zregenerowano','Run starten':'Rozpocznij run','Ersten Run starten':'Rozpocznij pierwszy run','Komplette Ranglisten':'Pełne rankingi','Turm-Aufstieg':'Rozwój wieży','SAISON':'SEZON','Turm-Rangliste':'Ranking wieży','Alle':'Wszyscy','MITTWOCH':'ŚRODA','INFORMATIONEN':'INFORMACJE','Anbau-Turm Guide':'Poradnik Wieży','Guide schließen':'Zamknij poradnik','Ranglisten ansehen':'Zobacz rankingi','Rangliste':'Ranking','Turm verlassen':'Opuść wieżę'
 },
 tr:{
   "VIP-Truhe geöffnet!":"VIP sandığı açıldı!",
   "Das war heute in deiner VIP-Truhe:":"Bugünkü VIP sandığında şunlar vardı:",
   "Belohnung einsammeln":"Ödülleri al",
   "👑 VIP · Waffen & Rüstung kostenlos neu würfeln":"👑 VIP · Silah ve zırhı ücretsiz yenile",
   "👑 VIP · Schmuck & Materialien kostenlos neu würfeln":"👑 VIP · Takı ve malzemeleri ücretsiz yenile",
   "🔄 Waffen & Rüstung neu würfeln · 1 Harz-Taler":"🔄 Silah ve zırhı yenile · 1 Reçine Jetonu",
   "🔄 Schmuck & Materialien neu würfeln · 1 Harz-Taler":"🔄 Takı ve malzemeleri yenile · 1 Reçine Jetonu",
   "Harz & Gold & Rahmen & VIP Dealer":"Reçine, Altın, Çerçeve ve VIP Mağazası",
   "VIP-Pakete":"VIP Paketleri",
   "Deine VIP-Vorteile":"VIP Avantajların",
   "Tage VIP":"VIP günü",
   "VIP kaufen":"VIP Satın Al",
   "BELIEBT":"POPÜLER",
   "VIP Woche":"VIP Haftası",
   "VIP Zwei Wochen":"İki Haftalık VIP",
   "VIP Monat":"VIP Ayı",
   "Tägliche VIP-Truhe":"Günlük VIP Sandığı",
   "Auf alle Aktivitäten, die Wochentruhen-EP geben.":"Haftalık Sandık TP'si veren tüm etkinliklere uygulanır.",
   "1× Shop neu würfeln gratis":"1× ücretsiz mağaza yenileme",
   "Ein gemeinsamer Freiwurf pro Berliner Tag – Waffen oder Magier/Schmuck.":"Berlin gününe göre ortak 1 ücretsiz yenileme — silah veya büyü/takı.",
   "VIP-Titel":"VIP Unvanı",
   "„Grow VIP“ ist nur während aktivem VIP auswählbar.":"“Grow VIP” yalnızca VIP aktifken seçilebilir.",
   "VIP-Name + Abzeichen":"VIP Adı + Rozet",
   "Kann über den Sichtbarkeitsschalter vollständig verborgen werden.":"Görünürlük anahtarıyla tamamen gizlenebilir.",
   "VIP-Kronenrahmen":"VIP Taç Çerçevesi",
   "Nur während aktivem VIP nutzbar; nach Ablauf automatisch gesperrt.":"Yalnızca VIP aktifken kullanılabilir; süresi dolunca otomatik kilitlenir.",
   "TÄGLICHER BONUS":"GÜNLÜK BONUS",
   "Heute abgeholt":"Bugün alındı",
   "VIP erforderlich":"VIP gerekli",
   "VIP-Truhe abholen":"VIP sandığını al",
   "VIP öffentlich anzeigen":"VIP'yi herkese göster",
   "Name, VIP-Abzeichen, VIP-Titel und VIP-Rahmen für andere sichtbar.":"VIP adını, rozeti, unvanı ve çerçeveyi diğer oyunculara göster.",
   "Mehr Komfort, tägliche Extras und sichtbares Prestige – ohne Kampfkraft-Bonus.":"Daha fazla konfor, günlük ekstralar ve görünür prestij — savaş gücü bonusu olmadan.",
   "VIP-Zeit wird bei einer Verlängerung hinten angehängt. Nach Ablauf enden alle zeitgebundenen VIP-Vorteile automatisch. Keine zusätzlichen Attribute oder Kampfschadens-Boni.":"VIP süresi kalan sürenin sonuna eklenir. Süre dolduğunda tüm süreli VIP avantajları otomatik biter. Ek özellik veya savaş hasarı bonusu yoktur.",
   "👑 VIP · Heute gratis neu würfeln":"👑 VIP · Bugün ücretsiz yenileme",
   "VIP-exklusiv · nur solange dein VIP-Pass aktiv ist.":"VIP'e özel · yalnızca VIP kartın aktifken.",
   "Exklusiver Titel während dein VIP-Pass aktiv ist.":"VIP kartın aktifken özel unvan.",
  'Guten Morgen':'Günaydın','Guten Tag':'Merhaba','Guten Abend':'İyi akşamlar','Willkommen zurück':'Tekrar hoş geldin','Aktive Events':'Aktif etkinlikler','Aktuell kein Event aktiv':'Şu anda aktif etkinlik yok','Update-News':'Güncelleme haberleri','Schnellzugriff':'Hızlı erişim','Quests':'Görevler','Aufträge starten':'Görevleri başlat','Gegner besiegen':'Düşmanları yen','Pflanzen & ernten':'Bitkiler ve hasat','Ausrüstung kaufen':'Ekipman satın al','Charakter':'Karakter','Werte & Ausrüstung':'İstatistikler ve ekipman','Spieler & PvP':'Oyuncular ve PvP',
  'AUSRÜSTUNG · ATTRIBUTE · SKILLS · DEINE KAMPFKRAFT':'EKİPMAN · ÖZELLİKLER · YETENEKLER · GÜÇ','Set-Boni ansehen ›':'Set bonuslarını gör ›','Inventar':'Envanter','Attribute':'Özellikler','Talente':'Yetenekler','Materialien':'Malzemeler','Klasse wählen':'Sınıf seç','Talentpunkte':'Yetenek puanları','Leer':'Boş','Ablegen':'Çıkar','Kopf':'Baş','Waffe':'Silah','Ring':'Yüzük','Rüstung':'Zırh','Schuhe':'Botlar','Amulett':'Muska',
  'PFLANZEN · PFLEGE · ERNTE':'BİTKİLER · BAKIM · HASAT','Blütenlager':'Çiçek deposu','LAGER · DEALER · VEREDELN':'DEPO · SATICI · İŞLEME','Genetik':'Genetik','KREUZUNGEN · HYBRIDE · ESSENZEN':'ÇAPRAZLAR · HİBRİTLER · ÖZLER','Aufträge':'Siparişler','TÄGLICHE GROW-AUFGABEN':'GÜNLÜK YETİŞTİRME GÖREVLERİ','Genetik-Labor':'Genetik laboratuvarı','Grow-Aufträge':'Yetiştirme siparişleri',
  'Neue Aufträge · 10 Gold':'Yeni görevler · 10 Altın','Belohnung abholen':'Ödülü al','Quest starten':'Görevi başlat','Elite-Quest':'Elit görev','Zeit-Samen':'Zaman Tohumları','Kämpfen':'Savaş','Belohnungen':'Ödüller','Versuch':'Deneme','Versuche':'Denemeler','Zurück':'Geri','Weiter':'Devam',
  'ANBAU-TURM':'YETİŞTİRME KULESİ','Turm-Erholung':'Kule iyileşmesi','Vollständig erholt':'Tamamen iyileşti','Run starten':'Koşuyu başlat','Ersten Run starten':'İlk koşuyu başlat','Komplette Ranglisten':'Tam sıralamalar','Turm-Aufstieg':'Kule ilerlemesi','SAISON':'SEZON','Turm-Rangliste':'Kule sıralaması','Alle':'Tümü','MITTWOCH':'ÇARŞAMBA','INFORMATIONEN':'BİLGİ','Anbau-Turm Guide':'Kule Rehberi','Guide schließen':'Rehberi kapat','Ranglisten ansehen':'Sıralamaları gör','Rangliste':'Sıralama','Turm verlassen':'Kuleden çık'
 }
};
const EXT={
 en:{
  'Waffen & Rüstung':'Weapons & Armor','Nebelmarkt von Grünhain':'Mist Market of Grünhain','Schmuck, Edelsteine & Rollen':'Jewelry, Gems & Scrolls','Waffen & Rüstung neu würfeln · 1 🟢':'Reroll Weapons & Armor · 1 🟢','Schmuck & Materialien neu würfeln · 1 🟢':'Reroll Jewelry & Materials · 1 🟢',
  'Harzschmiede':'Resin Forge','Ausrüstung zerlegen · prismatisch schmieden':'Dismantle equipment · forge prismatic','Öffnen':'Open','Keine Ausrüstung im Inventar.':'No equipment in inventory.','AUSWAHL AUFHEBEN':'CLEAR SELECTION','ALLE AUSWÄHLEN':'SELECT ALL','ITEMS AUSWÄHLEN':'SELECT ITEMS','ZERLEGEN':'DISMANTLE','SCHMIEDEN':'FORGE','KLASSENSET':'CLASS SET','NEBELSCHMIED':'MIST FORGE','Samenfragmente':'Seed Fragments','Ausrüstung in Samenfragmente':'Equipment into seed fragments','Zufälliger Slot · deine Klasse':'Random slot · your class','Genetik · PvP · Fragmente':'Genetics · PvP · Fragments','Gold · Werte neu verteilen':'Gold · redistribute stats','1 zufälliges prismatisches Item':'1 random prismatic item','PRISMATISCHES ITEM SCHMIEDEN':'FORGE PRISMATIC ITEM',
  'Grow Legends · Händler':'Grow Legends · Dealer','Harz & Gold & Rahmen Dealer':'Resin, Gold & Frame Dealer','Harz-Taler':'Resin Tokens','Avatar-Rahmen':'Avatar Frames','Alle Rechte vorbehalten.':'All rights reserved.',
  'Harz-Automat':'Resin Machine','Tütchen':'Pouches','COMING SOON':'COMING SOON','Chancen & Garantien':'Odds & Guarantees','Normale Ziehung':'Normal draw','Belohnungsdetails':'Reward details','Zurück zum Päckchen':'Back to package','Dein Päckchen':'Your package','Belohnungen ansehen ✓':'View rewards ✓','Chancen & Belohnungen':'Odds & Rewards','Wähle deinen Einsatz':'Choose your stake','Päckchen öffnen':'Open package','Harz-Automat wird geladen …':'Loading Resin Machine …','Grow Legends · Hinterhof':'Grow Legends · Backyard','Harz-Taler einwerfen · Päckchen ziehen · Belohnungen öffnen':'Insert Resin Tokens · draw package · open rewards','Dein Bestand':'Your balance','Päckchen liegt bereit':'Package ready','Chancen & mögliche Belohnungen':'Odds & possible rewards','Harz-Automat konnte nicht geladen werden.':'Resin Machine could not be loaded.',
  'HALL OF HAZE · PVP':'HALL OF HAZE · PVP','GILDE':'GUILD','Gilde':'Guild','GEMEINSAM STÄRKER':'STRONGER TOGETHER','Gilden-Buds':'Guild Buds','GILDENFORTSCHRITT':'GUILD PROGRESS','Mitglied verwalten':'Manage member','Anführer':'Leader','Offizier':'Officer','Mitglied':'Member','Rolle wechseln':'Change role','Entfernen':'Remove','Gildenlevel':'Guild level',
  'Lade Freunde...':'Loading friends...','Lade Anfragen...':'Loading requests...','Annehmen':'Accept','Ablehnen':'Decline','Freunde':'Friends','Freundesliste konnte nicht geladen werden.':'Friends list could not be loaded.',
  'Nachrichten':'Messages','ungelesen':'unread','Keine Nachrichten im Eingang.':'No messages in inbox.','Noch keine Nachrichten gesendet.':'No messages sent yet.','Nachricht gesendet':'Message sent','Von':'From','An':'To','Antworten':'Reply','Löschen':'Delete','Ungelesen':'Unread'
 },
 es:{
  'Waffen & Rüstung':'Armas y armadura','Nebelmarkt von Grünhain':'Mercado de Niebla de Grünhain','Schmuck, Edelsteine & Rollen':'Joyas, gemas y pergaminos','Harzschmiede':'Forja de resina','Öffnen':'Abrir','Keine Ausrüstung im Inventar.':'No hay equipo en el inventario.','ZERLEGEN':'DESMONTAR','SCHMIEDEN':'FORJAR','KLASSENSET':'SET DE CLASE','Samenfragmente':'Fragmentos de semilla','PRISMATISCHES ITEM SCHMIEDEN':'FORJAR OBJETO PRISMÁTICO',
  'Grow Legends · Händler':'Grow Legends · Comerciante','Harz & Gold & Rahmen Dealer':'Resina, Oro y Marcos','Harz-Taler':'Fichas de resina','Avatar-Rahmen':'Marcos de avatar','Harz-Automat':'Máquina de resina','Tütchen':'Paquetes','Chancen & Garantien':'Probabilidades y garantías','Normale Ziehung':'Tirada normal','Belohnungsdetails':'Detalles de recompensa','Zurück zum Päckchen':'Volver al paquete','Dein Päckchen':'Tu paquete','Belohnungen ansehen ✓':'Ver recompensas ✓','Chancen & Belohnungen':'Probabilidades y recompensas','Wähle deinen Einsatz':'Elige tu apuesta','Päckchen öffnen':'Abrir paquete','Dein Bestand':'Tu saldo','Päckchen liegt bereit':'Paquete listo',
  'GILDE':'GREMIO','Gilde':'Gremio','GEMEINSAM STÄRKER':'MÁS FUERTES JUNTOS','Gilden-Buds':'Brotes del gremio','GILDENFORTSCHRITT':'PROGRESO DEL GREMIO','Mitglied verwalten':'Gestionar miembro','Anführer':'Líder','Offizier':'Oficial','Mitglied':'Miembro','Rolle wechseln':'Cambiar rol','Entfernen':'Eliminar',
  'Lade Freunde...':'Cargando amigos...','Lade Anfragen...':'Cargando solicitudes...','Annehmen':'Aceptar','Ablehnen':'Rechazar','Freunde':'Amigos','Freundesliste konnte nicht geladen werden.':'No se pudo cargar la lista de amigos.',
  'Nachrichten':'Mensajes','ungelesen':'sin leer','Keine Nachrichten im Eingang.':'No hay mensajes en la bandeja de entrada.','Noch keine Nachrichten gesendet.':'Aún no se enviaron mensajes.','Nachricht gesendet':'Mensaje enviado','Von':'De','An':'Para','Antworten':'Responder','Löschen':'Eliminar','Ungelesen':'No leído'
 },
 fr:{
  'Waffen & Rüstung':'Armes & armures','Nebelmarkt von Grünhain':'Marché de brume de Grünhain','Schmuck, Edelsteine & Rollen':'Bijoux, gemmes & parchemins','Harzschmiede':'Forge de résine','Öffnen':'Ouvrir','Keine Ausrüstung im Inventar.':'Aucun équipement dans l’inventaire.','ZERLEGEN':'DÉMANTELER','SCHMIEDEN':'FORGER','KLASSENSET':'SET DE CLASSE','Samenfragmente':'Fragments de graines','PRISMATISCHES ITEM SCHMIEDEN':'FORGER UN OBJET PRISMATIQUE',
  'Grow Legends · Händler':'Grow Legends · Marchand','Harz & Gold & Rahmen Dealer':'Résine, Or & Cadres','Harz-Taler':'Jetons de résine','Avatar-Rahmen':'Cadres d’avatar','Harz-Automat':'Machine à résine','Tütchen':'Sachets','Chancen & Garantien':'Chances & garanties','Normale Ziehung':'Tirage normal','Belohnungsdetails':'Détails de récompense','Zurück zum Päckchen':'Retour au paquet','Dein Päckchen':'Ton paquet','Belohnungen ansehen ✓':'Voir les récompenses ✓','Chancen & Belohnungen':'Chances & récompenses','Wähle deinen Einsatz':'Choisis ta mise','Päckchen öffnen':'Ouvrir le paquet','Dein Bestand':'Ton solde','Päckchen liegt bereit':'Paquet prêt',
  'GILDE':'GUILDE','Gilde':'Guilde','GEMEINSAM STÄRKER':'PLUS FORTS ENSEMBLE','Gilden-Buds':'Buds de guilde','GILDENFORTSCHRITT':'PROGRESSION DE GUILDE','Mitglied verwalten':'Gérer le membre','Anführer':'Chef','Offizier':'Officier','Mitglied':'Membre','Rolle wechseln':'Changer le rôle','Entfernen':'Retirer',
  'Lade Freunde...':'Chargement des amis...','Lade Anfragen...':'Chargement des demandes...','Annehmen':'Accepter','Ablehnen':'Refuser','Freunde':'Amis','Freundesliste konnte nicht geladen werden.':'Impossible de charger la liste d’amis.',
  'Nachrichten':'Messages','ungelesen':'non lus','Keine Nachrichten im Eingang.':'Aucun message dans la boîte de réception.','Noch keine Nachrichten gesendet.':'Aucun message envoyé.','Nachricht gesendet':'Message envoyé','Von':'De','An':'À','Antworten':'Répondre','Löschen':'Supprimer','Ungelesen':'Non lu'
 },
 pl:{
  'Waffen & Rüstung':'Broń i pancerz','Nebelmarkt von Grünhain':'Mglisty Targ Grünhain','Schmuck, Edelsteine & Rollen':'Biżuteria, klejnoty i zwoje','Harzschmiede':'Kuźnia żywicy','Öffnen':'Otwórz','Keine Ausrüstung im Inventar.':'Brak wyposażenia w ekwipunku.','ZERLEGEN':'ROZŁÓŻ','SCHMIEDEN':'KUJ','KLASSENSET':'ZESTAW KLASOWY','Samenfragmente':'Fragmenty nasion','PRISMATISCHES ITEM SCHMIEDEN':'WYKUTY PRYZMATYCZNY PRZEDMIOT',
  'Grow Legends · Händler':'Grow Legends · Handlarz','Harz & Gold & Rahmen Dealer':'Żywica, Złoto i Ramki','Harz-Taler':'Żetony żywicy','Avatar-Rahmen':'Ramki awatara','Harz-Automat':'Automat żywicy','Tütchen':'Paczki','Chancen & Garantien':'Szanse i gwarancje','Normale Ziehung':'Zwykłe losowanie','Belohnungsdetails':'Szczegóły nagrody','Zurück zum Päckchen':'Wróć do paczki','Dein Päckchen':'Twoja paczka','Belohnungen ansehen ✓':'Zobacz nagrody ✓','Chancen & Belohnungen':'Szanse i nagrody','Wähle deinen Einsatz':'Wybierz stawkę','Päckchen öffnen':'Otwórz paczkę','Dein Bestand':'Twój stan','Päckchen liegt bereit':'Paczka gotowa',
  'GILDE':'GILDIA','Gilde':'Gildia','GEMEINSAM STÄRKER':'RAZEM SILNIEJSI','Gilden-Buds':'Pąki gildii','GILDENFORTSCHRITT':'POSTĘP GILDII','Mitglied verwalten':'Zarządzaj członkiem','Anführer':'Lider','Offizier':'Oficer','Mitglied':'Członek','Rolle wechseln':'Zmień rolę','Entfernen':'Usuń',
  'Lade Freunde...':'Ładowanie znajomych...','Lade Anfragen...':'Ładowanie próśb...','Annehmen':'Akceptuj','Ablehnen':'Odrzuć','Freunde':'Znajomi','Freundesliste konnte nicht geladen werden.':'Nie udało się załadować listy znajomych.',
  'Nachrichten':'Wiadomości','ungelesen':'nieprzeczytane','Keine Nachrichten im Eingang.':'Brak wiadomości w skrzynce odbiorczej.','Noch keine Nachrichten gesendet.':'Nie wysłano jeszcze wiadomości.','Nachricht gesendet':'Wiadomość wysłana','Von':'Od','An':'Do','Antworten':'Odpowiedz','Löschen':'Usuń','Ungelesen':'Nieprzeczytane'
 },
 tr:{
  'Waffen & Rüstung':'Silahlar ve Zırh','Nebelmarkt von Grünhain':'Grünhain Sis Pazarı','Schmuck, Edelsteine & Rollen':'Takılar, Taşlar ve Parşömenler','Harzschmiede':'Reçine Ocağı','Öffnen':'Aç','Keine Ausrüstung im Inventar.':'Envanterde ekipman yok.','ZERLEGEN':'SÖK','SCHMIEDEN':'DÖV','KLASSENSET':'SINIF SETİ','Samenfragmente':'Tohum parçaları','PRISMATISCHES ITEM SCHMIEDEN':'PRİZMATİK EŞYA DÖV',
  'Grow Legends · Händler':'Grow Legends · Tüccar','Harz & Gold & Rahmen Dealer':'Reçine, Altın ve Çerçeve','Harz-Taler':'Reçine Jetonları','Avatar-Rahmen':'Avatar Çerçeveleri','Harz-Automat':'Reçine Makinesi','Tütchen':'Paketler','Chancen & Garantien':'Şanslar ve garantiler','Normale Ziehung':'Normal çekiliş','Belohnungsdetails':'Ödül ayrıntıları','Zurück zum Päckchen':'Pakete dön','Dein Päckchen':'Paketin','Belohnungen ansehen ✓':'Ödülleri gör ✓','Chancen & Belohnungen':'Şanslar ve ödüller','Wähle deinen Einsatz':'Bahsini seç','Päckchen öffnen':'Paketi aç','Dein Bestand':'Bakiyen','Päckchen liegt bereit':'Paket hazır',
  'GILDE':'LONCA','Gilde':'Lonca','GEMEINSAM STÄRKER':'BİRLİKTE DAHA GÜÇLÜ','Gilden-Buds':'Lonca Tomurcukları','GILDENFORTSCHRITT':'LONCA İLERLEMESİ','Mitglied verwalten':'Üyeyi yönet','Anführer':'Lider','Offizier':'Subay','Mitglied':'Üye','Rolle wechseln':'Rolü değiştir','Entfernen':'Kaldır',
  'Lade Freunde...':'Arkadaşlar yükleniyor...','Lade Anfragen...':'İstekler yükleniyor...','Annehmen':'Kabul et','Ablehnen':'Reddet','Freunde':'Arkadaşlar','Freundesliste konnte nicht geladen werden.':'Arkadaş listesi yüklenemedi.',
  'Nachrichten':'Mesajlar','ungelesen':'okunmamış','Keine Nachrichten im Eingang.':'Gelen kutusunda mesaj yok.','Noch keine Nachrichten gesendet.':'Henüz mesaj gönderilmedi.','Nachricht gesendet':'Mesaj gönderildi','Von':'Kimden','An':'Kime','Antworten':'Yanıtla','Löschen':'Sil','Ungelesen':'Okunmamış'
 }
};
for(const lang of Object.keys(EXT))Object.assign(M[lang]||(M[lang]={}),EXT[lang]);
const ROOTS=['world','character','grow','quests','dungeon','tower','caravan','endgame','shop','forge','harzDealer','goldShop','bagDealer','pvp','guild','hall','friends','mail','admin','systemtech'];
const MODAL={
 en:{
  'Belohnung bestätigen':'Confirm reward','Belohnung bestätigen · Zur Dungeon-Karte':'Confirm reward · Back to dungeon map','Belohnung bestätigen · Zur 10er-Karte':'Confirm reward · Back to 10-stage map',
  'BELOHNUNG':'REWARD','SIEG':'VICTORY','NIEDERLAGE':'DEFEAT','Schließen':'Close','Zum Album':'Go to album','NEUES PET GEFUNDEN':'NEW PET FOUND','Quelle':'Source','Neue Qualitätsstufe für dein Sammelalbum wurde dauerhaft freigeschaltet.':'A new quality tier has been permanently unlocked for your collection album.',
  'LEVEL UP!':'LEVEL UP!','Attributpunkte':'Attribute points','Talentpunkt':'Talent point','Talentpunkte':'Talent points',
  'Täglicher Login-Bonus':'Daily Login Bonus','Weiter spielen':'Continue playing','Tägliche Belohnung':'Daily reward','7-Tage Login-Bonus':'7-Day Login Bonus','GESCHENK ÖFFNEN':'OPEN GIFT','Abgeholt':'Claimed','Überraschung':'Surprise','Wochen-Truhe':'Weekly Chest','Truhen-Level':'Chest level','WOCHEN-EXP':'WEEKLY XP','STATUS':'STATUS','ÖFFNEN':'OPEN','SAMMELT':'COLLECTING','Truhen-Inventar':'Chest inventory','Belohnungen übrig':'rewards remaining','Nehmen':'Claim','ALLES ABHOLEN':'CLAIM ALL','Belohnungen · Level 1–10':'Rewards · Level 1–10',
  'Bestätigen':'Confirm','Abbrechen':'Cancel','Ja':'Yes','Nein':'No','1 Harz-Taler nutzen':'Use 1 Resin Token','Dampf auffüllen?':'Refill Steam?','Überspringen':'Skip','Fertig':'Done','Los geht\'s! ➜':'Let\'s go! ➜','ERSTER BESUCH':'FIRST VISIT','HILFE':'HELP'
 },
 es:{
  'Belohnung bestätigen':'Confirmar recompensa','Belohnung bestätigen · Zur Dungeon-Karte':'Confirmar recompensa · Volver al mapa','Belohnung bestätigen · Zur 10er-Karte':'Confirmar recompensa · Volver al mapa de 10','BELOHNUNG':'RECOMPENSA','SIEG':'VICTORIA','NIEDERLAGE':'DERROTA','Schließen':'Cerrar','Zum Album':'Ir al álbum','NEUES PET GEFUNDEN':'NUEVA MASCOTA ENCONTRADA','Quelle':'Fuente','LEVEL UP!':'¡SUBES DE NIVEL!','Attributpunkte':'Puntos de atributo','Talentpunkt':'Punto de talento','Talentpunkte':'Puntos de talento','Täglicher Login-Bonus':'Bono de inicio diario','Weiter spielen':'Seguir jugando','Tägliche Belohnung':'Recompensa diaria','7-Tage Login-Bonus':'Bono de inicio de 7 días','GESCHENK ÖFFNEN':'ABRIR REGALO','Abgeholt':'Recogido','Überraschung':'Sorpresa','Wochen-Truhe':'Cofre semanal','Truhen-Level':'Nivel del cofre','WOCHEN-EXP':'EXP SEMANAL','STATUS':'ESTADO','ÖFFNEN':'ABRIR','SAMMELT':'ACUMULANDO','Truhen-Inventar':'Inventario del cofre','Nehmen':'Recoger','ALLES ABHOLEN':'RECOGER TODO','Bestätigen':'Confirmar','Abbrechen':'Cancelar','Ja':'Sí','Nein':'No','Überspringen':'Saltar','Fertig':'Listo','ERSTER BESUCH':'PRIMERA VISITA','HILFE':'AYUDA'
 },
 fr:{
  'Belohnung bestätigen':'Confirmer la récompense','Belohnung bestätigen · Zur Dungeon-Karte':'Confirmer · Retour à la carte','Belohnung bestätigen · Zur 10er-Karte':'Confirmer · Retour à la carte 10','BELOHNUNG':'RÉCOMPENSE','SIEG':'VICTOIRE','NIEDERLAGE':'DÉFAITE','Schließen':'Fermer','Zum Album':'Voir l’album','NEUES PET GEFUNDEN':'NOUVEAU PET TROUVÉ','Quelle':'Source','LEVEL UP!':'NIVEAU SUPÉRIEUR !','Attributpunkte':'Points d’attribut','Talentpunkt':'Point de talent','Talentpunkte':'Points de talent','Täglicher Login-Bonus':'Bonus de connexion quotidien','Weiter spielen':'Continuer','Tägliche Belohnung':'Récompense quotidienne','7-Tage Login-Bonus':'Bonus de connexion 7 jours','GESCHENK ÖFFNEN':'OUVRIR LE CADEAU','Abgeholt':'Récupéré','Überraschung':'Surprise','Wochen-Truhe':'Coffre hebdomadaire','Truhen-Level':'Niveau du coffre','WOCHEN-EXP':'EXP HEBDO','STATUS':'STATUT','ÖFFNEN':'OUVRIR','SAMMELT':'COLLECTE','Truhen-Inventar':'Inventaire du coffre','Nehmen':'Prendre','ALLES ABHOLEN':'TOUT RÉCUPÉRER','Bestätigen':'Confirmer','Abbrechen':'Annuler','Ja':'Oui','Nein':'Non','Überspringen':'Passer','Fertig':'Terminé','ERSTER BESUCH':'PREMIÈRE VISITE','HILFE':'AIDE'
 },
 pl:{
  'Belohnung bestätigen':'Potwierdź nagrodę','Belohnung bestätigen · Zur Dungeon-Karte':'Potwierdź · Wróć do mapy','Belohnung bestätigen · Zur 10er-Karte':'Potwierdź · Wróć do mapy 10','BELOHNUNG':'NAGRODA','SIEG':'ZWYCIĘSTWO','NIEDERLAGE':'PORAŻKA','Schließen':'Zamknij','Zum Album':'Do albumu','NEUES PET GEFUNDEN':'NOWY PET ZNALEZIONY','Quelle':'Źródło','LEVEL UP!':'AWANS!','Attributpunkte':'Punkty atrybutów','Talentpunkt':'Punkt talentu','Talentpunkte':'Punkty talentów','Täglicher Login-Bonus':'Dzienny bonus logowania','Weiter spielen':'Graj dalej','Tägliche Belohnung':'Dzienna nagroda','7-Tage Login-Bonus':'7-dniowy bonus logowania','GESCHENK ÖFFNEN':'OTWÓRZ PREZENT','Abgeholt':'Odebrane','Überraschung':'Niespodzianka','Wochen-Truhe':'Tygodniowa skrzynia','Truhen-Level':'Poziom skrzyni','WOCHEN-EXP':'TYGODNIOWE EXP','STATUS':'STATUS','ÖFFNEN':'OTWÓRZ','SAMMELT':'ZBIERA','Truhen-Inventar':'Ekwipunek skrzyni','Nehmen':'Odbierz','ALLES ABHOLEN':'ODBIERZ WSZYSTKO','Bestätigen':'Potwierdź','Abbrechen':'Anuluj','Ja':'Tak','Nein':'Nie','Überspringen':'Pomiń','Fertig':'Gotowe','ERSTER BESUCH':'PIERWSZA WIZYTA','HILFE':'POMOC'
 },
 tr:{
  'Belohnung bestätigen':'Ödülü onayla','Belohnung bestätigen · Zur Dungeon-Karte':'Ödülü onayla · Haritaya dön','Belohnung bestätigen · Zur 10er-Karte':'Ödülü onayla · 10 aşamalı haritaya dön','BELOHNUNG':'ÖDÜL','SIEG':'ZAFER','NIEDERLAGE':'YENİLGİ','Schließen':'Kapat','Zum Album':'Albüme git','NEUES PET GEFUNDEN':'YENİ PET BULUNDU','Quelle':'Kaynak','LEVEL UP!':'SEVİYE ATLADI!','Attributpunkte':'Özellik puanları','Talentpunkt':'Yetenek puanı','Talentpunkte':'Yetenek puanları','Täglicher Login-Bonus':'Günlük giriş bonusu','Weiter spielen':'Oynamaya devam et','Tägliche Belohnung':'Günlük ödül','7-Tage Login-Bonus':'7 Günlük Giriş Bonusu','GESCHENK ÖFFNEN':'HEDİYEYİ AÇ','Abgeholt':'Alındı','Überraschung':'Sürpriz','Wochen-Truhe':'Haftalık Sandık','Truhen-Level':'Sandık seviyesi','WOCHEN-EXP':'HAFTALIK XP','STATUS':'DURUM','ÖFFNEN':'AÇ','SAMMELT':'TOPLUYOR','Truhen-Inventar':'Sandık envanteri','Nehmen':'Al','ALLES ABHOLEN':'TÜMÜNÜ AL','Bestätigen':'Onayla','Abbrechen':'İptal','Ja':'Evet','Nein':'Hayır','Überspringen':'Atla','Fertig':'Bitti','ERSTER BESUCH':'İLK ZİYARET','HILFE':'YARDIM'
 }
};
for(const lang of Object.keys(MODAL))Object.assign(M[lang]||(M[lang]={}),MODAL[lang]);

/* Current canonical-renderer vocabulary. Keep this close to the presentation
   bridge so active owners can localize immediately after they render. */
const CURRENT={
 en:{
  'Deine Abenteuer':'Your adventures','Aktuelles':'Current','Dungeon':'Dungeon','Anbauturm':'Grow Tower','Tagesziele':'Daily goals','Weltboss':'World boss','Illegales Buch':'Illegal Book','Harzschmiede':'Resin Forge','Freund werben':'Invite friends','Shop':'Shop','Alles ruhig':'All quiet','Offen · Gratis':'Open · Free','Offen · 10 Harz':'Open · 10 Resin','Geschlossen':'Closed','Öffnen':'Open','Herausfordern':'Challenge',
  'ZÜCHTEN · PFLEGEN · MUTIEREN · CHARAKTER STÄRKEN':'BREED · CARE · MUTATE · STRENGTHEN CHARACTER','GROW-MEISTERSCHAFT':'GROW MASTERY','PFLEGE BEREIT':'CARE READY','ERNTE BEREIT':'HARVEST READY','SAMENFRAGMENTE':'SEED FRAGMENTS','Samenlager':'Seed storage','Sorten':'Strains','Töpfe':'Pots','Pflanzendetails':'Plant details','Sortenbuch & Gilden-Gewächshaus':'Strain book & Guild greenhouse','Sortenbuch öffnen':'Open strain book','Wochenbeitrag':'Weekly contribution','Diese Woche:':'This week:','Ernten':'Harvests','Mutation':'Mutation','Lampe':'Lamp','Raum':'Room','Mehr gleichzeitig nutzbare Pflanzenplätze.':'More plant slots usable at the same time.','Wachstumszeit je Level.':'growth time per level.','Ertrag je Level.':'yield per level.','Aktive Sorte':'Active strain','Kein Grow-Buff':'No grow buff','Im Growroom eine geerntete Blüte aktivieren.':'Activate a harvested bud in the Growroom.','Noch nicht entdeckt':'Not discovered yet','Keine Mutation entdeckt':'No mutation discovered','Alle Klassen':'All classes','Ausgewählt':'Selected','Auswählen':'Select','Vorrat':'Stock','Kaufen':'Buy','Wachstum':'Growth','Verkauf':'Sell',
  'HELDENQUARTIER':'HERO QUARTERS','Noch keine Edelsteine oder Rollen.':'No gems or scrolls yet.','Set-Boni ansehen':'View set bonuses','Unbekanntes Item':'Unknown item',
  'Zurück zur\nDungeon-Weltkarte':'Back to\nDungeon world map','Besiege alle 10 Gegner der Reihe nach':'Defeat all 10 enemies in order','Dungeon-Versuch':'Dungeon attempt','Gratisversuch prüfen …':'Checking free attempt …','ACHTUNG':'WARNING','BETRETEN AUF':'ENTER AT','EIGENE GEFAHR!':'YOUR OWN RISK!','DUNGEON ABGESCHLOSSEN':'DUNGEON COMPLETE','Alle 10 Gegner wurden besiegt.':'All 10 enemies have been defeated.','Gegner':'Enemy','Empfohlen Level':'Recommended level','Mögliche Belohnungen':'Possible rewards','LEGENDÄR':'LEGENDARY','Deine Stärke':'Your power','BOSS ANGREIFEN':'ATTACK BOSS','GEGNER ANGREIFEN':'ATTACK ENEMY',
  'ANBAU-TURM':'GROW TOWER','Turm-Erholung':'Tower recovery','Vollständig erholt':'Fully recovered','Turm-Leben vollständig regeneriert':'Tower health fully regenerated','Run starten':'Start run','Ersten Run starten':'Start first run','Komplette Ranglisten':'Full rankings','Turm-Aufstieg':'Tower climb','Turm-Rangliste':'Tower ranking','Turm verlassen':'Leave tower','Mittwochs-Aufgabe':'Wednesday task','Belohnung holen':'Claim reward','In Arbeit':'In progress','Abgeholt':'Claimed','Belohnung abholen':'Claim reward','Keine Platzierung gefunden':'No placement found','Deine Platzierung':'Your placement','Belohnung bereit':'Reward ready','Zur Startseite':'Back to home','Anbau-Turm konnte nicht geladen werden':'Grow Tower could not be loaded'
 },
 es:{
  'Deine Abenteuer':'Tus aventuras','Aktuelles':'Actual','Dungeon':'Mazmorra','Anbauturm':'Torre de cultivo','Tagesziele':'Objetivos diarios','Weltboss':'Jefe mundial','Illegales Buch':'Libro ilegal','Harzschmiede':'Forja de resina','Freund werben':'Invitar amigos','Shop':'Tienda','Alles ruhig':'Todo tranquilo','Offen · Gratis':'Abierto · Gratis','Offen · 10 Harz':'Abierto · 10 resina','Geschlossen':'Cerrado','Öffnen':'Abrir','Herausfordern':'Desafiar',
  'ZÜCHTEN · PFLEGEN · MUTIEREN · CHARAKTER STÄRKEN':'CRIAR · CUIDAR · MUTAR · FORTALECER PERSONAJE','GROW-MEISTERSCHAFT':'MAESTRÍA DE CULTIVO','PFLEGE BEREIT':'CUIDADO LISTO','ERNTE BEREIT':'COSECHA LISTA','SAMENFRAGMENTE':'FRAGMENTOS DE SEMILLA','Samenlager':'Almacén de semillas','Sorten':'Variedades','Töpfe':'Macetas','Pflanzendetails':'Detalles de planta','Sortenbuch & Gilden-Gewächshaus':'Libro de variedades e invernadero del gremio','Sortenbuch öffnen':'Abrir libro de variedades','Wochenbeitrag':'Contribución semanal','Diese Woche:':'Esta semana:','Ernten':'Cosechas','Mutation':'Mutación','Lampe':'Lámpara','Raum':'Sala','Aktive Sorte':'Variedad activa','Kein Grow-Buff':'Sin bono de cultivo','Alle Klassen':'Todas las clases','Ausgewählt':'Seleccionado','Auswählen':'Seleccionar','Vorrat':'Stock','Kaufen':'Comprar','Wachstum':'Crecimiento','Verkauf':'Venta',
  'HELDENQUARTIER':'CUARTEL DEL HÉROE','Noch keine Edelsteine oder Rollen.':'Aún no hay gemas ni pergaminos.','Set-Boni ansehen':'Ver bonus de set','Unbekanntes Item':'Objeto desconocido',
  'Besiege alle 10 Gegner der Reihe nach':'Derrota a los 10 enemigos en orden','Dungeon-Versuch':'Intento de mazmorra','Gratisversuch prüfen …':'Comprobando intento gratis …','ACHTUNG':'ATENCIÓN','BETRETEN AUF':'ENTRAR BAJO','EIGENE GEFAHR!':'TU PROPIO RIESGO','DUNGEON ABGESCHLOSSEN':'MAZMORRA COMPLETADA','Alle 10 Gegner wurden besiegt.':'Los 10 enemigos han sido derrotados.','Gegner':'Enemigo','Empfohlen Level':'Nivel recomendado','Mögliche Belohnungen':'Recompensas posibles','LEGENDÄR':'LEGENDARIO','Deine Stärke':'Tu poder','BOSS ANGREIFEN':'ATACAR JEFE','GEGNER ANGREIFEN':'ATACAR ENEMIGO',
  'ANBAU-TURM':'TORRE DE CULTIVO','Turm-Erholung':'Recuperación de torre','Vollständig erholt':'Totalmente recuperado','Run starten':'Iniciar run','Ersten Run starten':'Iniciar primer run','Komplette Ranglisten':'Clasificaciones completas','Turm-Aufstieg':'Ascenso de torre','Turm-Rangliste':'Clasificación de torre','Turm verlassen':'Salir de la torre','Belohnung holen':'Recoger recompensa','In Arbeit':'En progreso','Abgeholt':'Recogido','Belohnung abholen':'Recoger recompensa','Keine Platzierung gefunden':'No se encontró posición','Deine Platzierung':'Tu posición','Belohnung bereit':'Recompensa lista','Zur Startseite':'Volver al inicio','Anbau-Turm konnte nicht geladen werden':'No se pudo cargar la Torre'
 },
 fr:{
  'Deine Abenteuer':'Tes aventures','Aktuelles':'Actuel','Dungeon':'Donjon','Anbauturm':'Tour de culture','Tagesziele':'Objectifs quotidiens','Weltboss':'Boss mondial','Illegales Buch':'Livre illégal','Harzschmiede':'Forge de résine','Freund werben':'Inviter des amis','Shop':'Boutique','Alles ruhig':'Tout est calme','Offen · Gratis':'Ouvert · Gratuit','Offen · 10 Harz':'Ouvert · 10 résine','Geschlossen':'Fermé','Öffnen':'Ouvrir','Herausfordern':'Défier',
  'ZÜCHTEN · PFLEGEN · MUTIEREN · CHARAKTER STÄRKEN':'CULTIVER · SOIGNER · MUTER · RENFORCER LE PERSONNAGE','GROW-MEISTERSCHAFT':'MAÎTRISE DE CULTURE','PFLEGE BEREIT':'SOIN PRÊT','ERNTE BEREIT':'RÉCOLTE PRÊTE','SAMENFRAGMENTE':'FRAGMENTS DE GRAINES','Samenlager':'Stock de graines','Sorten':'Variétés','Töpfe':'Pots','Pflanzendetails':'Détails de la plante','Sortenbuch & Gilden-Gewächshaus':'Livre des variétés & serre de guilde','Sortenbuch öffnen':'Ouvrir le livre des variétés','Wochenbeitrag':'Contribution hebdomadaire','Diese Woche:':'Cette semaine :','Ernten':'Récoltes','Mutation':'Mutation','Lampe':'Lampe','Raum':'Salle','Aktive Sorte':'Variété active','Kein Grow-Buff':'Aucun bonus de culture','Alle Klassen':'Toutes les classes','Ausgewählt':'Sélectionné','Auswählen':'Sélectionner','Vorrat':'Stock','Kaufen':'Acheter','Wachstum':'Croissance','Verkauf':'Vente',
  'HELDENQUARTIER':'QUARTIER DU HÉROS','Noch keine Edelsteine oder Rollen.':'Pas encore de gemmes ni de parchemins.','Set-Boni ansehen':'Voir les bonus de set','Unbekanntes Item':'Objet inconnu',
  'Besiege alle 10 Gegner der Reihe nach':'Bats les 10 ennemis dans l’ordre','Dungeon-Versuch':'Essai de donjon','Gratisversuch prüfen …':'Vérification de l’essai gratuit …','ACHTUNG':'ATTENTION','BETRETEN AUF':'ENTRER À','EIGENE GEFAHR!':'TES RISQUES !','DUNGEON ABGESCHLOSSEN':'DONJON TERMINÉ','Alle 10 Gegner wurden besiegt.':'Les 10 ennemis ont été vaincus.','Gegner':'Ennemi','Empfohlen Level':'Niveau recommandé','Mögliche Belohnungen':'Récompenses possibles','LEGENDÄR':'LÉGENDAIRE','Deine Stärke':'Ta puissance','BOSS ANGREIFEN':'ATTAQUER LE BOSS','GEGNER ANGREIFEN':'ATTAQUER L’ENNEMI',
  'ANBAU-TURM':'TOUR DE CULTURE','Turm-Erholung':'Récupération de la tour','Vollständig erholt':'Entièrement récupéré','Run starten':'Lancer le run','Ersten Run starten':'Lancer le premier run','Komplette Ranglisten':'Classements complets','Turm-Aufstieg':'Ascension de la tour','Turm-Rangliste':'Classement de la tour','Turm verlassen':'Quitter la tour','Belohnung holen':'Récupérer la récompense','In Arbeit':'En cours','Abgeholt':'Récupéré','Belohnung abholen':'Récupérer la récompense','Keine Platzierung gefunden':'Aucun classement trouvé','Deine Platzierung':'Ton classement','Belohnung bereit':'Récompense prête','Zur Startseite':'Retour à l’accueil','Anbau-Turm konnte nicht geladen werden':'Impossible de charger la Tour'
 },
 pl:{
  'Deine Abenteuer':'Twoje przygody','Aktuelles':'Aktualne','Dungeon':'Loch','Anbauturm':'Wieża uprawy','Tagesziele':'Cele dzienne','Weltboss':'Boss świata','Illegales Buch':'Nielegalna księga','Harzschmiede':'Kuźnia żywicy','Freund werben':'Zaproś znajomego','Shop':'Sklep','Alles ruhig':'Spokój','Offen · Gratis':'Otwarte · Gratis','Offen · 10 Harz':'Otwarte · 10 żywicy','Geschlossen':'Zamknięte','Öffnen':'Otwórz','Herausfordern':'Rzuć wyzwanie',
  'ZÜCHTEN · PFLEGEN · MUTIEREN · CHARAKTER STÄRKEN':'HODUJ · PIELĘGNUJ · MUTUJ · WZMACNIAJ POSTAĆ','GROW-MEISTERSCHAFT':'MISTRZOSTWO UPRAWY','PFLEGE BEREIT':'PIELĘGNACJA GOTOWA','ERNTE BEREIT':'ZBIÓR GOTOWY','SAMENFRAGMENTE':'FRAGMENTY NASION','Samenlager':'Magazyn nasion','Sorten':'Odmiany','Töpfe':'Doniczki','Pflanzendetails':'Szczegóły rośliny','Sortenbuch & Gilden-Gewächshaus':'Księga odmian i szklarnia gildii','Sortenbuch öffnen':'Otwórz księgę odmian','Wochenbeitrag':'Tygodniowy wkład','Diese Woche:':'W tym tygodniu:','Ernten':'Zbiory','Mutation':'Mutacja','Lampe':'Lampa','Raum':'Pomieszczenie','Aktive Sorte':'Aktywna odmiana','Kein Grow-Buff':'Brak bonusu uprawy','Alle Klassen':'Wszystkie klasy','Ausgewählt':'Wybrano','Auswählen':'Wybierz','Vorrat':'Stan','Kaufen':'Kup','Wachstum':'Wzrost','Verkauf':'Sprzedaż',
  'HELDENQUARTIER':'KWATERA BOHATERA','Noch keine Edelsteine oder Rollen.':'Brak klejnotów lub zwojów.','Set-Boni ansehen':'Pokaż bonusy zestawu','Unbekanntes Item':'Nieznany przedmiot',
  'Besiege alle 10 Gegner der Reihe nach':'Pokonaj kolejno wszystkich 10 przeciwników','Dungeon-Versuch':'Próba lochu','Gratisversuch prüfen …':'Sprawdzanie darmowej próby …','ACHTUNG':'UWAGA','BETRETEN AUF':'WEJŚCIE NA','EIGENE GEFAHR!':'WŁASNE RYZYKO!','DUNGEON ABGESCHLOSSEN':'LOCH UKOŃCZONY','Alle 10 Gegner wurden besiegt.':'Pokonano wszystkich 10 przeciwników.','Gegner':'Przeciwnik','Empfohlen Level':'Zalecany poziom','Mögliche Belohnungen':'Możliwe nagrody','LEGENDÄR':'LEGENDARNY','Deine Stärke':'Twoja siła','BOSS ANGREIFEN':'ATAKUJ BOSSA','GEGNER ANGREIFEN':'ATAKUJ PRZECIWNIKA',
  'ANBAU-TURM':'WIEŻA UPRAWY','Turm-Erholung':'Regeneracja wieży','Vollständig erholt':'W pełni zregenerowano','Run starten':'Rozpocznij run','Ersten Run starten':'Rozpocznij pierwszy run','Komplette Ranglisten':'Pełne rankingi','Turm-Aufstieg':'Wspinaczka w wieży','Turm-Rangliste':'Ranking wieży','Turm verlassen':'Opuść wieżę','Belohnung holen':'Odbierz nagrodę','In Arbeit':'W toku','Abgeholt':'Odebrano','Belohnung abholen':'Odbierz nagrodę','Keine Platzierung gefunden':'Nie znaleziono pozycji','Deine Platzierung':'Twoja pozycja','Belohnung bereit':'Nagroda gotowa','Zur Startseite':'Wróć na start','Anbau-Turm konnte nicht geladen werden':'Nie udało się załadować Wieży'
 },
 tr:{
  'Deine Abenteuer':'Maceraların','Aktuelles':'Güncel','Dungeon':'Zindan','Anbauturm':'Yetiştirme Kulesi','Tagesziele':'Günlük hedefler','Weltboss':'Dünya bossu','Illegales Buch':'Yasadışı kitap','Harzschmiede':'Reçine Ocağı','Freund werben':'Arkadaş davet et','Shop':'Mağaza','Alles ruhig':'Her şey sakin','Offen · Gratis':'Açık · Ücretsiz','Offen · 10 Harz':'Açık · 10 reçine','Geschlossen':'Kapalı','Öffnen':'Aç','Herausfordern':'Meydan oku',
  'ZÜCHTEN · PFLEGEN · MUTIEREN · CHARAKTER STÄRKEN':'YETİŞTİR · BAKIM YAP · MUTASYON · KARAKTERİ GÜÇLENDİR','GROW-MEISTERSCHAFT':'YETİŞTİRME USTALIĞI','PFLEGE BEREIT':'BAKIM HAZIR','ERNTE BEREIT':'HASAT HAZIR','SAMENFRAGMENTE':'TOHUM PARÇALARI','Samenlager':'Tohum deposu','Sorten':'Türler','Töpfe':'Saksılar','Pflanzendetails':'Bitki ayrıntıları','Sortenbuch & Gilden-Gewächshaus':'Tür kitabı ve Lonca serası','Sortenbuch öffnen':'Tür kitabını aç','Wochenbeitrag':'Haftalık katkı','Diese Woche:':'Bu hafta:','Ernten':'Hasatlar','Mutation':'Mutasyon','Lampe':'Lamba','Raum':'Oda','Aktive Sorte':'Aktif tür','Kein Grow-Buff':'Yetiştirme bonusu yok','Alle Klassen':'Tüm sınıflar','Ausgewählt':'Seçildi','Auswählen':'Seç','Vorrat':'Stok','Kaufen':'Satın al','Wachstum':'Büyüme','Verkauf':'Satış',
  'HELDENQUARTIER':'KAHRAMAN KARARGÂHI','Noch keine Edelsteine oder Rollen.':'Henüz taş veya parşömen yok.','Set-Boni ansehen':'Set bonuslarını gör','Unbekanntes Item':'Bilinmeyen eşya',
  'Besiege alle 10 Gegner der Reihe nach':'10 düşmanın hepsini sırayla yen','Dungeon-Versuch':'Zindan denemesi','Gratisversuch prüfen …':'Ücretsiz deneme kontrol ediliyor …','ACHTUNG':'DİKKAT','BETRETEN AUF':'GİRİŞ','EIGENE GEFAHR!':'KENDİ RİSKİNLE!','DUNGEON ABGESCHLOSSEN':'ZİNDAN TAMAMLANDI','Alle 10 Gegner wurden besiegt.':'10 düşmanın hepsi yenildi.','Gegner':'Düşman','Empfohlen Level':'Önerilen seviye','Mögliche Belohnungen':'Olası ödüller','LEGENDÄR':'EFSANEVİ','Deine Stärke':'Gücün','BOSS ANGREIFEN':'BOSSA SALDIR','GEGNER ANGREIFEN':'DÜŞMANA SALDIR',
  'ANBAU-TURM':'YETİŞTİRME KULESİ','Turm-Erholung':'Kule iyileşmesi','Vollständig erholt':'Tamamen iyileşti','Run starten':'Koşuyu başlat','Ersten Run starten':'İlk koşuyu başlat','Komplette Ranglisten':'Tam sıralamalar','Turm-Aufstieg':'Kule tırmanışı','Turm-Rangliste':'Kule sıralaması','Turm verlassen':'Kuleden çık','Belohnung holen':'Ödülü al','In Arbeit':'Devam ediyor','Abgeholt':'Alındı','Belohnung abholen':'Ödülü al','Keine Platzierung gefunden':'Sıralama bulunamadı','Deine Platzierung':'Sıralaman','Belohnung bereit':'Ödül hazır','Zur Startseite':'Ana sayfaya dön','Anbau-Turm konnte nicht geladen werden':'Yetiştirme Kulesi yüklenemedi'
 }
};
for(const lang of Object.keys(CURRENT))Object.assign(M[lang]||(M[lang]={}),CURRENT[lang]);

/* Whole-game visible vocabulary used by current renderers. Dynamic values are
   handled separately below so levels, counters, timers and slot numbers localize too. */
const WHOLE_GAME={
 en:{
  'Freier Platz':'Free slot','Freier Topf':'Free pot','Raum-Upgrade nötig':'Room upgrade required','pflanzen':'plant','Pflege':'Care','Pflegeaktion verfügbar':'Care action available','Aktuell keine Pflegeaktion verfügbar':'No care action currently available','Qualität steigern':'Increase quality','Pflege-Status':'Care status','Erntebereit':'Ready to harvest','Bereit zum Pflanzen':'Ready to plant','Samen ausgewählt':'Seed selected','Quelle':'Source','Minuten Grundzeit':'minutes base time','für alle Klassen':'for all classes','CHARAKTERBUFF':'CHARACTER BUFF','nach der Ernte':'after harvest','QUALITÄT':'QUALITY','CHARAKTER-EXP':'CHARACTER XP','Ernte jetzt und sichere Qualität, Buff und mögliche Mutation.':'Harvest now to secure quality, buff and a possible mutation.','Die nächste Pflegeaktion erscheint automatisch während des Wachstums.':'The next care action appears automatically during growth.','Nichts geht verloren.':'Nothing is lost.','Kein Kampfbonus':'No combat bonus','Keine aktive Sorte':'No active strain','Ernte gute Pflanzen und aktiviere eine Blüte aus deinem Grow-Beutel.':'Harvest good plants and activate a bud from your grow bag.','Aktivieren':'Activate','Spenden':'Donate','Blüten werden im neuen Stapel-Lager gesammelt':'Buds are collected in the new stack storage','GROWROOM-INVENTAR':'GROWROOM INVENTORY','Wähle einen Samen für den nächsten freien Topf.':'Choose a seed for the next free pot.','Dein aktueller Goldbestand':'Your current gold balance','Samenlager schließen':'Close seed storage','Sorten im Lager':'strains in storage','Antippen zum Auswählen':'Tap to select','Noch nicht im Lager':'Not in storage yet','Beim Samen-Händler':'At the seed dealer','Normale Quests / Wochenbeitrag':'Normal quests / weekly contribution','Elite-Quests / Wochenbeitrag':'Elite quests / weekly contribution','Dungeonbosse':'Dungeon bosses','Elite-Quests / Dungeon':'Elite quests / dungeon','Dungeonbosse / Gildenboss':'Dungeon bosses / guild boss','PvP-Siege / Gildenboss':'PvP wins / guild boss','Elite-Quests / Dungeon / Gildenboss':'Elite quests / dungeon / guild boss','Gildenboss / seltene Events':'Guild boss / rare events',
  'Gießen':'Water','Licht einstellen':'Adjust light','Beschneiden':'Prune','Nährstoffe':'Nutrients','Feuchtigkeit kontrollieren und die Pflanze sauber versorgen.':'Check moisture and care for the plant properly.','Lampe auf die aktuelle Wachstumsphase abstimmen.':'Adjust the lamp to the current growth stage.','Triebe pflegen und die Blüte gezielt unterstützen.':'Prune shoots and support flowering.','Letzter Feinschliff vor der Ernte.':'Final care before harvest.','Gewöhnlich':'Common','Ungewöhnlich':'Uncommon','Selten':'Rare','Episch':'Epic','Legendär':'Legendary','Prismatisch':'Prismatic','Frostig':'Frosty','Smaragd':'Emerald',
  '1. Keimling':'1. Seedling','2. Wachstum':'2. Growth','3. Blüte':'3. Flowering','4. Erntebereit':'4. Ready to harvest','Bereit!':'Ready!','Flexibel':'Flexible','alle Klassen':'all classes','Pflege!':'Care!','Perfect Grow':'Perfect Grow','Belohnung geholt':'Reward claimed','Lampen-Level':'Lamp level','Topf-Level':'Pot level','Raum-Level':'Room level',
  'Stärke':'Strength','Ausdauer':'Stamina','Geschick':'Dexterity','Intelligenz':'Intelligence','Glück':'Luck','Kampfkraft':'Combat power','Lebenspunkte':'Health','Hauptattribut':'Primary stat','Leben':'Health','Schaden':'Damage','Crit-Chance':'Crit chance','Crit-Schaden':'Crit damage','Schadensreduktion':'Damage reduction','Wucht-Chance':'Smash chance','Wucht-Schaden':'Smash damage','Doppeltreffer':'Double hit','Ausweichen':'Dodge','Lebensraub':'Life steal','Durchdringung':'Penetration','Rauch/DOT-Chance':'Smoke/DOT chance','Crit-Kette':'Crit chain',
  'Händler':'Shop','Kaufen':'Buy','Verkaufen':'Sell','Neu würfeln':'Reroll','Ausrüsten':'Equip','Vergleichen':'Compare','Besser':'Better','Schlechter':'Worse','Gleichwertig':'Equal','Gesamt':'Total','Wert':'Value','Kosten':'Cost','Bestand':'Balance','Bestätigen':'Confirm','Abbrechen':'Cancel','Schließen':'Close','Speichern':'Save','Laden':'Load','Aktualisieren':'Refresh','Suchen':'Search','Keine Ergebnisse':'No results','Verfügbar':'Available','Gesperrt':'Locked','Erledigt':'Done','Heute':'Today','Morgen':'Tomorrow','Wöchentlich':'Weekly','Täglich':'Daily','Belohnung':'Reward','Fortschritt':'Progress','Level':'Level',
  'PvP-Arena':'PvP Arena','Gegner suchen':'Find opponent','Kampf starten':'Start battle','Sieg':'Victory','Niederlage':'Defeat','Abklingzeit':'Cooldown','Liga':'League','Rang':'Rank','Punkte':'Points','Spieler':'Player',
  'Gildenboss':'Guild boss','Gildenkrieg':'Guild war','Gildenchat':'Guild chat','Mitglieder':'Members','Teilnehmer':'Participants','Anmelden':'Sign up','Angemeldet':'Signed up','Beitreten':'Join','Verlassen':'Leave','Einladen':'Invite','Bewerbungen':'Applications','Anfragen':'Requests','Online':'Online','Offline':'Offline','Beitrag':'Contribution',
  'Nebelkarawane':'Mist Caravan','Endgame':'Endgame','Hall of Haze':'Hall of Haze','Nebel-Crew':'Mist Crew','Nebel-Post':'Mist Mail','Posteingang':'Inbox','Gesendet':'Sent','Neue Nachricht':'New message','Empfänger':'Recipient','Betreff':'Subject','Nachricht':'Message','Senden':'Send','Freund hinzufügen':'Add friend','Freund entfernen':'Remove friend','Anfrage senden':'Send request'
 },
 es:{
  'Freier Platz':'Espacio libre','Freier Topf':'Maceta libre','Raum-Upgrade nötig':'Se requiere mejora de sala','pflanzen':'plantar','Pflege':'Cuidado','Pflegeaktion verfügbar':'Acción de cuidado disponible','Aktuell keine Pflegeaktion verfügbar':'No hay acción de cuidado disponible','Qualität steigern':'Mejorar calidad','Pflege-Status':'Estado de cuidado','Erntebereit':'Listo para cosechar','Bereit zum Pflanzen':'Listo para plantar','Samen ausgewählt':'Semilla seleccionada','Quelle':'Fuente','Minuten Grundzeit':'minutos de tiempo base','für alle Klassen':'para todas las clases','CHARAKTERBUFF':'BONO DE PERSONAJE','nach der Ernte':'después de la cosecha','QUALITÄT':'CALIDAD','CHARAKTER-EXP':'EXP DE PERSONAJE','Ernte jetzt und sichere Qualität, Buff und mögliche Mutation.':'Cosecha ahora y asegura calidad, bono y una posible mutación.','Die nächste Pflegeaktion erscheint automatisch während des Wachstums.':'La próxima acción de cuidado aparecerá automáticamente durante el crecimiento.','Nichts geht verloren.':'No se pierde nada.','Kein Kampfbonus':'Sin bono de combate','Keine aktive Sorte':'Sin variedad activa','Ernte gute Pflanzen und aktiviere eine Blüte aus deinem Grow-Beutel.':'Cosecha buenas plantas y activa una flor de tu bolsa de cultivo.','Aktivieren':'Activar','Spenden':'Donar','Blüten werden im neuen Stapel-Lager gesammelt':'Las flores se guardan en el nuevo almacén apilable','GROWROOM-INVENTAR':'INVENTARIO DE CULTIVO','Wähle einen Samen für den nächsten freien Topf.':'Elige una semilla para la siguiente maceta libre.','Dein aktueller Goldbestand':'Tu saldo actual de oro','Samenlager schließen':'Cerrar almacén de semillas','Sorten im Lager':'variedades en almacén','Antippen zum Auswählen':'Toca para seleccionar','Noch nicht im Lager':'Aún no está en el almacén',
  'Gießen':'Regar','Licht einstellen':'Ajustar luz','Beschneiden':'Podar','Nährstoffe':'Nutrientes','Gewöhnlich':'Común','Ungewöhnlich':'Poco común','Selten':'Raro','Episch':'Épico','Legendär':'Legendario','Prismatisch':'Prismático','Frostig':'Helado','Smaragd':'Esmeralda','1. Keimling':'1. Plántula','2. Wachstum':'2. Crecimiento','3. Blüte':'3. Floración','4. Erntebereit':'4. Lista para cosechar','Bereit!':'¡Listo!','Flexibel':'Flexible','alle Klassen':'todas las clases','Pflege!':'¡Cuidado!',
  'Stärke':'Fuerza','Ausdauer':'Resistencia','Geschick':'Destreza','Intelligenz':'Inteligencia','Glück':'Suerte','Kampfkraft':'Poder de combate','Lebenspunkte':'Salud','Hauptattribut':'Atributo principal','Leben':'Salud','Schaden':'Daño','Crit-Chance':'Prob. crítico','Crit-Schaden':'Daño crítico','Schadensreduktion':'Reducción de daño','Ausweichen':'Esquivar','Lebensraub':'Robo de vida','Durchdringung':'Penetración',
  'Händler':'Tienda','Kaufen':'Comprar','Verkaufen':'Vender','Neu würfeln':'Volver a tirar','Ausrüsten':'Equipar','Vergleichen':'Comparar','Besser':'Mejor','Schlechter':'Peor','Gesamt':'Total','Kosten':'Coste','Bestand':'Saldo','Bestätigen':'Confirmar','Abbrechen':'Cancelar','Schließen':'Cerrar','Speichern':'Guardar','Aktualisieren':'Actualizar','Suchen':'Buscar','Keine Ergebnisse':'Sin resultados','Verfügbar':'Disponible','Gesperrt':'Bloqueado','Erledigt':'Hecho','Heute':'Hoy','Morgen':'Mañana','Wöchentlich':'Semanal','Täglich':'Diario','Belohnung':'Recompensa','Fortschritt':'Progreso','Level':'Nivel',
  'PvP-Arena':'Arena PvP','Gegner suchen':'Buscar oponente','Kampf starten':'Iniciar combate','Sieg':'Victoria','Niederlage':'Derrota','Abklingzeit':'Enfriamiento','Liga':'Liga','Rang':'Rango','Punkte':'Puntos','Spieler':'Jugador','Gildenboss':'Jefe del gremio','Gildenkrieg':'Guerra de gremios','Gildenchat':'Chat del gremio','Mitglieder':'Miembros','Teilnehmer':'Participantes','Anmelden':'Inscribirse','Angemeldet':'Inscrito','Beitreten':'Unirse','Verlassen':'Salir','Einladen':'Invitar','Bewerbungen':'Solicitudes','Anfragen':'Peticiones','Online':'En línea','Offline':'Desconectado','Beitrag':'Contribución','Nebelkarawane':'Caravana de niebla','Nebel-Crew':'Equipo de niebla','Nebel-Post':'Correo de niebla','Posteingang':'Bandeja de entrada','Gesendet':'Enviado','Neue Nachricht':'Nuevo mensaje','Empfänger':'Destinatario','Betreff':'Asunto','Nachricht':'Mensaje','Senden':'Enviar'
 },
 fr:{
  'Freier Platz':'Emplacement libre','Freier Topf':'Pot libre','Raum-Upgrade nötig':'Amélioration de salle requise','pflanzen':'planter','Pflege':'Soin','Pflegeaktion verfügbar':'Action de soin disponible','Aktuell keine Pflegeaktion verfügbar':'Aucune action de soin disponible','Qualität steigern':'Augmenter la qualité','Pflege-Status':'État des soins','Erntebereit':'Prêt à récolter','Bereit zum Pflanzen':'Prêt à planter','Samen ausgewählt':'Graine sélectionnée','Quelle':'Source','Minuten Grundzeit':'minutes de base','für alle Klassen':'pour toutes les classes','CHARAKTERBUFF':'BONUS PERSONNAGE','nach der Ernte':'après la récolte','QUALITÄT':'QUALITÉ','CHARAKTER-EXP':'EXP PERSONNAGE','Ernte jetzt und sichere Qualität, Buff und mögliche Mutation.':'Récolte maintenant pour sécuriser qualité, bonus et mutation possible.','Die nächste Pflegeaktion erscheint automatisch während des Wachstums.':'La prochaine action de soin apparaît automatiquement pendant la croissance.','Nichts geht verloren.':'Rien n’est perdu.','Kein Kampfbonus':'Aucun bonus de combat','Keine aktive Sorte':'Aucune variété active','Ernte gute Pflanzen und aktiviere eine Blüte aus deinem Grow-Beutel.':'Récolte de bonnes plantes et active une fleur depuis ton sac de culture.','Aktivieren':'Activer','Spenden':'Donner','Blüten werden im neuen Stapel-Lager gesammelt':'Les fleurs sont collectées dans le nouveau stockage empilable','GROWROOM-INVENTAR':'INVENTAIRE DE CULTURE','Wähle einen Samen für den nächsten freien Topf.':'Choisis une graine pour le prochain pot libre.','Dein aktueller Goldbestand':'Ton solde d’or actuel','Samenlager schließen':'Fermer le stock de graines','Sorten im Lager':'variétés en stock','Antippen zum Auswählen':'Toucher pour sélectionner','Noch nicht im Lager':'Pas encore en stock',
  'Gießen':'Arroser','Licht einstellen':'Régler la lumière','Beschneiden':'Tailler','Nährstoffe':'Nutriments','Gewöhnlich':'Commun','Ungewöhnlich':'Peu commun','Selten':'Rare','Episch':'Épique','Legendär':'Légendaire','Prismatisch':'Prismatique','Frostig':'Gelé','Smaragd':'Émeraude','1. Keimling':'1. Semis','2. Wachstum':'2. Croissance','3. Blüte':'3. Floraison','4. Erntebereit':'4. Prêt à récolter','Bereit!':'Prêt !','Flexibel':'Flexible','alle Klassen':'toutes les classes','Pflege!':'Soin !',
  'Stärke':'Force','Ausdauer':'Endurance','Geschick':'Dextérité','Intelligenz':'Intelligence','Glück':'Chance','Kampfkraft':'Puissance de combat','Lebenspunkte':'Vie','Hauptattribut':'Attribut principal','Leben':'Vie','Schaden':'Dégâts','Crit-Chance':'Chance critique','Crit-Schaden':'Dégâts critiques','Schadensreduktion':'Réduction des dégâts','Ausweichen':'Esquive','Lebensraub':'Vol de vie','Durchdringung':'Pénétration',
  'Händler':'Boutique','Kaufen':'Acheter','Verkaufen':'Vendre','Neu würfeln':'Relancer','Ausrüsten':'Équiper','Vergleichen':'Comparer','Besser':'Meilleur','Schlechter':'Pire','Gesamt':'Total','Kosten':'Coût','Bestand':'Solde','Bestätigen':'Confirmer','Abbrechen':'Annuler','Schließen':'Fermer','Speichern':'Enregistrer','Aktualisieren':'Actualiser','Suchen':'Rechercher','Keine Ergebnisse':'Aucun résultat','Verfügbar':'Disponible','Gesperrt':'Verrouillé','Erledigt':'Terminé','Heute':'Aujourd’hui','Morgen':'Demain','Wöchentlich':'Hebdomadaire','Täglich':'Quotidien','Belohnung':'Récompense','Fortschritt':'Progression','Level':'Niveau',
  'PvP-Arena':'Arène PvP','Gegner suchen':'Chercher un adversaire','Kampf starten':'Lancer le combat','Sieg':'Victoire','Niederlage':'Défaite','Abklingzeit':'Recharge','Liga':'Ligue','Rang':'Rang','Punkte':'Points','Spieler':'Joueur','Gildenboss':'Boss de guilde','Gildenkrieg':'Guerre de guilde','Gildenchat':'Chat de guilde','Mitglieder':'Membres','Teilnehmer':'Participants','Anmelden':'S’inscrire','Angemeldet':'Inscrit','Beitreten':'Rejoindre','Verlassen':'Quitter','Einladen':'Inviter','Bewerbungen':'Candidatures','Anfragen':'Demandes','Online':'En ligne','Offline':'Hors ligne','Beitrag':'Contribution','Nebelkarawane':'Caravane de brume','Nebel-Crew':'Équipe de brume','Nebel-Post':'Courrier de brume','Posteingang':'Boîte de réception','Gesendet':'Envoyé','Neue Nachricht':'Nouveau message','Empfänger':'Destinataire','Betreff':'Objet','Nachricht':'Message','Senden':'Envoyer'
 },
 pl:{
  'Freier Platz':'Wolne miejsce','Freier Topf':'Wolna doniczka','Raum-Upgrade nötig':'Wymagane ulepszenie pomieszczenia','pflanzen':'posadź','Pflege':'Pielęgnacja','Pflegeaktion verfügbar':'Dostępna pielęgnacja','Aktuell keine Pflegeaktion verfügbar':'Brak dostępnej pielęgnacji','Qualität steigern':'Zwiększ jakość','Pflege-Status':'Stan pielęgnacji','Erntebereit':'Gotowe do zbioru','Bereit zum Pflanzen':'Gotowe do posadzenia','Samen ausgewählt':'Wybrano nasiono','Quelle':'Źródło','Minuten Grundzeit':'minut czasu bazowego','für alle Klassen':'dla wszystkich klas','CHARAKTERBUFF':'BONUS POSTACI','nach der Ernte':'po zbiorze','QUALITÄT':'JAKOŚĆ','CHARAKTER-EXP':'EXP POSTACI','Ernte jetzt und sichere Qualität, Buff und mögliche Mutation.':'Zbierz teraz, aby zachować jakość, bonus i możliwą mutację.','Die nächste Pflegeaktion erscheint automatisch während des Wachstums.':'Następna pielęgnacja pojawi się automatycznie podczas wzrostu.','Nichts geht verloren.':'Nic nie przepada.','Kein Kampfbonus':'Brak bonusu bojowego','Keine aktive Sorte':'Brak aktywnej odmiany','Aktivieren':'Aktywuj','Spenden':'Przekaż','GROWROOM-INVENTAR':'INWENTARZ UPRAWY','Wähle einen Samen für den nächsten freien Topf.':'Wybierz nasiono do następnej wolnej doniczki.','Samenlager schließen':'Zamknij magazyn nasion','Sorten im Lager':'odmian w magazynie','Antippen zum Auswählen':'Dotknij, aby wybrać','Noch nicht im Lager':'Jeszcze nie w magazynie',
  'Gießen':'Podlej','Licht einstellen':'Ustaw światło','Beschneiden':'Przytnij','Nährstoffe':'Składniki odżywcze','Gewöhnlich':'Zwykły','Ungewöhnlich':'Niezwykły','Selten':'Rzadki','Episch':'Epicki','Legendär':'Legendarny','Prismatisch':'Pryzmatyczny','Frostig':'Mroźny','Smaragd':'Szmaragd','1. Keimling':'1. Siewka','2. Wachstum':'2. Wzrost','3. Blüte':'3. Kwitnienie','4. Erntebereit':'4. Gotowe do zbioru','Bereit!':'Gotowe!','Flexibel':'Elastyczne','alle Klassen':'wszystkie klasy','Pflege!':'Pielęgnacja!',
  'Stärke':'Siła','Ausdauer':'Wytrzymałość','Geschick':'Zręczność','Intelligenz':'Inteligencja','Glück':'Szczęście','Kampfkraft':'Siła bojowa','Lebenspunkte':'Punkty życia','Hauptattribut':'Główny atrybut','Leben':'Życie','Schaden':'Obrażenia','Crit-Chance':'Szansa na krytyk','Crit-Schaden':'Obrażenia krytyczne','Schadensreduktion':'Redukcja obrażeń','Ausweichen':'Unik','Lebensraub':'Kradzież życia','Durchdringung':'Przebicie',
  'Händler':'Sklep','Kaufen':'Kup','Verkaufen':'Sprzedaj','Neu würfeln':'Losuj ponownie','Ausrüsten':'Załóż','Vergleichen':'Porównaj','Besser':'Lepszy','Schlechter':'Gorszy','Gesamt':'Łącznie','Kosten':'Koszt','Bestand':'Saldo','Bestätigen':'Potwierdź','Abbrechen':'Anuluj','Schließen':'Zamknij','Speichern':'Zapisz','Aktualisieren':'Odśwież','Suchen':'Szukaj','Keine Ergebnisse':'Brak wyników','Verfügbar':'Dostępne','Gesperrt':'Zablokowane','Erledigt':'Gotowe','Heute':'Dziś','Morgen':'Jutro','Wöchentlich':'Tygodniowo','Täglich':'Codziennie','Belohnung':'Nagroda','Fortschritt':'Postęp','Level':'Poziom',
  'PvP-Arena':'Arena PvP','Gegner suchen':'Szukaj przeciwnika','Kampf starten':'Rozpocznij walkę','Sieg':'Zwycięstwo','Niederlage':'Porażka','Abklingzeit':'Odnowienie','Liga':'Liga','Rang':'Ranga','Punkte':'Punkty','Spieler':'Gracz','Gildenboss':'Boss gildii','Gildenkrieg':'Wojna gildii','Gildenchat':'Czat gildii','Mitglieder':'Członkowie','Teilnehmer':'Uczestnicy','Anmelden':'Zapisz się','Angemeldet':'Zapisano','Beitreten':'Dołącz','Verlassen':'Opuść','Einladen':'Zaproś','Bewerbungen':'Podania','Anfragen':'Prośby','Online':'Online','Offline':'Offline','Beitrag':'Wkład','Nebelkarawane':'Karawana mgły','Nebel-Crew':'Ekipa mgły','Nebel-Post':'Poczta mgły','Posteingang':'Skrzynka odbiorcza','Gesendet':'Wysłane','Neue Nachricht':'Nowa wiadomość','Empfänger':'Odbiorca','Betreff':'Temat','Nachricht':'Wiadomość','Senden':'Wyślij'
 },
 tr:{
  'Freier Platz':'Boş yer','Freier Topf':'Boş saksı','Raum-Upgrade nötig':'Oda yükseltmesi gerekli','pflanzen':'ek','Pflege':'Bakım','Pflegeaktion verfügbar':'Bakım işlemi hazır','Aktuell keine Pflegeaktion verfügbar':'Şu anda bakım işlemi yok','Qualität steigern':'Kaliteyi artır','Pflege-Status':'Bakım durumu','Erntebereit':'Hasada hazır','Bereit zum Pflanzen':'Ekime hazır','Samen ausgewählt':'Tohum seçildi','Quelle':'Kaynak','Minuten Grundzeit':'dakika temel süre','für alle Klassen':'tüm sınıflar için','CHARAKTERBUFF':'KARAKTER BONUSU','nach der Ernte':'hasattan sonra','QUALITÄT':'KALİTE','CHARAKTER-EXP':'KARAKTER EXP','Ernte jetzt und sichere Qualität, Buff und mögliche Mutation.':'Şimdi hasat et; kaliteyi, bonusu ve olası mutasyonu koru.','Die nächste Pflegeaktion erscheint automatisch während des Wachstums.':'Sonraki bakım işlemi büyüme sırasında otomatik görünür.','Nichts geht verloren.':'Hiçbir şey kaybolmaz.','Kein Kampfbonus':'Savaş bonusu yok','Keine aktive Sorte':'Aktif tür yok','Aktivieren':'Etkinleştir','Spenden':'Bağışla','GROWROOM-INVENTAR':'YETİŞTİRME ENVANTERİ','Wähle einen Samen für den nächsten freien Topf.':'Sonraki boş saksı için bir tohum seç.','Samenlager schließen':'Tohum deposunu kapat','Sorten im Lager':'depodaki tür','Antippen zum Auswählen':'Seçmek için dokun','Noch nicht im Lager':'Henüz depoda değil',
  'Gießen':'Sula','Licht einstellen':'Işığı ayarla','Beschneiden':'Budama','Nährstoffe':'Besinler','Gewöhnlich':'Yaygın','Ungewöhnlich':'Nadir olmayan','Selten':'Nadir','Episch':'Epik','Legendär':'Efsanevi','Prismatisch':'Prizmatik','Frostig':'Buzlu','Smaragd':'Zümrüt','1. Keimling':'1. Filiz','2. Wachstum':'2. Büyüme','3. Blüte':'3. Çiçeklenme','4. Erntebereit':'4. Hasada hazır','Bereit!':'Hazır!','Flexibel':'Esnek','alle Klassen':'tüm sınıflar','Pflege!':'Bakım!',
  'Stärke':'Güç','Ausdauer':'Dayanıklılık','Geschick':'Çeviklik','Intelligenz':'Zekâ','Glück':'Şans','Kampfkraft':'Savaş gücü','Lebenspunkte':'Can','Hauptattribut':'Ana özellik','Leben':'Can','Schaden':'Hasar','Crit-Chance':'Kritik şansı','Crit-Schaden':'Kritik hasarı','Schadensreduktion':'Hasar azaltma','Ausweichen':'Kaçınma','Lebensraub':'Can çalma','Durchdringung':'Delme',
  'Händler':'Mağaza','Kaufen':'Satın al','Verkaufen':'Sat','Neu würfeln':'Yeniden at','Ausrüsten':'Kuşan','Vergleichen':'Karşılaştır','Besser':'Daha iyi','Schlechter':'Daha kötü','Gesamt':'Toplam','Kosten':'Maliyet','Bestand':'Bakiye','Bestätigen':'Onayla','Abbrechen':'İptal','Schließen':'Kapat','Speichern':'Kaydet','Aktualisieren':'Yenile','Suchen':'Ara','Keine Ergebnisse':'Sonuç yok','Verfügbar':'Mevcut','Gesperrt':'Kilitli','Erledigt':'Tamam','Heute':'Bugün','Morgen':'Yarın','Wöchentlich':'Haftalık','Täglich':'Günlük','Belohnung':'Ödül','Fortschritt':'İlerleme','Level':'Seviye',
  'PvP-Arena':'PvP Arenası','Gegner suchen':'Rakip ara','Kampf starten':'Savaşı başlat','Sieg':'Zafer','Niederlage':'Yenilgi','Abklingzeit':'Bekleme süresi','Liga':'Lig','Rang':'Sıra','Punkte':'Puan','Spieler':'Oyuncu','Gildenboss':'Lonca bossu','Gildenkrieg':'Lonca savaşı','Gildenchat':'Lonca sohbeti','Mitglieder':'Üyeler','Teilnehmer':'Katılımcılar','Anmelden':'Kaydol','Angemeldet':'Kayıtlı','Beitreten':'Katıl','Verlassen':'Ayrıl','Einladen':'Davet et','Bewerbungen':'Başvurular','Anfragen':'İstekler','Online':'Çevrimiçi','Offline':'Çevrimdışı','Beitrag':'Katkı','Nebelkarawane':'Sis Kervanı','Nebel-Crew':'Sis Ekibi','Nebel-Post':'Sis Postası','Posteingang':'Gelen kutusu','Gesendet':'Gönderildi','Neue Nachricht':'Yeni mesaj','Empfänger':'Alıcı','Betreff':'Konu','Nachricht':'Mesaj','Senden':'Gönder'
 }
};
for(const lang of Object.keys(WHOLE_GAME))Object.assign(M[lang]||(M[lang]={}),WHOLE_GAME[lang]);

/* V8.184 Hall of Haze guild ranking/profile */
const V8184_TEXT={
 en:{
  'Gilden':'Guilds','HALL OF HAZE · GILDEN':'HALL OF HAZE · GUILDS','Die erfolgreichsten Gilden des Servers.':'The most successful guilds on this server.','Rangfolge':'Ranking order','Gildenlevel → Gilden-Buds → Gilden-EP':'Guild level → Guild Buds → Guild XP',
  'Gildenprofil wird geladen …':'Loading guild profile …','Über diese Gilde':'About this guild','Diese Gilde hat noch keine Beschreibung hinterlegt.':'This guild has not added a description yet.','Stärkste Mitglieder':'Strongest members','Noch keine Mitgliederprofile verfügbar.':'No member profiles available yet.','Gildenrangliste konnte nicht geladen werden.':'Guild ranking could not be loaded.',
  'Gildenbeschreibung':'Guild description','Beschreibe eure Gilde, Spielstil oder Anforderungen.':'Describe your guild, play style or requirements.','Beschreibung nicht zulässig':'Description not allowed','Gildenbeschreibung gespeichert':'Guild description saved','Die Beschreibung ist jetzt im öffentlichen Gildenprofil sichtbar.':'The description is now visible in the public guild profile.','Speichern fehlgeschlagen':'Save failed','Online-Verbindung nicht verfügbar.':'Online connection unavailable.','Zeichen':'characters','Gilden-EP':'Guild XP'
 },
 es:{
  'Gilden':'Gremios','HALL OF HAZE · GILDEN':'HALL OF HAZE · GREMIOS','Die erfolgreichsten Gilden des Servers.':'Los gremios más exitosos del servidor.','Rangfolge':'Orden de clasificación','Gildenlevel → Gilden-Buds → Gilden-EP':'Nivel de gremio → Brotes → EXP de gremio',
  'Gildenprofil wird geladen …':'Cargando perfil del gremio …','Über diese Gilde':'Sobre este gremio','Diese Gilde hat noch keine Beschreibung hinterlegt.':'Este gremio aún no tiene descripción.','Stärkste Mitglieder':'Miembros más fuertes','Noch keine Mitgliederprofile verfügbar.':'Aún no hay perfiles de miembros disponibles.','Gildenrangliste konnte nicht geladen werden.':'No se pudo cargar la clasificación de gremios.',
  'Gildenbeschreibung':'Descripción del gremio','Beschreibe eure Gilde, Spielstil oder Anforderungen.':'Describe tu gremio, estilo de juego o requisitos.','Beschreibung nicht zulässig':'Descripción no permitida','Gildenbeschreibung gespeichert':'Descripción del gremio guardada','Die Beschreibung ist jetzt im öffentlichen Gildenprofil sichtbar.':'La descripción ya es visible en el perfil público del gremio.','Speichern fehlgeschlagen':'Error al guardar','Online-Verbindung nicht verfügbar.':'Conexión en línea no disponible.','Zeichen':'caracteres','Gilden-EP':'EXP del gremio'
 },
 fr:{
  'Gilden':'Guildes','HALL OF HAZE · GILDEN':'HALL OF HAZE · GUILDES','Die erfolgreichsten Gilden des Servers.':'Les guildes les plus performantes du serveur.','Rangfolge':'Ordre du classement','Gildenlevel → Gilden-Buds → Gilden-EP':'Niveau de guilde → Buds → EXP de guilde',
  'Gildenprofil wird geladen …':'Chargement du profil de guilde …','Über diese Gilde':'À propos de cette guilde','Diese Gilde hat noch keine Beschreibung hinterlegt.':'Cette guilde n’a pas encore ajouté de description.','Stärkste Mitglieder':'Membres les plus forts','Noch keine Mitgliederprofile verfügbar.':'Aucun profil de membre disponible.','Gildenrangliste konnte nicht geladen werden.':'Impossible de charger le classement des guildes.',
  'Gildenbeschreibung':'Description de guilde','Beschreibe eure Gilde, Spielstil oder Anforderungen.':'Décris ta guilde, son style de jeu ou ses exigences.','Beschreibung nicht zulässig':'Description non autorisée','Gildenbeschreibung gespeichert':'Description de guilde enregistrée','Die Beschreibung ist jetzt im öffentlichen Gildenprofil sichtbar.':'La description est maintenant visible dans le profil public de la guilde.','Speichern fehlgeschlagen':'Échec de l’enregistrement','Online-Verbindung nicht verfügbar.':'Connexion en ligne indisponible.','Zeichen':'caractères','Gilden-EP':'EXP de guilde'
 },
 pl:{
  'Gilden':'Gildie','HALL OF HAZE · GILDEN':'HALL OF HAZE · GILDIE','Die erfolgreichsten Gilden des Servers.':'Najlepsze gildie na serwerze.','Rangfolge':'Kolejność rankingu','Gildenlevel → Gilden-Buds → Gilden-EP':'Poziom gildii → Pąki gildii → EXP gildii',
  'Gildenprofil wird geladen …':'Ładowanie profilu gildii …','Über diese Gilde':'O tej gildii','Diese Gilde hat noch keine Beschreibung hinterlegt.':'Ta gildia nie dodała jeszcze opisu.','Stärkste Mitglieder':'Najsilniejsi członkowie','Noch keine Mitgliederprofile verfügbar.':'Brak dostępnych profili członków.','Gildenrangliste konnte nicht geladen werden.':'Nie udało się wczytać rankingu gildii.',
  'Gildenbeschreibung':'Opis gildii','Beschreibe eure Gilde, Spielstil oder Anforderungen.':'Opisz gildię, styl gry lub wymagania.','Beschreibung nicht zulässig':'Opis niedozwolony','Gildenbeschreibung gespeichert':'Opis gildii zapisany','Die Beschreibung ist jetzt im öffentlichen Gildenprofil sichtbar.':'Opis jest teraz widoczny w publicznym profilu gildii.','Speichern fehlgeschlagen':'Nie udało się zapisać','Online-Verbindung nicht verfügbar.':'Brak połączenia online.','Zeichen':'znaków','Gilden-EP':'EXP gildii'
 },
 tr:{
  'Gilden':'Loncalar','HALL OF HAZE · GILDEN':'HALL OF HAZE · LONCALAR','Die erfolgreichsten Gilden des Servers.':'Sunucunun en başarılı loncaları.','Rangfolge':'Sıralama düzeni','Gildenlevel → Gilden-Buds → Gilden-EP':'Lonca seviyesi → Lonca Tomurcukları → Lonca EXP',
  'Gildenprofil wird geladen …':'Lonca profili yükleniyor …','Über diese Gilde':'Bu lonca hakkında','Diese Gilde hat noch keine Beschreibung hinterlegt.':'Bu lonca henüz açıklama eklemedi.','Stärkste Mitglieder':'En güçlü üyeler','Noch keine Mitgliederprofile verfügbar.':'Henüz üye profili yok.','Gildenrangliste konnte nicht geladen werden.':'Lonca sıralaması yüklenemedi.',
  'Gildenbeschreibung':'Lonca açıklaması','Beschreibe eure Gilde, Spielstil oder Anforderungen.':'Loncanızı, oyun tarzınızı veya gereksinimleri açıklayın.','Beschreibung nicht zulässig':'Açıklamaya izin verilmiyor','Gildenbeschreibung gespeichert':'Lonca açıklaması kaydedildi','Die Beschreibung ist jetzt im öffentlichen Gildenprofil sichtbar.':'Açıklama artık herkese açık lonca profilinde görünüyor.','Speichern fehlgeschlagen':'Kaydetme başarısız','Online-Verbindung nicht verfügbar.':'Çevrimiçi bağlantı kullanılamıyor.','Zeichen':'karakter','Gilden-EP':'Lonca EXP'
 }
};
for(const lang of Object.keys(V8184_TEXT))Object.assign(M[lang]||(M[lang]={}),V8184_TEXT[lang]);

const V8184_PATTERNS={
 en:[
  [/^(\d+) Gilden$/i,(_,n)=>`${n} guilds`],
  [/^Gildenlevel (\d+) · (\d+)\/(\d+) Mitglieder$/i,(_,l,a,b)=>`Guild level ${l} · ${a}/${b} members`],
  [/^HALL OF HAZE · GILDENRANG #(\d+)$/i,(_,n)=>`HALL OF HAZE · GUILD RANK #${n}`],
  [/^(\d+)\/300 Zeichen$/i,(_,n)=>`${n}/300 characters`]
 ],
 es:[
  [/^(\d+) Gilden$/i,(_,n)=>`${n} gremios`],
  [/^Gildenlevel (\d+) · (\d+)\/(\d+) Mitglieder$/i,(_,l,a,b)=>`Nivel de gremio ${l} · ${a}/${b} miembros`],
  [/^HALL OF HAZE · GILDENRANG #(\d+)$/i,(_,n)=>`HALL OF HAZE · RANGO DE GREMIO #${n}`],
  [/^(\d+)\/300 Zeichen$/i,(_,n)=>`${n}/300 caracteres`]
 ],
 fr:[
  [/^(\d+) Gilden$/i,(_,n)=>`${n} guildes`],
  [/^Gildenlevel (\d+) · (\d+)\/(\d+) Mitglieder$/i,(_,l,a,b)=>`Niveau de guilde ${l} · ${a}/${b} membres`],
  [/^HALL OF HAZE · GILDENRANG #(\d+)$/i,(_,n)=>`HALL OF HAZE · RANG DE GUILDE #${n}`],
  [/^(\d+)\/300 Zeichen$/i,(_,n)=>`${n}/300 caractères`]
 ],
 pl:[
  [/^(\d+) Gilden$/i,(_,n)=>`${n} gildii`],
  [/^Gildenlevel (\d+) · (\d+)\/(\d+) Mitglieder$/i,(_,l,a,b)=>`Poziom gildii ${l} · ${a}/${b} członków`],
  [/^HALL OF HAZE · GILDENRANG #(\d+)$/i,(_,n)=>`HALL OF HAZE · RANGA GILDII #${n}`],
  [/^(\d+)\/300 Zeichen$/i,(_,n)=>`${n}/300 znaków`]
 ],
 tr:[
  [/^(\d+) Gilden$/i,(_,n)=>`${n} lonca`],
  [/^Gildenlevel (\d+) · (\d+)\/(\d+) Mitglieder$/i,(_,l,a,b)=>`Lonca seviyesi ${l} · ${a}/${b} üye`],
  [/^HALL OF HAZE · GILDENRANG #(\d+)$/i,(_,n)=>`HALL OF HAZE · LONCA SIRASI #${n}`],
  [/^(\d+)\/300 Zeichen$/i,(_,n)=>`${n}/300 karakter`]
 ]
};
for(const lang of Object.keys(V8184_PATTERNS))P[lang]?.push(...V8184_PATTERNS[lang]);

const V8185_TEXT={
 en:{
  'Beitritt anfragen':'Request to join','Anfrage gesendet':'Request sent','Anfrage wird gesendet …':'Sending request …','Du bist Mitglied dieser Gilde.':'You are a member of this guild.','Du bist bereits Mitglied einer Gilde.':'You are already a member of a guild.','Du hast bereits eine offene Beitrittsanfrage':'You already have a pending join request','Gilde voll':'Guild full','Gildensperre aktiv':'Guild lock active','Beitrittsanfrage fehlgeschlagen':'Join request failed','Die Gildenleitung kann deine Bewerbung jetzt annehmen.':'The guild leadership can now accept your application.'
 },
 es:{
  'Beitritt anfragen':'Solicitar ingreso','Anfrage gesendet':'Solicitud enviada','Anfrage wird gesendet …':'Enviando solicitud …','Du bist Mitglied dieser Gilde.':'Eres miembro de este gremio.','Du bist bereits Mitglied einer Gilde.':'Ya eres miembro de un gremio.','Du hast bereits eine offene Beitrittsanfrage':'Ya tienes una solicitud de ingreso pendiente','Gilde voll':'Gremio completo','Gildensperre aktiv':'Bloqueo de gremio activo','Beitrittsanfrage fehlgeschlagen':'Error en la solicitud de ingreso','Die Gildenleitung kann deine Bewerbung jetzt annehmen.':'La dirección del gremio ya puede aceptar tu solicitud.'
 },
 fr:{
  'Beitritt anfragen':'Demander à rejoindre','Anfrage gesendet':'Demande envoyée','Anfrage wird gesendet …':'Envoi de la demande …','Du bist Mitglied dieser Gilde.':'Tu es membre de cette guilde.','Du bist bereits Mitglied einer Gilde.':'Tu es déjà membre d’une guilde.','Du hast bereits eine offene Beitrittsanfrage':'Tu as déjà une demande d’adhésion en attente','Gilde voll':'Guilde complète','Gildensperre aktiv':'Verrouillage de guilde actif','Beitrittsanfrage fehlgeschlagen':'Échec de la demande d’adhésion','Die Gildenleitung kann deine Bewerbung jetzt annehmen.':'La direction de la guilde peut maintenant accepter ta candidature.'
 },
 pl:{
  'Beitritt anfragen':'Poproś o dołączenie','Anfrage gesendet':'Prośba wysłana','Anfrage wird gesendet …':'Wysyłanie prośby …','Du bist Mitglied dieser Gilde.':'Jesteś członkiem tej gildii.','Du bist bereits Mitglied einer Gilde.':'Jesteś już członkiem gildii.','Du hast bereits eine offene Beitrittsanfrage':'Masz już otwartą prośbę o dołączenie','Gilde voll':'Gildia pełna','Gildensperre aktiv':'Blokada gildii aktywna','Beitrittsanfrage fehlgeschlagen':'Nie udało się wysłać prośby o dołączenie','Die Gildenleitung kann deine Bewerbung jetzt annehmen.':'Kierownictwo gildii może teraz zaakceptować twoje zgłoszenie.'
 },
 tr:{
  'Beitritt anfragen':'Katılma isteği gönder','Anfrage gesendet':'İstek gönderildi','Anfrage wird gesendet …':'İstek gönderiliyor …','Du bist Mitglied dieser Gilde.':'Bu loncanın üyesisin.','Du bist bereits Mitglied einer Gilde.':'Zaten bir loncanın üyesisin.','Du hast bereits eine offene Beitrittsanfrage':'Zaten bekleyen bir katılma isteğin var','Gilde voll':'Lonca dolu','Gildensperre aktiv':'Lonca kilidi aktif','Beitrittsanfrage fehlgeschlagen':'Katılma isteği başarısız','Die Gildenleitung kann deine Bewerbung jetzt annehmen.':'Lonca yönetimi artık başvurunu kabul edebilir.'
 }
};
for(const lang of Object.keys(V8185_TEXT))Object.assign(M[lang]||(M[lang]={}),V8185_TEXT[lang]);

const V8188_TEXT={
 en:{
  'Video nicht verfügbar':'Video unavailable',
  'Rewarded Videos sind nur in der Android-App verfügbar.':'Rewarded videos are only available in the Android app.',
  'Für den Video-Zeitbonus musst du eingeloggt sein.':'You must be signed in to use the video time bonus.',
  'Keine Zeit übersprungen':'No time skipped',
  'Nur ein vollständig angesehenes Video gibt den 25-%-Zeitbonus.':'Only a fully watched video grants the 25% time bonus.',
  '25 % Questzeit übersprungen':'25% quest time skipped',
  'Bestätigung wird verarbeitet':'Confirmation is processing',
  'Das Video wurde vollständig angesehen. Google bestätigt den Zeitbonus noch serverseitig.':'The video was watched completely. Google is still confirming the time bonus on the server.',
  'Das Video wurde nicht vollständig abgeschlossen.':'The video was not completed.',
  'Das Rewarded Video konnte gerade nicht abgeschlossen werden.':'The rewarded video could not be completed right now.',
  'Video-Bonus genutzt':'Video bonus used',
  '25 % der Questzeit wurden bereits übersprungen.':'25% of the quest time has already been skipped.',
  'Video wird bestätigt …':'Video is being confirmed …',
  'Serverseitige AdMob-Bestätigung läuft.':'Server-side AdMob confirmation is in progress.',
  'Video · 25 % Questzeit':'Video · 25% quest time',
  'Nur in der Android-App verfügbar.':'Only available in the Android app.',
  'Video ansehen · 25 % Questzeit überspringen':'Watch video · skip 25% quest time',
  '1× pro Quest · nur bei vollständig angesehenem Video.':'Once per quest · only after a fully watched video.',
  'Video-Bonus ausgeschöpft':'Video bonus fully used',
  '2/2 Videos genutzt · 50 % der Questzeit wurden bereits übersprungen.':'2/2 videos used · 50% of the quest time has already been skipped.',
  'Zweites Video ansehen · weitere 25 % Questzeit überspringen':'Watch second video · skip another 25% quest time',
  '1/2 Videos genutzt · danach sind 50 % der ursprünglichen Questzeit übersprungen.':'1/2 videos used · after this, 50% of the original quest time will be skipped.',
  '0/2 Videos genutzt · nur vollständig angesehene Videos zählen.':'0/2 videos used · only fully watched videos count.'
 },
 es:{
  'Video nicht verfügbar':'Video no disponible',
  'Rewarded Videos sind nur in der Android-App verfügbar.':'Los videos con recompensa solo están disponibles en la app de Android.',
  'Für den Video-Zeitbonus musst du eingeloggt sein.':'Debes iniciar sesión para usar el bono de tiempo por video.',
  'Keine Zeit übersprungen':'No se omitió tiempo',
  'Nur ein vollständig angesehenes Video gibt den 25-%-Zeitbonus.':'Solo un video visto por completo otorga el bono de tiempo del 25 %.',
  '25 % Questzeit übersprungen':'25 % del tiempo de misión omitido',
  'Bestätigung wird verarbeitet':'Procesando confirmación',
  'Das Video wurde vollständig angesehen. Google bestätigt den Zeitbonus noch serverseitig.':'El video se vio por completo. Google aún está confirmando el bono de tiempo en el servidor.',
  'Das Video wurde nicht vollständig abgeschlossen.':'El video no se completó.',
  'Das Rewarded Video konnte gerade nicht abgeschlossen werden.':'El video con recompensa no pudo completarse ahora.',
  'Video-Bonus genutzt':'Bono de video usado',
  '25 % der Questzeit wurden bereits übersprungen.':'Ya se omitió el 25 % del tiempo de la misión.',
  'Video wird bestätigt …':'Confirmando video …',
  'Serverseitige AdMob-Bestätigung läuft.':'La confirmación de AdMob en el servidor está en curso.',
  'Video · 25 % Questzeit':'Video · 25 % tiempo de misión',
  'Nur in der Android-App verfügbar.':'Solo disponible en la app de Android.',
  'Video ansehen · 25 % Questzeit überspringen':'Ver video · omitir 25 % del tiempo de misión',
  '1× pro Quest · nur bei vollständig angesehenem Video.':'1 vez por misión · solo con el video visto por completo.',
  'Video-Bonus ausgeschöpft':'Bono de video agotado',
  '2/2 Videos genutzt · 50 % der Questzeit wurden bereits übersprungen.':'2/2 videos usados · ya se omitió el 50 % del tiempo de la misión.',
  'Zweites Video ansehen · weitere 25 % Questzeit überspringen':'Ver segundo video · omitir otro 25 % del tiempo de misión',
  '1/2 Videos genutzt · danach sind 50 % der ursprünglichen Questzeit übersprungen.':'1/2 videos usados · después se habrá omitido el 50 % del tiempo original.',
  '0/2 Videos genutzt · nur vollständig angesehene Videos zählen.':'0/2 videos usados · solo cuentan los videos vistos por completo.'
 },
 fr:{
  'Video nicht verfügbar':'Vidéo indisponible',
  'Rewarded Videos sind nur in der Android-App verfügbar.':'Les vidéos récompensées sont uniquement disponibles dans l’app Android.',
  'Für den Video-Zeitbonus musst du eingeloggt sein.':'Tu dois être connecté pour utiliser le bonus de temps vidéo.',
  'Keine Zeit übersprungen':'Aucun temps réduit',
  'Nur ein vollständig angesehenes Video gibt den 25-%-Zeitbonus.':'Seule une vidéo regardée jusqu’au bout donne le bonus de temps de 25 %.',
  '25 % Questzeit übersprungen':'25 % du temps de quête réduit',
  'Bestätigung wird verarbeitet':'Confirmation en cours',
  'Das Video wurde vollständig angesehen. Google bestätigt den Zeitbonus noch serverseitig.':'La vidéo a été regardée jusqu’au bout. Google confirme encore le bonus côté serveur.',
  'Das Video wurde nicht vollständig abgeschlossen.':'La vidéo n’a pas été regardée jusqu’au bout.',
  'Das Rewarded Video konnte gerade nicht abgeschlossen werden.':'La vidéo récompensée n’a pas pu être terminée.',
  'Video-Bonus genutzt':'Bonus vidéo utilisé',
  '25 % der Questzeit wurden bereits übersprungen.':'25 % du temps de quête a déjà été réduit.',
  'Video wird bestätigt …':'Confirmation de la vidéo …',
  'Serverseitige AdMob-Bestätigung läuft.':'La confirmation AdMob côté serveur est en cours.',
  'Video · 25 % Questzeit':'Vidéo · 25 % du temps de quête',
  'Nur in der Android-App verfügbar.':'Disponible uniquement dans l’app Android.',
  'Video ansehen · 25 % Questzeit überspringen':'Regarder une vidéo · réduire 25 % du temps',
  '1× pro Quest · nur bei vollständig angesehenem Video.':'1 fois par quête · uniquement après une vidéo complète.',
  'Video-Bonus ausgeschöpft':'Bonus vidéo épuisé',
  '2/2 Videos genutzt · 50 % der Questzeit wurden bereits übersprungen.':'2/2 vidéos utilisées · 50 % du temps de quête a déjà été réduit.',
  'Zweites Video ansehen · weitere 25 % Questzeit überspringen':'Regarder une deuxième vidéo · réduire encore 25 % du temps',
  '1/2 Videos genutzt · danach sind 50 % der ursprünglichen Questzeit übersprungen.':'1/2 vidéos utilisées · après cela, 50 % du temps initial sera réduit.',
  '0/2 Videos genutzt · nur vollständig angesehene Videos zählen.':'0/2 vidéos utilisées · seules les vidéos regardées jusqu’au bout comptent.'
 },
 pl:{
  'Video nicht verfügbar':'Wideo niedostępne',
  'Rewarded Videos sind nur in der Android-App verfügbar.':'Filmy z nagrodą są dostępne tylko w aplikacji Android.',
  'Für den Video-Zeitbonus musst du eingeloggt sein.':'Aby użyć bonusu czasu za wideo, musisz być zalogowany.',
  'Keine Zeit übersprungen':'Nie skrócono czasu',
  'Nur ein vollständig angesehenes Video gibt den 25-%-Zeitbonus.':'Tylko obejrzenie całego filmu daje bonus skrócenia czasu o 25%.',
  '25 % Questzeit übersprungen':'Skrócono czas misji o 25%',
  'Bestätigung wird verarbeitet':'Trwa potwierdzanie',
  'Das Video wurde vollständig angesehen. Google bestätigt den Zeitbonus noch serverseitig.':'Film został obejrzany w całości. Google nadal potwierdza bonus czasu na serwerze.',
  'Das Video wurde nicht vollständig abgeschlossen.':'Film nie został obejrzany do końca.',
  'Das Rewarded Video konnte gerade nicht abgeschlossen werden.':'Nie udało się teraz ukończyć filmu z nagrodą.',
  'Video-Bonus genutzt':'Bonus wideo wykorzystany',
  '25 % der Questzeit wurden bereits übersprungen.':'25% czasu misji zostało już skrócone.',
  'Video wird bestätigt …':'Potwierdzanie wideo …',
  'Serverseitige AdMob-Bestätigung läuft.':'Trwa serwerowe potwierdzenie AdMob.',
  'Video · 25 % Questzeit':'Wideo · 25% czasu misji',
  'Nur in der Android-App verfügbar.':'Dostępne tylko w aplikacji Android.',
  'Video ansehen · 25 % Questzeit überspringen':'Obejrzyj wideo · skróć czas misji o 25%',
  '1× pro Quest · nur bei vollständig angesehenem Video.':'1× na misję · tylko po obejrzeniu całego filmu.',
  'Video-Bonus ausgeschöpft':'Bonus wideo wykorzystany w całości',
  '2/2 Videos genutzt · 50 % der Questzeit wurden bereits übersprungen.':'Wykorzystano 2/2 filmy · czas misji skrócono już o 50%.',
  'Zweites Video ansehen · weitere 25 % Questzeit überspringen':'Obejrzyj drugi film · skróć czas misji o kolejne 25%',
  '1/2 Videos genutzt · danach sind 50 % der ursprünglichen Questzeit übersprungen.':'Wykorzystano 1/2 filmy · potem czas początkowy będzie skrócony o 50%.',
  '0/2 Videos genutzt · nur vollständig angesehene Videos zählen.':'Wykorzystano 0/2 filmy · liczą się tylko filmy obejrzane do końca.'
 },
 tr:{
  'Video nicht verfügbar':'Video kullanılamıyor',
  'Rewarded Videos sind nur in der Android-App verfügbar.':'Ödüllü videolar yalnızca Android uygulamasında kullanılabilir.',
  'Für den Video-Zeitbonus musst du eingeloggt sein.':'Video süre bonusunu kullanmak için giriş yapmalısın.',
  'Keine Zeit übersprungen':'Süre atlanmadı',
  'Nur ein vollständig angesehenes Video gibt den 25-%-Zeitbonus.':'Yalnızca tamamen izlenen video %25 süre bonusu verir.',
  '25 % Questzeit übersprungen':'Görev süresinin %25’i atlandı',
  'Bestätigung wird verarbeitet':'Onay işleniyor',
  'Das Video wurde vollständig angesehen. Google bestätigt den Zeitbonus noch serverseitig.':'Video tamamen izlendi. Google süre bonusunu sunucu tarafında hâlâ onaylıyor.',
  'Das Video wurde nicht vollständig abgeschlossen.':'Video tamamen izlenmedi.',
  'Das Rewarded Video konnte gerade nicht abgeschlossen werden.':'Ödüllü video şu anda tamamlanamadı.',
  'Video-Bonus genutzt':'Video bonusu kullanıldı',
  '25 % der Questzeit wurden bereits übersprungen.':'Görev süresinin %25’i zaten atlandı.',
  'Video wird bestätigt …':'Video onaylanıyor …',
  'Serverseitige AdMob-Bestätigung läuft.':'Sunucu tarafı AdMob onayı sürüyor.',
  'Video · 25 % Questzeit':'Video · görev süresinin %25’i',
  'Nur in der Android-App verfügbar.':'Yalnızca Android uygulamasında kullanılabilir.',
  'Video ansehen · 25 % Questzeit überspringen':'Video izle · görev süresinin %25’ini atla',
  '1× pro Quest · nur bei vollständig angesehenem Video.':'Görev başına 1× · yalnızca video tamamen izlenirse.',
  'Video-Bonus ausgeschöpft':'Video bonusu tamamen kullanıldı',
  '2/2 Videos genutzt · 50 % der Questzeit wurden bereits übersprungen.':'2/2 video kullanıldı · görev süresinin %50’si zaten atlandı.',
  'Zweites Video ansehen · weitere 25 % Questzeit überspringen':'İkinci videoyu izle · görev süresinin %25’ini daha atla',
  '1/2 Videos genutzt · danach sind 50 % der ursprünglichen Questzeit übersprungen.':'1/2 video kullanıldı · bundan sonra ilk görev süresinin %50’si atlanmış olacak.',
  '0/2 Videos genutzt · nur vollständig angesehene Videos zählen.':'0/2 video kullanıldı · yalnızca tamamen izlenen videolar sayılır.'
 }
};
for(const lang of Object.keys(V8188_TEXT))Object.assign(M[lang]||(M[lang]={}),V8188_TEXT[lang]);

const FINAL_VISIBLE={
 en:{
  'Tippe einen Topf an → Details erscheinen darunter':'Tap a pot → details appear below',
  'Freien Topf in der Mitte antippen. Pflege ist optional: Die Pflanze verdorrt niemals, aber gute Pflege verbessert Qualität und Belohnung.':'Tap a free pot in the middle. Care is optional: the plant never withers, but good care improves quality and rewards.',
  '−8 % Wachstumszeit je Level.':'−8% growth time per level.','+10 % Ertrag je Level.':'+10% yield per level.',
  'Kein Buff aktiv':'No buff active','Keine Samen':'No seeds','Pflanzenplatz nicht verfügbar':'Plant slot unavailable',
  'Wähle einen freien, freigeschalteten Topf.':'Choose a free, unlocked pot.','Dieser Samen ist nicht käuflich':'This seed cannot be purchased',
  'Nur als Beute erhältlich.':'Only available as loot.','Mutation entdeckt!':'Mutation discovered!','Ernte abgeschlossen':'Harvest complete',
  'Samen-Händler':'Seed dealer','Diese Woche:':'This week:','Mutationen':'Mutations','Ertrag':'Yield','Wachstumszeit':'Growth time','Licht':'Light'
 },
 es:{
  'Tippe einen Topf an → Details erscheinen darunter':'Toca una maceta → los detalles aparecen abajo',
  'Freien Topf in der Mitte antippen. Pflege ist optional: Die Pflanze verdorrt niemals, aber gute Pflege verbessert Qualität und Belohnung.':'Toca una maceta libre en el centro. El cuidado es opcional: la planta nunca se marchita, pero un buen cuidado mejora la calidad y las recompensas.',
  '−8 % Wachstumszeit je Level.':'−8 % de tiempo de crecimiento por nivel.','+10 % Ertrag je Level.':'+10 % de rendimiento por nivel.',
  'Kein Buff aktiv':'Sin bono activo','Keine Samen':'Sin semillas','Pflanzenplatz nicht verfügbar':'Espacio de planta no disponible',
  'Wähle einen freien, freigeschalteten Topf.':'Elige una maceta libre y desbloqueada.','Dieser Samen ist nicht käuflich':'Esta semilla no se puede comprar',
  'Nur als Beute erhältlich.':'Solo disponible como botín.','Mutation entdeckt!':'¡Mutación descubierta!','Ernte abgeschlossen':'Cosecha completada',
  'Samen-Händler':'Vendedor de semillas','Diese Woche:':'Esta semana:','Mutationen':'Mutaciones','Ertrag':'Rendimiento','Wachstumszeit':'Tiempo de crecimiento','Licht':'Luz'
 },
 fr:{
  'Tippe einen Topf an → Details erscheinen darunter':'Touchez un pot → les détails apparaissent dessous',
  'Freien Topf in der Mitte antippen. Pflege ist optional: Die Pflanze verdorrt niemals, aber gute Pflege verbessert Qualität und Belohnung.':'Touchez un pot libre au centre. Les soins sont facultatifs : la plante ne se fane jamais, mais de bons soins améliorent la qualité et les récompenses.',
  '−8 % Wachstumszeit je Level.':'−8 % de temps de croissance par niveau.','+10 % Ertrag je Level.':'+10 % de rendement par niveau.',
  'Kein Buff aktiv':'Aucun bonus actif','Keine Samen':'Aucune graine','Pflanzenplatz nicht verfügbar':'Emplacement de plante indisponible',
  'Wähle einen freien, freigeschalteten Topf.':'Choisissez un pot libre et déverrouillé.','Dieser Samen ist nicht käuflich':'Cette graine ne peut pas être achetée',
  'Nur als Beute erhältlich.':'Disponible uniquement comme butin.','Mutation entdeckt!':'Mutation découverte !','Ernte abgeschlossen':'Récolte terminée',
  'Samen-Händler':'Marchand de graines','Diese Woche:':'Cette semaine :','Mutationen':'Mutations','Ertrag':'Rendement','Wachstumszeit':'Temps de croissance','Licht':'Lumière'
 },
 pl:{
  'Tippe einen Topf an → Details erscheinen darunter':'Dotknij doniczki → szczegóły pojawią się poniżej',
  'Freien Topf in der Mitte antippen. Pflege ist optional: Die Pflanze verdorrt niemals, aber gute Pflege verbessert Qualität und Belohnung.':'Dotknij wolnej doniczki pośrodku. Pielęgnacja jest opcjonalna: roślina nigdy nie usycha, ale dobra pielęgnacja poprawia jakość i nagrody.',
  '−8 % Wachstumszeit je Level.':'−8% czasu wzrostu na poziom.','+10 % Ertrag je Level.':'+10% plonu na poziom.',
  'Kein Buff aktiv':'Brak aktywnego bonusu','Keine Samen':'Brak nasion','Pflanzenplatz nicht verfügbar':'Miejsce na roślinę niedostępne',
  'Wähle einen freien, freigeschalteten Topf.':'Wybierz wolną, odblokowaną doniczkę.','Dieser Samen ist nicht käuflich':'Tego nasiona nie można kupić',
  'Nur als Beute erhältlich.':'Dostępne tylko jako łup.','Mutation entdeckt!':'Odkryto mutację!','Ernte abgeschlossen':'Zbiór zakończony',
  'Samen-Händler':'Sprzedawca nasion','Diese Woche:':'W tym tygodniu:','Mutationen':'Mutacje','Ertrag':'Plon','Wachstumszeit':'Czas wzrostu','Licht':'Światło'
 },
 tr:{
  'Tippe einen Topf an → Details erscheinen darunter':'Bir saksıya dokun → ayrıntılar aşağıda görünür',
  'Freien Topf in der Mitte antippen. Pflege ist optional: Die Pflanze verdorrt niemals, aber gute Pflege verbessert Qualität und Belohnung.':'Ortadaki boş bir saksıya dokun. Bakım isteğe bağlıdır: bitki asla solmaz, ancak iyi bakım kaliteyi ve ödülleri artırır.',
  '−8 % Wachstumszeit je Level.':'Seviye başına −%8 büyüme süresi.','+10 % Ertrag je Level.':'Seviye başına +%10 verim.',
  'Kein Buff aktiv':'Aktif bonus yok','Keine Samen':'Tohum yok','Pflanzenplatz nicht verfügbar':'Bitki alanı kullanılamıyor',
  'Wähle einen freien, freigeschalteten Topf.':'Boş ve kilidi açık bir saksı seç.','Dieser Samen ist nicht käuflich':'Bu tohum satın alınamaz',
  'Nur als Beute erhältlich.':'Yalnızca ganimet olarak bulunur.','Mutation entdeckt!':'Mutasyon keşfedildi!','Ernte abgeschlossen':'Hasat tamamlandı',
  'Samen-Händler':'Tohum satıcısı','Diese Woche:':'Bu hafta:','Mutationen':'Mutasyonlar','Ertrag':'Verim','Wachstumszeit':'Büyüme süresi','Licht':'Işık'
 }
};
for(const lang of Object.keys(FINAL_VISIBLE))Object.assign(M[lang]||(M[lang]={}),FINAL_VISIBLE[lang]);

const STATIC_UI_A={
 en:{
  'Premium-Währung':'Premium currency','Der Harzbrecher':'The Resin Breaker',
  'Fähigkeiten werden mit deinem Level freigeschaltet und mit Talentpunkten verbessert.':'Abilities unlock with your level and improve with talent points.',
  'Set-Teile geben zusätzliche Boni, wenn du mehrere gleichzeitig trägst.':'Set pieces grant extra bonuses when you equip several matching pieces.',
  'Wähle deine Spezialisierung. Die Boni werden direkt auf deine Werte gerechnet.':'Choose your specialization. Its bonuses are applied directly to your stats.',
  '🌰 Samen-Shop':'🌰 Seed Shop','Fiktive Sorten mit unterschiedlichen Wachstumszeiten und Erträgen.':'Fictional strains with different growth times and yields.',
  'Dauerhafte Spiel-Upgrades für Wachstum und Ertrag.':'Permanent upgrades for growth and yield.','Leerer Topf':'Empty pot','🏗️ Raum verbessern':'🏗️ Upgrade room',
  'Erhöht Ertrag und schaltet optisch weitere Plätze frei.':'Increases yield and visually unlocks more slots.',
  '🍺 Zur krummen Gießkanne':'🍺 The Crooked Watering Can','Wähle einen Auftrag. Schwierige Aufträge kosten mehr Dampf, bringen aber mehr Beute.':'Choose a mission. Harder missions cost more Steam but give better loot.',
  '⏳ Aktiver Auftrag':'⏳ Active mission','🔄 Neue Aufträge – 10 Gold':'🔄 New missions – 10 Gold',
  '🎟️ Dungeon-Versuch':'🎟️ Dungeon attempt','1 Versuch pro Stunde gratis. Weitere Versuche kosten 1 🟢 Harz-Taler.':'1 free attempt per hour. Additional attempts cost 1 🟢 Resin Token.',
  'Gratisversuch bereit':'Free attempt ready','Trauermücken-Schwarm':'Fungus Gnat Swarm','Raum 1':'Room 1','Trauermücken':'Fungus Gnats','Der Gegner wartet auf dich.':'The enemy is waiting for you.','⚔️ Kampf starten':'⚔️ Start battle',
  'Alle 30 Minuten wird dir ein zufälliger Gegner aus deinem Stärke-Bereich zugeteilt.':'Every 30 minutes you are matched with a random opponent near your power level.',
  'NÄCHSTER KAMPF':'NEXT BATTLE','Bereit':'Ready','KÄMPFE':'BATTLES','Noch kein Gegner ausgewählt':'No opponent selected yet',
  'Das Matchmaking sucht nach ähnlichem Level und ähnlicher Kampfkraft.':'Matchmaking searches for a similar level and combat power.',
  '🎯 Gegner suchen':'🎯 Find opponent',
  'Matchmaking: bevorzugt ±2 Level und etwa ±20 % Kampfkraft. Falls kein Spieler passt, wird der Bereich vorsichtig erweitert.':'Matchmaking prefers ±2 levels and about ±20% combat power. If nobody fits, the range is expanded gradually.',
  'Sieg: Gold + Erfahrung + PvP-Buds. Je stärker der besiegte Gegner im Vergleich zu dir war, desto mehr Buds erhältst du. Niederlage: kleine Teilnahmebelohnung, niemals Bud-Abzug.':'Victory: Gold + XP + PvP Buds. Stronger defeated opponents grant more Buds. Defeat gives a small participation reward and never removes Buds.',
  'Nach einem Kampf beginnt ein serverseitiger Cooldown von 30 Minuten.':'After a battle, a 30-minute server cooldown begins.'
 },
 es:{
  'Premium-Währung':'Moneda prémium','Der Harzbrecher':'El Romperresina',
  'Fähigkeiten werden mit deinem Level freigeschaltet und mit Talentpunkten verbessert.':'Las habilidades se desbloquean con tu nivel y mejoran con puntos de talento.',
  'Set-Teile geben zusätzliche Boni, wenn du mehrere gleichzeitig trägst.':'Las piezas de set dan bonificaciones extra al equipar varias compatibles.',
  'Wähle deine Spezialisierung. Die Boni werden direkt auf deine Werte gerechnet.':'Elige tu especialización. Sus bonificaciones se aplican directamente a tus atributos.',
  '🌰 Samen-Shop':'🌰 Tienda de semillas','Fiktive Sorten mit unterschiedlichen Wachstumszeiten und Erträgen.':'Variedades ficticias con distintos tiempos de crecimiento y rendimientos.',
  'Dauerhafte Spiel-Upgrades für Wachstum und Ertrag.':'Mejoras permanentes para crecimiento y rendimiento.','Leerer Topf':'Maceta vacía','🏗️ Raum verbessern':'🏗️ Mejorar sala',
  'Erhöht Ertrag und schaltet optisch weitere Plätze frei.':'Aumenta el rendimiento y desbloquea visualmente más espacios.',
  '🍺 Zur krummen Gießkanne':'🍺 La Regadera Torcida','Wähle einen Auftrag. Schwierige Aufträge kosten mehr Dampf, bringen aber mehr Beute.':'Elige una misión. Las difíciles cuestan más Vapor, pero dan más botín.',
  '⏳ Aktiver Auftrag':'⏳ Misión activa','🔄 Neue Aufträge – 10 Gold':'🔄 Nuevas misiones – 10 Oro',
  '🎟️ Dungeon-Versuch':'🎟️ Intento de mazmorra','1 Versuch pro Stunde gratis. Weitere Versuche kosten 1 🟢 Harz-Taler.':'1 intento gratis por hora. Los adicionales cuestan 1 🟢 ficha de resina.',
  'Gratisversuch bereit':'Intento gratis listo','Trauermücken-Schwarm':'Enjambre de mosquitos del hongo','Raum 1':'Sala 1','Trauermücken':'Mosquitos del hongo','Der Gegner wartet auf dich.':'El enemigo te espera.','⚔️ Kampf starten':'⚔️ Iniciar combate',
  'Alle 30 Minuten wird dir ein zufälliger Gegner aus deinem Stärke-Bereich zugeteilt.':'Cada 30 minutos se te asigna un rival aleatorio de un nivel de fuerza similar.',
  'NÄCHSTER KAMPF':'PRÓXIMO COMBATE','Bereit':'Listo','KÄMPFE':'COMBATES','Noch kein Gegner ausgewählt':'Aún no hay rival seleccionado',
  'Das Matchmaking sucht nach ähnlichem Level und ähnlicher Kampfkraft.':'El emparejamiento busca nivel y poder de combate similares.',
  '🎯 Gegner suchen':'🎯 Buscar rival',
  'Matchmaking: bevorzugt ±2 Level und etwa ±20 % Kampfkraft. Falls kein Spieler passt, wird der Bereich vorsichtig erweitert.':'El emparejamiento prioriza ±2 niveles y aprox. ±20 % de poder. Si nadie encaja, el rango se amplía gradualmente.',
  'Sieg: Gold + Erfahrung + PvP-Buds. Je stärker der besiegte Gegner im Vergleich zu dir war, desto mehr Buds erhältst du. Niederlage: kleine Teilnahmebelohnung, niemals Bud-Abzug.':'Victoria: Oro + EXP + Brotes PvP. Cuanto más fuerte sea el rival derrotado, más brotes obtienes. La derrota da una pequeña recompensa y nunca resta brotes.',
  'Nach einem Kampf beginnt ein serverseitiger Cooldown von 30 Minuten.':'Tras un combate comienza un enfriamiento de servidor de 30 minutos.'
 },
 fr:{
  'Premium-Währung':'Monnaie premium','Der Harzbrecher':'Le Briseur de résine',
  'Fähigkeiten werden mit deinem Level freigeschaltet und mit Talentpunkten verbessert.':'Les compétences se débloquent avec ton niveau et s’améliorent avec des points de talent.',
  'Set-Teile geben zusätzliche Boni, wenn du mehrere gleichzeitig trägst.':'Les pièces de set donnent des bonus supplémentaires quand plusieurs pièces compatibles sont équipées.',
  'Wähle deine Spezialisierung. Die Boni werden direkt auf deine Werte gerechnet.':'Choisis ta spécialisation. Ses bonus sont appliqués directement à tes stats.',
  '🌰 Samen-Shop':'🌰 Boutique de graines','Fiktive Sorten mit unterschiedlichen Wachstumszeiten und Erträgen.':'Variétés fictives avec différents temps de croissance et rendements.',
  'Dauerhafte Spiel-Upgrades für Wachstum und Ertrag.':'Améliorations permanentes pour la croissance et le rendement.','Leerer Topf':'Pot vide','🏗️ Raum verbessern':'🏗️ Améliorer la salle',
  'Erhöht Ertrag und schaltet optisch weitere Plätze frei.':'Augmente le rendement et débloque visuellement plus d’emplacements.',
  '🍺 Zur krummen Gießkanne':'🍺 L’Arrosoir Tordu','Wähle einen Auftrag. Schwierige Aufträge kosten mehr Dampf, bringen aber mehr Beute.':'Choisis une quête. Les quêtes difficiles coûtent plus de Vapeur mais donnent plus de butin.',
  '⏳ Aktiver Auftrag':'⏳ Quête active','🔄 Neue Aufträge – 10 Gold':'🔄 Nouvelles quêtes – 10 Or',
  '🎟️ Dungeon-Versuch':'🎟️ Essai de donjon','1 Versuch pro Stunde gratis. Weitere Versuche kosten 1 🟢 Harz-Taler.':'1 essai gratuit par heure. Les essais supplémentaires coûtent 1 🟢 jeton de résine.',
  'Gratisversuch bereit':'Essai gratuit prêt','Trauermücken-Schwarm':'Essaim de moucherons','Raum 1':'Salle 1','Trauermücken':'Moucherons','Der Gegner wartet auf dich.':'L’ennemi t’attend.','⚔️ Kampf starten':'⚔️ Lancer le combat',
  'Alle 30 Minuten wird dir ein zufälliger Gegner aus deinem Stärke-Bereich zugeteilt.':'Toutes les 30 minutes, un adversaire aléatoire proche de ta puissance t’est attribué.',
  'NÄCHSTER KAMPF':'PROCHAIN COMBAT','Bereit':'Prêt','KÄMPFE':'COMBATS','Noch kein Gegner ausgewählt':'Aucun adversaire sélectionné',
  'Das Matchmaking sucht nach ähnlichem Level und ähnlicher Kampfkraft.':'Le matchmaking cherche un niveau et une puissance similaires.',
  '🎯 Gegner suchen':'🎯 Chercher un adversaire',
  'Matchmaking: bevorzugt ±2 Level und etwa ±20 % Kampfkraft. Falls kein Spieler passt, wird der Bereich vorsichtig erweitert.':'Le matchmaking privilégie ±2 niveaux et environ ±20 % de puissance. Si personne ne correspond, la plage est élargie progressivement.',
  'Sieg: Gold + Erfahrung + PvP-Buds. Je stärker der besiegte Gegner im Vergleich zu dir war, desto mehr Buds erhältst du. Niederlage: kleine Teilnahmebelohnung, niemals Bud-Abzug.':'Victoire : Or + EXP + Buds PvP. Plus l’adversaire vaincu était fort, plus tu gagnes de Buds. Une défaite donne une petite récompense sans jamais retirer de Buds.',
  'Nach einem Kampf beginnt ein serverseitiger Cooldown von 30 Minuten.':'Après un combat, un délai serveur de 30 minutes commence.'
 },
 pl:{
  'Premium-Währung':'Waluta premium','Der Harzbrecher':'Łamacz Żywicy',
  'Fähigkeiten werden mit deinem Level freigeschaltet und mit Talentpunkten verbessert.':'Umiejętności odblokowują się wraz z poziomem i są ulepszane punktami talentów.',
  'Set-Teile geben zusätzliche Boni, wenn du mehrere gleichzeitig trägst.':'Elementy zestawu dają dodatkowe bonusy, gdy nosisz kilka pasujących części.',
  'Wähle deine Spezialisierung. Die Boni werden direkt auf deine Werte gerechnet.':'Wybierz specjalizację. Jej bonusy są bezpośrednio doliczane do statystyk.',
  '🌰 Samen-Shop':'🌰 Sklep z nasionami','Fiktive Sorten mit unterschiedlichen Wachstumszeiten und Erträgen.':'Fikcyjne odmiany z różnym czasem wzrostu i plonem.',
  'Dauerhafte Spiel-Upgrades für Wachstum und Ertrag.':'Stałe ulepszenia wzrostu i plonu.','Leerer Topf':'Pusta doniczka','🏗️ Raum verbessern':'🏗️ Ulepsz pomieszczenie',
  'Erhöht Ertrag und schaltet optisch weitere Plätze frei.':'Zwiększa plon i wizualnie odblokowuje kolejne miejsca.',
  '🍺 Zur krummen Gießkanne':'🍺 Krzywa Konewka','Wähle einen Auftrag. Schwierige Aufträge kosten mehr Dampf, bringen aber mehr Beute.':'Wybierz misję. Trudniejsze kosztują więcej Pary, ale dają więcej łupów.',
  '⏳ Aktiver Auftrag':'⏳ Aktywna misja','🔄 Neue Aufträge – 10 Gold':'🔄 Nowe misje – 10 złota',
  '🎟️ Dungeon-Versuch':'🎟️ Próba lochu','1 Versuch pro Stunde gratis. Weitere Versuche kosten 1 🟢 Harz-Taler.':'1 darmowa próba na godzinę. Kolejne kosztują 1 🟢 żeton żywicy.',
  'Gratisversuch bereit':'Darmowa próba gotowa','Trauermücken-Schwarm':'Rój ziemiórek','Raum 1':'Sala 1','Trauermücken':'Ziemiórki','Der Gegner wartet auf dich.':'Przeciwnik czeka na ciebie.','⚔️ Kampf starten':'⚔️ Rozpocznij walkę',
  'Alle 30 Minuten wird dir ein zufälliger Gegner aus deinem Stärke-Bereich zugeteilt.':'Co 30 minut przydzielany jest losowy przeciwnik o podobnej sile.',
  'NÄCHSTER KAMPF':'NASTĘPNA WALKA','Bereit':'Gotowe','KÄMPFE':'WALKI','Noch kein Gegner ausgewählt':'Nie wybrano jeszcze przeciwnika',
  'Das Matchmaking sucht nach ähnlichem Level und ähnlicher Kampfkraft.':'Dobieranie szuka podobnego poziomu i siły bojowej.',
  '🎯 Gegner suchen':'🎯 Szukaj przeciwnika',
  'Matchmaking: bevorzugt ±2 Level und etwa ±20 % Kampfkraft. Falls kein Spieler passt, wird der Bereich vorsichtig erweitert.':'Dobieranie preferuje ±2 poziomy i ok. ±20% siły bojowej. Gdy nikt nie pasuje, zakres jest stopniowo rozszerzany.',
  'Sieg: Gold + Erfahrung + PvP-Buds. Je stärker der besiegte Gegner im Vergleich zu dir war, desto mehr Buds erhältst du. Niederlage: kleine Teilnahmebelohnung, niemals Bud-Abzug.':'Zwycięstwo: złoto + EXP + Budsy PvP. Im silniejszy pokonany przeciwnik, tym więcej Budsów. Porażka daje małą nagrodę i nigdy nie zabiera Budsów.',
  'Nach einem Kampf beginnt ein serverseitiger Cooldown von 30 Minuten.':'Po walce rozpoczyna się 30-minutowy czas odnowienia serwera.'
 },
 tr:{
  'Premium-Währung':'Premium para birimi','Der Harzbrecher':'Reçine Kıran',
  'Fähigkeiten werden mit deinem Level freigeschaltet und mit Talentpunkten verbessert.':'Yetenekler seviyenle açılır ve yetenek puanlarıyla geliştirilir.',
  'Set-Teile geben zusätzliche Boni, wenn du mehrere gleichzeitig trägst.':'Birden fazla uyumlu set parçası kuşandığında ek bonuslar kazanırsın.',
  'Wähle deine Spezialisierung. Die Boni werden direkt auf deine Werte gerechnet.':'Uzmanlığını seç. Bonusları doğrudan özelliklerine uygulanır.',
  '🌰 Samen-Shop':'🌰 Tohum Mağazası','Fiktive Sorten mit unterschiedlichen Wachstumszeiten und Erträgen.':'Farklı büyüme süreleri ve verimlere sahip kurgusal türler.',
  'Dauerhafte Spiel-Upgrades für Wachstum und Ertrag.':'Büyüme ve verim için kalıcı yükseltmeler.','Leerer Topf':'Boş saksı','🏗️ Raum verbessern':'🏗️ Odayı geliştir',
  'Erhöht Ertrag und schaltet optisch weitere Plätze frei.':'Verimi artırır ve görsel olarak daha fazla alan açar.',
  '🍺 Zur krummen Gießkanne':'🍺 Eğri Sulama Kabı','Wähle einen Auftrag. Schwierige Aufträge kosten mehr Dampf, bringen aber mehr Beute.':'Bir görev seç. Zor görevler daha fazla Buhar harcar ama daha çok ganimet verir.',
  '⏳ Aktiver Auftrag':'⏳ Aktif görev','🔄 Neue Aufträge – 10 Gold':'🔄 Yeni görevler – 10 Altın',
  '🎟️ Dungeon-Versuch':'🎟️ Zindan denemesi','1 Versuch pro Stunde gratis. Weitere Versuche kosten 1 🟢 Harz-Taler.':'Saatte 1 ücretsiz deneme. Ek denemeler 1 🟢 Reçine Jetonu tutar.',
  'Gratisversuch bereit':'Ücretsiz deneme hazır','Trauermücken-Schwarm':'Mantar Sivrisineği Sürüsü','Raum 1':'Oda 1','Trauermücken':'Mantar Sivrisinekleri','Der Gegner wartet auf dich.':'Düşman seni bekliyor.','⚔️ Kampf starten':'⚔️ Savaşı başlat',
  'Alle 30 Minuten wird dir ein zufälliger Gegner aus deinem Stärke-Bereich zugeteilt.':'Her 30 dakikada gücüne yakın rastgele bir rakip atanır.',
  'NÄCHSTER KAMPF':'SONRAKİ SAVAŞ','Bereit':'Hazır','KÄMPFE':'SAVAŞLAR','Noch kein Gegner ausgewählt':'Henüz rakip seçilmedi',
  'Das Matchmaking sucht nach ähnlichem Level und ähnlicher Kampfkraft.':'Eşleştirme benzer seviye ve savaş gücü arar.',
  '🎯 Gegner suchen':'🎯 Rakip ara',
  'Matchmaking: bevorzugt ±2 Level und etwa ±20 % Kampfkraft. Falls kein Spieler passt, wird der Bereich vorsichtig erweitert.':'Eşleştirme ±2 seviye ve yaklaşık ±%20 savaş gücünü tercih eder. Kimse uymazsa aralık kademeli genişletilir.',
  'Sieg: Gold + Erfahrung + PvP-Buds. Je stärker der besiegte Gegner im Vergleich zu dir war, desto mehr Buds erhältst du. Niederlage: kleine Teilnahmebelohnung, niemals Bud-Abzug.':'Zafer: Altın + EXP + PvP Buds. Yendiğin rakip ne kadar güçlüyse o kadar çok Bud kazanırsın. Yenilgi küçük bir katılım ödülü verir ve Bud azaltmaz.',
  'Nach einem Kampf beginnt ein serverseitiger Cooldown von 30 Minuten.':'Bir savaştan sonra 30 dakikalık sunucu bekleme süresi başlar.'
 }
};
for(const lang of Object.keys(STATIC_UI_A))Object.assign(M[lang]||(M[lang]={}),STATIC_UI_A[lang]);

const STATIC_UI_B={
 en:{
  '🌿 GEMEINSAM STÄRKER':'🌿 STRONGER TOGETHER','Gründe eine Gilde, kämpft gemeinsam gegen den täglichen Gildenboss und tretet im Gildenkrieg gegen andere Gilden an.':'Create a guild, fight the daily guild boss together and compete against other guilds in guild wars.',
  'Du bist noch in keiner Gilde':'You are not in a guild yet','In einer Gilde schaltest du dauerhafte EXP-/Gold-Boni, den täglichen Gildenboss und Gilde-gegen-Gilde frei.':'A guild unlocks permanent XP/Gold bonuses, the daily guild boss and guild-vs-guild battles.',
  'Gilde gründen':'Create guild','Online-Feature · benötigt einen eingeloggten Grow-Legends-Account.':'Online feature · requires a signed-in Grow Legends account.','ODER':'OR','🔎 Gilde suchen & beitreten':'🔎 Find & join guild',
  'Suche nach Gildenname oder Kürzel und sende eine Beitrittsanfrage.':'Search by guild name or tag and send a join request.','Anmeldung für Angriff und Verteidigung ist für alle sichtbar.':'Attack and defense registrations are visible to everyone.',
  'Anführer und Offiziere können Bewerbungen annehmen oder ablehnen.':'Leaders and officers can accept or reject applications.','Mitglieder verwalten, Rollen vergeben oder die Gilde verlassen.':'Manage members, assign roles or leave the guild.',
  '👥 Spieler einladen':'👥 Invite players','Spieler nach Charaktername suchen und direkt in deine Gilde einladen. Einladungen gelten 48 Stunden.':'Search players by character name and invite them directly to your guild. Invitations last 48 hours.',
  'Suche einen Spieler nach seinem Charakternamen.':'Search for a player by character name.','Keine offenen Einladungen.':'No open invitations.','Gilden-Grow-Aufträge werden geladen …':'Loading guild grow missions …',
  'TÄGLICHER GILDENBOSS':'DAILY GUILD BOSS','Der Verseuchte Titan':'The Corrupted Titan','Jede besiegte Stufe schaltet dauerhaft einen stärkeren Titan frei. Deine Kampfkraft macht echten Fortschritt möglich.':'Each defeated stage permanently unlocks a stronger Titan. Your combat power drives real progress.',
  '🏰 Langzeit-Boss · täglich neu anmelden · feste Stufen-HP · geringe Zufallsschwankung':'🏰 Long-term boss · sign up daily · fixed stage HP · low random variance','👹 Für Gildenboss anmelden':'👹 Sign up for guild boss',
  'Die Anmeldung gilt nur für die heutige Bossrunde. Nach der Auswertung wird sie automatisch gelöscht.':'Registration only applies to today’s boss round and is removed automatically after evaluation.',
  '🎬 Kampf ansehen':'🎬 Watch battle','🎁 Gildenboss-Belohnung abholen':'🎁 Claim guild boss reward','☣ Der Verseuchte Titan':'☣ The Corrupted Titan','Kämpfer':'Fighters','Der Gildenboss wartet …':'The guild boss is waiting …',
  'Die gemeldeten Spieler greifen nacheinander an. Die verbleibenden Boss-HP bleiben zwischen den Spielern bestehen. Bei Sieg erhalten Teilnehmer Harz-Taler sowie levelabhängige EXP und Gold.':'Registered players attack one after another. Remaining boss HP carries over between players. On victory, participants receive Resin Tokens plus level-scaled XP and Gold.',
  'GILDE GEGEN GILDE':'GUILD VS GUILD','Entscheide selbst, ob du beim nächsten Krieg angreifst, verteidigst oder beides machst.':'Choose whether to attack, defend or do both in the next war.',
  'Nicht angemeldet':'Not signed up','⚔️ Täglicher Gildenkrieg':'⚔️ Daily guild war','Anmeldung bis 18:00 · Kampf ab 19:00 · Gildenboss um 20:00.':'Sign-up until 18:00 · battle from 19:00 · guild boss at 20:00.',
  'DEINE GILDE':'YOUR GUILD','GEGNER':'OPPONENT','Noch kein Gegner':'No opponent yet','Melde Mitglieder für Angriff und Verteidigung an.':'Register members for attack and defense.','🎁 Teilnahmebelohnung abholen':'🎁 Claim participation reward',
  'Rangliste, Spielerprofile und die größten Grow-Legenden.':'Rankings, player profiles and the greatest Grow Legends.','Rangliste & Spielerfortschritt':'Ranking & player progress','Spieler suchen':'Search players',
  'Freunde, Anfragen und Spielerprofile.':'Friends, requests and player profiles.','Deine Freunde in Grow Legends.':'Your friends in Grow Legends.','0 Freunde':'0 friends','GEMEINSAM WACHSEN · GEMEINSAM STÄRKER':'GROW TOGETHER · STRONGER TOGETHER',
  'Private Nachrichten, PvP-Kämpfe und wichtige Ereignisse.':'Private messages, PvP battles and important events.','Nachrichten und deine letzten PvP-Kämpfe an einem Ort.':'Messages and your latest PvP battles in one place.','✍️ Neue Nachricht':'✍️ New message','Nachricht senden':'Send message'
 },
 es:{
  '🌿 GEMEINSAM STÄRKER':'🌿 MÁS FUERTES JUNTOS','Gründe eine Gilde, kämpft gemeinsam gegen den täglichen Gildenboss und tretet im Gildenkrieg gegen andere Gilden an.':'Crea un gremio, luchad juntos contra el jefe diario y competid contra otros gremios en la guerra.',
  'Du bist noch in keiner Gilde':'Aún no estás en un gremio','In einer Gilde schaltest du dauerhafte EXP-/Gold-Boni, den täglichen Gildenboss und Gilde-gegen-Gilde frei.':'Un gremio desbloquea bonos permanentes de EXP/Oro, el jefe diario y combates gremio contra gremio.',
  'Gilde gründen':'Crear gremio','Online-Feature · benötigt einen eingeloggten Grow-Legends-Account.':'Función online · requiere una cuenta de Grow Legends conectada.','ODER':'O','🔎 Gilde suchen & beitreten':'🔎 Buscar y unirse a gremio',
  'Suche nach Gildenname oder Kürzel und sende eine Beitrittsanfrage.':'Busca por nombre o etiqueta del gremio y envía una solicitud.','Anmeldung für Angriff und Verteidigung ist für alle sichtbar.':'Las inscripciones de ataque y defensa son visibles para todos.',
  'Anführer und Offiziere können Bewerbungen annehmen oder ablehnen.':'Líderes y oficiales pueden aceptar o rechazar solicitudes.','Mitglieder verwalten, Rollen vergeben oder die Gilde verlassen.':'Gestiona miembros, asigna roles o abandona el gremio.',
  '👥 Spieler einladen':'👥 Invitar jugadores','Spieler nach Charaktername suchen und direkt in deine Gilde einladen. Einladungen gelten 48 Stunden.':'Busca jugadores por nombre de personaje e invítalos directamente. Las invitaciones duran 48 horas.',
  'Suche einen Spieler nach seinem Charakternamen.':'Busca un jugador por el nombre de su personaje.','Keine offenen Einladungen.':'No hay invitaciones abiertas.','Gilden-Grow-Aufträge werden geladen …':'Cargando encargos de cultivo del gremio …',
  'TÄGLICHER GILDENBOSS':'JEFE DIARIO DEL GREMIO','Der Verseuchte Titan':'El Titán Corrupto','Jede besiegte Stufe schaltet dauerhaft einen stärkeren Titan frei. Deine Kampfkraft macht echten Fortschritt möglich.':'Cada etapa derrotada desbloquea permanentemente un Titán más fuerte. Tu poder de combate impulsa el progreso.',
  '🏰 Langzeit-Boss · täglich neu anmelden · feste Stufen-HP · geringe Zufallsschwankung':'🏰 Jefe a largo plazo · inscripción diaria · PV fijos por etapa · baja variación aleatoria','👹 Für Gildenboss anmelden':'👹 Inscribirse al jefe del gremio',
  'Die Anmeldung gilt nur für die heutige Bossrunde. Nach der Auswertung wird sie automatisch gelöscht.':'La inscripción solo vale para la ronda de hoy y se elimina automáticamente después.',
  '🎬 Kampf ansehen':'🎬 Ver combate','🎁 Gildenboss-Belohnung abholen':'🎁 Recoger recompensa del jefe','☣ Der Verseuchte Titan':'☣ El Titán Corrupto','Kämpfer':'Combatientes','Der Gildenboss wartet …':'El jefe del gremio espera …',
  'Die gemeldeten Spieler greifen nacheinander an. Die verbleibenden Boss-HP bleiben zwischen den Spielern bestehen. Bei Sieg erhalten Teilnehmer Harz-Taler sowie levelabhängige EXP und Gold.':'Los jugadores inscritos atacan uno tras otro. Los PV restantes del jefe se conservan entre jugadores. Al vencer, los participantes reciben fichas de resina, EXP y Oro según nivel.',
  'GILDE GEGEN GILDE':'GREMIO CONTRA GREMIO','Entscheide selbst, ob du beim nächsten Krieg angreifst, verteidigst oder beides machst.':'Decide si atacarás, defenderás o harás ambas cosas en la próxima guerra.',
  'Nicht angemeldet':'No inscrito','⚔️ Täglicher Gildenkrieg':'⚔️ Guerra diaria de gremios','Anmeldung bis 18:00 · Kampf ab 19:00 · Gildenboss um 20:00.':'Inscripción hasta las 18:00 · combate desde las 19:00 · jefe a las 20:00.',
  'DEINE GILDE':'TU GREMIO','GEGNER':'RIVAL','Noch kein Gegner':'Aún no hay rival','Melde Mitglieder für Angriff und Verteidigung an.':'Inscribe miembros para ataque y defensa.','🎁 Teilnahmebelohnung abholen':'🎁 Recoger recompensa de participación',
  'Rangliste, Spielerprofile und die größten Grow-Legenden.':'Clasificación, perfiles y las mayores leyendas de Grow.','Rangliste & Spielerfortschritt':'Clasificación y progreso','Spieler suchen':'Buscar jugadores',
  'Freunde, Anfragen und Spielerprofile.':'Amigos, solicitudes y perfiles.','Deine Freunde in Grow Legends.':'Tus amigos en Grow Legends.','0 Freunde':'0 amigos','GEMEINSAM WACHSEN · GEMEINSAM STÄRKER':'CRECER JUNTOS · MÁS FUERTES JUNTOS',
  'Private Nachrichten, PvP-Kämpfe und wichtige Ereignisse.':'Mensajes privados, combates PvP y eventos importantes.','Nachrichten und deine letzten PvP-Kämpfe an einem Ort.':'Mensajes y tus últimos combates PvP en un solo lugar.','✍️ Neue Nachricht':'✍️ Nuevo mensaje','Nachricht senden':'Enviar mensaje'
 },
 fr:{
  '🌿 GEMEINSAM STÄRKER':'🌿 PLUS FORTS ENSEMBLE','Gründe eine Gilde, kämpft gemeinsam gegen den täglichen Gildenboss und tretet im Gildenkrieg gegen andere Gilden an.':'Crée une guilde, affrontez ensemble le boss quotidien et combattez d’autres guildes en guerre de guilde.',
  'Du bist noch in keiner Gilde':'Tu n’es pas encore dans une guilde','In einer Gilde schaltest du dauerhafte EXP-/Gold-Boni, den täglichen Gildenboss und Gilde-gegen-Gilde frei.':'Une guilde débloque des bonus permanents d’EXP/Or, le boss quotidien et les combats guilde contre guilde.',
  'Gilde gründen':'Créer une guilde','Online-Feature · benötigt einen eingeloggten Grow-Legends-Account.':'Fonction en ligne · nécessite un compte Grow Legends connecté.','ODER':'OU','🔎 Gilde suchen & beitreten':'🔎 Chercher et rejoindre une guilde',
  'Suche nach Gildenname oder Kürzel und sende eine Beitrittsanfrage.':'Recherche par nom ou tag de guilde et envoie une demande.','Anmeldung für Angriff und Verteidigung ist für alle sichtbar.':'Les inscriptions en attaque et défense sont visibles par tous.',
  'Anführer und Offiziere können Bewerbungen annehmen oder ablehnen.':'Les chefs et officiers peuvent accepter ou refuser les candidatures.','Mitglieder verwalten, Rollen vergeben oder die Gilde verlassen.':'Gérer les membres, attribuer des rôles ou quitter la guilde.',
  '👥 Spieler einladen':'👥 Inviter des joueurs','Spieler nach Charaktername suchen und direkt in deine Gilde einladen. Einladungen gelten 48 Stunden.':'Recherche des joueurs par nom de personnage et invite-les directement. Les invitations durent 48 heures.',
  'Suche einen Spieler nach seinem Charakternamen.':'Recherche un joueur par nom de personnage.','Keine offenen Einladungen.':'Aucune invitation ouverte.','Gilden-Grow-Aufträge werden geladen …':'Chargement des missions de culture de guilde …',
  'TÄGLICHER GILDENBOSS':'BOSS DE GUILDE QUOTIDIEN','Der Verseuchte Titan':'Le Titan Corrompu','Jede besiegte Stufe schaltet dauerhaft einen stärkeren Titan frei. Deine Kampfkraft macht echten Fortschritt möglich.':'Chaque étape vaincue débloque définitivement un Titan plus puissant. Ta puissance de combat fait avancer la progression.',
  '🏰 Langzeit-Boss · täglich neu anmelden · feste Stufen-HP · geringe Zufallsschwankung':'🏰 Boss longue durée · inscription quotidienne · PV fixes par étape · faible variation aléatoire','👹 Für Gildenboss anmelden':'👹 S’inscrire au boss de guilde',
  'Die Anmeldung gilt nur für die heutige Bossrunde. Nach der Auswertung wird sie automatisch gelöscht.':'L’inscription ne vaut que pour la manche d’aujourd’hui et est supprimée automatiquement après.',
  '🎬 Kampf ansehen':'🎬 Voir le combat','🎁 Gildenboss-Belohnung abholen':'🎁 Récupérer la récompense du boss','☣ Der Verseuchte Titan':'☣ Le Titan Corrompu','Kämpfer':'Combattants','Der Gildenboss wartet …':'Le boss de guilde attend …',
  'Die gemeldeten Spieler greifen nacheinander an. Die verbleibenden Boss-HP bleiben zwischen den Spielern bestehen. Bei Sieg erhalten Teilnehmer Harz-Taler sowie levelabhängige EXP und Gold.':'Les joueurs inscrits attaquent à tour de rôle. Les PV restants du boss persistent entre les joueurs. En cas de victoire, les participants reçoivent des jetons de résine, de l’EXP et de l’Or selon leur niveau.',
  'GILDE GEGEN GILDE':'GUILDE CONTRE GUILDE','Entscheide selbst, ob du beim nächsten Krieg angreifst, verteidigst oder beides machst.':'Choisis d’attaquer, de défendre ou de faire les deux lors de la prochaine guerre.',
  'Nicht angemeldet':'Non inscrit','⚔️ Täglicher Gildenkrieg':'⚔️ Guerre de guilde quotidienne','Anmeldung bis 18:00 · Kampf ab 19:00 · Gildenboss um 20:00.':'Inscription jusqu’à 18:00 · combat dès 19:00 · boss à 20:00.',
  'DEINE GILDE':'TA GUILDE','GEGNER':'ADVERSAIRE','Noch kein Gegner':'Aucun adversaire','Melde Mitglieder für Angriff und Verteidigung an.':'Inscris des membres en attaque et en défense.','🎁 Teilnahmebelohnung abholen':'🎁 Récupérer la récompense de participation',
  'Rangliste, Spielerprofile und die größten Grow-Legenden.':'Classement, profils de joueurs et plus grandes légendes de Grow.','Rangliste & Spielerfortschritt':'Classement & progression','Spieler suchen':'Rechercher des joueurs',
  'Freunde, Anfragen und Spielerprofile.':'Amis, demandes et profils de joueurs.','Deine Freunde in Grow Legends.':'Tes amis dans Grow Legends.','0 Freunde':'0 ami','GEMEINSAM WACHSEN · GEMEINSAM STÄRKER':'GRANDIR ENSEMBLE · PLUS FORTS ENSEMBLE',
  'Private Nachrichten, PvP-Kämpfe und wichtige Ereignisse.':'Messages privés, combats PvP et événements importants.','Nachrichten und deine letzten PvP-Kämpfe an einem Ort.':'Messages et tes derniers combats PvP au même endroit.','✍️ Neue Nachricht':'✍️ Nouveau message','Nachricht senden':'Envoyer le message'
 },
 pl:{
  '🌿 GEMEINSAM STÄRKER':'🌿 RAZEM SILNIEJSI','Gründe eine Gilde, kämpft gemeinsam gegen den täglichen Gildenboss und tretet im Gildenkrieg gegen andere Gilden an.':'Załóż gildię, wspólnie walczcie z codziennym bossem i rywalizujcie z innymi gildiami.',
  'Du bist noch in keiner Gilde':'Nie jesteś jeszcze w gildii','In einer Gilde schaltest du dauerhafte EXP-/Gold-Boni, den täglichen Gildenboss und Gilde-gegen-Gilde frei.':'Gildia odblokowuje stałe bonusy EXP/Złota, codziennego bossa i walki gildia kontra gildia.',
  'Gilde gründen':'Załóż gildię','Online-Feature · benötigt einen eingeloggten Grow-Legends-Account.':'Funkcja online · wymaga zalogowanego konta Grow Legends.','ODER':'LUB','🔎 Gilde suchen & beitreten':'🔎 Znajdź i dołącz do gildii',
  'Suche nach Gildenname oder Kürzel und sende eine Beitrittsanfrage.':'Szukaj po nazwie lub tagu gildii i wyślij prośbę o dołączenie.','Anmeldung für Angriff und Verteidigung ist für alle sichtbar.':'Zapisy do ataku i obrony są widoczne dla wszystkich.',
  'Anführer und Offiziere können Bewerbungen annehmen oder ablehnen.':'Liderzy i oficerowie mogą przyjmować lub odrzucać podania.','Mitglieder verwalten, Rollen vergeben oder die Gilde verlassen.':'Zarządzaj członkami, przydzielaj role lub opuść gildię.',
  '👥 Spieler einladen':'👥 Zaproś graczy','Spieler nach Charaktername suchen und direkt in deine Gilde einladen. Einladungen gelten 48 Stunden.':'Szukaj graczy po nazwie postaci i zapraszaj bezpośrednio do gildii. Zaproszenia są ważne 48 godzin.',
  'Suche einen Spieler nach seinem Charakternamen.':'Szukaj gracza po nazwie postaci.','Keine offenen Einladungen.':'Brak otwartych zaproszeń.','Gilden-Grow-Aufträge werden geladen …':'Ładowanie zadań uprawy gildii …',
  'TÄGLICHER GILDENBOSS':'CODZIENNY BOSS GILDII','Der Verseuchte Titan':'Skażony Tytan','Jede besiegte Stufe schaltet dauerhaft einen stärkeren Titan frei. Deine Kampfkraft macht echten Fortschritt möglich.':'Każdy pokonany etap trwale odblokowuje silniejszego Tytana. Twoja siła bojowa napędza postęp.',
  '🏰 Langzeit-Boss · täglich neu anmelden · feste Stufen-HP · geringe Zufallsschwankung':'🏰 Boss długoterminowy · codzienne zapisy · stałe HP etapów · mała losowość','👹 Für Gildenboss anmelden':'👹 Zapisz się na bossa gildii',
  'Die Anmeldung gilt nur für die heutige Bossrunde. Nach der Auswertung wird sie automatisch gelöscht.':'Zapis dotyczy tylko dzisiejszej rundy i zostaje automatycznie usunięty po rozliczeniu.',
  '🎬 Kampf ansehen':'🎬 Obejrzyj walkę','🎁 Gildenboss-Belohnung abholen':'🎁 Odbierz nagrodę bossa gildii','☣ Der Verseuchte Titan':'☣ Skażony Tytan','Kämpfer':'Wojownicy','Der Gildenboss wartet …':'Boss gildii czeka …',
  'Die gemeldeten Spieler greifen nacheinander an. Die verbleibenden Boss-HP bleiben zwischen den Spielern bestehen. Bei Sieg erhalten Teilnehmer Harz-Taler sowie levelabhängige EXP und Gold.':'Zapisani gracze atakują po kolei. Pozostałe HP bossa przechodzą między graczami. Po zwycięstwie uczestnicy dostają żetony żywicy oraz EXP i złoto zależne od poziomu.',
  'GILDE GEGEN GILDE':'GILDIA KONTRA GILDIA','Entscheide selbst, ob du beim nächsten Krieg angreifst, verteidigst oder beides machst.':'Wybierz, czy w następnej wojnie atakujesz, bronisz się czy robisz oba.',
  'Nicht angemeldet':'Nie zapisano','⚔️ Täglicher Gildenkrieg':'⚔️ Codzienna wojna gildii','Anmeldung bis 18:00 · Kampf ab 19:00 · Gildenboss um 20:00.':'Zapisy do 18:00 · walka od 19:00 · boss gildii o 20:00.',
  'DEINE GILDE':'TWOJA GILDIA','GEGNER':'PRZECIWNIK','Noch kein Gegner':'Brak przeciwnika','Melde Mitglieder für Angriff und Verteidigung an.':'Zapisz członków do ataku i obrony.','🎁 Teilnahmebelohnung abholen':'🎁 Odbierz nagrodę za udział',
  'Rangliste, Spielerprofile und die größten Grow-Legenden.':'Ranking, profile graczy i największe legendy Grow.','Rangliste & Spielerfortschritt':'Ranking i postęp graczy','Spieler suchen':'Szukaj graczy',
  'Freunde, Anfragen und Spielerprofile.':'Znajomi, prośby i profile graczy.','Deine Freunde in Grow Legends.':'Twoi znajomi w Grow Legends.','0 Freunde':'0 znajomych','GEMEINSAM WACHSEN · GEMEINSAM STÄRKER':'ROŚNIJMY RAZEM · RAZEM SILNIEJSI',
  'Private Nachrichten, PvP-Kämpfe und wichtige Ereignisse.':'Prywatne wiadomości, walki PvP i ważne wydarzenia.','Nachrichten und deine letzten PvP-Kämpfe an einem Ort.':'Wiadomości i ostatnie walki PvP w jednym miejscu.','✍️ Neue Nachricht':'✍️ Nowa wiadomość','Nachricht senden':'Wyślij wiadomość'
 },
 tr:{
  '🌿 GEMEINSAM STÄRKER':'🌿 BİRLİKTE DAHA GÜÇLÜ','Gründe eine Gilde, kämpft gemeinsam gegen den täglichen Gildenboss und tretet im Gildenkrieg gegen andere Gilden an.':'Bir lonca kur, günlük lonca bossuna birlikte savaş ve lonca savaşlarında diğer loncalarla rekabet et.',
  'Du bist noch in keiner Gilde':'Henüz bir loncada değilsin','In einer Gilde schaltest du dauerhafte EXP-/Gold-Boni, den täglichen Gildenboss und Gilde-gegen-Gilde frei.':'Lonca kalıcı EXP/Altın bonusları, günlük lonca bossu ve lonca savaşlarını açar.',
  'Gilde gründen':'Lonca kur','Online-Feature · benötigt einen eingeloggten Grow-Legends-Account.':'Çevrimiçi özellik · giriş yapılmış Grow Legends hesabı gerektirir.','ODER':'VEYA','🔎 Gilde suchen & beitreten':'🔎 Lonca bul ve katıl',
  'Suche nach Gildenname oder Kürzel und sende eine Beitrittsanfrage.':'Lonca adı veya etiketiyle ara ve katılma isteği gönder.','Anmeldung für Angriff und Verteidigung ist für alle sichtbar.':'Saldırı ve savunma kayıtları herkes tarafından görülebilir.',
  'Anführer und Offiziere können Bewerbungen annehmen oder ablehnen.':'Liderler ve subaylar başvuruları kabul veya reddedebilir.','Mitglieder verwalten, Rollen vergeben oder die Gilde verlassen.':'Üyeleri yönet, roller ata veya loncadan ayrıl.',
  '👥 Spieler einladen':'👥 Oyuncu davet et','Spieler nach Charaktername suchen und direkt in deine Gilde einladen. Einladungen gelten 48 Stunden.':'Oyuncuları karakter adına göre ara ve doğrudan loncana davet et. Davetler 48 saat geçerlidir.',
  'Suche einen Spieler nach seinem Charakternamen.':'Karakter adına göre oyuncu ara.','Keine offenen Einladungen.':'Açık davet yok.','Gilden-Grow-Aufträge werden geladen …':'Lonca yetiştirme görevleri yükleniyor …',
  'TÄGLICHER GILDENBOSS':'GÜNLÜK LONCA BOSSU','Der Verseuchte Titan':'Bozulmuş Titan','Jede besiegte Stufe schaltet dauerhaft einen stärkeren Titan frei. Deine Kampfkraft macht echten Fortschritt möglich.':'Yenilen her aşama kalıcı olarak daha güçlü bir Titan açar. Savaş gücün gerçek ilerleme sağlar.',
  '🏰 Langzeit-Boss · täglich neu anmelden · feste Stufen-HP · geringe Zufallsschwankung':'🏰 Uzun vadeli boss · günlük kayıt · sabit aşama HP · düşük rastgelelik','👹 Für Gildenboss anmelden':'👹 Lonca bossuna kaydol',
  'Die Anmeldung gilt nur für die heutige Bossrunde. Nach der Auswertung wird sie automatisch gelöscht.':'Kayıt yalnızca bugünkü boss turu için geçerlidir ve değerlendirmeden sonra otomatik silinir.',
  '🎬 Kampf ansehen':'🎬 Savaşı izle','🎁 Gildenboss-Belohnung abholen':'🎁 Lonca bossu ödülünü al','☣ Der Verseuchte Titan':'☣ Bozulmuş Titan','Kämpfer':'Savaşçılar','Der Gildenboss wartet …':'Lonca bossu bekliyor …',
  'Die gemeldeten Spieler greifen nacheinander an. Die verbleibenden Boss-HP bleiben zwischen den Spielern bestehen. Bei Sieg erhalten Teilnehmer Harz-Taler sowie levelabhängige EXP und Gold.':'Kayıtlı oyuncular sırayla saldırır. Kalan boss HP oyuncular arasında korunur. Zaferde katılımcılar Reçine Jetonları ile seviyeye bağlı EXP ve Altın alır.',
  'GILDE GEGEN GILDE':'LONCA VS LONCA','Entscheide selbst, ob du beim nächsten Krieg angreifst, verteidigst oder beides machst.':'Sonraki savaşta saldırmayı, savunmayı veya ikisini birden yapmayı seç.',
  'Nicht angemeldet':'Kayıtlı değil','⚔️ Täglicher Gildenkrieg':'⚔️ Günlük lonca savaşı','Anmeldung bis 18:00 · Kampf ab 19:00 · Gildenboss um 20:00.':'Kayıt 18:00’e kadar · savaş 19:00’dan itibaren · lonca bossu 20:00’de.',
  'DEINE GILDE':'LONCAN','GEGNER':'RAKİP','Noch kein Gegner':'Henüz rakip yok','Melde Mitglieder für Angriff und Verteidigung an.':'Üyeleri saldırı ve savunma için kaydet.','🎁 Teilnahmebelohnung abholen':'🎁 Katılım ödülünü al',
  'Rangliste, Spielerprofile und die größten Grow-Legenden.':'Sıralama, oyuncu profilleri ve en büyük Grow efsaneleri.','Rangliste & Spielerfortschritt':'Sıralama ve oyuncu ilerlemesi','Spieler suchen':'Oyuncu ara',
  'Freunde, Anfragen und Spielerprofile.':'Arkadaşlar, istekler ve oyuncu profilleri.','Deine Freunde in Grow Legends.':'Grow Legends arkadaşların.','0 Freunde':'0 arkadaş','GEMEINSAM WACHSEN · GEMEINSAM STÄRKER':'BİRLİKTE BÜYÜ · BİRLİKTE DAHA GÜÇLÜ',
  'Private Nachrichten, PvP-Kämpfe und wichtige Ereignisse.':'Özel mesajlar, PvP savaşları ve önemli olaylar.','Nachrichten und deine letzten PvP-Kämpfe an einem Ort.':'Mesajlar ve son PvP savaşların tek yerde.','✍️ Neue Nachricht':'✍️ Yeni mesaj','Nachricht senden':'Mesaj gönder'
 }
};
for(const lang of Object.keys(STATIC_UI_B))Object.assign(M[lang]||(M[lang]={}),STATIC_UI_B[lang]);

const STATIC_UI_C={
 en:{
  'Harz-Automat ist geöffnet. Tütchen & Werbe-Belohnungen folgen später.':'The Resin Machine is open. Pouches & ad rewards will follow later.',
  'Dealer bereitet dein Tütchen vor …':'Dealer is preparing your pouch …','Fortschritt und mögliche Belohnungen werden vom Server geladen.':'Progress and possible rewards are loaded from the server.',
  'Events, Update-News und Live-Inhalte verwalten.':'Manage events, update news and live content.','PRÜFUNG':'CHECK','Kein Admin-Zugriff.':'No admin access.',
  'Aktivieren, deaktivieren und Zeiträume festlegen.':'Enable, disable and set time ranges.','Event speichern':'Save event','Neuigkeiten auf der Welt-Startseite veröffentlichen.':'Publish news on the world home screen.','News veröffentlichen':'Publish news',
  '🟢 PREMIUM-WÄHRUNG':'🟢 PREMIUM CURRENCY','Größere Pakete enthalten einen besseren Preis pro Harz-Taler.':'Larger packages offer a better price per Resin Token.',
  'Käufe werden erst nach bestätigter Google-Play-Zahlung und serverseitiger Prüfung gutgeschrieben.':'Purchases are credited only after confirmed Google Play payment and server verification.',
  'Account wird geprüft …':'Checking account …','Kampf wird vorbereitet...':'Preparing battle...',
  '🗑️ Account endgültig löschen':'🗑️ Permanently delete account','Dein Grow-Legends-Account, Cloud-Spielstand, öffentliches Profil und zugehörige Online-Daten werden dauerhaft gelöscht.':'Your Grow Legends account, cloud save, public profile and related online data will be permanently deleted.',
  'Diese Aktion kann nicht rückgängig gemacht werden. Gib zum Bestätigen exakt':'This action cannot be undone. To confirm, enter exactly','ein.':'to confirm.',
  'Account endgültig löschen':'Permanently delete account','Animation überspringen':'Skip animation',
  'Bug, Idee oder sonstiger Hinweis':'Bug, idea or other feedback','Meldest du einen echten Bug oder einen hilfreichen Verbesserungsvorschlag, kannst du als Dankeschön':'If you report a real bug or a helpful improvement suggestion, you may receive',
  'erhalten. Spam wird nicht belohnt.':'as a thank-you. Spam is not rewarded.','Noch nicht geladen.':'Not loaded yet.','Nur für Mitglieder deiner Gilde':'Guild members only',
  'SPIELER-AKTIONEN':'PLAYER ACTIONS','🚩 Spieler melden':'🚩 Report player','🚫 Spieler blockieren':'🚫 Block player','Meldung an die Grow-Legends-Moderation senden.':'Send a report to Grow Legends moderation.',
  'Belästigung':'Harassment','Zusätzliche Information (optional)':'Additional information (optional)','🚫 Blockierte Spieler':'🚫 Blocked players',
  'Nachrichten blockierter Spieler werden im Gildenchat nicht angezeigt.':'Messages from blocked players are hidden in guild chat.',
  'Erstelle zuerst deinen Account. Danach geht es direkt weiter zu Charaktername und Klasse.':'Create your account first. Then continue directly to character name and class.',
  'Account erstellen & Charakter wählen':'Create account & choose character','Schon registriert? Zurück zur Anmeldung':'Already registered? Back to sign in',
  'Dein Charakter wird erst nach erfolgreicher Account-Anmeldung erstellt und anschließend accountgebunden gespeichert.':'Your character is created only after successful account sign-in and is then saved to that account.'
 },
 es:{
  'Harz-Automat ist geöffnet. Tütchen & Werbe-Belohnungen folgen später.':'La Máquina de Resina está abierta. Los paquetes y recompensas publicitarias llegarán después.',
  'Dealer bereitet dein Tütchen vor …':'El dealer prepara tu paquete …','Fortschritt und mögliche Belohnungen werden vom Server geladen.':'El progreso y las posibles recompensas se cargan desde el servidor.',
  'Events, Update-News und Live-Inhalte verwalten.':'Gestionar eventos, noticias de actualización y contenido en vivo.','PRÜFUNG':'COMPROBACIÓN','Kein Admin-Zugriff.':'Sin acceso de administrador.',
  'Aktivieren, deaktivieren und Zeiträume festlegen.':'Activar, desactivar y definir periodos.','Event speichern':'Guardar evento','Neuigkeiten auf der Welt-Startseite veröffentlichen.':'Publicar noticias en la página principal del mundo.','News veröffentlichen':'Publicar noticia',
  '🟢 PREMIUM-WÄHRUNG':'🟢 MONEDA PRÉMIUM','Größere Pakete enthalten einen besseren Preis pro Harz-Taler.':'Los paquetes grandes ofrecen mejor precio por ficha de resina.',
  'Käufe werden erst nach bestätigter Google-Play-Zahlung und serverseitiger Prüfung gutgeschrieben.':'Las compras se acreditan solo tras confirmar el pago de Google Play y verificarlo en el servidor.',
  'Account wird geprüft …':'Comprobando cuenta …','Kampf wird vorbereitet...':'Preparando combate...',
  '🗑️ Account endgültig löschen':'🗑️ Eliminar cuenta permanentemente','Dein Grow-Legends-Account, Cloud-Spielstand, öffentliches Profil und zugehörige Online-Daten werden dauerhaft gelöscht.':'Tu cuenta de Grow Legends, partida en la nube, perfil público y datos online asociados se eliminarán permanentemente.',
  'Diese Aktion kann nicht rückgängig gemacht werden. Gib zum Bestätigen exakt':'Esta acción no se puede deshacer. Para confirmar, escribe exactamente','ein.':'para confirmar.',
  'Account endgültig löschen':'Eliminar cuenta permanentemente','Animation überspringen':'Saltar animación',
  'Bug, Idee oder sonstiger Hinweis':'Bug, idea u otro comentario','Meldest du einen echten Bug oder einen hilfreichen Verbesserungsvorschlag, kannst du als Dankeschön':'Si informas de un bug real o una mejora útil, puedes recibir',
  'erhalten. Spam wird nicht belohnt.':'como agradecimiento. El spam no se recompensa.','Noch nicht geladen.':'Aún no cargado.','Nur für Mitglieder deiner Gilde':'Solo para miembros del gremio',
  'SPIELER-AKTIONEN':'ACCIONES DE JUGADOR','🚩 Spieler melden':'🚩 Reportar jugador','🚫 Spieler blockieren':'🚫 Bloquear jugador','Meldung an die Grow-Legends-Moderation senden.':'Enviar un reporte a la moderación de Grow Legends.',
  'Belästigung':'Acoso','Zusätzliche Information (optional)':'Información adicional (opcional)','🚫 Blockierte Spieler':'🚫 Jugadores bloqueados',
  'Nachrichten blockierter Spieler werden im Gildenchat nicht angezeigt.':'Los mensajes de jugadores bloqueados no se muestran en el chat del gremio.',
  'Erstelle zuerst deinen Account. Danach geht es direkt weiter zu Charaktername und Klasse.':'Primero crea tu cuenta. Después irás directamente al nombre y la clase del personaje.',
  'Account erstellen & Charakter wählen':'Crear cuenta y elegir personaje','Schon registriert? Zurück zur Anmeldung':'¿Ya estás registrado? Volver al inicio de sesión',
  'Dein Charakter wird erst nach erfolgreicher Account-Anmeldung erstellt und anschließend accountgebunden gespeichert.':'Tu personaje se crea solo tras iniciar sesión correctamente y luego queda guardado en esa cuenta.'
 },
 fr:{
  'Harz-Automat ist geöffnet. Tütchen & Werbe-Belohnungen folgen später.':'La Machine à résine est ouverte. Les sachets et récompenses publicitaires arriveront plus tard.',
  'Dealer bereitet dein Tütchen vor …':'Le dealer prépare ton sachet …','Fortschritt und mögliche Belohnungen werden vom Server geladen.':'La progression et les récompenses possibles sont chargées depuis le serveur.',
  'Events, Update-News und Live-Inhalte verwalten.':'Gérer les événements, actualités de mise à jour et contenus en direct.','PRÜFUNG':'VÉRIFICATION','Kein Admin-Zugriff.':'Aucun accès administrateur.',
  'Aktivieren, deaktivieren und Zeiträume festlegen.':'Activer, désactiver et définir les périodes.','Event speichern':'Enregistrer l’événement','Neuigkeiten auf der Welt-Startseite veröffentlichen.':'Publier des actualités sur l’accueil du monde.','News veröffentlichen':'Publier l’actualité',
  '🟢 PREMIUM-WÄHRUNG':'🟢 MONNAIE PREMIUM','Größere Pakete enthalten einen besseren Preis pro Harz-Taler.':'Les grands packs offrent un meilleur prix par jeton de résine.',
  'Käufe werden erst nach bestätigter Google-Play-Zahlung und serverseitiger Prüfung gutgeschrieben.':'Les achats ne sont crédités qu’après confirmation du paiement Google Play et vérification serveur.',
  'Account wird geprüft …':'Vérification du compte …','Kampf wird vorbereitet...':'Préparation du combat...',
  '🗑️ Account endgültig löschen':'🗑️ Supprimer définitivement le compte','Dein Grow-Legends-Account, Cloud-Spielstand, öffentliches Profil und zugehörige Online-Daten werden dauerhaft gelöscht.':'Ton compte Grow Legends, sauvegarde cloud, profil public et données en ligne associées seront supprimés définitivement.',
  'Diese Aktion kann nicht rückgängig gemacht werden. Gib zum Bestätigen exakt':'Cette action est irréversible. Pour confirmer, saisis exactement','ein.':'pour confirmer.',
  'Account endgültig löschen':'Supprimer définitivement le compte','Animation überspringen':'Passer l’animation',
  'Bug, Idee oder sonstiger Hinweis':'Bug, idée ou autre remarque','Meldest du einen echten Bug oder einen hilfreichen Verbesserungsvorschlag, kannst du als Dankeschön':'Si tu signales un vrai bug ou une amélioration utile, tu peux recevoir',
  'erhalten. Spam wird nicht belohnt.':'en remerciement. Le spam n’est pas récompensé.','Noch nicht geladen.':'Pas encore chargé.','Nur für Mitglieder deiner Gilde':'Réservé aux membres de ta guilde',
  'SPIELER-AKTIONEN':'ACTIONS JOUEUR','🚩 Spieler melden':'🚩 Signaler le joueur','🚫 Spieler blockieren':'🚫 Bloquer le joueur','Meldung an die Grow-Legends-Moderation senden.':'Envoyer un signalement à la modération Grow Legends.',
  'Belästigung':'Harcèlement','Zusätzliche Information (optional)':'Informations supplémentaires (facultatif)','🚫 Blockierte Spieler':'🚫 Joueurs bloqués',
  'Nachrichten blockierter Spieler werden im Gildenchat nicht angezeigt.':'Les messages des joueurs bloqués ne sont pas affichés dans le chat de guilde.',
  'Erstelle zuerst deinen Account. Danach geht es direkt weiter zu Charaktername und Klasse.':'Crée d’abord ton compte. Ensuite, tu passes directement au nom et à la classe du personnage.',
  'Account erstellen & Charakter wählen':'Créer le compte et choisir le personnage','Schon registriert? Zurück zur Anmeldung':'Déjà inscrit ? Retour à la connexion',
  'Dein Charakter wird erst nach erfolgreicher Account-Anmeldung erstellt und anschließend accountgebunden gespeichert.':'Ton personnage n’est créé qu’après une connexion réussie puis est sauvegardé sur ce compte.'
 },
 pl:{
  'Harz-Automat ist geöffnet. Tütchen & Werbe-Belohnungen folgen später.':'Automat żywicy jest otwarty. Saszetki i nagrody reklamowe pojawią się później.',
  'Dealer bereitet dein Tütchen vor …':'Dealer przygotowuje twoją saszetkę …','Fortschritt und mögliche Belohnungen werden vom Server geladen.':'Postęp i możliwe nagrody są ładowane z serwera.',
  'Events, Update-News und Live-Inhalte verwalten.':'Zarządzaj wydarzeniami, aktualnościami i treścią na żywo.','PRÜFUNG':'KONTROLA','Kein Admin-Zugriff.':'Brak dostępu administratora.',
  'Aktivieren, deaktivieren und Zeiträume festlegen.':'Włączaj, wyłączaj i ustawiaj okresy.','Event speichern':'Zapisz wydarzenie','Neuigkeiten auf der Welt-Startseite veröffentlichen.':'Publikuj wiadomości na stronie głównej świata.','News veröffentlichen':'Opublikuj wiadomość',
  '🟢 PREMIUM-WÄHRUNG':'🟢 WALUTA PREMIUM','Größere Pakete enthalten einen besseren Preis pro Harz-Taler.':'Większe pakiety mają lepszą cenę za żeton żywicy.',
  'Käufe werden erst nach bestätigter Google-Play-Zahlung und serverseitiger Prüfung gutgeschrieben.':'Zakupy są przyznawane dopiero po potwierdzeniu płatności Google Play i weryfikacji serwera.',
  'Account wird geprüft …':'Sprawdzanie konta …','Kampf wird vorbereitet...':'Przygotowanie walki...',
  '🗑️ Account endgültig löschen':'🗑️ Usuń konto na stałe','Dein Grow-Legends-Account, Cloud-Spielstand, öffentliches Profil und zugehörige Online-Daten werden dauerhaft gelöscht.':'Twoje konto Grow Legends, zapis w chmurze, profil publiczny i powiązane dane online zostaną trwale usunięte.',
  'Diese Aktion kann nicht rückgängig gemacht werden. Gib zum Bestätigen exakt':'Tej operacji nie można cofnąć. Aby potwierdzić, wpisz dokładnie','ein.':'aby potwierdzić.',
  'Account endgültig löschen':'Usuń konto na stałe','Animation überspringen':'Pomiń animację',
  'Bug, Idee oder sonstiger Hinweis':'Błąd, pomysł lub inna uwaga','Meldest du einen echten Bug oder einen hilfreichen Verbesserungsvorschlag, kannst du als Dankeschön':'Jeśli zgłosisz prawdziwy błąd lub pomocną sugestię, możesz otrzymać',
  'erhalten. Spam wird nicht belohnt.':'w podziękowaniu. Spam nie jest nagradzany.','Noch nicht geladen.':'Jeszcze nie załadowano.','Nur für Mitglieder deiner Gilde':'Tylko dla członków gildii',
  'SPIELER-AKTIONEN':'AKCJE GRACZA','🚩 Spieler melden':'🚩 Zgłoś gracza','🚫 Spieler blockieren':'🚫 Zablokuj gracza','Meldung an die Grow-Legends-Moderation senden.':'Wyślij zgłoszenie do moderacji Grow Legends.',
  'Belästigung':'Nękanie','Zusätzliche Information (optional)':'Dodatkowe informacje (opcjonalnie)','🚫 Blockierte Spieler':'🚫 Zablokowani gracze',
  'Nachrichten blockierter Spieler werden im Gildenchat nicht angezeigt.':'Wiadomości zablokowanych graczy nie są wyświetlane na czacie gildii.',
  'Erstelle zuerst deinen Account. Danach geht es direkt weiter zu Charaktername und Klasse.':'Najpierw utwórz konto. Potem przejdziesz bezpośrednio do nazwy i klasy postaci.',
  'Account erstellen & Charakter wählen':'Utwórz konto i wybierz postać','Schon registriert? Zurück zur Anmeldung':'Masz już konto? Wróć do logowania',
  'Dein Charakter wird erst nach erfolgreicher Account-Anmeldung erstellt und anschließend accountgebunden gespeichert.':'Postać zostanie utworzona dopiero po poprawnym zalogowaniu i będzie zapisana na tym koncie.'
 },
 tr:{
  'Harz-Automat ist geöffnet. Tütchen & Werbe-Belohnungen folgen später.':'Reçine Makinesi açık. Paketler ve reklam ödülleri daha sonra gelecek.',
  'Dealer bereitet dein Tütchen vor …':'Satıcı paketini hazırlıyor …','Fortschritt und mögliche Belohnungen werden vom Server geladen.':'İlerleme ve olası ödüller sunucudan yükleniyor.',
  'Events, Update-News und Live-Inhalte verwalten.':'Etkinlikleri, güncelleme haberlerini ve canlı içeriği yönet.','PRÜFUNG':'KONTROL','Kein Admin-Zugriff.':'Yönetici erişimi yok.',
  'Aktivieren, deaktivieren und Zeiträume festlegen.':'Etkinleştir, devre dışı bırak ve zaman aralıklarını belirle.','Event speichern':'Etkinliği kaydet','Neuigkeiten auf der Welt-Startseite veröffentlichen.':'Dünya ana sayfasında haber yayınla.','News veröffentlichen':'Haberi yayınla',
  '🟢 PREMIUM-WÄHRUNG':'🟢 PREMIUM PARA BİRİMİ','Größere Pakete enthalten einen besseren Preis pro Harz-Taler.':'Daha büyük paketler Reçine Jetonu başına daha iyi fiyat sunar.',
  'Käufe werden erst nach bestätigter Google-Play-Zahlung und serverseitiger Prüfung gutgeschrieben.':'Satın alımlar yalnızca Google Play ödemesi onaylandıktan ve sunucuda doğrulandıktan sonra hesaba geçer.',
  'Account wird geprüft …':'Hesap kontrol ediliyor …','Kampf wird vorbereitet...':'Savaş hazırlanıyor...',
  '🗑️ Account endgültig löschen':'🗑️ Hesabı kalıcı olarak sil','Dein Grow-Legends-Account, Cloud-Spielstand, öffentliches Profil und zugehörige Online-Daten werden dauerhaft gelöscht.':'Grow Legends hesabın, bulut kaydın, herkese açık profilin ve ilişkili çevrimiçi verilerin kalıcı olarak silinecek.',
  'Diese Aktion kann nicht rückgängig gemacht werden. Gib zum Bestätigen exakt':'Bu işlem geri alınamaz. Onaylamak için tam olarak şunu yaz','ein.':'ve onayla.',
  'Account endgültig löschen':'Hesabı kalıcı olarak sil','Animation überspringen':'Animasyonu atla',
  'Bug, Idee oder sonstiger Hinweis':'Hata, fikir veya başka geri bildirim','Meldest du einen echten Bug oder einen hilfreichen Verbesserungsvorschlag, kannst du als Dankeschön':'Gerçek bir hata veya yararlı geliştirme önerisi bildirirsen teşekkür olarak',
  'erhalten. Spam wird nicht belohnt.':'alabilirsin. Spam ödüllendirilmez.','Noch nicht geladen.':'Henüz yüklenmedi.','Nur für Mitglieder deiner Gilde':'Yalnızca lonca üyeleri için',
  'SPIELER-AKTIONEN':'OYUNCU İŞLEMLERİ','🚩 Spieler melden':'🚩 Oyuncuyu bildir','🚫 Spieler blockieren':'🚫 Oyuncuyu engelle','Meldung an die Grow-Legends-Moderation senden.':'Grow Legends moderasyonuna rapor gönder.',
  'Belästigung':'Taciz','Zusätzliche Information (optional)':'Ek bilgi (isteğe bağlı)','🚫 Blockierte Spieler':'🚫 Engellenen oyuncular',
  'Nachrichten blockierter Spieler werden im Gildenchat nicht angezeigt.':'Engellenen oyuncuların mesajları lonca sohbetinde gösterilmez.',
  'Erstelle zuerst deinen Account. Danach geht es direkt weiter zu Charaktername und Klasse.':'Önce hesabını oluştur. Ardından doğrudan karakter adı ve sınıf seçimine geçersin.',
  'Account erstellen & Charakter wählen':'Hesap oluştur ve karakter seç','Schon registriert? Zurück zur Anmeldung':'Zaten kayıtlı mısın? Girişe dön',
  'Dein Charakter wird erst nach erfolgreicher Account-Anmeldung erstellt und anschließend accountgebunden gespeichert.':'Karakterin yalnızca başarılı girişten sonra oluşturulur ve hesaba bağlı olarak kaydedilir.'
 }
};
for(const lang of Object.keys(STATIC_UI_C))Object.assign(M[lang]||(M[lang]={}),STATIC_UI_C[lang]);

const RUNTIME_UI_A={
 en:{
  'Zusätzliche Beute':'Additional loot','Schlüsselstein':'Keystone','🎁 Deine Beute':'🎁 Your loot','Keine zusätzliche Beute bei dieser Quest.':'No additional loot for this quest.',
  'GEGNER BESIEGT':'ENEMY DEFEATED','🟠 Boss-Belohnung · garantiert 1 legendäres Klassenitem':'🟠 Boss reward · guaranteed 1 legendary class item',
  '❌ Nicht genug Gold':'❌ Not enough Gold','Du kannst diesen Gegenstand noch nicht kaufen.':'You cannot buy this item yet.',
  '⚔️ Waffenhändler neu gewürfelt':'⚔️ Weapon dealer rerolled','💎 Schmuckhändler neu gewürfelt':'💎 Jewelry dealer rerolled',
  '1 Harz-Taler verwendet. Waffen & Rüstung wurden ersetzt.':'1 Resin Token used. Weapons & Armor were replaced.',
  '1 Harz-Taler verwendet. Schmuck, Edelsteine und Rollen wurden ersetzt.':'1 Resin Token used. Jewelry, Gems and Scrolls were replaced.',
  '✨ Spezialeffekte werden separat bewertet und sind nicht in diesen Attributpunkten enthalten.':'✨ Special effects are evaluated separately and are not included in these attribute points.',
  '✨ Spezialeffekte wie Wuchtschlag/Krit sind nicht in den Attributpunkten eingerechnet.':'✨ Special effects such as Smash/Crit are not included in attribute points.',
  'Grüne Verdammnis':'Green Damnation','Kein mystisches Event aktiv':'No mystic event active','Der Weltboss ist derzeit versiegelt.':'The world boss is currently sealed.',
  'Weiterer Versuch heute: 10 Harz-Taler':'Another attempt today: 10 Resin Tokens','Erster Versuch heute: KOSTENLOS':'First attempt today: FREE',
  'Weltboss noch nicht bereit':'World boss not ready yet','Der Koloss fällt':'The Colossus Falls','Smaragd-Schlächter':'Emerald Slayer','Türkise Beute':'Turquoise Loot',
  'Besitze dein erstes mystisches Item.':'Own your first mystic item.','In Mystik gehüllt':'Shrouded in Mysticism','Besitze 6 mystische Gegenstände.':'Own 6 mystic items.',
  '☁️ Kein dauerhafter Account':'☁️ No permanent account','Nur in der Android-App verfügbar.':'Only available in the Android app.','Deine Werbe-Datenschutzeinstellungen wurden aktualisiert.':'Your ad privacy settings were updated.',
  'Konnte nicht geöffnet werden.':'Could not be opened.','Account-Löschung nicht möglich':'Account deletion unavailable','Kein angemeldeter Account gefunden.':'No signed-in account found.',
  'Wird gelöscht…':'Deleting…','Die sichere Account-Löschfunktion ist in Supabase noch nicht installiert.':'Secure account deletion is not yet installed in Supabase.',
  'Account gelöscht':'Account deleted','Account und Grow-Legends-Spielstand wurden dauerhaft entfernt.':'Account and Grow Legends save data were permanently removed.',
  'Account konnte nicht gelöscht werden':'Account could not be deleted'
 },
 es:{
  'Zusätzliche Beute':'Botín adicional','Schlüsselstein':'Piedra clave','🎁 Deine Beute':'🎁 Tu botín','Keine zusätzliche Beute bei dieser Quest.':'Sin botín adicional en esta misión.',
  'GEGNER BESIEGT':'ENEMIGO DERROTADO','🟠 Boss-Belohnung · garantiert 1 legendäres Klassenitem':'🟠 Recompensa de jefe · 1 objeto legendario de clase garantizado',
  '❌ Nicht genug Gold':'❌ Oro insuficiente','Du kannst diesen Gegenstand noch nicht kaufen.':'Aún no puedes comprar este objeto.',
  '⚔️ Waffenhändler neu gewürfelt':'⚔️ Comerciante de armas renovado','💎 Schmuckhändler neu gewürfelt':'💎 Comerciante de joyas renovado',
  '1 Harz-Taler verwendet. Waffen & Rüstung wurden ersetzt.':'1 ficha de resina usada. Armas y armaduras fueron reemplazadas.',
  '1 Harz-Taler verwendet. Schmuck, Edelsteine und Rollen wurden ersetzt.':'1 ficha de resina usada. Joyas, gemas y pergaminos fueron reemplazados.',
  '✨ Spezialeffekte werden separat bewertet und sind nicht in diesen Attributpunkten enthalten.':'✨ Los efectos especiales se valoran por separado y no están incluidos en estos puntos de atributo.',
  '✨ Spezialeffekte wie Wuchtschlag/Krit sind nicht in den Attributpunkten eingerechnet.':'✨ Efectos como Golpe fuerte/Crítico no están incluidos en los puntos de atributo.',
  'Grüne Verdammnis':'Condena Verde','Kein mystisches Event aktiv':'No hay evento místico activo','Der Weltboss ist derzeit versiegelt.':'El jefe mundial está sellado actualmente.',
  'Weiterer Versuch heute: 10 Harz-Taler':'Otro intento hoy: 10 fichas de resina','Erster Versuch heute: KOSTENLOS':'Primer intento hoy: GRATIS',
  'Weltboss noch nicht bereit':'El jefe mundial aún no está listo','Der Koloss fällt':'Cae el Coloso','Smaragd-Schlächter':'Matador Esmeralda','Türkise Beute':'Botín Turquesa',
  'Besitze dein erstes mystisches Item.':'Consigue tu primer objeto místico.','In Mystik gehüllt':'Envuelto en Misticismo','Besitze 6 mystische Gegenstände.':'Consigue 6 objetos místicos.',
  '☁️ Kein dauerhafter Account':'☁️ Sin cuenta permanente','Nur in der Android-App verfügbar.':'Solo disponible en la app Android.','Deine Werbe-Datenschutzeinstellungen wurden aktualisiert.':'Se actualizaron tus ajustes de privacidad publicitaria.',
  'Konnte nicht geöffnet werden.':'No se pudo abrir.','Account-Löschung nicht möglich':'No se puede eliminar la cuenta','Kein angemeldeter Account gefunden.':'No se encontró una cuenta iniciada.',
  'Wird gelöscht…':'Eliminando…','Die sichere Account-Löschfunktion ist in Supabase noch nicht installiert.':'La eliminación segura de cuenta aún no está instalada en Supabase.',
  'Account gelöscht':'Cuenta eliminada','Account und Grow-Legends-Spielstand wurden dauerhaft entfernt.':'La cuenta y la partida de Grow Legends se eliminaron permanentemente.',
  'Account konnte nicht gelöscht werden':'No se pudo eliminar la cuenta'
 },
 fr:{
  'Zusätzliche Beute':'Butin supplémentaire','Schlüsselstein':'Pierre-clé','🎁 Deine Beute':'🎁 Ton butin','Keine zusätzliche Beute bei dieser Quest.':'Aucun butin supplémentaire pour cette quête.',
  'GEGNER BESIEGT':'ENNEMI VAINCU','🟠 Boss-Belohnung · garantiert 1 legendäres Klassenitem':'🟠 Récompense de boss · 1 objet de classe légendaire garanti',
  '❌ Nicht genug Gold':'❌ Pas assez d’Or','Du kannst diesen Gegenstand noch nicht kaufen.':'Tu ne peux pas encore acheter cet objet.',
  '⚔️ Waffenhändler neu gewürfelt':'⚔️ Marchand d’armes renouvelé','💎 Schmuckhändler neu gewürfelt':'💎 Marchand de bijoux renouvelé',
  '1 Harz-Taler verwendet. Waffen & Rüstung wurden ersetzt.':'1 jeton de résine utilisé. Armes et armures ont été remplacées.',
  '1 Harz-Taler verwendet. Schmuck, Edelsteine und Rollen wurden ersetzt.':'1 jeton de résine utilisé. Bijoux, gemmes et parchemins ont été remplacés.',
  '✨ Spezialeffekte werden separat bewertet und sind nicht in diesen Attributpunkten enthalten.':'✨ Les effets spéciaux sont évalués séparément et ne sont pas inclus dans ces points d’attribut.',
  '✨ Spezialeffekte wie Wuchtschlag/Krit sind nicht in den Attributpunkten eingerechnet.':'✨ Les effets comme Frappe puissante/Critique ne sont pas inclus dans les points d’attribut.',
  'Grüne Verdammnis':'Damnation Verte','Kein mystisches Event aktiv':'Aucun événement mystique actif','Der Weltboss ist derzeit versiegelt.':'Le boss mondial est actuellement scellé.',
  'Weiterer Versuch heute: 10 Harz-Taler':'Nouvel essai aujourd’hui : 10 jetons de résine','Erster Versuch heute: KOSTENLOS':'Premier essai aujourd’hui : GRATUIT',
  'Weltboss noch nicht bereit':'Boss mondial pas encore prêt','Der Koloss fällt':'Le Colosse tombe','Smaragd-Schlächter':'Tueur d’Émeraude','Türkise Beute':'Butin Turquoise',
  'Besitze dein erstes mystisches Item.':'Possède ton premier objet mystique.','In Mystik gehüllt':'Enveloppé de Mystique','Besitze 6 mystische Gegenstände.':'Possède 6 objets mystiques.',
  '☁️ Kein dauerhafter Account':'☁️ Aucun compte permanent','Nur in der Android-App verfügbar.':'Disponible uniquement dans l’application Android.','Deine Werbe-Datenschutzeinstellungen wurden aktualisiert.':'Tes paramètres de confidentialité publicitaire ont été mis à jour.',
  'Konnte nicht geöffnet werden.':'Impossible d’ouvrir.','Account-Löschung nicht möglich':'Suppression du compte impossible','Kein angemeldeter Account gefunden.':'Aucun compte connecté trouvé.',
  'Wird gelöscht…':'Suppression…','Die sichere Account-Löschfunktion ist in Supabase noch nicht installiert.':'La suppression sécurisée du compte n’est pas encore installée dans Supabase.',
  'Account gelöscht':'Compte supprimé','Account und Grow-Legends-Spielstand wurden dauerhaft entfernt.':'Le compte et la sauvegarde Grow Legends ont été supprimés définitivement.',
  'Account konnte nicht gelöscht werden':'Impossible de supprimer le compte'
 },
 pl:{
  'Zusätzliche Beute':'Dodatkowy łup','Schlüsselstein':'Kamień klucza','🎁 Deine Beute':'🎁 Twój łup','Keine zusätzliche Beute bei dieser Quest.':'Brak dodatkowego łupu w tej misji.',
  'GEGNER BESIEGT':'PRZECIWNIK POKONANY','🟠 Boss-Belohnung · garantiert 1 legendäres Klassenitem':'🟠 Nagroda bossa · gwarantowany 1 legendarny przedmiot klasowy',
  '❌ Nicht genug Gold':'❌ Za mało złota','Du kannst diesen Gegenstand noch nicht kaufen.':'Nie możesz jeszcze kupić tego przedmiotu.',
  '⚔️ Waffenhändler neu gewürfelt':'⚔️ Odświeżono handlarza bronią','💎 Schmuckhändler neu gewürfelt':'💎 Odświeżono handlarza biżuterią',
  '1 Harz-Taler verwendet. Waffen & Rüstung wurden ersetzt.':'Użyto 1 żetonu żywicy. Broń i pancerze zostały wymienione.',
  '1 Harz-Taler verwendet. Schmuck, Edelsteine und Rollen wurden ersetzt.':'Użyto 1 żetonu żywicy. Biżuteria, klejnoty i zwoje zostały wymienione.',
  '✨ Spezialeffekte werden separat bewertet und sind nicht in diesen Attributpunkten enthalten.':'✨ Efekty specjalne są oceniane osobno i nie są wliczone do punktów atrybutów.',
  '✨ Spezialeffekte wie Wuchtschlag/Krit sind nicht in den Attributpunkten eingerechnet.':'✨ Efekty takie jak Mocne Uderzenie/Kryt nie są wliczone do punktów atrybutów.',
  'Grüne Verdammnis':'Zielone Potępienie','Kein mystisches Event aktiv':'Brak aktywnego wydarzenia mistycznego','Der Weltboss ist derzeit versiegelt.':'Boss świata jest obecnie zapieczętowany.',
  'Weiterer Versuch heute: 10 Harz-Taler':'Kolejna próba dziś: 10 żetonów żywicy','Erster Versuch heute: KOSTENLOS':'Pierwsza próba dziś: ZA DARMO',
  'Weltboss noch nicht bereit':'Boss świata nie jest jeszcze gotowy','Der Koloss fällt':'Koloss upada','Smaragd-Schlächter':'Szmaragdowy Zabójca','Türkise Beute':'Turkusowy Łup',
  'Besitze dein erstes mystisches Item.':'Zdobądź pierwszy mistyczny przedmiot.','In Mystik gehüllt':'Otulony Mistyką','Besitze 6 mystische Gegenstände.':'Posiadaj 6 mistycznych przedmiotów.',
  '☁️ Kein dauerhafter Account':'☁️ Brak stałego konta','Nur in der Android-App verfügbar.':'Dostępne tylko w aplikacji Android.','Deine Werbe-Datenschutzeinstellungen wurden aktualisiert.':'Ustawienia prywatności reklam zostały zaktualizowane.',
  'Konnte nicht geöffnet werden.':'Nie udało się otworzyć.','Account-Löschung nicht möglich':'Nie można usunąć konta','Kein angemeldeter Account gefunden.':'Nie znaleziono zalogowanego konta.',
  'Wird gelöscht…':'Usuwanie…','Die sichere Account-Löschfunktion ist in Supabase noch nicht installiert.':'Bezpieczne usuwanie konta nie jest jeszcze zainstalowane w Supabase.',
  'Account gelöscht':'Konto usunięte','Account und Grow-Legends-Spielstand wurden dauerhaft entfernt.':'Konto i zapis Grow Legends zostały trwale usunięte.',
  'Account konnte nicht gelöscht werden':'Nie udało się usunąć konta'
 },
 tr:{
  'Zusätzliche Beute':'Ek ganimet','Schlüsselstein':'Anahtar Taşı','🎁 Deine Beute':'🎁 Ganimetin','Keine zusätzliche Beute bei dieser Quest.':'Bu görevde ek ganimet yok.',
  'GEGNER BESIEGT':'DÜŞMAN YENİLDİ','🟠 Boss-Belohnung · garantiert 1 legendäres Klassenitem':'🟠 Boss ödülü · garantili 1 efsanevi sınıf eşyası',
  '❌ Nicht genug Gold':'❌ Yeterli Altın yok','Du kannst diesen Gegenstand noch nicht kaufen.':'Bu eşyayı henüz satın alamazsın.',
  '⚔️ Waffenhändler neu gewürfelt':'⚔️ Silah satıcısı yenilendi','💎 Schmuckhändler neu gewürfelt':'💎 Takı satıcısı yenilendi',
  '1 Harz-Taler verwendet. Waffen & Rüstung wurden ersetzt.':'1 Reçine Jetonu kullanıldı. Silahlar ve zırhlar yenilendi.',
  '1 Harz-Taler verwendet. Schmuck, Edelsteine und Rollen wurden ersetzt.':'1 Reçine Jetonu kullanıldı. Takılar, taşlar ve parşömenler yenilendi.',
  '✨ Spezialeffekte werden separat bewertet und sind nicht in diesen Attributpunkten enthalten.':'✨ Özel etkiler ayrı değerlendirilir ve bu özellik puanlarına dahil değildir.',
  '✨ Spezialeffekte wie Wuchtschlag/Krit sind nicht in den Attributpunkten eingerechnet.':'✨ Güçlü Vuruş/Kritik gibi etkiler özellik puanlarına dahil değildir.',
  'Grüne Verdammnis':'Yeşil Lanet','Kein mystisches Event aktiv':'Aktif mistik etkinlik yok','Der Weltboss ist derzeit versiegelt.':'Dünya bossu şu anda mühürlü.',
  'Weiterer Versuch heute: 10 Harz-Taler':'Bugün ek deneme: 10 Reçine Jetonu','Erster Versuch heute: KOSTENLOS':'Bugünkü ilk deneme: ÜCRETSİZ',
  'Weltboss noch nicht bereit':'Dünya bossu henüz hazır değil','Der Koloss fällt':'Dev Düşüyor','Smaragd-Schlächter':'Zümrüt Katili','Türkise Beute':'Turkuaz Ganimet',
  'Besitze dein erstes mystisches Item.':'İlk mistik eşyanı edin.','In Mystik gehüllt':'Mistikle Sarılı','Besitze 6 mystische Gegenstände.':'6 mistik eşya edin.',
  '☁️ Kein dauerhafter Account':'☁️ Kalıcı hesap yok','Nur in der Android-App verfügbar.':'Yalnızca Android uygulamasında kullanılabilir.','Deine Werbe-Datenschutzeinstellungen wurden aktualisiert.':'Reklam gizlilik ayarların güncellendi.',
  'Konnte nicht geöffnet werden.':'Açılamadı.','Account-Löschung nicht möglich':'Hesap silinemiyor','Kein angemeldeter Account gefunden.':'Giriş yapılmış hesap bulunamadı.',
  'Wird gelöscht…':'Siliniyor…','Die sichere Account-Löschfunktion ist in Supabase noch nicht installiert.':'Güvenli hesap silme özelliği Supabase üzerinde henüz kurulu değil.',
  'Account gelöscht':'Hesap silindi','Account und Grow-Legends-Spielstand wurden dauerhaft entfernt.':'Hesap ve Grow Legends kayıtları kalıcı olarak silindi.',
  'Account konnte nicht gelöscht werden':'Hesap silinemedi'
 }
};
for(const lang of Object.keys(RUNTIME_UI_A))Object.assign(M[lang]||(M[lang]={}),RUNTIME_UI_A[lang]);

const RUNTIME_UI_B={
 en:{
  'Pflegefenster erscheinen während des Wachstums. Nichts verdorrt, wenn du eines verpasst.':'Care windows appear during growth. Nothing withers if you miss one.',
  'Keine Pflegeaktion verfügbar':'No care action available','Die Pflanze ist bereits erntereif.':'The plant is already ready to harvest.','Später wieder nachsehen.':'Check again later.',
  'Pflege bereits erledigt':'Care already completed','Die angezeigte Aktion war nicht mehr aktuell. Der Growroom wurde neu geladen.':'The displayed action was no longer current. The Growroom was reloaded.',
  'Der Growroom zeigt dir an, sobald eine Ernte bereit ist.':'The Growroom will notify you when a harvest is ready.',
  'Gilden-Gewächshaus':'Guild greenhouse','Heute hast du bereits eine Blüte gespendet. Morgen kannst du erneut Gilden-EP beitragen.':'You already donated a bud today. You can contribute Guild XP again tomorrow.',
  'Keine aktive Gilde':'No active guild','Deine Gildenmitgliedschaft konnte nicht geladen werden. Bitte Verbindung prüfen.':'Your guild membership could not be loaded. Check your connection.',
  'Gilde nicht verbunden':'Guild not connected','Für echte Gilden-EP ist eine Online-Verbindung nötig.':'An online connection is required for real Guild XP.',
  'Gilden-EP nicht vergeben':'Guild XP not granted','Tageslimit erreicht oder keine aktive Gildenmitgliedschaft. Deine Blüte bleibt erhalten.':'Daily limit reached or no active guild membership. Your bud is kept.',
  '🏰 Gilden-Gewächshaus':'🏰 Guild greenhouse','Gilden-EP konnten nicht gebucht werden.':'Guild XP could not be credited.','🏰 Wochenbeitrag erfüllt':'🏰 Weekly contribution complete',
  '+2 Harz-Taler · +25 Samenfragmente · +1 seltener Samen':'+2 Resin Tokens · +25 Seed Fragments · +1 rare seed',
  'Deine Pflanzen wachsen weiter, auch wenn du offline bist.':'Your plants keep growing while you are offline.','Grüner Daumen':'Green Thumb','Ernte deine erste Pflanze im Growroom 2.0.':'Harvest your first plant in Growroom 2.0.',
  'Großzüchter':'Master Grower','Ernte 25 Pflanzen.':'Harvest 25 plants.','Meisterzüchter':'Grand Grower','Was wächst denn da?':'What is growing there?','Entdecke deine erste Mutation.':'Discover your first mutation.','Entdecke eine prismatische Mutation.':'Discover a prismatic mutation.',
  'Spezial-Samen konnte nicht ausgeführt werden.':'Special seed could not be used.',
  'Postfach konnte nicht geladen werden. Falls das Nachrichtensystem neu eingerichtet wird, muss zuerst die V4.02-SQL in Supabase ausgeführt werden.':'Mailbox could not be loaded. If the message system is being set up again, run the V4.02 SQL in Supabase first.',
  'Empfänger fehlt':'Recipient missing','Nachricht leer':'Message is empty','Nachricht zu lang':'Message is too long','Nachricht nicht gesendet':'Message not sent',
  'Der Text enthält einen nicht zulässigen Ausdruck.':'The text contains a disallowed expression.','Nachricht konnte nicht gesendet werden':'Message could not be sent','Nachricht konnte nicht gelöscht werden':'Message could not be deleted',
  'Google Play Billing ist in dieser App-Version noch nicht verfügbar.':'Google Play Billing is not available in this app version yet.',
  'Prismatisch geschützt':'Prismatic protected','Mystisch geschützt':'Mystic protected','Klassenset geschützt':'Class set protected','Amboss der Harzschmiede':'Resin Forge anvil',
  '✓ ALLE AUSWÄHLEN':'✓ SELECT ALL','ITEMS AUSWÄHLEN':'SELECT ITEMS','In der Harzschmiede zerlegen?':'Dismantle in the Resin Forge?','🛒 Händlerware zerlegt':'🛒 Shop item dismantled','Verkaufen · 0 Gold':'Sell · 0 Gold',
  '🌈 PRISMATISCH · Verkauf 0 Gold · nicht zerlegbar':'🌈 PRISMATIC · Sell 0 Gold · cannot be dismantled',
  '2× Gold-Event Belohnung':'2× Gold Event reward','+20 Dampf kaufen · 1 Harz':'Buy +20 Steam · 1 Resin',
  'Keine Ausrüstung sichtbar.':'No equipment visible.','Rangliste wird geladen...':'Loading ranking...','Rangliste konnte nicht geladen werden.':'Ranking could not be loaded.'
 },
 es:{
  'Pflegefenster erscheinen während des Wachstums. Nichts verdorrt, wenn du eines verpasst.':'Las ventanas de cuidado aparecen durante el crecimiento. Nada se marchita si te pierdes una.',
  'Keine Pflegeaktion verfügbar':'No hay acción de cuidado disponible','Die Pflanze ist bereits erntereif.':'La planta ya está lista para cosechar.','Später wieder nachsehen.':'Vuelve a comprobar más tarde.',
  'Pflege bereits erledigt':'Cuidado ya completado','Die angezeigte Aktion war nicht mehr aktuell. Der Growroom wurde neu geladen.':'La acción mostrada ya no era válida. El Growroom se recargó.',
  'Der Growroom zeigt dir an, sobald eine Ernte bereit ist.':'El Growroom te avisará cuando una cosecha esté lista.',
  'Gilden-Gewächshaus':'Invernadero del gremio','Heute hast du bereits eine Blüte gespendet. Morgen kannst du erneut Gilden-EP beitragen.':'Ya donaste una flor hoy. Mañana podrás aportar EXP de gremio de nuevo.',
  'Keine aktive Gilde':'Sin gremio activo','Deine Gildenmitgliedschaft konnte nicht geladen werden. Bitte Verbindung prüfen.':'No se pudo cargar tu membresía del gremio. Comprueba la conexión.',
  'Gilde nicht verbunden':'Gremio no conectado','Für echte Gilden-EP ist eine Online-Verbindung nötig.':'Se necesita conexión online para EXP real de gremio.',
  'Gilden-EP nicht vergeben':'EXP de gremio no otorgada','Tageslimit erreicht oder keine aktive Gildenmitgliedschaft. Deine Blüte bleibt erhalten.':'Límite diario alcanzado o sin membresía activa. Conservas tu flor.',
  '🏰 Gilden-Gewächshaus':'🏰 Invernadero del gremio','Gilden-EP konnten nicht gebucht werden.':'No se pudo acreditar la EXP de gremio.','🏰 Wochenbeitrag erfüllt':'🏰 Contribución semanal completada',
  '+2 Harz-Taler · +25 Samenfragmente · +1 seltener Samen':'+2 fichas de resina · +25 fragmentos · +1 semilla rara',
  'Deine Pflanzen wachsen weiter, auch wenn du offline bist.':'Tus plantas siguen creciendo aunque estés desconectado.','Grüner Daumen':'Pulgar Verde','Ernte deine erste Pflanze im Growroom 2.0.':'Cosecha tu primera planta en Growroom 2.0.',
  'Großzüchter':'Gran Cultivador','Ernte 25 Pflanzen.':'Cosecha 25 plantas.','Meisterzüchter':'Maestro Cultivador','Was wächst denn da?':'¿Qué está creciendo ahí?','Entdecke deine erste Mutation.':'Descubre tu primera mutación.','Entdecke eine prismatische Mutation.':'Descubre una mutación prismática.',
  'Spezial-Samen konnte nicht ausgeführt werden.':'No se pudo usar la semilla especial.',
  'Postfach konnte nicht geladen werden. Falls das Nachrichtensystem neu eingerichtet wird, muss zuerst die V4.02-SQL in Supabase ausgeführt werden.':'No se pudo cargar el buzón. Si se reinstala el sistema, ejecuta primero el SQL V4.02 en Supabase.',
  'Empfänger fehlt':'Falta destinatario','Nachricht leer':'Mensaje vacío','Nachricht zu lang':'Mensaje demasiado largo','Nachricht nicht gesendet':'Mensaje no enviado',
  'Der Text enthält einen nicht zulässigen Ausdruck.':'El texto contiene una expresión no permitida.','Nachricht konnte nicht gesendet werden':'No se pudo enviar el mensaje','Nachricht konnte nicht gelöscht werden':'No se pudo eliminar el mensaje',
  'Google Play Billing ist in dieser App-Version noch nicht verfügbar.':'Google Play Billing aún no está disponible en esta versión.',
  'Prismatisch geschützt':'Prismático protegido','Mystisch geschützt':'Místico protegido','Klassenset geschützt':'Set de clase protegido','Amboss der Harzschmiede':'Yunque de la Forja de Resina',
  '✓ ALLE AUSWÄHLEN':'✓ SELECCIONAR TODO','ITEMS AUSWÄHLEN':'SELECCIONAR OBJETOS','In der Harzschmiede zerlegen?':'¿Desmontar en la Forja de Resina?','🛒 Händlerware zerlegt':'🛒 Objeto de tienda desmontado','Verkaufen · 0 Gold':'Vender · 0 Oro',
  '🌈 PRISMATISCH · Verkauf 0 Gold · nicht zerlegbar':'🌈 PRISMÁTICO · Venta 0 Oro · no desmontable',
  '2× Gold-Event Belohnung':'Recompensa de evento 2× Oro','+20 Dampf kaufen · 1 Harz':'Comprar +20 Vapor · 1 Resina',
  'Keine Ausrüstung sichtbar.':'No hay equipo visible.','Rangliste wird geladen...':'Cargando clasificación...','Rangliste konnte nicht geladen werden.':'No se pudo cargar la clasificación.'
 },
 fr:{
  'Pflegefenster erscheinen während des Wachstums. Nichts verdorrt, wenn du eines verpasst.':'Les fenêtres de soin apparaissent pendant la croissance. Rien ne se fane si tu en manques une.',
  'Keine Pflegeaktion verfügbar':'Aucune action de soin disponible','Die Pflanze ist bereits erntereif.':'La plante est déjà prête à récolter.','Später wieder nachsehen.':'Reviens plus tard.',
  'Pflege bereits erledigt':'Soin déjà effectué','Die angezeigte Aktion war nicht mehr aktuell. Der Growroom wurde neu geladen.':'L’action affichée n’était plus à jour. Le Growroom a été rechargé.',
  'Der Growroom zeigt dir an, sobald eine Ernte bereit ist.':'Le Growroom t’indiquera quand une récolte sera prête.',
  'Gilden-Gewächshaus':'Serre de guilde','Heute hast du bereits eine Blüte gespendet. Morgen kannst du erneut Gilden-EP beitragen.':'Tu as déjà donné une fleur aujourd’hui. Tu pourras contribuer à nouveau demain.',
  'Keine aktive Gilde':'Aucune guilde active','Deine Gildenmitgliedschaft konnte nicht geladen werden. Bitte Verbindung prüfen.':'Impossible de charger ton appartenance à la guilde. Vérifie la connexion.',
  'Gilde nicht verbunden':'Guilde non connectée','Für echte Gilden-EP ist eine Online-Verbindung nötig.':'Une connexion en ligne est requise pour l’EXP de guilde réelle.',
  'Gilden-EP nicht vergeben':'EXP de guilde non accordée','Tageslimit erreicht oder keine aktive Gildenmitgliedschaft. Deine Blüte bleibt erhalten.':'Limite quotidienne atteinte ou aucune guilde active. Ta fleur est conservée.',
  '🏰 Gilden-Gewächshaus':'🏰 Serre de guilde','Gilden-EP konnten nicht gebucht werden.':'Impossible de créditer l’EXP de guilde.','🏰 Wochenbeitrag erfüllt':'🏰 Contribution hebdomadaire terminée',
  '+2 Harz-Taler · +25 Samenfragmente · +1 seltener Samen':'+2 jetons de résine · +25 fragments · +1 graine rare',
  'Deine Pflanzen wachsen weiter, auch wenn du offline bist.':'Tes plantes continuent de pousser hors ligne.','Grüner Daumen':'Main Verte','Ernte deine erste Pflanze im Growroom 2.0.':'Récolte ta première plante dans Growroom 2.0.',
  'Großzüchter':'Grand Cultivateur','Ernte 25 Pflanzen.':'Récolte 25 plantes.','Meisterzüchter':'Maître Cultivateur','Was wächst denn da?':'Qu’est-ce qui pousse là ?','Entdecke deine erste Mutation.':'Découvre ta première mutation.','Entdecke eine prismatische Mutation.':'Découvre une mutation prismatique.',
  'Spezial-Samen konnte nicht ausgeführt werden.':'La graine spéciale n’a pas pu être utilisée.',
  'Postfach konnte nicht geladen werden. Falls das Nachrichtensystem neu eingerichtet wird, muss zuerst die V4.02-SQL in Supabase ausgeführt werden.':'Impossible de charger la boîte mail. Si le système est réinstallé, exécute d’abord le SQL V4.02 dans Supabase.',
  'Empfänger fehlt':'Destinataire manquant','Nachricht leer':'Message vide','Nachricht zu lang':'Message trop long','Nachricht nicht gesendet':'Message non envoyé',
  'Der Text enthält einen nicht zulässigen Ausdruck.':'Le texte contient une expression interdite.','Nachricht konnte nicht gesendet werden':'Impossible d’envoyer le message','Nachricht konnte nicht gelöscht werden':'Impossible de supprimer le message',
  'Google Play Billing ist in dieser App-Version noch nicht verfügbar.':'Google Play Billing n’est pas encore disponible dans cette version.',
  'Prismatisch geschützt':'Prismatique protégé','Mystisch geschützt':'Mystique protégé','Klassenset geschützt':'Set de classe protégé','Amboss der Harzschmiede':'Enclume de la Forge de Résine',
  '✓ ALLE AUSWÄHLEN':'✓ TOUT SÉLECTIONNER','ITEMS AUSWÄHLEN':'SÉLECTIONNER LES OBJETS','In der Harzschmiede zerlegen?':'Démanteler dans la Forge de Résine ?','🛒 Händlerware zerlegt':'🛒 Objet de boutique démantelé','Verkaufen · 0 Gold':'Vendre · 0 Or',
  '🌈 PRISMATISCH · Verkauf 0 Gold · nicht zerlegbar':'🌈 PRISMATIQUE · Vente 0 Or · non démontable',
  '2× Gold-Event Belohnung':'Récompense d’événement 2× Or','+20 Dampf kaufen · 1 Harz':'Acheter +20 Vapeur · 1 Résine',
  'Keine Ausrüstung sichtbar.':'Aucun équipement visible.','Rangliste wird geladen...':'Chargement du classement...','Rangliste konnte nicht geladen werden.':'Impossible de charger le classement.'
 },
 pl:{
  'Pflegefenster erscheinen während des Wachstums. Nichts verdorrt, wenn du eines verpasst.':'Okna pielęgnacji pojawiają się podczas wzrostu. Nic nie uschnie, jeśli jedno pominiesz.',
  'Keine Pflegeaktion verfügbar':'Brak dostępnej pielęgnacji','Die Pflanze ist bereits erntereif.':'Roślina jest już gotowa do zbioru.','Später wieder nachsehen.':'Sprawdź później.',
  'Pflege bereits erledigt':'Pielęgnacja już wykonana','Die angezeigte Aktion war nicht mehr aktuell. Der Growroom wurde neu geladen.':'Wyświetlana akcja była nieaktualna. Growroom został przeładowany.',
  'Der Growroom zeigt dir an, sobald eine Ernte bereit ist.':'Growroom poinformuje cię, gdy zbiór będzie gotowy.',
  'Gilden-Gewächshaus':'Szklarnia gildii','Heute hast du bereits eine Blüte gespendet. Morgen kannst du erneut Gilden-EP beitragen.':'Dziś przekazałeś już kwiat. Jutro znów możesz zdobyć EXP gildii.',
  'Keine aktive Gilde':'Brak aktywnej gildii','Deine Gildenmitgliedschaft konnte nicht geladen werden. Bitte Verbindung prüfen.':'Nie udało się załadować członkostwa gildii. Sprawdź połączenie.',
  'Gilde nicht verbunden':'Gildia niepołączona','Für echte Gilden-EP ist eine Online-Verbindung nötig.':'Do prawdziwego EXP gildii wymagane jest połączenie online.',
  'Gilden-EP nicht vergeben':'EXP gildii nie przyznano','Tageslimit erreicht oder keine aktive Gildenmitgliedschaft. Deine Blüte bleibt erhalten.':'Osiągnięto limit dzienny lub brak aktywnej gildii. Twój kwiat zostaje.',
  '🏰 Gilden-Gewächshaus':'🏰 Szklarnia gildii','Gilden-EP konnten nicht gebucht werden.':'Nie udało się przyznać EXP gildii.','🏰 Wochenbeitrag erfüllt':'🏰 Tygodniowy wkład ukończony',
  '+2 Harz-Taler · +25 Samenfragmente · +1 seltener Samen':'+2 żetony żywicy · +25 fragmentów · +1 rzadkie nasiono',
  'Deine Pflanzen wachsen weiter, auch wenn du offline bist.':'Rośliny rosną dalej, gdy jesteś offline.','Grüner Daumen':'Zielony Kciuk','Ernte deine erste Pflanze im Growroom 2.0.':'Zbierz pierwszą roślinę w Growroom 2.0.',
  'Großzüchter':'Wielki Hodowca','Ernte 25 Pflanzen.':'Zbierz 25 roślin.','Meisterzüchter':'Mistrz Hodowca','Was wächst denn da?':'Co tam rośnie?','Entdecke deine erste Mutation.':'Odkryj pierwszą mutację.','Entdecke eine prismatische Mutation.':'Odkryj pryzmatyczną mutację.',
  'Spezial-Samen konnte nicht ausgeführt werden.':'Nie udało się użyć specjalnego nasiona.',
  'Postfach konnte nicht geladen werden. Falls das Nachrichtensystem neu eingerichtet wird, muss zuerst die V4.02-SQL in Supabase ausgeführt werden.':'Nie udało się załadować skrzynki. Jeśli system jest konfigurowany ponownie, najpierw uruchom SQL V4.02 w Supabase.',
  'Empfänger fehlt':'Brak odbiorcy','Nachricht leer':'Pusta wiadomość','Nachricht zu lang':'Wiadomość za długa','Nachricht nicht gesendet':'Wiadomość nie została wysłana',
  'Der Text enthält einen nicht zulässigen Ausdruck.':'Tekst zawiera niedozwolone wyrażenie.','Nachricht konnte nicht gesendet werden':'Nie udało się wysłać wiadomości','Nachricht konnte nicht gelöscht werden':'Nie udało się usunąć wiadomości',
  'Google Play Billing ist in dieser App-Version noch nicht verfügbar.':'Google Play Billing nie jest jeszcze dostępne w tej wersji.',
  'Prismatisch geschützt':'Chroniony pryzmatycznie','Mystisch geschützt':'Chroniony mistycznie','Klassenset geschützt':'Chroniony zestaw klasowy','Amboss der Harzschmiede':'Kowadło Kuźni Żywicy',
  '✓ ALLE AUSWÄHLEN':'✓ ZAZNACZ WSZYSTKO','ITEMS AUSWÄHLEN':'WYBIERZ PRZEDMIOTY','In der Harzschmiede zerlegen?':'Rozłożyć w Kuźni Żywicy?','🛒 Händlerware zerlegt':'🛒 Rozłożono przedmiot ze sklepu','Verkaufen · 0 Gold':'Sprzedaj · 0 złota',
  '🌈 PRISMATISCH · Verkauf 0 Gold · nicht zerlegbar':'🌈 PRYZMATYCZNY · Sprzedaż 0 złota · nierozbieralny',
  '2× Gold-Event Belohnung':'Nagroda wydarzenia 2× Złoto','+20 Dampf kaufen · 1 Harz':'Kup +20 Pary · 1 Żywica',
  'Keine Ausrüstung sichtbar.':'Brak widocznego wyposażenia.','Rangliste wird geladen...':'Ładowanie rankingu...','Rangliste konnte nicht geladen werden.':'Nie udało się załadować rankingu.'
 },
 tr:{
  'Pflegefenster erscheinen während des Wachstums. Nichts verdorrt, wenn du eines verpasst.':'Bakım pencereleri büyüme sırasında görünür. Birini kaçırırsan hiçbir şey solmaz.',
  'Keine Pflegeaktion verfügbar':'Bakım işlemi yok','Die Pflanze ist bereits erntereif.':'Bitki zaten hasada hazır.','Später wieder nachsehen.':'Daha sonra tekrar kontrol et.',
  'Pflege bereits erledigt':'Bakım zaten tamamlandı','Die angezeigte Aktion war nicht mehr aktuell. Der Growroom wurde neu geladen.':'Gösterilen işlem artık güncel değildi. Growroom yeniden yüklendi.',
  'Der Growroom zeigt dir an, sobald eine Ernte bereit ist.':'Growroom, hasat hazır olduğunda sana bildirir.',
  'Gilden-Gewächshaus':'Lonca serası','Heute hast du bereits eine Blüte gespendet. Morgen kannst du erneut Gilden-EP beitragen.':'Bugün zaten bir çiçek bağışladın. Yarın tekrar lonca EXP katkısı yapabilirsin.',
  'Keine aktive Gilde':'Aktif lonca yok','Deine Gildenmitgliedschaft konnte nicht geladen werden. Bitte Verbindung prüfen.':'Lonca üyeliğin yüklenemedi. Bağlantıyı kontrol et.',
  'Gilde nicht verbunden':'Lonca bağlı değil','Für echte Gilden-EP ist eine Online-Verbindung nötig.':'Gerçek lonca EXP için çevrimiçi bağlantı gerekir.',
  'Gilden-EP nicht vergeben':'Lonca EXP verilmedi','Tageslimit erreicht oder keine aktive Gildenmitgliedschaft. Deine Blüte bleibt erhalten.':'Günlük limite ulaşıldı veya aktif lonca yok. Çiçeğin korunur.',
  '🏰 Gilden-Gewächshaus':'🏰 Lonca serası','Gilden-EP konnten nicht gebucht werden.':'Lonca EXP işlenemedi.','🏰 Wochenbeitrag erfüllt':'🏰 Haftalık katkı tamamlandı',
  '+2 Harz-Taler · +25 Samenfragmente · +1 seltener Samen':'+2 Reçine Jetonu · +25 Tohum Parçası · +1 nadir tohum',
  'Deine Pflanzen wachsen weiter, auch wenn du offline bist.':'Bitkilerin çevrimdışıyken de büyümeye devam eder.','Grüner Daumen':'Yeşil Başparmak','Ernte deine erste Pflanze im Growroom 2.0.':'Growroom 2.0’da ilk bitkini hasat et.',
  'Großzüchter':'Büyük Yetiştirici','Ernte 25 Pflanzen.':'25 bitki hasat et.','Meisterzüchter':'Usta Yetiştirici','Was wächst denn da?':'Orada ne büyüyor?','Entdecke deine erste Mutation.':'İlk mutasyonunu keşfet.','Entdecke eine prismatische Mutation.':'Prizmatik bir mutasyon keşfet.',
  'Spezial-Samen konnte nicht ausgeführt werden.':'Özel tohum kullanılamadı.',
  'Postfach konnte nicht geladen werden. Falls das Nachrichtensystem neu eingerichtet wird, muss zuerst die V4.02-SQL in Supabase ausgeführt werden.':'Posta kutusu yüklenemedi. Mesaj sistemi yeniden kuruluyorsa önce Supabase içinde V4.02 SQL çalıştırılmalı.',
  'Empfänger fehlt':'Alıcı eksik','Nachricht leer':'Mesaj boş','Nachricht zu lang':'Mesaj çok uzun','Nachricht nicht gesendet':'Mesaj gönderilmedi',
  'Der Text enthält einen nicht zulässigen Ausdruck.':'Metin izin verilmeyen bir ifade içeriyor.','Nachricht konnte nicht gesendet werden':'Mesaj gönderilemedi','Nachricht konnte nicht gelöscht werden':'Mesaj silinemedi',
  'Google Play Billing ist in dieser App-Version noch nicht verfügbar.':'Google Play Billing bu uygulama sürümünde henüz kullanılamıyor.',
  'Prismatisch geschützt':'Prizmatik korumalı','Mystisch geschützt':'Mistik korumalı','Klassenset geschützt':'Sınıf seti korumalı','Amboss der Harzschmiede':'Reçine Ocağı örsü',
  '✓ ALLE AUSWÄHLEN':'✓ TÜMÜNÜ SEÇ','ITEMS AUSWÄHLEN':'EŞYALARI SEÇ','In der Harzschmiede zerlegen?':'Reçine Ocağında parçala?','🛒 Händlerware zerlegt':'🛒 Mağaza eşyası parçalandı','Verkaufen · 0 Gold':'Sat · 0 Altın',
  '🌈 PRISMATISCH · Verkauf 0 Gold · nicht zerlegbar':'🌈 PRİZMATİK · Satış 0 Altın · parçalanamaz',
  '2× Gold-Event Belohnung':'2× Altın etkinliği ödülü','+20 Dampf kaufen · 1 Harz':'Satın al +20 Buhar · 1 Reçine',
  'Keine Ausrüstung sichtbar.':'Görünür ekipman yok.','Rangliste wird geladen...':'Sıralama yükleniyor...','Rangliste konnte nicht geladen werden.':'Sıralama yüklenemedi.'
 }
};
for(const lang of Object.keys(RUNTIME_UI_B))Object.assign(M[lang]||(M[lang]={}),RUNTIME_UI_B[lang]);

const RUNTIME_UI_C={
 en:{
  'Gildenboss-Belohnung':'Guild boss reward','Gildenboss-Belohnung nicht verfügbar':'Guild boss reward unavailable','🎁 Gildenkrieg-Belohnung':'🎁 Guild war reward','Gildenkrieg-Belohnung fehlgeschlagen':'Guild war reward failed',
  'KAMPF':'BATTLE','Deine Gilde':'Your guild','Melde Mitglieder bis 18:00 Uhr für Angriff und/oder Verteidigung an.':'Register members for attack and/or defense by 18:00.',
  'Matchmaking läuft. Ab 19:00 Uhr steht das Ergebnis bereit.':'Matchmaking is running. The result will be ready from 19:00.','Für heute wurde noch kein passender Gildenkrieg gefunden.':'No suitable guild war was found for today.',
  '💀 Niederlage. +10 Gilden-Buds.':'💀 Defeat. +10 Guild Buds.','Belohnung fehlgeschlagen':'Reward failed','Nur Anführer/Offizier':'Leader/officer only','Heute geschlossen':'Closed today',
  'Der Anführer oder ein Offizier kann eine Gegnergilde auswählen und den Krieg erklären.':'The leader or an officer can choose an enemy guild and declare war.',
  'Neue Kriegserklärungen sind heute geschlossen. Morgen wieder bis 18:00 Uhr.':'New war declarations are closed today. Available again tomorrow until 18:00.',
  'Kein Krieg':'No war','Die Anmeldung ist heute seit 18:00 Uhr geschlossen.':'Registration has been closed since 18:00 today.','Anmeldung zurückgenommen.':'Registration withdrawn.',
  '⚔️ Gildenkrieg erklären':'⚔️ Declare guild war','Krieg erklären':'Declare war','⚔️ Krieg erklärt!':'⚔️ War declared!','Kriegserklärung fehlgeschlagen':'War declaration failed',
  'Keine Platzierungsbelohnung':'No ranking reward','Für den letzten Mittwoch ist auf diesem Account kein Turm-Ergebnis gespeichert.':'No Tower result from last Wednesday is saved on this account.',
  'Diese Mittwochs-Belohnung wurde bereits abgeholt.':'This Wednesday reward has already been claimed.','Du bist in dieser Mittwochs-Rangliste nicht platziert.':'You are not ranked in this Wednesday ranking.',
  'Die finale Mittwochs-Rangliste konnte gerade nicht geprüft werden.':'The final Wednesday ranking could not be checked right now.','Letzte Mittwochs-Platzierung wird geprüft …':'Checking last Wednesday ranking …',
  'Letzte Mittwochs-Platzierung momentan nicht erreichbar.':'Last Wednesday ranking is currently unavailable.','Das Mittwochs-Event ist nicht aktiv.':'The Wednesday event is not active.','Aufgabe noch nicht abgeschlossen.':'Task not completed yet.',
  'Lauf wirklich abbrechen? 25 % der ungesicherten Beute gehen verloren.':'Really abort the run? 25% of unsecured loot will be lost.','Lauf wirklich abbrechen?':'Really abort the run?',
  'Dein Turm-Leben ist bereits voll.':'Your Tower health is already full.','Dein Mutationslimit ist erreicht.':'Your mutation limit has been reached.','Wurzelnetz für diesen Lauf erhalten.':'Root Network obtained for this run.',
  'Keine weitere Genetik verfügbar.':'No further genetics available.','Dein Mutationslimit ist erreicht. Kauf nicht möglich.':'Mutation limit reached. Purchase unavailable.','Nicht genug ungesichertes Turm-Gold.':'Not enough unsecured Tower Gold.',
  'Kauf konnte nicht angewendet werden. Es wurde kein Gold abgezogen.':'Purchase could not be applied. No Gold was deducted.','Schwarzmarkt leergekauft – er erscheint in diesem Run nicht mehr.':'Black market sold out – it will not appear again in this run.',
  'Nicht genug Turmblätter.':'Not enough Tower Leaves.','Kein Ausweg – der Boss muss fallen.':'No escape – the boss must fall.','Ein besonders harter Wächter wartet dahinter.':'An especially tough guardian waits behind it.',
  'Boss-Tor öffnen':'Open boss gate','Tür wählen':'Choose door','Wähle eine Tür …':'Choose a door …','Nach diesem Spezialraum folgt zwingend wieder ein Kampf.':'A battle must follow this special room.'
 },
 es:{
  'Gildenboss-Belohnung':'Recompensa del jefe del gremio','Gildenboss-Belohnung nicht verfügbar':'Recompensa del jefe no disponible','🎁 Gildenkrieg-Belohnung':'🎁 Recompensa de guerra','Gildenkrieg-Belohnung fehlgeschlagen':'Falló la recompensa de guerra',
  'KAMPF':'COMBATE','Deine Gilde':'Tu gremio','Melde Mitglieder bis 18:00 Uhr für Angriff und/oder Verteidigung an.':'Inscribe miembros para ataque y/o defensa hasta las 18:00.',
  'Matchmaking läuft. Ab 19:00 Uhr steht das Ergebnis bereit.':'El emparejamiento está en curso. El resultado estará disponible desde las 19:00.','Für heute wurde noch kein passender Gildenkrieg gefunden.':'Aún no se encontró una guerra adecuada para hoy.',
  '💀 Niederlage. +10 Gilden-Buds.':'💀 Derrota. +10 Brotes de gremio.','Belohnung fehlgeschlagen':'Falló la recompensa','Nur Anführer/Offizier':'Solo líder/oficial','Heute geschlossen':'Cerrado hoy',
  'Der Anführer oder ein Offizier kann eine Gegnergilde auswählen und den Krieg erklären.':'El líder o un oficial puede elegir un gremio rival y declarar la guerra.',
  'Neue Kriegserklärungen sind heute geschlossen. Morgen wieder bis 18:00 Uhr.':'Las nuevas declaraciones están cerradas hoy. Mañana vuelven hasta las 18:00.',
  'Kein Krieg':'Sin guerra','Die Anmeldung ist heute seit 18:00 Uhr geschlossen.':'La inscripción está cerrada desde las 18:00 de hoy.','Anmeldung zurückgenommen.':'Inscripción retirada.',
  '⚔️ Gildenkrieg erklären':'⚔️ Declarar guerra','Krieg erklären':'Declarar guerra','⚔️ Krieg erklärt!':'⚔️ ¡Guerra declarada!','Kriegserklärung fehlgeschlagen':'Falló la declaración de guerra',
  'Keine Platzierungsbelohnung':'Sin recompensa de clasificación','Für den letzten Mittwoch ist auf diesem Account kein Turm-Ergebnis gespeichert.':'No hay resultado de Torre del último miércoles guardado en esta cuenta.',
  'Diese Mittwochs-Belohnung wurde bereits abgeholt.':'La recompensa del miércoles ya fue recogida.','Du bist in dieser Mittwochs-Rangliste nicht platziert.':'No estás clasificado en este ranking del miércoles.',
  'Die finale Mittwochs-Rangliste konnte gerade nicht geprüft werden.':'No se pudo comprobar ahora la clasificación final del miércoles.','Letzte Mittwochs-Platzierung wird geprüft …':'Comprobando la última clasificación del miércoles …',
  'Letzte Mittwochs-Platzierung momentan nicht erreichbar.':'La última clasificación del miércoles no está disponible.','Das Mittwochs-Event ist nicht aktiv.':'El evento del miércoles no está activo.','Aufgabe noch nicht abgeschlossen.':'Tarea aún no completada.',
  'Lauf wirklich abbrechen? 25 % der ungesicherten Beute gehen verloren.':'¿Abortar la run? Se perderá el 25 % del botín no asegurado.','Lauf wirklich abbrechen?':'¿Abortar la run?',
  'Dein Turm-Leben ist bereits voll.':'La vida de la Torre ya está llena.','Dein Mutationslimit ist erreicht.':'Has alcanzado el límite de mutaciones.','Wurzelnetz für diesen Lauf erhalten.':'Red de Raíces obtenida para esta run.',
  'Keine weitere Genetik verfügbar.':'No hay más genética disponible.','Dein Mutationslimit ist erreicht. Kauf nicht möglich.':'Límite de mutaciones alcanzado. Compra no disponible.','Nicht genug ungesichertes Turm-Gold.':'No hay suficiente Oro de Torre no asegurado.',
  'Kauf konnte nicht angewendet werden. Es wurde kein Gold abgezogen.':'No se pudo aplicar la compra. No se descontó Oro.','Schwarzmarkt leergekauft – er erscheint in diesem Run nicht mehr.':'Mercado negro agotado; no volverá a aparecer en esta run.',
  'Nicht genug Turmblätter.':'No hay suficientes Hojas de Torre.','Kein Ausweg – der Boss muss fallen.':'Sin salida: el jefe debe caer.','Ein besonders harter Wächter wartet dahinter.':'Un guardián especialmente duro espera detrás.',
  'Boss-Tor öffnen':'Abrir puerta del jefe','Tür wählen':'Elegir puerta','Wähle eine Tür …':'Elige una puerta …','Nach diesem Spezialraum folgt zwingend wieder ein Kampf.':'Después de esta sala especial debe seguir un combate.'
 },
 fr:{
  'Gildenboss-Belohnung':'Récompense du boss de guilde','Gildenboss-Belohnung nicht verfügbar':'Récompense du boss indisponible','🎁 Gildenkrieg-Belohnung':'🎁 Récompense de guerre','Gildenkrieg-Belohnung fehlgeschlagen':'Échec de la récompense de guerre',
  'KAMPF':'COMBAT','Deine Gilde':'Ta guilde','Melde Mitglieder bis 18:00 Uhr für Angriff und/oder Verteidigung an.':'Inscris des membres en attaque et/ou défense avant 18:00.',
  'Matchmaking läuft. Ab 19:00 Uhr steht das Ergebnis bereit.':'Le matchmaking est en cours. Le résultat sera disponible dès 19:00.','Für heute wurde noch kein passender Gildenkrieg gefunden.':'Aucune guerre de guilde adaptée trouvée pour aujourd’hui.',
  '💀 Niederlage. +10 Gilden-Buds.':'💀 Défaite. +10 Buds de guilde.','Belohnung fehlgeschlagen':'Échec de la récompense','Nur Anführer/Offizier':'Chef/officier uniquement','Heute geschlossen':'Fermé aujourd’hui',
  'Der Anführer oder ein Offizier kann eine Gegnergilde auswählen und den Krieg erklären.':'Le chef ou un officier peut choisir une guilde adverse et déclarer la guerre.',
  'Neue Kriegserklärungen sind heute geschlossen. Morgen wieder bis 18:00 Uhr.':'Les nouvelles déclarations sont fermées aujourd’hui. Retour demain jusqu’à 18:00.',
  'Kein Krieg':'Aucune guerre','Die Anmeldung ist heute seit 18:00 Uhr geschlossen.':'Les inscriptions sont fermées depuis 18:00 aujourd’hui.','Anmeldung zurückgenommen.':'Inscription retirée.',
  '⚔️ Gildenkrieg erklären':'⚔️ Déclarer la guerre','Krieg erklären':'Déclarer la guerre','⚔️ Krieg erklärt!':'⚔️ Guerre déclarée !','Kriegserklärung fehlgeschlagen':'Échec de la déclaration de guerre',
  'Keine Platzierungsbelohnung':'Aucune récompense de classement','Für den letzten Mittwoch ist auf diesem Account kein Turm-Ergebnis gespeichert.':'Aucun résultat de Tour du mercredi précédent n’est enregistré sur ce compte.',
  'Diese Mittwochs-Belohnung wurde bereits abgeholt.':'Cette récompense du mercredi a déjà été récupérée.','Du bist in dieser Mittwochs-Rangliste nicht platziert.':'Tu n’es pas classé dans ce classement du mercredi.',
  'Die finale Mittwochs-Rangliste konnte gerade nicht geprüft werden.':'Impossible de vérifier le classement final du mercredi pour le moment.','Letzte Mittwochs-Platzierung wird geprüft …':'Vérification du dernier classement du mercredi …',
  'Letzte Mittwochs-Platzierung momentan nicht erreichbar.':'Dernier classement du mercredi indisponible.','Das Mittwochs-Event ist nicht aktiv.':'L’événement du mercredi n’est pas actif.','Aufgabe noch nicht abgeschlossen.':'Tâche pas encore terminée.',
  'Lauf wirklich abbrechen? 25 % der ungesicherten Beute gehen verloren.':'Abandonner le run ? 25 % du butin non sécurisé sera perdu.','Lauf wirklich abbrechen?':'Abandonner le run ?',
  'Dein Turm-Leben ist bereits voll.':'La vie de la Tour est déjà pleine.','Dein Mutationslimit ist erreicht.':'Limite de mutations atteinte.','Wurzelnetz für diesen Lauf erhalten.':'Réseau Racinaire obtenu pour ce run.',
  'Keine weitere Genetik verfügbar.':'Aucune autre génétique disponible.','Dein Mutationslimit ist erreicht. Kauf nicht möglich.':'Limite de mutations atteinte. Achat impossible.','Nicht genug ungesichertes Turm-Gold.':'Pas assez d’Or de Tour non sécurisé.',
  'Kauf konnte nicht angewendet werden. Es wurde kein Gold abgezogen.':'L’achat n’a pas pu être appliqué. Aucun Or n’a été retiré.','Schwarzmarkt leergekauft – er erscheint in diesem Run nicht mehr.':'Marché noir épuisé — il ne réapparaîtra plus dans ce run.',
  'Nicht genug Turmblätter.':'Pas assez de Feuilles de Tour.','Kein Ausweg – der Boss muss fallen.':'Aucune issue — le boss doit tomber.','Ein besonders harter Wächter wartet dahinter.':'Un gardien particulièrement coriace attend derrière.',
  'Boss-Tor öffnen':'Ouvrir la porte du boss','Tür wählen':'Choisir une porte','Wähle eine Tür …':'Choisis une porte …','Nach diesem Spezialraum folgt zwingend wieder ein Kampf.':'Un combat doit obligatoirement suivre cette salle spéciale.'
 },
 pl:{
  'Gildenboss-Belohnung':'Nagroda bossa gildii','Gildenboss-Belohnung nicht verfügbar':'Nagroda bossa niedostępna','🎁 Gildenkrieg-Belohnung':'🎁 Nagroda wojny gildii','Gildenkrieg-Belohnung fehlgeschlagen':'Błąd nagrody wojny gildii',
  'KAMPF':'WALKA','Deine Gilde':'Twoja gildia','Melde Mitglieder bis 18:00 Uhr für Angriff und/oder Verteidigung an.':'Zapisz członków do ataku i/lub obrony do 18:00.',
  'Matchmaking läuft. Ab 19:00 Uhr steht das Ergebnis bereit.':'Dobieranie trwa. Wynik będzie dostępny od 19:00.','Für heute wurde noch kein passender Gildenkrieg gefunden.':'Nie znaleziono jeszcze odpowiedniej wojny gildii na dziś.',
  '💀 Niederlage. +10 Gilden-Buds.':'💀 Porażka. +10 Budsów gildii.','Belohnung fehlgeschlagen':'Błąd nagrody','Nur Anführer/Offizier':'Tylko lider/oficer','Heute geschlossen':'Dziś zamknięte',
  'Der Anführer oder ein Offizier kann eine Gegnergilde auswählen und den Krieg erklären.':'Lider lub oficer może wybrać wrogą gildię i wypowiedzieć wojnę.',
  'Neue Kriegserklärungen sind heute geschlossen. Morgen wieder bis 18:00 Uhr.':'Nowe wypowiedzenia wojny są dziś zamknięte. Jutro ponownie do 18:00.',
  'Kein Krieg':'Brak wojny','Die Anmeldung ist heute seit 18:00 Uhr geschlossen.':'Zapisy są dziś zamknięte od 18:00.','Anmeldung zurückgenommen.':'Wycofano zapis.',
  '⚔️ Gildenkrieg erklären':'⚔️ Wypowiedz wojnę','Krieg erklären':'Wypowiedz wojnę','⚔️ Krieg erklärt!':'⚔️ Wojna wypowiedziana!','Kriegserklärung fehlgeschlagen':'Nie udało się wypowiedzieć wojny',
  'Keine Platzierungsbelohnung':'Brak nagrody rankingowej','Für den letzten Mittwoch ist auf diesem Account kein Turm-Ergebnis gespeichert.':'Na tym koncie nie ma zapisanego wyniku Wieży z ostatniej środy.',
  'Diese Mittwochs-Belohnung wurde bereits abgeholt.':'Ta środowa nagroda została już odebrana.','Du bist in dieser Mittwochs-Rangliste nicht platziert.':'Nie masz miejsca w tym środowym rankingu.',
  'Die finale Mittwochs-Rangliste konnte gerade nicht geprüft werden.':'Nie można teraz sprawdzić końcowego rankingu środowego.','Letzte Mittwochs-Platzierung wird geprüft …':'Sprawdzanie ostatniego rankingu środowego …',
  'Letzte Mittwochs-Platzierung momentan nicht erreichbar.':'Ostatni ranking środowy jest obecnie niedostępny.','Das Mittwochs-Event ist nicht aktiv.':'Środowe wydarzenie nie jest aktywne.','Aufgabe noch nicht abgeschlossen.':'Zadanie nieukończone.',
  'Lauf wirklich abbrechen? 25 % der ungesicherten Beute gehen verloren.':'Przerwać run? Stracisz 25% niezabezpieczonego łupu.','Lauf wirklich abbrechen?':'Przerwać run?',
  'Dein Turm-Leben ist bereits voll.':'Życie Wieży jest już pełne.','Dein Mutationslimit ist erreicht.':'Osiągnięto limit mutacji.','Wurzelnetz für diesen Lauf erhalten.':'Otrzymano Sieć Korzeni na ten run.',
  'Keine weitere Genetik verfügbar.':'Brak dalszej genetyki.','Dein Mutationslimit ist erreicht. Kauf nicht möglich.':'Limit mutacji osiągnięty. Zakup niemożliwy.','Nicht genug ungesichertes Turm-Gold.':'Za mało niezabezpieczonego Złota Wieży.',
  'Kauf konnte nicht angewendet werden. Es wurde kein Gold abgezogen.':'Nie udało się zastosować zakupu. Złoto nie zostało pobrane.','Schwarzmarkt leergekauft – er erscheint in diesem Run nicht mehr.':'Czarny rynek wykupiony — nie pojawi się ponownie w tym runie.',
  'Nicht genug Turmblätter.':'Za mało Liści Wieży.','Kein Ausweg – der Boss muss fallen.':'Brak wyjścia — boss musi paść.','Ein besonders harter Wächter wartet dahinter.':'Za drzwiami czeka wyjątkowo silny strażnik.',
  'Boss-Tor öffnen':'Otwórz bramę bossa','Tür wählen':'Wybierz drzwi','Wähle eine Tür …':'Wybierz drzwi …','Nach diesem Spezialraum folgt zwingend wieder ein Kampf.':'Po tej specjalnej sali musi nastąpić walka.'
 },
 tr:{
  'Gildenboss-Belohnung':'Lonca bossu ödülü','Gildenboss-Belohnung nicht verfügbar':'Lonca bossu ödülü kullanılamıyor','🎁 Gildenkrieg-Belohnung':'🎁 Lonca savaşı ödülü','Gildenkrieg-Belohnung fehlgeschlagen':'Lonca savaşı ödülü başarısız',
  'KAMPF':'SAVAŞ','Deine Gilde':'Loncan','Melde Mitglieder bis 18:00 Uhr für Angriff und/oder Verteidigung an.':'Üyeleri 18:00’e kadar saldırı ve/veya savunma için kaydet.',
  'Matchmaking läuft. Ab 19:00 Uhr steht das Ergebnis bereit.':'Eşleştirme sürüyor. Sonuç 19:00’dan itibaren hazır olacak.','Für heute wurde noch kein passender Gildenkrieg gefunden.':'Bugün için uygun lonca savaşı bulunamadı.',
  '💀 Niederlage. +10 Gilden-Buds.':'💀 Yenilgi. +10 Lonca Budu.','Belohnung fehlgeschlagen':'Ödül başarısız','Nur Anführer/Offizier':'Yalnızca lider/subay','Heute geschlossen':'Bugün kapalı',
  'Der Anführer oder ein Offizier kann eine Gegnergilde auswählen und den Krieg erklären.':'Lider veya subay rakip lonca seçip savaş ilan edebilir.',
  'Neue Kriegserklärungen sind heute geschlossen. Morgen wieder bis 18:00 Uhr.':'Yeni savaş ilanları bugün kapalı. Yarın 18:00’e kadar yeniden açık.',
  'Kein Krieg':'Savaş yok','Die Anmeldung ist heute seit 18:00 Uhr geschlossen.':'Kayıt bugün 18:00’den beri kapalı.','Anmeldung zurückgenommen.':'Kayıt geri çekildi.',
  '⚔️ Gildenkrieg erklären':'⚔️ Lonca savaşı ilan et','Krieg erklären':'Savaş ilan et','⚔️ Krieg erklärt!':'⚔️ Savaş ilan edildi!','Kriegserklärung fehlgeschlagen':'Savaş ilanı başarısız',
  'Keine Platzierungsbelohnung':'Sıralama ödülü yok','Für den letzten Mittwoch ist auf diesem Account kein Turm-Ergebnis gespeichert.':'Bu hesapta geçen çarşambaya ait Kule sonucu kayıtlı değil.',
  'Diese Mittwochs-Belohnung wurde bereits abgeholt.':'Bu çarşamba ödülü zaten alındı.','Du bist in dieser Mittwochs-Rangliste nicht platziert.':'Bu çarşamba sıralamasında yer almıyorsun.',
  'Die finale Mittwochs-Rangliste konnte gerade nicht geprüft werden.':'Son çarşamba sıralaması şu anda kontrol edilemedi.','Letzte Mittwochs-Platzierung wird geprüft …':'Son çarşamba sıralaması kontrol ediliyor …',
  'Letzte Mittwochs-Platzierung momentan nicht erreichbar.':'Son çarşamba sıralamasına şu anda ulaşılamıyor.','Das Mittwochs-Event ist nicht aktiv.':'Çarşamba etkinliği aktif değil.','Aufgabe noch nicht abgeschlossen.':'Görev henüz tamamlanmadı.',
  'Lauf wirklich abbrechen? 25 % der ungesicherten Beute gehen verloren.':'Koşuyu gerçekten iptal et? Güvenceye alınmamış ganimetin %25’i kaybolur.','Lauf wirklich abbrechen?':'Koşuyu gerçekten iptal et?',
  'Dein Turm-Leben ist bereits voll.':'Kule canın zaten dolu.','Dein Mutationslimit ist erreicht.':'Mutasyon limitine ulaştın.','Wurzelnetz für diesen Lauf erhalten.':'Bu koşu için Kök Ağı alındı.',
  'Keine weitere Genetik verfügbar.':'Başka genetik yok.','Dein Mutationslimit ist erreicht. Kauf nicht möglich.':'Mutasyon limiti dolu. Satın alma mümkün değil.','Nicht genug ungesichertes Turm-Gold.':'Yeterli güvencesiz Kule Altını yok.',
  'Kauf konnte nicht angewendet werden. Es wurde kein Gold abgezogen.':'Satın alma uygulanamadı. Altın düşülmedi.','Schwarzmarkt leergekauft – er erscheint in diesem Run nicht mehr.':'Kara pazar tükendi — bu koşuda tekrar görünmeyecek.',
  'Nicht genug Turmblätter.':'Yeterli Kule Yaprağı yok.','Kein Ausweg – der Boss muss fallen.':'Kaçış yok — boss düşmeli.','Ein besonders harter Wächter wartet dahinter.':'Arkasında özellikle güçlü bir muhafız bekliyor.',
  'Boss-Tor öffnen':'Boss kapısını aç','Tür wählen':'Kapı seç','Wähle eine Tür …':'Bir kapı seç …','Nach diesem Spezialraum folgt zwingend wieder ein Kampf.':'Bu özel odadan sonra mutlaka bir savaş gelir.'
 }
};
for(const lang of Object.keys(RUNTIME_UI_C))Object.assign(M[lang]||(M[lang]={}),RUNTIME_UI_C[lang]);

/* Dynamic text patterns. Exact dictionaries cannot cover values embedded into
   labels; these preserve numbers/names while translating the surrounding UI. */
const P={
 en:[
  [/^Freier Topf (\d+)$/i,(_,n)=>`Free pot ${n}`],[/^Topf (\d+)$/i,(_,n)=>`Pot ${n}`],[/^Pflege (\d+) von (\d+)$/i,(_,a,b)=>`Care ${a} of ${b}`],
  [/^(\d+)\/([0-9]+) Töpfe$/i,(_,a,b)=>`${a}/${b} pots`],[/^(\d+) Sorten$/i,(_,n)=>`${n} strains`],[/^(\d+) Sorten · (\d+) Mutationen$/i,(_,a,b)=>`${a} strains · ${b} mutations`],
  [/^(\d+) Minuten Grundzeit · (.+) für alle Klassen$/i,(_,n,s)=>`${n} minutes base time · ${s} for all classes`],[/^(.+) pflanzen$/i,(_,x)=>`Plant ${x}`],
  [/^(.+) · Pflege!$/i,(_,x)=>`${x} · Care!`],[/^(.+) · Qualität steigern$/i,(_,x)=>`${x} · Increase quality`],
  [/^(\d+) Pflegechance(?:n)? verpasst\. Nichts geht verloren\.$/i,(_,n)=>`${n} care chance${n==='1'?'':'s'} missed. Nothing is lost.`],
  [/^(\d+)× ernten$/i,(_,n)=>`Harvest ×${n}`],[/^Aktiv: (.+)$/i,(_,x)=>`Active: ${x}`],[/^(\d+) Min\. aktiv$/i,(_,n)=>`${n} min active`],
  [/^Vorrat: (\d+)$/i,(_,n)=>`Stock: ${n}`],[/^Ausgewählt: (.+)$/i,(_,x)=>`Selected: ${x}`],[/^(\d+) Samen$/i,(_,n)=>`${n} seeds`],
  [/^Lv\. (\d+)$/i,(_,n)=>`Lv. ${n}`],[/^Level (\d+)$/i,(_,n)=>`Level ${n}`],[/^Platz (\d+)$/i,(_,n)=>`Rank ${n}`]
 ],
 es:[
  [/^Freier Topf (\d+)$/i,(_,n)=>`Maceta libre ${n}`],[/^Topf (\d+)$/i,(_,n)=>`Maceta ${n}`],[/^Pflege (\d+) von (\d+)$/i,(_,a,b)=>`Cuidado ${a} de ${b}`],[/^(\d+)\/([0-9]+) Töpfe$/i,(_,a,b)=>`${a}/${b} macetas`],[/^(\d+) Sorten$/i,(_,n)=>`${n} variedades`],[/^(.+) pflanzen$/i,(_,x)=>`Plantar ${x}`],[/^(\d+)× ernten$/i,(_,n)=>`Cosechar ×${n}`],[/^Aktiv: (.+)$/i,(_,x)=>`Activo: ${x}`],[/^(\d+) Min\. aktiv$/i,(_,n)=>`${n} min activo`],[/^Vorrat: (\d+)$/i,(_,n)=>`Stock: ${n}`],[/^Ausgewählt: (.+)$/i,(_,x)=>`Seleccionado: ${x}`]
 ],
 fr:[
  [/^Freier Topf (\d+)$/i,(_,n)=>`Pot libre ${n}`],[/^Topf (\d+)$/i,(_,n)=>`Pot ${n}`],[/^Pflege (\d+) von (\d+)$/i,(_,a,b)=>`Soin ${a} sur ${b}`],[/^(\d+)\/([0-9]+) Töpfe$/i,(_,a,b)=>`${a}/${b} pots`],[/^(\d+) Sorten$/i,(_,n)=>`${n} variétés`],[/^(.+) pflanzen$/i,(_,x)=>`Planter ${x}`],[/^(\d+)× ernten$/i,(_,n)=>`Récolter ×${n}`],[/^Aktiv: (.+)$/i,(_,x)=>`Actif : ${x}`],[/^(\d+) Min\. aktiv$/i,(_,n)=>`${n} min actif`],[/^Vorrat: (\d+)$/i,(_,n)=>`Stock : ${n}`],[/^Ausgewählt: (.+)$/i,(_,x)=>`Sélectionné : ${x}`]
 ],
 pl:[
  [/^Freier Topf (\d+)$/i,(_,n)=>`Wolna doniczka ${n}`],[/^Topf (\d+)$/i,(_,n)=>`Doniczka ${n}`],[/^Pflege (\d+) von (\d+)$/i,(_,a,b)=>`Pielęgnacja ${a} z ${b}`],[/^(\d+)\/([0-9]+) Töpfe$/i,(_,a,b)=>`${a}/${b} doniczek`],[/^(\d+) Sorten$/i,(_,n)=>`${n} odmian`],[/^(.+) pflanzen$/i,(_,x)=>`Posadź ${x}`],[/^(\d+)× ernten$/i,(_,n)=>`Zbierz ×${n}`],[/^Aktiv: (.+)$/i,(_,x)=>`Aktywne: ${x}`],[/^(\d+) Min\. aktiv$/i,(_,n)=>`${n} min aktywne`],[/^Vorrat: (\d+)$/i,(_,n)=>`Stan: ${n}`],[/^Ausgewählt: (.+)$/i,(_,x)=>`Wybrano: ${x}`]
 ],
 tr:[
  [/^Freier Topf (\d+)$/i,(_,n)=>`Boş saksı ${n}`],[/^Topf (\d+)$/i,(_,n)=>`Saksı ${n}`],[/^Pflege (\d+) von (\d+)$/i,(_,a,b)=>`Bakım ${a}/${b}`],[/^(\d+)\/([0-9]+) Töpfe$/i,(_,a,b)=>`${a}/${b} saksı`],[/^(\d+) Sorten$/i,(_,n)=>`${n} tür`],[/^(.+) pflanzen$/i,(_,x)=>`${x} ek`],[/^(\d+)× ernten$/i,(_,n)=>`Hasat ×${n}`],[/^Aktiv: (.+)$/i,(_,x)=>`Aktif: ${x}`],[/^(\d+) Min\. aktiv$/i,(_,n)=>`${n} dk aktif`],[/^Vorrat: (\d+)$/i,(_,n)=>`Stok: ${n}`],[/^Ausgewählt: (.+)$/i,(_,x)=>`Seçildi: ${x}`]
 ]
};

const RUNTIME_PATTERNS={
 en:[
  [/^\+(\d+) Zeit-Samen$/i,(_,n)=>`+${n} Time Seeds`],
  [/^Neuer Bestand: (.+)$/i,(_,x)=>`New balance: ${x}`],
  [/^Der Gegenstand liegt jetzt im (.+)\.$/i,(_,x)=>`The item is now in ${x}.`],
  [/^Samen-Vorrat: (.+)$/i,(_,x)=>`Seed stock: ${x}`],
  [/^(.+): 1 Samen gekauft\.$/i,(_,x)=>`${x}: 1 seed purchased.`],
  [/^🌰 Samen gefunden: (.+)$/i,(_,x)=>`🌰 Seed found: ${x}`],
  [/^(.+) hat den Kampf gewonnen\.$/i,(_,x)=>`${x} won the battle.`],
  [/^Auffüllungen: (\d+)\/(\d+)$/i,(_,a,b)=>`Refills: ${a}/${b}`],
  [/^⚠️ (\d+) epische\/legendäre Gegenstände sind ausgewählt\.$/i,(_,n)=>`⚠️ ${n} epic/legendary items selected.`],
  [/^(\d+) Gold Händler-Rückgewinnung$/i,(_,n)=>`${n} Gold shop recovery`],
  [/^Stufe (\d+) besiegt · nächste Herausforderung: Stufe (\d+) mit ca\. (.+) HP\.$/i,(_,a,b,hp)=>`Stage ${a} defeated · next challenge: stage ${b} with approx. ${hp} HP.`],
  [/^Mittwochs-Rangliste · Platz (\d+)$/i,(_,n)=>`Wednesday ranking · Rank ${n}`],
  [/^Platz (\d+) liegt außerhalb der Top 50\.$/i,(_,n)=>`Rank ${n} is outside the Top 50.`],
  [/^\+(\d+) Turmblätter\.$/i,(_,n)=>`+${n} Tower Leaves.`],
  [/^Kaufen · (\d+) G$/i,(_,n)=>`Buy · ${n} G`],
  [/^🔒 Topf (\d+) Raum-Upgrade nötig$/i,(_,n)=>`🔒 Pot ${n} · room upgrade required`],
  [/^🌿 Pflege (\d+)\/4$/i,(_,n)=>`🌿 Care ${n}/4`],
  [/^(.+) Pflegeaktion verfügbar$/i,(_,x)=>`${x} care action available`]
 ],
 es:[
  [/^\+(\d+) Zeit-Samen$/i,(_,n)=>`+${n} Semillas de Tiempo`],[/^Neuer Bestand: (.+)$/i,(_,x)=>`Nuevo saldo: ${x}`],
  [/^Der Gegenstand liegt jetzt im (.+)\.$/i,(_,x)=>`El objeto está ahora en ${x}.`],[/^Samen-Vorrat: (.+)$/i,(_,x)=>`Stock de semillas: ${x}`],
  [/^(.+): 1 Samen gekauft\.$/i,(_,x)=>`${x}: 1 semilla comprada.`],[/^🌰 Samen gefunden: (.+)$/i,(_,x)=>`🌰 Semilla encontrada: ${x}`],
  [/^(.+) hat den Kampf gewonnen\.$/i,(_,x)=>`${x} ganó el combate.`],[/^Auffüllungen: (\d+)\/(\d+)$/i,(_,a,b)=>`Recargas: ${a}/${b}`],
  [/^⚠️ (\d+) epische\/legendäre Gegenstände sind ausgewählt\.$/i,(_,n)=>`⚠️ ${n} objetos épicos/legendarios seleccionados.`],
  [/^Stufe (\d+) besiegt · nächste Herausforderung: Stufe (\d+) mit ca\. (.+) HP\.$/i,(_,a,b,hp)=>`Etapa ${a} derrotada · siguiente: etapa ${b} con aprox. ${hp} PV.`],
  [/^Mittwochs-Rangliste · Platz (\d+)$/i,(_,n)=>`Clasificación del miércoles · Puesto ${n}`],[/^\+(\d+) Turmblätter\.$/i,(_,n)=>`+${n} Hojas de Torre.`],
  [/^Kaufen · (\d+) G$/i,(_,n)=>`Comprar · ${n} G`],[/^🔒 Topf (\d+) Raum-Upgrade nötig$/i,(_,n)=>`🔒 Maceta ${n} · mejora de sala requerida`],[/^🌿 Pflege (\d+)\/4$/i,(_,n)=>`🌿 Cuidado ${n}/4`]
 ],
 fr:[
  [/^\+(\d+) Zeit-Samen$/i,(_,n)=>`+${n} Graines temporelles`],[/^Neuer Bestand: (.+)$/i,(_,x)=>`Nouveau solde : ${x}`],
  [/^Der Gegenstand liegt jetzt im (.+)\.$/i,(_,x)=>`L’objet est maintenant dans ${x}.`],[/^Samen-Vorrat: (.+)$/i,(_,x)=>`Stock de graines : ${x}`],
  [/^(.+): 1 Samen gekauft\.$/i,(_,x)=>`${x} : 1 graine achetée.`],[/^🌰 Samen gefunden: (.+)$/i,(_,x)=>`🌰 Graine trouvée : ${x}`],
  [/^(.+) hat den Kampf gewonnen\.$/i,(_,x)=>`${x} a gagné le combat.`],[/^Auffüllungen: (\d+)\/(\d+)$/i,(_,a,b)=>`Recharges : ${a}/${b}`],
  [/^⚠️ (\d+) epische\/legendäre Gegenstände sind ausgewählt\.$/i,(_,n)=>`⚠️ ${n} objets épiques/légendaires sélectionnés.`],
  [/^Stufe (\d+) besiegt · nächste Herausforderung: Stufe (\d+) mit ca\. (.+) HP\.$/i,(_,a,b,hp)=>`Étape ${a} vaincue · prochaine : étape ${b} avec env. ${hp} PV.`],
  [/^Mittwochs-Rangliste · Platz (\d+)$/i,(_,n)=>`Classement du mercredi · Rang ${n}`],[/^\+(\d+) Turmblätter\.$/i,(_,n)=>`+${n} Feuilles de Tour.`],
  [/^Kaufen · (\d+) G$/i,(_,n)=>`Acheter · ${n} G`],[/^🔒 Topf (\d+) Raum-Upgrade nötig$/i,(_,n)=>`🔒 Pot ${n} · amélioration de salle requise`],[/^🌿 Pflege (\d+)\/4$/i,(_,n)=>`🌿 Soin ${n}/4`]
 ],
 pl:[
  [/^\+(\d+) Zeit-Samen$/i,(_,n)=>`+${n} Nasion Czasu`],[/^Neuer Bestand: (.+)$/i,(_,x)=>`Nowy stan: ${x}`],
  [/^Der Gegenstand liegt jetzt im (.+)\.$/i,(_,x)=>`Przedmiot jest teraz w ${x}.`],[/^Samen-Vorrat: (.+)$/i,(_,x)=>`Stan nasion: ${x}`],
  [/^(.+): 1 Samen gekauft\.$/i,(_,x)=>`${x}: kupiono 1 nasiono.`],[/^🌰 Samen gefunden: (.+)$/i,(_,x)=>`🌰 Znaleziono nasiono: ${x}`],
  [/^(.+) hat den Kampf gewonnen\.$/i,(_,x)=>`${x} wygrał walkę.`],[/^Auffüllungen: (\d+)\/(\d+)$/i,(_,a,b)=>`Uzupełnienia: ${a}/${b}`],
  [/^⚠️ (\d+) epische\/legendäre Gegenstände sind ausgewählt\.$/i,(_,n)=>`⚠️ Wybrano ${n} epickich/legendarnych przedmiotów.`],
  [/^Stufe (\d+) besiegt · nächste Herausforderung: Stufe (\d+) mit ca\. (.+) HP\.$/i,(_,a,b,hp)=>`Etap ${a} pokonany · następny: etap ${b} z ok. ${hp} HP.`],
  [/^Mittwochs-Rangliste · Platz (\d+)$/i,(_,n)=>`Ranking środowy · Miejsce ${n}`],[/^\+(\d+) Turmblätter\.$/i,(_,n)=>`+${n} Liści Wieży.`],
  [/^Kaufen · (\d+) G$/i,(_,n)=>`Kup · ${n} G`],[/^🔒 Topf (\d+) Raum-Upgrade nötig$/i,(_,n)=>`🔒 Doniczka ${n} · wymagane ulepszenie pomieszczenia`],[/^🌿 Pflege (\d+)\/4$/i,(_,n)=>`🌿 Pielęgnacja ${n}/4`]
 ],
 tr:[
  [/^\+(\d+) Zeit-Samen$/i,(_,n)=>`+${n} Zaman Tohumu`],[/^Neuer Bestand: (.+)$/i,(_,x)=>`Yeni bakiye: ${x}`],
  [/^Der Gegenstand liegt jetzt im (.+)\.$/i,(_,x)=>`Eşya artık ${x} içinde.`],[/^Samen-Vorrat: (.+)$/i,(_,x)=>`Tohum stoku: ${x}`],
  [/^(.+): 1 Samen gekauft\.$/i,(_,x)=>`${x}: 1 tohum satın alındı.`],[/^🌰 Samen gefunden: (.+)$/i,(_,x)=>`🌰 Tohum bulundu: ${x}`],
  [/^(.+) hat den Kampf gewonnen\.$/i,(_,x)=>`${x} savaşı kazandı.`],[/^Auffüllungen: (\d+)\/(\d+)$/i,(_,a,b)=>`Dolumlar: ${a}/${b}`],
  [/^⚠️ (\d+) epische\/legendäre Gegenstände sind ausgewählt\.$/i,(_,n)=>`⚠️ ${n} epik/efsanevi eşya seçildi.`],
  [/^Stufe (\d+) besiegt · nächste Herausforderung: Stufe (\d+) mit ca\. (.+) HP\.$/i,(_,a,b,hp)=>`Aşama ${a} yenildi · sonraki: yaklaşık ${hp} HP ile aşama ${b}.`],
  [/^Mittwochs-Rangliste · Platz (\d+)$/i,(_,n)=>`Çarşamba sıralaması · Sıra ${n}`],[/^\+(\d+) Turmblätter\.$/i,(_,n)=>`+${n} Kule Yaprağı.`],
  [/^Kaufen · (\d+) G$/i,(_,n)=>`Satın al · ${n} G`],[/^🔒 Topf (\d+) Raum-Upgrade nötig$/i,(_,n)=>`🔒 Saksı ${n} · oda yükseltmesi gerekli`],[/^🌿 Pflege (\d+)\/4$/i,(_,n)=>`🌿 Bakım ${n}/4`]
 ]
};
for(const lang of Object.keys(RUNTIME_PATTERNS))P[lang]?.push(...RUNTIME_PATTERNS[lang]);

const OVERLAY_SELECTORS=[
 '#v247DungeonReward','#v211PvpResultCard','#v231QuestReward',
 '.v6211-level-overlay','.v6211-pet-overlay','.v381-modal',
 '.v8010-popup-backdrop','.v6283-guide-overlay','.v6279-guide-overlay',
 '#v484DailyPopup','.v6239-wc-overlay','[role="dialog"]'
];
const ORIGINAL_TEXT=new WeakMap();
const ORIGINAL_ATTR=new WeakMap();
function translateText(raw,lang){
 const s=String(raw||'').trim();if(!s||lang==='de')return null;
 const dict=M[lang]||{};
 if(dict[s]!==undefined)return dict[s];
 const patterns=P[lang]||[];
 for(const [re,fn] of patterns){
  const m=s.match(re);
  if(m){try{return fn(...m)}catch(_){}}
 }
 const entries=Object.entries(dict)
  .filter(([de,tr])=>de&&tr&&de.length>=4&&!/^[A-Z0-9 .:+%/-]+$/.test(de))
  .sort((a,b)=>b[0].length-a[0].length);
 let out=s,changed=false;
 for(const [de,tr] of entries){
  if(!out.includes(de))continue;
  out=out.split(de).join(tr);
  changed=true;
 }
 return changed?out:null;
}
function applyRoot(root){
 if(!root)return false;
 const lang=G.getLanguage();
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(node=>{
  if(node.parentElement&&node.parentElement.closest('script,style,input,textarea'))return;
  if(!ORIGINAL_TEXT.has(node))ORIGINAL_TEXT.set(node,node.nodeValue||'');
  const original=ORIGINAL_TEXT.get(node)||'';
  if(lang==='de'){if(node.nodeValue!==original)node.nodeValue=original;return}
  const v=translateText(original,lang);if(v===null){if(node.nodeValue!==original)node.nodeValue=original;return}
  const a=(original.match(/^\s*/)||[''])[0],b=(original.match(/\s*$/)||[''])[0];node.nodeValue=a+v+b;
 });
 root.querySelectorAll('[aria-label],[title],[placeholder]').forEach(el=>{
  let originals=ORIGINAL_ATTR.get(el);if(!originals){originals={};ORIGINAL_ATTR.set(el,originals)}
  ['aria-label','title','placeholder'].forEach(a=>{
   if(!(a in originals))originals[a]=el.getAttribute(a);
   const original=originals[a];if(original==null)return;
   if(lang==='de'){el.setAttribute(a,original);return}
   const v=translateText(original,lang);el.setAttribute(a,v===null?original:v);
  });
 });
 return true;
}
function applyOverlays(){
 const seen=new Set();
 OVERLAY_SELECTORS.forEach(sel=>document.querySelectorAll(sel).forEach(el=>{if(!seen.has(el)){seen.add(el);applyRoot(el)}}));
}
function resolveRoot(id){
 if(id){
  const direct=document.getElementById(String(id));
  if(direct&&direct.classList.contains('screen'))return direct;
 }
 return document.querySelector('.screen.active')||ROOTS.map(x=>document.getElementById(x)).find(x=>x&&x.classList.contains('active'))||null;
}
function apply(id){
 const root=resolveRoot(id);
 const ok=applyRoot(root);applyOverlays();return ok;
}
function applyAllScreens(){
 let ok=false;
 document.querySelectorAll('.screen').forEach(root=>{ok=applyRoot(root)||ok});
 applyOverlays();
 return ok;
}
function schedule(id){
 queueMicrotask(()=>apply(id));
 try{requestAnimationFrame(()=>apply(id))}catch(_){}
 setTimeout(()=>apply(id),80);setTimeout(()=>apply(id),260);setTimeout(()=>apply(id),900);
}
window.v8144GameplayI18n={apply,applyAllScreens,schedule,roots:ROOTS.slice()};
window.addEventListener('growlegends:language-changed',()=>{applyAllScreens();schedule()},{passive:true});
window.addEventListener('growlegends:account-ready',()=>schedule(),{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String((e&&e.detail&&e.detail.id)||'');schedule(id)},{passive:true});
window.addEventListener('pageshow',()=>schedule(),{passive:true});
document.addEventListener('click',()=>{setTimeout(()=>applyOverlays(),0);setTimeout(()=>applyOverlays(),80);setTimeout(()=>applyOverlays(),260)},true);
document.addEventListener('DOMContentLoaded',()=>schedule(),{once:true});
})();