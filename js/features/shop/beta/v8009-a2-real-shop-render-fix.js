/* ===== V4.02 REAL SHOP/RENDER FIX =====
   Root cause: legacy render() requires #shopGold to exist and crashes if
   the newer shop renderer removed it.
*/

function v058EnsureLegacyRenderAnchors(){
  /* Keep legacy renderer anchors only while no real shop element exists.
     Once the current shop renderer owns the ID, remove the hidden fallback so
     every DOM id stays unique. */
  let box=document.querySelector('#v058CompatAnchors');
  if(!box){
    box=document.createElement('div');
    box.id='v058CompatAnchors';
    box.style.display='none';
    document.body.appendChild(box);
  }

  const required=['shopGold','shopHarz'];
  required.forEach(id=>{
    const matches=[...document.querySelectorAll(`[id="${id}"]`)];
    const real=matches.find(el=>!box.contains(el));
    const compat=matches.filter(el=>box.contains(el));
    if(real){
      compat.forEach(el=>el.remove());
      return;
    }
    compat.slice(1).forEach(el=>el.remove());
    if(!compat.length){
      const el=document.createElement('span');
      el.id=id;
      box.appendChild(el);
    }
  });
}

function v058SafeRefreshAfterPurchase(){
  /* Update the areas that matter for the purchase first. */
  try{renderShop();}catch(e){console.error('Shop refresh',e);}
  try{renderInventory();}catch(e){console.error('Inventory refresh',e);}
  try{v030Materials();}catch(e){console.error('Material refresh',e);}

  /* Update visible gold/Harz values without depending on global render. */
  document.querySelectorAll('#gold,#shopGold').forEach(el=>el.textContent=s.gold);
  document.querySelectorAll('#shopHarz').forEach(el=>el.textContent=s.harzTaler);

  /* Re-apply graphical shop upgrades. */
  try{v41UpgradeShopIcons();}catch(e){}
  try{v41UpgradeInventoryIcons();}catch(e){}
}

/* Final clean weapon purchase. No global render dependency. */
window.v030BuyWeapon=function(i){
  const it=s.weaponShop?.[i];
  if(!it)return;

  const price=Number(it.price)||0;
  if(s.gold<price){
    if(typeof v054NotEnoughGold==='function')v054NotEnoughGold();
    else v115Alert('Nicht genug Gold.');
    return;
  }

  s.gold-=price;

  const bought={
    ...it,
    id:it.uid || `${it.baseId||it.id||'gear'}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
  };

  s.inventory??=[];
  s.inventory.push(bought);

  /* Replace only bought slot */
  s.weaponShop[i]=v057Replacement(s.weaponShop,i,v057WeaponOffer);

  localStorage.setItem(KEY,JSON.stringify(s));

  /* Message BEFORE any rendering work */
  if(typeof v054Purchased==='function'){
    v054Purchased(bought,'Inventar');
  }else{
    v115Alert(`${bought.name} gekauft und im Inventar abgelegt.`);
  }

  v058EnsureLegacyRenderAnchors();
  v058SafeRefreshAfterPurchase();
};

/* Final clean jewelry/material purchase. */
window.v030BuyMagic=function(i){
  const it=s.magicShop?.[i];
  if(!it)return;

  const price=Number(it.price)||0;
  if(s.gold<price){
    if(typeof v054NotEnoughGold==='function')v054NotEnoughGold();
    else v115Alert('Nicht genug Gold.');
    return;
  }

  s.gold-=price;

  if(it.type==='gem' || it.type==='scroll'){
    const bought={...it};

    s.materials??=[];
    s.materials.push(bought);

    /* Keep material slots as materials after purchase */
    s.magicShop[i]=v057Replacement(s.magicShop,i,v057MaterialOffer);

    localStorage.setItem(KEY,JSON.stringify(s));

    if(typeof v054Purchased==='function'){
      v054Purchased(bought,'Edelstein- & Rollen-Inventar');
    }else{
      v115Alert(`${bought.name} gekauft.`);
    }

    v058EnsureLegacyRenderAnchors();
    v058SafeRefreshAfterPurchase();
    return;
  }

  const bought={
    ...it,
    id:it.uid || `${it.baseId||it.id||'jewel'}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
  };

  s.inventory??=[];
  s.inventory.push(bought);

  s.magicShop[i]=v057Replacement(s.magicShop,i,v057JewelryOffer);

  localStorage.setItem(KEY,JSON.stringify(s));

  if(typeof v054Purchased==='function'){
    v054Purchased(bought,'Inventar');
  }else{
    v115Alert(`${bought.name} gekauft und im Inventar abgelegt.`);
  }

  v058EnsureLegacyRenderAnchors();
  v058SafeRefreshAfterPurchase();
};

/* Keep compatibility anchors before EVERY future global render. */
const v058BaseRender=render;
render=function(){
  v058EnsureLegacyRenderAnchors();

  try{
    v058BaseRender();
  }catch(e){
    console.error('Global render abgefangen:',e);
    /* Even if another old renderer fails, keep critical screens usable. */
    v058SafeRefreshAfterPurchase();
  }

  
  v058EnsureLegacyRenderAnchors();
};

/* Explicitly make the materials panel visible in the character screen. */
function v058EnsureMaterialsPanel(){
  try{v030Materials();}catch(e){console.error('v030Materials',e);}
}

/* Rebind buttons after shop DOM replacement. */
function v058BindShopPurchases(){
  document.querySelectorAll('#v057WeaponGrid .v057-buy').forEach((btn,i)=>{
    btn.removeAttribute('onclick');
    btn.onclick=()=>window.v030BuyWeapon(i);
  });

  document.querySelectorAll('#v057MagicGrid .v057-buy').forEach((btn,i)=>{
    btn.removeAttribute('onclick');
    btn.onclick=()=>window.v030BuyMagic(i);
  });
}

/* Wrap the final shop renderer so handlers are never stale. */
const v058BaseRenderShop=renderShop;
renderShop=function(){
  v058BaseRenderShop();
  v058BindShopPurchases();
};

try{
  v058EnsureLegacyRenderAnchors();
  v058EnsureMaterialsPanel();
  render();
}catch(e){
  console.error('V4.02 init',e);
}
