function v129RarityClass(it){
  const q=String(it?.quality||'').toLowerCase();
  const r=String(it?.rarity||'').toLowerCase();
  if(q.includes('cyan')||q.includes('myst')||r.includes('cyan')||r.includes('myst'))return 'mystic-cyan';
  if(q.includes('orange')||q.includes('legend')||r.includes('orange')||r.includes('legend'))return 'legendary-orange';
  if(q.includes('purple')||q.includes('epic')||q.includes('episch')||r.includes('epic'))return 'epic-purple';
  if(q.includes('blue')||q.includes('rare')||r.includes('rare'))return 'rare-blue';
  if(q.includes('green')||q.includes('gewöhn')||r.includes('green'))return 'common-green';
  return 'common-gray';
}
function v129PolishDynamicCards(){
  /* Add rarity classes to current shop cards from backing arrays. */
  document.querySelectorAll('#weaponShopItems .shop-item').forEach((el,i)=>{
    const it=s.weaponShop?.[i];
    if(it)el.classList.add(v129RarityClass(it));
  });
  document.querySelectorAll('#v030MagicShop .shop-grid .shop-item').forEach((el,i)=>{
    const it=s.magicShop?.[i];
    if(it)el.classList.add(v129RarityClass(it));
  });

  /* Base old shop fallback */
  document.querySelectorAll('#shopItems .shop-item').forEach((el,i)=>{
    const it=(typeof shopStock==='function'?shopStock():[])[i];
    if(it)el.classList.add(v129RarityClass(it));
  });

  
}
if(typeof renderShop==='function'&&!window.__v6320V129ShopWrapped){
  const v6320V129BaseShop=renderShop;
  renderShop=function(){const r=v6320V129BaseShop.apply(this,arguments);v129PolishDynamicCards();return r};
  try{window.renderShop=renderShop}catch(e){}
  window.__v6320V129ShopWrapped=true;
}
v129PolishDynamicCards();
