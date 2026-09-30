
(function(){
  const VERSION='V4.67 Stable', SHORT='V4.67';
  function n(v){return Math.max(0,Math.floor(Number(v)||0))}
  function cap(){
    try{if(typeof v271DampfCap==='function')return Math.max(100,n(v271DampfCap()))}catch(e){}
    try{if(typeof v284DampfCap==='function')return Math.max(100,n(v284DampfCap()))}catch(e){}
    return 100;
  }
  function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}

  /* The visible game header changed several times historically. Paint every surviving
     Dampf target from the one canonical live value s.energy. */
  function paintDampf(){
    const c=cap(), d=Math.min(c,n(s?.energy));
    const plain=`${d.toLocaleString('de-DE')}/${c.toLocaleString('de-DE')}`;
    const icon=`💨 ${plain}`;
    setText(document.querySelector('#energy'),plain);
    setText(document.querySelector('#v358Dampf'),icon);
    setText(document.querySelector('#v366Dampf'),plain);
    setText(document.querySelector('#v371Dampf'),plain);
    setText(document.querySelector('#v372Dampf'),plain);
    document.querySelectorAll('.v358-res.dampf b').forEach(el=>setText(el,icon));
  }
  window.v443PaintDampf=paintDampf;

  function saveNow(){
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    try{if(typeof v075ScheduleSave==='function')v075ScheduleSave()}catch(e){}
  }
  function settle(){
    paintDampf();
    try{requestAnimationFrame(paintDampf)}catch(e){}
    setTimeout(paintDampf,20);
    setTimeout(paintDampf,90);
    setTimeout(paintDampf,280);
  }

  /* Direct post-start hook used by the canonical Quest start owner.
     It does not alter quest price/reward logic. */
  window.v443AfterQuestStart=(beforeEnergy,hadActive)=>{
    const before=n(beforeEnergy),after=n(s?.energy),hasActive=!!s?.quests?.active;
    if(!hadActive&&hasActive&&after!==before)saveNow();
    /* V8.009: the canonical start owner has already committed the new Dampf
       value before this hook runs. Paint it once; no delayed repaint train. */
    paintDampf();
  };

  /* Persistence remains a safety net for any future quest-start implementation that
     changes Dampf without going through the current startQuest wrapper. */
  if(typeof persist==='function'&&!window.__v443DampfPersistWrapped){
    const basePersist=persist;
    persist=function(){
      const r=basePersist.apply(this,arguments);
      settle();
      return r;
    };
    try{window.persist=persist}catch(e){}
    window.__v443DampfPersistWrapped=true;
  }

  function stamp(){}

  settle();stamp();
  document.addEventListener('DOMContentLoaded',()=>{settle();stamp()},{once:true});
  window.addEventListener('pageshow',()=>{settle();stamp()},{passive:true});
  /* V6.217: persist/pageshow hooks own Dampf repaint; finite retries cover startup. */
  [400,1200,5200,12000].forEach(ms=>setTimeout(()=>{paintDampf();stamp()},ms));
  setTimeout(()=>{settle();stamp()},1200);
  setTimeout(()=>{settle();stamp()},5200);
  setTimeout(()=>{settle();stamp()},12000);
})();
