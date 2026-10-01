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

  /* V8.009 Worldboss powerblock: v111OpenWorldBoss binds the current
     v110Fight directly after refresh. The later opener/refresh rebind wrappers,
     delegated fallback and stale version timeout are therefore retired. */
})();
