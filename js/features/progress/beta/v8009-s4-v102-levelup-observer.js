/* ===== V4.02 robust level-up detection =====
   Tracks level changes after render, independent of which XP code path caused them.
*/
let v102ObservedLevel=Number(s.level)||1;
let v102LevelPopupBusy=false;
let v102PendingLevelups=[];

function v102QueueLevelUp(oldLevel,newLevel){
  if(newLevel<=oldLevel)return;
  v102PendingLevelups.push({oldLevel,newLevel});
  v102ShowNextLevelUp();
}

function v102ShowNextLevelUp(){
  if(v102LevelPopupBusy || !v102PendingLevelups.length)return;
  v102LevelPopupBusy=true;

  const {oldLevel,newLevel}=v102PendingLevelups.shift();
  const gainedLevels=Math.max(1,newLevel-oldLevel);
  const skillGain=Math.floor(newLevel/2)-Math.floor(oldLevel/2);

  document.querySelectorAll('.v101-levelup,.v102-levelup-overlay').forEach(x=>x.remove());

  const overlay=document.createElement('div');
  overlay.className='v102-levelup-overlay';
  overlay.innerHTML=`
    <div class="v102-levelup-card">
      <div class="v102-levelup-title">LEVEL UP!</div>
      <div class="v102-levelup-level">Level ${oldLevel} → ${newLevel}</div>
      <div class="v102-levelup-reward">
        ${skillGain>0?`+${skillGain} Talentpunkt${skillGain===1?'':'e'} · `:''}
        Neue Stärke für deinen Helden
      </div>
    </div>`;
  document.body.appendChild(overlay);

  if(typeof v063Toast==='function'){
    setTimeout(()=>{
      try{v063Toast('🎉 Level Up!','success',`Du bist jetzt Level ${newLevel}.`)}catch(e){}
    },250);
  }

  setTimeout(()=>{
    overlay.remove();
    v102LevelPopupBusy=false;
    v102ShowNextLevelUp();
  },3200);
}

function v102DetectLevelChange(){
  const current=Number(s.level)||1;
  if(current>v102ObservedLevel){
    const old=v102ObservedLevel;
    v102ObservedLevel=current;
    v102QueueLevelUp(old,current);
  }else if(current<v102ObservedLevel){
    /* Reset/new game/cloud load: sync silently, no fake level-up. */
    v102ObservedLevel=current;
  }
}

/* Last render wrapper: detect AFTER every older render path has finished. */
const v102BaseRender=render;
render=function(){
  const before=Number(s.level)||1;
  const result=v102BaseRender();

  

  requestAnimationFrame(()=>{
    try{v102DetectLevelChange()}catch(e){console.error('V4.02 level detection',e)}
  });

  return result;
};

/* Extra observer for code paths that change level and do not call render immediately. */
setInterval(()=>{
  if(document.hidden)return;
  try{v102DetectLevelChange()}catch(e){}
},1000);
