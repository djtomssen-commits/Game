
/* ===== V4.02 robust notifications ===== */

function v231InGameNotificationsEnabled(){
  return !window.v141Settings || v141Settings.notifications !== false;
}
function v231PhonePushEnabled(){
  try{
    if(typeof window.glPushEnabled==='function')return !!window.glPushEnabled();
    return !window.v141Settings || v141Settings.pushNotifications !== false;
  }catch(e){return true}
}
function v231NotificationsEnabled(){
  /* Local completion checks must keep running when EITHER channel is active.
     Delivery itself is split below: toast = in-game, Notification = phone/system. */
  return v231InGameNotificationsEnabled() || v231PhonePushEnabled();
}


/*
  Replace V4.02 notify output.
  In-game toast is always shown while notifications are enabled.
  A browser notification is also attempted whenever permission is granted,
  including after returning from a sleeping/background tab.
*/
v210NotifyOnce=function(key,title,detail,icon='🔔'){
  const inGame=v231InGameNotificationsEnabled();
  const phonePush=v231PhonePushEnabled();
  if(!inGame && !phonePush)return false;
  if(v210Seen[key])return false;

  v210Seen[key]=Date.now();
  v210SaveSeen();

  /* In-game channel: never controls Android/system push. */
  if(inGame){
    try{
      if(typeof v063Toast==='function'){
        v063Toast(`${icon} ${title}`,'success',detail);
      }
    }catch(e){}
  }

  /* Phone/system channel: independent from in-game hints. Native FCM jobs are
     handled separately by glSync*PushJob; this covers browser/WebView system
     notifications while the page itself is still alive. */
  if(
    phonePush &&
    typeof Notification!=='undefined' &&
    Notification.permission==='granted'
  ){
    try{
      const n=new Notification(`Grow Legends – ${title}`,{body:detail});
      setTimeout(()=>{try{n.close()}catch(e){}},7000);
    }catch(e){}
  }

  return true;
};


/* ---------- Reliable PvP ready transition ---------- */

let v231PvpPrevious=Number(v204CooldownLeft)||0;
let v231PvpReadyNotified=false;

function v231CheckPvpLocal(){
  if(!v231NotificationsEnabled())return;

  const current=Math.max(0,Number(v204CooldownLeft)||0);

  if(current>0){
    v231PvpReadyNotified=false;
  }

  if(
    v231PvpPrevious>0 &&
    current<=0 &&
    !v231PvpReadyNotified
  ){
    v231PvpReadyNotified=true;

    v210NotifyOnce(
      `pvp-ready:${Date.now()}`,
      'PvP wieder bereit',
      'Dein PvP-Cooldown ist abgelaufen. Du kannst wieder kämpfen.',
      '⚔️'
    );
  }

  v231PvpPrevious=current;
}


/*
  Run all local completion checks once per second. They are guarded by
  v210Seen, so each event only produces one notification.
*/
function v231NotificationTick(){
  if(document.hidden)return;
  if(window.v6255EnergySaverActive?.()){
    const t=Date.now();
    if(t-(v231NotificationTick._v6255Last||0)<2500)return;
    v231NotificationTick._v6255Last=t;
  }
  if(!v231NotificationsEnabled())return;

  const now=Date.now();

  try{v210QuestCheck(now)}catch(e){}
  try{v210PlantCheck(now)}catch(e){}
  try{v210DungeonCheck()}catch(e){}
  try{v231CheckPvpLocal()}catch(e){}
}

setInterval(v231NotificationTick,1000);


/*
  When Android/browser resumes from background, timers may have been paused.
  Re-check everything immediately and query the server PvP cooldown.
*/
function v231ResumeNotifications(){
  if(!v231NotificationsEnabled())return;

  try{v231NotificationTick()}catch(e){}

  try{
    void v210PvpCheck();
  }catch(e){}
}

document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'){
    queueMicrotask(v231ResumeNotifications);
  }
});

window.addEventListener('focus',()=>{
  queueMicrotask(v231ResumeNotifications);
});


/* Ask permission again only from a user gesture in settings. */
const v231BaseBindNotificationPermission=v210BindNotificationPermission;
v210BindNotificationPermission=function(){
  const r=v231BaseBindNotificationPermission();

  const toggle=document.querySelector('#v141PushNotifications');
  if(toggle && toggle.dataset.v231Bound!=='1'){
    toggle.dataset.v231Bound='1';

    toggle.addEventListener('change',()=>{
      if(toggle.checked){
        try{void v210AskNotificationPermission()}catch(e){}
        queueMicrotask(v231ResumeNotifications);
      }
    });
  }

  return r;
};


/* ===== Quest reward confirmation ===== */

function v231EnsureQuestReward(){
  let overlay=document.querySelector('#v231QuestReward');
  if(overlay)return overlay;

  overlay=document.createElement('div');
  overlay.id='v231QuestReward';
  overlay.innerHTML=`
    <div class="v231-quest-card">
      <div class="v231-quest-head">
        <div class="v231-quest-icon">📜</div>
        <div class="v231-quest-title">QUEST ABGESCHLOSSEN</div>
        <div class="v231-quest-name" id="v231QuestRewardName"></div>
      </div>

      <div class="v231-quest-loot">
        <div>
          <span>Erfahrung</span>
          <b id="v231QuestRewardXp">+0</b>
        </div>
        <div>
          <span>Gold</span>
          <b id="v231QuestRewardGold">+0</b>
        </div>
      </div>

      <div class="v231-quest-extra" id="v231QuestRewardExtra"></div>

      <button type="button" class="btn" id="v231QuestRewardOk">
        Belohnung bestätigen
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('#v231QuestRewardOk').onclick=()=>{
    overlay.classList.remove('show');
  };

  return overlay;
}


function v231ShowQuestReward(message,q){
  const overlay=v231EnsureQuestReward();

  const text=String(message||'');
  const lines=text.split('\n').map(x=>x.trim()).filter(Boolean);

  document.querySelector('#v231QuestRewardName').textContent=
    q?.name||'Auftrag abgeschlossen';

  document.querySelector('#v231QuestRewardXp').textContent=
    `+${Math.max(0,Number(q?.xp)||0)}`;

  document.querySelector('#v231QuestRewardGold').textContent=
    `+${Math.max(0,Number(q?.gold)||0)}`;

  const extras=lines.slice(1);
  const extra=document.querySelector('#v231QuestRewardExtra');

  if(extras.length){
    extra.style.display='';
    extra.textContent=extras.join('\n');
  }else{
    extra.style.display='none';
    extra.textContent='';
  }

  overlay.classList.add('show');

  /*
    Also repaint inventory immediately when an item reward was found.
  */
  try{renderInventory()}catch(e){}
}


/*
  Final inventory repaint helper for existing items with old rarity strings.
*/
function v231RepairInventoryClasses(){
  const map={
    gray:'common-gray',
    green:'common-green',
    blue:'rare-blue',
    purple:'epic-purple',
    orange:'legendary-orange',
    cyan:'mystic-cyan'
  };

  const cards=document.querySelectorAll('#character #inventory .inv-item');

  cards.forEach((card,i)=>{
    const it=s.inventory?.[i];
    if(!it)return;

    Object.values(map).forEach(c=>card.classList.remove(c));
    card.classList.add(map[it.quality]||'common-gray');
  });
}

/* Character/Inventory cleanup Phase 1: V231 inventory rarity repaint retired.
   V6.84 is the final dataset-aware rarity owner. */


/* Version */
queueMicrotask(()=>{
  try{v210BindNotificationPermission();v231ResumeNotifications()}catch(e){}
});
