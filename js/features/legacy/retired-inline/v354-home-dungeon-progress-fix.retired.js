
(function(){
  const V354_VERSION='V4.29 Stable';

  function v354RefreshWorld(){
    try{
      if(document.querySelector('#world')?.classList.contains('active') && typeof v085InstallWorld==='function'){
        v085InstallWorld(false);
      }
    }catch(e){console.warn('V4.02 world refresh',e)}
  }

  function version(){
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version]'
    ).forEach(el=>{if(el)el.textContent=V354_VERSION});
  }

  version();
  setTimeout(()=>{v354RefreshWorld();version()},350);
})();
