/* === v562-guild-boss-reference-js === */
(function(){
  'use strict';
  function buildBossLayout(){
    const panel=document.getElementById('v254GuildBoss');
    if(!panel)return;
    panel.classList.add('v562-boss-owner');

    /* Remove any legacy test DOM if another old render path ever recreates it. */
    panel.querySelector('#v258BossTestCard')?.remove();

    const hero=panel.querySelector(':scope > .v254-boss-stage');
    if(hero){
      hero.classList.add('v562-boss-hero');
      const monster=hero.querySelector('.v254-boss-monster');
      if(monster){monster.textContent='';monster.classList.add('v562-titan-art');monster.setAttribute('aria-label','Verseuchter Titan')}

      const status=panel.querySelector('.v254-status-grid');
      const signup=panel.querySelector('#v254BossSignup');
      let note=signup?.nextElementSibling;
      if(status&&status.parentElement!==hero)hero.appendChild(status);
      if(signup&&signup.parentElement!==hero)hero.appendChild(signup);
      if(note&&note!==status&&note.classList?.contains('muted')){
        note.classList.add('v562-signup-note');
        if(note.parentElement!==hero)hero.appendChild(note);
      }
      if(signup)signup.classList.toggle('v562-signed',!!(typeof v254Membership!=='undefined'&&v254Membership?.boss_signed));
    }

    const live=document.getElementById('v255BossLive');
    if(live){
      live.classList.add('v562-long-boss');
      let participants=panel.querySelector(':scope > .v562-boss-participants');
      if(!participants){
        participants=document.createElement('section');
        participants.className='v562-boss-participants';
        participants.innerHTML='<div class="v562-boss-participants-head">👥 ANGEMELDETE MITGLIEDER</div>';
        live.insertAdjacentElement('afterend',participants);
      }
      const timeline=document.getElementById('v255BossTimeline');
      if(timeline&&timeline.parentElement!==participants)participants.appendChild(timeline);
    }

    const flow=[...panel.querySelectorAll(':scope > .v254-card.v254-inner')].find(x=>/Boss-Ablauf/i.test(x.textContent||''));
    if(flow){
      flow.classList.add('v562-boss-flow');
      const title=flow.querySelector(':scope > b');
      if(title&&!/^⚔️/.test(title.textContent||''))title.textContent='⚔️ Boss-Ablauf';
    }
  }

  /* Keep the layout as the final owner after server renders change signup/count/participants. */
  try{
    if(typeof v255RenderBoss==='function'&&!window.__v562BossRenderWrapped){
      const base=v255RenderBoss;
      v255RenderBoss=function(){const r=base.apply(this,arguments);requestAnimationFrame(buildBossLayout);return r};
      try{window.v255RenderBoss=v255RenderBoss}catch(e){}
      window.__v562BossRenderWrapped=true;
    }
  }catch(e){}
  try{
    if(typeof v254RenderGuild==='function'&&!window.__v562BossGuildWrapped){
      const base=v254RenderGuild;
      v254RenderGuild=function(){const r=base.apply(this,arguments);requestAnimationFrame(buildBossLayout);return r};
      try{window.v254RenderGuild=v254RenderGuild}catch(e){}
      window.__v562BossGuildWrapped=true;
    }
  }catch(e){}

  document.addEventListener('click',e=>{if(e.target?.closest?.('[data-v254-tab="boss"]'))setTimeout(buildBossLayout,20)},true);
  document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(buildBossLayout),{once:true});
  window.addEventListener('pageshow',()=>requestAnimationFrame(buildBossLayout),{passive:true});
  [60,250,800,1800].forEach(ms=>setTimeout(buildBossLayout,ms));
})();

