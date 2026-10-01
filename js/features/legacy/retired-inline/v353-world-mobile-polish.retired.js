
(function(){
  const V353_VERSION='V4.29 Stable';

  function v353FixDealerPlacement(){
    const dock=document.querySelector('#world .v349-dock');

    /* Remove accidental Harz Dealer insertions from the world dock.
       This was caused by V4.02 treating any <nav> with game entries as the dropdown. */
    dock?.querySelectorAll('[data-v341-harz-menu],[data-v337-harz-dealer]').forEach(el=>el.remove());

    /* Put it only in the real hamburger panel. */
    const panel=document.querySelector('#v032MenuPanel');
    if(panel && !panel.querySelector('[data-v353-harz-dealer]')){
      const item=document.createElement('button');
      item.type='button';
      item.setAttribute('data-v353-harz-dealer','1');
      item.textContent='💎 Harz & Gold & Rahmen Dealer';

      /* Match a real existing menu button where possible. */
      const sibling=[...panel.children].find(x=>x.tagName==='BUTTON'||x.matches?.('a,[role="menuitem"]'));
      if(sibling && sibling.className)item.className=sibling.className;

      item.onclick=(e)=>{
        e.preventDefault();
        e.stopPropagation();
        try{
          if(typeof v032Go==='function')v032Go('harzDealer');
          else if(typeof v322OpenDealer==='function')v322OpenDealer();
        }catch(err){console.warn('V4.02 Harz Dealer',err)}
      };
      panel.appendChild(item);
    }
  }

  function v353Polish(){
    v353FixDealerPlacement();
  }

  const baseInstall=v085InstallWorld;
  v085InstallWorld=function(force){
    const r=baseInstall.apply(this,arguments);
    v353Polish();
    return r;
  };

  const baseGo=v032Go;
  v032Go=function(id){
    const r=baseGo.apply(this,arguments);
    if(id==='world')requestAnimationFrame(v353Polish);
    return r;
  };

  function version(){
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version]'
    ).forEach(el=>{if(el)el.textContent=V353_VERSION});
  }

  v353Polish();
  version();
  setTimeout(()=>{v353Polish();version()},350);
  setTimeout(()=>{v353Polish();version()},1200);
})();
