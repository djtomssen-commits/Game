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

 function posOf(p){return canonicalPos(p?.dungeon_progress,p?.dungeons)}
 function online(p){
  try{if(typeof v073User!=='undefined'&&v073User?.id&&String(p?.id)===String(v073User.id))return true;const ts=new Date(p?.updated_at||'').getTime();return Number.isFinite(ts)&&Date.now()-ts<=120000}catch(e){return false}
 }
 function socialRow(p,i=null,actions='',presence=false){
  const rank=i===null?'<div class="v072-rank">P</div>':`<div class="v072-rank ${typeof v073RankClass==='function'?v073RankClass(i):''}">${i+1}</div>`;
  const pos=posOf(p),isBoss=pos.enemyNumber>=10;
  const fights=Math.max(0,Number(p?.pvp_fights)||((Number(p?.pvp_wins)||0)+(Number(p?.pvp_losses)||0)));
  const presenceHtml=presence?` <span class="v329-presence ${online(p)?'online':'offline'}">${online(p)?'Online':'Offline'}</span>`:'';
  return `<div class="v072-player-row" data-profile-id="${esc(p?.id||'')}">
   ${rank}<div>
    <div class="v072-player-name">${esc(p?.character_name||'Spieler')}${presenceHtml}</div>
    <div class="v4124-social-lines">
     <div class="v4124-social-line">${esc(p?.class_name||'')} · Lv. <strong>${Math.max(1,Number(p?.level)||1)}</strong> · Kampfkraft <strong>${Math.max(0,Number(p?.combat_power)||0)}</strong> · Ausrüstung <strong>${Math.max(0,Number(p?.gear_score)||0)}</strong></div>
     <div class="v4124-social-line">🗺️ Dungeon <strong>${pos.dungeonNumber}</strong> · ${isBoss?'👑 Boss':'👹 Gegner'} <strong>${pos.enemyNumber}/10</strong> · 🏁 Abgeschlossen <strong>${Array.isArray(p?.dungeon_progress?.completed)?p.dungeon_progress.completed.length:Math.max(0,Number(p?.dungeons)||0)}</strong></div>
     <div class="v4124-social-line">🌿 PvP-Buds <strong>${Math.max(0,Number(p?.pvp_buds)||0)}</strong> · PvP <strong>${Math.max(0,Number(p?.pvp_wins)||0)}S/${Math.max(0,Number(p?.pvp_losses)||0)}N</strong> (${fights}) · 🔷 Mystisch <strong>${Math.max(0,Number(p?.worldboss_wins)||0)}/${Math.max(0,Number(p?.worldboss_attempts)||0)}</strong></div>
    </div>
   </div><div class="v073-row-actions">${actions}</div>
  </div>`;
 }
 window.v4124SocialRow=socialRow;
 try{v073PlayerRow=(p,i=null,actions='')=>socialRow(p,i,actions,false);window.v073PlayerRow=v073PlayerRow;if(typeof v084PlayerRow!=='undefined')v084PlayerRow=v073PlayerRow}catch(e){}

 function bindRows(root){
  try{if(typeof v074BindProfileRows==='function')v074BindProfileRows(root)}catch(e){}
  root?.querySelectorAll('[data-v4124-mail]').forEach(b=>{b.onclick=e=>{e.preventDefault();e.stopPropagation();window.v382OpenMailTo?.(b.dataset.v4124Mail)}});
 }
 function mailButton(p){return `<button class="btn secondary v382-message-btn" data-v4124-mail="${esc(p?.character_name||'')}">✉️ Nachricht</button>`}

 /* One final Hall loader. It fetches dungeon_progress together with every displayed value. */
 v073LoadRanking=async function(){
  const el=document.getElementById('v072HallRanking');if(!el)return;
  if(!(await v073Init())){el.innerHTML='<div class="v072-status-offline">Online-Rangliste momentan nicht erreichbar.</div>';return}
  try{await v073SyncProfile(true)}catch(e){}
  el.innerHTML='<div class="v072-empty">Rangliste wird geladen...</div>';
  const {data,error}=await v073Db.from('profiles').select(PROFILE_SELECT).order('level',{ascending:false}).order('combat_power',{ascending:false}).limit(50);
  if(error){console.error('V4.124 Hall',error);el.innerHTML='<div class="v072-status-offline">Rangliste konnte nicht geladen werden.</div>';return}
  el.innerHTML=(data||[]).length?(data||[]).map((p,i)=>socialRow(p,i,String(p.id)===String(v073User?.id)?'<span class="pill">DU</span>':`<button class="btn secondary" data-v073-add="${esc(p.id)}" data-name="${esc(p.character_name)}">Freund</button>${mailButton(p)}`,false)).join(''):'<div class="v072-empty">Noch keine Spieler in der Hall of Haze.</div>';
  try{v073BindAddButtons(el)}catch(e){}bindRows(el);
 };
 try{window.v073LoadRanking=v073LoadRanking}catch(e){}

 v073SearchPlayer=async function(name,targetSelector){
  const target=document.querySelector(targetSelector);if(!target)return;name=String(name||'').trim();if(name.length<2){v063Toast?.('Mindestens 2 Zeichen eingeben','warn');return}if(!(await v073Init()))return;
  if(!v073User?.id)return;
  target.innerHTML='<div class="v072-empty">Suche...</div>';const safe=name.replace(/[%_,]/g,'');
  const {data,error}=await v073Db.from('profiles').select(PROFILE_SELECT).ilike('character_name',`%${safe}%`).limit(20);
  if(error){console.error('V4.124 Hall search',error);target.innerHTML='<div class="v072-status-offline">Suche fehlgeschlagen.</div>';return}
  const rows=(data||[]).filter(p=>String(p.id)!==String(v073User?.id));
  target.innerHTML=rows.length?rows.map(p=>socialRow(p,null,`<button class="btn" data-v073-add="${esc(p.id)}" data-name="${esc(p.character_name)}">Anfrage senden</button>${mailButton(p)}`,false)).join(''):'<div class="v072-empty">Keinen Spieler gefunden.</div>';
  try{v073BindAddButtons(target)}catch(e){}bindRows(target);
 };
 try{window.v073SearchPlayer=v073SearchPlayer;v072SearchPlayer=v073SearchPlayer}catch(e){}

 /* Own Hall card is always live and does not wait for the server round-trip. */
 v072RenderOwnProfile=function(){
  const el=document.getElementById('v072OwnProfile');if(!el)return;
  const p=typeof v072Profile==='function'?v072Profile():{name:s?.characterName||'Spieler',className:'',level:s?.level||1,id:v073User?.id||''};
  const dp=liveDp(),pos=canonicalPos(dp,dp.completed.length);let cp=0;try{const fn=window.v4125StableCombatPower;cp=Math.max(0,Math.round(Number(typeof fn==='function'?fn():combatPower())||0))}catch(e){}
  el.innerHTML=`<div class="v072-profile-name">${esc(p.name)}</div><div class="v072-profile-meta">${esc(p.className||'')} · Spieler-ID ${String(p.id||v073User?.id||'').slice(0,8)}</div><div class="v072-profile-stats"><div class="v072-profile-stat"><span>Level</span><b>${Math.max(1,Number(s?.level)||1)}</b></div><div class="v072-profile-stat"><span>Kampfkraft</span><b>${cp}</b></div><div class="v072-profile-stat"><span>Dungeon</span><b>${pos.dungeonNumber}</b></div><div class="v072-profile-stat"><span>${pos.enemyNumber>=10?'Boss':'Gegner'}</span><b>${pos.enemyNumber}/10</b></div></div><div class="v4124-social-line" style="margin-top:7px">🏁 ${dp.completed.length} Dungeons abgeschlossen · 🌿 PvP-Buds ${Math.max(0,Number(s?.v204Pvp?.buds)||0)}</div>`;
 };
 try{window.v072RenderOwnProfile=v072RenderOwnProfile}catch(e){}

 async function profileMap(ids){
  ids=[...new Set((ids||[]).filter(Boolean))];if(!ids.length)return new Map();
  const {data,error}=await v073Db.from('profiles').select(PROFILE_SELECT).in('id',ids);
  if(error){console.error('V4.124 Nebel-Crew profile load',error);return new Map()}
  return new Map((data||[]).map(p=>[String(p.id),p]));
 }

 /* Nebel-Crew no longer uses the old reduced profile query. Every shown value comes
    from the same public profile row used by Hall of Haze. */
 v073LoadFriends=async function(){
  const friendsEl=document.getElementById('v072FriendsList'),requestsEl=document.getElementById('v072RequestsList'),countEl=document.getElementById('v072FriendCount');if(!friendsEl||!requestsEl)return;
  if(!(await v073Init()))return;
  if(!v073User?.id)return;
  friendsEl.innerHTML='<div class="v072-empty">Lade Freunde...</div>';requestsEl.innerHTML='<div class="v072-empty">Lade Anfragen...</div>';
  const {data,error}=await v073Db.from('friend_requests').select('id,sender_id,receiver_id,status,created_at').or(`sender_id.eq.${v073User.id},receiver_id.eq.${v073User.id}`).order('created_at',{ascending:false});
  if(error){console.error('V4.124 Nebel-Crew',error);friendsEl.innerHTML='<div class="v072-status-offline">Freundesliste konnte nicht geladen werden.</div>';requestsEl.innerHTML='';return}
  const rows=data||[],incoming=rows.filter(r=>r.status==='pending'&&String(r.receiver_id)===String(v073User.id)),accepted=rows.filter(r=>r.status==='accepted');
  const ids=[...incoming.map(r=>r.sender_id),...accepted.map(r=>String(r.sender_id)===String(v073User.id)?r.receiver_id:r.sender_id)];const profiles=await profileMap(ids);
  requestsEl.innerHTML=incoming.length?incoming.map(r=>{const p=profiles.get(String(r.sender_id))||{id:r.sender_id,character_name:'Spieler',level:1};return socialRow(p,null,`<button class="btn" data-v073-accept="${r.id}">Annehmen</button><button class="btn secondary" data-v073-decline="${r.id}">Ablehnen</button>`,false)}).join(''):'<div class="v072-empty">Keine offenen Anfragen.</div>';
  const friendProfiles=accepted.map(r=>profiles.get(String(String(r.sender_id)===String(v073User.id)?r.receiver_id:r.sender_id))).filter(Boolean);
  if(countEl)countEl.textContent=`${friendProfiles.length} Freunde`;
  friendsEl.innerHTML=friendProfiles.length?friendProfiles.map(p=>socialRow(p,null,`${mailButton(p)}<button class="btn secondary" data-v073-remove="${esc(p.id)}">Entfernen</button>`,true)).join(''):'<div class="v072-empty">Noch keine Freunde.</div>';
  requestsEl.querySelectorAll('[data-v073-accept]').forEach(b=>b.onclick=e=>{e.stopPropagation();v073AnswerRequest(Number(b.dataset.v073Accept),'accepted')});
  requestsEl.querySelectorAll('[data-v073-decline]').forEach(b=>b.onclick=e=>{e.stopPropagation();v073AnswerRequest(Number(b.dataset.v073Decline),'declined')});
  friendsEl.querySelectorAll('[data-v073-remove]').forEach(b=>b.onclick=e=>{e.stopPropagation();v073RemoveFriend(b.dataset.v073Remove)});
  bindRows(requestsEl);bindRows(friendsEl);
 };
 try{window.v073LoadFriends=v073LoadFriends;v072RenderFriends=function(){v073LoadFriends()}}catch(e){}

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

 window.v4124SocialDiagnostics=()=>({profileSelect:PROFILE_SELECT,dungeon:liveDp(),hallLoader:window.v073LoadRanking===v073LoadRanking,friendsLoader:window.v073LoadFriends===v073LoadFriends,questSeedReward:typeof window.v4124AppendQuestSeedReward==='function'});
 function stamp(){}
 try{v072RenderOwnProfile()}catch(e){}stamp();window.addEventListener('pageshow',()=>{stamp();try{v072RenderOwnProfile()}catch(e){}},{passive:true});
})();
