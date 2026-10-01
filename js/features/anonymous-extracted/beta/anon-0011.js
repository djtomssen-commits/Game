
/* ===== V4.02 SHOP SIZE: 6 + 6 ===== */

function v062FillShops(force=false){
  s.weaponShop??=[];
  s.magicShop??=[];

  /* Waffen & Rüstung: exakt 6 eindeutige Angebote */
  if(force || s.weaponShop.length!==6){
    s.weaponShop=v057Unique(6,v057WeaponOffer);
  }

  /* Schmuck / Edelsteine / Rollen: exakt 6 Angebote.
     Slot 1 ist immer ein Ring, Slot 2 immer ein Amulett, danach 4 Materialien. */
  const jewelryShapeOk=s.magicShop.length===6&&s.magicShop[0]?.slot==='ring'&&s.magicShop[1]?.slot==='amulet'&&s.magicShop.slice(2).every(it=>it&&(it.type==='gem'||it.type==='scroll'));
  if(force || !jewelryShapeOk){
    const ring=v057JewelryOffer('ring');
    const amulet=v057JewelryOffer('amulet');
    const jewelry=[ring,amulet];
    const materials=v057Unique(4,v057MaterialOffer,jewelry);
    s.magicShop=[ring,amulet,...materials].slice(0,6);
  }

  localStorage.setItem(KEY,JSON.stringify(s));
}

/* Make the clean V4.02 renderer use the new 6-slot stock. */
v057FillShops=v062FillShops;

/* One-time trim/regenerate old 9-slot stock. */
if(!s.v062ShopSixSlots || s.weaponShop?.length!==6 || s.magicShop?.length!==6){
  v062FillShops(true);
  s.v062ShopSixSlots=true;
  localStorage.setItem(KEY,JSON.stringify(s));
}

const v062BaseRender=render;
render=function(){
  /* Ensure no old version silently restores 9 slots. */
  if(s.weaponShop?.length!==6 || s.magicShop?.length!==6){
    v062FillShops(true);
  }

  v062BaseRender();
  
};

try{render();}catch(e){console.error('V4.02 shop size',e);}
