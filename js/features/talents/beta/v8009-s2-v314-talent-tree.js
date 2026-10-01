/* ===== V4.02 Talentbaum 1-300 =====
   Replaces the old 3-card class skill UI.
   Earned points are derived from level (1 point every 2 levels), so old saves
   cannot lose points. All passive combat effects are read from one summary.
*/
const V314_BRANCHES={
 grower:[
  {id:'wucht',title:'⚔️ WUCHT',icon:'💥',theme:'Offensiver Wucht-Build',
   seg:['Stählerne Arme','Brutale Kraft','Zertrümmern','Kampfrausch','Hinrichter','Unbändige Kraft','Panzerbrecher'],
   mile:['Volltreffer','Schädelbrecher','Grüne Raserei','Blutbad','Berserker','Unaufhaltsam','BRUTALE ERNTE']},
  {id:'tank',title:'🛡️ ÜBERLEBEN',icon:'🛡️',theme:'Leben und Schadensreduktion',
   seg:['Zäher Stamm','Dicke Haut','Ausdauertraining','Regeneration','Dornenhaut','Unerschütterlich','Cannabis-Koloss'],
   mile:['Standhaft','Zäher Hund','Zweite Luft','Dickes Fell','Unerschütterlich+','Cannabis-Koloss+','UNKRAUT VERGEHT NICHT']},
  {id:'rage',title:'🌿 RASEREI',icon:'🔥',theme:'Mehrfachtreffer und Kampftrieb',
   seg:['Rasende Schläge','Blutdurst','Kampftrieb','Keine Gnade','Schmerz macht stark','Wahnsinn','Ewiger Kampf'],
   mile:['Anheizen','Blutrausch','Keine Gnade+','Schmerz macht stark+','Wahnsinn+','Ewiger Kampf+','EWIGE RASEREI']}
 ],
 scout:[
  {id:'precision',title:'🎯 PRÄZISION',icon:'🎯',theme:'Crit und gezielter Schaden',
   seg:['Sicherer Griff','Adlerauge','Tödliche Spitzen','Schwachstellen','Kopfschuss','Meisterschütze','Hinrichtung'],
   mile:['Präziser Treffer','Gezielter Schuss','Tödliche Präzision','Kopfschuss+','Meisterschütze+','Hinrichtung+','PERFEKTER SCHUSS']},
  {id:'dodge',title:'💨 AUSWEICHEN',icon:'🍃',theme:'Defensive Reflexe und Konter',
   seg:['Leichte Füße','Reflexe','Seitwärtsschritt','Konterschuss','Schattenläufer','Phantom','Meisterreflex'],
   mile:['Seitwärtsschritt+','Konterschuss+','Schattenläufer+','Akrobat','Phantom+','Meisterreflex+','UNBERÜHRBAR']},
  {id:'salvo',title:'🏹 SALVE',icon:'🏹',theme:'Doppel- und Mehrfachtreffer',
   seg:['Schnelle Hände','Zweiter Pfeil','Schnellfeuer','Dreifachschuss','Pfeilhagel','Blättersturm','Endlose Salve'],
   mile:['Doppelschuss','Schnellfeuer+','Dreifachschuss+','Pfeilhagel+','Blättersturm+','Endlose Salve+','GRÜNER HAGEL']}
 ],
 bruiser:[
  {id:'magic',title:'🔮 ZAUBERMACHT',icon:'🔮',theme:'Intelligenz und direkter Schaden',
   seg:['Tiefe Züge','Konzentrierter Rauch','Überladung','Rauchdetonation','Arkane Blüte','Bong-Meister','Grenzenlose Macht'],
   mile:['Überladung+','Rauchdetonation+','Arkane Blüte+','Übermacht','Bong-Meister+','Grenzenlose Macht+','SUPERNOVA']},
  {id:'critmagic',title:'💥 KRITISCHE MAGIE',icon:'⚡',theme:'Crit-Chance und Crit-Schaden',
   seg:['Instabiler Rauch','Überdruck','Funkenflug','Kettenfunke','Kritische Überladung','Explosion','Chaosmagie'],
   mile:['Funkenflug+','Kettenfunke+','Kritische Überladung+','Explosion+','Chaosmagie+','Meister der Instabilität','KETTENREAKTION']},
  {id:'smoke',title:'🌫️ RAUCHMAGIE',icon:'🌫️',theme:'Schutz, Nebel und Zermürbung',
   seg:['Dichter Rauch','Giftwolke','Rauchwand','Vergiftung','Giftiger Nebel','Rauchbarriere','Seelenrauch'],
   mile:['Rauchwand+','Vergiftung+','Giftiger Nebel+','Rauchbarriere+','Seelenrauch+','Endloser Nebel','TODESNEBEL']}
 ],
 summoner:[
  {id:'summon',title:'👻 BESCHWÖRUNG',icon:'👻',theme:'Häufigere und stärkere Begleiter',
   seg:['Dunstfunke','Stärkerer Ruf','Knochenpakt','Geistige Kette','Doppelruf','Rudelinstinkt','Meisterin der Toten'],
   mile:['Erste Stimme','Harzgebundener Diener','Zweiter Ruf','Geisterchor','Knochenparade','Dunstportal','DIE TOTEN GÄRTNERN MIT']},
  {id:'soul',title:'💚 SEELENRAUB',icon:'💚',theme:'Heilung, Leben und Überleben',
   seg:['Seelenfaden','Blutloser Durst','Schattenhaut','Rückfluss','Totenglück','Grabruhe','Unsterbliche Wurzel'],
   mile:['Erste Seele','Seelenmantel','Rückkehr','Zäher Geist','Grabernte','Letzte Reserve','NICHT GANZ TOT']},
  {id:'curse',title:'🌫️ FLUCHNEBEL',icon:'🌫️',theme:'Flüche, DoT und gegnerische Schwächung',
   seg:['Nebelsamen','Giftiger Atem','Verfluchte Knospe','Schwarzes Harz','Grabsporen','Todesdunst','Endloser Fluch'],
   mile:['Verfluchte Saat','Doppelfluch','Sporensturm','Nebelauge','Harzfäule','Friedhofswolke','ALLES WIRD KOMPOST']}
 ]
};
const V314_SEG_RANKS=[10,9,14,14,14,14,18];
const V314_LEVELS=[25,50,100,150,200,250,300];
const V314_REQ=[10,20,35,50,65,80,99];

