/* ===== V4.02 rarity stat separation =====
   Goal: same base item + same level must always become clearly stronger
   as rarity increases.
*/

const V055_RARITY_POWER = {
  gray:   {mult:1.00, flat:0, label:'Normal'},
  green:  {mult:1.16, flat:1, label:'Gewöhnlich'},
  blue:   {mult:1.34, flat:2, label:'Rare'},
  purple: {mult:1.58, flat:3, label:'Episch'},
  orange: {mult:1.88, flat:4, label:'Legendär'},
  cyan:   {mult:2.18, flat:5, label:'Mystisch'}
};

/* Controlled level growth. Rarity does the visible separation. */
v024Scale=function(level){
  level=Math.max(1,Number(level)||1);
  return 1+(level-1)*0.05;
};

/* Always separate rarity tiers by both multiplier + flat bonus.
   This avoids rounding causing gray and green to land on the same number. */
v024Bonus=function(baseBonus,quality,level){
  const meta=V055_RARITY_POWER[quality]||V055_RARITY_POWER.gray;
  const lvl=v024Scale(level);
  const out={};

  Object.entries(baseBonus||{}).forEach(([k,v])=>{
    const base=Math.max(0,Number(v)||0);
    if(base<=0){
      out[k]=0;
      return;
    }

    let value=Math.round(base*lvl*meta.mult + meta.flat);

    /* Hard minimum spacing by rarity for primary-value stats. */
    const minByTier={
      gray:1,
      green:2,
      blue:3,
      purple:4,
      orange:5,
      cyan:6
    }[quality]||1;

    value=Math.max(value,minByTier);
    out[k]=value;
  });

  return out;
};

/* Rebuild generated items with the new tier rules. */
function v055RebuildGeneratedItem(item){
  if(!item || !item.quality || !item.dropLevel || !item.baseBonusV055)return item;
  item.bonus=v024Bonus(item.baseBonusV055,item.quality,item.dropLevel);
  return item;
}

/* Preserve the original unscaled base stats on every newly generated item,
   so future balancing can always recalc correctly. */
const v055OldItem=v024Item;
v024Item=function(base,source='normal',forced=null){
  const item=v055OldItem(base,source,forced);
  item.baseBonusV055=JSON.parse(JSON.stringify(base.bonus||{}));
  item.bonus=v024Bonus(base.bonus,item.quality,Math.max(1,s.level||1));
  return item;
};

/* Set items also use the new rarity power curve. */
const v055OldSet=makeSetItem;
makeSetItem=function(classId,slot){
  const item=v055OldSet(classId,slot);
  const lvl=Math.max(1,Number(item.dropLevel)||s.level||1);

  if(!item.baseBonusV055){
    item.baseBonusV055=JSON.parse(JSON.stringify(item.bonus||{}));
  }

  item.quality='purple';
  item.rarity=qualityMeta('purple').cls;
  item.bonus=v024Bonus(item.baseBonusV055,'purple',lvl);
  return item;
};

/* Shop items still stay slightly weaker than equivalent dungeon items,
   but rarity separation remains intact. */
v027ShopItem=function(base){
  const item=v024Item(base,'shop',v027ShopQuality());
  const q=item.quality||'gray';

  const shopFactor={
    gray:.90,
    green:.91,
    blue:.92,
    purple:.93
  }[q]||.90;

  Object.keys(item.bonus||{}).forEach(k=>{
    item.bonus[k]=Math.max(
      V055_RARITY_POWER[q]?.flat||0,
      Math.round(item.bonus[k]*shopFactor)
    );
  });

  /* Guarantee visible difference even after shop penalty */
  const tierFloor={
    gray:1,
    green:2,
    blue:3,
    purple:4
  }[q]||1;

  Object.keys(item.bonus||{}).forEach(k=>{
    if((base.bonus?.[k]||0)>0){
      item.bonus[k]=Math.max(item.bonus[k],tierFloor);
    }
  });

  const rarityPrice={gray:1,green:1.45,blue:2.35,purple:4.8}[q]||1;
  item.price=Math.max(
    30,
    Math.round(
      (30+(item.dropLevel||1)*11+
      Object.values(item.bonus||{}).reduce((a,b)=>a+(Number(b)||0),0)*9)
      *rarityPrice
    )
  );
  item.shopItem=true;
  return item;
};

/* One-time normalize current shop stock so existing equal-stat items disappear. */
if(!s.v055RarityRebalanced){
  if(typeof v030FillShops==='function'){
    s.weaponShop=[];
    s.magicShop=[];
    v030FillShops(true);
  }else{
    s.shop=[];
    if(typeof refreshShop==='function')refreshShop(true);
  }

  s.v055RarityRebalanced=true;
  localStorage.setItem(KEY,JSON.stringify(s));
}

/* Small tooltip/help text in shop */
function v055AddRarityHint(){
  const shop=document.querySelector('#shop');
  if(!shop || document.querySelector('#v055RarityHint'))return;

  const hint=document.createElement('div');
  hint.id='v055RarityHint';
  hint.className='tiny';
  hint.style.cssText='margin:0 2px 10px;padding:8px 10px;border-radius:10px;background:#0f1711;border:1px solid #304632';
  hint.innerHTML='⚖️ Werte steigen jetzt klar mit der Seltenheit: <b>Grau &lt; Grün &lt; Blau &lt; Episch &lt; Legendär &lt; Mystisch</b>.';
  shop.insertBefore(hint,shop.querySelector('.card'));
}

const v055BaseRender=render;
render=function(){
  v055BaseRender();
  
  v055AddRarityHint();
};

try{
  render();
}catch(e){
  console.error('V4.02 rarity balance',e);
}
