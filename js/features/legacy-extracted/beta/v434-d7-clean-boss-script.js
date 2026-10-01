
(function(){
  const CLEAN_BOSS = `assets/v7198-base64/1a70a19b00e85b1d15ec.webp`;

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
  if(sec && !sec.__v434BossObserver){
    const obs=new MutationObserver(()=>applyBoss());
    obs.observe(sec,{subtree:true,childList:true});
    sec.__v434BossObserver=obs;
  }

  window.addEventListener('pageshow',()=>setTimeout(applyBoss,30),{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)setTimeout(applyBoss,30);
  },{passive:true});
})();
