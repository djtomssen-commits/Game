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
const ROOTS=['world','character','grow','quests','dungeon','tower'];
function translateText(raw,lang){
 const s=String(raw||'').trim();if(!s||lang==='de')return null;
 return M[lang]&&M[lang][s]!==undefined?M[lang][s]:null;
}
function applyRoot(root){
 if(!root)return false;
 const lang=G.getLanguage();if(lang==='de')return true;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(node=>{
  if(node.parentElement&&node.parentElement.closest('script,style,input,textarea'))return;
  const raw=node.nodeValue||'',v=translateText(raw,lang);if(v===null)return;
  const a=(raw.match(/^\s*/)||[''])[0],b=(raw.match(/\s*$/)||[''])[0];node.nodeValue=a+v+b;
 });
 root.querySelectorAll('[aria-label],[title],[placeholder]').forEach(el=>{
  ['aria-label','title','placeholder'].forEach(a=>{const raw=el.getAttribute(a),v=translateText(raw,lang);if(v!==null)el.setAttribute(a,v)});
 });
 return true;
}
function apply(id){
 const root=id&&ROOTS.includes(id)?document.getElementById(id):ROOTS.map(x=>document.getElementById(x)).find(x=>x&&x.classList.contains('active'));
 return applyRoot(root);
}
function schedule(id){
 queueMicrotask(()=>apply(id));
 try{requestAnimationFrame(()=>apply(id))}catch(_){}
 setTimeout(()=>apply(id),80);setTimeout(()=>apply(id),260);
}
window.v8144GameplayI18n={apply,schedule,roots:ROOTS.slice()};
window.addEventListener('growlegends:language-changed',()=>schedule(),{passive:true});
window.addEventListener('growlegends:account-ready',()=>schedule(),{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String((e&&e.detail&&e.detail.id)||'');if(ROOTS.includes(id))schedule(id)},{passive:true});
window.addEventListener('pageshow',()=>schedule(),{passive:true});
document.addEventListener('DOMContentLoaded',()=>schedule(),{once:true});
})();