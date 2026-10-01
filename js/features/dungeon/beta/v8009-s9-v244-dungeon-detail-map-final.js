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
  /* V8.009: legacy Dungeon DOM producer retired.
     gl20/v4218 owns the world map; v261 owns the 10-room detail map. */
  if('v244RenderSelectedDungeonMap'==='v251RenderWorld')return typeof window.gl20RenderWorld==='function'?window.gl20RenderWorld():false;
  return typeof window.v261RenderDetail==='function'?window.v261RenderDetail():false;
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
