(function(){
  const VERSION='V4.29 Stable';

  function closeSettings(){
    const menu=document.querySelector('#v141SettingsMenu');
    if(!menu)return;
    menu.classList.remove('open','v377-open');
  }

  function ensureSettings(){
    try{if(typeof v141BuildSettings==='function')v141BuildSettings()}catch(e){}
    let menu=document.querySelector('#v141SettingsMenu');
    if(!menu)return null;

    /* Reuse the established settings portal rather than creating duplicate controls. */
    try{
      if(typeof v228PortalSettingsMenu==='function')menu=v228PortalSettingsMenu()||menu;
      else if(menu.parentElement!==document.body)document.body.appendChild(menu);
    }catch(e){
      if(menu.parentElement!==document.body)document.body.appendChild(menu);
    }
    return menu;
  }

  function bindGear(){
    /* This is the gear already present in the authoritative V4.02 header. */
    const gear=document.querySelector('#v372TopbarShell [data-head="settings"]');
    if(!gear)return;

    gear.textContent='⚙️';
    gear.setAttribute('aria-label','Einstellungen');
    gear.title='Einstellungen';

    if(gear.dataset.v377Bound==='1')return;
    gear.dataset.v377Bound='1';

    /* Replace the old handler, which searched for #settingsBtn instead of #v141SettingsBtn. */
    gear.onclick=function(e){
      e.preventDefault();
      e.stopPropagation();

      const menu=ensureSettings();
      if(!menu)return;

      const opening=!menu.classList.contains('v377-open');
      closeSettings();

      if(opening){
        menu.classList.add('open','v377-open');
        try{if(typeof v141RefreshSettingsUi==='function')v141RefreshSettingsUi()}catch(err){}
      }
    };
  }

  /* Close settings on shared navigation; refresh the gear from the same lifecycle. */
  window.addEventListener('growlegends:navigation-open-v7119',()=>{closeSettings();bindGear()},{passive:true});

  document.addEventListener('click',function(e){
    const menu=document.querySelector('#v141SettingsMenu');
    const gear=document.querySelector('#v372TopbarShell [data-head="settings"]');
    if(!menu?.classList.contains('v377-open'))return;
    if(menu.contains(e.target)||gear?.contains(e.target))return;
    closeSettings();
  },true);

  function version(){
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
    ).forEach(el=>{if(el)el.textContent=VERSION});
    document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11');
  }

  bindGear();version();
  document.addEventListener('DOMContentLoaded',()=>{bindGear();version()},{once:true});
  window.addEventListener('pageshow',()=>{bindGear();version()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{bindGear();version()},{passive:true});
})();
