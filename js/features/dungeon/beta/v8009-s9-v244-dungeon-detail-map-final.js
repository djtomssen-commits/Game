/* ===== V4.02 canonical 10-room map for ALL 20 dungeons =====
   Root cause: the old V4.02 renderer explicitly returned false for
   every dungeon except Dungeon 1 (if(di!==0)return false).
*/

function v244DungeonRoomName(di,ri){
  if(di===0 && Array.isArray(V064_D1_NAMES) && V064_D1_NAMES[ri]){
    return V064_D1_NAMES[ri];
  }

  const e=dungeons?.[di]?.enemies?.[ri];
  return e?.name || (ri===9?'Endboss':`Gegner ${ri+1}`);
}

function v244DungeonRoomLevel(di,ri){
  try{
    return Math.max(1,Number(v025RecommendedLevel(di,ri))||1);
  }catch(e){
    return Math.max(
      1,
      Number(dungeons?.[di]?.enemies?.[ri]?.requiredLevel) ||
      Number(dungeons?.[di]?.minLevel) ||
      1
    );
  }
}

function v244RenderSelectedDungeonMap(){
  v243RepairAndSaveDungeonKeys();

  const di=v048DungeonIndex();
  const d=dungeons?.[di];
  if(!d)return false;

  const current=v048RoomIndex(di);
  const completed=dungeonCompleted(di);

  const card=
    document.querySelector('#dungeonMapCard') ||
    document.querySelector('#dungeon > .card:first-of-type');

  if(!card)return false;

  const screen=document.querySelector('#dungeon');
  if(screen)screen.classList.remove('v230-world-open');

  const battle=
    document.querySelector('#dungeonBattleCard') ||
    document.querySelectorAll('#dungeon > .card')[1];

  if(battle)battle.style.display='none';

  card.id='dungeonMapCard';
  card.style.display='';
  card.classList.remove('v065-worldmap-card');
  card.classList.add('v064-detail-map');

  let paths='';
  for(let i=0;i<V064_POS.length-1;i++){
    paths+=v064Line(
      ...V064_POS[i],
      ...V064_POS[i+1]
    );
  }

  let nodes='';

  V064_POS.forEach(([x,y],ri)=>{
    const state=v064NodeState(di,ri);
    const boss=ri===9;
    const clickable=state==='current' && !completed;
    const name=v244DungeonRoomName(di,ri);
    const level=v244DungeonRoomLevel(di,ri);

    nodes+=`
      <button type="button"
        class="v064-node ${state} ${boss?'boss':''}"
        style="left:${x}%;top:${y}%"
        data-v064-room="${ri}"
        ${clickable?'':'disabled'}>
        ${ri+1}
        <span class="v064-node-label">
          ${v240Esc(name)}<br>Lv. ${level}
        </span>
      </button>
    `;
  });

  const currentName=v244DungeonRoomName(
    di,
    Math.min(current,9)
  );

  const currentLevel=v244DungeonRoomLevel(
    di,
    Math.min(current,9)
  );

  const beaten=completed
    ?10
    :Math.max(0,Math.min(9,current));

  card.innerHTML=`
    <div class="v064-dungeon-head">
      <div class="v064-dungeon-kicker">
        Dungeon ${di+1} · 10 Gegner
      </div>

      <div class="v064-dungeon-title">
        ${v240Esc(d.name)}
      </div>

      <div class="v064-dungeon-desc">
        Besiege die Gegner der Reihe nach.
        Gegner 10 ist der Endboss.
        ${completed?'Dieser Dungeon wurde bereits abgeschlossen.':''}
      </div>
    </div>

    <div class="v068-detail-terrain"></div>

    <div class="v064-map">
      ${paths}
      ${nodes}
    </div>

    <div class="v064-map-info">
      <b>Fortschritt ${beaten} / 10</b>

      <div class="tiny" style="margin-top:5px">
        ${completed
          ?'✅ Dungeon abgeschlossen'
          :`Aktueller Gegner: ${v240Esc(currentName)}<br>
             Empfohlenes Level: ${currentLevel}`
        }
      </div>
    </div>
  `;

  /*
    Back button is inserted by the existing tested helper.
    Current room is the only room that can start a fight.
  */
  try{v065InjectBackButton()}catch(e){}

  card.querySelectorAll('[data-v064-room]').forEach(btn=>{
    btn.onclick=e=>{
      e.preventDefault();
      e.stopPropagation();

      const ri=Number(btn.dataset.v064Room);
      const active=v048RoomIndex(di);

      if(ri!==active || dungeonCompleted(di))return;

      s.dungeon.selected=di;
      s.dungeon.room=active;
      s.dungeon.layer='dungeon';
      s.dungeon.view='battle';

      try{persist(false)}catch(e){
        try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
      }

      renderDungeon();
      window.scrollTo({top:0,behavior:'smooth'});
    };
  });

  try{v065BindRoomNodes()}catch(e){}

  return true;
}


/*
  Make every historical call to v064RenderMap use the generic renderer.
  Dungeon 1 keeps its custom room names; Dungeon 2–20 use their own
  enemy data and balance levels.
*/
v064RenderMap=v244RenderSelectedDungeonMap;


/*
  One final world -> detail transition.
  Do not route through the old D1-only renderer.
*/
v067OpenDungeon=function(i){
  i=Number(i);

  v243RepairAndSaveDungeonKeys();

  const d=dungeons?.[i];
  if(!d)return false;

  if(dungeonCompleted(i)){
    if(typeof v063Toast==='function'){
      v063Toast(
        `${d.name} wurde bereits abgeschlossen.`,
        'warn'
      );
    }
    return false;
  }

  if(Number(s.level||0)<Number(d.minLevel||0)){
    if(typeof v063Toast==='function'){
      v063Toast(
        `Benötigt Level ${d.minLevel}.`,
        'warn',
        d.name
      );
    }
    return false;
  }

  if(!dungeonUnlocked(i)){
    if(typeof v063Toast==='function'){
      v063Toast(
        `${d.keyName||'Schlüsselstein'} fehlt.`,
        'warn',
        'Den Schlüsselstein findest du bei Quests.'
      );
    }
    return false;
  }

  s.dungeon.selected=i;
  s.dungeon.room=v048RoomIndex(i);
  s.dungeon.layer='dungeon';
  s.dungeon.view='map';

  try{persist(false)}catch(e){
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
  }

  const ok=v244RenderSelectedDungeonMap();

  if(ok){
    window.scrollTo({top:0,behavior:'smooth'});
  }

  return ok;
};


/*
  Rebind world nodes one last time after V4.02/V4.02 repainting.
  Use click only; touch generates click on modern mobile browsers and this
  prevents a double-open sequence.
*/
v067BindWorldMap=function(){
  const map=document.querySelector('.v065-worldmap-card');
  if(!map)return;

  map.querySelectorAll('[data-v065-dungeon]').forEach(btn=>{
    const i=Number(btn.dataset.v065Dungeon);

    const clone=btn.cloneNode(true);
    btn.replaceWith(clone);

    clone.disabled=false;
    clone.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      v067OpenDungeon(i);
    });
  });
};


/* V8.009 D5: delayed 520 ms detail repaint retired.
   The canonical D2/v261 owner renders the active 10er map; a later v244
   repaint can replace the correct background/enemy art with legacy DOM. */
