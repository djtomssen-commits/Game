(function(){
  const VERSION='V4.29 Stable';
  let v388Starting=false;

  /*
    Keep the current final V4.02/V4.02 worldboss owner intact.
    This wrapper only makes failures visible and prevents a permanently
    disabled attack button after an interrupted/failed start.
  */
  const v388CanonicalFight=v110Fight;
  v110Fight=async function(){
    if(v388Starting)return;
    v388Starting=true;

    const btn=document.querySelector('#v110Fight');
    try{
      const result=v388CanonicalFight.apply(this,arguments);
      if(result && typeof result.then==='function')await result;
      return result;
    }catch(e){
      console.error('V4.02 worldboss fight start',e);
      if(btn)btn.disabled=false;
      if(typeof v063Toast==='function'){
        v063Toast(
          'Weltboss-Kampf konnte nicht starten',
          'error',
          e?.message||'Bitte versuche den Angriff erneut.'
        );
      }
    }finally{
      /*
        The real combat owner disables the button while its round timer runs.
        We only release our short start lock; combat remains authoritative.
      */
      v388Starting=false;
    }
  };

  function v388BindFightButton(){
    const btn=document.querySelector('#v110Fight');
    if(!btn)return;

    /*
      Reopening the boss after a browser/app interruption can leave the
      persistent overlay button disabled although no combat timer is running.
      The overlay is freshly prepared here, before the player can attack.
    */
    if(!document.querySelector('#v110Overlay')?.classList.contains('v388-combat-running')){
      btn.disabled=false;
    }

    /* Always point the button at the CURRENT final fight owner. */
    btn.onclick=v110Fight;
    btn.dataset.v388Bound='1';
  }

  /*
    Wrap the final boss opener. The older opener assigned onclick before later
    worldboss layers replaced v110Fight. Rebinding after the complete open/
    refresh path removes that stale-handler race permanently.
  */
  const v388BaseOpen=v111OpenWorldBoss;
  v111OpenWorldBoss=function(){
    const result=v388BaseOpen.apply(this,arguments);
    requestAnimationFrame(v388BindFightButton);
    setTimeout(v388BindFightButton,30);
    return result;
  };

  /*
    Single delegated fallback. It does NOT start a second fight:
    only buttons which somehow lost their direct binding use this path.
  */
  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('#v110Fight');
    if(!btn || btn.dataset.v388Bound==='1')return;
    e.preventDefault();
    e.stopPropagation();
    v110Fight();
  },true);

  /*
    render/refresh layers can rebuild pieces of the boss overlay. Rebind only
    when that overlay is actually open; no observer and no polling interval.
  */
  const v388BaseRefresh=v110Refresh;
  v110Refresh=function(){
    const result=v388BaseRefresh.apply(this,arguments);
    if(document.querySelector('#v110Overlay')?.classList.contains('show')){
      requestAnimationFrame(v388BindFightButton);
    }
    return result;
  };

  setTimeout(()=>{
    if(document.querySelector('#v110Overlay')?.classList.contains('show')){
      v388BindFightButton();
    }
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
    ).forEach(el=>{if(el)el.textContent=VERSION});
    document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11');
  },500);
})();
