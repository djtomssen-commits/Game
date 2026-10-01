
/* ===== V4.02 definitive quest claim stabilization ===== */

/*
  Root cause:
  cloud-loaded saves may not contain the V4.02 achievement state because
  that structure was initialized before the cloud state replaced `s`.
  The old quest wrapper then throws AFTER the quest reward has already
  been paid.
*/
function v235EnsureAchievementState(){
  s.v106Achievements =
    (s.v106Achievements && typeof s.v106Achievements==='object')
      ? s.v106Achievements
      : {};

  s.v106Achievements.done =
    (s.v106Achievements.done && typeof s.v106Achievements.done==='object')
      ? s.v106Achievements.done
      : {};

  s.v106Achievements.stats =
    (s.v106Achievements.stats && typeof s.v106Achievements.stats==='object')
      ? s.v106Achievements.stats
      : {};

  const stats=s.v106Achievements.stats;

  for(const key of [
    'plantsGrown',
    'goldEarned',
    'questsDone',
    'dungeonWins',
    'pvpWins',
    'itemsFound'
  ]){
    stats[key]=Math.max(0,Number(stats[key])||0);
  }
}


/*
  Guard the achievement checker itself too because several old render paths
  call it after cloud state replacement.
*/
const v235BaseAchievementCheck=v106CheckAchievements;
v106CheckAchievements=function(...args){
  v235EnsureAchievementState();
  return v235BaseAchievementCheck.apply(this,args);
};


/*
  Snapshot helper for both historical dungeon key representations.
*/
function v235QuestKeySnapshot(){
  const unlocked=new Set(
    Array.isArray(s.dungeon?.unlocked)
      ? s.dungeon.unlocked.map(Number)
      : []
  );

  const keys={};
  if(s.dungeon?.keys && typeof s.dungeon.keys==='object'){
    Object.entries(s.dungeon.keys).forEach(([k,v])=>{
      if(v)keys[String(k)]=true;
    });
  }

  return {unlocked,keys};
}


function v235InventoryKey(it){
  if(!it)return '';

  return String(
    it.id ||
    [
      it.name||'',
      it.slot||'',
      it.dropLevel||'',
      it.quality||'',
      JSON.stringify(it.bonus||{})
    ].join('|')
  );
}


function v235RewardSnapshot(q){
  const keyState=v235QuestKeySnapshot();

  return {
    q:{...q},
    v303DailyBonusDue:(typeof v109ResetDaily==='function'?(v109ResetDaily(),!s.v109HarzDaily?.firstQuest):false),
    gold:Number(s.gold)||0,
    harz:Number(s.harzTaler)||0,
    inventory:(Array.isArray(s.inventory)?s.inventory:[])
      .map(v235InventoryKey),
    unlocked:keyState.unlocked,
    keys:keyState.keys
  };
}


function v235CollectRewardExtras(before){
  const extras=[];

  /* New inventory items */
  const beforeItems=new Set(before.inventory);
  const afterItems=Array.isArray(s.inventory)?s.inventory:[];

  afterItems.forEach(it=>{
    if(!beforeItems.has(v235InventoryKey(it))){
      extras.push({
        type:'item',
        text:`🎁 ${it.name||'Item gefunden'}`
      });
    }
  });

  /* New Harz-Taler from V4.02 quest reward layer */
  const harzGain=Math.max(
    0,
    (Number(s.harzTaler)||0)-Number(before.harz||0)
  );

  if(harzGain>0){
    const daily=before.v303DailyBonusDue?Math.min(2,harzGain):0;
    const found=Math.max(0,harzGain-daily);
    if(daily>0){
      extras.push({
        type:'harz',
        text:`🟢 +${daily} Harz-Taler · Tagesbonus`
      });
    }
    if(found>0){
      extras.push({
        type:'harz',
        text:`🟢 +${found} Harz-Taler · zusätzlich gefunden`
      });
    }
  }

  /* New dungeon unlock representation */
  const afterUnlocked=new Set(
    Array.isArray(s.dungeon?.unlocked)
      ?s.dungeon.unlocked.map(Number)
      :[]
  );

  [...afterUnlocked].forEach(i=>{
    if(!before.unlocked.has(i)){
      const d=dungeons?.[i];
      extras.push({
        type:'key',
        text:d
          ?`🗿 ${d.keyName||'Schlüsselstein'} · ${d.name} freigeschaltet`
          :`🗿 Dungeon ${i+1} freigeschaltet`
      });
    }
  });

  /* V4.02 uses s.dungeon.keys[] instead of unlocked[] */
  const afterKeys=
    (s.dungeon?.keys && typeof s.dungeon.keys==='object')
      ?s.dungeon.keys
      :{};

  Object.entries(afterKeys).forEach(([raw,value])=>{
    if(!value || before.keys[String(raw)])return;

    const i=Number(raw);
    const d=dungeons?.[i];

    extras.push({
      type:'key',
      text:d
        ?`🗿 Schlüsselstein gefunden · ${d.name}`
        :`🗿 Schlüsselstein für Dungeon ${i+1} gefunden`
    });
  });

  /*
    Avoid duplicate key lines if both old/new representations changed.
  */
  const seen=new Set();

  return extras.filter(x=>{
    const normalized=x.text
      .replace(/Schlüsselstein gefunden · /,'')
      .replace(/.+ · /,'')
      .trim();

    const key=`${x.type}:${normalized}`;

    if(seen.has(key))return false;
    seen.add(key);
    return true;
  });
}


