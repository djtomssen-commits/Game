
/* ===== V4.02 SHOP SIZE: 6 + 6 ===== */

function v062FillShops(force=false){
  /* V8.102 RETIRED:
     This historical 6+6 generator must never mutate the live merchant stock.
     Shop offers are server-authoritative through v7063/v7097. During account
     hydration this old function used to see empty/non-legacy-shaped arrays,
     generate local fantasy offers, and a moment later v7063 replaced them
     again with server offers -> visible shop jump. */
  s.weaponShop??=[];
  s.magicShop??=[];
  return false;
}

/* Make the clean V4.02 renderer use the new 6-slot stock. */
v057FillShops=v062FillShops;

/* V8.102: historical one-time stock regeneration retired. */
if(!s.v062ShopSixSlots){
  s.v062ShopSixSlots=true;
}

const v062BaseRender=render;
render=function(){
  /* V8.102: global render is no longer allowed to mutate shop stock. */
  return v062BaseRender();
};

try{render();}catch(e){console.error('V4.02 shop size',e);}
