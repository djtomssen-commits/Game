import { chromium } from 'playwright';
import path from 'node:path';

const root=process.cwd();
const p=(s)=>path.join(root,s);

function assert(cond,msg){
  if(!cond)throw new Error(msg);
}

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const consoleErrors=[];
page.on('pageerror',e=>consoleErrors.push(String(e)));
page.on('console',m=>{ if(m.type()==='error') consoleErrors.push(m.text()) });

await page.setContent(`<!doctype html><html><head></head><body>
<div id="guild" class="active">
  <div class="v254-guild-shell"></div>
  <section id="v254GuildBoss" style="display:block">
    <div class="v254-boss-stage">
      <div class="v254-boss-monster"></div>
      <div class="v254-status-grid"></div>
      <button id="v254BossSignup">Anmelden</button>
      <div class="muted">Anmeldung bis 19:00</div>
    </div>
    <div id="v255BossLive">
      <div id="v255BossHpText"></div>
      <div><i id="v255BossHpFill"></i></div>
      <div id="v255BossResult"></div>
      <div id="v255BossTimeline"></div>
    </div>
    <div class="v254-card v254-inner"><b>Boss-Ablauf</b></div>
    <span id="v254BossSignupState"></span><span id="v254BossCount"></span>
    <button id="v255ClaimBossReward"></button>
    <div id="v260DailyBossArena">
      <div id="v260BattleTop"><span id="v260BattleState"></span><span id="v260BattlePhase"></span></div>
      <div class="v259-stage">
        <div class="v259-fighter-side">
          <img id="v260FighterAvatar" alt="">
          <b id="v260FighterName"></b><small id="v260FighterMeta"></small>
          <div id="v260HeroImpact"></div>
        </div>
        <div class="v259-vs">VS</div>
        <div class="v259-boss-side">
          <div id="v260Titan"><div class="v6202-boss-frame"><img class="v6202-boss-img" alt=""></div></div>
        </div>
        <img id="v6320HeroCutout" alt="">
        <img id="v6320BossCutout" alt="">
      </div>
      <div id="v260BossHpText"></div><div><i id="v260BossHpFill"></i></div>
      <div id="v260FightText"></div>
      <div id="v260DamagePop"></div>
      <div id="v260DailySummary"></div>
      <div id="v260BattleLog"></div>
    </div>
    <button id="v260WatchDailyBoss">Replay</button>
  </section>
  <section id="v254GuildWar" style="display:block">
    <div id="v262WarReplay"></div>
    <button id="v262WarRefresh"></button>
    <button id="v262WarWatch"></button>
    <button id="v262WarClaim"></button>
    <div id="v262WarStatus"></div><div id="v262WarPhase"></div>
    <div id="v262WarOwnName"></div><div id="v262WarEnemyName"></div>
    <div id="v262WarOwnScore"></div><div id="v262WarEnemyScore"></div>
    <div id="v262WarStats"></div>
  </section>
</div>
</body></html>`);

await page.addStyleTag({path:p('css/features/guild/legacy/v6321-guildboss-combat-animation-css.css')});

await page.evaluate(()=>{
  window.v073User={id:'qa-user'};
  window.v254Membership={guild_id:'qa-guild',role:'leader',boss_signed:true};
  window.v254Guild={id:'qa-guild',name:'QA Guild'};
  window.v254Members=[];
  window.v073Db={};
  window.v254GuildEsc=(x)=>String(x??'');
  window.v080AvatarFor=()=>'/assets/avatar/qa.png';
  window.v254EnsureOnline=async()=>true;
  window.v063Toast=()=>{};
  window.v254LoadGuild=async()=>{};
  window.v254RenderGuild=()=>{};
  window.v254ToggleSignup=async()=>{};
  window.v408GuildGold=(n)=>n;
  window.addXp=()=>{};
  window.persist=()=>{};
  window.render=()=>{};
  window.s={gold:0,xp:0,harzTaler:0};
});

await page.addScriptTag({path:p('js/features/guild/beta/v8008-c10-guildboss-timing.js')});
await page.addScriptTag({path:p('js/features/guild/legacy/01-v255-daily-guild-boss-core.js')});
await page.addScriptTag({path:p('js/features/guild/beta/v8008-c25-guildboss-runtime-owner.js')});
await page.evaluate(()=>window.v8008C12InstallLateBridge?.());
await page.addScriptTag({path:p('js/features/guild/beta/v8008-c18-guildboss-screen-visual-owner.js')});
await page.evaluate(()=>window.v8008C25InstallReliability?.());
await page.evaluate(()=>{
  window.v8008C9InstallReferenceLayout?.();
  window.v8008C18InstallPreVisual?.();
});
await page.addScriptTag({path:p('js/features/guild/beta/v8008-c18-guildboss-replay-owner.js')});
await page.evaluate(()=>window.v8008C18InstallPostArena?.());

