(()=>{
  'use strict';
  if(window.__V6289_SUMMONER_BETA_LOCK__)return;
  window.__V6289_SUMMONER_BETA_LOCK__=true;

  window.V6289_SUMMONER_BETA_LOCK = true;
  const V6289_SERVER1_UNLOCK_AT=Date.parse('2026-10-02T16:00:00+02:00');
  const V6289_EARLY_EMAIL='tomssen5@gmail.com';

  const isExistingSummoner=()=>{try{return String((typeof s!=='undefined'?s?.playerClass:window.s?.playerClass)||'')==='summoner'}catch(_){return false}};

  function serverId(){try{return String(window.v343CurrentServer||s?.__serverId||'beta')}catch(_){return 'beta'}}
  function server1HarzOpen(){return serverId()==='server1'&&Date.now()>=V6289_SERVER1_UNLOCK_AT}
  function earlyTester(){
    if(serverId()!=='server1')return false;
    try{return String(v073User?.email||'').trim().toLowerCase()===V6289_EARLY_EMAIL}catch(_){return false}
  }
  function lockedForThisAccount(){
    if(isExistingSummoner()||earlyTester())return false;
    return window.V6289_SUMMONER_BETA_LOCK===true && !server1HarzOpen();
  }

  function message(){
    const s1=serverId()==='server1';
    const body=s1
      ? 'Die Harzruferin wird auf Server 1 am Freitag, 2. Oktober 2026 um 16:00 Uhr freigeschaltet.'
      : 'Die Harzruferin ist auf dem Beta-Server für neue Charaktere gesperrt. Sie startet regulär auf Server 1.';
    try{if(typeof window.v115Alert==='function')return window.v115Alert(body,'🔒 Harzruferin','info')}catch(_){}
    alert('🔒 Harzruferin\n\n'+body);
  }

  function decorate(){
    const existing=isExistingSummoner();
    document.body?.classList.toggle('v6289-existing-summoner',existing);

    document.querySelectorAll(
      '[data-v029-class="summoner"],'+
      '[data-v200-class="summoner"],'+
      '[data-v4135-class="summoner"],'+
      '[data-v4136-class="summoner"]'
    ).forEach(card=>{
      const lock=lockedForThisAccount();
      card.classList.toggle('v6289-beta-locked',lock);
      card.setAttribute('aria-disabled',lock?'true':'false');
      card.setAttribute('data-v6289-lock-label',serverId()==='server1'?'🔒 FREITAG 16:00':'🔒 SERVER 1');
      card.title=lock
        ? (serverId()==='server1'?'Harzruferin · Freitag 16:00':'Harzruferin · auf Server 1 verfügbar')
        : 'Harzruferin';
    });
  }

  /* Direkte alte Klassenwahl ebenfalls absichern. */
  const oldChoose=typeof window.chooseClass==='function'?window.chooseClass:null;
  if(oldChoose){
    window.chooseClass=function(id){
      if(String(id)==='summoner'&&lockedForThisAccount()){
        message();
        return false;
      }
      return oldChoose.apply(this,arguments);
    };
    try{chooseClass=window.chooseClass}catch(_){}
  }

  /* Alle bekannten Charakter-Erstellungsdialoge zentral blockieren.
     Capture läuft vor den alten onclick-Handlern. */
  document.addEventListener('click',e=>{
    const card=e.target instanceof Element
      ? e.target.closest(
          '[data-v029-class="summoner"],'+
          '[data-v200-class="summoner"],'+
          '[data-v4135-class="summoner"],'+
          '[data-v4136-class="summoner"]'
        )
      : null;

    if(!card||!lockedForThisAccount())return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    message();
  },true);

  /* V6.290 PERFORMANCE: kein globales subtree-Monitoring.
     Die Auswahl ist bereits per Capture-Klick technisch gesperrt; die Optik
     wird nur beim Account-Start / Öffnen der Charakteransicht aktualisiert. */
  document.addEventListener('click',e=>{
    const hit=e.target instanceof Element
      ? e.target.closest('[data-screen="character"],[data-go="character"],[data-v085-go="character"]')
      : null;
    if(hit)setTimeout(decorate,0);
  },true);

  window.addEventListener('growlegends:account-ready',()=>setTimeout(decorate,40));
  window.addEventListener('pageshow',()=>setTimeout(decorate,40),{passive:true});
  window.addEventListener('growlegends:foreground-ready',decorate,{passive:true});

  window.v6289HarzruferinLockDiagnostics=()=>({
    version:'V6.289',
    globalLock:window.V6289_SUMMONER_BETA_LOCK===true,
    server:serverId(),
    server1UnlockAt:new Date(V6289_SERVER1_UNLOCK_AT).toISOString(),
    existingSummoner:isExistingSummoner(),
    lockedForThisAccount:lockedForThisAccount(),
    visibleLockedCards:document.querySelectorAll('.v6289-beta-locked').length
  });
})();
