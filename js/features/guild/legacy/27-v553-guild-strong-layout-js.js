/* === v553-guild-strong-layout-js === */
(function(){
  'use strict';
  const esc=v=>typeof v254GuildEsc==='function'?v254GuildEsc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function state(){
    try{return {guild:(typeof v254Guild!=='undefined'?v254Guild:null),membership:(typeof v254Membership!=='undefined'?v254Membership:null),members:(typeof v254Members!=='undefined'&&Array.isArray(v254Members)?v254Members:[])}}catch(e){return {guild:null,membership:null,members:[]}}
  }
  function ensureTitle(){
    const shell=document.querySelector('#guild .v254-guild-shell');if(!shell)return;
    let t=shell.querySelector(':scope > .v552-guild-title');
    if(!t){t=document.createElement('div');t.className='v552-guild-title';t.textContent='GILDE';shell.prepend(t)}
  }
  function buildHero(){
    const root=document.getElementById('guild'),hero=root?.querySelector('.v254-guild-hero');if(!root||!hero)return;
    const st=state(),has=!!st.guild&&!!st.membership;
    root.classList.toggle('v553-has-membership',has);
    root.classList.toggle('v553-no-membership',!has);
    root.classList.toggle('v552-has-membership',has);
    root.classList.toggle('v552-no-membership',!has);
    if(has){
      const g=st.guild,tag=String(g.tag||'GL').replace(/[\[\]]/g,'').slice(0,5),buds=Math.max(0,Number(g.guild_buds)||0),count=st.members.length;
      const needs=!hero.querySelector('.v552-guild-crest')||hero.dataset.v553Sig!==[g.id,g.name,g.tag,buds,count].join('|');
      if(needs){
        const progress=hero.querySelector('.v409-guild-progress');
        hero.innerHTML=`<div class="v552-guild-crest"><span class="leaf">🌿</span><b>[${esc(tag)}]</b></div>
          <div class="v552-guild-copy"><div class="v254-kicker">🌿 GEMEINSAM STÄRKER</div><h2>${esc(g.name||'Gilde')}</h2><div class="v552-guild-members-count">${count} Mitglied${count===1?'':'er'}</div><p>Kämpft gemeinsam gegen den täglichen Gildenboss, verbessert eure Boni und tretet im Gildenkrieg gegen andere Gilden an.</p></div>
          <div class="v254-buds"><b id="v254GuildBuds">${buds}</b><span>Gilden-Buds</span></div>`;
        if(progress)hero.appendChild(progress);
        hero.dataset.v553Sig=[g.id,g.name,g.tag,buds,count].join('|');
      }
    }
  }
  function moveProgress(){
    const root=document.getElementById('guild'),hero=root?.querySelector('.v254-guild-hero');if(!hero)return;
    const st=state();if(!st.guild||!st.membership)return;
    const p=root.querySelector('.v409-guild-progress');
    if(p&&p.parentElement!==hero)hero.appendChild(p);
  }
  function markMemberLayout(){
    document.querySelectorAll('#guild #v254GuildMembers .v254-member').forEach(row=>{
      const main=row.querySelector('.v254-member-main')||row.children[1];
      const flags=row.querySelector('.v254-member-flags');
      const actions=row.querySelector('.v257-member-actions');
      if(main)main.style.gridArea='main';if(flags)flags.style.gridArea='flags';if(actions)actions.style.gridArea='admin';
    });
  }
  function adminGrid(){
    const overview=document.getElementById('v254GuildOverview');if(!overview)return;
    const req=document.getElementById('v257RequestsCard');
    const mgmt=document.getElementById('v257GuildManagement')?.closest('.v254-card.v254-inner');
    if(!mgmt)return;
    let grid=overview.querySelector(':scope > .v552-admin-grid');
    if(!grid){grid=document.createElement('div');grid.className='v552-admin-grid';mgmt.before(grid)}
    if(req&&req.parentElement!==grid)grid.appendChild(req);
    if(mgmt.parentElement!==grid)grid.appendChild(mgmt);
  }
  function paint(){ensureTitle();buildHero();moveProgress();markMemberLayout();adminGrid()}
  /* V6.120: old strong-layout patch is one-time compatibility only. */
  paint();
  document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(paint),{once:true});
})();

