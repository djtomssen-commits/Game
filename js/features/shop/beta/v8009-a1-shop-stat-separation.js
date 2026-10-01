/* ===== V4.02 shop stat separation + duplicate prevention ===== */

const V056_TIER_INDEX = {
  gray:0,
  green:1,
  blue:2,
  purple:3,
  orange:4,
  cyan:5
};

function v056BaseIdentity(it){
  return it?.baseId || it?.id || it?.name || 'item';
}

function v056OfferKey(it){
  return `${v056BaseIdentity(it)}|${it?.quality||'gray'}`;
}

/* Final shop stat function.
   This runs AFTER item generation and guarantees a visible difference
   between rarity tiers even when older code rounded values to the same number. */
function v056ForceTierStats(item, base){
  if(!item || !base)return item;

  const q=item.quality||'gray';
  const tier=V056_TIER_INDEX[q]||0;
  const lvl=Math.max(1,Number(item.dropLevel)||s.level||1);

  item.baseId = base.baseId || base.id || item.baseId || item.id;
  item.baseBonusV056 = JSON.parse(JSON.stringify(base.bonus||{}));

  const out={};

  Object.entries(base.bonus||{}).forEach(([stat,raw])=>{
    const b=Math.max(0,Number(raw)||0);
    if(b<=0){
      out[stat]=0;
      return;
    }

    /*
      Clear shop progression:
      Gray   = base + level growth
      Green  = gray + at least 1
      Blue   = gray + at least 2
      Purple = gray + at least 3
      Higher tiers are included for non-shop safety.
    */
    const levelPart=Math.floor((lvl-1)/5);
    const grayValue=Math.max(1,b+levelPart);

    const tierBonus={
      gray:0,
      green:1,
      blue:2,
      purple:3,
      orange:5,
      cyan:7
    }[q]||0;

    const percentBonus={
      gray:1.00,
      green:1.10,
      blue:1.22,
      purple:1.38,
      orange:1.62,
      cyan:1.90
    }[q]||1;

    const scaled=Math.round(grayValue*percentBonus)+tierBonus;

    /* Absolutely guarantee strict rarity separation. */
    out[stat]=Math.max(grayValue+tier,scaled);
  });

  item.bonus=out;
  return item;
}

/* Rebuild gear offers using final tier stats. */
v027ShopItem=function(base){
  const q=v027ShopQuality();
  const item=v024Item(base,'shop',q);

  item.quality=q;
  item.rarity=qualityMeta(q).cls;
  item.dropLevel=Math.max(1,s.level||1);
  item.shopItem=true;
  item.baseId=base.id;

  v056ForceTierStats(item,base);

  const rarityPrice={
    gray:1.0,
    green:1.5,
    blue:2.5,
    purple:5.0
  }[q]||1;

  const statSum=Object.values(item.bonus||{}).reduce((a,b)=>a+(Number(b)||0),0);

  item.price=Math.max(
    30,
    Math.round((30+item.dropLevel*11+statSum*10)*rarityPrice)
  );

  return item;
};

/* Jewelry offers also pass through the exact same final stat separation. */
v030MakeJewelryOffer=function(){
  const allowed=v030Jewelry.filter(x=>!x.classId||x.classId===s.playerClass);
  const base=allowed[Math.floor(Math.random()*allowed.length)];
  return v027ShopItem(base);
};

/* Create a unique offer list.
   Same item may appear in different qualities, but never twice with same quality. */
function v056UniqueOffers(count, maker, maxTries=250){
  const result=[];
  const seen=new Set();
  let tries=0;

  while(result.length<count && tries<maxTries){
    tries++;
    const it=maker();
    if(!it)continue;

    const key=v056OfferKey(it);
    if(seen.has(key))continue;

    seen.add(key);
    result.push(it);
  }

  /* If random generation cannot fill all slots, deliberately vary quality
     rather than allowing an exact duplicate. */
  if(result.length<count){
    const qualities=['gray','green','blue','purple'];

    const bases = maker===v030MakeJewelryOffer
      ? v030Jewelry.filter(x=>!x.classId||x.classId===s.playerClass)
      : (classGear[s.playerClass||'grower']||classGear.grower);

    outer:
    for(const base of bases){
      for(const q of qualities){
        const key=`${base.id}|${q}`;
        if(seen.has(key))continue;

        const it=v024Item(base,'shop',q);
        it.quality=q;
        it.rarity=qualityMeta(q).cls;
        it.dropLevel=Math.max(1,s.level||1);
        it.shopItem=true;
        it.baseId=base.id;
        v056ForceTierStats(it,base);

        const rarityPrice={gray:1,green:1.5,blue:2.5,purple:5}[q]||1;
        const statSum=Object.values(it.bonus||{}).reduce((a,b)=>a+(Number(b)||0),0);
        it.price=Math.max(30,Math.round((30+it.dropLevel*11+statSum*10)*rarityPrice));

        seen.add(key);
        result.push(it);

        if(result.length>=count)break outer;
      }
    }
  }

  return result.slice(0,count);
}

