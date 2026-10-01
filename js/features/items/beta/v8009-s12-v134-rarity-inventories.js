function v134Quality(it){
 const s1=String(it?.quality||it?.rarity||it?.grade||'').toLowerCase();
 const n=String(it?.name||'').toLowerCase();
 const s=s1+' '+n;
 if(/myst|mystisch|cyan|türkis|tuerkis/.test(s))return 'mystic-cyan';
 if(/legend|orange/.test(s))return 'legendary-orange';
 if(/epic|episch|purple|lila/.test(s))return 'epic-purple';
 if(/rare|selten|blue|blau/.test(s))return 'rare-blue';
 if(/gewöhn|gewoehn|green|grün|gruen/.test(s))return 'common-green';
 return 'common-gray';
}
function v134Apply(){
 /* Character/Inventory cleanup Phase 1.2:
    Never infer an inventory item's rarity from the card's complete textContent.
    Comparison text can mention an EQUIPPED mystic item and historically caused
    every visible inventory card to receive mystic-cyan after equipping it.
    Use the card's current inventory item as the only source of truth. */
 const v134InventoryClasses=['common-gray','common-green','rare-blue','epic-purple','legendary-orange','mystic-cyan'];
 const v134InventoryClassByQuality={
   gray:'common-gray',green:'common-green',blue:'rare-blue',
   purple:'epic-purple',orange:'legendary-orange',cyan:'mystic-cyan'
 };
 document.querySelectorAll('#character #inventory .inventory-grid > .inv-item').forEach((el,i)=>{
   const raw=el.dataset?.v459Index;
   const di=(raw!==undefined&&raw!=='')?Number(raw):NaN;
   const it=s?.inventory?.[Number.isInteger(di)&&di>=0?di:i]||s?.inventory?.[i];
   if(!it)return;
   v134InventoryClasses.forEach(c=>el.classList.remove(c));
   const q=String(it.v488Prismatic===true?'prismatic':(it.quality||'')).toLowerCase();
   /* Prismatisch owns its rainbow class in V4.88/V6.84; do not add a legacy rarity class. */
   if(q!=='prismatic')el.classList.add(v134InventoryClassByQuality[q]||v134Quality(it));
 });
 /* If the late canonical owner already exists, let it be the final pass even
    though this historical V134 hook itself runs in requestAnimationFrame. */
 try{
   if(window.__V684_INVENTORY_RARITY_FINAL__&&typeof window.v240RepairInventoryRarity==='function'){
     window.v240RepairInventoryRarity();
   }
 }catch(e){}
 /* Materials: visible text fallback plus data if available. */
 document.querySelectorAll('#v030Materials .inv-item').forEach(el=>{
   ['common-gray','common-green','rare-blue','epic-purple','legendary-orange','mystic-cyan'].forEach(c=>el.classList.remove(c));
   const txt=(el.textContent||'').toLowerCase();
   let c=/mystisch|mystic/.test(txt)?'mystic-cyan':
         /legendär|legendaer|legendary/.test(txt)?'legendary-orange':
         /episch|epic/.test(txt)?'epic-purple':
         /rare|selten/.test(txt)?'rare-blue':
         /gewöhnlich|gewoehnlich/.test(txt)?'common-green':'common-gray';
   el.classList.add(c);
 });
 const mats=document.querySelector('#v030Materials');
 if(mats && !document.querySelector('#v134MaterialTabs') && mats.querySelector('.inventory-grid')){
   const tabs=document.createElement('div');
   tabs.id='v134MaterialTabs';tabs.className='v134-material-tabs';
   tabs.innerHTML='<div class="v134-material-tab gem">💎 EDELSTEINE</div><div class="v134-material-tab scroll">📜 SCHRIFTROLLEN</div>';
   mats.querySelector('.inventory-grid').insertAdjacentElement('beforebegin',tabs);
 }
 const card=mats?.closest('.card');
 if(card && !document.querySelector('#v134Legend')){
   const l=document.createElement('div');l.id='v134Legend';l.className='v134-rarity-legend';
   l.innerHTML='<span class="g0">Normal</span><span class="g1">Gewöhnlich</span><span class="g2">Selten</span><span class="g3">Episch</span><span class="g4">Legendär</span><span class="g5">Mystisch</span>';
   card.appendChild(l);
 }
 
}
const v134BaseRender=render;
render=function(){const r=v134BaseRender();if(document.querySelector('#character')?.classList.contains('active'))requestAnimationFrame(v134Apply);return r;};
setTimeout(v134Apply,150);
