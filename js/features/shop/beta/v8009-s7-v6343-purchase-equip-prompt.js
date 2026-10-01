(()=>{
'use strict';
if(window.__V6343_PURCHASE_EQUIP_PROMPT__)return;
window.__V6343_PURCHASE_EQUIP_PROMPT__=true;

const SLOT_LABEL={head:'Kopf',weapon:'Waffe',ring:'Ring',body:'Körper',boots:'Schuhe',amulet:'Amulett'};
function clean(v){return String(v??'').replace(/^.*?:\s*/,'').trim()}
function itemLine(it){
  if(!it)return 'Leer';
  let bonus='';
  try{bonus=typeof itemBonus==='function'?String(itemBonus(it)||''):''}catch(_){ }
  return `${it.icon||'🎁'} ${clean(it.name||'Item')}${bonus?` · ${bonus}`:''}`;
}
function findBought(id){
  const a=Array.isArray(s?.inventory)?s.inventory:[];
  return a.findIndex(x=>x&&String(x.id||'')===String(id||''));
}
async function askEquip(purchase){
  if(!purchase?.id)return false;
  let idx=findBought(purchase.id);if(idx<0)return false;
  const bought=s.inventory[idx];
  const slot=String(bought?.slot||purchase.slot||'').toLowerCase();
  if(!slot||!Object.prototype.hasOwnProperty.call(SLOT_LABEL,slot))return false;
  const current=s?.equipment?.[slot]||null;
  const text=`${itemLine(bought)} wurde gekauft.\n\nPlatz: ${SLOT_LABEL[slot]}\n${current?`Aktuell angelegt:\n${itemLine(current)}\n\nDas bisherige Item wandert beim Wechsel zurück ins Inventar.`:'Dieser Ausrüstungsplatz ist aktuell leer.'}\n\nMöchtest du das neue Item direkt anlegen?`;
  let yes=false;
  try{
    yes=typeof v115Confirm==='function'
      ? await v115Confirm(text,{title:'🛍️ Item gekauft',type:'confirm',okText:'✅ Anlegen',cancelText:'Nicht anlegen'})
      : window.confirm(`${text}\n\nOK = Anlegen`);
  }catch(_){yes=false}
  if(!yes)return false;
  idx=findBought(purchase.id);if(idx<0)return false;
  const live=s.inventory[idx];
  if(!live||String(live.slot||'').toLowerCase()!==slot)return false;
  try{
    if(typeof window.equip==='function')window.equip(idx);
    else{
      s.equipment=s.equipment&&typeof s.equipment==='object'?s.equipment:{};
      const old=s.equipment[slot];s.equipment[slot]=live;s.inventory.splice(idx,1);if(old)s.inventory.push(old);
      if(typeof persist==='function')persist();else localStorage.setItem(KEY,JSON.stringify(s));
    }
    try{if(typeof v063Toast==='function')v063Toast('✅ Direkt angelegt','success',clean(live.name||'Item'))}catch(_){ }
    return true;
  }catch(e){console.warn('V6.347 direct equip',e);return false}
}
function wrap(name,kind){
  const base=window[name];
  if(typeof base!=='function')return false;
  window[name]=function(i){
    const index=Number(i),shop=kind==='weapon'?s?.weaponShop:s?.magicShop,offer=shop?.[index];
    const equipment=!!offer && !(kind==='magic'&&(offer.type==='gem'||offer.type==='scroll')) && !!offer.slot;
    const before=String(window.__V466_LAST_PURCHASE__?.id||'');
    const result=base.apply(this,arguments);
    if(result!==false&&equipment){
      queueMicrotask(()=>{
        const p=window.__V466_LAST_PURCHASE__||{};
        if(!p.ok||!p.id||String(p.id)===before)return;
        const idx=findBought(p.id),bought=idx>=0?s.inventory[idx]:null;
        if(!bought||!bought.slot)return;
        void askEquip({id:p.id,slot:bought.slot,name:bought.name});
      });
    }
    return result;
  };
  return true;
}
wrap('v030BuyWeapon','weapon');
wrap('v030BuyMagic','magic');
window.v6343PurchaseEquipPromptDiagnostics=()=>({
  version:'V6.347',
  weaponWrapped:typeof window.v030BuyWeapon==='function',
  magicWrapped:typeof window.v030BuyMagic==='function',
  lastPurchase:window.__V466_LAST_PURCHASE__||null
});
})();