const bossResult=await page.evaluate(async()=>{
  v255BossRound={
    id:'qa-boss-round',
    battle_date:'2026-09-28',
    boss_name:'Der Verseuchte Titan',
    boss_max_hp:10000,
    boss_hp:0,
    status:'won',
    participant_count:3,
    can_claim:false
  };
  v255BossParticipants=[
    {user_id:'1',character_name:'Alpha',class_id:'grower',class_name:'Bud-Barbar',level:100,combat_power:3000,damage_done:3200,boss_hp_after:6800},
    {user_id:'2',character_name:'Beta',class_id:'scout',class_name:'Blatt-Schütze',level:100,combat_power:3000,damage_done:3500,boss_hp_after:3300},
    {user_id:'3',character_name:'Gamma',class_id:'frost',class_name:'Frost-Todesritter',level:100,combat_power:3000,damage_done:3300,boss_hp_after:0}
  ];
  v255RenderBoss();
  await new Promise(r=>setTimeout(r,20));
  const arena=document.getElementById('v260DailyBossArena');
  const history=[];
  new MutationObserver(()=>history.push(arena.className)).observe(arena,{attributes:true,attributeFilter:['class']});
  await window.v260AnimateDailyBoss();
  await new Promise(r=>setTimeout(r,30));
  return {
    history,
    className:arena.className,
    fightText:document.getElementById('v260FightText')?.textContent||'',
    summary:document.getElementById('v260DailySummary')?.textContent||'',
    logRows:document.querySelectorAll('#v260BattleLog .v6305-log-row').length,
    fx:{
      ground:!!document.getElementById('v6321GroundPulse'),
      slash:!!document.getElementById('v6321HeroSlash'),
      claw:!!document.getElementById('v6321BossClaw'),
      impact:!!document.getElementById('v6321ImpactFlash')
    },
    heroAnim:getComputedStyle(document.getElementById('v6320HeroCutout')).animationName,
    bossAnim:getComputedStyle(document.getElementById('v6320BossCutout')).animationName,
    renderer:document.getElementById('v260WatchDailyBoss')?.dataset?.guildBossRenderer||'',
    replayRunningOwner:!!window.__V6209_GUILD_BOSS_REPLAY_PERF__,
    retiredTestHookAbsent:!document.getElementById('v6204BossTest') && typeof window.v6204RunGuildBossTest==='undefined',
    combatAnimOwner:!!window.__V6321_GUILD_BOSS_COMBAT_ANIM__,
    preVisualOwner:!!window.__V6203_GUILD_BOSS_WORLDLIKE__ && !!window.__V6305_GUILDBOSS_LAYOUT__,
    postArenaOwner:!!window.__V6309_GUILD_BOSS_FINAL_ARENA__ && !!window.__V6315_GUILD_BOSS_LEGACY_CLEANUP__,
    finalArena:{
      clash:!!document.getElementById('v6309Clash'),
      heroPlate:!!document.getElementById('v6309HeroPlate'),
      bossPlate:!!document.getElementById('v6309BossPlate')
    },
    timingOwner:{
      sleep:typeof v259Sleep==='function',
      oldSetHp:typeof window.v259SetBossHp==='function',
      oldAnimate:typeof window.v259AnimateBossResult==='function'
    },
    runtimeOwner:{
      installed:!!window.__V8008_C11_GUILD_BOSS_RUNTIME__,
      c12:!!window.__V8008_C12_GUILD_BOSS_RUNTIME__,
      lateBridge:!!window.__V8008_C12_LATE_BRIDGE_INSTALLED__,
      reliability:typeof window.v4119LoadBossStage==='function',
      roundResolved:typeof window.v260RoundResolved==='function',
      maybeAutoPlay:typeof window.v260MaybeAutoPlay==='function',
      hpSetter:typeof window.v260SetRealBossHp==='function',
      renderControls:typeof window.v260RenderDailyControls==='function'
    },
    screenOwner:{
      installed:!!window.__V8008_C9_REFERENCE_LAYOUT_INSTALLED__,
      stageBox:!!document.getElementById('v414BossStageBox'),
      panelClass:document.getElementById('v254GuildBoss')?.classList.contains('v562-boss-owner')||false,
      heroClass:document.querySelector('#v254GuildBoss > .v254-boss-stage')?.classList.contains('v562-boss-hero')||false,
      titanArt:document.querySelector('#v254GuildBoss .v254-boss-monster')?.classList.contains('v562-titan-art')||false,
      signupMoved:document.getElementById('v254BossSignup')?.parentElement?.classList.contains('v254-boss-stage')||false,
      signedClass:document.getElementById('v254BossSignup')?.classList.contains('v562-signed')||false,
      participantSection:!!document.querySelector('#v254GuildBoss > .v562-boss-participants #v255BossTimeline'),
      flowClass:document.querySelector('#v254GuildBoss > .v254-card.v254-inner')?.classList.contains('v562-boss-flow')||false
    }
  };
});

