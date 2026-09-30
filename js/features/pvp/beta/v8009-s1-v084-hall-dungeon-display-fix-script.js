
/* V4.02: old Hall-of-Haze counters now show CURRENT dungeon position,
   instead of completed-dungeon/story-boss counters. */

function v084CurrentDungeonProgress(dp, legacyDungeons=0){
  return v081DungeonPosition(dp, legacyDungeons);
}

function v084OwnDungeonProgress(){
  const dp={
    selected:Number(s.dungeon?.selected)||0,
    progress:s.dungeon?.progress||{},
    completed:Array.isArray(s.dungeon?.completed)?s.dungeon.completed:[]
  };
  return v084CurrentDungeonProgress(dp, s.dungeon?.completed?.length||0);
}

/* Own Hall card */
v072RenderOwnProfile=function(){
  const el=document.querySelector('#v072OwnProfile');
  if(!el)return;
  const p=v072Profile();
  const pos=v084OwnDungeonProgress();

  el.innerHTML=`
    <div class="v072-profile-name">${p.name}</div>
    <div class="v072-profile-meta">${p.className} · Spieler-ID ${p.id.slice(0,8)}</div>
    <div class="v072-profile-stats">
      <div class="v072-profile-stat"><span>Level</span><b>${p.level}</b></div>
      <div class="v072-profile-stat"><span>Boss</span><b>${pos.enemyNumber}/10</b></div>
      <div class="v072-profile-stat"><span>Ausrüstung</span><b>${p.gearScore}</b></div>
      <div class="v072-profile-stat"><span>Dungeon</span><b>${pos.dungeonNumber}</b></div>
    </div>`;
};

/* Ranking/search row */
function v084PlayerRow(p,i=null,actions=''){
  const rank=i===null?'':`<div class="v072-rank ${v073RankClass(i)}">${i+1}</div>`;
  const left=i===null?'<div class="v072-rank">P</div>':rank;
  const pos=v084CurrentDungeonProgress(p.dungeon_progress,p.dungeons);

  return `
    <div class="v072-player-row" data-profile-id="${v073Escape(p.id)}">
      ${left}
      <div>
        <div class="v072-player-name">${v073Escape(p.character_name)}</div>
        <div class="v072-player-sub">
          ${v073Escape(p.class_name||'')} · Lv. ${Number(p.level)||1}
          · Ausrüstung ${Number(p.gear_score)||0}
          · <span class="v084-progress-inline">Dungeon ${pos.dungeonNumber} · Boss ${pos.enemyNumber}/10</span>
        </div>
      </div>
      <div class="v073-row-actions">${actions}</div>
    </div>`;
}

v073PlayerRow=v084PlayerRow;

/* Ranking must fetch dungeon_progress, otherwise the row only knows old counters. */
v073LoadRanking=async function(){
  const el=document.querySelector('#v072HallRanking');
  if(!el)return;
  if(!(await v073Init())){
    el.innerHTML='<div class="v072-status-offline">Online-Rangliste momentan nicht erreichbar.</div>';
    return;
  }

  el.innerHTML='<div class="v072-empty">Rangliste wird geladen...</div>';

  const {data,error}=await v073Db.from('profiles')
    .select('id,character_name,class_id,class_name,level,bosses,gear_score,dungeons,combat_power,dungeon_progress')
    .order('level',{ascending:false})
    .order('gear_score',{ascending:false})
    .limit(50);

  if(error){
    console.error(error);
    el.innerHTML='<div class="v072-status-offline">Rangliste konnte nicht geladen werden.</div>';
    return;
  }

  el.innerHTML=(data||[]).length
    ? data.map((p,i)=>v084PlayerRow(
        p,i,
        p.id===v073User.id
          ? '<span class="pill">DU</span>'
          : `<button class="btn secondary" data-v073-add="${p.id}" data-name="${v073Escape(p.character_name)}">Freund</button>`
      )).join('')
    : '<div class="v072-empty">Noch keine Spieler in der Hall of Haze.</div>';

  v073BindAddButtons(el);

  el.querySelectorAll('[data-profile-id]').forEach(row=>{
    row.addEventListener('click',e=>{
      if(e.target.closest('button'))return;
      v074OpenProfile(row.dataset.profileId);
    });
  });
};

/* Public profile: fix the two old boxes after all existing profile extensions rendered. */
const v084OldOpenProfile=v074OpenProfile;
v074OpenProfile=async function(id){
  await v084OldOpenProfile(id);

  try{
    const {data:p,error}=await v073Db.from('profiles')
      .select('id,dungeons,dungeon_progress')
      .eq('id',id).single();

    if(error||!p)return;

    const content=document.querySelector('#v074ProfileContent');
    if(!content)return;
    const pos=v084CurrentDungeonProgress(p.dungeon_progress,p.dungeons);

    const stats=[...content.querySelectorAll('.v072-profile-stat')];
    stats.forEach(box=>{
      const label=box.querySelector('span');
      const value=box.querySelector('b');
      if(!label||!value)return;

      const name=(label.textContent||'').trim().toLowerCase();
      if(name==='bosse'||name==='boss'){
        label.textContent='Boss';
        value.textContent=`${pos.enemyNumber}/10`;
      }
      if(name==='dungeons'||name==='dungeon'){
        label.textContent='Dungeon';
        value.textContent=String(pos.dungeonNumber);
      }
    });
  }catch(e){
    console.error('V4.02 profile dungeon display',e);
  }
};

/* Also sync the actual current position to profiles.
   This is what lets other devices/players see it correctly. */
const v084OldProfilePayload=v073ProfilePayload;
v073ProfilePayload=function(){
  const payload=v084OldProfilePayload();
  payload.dungeon_progress={
    selected:Number(s.dungeon?.selected)||0,
    progress:s.dungeon?.progress||{},
    completed:Array.isArray(s.dungeon?.completed)?s.dungeon.completed:[]
  };
  return payload;
};

/* V7.113: retired pure pass-through render wrapper (V084). */
