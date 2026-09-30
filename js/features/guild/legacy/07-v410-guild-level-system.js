/* === v410-guild-level-system === */
(function(){
 const VERSION='V4.29 Stable';
 /*
   Long-term guild progression without a second spendable currency.
   Progress is derived only from server-persisted guild upgrade levels.
   Instead of counting upgrade STEPS equally, it counts the lifetime Guild-Buds
   invested into the two existing upgrades. This makes late guild levels much
   slower and prevents a high player level from boosting a new guild directly.
 */
 const COSTS=[100,300,700,1500,3000,6000,12000,24000];
 const MAX_INVEST=COSTS.reduce((a,b)=>a+b,0)*2; // 95,200 Guild-Buds
 function clampUpgrade(v){return Math.max(0,Math.min(8,Math.floor(Number(v)||0)))}
 function spentFor(lv){lv=clampUpgrade(lv);let n=0;for(let i=0;i<lv;i++)n+=COSTS[i];return n}
 function invested(g){return spentFor(g?.xp_level)+spentFor(g?.gold_level)}
 /* Strongly rising curve: early levels are reachable, Lv20 requires both
    existing upgrades to be fully financed (95,200 lifetime Guild-Buds). */
 const THRESH=[0,100,300,700,1500,3000,5000,8000,12000,17000,23000,30000,38000,47000,57000,68000,78000,86000,91000,95200];
 function level(g){
   const x=invested(g); let lv=1;
   for(let i=1;i<THRESH.length;i++){if(x>=THRESH[i])lv=i+1;else break}
   return Math.max(1,Math.min(20,lv));
 }
 function nextInfo(g){
   const x=invested(g),lv=level(g);
   if(lv>=20)return {lv:20,pct:100,text:`${x.toLocaleString('de-DE')} / ${MAX_INVEST.toLocaleString('de-DE')} investierte Gilden-Buds · MAX`};
   const lo=THRESH[lv-1],hi=THRESH[lv];
   const pct=Math.max(0,Math.min(100,Math.round((x/Math.max(1,hi))*100)));
   return {lv,pct,text:`${x.toLocaleString('de-DE')} investierte Gilden-Buds · noch ${(hi-x).toLocaleString('de-DE')} bis Gildenlevel ${lv+1}`};
 }
 window.v409GuildLevel=level;
 window.v410GuildInvested=invested;
 window.v410GuildLevel=level;

 function paintOwn(){
   if(!window.v254Guild)return;
   const head=document.querySelector('.v254-guild-head'); if(!head)return;
   const info=nextInfo(v254Guild);
   let box=document.querySelector('.v409-guild-progress');
   if(!box){box=document.createElement('div');box.className='v409-guild-progress';head.insertAdjacentElement('afterend',box)}
   box.innerHTML=`<div class="v409-guild-progress-top"><span>🏰 GILDENFORTSCHRITT</span><b>Gildenlevel ${info.lv}</b></div><div class="v409-guild-progress-bar"><i style="width:${info.pct}%"></i></div><small>${info.text}</small>`;
 }

 /* Guild cleanup Phase 1: V409 render wrapper retired.
    V5.56 is the final visible guild-progress owner. */

 if(typeof v257GuildResultHtml==='function'){
   v257GuildResultHtml=function(g){
     const members=Number(g.member_count)||0;
     const max=Number(g.max_members)||20;
     const pending=!!g.request_pending;
     const lv=level(g);
     return `<div class="v257-guild-result"><div><b><span class="v257-result-tag">[${v254GuildEsc(g.tag||'GL')}]</span>${v254GuildEsc(g.name||'Gilde')}</b><small><span class="v409-search-level">🏰 Gildenlevel ${lv}</span> · 👥 ${members}/${max} · ⭐ EXP +${v254BonusPct(g.xp_level)}% · 💰 Gold +${v254BonusPct(g.gold_level)}%</small></div><button type="button" class="btn secondary" data-v257-apply="${g.id}" ${pending||members>=max?'disabled':''}>${pending?'✓ Anfrage gesendet':members>=max?'Gilde voll':'Beitritt anfragen'}</button></div>`;
   };
   window.v257GuildResultHtml=v257GuildResultHtml;
 }
 function version(){
   if(String(window.GROW_RELEASE_CHANNEL||'stable')==='beta'){window.__V8009_HOME10_V410_VERSION_RETIRED__=true;return}
   document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version').forEach(el=>{if(el)el.textContent=VERSION});
   document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11');
 }
 version();setTimeout(()=>{version();paintOwn()},700);setTimeout(version,2000);
})();

