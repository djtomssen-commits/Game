/* ===== V4.29 Stable: Dungeon progression + rarity guard =====
   - Normal dungeons can never create Mythic/cyan equipment.
   - Mythic remains reserved for the explicit event/worldboss source.
   - Existing dungeon progression, attempt timers, rewards and V4.02 talent scaling stay unchanged.
*/
(function(){
  function v400DowngradeDungeonMythic(item){
    if(!item)return item;
    const mythic=item.quality==='cyan'||item.rarity==='mythic'||item.rarity==='mystic';
    if(!mythic)return item;

    /* Fail closed to Epic. Do not turn an invalid mythic roll into a free Legendary. */
    item.quality='purple';
    item.rarity=qualityMeta('purple').cls;
    item.name=String(item.name||'Ausrüstung')
      .replace(/^Mystisch:\s*/,'Episch: ');

    /* Rebuild stats from the matching class base where possible, so a cyan stat roll
       cannot survive behind a purple label. */
    try{
      const pools=Object.values(classGear||{}).flat();
      const plain=String(item.name||'')
        .replace(/^Episch:\s*/,'')
        .replace(/\s*\[Lv\.\d+\]\s*$/,'');
      const base=pools.find(x=>x.slot===item.slot && (x.icon===item.icon || x.name===plain));
      if(base && typeof v024Bonus==='function'){
        item.bonus=v024Bonus(base.bonus,'purple',Math.max(1,Number(item.dropLevel)||Number(s.level)||1));
      }
    }catch(e){}
    return item;
  }

  /* Guard the actual class-loot factory used by the canonical dungeon reward handler. */
  if(typeof makeClassLoot==='function'){
    const v400BaseMakeClassLoot=makeClassLoot;
    makeClassLoot=function(classId,source='normal'){
      const item=v400BaseMakeClassLoot(classId,source);
      return source==='dungeon'?v400DowngradeDungeonMythic(item):item;
    };
  }

  /* Guard the lower-level item factory too, in case a later dungeon path bypasses
     makeClassLoot and creates equipment directly. */
  if(typeof v024Item==='function'){
    const v400BaseV024Item=v024Item;
    v024Item=function(base,source='normal',forced=null){
      if((source==='dungeon'||source==='boss') && forced==='cyan')forced=null;
      const item=v400BaseV024Item(base,source,forced);
      return (source==='dungeon'||source==='boss')?v400DowngradeDungeonMythic(item):item;
    };
  }

  /* Keep the canonical rarity selector explicit: cyan only belongs to event/worldboss. */
  if(typeof v024Quality==='function'){
    const v400BaseQuality=v024Quality;
    v024Quality=function(source){
      const q=v400BaseQuality(source);
      if((source==='dungeon'||source==='boss') && q==='cyan')return'purple';
      return q;
    };
  }

  window.v400DungeonRarityGuard=v400DowngradeDungeonMythic;
})();
