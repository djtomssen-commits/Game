/* V8.008-C9 BETA — guild boss screen owner.
   V4.14 stage/meta logic executes here at its original load position.
   V5.62 reference layout is installed later through v8008C9InstallReferenceLayout()
   at the original V5.62 marker, preserving wrapper order. */

/* === v414-guild-boss-longterm === */
(function(){
 const VERSION='V4.29 Stable', SHORT='V4.29';
 let meta={stage:1,wins:0,next_hp:12000,reward_buds:20};
 let warned=false;
 function fmt(n){return Math.max(0,Math.round(Number(n)||0)).toLocaleString('de-DE')}
 function roundStage(){
   const next=Math.max(1,Number(meta.stage)||1);
   return v255BossRound?.status==='won'?Math.max(1,next-1):next;
 }
 function paint(){
   const live=document.querySelector('#v255BossLive'); if(!live)return;
   let box=document.querySelector('#v414BossStageBox');
   if(!box){box=document.createElement('div');box.id='v414BossStageBox';box.className='v414-boss-stagebox';live.prepend(box)}
   const stage=roundStage(), next=Math.max(1,Number(meta.stage)||1), won=v255BossRound?.status==='won';
   let hp=Number(meta.next_hp)||12000;
   if(won&&stage<next)hp=Math.max(12000,Math.round(hp/1.28));
   box.innerHTML=`<div class="v414-boss-stage-top"><span>☣ LANGZEIT-GILDENBOSS</span><b>Boss-Stufe ${stage}</b></div><small>${won?`Besiegt · nächste Herausforderung: <strong>Stufe ${next}</strong> mit ca. ${fmt(meta.next_hp)} HP.`:`Ziel: ca. <strong>${fmt(hp)} HP</strong> · ${Number(meta.wins)||0} Titan${Number(meta.wins)===1?'':'e'} dauerhaft besiegt.`}<br>Stärker werden zählt: Boss-HP skaliert nicht mehr automatisch mit eurer aktuellen Kampfkraft.</small>`;
   const hpText=document.querySelector('#v255BossHpText');
   if(hpText&&v255BossRound){const max=Math.max(1,Number(v255BossRound.boss_max_hp)||1),hpNow=Math.max(0,Number(v255BossRound.boss_hp)||0);hpText.textContent=`Verseuchter Titan · Stufe ${stage} · ${fmt(hpNow)} / ${fmt(max)} HP`}
   document.querySelectorAll('#v260DailyBossArena .v259-boss-title b,#v258BossArena .v259-boss-title b').forEach(el=>el.textContent=`☣ Verseuchter Titan · Stufe ${stage}`);
 }
 async function loadMeta(){
   try{
     if(typeof v073Db==='undefined'||!v073Db||typeof v254Membership==='undefined'||!v254Membership)return paint();
     const {data,error}=await v073Db.rpc('v414_get_guild_boss_stage');
     if(error)throw error;
     const r=Array.isArray(data)?data[0]:data; if(r)meta={...meta,...r};
   }catch(e){if(!warned&&/v414_get_guild_boss_stage|does not exist|schema cache/i.test(String(e?.message||''))){warned=true;console.warn('V4.14 Guild Boss SQL fehlt')}}
   paint();
 }
 if(typeof v255RenderBoss==='function'){
   const base=v255RenderBoss;v255RenderBoss=function(){const r=base.apply(this,arguments);paint();return r};window.v255RenderBoss=v255RenderBoss;
 }
 if(typeof v255LoadBoss==='function'){
   const base=v255LoadBoss;v255LoadBoss=async function(){const r=await base.apply(this,arguments);await loadMeta();paint();return r};window.v255LoadBoss=v255LoadBoss;
 }
 function stamp(){}
 stamp();loadMeta();setTimeout(()=>{stamp();paint()},800);
})();

window.v8008C9InstallReferenceLayout=function(){
  if(window.__V8008_C9_REFERENCE_LAYOUT_INSTALLED__)return;
  window.__V8008_C9_REFERENCE_LAYOUT_INSTALLED__=true;
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
};
