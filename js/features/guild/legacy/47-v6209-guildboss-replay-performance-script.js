/* === v6209-guildboss-replay-performance-script === */
(()=>{
  'use strict';
  if(window.__V6209_GUILD_BOSS_REPLAY_PERF__)return;
  window.__V6209_GUILD_BOSS_REPLAY_PERF__=true;
  let activePromise=null,preloadPromise=null;

  function arena(){return document.getElementById('v260DailyBossArena')}
  function clearTransient(a){
    if(!a)return;
    a.classList.remove('attack','hit','v6203-finisher','v6307-player-strike','v6307-boss-attack','v6307-hero-hit','v6307-cls-grower','v6307-cls-scout','v6307-cls-bruiser','v6307-cls-frost');
    ['v260DamagePop','v260BossDamagePop'].forEach(id=>{const n=document.getElementById(id);if(n)n.innerHTML=''});
  }
  function settle(){
    const a=arena();if(!a)return;
    clearTransient(a);
    a.classList.remove('v6209-replay-running');
    a.classList.add('v6209-replay-finished');
    try{v260DailyAnimating=false}catch(_){window.v260DailyAnimating=false}
  }
  function preloadArt(){
    if(preloadPromise)return preloadPromise;
    const art=window.__V6317_GUILD_BOSS_ART__||{};
    const urls=[...new Set(Object.values(art).filter(Boolean))];
    preloadPromise=Promise.allSettled(urls.map(src=>new Promise(resolve=>{
      const img=new Image();img.decoding='async';img.onload=async()=>{try{if(img.decode)await img.decode()}catch(_){}resolve()};img.onerror=resolve;img.src=src;
      if(img.complete)resolve();
    })));
    return preloadPromise;
  }
  async function run(){
    if(activePromise)return activePromise;
    const base=window.__V6209_BASE_REPLAY__ || window.v260AnimateDailyBoss;
    if(typeof base!=='function')return;
    if(!window.__V6209_BASE_REPLAY__)window.__V6209_BASE_REPLAY__=base;
    const a=arena();if(!a)return;
    a.classList.remove('v6209-replay-finished');
    a.classList.add('v6209-replay-running');
    clearTransient(a);
    activePromise=(async()=>{
      /* Warm the existing embedded class/boss art before the first transform animation. */
      try{await Promise.race([preloadArt(),new Promise(r=>setTimeout(r,900))])}catch(_){}
      return await window.__V6209_BASE_REPLAY__();
    })();
    try{return await activePromise}
    finally{activePromise=null;settle()}
  }
  function bind(){
    const current=window.v260AnimateDailyBoss;
    if(typeof current==='function' && current!==run && !window.__V6209_BASE_REPLAY__)window.__V6209_BASE_REPLAY__=current;
    window.v260AnimateDailyBoss=run;
    const old=document.getElementById('v260WatchDailyBoss');
    if(old && old.dataset.v6209Bound!=='1'){
      const btn=old.cloneNode(true);btn.dataset.v6209Bound='1';old.parentNode.replaceChild(btn,old);btn.addEventListener('click',run,{passive:true});
    }
    preloadArt();
  }
  /* If the page/tab is left, stop permanent visual GPU work immediately. */
  document.addEventListener('visibilitychange',()=>{if(document.hidden)settle()},{passive:true});
  document.addEventListener('click',e=>{
    const t=e.target instanceof Element?e.target:null;if(!t)return;
    if(t.closest('[data-screen]') && !t.closest('[data-screen="guild"]'))settle();
    const tab=t.closest('[data-v254-tab]');if(tab && tab.getAttribute('data-v254-tab')!=='boss')settle();
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  setTimeout(bind,600);setTimeout(bind,1800);
})();

