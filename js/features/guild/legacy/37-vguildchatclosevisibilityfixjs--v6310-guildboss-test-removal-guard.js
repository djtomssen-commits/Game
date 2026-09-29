/* === vGuildChatCloseVisibilityFixJs === */
(()=>{
 'use strict';
 const panel=()=>document.getElementById('v4144GuildChatPanel');
 const close=()=>document.getElementById('v4144GuildChatClose');
 function stabilize(){
   const p=panel(),b=close();if(!p||!b)return;
   const vv=window.visualViewport;
   const vw=vv?.width||window.innerWidth||document.documentElement.clientWidth||0;
   const viewportTop=Math.max(0,Number(vv?.offsetTop||0));
   const viewportBottom=viewportTop+Math.max(0,Number(vv?.height||window.innerHeight||document.documentElement.clientHeight||0));
   const header=document.querySelector('.app > header');
   const hr=header?.getBoundingClientRect?.();
   const headerBottom=hr&&Number.isFinite(hr.bottom)?Math.max(0,hr.bottom):0;
   const top=Math.max(viewportTop,headerBottom)+6;
   const height=Math.max(220,viewportBottom-top);

   p.style.setProperty('--v4144-chat-top',`${Math.round(top)}px`);
   p.style.setProperty('--v4144-chat-height',`${Math.round(height)}px`);
   p.style.setProperty('top',`${Math.round(top)}px`,'important');
   p.style.setProperty('height',`${Math.round(height)}px`,'important');
   p.style.setProperty('max-height',`${Math.round(height)}px`,'important');

   b.style.setProperty('display','grid','important');
   b.style.setProperty('visibility','visible','important');
   b.style.setProperty('opacity','1','important');
   b.style.setProperty('pointer-events','auto','important');
   b.style.setProperty('position','absolute','important');
   b.style.setProperty('top','10px','important');

   if(vw<=700){
     p.style.setProperty('left','0','important');
     p.style.setProperty('right','0','important');
     p.style.setProperty('width','100vw','important');
     p.style.setProperty('max-width','100vw','important');
   }else{
     p.style.removeProperty('left');
     p.style.setProperty('right','0','important');
     p.style.setProperty('width','min(94vw,410px)','important');
     p.style.setProperty('max-width','min(94vw,410px)','important');
   }
   if(p.classList.contains('open'))p.scrollTop=0;
 }
 document.getElementById('v4144GuildChatTab')?.addEventListener('click',()=>requestAnimationFrame(stabilize),true);
 window.visualViewport?.addEventListener('resize',()=>{if(panel()?.classList.contains('open'))requestAnimationFrame(stabilize)},{passive:true});
 window.addEventListener('resize',()=>{if(panel()?.classList.contains('open'))requestAnimationFrame(stabilize)},{passive:true});
 window.addEventListener('orientationchange',()=>setTimeout(stabilize,80),{passive:true});
 window.visualViewport?.addEventListener('scroll',()=>{if(panel()?.classList.contains('open'))requestAnimationFrame(stabilize)},{passive:true});
 window.addEventListener('growlegends:foreground-ready',stabilize);
 window.addEventListener('pageshow',stabilize,{passive:true});
 requestAnimationFrame(stabilize);
})();

/* === v6310-guildboss-test-removal-guard === */
(()=>{
  'use strict';
  const remove=()=>{
    document.getElementById('v6204BossTestWrap')?.remove();
    document.getElementById('v6204BossTest')?.remove();
    document.getElementById('v260DailyBossArena')?.classList.remove('v6204-test-mode');
    try{delete window.v6204RunGuildBossTest}catch(_){window.v6204RunGuildBossTest=undefined}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',remove,{once:true});else remove();
  window.addEventListener('growlegends:account-ready',remove);
})();

