
/* ===== V4.02 Quest reward final click path ===== */

let v233ClaimBusy=false;

function v233XpTotalSnapshot(){
  /*
    XP may level up during claim, so raw s.xp alone is not enough to
    calculate reward reliably. The quest itself already contains the exact
    advertised XP reward, so that remains the authoritative displayed value.
  */
  return Number(s.xp)||0;
}

function v233InventoryIdentity(it){
  if(!it)return '';
  return String(
    it.id ||
    `${it.name||''}|${it.slot||''}|${it.dropLevel||''}|${JSON.stringify(it.bonus||{})}`
  );
}

function v233ShowActualQuestReward(snapshot){
  try{window.v6111Sfx?.('reward')}catch(e){}
  const q=snapshot.q;
  if(!q)return;

  const afterInventory=Array.isArray(s.inventory)?s.inventory:[];
  const beforeIds=new Set(snapshot.inventoryIds);

  const foundItems=afterInventory.filter(it=>{
    return !beforeIds.has(v233InventoryIdentity(it));
  });

  const afterUnlocked=new Set(
    Array.isArray(s.dungeon?.unlocked)?s.dungeon.unlocked:[]
  );

  const newDungeonIndexes=[...afterUnlocked].filter(
    x=>!snapshot.unlocked.has(x)
  );

  if(newDungeonIndexes.length){
    try{
      const newest=Math.max(...newDungeonIndexes.map(Number).filter(Number.isFinite));
      if(Number.isFinite(newest)){
        const current=Math.max(0,Number(s.dungeon?.selected)||0);
        if(typeof dungeonCompleted==='function' && dungeonCompleted(current)){
          s.dungeon.selected=newest;
          s.dungeon.room=Math.max(0,Math.min(9,Number(s.dungeon?.progress?.[newest])||0));
        }
        s.dungeon.layer='world';
        s.dungeon.view='map';
        try{persist(false)}catch(_){}
        requestAnimationFrame(()=>{
          try{v243RepairAndSaveDungeonKeys?.()}catch(_){}
          try{v230ShowDungeonWorld?.()}catch(_){}
          try{v242PaintDungeonWorldStatus?.()}catch(_){}
          try{v250PaintKeyProgress?.()}catch(_){}
          try{v067BindWorldMap?.()}catch(_){}
        });
      }
    }catch(e){console.warn('V6.114 quest key refresh',e)}
  }

  const extras=[];

  foundItems.forEach(it=>{
    extras.push(`🎁 Item gefunden: ${it.name||'Unbekanntes Item'}`);
  });

  newDungeonIndexes.forEach(i=>{
    const d=dungeons?.[Number(i)];
    if(d){
      extras.push(
        `🗿 ${d.keyName||'Schlüsselstein'} gefunden – ${d.name} freigeschaltet`
      );
    }
  });

  const overlay=v231EnsureQuestReward();

  const name=document.querySelector('#v231QuestRewardName');
  const xp=document.querySelector('#v231QuestRewardXp');
  const gold=document.querySelector('#v231QuestRewardGold');
  const extra=document.querySelector('#v231QuestRewardExtra');

  if(name)name.textContent=q.name||'Auftrag abgeschlossen';
  if(xp)xp.textContent=`+${Math.max(0,Number(q.xp)||0)}`;
  if(gold)gold.textContent=`+${Math.max(0,Number(q.gold)||0)}`;

  if(extra){
    if(extras.length){
      extra.style.display='';
      extra.innerHTML=extras.map(line=>{
        const cls=line.startsWith('🎁')
          ?'v233-loot-item'
          :line.startsWith('🗿')
            ?'v233-loot-key'
            :'';

        return `<div class="v233-loot-line ${cls}">${line}</div>`;
      }).join('');
    }else{
      extra.style.display='';
      extra.innerHTML=`
        <div class="v233-loot-line">
          Keine zusätzliche Beute gefunden.
        </div>
      `;
    }
  }

  /* The canonical local/mirror claim render completes before this presenter
     runs. Show the reward once; do not repaint the same overlay in later frames. */
  overlay.classList.add('show');
}


function v233ClaimQuest(){
  if(v233ClaimBusy)return;

  const q=s.quests?.active;
  if(!q || Date.now()<Number(q.ends||0))return;

  v233ClaimBusy=true;

  const snapshot={
    q:{...q},
    gold:Number(s.gold)||0,
    xp:v233XpTotalSnapshot(),
    inventoryIds:(Array.isArray(s.inventory)?s.inventory:[])
      .map(v233InventoryIdentity),
    unlocked:new Set(
      Array.isArray(s.dungeon?.unlocked)?s.dungeon.unlocked:[]
    )
  };

  try{
    /*
      Run the existing, tested quest reward calculation. This keeps all
      current XP, gold, item and dungeon-key chances unchanged.
    */
    claimQuest();
  }catch(e){
    console.error('V4.02 Quest claim',e);
    v233ClaimBusy=false;

    try{
      v063Toast(
        'Quest-Belohnung konnte nicht abgeschlossen werden',
        'error',
        e?.message||'Unbekannter Fehler'
      );
    }catch(_){}

    return;
  }

  /*
    Only show a reward when the claim really consumed the active quest.
  */
  if(!s.quests?.active){
    try{window.v4222AfterQuestClaim?.()}catch(e){console.warn('V4.222 post-claim hook',e)}
    try{window.v4162PaintMenuAttentionLocal?.()}catch(_){}
    v233ShowActualQuestReward(snapshot);
  }

  v233ClaimBusy=false;
}


/* V8.009 Quest consolidation:
   The canonical active-card owner v392 binds #v392ClaimQuest directly to
   v233ClaimQuest. The historical document-level capture owner for #claimQuest
   is retired so one click has one owner. Keep this hook as a compatibility
   no-op because the canonical renderer still calls it. */
window.v233BindClaimButton=()=>{};


