/* ===== V4.02 Dungeon 2 rebalance =====
   Goal:
   - Lv. 23: first rooms possible, but no easy five-room sweep
   - middle rooms require noticeable gear/skill progression
   - final rooms aimed at high 20s / low 30s
   - boss aimed around Lv. 32–33
*/

const V245_D2_RECOMMENDED=[
  23,24,25,26,27,28,29,30,31,33
];

const v245BaseRecommendedLevel=v025RecommendedLevel;
v025RecommendedLevel=function(dungeonIndex,roomIndex){
  dungeonIndex=Number(dungeonIndex)||0;
  roomIndex=Math.max(
    0,
    Math.min(9,Number(roomIndex)||0)
  );

  if(dungeonIndex===1){
    return V245_D2_RECOMMENDED[roomIndex];
  }

  return v245BaseRecommendedLevel(
    dungeonIndex,
    roomIndex
  );
};


const v245BaseEnemyStats=v025EnemyStats;
v025EnemyStats=function(dungeonIndex,roomIndex,enemy){
  dungeonIndex=Number(dungeonIndex)||0;
  roomIndex=Math.max(
    0,
    Math.min(9,Number(roomIndex)||0)
  );

  if(dungeonIndex!==1){
    return v245BaseEnemyStats(
      dungeonIndex,
      roomIndex,
      enemy
    );
  }

  const rec=V245_D2_RECOMMENDED[roomIndex];
  const boss=
    roomIndex===9 ||
    !!enemy?.boss;

  /*
    V4.02 was too forgiving:
      hpBase     = 125 + rec*23 + room*18
      attackBase = 12  + rec*3.9 + room*1.15

    V4.02 deliberately raises both durability and incoming damage,
    with the curve increasing further in later rooms.
  */
  const hpBase=
    170 +
    rec*30 +
    roomIndex*26;

  const attackBase=
    18 +
    rec*4.7 +
    roomIndex*1.7;

  const roomHpScale=
    1.14 +
    roomIndex*.025;

  const roomAttackScale=
    1.12 +
    roomIndex*.018;

  const hp=Math.round(
    hpBase *
    roomHpScale *
    (boss?1.55:1)
  );

  const attack=Math.round(
    attackBase *
    roomAttackScale *
    (boss?1.30:1)
  );

  return {
    rec,
    hp,
    attack
  };
};


/*
  Keep the visible 10-room map aligned with the actual combat values.
  V4.02 already calls v025RecommendedLevel(), so repainting is enough.
*/
setTimeout(()=>{
  try{
    if(
      document.querySelector('#dungeon')?.classList.contains('active') &&
      Number(s.dungeon?.selected)===1
    ){
      if(
        s.dungeon?.layer==='dungeon' &&
        s.dungeon?.view==='map'
      ){
        v244RenderSelectedDungeonMap();
      }else if(
        s.dungeon?.view==='battle'
      ){
        renderDungeon();
      }
    }
  }catch(e){}

  document.querySelectorAll('.version')
    .forEach(el=>el.textContent='V4.29 Stable');

  const line=document.querySelector('#v141VersionLine');
},540);
