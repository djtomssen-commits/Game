/* === v6203-guild-boss-live-polish-script === */
(()=>{
  'use strict';
  if(window.__V6203_GUILD_BOSS_WORLDLIKE__)return;
  window.__V6203_GUILD_BOSS_WORLDLIKE__=true;
  function ensureFx(){
    const titan=document.getElementById('v260Titan');
    if(!titan)return;
    if(!titan.querySelector('.v6203-ground-glow')){const glow=document.createElement('span');glow.className='v6203-ground-glow';glow.setAttribute('aria-hidden','true');titan.prepend(glow)}
    const frame=titan.querySelector('.v6202-boss-frame');
    if(frame){
      if(!frame.querySelector('.v6203-runes')){const n=document.createElement('span');n.className='v6203-runes';n.setAttribute('aria-hidden','true');frame.appendChild(n)}
      if(!frame.querySelector('.v6203-hit-ring')){const n=document.createElement('span');n.className='v6203-hit-ring';n.setAttribute('aria-hidden','true');frame.appendChild(n)}
      if(!frame.querySelector('.v6203-hit-flare')){const n=document.createElement('span');n.className='v6203-hit-flare';n.setAttribute('aria-hidden','true');frame.appendChild(n)}
    }
  }
  const oldSetHp=window.v260SetRealBossHp;
  window.v260SetRealBossHp=function(hp,max){
    if(typeof oldSetHp==='function')oldSetHp(hp,max);
    ensureFx();
    const titan=document.getElementById('v260Titan'),arena=document.getElementById('v260DailyBossArena');
    if(!titan||!arena)return;
    const m=Math.max(1,Number(max)||1),h=Math.max(0,Number(hp)||0),ratio=h/m;
    titan.classList.toggle('v6203-low',ratio<=.38&&ratio>0);
    titan.classList.toggle('v6203-enraged',ratio<=.18&&ratio>0);
    arena.classList.toggle('v6203-low',ratio<=.38&&ratio>0);
    arena.classList.toggle('v6203-enraged',ratio<=.18&&ratio>0);
  };
  try{ensureFx()}catch(_){ }
})();

