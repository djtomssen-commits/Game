/* ===== V4.02 public player profiles ===== */
function v074CombatPower(){
  /* V4.46: public/online power is exactly the character-page combatPower(). */
  try{return Math.max(0,Math.round(Number(combatPower())||0))}catch(e){return 0}
}
function v074SafeEquipment(){
 const out={};
 Object.entries(s.equipment||{}).forEach(([slot,it])=>{
  if(!it)return;
  out[slot]={
   name:String(it.name||'Gegenstand').slice(0,80),
   quality:String(it.quality||'gray').slice(0,20),
   bonus:it.bonus||{},
   enchant:it.enchant||null,
   gem:it.gem||null,
   setName:it.setName||null,
   mysticSpecial:it.mysticSpecial?{
    key:String(it.mysticSpecial.key||'').slice(0,40),
    value:Number(it.mysticSpecial.value)||0,
    label:String(it.mysticSpecial.label||'').slice(0,120)
   }:null
  };
 });
 return out;
}
function v074DungeonProgress(){
  return {
    completed:[...(s.dungeon?.completed||[])],
    progress:{...(s.dungeon?.progress||{})}
  };
}

/* Extend V4.02 profile upload with the new database columns. */
v073ProfilePayload=function(){
  return {
    id:v073User?.id || s.social?.playerId,
    character_name:v071CleanName(s.characterName)||'Unbenannt',
    class_id:s.playerClass||null,
    class_name:v072ClassName(),
    level:Number(s.level)||1,
    bosses:Number(s.story?.bossesDefeated)||0,
    gear_score:v072GearScore(),
    dungeons:Number(s.dungeon?.completed?.length)||0,
    combat_power:v074CombatPower(),
    equipment:v074SafeEquipment(),
    dungeon_progress:v074DungeonProgress(),
    updated_at:new Date().toISOString()
  };
};

function v074EquipmentHtml(eq){
  const labels={weapon:'Waffe',head:'Kopf',chest:'Brust',hands:'Hände',legs:'Beine',feet:'Füße',ring:'Ring',amulet:'Amulett',offhand:'Nebenhand'};
  const entries=Object.entries(eq||{});
  if(!entries.length)return '<div class="v072-empty">Keine Ausrüstung sichtbar.</div>';
  return entries.map(([slot,it])=>{
    const bonus=Object.entries(it.bonus||{}).map(([k,v])=>`${v>=0?'+':''}${v} ${k}`).join(' · ');
    return `<div class="v074-slot">
      <div class="v074-slot-name">${v073Escape(labels[slot]||slot)}</div>
      <div class="v074-item">${v073Escape(it.name||'Gegenstand')}</div>
      <div class="v074-item-bonus">${v073Escape(bonus||'—')}</div>
    </div>`;
  }).join('');
}

async function v074OpenProfile(id){
  /* V8.009: legacy profile DOM renderer retired.
     v655 installs the canonical robust profile loader later in the boot chain. */
  return false;
}

function v074CloseProfile(){document.querySelector('#v074ProfileOverlay')?.classList.remove('show')}

document.querySelector('#v074ProfileOverlay')?.addEventListener('click',e=>{
  if(e.target.id==='v074ProfileOverlay')v074CloseProfile();
});

function v074BindProfileRows(root=document){
  root.querySelectorAll('.v072-player-row[data-profile-id]').forEach(row=>{
    row.onclick=e=>{
      if(e.target.closest('button'))return;
      v074OpenProfile(row.dataset.profileId);
    };
  });
}

/* Expand ranking/search queries to retrieve new fields and bind clickable rows. */
const v074OldLoadRanking=v073LoadRanking;
v073LoadRanking=async function(){
  const el=document.querySelector('#v072HallRanking');
  if(!el)return;
  if(!(await v073Init()))return;
  if(!v073User?.id)return;
  await v073SyncProfile(false);
  el.innerHTML='<div class="v072-empty">Rangliste wird geladen...</div>';
  const {data,error}=await v073Db.from('profiles')
    .select('id,character_name,class_id,class_name,level,bosses,gear_score,dungeons,combat_power')
    .order('level',{ascending:false}).order('combat_power',{ascending:false}).limit(50);
  if(error){console.error(error);el.innerHTML='<div class="v072-status-offline">Rangliste konnte nicht geladen werden.</div>';return}
  el.innerHTML=(data||[]).length?data.map((p,i)=>v073PlayerRow(p,i,p.id===v073User.id?'<span class="pill">DU</span>':`<button class="btn secondary" data-v073-add="${p.id}" data-name="${v073Escape(p.character_name)}">Freund</button>`)).join(''):'<div class="v072-empty">Noch keine Spieler.</div>';
  v073BindAddButtons(el);v074BindProfileRows(el);
};

v073SearchPlayer=async function(name,targetSelector){
  const target=document.querySelector(targetSelector);if(!target)return;
  name=String(name||'').trim();if(name.length<2){v063Toast('Mindestens 2 Zeichen eingeben','warn');return}
  if(!(await v073Init()))return;
  if(!v073User?.id)return;
  target.innerHTML='<div class="v072-empty">Suche...</div>';
  const safe=name.replace(/[%_,]/g,'');
  const {data,error}=await v073Db.from('profiles')
    .select('id,character_name,class_id,class_name,level,bosses,gear_score,dungeons,combat_power')
    .ilike('character_name',`%${safe}%`).limit(20);
  if(error){console.error(error);target.innerHTML='<div class="v072-status-offline">Suche fehlgeschlagen.</div>';return}
  const rows=(data||[]).filter(p=>p.id!==v073User.id);
  target.innerHTML=rows.length?rows.map(p=>v073PlayerRow(p,null,`<button class="btn" data-v073-add="${p.id}" data-name="${v073Escape(p.character_name)}">Anfrage senden</button>`)).join(''):'<div class="v072-empty">Keinen Spieler gefunden.</div>';
  v073BindAddButtons(target);v074BindProfileRows(target);
};
v072SearchPlayer=v073SearchPlayer;

/* V8.009: global profile-row rebind wrapper retired.
   Search/Hall owners bind rows when they create them; profile modal is v655-owned. */
/* V4.52: removed unsafe pre-auth profile sync. Account resolver owns first sync. */
