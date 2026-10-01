const KEY='growLegendsV020', OLD_KEYS=['growLegendsV016','growLegendsV015','growLegendsV014','growLegendsV013','growLegendsV0121','growLegendsV012','growLegendsV011','growLegendsV010','growLegendsV09','growLegendsV08','growLegendsV07','growLegendsV06','growLegendsV05','growLegendsV04','growLegendsV03','growLegendsV02','growLegendsV01'];
const defaultState={playerClass:null,classLocked:false,skillPoints:0,classSkills:{},harzTaler:6,shopRefreshes:0,lastShopSeed:0,dungeonPass:{lastFree:0},story:{chapter:1,bossesDefeated:0},level:1,xp:0,gold:120,points:0,energy:100,lastEnergy:Date.now(),attrs:{staerke:5,geschick:5,intelligenz:5,ausdauer:5,glueck:5,growSkill:1},equipment:{head:null,weapon:null,weapon2:null,ring:null,body:null,boots:null,amulet:null},inventory:[],grow:{planted:false,start:0,duration:60000,ready:false,roomLevel:1,plants:[],seeds:{moss:2},equipment:{lamp:0,pots:0},selectedSeed:'moss'},dungeon:{room:0,selected:0,unlocked:[0],completed:[],view:'map'},quests:{offers:[],active:null}};
let raw=localStorage.getItem(KEY);if(!raw){for(const k of OLD_KEYS){if(localStorage.getItem(k)){raw=localStorage.getItem(k);break}}}
let s=raw?JSON.parse(raw):structuredClone(defaultState);s.skillPoints??=Math.max(0,Math.floor((s.level-1)/2));s.attrs??={};s.attrs.intelligenz??=5;s.classSkills??={};s.playerClass??=null;s.classLocked??=!!s.playerClass;s.harzTaler??=6;s.shopRefreshes??=0;s.lastShopSeed??=0;s.dungeonPass??={lastFree:0};s.dungeonPass.lastFree??=0;if(s.playerClass&&!s.classLocked)s.classLocked=true;s.story??={chapter:1,bossesDefeated:0};s.story.chapter??=1;s.story.bossesDefeated??=0;s.energy??=100;s.lastEnergy??=Date.now();s.quests??={offers:[],active:null};s.quests.offers??=[];s.quests.active??=null;s.grow??={roomLevel:1,plants:[]};s.grow.roomLevel??=1;s.grow.plants??=[];s.grow.seeds??={moss:2};s.grow.equipment??={lamp:0,pots:0};s.grow.selectedSeed??='moss';if(s.grow.planted&&s.grow.plants.length===0)s.grow.plants.push({start:s.grow.start||Date.now(),duration:s.grow.duration||60000});s.dungeon??={room:0,selected:0,unlocked:[0],completed:[]};s.dungeon.room??=0;s.dungeon.selected??=0;s.dungeon.unlocked??=[0];s.dungeon.completed??=[];s.dungeon.progress??={};if(s.dungeon.progress[s.dungeon.selected]==null){
 s.dungeon.progress[s.dungeon.selected]=(Number(s.dungeon.selected)===0)
  ?Math.max(0,Math.min(9,Number(s.dungeon.room)||0))
  :0;
}if(!s.dungeon.unlocked.includes(0))s.dungeon.unlocked.push(0);s.dungeon.view??='map';if(!s.devTestHarzGranted){s.devTestHarzGranted=true;}

// V4.02 robust save-state normalization
function normalizeItem(it){
 if(!it || typeof it!=='object') return null;
 const out={...it};
 out.id ??= `legacy_${Date.now()}_${Math.random()}`;
 out.name ??= 'Unbekanntes Item';
 out.slot ??= 'ring';
 out.icon ??= '🎁';
 out.price = Number.isFinite(+out.price)?+out.price:0;
 out.bonus = (out.bonus && typeof out.bonus==='object')?out.bonus:{};
 /* Inventory first-paint authority: quality is canonical. Old saves can carry
    stale rarity values (for example quality='purple' + rarity='mythic').
    Canonicalize here, before the very first inventory paint, instead of waiting
    for the late V6.84 visual repair. */
 const q=String(out.quality||'').toLowerCase();
 const rarityByQuality={
  gray:'common-gray',green:'uncommon',blue:'rare',purple:'epic',
  orange:'legendary',cyan:'mythic',prismatic:'prismatic-orange'
 };
 if(out.v488Prismatic===true || q==='prismatic'){
   out.quality='prismatic';
   out.rarity='prismatic-orange';
 }else if(rarityByQuality[q]){
   out.rarity=rarityByQuality[q];
 }else{
   out.rarity ??= 'common-gray';
 }
 return out;
}
function normalizeState(){
 if(!Array.isArray(s.inventory)) s.inventory=[];
 s.inventory=s.inventory.map(normalizeItem).filter(Boolean);
 s.equipment=(s.equipment&&typeof s.equipment==='object')?s.equipment:{};
 ['head','weapon','weapon2','ring','body','boots','amulet'].forEach(k=>s.equipment[k]=normalizeItem(s.equipment[k]));
 s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};
 s.grow.roomLevel=Math.min(4,Math.max(1,parseInt(s.grow.roomLevel||1)));
 s.grow.plants=Array.isArray(s.grow.plants)?s.grow.plants:[];
 s.grow.seeds=(s.grow.seeds&&typeof s.grow.seeds==='object')?s.grow.seeds:{moss:2};
 Object.keys(seedTypes||{}).forEach(id=>s.grow.seeds[id]=Math.max(0,parseInt(s.grow.seeds[id]||0)));
 s.grow.equipment=(s.grow.equipment&&typeof s.grow.equipment==='object')?s.grow.equipment:{lamp:0,pots:0};
 s.grow.equipment.lamp=Math.min(5,Math.max(0,parseInt(s.grow.equipment.lamp||0)));
 s.grow.equipment.pots=Math.min(5,Math.max(0,parseInt(s.grow.equipment.pots||0)));
 s.grow.selectedSeed = seedTypes?.[s.grow.selectedSeed] ? s.grow.selectedSeed : 'moss';
 s.grow.plants=s.grow.plants.map(p=>{
   if(!p||typeof p!=='object') return null;
   const seed=seedTypes?.[p.seed]?p.seed:'moss';
   const start=Number.isFinite(+p.start)?+p.start:Date.now();
   const duration=Math.max(1000,Number.isFinite(+p.duration)?+p.duration:seedTypes[seed].growMs*lampSpeed());
   return {start,duration,seed};
 });
}


const classes={
 grower:{name:'Bud-Barbar',icon:'⚔️',text:'Brutal und zäh. Viel Stärke und Ausdauer. Chance auf Wuchtschlag.',bonus:{staerke:4,ausdauer:3}},
 scout:{name:'Blatt-Schütze',icon:'🏹',text:'Schnell und präzise. Viel Geschick und Glück. Chance auf zweiten Treffer.',bonus:{geschick:4,glueck:3}},
 bruiser:{name:'Bong-Magier',icon:'🔮',text:'Explosive Spezialangriffe. Intelligenz erhöht Schaden und Kampfkraft.',bonus:{intelligenz:4,glueck:3}},
 summoner:{name:'Harzruferin',icon:'🕯️',text:'Beschwörerin aus Nebel, Harz und Knochen. Flüche, Seelenraub und sichtbare Begleiter.',bonus:{intelligenz:4,ausdauer:3}}
};


const skillDefs={
 grower:[
  {id:'wucht',icon:'💥',name:'Wuchtschlag',unlock:2,desc:'Erhöht die Chance auf einen besonders harten Treffer.',perRank:'+3 % Wuchtschlag-Chance'},
  {id:'fell',icon:'🛡️',name:'Dickes Fell',unlock:5,desc:'Reduziert eingehenden Schaden im Dungeon.',perRank:'-4 % erhaltener Schaden'},
  {id:'raserei',icon:'🔥',name:'Harz-Raserei',unlock:8,desc:'Erhöht deinen gesamten verursachten Schaden.',perRank:'+4 % Gesamtschaden'}
 ],
 bruiser:[
  {id:'nebel',icon:'💨',name:'Nebelstoß',unlock:2,desc:'Erhöht deine Chance auf kritische Magietreffer.',perRank:'+3 % Crit-Chance'},
  {id:'mantel',icon:'🌫️',name:'Rauchmantel',unlock:5,desc:'Senkt den Schaden gegnerischer Angriffe.',perRank:'-3 % erhaltener Schaden'},
  {id:'overload',icon:'⚡',name:'Bong-Überladung',unlock:8,desc:'Kritische Treffer verursachen zusätzlichen Schaden.',perRank:'+7 % Crit-Schaden'}
 ],
 scout:[
  {id:'schnell',icon:'🏹',name:'Schnellschuss',unlock:2,desc:'Erhöht die Chance auf einen Doppeltreffer.',perRank:'+3 % Doppeltreffer-Chance'},
  {id:'tarn',icon:'🍃',name:'Tarnblatt',unlock:5,desc:'Reduziert eingehenden Schaden durch geschickte Ausweichmanöver.',perRank:'-3 % erhaltener Schaden'},
  {id:'praez',icon:'🎯',name:'Blatt-Präzision',unlock:8,desc:'Erhöht deine kritische Trefferchance.',perRank:'+2 % Crit-Chance'}
 ],
 summoner:[
  {id:'stimmen',icon:'👻',name:'Stimmen im Nebel',unlock:2,desc:'Erhöht die Chance auf einen Ruf aus dem Dunst.',perRank:'+3 % Beschwörungschance'},
  {id:'seelenzug',icon:'💚',name:'Seelenzug',unlock:5,desc:'Entzieht Gegnern Lebensenergie.',perRank:'+0,8 % Lebensraub'},
  {id:'totenharz',icon:'☠️',name:'Totenharz',unlock:8,desc:'Verstärkt den Schaden deiner Begleiter.',perRank:'+5 % Begleiterschaden'}
 ]
};
function skillRank(id){return s.classSkills?.[id]||0}
function skillValue(id){return skillRank(id)}
function renderSkillTree(){
 const box=document.querySelector('#skillTree');if(!box)return;
 document.querySelector('#skillPoints')&&(document.querySelector('#skillPoints').textContent=s.skillPoints);
 if(!s.playerClass){box.innerHTML='<div class="empty">Wähle zuerst deine Klasse.</div>';return}
 const defs=skillDefs[s.playerClass]||[];
 box.innerHTML=defs.map(sk=>{
   const r=skillRank(sk.id),unlocked=s.level>=sk.unlock,maxed=r>=5;
   return `<div class="skill-card ${unlocked?'':'locked'}">
    <div class="skill-head"><div class="skill-icon">${sk.icon}</div><div><div class="skill-title">${sk.name}</div><div class="skill-level">${unlocked?`Rang ${r}/5`:`Freischaltung Level ${sk.unlock}`}</div></div></div>
    <div class="skill-desc">${sk.desc}<br><b>${sk.perRank}</b></div>
    <div class="skill-ranks">${[1,2,3,4,5].map(x=>`<span class="rank-dot ${r>=x?'on':''}"></span>`).join('')}</div>
    <div class="skill-footer"><span class="unlock-note">${unlocked?(maxed?'MAXIMAL':'1 Talentpunkt pro Rang'):`🔒 Ab Level ${sk.unlock}`}</span><button class="btn secondary" style="padding:7px 10px" onclick="upgradeSkill('${sk.id}')" ${!unlocked||maxed||s.skillPoints<1?'disabled':''}>Verbessern</button></div>
   </div>`;
 }).join('');
}
window.upgradeSkill=id=>{
 if(!s.playerClass)return;
 const sk=(skillDefs[s.playerClass]||[]).find(x=>x.id===id);if(!sk)return;
 if(s.level<sk.unlock)return v115Alert(`Ab Level ${sk.unlock} verfügbar.`);
 if(s.skillPoints<1)return v115Alert('Keine Talentpunkte übrig.');
 if(skillRank(id)>=5)return;
 s.skillPoints--;s.classSkills[id]=skillRank(id)+1;persist();
}
const classSets={
 grower:{name:'Harzbrecher',className:'Bud-Barbar',bonuses:{2:'2 Teile: +5 Stärke',4:'4 Teile: +10 % Lebenspunkte',6:'6 Teile: +8 % Wuchtschlag-Chance'}},
 bruiser:{name:'Nebelzirkel',className:'Bong-Magier',bonuses:{2:'2 Teile: +5 Intelligenz',4:'4 Teile: +10 % Crit-Chance',6:'6 Teile: Krits verursachen +25 % Schaden'}},
 scout:{name:'Grünpfeil',className:'Blatt-Schütze',bonuses:{2:'2 Teile: +5 Geschick',4:'4 Teile: +10 % Doppeltreffer-Chance',6:'6 Teile: Doppeltreffer +20 % Schaden'}},
 summoner:{name:'Sarggärtnerin',className:'Harzruferin',bonuses:{2:'2 Teile: +5 Intelligenz',4:'4 Teile: +5 % Beschwörungschance',6:'6 Teile: +20 % Begleiterschaden'}}
};
const setBases=[
{slot:'head',icon:'🪖',label:'Kopfschutz'},
{slot:'weapon',icon:'⚔️',label:'Waffe'},
{slot:'body',icon:'🦺',label:'Rüstung'},
{slot:'boots',icon:'🥾',label:'Stiefel'},
{slot:'ring',icon:'💍',label:'Ring'},
{slot:'amulet',icon:'📿',label:'Amulett'}
];

