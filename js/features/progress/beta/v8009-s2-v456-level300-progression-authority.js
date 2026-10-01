(function(){
  const VERSION='V4.67 Stable', SHORT='V4.67', MAX_LEVEL=300;
  window.GROW_LEGENDS_MAX_LEVEL=MAX_LEVEL;

  function stamp(){}

  /* Canonical core addXp() is capped in-place at Level 300 so every historical
     XP modifier (events, Grow buff, guild bonus, level-up overlay) still runs through
     the same transaction and can never create Level 301. */
  function maxLevelUi(){
    const lvl=Math.max(1,Math.floor(Number(s?.level)||1));
    if(lvl<MAX_LEVEL)return;
    if(Number(s.xp)!==0)s.xp=0;
    const center=document.querySelector('#centerXpText');
    const fill=document.querySelector('#centerXpFill');
    const xp=document.querySelector('#xp');
    if(center)center.textContent='MAX LEVEL · 300';
    if(fill)fill.style.width='100%';
    if(xp)xp.textContent='MAX';
  }

  /* Merchant stock may normally roll +1 item level. At Level 300 that must not
     create Level-301 gear. Lower levels retain the exact existing -1/0/+1 roll. */
  try{
    if(typeof v135ShopLevel==='function'&&!window.__v456ShopLevelCap){
      const base=v135ShopLevel;
      v135ShopLevel=function(){return Math.min(MAX_LEVEL,Math.max(1,Math.floor(Number(base.apply(this,arguments))||1)))};
      try{window.v135ShopLevel=v135ShopLevel}catch(e){}
      window.__v456ShopLevelCap=true;
    }
  }catch(e){}

  function clampItemLevel(it){
    if(!it||typeof it!=='object'||!it.slot)return it;
    const raw=Math.floor(Number(it.dropLevel)||Number(s?.level)||1);
    if(raw>MAX_LEVEL){
      it.dropLevel=MAX_LEVEL;
      it.name=String(it.name||'Ausrüstung').replace(/\[Lv\.\d+\]/i,'[Lv.300]');
      try{if(typeof window.v447ApplyItemCurve==='function')window.v447ApplyItemCurve(it)}catch(e){}
    }
    return it;
  }
  window.v456ClampItemLevel=clampItemLevel;

  /* Defense in depth for all current item factories. */
  ['makeClassLoot','makeLoot','makeSetItem','v027ShopItem','v030MakeGear','v030MakeJewelry','v110MakeMysticItem','v110MakeRareMysticSet'].forEach(name=>{
    try{
      const fn=window[name];
      if(typeof fn!=='function'||fn.__v456LevelCap)return;
      const wrapped=function(){
        const out=fn.apply(this,arguments);
        if(out&&typeof out.then==='function')return out.then(x=>clampItemLevel(x));
        return clampItemLevel(out);
      };
      wrapped.__v456LevelCap=true;window[name]=wrapped;
      try{eval(name+'=window["'+name+'"]')}catch(e){}
    }catch(e){}
  });

  /* Current formulas were audited at 1/50/100/150/200/250/300:
     - V4.47 item curve is linear (+0.72 native total / level), so rarity catch-up
       distances stay constant all the way to 300.
     - V4.02 quest curve explicitly scales heavy quest duration to L300=30 min and
       bases XP on the current level-up requirement.
     - Existing 20-dungeon campaign keeps its established recommended endpoint ~210;
       211-300 is intentionally NOT produced by stretching old one-time dungeons. */
  window.v456ProgressionContract={
    maxLevel:MAX_LEVEL,
    maxItemLevel:MAX_LEVEL,
    itemLevelGain:0.72,
    rarityCatchup:{legendary:4,epic:6,rare:8,green:10,gray:12},
    dungeonCampaignRecommendedEnd:210,
    endgameReserved:[211,300]
  };

  if(typeof render==='function'&&!window.__v456RenderMaxPaint){
    const base=render;
    render=function(){const r=base.apply(this,arguments);maxLevelUi();stamp();return r};
    try{window.render=render}catch(e){}window.__v456RenderMaxPaint=true;
  }

  maxLevelUi();stamp();
  document.addEventListener('DOMContentLoaded',()=>{maxLevelUi();stamp()},{once:true});
  window.addEventListener('pageshow',()=>{maxLevelUi();stamp()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{maxLevelUi();stamp()},{passive:true});
})();
