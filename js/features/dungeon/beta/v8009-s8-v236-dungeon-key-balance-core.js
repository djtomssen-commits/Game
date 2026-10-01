/* ===== V4.02 Dungeon 2 key + balance ===== */

/* ---------- Dungeon 2 key progression ---------- */

function v236EnsureDungeonProgressState(){
  s.dungeon=(s.dungeon&&typeof s.dungeon==='object')?s.dungeon:{};

  s.dungeon.unlocked=Array.isArray(s.dungeon.unlocked)
    ?s.dungeon.unlocked.map(Number)
    :[];

  s.dungeon.completed=Array.isArray(s.dungeon.completed)
    ?s.dungeon.completed.map(Number)
    :[];

  s.dungeon.progress=
    (s.dungeon.progress&&typeof s.dungeon.progress==='object')
      ?s.dungeon.progress
      :{};

  s.dungeon.keys=
    (s.dungeon.keys&&typeof s.dungeon.keys==='object')
      ?s.dungeon.keys
      :{};

  s.v236Dungeon2KeyQuestCount=Math.max(
    0,
    Number(s.v236Dungeon2KeyQuestCount)||0
  );
}


function v236HasDungeon2Key(){
  v236EnsureDungeonProgressState();
  return s.dungeon.unlocked.includes(1) || !!s.dungeon.keys[1];
}


function v236UnlockDungeon2(){
  v236EnsureDungeonProgressState();

  if(!s.dungeon.unlocked.includes(1)){
    s.dungeon.unlocked.push(1);
  }

  /* Keep legacy and current key systems synchronized. */
  s.dungeon.keys[1]=true;
}


/*
  Eligible from level 20, even when Dungeon 1 is unfinished.

  Drop curve:
  1st eligible quest: 10 %
  2nd eligible quest: 18 %
  3rd eligible quest: 45 %
  4th eligible quest: 70 %
  5th eligible quest: guaranteed

  This makes the stone noticeably more likely around quest three without
  turning it into an immediate automatic unlock at level 20.
*/
function v236Dungeon2KeyChance(attempt){
  if(attempt<=1)return .10;
  if(attempt===2)return .18;
  if(attempt===3)return .45;
  if(attempt===4)return .70;
  return 1;
}


const v236BaseClaimQuest=claimQuest;
claimQuest=function(...args){
  v236EnsureDungeonProgressState();

  const q=s.quests?.active;
  const eligible=
    !!q &&
    Date.now()>=Number(q.ends||0) &&
    Number(s.level||0)>=20 &&
    !v236HasDungeon2Key();

  const result=v236BaseClaimQuest.apply(this,args);

  /*
    The old claim function may change level. Eligibility is intentionally
    determined from the level at the moment the reward is claimed.
  */
  if(eligible){
    s.v236Dungeon2KeyQuestCount++;

    const chance=v236Dungeon2KeyChance(
      s.v236Dungeon2KeyQuestCount
    );

    if(Math.random()<chance){
      v236UnlockDungeon2();

      try{persist(false)}catch(e){}

      try{
        if(typeof v063Toast==='function'){
          v063Toast(
            '🗿 Schlüsselstein 2 gefunden!',
            'success',
            'Dungeon 2 wurde freigeschaltet.'
          );
        }
      }catch(e){}
    }else{
      try{persist(false)}catch(e){}
    }
  }

  return result;
};


/* ---------- Dungeon 2 combat balance ---------- */

const v236BaseRecommendedLevel=v025RecommendedLevel;
v025RecommendedLevel=function(dungeonIndex,roomIndex){
  dungeonIndex=Number(dungeonIndex)||0;
  roomIndex=Math.max(0,Math.min(9,Number(roomIndex)||0));

  /*
    Dungeon 1 remains exactly as balanced before.
    Dungeon 2 starts where Dungeon 1 should realistically end and climbs
    toward the low 30s.
  */
  if(dungeonIndex===1){
    return [22,23,24,25,26,27,28,29,30,32][roomIndex];
  }

  return v236BaseRecommendedLevel(dungeonIndex,roomIndex);
};


