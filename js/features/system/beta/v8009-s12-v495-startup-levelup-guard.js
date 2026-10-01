(function(){
  'use strict';
  if(window.__v495StartupLevelGuardInstalled)return;
  window.__v495StartupLevelGuardInstalled=true;

  let syncing=true;
  let settleTimer=0;
  const root=document.documentElement;

  function isLevelUpText(value){
    return /level[\s-]*up|stufe\s+\d+.*erreicht|neue\s+stufe/i.test(String(value||''));
  }

  function removeLegacyLevelUi(){
    try{
      document.querySelectorAll('.v101-levelup,.v102-levelup-overlay,#v420LevelUpOverlay').forEach(el=>el.remove());
    }catch(e){}
  }

  function syncLevelObservers(){
    const level=Math.max(1,Number(window.s?.level ?? (typeof s!=='undefined'?s?.level:1))||1);
    try{
      if(typeof v102PendingLevelups!=='undefined')v102PendingLevelups.length=0;
      if(typeof v102LevelPopupBusy!=='undefined')v102LevelPopupBusy=false;
      if(typeof v102ObservedLevel!=='undefined')v102ObservedLevel=level;
    }catch(e){}
  }

  function beginSync(){
    syncing=true;
    clearTimeout(settleTimer);
    root.classList.add('v495-level-syncing');
    removeLegacyLevelUi();
    syncLevelObservers();
  }

  function finishSync(){
    clearTimeout(settleTimer);
    settleTimer=setTimeout(()=>{
      removeLegacyLevelUi();
      syncLevelObservers();
      syncing=false;
      root.classList.remove('v495-level-syncing');
    },650);
  }

  beginSync();

  /* Suppress only presentation while a saved account is being restored. */
  try{
    const baseToast=typeof v063Toast==='function'?v063Toast:null;
    if(baseToast && !baseToast.__v495StartupGuard){
      const wrapped=function(){
        if(syncing && Array.from(arguments).some(isLevelUpText))return;
        return baseToast.apply(this,arguments);
      };
      wrapped.__v495StartupGuard=true;
      v063Toast=wrapped;
      try{window.v063Toast=wrapped}catch(e){}
    }
  }catch(e){}

  try{
    const baseToast=typeof window.toast==='function'?window.toast:null;
    if(baseToast && !baseToast.__v495StartupGuard){
      const wrapped=function(){
        if(syncing && Array.from(arguments).some(isLevelUpText))return;
        return baseToast.apply(this,arguments);
      };
      wrapped.__v495StartupGuard=true;
      window.toast=wrapped;
      try{if(typeof toast!=='undefined')toast=wrapped}catch(e){}
    }
  }catch(e){}

  /* If a legacy handler still inserts an overlay during hydration, remove it
     before it can become visible. Genuine later gameplay Level-Ups are untouched. */
  let v6101LevelObserver=null;
 function v6101StartLevelObserver(){
  try{
   if(v6101LevelObserver)return;
   v6101LevelObserver=new MutationObserver(()=>{if(syncing){removeLegacyLevelUi();syncLevelObservers()}});
   v6101LevelObserver.observe(document.documentElement,{childList:true,subtree:true});
  }catch(e){}
 }
 function v6101StopLevelObserver(){try{v6101LevelObserver?.disconnect()}catch(e){}v6101LevelObserver=null}
 v6101StartLevelObserver();

  window.addEventListener('growlegends:account-ready',finishSync);
  window.addEventListener('growlegends:extras-ready',()=>{if(syncing)finishSync()});

  /* Cover refreshes where the deterministic boot controller had already emitted
     account-ready before this final guard was installed. */
  try{
    if(Number(window.__V4147_BOOT__?.accountReadyAt||0)>0)finishSync();
  }catch(e){}

  /* Account switching/login can start another hydration cycle. */
  try{
    if(typeof v200FinalizeUser==='function' && !window.__v495FinalizeLevelGuard){
      const baseFinalize=v200FinalizeUser;
      const wrappedFinalize=async function(){
        beginSync();
        try{return await baseFinalize.apply(this,arguments)}
        finally{
          try{
            if(Number(window.__V4147_BOOT__?.accountReadyAt||0)>0)finishSync();
          }catch(e){}
        }
      };
      v200FinalizeUser=wrappedFinalize;
      try{window.v200FinalizeUser=wrappedFinalize}catch(e){}
      window.__v495FinalizeLevelGuard=true;
    }
  }catch(e){}

  /* Safety fallback for offline/local starts where no account-ready event exists. */
  setTimeout(()=>{if(syncing)finishSync()},12000);
})();
