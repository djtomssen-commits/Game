
(function(){
  const CLEAN_BOSS = `assets/v7198-base64/1a70a19b00e85b1d15ec.webp`;
  const BETA=String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta';

  function applyBoss(){
    try{
      if(Number(s?.dungeon?.selected||0)!==6) return;
      const card=document.getElementById('dungeonMapCard');
      if(!card || !card.classList.contains('v432-d7')) return;
      const art=card.querySelector('.v261-node.boss .v261-bossart');
      if(art) art.style.backgroundImage=`url("${CLEAN_BOSS}")`;
    }catch(e){}
  }

  applyBoss();

  const sec=document.getElementById('dungeon');
  function observeWhenDungeonActive(){
    if(!sec)return;
    if(!sec.__v434BossObserver){
      sec.__v434BossObserver=new MutationObserver(()=>applyBoss());
    }
    if(BETA){
      try{sec.__v434BossObserver.disconnect()}catch(_){}
      if(!sec.classList.contains('active'))return;
    }
    sec.__v434BossObserver.observe(sec,{subtree:true,childList:true});
    applyBoss();
  }
  observeWhenDungeonActive();

  if(BETA){
    /* V8.327: the old D7 artwork fixer need not watch a hidden Dungeon.
       Navigation is the canonical activation point; retain D7 visuals. */
    window.addEventListener('growlegends:navigation-open-v7119',e=>{
      const id=String(e?.detail?.id||e?.detail?.screen||'');
      if(id==='dungeon')setTimeout(observeWhenDungeonActive,50);
      else if(id)try{sec?.__v434BossObserver?.disconnect()}catch(_){}
    },{passive:true});
  }
  window.addEventListener('pageshow',()=>setTimeout(()=>{
    if(BETA)observeWhenDungeonActive();
    applyBoss();
  },30),{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)setTimeout(()=>{
      if(BETA)observeWhenDungeonActive();
      applyBoss();
    },30);
  },{passive:true});
})();
