/* ===== V4.02 canonical Schlüsselstein progression for Dungeon 2–20 =====
   Rules:
   - Dungeon 1: always open.
   - Schlüsselstein 2: from Lv.20, after Dungeon 1 is completed.
   - Schlüsselstein 3: from Lv.30, after Dungeon 2 is completed.
   - ...
   - Schlüsselstein 20: from Lv.200, after Dungeon 19 is completed.
   - Eligible completed quests: 10%, 18%, 45%, 70%, 100%.
   - At the fifth eligible quest the stone is guaranteed.
*/

const V250_KEY_CHANCES=[.10,.18,.45,.70,1];

function v250EnsureKeyProgress(){
  v243EnsureDungeonKeyState();

  s.dungeon.keyQuestCounts=
    (s.dungeon.keyQuestCounts &&
     typeof s.dungeon.keyQuestCounts==='object')
      ?s.dungeon.keyQuestCounts
      :{};

  /*
    Preserve the already accumulated V4.02 Dungeon-2 pity counter.
  */
  const oldD2=Math.max(
    0,
    Number(s.v236Dungeon2KeyQuestCount)||0
  );

  if(oldD2>Number(s.dungeon.keyQuestCounts[1]||0)){
    s.dungeon.keyQuestCounts[1]=oldD2;
  }
}

function v250KeyRequiredLevel(i){
  i=Number(i);
  if(i<=0)return 1;
  return (i+1)*10;
}

function v250PreviousDungeonDone(i){
  i=Number(i);
  if(i<=0)return true;

  return Array.isArray(s.dungeon?.completed) &&
    s.dungeon.completed.map(Number).includes(i-1);
}

function v250HasKey(i){
  i=Number(i);
  if(i===0)return true;
  return v243HasDungeonKey(i);
}

function v250EligibleForKey(i){
  i=Number(i);
  if(i<=0 || i>=dungeons.length)return false;
  if(v250HasKey(i))return false;
  if(Number(s.level||0)<v250KeyRequiredLevel(i))return false;
  if(!v250PreviousDungeonDone(i))return false;
  return true;
}

function v250NextKeyIndex(){
  v250EnsureKeyProgress();

  /*
    Always progress in order. A later stone cannot be rolled while an
    earlier required stone is still missing.
  */
  for(let i=1;i<dungeons.length;i++){
    if(!v250HasKey(i))return i;
  }

  return -1;
}

function v250KeyQuestCount(i){
  v250EnsureKeyProgress();
  return Math.max(
    0,
    Number(s.dungeon.keyQuestCounts[i])||0
  );
}

function v250KeyChanceForAttempt(attempt){
  attempt=Math.max(1,Number(attempt)||1);
  return V250_KEY_CHANCES[
    Math.min(
      V250_KEY_CHANCES.length-1,
      attempt-1
    )
  ];
}

function v250GrantKey(i){
  i=Number(i);
  if(i<=0 || i>=dungeons.length)return false;

  v250EnsureKeyProgress();

  s.dungeon.keys[i]=true;
 s.dungeon.progress=(s.dungeon.progress&&typeof s.dungeon.progress==='object')?s.dungeon.progress:{};
 if(s.dungeon.progress[i]==null)s.dungeon.progress[i]=0;

  if(!s.dungeon.unlocked.includes(i)){
    s.dungeon.unlocked.push(i);
  }

  s.dungeon.unlocked=[
    ...new Set(
      s.dungeon.unlocked.map(Number)
    )
  ].sort((a,b)=>a-b);

  /*
    Keep the old D2 helper state compatible.
  */
  if(i===1){
    s.v236Dungeon2KeyQuestCount=
      Math.max(
        Number(s.v236Dungeon2KeyQuestCount)||0,
        Number(s.dungeon.keyQuestCounts[1])||0
      );
  }

  /*
    V6.114: make the freshly unlocked dungeon live immediately.
    Previously the key was saved correctly, but the already-built dungeon
    DOM could still show the last completed dungeon until reload/login.
  */
  try{
    const current=Math.max(0,Number(s.dungeon.selected)||0);
    if(
      current>=dungeons.length ||
      (typeof dungeonCompleted==='function' && dungeonCompleted(current))
    ){
      s.dungeon.selected=i;
      s.dungeon.room=Math.max(0,Math.min(9,Number(s.dungeon.progress?.[i])||0));
    }
    s.dungeon.layer='world';
    s.dungeon.view='map';
  }catch(e){}

  try{persist(false)}catch(e){
    try{
      localStorage.setItem(
        KEY,
        JSON.stringify(s)
      );
    }catch(_){}
  }

  requestAnimationFrame(()=>{
    try{
      v243RepairAndSaveDungeonKeys();
      if(typeof v230ShowDungeonWorld==='function')v230ShowDungeonWorld();
      else if(typeof v065RenderWorld==='function')v065RenderWorld();

      try{v242PaintDungeonWorldStatus?.()}catch(_){}
      try{v250PaintKeyProgress?.()}catch(_){}
      try{v067BindWorldMap?.()}catch(_){}
    }catch(e){
      console.warn('V6.114 dungeon key live repaint',e);
    }
  });

  return true;
}