const classGear={
 grower:[
  {id:'bb_axe',name:'Harzspalter',slot:'weapon',icon:'🪓',price:240,classId:'grower',bonus:{staerke:6}},
  {id:'bb_helm',name:'Knospen-Kriegshelm',slot:'head',icon:'🪖',price:210,classId:'grower',bonus:{ausdauer:4,staerke:2}},
  {id:'bb_armor',name:'Verdichtete Harzrüstung',slot:'body',icon:'🛡️',price:310,classId:'grower',bonus:{ausdauer:7}},
  {id:'bb_boots',name:'Stampferstiefel',slot:'boots',icon:'🥾',price:190,classId:'grower',bonus:{staerke:3,ausdauer:2}}
 ],
 bruiser:[
  {id:'bm_staff',name:'Nebelstab',slot:'weapon',icon:'🪄',price:250,classId:'bruiser',bonus:{intelligenz:7}},
  {id:'bm_hat',name:'Kapuze des Dunstes',slot:'head',icon:'🧙',price:220,classId:'bruiser',bonus:{intelligenz:4,glueck:2}},
  {id:'bm_robe',name:'Robe des Nebelzirkels',slot:'body',icon:'🥋',price:320,classId:'bruiser',bonus:{intelligenz:4,ausdauer:3}},
  {id:'bm_boots',name:'Schwebeschuhe',slot:'boots',icon:'👢',price:200,classId:'bruiser',bonus:{intelligenz:3,geschick:2}}
 ],
 scout:[
  {id:'bs_bow',name:'Grünpfeil-Bogen',slot:'weapon',icon:'🏹',price:250,classId:'scout',bonus:{geschick:7}},
  {id:'bs_hood',name:'Blattkapuze',slot:'head',icon:'🥷',price:210,classId:'scout',bonus:{geschick:4,glueck:2}},
  {id:'bs_armor',name:'Rankenleder',slot:'body',icon:'🥼',price:300,classId:'scout',bonus:{geschick:4,ausdauer:3}},
  {id:'bs_boots',name:'Leisetreter',slot:'boots',icon:'👟',price:195,classId:'scout',bonus:{geschick:5}}
 ],
 summoner:[
  {id:'hr_staff',name:'Harzstab',slot:'weapon',icon:'🪄',price:250,classId:'summoner',bonus:{intelligenz:7}},
  {id:'hr_hood',name:'Nebelkapuze',slot:'head',icon:'🧙',price:220,classId:'summoner',bonus:{intelligenz:4,ausdauer:2}},
  {id:'hr_robe',name:'Sarggärtner-Robe',slot:'body',icon:'🥋',price:320,classId:'summoner',bonus:{ausdauer:5,intelligenz:2}},
  {id:'hr_boots',name:'Wurzelstiefel',slot:'boots',icon:'👢',price:200,classId:'summoner',bonus:{intelligenz:3,ausdauer:2}}
 ]
};
const allClassGear=Object.values(classGear).flat();
function classLabel(id){return classes[id]?.name||'Alle Klassen'}

