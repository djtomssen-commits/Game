(()=>{
 'use strict';
 const VERSION='V4.110 Stable',SHORT='V4.110';
 function stamp(){}
 function comicUri(it){try{return String(window.v4106ComicItemArtUri?.(it)||window.v466ItemArtUri?.(it)||'')}catch(e){return''}}
 function setArt(box,it){if(!box||!it)return false;const uri=comicUri(it);if(!uri)return false;let img=box.querySelector(':scope > img.v466-item-art');if(!img){img=document.createElement('img');img.className='v466-item-art';box.replaceChildren(img)}img.src=uri;img.alt=String(it.name||'Gegenstand');img.dataset.v4106Comic='1';img.dataset.v4108Current='1';return true}
 function cleanSystemtechnik(){try{document.getElementById('v4107ItemShowcase')?.remove();document.querySelectorAll('[data-v4107-jump="items"]').forEach(x=>x.remove())}catch(e){}}
 function decorateAll(){
  const relevant=!!document.querySelector('#character.active,#shop.active,#forge.active,#harzForge.active,#v488Forge.active,#v074ProfileContent:not(:empty)');if(!relevant){cleanSystemtechnik();stamp();return}
  try{window.v4103DecorateItemSurfaces?.()}catch(e){}
  try{document.querySelectorAll('#character #inventory .inventory-grid > .inv-item').forEach((c,i)=>{const it=s.inventory?.[i];if(it)setArt(c.querySelector('.v459-inv-icon,.inv-icon,.ico'),it)})}catch(e){}
  try{Object.entries(s.equipment||{}).forEach(([slot,it])=>{if(!it)return;const c=document.getElementById('slot-'+slot);if(c)setArt(c.querySelector('.slot-icon,.ico'),it)})}catch(e){}
  try{document.querySelectorAll('#v057WeaponGrid .shop-item').forEach((c,i)=>{const it=s.weaponShop?.[i];if(it)setArt(c.querySelector('.shop-icon,.v41-shop-icon,.ico'),it)});document.querySelectorAll('#v057MagicGrid .shop-item').forEach((c,i)=>{const it=s.magicShop?.[i];if(it)setArt(c.querySelector('.shop-icon,.v41-shop-icon,.ico'),it)})}catch(e){}
  try{document.querySelectorAll('#character #v030Materials .inventory-grid > .inv-item').forEach((c,i)=>{const it=s.materials?.[i];if(it)setArt(c.querySelector('.v459-inv-icon,.inv-icon,.ico'),it)})}catch(e){}
  try{document.querySelectorAll('#v488ForgeInventory [data-v488-key]').forEach(c=>{const key=String(c.dataset.v488Key||''),it=(s.inventory||[]).find(x=>String(x?.id||x?.uid||'')===key);if(it)setArt(c.querySelector('.ico'),it)})}catch(e){}
  cleanSystemtechnik();stamp();
 }
 function audit(){const bad=[];const check=(sel,name)=>{document.querySelectorAll(sel).forEach(c=>{if(c.offsetParent===null)return;const img=c.querySelector('img.v466-item-art');if(!img||(!img.dataset.v4106Comic&&!/\/assets\/v71(?:95|98)-base64\//.test(img.src)||img.src.startsWith('data:image/webp;base64,')))bad.push(name)})};check('#character #inventory .inventory-grid > .inv-item','Inventar');check('#v057WeaponGrid .shop-item,#v057MagicGrid .shop-item','Händler');check('#v488ForgeInventory [data-v488-key]','Harzschmiede');check('#v074ProfileContent .v4103-item-card','Spielerprofil');return [...new Set(bad)]}
 window.v4108DecorateComicItems=decorateAll;window.v4108AuditComicItems=audit;
 /* V8.009: startup fan-out retired. v4115 + canonical screen renders own refresh timing. */
 window.addEventListener('growlegends:navigation-open-v7119',e=>{
  const id=String(e?.detail?.id||'');
  if(id==='character'||id==='shop'||id==='forge'||id==='harzForge'||id==='v488Forge')decorateAll();
 },{passive:true});
 window.addEventListener('pageshow',decorateAll,{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)decorateAll()},{passive:true});
 decorateAll();
})();
