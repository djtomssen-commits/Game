
(function(){
  function closeSettingsDropdown(){
    try{
      const menu=document.querySelector('#v141SettingsMenu');
      if(!menu)return;
      menu.classList.remove('open','v377-open','v228-ultra-compact');
      menu.setAttribute('aria-hidden','true');
    }catch(e){}
  }

  /* Close immediately on the logout tap, before cloud-save/sign-out starts. */
  document.addEventListener('click',function(e){
    try{
      if(e.target instanceof Element && e.target.closest('#v141Logout')){
        closeSettingsDropdown();
      }
    }catch(err){}
  },true);

  /* Wrap the final logout chain: close before it starts and again after all
     legacy rebuilds/portal code have completed. */
  try{
    if(typeof v136Logout==='function' && !window.__v4161LogoutSettingsWrap){
      const base=v136Logout;
      v136Logout=async function(){
        closeSettingsDropdown();
        try{
          return await base.apply(this,arguments);
        }finally{
          closeSettingsDropdown();
          requestAnimationFrame(closeSettingsDropdown);
          setTimeout(closeSettingsDropdown,0);
        }
      };
      try{window.v136Logout=v136Logout}catch(e){}
      window.__v4161LogoutSettingsWrap=true;
    }
  }catch(e){}
})();