/* Regenerate both shops with uniqueness rules. */
v030FillShops=function(force=false){
  if(force || !Array.isArray(s.weaponShop) || s.weaponShop.length!==9){
    s.weaponShop=v056UniqueOffers(9,()=>v030MakeGear(v030WeaponBase()));
  }

  if(force || !Array.isArray(s.magicShop) || s.magicShop.length!==9){
    const jewelry=v056UniqueOffers(3,()=>v030MakeJewelryOffer());

    const mats=[];
    const seenMat=new Set();
    let tries=0;

    while(mats.length<6 && tries<200){
      tries++;
      const it=v030MakeMaterial();
      if(!it)continue;
      const key=`${it.baseId||it.name}|${it.quality||'gray'}|${it.type||''}`;
      if(seenMat.has(key))continue;
      seenMat.add(key);
      mats.push(it);
    }

    s.magicShop=[...jewelry,...mats].slice(0,9);
  }

  localStorage.setItem(KEY,JSON.stringify(s));
};

/* Replacement after purchase must also avoid exact duplicate already visible. */
function v056FreshReplacement(currentShop, maker){
  const seen=new Set((currentShop||[]).filter(Boolean).map(v056OfferKey));

  for(let i=0;i<100;i++){
    const it=maker();
    if(!seen.has(v056OfferKey(it)))return it;
  }

  return maker();
}

window.v030BuyWeapon=function(i){
  const it=s.weaponShop?.[i];
  if(!it)return;

  if(s.gold<Number(it.price||0)){
    if(typeof v054NotEnoughGold==='function')v054NotEnoughGold();
    else v115Alert('Nicht genug Gold.');
    return;
  }

  s.gold-=Number(it.price||0);

  const bought={
    ...it,
    id:it.uid||`gear_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
  };
  s.inventory.push(bought);

  s.weaponShop[i]=null;
  s.weaponShop[i]=v056FreshReplacement(s.weaponShop,()=>v030MakeGear(v030WeaponBase()));

  localStorage.setItem(KEY,JSON.stringify(s));

  if(typeof v054Purchased==='function')v054Purchased(bought,'Inventar');

  render();
};

window.v030BuyMagic=function(i){
  const it=s.magicShop?.[i];
  if(!it)return;

  if(s.gold<Number(it.price||0)){
    if(typeof v054NotEnoughGold==='function')v054NotEnoughGold();
    else v115Alert('Nicht genug Gold.');
    return;
  }

  s.gold-=Number(it.price||0);

  if(it.type==='gem'||it.type==='scroll'){
    const bought={...it};
    s.materials??=[];
    s.materials.push(bought);

    s.magicShop[i]=null;
    s.magicShop[i]=v056FreshReplacement(
      s.magicShop,
      ()=>v030MakeMaterial()
    );

    localStorage.setItem(KEY,JSON.stringify(s));
    if(typeof v054Purchased==='function')v054Purchased(bought,'Material-Inventar');
    render();
    return;
  }

  const bought={
    ...it,
    id:it.uid||`jewel_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
  };
  s.inventory.push(bought);

  s.magicShop[i]=null;
  s.magicShop[i]=v056FreshReplacement(
    s.magicShop,
    ()=>v030MakeJewelryOffer()
  );

  localStorage.setItem(KEY,JSON.stringify(s));
  if(typeof v054Purchased==='function')v054Purchased(bought,'Inventar');
  render();
};

/* One-time force refresh so old equal-stat offers disappear immediately. */
if(!s.v056ShopFixed){
  s.weaponShop=[];
  s.magicShop=[];
  v030FillShops(true);
  s.v056ShopFixed=true;
  localStorage.setItem(KEY,JSON.stringify(s));
}

function v056AddShopHint(){
  const shop=document.querySelector('#shop');
  if(!shop || document.querySelector('#v056Hint'))return;

  const hint=document.createElement('div');
  hint.id='v056Hint';
  hint.className='tiny';
  hint.style.cssText='margin:0 2px 10px;padding:8px 10px;border-radius:10px;background:#0f1711;border:1px solid #304632';
  hint.innerHTML='⚖️ Gleicher Gegenstand: <b>Grün ist garantiert stärker als Grau, Blau stärker als Grün, Episch stärker als Blau.</b> Exakte Doppelangebote derselben Qualität werden verhindert.';
  shop.insertBefore(hint,shop.querySelector('.card'));
}

const v056BaseRender=render;
render=function(){
  v056BaseRender();
  
  v056AddShopHint();

  /* Rebind current shop cards after each render. */
  document.querySelectorAll('#weaponShopItems .shop-item').forEach((card,i)=>{
    const btn=card.querySelector('button');
    if(btn){
      btn.removeAttribute('onclick');
      btn.onclick=()=>window.v030BuyWeapon(i);
    }
  });

  document.querySelectorAll('#v030MagicShop .shop-grid .shop-item').forEach((card,i)=>{
    const btn=card.querySelector('button');
    if(btn){
      btn.removeAttribute('onclick');
      btn.onclick=()=>window.v030BuyMagic(i);
    }
  });
};

try{
  render();
}catch(e){
  console.error('V4.02 shop rarity/duplicates',e);
}
