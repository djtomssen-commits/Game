/* ===== V4.02 CLEAN SHOP CORE =====
   Uses the real V4.02 generator names:
   v030MakeGear / v030MakeJewelry / v030MakeMaterial.
*/

function v057ToastOk(item,destination='Inventar'){
  if(typeof v054Purchased==='function'){
    v054Purchased(item,destination);
  }else if(typeof v054Toast==='function'){
    v054Toast(`✅ ${item?.name||'Gegenstand'} gekauft`,'success',`Liegt jetzt im ${destination}.`);
  }else{
    v115Alert(`${item?.name||'Gegenstand'} gekauft und im ${destination} abgelegt.`);
  }
}
function v057ToastNoGold(){
  if(typeof v054NotEnoughGold==='function'){
    v054NotEnoughGold();
  }else if(typeof v054Toast==='function'){
    v054Toast('❌ Nicht genug Gold','error');
  }else{
    v115Alert('Nicht genug Gold.');
  }
}

function v057Key(it){
  return `${it?.baseId||it?.id||it?.name||'item'}|${it?.quality||'gray'}|${it?.type||'gear'}`;
}

function v057WeaponOffer(){
  const base=v030WeaponBase();
  const it=v030MakeGear(base);
  it.baseId=base?.id||it.baseId||it.id;

  if(typeof v056ForceTierStats==='function'){
    v056ForceTierStats(it,base);
  }
  return it;
}

function v057JewelryOffer(slot=null){
  const it=v030MakeJewelry(slot);

  const base=(typeof v030Jewelry!=='undefined')
    ? v030Jewelry.find(x=>(x.id===it.baseId || x.id===String(it.uid||'').split('_').slice(0,-2).join('_') || x.name===it.name))
    : null;

  if(base){
    it.baseId=base.id;
    if(typeof v056ForceTierStats==='function'){
      v056ForceTierStats(it,base);
    }
  }
  return it;
}

function v057MaterialOffer(){
  return v030MakeMaterial();
}

function v057Unique(count,maker,existing=[]){
  const out=[];
  const seen=new Set((existing||[]).filter(Boolean).map(v057Key));

  let guard=0;
  while(out.length<count && guard<500){
    guard++;
    const it=maker();
    if(!it)continue;
    const key=v057Key(it);
    if(seen.has(key))continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

function v057FillShops(force=false){
  s.weaponShop??=[];
  s.magicShop??=[];

  if(force || s.weaponShop.length!==9){
    s.weaponShop=v057Unique(9,v057WeaponOffer);
  }

  if(force || s.magicShop.length!==9){
    const jewelry=v057Unique(3,v057JewelryOffer);
    const materials=v057Unique(6,v057MaterialOffer,jewelry);
    s.magicShop=[...jewelry,...materials];
  }

  localStorage.setItem(KEY,JSON.stringify(s));
}

/* Replace one slot with a fresh non-duplicate item. */
function v057Replacement(shop,index,maker){
  const others=(shop||[]).filter((_,i)=>i!==index);
  const seen=new Set(others.filter(Boolean).map(v057Key));

  for(let tries=0;tries<300;tries++){
    const it=maker();
    if(it && !seen.has(v057Key(it)))return it;
  }

  return maker();
}

/* Clean final purchase handlers */
window.v030BuyWeapon=function(i){
  const it=s.weaponShop?.[i];
  if(!it)return;

  const price=Number(it.price)||0;
  if(s.gold<price){
    v057ToastNoGold();
    return;
  }

  s.gold-=price;

  const bought={
    ...it,
    id:it.uid || `${it.baseId||it.id||'gear'}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
  };
  s.inventory.push(bought);

  s.weaponShop[i]=v057Replacement(s.weaponShop,i,v057WeaponOffer);

  localStorage.setItem(KEY,JSON.stringify(s));

  /* Render first, then show toast so it cannot be overwritten. */
  render();
  setTimeout(()=>v057ToastOk(bought,'Inventar'),0);
};

window.v030BuyMagic=function(i){
  const it=s.magicShop?.[i];
  if(!it)return;

  const price=Number(it.price)||0;
  if(s.gold<price){
    v057ToastNoGold();
    return;
  }

  s.gold-=price;

  if(it.type==='gem'||it.type==='scroll'){
    const bought={...it};
    s.materials??=[];
    s.materials.push(bought);

    s.magicShop[i]=v057Replacement(s.magicShop,i,v057MaterialOffer);

    localStorage.setItem(KEY,JSON.stringify(s));
    render();
    setTimeout(()=>v057ToastOk(bought,'Material-Inventar'),0);
    return;
  }

  const bought={
    ...it,
    id:it.uid || `${it.baseId||it.id||'jewel'}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
  };
  s.inventory.push(bought);

  s.magicShop[i]=v057Replacement(s.magicShop,i,v057JewelryOffer);

  localStorage.setItem(KEY,JSON.stringify(s));
  render();
  setTimeout(()=>v057ToastOk(bought,'Inventar'),0);
};

function v057OfferHtml(it,i,kind){
  const info=it.type==='gem'
    ? `💎 +${it.value} ${v030StatLabel(it.stat)}`
    : it.type==='scroll'
      ? `✨ ${v030EffectLabel(it.effect,it.value)}`
      : itemBonus(it);

  return `
    <div class="shop-item ${it.rarity||''}">
      <div class="shop-icon">${it.icon||'🎁'}</div>
      <h3>${it.name}</h3>
      <div class="${qualityMeta(it.quality||'gray').color}">
        ${qualityMeta(it.quality||'gray').label}
      </div>
      <div class="tiny" style="margin-top:5px">${info}</div>
      <div class="price" style="margin:7px 0">💰 ${it.price} Gold</div>
      <button type="button" class="btn v057-buy" data-kind="${kind}" data-index="${i}">
        Kaufen
      </button>
    </div>`;
}

/* V8.009: legacy V057 shop DOM renderer retired.
   V057 remains the stock/generator/replacement helper; V461 is the sole live shop DOM owner. */
renderShop=function(){v057FillShops(false);return false};

/* Discard old broken stock once */
if(!s.v057ShopCore){
  s.weaponShop=[];
  s.magicShop=[];
  v057FillShops(true);
  s.v057ShopCore=true;
  localStorage.setItem(KEY,JSON.stringify(s));
}

/* V8.009: global render -> renderShop fan-out retired.
   Shop updates are now driven by navigation, purchases and authority state changes. */
