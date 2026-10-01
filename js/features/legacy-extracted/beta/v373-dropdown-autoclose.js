
(function(){
  const VERSION='V4.29 Stable';

  function closeMainMenu(){
    const panel=document.querySelector('#v032MenuPanel');
    if(!panel)return;
    panel.classList.remove('open','show','active');
    panel.style.removeProperty('display');
    panel.style.removeProperty('visibility');
    panel.style.removeProperty('opacity');
    panel.style.removeProperty('pointer-events');
  }

  /* Shared navigation owner: every successful page change closes the menu. */
  window.addEventListener('growlegends:navigation-open-v7119',closeMainMenu,{passive:true});

  /* Safety for menu entries that use their own click handler instead of v032Go. */
  document.addEventListener('click',function(e){
    const panel=document.querySelector('#v032MenuPanel');
    if(!panel || !panel.contains(e.target))return;
    const nav=e.target.closest('button,a,[data-screen],[data-go],[data-target]');
    if(nav) requestAnimationFrame(closeMainMenu);
  },true);

  document.querySelectorAll(
    '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
  ).forEach(el=>{if(el)el.textContent=VERSION});
})();
