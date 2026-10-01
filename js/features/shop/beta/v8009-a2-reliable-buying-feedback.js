/* ===== V4.02 reliable buying feedback ===== */

function v054Toast(message,type='success',sub=''){
  let toast=document.querySelector('#v054Toast');
  if(!toast){
    toast=document.createElement('div');
    toast.id='v054Toast';
    toast.className='v054-toast';
    document.body.appendChild(toast);
  }

  toast.className=`v054-toast ${type}`;
  toast.innerHTML=`${message}${sub?`<span class="sub">${sub}</span>`:''}`;

  clearTimeout(window.__v054ToastTimer);
  requestAnimationFrame(()=>toast.classList.add('show'));
  window.__v054ToastTimer=setTimeout(()=>toast.classList.remove('show'),2600);
}

function v054NotEnoughGold(){
  v054Toast('❌ Nicht genug Gold','error','Du kannst diesen Gegenstand noch nicht kaufen.');
}

function v054Purchased(item,destination='Inventar'){
  const name=item?.name||'Gegenstand';
  v054Toast(`✅ ${name} gekauft`,'success',`Der Gegenstand liegt jetzt im ${destination}.`);
}

/* Override all active purchase functions at the end of the file,
   so older versions cannot silently replace the feedback. */

window.v030BuyWeapon=function(i){
  const it=s.weaponShop?.[i];
  if(!it)return;

  if(s.gold<Number(it.price||0)){
    v054NotEnoughGold();
    return;
  }

  s.gold-=Number(it.price||0);
  const bought={
    ...it,
    id:it.uid||`gear_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
  };
  s.inventory.push(bought);

  if((typeof v030MakeGear==='function'&&typeof v030WeaponBase==='function')){
    s.weaponShop[i]=v030MakeGear(v030WeaponBase());
  }

  localStorage.setItem(KEY,JSON.stringify(s));
  v054Purchased(bought,'Inventar');
  render();
};

window.v030BuyMagic=function(i){
  const it=s.magicShop?.[i];
  if(!it)return;

  if(s.gold<Number(it.price||0)){
    v054NotEnoughGold();
    return;
  }

  s.gold-=Number(it.price||0);

  if(it.type==='gem'||it.type==='scroll'){
    const bought={...it};
    s.materials??=[];
    s.materials.push(bought);

    if(typeof v030MakeJewelryOffer==='function' && typeof v030MakeMaterial==='function'){
      s.magicShop[i]=i<3?v030MakeJewelryOffer():v030MakeMaterial();
    }

    localStorage.setItem(KEY,JSON.stringify(s));
    v054Purchased(bought,'Material-Inventar');
    render();
    return;
  }

  const bought={
    ...it,
    id:it.uid||`jewel_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
  };
  s.inventory.push(bought);

  if(typeof v030MakeJewelryOffer==='function' && typeof v030MakeMaterial==='function'){
    s.magicShop[i]=i<3?v030MakeJewelryOffer():v030MakeMaterial();
  }

  localStorage.setItem(KEY,JSON.stringify(s));
  v054Purchased(bought,'Inventar');
  render();
};

/* Legacy standard shop, if still used anywhere */
window.buy=function(id){
  let all=[];
  try{
    if(typeof items!=='undefined')all.push(...items);
    if(typeof allClassGear!=='undefined')all.push(...allClassGear);
    Object.values(classGear||{}).forEach(arr=>all.push(...arr));
  }catch(e){}

  const it=all.find(x=>x.id===id);
  if(!it)return;

  if(s.gold<Number(it.price||0)){
    v054NotEnoughGold();
    return;
  }

  s.gold-=Number(it.price||0);
  const bought={
    ...it,
    id:`${it.id}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
  };
  s.inventory.push(bought);

  localStorage.setItem(KEY,JSON.stringify(s));
  v054Purchased(bought,'Inventar');
  render();
};

/* Seed purchases also get the same feedback style */
if(typeof buySeedAction==='function'){
  window.buySeed=function(id){
    const x=seedTypes?.[id];
    if(!x)return;

    if(s.gold<Number(x.buy||0)){
      v054NotEnoughGold();
      return;
    }

    s.gold-=Number(x.buy||0);
    s.grow.seeds[id]=(s.grow.seeds[id]||0)+1;

    localStorage.setItem(KEY,JSON.stringify(s));
    v054Toast(`✅ ${x.name} gekauft`,'success',`Samen-Vorrat: ${s.grow.seeds[id]}`);
    if(typeof growMessage==='function')growMessage(`${x.name}: 1 Samen gekauft.`);
    render();
  };
}

/* After every render, re-bind shop buttons to the final purchase functions
   in case older renderers assigned stale handlers. */
function v054BindShopButtons(){
  document.querySelectorAll('#weaponShopItems .shop-item').forEach((card,i)=>{
    const btn=card.querySelector('button');
    if(btn){
      btn.onclick=()=>window.v030BuyWeapon(i);
      btn.removeAttribute('onclick');
    }
  });

  document.querySelectorAll('#v030MagicShop .shop-grid .shop-item').forEach((card,i)=>{
    const btn=card.querySelector('button');
    if(btn){
      btn.onclick=()=>window.v030BuyMagic(i);
      btn.removeAttribute('onclick');
    }
  });
}

const v054BaseRender=render;
render=function(){
  v054BaseRender();
  
  v054BindShopButtons();
};

try{
  render();
}catch(e){
  console.error('V4.02 inventory/shop',e);
}
