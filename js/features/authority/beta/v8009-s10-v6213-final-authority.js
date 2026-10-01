(()=>{
 'use strict';
 if(window.__V6213_FINAL_AUTHORITY__)return;
 window.__V6213_FINAL_AUTHORITY__=true;
 const fmt=n=>Math.max(0,Math.floor(Number(n)||0)).toLocaleString('de-DE');

 /* SHOP/TOPBAR: one currency painter for legacy + current HUDs. */
 function syncCurrencies(){
  const gold=Number(s?.gold)||0,harz=Number(s?.harzTaler)||0,energy=Number(s?.energy)||0;
  document.querySelectorAll('#gold,#shopGold,#v366Gold,#v372Gold').forEach(el=>{const v=fmt(gold);if(el.textContent!==v)el.textContent=v});
  document.querySelectorAll('#shopHarz,#v366Harz,#v372Harz').forEach(el=>{const v=fmt(harz);if(el.textContent!==v)el.textContent=v});
  document.querySelectorAll('#v366Dampf,#v372Dampf').forEach(el=>{
   const cap=(()=>{try{return typeof v366EnergyCap==='function'?Number(v366EnergyCap())||100:typeof energyCap==='function'?Number(energyCap())||100:100}catch(_){return 100}})();
   const v=`${fmt(energy)}/${fmt(cap)}`;if(el.textContent!==v)el.textContent=v;
  });
 }
 window.v6213SyncCurrencies=syncCurrencies;
 const wrapPurchase=name=>{
  try{
   const fn=window[name];if(typeof fn!=='function'||fn.__v6213CurrencySync)return;
   const wrapped=function(){
    const r=fn.apply(this,arguments);syncCurrencies();
    if(r&&typeof r.then==='function')return r.finally(()=>syncCurrencies());
    queueMicrotask(syncCurrencies);requestAnimationFrame(syncCurrencies);return r;
   };
   wrapped.__v6213CurrencySync=true;wrapped.__v6213Base=fn;window[name]=wrapped;
   try{if(typeof globalThis[name]!=='undefined')globalThis[name]=wrapped}catch(_){}
  }catch(_){}
 };
 ['v030BuyWeapon','v030BuyMagic','buy','buySeed','buySeedAction','upgradeGrowAction','upgradeRoomAction'].forEach(wrapPurchase);
 document.addEventListener('click',e=>{
  if(!e.target?.closest?.('#shop button,#grow button,.v057-buy,.shop-item button'))return;
  queueMicrotask(syncCurrencies);requestAnimationFrame(syncCurrencies);
 },true);

 /* WEATHER: remove current effect layer. Weather state/cards/bonuses remain untouched. */
 function removeWeatherVisuals(){
  document.getElementById('glWeatherLayer')?.remove();
  document.body?.style.removeProperty('--glw-opacity');
 }
 window.GL_WEATHER_VISUAL_EFFECTS=false;
 removeWeatherVisuals();
 document.addEventListener('DOMContentLoaded',removeWeatherVisuals,{once:true});
 window.addEventListener('pageshow',removeWeatherVisuals,{passive:true});
 window.addEventListener('growlegends:account-ready',removeWeatherVisuals);

 /* PHASE 2: retire old production-only remnants. */
 try{document.getElementById('v259BossArena')?.remove();document.getElementById('v258BossTestCard')?.remove();document.getElementById('v258BossTestResult')?.remove()}catch(_){}
 try{window.v259AnimateBossResult=async()=>false}catch(_){}
 try{
  const d=document.getElementById('dungeon');d?.__v441PreviewObserver?.disconnect?.();d?.__v443D9LaunchObserver?.disconnect?.();
  document.querySelectorAll('.v441-preview-launch,.v435-preview-launch,[data-v435-preview],[data-v441-preview]').forEach(x=>x.remove());
 }catch(_){}
 ['v435OpenDungeon8Preview','v441OpenDungeon9Preview','v453OpenDungeonPreview'].forEach(name=>{try{if(typeof window[name]==='function')window[name]=()=>false}catch(_){}});

 /* Keep current visual owners last after account restore/navigation. */
 function settle(){syncCurrencies();removeWeatherVisuals();try{window.v6210DungeonSinglePlayerArtClean?.()}catch(_){}}
 window.addEventListener('growlegends:account-ready',settle,{passive:true});
 window.addEventListener('pageshow',settle,{passive:true});
 settle();
 window.__V6213_QA__=()=>({gold:Number(s?.gold)||0,topGold:document.getElementById('v372Gold')?.textContent||document.getElementById('v366Gold')?.textContent||'',weatherLayer:!!document.getElementById('glWeatherLayer'),oldBossArena:!!document.getElementById('v259BossArena')});
})();