assert(bossResult.history.some(x=>x.includes('v6307-player-strike')),'Boss QA: player-strike phase never occurred');
assert(bossResult.history.some(x=>x.includes('hit')),'Boss QA: hit phase never occurred');
assert(bossResult.history.some(x=>x.includes('v6307-boss-attack')),'Boss QA: boss counter phase never occurred');
assert(bossResult.history.some(x=>x.includes('v6307-hero-hit')),'Boss QA: hero-hit phase never occurred');
assert(bossResult.className.includes('v261-final'),'Boss QA: final phase missing');
assert(bossResult.className.includes('win'),'Boss QA: win phase missing');
assert(/GILDENSIEG/i.test(bossResult.fightText),'Boss QA: final victory text missing');
assert(bossResult.logRows===3,`Boss QA: expected 3 combat log rows, got ${bossResult.logRows}`);
assert(Object.values(bossResult.fx).every(Boolean),'Boss QA: one or more combat FX nodes missing');
assert(bossResult.heroAnim && bossResult.heroAnim!=='none','Boss QA: hero CSS animation not active');
assert(bossResult.bossAnim && bossResult.bossAnim!=='none','Boss QA: boss CSS animation not active');
assert(bossResult.renderer==='v6307','Boss QA: merged owner did not mark replay renderer');
assert(bossResult.replayRunningOwner,'Boss QA: merged replay performance owner missing');
assert(bossResult.retiredTestHookAbsent,'Boss QA: retired V6.204 test hook unexpectedly present');
assert(bossResult.combatAnimOwner,'Boss QA: merged combat animation owner missing');
assert(bossResult.preVisualOwner,'Boss QA: C8 pre-replay visual owner missing');
assert(bossResult.postArenaOwner,'Boss QA: C8 post-replay arena owner missing');
assert(Object.values(bossResult.finalArena).every(Boolean),'Boss QA: C8 final arena nodes missing');
assert(bossResult.timingOwner.sleep,'Boss QA: C10 v259Sleep utility missing');
assert(!bossResult.timingOwner.oldSetHp && !bossResult.timingOwner.oldAnimate,'Boss QA: retired V259 test animation APIs unexpectedly present');
assert(Object.values(bossResult.runtimeOwner).every(Boolean),'Boss QA: C11 runtime core incomplete');
assert(Object.values(bossResult.screenOwner).every(Boolean),'Boss QA: C9 boss screen owner/layout incomplete');

await page.evaluate(()=>window.v8008C18InstallSignup?.());
const signupResult=await page.evaluate(async()=>{
  v254Membership.boss_signed=false;
  v255BossRound=null;
  v255BossParticipants=[];
  v073Db.rpc=async(name,args)=>{
    if(name==='v7307_set_guild_boss_signup'){
      return {data:{
        ok:true,
        registered:true,
        participant_count:1,
        participants:[{user_id:'qa-user',character_name:'QA User',class_id:'grower',class_name:'Bud-Barbar',level:100,combat_power:3200,damage_done:null}]
      },error:null};
    }
    if(name==='v255_get_guild_boss'){
      return {data:{
        round:null,
        participants:[{user_id:'qa-user',character_name:'QA User',class_id:'grower',class_name:'Bud-Barbar',level:100,combat_power:3200,damage_done:null}]
      },error:null};
    }
    return {data:null,error:null};
  };
  const registered=await window.v7307SetGuildBossSignup();
  return {
    installer:!!window.__V8008_C18_SIGNUP_INSTALLER__,
    owner:!!window.__v7307BossSignupOwner,
    registered,
    membership:!!v254Membership.boss_signed,
    participantCount:Array.isArray(v255BossParticipants)?v255BossParticipants.length:0,
    visibleCount:document.getElementById('v254BossCount')?.textContent||''
  };
});
assert(signupResult.installer && signupResult.owner,'Boss QA: C18 signup owner not installed');
assert(signupResult.registered===true && signupResult.membership,'Boss QA: authoritative signup did not register');
assert(signupResult.participantCount===1,'Boss QA: signup participant read-back failed');

