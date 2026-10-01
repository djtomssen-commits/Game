
(()=>{
'use strict';
if(window.__V6144_MATERIAL_COMIC_ART__)return;
window.__V6144_MATERIAL_COMIC_ART__=true;

function refresh(){
  try{window.v6107PaintItemSurfaces?.(document)}catch(e){}
  try{window.v546RenderMaterials?.()}catch(e){}
  try{if(document.getElementById('shop')?.classList.contains('active'))window.renderShop?.()}catch(e){}
}
document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(refresh),{once:true});
window.addEventListener('growlegends:account-ready',()=>setTimeout(refresh,120));

window.v6144MaterialArtQA=()=>({
  gems:[
    'gem_whitewidow','gem_harzkern','gem_gruenpfeil','gem_wurzel','gem_lucky'
  ].every(id=>/^(?:data:image\/webp;base64,|assets\/v71(?:95|98)-base64\/)/.test(String(window.v6144MaterialArt?.({type:'gem',baseId:id})||''))),
  scrolls:[
    'scroll_crit','scroll_power','scroll_guard','scroll_luck'
  ].every(id=>/^(?:data:image\/webp;base64,|assets\/v71(?:95|98)-base64\/)/.test(String(window.v6144MaterialArt?.({type:'scroll',baseId:id})||''))),
  oldGemFallback:!!window.v6144MaterialArt?.({type:'gem',stat:'staerke'}),
  oldScrollFallback:!!window.v6144MaterialArt?.({type:'scroll',effect:'crit'})
});
})();