const v236BaseEnemyStats=v025EnemyStats;
v025EnemyStats=function(dungeonIndex,roomIndex,enemy){
  dungeonIndex=Number(dungeonIndex)||0;
  roomIndex=Math.max(0,Math.min(9,Number(roomIndex)||0));

  if(dungeonIndex!==1){
    return v236BaseEnemyStats(
      dungeonIndex,
      roomIndex,
      enemy
    );
  }

  const rec=v025RecommendedLevel(1,roomIndex);
  const boss=roomIndex===9 || !!enemy?.boss;

  /*
    Dungeon 2 is intentionally a step above Dungeon 1:
    - early rooms are beatable around 22–24 with reasonable gear
    - the middle requires progression/upgrades
    - boss is aimed around level 31–32
  */
  const hpBase=125 + rec*23 + roomIndex*18;
  const attackBase=12 + rec*3.9 + roomIndex*1.15;

  const hp=Math.round(
    hpBase *
    (1.10 + roomIndex*.018) *
    (boss?1.42:1)
  );

  const attack=Math.round(
    attackBase *
    (1.08 + roomIndex*.012) *
    (boss?1.22:1)
  );

  return {rec,hp,attack};
};


/*
  Dungeon 2's original stored enemy HP is no longer authoritative because
  V4.02 combat already uses v025EnemyStats(). Keep visible labels aligned.
*/
function v236PaintDungeon2ProgressHint(){
  const info=document.querySelector(
    '#dungeon .v065-world-info'
  );

  if(!info)return;

  if(Number(s.level||0)>=20 && !v236HasDungeon2Key()){
    const n=Math.max(0,Number(s.v236Dungeon2KeyQuestCount)||0);
    const next=n+1;
    const chance=Math.round(v236Dungeon2KeyChance(next)*100);

    const hint=document.createElement('div');
    hint.className='tiny v236-key-hint';
    hint.style.cssText=
      'margin-top:6px;padding:6px 7px;border:1px solid #5e5330;'+
      'border-radius:8px;background:#151207;color:#e6cb72';

    hint.textContent=
      `🗿 Schlüsselstein 2: ${n} Quest${n===1?'':'s'} seit Level 20 · `+
      `nächste Chance ca. ${chance}%`;

    info.appendChild(hint);
  }
}


/* Current world-map state text should describe the new rule. */
const v236BaseDungeonInfoText=v065DungeonInfoText;
v065DungeonInfoText=function(i){
  i=Number(i);

  if(i===1 && !v236HasDungeon2Key()){
    if(Number(s.level||0)<20){
      return 'Ab Level 20 kann Schlüsselstein 2 bei Quests gefunden werden.';
    }

    const n=Math.max(0,Number(s.v236Dungeon2KeyQuestCount)||0);

    return (
      `Schlüsselstein 2 fehlt · ab Level 20 bei Quests · `+
      `${n} Quest${n===1?'':'s'} gezählt`
    );
  }

  return v236BaseDungeonInfoText(i);
};


/* Repaint hint after the final world renderer. */
const v236BaseRenderWorld=v065RenderWorld;
v065RenderWorld=function(){
  const r=v236BaseRenderWorld();
  requestAnimationFrame(v236PaintDungeon2ProgressHint);
  return r;
};


/*
  If an old save already had keys[1] but not unlocked[1], repair it.
*/
v236EnsureDungeonProgressState();
if(s.dungeon.keys[1] && !s.dungeon.unlocked.includes(1)){
  s.dungeon.unlocked.push(1);
  try{persist(false)}catch(e){}
}


/*
  Cloud state replacement can remove V4.02 fields. Repair on each dungeon
  entry without adding another timer.
*/
/* V7.121: old Dungeon navigation wrapper retired. V467 owns the world-map
   transition; keep only this block's local progress/hint refresh on the shared event. */
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  if(String(e?.detail?.id||'')!=='dungeon')return;
  try{v236EnsureDungeonProgressState();v236PaintDungeon2ProgressHint()}catch(err){console.error('V7.121 dungeon hint refresh',err)}
});
window.__V236_GO_RETIRED__='v7121-v467';


setTimeout(()=>{
  try{
    v236EnsureDungeonProgressState();

    if(
      s.dungeon.keys[1] &&
      !s.dungeon.unlocked.includes(1)
    ){
      s.dungeon.unlocked.push(1);
      persist(false);
    }
  }catch(e){}

  document.querySelectorAll('.version')
    .forEach(el=>el.textContent='V4.29 Stable');

  const line=document.querySelector('#v141VersionLine');
},360);
