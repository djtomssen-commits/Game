(()=>{
 'use strict';
 const VERSION=window.GROW_LEGENDS_VERSION?.label||'V4.159 Stable',SHORT=window.GROW_LEGENDS_VERSION?.short||'V4.159';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const PROFILE_SELECT='id,character_name,class_id,class_name,level,bosses,gear_score,dungeons,combat_power,equipment,dungeon_progress,worldboss_attempts,worldboss_wins,pvp_buds,pvp_wins,pvp_losses,pvp_fights,updated_at';

 /* Public dungeon position is progression, never the last map tile the player tapped. */
 function canonicalPos(dp,legacyDungeons=0){
  dp=(dp&&typeof dp==='object')?dp:{};
  const completed=new Set((Array.isArray(dp.completed)?dp.completed:[]).map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<20));
  let di=0;while(di<20&&completed.has(di))di++;
  if(di>=20)return{dungeonIndex:19,dungeonNumber:20,enemyNumber:10,completed:true};
  let raw=dp.progress?.[di];
  if(raw==null&&Number(dp.selected)===di)raw=dp.room;
  let room=Math.max(0,Math.min(9,Number(raw)||0));
  return{dungeonIndex:di,dungeonNumber:di+1,enemyNumber:room+1,completed:false};
 }
 window.v4124CanonicalDungeonPosition=canonicalPos;
 try{v081DungeonPosition=canonicalPos;window.v081DungeonPosition=canonicalPos}catch(e){}

 function liveDp(){
  const completed=Array.isArray(s?.dungeon?.completed)?[...s.dungeon.completed]:[];
  const progress={...(s?.dungeon?.progress||{})};
  const pos=canonicalPos({completed,progress},completed.length);
  return{completed,progress,selected:pos.dungeonIndex,room:Math.max(0,pos.enemyNumber-1)};
 }
 window.v4124LiveDungeonProgress=liveDp;

 /* Final outgoing profile payload: Hall and Nebel-Crew read the same live values. */
 if(typeof v073ProfilePayload==='function'&&!window.__v4124ProfilePayload){
  const base=v073ProfilePayload;
  v073ProfilePayload=function(){
   const p=base.apply(this,arguments)||{};
   const dp=liveDp(),pos=canonicalPos(dp,dp.completed.length);
   p.level=Math.max(1,Number(s?.level)||1);
   try{const fn=window.v4125StableCombatPower;p.combat_power=Math.max(0,Math.round(Number(typeof fn==='function'?fn():combatPower())||0))}catch(e){p.combat_power=Math.max(0,Number(p.combat_power)||0)}
   try{p.gear_score=typeof v072GearScore==='function'?Math.max(0,Number(v072GearScore())||0):Math.max(0,Number(p.gear_score)||0)}catch(e){}
   p.dungeons=dp.completed.length;
   p.dungeon_progress={...dp,selected:pos.dungeonIndex,room:Math.max(0,pos.enemyNumber-1)};
   p.pvp_buds=Math.max(0,Number(s?.v204Pvp?.buds)||0);
   p.pvp_wins=Math.max(0,Number(s?.v204Pvp?.wins)||0);
   p.pvp_losses=Math.max(0,Number(s?.v204Pvp?.losses)||0);
   p.pvp_fights=Math.max(0,Number(s?.v204Pvp?.fights)||p.pvp_wins+p.pvp_losses);
   try{const wb=typeof v112EnsureWorldBossState==='function'?v112EnsureWorldBossState():(s?.v110WorldBoss||{});p.worldboss_attempts=Math.max(0,Number(wb?.attempts)||0);p.worldboss_wins=Math.max(0,Number(wb?.wins)||0)}catch(e){}
   return p;
  };
  try{window.v073ProfilePayload=v073ProfilePayload}catch(e){}
  window.__v4124ProfilePayload=true;
 }

 /* V8.009 Friends/Mail Powerblock:
    v4124 keeps the enriched outgoing profile payload and Quest seed-reward logic.
    Its superseded Hall/Friends DOM producers/loaders are retired; v4130 is the
    final social UI/data owner. */

 /* Grow-seed quest drops already existed, but were awarded after V395 painted the
    reward. Track actual seed inventory deltas and append them to that same reward. */
 function seedSnapshot(){const out={};try{Object.entries(s?.grow?.seeds||{}).forEach(([k,v])=>out[k]=Math.max(0,Number(v)||0))}catch(e){}return out}
 function seedName(id){try{return seedTypes?.[id]?.name||id}catch(e){return id}}
 function seedIcon(id){try{return seedTypes?.[id]?.icon||'🌰'}catch(e){return'🌰'}}
 function appendQuestSeedReward(before){
  const extra=document.getElementById('v231QuestRewardExtra');if(!extra||!before)return false;
  const gains=[];try{Object.entries(s?.grow?.seeds||{}).forEach(([id,v])=>{const n=Math.max(0,(Number(v)||0)-(Number(before[id])||0));if(n>0)gains.push([id,n])})}catch(e){}
  if(!gains.length)return false;
  extra.style.display='';let grid=extra.querySelector('.v395-loot-grid');
  if(!grid){extra.querySelector('.v395-no-extra')?.remove();if(!extra.querySelector('.v395-loot-title'))extra.insertAdjacentHTML('afterbegin','<div class="v395-loot-title">🎁 Deine Beute</div>');grid=document.createElement('div');grid.className='v395-loot-grid';extra.appendChild(grid)}
  gains.forEach(([id,n])=>{if(grid.querySelector(`[data-v4124-seed="${CSS.escape(String(id))}"]`))return;grid.insertAdjacentHTML('beforeend',`<div class="v395-loot-card seed v4124-quest-seed" data-v4124-seed="${esc(id)}"><div class="ico">${esc(seedIcon(id))}</div><b>${n>1?`+${n} `:''}${esc(seedName(id))}</b><span>🌰 Samen gefunden · Growroom</span></div>`)});
  document.getElementById('v231QuestReward')?.classList.add('show');return true;
 }
 window.v4124AppendQuestSeedReward=appendQuestSeedReward;
 window.v4124QuestSeedSnapshot=seedSnapshot;
 /* V8.009: Quest claim wrappers retired.
    v235 captures the seed snapshot and calls appendQuestSeedReward after the
    canonical Local/Mirror payout. Server-enforced rewards remain v7045-owned. */


 /* V7.118 cleanup: retired duplicate v4124 social navigation wrapper.
    v4130 is the later/final Hall + friends entry refresh and performs the same loads. */

 window.v4124SocialDiagnostics=()=>({dungeon:liveDp(),socialUiOwner:'v4130',profilePayloadEnrichment:!!window.__v4124ProfilePayload,questSeedReward:typeof window.v4124AppendQuestSeedReward==='function'});
})();
