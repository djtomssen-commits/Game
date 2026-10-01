(function(){
  const V365_VERSION='V4.29 Stable';

  function align(){
    const header=document.querySelector('.app > header');
    const btn=document.querySelector('#v032MenuBtn');
    const panel=document.querySelector('#v032MenuPanel');

    if(header){
      header.style.setProperty('width','100vw','important');
      header.style.setProperty('max-width','none','important');
      header.style.setProperty('margin-left','calc(50% - 50vw)','important');
      header.style.setProperty('left','0','important');
    }
    if(btn){
      btn.style.setProperty('margin-left','0','important');
      btn.style.setProperty('justify-self','start','important');
    }
    if(panel){
      panel.style.setProperty('left','2px','important');
      panel.style.setProperty('right','auto','important');
      panel.style.setProperty('margin-left','0','important');
      panel.style.setProperty('transform','none','important');
    }
  }

  function version(){/* V7.113: obsolete version painter retired. */}

  window.addEventListener('growlegends:navigation-open-v7119',()=>{align();version()},{passive:true});

  align();version();
  document.addEventListener('DOMContentLoaded',()=>{align();version()},{once:true});
  window.addEventListener('pageshow',()=>{align();version()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{align();version()},{passive:true});
})();
