(function(){
  const VERSION='V4.36 Stable', SHORT='V4.36';

  function achievementState(){
    s.v106Achievements=(s.v106Achievements&&typeof s.v106Achievements==='object')?s.v106Achievements:{};
    s.v106Achievements.done=(s.v106Achievements.done&&typeof s.v106Achievements.done==='object')?s.v106Achievements.done:{};
    s.v106Achievements.stats=(s.v106Achievements.stats&&typeof s.v106Achievements.stats==='object')?s.v106Achievements.stats:{};
    const stats=s.v106Achievements.stats;
    stats.goldEarned=Math.max(0,Number(stats.goldEarned)||0);
    return stats;
  }

  function ensureLedger(){
    const stats=achievementState();
    const current=Math.max(0,Number(s.gold)||0);
    let ledger=s.v435GoldLifetime;
    if(!ledger||typeof ledger!=='object'||ledger.version!==1){
      ledger={
        version:1,
        earned:Math.max(current,Number(stats.goldEarned)||0),
        lastGold:current,
        initializedAt:Date.now()
      };
      s.v435GoldLifetime=ledger;
    }else{
      ledger.earned=Math.max(0,Number(ledger.earned)||0);
      ledger.lastGold=Math.max(0,Number(ledger.lastGold)||0);
    }
    /* From V4.35 on this ledger is authoritative. Old quest wrappers may still
       touch stats.goldEarned, but cannot double-count because every check resets
       the visible achievement counter from the ledger. */
    stats.goldEarned=Math.floor(ledger.earned);
    return ledger;
  }

  function goldEarned(){
    const ledger=ensureLedger();
    return Math.max(0,Math.floor(Number(ledger.earned)||0));
  }
  window.v435GoldEarned=goldEarned;

  function reconcile(saveIfChanged=false){
    const stats=achievementState();
    const ledger=ensureLedger();
    const current=Math.max(0,Number(s.gold)||0);
    const previous=Math.max(0,Number(ledger.lastGold)||0);
    let changed=false;

    if(current>previous){
      ledger.earned=Math.max(0,Number(ledger.earned)||0)+(current-previous);
      changed=true;
    }
    if(current!==previous){
      ledger.lastGold=current;
      changed=true;
    }

    const canonical=Math.max(0,Math.floor(Number(ledger.earned)||0));
    if(Number(stats.goldEarned)!==canonical){
      stats.goldEarned=canonical;
      changed=true;
    }

    if(changed&&saveIfChanged){
      try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
      try{if(typeof v075ScheduleSave==='function')v075ScheduleSave()}catch(e){}
    }
    return changed;
  }
  window.v435ReconcileGoldLifetime=reconcile;

  /* Make all existing Gold achievements read the canonical lifetime ledger. */
  try{
    if(typeof V106_ACH!=='undefined'&&Array.isArray(V106_ACH)){
      V106_ACH.forEach(row=>{
        if(['gold10k','gold100k','gold1m'].includes(row?.[0]))row[3]=()=>goldEarned();
      });
    }
  }catch(e){console.warn('V4.35 Gold achievement getter patch',e)}

  /* Reconcile BEFORE achievement checks. This also neutralizes the old quest-only
     counter increment so quest Gold is counted once, not twice. */
  if(typeof v106CheckAchievements==='function'&&!window.__v435AchievementCheckWrapped){
    const baseCheck=v106CheckAchievements;
    v106CheckAchievements=function(){
      reconcile(false);
      return baseCheck.apply(this,arguments);
    };
    try{window.v106CheckAchievements=v106CheckAchievements}catch(e){}
    window.__v435AchievementCheckWrapped=true;
  }

  /* Main income hook: almost every game reward persists immediately. Compare the
     real Gold balance against the previous persisted balance before saving. */
  if(typeof persist==='function'&&!window.__v435PersistWrapped){
    const basePersist=persist;
    persist=function(){
      reconcile(false);
      const r=basePersist.apply(this,arguments);
      reconcile(false);
      refreshOpenBook();
      stamp();
      return r;
    };
    try{window.persist=persist}catch(e){}
    window.__v435PersistWrapped=true;
  }

  /* Direct legacy paths can change Gold without persist(). Render/click/timer
     guards catch those too. Spending only moves lastGold downward; it never
     reduces earned lifetime Gold. */
  if(typeof render==='function'&&!window.__v435RenderWrapped){
    const baseRender=render;
    render=function(){
      reconcile(false);
      const r=baseRender.apply(this,arguments);
      reconcile(false);
      refreshOpenBook();
      stamp();
      return r;
    };
    try{window.render=render}catch(e){}
    window.__v435RenderWrapped=true;
  }

  function refreshOpenBook(){
    const ov=document.querySelector('#v106Overlay.show');
    if(!ov||typeof V106_ACH==='undefined')return;
    const list=document.querySelector('#v106BookList');
    if(!list)return;
    /* Never reopen/rebuild the whole Illegal Book just because lifetime Gold
       changed. Update only the affected Gold achievement cards in place. */
    const cards=[...list.querySelectorAll('.v106-ach')];
    V106_ACH.forEach((row,i)=>{
      if(!['gold10k','gold100k','gold1m'].includes(row?.[0]))return;
      const card=cards[i];if(!card)return;
      const target=Math.max(1,Number(row?.[4])||1);
      const val=Math.max(0,Number(row?.[3]?.())||0);
      const complete=!!s?.v106Achievements?.done?.[row[0]];
      card.classList.toggle('done',complete);
      const pct=complete?100:Math.min(100,Math.round(val/target*100));
      const bar=card.querySelector('.v106-progress>i');if(bar)bar.style.width=pct+'%';
      const txt=card.querySelector('.v106-progress-text');
      if(txt)txt.textContent=complete?'ABGESCHLOSSEN':`${Math.min(val,target).toLocaleString('de-DE')} / ${target.toLocaleString('de-DE')}`;
      const title=card.querySelector('.v106-ach-title');
      if(title)title.textContent=(complete?'✓':'○')+' '+String(row?.[1]||'Erfolg');
    });
    try{window.v6235IllegalBookRender?.(false)}catch(_){}
  }

  document.addEventListener('click',()=>{
    setTimeout(()=>{
      const changed=reconcile(true);
      if(changed){try{v106CheckAchievements(true)}catch(e){} refreshOpenBook()}
      stamp();
    },0);
  },true);

  function stamp(){}

  /* Migration: at minimum, a player must already have earned as much Gold as is
     currently owned. Existing tracked quest Gold is kept when it is higher. */
  const firstLedgerExisted=!!(s.v435GoldLifetime&&s.v435GoldLifetime.version===1);
  ensureLedger();
  reconcile(false);
  try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
  try{v106CheckAchievements(false)}catch(e){}
  stamp();

  /* V8.009: delayed migration retries retired; account-ready/lifecycle own reconciliation. */
  document.addEventListener('DOMContentLoaded',()=>{reconcile(true);stamp()},{once:true});
  window.addEventListener('pageshow',()=>{reconcile(true);stamp()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{const changed=reconcile(true);if(changed){try{v106CheckAchievements(true)}catch(e){} refreshOpenBook()}stamp()},{passive:true});
})();
