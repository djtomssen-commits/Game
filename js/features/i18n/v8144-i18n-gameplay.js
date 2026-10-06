(()=>{
'use strict';
if(window.__V8144_GAMEPLAY_I18N__)return;
window.__V8144_GAMEPLAY_I18N__=true;
const G=window.GrowI18n;if(!G)return;

/* Presentation-only migration bridge for legacy renderers.
   Exact, scoped text replacement only; no gameplay/state/RPC changes. */
const M={
 en:{
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
  'Guten Morgen':'Buenos días','Guten Tag':'Hola','Guten Abend':'Buenas tardes','Willkommen zurück':'Bienvenido de nuevo','Aktive Events':'Eventos activos','Aktuell kein Event aktiv':'No hay ningún evento activo','Update-News':'Noticias de actualización','Schnellzugriff':'Acceso rápido','Quests':'Misiones','Aufträge starten':'Iniciar misiones','Gegner besiegen':'Derrotar enemigos','Pflanzen & ernten':'Plantas y cosecha','Ausrüstung kaufen':'Comprar equipo','Charakter':'Personaje','Werte & Ausrüstung':'Atributos y equipo','Spieler & PvP':'Jugadores y PvP',
  'AUSRÜSTUNG · ATTRIBUTE · SKILLS · DEINE KAMPFKRAFT':'EQUIPO · ATRIBUTOS · HABILIDADES · TU PODER','Set-Boni ansehen ›':'Ver bonificaciones de set ›','Inventar':'Inventario','Attribute':'Atributos','Talente':'Talentos','Materialien':'Materiales','Klasse wählen':'Elegir clase','Talentpunkte':'Puntos de talento','Leer':'Vacío','Ablegen':'Quitar','Kopf':'Cabeza','Waffe':'Arma','Ring':'Anillo','Rüstung':'Armadura','Schuhe':'Botas','Amulett':'Amuleto',
  'PFLANZEN · PFLEGE · ERNTE':'PLANTAS · CUIDADO · COSECHA','Blütenlager':'Almacén de flores','LAGER · DEALER · VEREDELN':'ALMACÉN · DEALER · REFINAR','Genetik':'Genética','KREUZUNGEN · HYBRIDE · ESSENZEN':'CRUCES · HÍBRIDOS · ESENCIAS','Aufträge':'Encargos','TÄGLICHE GROW-AUFGABEN':'TAREAS DIARIAS DE CULTIVO','Genetik-Labor':'Laboratorio genético','Grow-Aufträge':'Encargos de cultivo',
  'Neue Aufträge · 10 Gold':'Nuevas misiones · 10 Oro','Belohnung abholen':'Recoger recompensa','Quest starten':'Iniciar misión','Elite-Quest':'Misión élite','Zeit-Samen':'Semillas de tiempo','Kämpfen':'Luchar','Belohnungen':'Recompensas','Versuch':'Intento','Versuche':'Intentos','Zurück':'Atrás','Weiter':'Continuar',
  'ANBAU-TURM':'TORRE DE CULTIVO','Turm-Erholung':'Recuperación de torre','Vollständig erholt':'Recuperado por completo','Run starten':'Iniciar run','Ersten Run starten':'Iniciar primer run','Komplette Ranglisten':'Clasificación completa','Turm-Aufstieg':'Progreso de torre','SAISON':'TEMPORADA','Turm-Rangliste':'Clasificación de torre','Alle':'Todos','MITTWOCH':'MIÉRCOLES','INFORMATIONEN':'INFORMACIÓN','Anbau-Turm Guide':'Guía de la Torre','Guide schließen':'Cerrar guía','Ranglisten ansehen':'Ver clasificaciones','Rangliste':'Clasificación','Turm verlassen':'Salir de la torre'
 },
 fr:{
  'Guten Morgen':'Bonjour','Guten Tag':'Bonjour','Guten Abend':'Bonsoir','Willkommen zurück':'Bon retour','Aktive Events':'Événements actifs','Aktuell kein Event aktiv':'Aucun événement actif','Update-News':'Actualités','Schnellzugriff':'Accès rapide','Quests':'Quêtes','Aufträge starten':'Lancer des missions','Gegner besiegen':'Vaincre des ennemis','Pflanzen & ernten':'Plantes & récolte','Ausrüstung kaufen':'Acheter de l’équipement','Charakter':'Personnage','Werte & Ausrüstung':'Stats & équipement','Spieler & PvP':'Joueurs & PvP',
  'AUSRÜSTUNG · ATTRIBUTE · SKILLS · DEINE KAMPFKRAFT':'ÉQUIPEMENT · ATTRIBUTS · COMPÉTENCES · PUISSANCE','Set-Boni ansehen ›':'Voir les bonus de set ›','Inventar':'Inventaire','Attribute':'Attributs','Talente':'Talents','Materialien':'Matériaux','Klasse wählen':'Choisir une classe','Talentpunkte':'Points de talent','Leer':'Vide','Ablegen':'Retirer','Kopf':'Tête','Waffe':'Arme','Ring':'Anneau','Rüstung':'Armure','Schuhe':'Bottes','Amulett':'Amulette',
  'PFLANZEN · PFLEGE · ERNTE':'PLANTES · SOINS · RÉCOLTE','Blütenlager':'Stock de fleurs','LAGER · DEALER · VEREDELN':'STOCK · DEALER · RAFFINER','Genetik':'Génétique','KREUZUNGEN · HYBRIDE · ESSENZEN':'CROISEMENTS · HYBRIDES · ESSENCES','Aufträge':'Contrats','TÄGLICHE GROW-AUFGABEN':'TÂCHES DE CULTURE QUOTIDIENNES','Genetik-Labor':'Laboratoire génétique','Grow-Aufträge':'Contrats de culture',
  'Neue Aufträge · 10 Gold':'Nouvelles quêtes · 10 Or','Belohnung abholen':'Récupérer la récompense','Quest starten':'Lancer la quête','Elite-Quest':'Quête élite','Zeit-Samen':'Graines temporelles','Kämpfen':'Combattre','Belohnungen':'Récompenses','Versuch':'Essai','Versuche':'Essais','Zurück':'Retour','Weiter':'Continuer',
  'ANBAU-TURM':'TOUR DE CULTURE','Turm-Erholung':'Récupération de la tour','Vollständig erholt':'Entièrement rétabli','Run starten':'Lancer le run','Ersten Run starten':'Lancer le premier run','Komplette Ranglisten':'Classements complets','Turm-Aufstieg':'Progression de la tour','SAISON':'SAISON','Turm-Rangliste':'Classement de la tour','Alle':'Tous','MITTWOCH':'MERCREDI','INFORMATIONEN':'INFORMATIONS','Anbau-Turm Guide':'Guide de la Tour','Guide schließen':'Fermer le guide','Ranglisten ansehen':'Voir les classements','Rangliste':'Classement','Turm verlassen':'Quitter la tour'
 },
 pl:{
  'Guten Morgen':'Dzień dobry','Guten Tag':'Cześć','Guten Abend':'Dobry wieczór','Willkommen zurück':'Witaj ponownie','Aktive Events':'Aktywne wydarzenia','Aktuell kein Event aktiv':'Brak aktywnego wydarzenia','Update-News':'Aktualności','Schnellzugriff':'Szybki dostęp','Quests':'Misje','Aufträge starten':'Rozpocznij misje','Gegner besiegen':'Pokonaj wrogów','Pflanzen & ernten':'Rośliny i zbiory','Ausrüstung kaufen':'Kup wyposażenie','Charakter':'Postać','Werte & Ausrüstung':'Statystyki i wyposażenie','Spieler & PvP':'Gracze i PvP',
  'AUSRÜSTUNG · ATTRIBUTE · SKILLS · DEINE KAMPFKRAFT':'EKWIPUNEK · ATRYBUTY · UMIEJĘTNOŚCI · SIŁA','Set-Boni ansehen ›':'Pokaż bonusy zestawu ›','Inventar':'Ekwipunek','Attribute':'Atrybuty','Talente':'Talenty','Materialien':'Materiały','Klasse wählen':'Wybierz klasę','Talentpunkte':'Punkty talentów','Leer':'Puste','Ablegen':'Zdejmij','Kopf':'Głowa','Waffe':'Broń','Ring':'Pierścień','Rüstung':'Pancerz','Schuhe':'Buty','Amulett':'Amulet',
  'PFLANZEN · PFLEGE · ERNTE':'ROŚLINY · PIELĘGNACJA · ZBIORY','Blütenlager':'Magazyn kwiatów','LAGER · DEALER · VEREDELN':'MAGAZYN · DEALER · ULEPSZANIE','Genetik':'Genetyka','KREUZUNGEN · HYBRIDE · ESSENZEN':'KRZYŻÓWKI · HYBRYDY · ESENCJE','Aufträge':'Zlecenia','TÄGLICHE GROW-AUFGABEN':'CODZIENNE ZADANIA UPRAWY','Genetik-Labor':'Laboratorium genetyczne','Grow-Aufträge':'Zlecenia uprawy',
  'Neue Aufträge · 10 Gold':'Nowe misje · 10 złota','Belohnung abholen':'Odbierz nagrodę','Quest starten':'Rozpocznij misję','Elite-Quest':'Misja elitarna','Zeit-Samen':'Nasiona czasu','Kämpfen':'Walcz','Belohnungen':'Nagrody','Versuch':'Próba','Versuche':'Próby','Zurück':'Wstecz','Weiter':'Dalej',
  'ANBAU-TURM':'WIEŻA UPRAWY','Turm-Erholung':'Regeneracja wieży','Vollständig erholt':'W pełni zregenerowano','Run starten':'Rozpocznij run','Ersten Run starten':'Rozpocznij pierwszy run','Komplette Ranglisten':'Pełne rankingi','Turm-Aufstieg':'Rozwój wieży','SAISON':'SEZON','Turm-Rangliste':'Ranking wieży','Alle':'Wszyscy','MITTWOCH':'ŚRODA','INFORMATIONEN':'INFORMACJE','Anbau-Turm Guide':'Poradnik Wieży','Guide schließen':'Zamknij poradnik','Ranglisten ansehen':'Zobacz rankingi','Rangliste':'Ranking','Turm verlassen':'Opuść wieżę'
 },
 tr:{
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