function makeClassLoot(classId,source='normal'){
 const pool=classGear[classId]||classGear.grower,base=pool[Math.floor(Math.random()*pool.length)];
 let q=rollNormalQuality();
 if(source==='quest'){
   const r=Math.random();
   if(r<0.35)q='gray';
   else if(r<0.65)q='green';
   else if(r<0.87)q='blue';
   else if(r<0.97)q='purple';
   else q='orange';
 }
 if(source==='dungeon'){
   const r=Math.random();
   if(r<0.018)q='orange';
   else if(r<0.10)q='purple';
   else if(r<0.30)q='blue';
   else if(r<0.62)q='green';
   else q='gray';
 }
 if(source==='event')q='cyan';
 const meta=qualityMeta(q),boost=Math.max(0,Math.floor((s.level-1)/3));
 const bonus=Object.fromEntries(Object.entries(base.bonus).map(([k,v])=>[k,v+meta.mult+boost]));
 return {...base,price:0,name:`${meta.label}: ${base.name} [Lv.${s.level}]`,quality:q,rarity:meta.cls,dropLevel:s.level,bonus};
}
function v6170SetEnchant(it){return (Array.isArray(it?.enchants)&&it.enchants.length?it.enchants[0]:it?.enchant)||null}
function v6170SetNativeBonus(it){
 const combat=['staerke','geschick','intelligenz','ausdauer','glueck'],out={};
 const gem=it?.gem,e=v6170SetEnchant(it);
 combat.forEach(k=>{let v=Number(it?.bonus?.[k])||0;if(gem?.stat===k)v-=Number(gem.value)||0;if(k==='glueck'&&e?.effect==='luck')v-=Number(e.value)||0;if(v)out[k]=Math.max(0,Math.round(v*100)/100)});
 return out;
}
function v6170SetNativeTotal(it){try{if(typeof window.v447NativeTotal==='function')return Math.max(0,Number(window.v447NativeTotal(it))||0)}catch(_){}return Object.values(v6170SetNativeBonus(it)).reduce((n,v)=>n+(Number(v)||0),0)}
function v6170IsMystic(it){return String(it?.quality||'').toLowerCase()==='cyan'||/myth|myst/i.test(String(it?.rarity||''))}
function v6170SetClass(id){return (typeof classSets!=='undefined'&&classSets[id])?id:'grower'}
function v6170SetPrimary(classId){return classId==='scout'?'geschick':(classId==='bruiser'||classId==='summoner')?'intelligenz':'staerke'}
function v6170SetIcon(classId,slot){
 const m={grower:{head:'🪖',weapon:'🪓',body:'🛡️',boots:'🥾',ring:'💍',amulet:'📿'},scout:{head:'🥷',weapon:'🏹',body:'🥼',boots:'👟',ring:'💍',amulet:'📿'},bruiser:{head:'🧙',weapon:'🔮',body:'🥋',boots:'👢',ring:'💠',amulet:'🧿'},summoner:{head:'🧙',weapon:'🪄',body:'🥋',boots:'👢',ring:'💍',amulet:'🧿'}};
 return m[classId]?.[slot]||({head:'🪖',weapon:'⚔️',body:'🛡️',boots:'🥾',ring:'💍',amulet:'📿'}[slot]||'🧩');
}
function v6170BaseSetBonus(classId,slot,level){
 classId=v6170SetClass(classId);level=Math.max(1,Math.floor(Number(level)||1));
 const statMap={
  grower:{head:{ausdauer:4},weapon:{staerke:6},body:{ausdauer:6},boots:{staerke:3,ausdauer:2},ring:{staerke:3},amulet:{ausdauer:3,glueck:1}},
  bruiser:{head:{intelligenz:4,glueck:2},weapon:{intelligenz:6},body:{intelligenz:4,ausdauer:2},boots:{intelligenz:3,glueck:2},ring:{intelligenz:5},amulet:{intelligenz:3,glueck:2}},
  scout:{head:{geschick:4},weapon:{geschick:6},body:{ausdauer:3,geschick:3},boots:{geschick:5},ring:{glueck:3,geschick:2},amulet:{geschick:3,glueck:2}}
 };
 const src=statMap[classId]?.[slot]||{[v6170SetPrimary(classId)]:4};
 const levelBoost=Math.max(0,Math.floor((level-1)/3));
 return Object.fromEntries(Object.entries(src).map(([k,v])=>[k,Math.max(0,Number(v)||0)+levelBoost]));
}
function v6170GuaranteeSetBonus(bonus,classId,slot,competitor){
 const out={...bonus};
 if(!competitor||competitor?.setId||v6170IsMystic(competitor))return out;
 const oldBase=v6170SetNativeTotal(competitor),target=Math.ceil(oldBase*1.08),now=Object.values(out).reduce((n,v)=>n+(Number(v)||0),0);
 let missing=Math.max(0,target-now);if(!missing)return out;
 const pk=v6170SetPrimary(classId),primaryAdd=Math.ceil(missing*.72),hpAdd=missing-primaryAdd;
 out[pk]=(Number(out[pk])||0)+primaryAdd;
 if(hpAdd>0)out.ausdauer=(Number(out.ausdauer)||0)+hpAdd;
 return out;
}
function v6170BuildSetBonus(classId,slot,level,competitor){return v6170GuaranteeSetBonus(v6170BaseSetBonus(classId,slot,level),v6170SetClass(classId),slot,competitor)}
function makeSetItem(classId,slot){
 classId=v6170SetClass(classId);
 const set=classSets[classId]||classSets.grower,base=setBases.find(x=>x.slot===slot)||setBases[0],level=Math.max(1,Math.floor(Number(s?.level)||1));
 const competitor=s?.equipment?.[slot]||null,bonus=v6170BuildSetBonus(classId,slot,level,competitor);
 const minNativeTotal=Object.values(bonus).reduce((n,v)=>n+(Number(v)||0),0);return {id:`set_${classId}_${slot}_${Date.now()}_${Math.random()}`,classId,name:`${set.name}: ${base.label} [Lv.${level}]`,slot,icon:v6170SetIcon(classId,slot),price:0,quality:'purple',rarity:'epic',setId:classId,setName:set.name,dropLevel:level,bonus,v6170Guaranteed:true,v6170ForgeLevel:level,v6170MinNativeTotal:minNativeTotal};
}
function equippedSetCount(classId){return Object.values(s.equipment).filter(it=>it?.setId===classId).length}
function setBonusValue(kind){
 const n=equippedSetCount(s.playerClass);
 if((s.playerClass==='grower'||s.playerClass==='frost')){
   if(kind==='staerke'&&n>=2)return 5;
   if(kind==='hpPct'&&n>=4)return .10;
   if(kind==='wuchtChance'&&n>=6)return .08;
 }
 if(s.playerClass==='bruiser'){
   if(kind==='intelligenz'&&n>=2)return 5;
   if(kind==='critChance'&&n>=4)return .10;
   if(kind==='critDamage'&&n>=6)return .25;
 }
 if(s.playerClass==='scout'){
   if(kind==='geschick'&&n>=2)return 5;
   if(kind==='doubleChance'&&n>=4)return .10;
   if(kind==='doubleDamage'&&n>=6)return .20;
 }
 return 0;
}
const questTemplates=[
{name:'Miras verschwundene Lieferung',icon:'📦',text:'Mira aus der Taverne wartet auf eine Kiste, die nie angekommen ist.',base:1},
{name:'Borks verlorene Werkzeugkiste',icon:'🧰',text:'Der Händler Bork behauptet, seine beste Werkzeugkiste sei im alten Keller verschwunden.',base:1},
{name:'Ungeziefer im Hinterhof',icon:'🪲',text:'Rudi meldet, dass sich etwas durch die Beete am Schwarzen Brett frisst.',base:2},
{name:'Der fluchende Gartenzwerg',icon:'🧙',text:'Ein verzauberter Gartenzwerg vertreibt Händler und Gäste aus der Gasse.',base:2},
{name:'Nebel über dem Gewächshaus',icon:'🌫️',text:'Henk hat Licht im verlassenen Gewächshaus gesehen. Niemand soll dort sein.',base:3},
{name:'Jagd auf die Riesentrauerfliege',icon:'🪰',text:'Eine riesige Trauerfliege kreist über den Dächern von Grünhain.',base:3},
{name:'Spuren zum alten Labor',icon:'🧪',text:'Seltsame grüne Spuren führen aus einem zugemauerten Tunnel Richtung Labor.',base:4},
{name:'Der nächtliche Dachgarten',icon:'🌙',text:'Auf den Dächern bewegen sich Schatten. Rudi zahlt für jede brauchbare Information.',base:4}
]
const dungeonNames=[
 'Der verseuchte Keller','Das überwucherte Labor','Der toxische Dachgarten','Die Sporenkatakomben','Der Harz-Sumpf',
 'Die Schimmelminen','Der verbotene Gewächshaustrakt','Die Nebelkanäle','Der Dornenfriedhof','Das Labor unter Grünhain',
 'Die Kristall-Growhöhle','Der Schädlingsbunker','Die Wurzelgruft','Der Pilztempel','Das verseuchte Hochhaus',
 'Der Tunnel der Blattjäger','Die Harzfestung','Das schwarze Gewächshaus','Die Kammer des Grünfluchs','Der Thron der Milbenkaiserin'
];
const enemyWords=['Trauermücke','Blattlaus','Sporenwächter','Rankenbestie','Schimmelgolem','Milbenkrieger','Dornenläufer','Pilzmutant','Nachtfalter'];
const enemyIcons=['🪰','🐛','🍄','🌿','🪨','🕷️','🌵','🧟','🦋'];
const bossNames=['Milbenkönigin','Dr. Chlorophyll','Schädlingsfürst','Sporenfürst','Sumpfkoloss','Schimmelbaron','Gewächshaus-Wächter','Nebelkönig','Dornenhexer','Labor-Tyrann','Kristallbestie','Bunkerbrut','Wurzelkönig','Pilzorakel','Hochhaus-Mutant','Blattjäger-General','Harzritter','Schwarzer Gärtner','Grünfluch','Milbenkaiserin'];
function buildDungeon(i){
 // Progression: Dungeon 1 begleitet den Spieler fast bis Level 20.
 // Danach öffnet sich jeweils ungefähr alle 10 Level der nächste Dungeon.
 const minLevel=i===0?1:20+(i-1)*10;
 const scale=1+i*0.82;
 const firstDungeonLevels=[1,3,5,7,9,11,13,15,17,19];
 const enemies=Array.from({length:10},(_,r)=>{
   const boss=r===9;
   const requiredLevel=i===0?firstDungeonLevels[r]:minLevel+Math.min(9,r);
   let hp,xp,gold;
   if(i===0){
     const hpCurve=[60,95,135,185,245,315,390,470,560,700];
     hp=hpCurve[r];
     xp=boss?260:35+r*12;
     gold=boss?150:18+r*6;
   }else{
     const baseHp=95+r*34;
     hp=Math.round((boss?baseHp+180:baseHp)*scale);
     xp=Math.round((boss?180:55+r*12)*scale);
     gold=Math.round((boss?150:35+r*8)*scale);
   }
   return boss
    ?{name:`${bossNames[i]} – BOSS`,short:bossNames[i],icon:i===19?'👑':'💀',hp,xp,gold,boss:true,requiredLevel}
    :{name:`${enemyWords[(r+i)%enemyWords.length]} ${i+1}.${r+1}`,short:enemyWords[(r+i)%enemyWords.length],icon:enemyIcons[(r+i)%enemyIcons.length],hp,xp,gold,requiredLevel};
 });
 return {name:dungeonNames[i],minLevel,keyId:i===0?null:`stein_${i+1}`,keyName:i===0?null:`Schlüsselstein ${i+1}`,enemies};
}
const dungeons=Array.from({length:20},(_,i)=>buildDungeon(i));
const enemies=dungeons[0].enemies;
const items=[
{id:'cap',name:'Grower-Cap',slot:'head',icon:'🧢',price:70,bonus:{geschick:2}},
{id:'gloves',name:'Harz-Handschuhe',slot:'weapon',icon:'🧤',price:95,bonus:{staerke:3}},
{id:'hoodie',name:'Keller-Hoodie',slot:'body',icon:'🥼',price:110,bonus:{ausdauer:3}},
{id:'boots',name:'Gummistiefel +1',slot:'boots',icon:'🥾',price:80,bonus:{ausdauer:2}},
{id:'amulet',name:'Blatt-Amulett',slot:'amulet',icon:'📿',price:140,bonus:{glueck:3}},
{id:'ring',name:'Ring des grünen Daumens',slot:'ring',icon:'💍',price:160,bonus:{growSkill:2,glueck:1}},
{id:'mask',name:'Sporenmaske',slot:'head',icon:'🥽',price:220,bonus:{ausdauer:3,geschick:2}},
{id:'shears',name:'Titan-Schere',slot:'weapon',icon:'✂️',price:260,bonus:{staerke:5,geschick:1}},
{id:'vest',name:'Labor-Weste',slot:'body',icon:'🦺',price:290,bonus:{ausdauer:5,staerke:1}},
{id:'sneakers',name:'Hydro-Sneaker',slot:'boots',icon:'👟',price:240,bonus:{geschick:5}},
{id:'lucky',name:'Harz-Talisman',slot:'amulet',icon:'🧿',price:330,bonus:{glueck:6}},
{id:'masterring',name:'Ring des Meistergrowers',slot:'ring',icon:'💠',price:380,bonus:{growSkill:4,glueck:3}}
];
const slotLabels={head:['🧢','Kopf'],weapon:['⚔️','Waffe'],ring:['💍','Ring'],body:['🥼','Körper'],boots:['🥾','Schuhe'],amulet:['📿','Amulett']};
let battleBusy=false;
function makeQuest(){const t=questTemplates[Math.floor(Math.random()*questTemplates.length)],tier=Math.max(1,Math.min(5,Math.floor(s.level/4)+t.base)),duration=12+tier*8+Math.floor(Math.random()*10);const xp=Math.round(65+tier*28+s.level*4);return{id:Date.now()+Math.random(),name:t.name,icon:t.icon,text:t.text,tier,duration,energy:8+tier*4,xp,gold:14+tier*13}}
function ensureQuests(){if(!s.quests.offers.length&&!s.quests.active)s.quests.offers=[makeQuest(),makeQuest(),makeQuest()]}
function regenEnergy(){try{if(typeof v073User!=='undefined'&&v073User?.id&&window.v7081UseAuthority?.('quest'))return false}catch(_){}const now=Date.now(),step=180000,gained=Math.floor((now-s.lastEnergy)/step);if(gained>0){s.energy=Math.min(100,s.energy+gained);s.lastEnergy+=gained*step;if(s.energy>=100)s.lastEnergy=now;persist(false)}return true}
regenEnergy.__v7173ServerGuard=true;
function persist(draw=true){
 try{normalizeState()}catch(e){}
 let checkpointed=false;
 try{
   if(typeof v213LocalCheckpoint==='function')checkpointed=!!v213LocalCheckpoint('persist');
 }catch(e){}
 /* V7.193: v213LocalCheckpoint already writes KEY for durable accounts.
    Only fall back to the legacy direct write when no checkpoint was performed. */
 if(!checkpointed){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){console.warn('Persist local fallback',e)}}
 if(draw)render();
}
function xpNeed(){return s.level*100}
function addXp(n){
 s.xp+=n;
 while(s.level<300 && s.xp>=xpNeed()){
   s.xp-=xpNeed();s.level++;s.points+=2;
   if(s.level%2===0)s.skillPoints++;
 }
 if(s.level>=300)s.xp=0;
}
function totalAttr(k){let v=s.attrs[k]||0;const cb=classes[s.playerClass]?.bonus?.[k]||0;v+=cb;Object.values(s.equipment).forEach(it=>{if(it?.bonus?.[k])v+=it.bonus[k]});v+=setBonusValue(k);return v}
function combatPower(){const cls=s.playerClass||'grower',pk=cls==='scout'?'geschick':(cls==='bruiser'||cls==='summoner')?'intelligenz':'staerke';return Math.round((Number(totalAttr(pk))||0)*6+(Number(totalAttr('ausdauer'))||0)*2+(Number(totalAttr('glueck'))||0)+(Number(s.level)||1)*6)}function maxHp(){const base=80+totalAttr('ausdauer')*8+s.level*5;return Math.round(base*(1+setBonusValue('hpPct')))}


