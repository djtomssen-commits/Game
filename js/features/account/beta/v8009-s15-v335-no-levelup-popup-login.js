(function(){
  const V335_VERSION='V4.29 Stable';
  const V335_LOGIN_GRACE_MS=8000;
  const v335BootAt=Date.now();
  const v335InitialLevel=Math.max(1,Number(s?.level)||1);

  function v335InLoginGrace(){
    return (Date.now()-v335BootAt)<V335_LOGIN_GRACE_MS;
  }

  function v335LooksLikeLevelUp(text){
    return /level[\s-]*up|stufe\s+\d+.*erreicht|neue\s+stufe/i.test(String(text||''));
  }

  /* Returning-login hydration can replay old Level-Up UI. During the short
     boot/auth window suppress presentation only; real gameplay state/level
     remains untouched. */
  ['v063Toast','toast'].forEach(name=>{
    const old=window[name];
    if(typeof old!=='function')return;
    window[name]=function(msg){
      if(v335InLoginGrace() && v335LooksLikeLevelUp(msg))return;
      return old.apply(this,arguments);
    };
  });

  /* Catch legacy modal/notification functions if present. */
  [
    'showLevelUp','showLevelUpPopup','openLevelUpPopup','levelUpPopup',
    'v125ShowLevelUp','v141ShowLevelUp'
  ].forEach(name=>{
    const old=window[name];
    if(typeof old!=='function')return;
    window[name]=function(){
      if(v335InLoginGrace())return;
      return old.apply(this,arguments);
    };
  });

  /* Remove a legacy Level-Up dialog that was already inserted by an earlier
     boot script. Only during login grace and only when its text is Level-Up. */
  const v335Observer=new MutationObserver(()=>{
    if(!v335InLoginGrace()){
      v335Observer.disconnect();
      return;
    }
    document.querySelectorAll('[role="dialog"],.modal,.popup,.overlay').forEach(el=>{
      if(v335LooksLikeLevelUp(el.textContent||'')){
        const levelNow=Math.max(1,Number(s?.level)||1);
        /* At login, unchanged/restored level is not a new level-up event. */
        if(levelNow===v335InitialLevel || Date.now()-v335BootAt<2500){
          const close=el.querySelector('[data-close],.close,.modal-close,.popup-close');
          if(close)close.click();
          else el.remove();
        }
      }
    });
  });
  try{
    v335Observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>v335Observer.disconnect(),V335_LOGIN_GRACE_MS+500);
  }catch(e){}

  function v335ApplyVersion(){
    document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version]').forEach(el=>{
      if(el)el.textContent=V335_VERSION;
    });
  }
  v335ApplyVersion();
  setTimeout(v335ApplyVersion,600);
  setTimeout(v335ApplyVersion,2000);
})();
