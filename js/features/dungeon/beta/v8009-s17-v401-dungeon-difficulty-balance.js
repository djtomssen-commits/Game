(function(){
  const VERSION='V4.29 Stable';

  /*
    Final dungeon combat curve.
    - Recommended levels and unlock progression stay unchanged.
    - Dungeon 1 still spans roughly Lv. 1-19.
    - Dungeon 2 starts at Lv. 20; following dungeons roughly every 10 levels.
    - Bosses get a clear HP jump, but enemy damage no longer explodes at high dungeons.
    - Under-level scaling from V4.02 remains active, so early attempts are possible but risky.
    - Loot logic is untouched. V4.02's rarity guard still prevents mythic dungeon drops.
  */
  v025EnemyStats=function(dungeonIndex,roomIndex,enemy){
    dungeonIndex=Math.max(0,Math.min(19,Number(dungeonIndex)||0));
    roomIndex=Math.max(0,Math.min(9,Number(roomIndex)||0));

    const rec=v025RecommendedLevel(dungeonIndex,roomIndex);
    const boss=roomIndex===9||!!enemy?.boss;

    /* HP carries most of the difficulty. Later dungeons gain endurance steadily,
       while room progression inside one dungeon stays noticeable. */
    const hpDungeonMult=1+dungeonIndex*.07;
    const hpBase=65+rec*17+roomIndex*12;
    const hp=Math.round(hpBase*hpDungeonMult*(boss?1.42:1));

    /* Damage rises much more gently than HP. The old curve multiplied attack by
       the full dungeon multiplier and could create very large late-game spikes. */
    const attackDungeonMult=1+dungeonIndex*.025;
    const attackBase=12+rec*1.75+roomIndex*.70;
    const attack=Math.round(attackBase*attackDungeonMult*(boss?1.16:1));

    return {rec,hp,attack};
  };

  /* Refresh the currently visible dungeon without replacing the stable fight flow. */
  try{
    if(document.querySelector('#dungeon')?.classList.contains('active'))renderDungeon();
  }catch(e){console.error('V4.02 dungeon balance render',e)}

  document.querySelectorAll(
    '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version,.v366-ver'
  ).forEach(el=>{if(el)el.textContent=VERSION});
})();
