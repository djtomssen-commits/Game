(function(){
  const VERSION='V4.29 Stable';

  function liveQuests(){
    try{
      if(Array.isArray(s?.quests?.offers)&&s.quests.offers.length)return s.quests.offers.slice(0,3);
      if(Array.isArray(s?.quests?.available)&&s.quests.available.length)return s.quests.available.slice(0,3);
      if(Array.isArray(s?.quests?.list)&&s.quests.list.length)return s.quests.list.slice(0,3);
      if(Array.isArray(window.currentQuests)&&window.currentQuests.length)return window.currentQuests.slice(0,3);
      if(Array.isArray(window.questOptions)&&window.questOptions.length)return window.questOptions.slice(0,3);
    }catch(e){}
    return [];
  }

  function removeLegacy(){
    const root=document.querySelector('#quests');
    if(!root)return;
    root.querySelectorAll(':scope > .v052-scene-banner,:scope > .v41-npc-banner,:scope > .hero-card').forEach(el=>el.remove());
  }

  function syncQuestText(){
    const qs=liveQuests();
    document.querySelectorAll('#quests .v386-card').forEach((card,i)=>{
      const q=qs[i];
      if(!q)return;
      const title=card.querySelector('.v386-title');
      const desc=card.querySelector('.v386-desc');
      /* Base quest templates use `name` + `text`. Earlier redesign ignored `text`,
         which caused titles and descriptions to belong to different quests. */
      if(title && (q.name||q.title))title.textContent=String(q.name||q.title);
      if(desc && (q.text||q.description||q.desc))desc.textContent=String(q.text||q.description||q.desc);
      const art=card.querySelector('.v386-scene-art');
      if(art)art.innerHTML='';
    });
  }

  function finish(){
    removeLegacy();
    syncQuestText();
    document.querySelectorAll('#quests .v390-mira-portrait,#quests .v389-mira-portrait').forEach(el=>el.remove());
  }

  /* Stop historical visual installers from rebuilding the old quest header. */
  if(typeof v052InstallSceneBanners==='function'){
    const oldScene=v052InstallSceneBanners;
    v052InstallSceneBanners=function(){const r=oldScene.apply(this,arguments);removeLegacy();return r;};
  }
  if(typeof v41InstallNpcBanners==='function'){
    const oldNpc=v41InstallNpcBanners;
    v41InstallNpcBanners=function(){const r=oldNpc.apply(this,arguments);removeLegacy();return r;};
  }

  window.v391QuestFinish=finish;
  /* V8.009: renderQuests wrapper and delayed version repaint retired.
     v6344 invokes finish() after the canonical shell render. */
  queueMicrotask(finish);
})();
