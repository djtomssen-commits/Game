(function(){
  /* V4.02: minimal event-Dampf safety.
     The canonical V4.02/V4.02 functions remain the only UI/reset owners. */
  function v345Today(){
    try{
      if(typeof v271DayKey==='function')return v271DayKey();
    }catch(e){}
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function v345QuestDampfSpentToday(){
    const daily=s?.v109HarzDaily;
    if(!daily)return 0;
    if(String(daily.day||'')!==String(v345Today()))return 0;
    return Math.max(0,Number(daily.questEnergy)||0);
  }

  function v345RepairFreshEventDampf(){
    try{
      if(typeof v271DampfEventActive!=='function' || !v271DampfEventActive())return false;

      /* Only repair the known stale-reset case:
         event active + exactly 100 Dampf + no quest Dampf spent today; repair to the 200 event grant.
         Never refill a player who already used Dampf. */
      if(Number(s.energy)===100 && v345QuestDampfSpentToday()===0){
        s.energy=200;
        try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
        return true;
      }
    }catch(e){}
    return false;
  }

  /* Wrap only the final Dampf painter. No render wrapper, no persist wrapper,
     no DOM observer, no timer loop. This cannot recursively rebuild the page. */
  if(typeof v271PaintDampf==='function'){
    const v345BasePaintDampf=v271PaintDampf;
    v271PaintDampf=function(){
      v345RepairFreshEventDampf();
      return v345BasePaintDampf.apply(this,arguments);
    };
    if(typeof v026PaintDampf!=='undefined')v026PaintDampf=v271PaintDampf;
  }

  function v345Run(){
    v345RepairFreshEventDampf();
    try{v271PaintDampf?.()}catch(e){}
  }

  setTimeout(v345Run,350);
  setTimeout(v345Run,1400);
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)setTimeout(v345Run,100);
  });
})();
