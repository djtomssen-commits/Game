(function(){
  const VERSION='V4.33 Stable', SHORT='V4.33';
  const VALID_VIEWS=new Set(['map','battle','reward']);

  function n(v){return Math.max(0,Math.round(Number(v)||0))}
  function cap(){
    try{if(typeof v271DampfCap==='function')return Math.max(100,n(v271DampfCap()))}catch(e){}
    try{if(typeof v284DampfCap==='function')return Math.max(100,n(v284DampfCap()))}catch(e){}
    return 100;
  }
  function saveLocal(){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}

  /* One owner for the values the player can actually see. Historical painters
     may still exist, but spending Harz/Dampf must be visible in the same frame. */
  function paintResources(){
    const harz=n(s?.harzTaler), dampf=Math.min(cap(),n(s?.energy)), max=cap(), gold=n(s?.gold);

    const g358=document.querySelector('#v358Gold'); if(g358)g358.textContent='🪙 '+gold.toLocaleString('de-DE');
    const h358=document.querySelector('#v358Harz'); if(h358)h358.textContent='💎 '+harz.toLocaleString('de-DE');
    const d358=document.querySelector('#v358Dampf'); if(d358)d358.textContent='💨 '+dampf.toLocaleString('de-DE')+'/'+max.toLocaleString('de-DE');

    document.querySelectorAll('#topHarz,#harz,#shopHarz,[data-harz],.harz-value').forEach(el=>{
      if(el)el.textContent=harz.toLocaleString('de-DE');
    });
    const energy=document.querySelector('#energy');
    if(energy)energy.textContent=`${dampf}/${max}`;
    const goldEl=document.querySelector('#gold');if(goldEl)goldEl.textContent=gold.toLocaleString('de-DE');
    const shopGold=document.querySelector('#shopGold');if(shopGold)shopGold.textContent=gold.toLocaleString('de-DE');

    /* Current resource cards from later UI generations. */
    document.querySelectorAll('.v358-res.harz b').forEach(el=>el.textContent='💎 '+harz.toLocaleString('de-DE'));
    document.querySelectorAll('.v358-res.dampf b').forEach(el=>el.textContent='💨 '+dampf.toLocaleString('de-DE')+'/'+max.toLocaleString('de-DE'));
  }
  window.v433PaintResources=paintResources;

  function dungeonShape(){
    s.dungeon=(s.dungeon&&typeof s.dungeon==='object')?s.dungeon:{};
    s.dungeon.progress=(s.dungeon.progress&&typeof s.dungeon.progress==='object')?s.dungeon.progress:{};
    s.dungeon.completed=Array.isArray(s.dungeon.completed)?[...new Set(s.dungeon.completed.map(Number).filter(Number.isInteger))]:[];
    s.dungeon.selected=Math.max(0,Math.min((typeof dungeons!=='undefined'?dungeons.length:20)-1,Number(s.dungeon.selected)||0));
    for(let i=0;i<(typeof dungeons!=='undefined'?dungeons.length:20);i++){
      s.dungeon.progress[i]=Math.max(0,Math.min(9,Number(s.dungeon.progress[i])||0));
    }
    if(!VALID_VIEWS.has(s.dungeon.view))s.dungeon.view='map';
  }

  /* Completion invariant: every permanently sealed dungeon must have reached
     its boss room. A bogus completed flag with lower progress is always corrupt. */
  function repairDungeonState(allowUiRecovery=true){
    dungeonShape();
    let changed=false;
    const before=s.dungeon.completed.slice();
    s.dungeon.completed=s.dungeon.completed.filter(i=>Number(s.dungeon.progress?.[i])>=9);
    if(before.length!==s.dungeon.completed.length)changed=true;

    if(allowUiRecovery && s.dungeon.view==='reward'){
      const overlay=document.querySelector('#v247DungeonReward.show');
      const back=document.querySelector('#v246ReturnMap,#claimDungeonReward');
      if(!overlay&&!back){s.dungeon.view='map';changed=true}
    }
    return changed;
  }
  window.v433RepairDungeonState=repairDungeonState;

  /* Guard future accidental permanent closures. A genuine boss win increments
     story.bossesDefeated in the same transaction as completed[]. */
  let lastCompleted=new Set();
  let lastBossWins=0;
  function takeDungeonSnapshot(){
    dungeonShape();
    lastCompleted=new Set(s.dungeon.completed.map(Number));
    lastBossWins=Math.max(0,Number(s.story?.bossesDefeated)||0);
  }
  function guardNewCompletion(){
    dungeonShape();
    const now=s.dungeon.completed.map(Number);
    const added=now.filter(i=>!lastCompleted.has(i));
    const bossWins=Math.max(0,Number(s.story?.bossesDefeated)||0);
    const allowed=Math.max(0,bossWins-lastBossWins);
    if(added.length>allowed){
      const reject=new Set(added.slice(allowed));
      s.dungeon.completed=now.filter(i=>!reject.has(i));
      if(reject.size){
        try{console.warn('V4.33 blocked invalid dungeon completion',Array.from(reject))}catch(e){}
      }
    }
  }

  repairDungeonState(false);
  takeDungeonSnapshot();
  saveLocal();

  /* Outermost persistence owner: validate dungeon state first, then immediately
     repaint resources after every spend/reward without waiting for navigation. */
  if(typeof persist==='function'&&!window.__v433PersistWrapped){
    const basePersist=persist;
    persist=function(){
      guardNewCompletion();
      repairDungeonState(false);
      const r=basePersist.apply(this,arguments);
      takeDungeonSnapshot();
      paintResources();
      requestAnimationFrame(paintResources);
      setTimeout(paintResources,40);
      return r;
    };
    try{window.persist=persist}catch(e){}
    window.__v433PersistWrapped=true;
  }

  /* Dungeon paid attempt used to save directly to localStorage, bypassing the
     new visible resource bar. Keep the proven deduction logic, but route the
     finished state through persist(false) and repaint it immediately. */
  if(typeof consumeDungeonAttempt==='function'&&!window.__v433AttemptWrapped){
    const baseAttempt=consumeDungeonAttempt;
    consumeDungeonAttempt=async function(){
      const beforeHarz=n(s?.harzTaler), beforeFree=Number(s.dungeonPass?.lastFree)||0;
      const ok=await baseAttempt.apply(this,arguments);
      if(ok && (n(s?.harzTaler)!==beforeHarz || (Number(s.dungeonPass?.lastFree)||0)!==beforeFree)){
        try{persist(false)}catch(e){saveLocal()}
      }else saveLocal();
      paintResources();
      requestAnimationFrame(paintResources);
      return ok;
    };
    try{window.consumeDungeonAttempt=consumeDungeonAttempt}catch(e){}
    window.__v433AttemptWrapped=true;
  }

  if(typeof dungeonCompleted==='function'&&!window.__v433DungeonCompletedWrapped){
    dungeonCompleted=function(i){
      dungeonShape();
      i=Number(i);
      return s.dungeon.completed.includes(i) && Number(s.dungeon.progress?.[i])>=9;
    };
    try{window.dungeonCompleted=dungeonCompleted}catch(e){}
    window.__v433DungeonCompletedWrapped=true;
  }

  /* Phase 2 retired: v433 renderDungeon wrapper. v433RepairDungeonState and
     v433PaintResources are called explicitly by the canonical owner. */

  /* Any spend handler that does not repaint itself is corrected on the same click. */
  document.addEventListener('click',e=>{if(!e.target?.closest?.('#dungeon,#shop,#quests,#grow,#harzDealer,#world'))return;requestAnimationFrame(paintResources)},true);

  window.addEventListener('growlegends:navigation-open-v7119',()=>{paintResources();stamp()},{passive:true});
  window.__v433GoWrapped='v7119-event';

  function stamp(){}

  paintResources();stamp();
  document.addEventListener('DOMContentLoaded',()=>{repairDungeonState(true);paintResources();stamp()},{once:true});
  window.addEventListener('pageshow',()=>{repairDungeonState(true);paintResources();stamp()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{repairDungeonState(true);paintResources();stamp()},{passive:true});
})();
