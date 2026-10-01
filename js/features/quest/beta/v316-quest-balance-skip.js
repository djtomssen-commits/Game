
/* ===== V4.02 Quest time / XP / Gold balance (duration overridden by V4.02) ===== */

function v316RoleConfig(id){
 return v309QuestRoles.find(x=>x.id===id) || v309QuestRoles[1];
}
function v316BalanceQuest(q,level=Number(s.level)||1){
 if(!q)return q;
 level=Math.max(1,Math.floor(Number(level)||1));

 if(q.v310Elite)return v6238ApplyEliteCurve(q,level);

 const roleId=q.v309Role||'normal';
 const cfg=v316RoleConfig(roleId);
 const heavyDuration=Math.max(90,level*6);
 const normalDuration=heavyDuration/1.55;
 const baseXp=Math.max(90,Math.round(level*100*.16));
 const baseGold=Math.max(45,Math.round(typeof window.v6168QuestBaseGold==='function'?window.v6168QuestBaseGold(level):(35+level*14+Math.pow(level,1.15)*2.2)));

 q.duration=Math.max(15,Math.round(normalDuration*cfg.duration));
 q.xp=Math.max(1,Math.round(baseXp*cfg.xp));
 q.gold=Math.max(1,Math.round(baseGold*cfg.gold));
 q.v094BaseXp=q.xp;
 q.v274BaseGold=q.gold;
 q.v316BalancedAtLevel=level;
 return q;
}

/* Existing, not-yet-started offers are brought onto the new curve once per level.
   Active quests are intentionally left untouched so an in-progress timer/reward
   never changes underneath the player. */
function v316BalanceVisibleOffers(){
 const level=Math.max(1,Number(s.level)||1);
 const offers=s.quests?.offers;
 if(!Array.isArray(offers)||s.quests?.active)return false;
 let changed=false;
 offers.forEach(q=>{
   if(q && Number(q.v316BalancedAtLevel)!==level){
     v316BalanceQuest(q,level);
     changed=true;
   }
 });
 if(changed)try{persist(false)}catch(e){}
 return changed;
}

let v316SkipBusy=false;
async function v316SkipActiveQuest(){
 if(v316SkipBusy)return;
 const q=s.quests?.active;
 if(!q)return;
 if(Date.now()>=Number(q.ends||0)){
   try{return v233ClaimQuest()}catch(e){return}
 }
 if((Number(s.harzTaler)||0)<1){
   return v115Alert('Du brauchst 1 Harz-Taler, um die Questzeit zu überspringen.','Zu wenig Harz-Taler','warn');
 }
 const left=Math.max(1,Math.ceil((Number(q.ends||0)-Date.now())/1000));
 const ok=await v115Confirm(
   `Die restlichen ${left} Sekunden für 1 Harz-Taler überspringen?`,
   {title:'⏩ Questzeit überspringen',type:'confirm',okText:'Für 1 Harz überspringen'}
 );
 if(!ok)return;

 /* Recheck after the async confirmation. */
 const live=s.quests?.active;
 if(!live || String(live.id)!==String(q.id))return;
 if(Date.now()>=Number(live.ends||0)){
   try{return v233ClaimQuest()}catch(e){return}
 }
 if((Number(s.harzTaler)||0)<1){
   return v115Alert('Du hast nicht mehr genug Harz-Taler.','Zu wenig Harz-Taler','warn');
 }

 v316SkipBusy=true;
 try{
   s.harzTaler=Math.max(0,(Number(s.harzTaler)||0)-1);
   live.ends=Date.now()-1;
   live.v316SkippedForHarz=true;
   try{persist(false)}catch(e){}
   try{v282PaintHarzCard()}catch(e){try{v069SyncCurrencies()}catch(_){}}
   try{renderQuests()}catch(e){}
   /* Preserve V4.02: skip leads into the short quest fight, then reward popup. */
   return await v233ClaimQuest();
 }finally{
   v316SkipBusy=false;
 }
}
window.v316SkipActiveQuest=v316SkipActiveQuest;

function v316PaintSkip(){
 const q=s.quests?.active;
 const card=document.querySelector('#activeQuest .quest');
 if(!q||!card)return;
 card.querySelectorAll('.v316-skip-wrap').forEach(x=>x.remove());
 if(Date.now()>=Number(q.ends||0))return;

 const wrap=document.createElement('div');
 wrap.className='v316-skip-wrap';
 wrap.innerHTML=`<button class="btn secondary v316-skip" type="button">
   ⏩ Questzeit überspringen · 1 Harz-Taler
   <small>Danach startet direkt der Quest-Kampf.</small>
 </button>`;
 wrap.querySelector('button').disabled=v316SkipBusy;
 wrap.querySelector('button').addEventListener('click',v316SkipActiveQuest);
 card.appendChild(wrap);
}

/* Direct render hooks used by the canonical Quest renderer. */
window.v316PrepareQuestRender=v316BalanceVisibleOffers;
window.v316ScheduleSkipPaint=()=>{}; /* V8.009 retired: v4127 owns visible skip row. */

try{v316BalanceVisibleOffers()}catch(e){}
