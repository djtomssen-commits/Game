
function v131CleanShop(){
  const shop=document.querySelector('#shop');
  if(!shop)return;

  /* Remove the complete top Händlergasse scene/banner. */
  shop.querySelectorAll('.v052-scene-banner').forEach(el=>{
    const t=(el.textContent||'').toLowerCase();
    if(t.includes('händlergasse') || t.includes('haendlergasse')) el.remove();
  });

  /* Remove the explanatory rarity-value sentence wherever it is rendered. */
  shop.querySelectorAll('*').forEach(el=>{
    const t=(el.textContent||'').trim().toLowerCase();
    if(t.startsWith('werte steigen jetzt klar mit')){
      if(el.children.length===0 || el.classList.contains('tiny') || el.classList.contains('muted') || el.tagName==='P'){
        el.remove();
      }
    }
  });

  
}
if(typeof renderShop==='function'&&!window.__v131ShopCleanWrapped){
  const v131BaseRenderShop=renderShop;
  renderShop=function(){const r=v131BaseRenderShop.apply(this,arguments);v131CleanShop();return r};
  try{window.renderShop=renderShop}catch(_){}
  window.__v131ShopCleanWrapped=true;
}
v131CleanShop();
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='shop')v131CleanShop()},{passive:true});
