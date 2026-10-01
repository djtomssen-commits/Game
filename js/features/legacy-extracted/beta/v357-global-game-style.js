
(function(){
  const V357_VERSION='V4.29 Stable';

  function v357RemoveWorldDuplicateBar(){
    document.querySelectorAll('#world .v351-topbar').forEach(el=>el.remove());
  }

  function v357Version(){/* V7.113: obsolete version painter retired. */}

  /* Keep the existing resource IDs and existing render logic untouched.
     Only remove the obsolete duplicate world bar after legacy world installers run. */
  const baseInstall=v085InstallWorld;
  v085InstallWorld=function(force){
    const r=baseInstall.apply(this,arguments);
    v357RemoveWorldDuplicateBar();
    return r;
  };

  window.addEventListener('growlegends:navigation-open-v7119',()=>{
    v357RemoveWorldDuplicateBar();
    v357Version();
  },{passive:true});

  v357RemoveWorldDuplicateBar();
  v357Version();
})();
