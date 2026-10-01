function v083ProfileProgress(profile){
  const dp=(profile?.dungeon_progress&&typeof profile.dungeon_progress==='object')?profile.dungeon_progress:{};
  const completed=Array.isArray(dp.completed)?dp.completed.map(Number).filter(Number.isFinite):[];
  const bosses=Math.max(0,completed.length,Number(profile?.bosses)||0);
  let selected=Number.isFinite(Number(dp.selected))?Math.max(0,Math.min(19,Number(dp.selected))):null;

  if(selected===null){
    const entries=Object.entries(dp.progress||{}).map(([k,v])=>[Number(k),Number(v)])
      .filter(([k,v])=>Number.isFinite(k)&&Number.isFinite(v)&&k>=0&&k<20)
      .sort((a,b)=>b[0]-a[0]);
    if(entries.length)selected=entries[0][0];
    else if(completed.length)selected=Math.min(19,Math.max(...completed)+1);
    else selected=Math.max(0,Math.min(19,(Number(profile?.dungeons)||1)-1));
  }

  const rawRoom=dp.progress?.[selected] ?? (Number(dp.selected)===selected?dp.room:undefined);
  const room=(rawRoom!==undefined&&rawRoom!==null&&Number.isFinite(Number(rawRoom)))
    ? Math.max(0,Math.min(9,Number(rawRoom)))+1
    : null;

  return {
    dungeon:Math.max(1,selected+1,Number(profile?.dungeons)||0),
    bosses,
    room
  };
}

function v083FixLegacyProfileMetrics(content,p){
  if(!content||!p)return;
  const pr=v083ProfileProgress(p);
  [...content.querySelectorAll('*')].forEach(el=>{
    if(el.id==='v081DungeonStatus')return;
    if(el.children.length===0){
      const t=(el.textContent||'').trim();
      if(/^Dungeon\s*\d+$/i.test(t))el.textContent=`Dungeon ${pr.dungeon}`;
      if(/^Boss(?:e)?\s*\d+$/i.test(t))el.textContent=`Bosse ${pr.bosses}`;
    }
  });
}

const v083OldOpenProfile=v074OpenProfile;
v074OpenProfile=async function(id){
  await v083OldOpenProfile(id);
  try{
    const {data:p,error}=await v073Db.from('profiles')
      .select('id,bosses,dungeons,dungeon_progress')
      .eq('id',id).single();
    if(error||!p)return;
    v083FixLegacyProfileMetrics(document.querySelector('#v074ProfileContent'),p);
  }catch(e){console.error('V4.02 profile fix',e)}
};

async function v083FixHallList(){
  if(!v073Ready||!v073Db)return;
  try{
    const {data,error}=await v073Db.from('profiles')
      .select('id,bosses,dungeons,dungeon_progress')
      .limit(100);
    if(error||!Array.isArray(data))return;

    const byId=Object.fromEntries(data.map(p=>[p.id,p]));
    const hall=document.querySelector('#hall');
    if(!hall)return;

    hall.querySelectorAll('[data-player-id],[data-v073-player],[data-v074-player]').forEach(card=>{
      const id=card.dataset.playerId||card.dataset.v073Player||card.dataset.v074Player;
      const p=byId[id];
      if(!p)return;
      const pr=v083ProfileProgress(p);

      card.querySelectorAll('.v083-hall-progress').forEach(x=>x.remove());

      [...card.querySelectorAll('*')].forEach(el=>{
        if(el.children.length!==0)return;
        const t=(el.textContent||'').trim();
        if(/^Dungeon\s*0$/i.test(t)||/^Boss(?:e)?\s*0$/i.test(t))el.style.display='none';
      });

      const line=document.createElement('div');
      line.className='v083-hall-progress';
      line.innerHTML=`Dungeon <b>${pr.dungeon}</b> · Bosse <b>${pr.bosses}</b>${pr.room?` · Gegner <b>${pr.room}/10</b>`:''}`;
      card.appendChild(line);
    });
  }catch(e){console.error('V4.02 hall list fix',e)}
}

/* V8.009: global render + 0/1200 ms hall repaint retired. */
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  if(String(e?.detail?.id||'')==='hall')queueMicrotask(v083FixHallList);
},{passive:true});
