(function(){
  const VERSION='V4.67 Stable',SHORT='V4.67';
  function stamp(){}
  function currentTab(){try{return sessionStorage.getItem('growLegends:v464ShopTab')||'weapon'}catch(e){return'weapon'}}
  function setTab(name,scroll=false){
    name=name==='magic'?'magic':'weapon';
    const tabs=document.querySelector('#v464ShopTabs');
    tabs?.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.v464Tab===name));
    document.querySelectorAll('#shop .v464-panel').forEach(p=>p.classList.toggle('active',p.dataset.v464Panel===name));
    try{sessionStorage.setItem('growLegends:v464ShopTab',name)}catch(e){}
    const hero=document.querySelector('#v461ShopHero');
    if(hero){
      const kicker=hero.querySelector('.v461-shop-kicker');
      const title=hero.querySelector('h2');
      const desc=hero.querySelector('.muted');
      if(name==='magic'){
        if(kicker&&kicker.textContent!=='💎 MIRAS NEBELVITRINE')kicker.textContent='💎 MIRAS NEBELVITRINE';
        if(title&&title.textContent!=='Schmuck & Magie')title.textContent='Schmuck & Magie';
        if(desc&&desc.textContent!=='Ringe, Amulette, Edelsteine und Rollen für deine Ausrüstung.')desc.textContent='Ringe, Amulette, Edelsteine und Rollen für deine Ausrüstung.';
        hero.classList.add('v464-magic');
      }else{
        if(kicker)kicker.textContent='🌿 BORKS KAMPFLADEN';
        if(title)title.textContent='Borks Kampfladen';
        if(desc)desc.textContent='Waffen und Rüstung für deinen nächsten Dungeon. Gute Angebote erkennst du direkt an ihrer Seltenheit.';
        hero.classList.remove('v464-magic');
      }
    }
    if(scroll){try{tabs?.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){}}
  }
  window.v464ShopTab=setTab;
  function arrange(){
    const shop=document.querySelector('#shop');if(!shop)return false;
    const hero=document.querySelector('#v461ShopHero');
    const gear=document.querySelector('#v057GearShopCard');
    const magic=document.querySelector('#v030MagicShop');
    if(!hero||!gear||!magic)return false;
    let tabs=document.querySelector('#v464ShopTabs');
    if(!tabs){
      tabs=document.createElement('nav');tabs.id='v464ShopTabs';tabs.innerHTML='<button type="button" data-v464-tab="weapon"><b>⚔️</b>WAFFEN & RÜSTUNG</button><button type="button" data-v464-tab="magic"><b>💎</b>SCHMUCK & MAGIE</button>';
      hero.insertAdjacentElement('afterend',tabs);
      tabs.querySelectorAll('button').forEach(b=>b.onclick=()=>setTab(b.dataset.v464Tab,true));
    }
    gear.classList.add('v464-panel');gear.dataset.v464Panel='weapon';
    magic.classList.add('v464-panel');magic.dataset.v464Panel='magic';
    if(gear.parentElement!==shop)shop.appendChild(gear);
    if(magic.parentElement!==shop)shop.appendChild(magic);
    if(tabs.nextElementSibling!==gear)tabs.insertAdjacentElement('afterend',gear);
    if(gear.nextElementSibling!==magic)gear.insertAdjacentElement('afterend',magic);
    setTab(currentTab(),false);stamp();
    return true;
  }
  try{
    if(typeof renderShop==='function'&&!window.__v464RenderShopWrapped){
      const base=renderShop;renderShop=function(){const r=base.apply(this,arguments);arrange();return r};window.renderShop=renderShop;window.__v464RenderShopWrapped=true;
    }
  }catch(e){}
  /* V8.009: global render layout hook retired. renderShop + navigation own arrangement. */
  try{
    if(!window.__v464GoWrapped){
      window.addEventListener('growlegends:navigation-open-v7119',e=>{
        if(String(e?.detail?.id||'')!=='shop')return;
        try{renderShop();arrange()}catch(err){console.warn('V7.120 shop navigation refresh',err)}
      });
      window.__v464GoWrapped='v7120-event';
    }
  }catch(e){}
  try{renderShop();arrange()}catch(e){console.warn('V4.67 shop init',e)}
  document.addEventListener('DOMContentLoaded',()=>{try{renderShop();arrange();stamp()}catch(e){}},{once:true});
  window.addEventListener('pageshow',()=>{try{arrange();stamp()}catch(e){}},{passive:true});
  /* V8.009: startup arrange fan-out retired; shop navigation/render owns layout. */
})();
