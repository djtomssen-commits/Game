
(()=>{
'use strict';
if(window.__V6344_QUEST_VARIETY__)return;
window.__V6344_QUEST_VARIETY__=true;

const ENEMY_ART={
 'Panzer-Blattlaus':'v474_dungeon_assets/d2_1.png',
 'Riesentrauerfliege':'v474_dungeon_assets/d2_9.png',
 'Trauerfliegen-Brut':'v474_dungeon_assets/d2_9.png',
 'Labor-Mutant':'v474_dungeon_assets/d10_boss.png',
 'Mutierter Laborwächter':'v474_dungeon_assets/d10_boss.png',
 'Sporenwächter':'v474_dungeon_assets/d4_4.png',
 'Dornenbestie':'v474_dungeon_assets/d18_5.png',
 'Milbenjäger':'v474_dungeon_assets/d12_2.png',
 'Keller-Golem':'v474_dungeon_assets/d2_4.png',
 'Nebel-Unhold':'v474_dungeon_assets/d19_3.png',
 'Verfluchter Gartenwächter':'v474_dungeon_assets/d19_8.png',
 'Säurefalter':'v474_dungeon_assets/d10_7.png'
};
const ENEMY_ICON={
 'Panzer-Blattlaus':'🪲','Riesentrauerfliege':'🪰','Trauerfliegen-Brut':'🪰','Labor-Mutant':'🧟',
 'Mutierter Laborwächter':'🧟','Sporenwächter':'🍄','Dornenbestie':'🌵','Milbenjäger':'🕷️',
 'Keller-Golem':'🪨','Nebel-Unhold':'👹','Verfluchter Gartenwächter':'🧙','Säurefalter':'🦋'
};
const Q=(id,name,icon,text,scene,enemy,base=2)=>({id,name,icon,text,scene,enemy,enemyIcon:ENEMY_ICON[enemy]||'👹',enemyArt:ENEMY_ART[enemy]||'',base});
const POOL=[
 Q('mira_lieferung','Miras verschwundene Lieferung','📦','Miras Kräuterkiste kam nie in der Taverne an. Zwischen nassen Fußspuren liegen zerkaute Liefersiegel.','v474_dungeon_assets/d1_bg.jpg','Panzer-Blattlaus',1),
 Q('bork_werkzeug','Borks verlorene Werkzeugkiste','🧰','Bork vermisst seine beste Werkzeugkiste. Aus dem alten Keller hört man seitdem schweres Scharren zwischen den Regalen.','v474_dungeon_assets/d2_bg.jpg','Keller-Golem',1),
 Q('hinterhof_ungeziefer','Ungeziefer im Hinterhof','🪲','Im Hinterhof verschwinden über Nacht ganze Blätter. Rudi will wissen, was sich unter den Pflanzkübeln versteckt.','v474_dungeon_assets/d12_bg.jpg','Panzer-Blattlaus',1),
 Q('gartenzwerg','Der fluchende Gartenzwerg','🧙','Ein verzauberter Gartenwächter blockiert die Gasse und beschimpft jeden, der sich Miras Vorräten nähert.','v474_dungeon_assets/d17_bg.jpg','Verfluchter Gartenwächter',2),
 Q('nebel_gewaechshaus','Nebel über dem Gewächshaus','🌫️','Im verlassenen Gewächshaus brennt wieder Licht. Im dichten Nebel bewegt sich etwas zwischen den leeren Tischen.','v474_dungeon_assets/d19_bg.jpg','Nebel-Unhold',2),
 Q('riesenfliege','Jagd auf die Riesentrauerfliege','🪰','Eine riesige Trauerfliege kreist über Grünhain und stürzt sich auf jede frisch geöffnete Growbox.','v474_dungeon_assets/d3_bg.jpg','Riesentrauerfliege',2),
 Q('labor_spuren','Spuren zum alten Labor','🧪','Leuchtend grüne Schleimspuren führen durch einen zugemauerten Tunnel. Hinter der Labortür hämmert etwas gegen Metall.','v474_dungeon_assets/d10_bg.jpg','Mutierter Laborwächter',3),
 Q('dachgarten_nacht','Der nächtliche Dachgarten','🌙','Auf dem Dachgarten werden Pflanzen zerschnitten, ohne dass jemand gesehen wird. Nur verbrannte Flügel bleiben zurück.','v474_dungeon_assets/d3_bg.jpg','Säurefalter',3),
 Q('sporen_keller','Sporen im Versorgungskeller','🍄','Eine dicke Sporenschicht legt die Lüftung lahm. Ein Wächter aus Pilzgewebe bewacht den Hauptfilter.','v474_dungeon_assets/d4_bg.jpg','Sporenwächter',2),
 Q('dornen_nordtor','Dornen am Nordtor','🌵','Die Zufahrt nach Grünhain ist über Nacht zugewachsen. Zwischen den Ranken bewegt sich eine gepanzerte Dornenbestie.','v474_dungeon_assets/d18_bg.jpg','Dornenbestie',3),
 Q('milben_lager','Milbennest im Lagerhaus','🕷️','Borks Lager ist voller feiner Gespinste. Mehrere Kisten wurden von innen geöffnet und ausgeräumt.','v474_dungeon_assets/d12_bg.jpg','Milbenjäger',2),
 Q('golem_heizung','Die blockierte Kellerheizung','🔥','Die Heizung unter der Taverne ist ausgefallen. Ein schwerer Golem sitzt mitten auf den Rohren und rührt sich nicht.','v474_dungeon_assets/d2_bg.jpg','Keller-Golem',2),
 Q('nebel_kanal','Stimmen aus den Nebelkanälen','👂','Aus den Kanälen unter Grünhain kommen flüsternde Stimmen. Wer nachsieht, kehrt kreidebleich wieder zurück.','v474_dungeon_assets/d8_bg.jpg','Nebel-Unhold',3),
 Q('laus_ernte','Die zerfressene Ernte','🥬','Eine ganze Lieferung Blätter ist mit winzigen Fraßspuren übersät. Die Spur endet an einer ungewöhnlich großen Blattlaus.','v474_dungeon_assets/d6_bg.jpg','Panzer-Blattlaus',2),
 Q('fliegen_brut','Brut unter den Lampen','💡','Unter den alten Growlampen kleben hunderte Eier. Die Trauerfliegen-Brut beginnt bereits zu schlüpfen.','v474_dungeon_assets/d7_bg.jpg','Trauerfliegen-Brut',3),
 Q('labor_strom','Stromausfall im Labor','⚡','Das Labor zieht plötzlich viel zu viel Strom. Hinter der Sicherungstür stampft ein missglücktes Experiment durch die Dunkelheit.','v474_dungeon_assets/d10_bg.jpg','Labor-Mutant',3),
 Q('sporen_schacht','Der verseuchte Lüftungsschacht','🌀','Sporen quellen aus der Lüftung der Taverne. Der Ursprung liegt tief im Wartungsschacht unter dem Gebäude.','v474_dungeon_assets/d4_bg.jpg','Sporenwächter',2),
 Q('dorn_friedhof','Ranken auf dem Dornenfriedhof','🪦','Alte Grabsteine werden von frischen Ranken gesprengt. In der Mitte des Friedhofs wächst etwas viel zu schnell.','v474_dungeon_assets/d9_bg.jpg','Dornenbestie',3),
 Q('milben_bunker','Alarm im Schädlingsbunker','🚨','Die Fallen im Schädlingsbunker lösen eine nach der anderen aus. Ein Milbenjäger kennt offenbar jeden sicheren Weg.','v474_dungeon_assets/d12_bg.jpg','Milbenjäger',3),
 Q('golem_minen','Schläge aus der Schimmelmine','⛏️','Tief aus der Mine hallen schwere Schläge. Ein Keller-Golem trägt gestohlene Erzsäcke in einen zugeschütteten Stollen.','v474_dungeon_assets/d6_bg.jpg','Keller-Golem',3),
 Q('waechter_tunnel','Wächter im Blattjäger-Tunnel','🌿','Ein alter Gartenwächter versperrt den Tunnel. Auf seiner Rüstung hängen die Marken mehrerer verschwundener Händler.','v474_dungeon_assets/d16_bg.jpg','Verfluchter Gartenwächter',3),
 Q('falter_saeure','Säurespuren auf dem Dach','🦋','Die Dachplatten sind angeätzt und überall liegen schimmernde Schuppen. Ein Säurefalter kreist über den Lüftern.','v474_dungeon_assets/d15_bg.jpg','Säurefalter',3),
 Q('nebel_markt','Der leere Schwarzmarkt','💰','Der Schwarzmarkt ist plötzlich verlassen. Im Nebel liegen Münzen auf dem Boden, doch niemand wagt sie aufzuheben.','v474_dungeon_assets/d8_bg.jpg','Nebel-Unhold',2),
 Q('spore_tempel','Pilzlicht im alten Tempel','🕯️','Im Pilztempel leuchten neue Sporenfelder. Ein Sporenwächter reagiert auf jeden Schritt im feuchten Stein.','v474_dungeon_assets/d14_bg.jpg','Sporenwächter',3),
 Q('dorn_festung','Dornen vor der Harzfestung','🏰','Die Harzfestung ist vom Hauptweg abgeschnitten. Eine Dornenbestie hat den Zugang in ein lebendes Dickicht verwandelt.','v474_dungeon_assets/d17_bg.jpg','Dornenbestie',4),
 Q('milben_kristall','Milben in der Kristallhöhle','💎','Kristallstaub verschwindet säckeweise. Zwischen den Felsen glänzen die Augen eines besonders schnellen Milbenjägers.','v474_dungeon_assets/d11_bg.jpg','Milbenjäger',3),
 Q('labor_glas','Etwas hinter der Laborscheibe','🧬','Eine versiegelte Testkammer wurde von innen geöffnet. Kratzspuren führen direkt in den stillgelegten Laborgang.','v474_dungeon_assets/d10_bg.jpg','Mutierter Laborwächter',4),
 Q('fliege_taverne','Trauerfliege über der Taverne','🍺','Die Gäste verlassen fluchtartig die Taverne. Eine Riesentrauerfliege schlägt immer wieder gegen das Vordach.','v474_dungeon_assets/d1_bg.jpg','Riesentrauerfliege',2),
 Q('brut_gewaechshaus','Das Summen im Gewächshaus','🐛','Ein tiefes Summen kommt aus den Pflanzreihen. Unter den Tischen sammelt sich eine neue Trauerfliegen-Brut.','v474_dungeon_assets/d7_bg.jpg','Trauerfliegen-Brut',2),
 Q('golem_wurzelgruft','Steinwächter der Wurzelgruft','🪨','Die Wurzelgruft ist eingestürzt. Zwischen den geborstenen Wänden erhebt sich ein schwerer Keller-Golem.','v474_dungeon_assets/d13_bg.jpg','Keller-Golem',3),
 Q('waechter_schwarzhaus','Fluch im schwarzen Gewächshaus','🕸️','Im schwarzen Gewächshaus hängen neue Warnzeichen. Ein verfluchter Gartenwächter patrouilliert zwischen den Pflanzen.','v474_dungeon_assets/d18_bg.jpg','Verfluchter Gartenwächter',4),
 Q('falter_hochhaus','Flügel im verseuchten Hochhaus','🏢','In den oberen Etagen flackert das Licht. Säureflecken markieren den Weg eines Falters durch die zerbrochenen Fenster.','v474_dungeon_assets/d15_bg.jpg','Säurefalter',4),
 Q('nebel_gruft','Der Atem aus der Wurzelgruft','💨','Kalter Nebel strömt aus einem Riss im Boden. Ein Nebel-Unhold zieht alles Licht in seiner Nähe an sich.','v474_dungeon_assets/d13_bg.jpg','Nebel-Unhold',4),
 Q('laus_bewaesserung','Sabotage an der Bewässerung','💧','Mehrere Leitungen wurden angenagt. In einem Verteilerkasten steckt eine Panzer-Blattlaus zwischen den Ventilen.','v474_dungeon_assets/d5_bg.jpg','Panzer-Blattlaus',2),
 Q('sporen_katakomben','Sporenalarm in den Katakomben','☣️','Die Sensoren melden eine massive Sporenwolke. Ein Wächter hat sich direkt vor dem Zugang zur Filterkammer festgesetzt.','v474_dungeon_assets/d4_bg.jpg','Sporenwächter',4),
 Q('milben_thron','Jäger vor dem Milbenthron','👑','Ein schneller Milbenjäger bewacht den letzten Zugang. Hinter ihm beginnt das Revier der Milbenkaiserin.','v474_dungeon_assets/d20_bg.jpg','Milbenjäger',4)
];
window.V6344_QUEST_POOL=POOL;

function specForQuest(q){
  if(!q)return null;
  const id=String(q.v6344QuestId||'');
  return POOL.find(x=>x.id===id)||POOL.find(x=>x.name===String(q.name||q.title||''))||null;
}
function recent(){
  s.v6344QuestRecent=Array.isArray(s.v6344QuestRecent)?s.v6344QuestRecent.filter(Boolean).slice(-12):[];
  return s.v6344QuestRecent;
}
let batchScenes=new Set(),batchEnemies=new Set();
function pickFresh(usedNames){
  const used=usedNames instanceof Set?usedNames:new Set();
  if(used.size===0){batchScenes=new Set();batchEnemies=new Set()}
  const r=recent();
  const filters=[
    x=>!used.has(x.name)&&!r.includes(x.id)&&!batchScenes.has(x.scene)&&!batchEnemies.has(x.enemy),
    x=>!used.has(x.name)&&!r.includes(x.id)&&!batchEnemies.has(x.enemy),
    x=>!used.has(x.name)&&!r.includes(x.id),
    x=>!used.has(x.name)
  ];
  let choices=[];
  for(const f of filters){choices=POOL.filter(f);if(choices.length)break}
  if(!choices.length)choices=POOL.slice();
  const t=choices[Math.floor(Math.random()*choices.length)];
  if(t){batchScenes.add(t.scene);batchEnemies.add(t.enemy)}
  return t;
}

/* Expand the canonical template source too, so any old/direct generator also has the larger pool. */
try{
  const known=new Set((questTemplates||[]).map(x=>x?.name));
  POOL.forEach(x=>{if(!known.has(x.name)){questTemplates.push({name:x.name,icon:x.icon,text:x.text,base:x.base});known.add(x.name)}});
}catch(_){ }

/* V309 remains the owner of SCHNELL/NORMAL/SCHWER balance; only its template source is replaced. */
try{v309PickTemplate=pickFresh;window.v309PickTemplate=pickFresh}catch(_){ }
try{
  const baseApply=v309ApplyRole;
  if(typeof baseApply==='function'){
    v309ApplyRole=function(q,roleIndex,usedNames){
      const out=baseApply.apply(this,arguments);
      const sp=POOL.find(x=>x.name===String(out?.name||''));
      if(sp){
        out.v6344QuestId=sp.id;out.v6344Scene=sp.scene;out.v6344EnemyName=sp.enemy;
        out.v6344EnemyIcon=sp.enemyIcon;out.v6344EnemyArt=sp.enemyArt;
        const r=recent().filter(id=>id!==sp.id);r.push(sp.id);s.v6344QuestRecent=r.slice(-12);
      }
      return out;
    };
    window.v309ApplyRole=v309ApplyRole;
  }
}catch(e){console.warn('V6.347 quest role bridge',e)}

/* Make the chosen quest boss deterministic instead of falling back to a random old enemy. */
try{
  const oldBoss=typeof v311BossForQuest==='function'?v311BossForQuest:null;
  const exact=function(q){const sp=specForQuest(q);return sp?[sp.enemyIcon,sp.enemy]:(oldBoss?oldBoss(q):['👹','Quest-Gegner'])};
  v311BossForQuest=exact;window.v311BossForQuest=exact;
}catch(e){console.warn('V6.347 quest enemy bridge',e)}

function liveQuests(){
  try{
    if(Array.isArray(s?.quests?.offers)&&s.quests.offers.length)return s.quests.offers.slice(0,3);
    if(Array.isArray(s?.quests?.available)&&s.quests.available.length)return s.quests.available.slice(0,3);
  }catch(_){ }
  return [];
}
function v7193QuestEnemyKey(name){
  return String(name||'quest-gegner').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'quest-gegner';
}
function asset(path){
  path=String(path||'');if(!path)return '';
  try{if(!/^(file:|capacitor:|ionic:)$/i.test(String(location?.protocol||'')))return `${path}${path.includes('?')?'&':'?'}gl=v6344q`}catch(_){ }
  return path;
}
const v7291QuestAssetCache=new Map();
let v7291QuestWarmSeq=0,v7291QuestReadySig='';
function v7291QuestSpec(q){return specForQuest(q)||{scene:q?.v6344Scene,enemy:q?.v6344EnemyName,enemyArt:q?.v6344EnemyArt}}
function v7291QuestAssetReady(url){
  url=String(url||'');if(!url)return Promise.resolve(true);
  if(v7291QuestAssetCache.has(url))return v7291QuestAssetCache.get(url);
  const p=new Promise(resolve=>{
    try{
      const im=new Image();let done=false;const finish=ok=>{if(done)return;done=true;resolve(ok)};
      im.onload=()=>{try{const d=im.decode?.();if(d&&typeof d.then==='function')d.then(()=>finish(true)).catch(()=>finish(true));else finish(true)}catch(_){finish(true)}};
      im.onerror=()=>finish(false);im.decoding='async';im.src=url;
      if(im.complete&&im.naturalWidth>0)finish(true);
    }catch(_){resolve(false)}
  });
  v7291QuestAssetCache.set(url,p);return p;
}
function v7291QuestAssetSet(qs){
  const urls=[];
  (qs||[]).slice(0,3).forEach(q=>{const sp=v7291QuestSpec(q);if(sp?.scene)urls.push(asset(sp.scene));const ea=sp?.enemyArt||ENEMY_ART[sp?.enemy]||'';if(ea)urls.push(asset(ea))});
  return [...new Set(urls.filter(Boolean))];
}
function v7291QuestAssetSignature(qs){return v7291QuestAssetSet(qs).join('|')}
function v7291WarmQuestAssets(qs){return Promise.allSettled(v7291QuestAssetSet(qs).map(v7291QuestAssetReady))}
window.v7291WarmQuestAssets=()=>v7291WarmQuestAssets(liveQuests());

function decorateQuestCard(card,q){
  if(!card||!q)return;
  const sp=specForQuest(q)||{scene:q.v6344Scene,enemy:q.v6344EnemyName,enemyArt:q.v6344EnemyArt};
  if(!sp?.scene)return;
  const title=card.querySelector('.v386-title'),desc=card.querySelector('.v386-desc');
  const nextTitle=String(q.name||q.title||'Auftrag');
  const nextDesc=String(q.text||q.description||q.desc||'Ein neuer Auftrag wartet auf dich.');
  if(title&&title.textContent!==nextTitle)title.textContent=nextTitle;
  if(desc&&desc.textContent!==nextDesc)desc.textContent=nextDesc;
  const art=card.querySelector('.v386-scene-art');if(!art)return;
  const sceneKey=String(sp.scene||'');
  if(art.dataset.v6344Scene!==sceneKey){
    art.style.setProperty('background',`linear-gradient(180deg,rgba(4,9,6,.02) 0%,rgba(4,9,6,.16) 52%,rgba(4,9,6,.86) 100%),url("${asset(sp.scene)}") center/cover no-repeat`,'important');
    art.dataset.v6344Scene=sceneKey;
  }
  const enemyArt=sp.enemyArt||ENEMY_ART[sp.enemy]||'';
  let img=art.querySelector(':scope > .v6344-card-enemy');
  if(enemyArt){
    const src=asset(enemyArt);
    if(!img){img=document.createElement('img');img.className='v6344-card-enemy';img.decoding='async';img.draggable=false;art.appendChild(img)}
    if(img.dataset.v6344Src!==src){img.src=src;img.dataset.v6344Src=src}
    const alt=String(sp.enemy||'Quest-Gegner');if(img.alt!==alt)img.alt=alt;
    img.dataset.v7193Enemy=v7193QuestEnemyKey(alt);
  }else if(img){img.remove()}
  const scene=card.querySelector('.v386-scene');
  let tag=scene?.querySelector(':scope > .v6344-variety-tag');
  const tagText=`${sp.enemyIcon||ENEMY_ICON[sp.enemy]||'👹'} ${sp.enemy||'QUEST'}`;
  if(scene&&!tag){tag=document.createElement('div');tag.className='v6344-variety-tag';scene.appendChild(tag)}
  if(tag&&tag.textContent!==tagText)tag.textContent=tagText;
  card.dataset.v6344Quest=String(sp.id||'');
}
window.v6344DecorateQuestCard=decorateQuestCard;

function decorateCards(){
  const root=document.getElementById('quests');if(!root?.classList.contains('active'))return;
  const qs=liveQuests();
  root.querySelectorAll('.v386-list > .v386-card').forEach((card,i)=>decorateQuestCard(card,qs[i]));
  const active=s?.quests?.active;
  const activeCard=root.querySelector('.v392-active-view > .v386-card');
  if(active&&activeCard)decorateQuestCard(activeCard,active);
}
let v6344DecorRaf=0;
function schedule(){
  const root=document.getElementById('quests');
  if(!root?.classList.contains('active')||v6344DecorRaf)return;
  const qs=liveQuests(),sig=v7291QuestAssetSignature(qs);
  if(sig&&sig!==v7291QuestReadySig){
    const seq=++v7291QuestWarmSeq;root.classList.add('v7291-quest-art-warming');
    void v7291WarmQuestAssets(qs).then(()=>{
      if(seq!==v7291QuestWarmSeq)return;
      v7291QuestReadySig=sig;
      v6344DecorRaf=requestAnimationFrame(()=>{v6344DecorRaf=0;decorateCards();root.classList.remove('v7291-quest-art-warming');root.classList.add('v7291-quest-art-ready')});
    });
    return;
  }
  v6344DecorRaf=requestAnimationFrame(()=>{v6344DecorRaf=0;decorateCards();root.classList.remove('v7291-quest-art-warming');root.classList.add('v7291-quest-art-ready')});
}

/* One-time migration: replace the old repetitive trio immediately, but never destroy an active quest. */
function migrateCurrentOffers(){
  try{
    /* V7.127: server-authoritative quest offers must never be replaced by the
       historic local variety migration. The server already owns variety/art. */
    if(window.v7110QuestAuthorityEnforced?.())return false;
    s.v6344QuestRecent=Array.isArray(s.v6344QuestRecent)?s.v6344QuestRecent:[];
    if(s.v6344QuestVarietyMigrated)return false;
    if(s.quests?.active)return false;
    if(s.quests&&typeof makeQuest==='function'){
      s.v6344QuestRecent=[];
      s.quests.offers=[makeQuest(),makeQuest(),makeQuest()];
      s.v6344QuestVarietyMigrated=true;
      if(typeof persist==='function')persist(false);else localStorage.setItem(KEY,JSON.stringify(s));
      return true;
    }
  }catch(e){console.warn('V6.347 quest migration',e)}
  return false;
}

try{
  if(typeof renderQuests==='function'&&!window.__V6344_RENDER_QUESTS_WRAP__){
    const base=renderQuests;
    renderQuests=function(){
      try{window.v392SyncActiveMode?.()}catch(_){}
      try{window.v496RepairStalePaidQuest?.()}catch(_){}
      try{window.v316PrepareQuestRender?.()}catch(_){}
      try{window.v309PrepareQuestRender?.()}catch(_){}
      const r=base.apply(this,arguments);
      try{window.v309ScheduleQuestRolePaint?.()}catch(_){}
      try{window.v316ScheduleSkipPaint?.()}catch(_){}
      try{window.v386RenderQuestShell?.()}catch(_){}
      try{window.v392PaintActive?.()}catch(_){}
      try{window.v4172EnhanceQuestPage?.()}catch(_){}
      try{window.v4222RenderElitePanel?.()}catch(_){}
      try{window.v233BindClaimButton?.()}catch(_){}
      try{window.v4127ScheduleQuestSkip?.()}catch(_){}
      schedule();
      return r;
    };
    window.renderQuests=renderQuests;window.__V6344_RENDER_QUESTS_WRAP__=true;
  }
}catch(_){ }
try{
  if(!window.__V6344_QUEST_GO_WRAP__){
    window.__V6344_QUEST_GO_WRAP__='retired-v7122-render-owner';
  }
}catch(_){ }
document.addEventListener('click',e=>{if(e.target?.closest?.('#quests .v387-refresh,#quests #refreshQuests'))setTimeout(schedule,80)},true);
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>{migrateCurrentOffers();void v7291WarmQuestAssets(liveQuests());if(document.getElementById('quests')?.classList.contains('active'))schedule()},220));
window.addEventListener('growlegends:first-playable',()=>setTimeout(()=>void v7291WarmQuestAssets(liveQuests()),420),{passive:true});
window.addEventListener('pageshow',()=>setTimeout(()=>{migrateCurrentOffers();if(document.getElementById('quests')?.classList.contains('active'))schedule()},300),{passive:true});
setTimeout(()=>{migrateCurrentOffers();if(document.getElementById('quests')?.classList.contains('active'))schedule()},700);

window.v6344QuestVarietyDiagnostics=()=>({
  version:'V6.347',pool:POOL.length,recent:recent().slice(),
  offers:liveQuests().map(q=>({name:q.name,id:q.v6344QuestId,scene:q.v6344Scene,enemy:q.v6344EnemyName})),
  cards:[...document.querySelectorAll('#quests .v386-card')].map(c=>({quest:c.dataset.v6344Quest||'',enemy:c.querySelector('.v6344-variety-tag')?.textContent||''}))
});
})();
