(function(){
  const VERSION='V4.67 Stable', SHORT='V4.67', CURVE_VERSION=4;
  const COMBAT=['staerke','geschick','intelligenz','ausdauer','glueck'];
  /* V7.168 canonical order: gray < green < blue < purple < orange < prismatic < cyan(mythisch). */
  const RARITY_BONUS={gray:0,green:1.5,blue:3,purple:4.5,orange:6,prismatic:8.5,cyan:10.5};
  const LEVEL_GAIN=0.72;
    const V7167_LUCK={gray:0,green:0,blue:0,purple:.05,orange:.08,prismatic:.11,cyan:.15};
  const V7167_BASE={
    grower:{weapon:11,head:8,body:11,boots:7,ring:7,amulet:8},
    frost:{weapon:11,head:8,body:11,boots:7,ring:7,amulet:8},
    bruiser:{weapon:11,head:8,body:11,boots:7,ring:8,amulet:9},
    scout:{weapon:11,head:7,body:11,boots:8,ring:8,amulet:9},
    summoner:{weapon:11,head:6,body:11,boots:6,ring:7,amulet:8}
  };

  /* Standard class-set distribution. Total budget is still the SAME shared slot
     budget as regular gear; the map only decides which attributes receive it. */
  const SET_PATTERN={
    grower:{
      head:{ausdauer:4},weapon:{staerke:6},body:{ausdauer:6},
      boots:{staerke:3,ausdauer:2},ring:{staerke:3},amulet:{ausdauer:3,glueck:1}
    },
    scout:{
      head:{geschick:4},weapon:{geschick:6},body:{ausdauer:3,geschick:3},
      boots:{geschick:5},ring:{glueck:3,geschick:2},amulet:{geschick:3,glueck:2}
    },
    bruiser:{
      head:{intelligenz:4,glueck:2},weapon:{intelligenz:6},body:{intelligenz:4,ausdauer:2},
      boots:{intelligenz:3,glueck:2},ring:{intelligenz:5},amulet:{intelligenz:3,glueck:2}
    }
  };
  /* Mystic-set pieces keep their intended two-stat flavour, but no extra hidden
     raw-stat budget. Their actual advantage comes from cyan rarity + special effect. */
  const MYSTIC_SET_PATTERN={
    grower:{
      head:{ausdauer:4,staerke:2},weapon:{staerke:6},body:{ausdauer:6},
      boots:{staerke:3,ausdauer:2},ring:{staerke:4},amulet:{ausdauer:3,staerke:2}
    },
    scout:{
      head:{geschick:4,glueck:2},weapon:{geschick:6},body:{ausdauer:3,geschick:3},
      boots:{geschick:5},ring:{geschick:3,glueck:2},amulet:{geschick:3,glueck:2}
    },
    bruiser:{
      head:{intelligenz:4,ausdauer:2},weapon:{intelligenz:5,glueck:2},body:{intelligenz:4,ausdauer:2},
      boots:{intelligenz:3,glueck:2},ring:{intelligenz:5},amulet:{intelligenz:3,glueck:2}
    }
  };

  function q(it){
    const x=String(it?.quality||'').toLowerCase();
    if(RARITY_BONUS[x]!=null)return x;
    const r=String(it?.rarity||'').toLowerCase();
    if(r.includes('prism')||r.includes('rainbow'))return'prismatic';
    if(r.includes('myth')||r.includes('mystic')||r.includes('cyan'))return'cyan';
    if(r.includes('legend')||r.includes('orange'))return'orange';
    if(r.includes('epic')||r.includes('purple'))return'purple';
    if(r==='rare'||r.includes('blue'))return'blue';
    if(r.includes('uncommon')||r.includes('green'))return'green';
    return'gray';
  }
  function cls(it){
    const c=String(it?.classId||s?.playerClass||'grower');
    return ['grower','scout','bruiser','frost','summoner'].includes(c)?c:'grower';
  }
  function isGear(it){
    return !!(it&&typeof it==='object'&&it.slot&&it.type!=='material'&&it.type!=='gem'&&it.type!=='scroll');
  }
  function enchantOf(it){return (Array.isArray(it?.enchants)&&it.enchants.length?it.enchants[0]:it?.enchant)||null}
  function addonMap(it){
    const out={};
    if(it?.gem?.stat&&COMBAT.includes(it.gem.stat)){
      const v=Number(it.gem.value)||0;if(v)out[it.gem.stat]=(Number(out[it.gem.stat])||0)+v;
    }
    const e=enchantOf(it);
    if(e?.effect==='luck'){
      const v=Number(e.value)||0;if(v)out.glueck=(Number(out.glueck)||0)+v;
    }
    return out;
  }
  function nativeFromCurrent(it){
    if(it?.v429StatLock?.native&&typeof it.v429StatLock.native==='object'){
      const out={};COMBAT.forEach(k=>{const v=Number(it.v429StatLock.native[k])||0;if(v>0)out[k]=v});
      if(Object.keys(out).length)return out;
    }
    const add=addonMap(it),out={};
    COMBAT.forEach(k=>{const v=(Number(it?.bonus?.[k])||0)-(Number(add[k])||0);if(v>0)out[k]=v});
    return out;
  }
  function cleanName(it){
    return String(it?.name||'')
      .replace(/^(Normal|Gewöhnlich|Rare|Episch|Legendär|Mystisch):\s*/i,'')
      .replace(/\s*\[Lv\.\d+\]\s*$/i,'');
  }
  function poolFor(it){
    try{
      const pool=classGear?.[cls(it)];
      return Array.isArray(pool)?pool:[];
    }catch(e){return []}
  }
  function templateFor(it){
    const pool=poolFor(it), name=cleanName(it), bid=String(it?.baseId||'');
    return pool.find(x=>bid&&String(x.id)===bid)
      ||pool.find(x=>it?.id&&String(it.id).startsWith(String(x.id)))
      ||pool.find(x=>it?.slot&&x.slot===it.slot&&(name===x.name||name.includes(x.name)))
      ||null;
  }
  function primaryForClass(c){
    return c==='scout'?'geschick':(c==='bruiser'||c==='summoner')?'intelligenz':'staerke';
  }
  function patternFor(it){
    /* V6.337 canonical native-item rule:
       Every class item always carries its class primary attribute + endurance.
       Epic (purple) and every tier above it additionally carries luck.
       Gems/enchantments remain separate add-ons and are not part of this native pattern. */
    const c=cls(it), quality=q(it), primary=primaryForClass(c);
    const highTier=['purple','orange','cyan','prismatic'].includes(quality);
    return highTier
      ? {[primary]:3,ausdauer:2,glueck:1}
      : {[primary]:3,ausdauer:2};
  }
  function slotBaseBudget(it,pattern){
    const slot=it?.slot;
    const totals=poolFor(it).filter(x=>x?.slot===slot).map(x=>
      COMBAT.reduce((n,k)=>n+Math.max(0,Number(x?.bonus?.[k])||0),0)
    ).filter(n=>n>0);
    /* Set patterns can legitimately contain a stronger distribution than an old
       base pool. Use the larger template total only as slot baseline, never as a
       rarity multiplier. */
    const own=COMBAT.reduce((n,k)=>n+Math.max(0,Number(pattern?.[k])||0),0);
    return Math.max(1,own,...totals);
  }
  function targetNativeTotal(it,pattern){
    const lvl=Math.max(1,Math.floor(Number(it?.dropLevel)||Number(s?.level)||1));
    const curve=Math.max(1,Math.round(slotBaseBudget(it,pattern)+(lvl-1)*LEVEL_GAIN+RARITY_BONUS[q(it)]));const guaranteed=Math.max(0,Math.round(Number(it?.v6170MinNativeTotal)||0));return Math.max(curve,guaranteed);
  }
  function distribute(pattern,total){
    const rows=Object.entries(pattern||{}).filter(([k,v])=>COMBAT.includes(k)&&(Number(v)||0)>0);
    if(!rows.length)return {};
    if(rows.length===1)return {[rows[0][0]]:Math.max(1,total)};
    const sum=rows.reduce((n,[,v])=>n+Number(v),0)||1;
    const parts=rows.map(([k,v])=>{const raw=total*Number(v)/sum;return{k,val:Math.max(1,Math.floor(raw)),frac:raw-Math.floor(raw)}});
    let used=parts.reduce((n,x)=>n+x.val,0);
    parts.sort((a,b)=>b.frac-a.frac);
    for(let i=0;used<total;i=(i+1)%parts.length){parts[i].val++;used++}
    parts.sort((a,b)=>a.frac-b.frac);
    for(let i=0;used>total&&i<parts.length*30;i++){const x=parts[i%parts.length];if(x.val>1){x.val--;used--}}
    return Object.fromEntries(parts.map(x=>[x.k,x.val]));
  }
  function authenticatedServerItems(){
    try{return !!((typeof v073User!=='undefined'&&v073User?.id)||window.v073User?.id)}catch(_){return false}
  }
  function apply(it){
    /* V8.169: authenticated item stats are server-owned. Historical client
       normalization must never rewrite inventory/equipment bonuses after login. */
    if(authenticatedServerItems())return false;
    if(!isGear(it))return false;
    /* Server-authoritative V7.168 items already carry the canonical native map.
       Never let this historical V4.47 client normalizer overwrite it. */
    if(it?.v7167QualityCurve===true&&Number(it?.v447Curve?.version||0)>=CURVE_VERSION)return false;

    const quality=q(it), c=cls(it);
    const rawSlot=String(it?.slot||'').toLowerCase();
    const slot=rawSlot==='weapon2'?'weapon':rawSlot;
    const lvl=Math.max(1,Math.min(300,Math.floor(Number(it?.dropLevel)||Number(s?.level)||1)));
    const base=Math.max(1,Number(V7167_BASE[c]?.[slot])||Number(V7167_BASE.grower?.[slot])||1);
    const core=Math.max(1,Math.round(base+(lvl-1)*LEVEL_GAIN+(RARITY_BONUS[quality]||0)));
    const primary=primaryForClass(c);
    const luckRate=V7167_LUCK[quality]||0;
    const luck=luckRate>0?Math.max(1,Math.round(core*luckRate)):0;
    const remaining=Math.max(2,core-luck);
    const pri=Math.max(1,Math.round(remaining*.60));
    const sta=Math.max(1,remaining-pri);
    const native={[primary]:pri,ausdauer:sta};
    if(luck>0)native.glueck=luck;

    const add=addonMap(it), keep={};
    Object.entries(it.bonus||{}).forEach(([k,v])=>{if(!COMBAT.includes(k)&&k!=='growSkill')keep[k]=v});
    const full={...native};
    Object.entries(add).forEach(([k,v])=>full[k]=(Number(full[k])||0)+(Number(v)||0));
    const before=JSON.stringify({bonus:it.bonus||{},lock:it.v429StatLock||null,curve:it.v447Curve||null,mark:it.v7167QualityCurve||false});
    it.bonus={...full,...keep};
    it.v429StatLock={version:2,native:{...native}};
    const total=COMBAT.reduce((n,k)=>n+(Number(native[k])||0),0);
    if(rawSlot==='weapon'||rawSlot==='weapon2'){
      const avg=Math.max(4,Math.round(total*.78+lvl*.18));
      it.weaponDamageAvg=avg;
      it.weaponDamageMin=Math.max(1,Math.floor(avg*.90));
      it.weaponDamageMax=Math.max(it.weaponDamageMin+1,Math.ceil(avg*1.10));
      it.weaponDamageModel='v8067-neutral-spread';
    }else{
      delete it.weaponDamageAvg;delete it.weaponDamageMin;delete it.weaponDamageMax;delete it.weaponDamageModel;
    }
    it.v447Curve={version:CURVE_VERSION,quality,level:lvl,nativeTotal:total,order:'gray<green<blue<purple<orange<prismatic<cyan',model:'flat-rarity-budget'};
    it.baseBonusV055=luckRate>0?{[primary]:3,ausdauer:2,glueck:1}:{[primary]:3,ausdauer:2};
    it.v7167QualityCurve=true;
    return before!==JSON.stringify({bonus:it.bonus||{},lock:it.v429StatLock||null,curve:it.v447Curve||null,mark:true});
  }
  function all(){
    if(authenticatedServerItems())return false;
    let changed=false;
    const lists=[s?.inventory,s?.weaponShop,s?.magicShop];
    lists.forEach(list=>{if(Array.isArray(list))list.forEach(it=>{if(apply(it))changed=true})});
    Object.values(s?.equipment||{}).forEach(it=>{if(apply(it))changed=true});
    return changed;
  }
  function nativeTotal(it){
    apply(it);
    return COMBAT.reduce((n,k)=>n+(Number(it?.v429StatLock?.native?.[k])||0),0);
  }
  window.v447ApplyItemCurve=apply;
  window.v447NormalizeAllItems=all;
  window.v447NativeTotal=nativeTotal;
  window.v447ItemCurve={version:CURVE_VERSION,model:'flat-rarity-budget',levelGain:LEVEL_GAIN,rarityBonus:{...RARITY_BONUS},luckShare:{...V7167_LUCK}};

  /* Normalize at creation time so reward overlays already show final values. */
  function wrapGlobal(name){
    try{
      const fn=window[name];
      if(typeof fn!=='function'||fn.__v447Wrapped)return;
      const wrapped=function(){const it=fn.apply(this,arguments);if(it&&typeof it.then==='function')return it.then(x=>{apply(x);return x});apply(it);return it};
      wrapped.__v447Wrapped=true;window[name]=wrapped;
      try{eval(name+'=window["'+name+'"]')}catch(e){}
    }catch(e){console.warn('V4.47 generator wrap',name,e)}
  }
  ['v024Item','makeClassLoot','makeLoot','makeSetItem','v027ShopItem','v030MakeGear','v030MakeJewelry','v110MakeMysticItem','v110MakeRareMysticSet']
    .forEach(wrapGlobal);

  /* Some functions are top-level lexical bindings and may not be window properties. */
  try{if(typeof makeClassLoot==='function'&&!makeClassLoot.__v447Wrapped){const b=makeClassLoot;makeClassLoot=function(){const it=b.apply(this,arguments);apply(it);return it};makeClassLoot.__v447Wrapped=true}}catch(e){}
  try{if(typeof makeLoot==='function'&&!makeLoot.__v447Wrapped){const b=makeLoot;makeLoot=function(){const it=b.apply(this,arguments);apply(it);return it};makeLoot.__v447Wrapped=true}}catch(e){}
  try{if(typeof makeSetItem==='function'&&!makeSetItem.__v447Wrapped){const b=makeSetItem;makeSetItem=function(){const it=b.apply(this,arguments);apply(it);return it};makeSetItem.__v447Wrapped=true}}catch(e){}
  try{if(typeof v024Item==='function'&&!v024Item.__v447Wrapped){const b=v024Item;v024Item=function(){const it=b.apply(this,arguments);apply(it);return it};v024Item.__v447Wrapped=true}}catch(e){}
  try{if(typeof v027ShopItem==='function'&&!v027ShopItem.__v447Wrapped){const b=v027ShopItem;v027ShopItem=function(){const it=b.apply(this,arguments);apply(it);return it};v027ShopItem.__v447Wrapped=true}}catch(e){}
  try{if(typeof v110MakeMysticItem==='function'&&!v110MakeMysticItem.__v447Wrapped){const b=v110MakeMysticItem;v110MakeMysticItem=function(){const it=b.apply(this,arguments);apply(it);return it};v110MakeMysticItem.__v447Wrapped=true}}catch(e){}
  try{if(typeof v110MakeRareMysticSet==='function'&&!v110MakeRareMysticSet.__v447Wrapped){const b=v110MakeRareMysticSet;v110MakeRareMysticSet=function(){const it=b.apply(this,arguments);apply(it);return it};v110MakeRareMysticSet.__v447Wrapped=true}}catch(e){}

  /* Final owners: old V4.23/V4.25/V4.29 wrappers may temporarily paint their former
     curve. Restore V4.47 both before and after them and persist only the final data. */
  if(typeof renderInventory==='function'&&!window.__v447InventoryWrapped){
    const base=renderInventory;
    renderInventory=function(){all();const r=base.apply(this,arguments);all();return r};
    try{window.renderInventory=renderInventory}catch(e){}
    window.__v447InventoryWrapped=true;
  }
  if(typeof persist==='function'&&!window.__v447PersistWrapped){
    const base=persist;
    persist=function(){all();const r=base.apply(this,arguments);all();try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}return r};
    try{window.persist=persist}catch(e){}
    window.__v447PersistWrapped=true;
  }
  if(typeof render==='function'&&!window.__v447RenderWrapped){
    const base=render;
    render=function(){all();const r=base.apply(this,arguments);all();return r};
    try{window.render=render}catch(e){}
    window.__v447RenderWrapped=true;
  }
  if(typeof window.equip==='function'&&!window.__v447EquipWrapped){
    const base=window.equip;
    window.equip=function(i){if(s.inventory?.[i])apply(s.inventory[i]);const r=base.apply(this,arguments);all();try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}return r};
    window.__v447EquipWrapped=true;
  }
  if(typeof window.unequip==='function'&&!window.__v447UnequipWrapped){
    const base=window.unequip;
    window.unequip=function(slot){if(s.equipment?.[slot])apply(s.equipment[slot]);const r=base.apply(this,arguments);all();try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}return r};
    window.__v447UnequipWrapped=true;
  }

  function stamp(){}

  /* V8.180: persisted inventory/equipment is never normalized during boot,
     DOMContentLoaded or pageshow. At those moments auth may not be resolved yet,
     so an authenticated server save must fail closed rather than be treated as offline.
     Generator wrappers above remain the only automatic curve application. */
  stamp();
  window.addEventListener('growlegends:account-ready',()=>{
    try{
      const u=(typeof v073User!=='undefined'&&v073User)||window.v073User||null;
      if(!u?.id||u?.is_anonymous)all();
    }catch(_){}
    stamp();
  },{passive:true});
})();
