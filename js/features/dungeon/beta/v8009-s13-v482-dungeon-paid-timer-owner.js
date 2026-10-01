(function(){
  const VERSION='V4.82',SHORT='V4.82',HOUR=3600000;
  let paidAnchor=null;

  function stamp(){}
  function shape(){
    s.dungeonPass=(s.dungeonPass&&typeof s.dungeonPass==='object')?s.dungeonPass:{lastFree:0};
    s.dungeonPass.lastFree=Math.max(0,Number(s.dungeonPass.lastFree)||0);
  }
  function isFree(ts){return Date.now()-Math.max(0,Number(ts)||0)>=HOUR}
  function saveLocal(){
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    try{if(typeof v075ScheduleSave==='function')v075ScheduleSave()}catch(e){}
  }
  function paint(){
    try{if(typeof v324Paint==='function')v324Paint()}catch(e){}
    try{if(typeof renderDungeon==='function'&&document.querySelector('#dungeon')?.classList.contains('active'))renderDungeon()}catch(e){}
    try{if(typeof v441PaintResources==='function')v441PaintResources()}catch(e){}
    stamp();
  }

  if(typeof consumeDungeonAttempt==='function'&&!window.__v482DungeonAttemptWrapped){
    const baseAttempt=consumeDungeonAttempt;
    consumeDungeonAttempt=async function(){
      shape();
      const before=Number(s.dungeonPass.lastFree)||0;
      const freeBefore=isFree(before);
      const beforeHarz=Math.max(0,Number(s.harzTaler)||0);

      /* A genuine free attempt is the ONLY path allowed to move the free-timer anchor. */
      if(freeBefore)paidAnchor=null;

      const ok=await baseAttempt.apply(this,arguments);
      if(!ok){paint();return false}

      if(!freeBefore){
        /* Harz attempt: preserve the exact countdown that was already running. */
        paidAnchor=before;
        s.dungeonPass.lastFree=before;
        saveLocal();
        try{requestAnimationFrame(()=>{shape();if(paidAnchor!==null)s.dungeonPass.lastFree=paidAnchor;paint()})}catch(e){}
        setTimeout(()=>{
          if(paidAnchor===null)return;
          shape();
          if((Number(s.dungeonPass.lastFree)||0)!==paidAnchor){s.dungeonPass.lastFree=paidAnchor;saveLocal()}
          paint();
        },80);
      }else{
        /* Free attempt: base owner starts a fresh one-hour cooldown normally. */
        paidAnchor=null;
        saveLocal();
        paint();
      }

      /* Sanity: paid path must actually have charged Harz somewhere in the base chain. */
      if(!freeBefore&&Math.max(0,Number(s.harzTaler)||0)>=beforeHarz){
        try{console.warn('V4.82 paid dungeon attempt returned success without visible Harz deduction')}catch(e){}
      }
      return true;
    };
    try{window.consumeDungeonAttempt=consumeDungeonAttempt}catch(e){}
    window.__v482DungeonAttemptWrapped=true;
  }

  /* Some historical reward/render paths call persist() after combat. While the
     current attempt was paid, never let those paths replace the original timer anchor. */
  if(typeof persist==='function'&&!window.__v482PersistWrapped){
    const basePersist=persist;
    persist=function(){
      shape();
      if(paidAnchor!==null)s.dungeonPass.lastFree=paidAnchor;
      return basePersist.apply(this,arguments);
    };
    try{window.persist=persist}catch(e){}
    window.__v482PersistWrapped=true;
  }

  /* Once the preserved timer has naturally expired, no lock is needed anymore. */
  function releaseExpired(){
    if(paidAnchor!==null&&isFree(paidAnchor))paidAnchor=null;
  }
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){releaseExpired();paint()}},{passive:true});
  window.addEventListener('pageshow',()=>{releaseExpired();paint()},{passive:true});
  document.addEventListener('DOMContentLoaded',()=>{releaseExpired();paint()},{once:true});
  stamp();
})();
