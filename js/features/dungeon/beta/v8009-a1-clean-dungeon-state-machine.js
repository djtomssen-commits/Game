/* ===== V4.02 CLEAN DUNGEON STATE MACHINE =====
   One flow only: map -> battle -> reward -> map.
   No MutationObserver. No post-battle polling. No recurring battle timers.
*/

s.dungeon ??= {};
s.dungeon.view ??= 'map';

function v048DungeonIndex(){
  return Math.max(0, Math.min(dungeons.length-1, Number(s.dungeon.selected)||0));
}
function v048RoomIndex(di=v048DungeonIndex()){
  return Math.max(0, Math.min(9, Number(s.dungeon.progress?.[di] ?? s.dungeon.room ?? 0)||0));
}
function v048GoMap(){
  s.dungeon.view='map';
  const loot=document.querySelector('#loot');
  if(loot) loot.innerHTML='';
  localStorage.setItem(KEY,JSON.stringify(s));
  render();
  window.scrollTo({top:0,behavior:'smooth'});
}
function v048GoBattle(i){
  const d=dungeons[i];
  if(!d)return;
  if(dungeonCompleted(i))return v115Alert(`${d.name} wurde bereits abgeschlossen.`);
  if(s.level<d.minLevel)return v115Alert(`Dieser Dungeon ist erst ab Level ${d.minLevel} verfügbar.`);
  if(!dungeonUnlocked(i))return v115Alert(`${d.keyName} fehlt. Den Stein kannst du beim Questen finden.`);

  s.dungeon.selected=i;
  s.dungeon.room=Math.max(0,Math.min(9,s.dungeon.progress?.[i]??0));
  s.dungeon.view='battle';

  const loot=document.querySelector('#loot');
  if(loot)loot.innerHTML='';

  localStorage.setItem(KEY,JSON.stringify(s));
  render();
  window.scrollTo({top:0,behavior:'smooth'});
}

window.selectDungeon=v048GoBattle;

/* V7.118 cleanup: retired dead pre-canonical v048 navigation wrapper.
   v6101 defines the navigation base later; final dungeon owners handle map entry. */

/* Phase 2 retired: v048 renderDungeon visibility wrapper. The final canonical dungeon owner replaces this render layer. */

/* Install one deterministic battle handler. */
function v048InstallFight(){
  /* V8.009: historical V4.02 combat/reward implementation retired.
     V060 owns the rebalance-compatible legacy fight path; later canonical
     Dungeon authority/combat owners may override it again. */
  return typeof v060InstallFight==='function'?v060InstallFight():false;
}


/* V8.009: obsolete global reward-button render wrapper retired.
   The reward creation path already binds #v048ReturnMap directly. */

try{
  if(document.querySelector('#dungeon')?.classList.contains('active')){
    s.dungeon.view='map';
  }
  localStorage.setItem(KEY,JSON.stringify(s));
  render();
}catch(e){
  console.error('V4.02 clean dungeon flow',e);
}
