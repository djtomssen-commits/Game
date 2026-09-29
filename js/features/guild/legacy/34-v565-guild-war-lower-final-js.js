/* === v565-guild-war-lower-final-js === */
(()=>{
 'use strict';
 if(window.__V6214_GUILD_WAR_POLISH__)return;
 window.__V6214_GUILD_WAR_POLISH__=true;
 function polishWarLower(){
  const panel=document.getElementById('v254GuildWar');
  if(!panel)return;
  const daily=panel.querySelector('.v254-card.v254-inner:not(.v4159-war-manage)');
  if(daily)daily.classList.add('v565-war-daily-final');
  const participants=document.getElementById('v4159Participants');
  if(participants){
   participants.classList.add('v565-war-sides');
   const sides=participants.querySelectorAll(':scope > .v4159-side');
   if(sides[0])sides[0].classList.add('v565-war-side-own');
   if(sides[1])sides[1].classList.add('v565-war-side-enemy');
  }
 }
 window.v6214PolishGuildWar=polishWarLower;
 try{
  const base=window.v262RenderWar;
  if(typeof base==='function'&&!base.__v6214WarPolish){
   const wrapped=function(){const r=base.apply(this,arguments);polishWarLower();return r};
   wrapped.__v6214WarPolish=true;wrapped.__v6214Base=base;
   window.v262RenderWar=wrapped;try{v262RenderWar=wrapped}catch(_){}
  }
 }catch(_){}
 document.addEventListener('click',e=>{if(e.target?.closest?.('[data-v254-tab="war"],[data-screen="guild"]'))setTimeout(polishWarLower,0)},true);
 window.addEventListener('pageshow',()=>setTimeout(polishWarLower,0),{passive:true});
 window.addEventListener('growlegends:account-ready',()=>setTimeout(polishWarLower,80));
 setTimeout(polishWarLower,0);
})();