function qualityMeta(q){
 return {
  gray:{label:'Normal',cls:'common-gray',color:'q-gray',mult:0},
  green:{label:'Gewöhnlich',cls:'uncommon',color:'q-green',mult:1},
  blue:{label:'Rare',cls:'rare',color:'q-blue',mult:2},
  purple:{label:'Episch',cls:'epic',color:'q-purple',mult:3},
  orange:{label:'Legendär',cls:'legendary',color:'q-orange',mult:5},
  cyan:{label:'Mystisch',cls:'mythic',color:'q-cyan',mult:7}
 }[q]||{label:'Normal',cls:'common-gray',color:'q-gray',mult:0};
}
function rollNormalQuality(){
 const r=Math.random();
 if(r<0.52)return 'gray';
 if(r<0.80)return 'green';
 if(r<0.95)return 'blue';
 return 'purple';
}
function makeLoot(base,source='normal'){
 let q=rollNormalQuality();
 if(source==='dungeon'){
   const r=Math.random();
   if(r<0.018)q='orange';          // dungeon-only legendary
   else if(r<0.10)q='purple';
   else if(r<0.30)q='blue';
   else if(r<0.62)q='green';
   else q='gray';
 }
 if(source==='event')q='cyan';     // event-only mystic
 const m=qualityMeta(q), levelBoost=Math.max(0,Math.floor((s.level-1)/3));
 const bonus=Object.fromEntries(Object.entries(base.bonus).map(([k,v])=>[k,v+m.mult+levelBoost]));
 return {...base,price:0,name:`${m.label}: ${base.name} [Lv.${s.level}]`,quality:q,rarity:m.cls,dropLevel:s.level,bonus};
}
function itemBonus(it){return Object.entries(it?.bonus||{}).map(([k,v])=>`+${v} ${k.replace('staerke','Stärke').replace('geschick','Geschick').replace('ausdauer','Ausdauer').replace('glueck','Glück').replace('growSkill','Grow')}`).join(' · ')}

function sellValue(it){
 const rarityMult={common:.35,rare:.55,epic:.8,legendary:1.15};
 const base=it?.price&&it.price>0?it.price:80+Object.values(it?.bonus||{}).reduce((a,b)=>a+b,0)*18;
 return Math.max(10,Math.round(base*(rarityMult[it?.rarity]||.4)));
}
function renderClasses(){
 const box=document.querySelector('#classGrid');if(!box)return;
 box.innerHTML=Object.entries(classes).map(([id,c])=>`<button class="class-card ${s.playerClass===id?'active':''}" onclick="chooseClass('${id}')" ${s.classLocked?'disabled':''}><div class="class-icon">${c.icon}</div><h4>${c.name}</h4><p>${c.text}</p></button>`).join('')+
 (s.classLocked?`<div class="lock-note" style="grid-column:1/-1">🔒 Klasse festgelegt: <b>${classes[s.playerClass]?.name}</b>. Die Klasse kann für diesen Charakter nicht mehr gewechselt werden.</div>`:`<div class="lock-note" style="grid-column:1/-1">Wähle deine Klasse einmalig. Danach ist sie für diesen Charakter fest.</div>`);
}

window.chooseClass=id=>{if(!classes[id])return;if(s.classLocked)return v115Alert('Deine Klasse ist bereits festgelegt.');if(!confirm(`${classes[id].name} wirklich als feste Klasse wählen?`))return;s.playerClass=id;s.classLocked=true;persist()};
window.sellItem=i=>{const it=s.inventory[i];if(!it)return;const value=sellValue(it);if(!confirm(`${it.name} für ${value} Gold verkaufen?`))return;s.gold+=value;s.inventory.splice(i,1);persist()};

function renderSetPanel(){
 const box=document.querySelector('#setPanel');if(!box)return;
 const set=classSets[s.playerClass||'grower'],n=s.playerClass?equippedSetCount(s.playerClass):0;
 box.innerHTML=`<div class="set-panel"><div class="set-title">${set.name} · ${n}/6 Teile</div>
 ${[2,4,6].map(x=>`<div class="set-bonus ${n>=x?'active':''}">${n>=x?'✅':'⬜'} ${set.bonuses[x]}</div>`).join('')}</div>`;
}

function renderClassAvatar(){
 const data={
  grower:{face:'🧔‍♂️',prop:'🌿',leaf:'🍃',title:'Bud-Barbar',sub:'Der Harzbrecher'},
  bruiser:{face:'🧙‍♂️',prop:'💨',leaf:'🔮',title:'Bong-Magier',sub:'Meister des Nebelzirkels'},
  scout:{face:'🧝‍♂️',prop:'🏹',leaf:'🍃',title:'Blatt-Schütze',sub:'Jäger des Grünpfeils'},
  frost:{face:'🥶',prop:'⚔️',leaf:'❄️',title:'Bekiffter Frost-Todesritter',sub:'Ritter des Eisnebels'},
  summoner:{face:'🧙‍♀️',prop:'👻',leaf:'🕯️',title:'Harzruferin',sub:'Herrin von Nebel, Knochen und Bud-Geistern'}
 }[s.playerClass]||{face:'❓',prop:'🌱',leaf:'',title:'Klasse wählen',sub:'Wähle deine Klasse im Heldenquartier'};
 const xpNeedValue=(typeof xpNeed==='function'?xpNeed():Math.max(100,(Number(s.level)||1)*100)),pct=Math.min(100,(s.xp/xpNeedValue)*100);
 document.querySelector('#classAvatarBig')&&(document.querySelector('#classAvatarBig').textContent=data.face);
 document.querySelector('#avatarProp')&&(document.querySelector('#avatarProp').textContent=data.prop);
 document.querySelector('#avatarLeaf')&&(document.querySelector('#avatarLeaf').textContent=data.leaf);
 document.querySelector('#avatarTitle')&&(document.querySelector('#avatarTitle').textContent=data.title);
 document.querySelector('#avatarSubtitle')&&(document.querySelector('#avatarSubtitle').textContent=data.sub);
 document.querySelector('#centerLevel')&&(document.querySelector('#centerLevel').textContent=s.level);
 document.querySelector('#centerXpText')&&(document.querySelector('#centerXpText').textContent=`${s.xp} / ${xpNeedValue}`);
 document.querySelector('#centerXpFill')&&(document.querySelector('#centerXpFill').style.width=pct+'%');
 document.querySelector('#topHarz')&&(document.querySelector('#topHarz').textContent=s.harzTaler);
}

function v296MysticSpecialText(it){
 const sp=it?.mysticSpecial;
 if(!sp)return '';
 const label=String(sp.label||'').trim();
 if(label)return label;
 const value=Number(sp.value)||0;
 const pct=Math.round(value*100);
 const names={
  hpPct:'Leben',
  mainPct:'Hauptattribut',
  wuchtChance:'Wuchtschlag',
  dodgeChance:'Ausweichen',
  doubleChance:'Doppeltreffer',
  critChance:'Krit',
  critDamage:'Krit-Schaden'
 };
 const name=names[sp.key]||String(sp.key||'Spezialeffekt');
 return `${pct>=0?'+':''}${pct} % ${name}`;
}
function v296MysticSpecialHtml(it){
 const txt=v296MysticSpecialText(it);
 return txt?`<div class="v296-mystic-special">✨ Spezialeffekt: ${txt}</div>`:'';
}

function comparison(it){
 if(!it||!it.slot)return '<span class="same">Keine Vergleichsdaten</span>';
 const old=s.equipment?.[it.slot];
 if(!old)return '<span class="better">↑ Slot ist leer</span>';
 const keys=new Set([...Object.keys(it.bonus||{}),...Object.keys(old.bonus||{})]);
 let score=0,parts=[];
 keys.forEach(k=>{const d=(it.bonus?.[k]||0)-(old.bonus?.[k]||0);score+=d;if(d)parts.push(`${d>0?'+':''}${d} ${k.replace('staerke','Stärke').replace('geschick','Geschick').replace('ausdauer','Ausdauer').replace('glueck','Glück').replace('growSkill','Grow')}`)});
 if(!parts.length)return '<span class="same">= Gleiche Werte</span>';
 return `<span class="${score>0?'better':score<0?'worse':'same'}">${parts.join(' · ')}</span>`;
}
window.unequip=sl=>{const it=s.equipment?.[sl];if(!it)return;s.inventory.push(it);s.equipment[sl]=null;persist()};
window.sellEquipped=sl=>{const it=s.equipment?.[sl];if(!it)return;const value=sellValue(it);if(!confirm(`${it.name} für ${value} Gold verkaufen?`))return;s.gold+=value;s.equipment[sl]=null;persist()};
function renderInventory(){
 const count=document.querySelector('#invCount'),box=document.querySelector('#inventory');
 if(!count||!box)return;
 if(!Array.isArray(s.inventory))s.inventory=[];
 count.textContent=`${s.inventory.length} Item${s.inventory.length===1?'':'s'}`;
 box.replaceChildren();
 if(!s.inventory.length){
   const empty=document.createElement('div');empty.className='empty';empty.textContent='Noch keine Ausrüstung gefunden.';box.appendChild(empty);return;
 }
 const grid=document.createElement('div');grid.className='inventory-grid';box.appendChild(grid);
 s.inventory.forEach((raw,i)=>{
   try{
     const it=normalizeItem(raw)||{name:'Unbekanntes Item',slot:'ring',icon:'🎁',bonus:{},price:0,rarity:'common-gray'};
     s.inventory[i]=it;
     const card=document.createElement('div');
     const v231RarityClass={
       gray:'common-gray',
       green:'common-green',
       blue:'rare-blue',
       purple:'epic-purple',
       orange:'legendary-orange',
       cyan:'mystic-cyan'
     }[it.quality] || it.rarity || 'common-gray';
     card.className=`inv-item ${v231RarityClass} ${it.rarity||''}`;
     const name=document.createElement('div');name.className='item-name';name.textContent=`${it.icon||'🎁'} ${it.name||'Unbekanntes Item'}`;card.appendChild(name);
     if(it.quality){const q=document.createElement('div');let qm={label:String(it.quality),color:'q-gray'};try{qm=qualityMeta(it.quality)||qm}catch(e){}q.className=`rarity-badge ${qm.color||'q-gray'}`;q.textContent=qm.label||String(it.quality);card.appendChild(q)}
     if(it.setName){const tag=document.createElement('div');tag.className='set-tag';tag.textContent=`${it.setName}-Set`;card.appendChild(tag)}
     if(it.classId){const tag=document.createElement('div');tag.className='set-tag';tag.textContent=`Klasse: ${classLabel(it.classId)}`;card.appendChild(tag)}
     const bonus=document.createElement('div');bonus.className='item-bonus';bonus.textContent=itemBonus(it)||'Keine Boni';card.appendChild(bonus);
     if(it.mysticSpecial){
       const special=document.createElement('div');
       special.className='v296-mystic-special';
       special.textContent=`✨ Spezialeffekt: ${v296MysticSpecialText(it)}`;
       card.appendChild(special);
     }
     const cmp=document.createElement('div');cmp.className='compare';try{cmp.innerHTML=comparison(it)}catch(e){cmp.textContent='Vergleich nicht verfügbar'}card.appendChild(cmp);
     const price=document.createElement('div');price.className='sell-price';let sv=0;try{sv=sellValue(it)}catch(e){}price.textContent=`Verkaufswert: 💰 ${sv}`;card.appendChild(price);
     const actions=document.createElement('div');actions.className='inv-actions';
     const equipBtn=document.createElement('button');equipBtn.className='btn secondary';equipBtn.style.padding='8px';equipBtn.textContent='Anlegen';equipBtn.onclick=()=>window.equip(i);
     const sellBtn=document.createElement('button');sellBtn.className='btn sell-btn';sellBtn.style.padding='8px';sellBtn.textContent='Verkaufen';sellBtn.onclick=()=>window.sellItem(i);
     actions.append(equipBtn,sellBtn);card.appendChild(actions);grid.appendChild(card);
   }catch(err){
     console.error('Inventar-Item konnte nicht gerendert werden',i,raw,err);
     const fallback=document.createElement('div');fallback.className='inv-item';fallback.innerHTML=`<div class="item-name">🎁 Item ${i+1}</div><div class="item-bonus">Anzeige repariert – gespeicherte Daten konnten nur teilweise gelesen werden.</div>`;grid.appendChild(fallback);
   }
 });
}

