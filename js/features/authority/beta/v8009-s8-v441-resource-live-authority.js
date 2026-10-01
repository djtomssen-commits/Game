(function(){
  const VERSION='V4.67 Stable', SHORT='V4.67';
  let painting=false;

  function n(v){return Math.max(0,Math.floor(Number(v)||0))}
  function cap(){
    try{if(typeof v271DampfCap==='function')return Math.max(100,n(v271DampfCap()))}catch(e){}
    try{if(typeof v284DampfCap==='function')return Math.max(100,n(v284DampfCap()))}catch(e){}
    return 100;
  }
  function setText(el,text){if(el && el.textContent!==text)el.textContent=text}

  /* One final painter for every resource amount that is actually visible in the
     current compact header, legacy fallback header, and V4.02/V4.06 shop cards. */
  function paint(){
    if(painting)return;
    painting=true;
    try{
      const h=n(s?.harzTaler), d=Math.min(cap(),n(s?.energy)), c=cap(), g=n(s?.gold);
      const hs=h.toLocaleString('de-DE'), ds=d.toLocaleString('de-DE'), cs=c.toLocaleString('de-DE'), gs=g.toLocaleString('de-DE');

      setText(document.querySelector('#v358Harz'),'💎 '+hs);
      setText(document.querySelector('#v358Dampf'),'💨 '+ds+'/'+cs);
      setText(document.querySelector('#v358Gold'),'🪙 '+gs);

      document.querySelectorAll('#topHarz,#harz,#shopHarz,[data-harz],.harz-value,.v282-harz-count')
        .forEach(el=>setText(el,hs));
      setText(document.querySelector('#energy'),`${ds}/${cs}`);
      setText(document.querySelector('#gold'),gs);
      setText(document.querySelector('#shopGold'),gs);

      /* Current V4.02 shop renderer has no id on the visible Harz number. */
      document.querySelectorAll('#v057GearShopCard .currency-pill b,#shop .currency-row .currency-pill b')
        .forEach(el=>setText(el,hs));

      document.querySelectorAll('.v358-res.harz b').forEach(el=>setText(el,'💎 '+hs));
      document.querySelectorAll('.v358-res.dampf b').forEach(el=>setText(el,'💨 '+ds+'/'+cs));
    }finally{painting=false}
  }
  window.v441PaintResources=paint;

  function saveNow(){
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    try{if(typeof v075ScheduleSave==='function')v075ScheduleSave()}catch(e){}
  }
  function settle(){
    paint();
    try{requestAnimationFrame(paint)}catch(e){}
    setTimeout(paint,20);
    setTimeout(paint,90);
    setTimeout(paint,280);
  }

  /* Final dungeon-attempt wrapper. Never changes the proven pricing/confirmation
     logic; it only makes the already-mutated value visible and durable immediately. */
  if(typeof consumeDungeonAttempt==='function'&&!window.__v441DungeonAttemptWrapped){
    const baseAttempt=consumeDungeonAttempt;
    consumeDungeonAttempt=async function(){
      const before=n(s?.harzTaler);
      const ok=await baseAttempt.apply(this,arguments);
      const after=n(s?.harzTaler);
      if(ok && after!==before)saveNow();
      settle();
      return ok;
    };
    try{window.consumeDungeonAttempt=consumeDungeonAttempt}catch(e){}
    window.__v441DungeonAttemptWrapped=true;
  }

  function shopError(){
    try{
      if(typeof v054Toast==='function')return v054Toast('❌ Du brauchst 1 Harz-Taler','error');
      if(typeof v063Toast==='function')return v063Toast('Zu wenig Harz-Taler','warn','Zum Neu-Würfeln brauchst du 1 Harz-Taler.');
      if(typeof v115Alert==='function')return v115Alert('Du brauchst 1 Harz-Taler.');
    }catch(e){}
  }
  function shopSuccess(){
    try{
      if(typeof v054Toast==='function')return v054Toast('🔄 Händler neu gewürfelt','success','Alle Angebote wurden ersetzt.');
      if(typeof v063Toast==='function')return v063Toast('Händler neu gewürfelt','success','1 Harz-Taler verwendet.');
    }catch(e){}
  }

  /* Current shop authority. Avoid the full historical render() chain here: that
     chain can repaint resources with stale markup. Rebuild only the shop itself. */
  function rerollShops(){
    if(n(s?.harzTaler)<1){shopError();settle();return}
    s.harzTaler=n(s.harzTaler)-1;
    try{
      if(typeof v057FillShops==='function')v057FillShops(true);
      else if(typeof v030FillShops==='function')v030FillShops(true);
      else if(typeof v030Fill==='function')v030Fill(true);
    }catch(e){console.error('V4.41 shop reroll fill',e)}
    saveNow();
    try{if(typeof renderShop==='function')renderShop()}catch(e){console.error('V4.41 shop reroll render',e)}
    settle();
    shopSuccess();
  }
  window.v441RerollShops=rerollShops;

  function bindShop(){
    ['#v057Reroll','#v030RefreshAll','#v030Refresh','#refreshShop'].forEach(sel=>{
      const btn=document.querySelector(sel);
      if(!btn)return;
      btn.onclick=rerollShops;
      btn.dataset.v441ResourceOwner='1';
    });
  }

  if(typeof renderShop==='function'&&!window.__v441RenderShopWrapped){
    const baseShop=renderShop;
    renderShop=function(){
      const r=baseShop.apply(this,arguments);
      bindShop();
      settle();
      return r;
    };
    try{window.renderShop=renderShop}catch(e){}
    window.__v441RenderShopWrapped=true;
  }

  /* Last persistence owner: later systems may save after a spend. Always repaint
     from live state after the whole existing persistence chain has finished. */
  if(typeof persist==='function'&&!window.__v441PersistWrapped){
    const basePersist=persist;
    persist=function(){
      const r=basePersist.apply(this,arguments);
      settle();
      return r;
    };
    try{window.persist=persist}catch(e){}
    window.__v441PersistWrapped=true;
  }

  if(typeof render==='function'&&!window.__v441RenderWrapped){
    const baseRender=render;
    render=function(){
      const r=baseRender.apply(this,arguments);
      bindShop();
      settle();
      return r;
    };
    try{window.render=render}catch(e){}
    window.__v441RenderWrapped=true;
  }

  /* If an old delayed UI painter writes an obsolete value, correct only the two
     resource areas. This observes DOM text, never game state. */
  function observe(root){
    if(!root||root.dataset?.v441Observed==='1')return;
    try{root.dataset.v441Observed='1'}catch(e){}
    const mo=new MutationObserver(()=>{if(!painting)queueMicrotask(()=>{paint();bindShop()})});
    mo.observe(root,{subtree:true,childList:true,characterData:true});
  }
  observe(document.querySelector('.app > header'));
  observe(document.querySelector('#shop'));

  function stamp(){}

  bindShop();settle();stamp();
  document.addEventListener('DOMContentLoaded',()=>{bindShop();observe(document.querySelector('.app > header'));observe(document.querySelector('#shop'));settle();stamp()},{once:true});
  window.addEventListener('pageshow',()=>{bindShop();settle();stamp()},{passive:true}); /* V4.123: removed useless late clear of already-fired one-shot timeout. */
  window.addEventListener('growlegends:account-ready',()=>{bindShop();settle();stamp()},{passive:true});
})();
