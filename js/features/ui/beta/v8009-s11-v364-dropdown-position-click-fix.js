(function(){
  const V364_VERSION='V4.29 Stable';

  function getPanel(){return document.querySelector('#v032MenuPanel')}
  function getButton(){return document.querySelector('#v032MenuBtn')}

  function normalizePanelState(panel){
    if(!panel)return;
    /* Support both legacy class-based and inline visibility models. */
    const isOpen=panel.classList.contains('open') ||
      panel.classList.contains('show') ||
      panel.style.display==='block' ||
      panel.getAttribute('aria-hidden')==='false';

    if(isOpen){
      panel.style.setProperty('display','block','important');
      panel.style.setProperty('visibility','visible','important');
      panel.style.setProperty('opacity','1','important');
      panel.style.setProperty('pointer-events','auto','important');
    }
  }

  function bindButton(){
    const btn=getButton();
    const panel=getPanel();
    if(!btn||!panel)return;

    /* Replace accumulated conflicting click behavior with one deterministic toggle. */
    btn.onclick=function(e){
      e.preventDefault();
      e.stopPropagation();

      const open=panel.classList.contains('open') || panel.classList.contains('show');
      panel.classList.toggle('open',!open);
      panel.classList.toggle('show',!open);

      if(!open){
        panel.style.setProperty('display','block','important');
        panel.style.setProperty('visibility','visible','important');
        panel.style.setProperty('opacity','1','important');
        panel.style.setProperty('pointer-events','auto','important');
        panel.setAttribute('aria-hidden','false');
      }else{
        panel.style.removeProperty('display');
        panel.style.removeProperty('visibility');
        panel.style.removeProperty('opacity');
        panel.style.removeProperty('pointer-events');
        panel.setAttribute('aria-hidden','true');
      }
    };

    btn.style.setProperty('pointer-events','auto','important');
  }

  function fix(){
    const panel=getPanel();
    if(panel){
      panel.style.setProperty('left','4px','important');
      panel.style.setProperty('right','auto','important');
      panel.style.setProperty('z-index','100000','important');
      panel.style.setProperty('pointer-events','auto','important');
      normalizePanelState(panel);

      panel.querySelectorAll('button,a,[role="menuitem"],[data-v341-harz-menu],[data-v353-harz-dealer]').forEach(el=>{
        el.style.setProperty('pointer-events','auto','important');
        el.style.setProperty('position','relative','important');
        el.style.setProperty('z-index','1','important');
      });
    }
    bindButton();
  }

  window.addEventListener('growlegends:navigation-open-v7119',fix,{passive:true});

  function version(){
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
    ).forEach(el=>{if(el)el.textContent=V364_VERSION});
  }

  fix();version();
  document.addEventListener('DOMContentLoaded',()=>{fix();version()},{once:true});
  window.addEventListener('pageshow',()=>{fix();version()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{fix();version()},{passive:true});
})();