/*
  Run exactly once after a successfully paid quest.
  We do NOT replace quest payout. Gold, XP, normal items, set items and
  Harz-Taler remain owned by the existing tested quest chain.
*/
function v250RollDungeonKeyAfterQuest(before){
  v250EnsureKeyProgress();

  const i=v250NextKeyIndex();
  if(i<1)return null;

  if(!v250EligibleForKey(i)){
    return null;
  }

  /*
    If a historical quest layer happened to grant this same key during the
    payout, canonical state already sees it. Do not duplicate it.
  */
  if(v250HasKey(i)){
    return null;
  }

  const oldCount=v250KeyQuestCount(i);
  const attempt=oldCount+1;

  s.dungeon.keyQuestCounts[i]=attempt;

  if(i===1){
    s.v236Dungeon2KeyQuestCount=attempt;
  }

  const chance=v250KeyChanceForAttempt(attempt);
  const found=Math.random()<chance;

  if(found){
    v250GrantKey(i);

    return {
      found:true,
      index:i,
      attempt,
      chance
    };
  }

  try{persist(false)}catch(e){}

  return {
    found:false,
    index:i,
    attempt,
    chance
  };
}


/*
  Final quest wrapper:
  Snapshot the key state before the whole legacy payout chain.
  If an old layer randomly granted a stone, remove that legacy random grant
  and let V4.02 decide it with the ordered pity system.
*/
const v250BaseClaimQuest=claimQuest;
claimQuest=function(...args){
  const q=s.quests?.active;
  const ready=!!q && Date.now()>=Number(q.ends||0);

  if(!ready){
    return v250BaseClaimQuest.apply(this,args);
  }

  v250EnsureKeyProgress();

  const beforeKeys={};
  for(let i=1;i<dungeons.length;i++){
    beforeKeys[i]=v250HasKey(i);
  }

  const result=v250BaseClaimQuest.apply(this,args);

  /*
    Only a vanished active quest counts as a completed/payed quest.
  */
  if(s.quests?.active){
    return result;
  }

  /*
    Remove NEW stones that came from old random key code during this payout.
    Existing stones from the player's save are never removed.
  */
  for(let i=1;i<dungeons.length;i++){
    if(beforeKeys[i])continue;

    const nowHas=
      !!s.dungeon.keys?.[i] ||
      (Array.isArray(s.dungeon.unlocked) &&
       s.dungeon.unlocked.map(Number).includes(i));

    if(nowHas){
      delete s.dungeon.keys[i];

      s.dungeon.unlocked=
        s.dungeon.unlocked
          .map(Number)
          .filter(x=>x!==i);
    }
  }

  const roll=v250RollDungeonKeyAfterQuest(beforeKeys);

  /*
    Normalize both representations immediately.
  */
  v243RepairAndSaveDungeonKeys();

  return result;
};


/* ---------- World map explanation / progression display ---------- */

function v250KeyStatusText(i){
  i=Number(i);
  if(i===0)return '';

  const d=dungeons?.[i];
  if(!d)return '';

  if(v250HasKey(i)){
    return 'Schlüsselstein gefunden.';
  }

  const req=v250KeyRequiredLevel(i);
  const prev=dungeons?.[i-1];

  if(!v250PreviousDungeonDone(i)){
    return `Zuerst ${prev?.name||`Dungeon ${i}`} abschließen · Schlüsselstein ${i+1} ab Level ${req} bei Quests.`;
  }

  if(Number(s.level||0)<req){
    return `Ab Level ${req} kann Schlüsselstein ${i+1} bei Quests gefunden werden.`;
  }

  const n=v250KeyQuestCount(i);
  const next=n+1;
  const chance=Math.round(
    v250KeyChanceForAttempt(next)*100
  );

  return `Schlüsselstein ${i+1} fehlt · ${n}/5 passende Quests · nächste Chance ${chance}%`;
}

const v250BaseDungeonInfoText=v065DungeonInfoText;
v065DungeonInfoText=function(i){
  i=Number(i);

  if(i>0 && !v250HasKey(i)){
    return v250KeyStatusText(i);
  }

  return v250BaseDungeonInfoText(i);
};


function v250PaintKeyProgress(){
  const info=document.querySelector(
    '#dungeon .v065-world-info'
  );

  if(!info)return;

  info.querySelectorAll('.v250-key-hint')
    .forEach(x=>x.remove());

  const i=v250NextKeyIndex();

  if(i<1 || v250HasKey(i))return;

  const hint=document.createElement('div');
  hint.className='tiny v250-key-hint';
  hint.textContent=`🗿 ${v250KeyStatusText(i)}`;
  info.appendChild(hint);
}


/*
  Final world renderer wrapper.
*/
const v250BaseRenderWorld=v065RenderWorld;
v065RenderWorld=function(){
  v250EnsureKeyProgress();

  const result=v250BaseRenderWorld();

  requestAnimationFrame(()=>{
    try{
      v242PaintDungeonWorldStatus();
      v250PaintKeyProgress();
      v067BindWorldMap();
    }catch(e){}
  });

  return result;
};


/*
  Existing saves may already own later stones. Preserve them and only
  initialize pity counters.
*/
try{
  v250EnsureKeyProgress();
  v243RepairAndSaveDungeonKeys();
}catch(e){
  console.error('V4.02 key migration',e);
}


setTimeout(()=>{
  try{
    v250EnsureKeyProgress();

    if(
      document.querySelector('#dungeon')?.classList.contains('active') &&
      s.dungeon?.layer==='world'
    ){
      v230ShowDungeonWorld();
      v242PaintDungeonWorldStatus();
      v250PaintKeyProgress();
    }
  }catch(e){}

  document.querySelectorAll('.version')
    .forEach(el=>el.textContent='V4.29 Stable');

  const line=document.querySelector('#v141VersionLine');
},680);
