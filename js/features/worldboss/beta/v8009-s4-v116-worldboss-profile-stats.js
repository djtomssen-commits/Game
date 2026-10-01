/* ===== V4.02 public worldboss stats in Hall of Haze ===== */

const v116OldProfilePayload=v073ProfilePayload;
v073ProfilePayload=function(){
  const p=v116OldProfilePayload();
  v112EnsureWorldBossState();
  p.worldboss_attempts=Number(s.v110WorldBoss?.attempts)||0;
  p.worldboss_wins=Number(s.v110WorldBoss?.wins)||0;
  return p;
};

/* Ranking rows: show only while mystic event is active. */
const v116OldPlayerRow=v073PlayerRow;
v073PlayerRow=function(p,i=null,actions=''){
  const base=v116OldPlayerRow(p,i,actions);
  if(!v110MysticEventActive())return base;

  const a=Number(p.worldboss_attempts)||0;
  const w=Number(p.worldboss_wins)||0;

  return base.replace(
    /(<div class="v072-player-sub">[\s\S]*?<\/div>)/,
    `$1<div class="v116-wb-inline">🔷 Versuche ${a} · Siege ${w}</div>`
  );
};

/* Current V4.02 row override also needs the same data. */
const v116OldV084Row=typeof v084PlayerRow==='function'?v084PlayerRow:null;
if(v116OldV084Row){
  v084PlayerRow=function(p,i=null,actions=''){
    const base=v116OldV084Row(p,i,actions);
    if(!v110MysticEventActive())return base;
    const a=Number(p.worldboss_attempts)||0,w=Number(p.worldboss_wins)||0;
    return base.replace(
      /(<div class="v072-player-sub">[\s\S]*?<\/div>)/,
      `$1<div class="v116-wb-inline">🔷 Weltboss: ${a} Versuche · ${w} Siege</div>`
    );
  };
  v073PlayerRow=v084PlayerRow;
}

/* Override ranking/search so the new columns are actually fetched. */
v073LoadRanking=async function(){
  const el=document.querySelector('#v072HallRanking');
  if(!el)return;
  if(!(await v073Init())){
    el.innerHTML='<div class="v072-status-offline">Online-Rangliste momentan nicht erreichbar.</div>';
    return;
  }

  await v073SyncProfile(false);
  el.innerHTML='<div class="v072-empty">Rangliste wird geladen...</div>';

  const {data,error}=await v073Db.from('profiles')
    .select('id,character_name,class_id,class_name,level,bosses,gear_score,dungeons,combat_power,dungeon_progress,worldboss_attempts,worldboss_wins')
    .order('level',{ascending:false})
    .order('combat_power',{ascending:false})
    .limit(50);

  if(error){
    console.error(error);
    el.innerHTML='<div class="v072-status-offline">Rangliste konnte nicht geladen werden.</div>';
    return;
  }

  el.innerHTML=(data||[]).length
    ? data.map((p,i)=>v073PlayerRow(
        p,i,
        p.id===v073User.id
          ? '<span class="pill">DU</span>'
          : `<button class="btn secondary" data-v073-add="${p.id}" data-name="${v073Escape(p.character_name)}">Freund</button>`
      )).join('')
    : '<div class="v072-empty">Noch keine Spieler.</div>';

  v073BindAddButtons(el);
  try{v074BindProfileRows(el)}catch(e){}
};

v073SearchPlayer=async function(name,targetSelector){
  const target=document.querySelector(targetSelector);
  if(!target)return;
  name=String(name||'').trim();

  if(name.length<2){
    v063Toast('Mindestens 2 Zeichen eingeben','warn');
    return;
  }
  if(!(await v073Init()))return;
  if(!v073User?.id)return;

  target.innerHTML='<div class="v072-empty">Suche...</div>';
  const safe=name.replace(/[%_,]/g,'');

  const {data,error}=await v073Db.from('profiles')
    .select('id,character_name,class_id,class_name,level,bosses,gear_score,dungeons,combat_power,dungeon_progress,worldboss_attempts,worldboss_wins')
    .ilike('character_name',`%${safe}%`)
    .limit(20);

  if(error){
    console.error(error);
    target.innerHTML='<div class="v072-status-offline">Suche fehlgeschlagen.</div>';
    return;
  }

  const rows=(data||[]).filter(p=>p.id!==v073User.id);
  target.innerHTML=rows.length
    ? rows.map(p=>v073PlayerRow(
        p,null,
        `<button class="btn" data-v073-add="${p.id}" data-name="${v073Escape(p.character_name)}">Anfrage senden</button>`
      )).join('')
    : '<div class="v072-empty">Keinen Spieler gefunden.</div>';

  v073BindAddButtons(target);
  try{v074BindProfileRows(target)}catch(e){}
};

/* Public profile modal: fetch and display attempts/wins while event is active. */
const v116OldOpenProfile=v074OpenProfile;
v074OpenProfile=async function(id){
  await v116OldOpenProfile(id);
  if(!v110MysticEventActive()||!v073Ready)return;

  try{
    const {data:p,error}=await v073Db.from('profiles')
      .select('id,worldboss_attempts,worldboss_wins')
      .eq('id',id)
      .single();

    if(error||!p)return;

    const content=document.querySelector('#v074ProfileContent');
    if(!content)return;

    content.querySelector('#v116WorldbossStats')?.remove();

    const box=document.createElement('div');
    box.id='v116WorldbossStats';
    box.className='v116-wb-card';
    box.innerHTML=`
      <div class="v116-wb-card-title">🔷 Mystischer Weltboss · Smaragd-Koloss</div>
      <div class="v116-wb-grid">
        <div class="v116-wb-stat">VERSUCHE<b>${Number(p.worldboss_attempts)||0}</b></div>
        <div class="v116-wb-stat">SIEGE<b>${Number(p.worldboss_wins)||0}</b></div>
      </div>`;

    const dungeon=document.querySelector('#v081DungeonStatus');
    if(dungeon) dungeon.insertAdjacentElement('afterend',box);
    else content.appendChild(box);
  }catch(e){
    console.error('V4.02 worldboss profile stats',e);
  }
};

const v116BaseRender=render;
render=function(){
  const result=v116BaseRender();
  
  return result;
};

/* Push current stats once after upgrade. */
setTimeout(async()=>{
  try{
    if(v073Ready){
      v112EnsureWorldBossState();
      await v073SyncProfile(true);
    }
  }catch(e){}
},1800);
