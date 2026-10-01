
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

function v064RenderMap(){
  const di=v048DungeonIndex();
  if(di!==0)return false;

  const d=dungeons[0];
  const current=v048RoomIndex(0);
  const completed=dungeonCompleted(0);

  const card=document.querySelector('#dungeonMapCard') || document.querySelector('#dungeon .card');
  if(!card)return false;
  card.id='dungeonMapCard';

  let paths='';
  for(let i=0;i<V064_POS.length-1;i++){
    paths+=v064Line(...V064_POS[i],...V064_POS[i+1]);
  }

  let nodes='';
  V064_POS.forEach(([x,y],i)=>{
    const state=v064NodeState(0,i);
    const boss=i===9;
    const clickable=(state==='current'&&!completed);
    nodes+=`
      <button type="button"
        class="v064-node ${state} ${boss?'boss':''}"
        style="left:${x}%;top:${y}%"
        data-v064-room="${i}"
        ${clickable?'':'disabled'}>
        ${i+1}
        <span class="v064-node-label">${V064_D1_NAMES[i]}<br>Lv. ${V064_D1_LEVELS[i]}</span>
      </button>`;
  });

  card.innerHTML=`
    <div class="v064-dungeon-head">
      <div class="v064-dungeon-kicker">Dungeon 1</div>
      <div class="v064-dungeon-title">Der überwucherte Keller</div>
      <div class="v064-dungeon-desc">
        Unter dem Growroom hat sich eine verseuchte Brut ausgebreitet.
        Je tiefer du vordringst, desto stärker werden die Kreaturen.
        Die Milbenkönigin wartet im letzten Nest.
      </div>
    </div>
    <div class="v064-map">
      ${paths}
      ${nodes}
    </div>
    <div class="v064-map-info">
      <b>Fortschritt ${Math.min(current+1,10)} / 10</b>
      <div class="tiny" style="margin-top:5px">
        Aktueller Gegner: ${V064_D1_NAMES[Math.min(current,9)]}<br>
        Empfohlenes Level: ${V064_D1_LEVELS[Math.min(current,9)]}<br>
        Boss-Ziel: ungefähr Level 22–25
      </div>
    </div>`;

  card.querySelectorAll('[data-v064-room]').forEach(btn=>{
    btn.onclick=()=>{
      const i=Number(btn.dataset.v064Room);
      if(i!==v048RoomIndex(0))return;
      s.dungeon.view='battle';
      localStorage.setItem(KEY,JSON.stringify(s));
      renderDungeon();
    };
  });

  return true;
}

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

const v064BaseRender=render;
render=function(){
  return v064BaseRender();
};

try{render();}catch(e){console.error('V4.02 init',e);}
