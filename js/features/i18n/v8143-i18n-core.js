(()=>{
'use strict';

const KEY='growLegendsLanguage';
const SUPPORTED=['de','en','es','fr','pl','tr'];
const META={
 de:{label:'Deutsch',short:'DE',flag:'🇩🇪'},
 en:{label:'English',short:'EN',flag:'🇬🇧'},
 es:{label:'Español',short:'ES',flag:'🇪🇸'},
 fr:{label:'Français',short:'FR',flag:'🇫🇷'},
 pl:{label:'Polski',short:'PL',flag:'🇵🇱'},
 tr:{label:'Türkçe',short:'TR',flag:'🇹🇷'}
};

const D={
 de:{
  'login.chooseServer':'Wähle deinen Server',
  'login.remember':'Angemeldet bleiben',
  'login.forgot':'Passwort vergessen?',
  'login.newHere':'Neu hier?',
  'login.newHereText':'Erstelle einen neuen Account und werde zur Legende!',
  'login.register':'Registrieren',
  'login.signIn':'Anmelden',
  'login.google':'Mit Google anmelden',
  'login.googleRegister':'Mit Google registrieren',
  'login.email':'E-Mail',
  'login.password':'Passwort',
  'login.accountNote':'Melde dich an und lade deinen persönlichen Cloud-Spielstand.',
  'login.registerNote':'Erstelle deinen Account. Charaktername und Klasse wählst du danach genau einmal.',
  'login.featureGrowTitle':'Grow.',
  'login.featureGrowText':'Baue die stärksten Pflanzen an.',
  'login.featureFightTitle':'Fight.',
  'login.featureFightText':'Bezwinge Monster in epischen Dungeons.',
  'login.featureBecomeTitle':'Become.',
  'login.featureBecomeText':'Werde zur Legende in der Ehrenhalle.',
  'login.featureLegendTitle':'Legend.',
  'login.featureLegendText':'Schreibe deine eigene Geschichte.',
  'login.rights':'Alle Rechte vorbehalten',
  'login.privacy':'Datenschutz',
  'login.imprint':'Impressum',
  'login.support':'Support',
  'server.select':'Server wählen',
  'server.separate':'Charaktere & Gilden sind getrennt',
  'server.beta':'Beta Server',
  'server.testBuild':'Test-Build',
  'server.live':'Live-Server',
  'server.online':'ONLINE',
  'server.opensToday':'Heute · 16:00 Uhr',
  'server.startIn':'START IN {time}',
  'server.openNow':'JETZT GEÖFFNET',
  'server.noteOpen':'Server 1 ist jetzt für alle Spieler geöffnet. Beta erhält neue Updates weiterhin zuerst.',
  'server.noteCountdown':'Server 1 öffnet heute automatisch um 16:00 Uhr für alle. Countdown: {time}. Freigeschaltete Testkonten behalten bis dahin ihren Vorabzugang.',
  'server.closedTitle':'Server 1 noch geschlossen',
  'server.closedText':'Server 1 öffnet heute um 16:00 Uhr. Noch {time}.',
  'server.earlyTitle':'Server 1 · Vorabzugang',
  'server.earlyText':'Server 1 öffnet heute um 16:00 Uhr für alle. Noch {time}.',
  'server.previewTitle':'Server 1 · Vorabtest',
  'server.previewText':'Server 1 ist noch geschlossen. Nur freigeschaltete Testkonten haben Zugang.',
  'nav.world':'Startseite',
  'nav.character':'Charakter',
  'nav.grow':'Growroom',
  'nav.quests':'Quest & Schicht',
  'nav.dungeon':'Dungeons',
  'nav.tower':'Anbauturm',
  'nav.caravan':'Nebelkarawane',
  'nav.endgame':'Endgame',
  'nav.shop':'Händler',
  'nav.forge':'Harzschmiede',
  'nav.harzDealer':'Harz & Gold & Rahmen Dealer',
  'nav.bagDealer':'Hinterhof-Dealer',
  'nav.pvp':'PvP-Arena',
  'nav.guild':'Gilde',
  'nav.hall':'Hall of Haze',
  'nav.friends':'Nebel-Crew',
  'nav.mail':'Nebel-Post',
  'nav.admin':'Admin',
  'nav.systemtech':'Systemtechnik',
  'top.gold':'Gold',
  'top.harz':'Harz',
  'top.dampf':'Dampf',
  'top.menu':'Menü'
 },
 en:{
  'login.chooseServer':'Choose your server','login.remember':'Stay signed in','login.forgot':'Forgot password?','login.newHere':'New here?','login.newHereText':'Create a new account and become a legend!','login.register':'Register','login.signIn':'Sign in','login.google':'Sign in with Google','login.googleRegister':'Register with Google','login.email':'Email','login.password':'Password','login.accountNote':'Sign in and load your personal cloud save.','login.registerNote':'Create your account. You will choose your character name and class once afterwards.','login.featureGrowTitle':'Grow.','login.featureGrowText':'Grow the strongest plants.','login.featureFightTitle':'Fight.','login.featureFightText':'Defeat monsters in epic dungeons.','login.featureBecomeTitle':'Become.','login.featureBecomeText':'Become a legend in the Hall of Fame.','login.featureLegendTitle':'Legend.','login.featureLegendText':'Write your own story.','login.rights':'All rights reserved','login.privacy':'Privacy','login.imprint':'Legal notice','login.support':'Support','server.select':'Choose server','server.separate':'Characters & guilds are separate','server.beta':'Beta Server','server.testBuild':'Test build','server.live':'Live server','server.online':'ONLINE','server.opensToday':'Today · 16:00','server.startIn':'STARTS IN {time}','server.openNow':'NOW OPEN','server.noteOpen':'Server 1 is now open to all players. Beta will continue to receive new updates first.','server.noteCountdown':'Server 1 opens automatically today at 16:00 for everyone. Countdown: {time}. Approved test accounts keep early access until then.','server.closedTitle':'Server 1 still closed','server.closedText':'Server 1 opens today at 16:00. {time} remaining.','server.earlyTitle':'Server 1 · Early access','server.earlyText':'Server 1 opens today at 16:00 for everyone. {time} remaining.','server.previewTitle':'Server 1 · Preview','server.previewText':'Server 1 is still closed. Only approved test accounts have access.','nav.world':'Home','nav.character':'Character','nav.grow':'Growroom','nav.quests':'Quests & Shift','nav.dungeon':'Dungeons','nav.tower':'Grow Tower','nav.caravan':'Mist Caravan','nav.endgame':'Endgame','nav.shop':'Shop','nav.forge':'Resin Forge','nav.harzDealer':'Resin, Gold & Frame Dealer','nav.bagDealer':'Backyard Dealer','nav.pvp':'PvP Arena','nav.guild':'Guild','nav.hall':'Hall of Haze','nav.friends':'Mist Crew','nav.mail':'Mist Mail','nav.admin':'Admin','nav.systemtech':'System Tech','top.gold':'Gold','top.harz':'Resin','top.dampf':'Steam','top.menu':'Menu'
 },
 es:{
  'login.chooseServer':'Elige tu servidor','login.remember':'Mantener sesión iniciada','login.forgot':'¿Olvidaste tu contraseña?','login.newHere':'¿Nuevo aquí?','login.newHereText':'¡Crea una cuenta y conviértete en leyenda!','login.register':'Registrarse','login.signIn':'Iniciar sesión','login.google':'Iniciar sesión con Google','login.googleRegister':'Registrarse con Google','login.accountNote':'Inicia sesión y carga tu partida en la nube.','login.registerNote':'Crea tu cuenta. Después elegirás una sola vez el nombre y la clase.','login.featureGrowTitle':'Grow.','login.featureGrowText':'Cultiva las plantas más fuertes.','login.featureFightTitle':'Fight.','login.featureFightText':'Derrota monstruos en mazmorras épicas.','login.featureBecomeTitle':'Become.','login.featureBecomeText':'Conviértete en leyenda en el salón de la fama.','login.featureLegendTitle':'Legend.','login.featureLegendText':'Escribe tu propia historia.','login.rights':'Todos los derechos reservados','login.privacy':'Privacidad','login.imprint':'Aviso legal','login.support':'Soporte','server.select':'Elegir servidor','server.separate':'Personajes y gremios están separados','server.beta':'Servidor Beta','server.testBuild':'Versión de prueba','server.live':'Servidor en vivo','server.online':'ONLINE','server.opensToday':'Hoy · 16:00','server.startIn':'EMPIEZA EN {time}','server.openNow':'YA ABIERTO','server.noteOpen':'El Servidor 1 ya está abierto para todos. Beta seguirá recibiendo primero las novedades.','server.noteCountdown':'El Servidor 1 abre hoy automáticamente a las 16:00 para todos. Cuenta atrás: {time}.','server.closedTitle':'Servidor 1 cerrado','server.closedText':'El Servidor 1 abre hoy a las 16:00. Faltan {time}.','server.earlyTitle':'Servidor 1 · Acceso anticipado','server.earlyText':'El Servidor 1 abre hoy a las 16:00 para todos. Faltan {time}.','server.previewTitle':'Servidor 1 · Prueba previa','server.previewText':'El Servidor 1 aún está cerrado. Solo cuentas de prueba autorizadas tienen acceso.','nav.world':'Inicio','nav.character':'Personaje','nav.grow':'Cultivo','nav.quests':'Misiones y turno','nav.dungeon':'Mazmorras','nav.tower':'Torre de cultivo','nav.caravan':'Caravana de niebla','nav.endgame':'Endgame','nav.shop':'Comerciante','nav.forge':'Forja de resina','nav.harzDealer':'Resina, oro y marcos','nav.bagDealer':'Traficante del patio','nav.pvp':'Arena PvP','nav.guild':'Gremio','nav.hall':'Hall of Haze','nav.friends':'Grupo de niebla','nav.mail':'Correo de niebla','nav.admin':'Admin','nav.systemtech':'Sistema','top.gold':'Oro','top.harz':'Resina','top.dampf':'Vapor','top.menu':'Menú'
 },
 fr:{
  'login.chooseServer':'Choisis ton serveur','login.remember':'Rester connecté','login.forgot':'Mot de passe oublié ?','login.newHere':'Nouveau ici ?','login.newHereText':'Crée un compte et deviens une légende !','login.register':'Créer un compte','login.signIn':'Se connecter','login.google':'Se connecter avec Google','login.googleRegister':'Créer un compte avec Google','login.accountNote':'Connecte-toi et charge ta sauvegarde cloud.','login.registerNote':'Crée ton compte. Tu choisiras ensuite une seule fois ton nom et ta classe.','login.featureGrowTitle':'Grow.','login.featureGrowText':'Cultive les plantes les plus puissantes.','login.featureFightTitle':'Fight.','login.featureFightText':'Affronte des monstres dans des donjons épiques.','login.featureBecomeTitle':'Become.','login.featureBecomeText':'Deviens une légende dans le Hall of Fame.','login.featureLegendTitle':'Legend.','login.featureLegendText':'Écris ta propre histoire.','login.rights':'Tous droits réservés','login.privacy':'Confidentialité','login.imprint':'Mentions légales','login.support':'Support','server.select':'Choisir un serveur','server.separate':'Personnages et guildes sont séparés','server.beta':'Serveur Bêta','server.testBuild':'Version de test','server.live':'Serveur live','server.online':'EN LIGNE','server.opensToday':"Aujourd’hui · 16:00",'server.startIn':'OUVERTURE DANS {time}','server.openNow':'OUVERT','server.noteOpen':'Le Serveur 1 est maintenant ouvert à tous. La bêta recevra toujours les nouveautés en premier.','server.noteCountdown':'Le Serveur 1 ouvre automatiquement aujourd’hui à 16:00 pour tous. Compte à rebours : {time}.','server.closedTitle':'Serveur 1 encore fermé','server.closedText':'Le Serveur 1 ouvre aujourd’hui à 16:00. Encore {time}.','server.earlyTitle':'Serveur 1 · Accès anticipé','server.earlyText':'Le Serveur 1 ouvre aujourd’hui à 16:00 pour tous. Encore {time}.','server.previewTitle':'Serveur 1 · Prétest','server.previewText':'Le Serveur 1 est encore fermé. Seuls les comptes de test autorisés y ont accès.','nav.world':'Accueil','nav.character':'Personnage','nav.grow':'Culture','nav.quests':'Quêtes & Travail','nav.dungeon':'Donjons','nav.tower':'Tour de culture','nav.caravan':'Caravane de brume','nav.endgame':'Endgame','nav.shop':'Marchand','nav.forge':'Forge de résine','nav.harzDealer':'Résine, or & cadres','nav.bagDealer':'Dealer de l’arrière-cour','nav.pvp':'Arène PvP','nav.guild':'Guilde','nav.hall':'Hall of Haze','nav.friends':'Équipe de brume','nav.mail':'Courrier de brume','nav.admin':'Admin','nav.systemtech':'Système','top.gold':'Or','top.harz':'Résine','top.dampf':'Vapeur','top.menu':'Menu'
 },
 pl:{
  'login.chooseServer':'Wybierz serwer','login.remember':'Pozostań zalogowany','login.forgot':'Nie pamiętasz hasła?','login.newHere':'Nowy tutaj?','login.newHereText':'Załóż konto i zostań legendą!','login.register':'Rejestracja','login.signIn':'Zaloguj się','login.google':'Zaloguj przez Google','login.googleRegister':'Zarejestruj przez Google','login.accountNote':'Zaloguj się i wczytaj zapis z chmury.','login.registerNote':'Utwórz konto. Potem raz wybierzesz nazwę postaci i klasę.','login.featureGrowTitle':'Grow.','login.featureGrowText':'Hoduj najsilniejsze rośliny.','login.featureFightTitle':'Fight.','login.featureFightText':'Pokonuj potwory w epickich lochach.','login.featureBecomeTitle':'Become.','login.featureBecomeText':'Zostań legendą w hali sław.','login.featureLegendTitle':'Legend.','login.featureLegendText':'Napisz własną historię.','login.rights':'Wszelkie prawa zastrzeżone','login.privacy':'Prywatność','login.imprint':'Informacje prawne','login.support':'Pomoc','server.select':'Wybierz serwer','server.separate':'Postacie i gildie są oddzielne','server.beta':'Serwer Beta','server.testBuild':'Wersja testowa','server.live':'Serwer live','server.online':'ONLINE','server.opensToday':'Dziś · 16:00','server.startIn':'START ZA {time}','server.openNow':'OTWARTE','server.noteOpen':'Serwer 1 jest już otwarty dla wszystkich. Beta nadal będzie dostawać nowości jako pierwsza.','server.noteCountdown':'Serwer 1 otworzy się dziś automatycznie o 16:00 dla wszystkich. Odliczanie: {time}.','server.closedTitle':'Serwer 1 zamknięty','server.closedText':'Serwer 1 otworzy się dziś o 16:00. Pozostało {time}.','server.earlyTitle':'Serwer 1 · Wczesny dostęp','server.earlyText':'Serwer 1 otworzy się dziś o 16:00 dla wszystkich. Pozostało {time}.','server.previewTitle':'Serwer 1 · Test','server.previewText':'Serwer 1 jest jeszcze zamknięty. Dostęp mają tylko zatwierdzone konta testowe.','nav.world':'Start','nav.character':'Postać','nav.grow':'Uprawa','nav.quests':'Misje i zmiana','nav.dungeon':'Lochy','nav.tower':'Wieża uprawy','nav.caravan':'Mglista karawana','nav.endgame':'Endgame','nav.shop':'Handlarz','nav.forge':'Kuźnia żywicy','nav.harzDealer':'Żywica, złoto i ramki','nav.bagDealer':'Handlarz z podwórka','nav.pvp':'Arena PvP','nav.guild':'Gildia','nav.hall':'Hall of Haze','nav.friends':'Mglista ekipa','nav.mail':'Mglista poczta','nav.admin':'Admin','nav.systemtech':'System','top.gold':'Złoto','top.harz':'Żywica','top.dampf':'Para','top.menu':'Menu'
 },
 tr:{
  'login.chooseServer':'Sunucunu seç','login.remember':'Oturumu açık tut','login.forgot':'Şifreni mi unuttun?','login.newHere':'Yeni misin?','login.newHereText':'Yeni bir hesap oluştur ve efsane ol!','login.register':'Kayıt ol','login.signIn':'Giriş yap','login.google':'Google ile giriş yap','login.googleRegister':'Google ile kayıt ol','login.accountNote':'Giriş yap ve bulut kaydını yükle.','login.registerNote':'Hesabını oluştur. Sonra karakter adını ve sınıfını bir kez seçeceksin.','login.featureGrowTitle':'Grow.','login.featureGrowText':'En güçlü bitkileri yetiştir.','login.featureFightTitle':'Fight.','login.featureFightText':'Destansı zindanlarda canavarları yen.','login.featureBecomeTitle':'Become.','login.featureBecomeText':'Şöhret salonunda efsane ol.','login.featureLegendTitle':'Legend.','login.featureLegendText':'Kendi hikâyeni yaz.','login.rights':'Tüm hakları saklıdır','login.privacy':'Gizlilik','login.imprint':'Yasal bilgiler','login.support':'Destek','server.select':'Sunucu seç','server.separate':'Karakterler ve loncalar ayrıdır','server.beta':'Beta Sunucusu','server.testBuild':'Test sürümü','server.live':'Canlı sunucu','server.online':'ÇEVRİMİÇİ','server.opensToday':'Bugün · 16:00','server.startIn':'BAŞLAMASINA {time}','server.openNow':'ŞİMDİ AÇIK','server.noteOpen':'Sunucu 1 artık herkese açık. Beta yeni güncellemeleri almaya devam edecek.','server.noteCountdown':'Sunucu 1 bugün saat 16:00’da herkese otomatik açılır. Geri sayım: {time}.','server.closedTitle':'Sunucu 1 hâlâ kapalı','server.closedText':'Sunucu 1 bugün 16:00’da açılır. Kalan {time}.','server.earlyTitle':'Sunucu 1 · Erken erişim','server.earlyText':'Sunucu 1 bugün 16:00’da herkese açılır. Kalan {time}.','server.previewTitle':'Sunucu 1 · Ön test','server.previewText':'Sunucu 1 hâlâ kapalı. Yalnızca onaylı test hesapları erişebilir.','nav.world':'Ana Sayfa','nav.character':'Karakter','nav.grow':'Yetiştirme','nav.quests':'Görevler & Vardiya','nav.dungeon':'Zindanlar','nav.tower':'Yetiştirme Kulesi','nav.caravan':'Sis Kervanı','nav.endgame':'Endgame','nav.shop':'Tüccar','nav.forge':'Reçine Ocağı','nav.harzDealer':'Reçine, Altın & Çerçeve','nav.bagDealer':'Arka Bahçe Satıcısı','nav.pvp':'PvP Arenası','nav.guild':'Lonca','nav.hall':'Hall of Haze','nav.friends':'Sis Ekibi','nav.mail':'Sis Postası','nav.admin':'Admin','nav.systemtech':'Sistem','top.gold':'Altın','top.harz':'Reçine','top.dampf':'Buhar','top.menu':'Menü'
 }
};

function normalize(v){return SUPPORTED.includes(String(v||'').toLowerCase())?String(v).toLowerCase():'de'}
let current='de';
try{current=normalize(localStorage.getItem(KEY)||'de')}catch(_){current='de'}

function fmt(str,vars){return String(str||'').replace(/\{(\w+)\}/g,(_,k)=>vars&&vars[k]!==undefined?String(vars[k]):'')}
function t(key,vars){
 const base=D.de[key]??key;
 const value=D[current]?.[key]??base;
 return fmt(value,vars);
}
function applyDocument(){
 document.documentElement.lang=current;
 document.documentElement.dataset.glLang=current;
 const meta=META[current]||META.de;
 document.querySelectorAll('[data-i18n]').forEach(el=>{
   const key=el.dataset.i18n;if(key)el.textContent=t(key);
 });
 document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
   const key=el.dataset.i18nPlaceholder;if(key)el.setAttribute('placeholder',t(key));
 });
 document.querySelectorAll('[data-i18n-aria]').forEach(el=>{
   const key=el.dataset.i18nAria;if(key)el.setAttribute('aria-label',t(key));
 });
 const langSel=document.querySelector('#v8143LanguageSelect');
 if(langSel&&langSel.value!==current)langSel.value=current;
 const short=document.querySelector('#v075AuthOverlay .v347-lang-current');
 if(short)short.textContent=meta.short;
 try{window.v347EnsureLayout?.()}catch(_){}
 try{window.v343RenderServerSelect?.(true)}catch(_){}
 try{window.v4148BuildCompleteMenu?.()}catch(_){}
 try{window.v372PaintTopbar?.()}catch(_){}
}
function setLanguage(lang){
 const next=normalize(lang);
 if(next===current){applyDocument();return current}
 current=next;
 try{localStorage.setItem(KEY,current)}catch(_){}
 applyDocument();
 window.dispatchEvent(new CustomEvent('growlegends:language-changed',{detail:{language:current}}));
 return current;
}
function languageOptions(){
 return SUPPORTED.map(id=>({id,...META[id]}));
}
function register(locale,dict){
 const id=normalize(locale);
 if(!dict||typeof dict!=='object')return false;
 D[id]??={};
 Object.assign(D[id],dict);
 return true;
}
window.GrowI18n=Object.freeze({
 t,setLanguage,getLanguage:()=>current,languages:languageOptions,meta:META,register,
 has:key=>Object.prototype.hasOwnProperty.call(D[current]||{},key)||Object.prototype.hasOwnProperty.call(D.de,key),
 apply:applyDocument
});
window.glT=t;

try{document.documentElement.lang=current;document.documentElement.dataset.glLang=current}catch(_){}
document.addEventListener('DOMContentLoaded',applyDocument,{once:true});
window.addEventListener('pageshow',applyDocument,{passive:true});
window.addEventListener('growlegends:account-ready',applyDocument,{passive:true});
})();
