
(function(){
  function v326CurrentPower(){
    try{
      const fn=window.v4125StableCombatPower;
      return Math.max(0,Math.round(Number(typeof fn==='function'?fn():combatPower())||0))
    }catch(e){return 0}
  }
  function v326Wb(){
    try{
      if(typeof v112EnsureWorldBossState==='function')return v112EnsureWorldBossState();
    }catch(e){}
    s.v110WorldBoss??={day:'',freeUsed:false,wins:0,attempts:0};
    return s.v110WorldBoss;
  }
  function v326Dp(){
    const completed=Array.isArray(s.dungeon?.completed)?[...s.dungeon.completed]:[];
    const progress={...(s.dungeon?.progress||{})};
    const pos=typeof v081DungeonPosition==='function'
      ?v081DungeonPosition({completed,progress},completed.length)
      :{dungeonIndex:Math.min(19,completed.length),dungeonNumber:Math.min(20,completed.length+1),enemyNumber:1};
    return {
      completed,
      progress,
      selected:Number(pos.dungeonIndex)||0,
      room:Math.max(0,(Number(pos.enemyNumber)||1)-1)
    };
  }

  /* Final payload owner: every Hall value comes from the same live sources as character UI. */
  const v326BasePayload=v073ProfilePayload;
  v073ProfilePayload=function(){
    const p=v326BasePayload.apply(this,arguments)||{};
    const wb=v326Wb();
    p.combat_power=v326CurrentPower();
    p.gear_score=typeof v072GearScore==='function'?v072GearScore():(Number(p.gear_score)||0);
    p.level=Math.max(1,Number(s.level)||1);
    p.bosses=Math.max(0,Number(s.story?.bossesDefeated)||0);
    p.dungeons=Array.isArray(s.dungeon?.completed)?s.dungeon.completed.length:0;
    p.dungeon_progress=v326Dp();
    p.equipment=typeof v074SafeEquipment==='function'?v074SafeEquipment():(p.equipment||{});
    p.worldboss_attempts=Math.max(0,Number(wb.attempts)||0);
    p.worldboss_wins=Math.max(0,Number(wb.wins)||0);
    p.pvp_buds=Math.max(0,Number(s.v204Pvp?.buds)||0);
    p.pvp_wins=Math.max(0,Number(s.v204Pvp?.wins)||0);
    p.pvp_losses=Math.max(0,Number(s.v204Pvp?.losses)||0);
    p.pvp_fights=Math.max(0,Number(s.v204Pvp?.fights)||0);
    return p;
  };

  function v326Pos(p){
    const dp=p?.dungeon_progress||{};
    if(typeof v081DungeonPosition==='function')return v081DungeonPosition(dp,p?.dungeons);
    const done=Array.isArray(dp.completed)?dp.completed.length:(Number(p?.dungeons)||0);
    return {dungeonIndex:Math.min(19,done),dungeonNumber:Math.min(20,done+1),enemyNumber:1,completed:false};
  }

  function v326Equipment(eq){
    try{return v074EquipmentHtml(eq)}catch(e){return '<div class="v072-empty">Ausrüstung konnte nicht angezeigt werden.</div>'}
  }

  /* Replace the many historical modal extensions with one canonical renderer. */
  v074OpenProfile=async function(id){
    if(!(await v073Init()))return;

    const overlay=document.querySelector('#v074ProfileOverlay');
    const content=document.querySelector('#v074ProfileContent');
    if(!overlay||!content)return;
    overlay.classList.add('show');
    content.innerHTML='<div class="v072-empty">Spielerprofil wird geladen...</div>';

    const own=!!(v073User && id===v073User.id);

    /* Own profile is synchronized immediately before reading it back. */
    if(own){
      try{await v073SyncProfile(true)}catch(e){console.error('V4.02 own profile sync',e)}
    }

    const {data:p,error}=await v073Db.from('profiles')
      .select('id,character_name,class_id,class_name,level,bosses,gear_score,dungeons,combat_power,equipment,dungeon_progress,worldboss_attempts,worldboss_wins,pvp_buds,pvp_wins,pvp_losses,pvp_fights')
      .eq('id',id).single();

    if(error||!p){
      content.innerHTML='<button class="btn secondary v074-close" onclick="v074CloseProfile()">✕</button><div class="v072-status-offline">Profil konnte nicht geladen werden.</div>';
      return;
    }

    /* On your own profile, local live values are authoritative even if a network
       round-trip is delayed. Other players always use their synced DB values. */
    if(own){
      const live=v073ProfilePayload();
      Object.assign(p,live);
    }

    const pos=v326Pos(p);
    const wbAttempts=Math.max(0,Number(p.worldboss_attempts)||0);
    const wbWins=Math.max(0,Number(p.worldboss_wins)||0);
    const pvpWins=Math.max(0,Number(p.pvp_wins)||0);
    const pvpLosses=Math.max(0,Number(p.pvp_losses)||0);
    const pvpFights=Math.max(0,Number(p.pvp_fights)||pvpWins+pvpLosses);
    const dungeonName=(typeof dungeons!=='undefined' && dungeons[pos.dungeonIndex])
      ?dungeons[pos.dungeonIndex].name:`Dungeon ${pos.dungeonNumber}`;

    content.innerHTML=`
      <div class="v074-profile-head">
        <div>
          <div class="v074-profile-title">${v073Escape(p.character_name||'Spieler')}</div>
          <div class="v074-profile-class">${v073Escape(p.class_name||'')} · Level ${Math.max(1,Number(p.level)||1)}</div>
        </div>
        <button class="btn secondary v074-close" id="v074CloseBtn">✕</button>
      </div>

      <div class="v326-profile-grid">
        <div class="v326-profile-stat"><span>⚔️ Kampfkraft</span><b>${Math.max(0,Number(p.combat_power)||0)}</b></div>
        <div class="v326-profile-stat"><span>🎒 Ausrüstung</span><b>${Math.max(0,Number(p.gear_score)||0)}</b></div>
        <div class="v326-profile-stat"><span>🌿 PvP-Buds</span><b>${Math.max(0,Number(p.pvp_buds)||0)}</b></div>
        <div class="v326-profile-stat"><span>🗺️ Dungeon</span><b>${pos.dungeonNumber}</b></div>
        <div class="v326-profile-stat"><span>👹 Gegner</span><b>${pos.enemyNumber}/10</b></div>
        <div class="v326-profile-stat"><span>🏁 Abgeschlossen</span><b>${Array.isArray(p.dungeon_progress?.completed)?p.dungeon_progress.completed.length:(Number(p.dungeons)||0)}</b></div>
      </div>

      <div class="v326-section">
        <div class="v326-section-title">🗺️ Aktueller Dungeon-Fortschritt</div>
        <div class="v326-dungeon">Dungeon ${pos.dungeonNumber} · ${v073Escape(dungeonName)} · ${pos.completed?'10/10 abgeschlossen':`${pos.enemyNumber}/10`}</div>
      </div>

      <div class="v326-section v326-mystic">
        <div class="v326-section-title">🔷 Mystischer Weltboss · Smaragd-Koloss</div>
        <div class="v326-profile-grid" style="margin:0">
          <div class="v326-profile-stat"><span>Versuche</span><b>${wbAttempts}</b></div>
          <div class="v326-profile-stat"><span>Siege</span><b>${wbWins}</b></div>
        </div>
        <div class="v326-profile-note">Versuche und Siege sind die tatsächlich gespeicherten Gesamtwerte des Spielers und werden nicht beim Tagesreset gelöscht.</div>
      </div>

      <div class="v326-section v326-pvp">
        <div class="v326-section-title">⚔️ PvP</div>
        <div class="v326-profile-grid" style="margin:0">
          <div class="v326-profile-stat"><span>Kämpfe</span><b>${pvpFights}</b></div>
          <div class="v326-profile-stat"><span>Siege</span><b>${pvpWins}</b></div>
          <div class="v326-profile-stat"><span>Niederlagen</span><b>${pvpLosses}</b></div>
        </div>
      </div>

      <h3 style="margin:14px 0 6px">Angelegte Ausrüstung</h3>
      <div class="v074-equipment">${v326Equipment(p.equipment)}</div>

      ${p.id!==v073User.id?`<button class="btn" id="v074AddFriend" style="width:100%;margin-top:12px">Freundschaftsanfrage senden</button>`:''}
    `;

    document.querySelector('#v074CloseBtn').onclick=v074CloseProfile;
    const add=document.querySelector('#v074AddFriend');
    if(add)add.onclick=()=>v073SendFriendRequest(p.id,p.character_name);
  };

  /* Own Hall card: use exactly the same live combatPower() as Character. */
  v072RenderOwnProfile=function(){
    const el=document.querySelector('#v072OwnProfile');
    if(!el)return;
    const p=v072Profile();
    const dp=v326Dp();
    const pos=v326Pos({dungeon_progress:dp,dungeons:dp.completed.length});
    const wb=v326Wb();
    el.innerHTML=`
      <div class="v072-profile-name">${v073Escape(p.name)}</div>
      <div class="v072-profile-meta">${v073Escape(p.className)} · Spieler-ID ${String(p.id||'').slice(0,8)}</div>
      <div class="v072-profile-stats">
        <div class="v072-profile-stat"><span>Level</span><b>${p.level}</b></div>
        <div class="v072-profile-stat"><span>Kampfkraft</span><b>${v326CurrentPower()}</b></div>
        <div class="v072-profile-stat"><span>Dungeon</span><b>${pos.dungeonNumber}</b></div>
        <div class="v072-profile-stat"><span>Gegner</span><b>${pos.enemyNumber}/10</b></div>
      </div>
      <div class="v116-wb-inline" style="margin-top:7px">🔷 Mystisch: ${Math.max(0,Number(wb.attempts)||0)} Versuche · ${Math.max(0,Number(wb.wins)||0)} Siege</div>`;
  };

  function v326Row(p,i=null,actions=''){
    const rank=i===null?'':`<div class="v072-rank ${v073RankClass(i)}">${i+1}</div>`;
    const left=i===null?'<div class="v072-rank">P</div>':rank;
    const pos=v326Pos(p);
    return `<div class="v072-player-row" data-profile-id="${v073Escape(p.id)}">
      ${left}
      <div>
        <div class="v072-player-name">${v073Escape(p.character_name)}</div>
        <div class="v072-player-sub">
          ${v073Escape(p.class_name||'')} · Lv. ${Math.max(1,Number(p.level)||1)} ·
          Kampfkraft ${Math.max(0,Number(p.combat_power)||0)} ·
          🌿 ${Math.max(0,Number(p.pvp_buds)||0)} ·
          <span class="v084-progress-inline">Dungeon ${pos.dungeonNumber} · ${pos.enemyNumber}/10</span>
        </div>
        <div class="v116-wb-inline">🔷 Mystisch: ${Math.max(0,Number(p.worldboss_attempts)||0)} Versuche · ${Math.max(0,Number(p.worldboss_wins)||0)} Siege</div>
      </div>
      <div class="v073-row-actions">${actions}</div>
    </div>`;
  }
  v073PlayerRow=v326Row;
  try{v084PlayerRow=v326Row}catch(e){}

  const V326_SELECT='id,character_name,class_id,class_name,level,bosses,gear_score,dungeons,combat_power,dungeon_progress,worldboss_attempts,worldboss_wins,pvp_buds,pvp_wins,pvp_losses,pvp_fights';

  v073LoadRanking=async function(){
    const el=document.querySelector('#v072HallRanking');
    if(!el)return;
    if(!(await v073Init()))return;
    try{await v073SyncProfile(false)}catch(e){}
    el.innerHTML='<div class="v072-empty">Rangliste wird geladen...</div>';

    const {data,error}=await v073Db.from('profiles')
      .select(V326_SELECT)
      .order('level',{ascending:false})
      .order('pvp_buds',{ascending:false})
      .order('combat_power',{ascending:false})
      .limit(50);

    if(error){
      console.error('V4.02 ranking',error);
      el.innerHTML='<div class="v072-status-offline">Rangliste konnte nicht geladen werden.</div>';
      return;
    }

    el.innerHTML=(data||[]).length
      ?data.map((p,i)=>v326Row(
          p,i,
          p.id===v073User.id
            ?'<span class="pill">DU</span>'
            :`<button class="btn secondary" data-v073-add="${p.id}" data-name="${v073Escape(p.character_name)}">Freund</button>`
        )).join('')
      :'<div class="v072-empty">Noch keine Spieler in der Hall of Haze.</div>';

    v073BindAddButtons(el);
    v074BindProfileRows(el);
  };

  v073SearchPlayer=async function(name,targetSelector){
    const target=document.querySelector(targetSelector);
    if(!target)return;
    name=String(name||'').trim();
    if(name.length<2){v063Toast('Mindestens 2 Zeichen eingeben','warn');return}
    if(!(await v073Init()))return;
    target.innerHTML='<div class="v072-empty">Suche...</div>';
    const safe=name.replace(/[%_,]/g,'');

    const {data,error}=await v073Db.from('profiles')
      .select(V326_SELECT)
      .ilike('character_name',`%${safe}%`)
      .limit(20);

    if(error){
      console.error('V4.02 search',error);
      target.innerHTML='<div class="v072-status-offline">Suche fehlgeschlagen.</div>';
      return;
    }

    const rows=(data||[]).filter(p=>p.id!==v073User.id);
    target.innerHTML=rows.length
      ?rows.map(p=>v326Row(p,null,`<button class="btn" data-v073-add="${p.id}" data-name="${v073Escape(p.character_name)}">Anfrage senden</button>`)).join('')
      :'<div class="v072-empty">Keinen Spieler gefunden.</div>';

    v073BindAddButtons(target);
    v074BindProfileRows(target);
  };

  /* Re-sync quickly after a worldboss attempt finishes. persist()/render already
     schedules normal sync; this closes the stale-profile window further. */
  let v326LastAttempts=Math.max(0,Number(v326Wb().attempts)||0);
  setInterval(()=>{
    if(document.hidden||!document.querySelector('#world')?.classList.contains('active'))return;
    const now=Math.max(0,Number(v326Wb().attempts)||0);
    if(now!==v326LastAttempts){
      v326LastAttempts=now;
      if(v073Ready && v073User && !v073User.is_anonymous){
        v073SyncProfile(true).catch(e=>console.error('V4.02 worldboss sync',e));
      }
    }
  },3000);

  setTimeout(()=>{
    try{
      if(v073Ready && v073User && !v073User.is_anonymous)v073SyncProfile(true);
    }catch(e){}
  },1500);

  
  const line=document.querySelector('#v141VersionLine');
})();
