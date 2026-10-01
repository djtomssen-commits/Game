/*
  Canonical dungeon loot rule:
  - Rooms 1-9: existing 22% item-drop chance remains unchanged. Those item rolls
    may reach Epic/purple, but NEVER Legendary/orange or Mythic/cyan.
  - Room 10 / dungeon boss: exactly one guaranteed Legendary/orange class item.
  - Mythic/cyan remains exclusive to explicit event/worldboss sources.
  This patch changes rarity only; combat, attempts, progression, Gold/EXP/Harz,
  dungeon completion and reward presentation remain owned by the existing flow.
*/
(function(){
  const VERSION='V4.29 Stable';

  /* The active v246 handler calls this function only for the room-10 boss. */
  v246MakeBossEpic=function(){
    const cls=s.playerClass||'grower';
    const pool=classGear[cls]||classGear.grower;
    const base=pool[Math.floor(Math.random()*pool.length)];
    let item;

    if(typeof v024Item==='function'){
      item=v024Item(base,'boss','orange');
      item.classId=cls;
    }else{
      item=makeClassLoot(cls,'normal');
      const meta=qualityMeta('orange');
      item.quality='orange';
      item.rarity=meta.cls;
      item.dropLevel=Math.max(1,Number(s.level)||1);
      item.name=String(item.name||base.name||'Ausrüstung')
        .replace(/^(Normal|Gewöhnlich|Rare|Episch|Legendär|Mystisch):\s*/,'')
        .replace(/\s*\[Lv\.\d+\]\s*$/,'');
      item.name=`${meta.label}: ${item.name} [Lv.${item.dropLevel}]`;
      if(typeof v024Bonus==='function')item.bonus=v024Bonus(base.bonus,'orange',item.dropLevel);
    }

    /* Fail closed: boss reward must be truly orange, not just visually labelled. */
    item.quality='orange';
    item.rarity=qualityMeta('orange').cls;
    return item;
  };

  /* Rooms 1-9 use makeClassLoot(...,'dungeon'). Clamp orange/cyan to Epic. */
  if(typeof makeClassLoot==='function'&&!window.__v416DungeonLootWrapped){
    const baseMakeClassLoot=makeClassLoot;
    makeClassLoot=function(classId,source='normal'){
      const item=baseMakeClassLoot(classId,source);
      if(source!=='dungeon'||!item)return item;
      if(item.quality!=='orange'&&item.quality!=='cyan')return item;

      const cls=classId||s.playerClass||'grower';
      const pool=classGear[cls]||classGear.grower;
      const base=pool.find(x=>x.slot===item.slot && x.icon===item.icon)
        ||pool.find(x=>x.slot===item.slot)
        ||pool[0];
      const level=Math.max(1,Number(item.dropLevel)||Number(s.level)||1);
      item.quality='purple';
      item.rarity=qualityMeta('purple').cls;
      item.dropLevel=level;
      const plain=String(base?.name||item.name||'Ausrüstung')
        .replace(/^(Normal|Gewöhnlich|Rare|Episch|Legendär|Mystisch):\s*/,'')
        .replace(/\s*\[Lv\.\d+\]\s*$/,'');
      item.name=`${qualityMeta('purple').label}: ${plain} [Lv.${level}]`;
      if(base&&typeof v024Bonus==='function')item.bonus=v024Bonus(base.bonus,'purple',level);
      return item;
    };
    window.__v416DungeonLootWrapped=true;
  }

  /* Reward banner must state the actual room-10 guarantee. */
  if(typeof v246DungeonRewardItemHtml==='function'){
    const baseRewardHtml=v246DungeonRewardItemHtml;
    v246DungeonRewardItemHtml=function(found,boss=false){
      let html=baseRewardHtml(found,boss);
      if(boss){
        html=html
          .replace('💜 BOSS-BELOHNUNG · GARANTIERT EPIC','🟠 BOSS-BELOHNUNG · 100% LEGENDÄR')
          .replace('GARANTIERT EPIC','100% LEGENDÄR');
      }
      return html;
    };
  }

  /* Defensive source-level clamp for any future room 1-9 path using v024Quality. */
  if(typeof v024Quality==='function'&&!window.__v416DungeonQualityWrapped){
    const baseQuality=v024Quality;
    v024Quality=function(source){
      const q=baseQuality(source);
      return source==='dungeon'&&(q==='orange'||q==='cyan')?'purple':q;
    };
    window.__v416DungeonQualityWrapped=true;
  }

  document.querySelectorAll('.version').forEach(el=>el.textContent=VERSION);
  const line=document.querySelector('#v141VersionLine');if(line)line.textContent=VERSION;
  document.title='Grow Legends V4.29';
})();
