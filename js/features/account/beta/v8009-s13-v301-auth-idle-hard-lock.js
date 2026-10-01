/* ===== V4.02 robust 10-minute idle logout =====
   A backgrounded mobile browser may throttle intervals. Therefore timeout is
   checked on resume/focus/pageshow AND before accepting the next interaction.
   The login overlay is shown synchronously before any async save/sign-out. */
const V301_ACTIVITY_KEY='v301LastActivity';

function v301LoadLastActivity(){
  const stored=Number(sessionStorage.getItem(V301_ACTIVITY_KEY))||0;
  if(stored>0){
    v200LastActivity=stored;
  }else{
    v200LastActivity=Date.now();
    sessionStorage.setItem(V301_ACTIVITY_KEY,String(v200LastActivity));
  }
  return v200LastActivity;
}

function v301TouchActivity(){
  if(!v200DurableUser() || window.__V301_LOGOUT_IN_PROGRESS__)return false;

  const now=Date.now();
  const last=Number(v200LastActivity)||v301LoadLastActivity();

  /* Critical mobile fix: if the page sat in the background for >=10 min,
     the very first tap must log out, not reset the timer and allow gameplay. */
  if(now-last>=V200_IDLE_MS){
    v136Logout('idle');
    return false;
  }

  v200LastActivity=now;
  sessionStorage.setItem(V301_ACTIVITY_KEY,String(now));
  return true;
}

function v301CheckIdle(){
  if(!v200DurableUser() || window.__V301_LOGOUT_IN_PROGRESS__)return false;

  const now=Date.now();
  const last=Number(v200LastActivity)||v301LoadLastActivity();

  if(now-last>=V200_IDLE_MS){
    v136Logout('idle');
    return true;
  }
  return false;
}

v301LoadLastActivity();

['pointerdown','touchstart','keydown','scroll'].forEach(ev=>{
  window.addEventListener(ev,()=>{
    v301TouchActivity();
  },{passive:true,capture:true});
});

document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'){
    v301CheckIdle();
  }
});

window.addEventListener('focus',v301CheckIdle,{passive:true});
window.addEventListener('pageshow',v301CheckIdle,{passive:true});

/* Foreground safety net. Resume checks above are authoritative when mobile
   browsers pause timers in the background. */
setInterval(v301CheckIdle,15000);

/* Prevent cloud-save scheduling while a logout is already in progress. */
if(typeof v075ScheduleSave==='function'){
  const v301BaseScheduleSave=v075ScheduleSave;
  v075ScheduleSave=function(){
    if(window.__V301_LOGOUT_IN_PROGRESS__ || !window.__V200_AUTH_READY__)return;
    return v301BaseScheduleSave.apply(this,arguments);
  };
}

/* Reset idle clock only after a durable authenticated character is finalized. */
if(typeof v200FinalizeUser==='function'){
  const v301BaseFinalizeUser=v200FinalizeUser;
  v200FinalizeUser=async function(){
    if(window.__V301_LOGOUT_IN_PROGRESS__)return false;
    const r=await v301BaseFinalizeUser.apply(this,arguments);
    if(!window.__V301_LOGOUT_IN_PROGRESS__ && v200DurableUser()){
      v200LastActivity=Date.now();
      sessionStorage.setItem(V301_ACTIVITY_KEY,String(v200LastActivity));
    }
    return r;
  };
}


const v301Line=document.querySelector('#v141VersionLine');