function v314State(){
 s.v314Talents??={};
 s.v314Talents[s.playerClass]??={};
 return s.v314Talents[s.playerClass];
}
function v314Key(branch,kind,i){return `${branch}.${kind}${i}`}
function v314Rank(branch,kind,i){return Number(v314State()[v314Key(branch,kind,i)]||0)}
function v314BranchSpent(branch){
 let n=0;for(let i=0;i<7;i++)n+=v314Rank(branch,'s',i)+v314Rank(branch,'m',i);return n;
}
function v314Spent(){return (V314_BRANCHES[s.playerClass]||[]).reduce((a,b)=>a+v314BranchSpent(b.id),0)}
function v314Earned(){return Math.max(0,Math.floor((Number(s.level)||1)/2))}
function v314Available(){return Math.max(0,v314Earned()-v314Spent())}
function v314NodeUnlocked(branch,kind,i){
 if(kind==='s'){
   if(i===0)return true;
   return v314Rank(branch,'m',i-1)>0;
 }
 return (Number(s.level)||1)>=V314_LEVELS[i] && v314BranchSpent(branch)>=V314_REQ[i];
}
function v6257NormalTalentPrerequisite(branch,i){
 if(i<=0)return '';
 const b=(V314_BRANCHES[s.playerClass]||[]).find(x=>x.id===branch);
 const prev=String(b?.mile?.[i-1]||'vorheriges Schlüsseltalent');
 return `🔒 Benötigt zuerst: ${prev}`;
}
function v314Desc(branch,kind,i){
 if(kind==='m'){
  const lv=V314_LEVELS[i];
  return `${lv===300?'👑 Meistertalent':'⭐ Schlüsseltalent'} · ab Level ${lv} · benötigt ${V314_REQ[i]} Punkte im Ast.`;
 }
 const map={
  wucht:'Erhöht Wucht, Hauptattribut oder direkten Schaden.',
  tank:'Erhöht Leben, Ausdauer oder Schadensreduktion.',
  rage:'Erhöht Schaden und Chance auf zusätzliche Treffer.',
  precision:'Erhöht Geschick, Crit-Chance oder Crit-Schaden.',
  dodge:'Erhöht defensive Kampfwerte und Reaktionsvorteile.',
  salvo:'Erhöht Chance und Stärke von Mehrfachtreffern.',
  magic:'Erhöht Intelligenz und direkten Zauberschaden.',
  critmagic:'Erhöht Crit-Chance und Crit-Schaden.',
  smoke:'Erhöht Schutz und zermürbenden Kampfschaden.',
  summon:'Erhöht Beschwörungschance und Begleiterschaden.',
  soul:'Erhöht Lebensraub, Heilung und Überleben.',
  curse:'Erhöht Flüche, DoT und Durchdringung.'
 };
 return map[branch]||'Verbessert deinen Build.';
}
function v314Upgrade(branch,kind,i){
 if(v314Available()<1)return v115Alert('Keine Talentpunkte übrig.');
 if(!v314NodeUnlocked(branch,kind,i))return v115Alert('Dieses Talent ist noch gesperrt.');
 const max=kind==='m'?1:V314_SEG_RANKS[i],r=v314Rank(branch,kind,i);
 if(r>=max)return;
 v314State()[v314Key(branch,kind,i)]=r+1;
 persist();
}
window.v314Upgrade=v314Upgrade;

