(function(){
  const VERSION='V4.67 Stable', SHORT='V4.67';
  function stamp(){}

  /* Defense in depth for the final loot hierarchy:
     - Shop / Quest / Dungeon rooms: at most Epic
     - Dungeon boss: Legendary is allowed/guaranteed by v246
     - Smaragd-Koloss: the only source allowed to create Mythic/cyan gear
     The boss generators v110MakeMysticItem / v110MakeRareMysticSet are direct and
     intentionally do not pass through these generic source guards. */
  function downgradeToEpic(it){
    if(!it||typeof it!=='object')return it;
    const q=String(it.quality||'').toLowerCase(),r=String(it.rarity||'').toLowerCase();
    const high=q==='orange'||q==='cyan'||/legend|orange|myth|mystic|cyan/.test(r);
    if(!high)return it;
    const lvl=Math.max(1,Math.floor(Number(it.dropLevel)||Number(s?.level)||1));
    it.quality='purple';
    try{it.rarity=qualityMeta('purple').cls}catch(e){it.rarity='epic'}
    delete it.mysticSpecial;
    delete it.mysticSetId;
    if(it.setName&&/^Set des /i.test(String(it.setName)))delete it.setName;
    const plain=String(it.name||'Ausrüstung')
      .replace(/^(Normal|Gewöhnlich|Rare|Episch|Legendär|Mystisch):\s*/i,'')
      .replace(/\s*\[Lv\.\d+\]\s*$/i,'');
    it.name=`Episch: ${plain} [Lv.${lvl}]`;
    try{if(typeof window.v447ApplyItemCurve==='function')window.v447ApplyItemCurve(it)}catch(e){}
    return it;
  }
  function enforceSource(it,source){
    return ['quest','dungeon','event'].includes(String(source||'').toLowerCase())?downgradeToEpic(it):it;
  }
  window.v455EnforceLootSource=enforceSource;

  if(typeof makeClassLoot==='function'&&!window.__v455LootSourceGuard){
    const base=makeClassLoot;
    makeClassLoot=function(classId,source='normal'){
      return enforceSource(base.apply(this,arguments),source);
    };
    try{window.makeClassLoot=makeClassLoot}catch(e){}
    window.__v455LootSourceGuard=true;
  }
  if(typeof v024Item==='function'&&!window.__v455ItemSourceGuard){
    const base=v024Item;
    v024Item=function(baseItem,source='normal'){
      return enforceSource(base.apply(this,arguments),source);
    };
    try{window.v024Item=v024Item}catch(e){}
    window.__v455ItemSourceGuard=true;
  }

  function mayNormalizeLegacyState(){
    /* V8.175: fail closed until auth identity is resolved. Existing state for
       authenticated accounts belongs to server item authority, not this legacy migrator. */
    if(window.__V200_AUTH_READY__!==true)return false;
    try{
      const u=(typeof v073User!=='undefined'&&v073User)||window.v073User||null;
      if(u?.id && !u?.is_anonymous)return false;
    }catch(_){return false}
    return true;
  }
  function normalize(){
    if(!mayNormalizeLegacyState())return false;
    try{
      if(typeof window.v447NormalizeAllItems==='function')window.v447NormalizeAllItems();
      else if(typeof window.v447ApplyItemCurve==='function'){
        const apply=window.v447ApplyItemCurve;
        [s?.inventory,s?.weaponShop,s?.magicShop].forEach(arr=>Array.isArray(arr)&&arr.forEach(apply));
        Object.values(s?.equipment||{}).forEach(apply);
      }
      s.v455ItemLootBalance=1;
      try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
      return true;
    }catch(e){console.warn('V4.56 item normalization',e);return false}
  }
  window.v455NormalizeItemLootBalance=normalize;

  if(typeof v075ApplyCloudSave==='function'&&!window.__v455CloudItemNormalize){
    const base=v075ApplyCloudSave;
    v075ApplyCloudSave=function(){
      const r=base.apply(this,arguments);
      if(r&&typeof r.then==='function')return r.then(x=>{normalize();return x});
      normalize();return r;
    };
    try{window.v075ApplyCloudSave=v075ApplyCloudSave}catch(e){}
    window.__v455CloudItemNormalize=true;
  }

  /* V8.175: no pre-auth or pageshow mutation of persisted item state. */
  stamp();
  window.addEventListener('growlegends:account-ready',()=>{normalize();stamp()},{passive:true});
})();
