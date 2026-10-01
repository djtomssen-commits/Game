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
  /* V8.009: legacy Dungeon DOM producer retired.
     gl20/v4218 owns the world map; v261 owns the 10-room detail map. */
  if('v251RenderWorld'==='v251RenderWorld')return typeof window.gl20RenderWorld==='function'?window.gl20RenderWorld():false;
  return typeof window.v261RenderDetail==='function'?window.v261RenderDetail():false;
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
  /* V8.009: legacy Dungeon DOM producer retired.
     gl20/v4218 owns the world map; v261 owns the 10-room detail map. */
  if('v251RenderDetail'==='v251RenderWorld')return typeof window.gl20RenderWorld==='function'?window.gl20RenderWorld():false;
  return typeof window.v261RenderDetail==='function'?window.v261RenderDetail():false;
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
  /* V8.009 D5: retired delayed Dungeon repaint.
     The canonical D2 dispatcher owns visible world/detail rendering now.
     Keeping a 1350 ms legacy repaint caused the correct 10er map to be
     replaced after it was already painted. */

  document.querySelectorAll('.version')
    .forEach(el=>el.textContent='V4.29 Stable');

  const line=document.querySelector('#v141VersionLine');
},1350);
