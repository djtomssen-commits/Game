
/* ===== V4.02 Dungeon 1 progression + presentation ===== */

/* Target curve: normal player should work on Dungeon 1 into roughly Lv.22-25.
   Strong builds can progress earlier; weak builds will stall much sooner. */
const V064_D1_LEVELS=[3,5,7,9,11,14,16,19,22,25];
const V064_D1_NAMES=[
  'Blattkriecher',
  'Wurzelbeißer',
  'Spinnmilben-Brut',
  'Harzzehrer',
  'Netzjäger',
  'Giftspringer',
  'Brutwächter',
  'Kellerweber',
  'Kokonhüter',
  'Milbenkönigin'
];

v025RecommendedLevel=function(di,ri){
  ri=Math.max(0,Math.min(9,Number(ri)||0));
  if(di===0)return V064_D1_LEVELS[ri];
  const start=25+(di-1)*11;
  return start+Math.round(ri*1.15);
};

v025EnemyStats=function(di,ri,enemy){
  ri=Math.max(0,Math.min(9,Number(ri)||0));
  const rec=v025RecommendedLevel(di,ri);
  const boss=ri===9||enemy?.boss;

  if(di===0){
    const hp=[130,205,300,420,575,760,980,1260,1590,2150][ri];
    const attack=[18,24,31,39,49,61,74,89,106,138][ri];
    const defense=[3,5,8,11,15,20,26,33,41,55][ri];
    return {rec,hp,attack,defense};
  }

  const dungeonMult=1+di*.16;
  return {
    rec,
    hp:Math.round((120+rec*28+ri*18)*dungeonMult*(boss?1.48:1)),
    attack:Math.round((12+rec*4.2+ri*1.4)*dungeonMult*(boss?1.25:1)),
    defense:Math.round((rec*1.8+ri*1.1)*dungeonMult)
  };
};

/* More meaningful underlevel pressure without hard locking. */
v060PlayerDamageFactor=function(rec){
  const gap=Math.max(0,rec-(Number(s.level)||1));
  if(gap<=1)return 1;
  return Math.max(.24,1-(gap-1)*.085);
};
v060EnemyDamageFactor=function(rec){
  const gap=Math.max(0,rec-(Number(s.level)||1));
  if(gap<=1)return 1;
  return Math.min(2.35,1+(gap-1)*.09);
};

/* Visual map positions */
const V064_POS=[
  [9,77],[20,64],[31,75],[40,52],[52,63],
  [61,42],[72,55],[80,34],[88,50],[93,22]
];

function v064NodeState(di,i){
  const current=v048RoomIndex(di);
  if(dungeonCompleted(di))return 'done';
  if(i<current)return 'done';
  if(i===current)return 'current';
  return 'locked';
}

function v064Line(x1,y1,x2,y2){
  const dx=x2-x1,dy=y2-y1;
  const len=Math.sqrt(dx*dx+dy*dy);
  const ang=Math.atan2(dy,dx)*180/Math.PI;
  return `<div class="v064-path" style="left:${x1}%;top:${y1}%;width:${len}%;transform:rotate(${ang}deg)"></div>`;
}

function v064RenderMap(){return false}
/* V8.009: retired V064 Dungeon-1 map DOM producer removed.
   Balance/name helpers above remain active; v261 is the live detail-map owner. */

function v064UpgradeBattle(){
  const di=v048DungeonIndex();
  if(di!==0 || s.dungeon?.view!=='battle')return;

  const ri=v048RoomIndex(0);
  const e=dungeons[0]?.enemies?.[ri];
  if(!e)return;

  const detail=document.querySelector('#dungeonDetail');
  if(!detail)return;
  detail.classList.add('v064-battle-card');

  /* Remove emoji-heavy legacy headings/buttons inside dungeon battle only. */
  detail.querySelectorAll('button').forEach(btn=>{
    btn.textContent=btn.textContent
      .replace(/[⚔️🗺️🎁💀🏆⛓️☠️⚠️]/g,'')
      .trim();
  });

  const tier=document.querySelector('#enemyTier');
  if(tier)tier.textContent=`EMPFOHLEN LEVEL ${v025RecommendedLevel(0,ri)}`;

  const name=document.querySelector('#enemyName');
  if(name)name.textContent=V064_D1_NAMES[ri];

  const fight=document.querySelector('#fightBtn');
  if(fight){
    fight.textContent='ANGREIFEN';
    fight.classList.add('v064-fight-button');
  }
}

/* Boss and room names in the underlying data too, so reward/battle text stays consistent. */
try{
  dungeons[0].enemies.forEach((e,i)=>e.name=V064_D1_NAMES[i]);
}catch(e){console.error('Dungeon names',e);}

/* Phase 2 retired: v064 renderDungeon D1 wrapper. The final canonical dungeon owner replaces this render layer. */

/* V8.009: retired pass-through global render/init removed. */

