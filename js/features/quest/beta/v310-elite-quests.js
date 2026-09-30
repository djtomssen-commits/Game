
/* V4.02 Elite quests.
   Important anti-reroll rule:
   Elite can ONLY be rolled while a successfully completed quest is generating
   its automatic replacement trio. Manual "Neu würfeln" never enables this flag.
*/
let v310CompletionOfferWindow=false;
let v310EliteRolledThisBatch=false;
let v310EliteTarget=-1;
const V310_ELITE_CHANCE=.06; /* rare: 6% per completed quest batch */

function v310EliteItem(){
 const cls=s.playerClass||'grower';
 const pool=classGear[cls]||classGear.grower;
 const base=pool[Math.floor(Math.random()*pool.length)];
 const q=Math.random()<.72?'blue':'purple'; /* guaranteed blue or epic */
 const meta=qualityMeta(q);
 const boost=Math.max(0,Math.floor(((Number(s.level)||1)-1)/3));
 const bonus=Object.fromEntries(
   Object.entries(base.bonus||{}).map(([k,v])=>[k,(Number(v)||0)+meta.mult+boost])
 );
 return {
   ...base,
   id:`elite_${Date.now()}_${Math.random()}`,
   price:0,
   name:`${meta.label}: ${base.name} [Lv.${s.level}]`,
   quality:q,rarity:meta.cls,dropLevel:s.level,bonus,
   v310EliteReward:true
 };
}

function v6238EliteCurve(level=Number(s.level)||1){
 level=Math.max(1,Math.floor(Number(level)||1));
 const heavyDuration=Math.max(90,level*6);
 const baseXp=Math.max(90,Math.round(level*100*.16));
 const baseGold=Math.max(45,Math.round(typeof window.v6168QuestBaseGold==='function'?window.v6168QuestBaseGold(level):(35+level*14+Math.pow(level,1.15)*2.2)));
 return{
  duration:Math.max(135,Math.round(heavyDuration*1.50)),
  xp:Math.max(1,Math.round(baseXp*1.45*1.50)),
  gold:Math.max(1,Math.round(baseGold*1.50*1.50))
 };
}
window.v6238EliteCurve=v6238EliteCurve;

function v6238ApplyEliteCurve(q,level=Number(s.level)||1){
 if(!q||!q.v310Elite)return q;
 const c=v6238EliteCurve(level);
 q.v310SourceRole=q.v310SourceRole||q.v310BaseRole||q.v309Role||'normal';
 q.v310BaseRole='heavy';
 q.v309Role='elite';
 q.v309RoleLabel='🔴 ELITE';
 q.duration=c.duration;
 q.xp=c.xp;
 q.gold=c.gold;
 q.v094BaseXp=q.xp;
 q.v274BaseGold=q.gold;
 q.v316BalancedAtLevel=Math.max(1,Math.floor(Number(level)||1));
 q.v6238EliteBalanced=true;
 q.v6238EliteBalanceLevel=Math.max(1,Math.floor(Number(level)||1));
 return q;
}
window.v6238ApplyEliteCurve=v6238ApplyEliteCurve;

function v310MarkElite(q){
 q.v310Elite=true;
 q.v310SourceRole=q.v309Role||'normal';
 q.v310BaseRole='heavy';
 return v6238ApplyEliteCurve(q,Number(s.level)||1);
}

/* Wrap V4.02 generator. Elite permission exists only during auto-generation after claim. */
const v310BaseMakeQuest=makeQuest;
let v310BatchIndex=0;
makeQuest=function(){
 const q=v310BaseMakeQuest();
 if(v310CompletionOfferWindow){
   const idx=v310BatchIndex%3;
   if(idx===0){
     v310EliteRolledThisBatch=Math.random()<V310_ELITE_CHANCE;
     v310EliteTarget=v310EliteRolledThisBatch?Math.floor(Math.random()*3):-1;
   }
   if(v310EliteRolledThisBatch && idx===v310EliteTarget)v310MarkElite(q);
   v310BatchIndex=(v310BatchIndex+1)%3;
 }else{
   /* Manual rerolls and all other generation paths are always non-elite. */
   delete q.v310Elite;
 }
 return q;
};

