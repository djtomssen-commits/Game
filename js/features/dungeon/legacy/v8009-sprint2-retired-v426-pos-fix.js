/* RETIRED FROM ACTIVE BETA IN V8.009-DUNGEON-SPRINT-2. DO NOT LOAD. */
(function(){
  /* Positionen nur für die neue V261-Karte. Keine Kampf-/Fortschrittslogik. */
  const pos=[
    [11,18],[35,20],[60,25],[84,31],[11,46],
    [31,58],[51,68],[70,59],[86,47],[82,78]
  ];
  const base=window.v261RenderDetail;
  if(typeof base!=='function'||base.__v426)return;
  const wrapped=function(){
    const ok=base.apply(this,arguments);
    try{
      document.querySelectorAll('#dungeonMapCard.v261-detail-card [data-v261-room]').forEach((n,i)=>{
        const p=pos[i]; if(!p)return;
        n.style.setProperty('--x',p[0]);
        n.style.setProperty('--y',p[1]);
      });
    }catch(e){}
    return ok;
  };
  wrapped.__v426=true;
  window.v261RenderDetail=wrapped;
  try{v261RenderDetail=wrapped}catch(e){}
  window.v251RenderDetail=wrapped;window.v244RenderSelectedDungeonMap=wrapped;window.v064RenderMap=wrapped;
  try{v251RenderDetail=wrapped;v244RenderSelectedDungeonMap=wrapped;v064RenderMap=wrapped}catch(e){}
})();
