/* ===== V4.02 Händler skaliert klar mit Charakter-Level =====
   Vorher: +1 Grundwert nur etwa alle 5 Level.
   Jetzt: sichtbare Steigerung ungefähr alle 2 Level + Raritätsmultiplikator.
*/
const V135_TIER={gray:0,green:1,blue:2,purple:3,orange:4,cyan:5};

function v135ShopLevel(){
  const lvl=Math.max(1,Number(s.level)||1);
  /* Händlerware liegt nah am Charakter-Level; gelegentlich +1 Level. */
  const roll=Math.random();
  const delta=roll<.18?-1:roll>.62?1:0;
  return Math.max(1,lvl+delta);
}

function v135ScaleShopStats(item,base,forcedLevel=null){
  if(!item||!base)return item;
  const q=item.quality||'gray';
  const tier=V135_TIER[q]||0;
  const lvl=Math.max(1,forcedLevel||item.dropLevel||s.level||1);

  item.dropLevel=lvl;
  item.baseId=base.baseId||base.id||item.baseId||item.id;

  const mult={gray:1.00,green:1.13,blue:1.30,purple:1.52,orange:1.82,cyan:2.18}[q]||1;
  const flat={gray:0,green:1,blue:2,purple:4,orange:7,cyan:10}[q]||0;
  const out={};

  Object.entries(base.bonus||{}).forEach(([stat,raw])=>{
    const b=Math.max(0,Number(raw)||0);
    if(b<=0){out[stat]=0;return;}

    /* Level growth: every ~2 levels instead of every 5. */
    const levelGrowth=Math.floor((lvl-1)/2);
    const baseAtLevel=b+levelGrowth;
    out[stat]=Math.max(
      baseAtLevel+tier,
      Math.round(baseAtLevel*mult)+flat
    );
  });

  item.bonus=out;
  const rarityPrice={gray:1,green:1.45,blue:2.35,purple:4.6,orange:7.2,cyan:10}[q]||1;
  const sum=Object.values(out).reduce((a,b)=>a+(Number(b)||0),0);
  item.price=Math.max(30,Math.round(typeof window.v6168ShopPrice==='function'?window.v6168ShopPrice(item,lvl):((35+lvl*12+sum*11)*rarityPrice)));
  item.shopItem=true;
  item.source='shop';
  return item;
}

/* Final shop item generator used by weapons/armor and jewelry. */
v027ShopItem=function(base){
  const q=v027ShopQuality();
  const lvl=v135ShopLevel();
  const item=v024Item(base,'shop',q);
  item.quality=q;
  item.rarity=qualityMeta(q).cls;
  item.dropLevel=lvl;
  item.shopItem=true;
  item.source='shop';
  item.baseId=base.id;
  v135ScaleShopStats(item,base,lvl);

  /* Keep displayed level synchronized with actual generated item level. */
  const clean=String(base.name||item.name||'Item').replace(/^(Normal|Gewöhnlich|Rare|Episch|Legendär|Mystisch):\s*/i,'').replace(/\s*\[Lv\.\d+\]\s*$/i,'');
  item.name=`${qualityMeta(q).label}: ${clean} [Lv.${lvl}]`;
  return item;
};

/* Fallback items created by uniqueness filler also get the same scaling. */
const v135OldForceTier=typeof v056ForceTierStats==='function'?v056ForceTierStats:null;
v056ForceTierStats=function(item,base){
  return v135ScaleShopStats(item,base,item?.dropLevel||v135ShopLevel());
};

function v135QualityClassFromItem(it){
  const q=String(it?.quality||'').toLowerCase();
  const r=String(it?.rarity||'').toLowerCase();
  if(q==='cyan'||/myst|cyan/.test(r))return 'mystic-cyan';
  if(q==='orange'||/legend|orange/.test(r))return 'legendary-orange';
  if(q==='purple'||/epic|purple/.test(r))return 'epic-purple';
  if(q==='blue'||/rare|blue/.test(r))return 'rare-blue';
  if(q==='green'||/green|common-green/.test(r))return 'common-green';
  return 'common-gray';
}

function v135PaintShop(){
  const groups=[
    ['#weaponShopItems .shop-item',s.weaponShop||[]],
    ['#v030MagicShop .shop-grid .shop-item',s.magicShop||[]]
  ];
  groups.forEach(([sel,arr])=>{
    document.querySelectorAll(sel).forEach((el,i)=>{
      ['common-gray','common-green','rare-blue','epic-purple','legendary-orange','mystic-cyan'].forEach(c=>el.classList.remove(c));
      if(arr[i])el.classList.add(v135QualityClassFromItem(arr[i]));
    });
  });
  
}

/* V8.102: historical one-time local shop refresh retired.
   V135 still supplies scaling helpers for legacy item generation, but never stock. */
if(!s.v135ShopLevelScaling)s.v135ShopLevelScaling=true;

if(typeof renderShop==='function'&&!window.__v135ShopPaintWrapped){
  const v135BaseRenderShop=renderShop;
  renderShop=function(){const r=v135BaseRenderShop.apply(this,arguments);v135PaintShop();return r};
  try{window.renderShop=renderShop}catch(_){}
  window.__v135ShopPaintWrapped=true;
}
v135PaintShop();
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='shop')v135PaintShop()},{passive:true});
