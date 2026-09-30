
/* ===== V4.02 live quest timer + immediate PvP bud sync ===== */

/* ---------- Quest live countdown ---------- */

let v229QuestTimerLastEnds=0;
let v229QuestTimerDonePainted=false;

function v229FormatQuestLeft(ms){
  ms=Math.max(0,Number(ms)||0);

  const total=Math.ceil(ms/1000);
  const h=Math.floor(total/3600);
  const m=Math.floor((total%3600)/60);
  const s=total%60;

  if(h>0){
    return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  return `${m}:${String(s).padStart(2,'0')}`;
}

function v229UpdateQuestTimer(){
  const q=s.quests?.active;

  if(!q?.ends){
    v229QuestTimerLastEnds=0;
    v229QuestTimerDonePainted=false;
    return;
  }

  const ends=Number(q.ends)||0;
  const left=Math.max(0,ends-Date.now());
  try{window.v392TickActive?.()}catch(_){}

  /*
    A newly started quest can replace the old DOM in renderQuests().
    Reset the completion latch for the new quest.
  */
  if(v229QuestTimerLastEnds!==ends){
    v229QuestTimerLastEnds=ends;
    v229QuestTimerDonePainted=false;
  }

  /* V4.159: V392 replaced the old #activeQuest timer with #v392QuestTimer.
     The interval below captured THIS original function when it was created, so a later
     reassignment of v229UpdateQuestTimer cannot make that interval call V392's wrapper.
     Update both live timer surfaces directly from this authoritative one-second callback. */
  const timer=document.querySelector('#activeQuest .timer');
  const modernTimer=document.querySelector('#v392QuestTimer');

  if(left>0){
    const text=v229FormatQuestLeft(left);
    if(timer)timer.textContent=`⏳ Noch ${text}`;
    if(modernTimer&&modernTimer.textContent!==text)modernTimer.textContent=text;
    return;
  }

  /*
    At exactly 0 repaint the quest card ONCE so the claim button appears.
    Do not call the entire giant render() chain every second.
  */
  if(!v229QuestTimerDonePainted){
    v229QuestTimerDonePainted=true;

    try{
      renderQuests();
    }catch(e){
      console.warn('V4.02 quest completion render',e);

      if(timer)timer.textContent='✅ Auftrag abgeschlossen';
      if(modernTimer)modernTimer.textContent='✅ Bereit zum Abholen';
    }
  }
}


/*
  One lightweight second timer.
  It updates only the active quest countdown DOM.
*/
setInterval(()=>{
  if(document.hidden||!document.querySelector('#quests')?.classList.contains('active'))return;
  v229UpdateQuestTimer();
},1000);


/* Direct hooks used by the canonical Quest start/claim owners.
   No startQuest/claimQuest wrapper is installed here anymore. */
window.v229QuestStartSync=()=>requestAnimationFrame(v229UpdateQuestTimer);
window.v229QuestClaimSync=()=>{
  v229QuestTimerLastEnds=0;
  v229QuestTimerDonePainted=false;
  requestAnimationFrame(v229UpdateQuestTimer);
};


/* ---------- PvP buds immediate UI sync ---------- */

function v229PaintPvpBuds(){
  const value=Number(s.v204Pvp?.buds)||0;

  /*
    Character avatar badge.
  */
  try{
    v204InstallAvatarBadge();
  }catch(e){}

  const badge=document.querySelector(
    '#character .v204-avatar-badge b'
  );
  if(badge){
    badge.textContent=value;
  }

  /*
    PvP page counter when currently mounted.
  */
  const pvpCounter=document.querySelector('#v204Buds');
  if(pvpCounter){
    pvpCounter.textContent=value;
  }
}


/*
  Every profile/RPC stats application immediately updates the character UI.
  This is the important fix for needing a browser refresh.
*/
const v229BaseSyncPvpStats=v204SyncLocalStatsFromProfile;
v204SyncLocalStatsFromProfile=function(row){
  const r=v229BaseSyncPvpStats(row);

  v229PaintPvpBuds();

  /*
    Save the new PvP counter locally immediately as well.
  */
  try{
    persist(false);
  }catch(e){}

  return r;
};


/*
  When the PvP result popup appears, repaint once more after the server
  result has already been applied by v209FinishBattle().
*/
const v229BaseShowPvpResult=v211ShowResult;
v211ShowResult=function(win,enemy,gold,xp,buds){
  v229PaintPvpBuds();

  const r=v229BaseShowPvpResult(
    win,
    enemy,
    gold,
    xp,
    buds
  );

  requestAnimationFrame(v229PaintPvpBuds);

  return r;
};


/* V7.119: navigation wrapper retired. One shared post-navigation frame
   dispatches all character/quest refresh work without deepening v032Go. */
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  const id=String(e?.detail?.id||'');
  if(id==='character'){
    /* V7.184: character navigation is presentation-only. PvP cooldown belongs
       to the PvP page and must not add a REST pvp_attacks request here. */
    v229PaintPvpBuds();
  }
  if(id==='quests')v229UpdateQuestTimer();
});


setTimeout(()=>{
  try{
    v229UpdateQuestTimer();
    v229PaintPvpBuds();
  }catch(e){}
},300);


setTimeout(()=>{
  document.querySelectorAll('.version')
    .forEach(el=>el.textContent='V4.29 Stable');
},350);