function render(){regenEnergy();ensureQuests();renderClasses();renderSetPanel();renderClassAvatar();renderSkillTree();document.querySelector('#className')&&(document.querySelector('#className').textContent=classes[s.playerClass]?.name||'Noch nicht gewählt');
 document.querySelector('#level')&&(document.querySelector('#level').textContent=s.level);document.querySelector('#charLevel')&&(document.querySelector('#charLevel').textContent=s.level);document.querySelector('#battleLevel').textContent=s.level;document.querySelector('#xp')&&(document.querySelector('#xp').textContent=`${s.xp}/${xpNeed()}`);document.querySelector('#gold')&&(document.querySelector('#gold').textContent=s.gold);document.querySelector('#shopGold').textContent=s.gold;document.querySelector('#shopHarz')&&(document.querySelector('#shopHarz').textContent=s.harzTaler);document.querySelector('#points')&&(document.querySelector('#points').textContent=s.points);document.querySelector('#energy')&&(document.querySelector('#energy').textContent=`${s.energy}/100`);document.querySelector('#dungeonTicketText')&&(document.querySelector('#dungeonTicketText').textContent=dungeonWaitText());document.querySelector('#power')&&(document.querySelector('#power').textContent=combatPower());document.querySelector('#charPower').textContent=combatPower();document.querySelector('#charHp').textContent=maxHp();document.querySelector('#storyChapter')&&(document.querySelector('#storyChapter').textContent=s.story.chapter);const bp=Math.min(100,(s.story.bossesDefeated/6)*100);document.querySelector('#bossProgressBar')&&(document.querySelector('#bossProgressBar').style.width=bp+'%');document.querySelector('#bossProgressText')&&(document.querySelector('#bossProgressText').textContent=s.story.bossesDefeated?`${s.story.bossesDefeated} Boss${s.story.bossesDefeated===1?'':'e'} besiegt · Kapitel ${s.story.chapter}`:'Noch kein Dungeonboss besiegt.');
 const map=[['staerke','💪 Stärke'],['geschick','🎯 Geschick'],['ausdauer','❤️ Ausdauer'],['glueck','🍀 Glück'],['growSkill','🌱 Grow-Skill']];document.querySelector('#attrs').innerHTML=map.map(([k,n])=>`<div class="attr"><span>${n}: <b>${totalAttr(k)}</b></span><button onclick="incAttr('${k}')" ${s.points<1?'disabled':''}>+</button></div>`).join('');
 Object.keys(slotLabels).forEach(sl=>{const el=document.querySelector('#slot-'+sl),it=s.equipment[sl],[ic,la]=slotLabels[sl];if(!el)return;el.className='slot'+(it?.rarity?(' '+it.rarity):'');const il=it?Math.max(1,Math.round(Number(it.level??it.dropLevel??it.itemLevel??it.reqLevel??it.sourceLevel??s.level)||1)):0;el.innerHTML=`<div class="slot-icon">${it?.icon||ic}</div><div class="slot-label">${la}</div><div class="slot-name">${it?it.name:'Leer'}</div>${it?`<div class="tiny">${itemBonus(it)}</div>${it.mysticSpecial?`<div class="v296-mystic-special">✨ Spezialeffekt: ${v296MysticSpecialText(it)}</div>`:''}${it.setName?`<div class="set-tag">${it.setName}-Set</div>`:''}<div class="slot-actions"><button class="mini-btn" onclick="unequip('${sl}')">Ablegen</button><button class="mini-btn" onclick="sellEquipped('${sl}')">💰 ${sellValue(it)}</button></div><div class="v514-slot-level">Lv.${il}</div>`:''}`});
 renderInventory();
 renderGrow();renderQuests();renderDungeon();renderShop();}
window.incAttr=k=>{if(s.points>0){s.points--;s.attrs[k]++;persist()}};window.equip=i=>{const it=s.inventory[i];if(!it)return;if(it.classId&&it.classId!==s.playerClass)return v115Alert(`Dieses Item ist nur für ${classLabel(it.classId)}.`);const old=s.equipment[it.slot];s.equipment[it.slot]=it;s.inventory.splice(i,1);if(old)s.inventory.push(old);persist()};


const seedTypes={
 moss:{name:'Moos-Mix',icon:'🌱',growMs:60000,buy:25,sell:34,quality:'Normal'},
 lime:{name:'Lime-Legende',icon:'🍋',growMs:90000,buy:55,sell:69,quality:'Gewöhnlich'},
 violet:{name:'Violetter Wirbel',icon:'🟣',growMs:135000,buy:95,sell:116,quality:'Rare'},
 nebula:{name:'Nebula Kush',icon:'✨',growMs:180000,buy:160,sell:188,quality:'Episch'}
};
normalizeState();
function lampSpeed(){return Math.max(.60,1-Math.min(5,(s.grow.equipment?.lamp||0))*0.08)}
function potYield(){return 1+Math.min(5,(s.grow.equipment?.pots||0))*0.10}
function growMessage(msg){
 const box=document.querySelector('#growFeedback');if(!box)return;
 box.textContent=msg;box.classList.add('show');clearTimeout(window._growMsgTimer);window._growMsgTimer=setTimeout(()=>box.classList.remove('show'),2600);
}
function renderSeedShop(){
 const box=document.querySelector('#seedShop');if(!box)return;
 s.grow.seeds??={moss:2};s.grow.selectedSeed??='moss';
 box.innerHTML=Object.entries(seedTypes).map(([id,x])=>`<div class="seed-card ${s.grow.selectedSeed===id?'selected':''}" data-seed="${id}">
   <div class="big">${x.icon}</div><h4>${x.name}</h4>
   <div class="tiny">${x.quality} · ${Math.round(x.growMs*lampSpeed()/1000)}s aktuell · Verkauf ${x.sell} Gold</div>
   <div class="tiny">Vorrat: <b>${s.grow.seeds[id]||0}</b></div>
   <button class="btn secondary seed-buy" data-seed="${id}" style="width:100%;margin-top:7px;padding:7px">Kaufen · ${x.buy} Gold</button>
   <button class="btn seed-select" data-seed="${id}" style="width:100%;margin-top:5px;padding:7px">${s.grow.selectedSeed===id?'✅ Ausgewählt':'Auswählen'}</button>
 </div>`).join('');
}
function renderGrowEquipment(){
 const box=document.querySelector('#growEquipment');if(!box)return;
 s.grow.equipment??={lamp:0,pots:0};
 const lamp=s.grow.equipment.lamp||0,pots=s.grow.equipment.pots||0;
 box.innerHTML=`<div class="equip-card"><div class="big">💡</div><h4>Lampen-Level ${Math.min(5,lamp)}</h4><div class="tiny">-8 % Wachstumszeit pro Level · Maximum Level 5</div><button class="btn secondary grow-upgrade" data-upgrade="lamp" style="width:100%;margin-top:7px" ${lamp>=5?'disabled':''}>${lamp>=5?'MAXIMUM':`Upgrade · ${120+lamp*140} Gold`}</button></div>
 <div class="equip-card"><div class="big">🪴</div><h4>Topf-Level ${Math.min(5,pots)}</h4><div class="tiny">+10 % Verkaufsertrag pro Level · Maximum Level 5</div><button class="btn secondary grow-upgrade" data-upgrade="pots" style="width:100%;margin-top:7px" ${pots>=5?'disabled':''}>${pots>=5?'MAXIMUM':`Upgrade · ${130+pots*150} Gold`}</button></div>`;
}
function buySeedAction(id){
 const x=seedTypes[id];if(!x)return;
 if(s.gold<x.buy){growMessage('Nicht genug Gold für diesen Samen.');return}
 s.gold-=x.buy;s.grow.seeds[id]=(s.grow.seeds[id]||0)+1;persist(false);renderGrow();document.querySelector('#gold')&&(document.querySelector('#gold').textContent=s.gold);growMessage(`${x.name}: 1 Samen gekauft.`);
}
function selectSeedAction(id){
 if(!seedTypes[id])return;s.grow.selectedSeed=id;persist(false);renderGrow();growMessage(`${seedTypes[id].name} ausgewählt.`);
}
function upgradeGrowAction(k){
 s.grow.equipment??={lamp:0,pots:0};const lv=s.grow.equipment[k]||0;
 if(lv>=5){growMessage('Dieses Growroom-Equipment ist bereits auf Maximum Level 5.');return}
 const c=(k==='lamp'?120:130)+lv*(k==='lamp'?140:150);
 if(s.gold<c){growMessage('Nicht genug Gold für das Upgrade.');return}
 s.gold-=c;s.grow.equipment[k]=lv+1;
 growMessage(k==='lamp'?`Lampe auf Level ${lv+1} verbessert.`:`Töpfe auf Level ${lv+1} verbessert.`);
 persist(false);renderGrow();document.querySelector('#gold')&&(document.querySelector('#gold').textContent=s.gold);
}
window.buySeed=buySeedAction;window.selectSeed=selectSeedAction;window.upgradeGrowEquip=upgradeGrowAction;
function growCapacity(){return Math.min(6,1+(s.grow.roomLevel-1)*2)}


