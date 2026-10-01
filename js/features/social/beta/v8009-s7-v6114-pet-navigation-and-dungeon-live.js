(()=>{
'use strict';
if(window.__V6114_DUNGEON_KEY_AND_PET_NAV__)return;
window.__V6114_DUNGEON_KEY_AND_PET_NAV__=true;

function closePetForNavigation(){
  const ov=document.getElementById('v686PetAlbumOverlay');
  if(!ov?.classList.contains('show'))return false;
  ov.classList.remove('show');
  document.documentElement.style.overflow='';
  try{window.v6104ClearPetNewFinds?.()}catch(e){}
  return true;
}
window.v6114ClosePetForNavigation=closePetForNavigation;

/* Shared navigation authority: choosing another page closes the Pet album. */
window.addEventListener('growlegends:navigation-open-v7119',closePetForNavigation,{passive:true});
window.__v6114GoWrapped='v7119-event';

/* The hamburger/menu itself must also be reachable while the album is open. */
document.addEventListener('click',e=>{
  const item=e.target instanceof Element
    ?e.target.closest('#v032MenuPanel .top-menu-item')
    :null;
  if(item)closePetForNavigation();
},true);

window.v6114DungeonLiveQA=()=>({
  unlocked:[...(s?.dungeon?.unlocked||[])],
  keys:{...(s?.dungeon?.keys||{})},
  selected:Number(s?.dungeon?.selected)||0,
  layer:s?.dungeon?.layer||'',
  view:s?.dungeon?.view||'',
  petOpen:document.getElementById('v686PetAlbumOverlay')?.classList.contains('show')||false
});
})();