await page.evaluate(()=>{
  window.v7081UseAuthority=()=>true;
  s.gold=0;s.xp=0;s.harzTaler=0;
  v073Db.rpc=async(name,args)=>{
    if(name==='v255_claim_guild_boss_reward')return {data:{ok:true,won:true,gold:100,xp:50,harz:2,progress:{level:1,xp:50,gold:100,harz:2}},error:null};
    if(name==='v255_get_guild_boss')return {data:{round:v255BossRound,participants:v255BossParticipants},error:null};
    return {data:null,error:null};
  };
  window.v8008C25InstallRewards?.();
  document.getElementById('v255ClaimBossReward')?.click();
});
await page.waitForTimeout(80);
const rewardResult=await page.evaluate(()=>({
  gold:s.gold,xp:s.xp,harz:s.harzTaler,
  installed:!!window.__V7078_SERVER_GUILD_REWARDS__,
  diagnostics:window.v7078GuildRewardDiagnostics?.()
}));
assert(rewardResult.installed,'Boss QA: C25 server reward owner not installed');
assert(rewardResult.gold===100 && rewardResult.xp===50 && rewardResult.harz===2,'Boss QA: server reward claim did not apply authoritative progress');
assert(rewardResult.diagnostics?.bossClaims===1,'Boss QA: server reward claim counter mismatch');



await page.addScriptTag({path:p('js/features/guild/beta/v8008-c25-guildwar-owner.js')});
await page.evaluate(()=>{
  window.__V200_AUTH_READY__=false;
  window.v8008C25InstallWarAuthority?.();
  window.v8008C25InstallWarVisual?.();
  window.v8008C25InstallWarLower?.();
});

const warResult=await page.evaluate(async()=>{
  v262War={
    id:'qa-war',
    my_guild_id:'a',guild_a_id:'a',guild_b_id:'b',
    guild_a_name:'QA Guild',guild_b_name:'Test Gegner',
    score_a:2,score_b:0,status:'a_won',
    my_attackers:2,my_defenders:2,i_participated:true,reward_claimed:true
  };
  v262WarDuels=[
    {winner_side:'attacker',attacker_name:'Alpha',defender_name:'Enemy A',attacker_level:100,defender_level:100,attacker_power:3000,defender_power:2800,attacker_hp_after:1200,defender_hp_after:0},
    {winner_side:'defender',attacker_name:'Enemy B',defender_name:'Beta',attacker_level:100,defender_level:100,attacker_power:2700,defender_power:3100,attacker_hp_after:0,defender_hp_after:1400}
  ];
  await v262WatchWar();
  return {
    rows:document.querySelectorAll('#v262WarReplay .v262-duel').length,
    text:document.getElementById('v262WarReplay')?.textContent||'',
    leftWins:document.querySelectorAll('#v262WarReplay .winner-left').length,
    rightWins:document.querySelectorAll('#v262WarReplay .winner-right').length
  };
});
assert(warResult.rows===2,`War QA: expected 2 replay duels, got ${warResult.rows}`);
assert(warResult.leftWins===1 && warResult.rightWins===1,'War QA: winner-side rendering is inconsistent');
assert(/Alpha/.test(warResult.text) && /Beta/.test(warResult.text),'War QA: duel participant names missing');

if(consoleErrors.length){
  throw new Error('Browser console/page errors: '+consoleErrors.join(' | '));
}

console.log(JSON.stringify({
  ok:true,
  boss:{
    phases:['player-strike','hit','boss-attack','hero-hit','final-win'],
    logRows:bossResult.logRows,
    heroAnimation:bossResult.heroAnim,
    bossAnimation:bossResult.bossAnim,
    fx:bossResult.fx
  },
  war:warResult
},null,2));

await browser.close();
