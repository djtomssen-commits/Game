(function(){
  const VERSION=window.GROW_LEGENDS_VERSION?.label||'V7.111 Stable',
        SHORT=window.GROW_LEGENDS_VERSION?.short||'V7.111';
  function cleanup(){
    ['#v451RescueOverlay','#v451RestoreNotice','#v451RescueRow'].forEach(sel=>document.querySelectorAll(sel).forEach(el=>el.remove()));
    document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version').forEach(el=>{if(el&&el.textContent!==VERSION)el.textContent=VERSION});
    document.querySelectorAll('.v366-ver,.v371-logo em,.v372-logo em').forEach(el=>{if(el&&el.textContent!==SHORT)el.textContent=SHORT});
    document.title='Grow Legends '+SHORT;
  }
  try{delete window.v451OpenRecovery;delete window.v451ScanRecovery;delete window.v450RestoreHighestLocal;delete window.v450RecoveryCandidates}catch(e){}
  if(typeof v141BuildSettings==='function'&&!window.__v454SettingsCleanup){const base=v141BuildSettings;v141BuildSettings=function(){const r=base.apply(this,arguments);cleanup();return r};try{window.v141BuildSettings=v141BuildSettings}catch(e){}window.__v454SettingsCleanup=true}
  cleanup();
  document.addEventListener('DOMContentLoaded',cleanup,{once:true});
  window.addEventListener('pageshow',cleanup,{passive:true});
  window.addEventListener('growlegends:account-ready',cleanup,{passive:true});
  /* V8.009: delayed startup cleanup train retired. */
})();
