
(function(){
 const VERSION='V4.29 Stable';
 const LEAGUES=[
  {name:'Bronze',icon:'🥉',min:0},
  {name:'Silber',icon:'🥈',min:100},
  {name:'Gold',icon:'🥇',min:250},
  {name:'Platin',icon:'💠',min:500},
  {name:'Diamant',icon:'💎',min:1000},
  {name:'Legende',icon:'👑',min:2000}
 ];
 function buds(){
  try{if(typeof v207EnsurePvpState==='function')v207EnsurePvpState()}catch(e){}
  s.v204Pvp??={buds:0,wins:0,losses:0,fights:0,lastOpponent:null,lastBudReward:0};
  /* V4.06 rank points are deliberately ignored. PvP-Buds remain the single PvP progression value. */
  return Math.max(0,Math.floor(Number(s.v204Pvp.buds)||0));
 }
 function league(value){
  value=Math.max(0,Math.floor(Number(value)||0));let idx=0;
  for(let i=0;i<LEAGUES.length;i++)if(value>=LEAGUES[i].min)idx=i;
  return {...LEAGUES[idx],idx,buds:value,next:LEAGUES[idx+1]||null};
 }
 function cardHtml(){
  const L=league(buds()),base=L.min,next=L.next?.min||L.min,den=Math.max(1,next-base),pct=L.next?Math.max(0,Math.min(100,Math.round((L.buds-base)/den*100))):100;
  return `<div class="v407-league-card" id="v407LeagueCard"><div class="v407-league-top"><div class="v407-league-name">${L.icon} ${L.name}-Liga</div><div class="v407-league-buds">🌿 ${L.buds} PvP-Buds</div></div><div class="v407-league-bar"><i style="width:${pct}%"></i></div><div class="v407-league-next">${L.next?`Noch ${Math.max(0,L.next.min-L.buds)} PvP-Buds bis ${L.next.name}`:'Höchste Liga erreicht'}</div></div>`;
 }
 function installPvp(){
  const shell=document.querySelector('#pvp .v204-pvp-shell');if(!shell)return;
  shell.querySelectorAll('#v406LeagueCard,.v406-league-card').forEach(el=>el.remove());
  let card=shell.querySelector('#v407LeagueCard');
  if(card)card.outerHTML=cardHtml();
  else{const hero=shell.querySelector('.v204-pvp-hero');if(hero)hero.insertAdjacentHTML('afterend',cardHtml());else shell.insertAdjacentHTML('afterbegin',cardHtml())}
 }
 const baseRenderPage=window.v204RenderPage;
 if(typeof baseRenderPage==='function')window.v204RenderPage=function(){const r=baseRenderPage.apply(this,arguments);installPvp();return r};
 /* Refresh only after canonical PvP payout. Bud gain/loss rules stay owned by the existing PvP system. */
 const baseFinish=window.v209FinishBattle;
 if(typeof baseFinish==='function')window.v209FinishBattle=async function(){const r=await baseFinish.apply(this,arguments);try{installPvp()}catch(e){}return r};
 const baseOwn=window.v072RenderOwnProfile;
 if(typeof baseOwn==='function')window.v072RenderOwnProfile=function(){const r=baseOwn.apply(this,arguments);const el=document.querySelector('#v072OwnProfile');if(el){el.querySelectorAll('.v406-hall-league,.v407-hall-league').forEach(x=>x.remove());const L=league(buds());el.insertAdjacentHTML('beforeend',`<div class="v116-wb-inline v407-hall-league" style="margin-top:5px">${L.icon} ${L.name}-Liga · 🌿 ${L.buds} PvP-Buds</div>`)}return r};
 const baseOpen=window.v074OpenProfile;
 if(typeof baseOpen==='function')window.v074OpenProfile=async function(id){const r=await baseOpen.apply(this,arguments);try{if(window.v073User&&id===v073User.id){const sec=document.querySelector('#v074ProfileContent .v326-pvp');if(sec){sec.querySelectorAll('.v406-hall-league,.v407-hall-league').forEach(x=>x.remove());const L=league(buds());sec.insertAdjacentHTML('beforeend',`<div class="v326-profile-note v407-hall-league">${L.icon} ${L.name}-Liga · 🌿 ${L.buds} PvP-Buds</div>`)}}}catch(e){}return r};
 window.v407BudLeague=league;
 function version(){document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version,.v366-ver,.v371-logo em').forEach(el=>{if(el)el.textContent=VERSION});document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11')}
 version();installPvp();setTimeout(()=>{version();installPvp()},500);setTimeout(version,1800);
})();
