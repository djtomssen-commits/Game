(()=>{
 'use strict';
 try{
  if(window.__V6105_ITEM_VARIETY_REWORK__)return;
  window.__V6105_ITEM_VARIETY_REWORK__=true;

  const root=typeof globalThis!=='undefined'?globalThis:window;
  if(typeof classGear==='undefined'||typeof allClassGear==='undefined')return;

  const SLOT_IDS=['weapon','head','body','boots','ring','amulet'];
  const classPrimary={grower:'staerke',bruiser:'intelligenz',scout:'geschick',frost:'staerke',summoner:'intelligenz'};
  const classSecondary={grower:'ausdauer',bruiser:'glueck',scout:'glueck',frost:'ausdauer',summoner:'ausdauer'};
  const classThird={grower:'glueck',bruiser:'ausdauer',scout:'ausdauer',frost:'glueck',summoner:'glueck'};
  const classIcons={grower:{weapon:'🪓',head:'🪖',body:'🛡️',boots:'🥾',ring:'💍',amulet:'📿'},bruiser:{weapon:'🪄',head:'🧙',body:'🥋',boots:'👢',ring:'💍',amulet:'🔮'},scout:{weapon:'🏹',head:'🥷',body:'🥼',boots:'👟',ring:'💍',amulet:'🧿'},frost:{weapon:'⚔️',head:'⛑️',body:'🦺',boots:'🥾',ring:'💍',amulet:'🧿'},summoner:{weapon:'🪄',head:'🧙',body:'🥋',boots:'👢',ring:'💍',amulet:'🧿'}};
  const priceBase={weapon:320,head:255,body:385,boots:235,ring:285,amulet:300};

  const bonusFor=(cls,slot,base,shift=0)=>{
    const p=classPrimary[cls],s=classSecondary[cls],t=classThird[cls];
    const n={};
    const add=(k,v)=>{if(v>0)n[k]=(n[k]||0)+v};
    if(slot==='weapon'){add(p,base+2);add(t,1+(shift%2));}
    else if(slot==='head'){add(p,base);add(s,base>4?3:2);}
    else if(slot==='body'){add(s,base+2);add(p,base-1);}
    else if(slot==='boots'){add(p,base-1);add(s,2);add(t,1);}
    else if(slot==='ring'){add(p,base+1);add(t,2);}
    else if(slot==='amulet'){add(p,base);add(s,2);add(t,2);}
    return n;
  };

  const EXTRA={
   grower:{
    weapon:['Grasgrimm-Schwert','Kettendorn-Axt','Budspalter-Zweihänder','Harzbrecher-Hammer'],
    head:['Barbarenstirnreif des Hanfs','Kampfrausch-Helm','Knospenkrone des Kriegers','Dornenvisier des Wurzelherrn'],
    body:['Warlord-Harzrüstung','Rindenplattenpanzer','Dornenschulter des Grünwütigen','Sturmharnisch der Budwut'],
    boots:['Schlachttreter','Wurzelmarsch-Stiefel','Grimmtritt-Boots','Kriegsstampfer des Budlords'],
    ring:['Ring des Grünen Zorns','Barbarensiegel aus Harz','Kettenring des Budkriegers','Wutreif des Wurzelclans'],
    amulet:['Talisman des Grasberserkers','Amulett des Wurzelzorns','Kriegskette der Knospen','Totem des Harzclans']
   },
   bruiser:{
    weapon:['Mondnebel-Zauberstab','Kristallbong-Zepter','Sporenkanal-Stab','Runenzweig des Nebelordens'],
    head:['Hexerkapuze des Rauchs','Kristallmaske des Orakels','Sporenkrone','Dunstturban des Bongzirkels'],
    body:['Arkanrobe des Nebelzirkels','Sporenseiden-Robe','Hexergewand der Glutwolke','Mystische Rauchmantel-Rüstung'],
    boots:['Schwebesohlen des Orakels','Ritualstiefel des Dunstes','Nebelschritt-Boots','Sporenläufer'],
    ring:['Hexensiegel','Ring des Bongorakels','Arkanreif der Sporen','Kristallband des Nebels'],
    amulet:['Anhänger des Dunstauges','Sporentalisman','Kristallamulett der Bongweisen','Nebelfokus des Ritualmeisters']
   },
   scout:{
    weapon:['Waldpfeil-Langbogen','Stachelarmbrust','Schattenklingen-Doppelset','Schurkendolch des Blattpfads'],
    head:['Waldläuferkapuze','Schattenschleier-Maske','Blattjäger-Helm','Kapuze des leisen Pfeils'],
    body:['Rankenleder des Schleichers','Waldjäger-Rüstung','Schurkenwams aus Blattleder','Nachtgrün-Pirscherpanzer'],
    boots:['Leisepfad-Stiefel','Pirschertritte','Waldsprung-Boots','Schattenläufer des Grünpfads'],
    ring:['Treffsicherheitsring','Schurkenreif','Ring des stillen Schusses','Band des Waldpirschers'],
    amulet:['Blattpfeil-Amulett','Jagdtalisman des Nebelwaldes','Anhänger der Schattenfeder','Waldgeist-Fokus']
   },
   frost:{
    weapon:['Frostbiss-Schwert','Runeneis-Axt','Eissplitter-Säbel','Todesfrost-Kriegsklinge'],
    head:['Helm der Frostgruft','Eisvisier des Todesritters','Runenkrone der Kälte','Schädelhelm des Nordnebels'],
    body:['Frostplatten-Harnisch','Eisrüstzeug der Gruft','Todesritter-Panzer des Schneesturms','Runenharnisch des Frostordens'],
    boots:['Eisschritt-Stiefel','Gruftmarsch-Boots','Froststampfer','Nordkälte-Treter'],
    ring:['Ring der Eisadern','Frostsiegel','Reif der Todeskälte','Runenring der Wintergruft'],
    amulet:['Amulett des Nordnebels','Eisherz-Talisman','Gruftkette des Frostordens','Anhänger der toten Kälte']
   },
   summoner:{
    weapon:['Knochenschädel-Zepter','Geisterlaternen-Stab','Wurzelrufer','Stab des Totengartens'],
    head:['Grabgärtner-Haube','Knochenkranz','Dunstschleier','Kapuze der letzten Ernte'],
    body:['Harzritual-Gewand','Wurzelmantel','Totengarten-Robe','Gewand des Geisterchors'],
    boots:['Grabtreter','Nebelschritt-Stiefel','Knochenpfad-Stiefel','Sarggarten-Treter'],
    ring:['Grabharz-Siegel','Nebelring','Seelenwurzel-Ring','Ring des Geisterchors'],
    amulet:['Harzphiole','Knochenanhänger','Dunsttalisman','Amulett der letzten Seele']
   }
  };

  let added=0;
  const addItem=(cls,id,name,slot,icon,price,bonus)=>{
    const arr=classGear[cls]||(classGear[cls]=[]);
    if(arr.some(x=>String(x.id)===id))return;
    const item={id,name,slot,icon,price,classId:cls,bonus};
    arr.push(item);
    try{allClassGear.push(item)}catch(e){}
    added++;
  };
  Object.entries(EXTRA).forEach(([cls,slots])=>{
    SLOT_IDS.forEach((slot,slotIndex)=>{
      (slots[slot]||[]).forEach((name,i)=>{
        const id=`v6105_${cls}_${slot}_${i+1}`;
        const price=priceBase[slot]+i*12+slotIndex*5+(cls==='frost'?10:0);
        const base=slot==='weapon'?6+i%2:slot==='body'?5:4;
        addItem(cls,id,name,slot,classIcons[cls][slot],price,bonusFor(cls,slot,base,i));
      });
    });
  });

  /* Multiple set families per class. All of them count for the same class bonus family. */
  if(typeof classSets!=='undefined'){
    if(!classSets.frost)classSets.frost={name:'Frostgruft',className:'Frost-Todesritter',bonuses:{2:'2 Teile: +5 Stärke',4:'4 Teile: +10 % Lebenspunkte',6:'6 Teile: +8 % Frostschlag-Chance'}};
  }

  const SET_VARIANTS={
   grower:[
    {id:'harzbrecher',name:'Harzbrecher',piece:{weapon:'Kriegsaxt',head:'Helm',body:'Panzer',boots:'Stiefel',ring:'Ring',amulet:'Amulett'}},
    {id:'dornenkult',name:'Dornenkult',piece:{weapon:'Zweihänder',head:'Kriegshelm',body:'Schulterpanzer',boots:'Kampfstiefel',ring:'Siegelring',amulet:'Totem'}},
    {id:'wurzelwacht',name:'Wurzelwacht',piece:{weapon:'Sturmklinge',head:'Visier',body:'Harnisch',boots:'Wachtstiefel',ring:'Schlachtreif',amulet:'Kriegskette'}}
   ],
   bruiser:[
    {id:'nebelzirkel',name:'Nebelzirkel',piece:{weapon:'Stab',head:'Kapuze',body:'Robe',boots:'Schwebestiefel',ring:'Fokusreif',amulet:'Arkanamulett'}},
    {id:'sporenprophet',name:'Sporenprophet',piece:{weapon:'Kristallzepter',head:'Orakelmaske',body:'Mystikrobe',boots:'Ritualschuhe',ring:'Sporenring',amulet:'Seheranhänger'}},
    {id:'glutdunst',name:'Glutdunst',piece:{weapon:'Hexerstab',head:'Glutkapuze',body:'Rauchgewand',boots:'Nebellatschen',ring:'Runenreif',amulet:'Dunstfokus'}}
   ],
   scout:[
    {id:'gruenpfeil',name:'Grünpfeil',piece:{weapon:'Bogen',head:'Kapuze',body:'Lederwams',boots:'Spurstiefel',ring:'Jägerring',amulet:'Waldamulett'}},
    {id:'nachtpirsch',name:'Nachtpirsch',piece:{weapon:'Armbrust',head:'Schleiermaske',body:'Schurkenpanzer',boots:'Schattenstiefel',ring:'Fokusband',amulet:'Federsiegel'}},
    {id:'blattgeist',name:'Blattgeist',piece:{weapon:'Klingenbogen',head:'Waldhelm',body:'Pirscherweste',boots:'Leisetrreter',ring:'Treffsiegel',amulet:'Geistertalisman'}}
   ],
   frost:[
    {id:'frostgruft',name:'Frostgruft',piece:{weapon:'Kälteklinge',head:'Grufthelm',body:'Eisharnisch',boots:'Froststiefel',ring:'Runenring',amulet:'Eisamulett'}},
    {id:'eiswache',name:'Eiswache',piece:{weapon:'Winteraxt',head:'Nordvisier',body:'Sturmpanzer',boots:'Schneemarschierer',ring:'Kältereif',amulet:'Schneefokus'}},
    {id:'todeskern',name:'Todeskern',piece:{weapon:'Totensäbel',head:'Schädelkrone',body:'Todesplatten',boots:'Grufttritte',ring:'Eisherzring',amulet:'Nebelkette'}}
   ],
   summoner:[
    {id:'sarggaertnerin',name:'Sarggärtnerin',piece:{weapon:'Harzstab',head:'Nebelkapuze',body:'Sarggärtner-Robe',boots:'Wurzelstiefel',ring:'Bud-Geister-Ring',amulet:'Seelen-Amulett'}},
    {id:'geisterchor',name:'Geisterchor',piece:{weapon:'Knochenschädel-Zepter',head:'Chorkapuze',body:'Geisterrobe',boots:'Dunstschritt',ring:'Chorring',amulet:'Seelenfokus'}},
    {id:'grabnebel',name:'Grabnebel',piece:{weapon:'Grabwurzel-Stab',head:'Totenhaube',body:'Grabnebel-Gewand',boots:'Grufttreter',ring:'Fluchring',amulet:'Dunstkette'}}
   ]
  };
  root.v6105SetVariants=SET_VARIANTS;

  const legacyMakeSet=(typeof makeSetItem==='function'?makeSetItem:null);
  const variantFor=(classId)=>{
    const list=SET_VARIANTS[String(classId)]||SET_VARIANTS.grower;
    if(!list.length)return null;
    const idx=Math.floor(Math.random()*list.length);
    return list[idx]||list[0];
  };
  const setStats={
   grower:{head:{ausdauer:4,staerke:1},weapon:{staerke:6},body:{ausdauer:6,staerke:1},boots:{staerke:3,ausdauer:2},ring:{staerke:3,glueck:1},amulet:{ausdauer:3,staerke:2}},
   bruiser:{head:{intelligenz:4,glueck:2},weapon:{intelligenz:6},body:{intelligenz:4,ausdauer:2},boots:{intelligenz:3,glueck:2},ring:{intelligenz:4,glueck:1},amulet:{intelligenz:3,ausdauer:2}},
   scout:{head:{geschick:4,glueck:1},weapon:{geschick:6},body:{geschick:3,ausdauer:3},boots:{geschick:5},ring:{geschick:3,glueck:2},amulet:{geschick:3,ausdauer:2}},
   frost:{head:{ausdauer:4,staerke:1},weapon:{staerke:6},body:{ausdauer:6,staerke:1},boots:{staerke:3,ausdauer:2},ring:{staerke:3,glueck:1},amulet:{ausdauer:3,staerke:2}},
   summoner:{head:{intelligenz:4,ausdauer:2},weapon:{intelligenz:6},body:{ausdauer:5,intelligenz:2},boots:{intelligenz:3,ausdauer:2},ring:{intelligenz:4,glueck:1},amulet:{intelligenz:3,ausdauer:2}}
  };
  if(typeof makeSetItem==='function'&&!root.__v6105SetMaker){
    const wrapped=function(classId,slot){
      const cid=String(classId||'grower');
      const variant=variantFor(cid);
      if(!variant){return legacyMakeSet?legacyMakeSet.apply(this,arguments):null;}
      const levelBoost=Math.max(0,Math.floor(((s?.level)||1)-1)/3);
      const icon=(classIcons[cid]||classIcons.grower)[slot]||'✨';
      const piece=(variant.piece&&variant.piece[slot])||slot;
      const raw=setStats[cid]?.[slot]||setStats.grower[slot]||{};
      const bonus=Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,v+levelBoost]));
      return {
        id:`set_${cid}_${variant.id}_${slot}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
        classId:cid,
        slot,
        icon,
        price:0,
        quality:'purple',
        rarity:'epic',
        setId:`${cid}_${variant.id}`,
        setFamily:cid,
        setVariant:variant.id,
        setName:variant.name,
        dropLevel:s?.level||1,
        name:`${variant.name}: ${piece} [Lv.${s?.level||1}]`,
        bonus
      };
    };
    try{makeSetItem=wrapped}catch(e){}
    try{window.makeSetItem=wrapped}catch(e){}
    root.__v6105SetMaker=true;
  }

  if(typeof equippedSetCount==='function'){
    const countSetPieces=function(classId){
      const cid=String(classId||s?.playerClass||'');
      const eq=Object.values(s?.equipment||{}).filter(Boolean);
      return eq.filter(it=>{
        if(String(it?.setFamily||'')===cid)return true;
        if(String(it?.setId||'')===cid)return true;
        if(String(it?.classId||'')===cid&&(it?.setName||String(it?.setId||'').startsWith(cid+'_')))return true;
        return false;
      }).length;
    };
    try{equippedSetCount=countSetPieces}catch(e){}
    try{window.equippedSetCount=countSetPieces}catch(e){}
  }
  if(typeof setBonusValue==='function'){
    const bonusFn=function(kind){
      const pc=String(s?.playerClass||'grower');
      const n=(typeof equippedSetCount==='function'?equippedSetCount(pc):0);
      if(pc==='grower'||pc==='frost'){
        if(kind==='staerke'&&n>=2)return 5;
        if(kind==='hpPct'&&n>=4)return .10;
        if((kind==='wuchtChance'||kind==='frostChance')&&n>=6)return .08;
      }
      if(pc==='bruiser'){
        if(kind==='intelligenz'&&n>=2)return 5;
        if(kind==='critChance'&&n>=4)return .10;
        if(kind==='critDamage'&&n>=6)return .25;
      }
      if(pc==='scout'){
        if(kind==='geschick'&&n>=2)return 5;
        if(kind==='doubleChance'&&n>=4)return .10;
        if(kind==='doubleDamage'&&n>=6)return .20;
      }
      if(pc==='summoner'){
        if(kind==='intelligenz'&&n>=2)return 5;
        if(kind==='summonChance'&&n>=4)return .05;
        if(kind==='summonDamage'&&n>=6)return .20;
      }
      return 0;
    };
    try{setBonusValue=bonusFn}catch(e){}
    try{window.setBonusValue=bonusFn}catch(e){}
  }

  /* Modern comic item art with more silhouette variety.
     All old + new items go through the same resolver. */
  const oldArt=typeof window.v466ItemArtUri==='function'?window.v466ItemArtUri:null;
  const old4106=typeof window.v4106ComicItemArtUri==='function'?window.v4106ComicItemArtUri:null;
  const old4111=typeof window.v4111ComicItemArtUri==='function'?window.v4111ComicItemArtUri:null;
  const cache=new Map();
  const qualityColor=(q)=>({gray:'#9c9c9c',green:'#54c56d',blue:'#58a8ff',purple:'#b06cff',orange:'#ffad43',cyan:'#35f1e8',prismatic:'#ff5ed2'})[String(q||'gray').toLowerCase()]||'#9c9c9c';
  const qualityGlow=(q)=>({gray:'#d5d5d5',green:'#9ff3aa',blue:'#a9d0ff',purple:'#d7b8ff',orange:'#ffd18c',cyan:'#9afffb',prismatic:'#ffb6ea'})[String(q||'gray').toLowerCase()]||'#d5d5d5';
  const clsOf=(it)=>{
    const cid=String(it?.classId||it?.class||it?.setFamily||'').toLowerCase();
    if(cid==='grower'||cid==='bruiser'||cid==='scout'||cid==='frost'||cid==='summoner')return cid;
    const n=(String(it?.name||'')+' '+String(it?.setName||'')).toLowerCase();
    if(/harzrufer|sarggärt|geisterchor|grabnebel|seelen-amulett|bud-geister|totengarten|knochenschädel/.test(n))return 'summoner';
    if(/frost|eis|gruft|todes/.test(n))return 'frost';
    if(/bogen|armbrust|schurke|pfeil|j[aä]ger|pirsch|wald/.test(n))return 'scout';
    if(/robe|kapuze|zauber|stab|zepter|kristall|bong|spore|nebel|ark|hex/.test(n))return 'bruiser';
    return 'grower';
  };
  const clsAccent={grower:'#65d34d',bruiser:'#b677ff',scout:'#49dcae',frost:'#63d8ff',summoner:'#82df65'};
  const esc=(s)=>String(s).replace(/[&<>"']/g,a=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[a]));
  const uri=(svg)=>'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);

  const detectVariant=(it)=>{
    const slot=String(it?.slot||'').toLowerCase();
    const n=(String(it?.name||'')+' '+String(it?.setName||'')).toLowerCase();
    const ic=String(it?.icon||'');
    const cls=clsOf(it);
    if(it?.type==='gem')return {slot:'gem',kind:'gem',cls};
    if(it?.type==='scroll')return {slot:'scroll',kind:'scroll',cls};
    if(slot==='weapon'){
      if(cls==='bruiser'||cls==='summoner'){
        if(/kristall|orb|fokus/.test(n)||/[🔮💎]/u.test(ic))return {slot,kind:'crystal',cls};
        if(/zepter|szepter|scepter/.test(n))return {slot,kind:'scepter',cls};
        if(/zauberstab|stab|runenzweig|bong|spore|orakel|dunst|nebel|hex/.test(n)||/[🪄]/u.test(ic))return {slot,kind:'staff',cls};
        return {slot,kind:'staff',cls};
      }
      if(cls==='scout'){
        if(/armbrust/.test(n))return {slot,kind:'crossbow',cls};
        if(/klinge|dolch|schurke|messer|doppel/.test(n))return {slot,kind:'daggers',cls};
        return {slot,kind:'bow',cls};
      }
      if(cls==='frost'){
        if(/axt|beil/.test(n))return {slot,kind:'iceaxe',cls};
        if(/s[äa]bel/.test(n))return {slot,kind:'sabre',cls};
        return {slot,kind:'frostrune',cls};
      }
      if(/hammer|kolben|streit/.test(n)||/[🔨]/u.test(ic))return {slot,kind:'hammer',cls};
      if(/axt|spalter|beil|dorn/.test(n)||/[🪓]/u.test(ic))return {slot,kind:'axe',cls};
      if(/zwei|schwert|klinge/.test(n)||/[⚔️🗡️]/u.test(ic))return {slot,kind:'sword',cls};
      return {slot,kind:'axe',cls};
    }
    if(slot==='head'){
      if(/kapuze|haube|turban/.test(n)||cls==='bruiser'||cls==='summoner')return {slot,kind:'hood',cls};
      if(/krone/.test(n))return {slot,kind:'crown',cls};
      if(/maske|visier|schleier/.test(n))return {slot,kind:'mask',cls};
      return {slot,kind:cls==='scout'?'mask':'helm',cls};
    }
    if(slot==='body'){
      if(/robe|gewand|mantel/.test(n)||cls==='bruiser'||cls==='summoner')return {slot,kind:'robe',cls};
      if(/leder|wams|weste|pirsch|j[aä]ger/.test(n)||cls==='scout')return {slot,kind:'leather',cls};
      if(cls==='frost')return {slot,kind:'frostplate',cls};
      return {slot,kind:'plate',cls};
    }
    if(slot==='boots'){
      if(cls==='bruiser'||cls==='summoner')return {slot,kind:'ritualboots',cls};
      if(cls==='scout')return {slot,kind:'lightboots',cls};
      return {slot,kind:cls==='frost'?'frostboots':'heavyboots',cls};
    }
    if(slot==='ring')return {slot,kind:/runen|kristall|siegel/.test(n)?'gemring':'ring',cls};
    if(slot==='amulet')return {slot,kind:/totem|fokus|kette/.test(n)?'totem':'amulet',cls};
    return {slot,kind:'generic',cls};
  };

  function fullSvg(it){
    if(!it)return '';
    const d=detectVariant(it), q=String(it?.quality||'gray').toLowerCase();
    const key=[d.slot,d.kind,d.cls,q,!!it?.setName||!!it?.setId,!!it?.mysticSpecial,!!it?.v488Prismatic].join('|');
    if(cache.has(key))return cache.get(key);
    const border=qualityColor(q), glow=qualityGlow(q), accent=clsAccent[d.cls]||'#65d34d';
    const isSet=!!(it?.setName||it?.setId), bg2=isSet?'#231629':'#121417';
    const top=it?.v488Prismatic?'#ff5ed2':q==='cyan'?'#35f1e8':accent;
    const back=`<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#242a2e"/><stop offset="100%" stop-color="${bg2}"/></linearGradient><linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafb"/><stop offset="60%" stop-color="#8f9aa5"/><stop offset="100%" stop-color="#4a5662"/></linearGradient><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffe6a1"/><stop offset="60%" stop-color="#d39b3a"/><stop offset="100%" stop-color="#84561f"/></linearGradient><linearGradient id="energy" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${glow}"/><stop offset="100%" stop-color="${top}"/></linearGradient><filter id="g"><feGaussianBlur stdDeviation="2.1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect x="4" y="4" width="88" height="88" rx="16" fill="url(#bg)"/><rect x="9" y="9" width="78" height="78" rx="13" fill="none" stroke="${border}" stroke-width="4"/><rect x="14" y="14" width="68" height="68" rx="11" fill="rgba(0,0,0,.18)" stroke="rgba(255,255,255,.06)"/><circle cx="48" cy="18" r="8" fill="${top}" opacity=".15"/>`;
    let shape='';
    switch(d.kind){
      case 'axe': shape=`<path d="M50 16 L56 22 L39 39 L33 33 Z" fill="url(#metal)"/><path d="M33 33 L39 39 L28 75 L22 69 Z" fill="#6a4020"/><path d="M54 20 C72 18,80 24,80 36 C80 46,72 50,60 50 L54 44 C63 44,69 41,69 35 C69 29,63 26,54 26 Z" fill="url(#gold)" stroke="#3f2a12" stroke-width="2"/>`; break;
      case 'hammer': shape=`<rect x="32" y="18" width="34" height="18" rx="4" fill="url(#metal)" stroke="#2a323a" stroke-width="2"/><rect x="42" y="34" width="10" height="42" rx="4" fill="#6b4424"/><rect x="28" y="22" width="8" height="10" rx="2" fill="url(#gold)"/><rect x="62" y="22" width="8" height="10" rx="2" fill="url(#gold)"/>`; break;
      case 'sword': shape=`<path d="M47 12 L58 28 L53 31 L60 41 L51 50 L46 44 L40 50 L33 43 L40 35 L35 30 Z" fill="url(#metal)" stroke="#2b3440" stroke-width="2"/><rect x="44" y="48" width="8" height="24" rx="3" fill="#6b4424"/><rect x="34" y="46" width="28" height="5" rx="2.5" fill="url(#gold)"/>`; break;
      case 'staff': shape=`<rect x="45" y="19" width="8" height="55" rx="4" fill="#6b4424"/><circle cx="49" cy="23" r="10" fill="url(#energy)" filter="url(#g)"/><path d="M38 34 Q49 40 60 34" stroke="${accent}" stroke-width="3" fill="none"/>`; break;
      case 'scepter': shape=`<rect x="45" y="22" width="8" height="52" rx="4" fill="#694427"/><path d="M39 18 L59 18 L64 30 L49 36 L34 30 Z" fill="url(#gold)" stroke="#65401c" stroke-width="2"/><circle cx="49" cy="25" r="8" fill="url(#energy)"/>`; break;
      case 'crystal': shape=`<rect x="45" y="25" width="8" height="48" rx="4" fill="#624226"/><path d="M49 10 L61 23 L54 41 L44 41 L37 23 Z" fill="url(#energy)" stroke="#28414f" stroke-width="2" filter="url(#g)"/>`; break;
      case 'bow': shape=`<path d="M30 16 Q18 48 30 80" stroke="#9a6d31" stroke-width="7" fill="none"/><path d="M65 16 Q77 48 65 80" stroke="#9a6d31" stroke-width="7" fill="none"/><line x1="30" y1="16" x2="65" y2="80" stroke="#d8e8ef" stroke-width="2"/><line x1="65" y1="16" x2="30" y2="80" stroke="#d8e8ef" stroke-width="2"/><line x1="20" y1="48" x2="72" y2="48" stroke="url(#energy)" stroke-width="4"/>`; break;
      case 'crossbow': shape=`<rect x="24" y="42" width="48" height="10" rx="5" fill="#7b4f24"/><path d="M26 34 Q48 18 70 34" stroke="url(#metal)" stroke-width="6" fill="none"/><path d="M26 60 Q48 76 70 60" stroke="url(#metal)" stroke-width="6" fill="none"/><rect x="43" y="28" width="10" height="38" rx="4" fill="#5e3e22"/><line x1="18" y1="48" x2="78" y2="48" stroke="#d8e8ef" stroke-width="2"/>`; break;
      case 'daggers': shape=`<path d="M37 20 L47 34 L42 38 L47 46 L39 53 L33 47 L28 51 L22 45 L29 39 L24 35 Z" fill="url(#metal)" stroke="#2b3440" stroke-width="2"/><rect x="34" y="50" width="6" height="18" rx="2" fill="#6b4424"/><path d="M59 20 L69 34 L64 38 L69 46 L61 53 L55 47 L50 51 L44 45 L51 39 L46 35 Z" fill="url(#metal)" stroke="#2b3440" stroke-width="2"/><rect x="56" y="50" width="6" height="18" rx="2" fill="#6b4424"/>`; break;
      case 'iceaxe': shape=`<path d="M50 16 L56 22 L39 39 L33 33 Z" fill="url(#metal)"/><path d="M33 33 L39 39 L28 75 L22 69 Z" fill="#5f6c7f"/><path d="M54 20 C73 18,81 24,81 36 C81 46,73 50,60 50 L54 44 C64 44,70 41,70 35 C70 29,64 26,54 26 Z" fill="url(#energy)" stroke="#2e5363" stroke-width="2"/>`; break;
      case 'sabre': shape=`<path d="M34 23 C47 14,62 15,74 24 C64 24,55 27,47 35 C41 41,36 49,32 60 C30 46,30 33,34 23 Z" fill="url(#energy)" stroke="#234b5d" stroke-width="2"/><rect x="42" y="56" width="8" height="18" rx="3" fill="#6b4424"/><rect x="34" y="54" width="24" height="5" rx="2.5" fill="url(#gold)"/>`; break;
      case 'frostrune': shape=`<path d="M47 12 L58 28 L53 31 L60 41 L51 50 L46 44 L40 50 L33 43 L40 35 L35 30 Z" fill="url(#energy)" stroke="#234b5d" stroke-width="2"/><rect x="44" y="48" width="8" height="24" rx="3" fill="#5e7184"/><rect x="34" y="46" width="28" height="5" rx="2.5" fill="url(#gold)"/><path d="M38 28 L60 28" stroke="#e8fbff" stroke-width="2" opacity=".8"/>`; break;
      case 'helm': shape=`<path d="M24 60 C24 34,33 22,48 22 C63 22,72 34,72 60 Z" fill="url(#metal)" stroke="#29323a" stroke-width="2"/><rect x="30" y="46" width="36" height="12" rx="4" fill="${accent}" opacity=".7"/><rect x="37" y="56" width="22" height="10" rx="3" fill="#29323a"/>`; break;
      case 'hood': shape=`<path d="M26 66 C26 34,34 19,48 19 C62 19,70 34,70 66 Z" fill="#3d264e" stroke="#1f1528" stroke-width="2"/><path d="M34 35 C39 29,44 26,48 26 C52 26,57 29,62 35 L58 64 L38 64 Z" fill="${accent}" opacity=".75"/>`; break;
      case 'crown': shape=`<path d="M20 62 L27 28 L40 42 L48 24 L56 42 L69 28 L76 62 Z" fill="url(#gold)" stroke="#71491d" stroke-width="2"/><circle cx="48" cy="44" r="8" fill="url(#energy)"/>`; break;
      case 'mask': shape=`<path d="M24 34 C31 26,40 22,48 22 C56 22,65 26,72 34 L64 66 C59 70,54 72,48 72 C42 72,37 70,32 66 Z" fill="url(#metal)" stroke="#29323a" stroke-width="2"/><path d="M32 42 L42 46 M54 46 L64 42" stroke="#101417" stroke-width="4"/><path d="M41 58 Q48 63 55 58" stroke="${accent}" stroke-width="3" fill="none"/>`; break;
      case 'plate': shape=`<path d="M26 23 L70 23 L77 37 L70 73 L26 73 L19 37 Z" fill="url(#metal)" stroke="#29323a" stroke-width="2"/><path d="M48 23 L48 73" stroke="#44515d" stroke-width="3"/><path d="M33 34 L63 34" stroke="${accent}" stroke-width="5" opacity=".7"/>`; break;
      case 'frostplate': shape=`<path d="M26 23 L70 23 L77 37 L70 73 L26 73 L19 37 Z" fill="#7b8ea3" stroke="#2e4b5a" stroke-width="2"/><path d="M48 23 L48 73" stroke="#e2f9ff" stroke-width="2" opacity=".75"/><path d="M33 34 L63 34" stroke="${accent}" stroke-width="5" opacity=".9"/><path d="M34 48 L62 48" stroke="#d6faff" stroke-width="2" opacity=".8"/>`; break;
      case 'robe': shape=`<path d="M33 22 L63 22 L72 39 L66 74 L30 74 L24 39 Z" fill="#51336c" stroke="#241733" stroke-width="2"/><path d="M48 24 L48 74" stroke="${accent}" stroke-width="4" opacity=".8"/><path d="M35 38 L61 38" stroke="#d8c5ff" stroke-width="2" opacity=".7"/>`; break;
      case 'leather': shape=`<path d="M30 22 L66 22 L75 39 L64 74 L32 74 L21 39 Z" fill="#5d4228" stroke="#2e2114" stroke-width="2"/><path d="M37 35 L59 35" stroke="${accent}" stroke-width="4" opacity=".8"/><path d="M40 50 L56 50" stroke="#d7b285" stroke-width="2"/>`; break;
      case 'heavyboots': shape=`<path d="M28 28 L44 28 L44 55 L60 55 L66 72 L24 72 L24 42 Z" fill="url(#metal)" stroke="#29323a" stroke-width="2"/><path d="M52 28 L68 28 L68 55 L74 72 L48 72 L48 42 Z" fill="url(#metal)" stroke="#29323a" stroke-width="2"/><path d="M26 58 L70 58" stroke="${accent}" stroke-width="4" opacity=".75"/>`; break;
      case 'frostboots': shape=`<path d="M28 28 L44 28 L44 55 L60 55 L66 72 L24 72 L24 42 Z" fill="#7d93a8" stroke="#2e4b5a" stroke-width="2"/><path d="M52 28 L68 28 L68 55 L74 72 L48 72 L48 42 Z" fill="#7d93a8" stroke="#2e4b5a" stroke-width="2"/><path d="M26 58 L70 58" stroke="${accent}" stroke-width="4" opacity=".95"/>`; break;
      case 'ritualboots': shape=`<path d="M28 28 L44 28 L44 55 L57 55 L60 72 L24 72 L24 42 Z" fill="#51336c" stroke="#241733" stroke-width="2"/><path d="M52 28 L68 28 L68 55 L72 72 L48 72 L48 42 Z" fill="#51336c" stroke="#241733" stroke-width="2"/><circle cx="36" cy="60" r="4" fill="url(#energy)"/><circle cx="60" cy="60" r="4" fill="url(#energy)"/>`; break;
      case 'lightboots': shape=`<path d="M25 36 L43 30 L52 56 L67 56 L72 69 L24 69 L18 52 Z" fill="#4f5e39" stroke="#23301b" stroke-width="2"/><path d="M32 55 L62 55" stroke="${accent}" stroke-width="4" opacity=".8"/>`; break;
      case 'ring': shape=`<circle cx="48" cy="50" r="19" fill="none" stroke="url(#gold)" stroke-width="10"/><circle cx="48" cy="30" r="9" fill="url(#energy)" filter="url(#g)"/>`; break;
      case 'gemring': shape=`<circle cx="48" cy="52" r="18" fill="none" stroke="url(#metal)" stroke-width="9"/><path d="M48 18 L61 29 L56 42 L40 42 L35 29 Z" fill="url(#energy)" stroke="#25434d" stroke-width="2" filter="url(#g)"/>`; break;
      case 'amulet': shape=`<circle cx="48" cy="25" r="12" fill="none" stroke="#c9d0d7" stroke-width="4"/><path d="M48 33 L63 47 L58 70 L38 70 L33 47 Z" fill="url(#energy)" stroke="#26454f" stroke-width="2" filter="url(#g)"/>`; break;
      case 'totem': shape=`<path d="M48 24 C58 24,66 32,66 42 C66 53,58 61,48 70 C38 61,30 53,30 42 C30 32,38 24,48 24 Z" fill="url(#energy)" stroke="#28474e" stroke-width="2" filter="url(#g)"/><circle cx="48" cy="18" r="9" fill="none" stroke="#d5dbdf" stroke-width="4"/>`; break;
      case 'gem': shape=`<path d="M48 14 L66 32 L58 62 L38 62 L30 32 Z" fill="url(#energy)" stroke="#29404a" stroke-width="2" filter="url(#g)"/>`; break;
      case 'scroll': shape=`<path d="M28 26 Q22 26 22 32 L22 60 Q22 66 28 66 L68 66 Q74 66 74 60 L74 32 Q74 26 68 26 Z" fill="#f0deb5" stroke="#8a6932" stroke-width="2"/><path d="M30 34 H66 M30 42 H66 M30 50 H58" stroke="#816734" stroke-width="3"/><circle cx="22" cy="46" r="8" fill="#d1b279"/><circle cx="74" cy="46" r="8" fill="#d1b279"/>`; break;
      default: shape=`<circle cx="48" cy="48" r="20" fill="url(#energy)" filter="url(#g)"/>`;
    }
    const tag=isSet?`<rect x="18" y="72" width="60" height="11" rx="5.5" fill="rgba(0,0,0,.45)"/><text x="48" y="80" font-size="8" font-weight="700" fill="#f6e7b4" text-anchor="middle">SET</text>`:'';
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">${back}${shape}${tag}</svg>`;
    const u=uri(svg);
    cache.set(key,u);
    return u;
  }

  function artResolver(it){
    try{
      if(!it)return '';
      const slot=String(it.slot||'').toLowerCase();
      if(!slot&&it.type!=='gem'&&it.type!=='scroll')return oldArt?oldArt(it):(old4111?old4111(it):(old4106?old4106(it):''));
      return fullSvg(it);
    }catch(e){
      try{return oldArt?oldArt(it):(old4111?old4111(it):(old4106?old4106(it):''))}catch(_){return ''}
    }
  }

  window.v466ItemArtUri=artResolver;
  window.v4106ComicItemArtUri=artResolver;
  window.v4111ComicItemArtUri=artResolver;
  window.v6105ItemArtUri=artResolver;
  window.v6105ItemArtSvg=fullSvg;

  function refreshArt(){
    const charActive=!!document.getElementById('character')?.classList.contains('active');
    const shopActive=!!document.getElementById('shop')?.classList.contains('active');
    if(!charActive&&!shopActive)return false;
    try{window.v4103DecorateItemSurfaces?.()}catch(e){}
    try{window.v4108DecorateComicItems?.()}catch(e){}
    try{window.v4112RefreshAllItemArt?.()}catch(e){}
    try{window.v4111RefreshComicItems?.()}catch(e){}
    if(charActive){
      try{window.v470PaintEquipmentSlots?.()}catch(e){}
      try{window.v6102PaintEquipmentSlots?.()}catch(e){}
      try{window.renderInventory?.()}catch(e){}
    }
    if(shopActive)try{window.renderShop?.()}catch(e){}
    return true;
  }

  function refreshMerchantPools(force){
    if(!s||window.__V200_AUTH_READY__!==true)return;
    if(!force&&Number(s.v6105ItemRefresh||0)===1)return;
    try{
      s.weaponShop=[];s.magicShop=[];
      if(typeof v057FillShops==='function')v057FillShops(true); else if(typeof v030Fill==='function')v030Fill(true);
      s.v6105ItemRefresh=1;
      persist(false);
    }catch(e){console.warn('V6.105 item refresh',e)}
  }

  function qa(){
    const need=24;
    const counts=Object.fromEntries(Object.entries(classGear).map(([k,v])=>[k,(v||[]).length]));
    const extraOk=Object.keys(EXTRA).every(k=>(classGear[k]||[]).filter(it=>String(it.id||'').startsWith('v6105_')).length>=need);
    const setOk=Object.keys(SET_VARIANTS).every(k=>(SET_VARIANTS[k]||[]).length>=3);
    const artSamples=[
      {name:'Harzgrimm-Schwert',slot:'weapon',classId:'grower',quality:'blue'},
      {name:'Kristallbong-Zepter',slot:'weapon',classId:'bruiser',quality:'purple'},
      {name:'Stachelarmbrust',slot:'weapon',classId:'scout',quality:'green'},
      {name:'Frostbiss-Schwert',slot:'weapon',classId:'frost',quality:'cyan'},
      {name:'Waldläuferkapuze',slot:'head',classId:'scout',quality:'orange'},
      {name:'Arkanrobe des Nebelzirkels',slot:'body',classId:'bruiser',quality:'purple'}
    ].map(artResolver);
    return {counts,extraOk,setOk,artOk:artSamples.every(Boolean),added,variants:Object.fromEntries(Object.entries(SET_VARIANTS).map(([k,v])=>[k,v.map(x=>x.name)]))};
  }
  window.v6105ItemVarietyQA=qa;

  try{
    const runner=window.v4107RunQA||window.v4102RunQA;
    if(typeof runner==='function'&&!window.__v6105QaWrapped){
      const wrapped=function(){
        const r=runner.apply(this,arguments);if(!r||!Array.isArray(r.results))return r;
        const q=qa();
        r.results.push({category:'Item-Vielfalt V6.105',name:'Jede Klasse hat mindestens 24 neue Item-Templates',pass:q.extraOk,severity:'error',detail:JSON.stringify(q.counts)});
        r.results.push({category:'Item-Vielfalt V6.105',name:'Jede Klasse besitzt 3 Set-Varianten',pass:q.setOk,severity:'error',detail:JSON.stringify(q.variants)});
        r.results.push({category:'Item-Vielfalt V6.105',name:'Neue Art-Resolver liefert für alle Beispielitems ein Comic-Artwork',pass:q.artOk,severity:'error',detail:'V6.105 art sample check'});
        r.total=r.results.length;r.passed=r.results.filter(x=>x.pass).length;r.failed=r.results.filter(x=>!x.pass&&x.severity!=='warn').length;r.warnings=r.results.filter(x=>!x.pass&&x.severity==='warn').length;r.ok=r.failed===0;return r;
      };
      window.v4107RunQA=wrapped;if(window.v4102RunQA===runner)window.v4102RunQA=wrapped;window.__v6105QaWrapped=true;
    }
  }catch(e){}

  document.addEventListener('DOMContentLoaded',()=>{if(!window.v7206StartupBusy?.())refreshArt()},{once:true});
  window.addEventListener('growlegends:first-playable',refreshArt,{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='character')refreshArt();if(id==='shop'){refreshMerchantPools(false);refreshArt()}},{passive:true});
  window.addEventListener('pageshow',refreshArt,{passive:true});

  try{if(!window.v7206StartupBusy?.())refreshArt()}catch(e){}
  console.log('V6.105 item variety active',qa());
 }catch(e){console.error('V6.105 item variety failed',e)}
})();
