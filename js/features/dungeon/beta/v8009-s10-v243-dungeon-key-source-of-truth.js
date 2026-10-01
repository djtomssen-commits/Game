/* ===== V4.02 canonical dungeon key ownership =====
   Historical saves can store a found stone in either:
   - s.dungeon.keys[index]
   - s.dungeon.unlocked[]
   Both now mean the same thing everywhere.
*/

function v243EnsureDungeonKeyState(){
  s.dungeon=(s.dungeon&&typeof s.dungeon==='object')?s.dungeon:{};

  s.dungeon.unlocked=Array.isArray(s.dungeon.unlocked)
    ?[...new Set(s.dungeon.unlocked.map(Number).filter(Number.isInteger))]
    :[];

  s.dungeon.keys=
    (s.dungeon.keys&&typeof s.dungeon.keys==='object')
      ?s.dungeon.keys
      :{};

  let changed=false;

  /* Dungeon 1 is always available by design. */
  if(!s.dungeon.unlocked.includes(0)){
    s.dungeon.unlocked.push(0);
    changed=true;
  }

  /*
    Synchronize both directions:
    key -> unlocked
    unlocked -> key
    This repairs both old and current saves.
  */
  for(let i=1;i<dungeons.length;i++){
    const hasLegacyKey=!!s.dungeon.keys[i];
    const hasUnlock=s.dungeon.unlocked.includes(i);

    if(hasLegacyKey && !hasUnlock){
      s.dungeon.unlocked.push(i);
      changed=true;
    }

    if(hasUnlock && !hasLegacyKey){
      s.dungeon.keys[i]=true;
      changed=true;
    }
  }

  s.dungeon.unlocked=[
    ...new Set(s.dungeon.unlocked.map(Number))
  ].sort((a,b)=>a-b);

  return changed;
}

function v243HasDungeonKey(i){
  i=Number(i);
  if(i===0)return true;

  v243EnsureDungeonKeyState();

  return (
    s.dungeon.unlocked.includes(i) ||
    !!s.dungeon.keys[i]
  );
}


/*
  Replace the shared availability helper itself, so WORLD MAP,
  10-room map and battle entry all use the same truth.
*/
dungeonUnlocked=function(i){
  return v243HasDungeonKey(i);
};


/* Keep V4.02's special Dungeon-2 helper on the same source of truth. */
v236HasDungeon2Key=function(){
  return v243HasDungeonKey(1);
};

v236UnlockDungeon2=function(){
  v243EnsureDungeonKeyState();
  const before=!!s.dungeon.keys[1]||s.dungeon.unlocked.includes(1);

  s.dungeon.keys[1]=true;

  if(!s.dungeon.unlocked.includes(1)){
    s.dungeon.unlocked.push(1);
  }

  s.dungeon.unlocked=[
    ...new Set(s.dungeon.unlocked.map(Number))
  ].sort((a,b)=>a-b);

  if(!before){
    try{document.dispatchEvent(new CustomEvent('growlegends:dungeon-key-changed',{detail:{index:1,reason:'v243-local-unlock'}}))}catch(e){}
  }
};


/* General repair helper after quest rewards and cloud restore. */
function v243RepairAndSaveDungeonKeys(){
  const changed=v243EnsureDungeonKeyState();

  if(changed){
    try{persist(false)}catch(e){
      try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
    }
  }

  return changed;
}


/* V8.009: claim/render/open wrappers retired.
   Shared Dungeon navigation plus the final V467 owner perform the live repair;
   keep this event as the migration/persistence boundary for cloud-loaded saves. */
/* V7.121: navigation wrapper retired; V467 owns pre/post Dungeon navigation.
   Keep V243's state repair/status pass without another v032Go layer. */
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  if(String(e?.detail?.id||'')!=='dungeon')return;
  try{v243RepairAndSaveDungeonKeys();v242PaintDungeonWorldStatus()}catch(err){console.error('V7.121 dungeon key repair',err)}
});
window.__V243_GO_RETIRED__='v7121-v467';


/* Initial migration for the current save. */
try{
  v243RepairAndSaveDungeonKeys();
}catch(e){
  console.error('V4.02 initial dungeon key repair',e);
}

setTimeout(()=>{
  try{
    v243RepairAndSaveDungeonKeys();

    if(
      document.querySelector('#dungeon')?.classList.contains('active') &&
      s.dungeon?.layer==='world'
    ){
      v230ShowDungeonWorld();
      v242PaintDungeonWorldStatus();
    }
  }catch(e){}

  document.querySelectorAll('.version')
    .forEach(el=>el.textContent='V4.29 Stable');

  const line=document.querySelector('#v141VersionLine');
},500);
