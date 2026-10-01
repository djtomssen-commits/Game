(function(){
  const V370_VERSION='V4.29 Stable';

  function paintVersion(){
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
    ).forEach(el=>{if(el)el.textContent=V370_VERSION});
    document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11');
  }

  function hardenMenu(){
    const btn=document.querySelector('.app > header .v366-menu');
    const panel=document.querySelector('#v032MenuPanel');
    if(!btn || !panel)return;

    /* Keep the dropdown physically attached to the left edge on mobile. */
    if(matchMedia('(max-width:599px)').matches){
      panel.style.setProperty('left','4px','important');
      panel.style.setProperty('right','auto','important');
      panel.style.setProperty('top','58px','important');
      panel.style.setProperty('transform','none','important');
    }

    if(btn.dataset.v370Bound==='1')return;
    btn.dataset.v370Bound='1';
    btn.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      panel.classList.toggle('open');
    },true);
  }

  paintVersion();
  hardenMenu();
  document.addEventListener('DOMContentLoaded',()=>{paintVersion();hardenMenu()},{once:true});
  window.addEventListener('resize',hardenMenu,{passive:true});
  setTimeout(()=>{paintVersion();hardenMenu()},300);
})();
