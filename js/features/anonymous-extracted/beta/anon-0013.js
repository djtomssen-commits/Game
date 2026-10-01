
/* ===== V4.02 20-Dungeon overview -> dungeon map -> battle ===== */

s.dungeon ??= {};
s.dungeon.layer ??= 'world'; // world | dungeon

const V065_WORLD_POS=[
  [9,79],[20,67],[31,78],[40,60],[51,70],
  [62,55],[74,66],[85,51],[91,34],[79,24],
  [68,36],[57,23],[46,36],[35,24],[24,38],
  [13,27],[20,12],[39,11],[61,12],[86,12]
];

function v065Line(x1,y1,x2,y2){
  const dx=x2-x1,dy=y2-y1;
  const len=Math.sqrt(dx*dx+dy*dy);
  const ang=Math.atan2(dy,dx)*180/Math.PI;
  return `<div class="v065-world-path" style="left:${x1}%;top:${y1}%;width:${len}%;transform:rotate(${ang}deg)"></div>`;
}

function v065NodeState(i){
  if(dungeonCompleted(i))return 'completed';
  if(!dungeonUnlocked(i) || s.level<dungeons[i].minLevel)return 'locked';
  if(i===Number(s.dungeon.selected||0))return 'current';
  return 'available';
}

function v065DungeonInfoText(i){
  const d=dungeons[i];
  if(dungeonCompleted(i))return 'Abgeschlossen und versiegelt.';
  if(s.level<d.minLevel)return `Benötigt Level ${d.minLevel}.`;
  if(!dungeonUnlocked(i))return `${d.keyName} fehlt.`;
  const progress=Math.max(0,Math.min(9,Number(s.dungeon.progress?.[i]??0)));
  return `Fortschritt ${progress+1} / 10 · Betretbar`;
}

function v065ShowWorld(){
  s.dungeon.layer='world';
  s.dungeon.view='map';
  localStorage.setItem(KEY,JSON.stringify(s));
  renderDungeon();
  window.scrollTo({top:0,behavior:'smooth'});
}

function v065OpenDungeon(i){
  const d=dungeons[i];
  if(!d)return;

  if(dungeonCompleted(i)){
    v063Toast('Dieser Dungeon ist bereits abgeschlossen.','warn');
    return;
  }
  if(s.level<d.minLevel){
    v063Toast(`Benötigt Level ${d.minLevel}`,'warn',d.name);
    return;
  }
  if(!dungeonUnlocked(i)){
    v063Toast(`${d.keyName} fehlt`,'warn','Den Schlüsselstein findest du bei Quests.');
    return;
  }

  s.dungeon.selected=i;
  s.dungeon.room=Math.max(0,Math.min(9,s.dungeon.progress?.[i]??0));
  s.dungeon.layer='dungeon';
  s.dungeon.view='map';
  localStorage.setItem(KEY,JSON.stringify(s));
  renderDungeon();
  window.scrollTo({top:0,behavior:'smooth'});
}

