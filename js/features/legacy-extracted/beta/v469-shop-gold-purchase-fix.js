
(function(){
  const VERSION='V4.69 Stable',SHORT='V4.69';
  /* V4.66 had a precedence bug in its central purchase guard:
     Number(s.gold)||0<price was truthy whenever Gold was non-zero.
     The authoritative handler above now compares (Number(s.gold)||0) < price. */
  window.v469ShopGoldCheck=function(price){
    const gold=Math.max(0,Number(s?.gold)||0),cost=Math.max(0,Number(price)||0);
    return {gold,cost,enough:gold>=cost};
  };
  function stamp(){}
  function paint(){try{window.v441PaintResources?.()}catch(e){}}
  stamp();paint();
  document.addEventListener('DOMContentLoaded',()=>{stamp();paint()},{once:true});
  window.addEventListener('pageshow',()=>{stamp();paint()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{stamp();paint()},{passive:true});
})();
