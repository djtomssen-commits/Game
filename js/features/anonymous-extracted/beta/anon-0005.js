
/* ===== V4.02 shop reroll + game UI behavior ===== */

function v038Toast(msg,type='success'){
  if(typeof v037Toast==='function')return v037Toast(msg,type);
  v115Alert(msg);
}

/* True reroll: regenerate every visible slot with fresh randomized offers. */
function v038RerollAllShops(){
  if((s.harzTaler||0)<1){
    v038Toast('❌ Du brauchst 1 Harz-Taler zum Neu-Würfeln.','error');
    return;
  }

  s.harzTaler--;

  /* Force different random seed markers so offers are rebuilt instead of reusing state. */
  s.shopRefreshes=(s.shopRefreshes||0)+1;
  s.weaponShop=[];
  s.magicShop=[];

  if(typeof v030FillShops==='function'){
    v030FillShops(true);
  }else{
    if(typeof refreshShop==='function')refreshShop(true);
  }

  localStorage.setItem(KEY,JSON.stringify(s));
  v038Toast('🔄 Händler neu gewürfelt – neue Angebote sind da.','success');
  render();
}

/* Make reroll button always call the fixed function. */
function v038BindReroll(){
  const btn=document.querySelector('#v030RefreshAll') || document.querySelector('#refreshShop');
  if(btn){
    btn.onclick=v038RerollAllShops;
    btn.textContent='🔄 Beide Händler neu würfeln – 1 🟢 Harz-Taler';
  }
}

/* Extra safety: if a shop item is bought, its slot must visibly change immediately. */
const v038OldBuyWeapon = window.v030BuyWeapon;
if(typeof v038OldBuyWeapon==='function'){
  window.v030BuyWeapon=function(i){
    const before=s.weaponShop?.[i]?.uid || s.weaponShop?.[i]?.id || '';
    v038OldBuyWeapon(i);
    if(s.weaponShop?.[i]){
      const after=s.weaponShop[i]?.uid || s.weaponShop[i]?.id || '';
      if(before===after && (typeof v030MakeGear==='function'&&typeof v030WeaponBase==='function')){
        s.weaponShop[i]=v030MakeGear(v030WeaponBase());
        localStorage.setItem(KEY,JSON.stringify(s));
        render();
      }
    }
  };
}

const v038OldBuyMagic = window.v030BuyMagic;
if(typeof v038OldBuyMagic==='function'){
  window.v030BuyMagic=function(i){
    const before=s.magicShop?.[i]?.uid || s.magicShop?.[i]?.id || '';
    v038OldBuyMagic(i);
    if(s.magicShop?.[i]){
      const after=s.magicShop[i]?.uid || s.magicShop[i]?.id || '';
      if(before===after){
        s.magicShop[i]=(i<2 && typeof v030MakeJewelryOffer==='function')
          ? v030MakeJewelryOffer()
          : (typeof v030MakeMaterial==='function'?v030MakeMaterial():s.magicShop[i]);
        localStorage.setItem(KEY,JSON.stringify(s));
        render();
      }
    }
  };
}

/* V6.320: old location-label painter retired. Reroll binding is now scoped to shop renders. */
if(typeof renderShop==='function'&&!window.__v6320V038ShopWrapped){
  const v6320BaseShop=renderShop;
  renderShop=function(){
    const r=v6320BaseShop.apply(this,arguments);
    requestAnimationFrame(v038BindReroll);
    return r;
  };
  try{window.renderShop=renderShop}catch(e){}
  window.__v6320V038ShopWrapped=true;
}
try{v038BindReroll()}catch(e){console.error('V6.320 shop reroll bind',e)}
