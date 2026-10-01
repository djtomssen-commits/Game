/* ===== V4.02 Daily Harz-Taler economy =====
   - first completed quest each local calendar day: +2 guaranteed
   - within first 100 quest energy spent each day: at least +2 additional
   - occasional extra quest drops
   - dungeon wins can rarely drop Harz; bosses have a better chance
*/
s.v109HarzDaily ??={day:'',questEnergy:0,energyHarz:0,firstQuest:false};

function v109DayKey(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function v109ResetDaily(){
  const key=v109DayKey();
  s.v109HarzDaily??={day:key,questEnergy:0,energyHarz:0,firstQuest:false};
  if(s.v109HarzDaily.day!==key){
    s.v109HarzDaily={day:key,questEnergy:0,energyHarz:0,firstQuest:false};
  }
}
v109ResetDaily();

/* Remember actual quest energy at start. */
const v109OldStartQuest=window.startQuest;
window.startQuest=i=>{
  v109ResetDaily();
  const q=s.quests?.offers?.[i];
  if(q){
    window.v109PendingQuestEnergy=Number(q.energy)||0;
  }else{
    window.v109PendingQuestEnergy=0;
  }
  return v109OldStartQuest(i);
};

/* Wrap final claimQuest (includes all older quest XP/achievement logic). */
const v109OldClaimQuest=claimQuest;
claimQuest=function(){
  v109ResetDaily();

  const q=s.quests?.active;
  if(!q||Date.now()<q.ends)return v109OldClaimQuest.apply(this,arguments);

  const cost=Math.max(0,Number(q.energy)||Number(window.v109PendingQuestEnergy)||0);
  const firstQuestDue=!s.v109HarzDaily.firstQuest;
  const result=v109OldClaimQuest.apply(this,arguments);

  /* Do not consume/mark any daily Harz reward unless THIS quest payout really succeeded. */
  if(s.quests?.active===q){
    window.v109PendingQuestEnergy=0;
    return result;
  }

  let gained=0;
  let reasons=[];
  let dailyBonus=0;
  let foundHarz=0;

  /* Guaranteed +2 for first successfully completed quest of the day. */
  if(firstQuestDue){
    dailyBonus=2;
    gained+=dailyBonus;
    reasons.push('Tagesbonus');
  }

  const oldEnergy=Number(s.v109HarzDaily.questEnergy)||0;
  s.v109HarzDaily.questEnergy=Math.min(100,oldEnergy+cost);

  if(s.v109HarzDaily.questEnergy<=100 && s.v109HarzDaily.energyHarz<2){
    const remaining=Math.max(1,100-s.v109HarzDaily.questEnergy);
    const missing=2-s.v109HarzDaily.energyHarz;
    const chance=Math.min(.55,.10+(cost/Math.max(cost,remaining))*missing*.65);
    if(Math.random()<chance){
      const drop=Math.min(missing,Math.random()<.18?2:1);
      s.v109HarzDaily.energyHarz+=drop;
      gained+=drop;
      foundHarz+=drop;
      reasons.push('Beim Questen gefunden');
    }
  }

  if(s.v109HarzDaily.questEnergy>=100 && s.v109HarzDaily.energyHarz<2){
    const guaranteed=2-s.v109HarzDaily.energyHarz;
    s.v109HarzDaily.energyHarz=2;
    gained+=guaranteed;
    foundHarz+=guaranteed;
    reasons.push('100-Dampf-Garantie');
  }

  if(Math.random()<.065){
    const extra=Math.random()<.12?2:1;
    gained+=extra;
    foundHarz+=extra;
    reasons.push('Bonusfund');
  }

  /* Credit first, then mark the daily bonus as claimed, then persist the whole transaction. */
  if(gained>0)s.harzTaler=(Number(s.harzTaler)||0)+gained;
  if(firstQuestDue)s.v109HarzDaily.firstQuest=true;

  /* Attach the exact breakdown to the completed quest object retained by V4.02's snapshot. */
  q.v303HarzReward={
    total:gained,
    dailyBonus,
    found:foundHarz,
    reasons:[...reasons]
  };

  try{persist()}catch(e){}

  if(gained>0 && typeof v063Toast==='function'){
    v063Toast('🟢 Harz-Taler erhalten','success',`+${gained} Harz-Taler · ${reasons.join(' · ')}`);
  }

  window.v109PendingQuestEnergy=0;
  return result;
};

/* Dungeon Harz drops.
   Use click context + observe Harz after the real dungeon reward code.
   Existing boss 22% Harz drop remains; this adds rare normal-enemy drops and
   a small boss bonus chance without touching combat progression. */
let v109DungeonHarzBefore=null;
document.addEventListener('click',e=>{
  const btn=e.target.closest('#dungeonFightBtn,[data-dungeon-fight],.dungeon-fight-btn');
  if(!btn)return;

  v109DungeonHarzBefore=Number(s.harzTaler)||0;

  setTimeout(()=>{
    const loot=document.querySelector('#loot');
    const won=!!loot && /Sieg|Dungeon abgeschlossen|Belohnung bestätigen/i.test(loot.textContent||'');
    if(!won)return;

    const current=Number(s.harzTaler)||0;
    const alreadyDropped=current-(Number(v109DungeonHarzBefore)||0);

    /* Determine boss from reward text / current room. */
    const boss=/Dungeon abgeschlossen|Endboss|Boss besiegt/i.test((loot?.textContent||'')+' '+(document.querySelector('#battleLog')?.textContent||''));
    let extra=0;

    if(boss){
      /* Existing code already has 22%; add only a modest extra chance. */
      if(alreadyDropped<=0 && Math.random()<.12)extra=1;
      else if(alreadyDropped>0 && Math.random()<.04)extra=1;
    }else{
      /* Normal dungeon enemies: uncommon, but noticeable over time. */
      if(Math.random()<.055)extra=1;
    }

    if(extra>0){
      s.harzTaler=(Number(s.harzTaler)||0)+extra;
      const line=document.createElement('div');
      line.className='loot';
      line.innerHTML=`🟢 ${extra} Harz-Taler gefunden!`;
      loot?.appendChild(line);
      try{persist()}catch(e){}
      if(typeof v063Toast==='function'){
        v063Toast('🟢 Dungeon-Beute','success',`+${extra} Harz-Taler`);
      }
    }
  },1300);
},true);

const v109BaseRender=render;
render=function(){
  v109ResetDaily();
  const result=v109BaseRender();
  
  return result;
};