/* claimQuest is the only allowed window for automatic post-completion offers. */
const v310BaseClaimQuest=claimQuest;
claimQuest=function(...args){
 const active=s.quests?.active;
 const ready=!!active && Date.now()>=Number(active.ends||0);
 if(!ready)return v310BaseClaimQuest.apply(this,args);

 v310CompletionOfferWindow=true;
 v310BatchIndex=0;
 try{
   const result=v310BaseClaimQuest.apply(this,args);
   const paid=!s.quests?.active;
   if(paid && active.v310Elite){
     /* Guaranteed Elite rewards, added only after successful quest payout. */
     const harz=1+Math.floor(Math.random()*3); /* 1-3 guaranteed */
     s.harzTaler=(Number(s.harzTaler)||0)+harz;
     const item=v310EliteItem();
     s.inventory??=[];
     s.inventory.push(item);
     active.v310EliteHarz=harz;
     active.v310EliteItemName=item.name;
     /* Carry data into V4.02 snapshot's quest copy via the object it captured. */
     window.v310LastEliteReward={questId:active.id,harz,itemName:item.name};
     try{persist(false)}catch(e){}
     try{v282PaintHarzCard()}catch(e){try{v069SyncCurrencies()}catch(_){}}
   }
   return result;
 }finally{
   v310CompletionOfferWindow=false;
   v310EliteRolledThisBatch=false;
   v310EliteTarget=-1;
   v310BatchIndex=0;
 }
};

/* Add Elite guaranteed rewards to the existing reward modal.
   Inventory/Harz deltas are already detected by V4.02; this labels them clearly. */
const v310BaseShowQuestReward=v235ShowQuestReward;
v235ShowQuestReward=function(before){
 const r=v310BaseShowQuestReward.apply(this,arguments);
 if(before?.q?.v310Elite){
   const extra=document.querySelector('#v231QuestRewardExtra');
   const rw=window.v310LastEliteReward;
   if(extra&&rw&&String(rw.questId)===String(before.q.id)){
     const title=document.createElement('div');
     title.className='v233-loot-line';
     title.style.cssText='color:#ff8179;font-weight:1000;border-color:#873535;background:#250d0d';
     title.textContent=`🔴 ELITE-BELOHNUNG GARANTIERT · +${rw.harz} Harz-Taler · Blau bis Episch`;
     extra.insertBefore(title,extra.firstChild);
   }
   window.v310LastEliteReward=null;
 }
 return r;
};

function v310PaintEliteQuests(){
 [...document.querySelectorAll('#questList .quest')].forEach((card,i)=>{
   const q=s.quests?.offers?.[i];
   card.classList.toggle('v310-elite-quest',!!q?.v310Elite);
   card.querySelectorAll('.v310-elite-badge,.v310-elite-reward').forEach(x=>x.remove());
   if(!q?.v310Elite)return;
   const badge=document.createElement('div');
   badge.className='v310-elite-badge';
   badge.textContent='🔴 SELTENE ELITE-QUEST';
   card.insertBefore(badge,card.firstChild);
   const reward=document.createElement('div');
   reward.className='v310-elite-reward';
   reward.textContent='🎁 Garantiert: 1–3 Harz-Taler + gutes Item (Blau bis Episch)';
   const btn=card.querySelector('button');
   if(btn)card.insertBefore(reward,btn);else card.appendChild(reward);
 });
}

/* Final renderer: paint only, never rolls Elite. */
const v310BaseRenderQuests=renderQuests;
renderQuests=function(){
 const r=v310BaseRenderQuests.apply(this,arguments);
 requestAnimationFrame(v310PaintEliteQuests);
 return r;
};
setTimeout(()=>{
 try{requestAnimationFrame(v310PaintEliteQuests)}catch(e){}
 /* V7.151: no third startup full render. */
 const line=document.querySelector('#v141VersionLine');
},300);
