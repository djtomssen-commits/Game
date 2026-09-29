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

/* V8.008-C18 — deferred visual installers; execution positions stay unchanged. */
window.v8008C18InstallPreVisual=function(){
  if(window.__V8008_C18_PRE_VISUAL__)return;
  window.__V8008_C18_PRE_VISUAL__=true;
/* V8.008-C8 BETA — boss visual owner before replay owner. */

/* === V8.008-C8 merged source: v6203-guild-boss-live-polish-script === */
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

/* === V8.008-C8 merged source: v6305-guildboss-layout-script === */
/* === v6305-guildboss-layout-script === */
(()=>{
  'use strict';
  if(window.__V6305_GUILDBOSS_LAYOUT__)return;
  window.__V6305_GUILDBOSS_LAYOUT__=true;
  function boot(){
    const arena=document.getElementById('v260DailyBossArena');if(!arena)return;
    const fighter=arena.querySelector('.v259-fighter-side'),boss=arena.querySelector('.v259-boss-side'),hpbar=arena.querySelector('.v259-boss-hp');
    
    
    if(hpbar&&!document.getElementById('v260BattleTop')){const top=document.createElement('div');top.id='v260BattleTop';top.innerHTML='<div id="v260BattleState" data-state="idle">Gildenboss bereit</div><div id="v260BattlePhase">Warte auf Wiedergabe</div>';hpbar.insertAdjacentElement('afterend',top)}
    const fightText=document.getElementById('v260FightText');
    if(fightText&&!document.getElementById('v260BattleLog')){const log=document.createElement('div');log.id='v260BattleLog';fightText.insertAdjacentElement('afterend',log)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  setTimeout(boot,650);
})();
};
window.v8008C18InstallPostArena=function(){
  if(window.__V8008_C18_POST_ARENA__)return;
  window.__V8008_C18_POST_ARENA__=true;
/* V8.008-C8 BETA — boss final arena/cleanup owner after replay owner. */

/* === V8.008-C8 merged source: v6309-guildboss-final-arena-script === */
/* === v6309-guildboss-final-arena-script === */
(()=>{
  'use strict';
  if(window.__V6309_GUILD_BOSS_FINAL_ARENA__)return;
  window.__V6309_GUILD_BOSS_FINAL_ARENA__=true;
  let queued=false;
  function ensureFinalArena(){
    const stage=document.querySelector('#v260DailyBossArena .v259-stage');if(!stage)return;
    if(!document.getElementById('v6309Clash')){const e=document.createElement('div');e.id='v6309Clash';stage.appendChild(e)}
    if(!document.getElementById('v6309HeroPlate')){const e=document.createElement('div');e.id='v6309HeroPlate';e.innerHTML='<img id="v6309HeroThumb" alt=""><div><b id="v6309HeroName">Kämpfer</b><small id="v6309HeroMeta"></small><div id="v6309HeroMiniBar"><i id="v6309HeroMiniFill"></i></div></div>';stage.appendChild(e)}
    if(!document.getElementById('v6309BossPlate')){const e=document.createElement('div');e.id='v6309BossPlate';e.innerHTML='<img id="v6309BossThumb" alt=""><div><b>Verseuchter Titan</b><small id="v6309BossMeta"></small><div id="v6309BossMiniBar"><i id="v6309BossMiniFill"></i></div></div>';stage.appendChild(e)}
  }
  function parseHp(text){const m=String(text||'').match(/([\d.,]+)\s*\/\s*([\d.,]+)/);if(!m)return null;const n=s=>Number(String(s).replace(/\./g,'').replace(',','.'))||0;return{hp:n(m[1]),max:Math.max(1,n(m[2]))}}
  function syncFinalArena(){
    queued=false;ensureFinalArena();
    const f=document.getElementById('v260FighterAvatar'),fn=document.getElementById('v260FighterName'),fm=document.getElementById('v260FighterMeta');
    const hThumb=document.getElementById('v6309HeroThumb'),hName=document.getElementById('v6309HeroName'),hMeta=document.getElementById('v6309HeroMeta'),cut=document.getElementById('v6320HeroCutout');
    if(hThumb&&(cut?.src||f?.src))hThumb.src=cut?.src||f.src;
    if(hName)hName.textContent=(fn?.textContent||'Kämpfer').replace(' · TEST','');
    if(hMeta)hMeta.textContent=fm?.textContent||'';
    const bossCut=document.getElementById('v6320BossCutout'),bImg=document.querySelector('#v260Titan .v6202-boss-img'),bThumb=document.getElementById('v6309BossThumb');
    if(bThumb&&(bossCut?.src||bImg?.src))bThumb.src=bossCut?.src||bImg.src;
    const hpText=document.getElementById('v260BossHpText')?.textContent||'',hp=parseHp(hpText),bMeta=document.getElementById('v6309BossMeta'),bFill=document.getElementById('v6309BossMiniFill');
    if(bMeta)bMeta.textContent=hpText||'Bereit';if(bFill&&hp)bFill.style.width=Math.max(0,Math.min(100,hp.hp/hp.max*100))+'%';
    const heroPct=Number((document.getElementById('v260HeroEnduranceText')?.textContent||'100').replace(/[^\d.]/g,''))||100,hFill=document.getElementById('v6309HeroMiniFill');if(hFill)hFill.style.width=Math.max(0,Math.min(100,heroPct))+'%';
  }
  function queue(){if(queued)return;queued=true;requestAnimationFrame(syncFinalArena)}
  function observe(){
    ensureFinalArena();
    ['v260FighterAvatar','v260FighterName','v260FighterMeta','v260BossHpText','v260HeroEnduranceText'].forEach(id=>{const el=document.getElementById(id);if(el&&!el.dataset.v6309Observed){el.dataset.v6309Observed='1';new MutationObserver(queue).observe(el,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['src','class','style']})}});
    queue();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
  setTimeout(observe,700);
})();

/* === V8.008-C8 merged source: v6315-guildboss-legacy-cleanup-script === */
/* === v6315-guildboss-legacy-cleanup-script === */
(()=>{
  'use strict';
  if(window.__V6315_GUILD_BOSS_LEGACY_CLEANUP__)return;
  window.__V6315_GUILD_BOSS_LEGACY_CLEANUP__=true;
  const trash=['v6308HeroHud','v6308BossHud','v6308ArenaPrompt','v260HeroImpact','v260BossImpact'];
  function clean(){
    trash.forEach(id=>document.getElementById(id)?.remove());
    document.querySelectorAll('#v260DailyBossArena .v6305-kicker').forEach(n=>n.remove());
    const vs=document.querySelector('#v260DailyBossArena .v259-vs');
    if(vs)vs.setAttribute('aria-hidden','true');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean,{once:true});else clean();
  setTimeout(clean,300);setTimeout(clean,1200);setTimeout(clean,2600);
})();
};
