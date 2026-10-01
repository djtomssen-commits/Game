(()=>{
'use strict';
if(window.__V6113_PUBLIC_PET_PROFILE_STATS__)return;
window.__V6113_PUBLIC_PET_PROFILE_STATS__=true;

const Q=['normal','green','blue','purple','orange','cyan'];
const LEG=['normal','green','blue','purple','orange'];

function calcPetStats(){
  const defs=Array.isArray(window.v686PetDefinitions)?window.v686PetDefinitions:[];
  const found=(s?.v686PetAlbum?.found&&typeof s.v686PetAlbum.found==='object')?s.v686PetAlbum.found:{};

  let rows=0, foundCount=0, uniquePets=0, mythic=0;

  for(const p of defs){
    const row=found?.[p.id]||{};
    let any=false;
    for(const q of Q){
      if(row?.[q]){
        foundCount++;
        any=true;
      }
    }
    if(any)uniquePets++;
    if(LEG.every(q=>!!row?.[q]))rows++;
    if(Q.every(q=>!!row?.[q]))mythic++;
  }

  return {
    rows:Math.max(0,Math.min(20,rows)),
    found:Math.max(0,Math.min(120,foundCount)),
    unique:Math.max(0,Math.min(20,uniquePets)),
    mythic:Math.max(0,Math.min(20,mythic)),
    total_rows:20,
    total_slots:120
  };
}
window.v6113PetProfileStats=calcPetStats;

try{
  if(typeof v073ProfilePayload==='function'&&!window.__v6113ProfilePayload){
    const base=v073ProfilePayload;
    const wrapped=function(){
      const p=base.apply(this,arguments)||{};
      const dp=(p.dungeon_progress&&typeof p.dungeon_progress==='object')
        ? {...p.dungeon_progress}
        : {};
      dp.pet_stats=calcPetStats();
      p.dungeon_progress=dp;
      return p;
    };
    v073ProfilePayload=wrapped;
    try{window.v073ProfilePayload=wrapped}catch(e){}
    window.__v6113ProfilePayload=true;
  }
}catch(e){console.warn('V6.113 profile pet stats',e)}

/* Refresh once after account hydration so older public profiles receive stats. */
window.addEventListener('growlegends:account-ready',()=>{
  setTimeout(()=>{
    try{if(typeof v073SyncProfile==='function')void v073SyncProfile(true)}catch(e){}
  },500);
});

window.v6113PetProfileQA=()=>({
  stats:calcPetStats(),
  payloadHasPetStats:(()=>{
    try{return !!v073ProfilePayload?.()?.dungeon_progress?.pet_stats}catch(e){return false}
  })()
});
})();
