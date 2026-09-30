
(function(){
  if(window.__v4178QuestLiveFix)return;
  window.__v4178QuestLiveFix=true;

  function fmt(ms){
    const total=Math.max(0,Math.ceil((Number(ms)||0)/1000));
    const h=Math.floor(total/3600), m=Math.floor((total%3600)/60), s2=total%60;
    return h>0 ? `${h}:${String(m).padStart(2,'0')}:${String(s2).padStart(2,'0')}` : `${m}:${String(s2).padStart(2,'0')}`;
  }

  function ensureActiveSurface(){
    const q=s?.quests?.active;
    if(!q)return;
    const root=document.querySelector('#quests');
    if(!root)return;

    /* If a quest is active but the modern active view is missing/stale, ask the
       canonical quest renderer to rebuild it. This does not change quest data. */
    if(!root.classList.contains('v392-active-mode') || !root.querySelector('.v392-active-view .v386-card')){
      try{ renderQuests(); }catch(e){}
    }
  }

  function tick(){
    const root=document.querySelector('#quests');
    const q=s?.quests?.active;
    if(document.hidden || !root?.classList.contains('active') || !q?.ends)return;

    ensureActiveSurface();

    const left=Math.max(0,Number(q.ends)-Date.now());
    const timer=root.querySelector('#v392QuestTimer');
    if(left>0){
      if(timer)timer.textContent=fmt(left);
      return;
    }

    /* At zero the existing reward logic remains authoritative. We only force a
       visual repaint if the claim button has not appeared yet. */
    if(!root.querySelector('#v392ClaimQuest')){
      try{ renderQuests(); }catch(e){}
    }
  }

  /* Dedicated UI-only fallback. It neither awards rewards nor changes timers. */
  const id=setInterval(tick,1000);
  window.__v4178QuestLiveInterval=id;

  document.addEventListener('visibilitychange',()=>{ if(!document.hidden) setTimeout(tick,30); },{passive:true});
  window.addEventListener('pageshow',()=>setTimeout(tick,30),{passive:true});

  const oldGo=window.v032Go;
  if(typeof oldGo==='function' && !oldGo.__v4178QuestLive){
    const wrapped=function(id){
      const r=oldGo.apply(this,arguments);
      if(id==='quests')requestAnimationFrame(tick);
      return r;
    };
    wrapped.__v4178QuestLive=true;
    window.v032Go=wrapped;
    try{v032Go=wrapped}catch(e){}
  }

  setTimeout(tick,250);
})();
