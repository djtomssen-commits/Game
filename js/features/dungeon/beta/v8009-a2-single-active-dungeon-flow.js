/* ===== V4.02 single active dungeon flow ===== */

function v067CanOpenDungeon(i){
  const d=dungeons[i];
  if(!d)return {ok:false,msg:'Dungeon nicht gefunden.'};
  if(dungeonCompleted(i))return {ok:false,msg:`${d.name} wurde bereits abgeschlossen.`};
  if(s.level<d.minLevel)return {ok:false,msg:`Benötigt Level ${d.minLevel}.`};
  if(!dungeonUnlocked(i))return {ok:false,msg:`${d.keyName} fehlt.`};
  return {ok:true};
}

function v067OpenDungeon(i){
  i=Number(i);
  const check=v067CanOpenDungeon(i);

  if(!check.ok){
    if(typeof v063Toast==='function')v063Toast(check.msg,'warn');
    return;
  }

  s.dungeon.selected=i;
  s.dungeon.room=Math.max(0,Math.min(9,Number(s.dungeon.progress?.[i]??0)));
  s.dungeon.layer='dungeon';
  s.dungeon.view='map';
  localStorage.setItem(KEY,JSON.stringify(s));

  /* Direkt die 10-Gegner-Karte rendern. */
  try{
    v064RenderMap();
    v065InjectBackButton();
    v065BindRoomNodes();

    const world=document.querySelector('.v065-worldmap-card');
    if(world && world.id!=='dungeonMapCard')world.style.display='none';

    const mapCard=document.querySelector('#dungeonMapCard');
    if(mapCard)mapCard.style.display='';

    const battle=document.querySelector('#dungeonBattleCard');
    if(battle)battle.style.display='none';

    window.scrollTo({top:0,behavior:'smooth'});
  }catch(e){
    console.error('v067OpenDungeon',e);
    try{renderDungeon();}catch(err){console.error(err);}
  }
}

function v067BindWorldMap(){
  const map=document.querySelector('.v065-worldmap-card');
  if(!map)return;

  map.querySelectorAll('[data-v065-dungeon]').forEach(btn=>{
    const i=Number(btn.dataset.v065Dungeon);

    /* Klonen entfernt sämtliche alten click-Listener. */
    const clone=btn.cloneNode(true);
    btn.replaceWith(clone);

    clone.disabled=false;
    clone.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      v067OpenDungeon(i);
    });

    clone.addEventListener('touchend',e=>{
      e.preventDefault();
      e.stopPropagation();
      v067OpenDungeon(i);
    },{passive:false});
  });
}

const v067OldWorldRenderer=v065RenderWorld;
v065RenderWorld=function(){
  v067OldWorldRenderer();

  const card=document.querySelector('.v065-worldmap-card');
  if(card && !card.querySelector('.v067-terrain')){
    const terrain=document.createElement('div');
    terrain.className='v067-terrain';
    card.insertBefore(terrain,card.firstChild);
  }

  const first=card?.querySelector('[data-v065-dungeon="0"]');
  if(first && !dungeonCompleted(0) && s.level>=dungeons[0].minLevel){
    first.classList.remove('locked');
    first.classList.add('current');
    first.disabled=false;
  }

  v067BindWorldMap();
};

/* Welt -> immer 20er-Karte */
function v067ShowDungeonWorld(){
  s.dungeon.layer='world';
  s.dungeon.view='map';
  localStorage.setItem(KEY,JSON.stringify(s));
  v065RenderWorld();
}

/* 10er-Karte -> zurück zur 20er-Karte */
v065ShowWorld=v067ShowDungeonWorld;

/* Ergebnis -> zurück zur 10er-Karte */
v048GoMap=function(){
  s.dungeon.layer='dungeon';
  s.dungeon.view='map';
  const loot=document.querySelector('#loot');
  if(loot)loot.innerHTML='';
  localStorage.setItem(KEY,JSON.stringify(s));

  try{
    v064RenderMap();
    v065InjectBackButton();
    v065BindRoomNodes();
  }catch(e){
    console.error('v048GoMap V4.02',e);
  }

  window.scrollTo({top:0,behavior:'smooth'});
};

/* Phase 2 retired: v067 renderDungeon layer dispatcher. The final canonical dungeon owner replaces this render layer. */

/* V7.118 cleanup: retired dead pre-canonical v067 navigation wrapper.
   v6101 replaces the navigation base later and the final dungeon owner paints the world. */

const v067OldRender=render;
render=function(){
  v067OldRender();
  

  if(document.querySelector('#dungeon')?.classList.contains('active')){
    try{renderDungeon();}catch(e){console.error('V4.02 renderDungeon',e);}
  }
};

/* Bestehende Spielstände nach Update auf Weltkarte starten. */
s.dungeon.layer='world';
s.dungeon.view='map';
localStorage.setItem(KEY,JSON.stringify(s));

try{render();}catch(e){console.error('V4.02 init',e);}
