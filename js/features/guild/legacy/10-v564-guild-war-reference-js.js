/* === v564-guild-war-reference-js === */
(function(){
  'use strict';
  function polish(){
    const panel=document.getElementById('v254GuildWar');
    if(!panel)return;
    panel.classList.add('v564-war-panel');
    panel.querySelector('.v254-war-head')?.classList.add('v564-war-hero');
    panel.querySelector('.v254-war-head>div:first-child')?.classList.add('v564-war-copy');
    panel.querySelector('.v254-signup-grid')?.classList.add('v564-signup-grid');
    panel.querySelectorAll('.v254-signup').forEach(x=>x.classList.add('v564-signup'));
    const daily=panel.querySelector('.v254-card.v254-inner:not(.v4159-war-manage)');
    if(daily){
      daily.classList.add('v564-war-daily');
      daily.querySelector('.section-title')?.classList.add('v564-war-title');
      daily.querySelector('.v262-war-score')?.classList.add('v564-war-score');
      daily.querySelector('.v262-war-status')?.classList.add('v564-war-status');
      daily.querySelector('.v262-war-stats')?.classList.add('v564-war-stats');
    }
  }
  polish();
  document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(polish),{once:true});
  document.addEventListener('click',e=>{if(e.target?.closest?.('[data-v254-tab="war"],[data-screen="guild"]'))setTimeout(polish,30)},true);
  [100,450,1000,2200].forEach(ms=>setTimeout(polish,ms));
  if(typeof v254RenderGuild==='function'&&!window.__v564GuildWarPolish){
    const base=v254RenderGuild;
    v254RenderGuild=function(){const r=base.apply(this,arguments);requestAnimationFrame(()=>setTimeout(polish,20));return r};
    try{window.v254RenderGuild=v254RenderGuild}catch(e){}
    window.__v564GuildWarPolish=true;
  }
})();

