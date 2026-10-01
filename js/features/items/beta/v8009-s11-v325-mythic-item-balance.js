(function(){
  const V325_SET_BASE = {
    grower:{
      head:{ausdauer:4,staerke:2}, weapon:{staerke:6}, body:{ausdauer:6},
      boots:{staerke:3,ausdauer:2}, ring:{staerke:4}, amulet:{ausdauer:3,staerke:2}
    },
    scout:{
      head:{geschick:4,glueck:2}, weapon:{geschick:6}, body:{ausdauer:3,geschick:3},
      boots:{geschick:5}, ring:{geschick:3,glueck:2}, amulet:{geschick:3,glueck:2}
    },
    bruiser:{
      head:{glueck:4,ausdauer:2}, weapon:{glueck:5,geschick:2}, body:{ausdauer:4,glueck:2},
      boots:{geschick:3,glueck:2}, ring:{glueck:5}, amulet:{glueck:3,geschick:2}
    }
  };

  function v325Clone(x){
    try{return JSON.parse(JSON.stringify(x||{}))}catch(e){return {...(x||{})}}
  }

  function v325ClassForItem(it){
    if(it?.classId && classGear?.[it.classId])return it.classId;
    if(it?.mysticSetId){
      const m=String(it.mysticSetId).match(/^v110_(.+)$/);
      if(m && classGear?.[m[1]])return m[1];
    }
    return s.playerClass||'grower';
  }

  function v325FindBase(it){
    if(it?.baseBonusV055 && Object.keys(it.baseBonusV055).length){
      return v325Clone(it.baseBonusV055);
    }
    const cls=v325ClassForItem(it);
    const pool=classGear?.[cls]||[];
    const clean=String(it?.name||'')
      .replace(/^(Normal|Gewöhnlich|Rare|Episch|Legendär|Mystisch):\s*/,'')
      .replace(/\s*\[Lv\.\d+\]\s*$/,'');
    const hit=pool.find(x =>
      (it?.slot && x.slot===it.slot && clean.includes(x.name)) ||
      clean.includes(x.name)
    );
    if(hit)return v325Clone(hit.bonus||{});

    if(it?.mysticSetId){
      return v325Clone(V325_SET_BASE?.[cls]?.[it.slot]||{});
    }
    return null;
  }

  function v325CyanFloor(base,lvl){
    if(typeof v024Bonus==='function')return v024Bonus(base,'cyan',lvl);
    const scale=1+(Math.max(1,lvl)-1)*.05;
    const out={};
    Object.entries(base||{}).forEach(([k,v])=>{
      out[k]=Math.max(6,Math.round((Number(v)||0)*scale*2.18+5));
    });
    return out;
  }

  function v325FixMystic(it){
    if(!it || (it.quality!=='cyan' && it.rarity!=='mythic'))return false;
    const lvl=Math.max(1,Number(it.dropLevel)||Number(s.level)||1);
    const base=v325FindBase(it);
    if(!base || !Object.keys(base).length)return false;

    const floor=v325CyanFloor(base,lvl);
    const old=it.bonus&&typeof it.bonus==='object'?it.bonus:{};
    const merged={...old};
    Object.entries(floor).forEach(([k,v])=>{
      merged[k]=Math.max(Number(merged[k])||0,Number(v)||0);
    });

    /* Mystic set pieces keep their extra secondary stats, but may never
       fall below the normal cyan curve for their slot/level. */
    it.quality='cyan';
    it.rarity='mythic';
    it.dropLevel=lvl;
    it.baseBonusV055=v325Clone(base);
    it.bonus=merged;
    return JSON.stringify(old)!==JSON.stringify(merged);
  }

  /* Future normal mythic world-boss drops use the same rarity curve as all
     other item qualities. This guarantees cyan > orange for same base+level. */
  if(typeof v110MakeMysticItem==='function'){
    const v325OldMakeMystic=v110MakeMysticItem;
    v110MakeMysticItem=function(){
      const item=v325OldMakeMystic.apply(this,arguments);
      v325FixMystic(item);
      return item;
    };
  }

  if(typeof v110MakeRareMysticSet==='function'){
    const v325OldMakeMysticSet=v110MakeRareMysticSet;
    v110MakeRareMysticSet=function(){
      const item=v325OldMakeMysticSet.apply(this,arguments);
      v325FixMystic(item);
      return item;
    };
  }

  /* Repair already-owned/equipped mystic items once, without touching
     legendary/epic/normal items or reducing any existing stat. */
  let changed=false;
  (s.inventory||[]).forEach(it=>{ if(v325FixMystic(it))changed=true; });
  Object.values(s.equipment||{}).forEach(it=>{ if(v325FixMystic(it))changed=true; });

  s.v325MysticBalanceMigrated=true;
  try{
    localStorage.setItem(KEY,JSON.stringify(s));
    /* V4.86: obsolete mythic migration notice retired; correction stays silent. */
  }catch(e){console.error('V4.02 mythic migration',e)}

  
  const line=document.querySelector('#v141VersionLine');
  try{render()}catch(e){}
})();