function v235ShowQuestReward(before){
  try{window.v6111Sfx?.('reward')}catch(e){}
  const q=before.q;
  const overlay=v231EnsureQuestReward();

  const name=document.querySelector('#v231QuestRewardName');
  const xp=document.querySelector('#v231QuestRewardXp');
  const gold=document.querySelector('#v231QuestRewardGold');
  const extra=document.querySelector('#v231QuestRewardExtra');

  const baseXp=Number(q.v094BaseXp ?? q.xp ?? 0);
  const eventDouble=
    typeof v094XpEventActive==='function' &&
    v094XpEventActive();

  const paidXp=eventDouble
    ?Math.round(baseXp*2)
    :baseXp;

  if(name)name.textContent=q.name||'Auftrag abgeschlossen';
  if(xp)xp.textContent=`+${Math.max(0,paidXp)}`;
  if(gold)gold.textContent=`+${Math.max(0,Number(q.gold)||0)}`;

  const extras=v235CollectRewardExtras(before);

  if(extra){
    extra.style.display='';

    if(extras.length){
      extra.innerHTML=extras.map(row=>{
        const cls=
          row.type==='item'
            ?'v233-loot-item'
            :row.type==='key'
              ?'v233-loot-key'
              :row.type==='harz'
                ?'v235-loot-harz'
                :'';

        return `<div class="v233-loot-line ${cls}">${row.text}</div>`;
      }).join('');
    }else{
      extra.innerHTML=`
        <div class="v233-loot-line">
          Keine zusätzliche Beute gefunden.
        </div>
      `;
    }
  }

  overlay.classList.add('show');

  try{renderInventory()}catch(e){}
}


/*
  Replace only V4.02's final click function.
  The actual reward calculation remains the existing game logic.
*/
v233ClaimQuest=function(){
  if(v233ClaimBusy)return;

  const q=s.quests?.active;
  if(!q || Date.now()<Number(q.ends||0))return;

  v233ClaimBusy=true;

  v235EnsureAchievementState();

  const before=v235RewardSnapshot(q);

  let thrown=null;

  try{
    claimQuest();
  }catch(e){
    thrown=e;
    console.error('V4.02 quest claim inner error',e);
  }

  /*
    CRITICAL:
    If the active quest is gone, payout succeeded.
    A later legacy wrapper error must NOT hide the reward modal.
  */
  const paid=!s.quests?.active;

  if(paid){
    try{window.v4222AfterQuestClaim?.()}catch(e){console.warn('V4.222 post-claim hook',e)}

    /*
      V4.02 Elite hard guarantee:
      Verify the complete payout transaction before the reward popup.
      This is idempotent and repairs an Elite reward only when the older
      V4.02 layer did not actually credit it.
    */
    try{
      if(typeof v321FinalizeEliteReward==='function'){
        v321FinalizeEliteReward(before);
      }
    }catch(e){
      console.error('V4.02 Elite guarantee repair',e);
    }

    /*
      V4.02 hard guarantee:
      The reward popup path is reached only after the quest has actually vanished.
      If the historical V4.02 layer failed to pay/mark the first daily quest,
      repair the transaction HERE before the popup snapshots the final balance.
      This is idempotent: when V4.02 already worked, firstQuest is already true
      and nothing is added a second time.
    */
    try{
      v109ResetDaily();
      if(before.v303DailyBonusDue && !s.v109HarzDaily?.firstQuest){
        s.harzTaler=(Number(s.harzTaler)||0)+2;
        s.v109HarzDaily.firstQuest=true;
        try{persist(false)}catch(e){}
      }
      /* Paint the premium currency immediately; do not wait for a full render. */
      try{v282PaintHarzCard()}catch(e){
        try{v069SyncCurrencies()}catch(_){}
      }
      try{v306PaintFirstDailyQuestHarz()}catch(e){}
    }catch(e){
      console.error('V4.02 daily Harz guarantee repair',e);
    }

    try{
      v235ShowQuestReward(before);
    }catch(e){
      console.error('V4.02 reward display',e);

      /*
        Last-resort in-game summary: the player must never lose visibility
        of what the completed quest paid.
      */
      try{
        v063Toast(
          '📜 Quest abgeschlossen',
          'success',
          `+${Number(before.q.gold)||0} Gold · +${Number(before.q.xp)||0} XP`
        );
      }catch(_){}
    }

    /*
      Save again after old post-processing layers (Harz, achievements).
    */
    try{persist(false)}catch(e){}

    v233ClaimBusy=false;
    return;
  }

  /*
    Only this is a genuine failed claim: the quest is still active.
  */
  v233ClaimBusy=false;

  try{
    v063Toast(
      'Quest-Belohnung konnte nicht abgeschlossen werden',
      'error',
      thrown?.message||'Die Quest wurde nicht als abgeschlossen gespeichert.'
    );
  }catch(e){}
};


/*
  Ensure state immediately and after later cloud/application state changes.
*/
v235EnsureAchievementState();

const v235BaseApplyCloudSave=
  typeof v075ApplyCloudSave==='function'
    ?v075ApplyCloudSave
    :null;

if(v235BaseApplyCloudSave){
  v075ApplyCloudSave=function(...args){
    const result=v235BaseApplyCloudSave.apply(this,args);

    /*
      Current function can be sync or async across historical versions.
    */
    if(result && typeof result.then==='function'){
      return result.finally(()=>{
        v235EnsureAchievementState();
      });
    }

    v235EnsureAchievementState();
    return result;
  };
}


try{v235EnsureAchievementState()}catch(e){}
