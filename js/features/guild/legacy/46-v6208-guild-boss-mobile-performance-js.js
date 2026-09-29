/* === v6208-guild-boss-mobile-performance-js === */
(()=>{
  'use strict';
  const panel=()=>document.getElementById('v254GuildBoss');
  const active=()=>{
    const p=panel(),g=document.getElementById('guild');
    return !!p&&!!g?.classList.contains('active')&&p.style.display!=='none';
  };
  let timer=0,paused=false;
  function pauseForScroll(){
    if(!active())return;
    const p=panel();if(!p)return;
    if(!paused){paused=true;p.classList.add('v6208-scroll-pause')}
    clearTimeout(timer);
    timer=setTimeout(()=>{
      const x=panel();if(x)x.classList.remove('v6208-scroll-pause');
      paused=false;
    },140);
  }
  window.addEventListener('scroll',pauseForScroll,{passive:true});
  window.addEventListener('touchmove',pauseForScroll,{passive:true});
  document.addEventListener('click',e=>{
    const b=e.target?.closest?.('[data-v254-tab]');
    if(!b)return;
    if(String(b.dataset.v254Tab||'')!=='boss'){
      const p=panel();if(p)p.classList.remove('v6208-scroll-pause');
      paused=false;clearTimeout(timer);
    }
  },true);
})();

