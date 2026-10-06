(function(){
  const VERSION='V4.29 Stable';
  const LOCK_VERSION=1;
  const COMBAT=['staerke','geschick','intelligenz','ausdauer','glueck'];

  function isGear(it){
    return !!(it && typeof it==='object' && it.slot && it.type!=='material' && it.type!=='gem' && it.type!=='scroll');
  }
  function enchantOf(it){
    return it?.enchant || (Array.isArray(it?.enchants) ? it.enchants[0] : null) || null;
  }
  function addonFor(it){
    const add={};
    if(it?.gem?.stat && COMBAT.includes(it.gem.stat)){
      const v=Number(it.gem.value)||0;
      if(v)add[it.gem.stat]=(Number(add[it.gem.stat])||0)+v;
    }
    const ench=enchantOf(it);
    if(ench?.effect==='luck'){
      const v=Number(ench.value)||0;
      if(v)add.glueck=(Number(add.glueck)||0)+v;
    }
    return add;
  }
  function nativeFromCurrent(it){
    const add=addonFor(it), native={};
    COMBAT.forEach(k=>{
      const current=Number(it?.bonus?.[k])||0;
      const value=current-(Number(add[k])||0);
      if(value!==0)native[k]=value;
    });
    return native;
  }
  function authenticatedServerItems(){
    try{return !!((typeof v073User!=='undefined'&&v073User?.id)||window.v073User?.id)}catch(_){return false}
  }
  function lock(it){
    if(authenticatedServerItems())return false;
    if(!isGear(it))return false;
    if(it.v429StatLock && it.v429StatLock.version===LOCK_VERSION && it.v429StatLock.native && typeof it.v429StatLock.native==='object')return false;
    it.v429StatLock={version:LOCK_VERSION,native:nativeFromCurrent(it)};
    return true;
  }
  function restore(it){
    if(authenticatedServerItems())return false;
    if(!isGear(it))return false;
    lock(it);
    const before=JSON.stringify(it.bonus||{});
    const keep={};
    Object.entries(it.bonus||{}).forEach(([k,v])=>{if(!COMBAT.includes(k)&&k!=='growSkill')keep[k]=v});
    const combat={...(it.v429StatLock?.native||{})};
    const add=addonFor(it);
    Object.entries(add).forEach(([k,v])=>combat[k]=(Number(combat[k])||0)+(Number(v)||0));
    it.bonus={...combat,...keep};
    return before!==JSON.stringify(it.bonus);
  }
  function eachGear(fn){
    (s.inventory||[]).forEach(fn);
    Object.values(s.equipment||{}).forEach(fn);
    (s.weaponShop||[]).forEach(fn);
    (s.magicShop||[]).forEach(fn);
  }
  function lockAndRestoreAll(){
    if(authenticatedServerItems())return false;
    let changed=false;
    eachGear(it=>{if(lock(it))changed=true;if(restore(it))changed=true});
    return changed;
  }
  function saveStable(){
    if(authenticatedServerItems())return false;
    try{localStorage.setItem(KEY,JSON.stringify(s));return true}catch(e){return false}
  }
  function stableTotal(it){
    restore(it);
    return COMBAT.reduce((n,k)=>n+(Number(it?.bonus?.[k])||0),0);
  }

  /* Comparison is display-only. It must NEVER recalculate item stats. */
  comparison=function(it){
    if(!it?.slot)return '';
    restore(it);
    const old=s.equipment?.[it.slot];
    if(!old)return `<span class="better">▲ Freier Slot · Item Lv.${it.dropLevel||1}</span>`;
    restore(old);
    const d=stableTotal(it)-stableTotal(old);
    const lv=`Lv.${it.dropLevel||1} vs Lv.${old.dropLevel||1}`;
    return d>0?`<span class="better">▲ +${d} Gesamtwerte · ${lv}</span>`:
      d<0?`<span class="worse">▼ ${d} Gesamtwerte · ${lv}</span>`:
      `<span class="same">= Gleiche Gesamtwerte · ${lv}</span>`;
  };

  function paintStableItems(){
    [...document.querySelectorAll('#inventory .inv-item')].forEach((card,i)=>{
      const it=s.inventory?.[i];if(!it)return;
      restore(it);
      const b=card.querySelector('.item-bonus');
      if(b&&typeof itemBonus==='function')b.textContent=itemBonus(it)||'Keine Boni';
      const c=card.querySelector('.compare');
      if(c)try{c.innerHTML=comparison(it)}catch(e){}
    });
    if(typeof slotLabels!=='undefined'){
      Object.keys(slotLabels).forEach(slot=>{
        const it=s.equipment?.[slot],el=document.querySelector('#slot-'+slot);
        if(!it||!el)return;
        restore(it);
        const b=el.querySelector('.tiny');
        if(b&&typeof itemBonus==='function')b.textContent=itemBonus(it)||'Keine Boni';
      });
    }
    try{document.querySelector('#power')&&(document.querySelector('#power').textContent=combatPower())}catch(e){}
    try{document.querySelector('#charPower')&&(document.querySelector('#charPower').textContent=combatPower())}catch(e){}
    try{document.querySelector('#charHp')&&(document.querySelector('#charHp').textContent=maxHp())}catch(e){}
  }

  /* Persist always writes the locked values, never a temporary render-time mutation. */
  if(typeof persist==='function'&&!window.__v429PersistWrapped){
    const basePersist=persist;
    persist=function(){
      lockAndRestoreAll();
      const r=basePersist.apply(this,arguments);
      lockAndRestoreAll();
      paintStableItems();
      saveStable();
      return r;
    };
    window.__v429PersistWrapped=true;
  }

  /* Outermost render guards: old compatibility wrappers may run, but their stat
     mutations are discarded before the frame is left or anything is saved. */
  if(typeof renderInventory==='function'&&!window.__v429InventoryWrapped){
    const baseInventory=renderInventory;
    renderInventory=function(){
      lockAndRestoreAll();
      const r=baseInventory.apply(this,arguments);
      lockAndRestoreAll();
      paintStableItems();
      saveStable();
      return r;
    };
    window.__v429InventoryWrapped=true;
  }
  if(typeof render==='function'&&!window.__v429RenderWrapped){
    const baseRender=render;
    const stableRender=function(){
      lockAndRestoreAll();
      const r=baseRender.apply(this,arguments);
      lockAndRestoreAll();
      paintStableItems();
      saveStable();
      return r;
    };
    render=stableRender;
    try{window.render=stableRender}catch(e){}
    window.__v429RenderWrapped=true;
  }

  /* Equip/unequip moves the SAME object. Its locked native stats follow it unchanged. */
  if(typeof window.equip==='function'&&!window.__v429EquipWrapped){
    const baseEquip=window.equip;
    window.equip=function(i){
      const it=s.inventory?.[i];if(it){lock(it);restore(it)}
      const id=it?.id, before=it?JSON.stringify(it.bonus||{}):'';
      const r=baseEquip.apply(this,arguments);
      lockAndRestoreAll();
      const moved=id ? Object.values(s.equipment||{}).find(x=>x?.id===id) : null;
      if(moved && before && JSON.stringify(moved.bonus||{})!==before){
        /* Hard guarantee: location change alone can never alter the item. */
        restore(moved);
      }
      paintStableItems();saveStable();
      return r;
    };
    window.__v429EquipWrapped=true;
  }
  if(typeof window.unequip==='function'&&!window.__v429UnequipWrapped){
    const baseUnequip=window.unequip;
    window.unequip=function(slot){
      const it=s.equipment?.[slot];if(it){lock(it);restore(it)}
      const r=baseUnequip.apply(this,arguments);
      lockAndRestoreAll();paintStableItems();saveStable();
      return r;
    };
    window.__v429UnequipWrapped=true;
  }

  /* Existing saves are locked once from the final V4.28 canonical values that
     are already in memory at this point. Future items are locked before their first render/save. */
  lockAndRestoreAll();
  saveStable();
  try{render()}catch(e){console.error('V4.29 immutable item stats',e)}

  function stamp(){}
  stamp();
})();
