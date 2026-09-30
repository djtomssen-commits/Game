/* ===== V4.02 visual ownership for 20er + 10er dungeon maps ===== */

function v251Esc(value){
  return typeof v240Esc==='function'
    ?v240Esc(value)
    :String(value??'').replace(/[&<>"']/g,m=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[m]));
}

function v251DungeonWorldState(i){
  if(dungeonCompleted(i))return 'completed';

  const d=dungeons?.[i];
  if(!d)return 'locked';

  const levelOk=Number(s.level||0)>=Number(d.minLevel||0);
  const keyOk=i===0 || dungeonUnlocked(i);

  if(levelOk && keyOk){
    const firstOpen=dungeons.findIndex((_,x)=>
      !dungeonCompleted(x) &&
      Number(s.level||0)>=Number(dungeons[x]?.minLevel||0) &&
      (x===0 || dungeonUnlocked(x))
    );
    return i===firstOpen?'current':'available';
  }

  return 'locked';
}

function v251WorldStateText(i,state){
  if(state==='completed')return '✓ ABGESCHLOSSEN';
  if(state==='current')return 'AKTUELL';
  if(state==='available')return 'BETRETBAR';

  const d=dungeons?.[i];
  const req=i===0
    ?Number(d?.minLevel||1)
    :(typeof v250KeyRequiredLevel==='function'
      ?v250KeyRequiredLevel(i)
      :Number(d?.minLevel||1));

  if(Number(s.level||0)<req){
    return `AB LVL ${req}`;
  }

  return `STEIN ${i+1} FEHLT`;
}

function v251PortalHtml(i){
  const d=dungeons[i];
  const state=v251DungeonWorldState(i);
  const locked=state==='locked';

  return `
    <button type="button"
      class="v251-portal ${state}"
      data-v065-dungeon="${i}"
      aria-label="Dungeon ${i+1}: ${v251Esc(d.name)}">
      <div class="v251-portal-ring">
        <span class="v251-portal-num">${i+1}</span>
        <span class="v251-portal-core"></span>
        ${locked?'<span class="v251-portal-lock">🔒</span>':''}
      </div>
      <div class="v251-portal-name">${v251Esc(d.name)}</div>
      <div class="v251-portal-state">${v251WorldStateText(i,state)}</div>
    </button>
  `;
}

function v251NextDungeonIndex(){
  for(let i=0;i<dungeons.length;i++){
    if(!dungeonCompleted(i))return i;
  }
  return dungeons.length-1;
}

function v251RenderWorld(){
  try{v243RepairAndSaveDungeonKeys()}catch(e){}
  try{if(typeof v250EnsureKeyProgress==='function')v250EnsureKeyProgress()}catch(e){}

  const card=
    document.querySelector('#dungeonMapCard') ||
    document.querySelector('#dungeon > .card:first-of-type');

  if(!card)return false;

  const battle=document.querySelector('#dungeonBattleCard');
  if(battle)battle.style.display='none';

  card.id='dungeonMapCard';
  card.style.display='';
  card.className='card v065-worldmap-card v251-world-card';

  const next=v251NextDungeonIndex();
  const nextD=dungeons[next];
  const nextState=v251DungeonWorldState(next);

  let keyText='Kein Schlüsselstein nötig';
  if(next>0){
    const has=dungeonUnlocked(next);
    const req=typeof v250KeyRequiredLevel==='function'
      ?v250KeyRequiredLevel(next)
      :Number(nextD.minLevel)||1;

    if(has){
      keyText=`Schlüsselstein ${next+1} gefunden`;
    }else if(typeof v250KeyStatusText==='function'){
      keyText=v250KeyStatusText(next);
    }else{
      keyText=`Schlüsselstein ${next+1} · ab Level ${req}`;
    }
  }

  card.innerHTML=`
    <div class="v251-map-head">
      <div class="v251-map-kicker">Verseuchte Gebiete</div>
      <div class="v251-map-title">DUNGEONS</div>
      <div class="v251-map-sub">Wähle deinen Dungeon · 20 Gebiete · je 10 Gegner</div>
      <div class="v251-ticket">
        <b>🎟️ DUNGEON-VERSUCH</b>
        <span id="dungeonTicketText">${esc(typeof dungeonWaitText==='function'?dungeonWaitText():'Gratisversuch prüfen …')}</span>
      </div>
    </div>

    <div class="v251-world-grid">
      ${dungeons.map((_,i)=>v251PortalHtml(i)).join('')}
    </div>

    <div class="v251-world-footer">
      <div>
        <div class="v251-foot-label">Nächster Dungeon</div>
        <div class="v251-foot-main">${v251Esc(nextD?.name||`Dungeon ${next+1}`)}</div>
        <div class="v251-foot-sub">
          Dungeon ${next+1} · ${nextState==='completed'?'abgeschlossen':v251WorldStateText(next,nextState)}
        </div>
      </div>
      <div>
        <div class="v251-foot-label">Schlüsselstein ${Math.max(2,next+1)}</div>
        <div class="v251-foot-main ${nextState!=='locked'?'v251-foot-accent':''}">
          ${next===0?'Startgebiet':(dungeonUnlocked(next)?'Gefunden':'Noch nicht gefunden')}
        </div>
        <div class="v251-foot-sub">${v251Esc(keyText)}</div>
      </div>
    </div>
  `;

  try{v067BindWorldMap()}catch(e){}

  /*
    Let the existing ticket system repaint the fresh #dungeonTicketText.
  */
  try{
    if(typeof renderDungeonTicket==='function')renderDungeonTicket();
    if(typeof updateDungeonTicket==='function')updateDungeonTicket();
  }catch(e){}

  return true;
}


function v251RoomState(di,ri){
  const current=v048RoomIndex(di);
  if(dungeonCompleted(di))return 'done';
  if(ri<current)return 'done';
  if(ri===current)return 'current';
  return 'locked';
}

function v251RoomHtml(di,ri){
  const e=dungeons?.[di]?.enemies?.[ri];
  const state=v251RoomState(di,ri);
  const boss=ri===9;
  const level=v244DungeonRoomLevel(di,ri);

  return `
    <button type="button"
      class="v251-room ${state} ${boss?'boss':''}"
      data-v064-room="${ri}"
      ${state==='current'?'':'disabled'}>
      <div class="v251-room-orb">
        ${v251Esc(e?.icon||'👹')}
        <span class="v251-room-num">${ri+1}</span>
        ${state==='done'?'<span class="v251-room-check">✓</span>':''}
      </div>
      <div class="v251-room-name">${v251Esc(v244DungeonRoomName(di,ri))}</div>
      <div class="v251-room-level">${boss?'BOSS · ':''}LV. ${level}</div>
    </button>
  `;
}

function v251StartCurrentDungeonFight(di){
  if(dungeonCompleted(di))return;

  const current=v048RoomIndex(di);

  s.dungeon.selected=di;
  s.dungeon.room=current;
  s.dungeon.layer='dungeon';
  s.dungeon.view='battle';

  try{persist(false)}catch(e){
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
  }

  renderDungeon();
  window.scrollTo({top:0,behavior:'smooth'});
}

function v251RenderDetail(){
  try{v243RepairAndSaveDungeonKeys()}catch(e){}

  const di=v048DungeonIndex();
  const d=dungeons?.[di];
  if(!d)return false;

  const current=Math.max(0,Math.min(9,v048RoomIndex(di)));
  const e=d.enemies?.[current];
  const bal=e?v025EnemyStats(di,current,e):null;
  const completed=dungeonCompleted(di);
  const boss=current===9;

  const card=
    document.querySelector('#dungeonMapCard') ||
    document.querySelector('#dungeon > .card:first-of-type');

  if(!card)return false;

  const battle=document.querySelector('#dungeonBattleCard');
  if(battle)battle.style.display='none';

  card.id='dungeonMapCard';
  card.style.display='';
  card.className='card v064-detail-map v251-detail-card';

  const progress=completed?10:current;
  const xp=Number(e?.xp)||0;
  const gold=Number(e?.gold)||0;

  card.innerHTML=`
    <div class="v251-map-head">
      <div class="v251-map-kicker">Dungeon ${di+1}</div>
      <div class="v251-map-title">${v251Esc(d.name)}</div>
      <div class="v251-map-sub">
        Besiege alle 10 Gegner der Reihe nach · Fortschritt ${progress}/10
      </div>
      <div class="v251-ticket">
        <b>🎟️ DUNGEON-VERSUCH</b>
        <span id="dungeonTicketText">${esc(typeof dungeonWaitText==='function'?dungeonWaitText():'Gratisversuch prüfen …')}</span>
      </div>
    </div>

    <div class="v251-route-wrap">
      <div class="v251-route">
        ${d.enemies.map((_,ri)=>v251RoomHtml(di,ri)).join('')}
      </div>
    </div>

    <div class="v251-current-panel">
      <div>
        <div class="v251-current-title">
          <div class="v251-current-icon">${v251Esc(e?.icon||'👹')}</div>
          <div>
            <b>${completed?'Dungeon abgeschlossen':`${current+1} · ${v251Esc(e?.name||'Gegner')}`}</b>
            <span>
              ${completed
                ?'Alle Gegner besiegt'
                :`${boss?'BOSS · ':''}Empfohlen Level ${bal?.rec||v244DungeonRoomLevel(di,current)} · ${bal?.hp||0} HP`
              }
            </span>
          </div>
        </div>
      </div>

      <div class="v251-reward-box">
        <div class="v251-reward-label">MÖGLICHE BELOHNUNGEN</div>
        <div class="v251-rewards">
          ${boss?'<div class="v251-reward legendary">🟠<br>LEGENDÄR</div>':'<div class="v251-reward">🎁<br>ITEM</div>'}
          <div class="v251-reward">EXP<br>${xp}</div>
          <div class="v251-reward">💰<br>${gold}</div>
          <div class="v251-reward">🟢<br>Harz</div>
        </div>
      </div>
    </div>

    <div class="v251-detail-bottom">
      <div class="v251-mini-stat">
        <span>DEINE STÄRKE</span>
        <b>${Math.round(combatPower())}</b>
      </div>
      <div class="v251-mini-stat">
        <span>GEGNER</span>
        <b>${completed?'—':`Lv. ${bal?.rec||1}`}</b>
      </div>
      <button type="button"
        class="btn v251-enter"
        id="v251EnterCurrent"
        ${completed?'disabled':''}>
        ${completed?'✓ DUNGEON ABGESCHLOSSEN':'⚔️ GEGNER ANGREIFEN'}
      </button>
    </div>
  `;

  try{v065InjectBackButton()}catch(e){}

  card.querySelectorAll('[data-v064-room]').forEach(btn=>{
    btn.onclick=e=>{
      e.preventDefault();
      e.stopPropagation();

      const ri=Number(btn.dataset.v064Room);
      if(ri!==v048RoomIndex(di))return;

      v251StartCurrentDungeonFight(di);
    };
  });

  const enter=card.querySelector('#v251EnterCurrent');
  if(enter && !completed){
    enter.onclick=e=>{
      e.preventDefault();
      v251StartCurrentDungeonFight(di);
    };
  }

  try{
    if(typeof renderDungeonTicket==='function')renderDungeonTicket();
    if(typeof updateDungeonTicket==='function')updateDungeonTicket();
  }catch(e){}

  return true;
}


/*
  Final visual render ownership. Underlying opening, combat, rewards,
  progression, key logic and V4.02 balance are unchanged.
*/
v065RenderWorld=v251RenderWorld;
v244RenderSelectedDungeonMap=v251RenderDetail;
v064RenderMap=v251RenderDetail;


/* Final world node binding, compatible with new portal cards. */
v067BindWorldMap=function(){
  const card=document.querySelector('#dungeonMapCard.v251-world-card');
  if(!card)return;

  card.querySelectorAll('[data-v065-dungeon]').forEach(btn=>{
    const i=Number(btn.dataset.v065Dungeon);

    btn.onclick=e=>{
      e.preventDefault();
      e.stopPropagation();
      v067OpenDungeon(i);
    };
  });
};


/* Keep world/detail transitions on the new renderers. */
const v251BaseOpenDungeon=v067OpenDungeon;
v067OpenDungeon=function(i){
  i=Number(i);

  try{v243RepairAndSaveDungeonKeys()}catch(e){}

  const d=dungeons?.[i];
  if(!d)return false;

  if(dungeonCompleted(i)){
    if(typeof v063Toast==='function'){
      v063Toast(`${d.name} wurde bereits abgeschlossen.`,'warn');
    }
    return false;
  }

  if(Number(s.level||0)<Number(d.minLevel||0)){
    if(typeof v063Toast==='function'){
      v063Toast(`Benötigt Level ${d.minLevel}.`,'warn',d.name);
    }
    return false;
  }

  if(!dungeonUnlocked(i)){
    if(typeof v063Toast==='function'){
      v063Toast(
        `${d.keyName||`Schlüsselstein ${i+1}`} fehlt.`,
        'warn',
        typeof v250KeyStatusText==='function'
          ?v250KeyStatusText(i)
          :'Den Schlüsselstein findest du bei Quests.'
      );
    }
    return false;
  }

  s.dungeon.selected=i;
  s.dungeon.room=v048RoomIndex(i);
  s.dungeon.layer='dungeon';
  s.dungeon.view='map';

  try{persist(false)}catch(e){}

  const ok=v251RenderDetail();
  if(ok)window.scrollTo({top:0,behavior:'smooth'});
  return ok;
};


/* Phase 2 retired: v251 renderDungeon world/detail wrapper.
   Current world/detail renderers are called directly by the canonical owner. */

/* Navigation into Dungeon always lands on modern 20er overview. */
/* V7.121: obsolete navigation wrapper retired. V467 calls v251RenderWorld()
   as its preferred canonical world renderer after setting layer/view. */
window.__V251_GO_RETIRED__='v7121-v467';


setTimeout(()=>{
  try{
    if(document.querySelector('#dungeon')?.classList.contains('active')){
      if(s.dungeon?.layer==='world'){
        v251RenderWorld();
      }else if(s.dungeon?.view==='map'){
        v251RenderDetail();
      }
    }
  }catch(e){}

  document.querySelectorAll('.version')
    .forEach(el=>el.textContent='V4.29 Stable');

  const line=document.querySelector('#v141VersionLine');
},1350);
