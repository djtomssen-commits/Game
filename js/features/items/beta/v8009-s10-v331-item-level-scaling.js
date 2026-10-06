(function(){
  const V331_RARITY={
    gray:   {mult:1.00, flat:0},
    green:  {mult:1.16, flat:1},
    blue:   {mult:1.34, flat:2},
    purple: {mult:1.55, flat:3},
    orange: {mult:1.78, flat:4},
    cyan:   {mult:2.02, flat:5}
  };

  function v331Quality(it){
    if(it?.quality)return it.quality;
    const r=String(it?.rarity||'').toLowerCase();
    return r==='mythic'?'cyan':r==='legendary'?'orange':r==='epic'?'purple':r==='rare'?'blue':r==='uncommon'?'green':'gray';
  }
  function v331Base(it){
    if(it?.baseBonusV055 && Object.keys(it.baseBonusV055).length)return {...it.baseBonusV055};
    const cls=it?.classId||s.playerClass||'grower';
    const pool=classGear?.[cls]||[];
    const clean=String(it?.name||'').replace(/^(Normal|Gewöhnlich|Rare|Episch|Legendär|Mystisch):\s*/,'').replace(/\s*\[Lv\.\d+\]\s*$/,'');
    const hit=pool.find(x=>(it?.slot&&x.slot===it.slot&&clean.includes(x.name))||clean.includes(x.name));
    if(hit)return {...(hit.bonus||{})};
    return null;
  }

  /* Level is the main long-term progression. Each level adds a strong,
     rarity-independent amount per combat stat. Rarity gives a bounded head
     start, so a sufficiently higher-level common item can overtake mythic. */
  function v331ScaledBonus(base,quality,level){
    const meta=V331_RARITY[quality]||V331_RARITY.gray;
    const lvl=Math.max(1,Number(level)||1);
    const levelGain=(lvl-1)*0.72;
    const out={};
    Object.entries(base||{}).forEach(([k,v])=>{
      if(k==='growSkill')return;
      out[k]=Math.max(1,Math.round((Number(v)||0)*meta.mult + levelGain + meta.flat));
    });
    return out;
  }

  function v331Rescale(it){
    if(!it||it.type==='material'||!it.slot)return false;
    const base=v331Base(it);
    if(!base||!Object.keys(base).length)return false;
    const q=v331Quality(it);
    const lvl=Math.max(1,Number(it.dropLevel)||Number(s.level)||1);
    const old=JSON.stringify(it.bonus||{});
    const fresh=v331ScaledBonus(base,q,lvl);

    /* Preserve non-standard special bonus keys, but combat attributes are
       recalculated from level + rarity so every item follows one curve. */
    const keep={};
    Object.entries(it.bonus||{}).forEach(([k,v])=>{
      if(!['staerke','geschick','intelligenz','ausdauer','glueck','growSkill'].includes(k))keep[k]=v;
    });
    it.bonus={...fresh,...keep};
    it.baseBonusV055={...base};
    it.dropLevel=lvl;
    return old!==JSON.stringify(it.bonus);
  }

  /* V8.175: historical migration of already persisted items retired.
     Existing inventory/equipment is server-owned and must never be rescaled at boot.
     v331 remains only as a generator curve for newly created legacy/offline items. */

  /* Make the central bonus generator use the same new curve for future items. */
  if(typeof v024Bonus==='function'){
    v024Bonus=function(base,quality,level){return v331ScaledBonus(base,quality,level)};
  }

  /* V4.02's "mythic must beat currently equipped item" was useful to expose
     the old bug, but would now defeat level crossover. Disable that artificial
     guarantee: mythic is strongest at equal level, not forever. */
  if(typeof v330Guarantee==='function'){
    try{v330Guarantee=function(it){return v331Rescale(it)}}catch(e){}
  }

  /* Recalculate future generated mystic items on the common curve. */
  if(typeof v110MakeMysticItem==='function'){
    const old=v110MakeMysticItem;
    v110MakeMysticItem=function(){const it=old.apply(this,arguments);v331Rescale(it);return it};
  }
  if(typeof v110MakeRareMysticSet==='function'){
    const old=v110MakeRareMysticSet;
    v110MakeRareMysticSet=function(){const it=old.apply(this,arguments);v331Rescale(it);return it};
  }

  /* Character/Inventory cleanup Phase 1: V331 remains the generator/migration curve,
     but no longer recalculates every item during every inventory paint. New items already use
     v024Bonus/the wrapped mystic generators; V429 locks their persisted stats on first save/render. */

  /* V8.175: no startup save/render side effect from this legacy migration owner. */
  const line=document.querySelector('#v141VersionLine');
})();
