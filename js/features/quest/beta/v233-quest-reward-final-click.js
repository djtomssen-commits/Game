
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

  overlay.classList.add('show');

  /*
    Make sure an old render or focus handler cannot hide it in the same frame.
  */
  requestAnimationFrame(()=>{
    overlay.classList.add('show');
  });

  setTimeout(()=>{
    if(document.body.contains(overlay)){
      overlay.classList.add('show');
    }
  },80);
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
    v233ShowActualQuestReward(snapshot);
  }

  v233ClaimBusy=false;
}


/*
  Capture phase bypasses every stale historical onclick reference.
  Only this V4.02 path handles the reward button.
*/
document.addEventListener('click',e=>{
  const target=e.target;
  if(!(target instanceof Element))return;

  const btn=target.closest('#claimQuest');
  if(!btn)return;

  e.preventDefault();
  e.stopImmediatePropagation();

  v233ClaimQuest();
},true);


/*
  renderQuests replaces the button DOM, so explicitly bind the current
  button after every quest render as a second safety layer.
*/
const v233BaseRenderQuests=renderQuests;
renderQuests=function(){
  const r=v233BaseRenderQuests();

  const btn=document.querySelector('#claimQuest');
  if(btn){
    btn.onclick=null;
    btn.dataset.v233Claim='1';
  }

  return r;
};


setTimeout(()=>{
  /* V7.151: startup full quest repaint retired; bind/version work only. */
  document.querySelectorAll('.version')
    .forEach(el=>el.textContent='V4.29 Stable');

  const line=document.querySelector('#v141VersionLine');
},300);
