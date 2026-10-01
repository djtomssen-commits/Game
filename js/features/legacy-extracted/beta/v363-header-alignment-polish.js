
(function(){
  const V363_VERSION='V4.29 Stable';

  function update(){
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
    ).forEach(el=>{if(el)el.textContent=V363_VERSION});

    const logo=document.querySelector('.v358-logo');
    if(logo)logo.setAttribute('data-v363','1');
  }

  update();
  document.addEventListener('DOMContentLoaded',update,{once:true});
  window.addEventListener('pageshow',update,{passive:true});
  window.addEventListener('growlegends:account-ready',update,{passive:true});
})();
