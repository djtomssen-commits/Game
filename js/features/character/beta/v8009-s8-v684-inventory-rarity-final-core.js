(()=>{
'use strict';
if(window.__V684_INVENTORY_RARITY_FINAL__)return;
window.__V684_INVENTORY_RARITY_FINAL__=true;

const QUALITY_KEYS=new Set(['gray','green','blue','purple','orange','cyan','prismatic']);
const QUALITY_CLASS={
 gray:'common-gray',green:'common-green',blue:'rare-blue',purple:'epic-purple',
 orange:'legendary-orange',cyan:'mystic-cyan',prismatic:'prismatic-orange'
};
const RAW_RARITY={
 gray:'common-gray',green:'uncommon',blue:'rare',purple:'epic',
 orange:'legendary',cyan:'mythic',prismatic:'prismatic-orange'
};
const LABEL={gray:'Normal',green:'Gewöhnlich',blue:'Rare',purple:'Episch',orange:'Legendär',cyan:'Mystisch',prismatic:'Prismatisch'};
const ALL_RARITY_CLASSES=[
 'common-gray','common-green','rare-blue','epic-purple','legendary-orange','mystic-cyan','prismatic-orange',
 'common','uncommon','rare','epic','legendary','mythic','gray','green','blue','purple','orange','cyan',
 'v6108-q-gray','v6108-q-green','v6108-q-blue','v6108-q-purple','v6108-q-orange','v6108-q-cyan','v6108-q-prismatic'
];

function qualityOf(it){
 if(!it)return'gray';
 if(it.v488Prismatic===true)return'prismatic';
 let q=String(it.quality||'').toLowerCase().trim();
 if(QUALITY_KEYS.has(q))return q;
 const r=(String(it.rarity||'')+' '+String(it.name||'')).toLowerCase();
 if(/prism/.test(r))return'prismatic';
 if(/myst|myth|cyan/.test(r))return'cyan';
 if(/legend|orange/.test(r))return'orange';
 if(/epic|purple|lila/.test(r))return'purple';
 if(/rare|blue/.test(r))return'blue';
 if(/uncommon|green|gewöhn|gewoehn/.test(r))return'green';
 return'gray';
}

/* The item's quality is the single source of truth. Several historical
   renderers still read item.rarity first; stale values such as
   quality='purple' + rarity='mythic' caused an epic item to flash cyan until a
   later repair pass. Keep both fields canonical before anything paints. */
function normalizeItem(it){
 if(!it||typeof it!=='object')return false;
 const q=qualityOf(it);
 let changed=false;
 if(String(it.quality||'').toLowerCase()!==q){it.quality=q;changed=true}
 const wanted=RAW_RARITY[q];
 if(String(it.rarity||'')!==wanted){it.rarity=wanted;changed=true}
 return changed;
}
function normalizeItems(){
 let changed=false;
 try{(s?.inventory||[]).forEach(it=>{if(normalizeItem(it))changed=true})}catch(e){}
 try{Object.values(s?.equipment||{}).filter(Boolean).forEach(it=>{if(normalizeItem(it))changed=true})}catch(e){}
 return changed;
}

function inventoryItemFor(card,visualIndex){
 try{
   const raw=card?.dataset?.v459Index;
   if(raw!==undefined&&raw!==''){
     const idx=Number(raw);
     if(Number.isInteger(idx)&&idx>=0&&s?.inventory?.[idx])return s.inventory[idx];
   }
   return s?.inventory?.[visualIndex]||null;
 }catch(e){return null}
}
function repairCard(card,it){
 if(!card||!it)return;
 const q=qualityOf(it);
 ALL_RARITY_CLASSES.forEach(c=>card.classList.remove(c));
 card.classList.add(QUALITY_CLASS[q]||QUALITY_CLASS.gray);
 card.classList.add('v6108-q-'+q);
 card.dataset.v684Quality=q;
 const badge=card.querySelector('.rarity-badge,.v4103-rarity,.v459-rarity');
 if(badge){
   const txt=String(badge.textContent||'').trim();
   if(!txt||/normal|gewöhn|rare|selten|episch|legend|myst|prism/i.test(txt))badge.textContent=LABEL[q];
 }
 const box=card.querySelector('.v459-inv-icon,.v6108-quality-artbox');
 if(box){
   ['gray','green','blue','purple','orange','cyan','prismatic'].forEach(x=>box.classList.toggle('v6108-q-'+x,x===q));
   box.dataset.v6108Quality=q;
 }
 const img=card.querySelector('img.v6107-item-art,img.v6108-quality-art');
 if(img)img.dataset.v6108Quality=q;
}
function repairInventory(){
 normalizeItems();
 const cards=[...document.querySelectorAll('#character #inventory .inventory-grid > .inv-item')];
 cards.forEach((card,i)=>{const it=inventoryItemFor(card,i);if(it)repairCard(card,it)});
 /* Rebuild only the artwork frame, not the inventory itself. This makes the
    visible frame follow the same canonical quality immediately. */
 try{window.v6107PaintItemSurfaces?.(document.getElementById('character')||document)}catch(e){}
 return true;
}

/* Replace the old index-by-card repair with the dataset-aware version. */
try{
 const finalRepair=function(){return repairInventory()};
 window.v240RepairInventoryRarity=finalRepair;
 try{v240RepairInventoryRarity=finalRepair}catch(e){}
}catch(e){}

function wrapInventory(name){
 try{
   const fn=window[name]||(name==='renderInventory'&&typeof renderInventory==='function'?renderInventory:null);
   if(typeof fn!=='function'||fn.__v684)return;
   const wrapped=function(){normalizeItems();const out=fn.apply(this,arguments);repairInventory();return out};
   wrapped.__v684=true;
   window[name]=wrapped;
   if(name==='renderInventory')try{renderInventory=wrapped}catch(e){}
 }catch(e){}
}
wrapInventory('renderInventory');
wrapInventory('v459CompactInventory');

document.addEventListener('click',e=>{
 if(e.target?.closest?.('#character,#inventory'))requestAnimationFrame(repairInventory);
},true);
window.addEventListener('pageshow',repairInventory,{passive:true});
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>{normalizeItems();repairInventory()},100));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)repairInventory()},{passive:true});
setTimeout(()=>{normalizeItems();repairInventory()},120);
setTimeout(repairInventory,700);

window.v684InventoryRarityQA=()=>({
 staleRarity:(()=>{try{return [...(s?.inventory||[]),...Object.values(s?.equipment||{}).filter(Boolean)].filter(it=>RAW_RARITY[qualityOf(it)]!==String(it?.rarity||'')).length}catch(e){return-1}})(),
 inventoryCards:document.querySelectorAll('#character #inventory .inventory-grid > .inv-item').length
});
})();