function v065RenderWorld(){
  const dungeonScreen=document.querySelector('#dungeon');
  if(!dungeonScreen)return;

  const cards=[...dungeonScreen.querySelectorAll(':scope > .card')];
  const mapCard=document.querySelector('#dungeonMapCard') || cards[0];
  const battleCard=document.querySelector('#dungeonBattleCard') || cards[1];

  if(!mapCard)return;

  if(battleCard)battleCard.style.display='none';
  mapCard.style.display='';
  mapCard.id='dungeonMapCard';

  let paths='';
  for(let i=0;i<V065_WORLD_POS.length-1;i++){
    paths+=v065Line(...V065_WORLD_POS[i],...V065_WORLD_POS[i+1]);
  }

  const selected=Math.max(0,Math.min(19,Number(s.dungeon.selected)||0));

  let nodes='';
  V065_WORLD_POS.forEach(([x,y],i)=>{
    const state=v065NodeState(i);
    const d=dungeons[i];
    nodes+=`
      <button type="button"
        class="v065-dungeon-node ${state}"
        style="left:${x}%;top:${y}%"
        data-v065-dungeon="${i}">
        <span class="v065-num">${i+1}</span>
        <span class="v065-name">${d.name}<br>Lv. ${d.minLevel}+</span>
      </button>`;
  });

  mapCard.className='card v065-worldmap-card';
  mapCard.innerHTML=`
    <div class="v065-worldmap-head">
      <div class="v065-worldmap-kicker">Dungeon-Weltkarte</div>
      <div class="v065-worldmap-title">Die verseuchten Gebiete</div>
      <div class="v065-worldmap-desc">
        Zwanzig verseuchte Orte liegen rund um Grünhain.
        Jeder Dungeon enthält zehn Gegner und einen Endboss.
        Schlüsselsteine aus Quests öffnen spätere Gebiete.
      </div>
    </div>
    <div class="v065-dungeon-world">
      ${paths}
      ${nodes}
    </div>
    <div class="v065-world-info">
      <b>${dungeons[selected].name}</b>
      <div class="tiny" style="margin-top:5px">
        ${v065DungeonInfoText(selected)}<br>
        Dungeon ${selected+1} von 20
      </div>
    </div>`;

  mapCard.querySelectorAll('[data-v065-dungeon]').forEach(btn=>{
    btn.onclick=()=>v065OpenDungeon(Number(btn.dataset.v065Dungeon));
  });
}

function v065InjectBackButton(){
  if(s.dungeon.layer!=='dungeon' || s.dungeon.view!=='map')return;

  const card=document.querySelector('#dungeonMapCard');
  if(!card || card.querySelector('#v065BackWorld'))return;

  const btn=document.createElement('button');
  btn.type='button';
  btn.id='v065BackWorld';
  btn.className='btn secondary v065-back-world';
  btn.textContent='Zurück zur Dungeon-Weltkarte';
  btn.onclick=v065ShowWorld;

  card.insertBefore(btn,card.firstChild);
}

/* Clicking the current enemy on the 10-room map enters battle. */
function v065BindRoomNodes(){
  if(s.dungeon.layer!=='dungeon' || s.dungeon.view!=='map')return;

  document.querySelectorAll('[data-v064-room]').forEach(btn=>{
    btn.onclick=()=>{
      const i=Number(btn.dataset.v064Room);
      const current=v048RoomIndex(v048DungeonIndex());
      if(i!==current)return;

      s.dungeon.view='battle';
      localStorage.setItem(KEY,JSON.stringify(s));
      renderDungeon();
      window.scrollTo({top:0,behavior:'smooth'});
    };
  });
}

/* Reward/Niederlage continues to return to the 10-room map, NOT world map. */
const v065OldGoMap=v048GoMap;
v048GoMap=function(){
  s.dungeon.layer='dungeon';
  s.dungeon.view='map';

  const loot=document.querySelector('#loot');
  if(loot)loot.innerHTML='';

  localStorage.setItem(KEY,JSON.stringify(s));
  renderDungeon();
  window.scrollTo({top:0,behavior:'smooth'});
};

/* V7.118 cleanup: retired dead pre-canonical v065 navigation wrapper.
   The later canonical navigation/dungeon owners perform this transition. */

/* Phase 2 retired: v065 renderDungeon world wrapper. The final canonical dungeon owner replaces this render layer. */

const v065BaseRender=render;
render=function(){
  return v065BaseRender();
};

/* Existing saves start on the world overview after update. */
if(!s.v065DungeonWorldRestored){
  s.dungeon.layer='world';
  s.dungeon.view='map';
  s.v065DungeonWorldRestored=true;
  localStorage.setItem(KEY,JSON.stringify(s));
}

try{render();}catch(e){console.error('V4.02 init',e);}
