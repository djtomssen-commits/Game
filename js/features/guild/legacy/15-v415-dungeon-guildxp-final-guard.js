/* === v415-dungeon-guildxp-final-guard === */
(function(){
  const VERSION='V4.29 Stable', SHORT='V4.29';

  function stamp(){}

  function guildXpInfo(g){
    const THRESH=[0,500,1500,3500,7000,12500,20500,31500,46000,65000,90000,122000,162000,212000,275000,355000,460000,600000,900000,1800000];
    const x=Math.max(0,Math.floor(Number(g?.guild_xp)||0));
    let lv=1;for(let i=1;i<THRESH.length;i++){if(x>=THRESH[i])lv=i+1;else break}
    lv=Math.max(1,Math.min(20,lv));
    if(lv>=20)return {lv,pct:100,text:`${x.toLocaleString('de-DE')} Gilden-EP · MAX`};
    const lo=THRESH[lv-1],hi=THRESH[lv];
    return {lv,pct:Math.max(0,Math.min(100,Math.round((x-lo)/Math.max(1,hi-lo)*100))),text:`${x.toLocaleString('de-DE')} / ${hi.toLocaleString('de-DE')} Gilden-EP · noch ${(hi-x).toLocaleString('de-DE')} bis Level ${lv+1}`};
  }

  function paintGuildXp(){
    try{
      if(typeof v254Guild==='undefined'||!v254Guild)return;
      const head=document.querySelector('.v254-guild-head');if(!head)return;
      const z=guildXpInfo(v254Guild);
      let box=document.querySelector('.v409-guild-progress');
      if(!box){box=document.createElement('div');box.className='v409-guild-progress';head.insertAdjacentElement('afterend',box)}
      box.innerHTML=`<div class="v409-guild-progress-top"><span>🏰 GILDENFORTSCHRITT</span><b>Gildenlevel ${z.lv}</b></div><div class="v409-guild-progress-bar"><i style="width:${z.pct}%"></i></div><small class="v411-xp-note">${z.text}</small>`;
    }catch(e){console.warn('V4.15 guild XP paint',e)}
  }

  async function award(kind){
    try{
      if(typeof v073Db==='undefined'||!v073Db||typeof v073User==='undefined'||!v073User||v073User.is_anonymous)return;

      /* V4.36: activities must count even when the Guild screen has not been opened
         since login. Resolve the current membership lazily instead of silently
         discarding Quest/Dungeon/PvP/Guild-Boss activity. */
      if(typeof v254Membership==='undefined'||!v254Membership){
        const {data:mem,error:memError}=await v073Db
          .from('guild_members')
          .select('guild_id,role,attack_signed,defense_signed,boss_signed,joined_at')
          .eq('user_id',v073User.id)
          .maybeSingle();
        if(memError||!mem)return;
        v254Membership=mem;
      }

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
    }catch(e){console.warn('V4.36 guild activity',e)}
  }

  /* Final public owner. This intentionally overwrites the later legacy V4.11
     window-based implementation, whose checks fail for top-level lexical lets. */
  window.v411AwardGuildActivity=award;

  /* The active dungeon fight is owned by v246InstallFight/#fightBtn, not the
     historical fightDungeon() wrapper. Award activity from the canonical reward
     modal, which is invoked exactly after a successful room/boss victory. */
  if(typeof v247ShowDungeonReward==='function'&&!window.__v415DungeonGuildXpWrapped){
    const base=v247ShowDungeonReward;
    const seen=new Set();
    v247ShowDungeonReward=function(data){
      const r=base.apply(this,arguments);
      try{
        const di=Number(data?.dungeonIndex),ri=Number(data?.roomIndex);
        const token=`${di}:${ri}:${Array.isArray(s.dungeon?.completed)&&s.dungeon.completed.map(Number).includes(di)?'c':'p'+Number(s.dungeon?.progress?.[di]||0)}`;
        if(Number.isInteger(di)&&Number.isInteger(ri)&&!seen.has(token)){
          seen.add(token);
          /* V4.73 owns the one canonical Dungeon -> Gilden-EP award. */
        }
      }catch(e){console.warn('V4.15 dungeon guild XP',e)}
      return r;
    };
    window.__v415DungeonGuildXpWrapped=true;
  }

  /* Keep guild progress rendering under the corrected lexical bindings. */
  /* Guild cleanup Phase 1: V4.15 duplicate progress render wrapper retired.
     V5.56 owns the final progress card. */

  stamp();paintGuildXp();
  document.addEventListener('DOMContentLoaded',()=>{stamp();paintGuildXp()},{once:true});
  setTimeout(()=>{stamp();paintGuildXp()},500);
  setTimeout(()=>{stamp();paintGuildXp()},2300);
})();

