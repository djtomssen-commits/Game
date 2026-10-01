(()=>{
  'use strict';
  const VERSION='V6.55';
  let requestSeq=0;

  const esc=v=>{
    try{return typeof v073Escape==='function'?v073Escape(v):String(v??'')}
    catch(e){return String(v??'')}
  };
  const num=v=>Math.max(0,Math.round(Number(v)||0));
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,Math.round(Number(v)||0)));

  function overlayParts(){
    return {
      overlay:document.querySelector('#v074ProfileOverlay'),
      content:document.querySelector('#v074ProfileContent'),
      modal:document.querySelector('#v074ProfileOverlay .v074-profile-modal')
    };
  }

  function wireClose(){
    const btn=document.querySelector('#v074CloseBtn');
    if(btn)btn.onclick=()=>{requestSeq++; try{v074CloseProfile()}catch(e){document.querySelector('#v074ProfileOverlay')?.classList.remove('show')}};
  }

  function showLoading(id){
    const {overlay,content,modal}=overlayParts();
    if(!overlay||!content)return false;
    overlay.classList.add('show');
    if(modal)modal.scrollTop=0;
    content.dataset.profileId=String(id||'');
    content.innerHTML=`
      <button class="btn secondary v074-close" id="v074CloseBtn" aria-label="Spielerprofil schließen">✕</button>
      <div class="v655-profile-loading">
        <div class="v655-profile-spinner" aria-hidden="true"></div>
        <div>Spielerprofil wird geladen...</div>
      </div>`;
    wireClose();
    return true;
  }

  function showError(id,message){
    const {content}=overlayParts();
    if(!content)return;
    content.innerHTML=`
      <button class="btn secondary v074-close" id="v074CloseBtn" aria-label="Spielerprofil schließen">✕</button>
      <div class="v655-profile-error">
        <strong>Profil konnte nicht geladen werden.</strong>
        <div>${esc(message||'Die Online-Verbindung antwortet gerade nicht.')}</div>
        <div class="v655-profile-actions">
          <button class="btn" id="v655ProfileRetry">Erneut versuchen</button>
          <button class="btn secondary" id="v655ProfileClose">Schließen</button>
        </div>
      </div>`;
    wireClose();
    document.querySelector('#v655ProfileRetry')?.addEventListener('click',()=>v074OpenProfile(id));
    document.querySelector('#v655ProfileClose')?.addEventListener('click',()=>{requestSeq++;try{v074CloseProfile()}catch(e){document.querySelector('#v074ProfileOverlay')?.classList.remove('show')}});
  }

  function dungeonPos(p){
    const dp=(p&&p.dungeon_progress&&typeof p.dungeon_progress==='object')?p.dungeon_progress:{};
    try{
      if(typeof v081DungeonPosition==='function'){
        const x=v081DungeonPosition(dp,Number(p?.dungeons)||0);
        if(x&&Number.isFinite(Number(x.dungeonIndex)))return x;
      }
    }catch(e){}
    const completed=Array.isArray(dp.completed)?dp.completed.map(Number).filter(Number.isFinite):[];
    let idx=clamp(dp.lastActive ?? dp.selected ?? completed.length,0,19);
    let room=Number(dp.progress?.[idx]);
    if(!Number.isFinite(room))room=(Number(dp.selected)===idx?Number(dp.room):0);
    room=clamp(room,0,9);
    return {dungeonIndex:idx,dungeonNumber:idx+1,enemyNumber:room+1,completed:completed.includes(idx)};
  }

  function equipmentHtml(eq){
    try{return typeof v074EquipmentHtml==='function'?v074EquipmentHtml(eq||{}):'<div class="v072-empty">Keine Ausrüstung sichtbar.</div>'}
    catch(e){return '<div class="v072-empty">Ausrüstung konnte nicht angezeigt werden.</div>'}
  }

  function renderProfile(p){
    const {content,modal}=overlayParts();
    if(!content||!p)return;
    content.dataset.profileId=String(p.id||'');
    const pos=dungeonPos(p);
    const dp=(p.dungeon_progress&&typeof p.dungeon_progress==='object')?p.dungeon_progress:{};
    const publicTitle=String(dp?.public_title?.label||'');
    const completed=Array.isArray(dp.completed)?dp.completed.length:num(p.dungeons);
    const wbAttempts=num(p.worldboss_attempts), wbWins=num(p.worldboss_wins);
    const pvpWins=num(p.pvp_wins), pvpLosses=num(p.pvp_losses);
    const pvpFights=Math.max(num(p.pvp_fights),pvpWins+pvpLosses);
    const petStats=(dp.pet_stats&&typeof dp.pet_stats==='object')?dp.pet_stats:{};
    const petRows=Math.max(0,Math.min(20,num(petStats.rows)));
    const petFound=Math.max(0,Math.min(120,num(petStats.found)));
    let dungeonName=`Dungeon ${pos.dungeonNumber}`;
    try{if(typeof dungeons!=='undefined'&&dungeons?.[pos.dungeonIndex]?.name)dungeonName=dungeons[pos.dungeonIndex].name}catch(e){}
    let own=false;
    try{own=!!v073User?.id&&String(p.id||'')===String(v073User.id)}catch(e){}

    content.innerHTML=`
      <div class="v074-profile-head">
        <div>
          <div class="v074-profile-title">${esc(p.character_name||'Spieler')}</div>
          ${publicTitle?`<div class="v6338-profile-title">👑 ${esc(publicTitle)}</div>`:''}
          <div class="v074-profile-class">${esc(p.class_name||'')} · Level ${Math.max(1,num(p.level))}</div>
        </div>
        <button class="btn secondary v074-close" id="v074CloseBtn" aria-label="Spielerprofil schließen">✕</button>
      </div>

      <div class="v326-profile-grid">
        <div class="v326-profile-stat"><span>⚔️ Kampfkraft</span><b>${num(p.combat_power)}</b></div>
        <div class="v326-profile-stat"><span>🎒 Ausrüstung</span><b>${num(p.gear_score)}</b></div>
        <div class="v326-profile-stat"><span>🌿 PvP-Buds</span><b>${num(p.pvp_buds)}</b></div>
        <div class="v326-profile-stat"><span>🗺️ Dungeon</span><b>${pos.dungeonNumber}</b></div>
        <div class="v326-profile-stat"><span>👹 Gegner</span><b>${pos.enemyNumber}/10</b></div>
        <div class="v326-profile-stat"><span>🏁 Abgeschlossen</span><b>${completed}</b></div>
      </div>

      <div class="v326-section">
        <div class="v326-section-title">🗺️ Aktueller Dungeon-Fortschritt</div>
        <div class="v326-dungeon">Dungeon ${pos.dungeonNumber} · ${esc(dungeonName)} · ${pos.completed?'10/10 abgeschlossen':`${pos.enemyNumber}/10`}</div>
      </div>

      <div class="v326-section v326-mystic">
        <div class="v326-section-title">🔷 Mystischer Weltboss · Smaragd-Koloss</div>
        <div class="v326-profile-grid" style="margin:0">
          <div class="v326-profile-stat"><span>Versuche</span><b>${wbAttempts}</b></div>
          <div class="v326-profile-stat"><span>Siege</span><b>${wbWins}</b></div>
        </div>
        <div class="v326-profile-note">Gesamtwerte des Spielers.</div>
      </div>

      <div class="v326-section v326-pvp">
        <div class="v326-section-title">⚔️ PvP</div>
        <div class="v326-profile-grid" style="margin:0">
          <div class="v326-profile-stat"><span>Kämpfe</span><b>${pvpFights}</b></div>
          <div class="v326-profile-stat"><span>Siege</span><b>${pvpWins}</b></div>
          <div class="v326-profile-stat"><span>Niederlagen</span><b>${pvpLosses}</b></div>
        </div>
      </div>

      <div class="v326-section v6113-profile-pets">
        <div class="v326-section-title">🐾 Pet Sammelalbum</div>
        <div class="v6113-pet-profile-grid">
          <div class="v6113-pet-profile-stat">
            <span>📚 Gesammelte Pet-Reihen</span>
            <b>${petRows}<small>/20</small></b>
          </div>
          <div class="v6113-pet-profile-stat">
            <span>🐾 Gefundene Pets</span>
            <b>${petFound}<small>/120</small></b>
          </div>
        </div>
        <div class="v326-profile-note">Öffentliche Sammelfortschritte dieses Spielers.</div>
      </div>

      <h3 style="margin:14px 0 6px">Angelegte Ausrüstung</h3>
      <div class="v074-equipment">${equipmentHtml(p.equipment)}</div>
      ${!own?'<button class="btn" id="v074AddFriend" style="width:100%;margin-top:12px">Freundschaftsanfrage senden</button>':''}
    `;
    wireClose();
    const add=document.querySelector('#v074AddFriend');
    if(add)add.onclick=()=>{try{v073SendFriendRequest(p.id,p.character_name)}catch(e){}};
    if(modal)modal.scrollTop=0;
  }

  function deadline(promise,ms){
    return Promise.race([
      Promise.resolve(promise).then(value=>({ok:true,value}),error=>({ok:false,error})),
      new Promise(resolve=>setTimeout(()=>resolve({ok:false,timeout:true}),ms))
    ]);
  }

  async function robustOpen(id){
    const mySeq=++requestSeq;
    if(!showLoading(id))return;
    const sid=String(id||'');
    let own=false;
    try{
      const ownId=String(v073User?.id||s?.social?.playerId||localStorage.getItem('growLegendsPlayerId')||'');
      own=!!ownId&&sid===ownId;
    }catch(e){}

    /* Own profile must open from the authoritative local save immediately.
       Online mirrors are updated afterwards and never block the UI. */
    if(own){
      try{
        const p=(typeof v073ProfilePayload==='function'?v073ProfilePayload():null);
        if(p){
          renderProfile({...p,id:(v073User?.id||p.id||s?.social?.playerId||sid)});
          setTimeout(()=>{
            try{if(typeof v073SyncProfile==='function')void deadline(v073SyncProfile(true),4500)}catch(e){}
            try{if(typeof v649SyncDungeonProgress==='function')void deadline(v649SyncDungeonProgress(true),4500)}catch(e){}
            try{if(typeof v446SyncCombatPower==='function')void deadline(v446SyncCombatPower(true),4500)}catch(e){}
          },0);
          return;
        }
      }catch(e){console.warn(VERSION+' local own profile',e)}
    }

    /* Other players require Supabase, but every await has a hard deadline so
       the modal can never stay on "wird geladen" forever. */
    let ready=true;
    try{
      if(typeof v073Init==='function'){
        const init=await deadline(v073Init(),3500);
        ready=!!(init.ok&&init.value);
      }
    }catch(e){ready=false}
    if(mySeq!==requestSeq)return;
    if(!ready||typeof v073Db==='undefined'||!v073Db){showError(id,'Online-Verbindung ist momentan nicht bereit.');return}

    try{
      const q=v073Db.from('profiles')
        .select('id,character_name,class_id,class_name,level,bosses,gear_score,dungeons,combat_power,equipment,dungeon_progress,worldboss_attempts,worldboss_wins,pvp_buds,pvp_wins,pvp_losses,pvp_fights')
        .eq('id',id).single();
      const res=await deadline(q,6500);
      if(mySeq!==requestSeq)return;
      if(!res.ok){
        showError(id,res.timeout?'Der Server antwortet zu langsam.':'Die Profildaten konnten nicht abgerufen werden.');
        return;
      }
      const result=res.value||{};
      if(result.error||!result.data){showError(id,'Für diesen Spieler konnten keine Profildaten geladen werden.');return}
      renderProfile(result.data);
    }catch(e){
      if(mySeq!==requestSeq)return;
      console.warn(VERSION+' profile load',e);
      showError(id,'Die Online-Verbindung wurde unterbrochen.');
    }
  }

  /* Replace the accumulated historical blocking wrapper chain. The existing
     V6.52 MutationObserver still decorates every newly rendered profile, so the
     Grow-Legends redesign and item renderer remain unchanged. */
  try{
    v074OpenProfile=robustOpen;
    window.v074OpenProfile=robustOpen;
    window.__v655PlayerProfileLoadFix=true;
  }catch(e){console.error(VERSION+' install',e)}
})();
