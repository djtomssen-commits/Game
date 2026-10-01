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

const v112OldMysticActive=v110MysticEventActive;
v110MysticEventActive=function(){
  v112EnsureWorldBossState();
  return v112OldMysticActive();
};

/* V8.009 Worldboss powerblock: global render polling is retired.
   The state is recreated at the actual boss entry points and after account hydration. */
window.addEventListener('growlegends:account-ready',()=>{try{v112EnsureWorldBossState()}catch(e){}},{passive:true});

try{
  v112EnsureWorldBossState();
  localStorage.setItem(KEY,JSON.stringify(s));
}catch(e){
  console.error('V4.02 worldboss state init',e);
}