function renderGrow(){
 renderSeedShop();renderGrowEquipment();
 const g=s.grow;g.plants??=[];g.seeds??={moss:2};g.equipment??={lamp:0,pots:0};g.selectedSeed??='moss';
 const cap=growCapacity(),now=Date.now(),readyPlants=g.plants.filter(p=>p&&now-p.start>=p.duration),ready=readyPlants.length,occupied=g.plants.filter(Boolean).length;
 document.querySelector('#roomLevel').textContent=g.roomLevel;
 document.querySelector('#upgradeRoom').disabled=g.roomLevel>=4;document.querySelector('#upgradeRoom').textContent=g.roomLevel>=4?'🏗️ Raum vollständig ausgebaut':`🏗️ Raum-Upgrade – ${150*g.roomLevel} Gold`;
 const avg=occupied?g.plants.filter(Boolean).reduce((a,p)=>a+Math.min(100,(now-p.start)/p.duration*100),0)/occupied:0;
 document.querySelector('#growBar').style.width=avg+'%';
 document.querySelector('#plantName').textContent=!occupied?'Leere Pflanzenplätze':ready?`${ready} Ernte(n) bereit`:`${occupied} Pflanze(n) wachsen`;
 document.querySelector('#growText').textContent=`${occupied}/${cap} Plätze belegt · ${ready} bereit · Auswahl: ${seedTypes[g.selectedSeed]?.name||'Moos-Mix'}`;
 document.querySelector('#plantBtn').disabled=occupied>=cap;
 document.querySelector('#plantBtn').textContent=`🌱 ${seedTypes[g.selectedSeed]?.name||'Samen'} pflanzen`;
 document.querySelector('#harvestBtn').disabled=ready===0;
 document.querySelector('#growShelf').innerHTML=Array.from({length:6},(_,i)=>{
   if(i>=cap)return`<div class="grow-slot locked"><span class="grow-slot-label">🔒 Raum-Upgrade</span><div class="plant-visual">🔒</div></div>`;
   const p=g.plants[i];
   if(!p)return`<div class="grow-slot open-slot" data-grow-slot="${i}"><span class="grow-slot-label">Platz ${i+1}</span><div class="plant-visual">🪴</div><button class="btn secondary slot-plant-btn" data-grow-slot="${i}">🌱 Hier pflanzen</button></div>`;
   const pct=Math.min(100,(now-p.start)/p.duration*100),stage=pct<25?'🌱':pct<65?'🌿':pct<100?'🌳':'✨🌳',seed=seedTypes[p.seed]||seedTypes.moss;
   return`<div class="grow-slot"><span class="grow-slot-label">${seed.icon} ${pct>=100?'Bereit':Math.floor(pct)+'%'}</span><div class="plant-visual">${stage}</div><div class="tiny">${seed.name}</div><div class="pot">🪴</div></div>`;
 }).join('');
}
function plantSelectedSeed(targetSlot=null){
 const g=s.grow,id=g.selectedSeed||'moss',seed=seedTypes[id];
 if(!seed){growMessage('Bitte zuerst einen Samen auswählen.');return}
 if(g.plants.filter(Boolean).length>=growCapacity()){growMessage('Alle freigeschalteten Pflanzenplätze sind belegt.');return}
 if((g.seeds[id]||0)<1){const msg=`Keine Samen von ${seed.name} vorhanden. Kaufe zuerst im Samen-Shop neue Samen.`;growMessage(msg);v115Alert('🌰 '+msg);return}
 const plant={start:Date.now(),duration:Math.round(seed.growMs*lampSpeed()),seed:id};
 if(targetSlot!==null&&Number.isInteger(+targetSlot)){
   const slot=+targetSlot;
   if(slot<0||slot>=growCapacity()){growMessage('Dieser Pflanzenplatz ist noch gesperrt.');return}
   if(g.plants[slot]){growMessage('Dieser Pflanzenplatz ist bereits belegt.');return}
   while(g.plants.length<slot)g.plants.push(null);
   g.plants[slot]=plant;
 }else{
   let slot=g.plants.findIndex(x=>!x);
   if(slot<0)slot=g.plants.length;
   g.plants[slot]=plant;
 }
 g.seeds[id]--;g.plants=g.plants.slice(0,growCapacity());
 persist(false);renderGrow();growMessage(`${seed.name} wurde gepflanzt.`);
 /* Authoritative push hook: schedule from the exact plant timestamp just created.
    Do not depend on later Growroom wrappers/state normalization to rediscover it. */
 const glReadyAt=(Number(plant.start)||Date.now())+(Number(plant.duration)||0);
 try{if(typeof window.glPushDebug==='function')window.glPushDebug('Pflanze gesetzt – Push wird geplant…\nsend_at: '+new Date(glReadyAt).toISOString())}catch(e){}
 [0,1200,3500].forEach(delay=>setTimeout(()=>{
   try{
     if(typeof window.glSyncGrowPushJob==='function')void window.glSyncGrowPushJob(glReadyAt);
   }catch(e){console.warn('[GL Push] direct plant schedule',e)}
 },delay));

}
function harvestReadyPlants(){
 const now=Date.now(),readyPlants=s.grow.plants.filter(p=>p&&now-p.start>=p.duration);
 if(!readyPlants.length){growMessage('Noch keine Pflanze ist erntereif.');return}
 let income=0;readyPlants.forEach(p=>{const seed=seedTypes[p.seed]||seedTypes.moss;income+=Math.round(seed.sell*potYield()*(1+totalAttr('growSkill')*.03))});
 s.gold+=v408GuildGold(income);s.grow.plants=s.grow.plants.map(p=>(p&&now-p.start>=p.duration)?null:p);while(s.grow.plants.length&&!s.grow.plants[s.grow.plants.length-1])s.grow.plants.pop();addXp(10*readyPlants.length);persist(false);render();growMessage(`${readyPlants.length} Ernte(n) verkauft: +${income} Gold.`);
}
function upgradeRoomAction(){
 if(s.grow.roomLevel>=4){growMessage('Der Growroom ist bereits vollständig ausgebaut.');return}
 const c=150*s.grow.roomLevel;if(s.gold<c){growMessage('Nicht genug Gold für das Raum-Upgrade.');return}
 s.gold-=c;s.grow.roomLevel++;persist(false);renderGrow();document.querySelector('#gold')&&(document.querySelector('#gold').textContent=s.gold);growMessage(`Growroom auf Level ${s.grow.roomLevel} verbessert.`);
}
function renderQuests(){const q=s.quests.active,card=document.querySelector('#activeQuestCard'),box=document.querySelector('#activeQuest');if(q){card.style.display='block';const left=Math.max(0,Math.ceil((q.ends-Date.now())/1000)),done=left<=0;box.innerHTML=`<div class="quest active-q"><div class="quest-top"><div class="quest-icon">${q.icon}</div><div><h3>${q.name}</h3><div class="muted">${q.text}</div></div></div><div class="quest-meta"><span>⭐ ${q.xp} XP</span><span>💰 ${q.gold}</span><span>⚡ ${q.energy}</span></div><div class="timer">${done?'✅ Auftrag abgeschlossen':`⏳ Noch ${left} Sek.`}</div>${done?'<button class="btn" id="claimQuest" style="width:100%;margin-top:9px">Belohnung abholen</button>':''}</div>`;if(done)document.querySelector('#claimQuest').onclick=claimQuest}else card.style.display='none';
 document.querySelector('#questList').innerHTML=s.quests.offers.map((x,i)=>`<div class="quest"><div class="quest-top"><div class="quest-icon">${x.icon}</div><div><h3>${x.name}</h3><div class="muted">${x.text}</div></div></div><div class="quest-meta"><span>☠️ Stufe ${x.tier}</span><span>⏱️ ${Math.floor(Math.max(0,Math.round(Number(x.duration)||0))/60)} Min ${String(Math.max(0,Math.round(Number(x.duration)||0))%60).padStart(2,'0')} Sek</span><span>⚡ ${x.energy}</span><span>⭐ ${x.xp}</span><span>💰 ${x.gold}</span></div><button class="btn" style="width:100%" onclick="startQuest(${i})" ${s.quests.active||s.energy<x.energy?'disabled':''}>Auftrag starten</button></div>`).join('')}
window.startQuest=i=>{if(s.quests.active)return;const q=s.quests.offers[i];if(!q||s.energy<q.energy)return v115Alert('Nicht genug Dampf.');s.energy-=q.energy;s.quests.active={...q,ends:Date.now()+q.duration*1000};s.quests.offers=[];persist()};function claimQuest(){const q=s.quests.active;if(!q||Date.now()<q.ends)return;const bonus=Math.random()<.20;s.gold+=v408GuildGold(q.gold);addXp(q.xp);let msg=`Auftrag geschafft: +${q.xp} XP, +${q.gold} Gold.`;
 // Schlüsselsteine gibt es nicht mehr beliebig früh. Nur der nächste Dungeon kann freigeschaltet werden,
 // sobald sein Level erreicht und der vorherige Dungeon abgeschlossen wurde.
 const nextIndex=s.dungeon.completed.length?Math.min(...Array.from({length:dungeons.length-1},(_,n)=>n+1).filter(i=>!s.dungeon.unlocked.includes(i)&&s.dungeon.completed.includes(i-1)).concat([999])):999;
 if(nextIndex<dungeons.length){
   const nextD=dungeons[nextIndex];
   if(s.level>=nextD.minLevel&&Math.random()<0.22){s.dungeon.unlocked.push(nextIndex);msg+=`\n🗿 ${nextD.keyName} gefunden! ${nextD.name} wurde freigeschaltet.`;}
 }
 if(bonus){let found;if(Math.random()<0.015){const slot=setBases[Math.floor(Math.random()*setBases.length)].slot;found=makeSetItem(s.playerClass||'grower',slot)}else{if(Math.random()<0.75){found=makeClassLoot(s.playerClass||'grower','quest')}else{const other=['grower','bruiser','scout','frost','summoner'].filter(x=>x!==s.playerClass);found=makeClassLoot(other[Math.floor(Math.random()*other.length)],'quest')}}s.inventory.push(found);msg+=`\nItem gefunden: ${found.name}`}
 if(Math.random()<.05){
   const g=v030Gems[Math.floor(Math.random()*v030Gems.length)];
   const qg=v027ShopQuality(),boost={gray:0,green:1,blue:2,purple:3}[qg]||0;
   const v=v030Rand(g.min,g.max)+boost;
   const gem={uid:v030Uid(g.id),baseId:g.id,type:'gem',name:g.name,icon:g.icon,quality:qg,rarity:qualityMeta(qg).cls,stat:g.stat,value:v,price:Math.round((80+v*35)*({gray:1,green:1.3,blue:2,purple:3.6}[qg]||1))};
   s.materials.push(gem);
   msg+=`\n💎 Edelstein gefunden: ${gem.name}`;
 }
 if(Math.random()<.05){
   const r=v030Scrolls[Math.floor(Math.random()*v030Scrolls.length)];
   const qr=v027ShopQuality(),boost={gray:0,green:0,blue:1,purple:2}[qr]||0;
   const v=v030Rand(r.min,r.max)+boost;
   const scroll={uid:v030Uid(r.id),baseId:r.id,type:'scroll',name:r.name,icon:r.icon,quality:qr,rarity:qualityMeta(qr).cls,effect:r.effect,value:v,price:Math.round((95+v*42)*({gray:1,green:1.3,blue:2,purple:3.6}[qr]||1))};
   s.materials.push(scroll);
   msg+=`\n📜 Verzauberungsrolle gefunden: ${scroll.name}`;
 }
 s.quests.active=null;s.quests.offers=[makeQuest(),makeQuest(),makeQuest()];v231ShowQuestReward(msg,q);persist()}
