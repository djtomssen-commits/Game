/* ===== V4.02 Worldboss cloud-state fix =====
   Older/cloud saves can replace the state object and remove v110WorldBoss.
   Always recreate the structure before any worldboss access.
*/
function v112EnsureWorldBossState(){
  if(!s.v110WorldBoss || typeof s.v110WorldBoss!=='object'){
    s.v110WorldBoss={
      day:'',
      freeUsed:false,
      wins:0,
      attempts:0
    };
  }

  s.v110WorldBoss.day = String(s.v110WorldBoss.day || '');
  s.v110WorldBoss.freeUsed = !!s.v110WorldBoss.freeUsed;
  s.v110WorldBoss.wins = Math.max(0, Number(s.v110WorldBoss.wins)||0);
  s.v110WorldBoss.attempts = Math.max(0, Number(s.v110WorldBoss.attempts)||0);

  return s.v110WorldBoss;
}

/* Replace the fragile reset function from V4.02. */
v110ResetDay=function(){
  const wb=v112EnsureWorldBossState();
  const d=new Date();
  const key=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;

  if(wb.day!==key){
    wb.day=key;
    wb.freeUsed=false;
  }

  return wb;
};

/* Protect all common worldboss entry points. */
const v112OldOpen=v111OpenWorldBoss;
v111OpenWorldBoss=function(){
  v112EnsureWorldBossState();
  return v112OldOpen();
};

const v112OldRefresh=v110Refresh;
v110Refresh=function(){
  v112EnsureWorldBossState();
  return v112OldRefresh();
};

const v112OldFight=v110Fight;
v110Fight=function(){
  v112EnsureWorldBossState();
  return v112OldFight();
};

const v112OldMysticActive=v110MysticEventActive;
v110MysticEventActive=function(){
  v112EnsureWorldBossState();
  return v112OldMysticActive();
};

/* Cloud loads replace the state object, so ensure again after every render. */
const v112BaseRender=render;
render=function(){
  v112EnsureWorldBossState();

  const result=v112BaseRender();

  v112EnsureWorldBossState();
  

  return result;
};

function v112ServerOwned(){try{return !!(typeof v073User!=='undefined'&&v073User?.id&&window.v7081UseAuthority?.('worldboss'))}catch(_){return false}}
const v112LegacyStateTimer=setInterval(()=>{
  if(document.hidden)return;
  if(v112ServerOwned()){clearInterval(v112LegacyStateTimer);const g=window.__V7173_LEGACY_LOCAL_GUARD__;if(g){g.v112TimerActive=false;g.retiredTimers++;g.worldbossTimerBlocks++;g.lastBlockAt=Date.now()}return;}
  try{v112EnsureWorldBossState()}catch(e){}
},10000);
if(window.__V7173_LEGACY_LOCAL_GUARD__)window.__V7173_LEGACY_LOCAL_GUARD__.v112TimerActive=true;
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>{if(v112ServerOwned()&&window.__V7173_LEGACY_LOCAL_GUARD__?.v112TimerActive){clearInterval(v112LegacyStateTimer);window.__V7173_LEGACY_LOCAL_GUARD__.v112TimerActive=false;window.__V7173_LEGACY_LOCAL_GUARD__.retiredTimers++;}},950),{passive:true});

try{
  v112EnsureWorldBossState();
  localStorage.setItem(KEY,JSON.stringify(s));
}catch(e){
  console.error('V4.02 worldboss state init',e);
}
