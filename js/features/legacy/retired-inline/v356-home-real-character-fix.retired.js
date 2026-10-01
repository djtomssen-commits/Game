
(function(){
  const V356_VERSION='V4.29 Stable';

  function preload(){
    try{
      if(typeof v080AvatarFor!=='function')return;
      const src=v080AvatarFor(s.playerClass);
      if(!src)return;
      window.__v356AvatarPreload??={};
      if(window.__v356AvatarPreload[src])return;
      const img=new Image();
      img.loading='eager';
      img.decoding='sync';
      try{img.fetchPriority='high'}catch(e){}
      img.src=src;
      window.__v356AvatarPreload[src]=img;
    }catch(e){}
  }

  function refresh(){
    preload();
    try{
      if(document.querySelector('#world')?.classList.contains('active') && typeof v085InstallWorld==='function'){
        v085InstallWorld(false);
      }
    }catch(e){console.warn('V4.02 home avatar refresh',e)}
  }

  function version(){
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version]'
    ).forEach(el=>{if(el)el.textContent=V356_VERSION});
  }

  preload();
  version();
  setTimeout(()=>{refresh();version()},300);
  setTimeout(()=>{refresh();version()},1200);
})();
