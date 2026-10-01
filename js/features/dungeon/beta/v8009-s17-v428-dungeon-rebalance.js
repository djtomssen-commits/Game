/* V4.28 Dungeon rebalance
   Final authority over dungeon battle HP/attack only.
   Keeps progression, keys, attempts, rewards, loot contract and combat flow intact.
   Calibration anchor from live play: Lv.40 / Dungeon 3 / Boss 10 was dying in ~2 player hits.
*/
(function(){
  const baseStats=v025EnemyStats;
  window.v428DungeonScale=function(di,ri){
    di=Math.max(0,Math.min(19,Number(di)||0));
    ri=Math.max(0,Math.min(9,Number(ri)||0));
    const boss=ri===9;
    // Normal rooms keep the proven V4.28 curve. Bosses are a wall, but must remain beatable with normal
    // blue/purple/orange level-appropriate gear; mystic equipment is NEVER a requirement for normal dungeons.
    const hp=boss ? (3.00 + di*0.08) : (2.60 + di*0.12 + ri*0.08);
    // Boss damage is capped to a saner progression so a player above the recommendation can actually
    // benefit from normal progression instead of needing worldboss-only mystic equipment.
    const attack=boss ? (1.22 + di*0.018) : (1.35 + di*0.025 + ri*0.025);
    return {hp,attack};
  };
  v025EnemyStats=function(dungeonIndex,roomIndex,enemy){
    const old=baseStats(dungeonIndex,roomIndex,enemy)||{};
    const sc=window.v428DungeonScale(dungeonIndex,roomIndex);
    return {
      rec:Number(old.rec)||1,
      hp:Math.max(1,Math.round((Number(old.hp)||1)*sc.hp)),
      attack:Math.max(1,Math.round((Number(old.attack)||1)*sc.attack))
    };
  };
  window.v025EnemyStats=v025EnemyStats;

  // Refresh any open dungeon so map/card and battle use the same final values immediately.
  setTimeout(()=>{
    try{
      if(document.querySelector('#dungeon')?.classList.contains('active')){
        if(s.dungeon?.layer==='world' && typeof v230ShowDungeonWorld==='function')v230ShowDungeonWorld();
        else if(s.dungeon?.view==='map' && typeof v244RenderSelectedDungeonMap==='function')v244RenderSelectedDungeonMap();
        else if(s.dungeon?.view==='battle' && typeof renderDungeon==='function')renderDungeon();
      }
    }catch(e){console.error('V4.28 dungeon rebalance repaint',e)}
    
    const line=document.querySelector('#v141VersionLine');
    document.title='Grow Legends V4.29';
  },900);
})();
