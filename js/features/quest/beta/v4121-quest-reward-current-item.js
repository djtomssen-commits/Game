
(()=>{
 'use strict';
 const VERSION='V4.121 Stable',SHORT='V4.121';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const keyOf=x=>{try{return String(x?.id||x?.uid||[x?.name||'',x?.type||'',x?.slot||'',x?.quality||'',x?.dropLevel||'',x?.value||'',JSON.stringify(x?.bonus||{})].join('|'))}catch(e){return String(x?.name||'')}};
 function snap(){
  return {
   inv:new Set((Array.isArray(s?.inventory)?s.inventory:[]).map(keyOf)),
   mats:new Set((Array.isArray(s?.materials)?s.materials:[]).map(keyOf))
  };
 }
 function gained(before){
  const out=[];
  (Array.isArray(s?.inventory)?s.inventory:[]).forEach(it=>{if(!before?.inv?.has(keyOf(it)))out.push(it)});
  (Array.isArray(s?.materials)?s.materials:[]).forEach(it=>{if(!before?.mats?.has(keyOf(it)))out.push(it)});
  return out;
 }
 function allItems(){
  try{return [
   ...(Array.isArray(s?.inventory)?s.inventory:[]),
   ...(Array.isArray(s?.materials)?s.materials:[]),
   ...Object.values(s?.equipment||{}).filter(Boolean)
  ]}catch(e){return[]}
 }
 function findByTitle(title,preferred=[]){
  const t=String(title||'').trim();if(!t)return null;
  return preferred.find(x=>String(x?.name||'').trim()===t)||[...allItems()].reverse().find(x=>String(x?.name||'').trim()===t)||null;
 }
 function artUri(it){
  try{return String(window.v466ItemArtUri?.(it)||window.v4106ComicItemArtUri?.(it)||window.v4115ComicItemArtUri?.(it)||'')}catch(e){return''}
 }
 function fullCurrentCard(it){
  try{
   if(typeof window.v4103RenderItemCard==='function'){
    return window.v4103RenderItemCard(it,{slot:it?.slot,context:'quest-reward',extraClass:'v4121-quest-current-item'});
   }
  }catch(e){}
  const u=artUri(it);if(!u)return'';
  return `<div class="v395-loot-card item v4121-quest-current-item v4121-art-current" data-v4103-item-current="1"><div class="ico"><img class="v466-item-art" src="${u}" alt="${esc(it?.name||'Gegenstand')}"></div><b>${esc(it?.name||'Gegenstand')}</b><span>${esc(it?.quality||it?.rarity||'Item')}</span></div>`;
 }
 function replaceGearCard(card,it){
  if(!card||!it)return false;const html=fullCurrentCard(it);if(!html)return false;
  const host=document.createElement('div');host.innerHTML=html.trim();const next=host.firstElementChild;if(!next)return false;
  card.replaceWith(next);return true;
 }
 function replaceCompactArt(card,it){
  if(!card||!it)return false;const u=artUri(it);if(!u)return false;
  let ico=card.querySelector('.ico');if(!ico){ico=document.createElement('div');ico.className='ico';card.prepend(ico)}
  ico.innerHTML=`<img class="v466-item-art" src="${u}" alt="${esc(it?.name||'Gegenstand')}">`;
  card.classList.add('v4121-art-current');card.dataset.v4103ItemCurrent='1';return true;
 }
 function upgrade(before=null){
  const extra=document.getElementById('v231QuestRewardExtra');if(!extra)return;
  const fresh=before?gained(before):[];
  /* V395 is the visible quest-reward showcase. It still wrote raw historical
     it.icon emoji. Gear now uses the canonical V4103 card and every material
     icon is resolved through the single final V466 comic-art owner. */
  [...extra.querySelectorAll('.v395-loot-card')].forEach(card=>{
   if(card.matches('.v4121-quest-current-item')||card.querySelector('.v4103-item-card'))return;
   const title=card.querySelector('b')?.textContent||'';
   const it=findByTitle(title,fresh);if(!it)return;
   if(card.classList.contains('item')&&!['gem','scroll'].includes(String(it.type||'')))replaceGearCard(card,it);
   else replaceCompactArt(card,it);
  });
  /* Older V240 quest rows are also forced through the current resolver. */
  extra.querySelectorAll('.v240-loot-item').forEach(card=>{
   const title=card.querySelector('.v240-loot-name')?.textContent||'';const it=findByTitle(title,fresh);if(!it)return;
   const box=card.querySelector('.v240-loot-icon');if(!box)return;const u=artUri(it);if(!u)return;
   box.innerHTML=`<img class="v466-item-art" src="${u}" alt="${esc(it?.name||'Gegenstand')}">`;card.dataset.v4103ItemCurrent='1';
  });
  try{window.v4112RefreshAllItemArt?.(extra)}catch(e){}
 }
 window.v4121RefreshQuestRewardArt=upgrade;
 window.v4121QuestRewardSnapshot=snap;
 window.v4121AfterQuestClaim=before=>{
  /* Reward DOM already exists when the canonical claim owner invokes this hook. */
  upgrade(before);
 };
 /* V8.009 Quest consolidation: the canonical claim owner (v7045) invokes
    v4121AfterQuestClaim directly. The historical global click retry duplicated
    the same reward-art paint 120 ms later and is retired. */
 function stamp(){}
 upgrade(null);stamp();window.addEventListener('pageshow',()=>{upgrade(null);stamp()},{passive:true});
})();