function v314Reset(){
 const cost=Math.max(500,Math.round((Number(s.level)||1)*500));
 if(!v314Spent())return v115Alert('Du hast noch keine Talentpunkte verteilt.');
 if((Number(s.gold)||0)<cost)return v115Alert(`Zurücksetzen kostet ${cost.toLocaleString('de-DE')} Gold.`);
 if(!confirm(`Talentbaum für ${cost.toLocaleString('de-DE')} Gold zurücksetzen?`))return;
 s.gold-=cost;s.v314Talents[s.playerClass]={};persist();
}
window.v314Reset=v314Reset;

function v314Summary(){
 const out={primaryPct:0,hpPct:0,damagePct:0,critChance:0,critDamage:0,damageReduce:0,wuchtChance:0,doubleChance:0};
 const add=(b,k,i,per)=>{out[k]+=v314Rank(b,'s',i)*per};
 if((s.playerClass==='grower'||s.playerClass==='frost')){
  add('wucht','damagePct',0,.006);add('wucht','primaryPct',1,.006);add('wucht','wuchtChance',2,.004);add('wucht','damagePct',3,.003);add('wucht','damagePct',4,.003);add('wucht','primaryPct',5,.005);add('wucht','wuchtChance',6,.003);
  add('tank','hpPct',0,.01);add('tank','damageReduce',1,.005);add('tank','hpPct',2,.006);add('tank','damageReduce',3,.002);add('tank','damageReduce',4,.002);add('tank','damageReduce',5,.002);add('tank','hpPct',6,.006);
  add('rage','doubleChance',0,.005);add('rage','damagePct',2,.004);add('rage','damagePct',3,.003);add('rage','damagePct',4,.003);add('rage','doubleChance',5,.003);add('rage','hpPct',6,.003);
 }else if(s.playerClass==='scout'){
  add('precision','primaryPct',0,.006);add('precision','critChance',1,.005);add('precision','critDamage',2,.02);add('precision','damagePct',3,.003);add('precision','critDamage',4,.01);add('precision','critChance',5,.003);add('precision','damagePct',6,.003);
  add('dodge','damageReduce',0,.004);add('dodge','damagePct',1,.002);add('dodge','damageReduce',2,.003);add('dodge','damagePct',3,.002);add('dodge','damageReduce',4,.002);add('dodge','damageReduce',5,.002);add('dodge','damageReduce',6,.002);
  add('salvo','doubleChance',0,.005);add('salvo','damagePct',1,.003);add('salvo','doubleChance',2,.003);add('salvo','doubleChance',3,.002);add('salvo','damagePct',4,.002);add('salvo','doubleChance',5,.002);add('salvo','damagePct',6,.002);
 }else if(s.playerClass==='bruiser'){
  add('magic','primaryPct',0,.006);add('magic','damagePct',1,.006);add('magic','damagePct',2,.003);add('magic','damagePct',3,.003);add('magic','primaryPct',4,.003);add('magic','primaryPct',5,.003);add('magic','damagePct',6,.003);
  add('critmagic','critChance',0,.005);add('critmagic','critDamage',1,.02);add('critmagic','damagePct',2,.002);add('critmagic','critChance',3,.002);add('critmagic','critDamage',4,.008);add('critmagic','critDamage',5,.008);add('critmagic','critChance',6,.002);
  add('smoke','damageReduce',0,.005);add('smoke','damagePct',1,.002);add('smoke','damageReduce',2,.003);add('smoke','damagePct',3,.002);add('smoke','damagePct',4,.002);add('smoke','damageReduce',5,.003);add('smoke','hpPct',6,.003);
 }
 /* Key/master nodes add controlled bonuses. Hard caps keep combat sane. */
 (V314_BRANCHES[s.playerClass]||[]).forEach(b=>{
   for(let i=0;i<7;i++)if(v314Rank(b.id,'m',i)){
    if(['wucht','rage','precision','salvo','magic','critmagic'].includes(b.id))out.damagePct+=i===6?.08:.012;
    if(['tank','dodge','smoke'].includes(b.id))out.damageReduce+=i===6?.05:.008;
    if(b.id==='precision'||b.id==='critmagic')out.critChance+=i===6?.04:.006;
    if(b.id==='salvo'||b.id==='rage')out.doubleChance+=i===6?.05:.006;
    if(b.id==='wucht')out.wuchtChance+=i===6?.05:.006;
    if(b.id==='tank')out.hpPct+=i===6?.12:.018;
    if(b.id==='magic')out.primaryPct+=i===6?.08:.012;
   }
 });
 out.critChance=Math.min(.40,out.critChance);
 out.doubleChance=Math.min(.25,out.doubleChance);
 out.wuchtChance=Math.min(.25,out.wuchtChance);
 out.damageReduce=Math.min(.35,out.damageReduce);
 out.critDamage=Math.min(.80,out.critDamage);
 out.damagePct=Math.min(.55,out.damagePct);
 out.hpPct=Math.min(.55,out.hpPct);
 out.primaryPct=Math.min(.35,out.primaryPct);
 return out;
}
window.v314TalentSummary=v314Summary;