document.querySelector('#refreshQuests').onclick=()=>{if(s.quests.active)return v115Alert('Beende erst deinen aktiven Auftrag.');if(s.gold<10)return v115Alert('Zu wenig Gold.');s.gold-=10;s.quests.offers=[makeQuest(),makeQuest(),makeQuest()];persist()};

function freeDungeonReady(){return Date.now()-s.dungeonPass.lastFree>=3600000}
function dungeonWaitText(){const left=Math.max(0,3600000-(Date.now()-s.dungeonPass.lastFree));if(left<=0)return 'Kostenloser Versuch bereit';const m=Math.floor(left/60000),sec=Math.floor((left%60000)/1000);return `Timer ${m}:${String(sec).padStart(2,'0')}`;}
function consumeDungeonAttempt(){
 if(freeDungeonReady()){s.dungeonPass.lastFree=Date.now();return true}
 if(s.harzTaler>=1){if(!confirm('Gratisversuch noch nicht bereit. 1 Harz-Taler für einen weiteren Versuch ausgeben?'))return false;s.harzTaler--;return true}
 v115Alert('Kein Gratisversuch bereit und keine Harz-Taler vorhanden.');return false
}
function currentDungeon(){return dungeons[Math.max(0,Math.min(dungeons.length-1,s.dungeon.selected||0))]}
function currentDungeonEnemy(){const d=currentDungeon(),i=Math.max(0,Math.min(9,(s.dungeon.progress?.[s.dungeon.selected||0]??s.dungeon.room??0)));return d.enemies[i]}
function enemyLevelReady(){const e=currentDungeonEnemy();return s.level>=(e?.requiredLevel||1)}
function dungeonUnlocked(i){return i===0||s.dungeon.unlocked.includes(i)}
function dungeonCompleted(i){return s.dungeon.completed.includes(i)}
function dungeonAvailable(i){const d=dungeons[i];return s.level>=d.minLevel&&dungeonUnlocked(i)&&!dungeonCompleted(i)}
const dungeonMapPositions=[
 [9,78],[18,64],[29,73],[39,58],[49,69],[60,55],[72,64],[84,50],[91,34],[79,26],
 [67,37],[57,25],[46,37],[35,25],[24,38],[13,27],[20,13],[38,12],[61,12],[85,12]
];
function dungeonStateText(i){
 const d=dungeons[i];
 if(dungeonCompleted(i))return '⛓️ Abgeschlossen und dauerhaft versiegelt';
 if(!dungeonUnlocked(i))return s.level<d.minLevel?`🔒 Ab Level ${d.minLevel} – danach ${d.keyName} bei Quests finden`:`🔒 ${d.keyName} fehlt – jetzt bei Quests auffindbar`;
 if(s.level<d.minLevel)return `🔒 Benötigt Level ${d.minLevel}`;
 return '⚔️ Betretbar';
}
window.selectDungeon=i=>{
 const d=dungeons[i];if(!d)return;
 if(dungeonCompleted(i))return v115Alert(`${d.name} wurde bereits abgeschlossen und ist dauerhaft versiegelt.`);
 if(s.level<d.minLevel)return v115Alert(`Dieser Dungeon ist erst ab Level ${d.minLevel} verfügbar.`);
 if(!dungeonUnlocked(i))return v115Alert(`${d.keyName} fehlt. Den Stein kannst du beim Questen finden.`);
 s.dungeon.selected=i;s.dungeon.room=Math.max(0,Math.min(9,s.dungeon.progress?.[i]??0));s.dungeon.view='battle';const lootBox=document.querySelector('#loot');if(lootBox)lootBox.innerHTML='';const logBox=document.querySelector('#battleLog');if(logBox)logBox.textContent=`${d.name}: Gegner ${s.dungeon.room+1} wartet auf dich.`;persist();
}
function renderDungeon(){
 const mapCard=document.querySelector('#dungeonMapCard'),battleCard=document.querySelector('#dungeonBattleCard');
 const dview=s.dungeon.view||'map';
 if(mapCard)mapCard.style.display=dview==='map'?'block':'none';
 if(battleCard)battleCard.style.display=dview==='map'?'none':'block';
 let selected=Math.max(0,Math.min(dungeons.length-1,s.dungeon.selected||0));
 const selectedDone=dungeonCompleted(selected);
 const d=dungeons[selected],ens=d.enemies,idx=Math.max(0,Math.min(9,(s.dungeon.progress?.[selected] ?? s.dungeon.room ?? 0))),e=ens[idx];s.dungeon.room=idx;
 document.querySelector('#dungeonTicketText')&&(document.querySelector('#dungeonTicketText').textContent=dungeonWaitText());
 const pts=dungeonMapPositions.map(p=>`${p[0]*9.8},${p[1]*6.2}`).join(' ');
 document.querySelector('#dungeonSelect').innerHTML=`<div class="map-title-ribbon">VERSEUCHTE GEBIETE</div><div class="map-scenery s1">🌲🌲</div><div class="map-scenery s2">🏚️</div><div class="map-scenery s3">⛰️</div><div class="map-scenery s4">🌫️🌲</div><div class="map-scenery s5">🏰</div><svg class="map-path" viewBox="0 0 980 620" preserveAspectRatio="none"><polyline points="${pts}"/></svg>`+dungeons.map((x,i)=>{
   const done=dungeonCompleted(i),hasKey=dungeonUnlocked(i),levelOk=s.level>=x.minLevel,available=hasKey&&levelOk&&!done;
   const pos=dungeonMapPositions[i];
   const cl=done?'completed':available?(i===selected?'active':'available'):'locked';
   const icon=done?'🏚️':i===19?'👑':i%5===0?'🏰':i%3===0?'🕳️':'☠️';
   const lock=!done&&!available?'<span class="nlock">🔒</span>':'';
   return `<button class="dungeon-node ${cl}" style="left:${pos[0]}%;top:${pos[1]}%" onclick="selectDungeon(${i})" title="${x.name} – ${dungeonStateText(i)}"><span class="nicon">${icon}</span><span class="nnum">${i+1}. ${x.name}</span><span class="nlvl">Lv. ${x.minLevel}+</span>${lock}</button>`;
 }).join('');
 const detail=document.querySelector('#dungeonDetail');
 detail.className='dungeon-detail'+(selectedDone?' completed':'');
 detail.innerHTML=`<h3>${selectedDone?'⛓️':'👹'} Dungeon ${selected+1}: ${d.name}</h3><div class="state">${dungeonStateText(selected)} · 10 Gegner · Boss garantiert 1 Epic</div>${d.keyName?`<div class="tiny" style="margin-top:4px">🗿 Zugang: ${d.keyName}</div>`:''}`;
 document.querySelector('#enemyName').textContent=selectedDone?'Dungeon versiegelt':e.name;
 document.querySelector('#enemyBattleName').textContent=selectedDone?'Abgeschlossen':e.short;
 const vDungeonEnemyAvatar=document.querySelector('#enemyIcon');if(vDungeonEnemyAvatar&&!vDungeonEnemyAvatar.querySelector('.gl-dungeon-enemy-art,.gl-dungeon-d1-art,.v573-enemy-art,.v574-enemy-art,.v599-treant-art,.v600-treant-art'))vDungeonEnemyAvatar.textContent=selectedDone?'⛓️':e.icon;
 document.querySelector('#enemyTier').textContent=selectedDone?'GESCHLOSSEN':`${e.boss?'BOSS':`Gegner ${idx+1}`} · ab Lv. ${e.requiredLevel||d.minLevel}`;
 document.querySelector('#dungeonProgress').textContent=selectedDone?'10 / 10':`${idx+1} / 10`;
 document.querySelector('#enemyHpText').textContent=selectedDone?'0':e.hp;
 document.querySelector('#enemyHpBar').style.width=selectedDone?'0%':'100%';
 document.querySelector('#playerHpText').textContent=maxHp();document.querySelector('#playerHpBar').style.width='100%';
 document.querySelector('#dungeonMap').innerHTML=ens.map((x,i)=>`<div class="room-node ${selectedDone||i<idx?'done':''} ${!selectedDone&&i===idx?'current':''}"><div class="node-circle">${selectedDone||i<idx?'✓':x.icon}</div><small>${i===9?'BOSS':i+1}</small></div>`).join('');
 const btn=document.querySelector('#fightBtn');
 btn.disabled=selectedDone||!dungeonAvailable(selected)||s.level<(e.requiredLevel||d.minLevel);
 btn.textContent=selectedDone?'⛓️ Dungeon dauerhaft geschlossen':s.level<(e.requiredLevel||d.minLevel)?`🔒 Gegner ab Level ${e.requiredLevel||d.minLevel}`:'⚔️ Kampf starten';
 if(!battleBusy)document.querySelector('#battleLog').textContent=selectedDone?'Dieser Dungeon wurde vollständig abgeschlossen. Der Eingang ist dauerhaft versiegelt.':`${d.name}: ${e.name} wartet auf dich.`;
}
function animClass(el,cl,ms=400){el.classList.remove(cl);void el.offsetWidth;el.classList.add(cl);setTimeout(()=>el.classList.remove(cl),ms)}function popDamage(el,text){el.textContent=text;animClass(el,'pop',650)}
document.querySelector('#fightBtn').onclick=()=>{if(battleBusy)return;if(dungeonCompleted(s.dungeon.selected||0))return v115Alert('Dieser Dungeon ist bereits abgeschlossen und dauerhaft versiegelt.');if(!dungeonAvailable(s.dungeon.selected||0))return v115Alert('Dieser Dungeon ist noch nicht betretbar.');const gateEnemy=currentDungeonEnemy();if(!s.playerClass)return v115Alert('Wähle zuerst im Heldenquartier deine Klasse.');if(!consumeDungeonAttempt())return;persist(false);battleBusy=true;const btn=document.querySelector('#fightBtn');btn.disabled=true;document.querySelector('#loot').innerHTML='';const d=currentDungeon(),idx=Math.max(0,Math.min(9,(s.dungeon.progress?.[s.dungeon.selected] ?? s.dungeon.room ?? 0))),e=d.enemies[idx],maxP=maxHp();let pHp=maxP,eHp=e.hp;const pBar=document.querySelector('#playerHpBar'),eBar=document.querySelector('#enemyHpBar'),pTxt=document.querySelector('#playerHpText'),eTxt=document.querySelector('#enemyHpText'),log=document.querySelector('#battleLog');let round=0;
 const step=()=>{round++;let critChance=Math.min(.35,.05+totalAttr('glueck')*.015);if(s.playerClass==='bruiser')critChance+=.10+setBonusValue('critChance')+skillValue('nebel')*.03;if(s.playerClass==='scout')critChance+=skillValue('praez')*.02;
 const crit=Math.random()<critChance;let pDmg=Math.max(5,Math.floor(totalAttr('staerke')*1.9+totalAttr('geschick')*.8+s.level*2+Math.random()*10))*(crit?2:1);
 let special='';if((s.playerClass==='grower'||s.playerClass==='frost')&&Math.random()<(.18+setBonusValue('wuchtChance')+skillValue('wucht')*.03)){pDmg=Math.floor(pDmg*1.75);special=' WUCHTSCHLAG!';}
 if(s.playerClass==='scout'&&Math.random()<(.20+setBonusValue('doubleChance')+skillValue('schnell')*.03)){pDmg=Math.floor(pDmg*(1.55+setBonusValue('doubleDamage')));special=' DOPPELTREFFER!';}
 if(s.playerClass==='bruiser'&&crit){pDmg=Math.floor(pDmg*(1+setBonusValue('critDamage')+skillValue('overload')*.07));special=' MAGIE-KRIT!';}
 if((s.playerClass==='grower'||s.playerClass==='frost')&&skillValue('raserei'))pDmg=Math.floor(pDmg*(1+skillValue('raserei')*.04));animClass(document.querySelector('#playerFighter'),'attack-right');setTimeout(()=>{eHp=Math.max(0,eHp-pDmg);eBar.style.width=(eHp/e.hp*100)+'%';eTxt.textContent=eHp;popDamage(document.querySelector('#damageEnemy'),`${special||crit?'KRIT! ':''}-${pDmg}`);animClass(document.querySelector('#enemyFighter'),'hit');log.textContent=`Runde ${round}: Du triffst für ${pDmg} Schaden${special|| (crit?' – kritischer Treffer!':'')}.`;if(eHp<=0)return finish(true);
 setTimeout(()=>{const reduction=Math.floor(totalAttr('ausdauer')*.45);let eDmg=Math.max(2,Math.floor(e.hp/12+Math.random()*8)-reduction);
 const skillReduce=(s.playerClass==='grower'||s.playerClass==='frost')?skillValue('fell')*.04:s.playerClass==='bruiser'?skillValue('mantel')*.03:s.playerClass==='scout'?skillValue('tarn')*.03:0;
 eDmg=Math.max(1,Math.floor(eDmg*(1-skillReduce)));animClass(document.querySelector('#enemyFighter'),'attack-left');setTimeout(()=>{pHp=Math.max(0,pHp-eDmg);pBar.style.width=(pHp/maxP*100)+'%';pTxt.textContent=pHp;popDamage(document.querySelector('#damagePlayer'),`-${eDmg}`);animClass(document.querySelector('#playerFighter'),'hit');log.textContent+=` Gegner verursacht ${eDmg}.`;if(pHp<=0)return finish(false);setTimeout(step,380)},260)},420)},260)};
 const finish=win=>{setTimeout(()=>{battleBusy=false;btn.disabled=false;if(win){s.gold+=e.gold;addXp(e.xp);let html=`<div class="loot good">🏆 Sieg! +${e.xp} XP · +${e.gold} Gold</div>`;if(e.boss||Math.random()<.22){let found;if(e.boss){if(Math.random()<0.12){const slot=setBases[Math.floor(Math.random()*setBases.length)].slot;found=makeSetItem(s.playerClass||'grower',slot)}else{found=makeClassLoot(s.playerClass||'grower','dungeon');found.quality='purple';found.rarity='epic';found.name=`Episch: ${found.name.replace(/^.*?:\s*/,'')}`;}}else{if(Math.random()<0.8){found=makeClassLoot(s.playerClass||'grower','dungeon')}else{const other=['grower','bruiser','scout','frost','summoner'].filter(x=>x!==s.playerClass);found=makeClassLoot(other[Math.floor(Math.random()*other.length)],'dungeon')}}s.inventory.push(found);html+=`<div class="loot">🎁 ${found.icon||'🎁'} ${found.name}<br><span class="tiny">${itemBonus(found)}</span></div>`}if(e.boss){s.story.bossesDefeated++;s.story.chapter=Math.min(4,1+Math.floor(s.story.bossesDefeated/2));if(Math.random()<0.22){s.harzTaler++;html+=`<div class="loot">🟢 Harz-Taler gefunden!</div>`;}}if(e.boss){if(!s.dungeon.completed.includes(s.dungeon.selected))s.dungeon.completed.push(s.dungeon.selected);s.dungeon.room=9;s.dungeon.progress[s.dungeon.selected]=9;html+=`<div class="loot good">⛓️ Dungeon abgeschlossen! Der Eingang wurde dauerhaft versiegelt.</div>`;}else{s.dungeon.room=idx+1;s.dungeon.progress[s.dungeon.selected]=idx+1;}s.dungeon.view='reward';html+=`<button class="btn gold" id="claimDungeonReward" style="width:100%;margin-top:10px">✅ Belohnung bestätigen</button>`;document.querySelector('#loot').innerHTML=html;persist(false);document.querySelector('#battleLog').textContent=e.boss?'Endboss besiegt – garantiertes Epic erhalten. Bestätige die Belohnung.':'Gegner besiegt. Bestätige die Belohnung.';setTimeout(()=>{const c=document.querySelector('#claimDungeonReward');if(c)c.onclick=()=>{const lootBox=document.querySelector('#loot');if(lootBox)lootBox.innerHTML='';s.dungeon.view='map';persist();};},0)}else{s.dungeon.view='reward';document.querySelector('#loot').innerHTML='<div class="loot" style="color:#ff9895">💀 Niederlage. Verbessere Attribute oder Ausrüstung.</div><button class="btn secondary" id="claimDungeonReward" style="width:100%;margin-top:10px">🗺️ Zurück zur Dungeon-Karte</button>';document.querySelector('#battleLog').textContent='Du wurdest besiegt. Es geht nichts verloren.';persist(false);setTimeout(()=>{const c=document.querySelector('#claimDungeonReward');if(c)c.onclick=()=>{const lootBox=document.querySelector('#loot');if(lootBox)lootBox.innerHTML='';s.dungeon.view='map';persist();};},0)}},450)};step()};
