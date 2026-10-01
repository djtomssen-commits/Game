/* ===== V4.02 Expanded merchant item pool =====
   Set items stay untouched: makeSetItem(), classSets and set bonuses are unchanged.
*/
const V108_GEAR={
  grower:[
    ['v108_gw1','Wurzelbeißer','weapon','🪓',260,{staerke:7}],
    ['v108_gw2','Dornenbrecher','weapon','⚔️',285,{staerke:5,ausdauer:3}],
    ['v108_gw3','Harzhammer','weapon','🔨',310,{staerke:8,glueck:1}],
    ['v108_gh1','Kappe des Wurzelkriegers','head','🪖',225,{staerke:3,ausdauer:4}],
    ['v108_gh2','Dornenkrone','head','👑',245,{staerke:4,glueck:2}],
    ['v108_gh3','Harzbrecher-Visier','head','⛑️',270,{ausdauer:6,staerke:2}],
    ['v108_ga1','Rindenpanzer','body','🛡️',330,{ausdauer:8}],
    ['v108_ga2','Dornenharnisch','body','🥋',355,{staerke:4,ausdauer:5}],
    ['v108_ga3','Panzer des Tiefwurzlers','body','🦺',380,{ausdauer:7,glueck:2}],
    ['v108_gb1','Wurzelstampfer','boots','🥾',205,{staerke:4,ausdauer:3}],
    ['v108_gb2','Moosläufer','boots','👢',215,{ausdauer:4,glueck:2}],
    ['v108_gb3','Dornenstiefel','boots','🥾',235,{staerke:5,ausdauer:2}],
    ['v108_gr1','Ring des Harzbrechers','ring','💍',240,{staerke:5,glueck:2}],
    ['v108_gr2','Wurzelring','ring','💍',255,{staerke:4,ausdauer:3}],
    ['v108_gr3','Siegel der grünen Faust','ring','💍',275,{staerke:6}],
    ['v108_gm1','Amulett der alten Wurzel','amulet','📿',250,{ausdauer:4,staerke:3}],
    ['v108_gm2','Harztropfen-Amulett','amulet','💎',270,{staerke:5,glueck:2}],
    ['v108_gm3','Talisman des Dickichts','amulet','🧿',290,{ausdauer:5,glueck:3}]
  ],
  bruiser:[
    ['v108_mw1','Stab der violetten Glut','weapon','🪄',270,{intelligenz:6,glueck:2}],
    ['v108_mw2','Nebelzepter','weapon','🔮',295,{intelligenz:5,glueck:4}],
    ['v108_mw3','Sporkristall-Stab','weapon','🪄',320,{intelligenz:7,ausdauer:2}],
    ['v108_mh1','Kapuze der violetten Spore','head','🧙',230,{intelligenz:5,ausdauer:2}],
    ['v108_mh2','Nebelkrone','head','👑',250,{intelligenz:6,glueck:2}],
    ['v108_mh3','Maske des Dunstsehers','head','🎭',270,{intelligenz:4,ausdauer:4}],
    ['v108_ma1','Mantel des Nebelzirkels','body','🥋',340,{intelligenz:5,ausdauer:5}],
    ['v108_ma2','Sporenrobe','body','🥼',360,{intelligenz:7,ausdauer:3}],
    ['v108_ma3','Gewand der Purpurnacht','body','🧥',390,{ausdauer:6,intelligenz:4}],
    ['v108_mb1','Nebelwanderer','boots','👢',205,{intelligenz:4,glueck:3}],
    ['v108_mb2','Sporenschritte','boots','👢',225,{intelligenz:5,ausdauer:2}],
    ['v108_mb3','Schuhe des Dunstes','boots','👞',240,{intelligenz:5,glueck:2}],
    ['v108_mr1','Ring des Nebelauges','ring','💍',245,{intelligenz:6}],
    ['v108_mr2','Sporenring','ring','💍',260,{intelligenz:4,glueck:3}],
    ['v108_mr3','Siegel des Bong-Zirkels','ring','💍',280,{intelligenz:5,ausdauer:3}],
    ['v108_mm1','Amulett des Dunstes','amulet','📿',255,{intelligenz:5,ausdauer:3}],
    ['v108_mm2','Violetter Kristalltalisman','amulet','💎',275,{intelligenz:6,glueck:2}],
    ['v108_mm3','Auge des Nebels','amulet','🧿',300,{intelligenz:7,ausdauer:2}]
  ],
  scout:[
    ['v108_sw1','Dornenbogen','weapon','🏹',270,{geschick:8}],
    ['v108_sw2','Rankenschütze','weapon','🏹',295,{geschick:6,glueck:2}],
    ['v108_sw3','Bogen des Blattjägers','weapon','🏹',320,{geschick:7,ausdauer:2}],
    ['v108_sh1','Kapuze des Blattjägers','head','🥷',225,{geschick:5,glueck:2}],
    ['v108_sh2','Dornenmaske','head','🎭',245,{geschick:4,ausdauer:3}],
    ['v108_sh3','Waldläufer-Kapuze','head','🧢',265,{geschick:6,glueck:1}],
    ['v108_sa1','Blattleder-Rüstung','body','🥼',335,{geschick:5,ausdauer:5}],
    ['v108_sa2','Dornenleder','body','🦺',360,{geschick:6,ausdauer:4}],
    ['v108_sa3','Panzer des Grünpirschers','body','🥋',385,{geschick:7,ausdauer:3}],
    ['v108_sb1','Rankenläufer','boots','👟',205,{geschick:6}],
    ['v108_sb2','Blattschritte','boots','🥾',220,{geschick:5,glueck:2}],
    ['v108_sb3','Stiefel des Grünpirschers','boots','👢',240,{geschick:5,ausdauer:3}],
    ['v108_sr1','Ring des Blattjägers','ring','💍',240,{geschick:5,glueck:2}],
    ['v108_sr2','Dornenring','ring','💍',260,{geschick:6}],
    ['v108_sr3','Siegel des stillen Pfeils','ring','💍',280,{geschick:4,glueck:4}],
    ['v108_sm1','Amulett des Grünpirschers','amulet','📿',250,{geschick:5,ausdauer:3}],
    ['v108_sm2','Blattauge-Talisman','amulet','🧿',275,{geschick:6,glueck:2}],
    ['v108_sm3','Anhänger des stillen Jägers','amulet','💎',295,{geschick:5,glueck:4}]
  ]
};

