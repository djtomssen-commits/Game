(function(){
  const VERSION='V4.29 Stable';
  const SHORT='V4.29';

  function paintVersion(){
    try{document.title='Grow Legends V4.29'}catch(e){}
    document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version')
      .forEach(el=>{if(el)el.textContent=VERSION});
    document.querySelectorAll('.v366-ver,.v371-logo em,.v372-logo em')
      .forEach(el=>{if(el)el.textContent=SHORT});
  }

  /* V4.11 used window.v254Guild / window.v073Db checks even though those are
     top-level lexical bindings (let), so the guild-XP UI and awards could be skipped. */
  function v412GuildInfo(g){
    const THRESH=[0,500,1500,3500,7000,12500,20500,31500,46000,65000,90000,122000,162000,212000,275000,355000,460000,600000,900000,1800000];
    const x=Math.max(0,Math.floor(Number(g?.guild_xp)||0));
    let lv=1;for(let i=1;i<THRESH.length;i++){if(x>=THRESH[i])lv=i+1;else break}
    lv=Math.max(1,Math.min(20,lv));
    if(lv>=20)return {lv,pct:100,text:`${x.toLocaleString('de-DE')} Gilden-EP · MAX`};
    const lo=THRESH[lv-1],hi=THRESH[lv];
    const pct=Math.max(0,Math.min(100,Math.round((x/Math.max(1,hi))*100)));
    return {lv,pct,text:`${x.toLocaleString('de-DE')} / ${hi.toLocaleString('de-DE')} Gilden-EP · noch ${(hi-x).toLocaleString('de-DE')} bis Level ${lv+1}`};
  }

  function paintGuildXp(){
    try{
      if(typeof v254Guild==='undefined' || !v254Guild)return;
      const head=document.querySelector('.v254-guild-head');
      if(!head)return;
      const z=v412GuildInfo(v254Guild);
      let box=document.querySelector('.v409-guild-progress');
      if(!box){box=document.createElement('div');box.className='v409-guild-progress';head.insertAdjacentElement('afterend',box)}
      box.innerHTML=`<div class="v409-guild-progress-top"><span>🏰 GILDENFORTSCHRITT</span><b>Gildenlevel ${z.lv}</b></div><div class="v409-guild-progress-bar"><i style="width:${z.pct}%"></i></div><small class="v411-xp-note">${z.text}</small>`;
    }catch(e){console.warn('V4.21 guild XP paint',e)}
  }

  async function awardGuildActivity(kind){
    try{
      if(typeof v073Db==='undefined'||!v073Db||typeof v073User==='undefined'||!v073User||typeof v254Membership==='undefined'||!v254Membership)return;
      const {data,error}=await v073Db.rpc('v411_add_guild_activity',{p_kind:kind});
      if(error){
        if(/v411_add_guild_activity|does not exist|schema cache/i.test(String(error.message||'')))console.warn('V4.11 Guild XP SQL fehlt');
        return;
      }
      const r=Array.isArray(data)?data[0]:data;
      if(r&&Number(r.awarded)>0&&typeof v254Guild!=='undefined'&&v254Guild){
        v254Guild.guild_xp=Number(r.guild_xp)||0;
        paintGuildXp();
      }
    }catch(e){console.warn('V4.21 guild activity',e)}
  }
  window.v411AwardGuildActivity=awardGuildActivity;

  /* Re-own the final activity hooks so the corrected lexical checks are used. */
  if(!window.__V6140_EVENT_BUS__){
  if(typeof claimQuest==='function'){
    const base=claimQuest;
    claimQuest=function(){
      const q=s.quests?.active,ready=!!q&&Date.now()>=Number(q.ends||0);
      const r=base.apply(this,arguments);
      if(ready&&!s.quests?.active)void awardGuildActivity('quest');
      return r;
    };
    window.claimQuest=claimQuest;
  }
  if(typeof fightDungeon==='function'){
    const base=fightDungeon;
    fightDungeon=async function(){
      let before=0;try{before=typeof v336CanonicalDungeonWins==='function'?Number(v336CanonicalDungeonWins())||0:Number(s.v106Achievements?.stats?.dungeonWins)||0}catch(e){}
      const r=await base.apply(this,arguments);
      let after=before;try{after=typeof v336CanonicalDungeonWins==='function'?Number(v336CanonicalDungeonWins())||0:Number(s.v106Achievements?.stats?.dungeonWins)||0}catch(e){}
      if(after>before)void awardGuildActivity('dungeon');
      return r;
    };
    window.fightDungeon=fightDungeon;
  }
  if(typeof v209FinishBattle==='function'){
    const base=v209FinishBattle;
    v209FinishBattle=async function(win){const r=await base.apply(this,arguments);if(win)void awardGuildActivity('pvp_win');return r};
    window.v209FinishBattle=v209FinishBattle;
  }
  }

  /* V4.14: guild-boss activity is awarded inside the confirmed reward RPC path.
     The former click + 1.4 s heuristic was removed to avoid duplicate/false awards. */

  /* Guild cleanup Phase 1: V4.14 guild-XP render wrapper retired.
     Activity/server logic remains; V5.56 paints the visible progress. */

  /* The global 2x-EXP decorator used to match "EXP-Bonus" in the guild upgrade card. */
  function cleanGuildXpDecoration(){
    document.querySelectorAll('#guild .v095-xp2').forEach(el=>el.remove());
    document.querySelectorAll('#guild .v095-xp-text-active').forEach(el=>el.classList.remove('v095-xp-text-active'));
  }
  if(typeof v095DecorateXp==='function'){
    const base=v095DecorateXp;
    v095DecorateXp=function(){const r=base.apply(this,arguments);cleanGuildXpDecoration();return r};
  }

  /* Navigation is a safe repaint point for version + guild progress. */
  if(typeof v032Go==='function'){
    const base=v032Go;
    v032Go=function(id){const r=base.apply(this,arguments);requestAnimationFrame(()=>{paintVersion();cleanGuildXpDecoration();if(id==='guild')paintGuildXp()});return r};
    window.v032Go=v032Go;
  }

  paintVersion();cleanGuildXpDecoration();paintGuildXp();
  document.addEventListener('DOMContentLoaded',()=>{paintVersion();cleanGuildXpDecoration();paintGuildXp()},{once:true});
  setTimeout(()=>{paintVersion();cleanGuildXpDecoration();paintGuildXp()},400);
  setTimeout(()=>{paintVersion();cleanGuildXpDecoration();paintGuildXp()},1800);
})();