function shopStock(){const daily=Math.floor(Date.now()/86400000),seed=daily+s.shopRefreshes*17,generic=Array.from({length:3},(_,i)=>items[(seed*3+i*5)%items.length]),specific=classGear[s.playerClass||'grower'].slice().sort((a,b)=>((a.id.charCodeAt(0)+seed)%7)-((b.id.charCodeAt(0)+seed)%7)).slice(0,3);return [...specific,...generic]}
function renderShop(){document.querySelector('#shopItems').innerHTML=shopStock().map(it=>`<div class="shop-item"><div class="shop-icon">${it.icon}</div><h3>${it.name}</h3><div class="tiny">${itemBonus(it)}</div>${it.classId?`<div class="set-tag">${classLabel(it.classId)}</div>`:''}<div class="price" style="margin:7px 0">💰 ${it.price} Gold</div><button class="btn" style="width:100%;padding:8px" onclick="buy('${it.id}')">Kaufen</button></div>`).join('')}
window.buy=id=>{const it=[...items,...allClassGear].find(x=>x.id===id);if(!it)return;if(s.gold<it.price)return v115Alert('Zu wenig Gold.');s.gold-=it.price;s.inventory.push({...it});persist()};
document.querySelector('#refreshShop').onclick=()=>{if(s.harzTaler<1)return v115Alert('Du brauchst 1 Harz-Taler.');s.harzTaler--;s.shopRefreshes++;persist()};
const vCoreResetBtn=document.querySelector('#resetBtn');if(vCoreResetBtn)vCoreResetBtn.onclick=()=>{if(confirm('Spielstand wirklich löschen?')){localStorage.removeItem(KEY);OLD_KEYS.forEach(k=>localStorage.removeItem(k));location.reload()}};
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>{if(b.dataset.screen==='dungeon')s.dungeon.view='map';document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));document.querySelector('#'+b.dataset.screen).classList.add('active');render()});

function goScreen(id){if(id==='dungeon')s.dungeon.view='map';document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.screen===id));document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));document.querySelector('#'+id)?.classList.add('active');render()}
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>goScreen(b.dataset.go));

document.addEventListener('click',e=>{
 const buy=e.target.closest?.('.seed-buy');if(buy){e.preventDefault();buySeedAction(buy.dataset.seed);return}
 const sel=e.target.closest?.('.seed-select');if(sel){e.preventDefault();selectSeedAction(sel.dataset.seed);return}
 const up=e.target.closest?.('.grow-upgrade');if(up){e.preventDefault();upgradeGrowAction(up.dataset.upgrade);return}
 const slot=e.target.closest?.('[data-grow-slot]');if(slot){e.preventDefault();plantSelectedSeed(Number(slot.dataset.growSlot));return}
});
document.querySelector('#plantBtn').addEventListener('click',()=>plantSelectedSeed());
document.querySelector('#harvestBtn').addEventListener('click',harvestReadyPlants);
document.querySelector('#upgradeRoom').addEventListener('click',upgradeRoomAction);
ensureQuests();setInterval(()=>{if(document.hidden)return;/* V4.81: live Growroom is owned by v239; do not rebuild the full Growroom every second. */regenEnergy();document.querySelector('#energy')&&(document.querySelector('#energy').textContent=`${s.energy}/100`);document.querySelector('#dungeonTicketText')&&(document.querySelector('#dungeonTicketText').textContent=dungeonWaitText())},1000);persist();
