/* ===== V4.02 Global progress fix ===== */

function v034SafeNum(v,fallback=0){
  const n=Number(v);
  return Number.isFinite(n)?n:fallback;
}

function v034CurrentDungeonIndex(){
  return Math.max(0,Math.min(dungeons.length-1,v034SafeNum(s.dungeon?.selected,0)));
}

function v034CurrentRoomIndex(di=v034CurrentDungeonIndex()){
  const raw = s.dungeon?.progress?.[di] ?? s.dungeon?.room ?? 0;
  return Math.max(0,Math.min(9,v034SafeNum(raw,0)));
}

function v034DungeonProgressText(){
  const di=v034CurrentDungeonIndex();
  if(dungeonCompleted(di)) return '10 / 10';
  return `${v034CurrentRoomIndex(di)+1} / 10`;
}

function v034WorldBossProgress(){
  const defeated=Math.max(0,v034SafeNum(s.story?.bossesDefeated,0));
  const total=dungeons.length;
  return {defeated,total,pct:Math.min(100,(defeated/total)*100)};
}

function v034PaintAllProgress(){
  /* Dungeon page progress */
  const dp=document.querySelector('#dungeonProgress');
  if(dp)dp.textContent=v034DungeonProgressText();

  /* World page boss/dungeon progress */
  const bp=v034WorldBossProgress();

  const worldText=document.querySelector('#bossProgressText');
  if(worldText){
    worldText.textContent = bp.defeated
      ? `${bp.defeated} von ${bp.total} Dungeons abgeschlossen`
      : `Noch kein Dungeon abgeschlossen · 0 / ${bp.total}`;
  }

  const worldBar=document.querySelector('#bossProgressBar');
  if(worldBar)worldBar.style.width=bp.pct+'%';

  /* Kill every stray invalid fraction globally */
  document.querySelectorAll('body *').forEach(el=>{
    if(el.children.length===0){
      const t=(el.textContent||'').trim();
      if(/^(?:n|nan|undefined|null)\s*\/\s*(?:n|nan|undefined|null)$/i.test(t)){
        el.textContent='';
        el.style.display='none';
      }
    }
  });
}

/* Phase 2 retired: v034 renderDungeon progress wrapper. The final canonical dungeon owner replaces this render layer. */

/* Make world progress represent completed dungeons, not old six-boss chapter math */
function v034WorldProgressFix(){
  const bp=v034WorldBossProgress();
  const text=document.querySelector('#bossProgressText');
  const bar=document.querySelector('#bossProgressBar');

  if(text){
    text.textContent = bp.defeated
      ? `${bp.defeated} von ${bp.total} Dungeons abgeschlossen`
      : `Noch kein Dungeon abgeschlossen · 0 / ${bp.total}`;
  }
  if(bar)bar.style.width=bp.pct+'%';
}

/* Wrap render once, centrally */
const v034BaseRender=render;
render=function(){
  v034BaseRender();
  v034WorldProgressFix();
  v034PaintAllProgress();
};

/* Repair bad saved numeric values once */
(function(){
  s.dungeon??={};
  s.dungeon.selected=v034CurrentDungeonIndex();
  s.dungeon.room=v034CurrentRoomIndex(s.dungeon.selected);
  s.dungeon.progress??={};
  Object.keys(s.dungeon.progress).forEach(k=>{
    s.dungeon.progress[k]=Math.max(0,Math.min(9,v034SafeNum(s.dungeon.progress[k],0)));
  });
  s.story??={chapter:1,bossesDefeated:0};
  s.story.bossesDefeated=Math.max(0,v034SafeNum(s.story.bossesDefeated,0));
  localStorage.setItem(KEY,JSON.stringify(s));
})();

try{
  v034WorldProgressFix();
  v034PaintAllProgress();
  render();
}catch(e){console.error('V4.02 progress fix',e);}
