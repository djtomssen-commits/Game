/* ===== V4.02 show current dungeon / enemy in player profile ===== */

/* Store the exact current position inside the existing dungeon_progress JSON.
   No database schema change is required. */
v074DungeonProgress=function(){
  const selected=Math.max(0,Math.min(19,Number(s.dungeon?.selected)||0));
  const rawRoom=s.dungeon?.progress?.[selected] ?? s.dungeon?.room ?? 0;
  const room=Math.max(0,Math.min(9,Number(rawRoom)||0));

  return {
    completed:[...(s.dungeon?.completed||[])],
    progress:{...(s.dungeon?.progress||{})},
    selected,
    room
  };
};

function v081DungeonPosition(dp, fallbackCompleted=0){
  dp=(dp && typeof dp==='object')?dp:{};
  const completed=Array.isArray(dp.completed)?dp.completed.map(Number):[];

  let dungeonIndex=Number.isFinite(Number(dp.selected))
    ? Math.max(0,Math.min(19,Number(dp.selected)))
    : null;

  /* Older profiles did not save selected/room. Infer their furthest active dungeon. */
  if(dungeonIndex===null){
    const entries=Object.entries(dp.progress||{})
      .map(([k,v])=>[Number(k),Number(v)])
      .filter(([k,v])=>Number.isFinite(k)&&Number.isFinite(v)&&k>=0&&k<20&&!completed.includes(k))
      .sort((a,b)=>b[0]-a[0]);

    if(entries.length){
      dungeonIndex=entries[0][0];
    }else{
      const doneCount=completed.length || Math.max(0,Number(fallbackCompleted)||0);
      dungeonIndex=Math.min(19,doneCount);
    }
  }

  /* A selected dungeon may already be completed. Then show the next unfinished one. */
  if(completed.includes(dungeonIndex) && dungeonIndex<19){
    let next=dungeonIndex+1;
    while(next<20 && completed.includes(next))next++;
    if(next<20)dungeonIndex=next;
  }

  const rawRoom =
    dp.progress?.[dungeonIndex] ??
    (Number(dp.selected)===dungeonIndex ? dp.room : undefined) ??
    0;

  let room=Math.max(0,Math.min(9,Number(rawRoom)||0));

  /* A completed dungeon is 10/10. */
  if(completed.includes(dungeonIndex))room=9;

  return {
    dungeonIndex,
    dungeonNumber:dungeonIndex+1,
    enemyNumber:room+1,
    completed:completed.includes(dungeonIndex)
  };
}

function v081DungeonStatusHtml(profile){
  const pos=v081DungeonPosition(profile?.dungeon_progress, profile?.dungeons);
  const dungeonName=(typeof dungeons!=='undefined' && dungeons[pos.dungeonIndex])
    ? dungeons[pos.dungeonIndex].name
    : `Dungeon ${pos.dungeonNumber}`;

  const isBoss=pos.enemyNumber>=10;
  const progress=Math.max(10,Math.min(100,pos.enemyNumber*10));

  return `
    <div class="v081-dungeon-status">
      <div class="v081-dungeon-label">Aktueller Dungeon-Fortschritt</div>
      <div class="v081-dungeon-name">
        Dungeon ${pos.dungeonNumber} · ${v073Escape(dungeonName)}
      </div>
      <div class="v081-dungeon-boss">
        ${pos.completed?'Abgeschlossen · 10 / 10':`${isBoss?'Boss':'Gegner'} ${pos.enemyNumber} / 10`}
      </div>
      <div class="v081-dungeon-track">
        <div class="v081-dungeon-fill" style="width:${progress}%"></div>
      </div>
    </div>`;
}

/* Add the progress card after the existing public-profile renderer has loaded the profile. */
const v081OldOpenProfile=v074OpenProfile;
v074OpenProfile=async function(id){
  await v081OldOpenProfile(id);

  if(!v073Ready)return;

  try{
    const {data:p,error}=await v073Db.from('profiles')
      .select('id,dungeons,dungeon_progress')
      .eq('id',id)
      .single();

    if(error||!p)return;

    const content=document.querySelector('#v074ProfileContent');
    if(!content)return;

    content.querySelector('#v081DungeonStatus')?.remove();

    const wrap=document.createElement('div');
    wrap.id='v081DungeonStatus';
    wrap.innerHTML=v081DungeonStatusHtml(p);

    /* Put dungeon status before equipment/PvP area, not at the very bottom. */
    const equipmentTitle=[...content.querySelectorAll('h3')]
      .find(el=>el.textContent.includes('Angelegte Ausrüstung'));

    if(equipmentTitle)content.insertBefore(wrap,equipmentTitle);
    else content.appendChild(wrap);

  }catch(e){
    console.error('V4.02 dungeon profile status',e);
  }
};

/* Force current profile JSON to sync with selected/room fields. */
setTimeout(async()=>{
  try{
    if(typeof v073SyncProfile==='function' && v073Ready){
      await v073SyncProfile(true);
    }
  }catch(e){
    console.error('V4.02 initial dungeon sync',e);
  }
},1200);

/* V7.113: retired pure pass-through render wrapper (V081). */