/* Compatibility bridge: every old dungeon combat path now reads the new tree,
   instead of the removed 3-skill cards. */
skillValue=function(id){
 const t=v314Summary();
 const map={
  wucht:t.wuchtChance/.025, fell:t.damageReduce/.035, raserei:t.damagePct/.03,
  schnell:t.doubleChance/.025, tarn:t.damageReduce/.028, praez:t.critChance/.018,
  nebel:t.critChance/.025, mantel:t.damageReduce/.028, overload:t.critDamage/.055
 };
 return Math.max(0,Number(map[id]||0));
};
skillRank=skillValue;

const v314BaseTotalAttr=totalAttr;
totalAttr=function(k){
 let v=v314BaseTotalAttr(k),t=v314Summary();
 const pk=(s.playerClass==='grower'||s.playerClass==='frost')?'staerke':s.playerClass==='scout'?'geschick':'intelligenz';
 if(k===pk)v*=1+t.primaryPct;
 return Math.round(v*100)/100;
};
const v314BaseMaxHp=maxHp;
maxHp=function(){return Math.round(v314BaseMaxHp()*(1+v314Summary().hpPct))};

renderSkillTree=function(){
 const box=document.querySelector('#skillTree');if(!box)return;
 const pill=document.querySelector('#skillPoints');
 if(pill)pill.textContent=v314Available();
 if(!s.playerClass){box.innerHTML='<div class="empty">Wähle zuerst deine Klasse.</div>';return}
 const branches=V314_BRANCHES[s.playerClass]||[];
 const cost=Math.max(500,(Number(s.level)||1)*500);
 box.innerHTML=`<div class="v314-top">
   <div class="tiny">Verfügbar: <b>${v314Available()}</b> · Verteilt: <b>${v314Spent()}</b> / ${v314Earned()} verdient</div>
   <button class="btn secondary v314-reset" onclick="v314Reset()">↩️ Reset · ${cost.toLocaleString('de-DE')} Gold</button>
  </div><div class="v314-tree">`+
  branches.map(b=>`<section class="v314-branch">
   <div class="v314-branch-head"><div class="v314-branch-title">${b.title}</div><div class="v314-branch-points">${b.theme} · ${v314BranchSpent(b.id)}/100 Punkte</div></div>
   ${Array.from({length:7},(_,i)=>{
    const sr=v314Rank(b.id,'s',i),sm=V314_SEG_RANKS[i],su=v314NodeUnlocked(b.id,'s',i);
    const mr=v314Rank(b.id,'m',i),mu=v314NodeUnlocked(b.id,'m',i),master=i===6;
    return `<div class="v314-node ${su?'':'locked'} ${sr?'on':''}">
      <div class="v314-node-head"><span class="v314-node-icon">${b.icon}</span><span class="v314-node-name">${b.seg[i]}</span><span class="v314-node-rank">${sr}/${sm}</span></div>
      <div class="v314-node-desc">${v314Desc(b.id,'s',i)}</div>
      <button class="btn secondary" onclick="v314Upgrade('${b.id}','s',${i})" ${!su||sr>=sm||v314Available()<1?'disabled':''}>+ Talentpunkt</button>
     </div>
     <div class="v314-node milestone ${master?'master':''} ${mu?'':'locked'} ${mr?'on':''}">
      <div class="v314-node-head"><span class="v314-node-icon">${master?'👑':'⭐'}</span><span class="v314-node-name">${b.mile[i]}</span><span class="v314-node-rank">${mr}/1</span></div>
      <div class="v314-node-desc">${v314Desc(b.id,'m',i)}</div>
      <button class="btn ${master?'gold':'secondary'}" onclick="v314Upgrade('${b.id}','m',${i})" ${!mu||mr||v314Available()<1?'disabled':''}>${master?'Meistertalent lernen':'Freischalten'}</button>
      ${!mu?`<div class="v314-lock">🔒 Level ${V314_LEVELS[i]} · ${V314_REQ[i]} Astpunkte</div>`:''}
     </div>`;
   }).join('')}
  </section>`).join('')+`</div>`;
};

/* Old saved class skills are intentionally retired. Points are level-derived,
   so migration is deterministic and nobody loses earned talent points. */
try{s.v314Talents??={}}catch(e){}

/* v543 owns the live talent tree. No global render wrapper here. */
