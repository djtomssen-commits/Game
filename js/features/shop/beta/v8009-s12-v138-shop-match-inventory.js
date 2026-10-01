function v138ShopQualityClass(it){
  const q=String(it?.quality||'').toLowerCase();
  const r=String(it?.rarity||'').toLowerCase();
  const n=String(it?.name||'').toLowerCase();
  const t=q+' '+r+' '+n;

  if(/myst|cyan|türkis|tuerkis/.test(t)) return 'mystic-cyan';
  if(/legend|orange/.test(t)) return 'legendary-orange';
  if(/epic|episch|purple|lila/.test(t)) return 'epic-purple';
  if(/rare|selten|blue|blau/.test(t)) return 'rare-blue';
  if(/gewöhn|gewoehn|green|grün|gruen/.test(t)) return 'common-green';
  return 'common-gray';
}

function v138PaintMerchant(){
  const allClasses=['common-gray','common-green','rare-blue','epic-purple','legendary-orange','mystic-cyan'];

  const bindings=[
    ['#weaponShopItems .shop-item', s.weaponShop||[]],
    ['#v030MagicShop .shop-grid .shop-item', s.magicShop||[]],
    ['#shopItems .shop-item', typeof shopStock==='function' ? (shopStock()||[]) : []]
  ];

  bindings.forEach(([sel,arr])=>{
    document.querySelectorAll(sel).forEach((el,i)=>{
      allClasses.forEach(c=>el.classList.remove(c));
      const it=arr[i];
      if(it) el.classList.add(v138ShopQualityClass(it));
      else{
        const txt=(el.textContent||'').toLowerCase();
        const fake={name:txt};
        el.classList.add(v138ShopQualityClass(fake));
      }
    });
  });

  
}

/* V8.009: legacy post-paint rarity pass retired.
   The later v139ActualOffer writes the final rarity class directly into each
   offer card, so repainting an intermediate DOM frame only caused flicker. */
