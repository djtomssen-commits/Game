/* ===== V4.02 Startseite: vorhandene Navigations-/Dashboard-Kette benutzen ===== */

function v200OpenHome(){
  try{
    /*
      v032Go('world') ist die zentrale Navigation des Spiels.
      Daran hängen bereits:
      - v085 aktuelles Startseiten-Dashboard
      - v086 Menüstatus
      - spätere Worldboss-/Event-Erweiterungen
    */
    if(typeof v032Go==='function'){
      v032Go('world');
    }else{
      document.querySelectorAll('.screen').forEach(el=>el.classList.remove('active'));
      document.querySelector('#world')?.classList.add('active');
    }

    /*
      Sicherheit: Dashboard nach der Navigation noch einmal installieren.
      Einige ältere Render-Wrapper können den Inhalt während desselben
      Renderdurchlaufs ersetzen.
    */
    if(typeof v085InstallWorld==='function'){
      v085InstallWorld();
    }

    requestAnimationFrame(()=>{
      try{
        const world=document.querySelector('#world');
        if(!world)return;

        if(!world.classList.contains('active')){
          document.querySelectorAll('.screen').forEach(el=>el.classList.remove('active'));
          world.classList.add('active');
        }

        if(
          typeof v085InstallWorld==='function' &&
          !world.querySelector('.v085-dashboard')
        ){
          v085InstallWorld();
        }

        /* spätere Worldboss-Erweiterung auf bestehendem Dashboard nachziehen */
        try{
          if(typeof v111InstallWorldBossCard==='function'){
            v111InstallWorldBossCard();
          }
        }catch(e){}

      }catch(e){
        console.error('V4.02 Startseite',e);
      }
    });

  }catch(e){
    console.error('V4.02 Startseite öffnen',e);
  }
}

function v201EnsureHome(){
  try{
    const world=document.querySelector('#world');
    if(!world)return false;
    if(typeof v085InstallWorld==='function'&&!world.querySelector('.v085-dashboard'))v085InstallWorld();
    try{if(typeof v111InstallWorldBossCard==='function')v111InstallWorldBossCard()}catch(e){}
    return true;
  }catch(e){console.error('V4.02 world ensure',e);return false}
}
window.v201EnsureHome=v201EnsureHome;
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='world')v201EnsureHome()},{passive:true});
window.addEventListener('pageshow',()=>{if(document.querySelector('#world')?.classList.contains('active'))v201EnsureHome()},{passive:true});
