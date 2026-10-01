/* ===== V4.02 Strict rarity value progression =====
   Goal: for materials + jewelry, higher rarity must ALWAYS have higher values:
   Normal < Gewöhnlich < Rare < Episch.
*/

const V121_TIER={gray:0,green:1,blue:2,purple:3};

function v121QualityTier(q){
  return V121_TIER[q] ?? 0;
}

/* ---------- Gems / Drucksteine / Edelsteine ---------- */
function v121MaterialValue(base,q){
  const tier=v121QualityTier(q);
  const min=Math.max(1,Number(base.min)||1);
  const max=Math.max(min,Number(base.max)||min);

  /*
    Each rarity gets its own non-overlapping band.
    Example min 2/max 5:
      gray   2–3
      green  4–5
      blue   6–7
      purple 8–9
  */
  const bandWidth=Math.max(1,Math.ceil((max-min+1)/2));
  const low=min+tier*bandWidth;
  const high=low+bandWidth-1;
  return v030Rand(low,high);
}

function v121ScrollValue(base,q){
  const tier=v121QualityTier(q);
  const min=Math.max(1,Number(base.min)||1);
  const max=Math.max(min,Number(base.max)||min);

  /*
    Scroll effects are percentage-like and therefore use narrower,
    but still strictly separated, rarity bands.
  */
  const width=Math.max(1,Math.ceil((max-min+1)/2));
  const low=min+tier*width;
  const high=low+width-1;
  return v030Rand(low,high);
}

/* Replace material generator completely. */
v030MakeMaterial=function(){
  if(Math.random()<.58){
    const g=v030Gems[Math.floor(Math.random()*v030Gems.length)];
    const q=v027ShopQuality();
    const v=v121MaterialValue(g,q);
    const priceMult={gray:1,green:1.45,blue:2.45,purple:4.4}[q]||1;

    return{
      uid:v030Uid(g.id),
      baseId:g.id,
      type:'gem',
      name:g.name,
      icon:g.icon,
      quality:q,
      rarity:qualityMeta(q).cls,
      stat:g.stat,
      value:v,
      price:Math.round((75+v*38)*priceMult)
    };
  }

  const r=v030Scrolls[Math.floor(Math.random()*v030Scrolls.length)];
  const q=v027ShopQuality();
  const v=v121ScrollValue(r,q);
  const priceMult={gray:1,green:1.5,blue:2.6,purple:4.7}[q]||1;

  return{
    uid:v030Uid(r.id),
    baseId:r.id,
    type:'scroll',
    name:r.name,
    icon:r.icon,
    quality:q,
    rarity:qualityMeta(q).cls,
    effect:r.effect,
    value:v,
    price:Math.round((95+v*48)*priceMult)
  };
};

/* ---------- Rings & Amulets ---------- */
function v121JewelryBonus(baseBonus,q,level){
  const tier=v121QualityTier(q);
  const lvl=Math.max(1,Number(level)||1);
  const levelScale=1+(lvl-1)*0.04;
  const out={};

  Object.entries(baseBonus||{}).forEach(([k,raw])=>{
    const base=Math.max(1,Number(raw)||1);
    const gray=Math.max(1,Math.round(base*levelScale));

    /*
      Strict additive rarity step guarantees that rounding can never make
      green equal gray, blue equal green, etc.
    */
    const step=Math.max(1,Math.ceil(base*.28));
    out[k]=gray+(step*tier);
  });

  return out;
}

v030MakeJewelry=function(){
  const pool=v030Jewelry.filter(x=>!x.classId||x.classId===s.playerClass);
  const base=pool[Math.floor(Math.random()*pool.length)];
  const q=v027ShopQuality();
  const level=Math.max(1,Number(s.level)||1);
  const bonus=v121JewelryBonus(base.bonus,q,level);
  const rarityPrice={gray:1,green:1.5,blue:2.55,purple:4.9}[q]||1;
  const statTotal=Object.values(bonus).reduce((a,b)=>a+(Number(b)||0),0);

  return{
    ...base,
    id:`${base.id}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    uid:v030Uid(base.id),
    name:`${qualityMeta(q).label}: ${String(base.name).replace(/^(Normal|Gewöhnlich|Rare|Episch):\s*/,'')} [Lv.${level}]`,
    quality:q,
    rarity:qualityMeta(q).cls,
    dropLevel:level,
    bonus,
    shopCategory:'jewelry',
    shopItem:true,
    price:Math.max(35,Math.round((35+level*10+statTotal*10)*rarityPrice))
  };
};

/* ---------- Sanity helpers / UI ---------- */
function v121RarityInfo(){
  return 'Werte: Normal &lt; Gewöhnlich &lt; Rare &lt; Episch. Gilt für Ringe, Amulette, Edel-/Drucksteine und Verzauberungsrollen.';
}

/*
  Force a one-time merchant refresh so old V4.02 stock with overlapping
  gray/green values disappears immediately.
*/
if(!s.v121RarityMigrated){
  s.weaponShop=[];
  s.magicShop=[];
  try{v030Fill(true)}catch(e){}
  s.v121RarityMigrated=true;
  try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
}

/* Existing shop materials from old stock: normalize if any survived. */
function v121SanitizeMagicStock(){
  if(!Array.isArray(s.magicShop))return;

  let changed=false;
  s.magicShop=s.magicShop.map((it,i)=>{
    if(!it)return it;

    if(it.type==='gem'){
      const base=v030Gems.find(x=>x.id===it.baseId);
      if(base){
        const expectedTier=v121QualityTier(it.quality||'gray');
        const minExpected=Math.max(1,Number(base.min)||1)+expectedTier*Math.max(1,Math.ceil(((Number(base.max)||base.min)-(Number(base.min)||1)+1)/2));
        if((Number(it.value)||0)<minExpected){
          changed=true;
          return {...it,value:v121MaterialValue(base,it.quality||'gray')};
        }
      }
    }

    if(it.type==='scroll'){
      const base=v030Scrolls.find(x=>x.id===it.baseId);
      if(base){
        const expectedTier=v121QualityTier(it.quality||'gray');
        const minExpected=Math.max(1,Number(base.min)||1)+expectedTier*Math.max(1,Math.ceil(((Number(base.max)||base.min)-(Number(base.min)||1)+1)/2));
        if((Number(it.value)||0)<minExpected){
          changed=true;
          return {...it,value:v121ScrollValue(base,it.quality||'gray')};
        }
      }
    }

    return it;
  });

  if(changed){
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
  }
}

function v121PaintShopInfo(){
  const box=document.querySelector('#v030MagicShop');
  if(!box)return;
  let info=box.querySelector('.v121-rarity-info');
  if(!info){
    info=document.createElement('div');
    info.className='tiny v121-rarity-info';
    info.style.marginTop='8px';
    box.appendChild(info);
  }
  info.innerHTML=v121RarityInfo();
}
try{window.v121PaintShopInfo=v121PaintShopInfo}catch(e){}

const v121BaseRender=render;
render=function(){
  v121SanitizeMagicStock();
  const result=v121BaseRender();
  if(document.querySelector('#shop')?.classList.contains('active')&&typeof v121PaintShopInfo==='function')requestAnimationFrame(v121PaintShopInfo);
  return result;
};

setTimeout(()=>{
  try{
    v121SanitizeMagicStock();
    if(typeof v121PaintShopInfo==='function')v121PaintShopInfo();
    renderShop();
  }catch(e){}
},200);
