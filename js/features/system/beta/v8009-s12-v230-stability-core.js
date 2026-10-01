/* ===== V4.02 central stabilization layer ===== */

function v230SaveLocalCheckpoint(){
  try{
    persist(false);
  }catch(e){
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
  }
}

/* ---------------------------------------------------------
   DUNGEON: one final entry path
   --------------------------------------------------------- */

function v230ShowDungeonWorld(){
  const screen=document.querySelector('#dungeon');
  if(!screen)return false;

  s.dungeon??={};
  s.dungeon.layer='world';
  s.dungeon.view='map';

  screen.classList.add('v230-world-open');

  try{
    v230SaveLocalCheckpoint();
  }catch(e){}

  try{
    v065RenderWorld();
  }catch(e){
    console.error('V4.02 20-Dungeon-Karte',e);
    return false;
  }

  /*
    V4.02/V4.02 provide reliable node rebinding after map HTML is replaced.
  */
  try{
    if(typeof v067BindWorldMap==='function')v067BindWorldMap();
  }catch(e){}

  const card=document.querySelector('#dungeonMapCard');
  if(card){
    card.style.display='';
    card.classList.remove('v064-detail-map');
    card.classList.add('v065-worldmap-card');
  }

  const battle=document.querySelector('#dungeonBattleCard');
  if(battle)battle.style.display='none';

  return !!document.querySelectorAll(
    '#dungeonMapCard [data-v065-dungeon]'
  ).length;
}


/*
  Preserve the current battle/detail implementation.
  Only the WORLD layer is centralized.
*/
/* Phase 2 retired: v230 renderDungeon world wrapper.
   The canonical dungeon owner calls the current GL20 world renderer directly. */

/* V7.118 cleanup: retired v230 navigation wrapper.
   Character/quest refresh already belongs to v229; newer dungeon owners supersede
   the v230 world-entry repaint. v230ShowDungeonWorld remains available to the
   later progress/key repair layers that call it directly. */


/* ---------------------------------------------------------
   SETTINGS: V4.02 owns positioning; remove stale inline
   geometry left by earlier versions before opening.
   --------------------------------------------------------- */

function v230NormalizeSettings(){
  try{
    v225EnsureSettingsAccountActions();
    v228PortalSettingsMenu();

    const menu=document.querySelector('#v141SettingsMenu');
    if(menu && !menu.classList.contains('open')){
      menu.style.maxHeight='';
      menu.style.overflowY='';
      menu.style.bottom='';
    }
  }catch(e){}
}

const v230BaseSettings=v141BuildSettings;
v141BuildSettings=function(){
  const r=v230BaseSettings();
  v230NormalizeSettings();
  return r;
};


/* ---------------------------------------------------------
   LIVE UI: central lightweight tick.
   Keep exact existing functions but avoid another render().
   --------------------------------------------------------- */

let v230LastSecond=0;

function v230LiveTick(){
  const now=Date.now();
  if(now-v230LastSecond<900)return;
  v230LastSecond=now;

  try{
    if(document.querySelector('#quests')?.classList.contains('active')){
      v229UpdateQuestTimer();
    }
  }catch(e){}

  try{
    if(document.querySelector('#character')?.classList.contains('active')){
      v229PaintPvpBuds();
    }
  }catch(e){}

  try{
    if(document.querySelector('#pvp')?.classList.contains('active')){
      v204RenderPage();
    }
  }catch(e){}
}


/*
  One V4.02 timer. It does no full render and performs only visible-screen
  live updates. Existing unrelated game timers are intentionally untouched.
*/
/* V4.81: retired duplicate v230 live interval; dedicated screen timers own these values. */


/* ---------------------------------------------------------
   FINAL DISPLAY VERSION
   --------------------------------------------------------- */

function v230Version(){
  document.querySelectorAll('.version')
    .forEach(el=>el.textContent='V4.29 Stable');

  const line=document.querySelector('#v141VersionLine');
}


/*
  Start-up checks after all old layers are loaded.
*/
setTimeout(()=>{
  try{
    v230NormalizeSettings();
    v230Version();

    if(document.querySelector('#dungeon')?.classList.contains('active')){
      v230ShowDungeonWorld();
    }

    v229UpdateQuestTimer();
    v229PaintPvpBuds();
  }catch(e){
    console.error('V4.02 startup',e);
  }
},250);
