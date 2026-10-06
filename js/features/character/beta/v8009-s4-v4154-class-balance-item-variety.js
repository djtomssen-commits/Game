(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 const CLASS_IDS=['grower','scout','bruiser','frost','summoner'];
 const COMBAT=['staerke','geschick','intelligenz','ausdauer','glueck'];
 const SLOT_IDS=['weapon','head','body','boots','ring','amulet'];
 const clone=x=>{try{return typeof structuredClone==='function'?structuredClone(x):JSON.parse(JSON.stringify(x))}catch(e){return x&&typeof x==='object'?{...x}:x}};
 const sumBonus=b=>COMBAT.reduce((n,k)=>n+Math.max(0,Number(b?.[k])||0),0);
 const cleanName=x=>String(x?.name||'').replace(/^(Normal|Gewöhnlich|Rare|Episch|Legendär|Mystisch|Prismatisch):\s*/i,'').replace(/\s*\[Lv\.\d+\]\s*$/i,'').trim();
 const qRank=it=>({gray:1,green:2,blue:4,purple:7,orange:11,cyan:16,prismatic:14})[String(it?.quality||'gray').toLowerCase()]||1;

 /* New base templates deliberately stay inside each class' established per-slot
    native-stat ceiling. This expands variety without silently buffing a class. */
 const NEW={
  grower:[
   ['v4154_g_w1','Kieferspalter','weapon','🪓',285,{staerke:8,glueck:1}],
   ['v4154_g_w2','Bud-Berserker-Axt','weapon','⚔️',300,{staerke:6,ausdauer:3}],
   ['v4154_g_w3','Harzkolben','weapon','🔨',315,{staerke:7,glueck:2}],
   ['v4154_g_w4','Wurzelbrecher','weapon','🪓',295,{staerke:6,ausdauer:2,glueck:1}],
   ['v4154_g_h1','Knospenhorn-Helm','head','🪖',245,{staerke:4,ausdauer:4}],
   ['v4154_g_h2','Harzschädel','head','⛑️',255,{ausdauer:6,staerke:2}],
   ['v4154_g_h3','Wurzelkrone','head','👑',265,{staerke:4,glueck:2}],
   ['v4154_g_h4','Panzerkappe des Budlords','head','🪖',275,{ausdauer:5,staerke:3}],
   ['v4154_g_b1','Bud-Berserkerpanzer','body','🛡️',365,{ausdauer:6,staerke:3}],
   ['v4154_g_b2','Harzkettenhemd','body','🥋',350,{ausdauer:7,glueck:2}],
   ['v4154_g_b3','Rüstung der grünen Wut','body','🦺',380,{staerke:4,ausdauer:5}],
   ['v4154_g_b4','Wurzelplattenpanzer','body','🛡️',390,{ausdauer:8,staerke:1}],
   ['v4154_g_f1','Harztritt-Stiefel','boots','🥾',225,{staerke:4,ausdauer:3}],
   ['v4154_g_f2','Budstampfer','boots','👢',235,{staerke:5,glueck:2}],
   ['v4154_g_f3','Wurzelbrecher-Stiefel','boots','🥾',245,{ausdauer:5,staerke:2}],
   ['v4154_g_f4','Rindenläufer','boots','👢',230,{staerke:3,ausdauer:2,glueck:2}],
   ['v4154_g_r1','Ring der Budwut','ring','💍',265,{staerke:5,glueck:2}],
   ['v4154_g_r2','Harzsiegel','ring','💍',275,{staerke:4,ausdauer:3}],
   ['v4154_g_r3','Knospenring','ring','💍',280,{staerke:6,glueck:1}],
   ['v4154_g_r4','Ring des Wurzelzorns','ring','💍',290,{staerke:5,ausdauer:2}],
   ['v4154_g_a1','Budtotem','amulet','📿',285,{staerke:5,ausdauer:3}],
   ['v4154_g_a2','Harzkern-Amulett','amulet','💎',295,{staerke:5,glueck:3}],
   ['v4154_g_a3','Wurzelzahn-Talisman','amulet','🧿',305,{ausdauer:5,staerke:3}],
   ['v4154_g_a4','Amulett der grünen Wut','amulet','📿',315,{staerke:6,glueck:2}]
  ],
  bruiser:[
   ['v4154_m_w1','Bongstab der Tiefen','weapon','🪄',290,{intelligenz:7,glueck:2}],
   ['v4154_m_w2','Nebelkolben','weapon','🔮',305,{intelligenz:6,ausdauer:3}],
   ['v4154_m_w3','Dunstzepter','weapon','🪄',320,{intelligenz:5,glueck:4}],
   ['v4154_m_w4','Sporenfokus','weapon','🔮',315,{intelligenz:7,ausdauer:2}],
   ['v4154_m_h1','Bongweisen-Kapuze','head','🧙',245,{intelligenz:5,glueck:3}],
   ['v4154_m_h2','Krone des Tiefnebels','head','👑',260,{intelligenz:6,ausdauer:2}],
   ['v4154_m_h3','Sporenmaske des Orakels','head','🎭',270,{intelligenz:4,ausdauer:4}],
   ['v4154_m_h4','Kapuze der Glutwolke','head','🧙',275,{intelligenz:6,glueck:2}],
   ['v4154_m_b1','Robe der dichten Wolke','body','🥋',365,{intelligenz:6,ausdauer:4}],
   ['v4154_m_b2','Sporenmantel','body','🧥',375,{intelligenz:7,ausdauer:3}],
   ['v4154_m_b3','Bongmeister-Gewand','body','🥼',390,{intelligenz:5,ausdauer:5}],
   ['v4154_m_b4','Panzerrobe des Dunstes','body','🛡️',400,{intelligenz:6,ausdauer:3,glueck:1}],
   ['v4154_m_f1','Nebeltritt','boots','👢',225,{intelligenz:5,glueck:2}],
   ['v4154_m_f2','Sporenschweber II','boots','👞',235,{intelligenz:4,ausdauer:3}],
   ['v4154_m_f3','Dunstläufer','boots','👢',245,{intelligenz:5,ausdauer:2}],
   ['v4154_m_f4','Schuhe der grünen Glut','boots','👞',250,{intelligenz:4,glueck:3}],
   ['v4154_m_r1','Ring der Bongweisheit','ring','💍',270,{intelligenz:6,glueck:2}],
   ['v4154_m_r2','Nebelsiegel','ring','💍',280,{intelligenz:5,ausdauer:3}],
   ['v4154_m_r3','Sporenring der Glut','ring','💍',290,{intelligenz:5,glueck:3}],
   ['v4154_m_r4','Ring des Überdrucks','ring','💍',300,{intelligenz:7,glueck:1}],
   ['v4154_m_a1','Bongkern-Amulett','amulet','📿',295,{intelligenz:6,ausdauer:3}],
   ['v4154_m_a2','Talisman der Dunstseele','amulet','🧿',305,{intelligenz:6,glueck:3}],
   ['v4154_m_a3','Sporenkristall-Anhänger','amulet','💎',315,{intelligenz:7,ausdauer:2}],
   ['v4154_m_a4','Amulett des Überdrucks','amulet','📿',325,{intelligenz:5,ausdauer:2,glueck:2}]
  ],
  scout:[
   ['v4154_s_w1','Blattschatten-Bogen','weapon','🏹',290,{geschick:7,glueck:2}],
   ['v4154_s_w2','Rankensturm','weapon','🏹',305,{geschick:6,ausdauer:3}],
   ['v4154_s_w3','Dornenflüsterer','weapon','🏹',320,{geschick:8,glueck:1}],
   ['v4154_s_w4','Bogen der grünen Dämmerung','weapon','🏹',315,{geschick:6,glueck:3}],
   ['v4154_s_h1','Kapuze des Blattschattens','head','🥷',240,{geschick:5,glueck:2}],
   ['v4154_s_h2','Maskierung des Grünpirschers','head','🎭',255,{geschick:4,ausdauer:3}],
   ['v4154_s_h3','Dornenvisier','head','🥷',265,{geschick:6,glueck:1}],
   ['v4154_s_h4','Kappe der stillen Jagd','head','🧢',270,{geschick:5,ausdauer:2}],
   ['v4154_s_b1','Rüstung des Blattschattens','body','🥼',365,{geschick:6,ausdauer:4}],
   ['v4154_s_b2','Rankenpanzer','body','🦺',375,{geschick:5,ausdauer:5}],
   ['v4154_s_b3','Dornenleder II','body','🥋',390,{geschick:7,ausdauer:3}],
   ['v4154_s_b4','Mantel des Grünpirschers','body','🧥',400,{geschick:6,ausdauer:3,glueck:1}],
   ['v4154_s_f1','Schattenläufer','boots','👟',225,{geschick:6,glueck:2}],
   ['v4154_s_f2','Rankenschritte','boots','🥾',235,{geschick:5,ausdauer:3}],
   ['v4154_s_f3','Dornenläufer-Stiefel','boots','👢',245,{geschick:6,ausdauer:2}],
   ['v4154_s_f4','Leisetreter der Dämmerung','boots','👟',250,{geschick:7,glueck:1}],
   ['v4154_s_r1','Ring des Blattschattens','ring','💍',270,{geschick:6,glueck:2}],
   ['v4154_s_r2','Rankensiegel','ring','💍',280,{geschick:5,ausdauer:3}],
   ['v4154_s_r3','Ring der stillen Jagd','ring','💍',290,{geschick:4,glueck:4}],
   ['v4154_s_r4','Dornenauge-Ring','ring','💍',300,{geschick:7,glueck:1}],
   ['v4154_s_a1','Blattschatten-Talisman','amulet','📿',295,{geschick:6,ausdauer:3}],
   ['v4154_s_a2','Auge des Grünpirschers','amulet','🧿',305,{geschick:5,glueck:4}],
   ['v4154_s_a3','Dornenkristall-Anhänger','amulet','💎',315,{geschick:7,ausdauer:2}],
   ['v4154_s_a4','Talisman der stillen Jagd','amulet','📿',325,{geschick:6,glueck:3}]
  ],
  frost:[
   ['v4154_f_w1','Eiskiffer-Klinge','weapon','⚔️',285,{staerke:8,glueck:1}],
   ['v4154_f_w2','Harzfrost-Säbel','weapon','🗡️',300,{staerke:6,ausdauer:3}],
   ['v4154_f_w3','Nebelreif-Schwert','weapon','⚔️',315,{staerke:7,glueck:2}],
   ['v4154_f_w4','Kältegras-Klinge','weapon','🗡️',295,{staerke:6,ausdauer:2,glueck:1}],
   ['v4154_f_h1','Krone des Eiskiffers','head','👑',245,{staerke:4,ausdauer:4}],
   ['v4154_f_h2','Reifschädel-Helm','head','🪖',255,{ausdauer:6,staerke:2}],
   ['v4154_f_h3','Nebelkrone des Todes','head','👑',265,{staerke:4,glueck:2}],
   ['v4154_f_h4','Frostgruft-Visier','head','⛑️',275,{ausdauer:5,staerke:3}],
   ['v4154_f_b1','Panzer des Eiskiffers','body','🛡️',365,{ausdauer:6,staerke:3}],
   ['v4154_f_b2','Reifketten-Rüstung','body','🥋',350,{ausdauer:7,glueck:2}],
   ['v4154_f_b3','Rüstung der Frostgruft','body','🦺',380,{staerke:4,ausdauer:5}],
   ['v4154_f_b4','Nebelplattenpanzer','body','🛡️',390,{ausdauer:8,staerke:1}],
   ['v4154_f_f1','Reiftritt-Stiefel','boots','🥾',225,{staerke:4,ausdauer:3}],
   ['v4154_f_f2','Eisstampfer','boots','👢',235,{staerke:5,glueck:2}],
   ['v4154_f_f3','Frostgruft-Stiefel','boots','🥾',245,{ausdauer:5,staerke:2}],
   ['v4154_f_f4','Nebelreif-Läufer','boots','👢',230,{staerke:3,ausdauer:2,glueck:2}],
   ['v4154_f_r1','Ring des Eiskiffers','ring','💍',265,{staerke:5,glueck:2}],
   ['v4154_f_r2','Frostharz-Siegel','ring','💍',275,{staerke:4,ausdauer:3}],
   ['v4154_f_r3','Reifring der Frostgruft','ring','💍',280,{staerke:6,glueck:1}],
   ['v4154_f_r4','Ring des kalten Zorns','ring','💍',290,{staerke:5,ausdauer:2}],
   ['v4154_f_a1','Eistotem','amulet','📿',285,{staerke:5,ausdauer:3}],
   ['v4154_f_a2','Frostkern-Amulett','amulet','💎',295,{staerke:5,glueck:3}],
   ['v4154_f_a3','Reifzahn-Talisman','amulet','🧿',305,{ausdauer:5,staerke:3}],
   ['v4154_f_a4','Amulett des kalten Rauchs','amulet','📿',315,{staerke:6,glueck:2}]
  ]
 };

 function installItems(){
  let added=0;
  CLASS_IDS.forEach(cls=>{
   classGear[cls]=Array.isArray(classGear[cls])?classGear[cls]:[];
   (NEW[cls]||[]).forEach(([id,name,slot,icon,price,bonus])=>{
    if(classGear[cls].some(x=>String(x?.id)===id))return;
    classGear[cls].push({id,name,slot,icon,price,classId:cls,bonus:{...bonus},baseBonusV055:{...bonus},v4154Variety:true});added++;
   });
  });
  try{
   if(Array.isArray(v030Jewelry)){
    CLASS_IDS.forEach(cls=>(NEW[cls]||[]).filter(x=>x[2]==='ring'||x[2]==='amulet').forEach(([id,name,slot,icon,,bonus])=>{
     if(!v030Jewelry.some(x=>String(x?.id)===id))v030Jewelry.push({id,name,slot,icon,classId:cls,bonus:{...bonus},baseBonusV055:{...bonus},v4154Variety:true});
    }));
   }
  }catch(e){console.warn('V4.159 jewelry pool',e)}
  return added;
 }
 const ADDED=installItems();

 /* Frost has the same raw class budget and talent mechanics as Bud-Barbar.
    Its second physical weapon is flexibility only: effective weapon values are main-hand 100 % plus offhand 10 %. */
 try{
  if(classes?.frost&&classes?.grower)classes.frost.bonus={...classes.grower.bonus};
  if(classSets?.frost&&classSets?.grower)classSets.frost.bonuses={...classSets.grower.bonuses};
 }catch(e){}

 /* Profile/Hall gear score must not count Frost's second weapon as a seventh full slot. */
 function itemScore(it,withRarity=true){if(!it)return 0;const raw=Object.values(it.bonus||{}).reduce((n,v)=>n+(Number(v)||0),0);return raw+(withRarity?qRank(it):0)}
 function effectiveEquipmentScore(withRarity=true){
  const eq=s?.equipment||{};let n=0;
  Object.entries(eq).forEach(([slot,it])=>{if(!it||slot==='weapon'||slot==='weapon2')return;n+=itemScore(it,withRarity)});
  const a=eq.weapon,b=eq.weapon2;
  if(String(s?.playerClass)==='frost'&&a&&b)n+=itemScore(a,withRarity)+itemScore(b,withRarity)*.10;
  else n+=itemScore(a||b,withRarity);
  return n;
 }
 try{if(typeof v072GearScore==='function'){v072GearScore=function(){return Math.round(effectiveEquipmentScore(true)*100)/100};try{window.v072GearScore=v072GearScore}catch(e){}}}catch(e){}

 /* Keep any old direct primary-stat helper Frost-aware. */
 try{if(typeof v110MainStat==='function'){v110MainStat=function(){const k=s.playerClass==='scout'?'geschick':(s.playerClass==='bruiser'||s.playerClass==='summoner')?'intelligenz':'staerke';return totalAttr(k)};try{window.v110MainStat=v110MainStat}catch(e){}}}catch(e){}

 /* Avoid back-to-back identical class-loot names. This is in-memory only and has
    no save/account impact. It does not alter rarity chances or item stats. */
 const recent=new Map();
 function remember(cls,it){const a=recent.get(cls)||[];const key=cleanName(it);if(key){a.push(key);while(a.length>5)a.shift();recent.set(cls,a)}return it}
 try{
  if(typeof makeClassLoot==='function'&&!window.__v4154LootVariety){
   const base=makeClassLoot;
   const wrapped=function(classId,source='normal'){
    const cls=CLASS_IDS.includes(String(classId))?String(classId):'grower';const seen=recent.get(cls)||[];let it=null;
    for(let i=0;i<7;i++){it=base.apply(this,arguments);if(!it||!seen.includes(cleanName(it)))break}
    return remember(cls,it);
   };
   try{makeClassLoot=wrapped}catch(e){}try{window.makeClassLoot=wrapped}catch(e){}window.__v4154LootVariety=true;
  }
 }catch(e){console.warn('V4.159 loot variety',e)}

 /* Run the established item curve again after the larger Frost pool exists. */
 function normalizeItems(){
  try{
   const authenticated=!!((typeof v073User!=='undefined'&&v073User?.id)||window.v073User?.id);
   if(authenticated)return false;
   return window.v447NormalizeAllItems?.()||false;
  }catch(e){console.warn('V4.159 item normalize',e);return false}
 }

 /* One account-safe refresh of merchant stock so V4.159 variety is visible now,
    instead of waiting for the next daily refresh. */
 function accountActivate(){
  if(window.__V200_AUTH_READY__!==true||!s)return;
  normalizeItems();
  if(Number(s.v4154ItemVariety||0)!==1){
   try{s.weaponShop=[];s.magicShop=[];if(typeof v057FillShops==='function')v057FillShops(true);else if(typeof v030Fill==='function')v030Fill(true);s.v4154ItemVariety=1;persist(false)}catch(e){console.warn('V4.159 shop refresh',e)}
  }
  try{if(document.getElementById('shop')?.classList.contains('active'))renderShop?.()}catch(e){}
 }

 function slotMax(cls,slot){return Math.max(0,...(classGear?.[cls]||[]).filter(x=>x?.slot===slot).map(x=>sumBonus(x?.baseBonusV055||x?.bonus)))}
 function audit(){
  const baseBudgets=Object.fromEntries(CLASS_IDS.map(c=>[c,sumBonus(classes?.[c]?.bonus)]));
  const slotBudgets=Object.fromEntries(CLASS_IDS.map(c=>[c,Object.fromEntries(SLOT_IDS.map(sl=>[sl,slotMax(c,sl)]))]));
  const frostGrowerSame=JSON.stringify(classes?.frost?.bonus||{})===JSON.stringify(classes?.grower?.bonus||{});
  const frostWeaponBudget=slotBudgets.frost?.weapon===slotBudgets.grower?.weapon;
  const frostTalentMirror=!!(typeof V314_BRANCHES==='object'&&Array.isArray(V314_BRANCHES.frost)&&Array.isArray(V314_BRANCHES.grower)&&V314_BRANCHES.frost.length===V314_BRANCHES.grower.length);
  const allBaseEqual=Object.values(baseBudgets).every(x=>x===7);
  return {version:V.short,addedTemplates:ADDED,baseBudgets,slotBudgets,allBaseEqual,frostGrowerSame,frostWeaponBudget,frostTalentTreeReady,dualRule:'weapon1 100% + weapon2 10% attributes + offhand proc'};
 }
 window.v4154ClassBalanceAudit=audit;
 window.v4154EffectiveEquipmentScore=effectiveEquipmentScore;

 /* Add targeted QA without replacing the existing runner. */
 try{
  const fn=window.v4107RunQA||window.v4102RunQA;
  if(typeof fn==='function'&&!window.__v4154QaWrapped){
   const wrapped=function(){const r=fn.apply(this,arguments);if(!r||!Array.isArray(r.results))return r;const a=audit();const add=(name,pass,detail)=>r.results.push({category:'Klassenbalance & Itemvielfalt',name,pass:!!pass,severity:'error',detail});
    add('Alle vier Klassen besitzen dasselbe Basisbudget',a.allBaseEqual,JSON.stringify(a.baseBudgets));
    add('Frost-Todesritter hat dasselbe Grundbudget wie Bud-Barbar',a.frostGrowerSame,JSON.stringify(classes?.frost?.bonus||{}));
    add('Frost-Waffenbudget entspricht Bud-Barbar',a.frostWeaponBudget,`Frost ${a.slotBudgets.frost?.weapon} / Barbar ${a.slotBudgets.grower?.weapon}`);
    add('Frost-Talentbaum besitzt drei vollständige Äste',a.frostTalentTreeReady,`${V314_BRANCHES?.frost?.length||0} Äste`);
    add('Erweiterter Itempool aktiv',a.addedTemplates>=96,`${a.addedTemplates} neue Basistemplates`);
    add('Jede Klasse hat neue Varianten in allen sechs Slots',CLASS_IDS.every(c=>SLOT_IDS.every(sl=>(NEW[c]||[]).some(x=>x[2]===sl))),'Waffe/Kopf/Körper/Schuhe/Ring/Amulett');
    r.total=r.results.length;r.passed=r.results.filter(x=>x.pass).length;r.failed=r.results.filter(x=>!x.pass&&x.severity!=='warn').length;r.warnings=r.results.filter(x=>!x.pass&&x.severity==='warn').length;r.ok=r.failed===0;return r};
   window.v4107RunQA=wrapped;if(window.v4102RunQA===fn)window.v4102RunQA=wrapped;window.__v4154QaWrapped=true;
  }
 }catch(e){}

 function stamp(){}
 stamp();normalizeItems();if(window.__V200_AUTH_READY__===true)setTimeout(accountActivate,0);
 window.addEventListener('growlegends:account-ready',()=>setTimeout(accountActivate,0));
 window.addEventListener('pageshow',()=>{stamp();if(window.__V200_AUTH_READY__===true)setTimeout(accountActivate,0)},{passive:true});
})();
