
(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 const VERSION=V.label,SHORT=V.short;
 const PROFILE_SELECT='id,character_name,class_id,class_name,level,bosses,gear_score,dungeons,combat_power,equipment,dungeon_progress,worldboss_attempts,worldboss_wins,pvp_buds,pvp_wins,pvp_losses,pvp_fights,updated_at';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clampDungeon=v=>Math.max(0,Math.min(19,Math.floor(Number(v)||0)));
 const clampRoom=v=>Math.max(0,Math.min(9,Math.floor(Number(v)||0)));
 const ints=a=>[...new Set((Array.isArray(a)?a:[]).map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<20))].sort((a,b)=>a-b);

 function localUnlocked(){
  const out=new Set([0]);
  try{ints(s?.dungeon?.unlocked).forEach(i=>out.add(i))}catch(e){}
  try{Object.entries(s?.dungeon?.keys||{}).forEach(([k,v])=>{const i=Number(k);if(v&&Number.isInteger(i)&&i>=0&&i<20)out.add(i)})}catch(e){}
  try{ints(s?.dungeon?.completed).forEach(i=>out.add(i))}catch(e){}
  return [...out].sort((a,b)=>a-b);
 }

 function inferLastActive(dp){
  const completed=new Set(ints(dp?.completed));
  const progress=(dp?.progress&&typeof dp.progress==='object')?dp.progress:{};
  const selected=Number.isFinite(Number(dp?.selected))?clampDungeon(dp.selected):null;
  const supplied=Number(dp?.lastActive);
  if(Number.isInteger(supplied)&&supplied>=0&&supplied<20)return supplied;
  if(selected!==null&&!completed.has(selected)&&clampRoom(progress[selected]??dp?.room)>0)return selected;
  const started=Object.entries(progress).map(([k,v])=>[Number(k),clampRoom(v)])
    .filter(([i,r])=>Number.isInteger(i)&&i>=0&&i<20&&!completed.has(i)&&r>0)
    .sort((a,b)=>b[0]-a[0]||b[1]-a[1]);
  if(started.length)return started[0][0];
  if(completed.size)return Math.max(...completed);
  return selected??0;
 }

 function canonicalPos(dp,legacyDungeons=0){
  dp=(dp&&typeof dp==='object')?dp:{};
  const completedList=ints(dp.completed),completed=new Set(completedList);
  const progress=(dp.progress&&typeof dp.progress==='object')?dp.progress:{};
  const unlockedList=ints(dp.unlocked),unlocked=new Set(unlockedList);
  completedList.forEach(i=>unlocked.add(i));
  unlocked.add(0);
  const selected=Number.isFinite(Number(dp.selected))?clampDungeon(dp.selected):null;
  const last=inferLastActive(dp);
  const roomFor=i=>clampRoom(progress[i]??(selected===i?dp.room:0));
  const result=(i,completedFlag=false)=>({dungeonIndex:i,dungeonNumber:i+1,enemyNumber:completedFlag?10:roomFor(i)+1,completed:!!completedFlag});

  /* 1) An unfinished dungeon in which the player actually fought is authoritative. */
  if(Number.isInteger(last)&&last>=0&&last<20&&!completed.has(last))return result(last,false);

  /* 2) After a boss win, move to the next genuinely unlocked unfinished dungeon.
        If none exists, keep the completed boss as the truthful latest progress. */
  if(Number.isInteger(last)&&completed.has(last)){
   const next=[...unlocked].filter(i=>i>last&&!completed.has(i)).sort((a,b)=>a-b)[0];
   if(Number.isInteger(next))return result(next,false);
   return result(last,true);
  }

  /* 3) Migration for older saves: a selected dungeon only counts when it has real
        progress. Merely tapping a portal must not change the public Hall value. */
  if(selected!==null&&!completed.has(selected)&&roomFor(selected)>0)return result(selected,false);

  const started=Object.entries(progress).map(([k,v])=>[Number(k),clampRoom(v)])
    .filter(([i,r])=>Number.isInteger(i)&&i>=0&&i<20&&!completed.has(i)&&r>0)
    .sort((a,b)=>b[0]-a[0]||b[1]-a[1]);
  if(started.length)return result(started[0][0],false);

  /* 4) No started unfinished dungeon: show the first unlocked dungeon after the
        highest completed one. This avoids advertising a locked dungeon. */
  if(completedList.length){
   const highest=Math.max(...completedList);
   const next=[...unlocked].filter(i=>i>highest&&!completed.has(i)).sort((a,b)=>a-b)[0];
   if(Number.isInteger(next))return result(next,false);
   return result(highest,true);
  }

  /* 5) Fresh/legacy profile fallback. */
  if(selected!==null && (unlocked.size<=1 || unlocked.has(selected)))return result(selected,false);
  const legacy=Math.max(0,Math.min(19,Math.floor(Number(legacyDungeons)||0)));
  return result(legacy,false);
 }
 window.v4130CanonicalDungeonPosition=canonicalPos;
 window.v4124CanonicalDungeonPosition=canonicalPos;
 try{v081DungeonPosition=canonicalPos;window.v081DungeonPosition=canonicalPos}catch(e){}

 function liveDp(){
  s.dungeon=(s.dungeon&&typeof s.dungeon==='object')?s.dungeon:{};
  const completed=ints(s.dungeon.completed),progress={...(s.dungeon.progress||{})},selected=clampDungeon(s.dungeon.selected||0),unlocked=localUnlocked();
  let last=Number(s.dungeon.lastActive);
  if(!Number.isInteger(last)||last<0||last>=20){
   last=inferLastActive({completed,progress,selected,room:s.dungeon.room,unlocked});
   s.dungeon.lastActive=last;
  }
  return{completed,progress,selected,room:clampRoom(progress[selected]??s.dungeon.room),lastActive:last,unlocked};
 }
 window.v4130LiveDungeonProgress=liveDp;
 window.v4124LiveDungeonProgress=liveDp;

 /* Final outgoing payload. Preserve actual selected + last fought dungeon instead of
    rewriting selected to "first unfinished", which was the V4.124 Hall bug. */
 try{
  if(typeof v073ProfilePayload==='function'&&!window.__v4130ProfilePayload){
   const base=v073ProfilePayload;
   v073ProfilePayload=function(){
    const p=base.apply(this,arguments)||{},dp=liveDp();
    p.dungeons=dp.completed.length;
    p.dungeon_progress={completed:dp.completed,progress:dp.progress,selected:dp.selected,room:dp.room,lastActive:dp.lastActive,unlocked:dp.unlocked,public_title:(()=>{const t=s?.v6338Titles||{};return{id:String(t.activeId||''),label:String(t.activeLabel||''),source:String(t.activeSource||'')}})()};
    return p;
   };
   try{window.v073ProfilePayload=v073ProfilePayload}catch(e){}
   window.__v4130ProfilePayload=true;
  }
 }catch(e){}

 function dungeonName(pos){try{return dungeons?.[pos.dungeonIndex]?.name||`Dungeon ${pos.dungeonNumber}`}catch(e){return`Dungeon ${pos.dungeonNumber}`}}
 function online(p){try{if(v073User?.id&&String(p?.id)===String(v073User.id))return true;const ts=new Date(p?.updated_at||'').getTime();return Number.isFinite(ts)&&Date.now()-ts<=120000}catch(e){return false}}
 function posOf(p){return canonicalPos(p?.dungeon_progress,p?.dungeons)}
 function socialRow(p,i=null,actions='',presence=false){
  const pos=posOf(p),isBoss=pos.enemyNumber>=10,name=dungeonName(pos),fights=Math.max(0,Number(p?.pvp_fights)||((Number(p?.pvp_wins)||0)+(Number(p?.pvp_losses)||0)));
  const rank=i===null?'<div class="v072-rank">P</div>':`<div class="v072-rank ${typeof v073RankClass==='function'?v073RankClass(i):''}">${i+1}</div>`;
  const presenceHtml=presence?` <span class="v329-presence ${online(p)?'online':'offline'}">${online(p)?'Online':'Offline'}</span>`:'';
  const done=Array.isArray(p?.dungeon_progress?.completed)?p.dungeon_progress.completed.length:Math.max(0,Number(p?.dungeons)||0);
  return `<div class="v072-player-row" data-profile-id="${esc(p?.id||'')}" data-class-id="${esc(p?.class_id||'')}">
   ${rank}<div><div class="v072-player-name">${esc(p?.character_name||'Spieler')}${presenceHtml}</div>
    <div class="v4124-social-lines">
     <div class="v4124-social-line">${esc(p?.class_name||'')} · Lv. <strong>${Math.max(1,Number(p?.level)||1)}</strong> · Kampfkraft <strong>${Math.max(0,Number(p?.combat_power)||0)}</strong> · Ausrüstung <strong>${Math.max(0,Number(p?.gear_score)||0)}</strong></div>
     <div class="v4124-social-line">🗺️ Dungeon <strong>${pos.dungeonNumber}</strong> · ${esc(name)} · ${isBoss?'👑 Boss':'👹 Gegner'} <strong>${pos.enemyNumber}/10</strong>${pos.completed?' · <span class="good">abgeschlossen</span>':''} · 🏁 Gesamt <strong>${done}</strong></div>
     <div class="v4124-social-line">🌿 PvP-Buds <strong>${Math.max(0,Number(p?.pvp_buds)||0)}</strong> · PvP <strong>${Math.max(0,Number(p?.pvp_wins)||0)}S/${Math.max(0,Number(p?.pvp_losses)||0)}N</strong> (${fights}) · 🔷 Mystisch <strong>${Math.max(0,Number(p?.worldboss_wins)||0)}/${Math.max(0,Number(p?.worldboss_attempts)||0)}</strong></div>
    </div></div><div class="v073-row-actions">${actions}</div>
  </div>`;
 }
 window.v4130SocialRow=socialRow;
 try{v073PlayerRow=(p,i=null,actions='')=>socialRow(p,i,actions,false);window.v073PlayerRow=v073PlayerRow;if(typeof v084PlayerRow!=='undefined')v084PlayerRow=v073PlayerRow}catch(e){}

 function bindRows(root){
  try{if(typeof v074BindProfileRows==='function')v074BindProfileRows(root)}catch(e){}
  root?.querySelectorAll('[data-v4130-mail],[data-v4124-mail]').forEach(b=>{b.onclick=e=>{e.preventDefault();e.stopPropagation();window.v382OpenMailTo?.(b.dataset.v4130Mail||b.dataset.v4124Mail)}});
 }
 const mailButton=p=>`<button class="btn secondary v382-message-btn" data-v4130-mail="${esc(p?.character_name||'')}">✉️ Nachricht</button>`;

 v072RenderOwnProfile=function(){
  const el=document.getElementById('v072OwnProfile');if(!el)return;
  const p=typeof v072Profile==='function'?v072Profile():{name:s?.characterName||'Spieler',className:'',level:s?.level||1,id:v073User?.id||''};
  const dp=liveDp(),pos=canonicalPos(dp,dp.completed.length),name=dungeonName(pos);let cp=0;try{const fn=window.v4125StableCombatPower;cp=Math.max(0,Math.round(Number(typeof fn==='function'?fn():combatPower())||0))}catch(e){}
  el.innerHTML=`<div class="v072-profile-name">${esc(p.name)}</div><div class="v072-profile-meta">${esc(p.className||'')} · Spieler-ID ${String(p.id||v073User?.id||'').slice(0,8)}</div><div class="v072-profile-stats"><div class="v072-profile-stat"><span>Level</span><b>${Math.max(1,Number(s?.level)||1)}</b></div><div class="v072-profile-stat"><span>Kampfkraft</span><b>${cp}</b></div><div class="v072-profile-stat"><span>Dungeon</span><b>${pos.dungeonNumber}</b></div><div class="v072-profile-stat"><span>${pos.enemyNumber>=10?'Boss':'Gegner'}</span><b>${pos.enemyNumber}/10</b></div></div><div class="v4130-dungeon-line">🗺️ <strong>Dungeon ${pos.dungeonNumber}</strong> · ${esc(name)} · ${pos.enemyNumber>=10?'Boss':'Gegner'} <strong>${pos.enemyNumber}/10</strong>${pos.completed?' · abgeschlossen':''} · 🏁 ${dp.completed.length} abgeschlossen</div>`;
  /* V8.009 Hall video fix: decorate the own card immediately after the final
     authoritative renderer writes it, so the first visible frame is canonical. */
  try{window.v646DecorateHall?.()}catch(e){}
  requestAnimationFrame(()=>{try{window.v646DecorateHall?.()}catch(e){}});
 };
 try{window.v072RenderOwnProfile=v072RenderOwnProfile}catch(e){}

 v073LoadRanking=async function(){
  const el=document.getElementById('v072HallRanking');if(!el)return;
  if(!(await v073Init())){el.innerHTML='<div class="v072-status-offline">Online-Rangliste momentan nicht erreichbar.</div>';return}
  try{await v073SyncProfile(true)}catch(e){}
  el.innerHTML='<div class="v072-empty">Rangliste wird geladen...</div>';
  const {data,error}=await v073Db.from('profiles').select(PROFILE_SELECT).order('level',{ascending:false}).order('combat_power',{ascending:false}).limit(50);
  if(error){console.error('V4.159 Hall',error);el.innerHTML='<div class="v072-status-offline">Rangliste konnte nicht geladen werden.</div>';return}
  el.innerHTML=(data||[]).length?(data||[]).map((p,i)=>socialRow(p,i,String(p.id)===String(v073User?.id)?'<span class="pill">DU</span>':`<button class="btn secondary" data-v073-add="${esc(p.id)}" data-name="${esc(p.character_name)}">Freund</button>${mailButton(p)}`,false)).join(''):'<div class="v072-empty">Noch keine Spieler in der Hall of Haze.</div>';
  try{v073BindAddButtons(el)}catch(e){}bindRows(el);
 };
 try{window.v073LoadRanking=v073LoadRanking}catch(e){}

 v073SearchPlayer=async function(name,targetSelector){
  const target=document.querySelector(targetSelector);if(!target)return;name=String(name||'').trim();if(name.length<2){v063Toast?.('Mindestens 2 Zeichen eingeben','warn');return}if(!(await v073Init()))return;
  target.innerHTML='<div class="v072-empty">Suche...</div>';const safe=name.replace(/[%_,]/g,'');
  const {data,error}=await v073Db.from('profiles').select(PROFILE_SELECT).ilike('character_name',`%${safe}%`).limit(20);
  if(error){console.error('V4.159 Hall search',error);target.innerHTML='<div class="v072-status-offline">Suche fehlgeschlagen.</div>';return}
  const rows=(data||[]).filter(p=>String(p.id)!==String(v073User?.id));
  target.innerHTML=rows.length?rows.map(p=>socialRow(p,null,`<button class="btn" data-v073-add="${esc(p.id)}" data-name="${esc(p.character_name)}">Anfrage senden</button>${mailButton(p)}`,false)).join(''):'<div class="v072-empty">Keinen Spieler gefunden.</div>';
  try{v073BindAddButtons(target)}catch(e){}bindRows(target);
 };
 try{window.v073SearchPlayer=v073SearchPlayer;v072SearchPlayer=v073SearchPlayer}catch(e){}

 async function profileMap(ids){ids=[...new Set((ids||[]).filter(Boolean))];if(!ids.length)return new Map();const {data,error}=await v073Db.from('profiles').select(PROFILE_SELECT).in('id',ids);if(error){console.error('V4.159 Nebel-Crew profile load',error);return new Map()}return new Map((data||[]).map(p=>[String(p.id),p]))}
 v073LoadFriends=async function(){
  const friendsEl=document.getElementById('v072FriendsList'),requestsEl=document.getElementById('v072RequestsList'),countEl=document.getElementById('v072FriendCount');if(!friendsEl||!requestsEl)return;if(!(await v073Init()))return;
  friendsEl.innerHTML='<div class="v072-empty">Lade Freunde...</div>';requestsEl.innerHTML='<div class="v072-empty">Lade Anfragen...</div>';
  const {data,error}=await v073Db.from('friend_requests').select('id,sender_id,receiver_id,status,created_at').or(`sender_id.eq.${v073User.id},receiver_id.eq.${v073User.id}`).order('created_at',{ascending:false});
  if(error){console.error('V4.159 Nebel-Crew',error);friendsEl.innerHTML='<div class="v072-status-offline">Freundesliste konnte nicht geladen werden.</div>';requestsEl.innerHTML='';return}
  const rows=data||[],incoming=rows.filter(r=>r.status==='pending'&&String(r.receiver_id)===String(v073User.id)),accepted=rows.filter(r=>r.status==='accepted');
  const ids=[...incoming.map(r=>r.sender_id),...accepted.map(r=>String(r.sender_id)===String(v073User.id)?r.receiver_id:r.sender_id)],profiles=await profileMap(ids);
  requestsEl.innerHTML=incoming.length?incoming.map(r=>{const p=profiles.get(String(r.sender_id))||{id:r.sender_id,character_name:'Spieler',level:1};return socialRow(p,null,`<button class="btn" data-v073-accept="${r.id}">Annehmen</button><button class="btn secondary" data-v073-decline="${r.id}">Ablehnen</button>`,false)}).join(''):'<div class="v072-empty">Keine offenen Anfragen.</div>';
  const friendProfiles=accepted.map(r=>profiles.get(String(String(r.sender_id)===String(v073User.id)?r.receiver_id:r.sender_id))).filter(Boolean);if(countEl)countEl.textContent=`${friendProfiles.length} Freunde`;
  friendsEl.innerHTML=friendProfiles.length?friendProfiles.map(p=>socialRow(p,null,`${mailButton(p)}<button class="btn secondary" data-v073-remove="${esc(p.id)}">Entfernen</button>`,true)).join(''):'<div class="v072-empty">Noch keine Freunde.</div>';
  requestsEl.querySelectorAll('[data-v073-accept]').forEach(b=>b.onclick=e=>{e.stopPropagation();v073AnswerRequest(Number(b.dataset.v073Accept),'accepted')});requestsEl.querySelectorAll('[data-v073-decline]').forEach(b=>b.onclick=e=>{e.stopPropagation();v073AnswerRequest(Number(b.dataset.v073Decline),'declined')});friendsEl.querySelectorAll('[data-v073-remove]').forEach(b=>b.onclick=e=>{e.stopPropagation();v073RemoveFriend(b.dataset.v073Remove)});bindRows(requestsEl);bindRows(friendsEl);
 };
 try{window.v073LoadFriends=v073LoadFriends;v072RenderFriends=function(){v073LoadFriends()}}catch(e){}

 /* Re-open refresh: own card is immediate; server row follows after the synced payload. */
 try{
  if(typeof v032Go==='function'&&!window.__v4130SocialGo){const base=v032Go;v032Go=function(id){const r=base.apply(this,arguments);if(id==='hall'){try{v072RenderOwnProfile()}catch(e){}setTimeout(()=>{try{v073LoadRanking()}catch(e){}},0)}if(id==='friends')setTimeout(()=>{try{v073LoadFriends()}catch(e){}},0);return r};try{window.v032Go=v032Go}catch(e){}window.__v4130SocialGo=true}
 }catch(e){}

 function stamp(){}
 try{v072RenderOwnProfile()}catch(e){}stamp();
 window.v4130HallDiagnostics=()=>{const dp=liveDp(),pos=canonicalPos(dp,dp.completed.length);return{selected:dp.selected,lastActive:dp.lastActive,unlocked:dp.unlocked,completed:dp.completed,progress:dp.progress,display:pos}};
})();