for(const [cls,list] of Object.entries(V108_GEAR)){
  classGear[cls]??=[];
  for(const [id,name,slot,icon,price,bonus] of list){
    if(!classGear[cls].some(x=>x.id===id)){
      classGear[cls].push({id,name,slot,icon,price,classId:cls,bonus});
    }
  }
}

/* Keep allClassGear usable even though the original constant was created earlier. */
const v108FindBaseItem=(id)=>{
  for(const arr of Object.values(classGear)){
    const found=arr.find(x=>x.id===id);
    if(found)return found;
  }
  return items.find(x=>x.id===id);
};

/* Any old lookup that only knew the original pool gets a safe expanded fallback. */
const v108OldBuy=window.buy;
window.buy=id=>{
  const expanded=v108FindBaseItem(id);
  if(!expanded)return v108OldBuy(id);
  if(s.gold<expanded.price)return v115Alert('Zu wenig Gold.');
  s.gold-=expanded.price;
  s.inventory.push({...expanded});
  persist();
};

/* Existing V4.02 shop generation draws from classGear, so the new pool is now included.
   Force one refresh of saved merchant stock so players see new items immediately. */
if(!s.v108ItemPool){
  s.v108ItemPool=true;
  try{
    s.weaponShop=[];
    s.magicShop=[];
  }catch(e){}
  try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
}

const v108BaseRender=render;
render=function(){
  const result=v108BaseRender();
  
  return result;
};
