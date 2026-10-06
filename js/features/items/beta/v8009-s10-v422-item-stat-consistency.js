(function(){
  /* One canonical stat curve for BOTH inventory and equipped gear.
     This also neutralizes the old V330 inventory-only mythic upgrade wrapper,
     which could temporarily inflate a mystic item while it was in the bag and
     then lose those extra points as soon as the item was equipped. */
  const V422_RARITY={
    gray:{mult:1.00,flat:0}, green:{mult:1.16,flat:1}, blue:{mult:1.34,flat:2},
    purple:{mult:1.55,flat:3}, orange:{mult:1.78,flat:4}, cyan:{mult:2.02,flat:5}
  };
  const V422_COMBAT=['staerke','geschick','intelligenz','ausdauer','glueck'];

  function v422Quality(it){
    if(it?.quality)return String(it.quality).toLowerCase();
    const r=String(it?.rarity||'').toLowerCase();
    return r.includes('myth')?'cyan':r.includes('legend')?'orange':r.includes('epic')?'purple':r.includes('rare')?'blue':r.includes('green')||r.includes('uncommon')?'green':'gray';
  }
  function v422Base(it){
    if(it?.baseBonusV055 && typeof it.baseBonusV055==='object' && Object.keys(it.baseBonusV055).length){
      const b={...it.baseBonusV055};delete b.growSkill;return b;
    }
    const cls=it?.classId||s.playerClass||'grower';
    const pool=(typeof classGear!=='undefined' && classGear?.[cls])?classGear[cls]:[];
    const clean=String(it?.name||'')
      .replace(/^(Normal|Gewöhnlich|Rare|Episch|Legendär|Mystisch):\\s*/,'')
      .replace(/\\s*\\[Lv\\.\\d+\\]\\s*$/,'');
    const hit=pool.find(x=>(it?.slot&&x.slot===it.slot&&clean.includes(x.name))||clean.includes(x.name));
    if(hit)return {...(hit.bonus||{})};
    return null;
  }
  function v422Scaled(base,q,level){
    const meta=V422_RARITY[q]||V422_RARITY.gray;
    const lvl=Math.max(1,Number(level)||1), gain=(lvl-1)*0.72, out={};
    Object.entries(base||{}).forEach(([k,v])=>{
      if(k==='growSkill')return;
      out[k]=Math.max(1,Math.round((Number(v)||0)*meta.mult+gain+meta.flat));
    });
    return out;
  }
  function v422MayTouchPersisted(){
    /* V8.180: persisted item state is server-owned. Before auth resolves, fail closed.
       True offline/anonymous paths may opt in only after auth has resolved. */
    if(window.__V200_AUTH_READY__!==true)return false;
    try{
      const u=(typeof v073User!=='undefined'&&v073User)||window.v073User||null;
      return !u?.id||!!u?.is_anonymous;
    }catch(_){return false}
  }
  function v422Canonicalize(it){
    if(!v422MayTouchPersisted())return it;
    if(!it||it.type==='material'||!it.slot)return it;
    const base=v422Base(it);if(!base||!Object.keys(base).length)return it;
    const q=v422Quality(it), lvl=Math.max(1,Number(it.dropLevel)||Number(s.level)||1);
    const fresh=v422Scaled(base,q,lvl), keep={};
    Object.entries(it.bonus||{}).forEach(([k,v])=>{if(!V422_COMBAT.includes(k)&&k!=='growSkill')keep[k]=v});
    it.bonus={...fresh,...keep};
    it.baseBonusV055={...base};
    it.dropLevel=lvl;
    return it;
  }
  function v422All(){
    if(!v422MayTouchPersisted())return false;
    (s.inventory||[]).forEach(v422Canonicalize);
    Object.values(s.equipment||{}).forEach(v422Canonicalize);
    return true;
  }
  function v422Snapshot(){
    return (s.inventory||[]).map(it=>it?{bonus:{...(it.bonus||{})},baseBonusV055:it.baseBonusV055?{...it.baseBonusV055}:null,dropLevel:it.dropLevel}:null);
  }
  function v422Restore(snap){
    (s.inventory||[]).forEach((it,i)=>{const x=snap[i];if(!it||!x)return;it.bonus={...x.bonus};if(x.baseBonusV055)it.baseBonusV055={...x.baseBonusV055};it.dropLevel=x.dropLevel});
  }
  function v422PaintInventory(){
    const cards=[...document.querySelectorAll('#inventory .inv-item')];
    cards.forEach((card,i)=>{
      const it=s.inventory?.[i];if(!it)return;
      const b=card.querySelector('.item-bonus');if(b)b.textContent=(typeof itemBonus==='function'?itemBonus(it):'')||'Keine Boni';
      const c=card.querySelector('.compare');if(c&&typeof comparison==='function'){try{c.innerHTML=comparison(it)}catch(e){}}
    });
  }

  /* Authoritative inventory renderer guard: old wrappers may still run for UI
     features (rarity classes, multi-sell), but they are no longer allowed to
     persist or display a different stat roll than the equipped item uses. */
  /* Character/Inventory cleanup Phase 1: V422's render guard is retired.
     Its migration/canonical helpers remain for legacy callers; V429 is the later immutable
     inventory/equipment stat guard and already restores the final persisted values. */

  /* Normalize the exact same item before changing its location. */
  const v422BaseEquip=window.equip;
  window.equip=function(i){
    const it=s.inventory?.[i];if(it)v422Canonicalize(it);
    const r=v422BaseEquip.apply(this,arguments);
    v422All();
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    return r;
  };
  const v422BaseUnequip=window.unequip;
  window.unequip=function(slot){
    const it=s.equipment?.[slot];if(it)v422Canonicalize(it);
    const r=v422BaseUnequip.apply(this,arguments);
    v422All();
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    return r;
  };

  /* V8.180: no boot-time canonicalization/save/render of persisted item state. */
  const line=document.querySelector('#v141VersionLine');
  document.title='Grow Legends V4.29';
})();
