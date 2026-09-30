
/* ===== V4.02 Elite hard guarantee + level-scaled Dampf ===== */

/* ---------------- ELITE REWARD: one authoritative transaction guard ---------------- */

function v321FinalizeEliteReward(before){
 const q=s.quests?.active || before?.q;
 /* At this point the paid quest has already vanished from s.quests.active,
    so prefer the original quest object stored by V4.02 when available. */
 const paidQuest=before?.q;
 if(!paidQuest?.v310Elite)return null;

 const liveQuestId=String(paidQuest.id??'');
 const beforeKeys=new Set(Array.isArray(before?.inventory)?before.inventory:[]);
 const inv=Array.isArray(s.inventory)?s.inventory:(s.inventory=[]);

 let eliteItem=inv.find(it=>{
   try{
     return !!it?.v310EliteReward &&
       !beforeKeys.has(v235InventoryKey(it));
   }catch(e){return false}
 });

 /*
   V4.02 normally pays the Elite item. If that layer failed, create the
   guaranteed class item here. v310EliteItem() itself enforces 72% blue /
   28% purple.
 */
 if(!eliteItem){
   eliteItem=v310EliteItem();
   eliteItem.v321EliteQuestId=liveQuestId;
   inv.push(eliteItem);
 }

 let harz=Math.max(
   0,
   Math.floor(
     Number(
       paidQuest.v310EliteHarz ??
       ((window.v310LastEliteReward &&
         String(window.v310LastEliteReward.questId)===liveQuestId)
         ?window.v310LastEliteReward.harz
         :0)
     )||0
   )
 );

 /* If no dedicated Elite Harz transaction is recorded, pay it now. */
 if(harz<1 || harz>3){
   harz=1+Math.floor(Math.random()*3);
   s.harzTaler=(Number(s.harzTaler)||0)+harz;
 }

 paidQuest.v310EliteHarz=harz;
 paidQuest.v310EliteItemName=eliteItem.name;
 paidQuest.v321ElitePaid=true;

 /*
   Existing V4.02 reward-modal decorator reads this payload.
   Re-create it even when V4.02 failed, so the player always sees the
   guaranteed Elite reward clearly.
 */
 window.v310LastEliteReward={
   questId:paidQuest.id,
   harz,
   itemName:eliteItem.name
 };

 try{persist(false)}catch(e){
   try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
 }
 try{v282PaintHarzCard()}catch(e){try{v069SyncCurrencies()}catch(_){}}
 try{renderInventory()}catch(e){}

 return {harz,item:eliteItem};
}
window.v321FinalizeEliteReward=v321FinalizeEliteReward;


/* ---------------- DAMPF COST: level + quest role ----------------

   Agreed curve:
   Lv 1–49     Schnell 5 / Normal 6 / Schwer 7
   Lv 50–99    Schnell 7 / Normal 8 / Schwer 9
   Lv 100–149  Schnell 9 / Normal 10 / Schwer 11
   Lv 150–199  Schnell 11 / Normal 12 / Schwer 13
   Lv 200–249  Schnell 13 / Normal 14 / Schwer 15
   Lv 250–299  Schnell 15 / Normal 16 / Schwer 17
   Lv 300+     Schnell 17 / Normal 18 / Schwer 20

   Elite keeps the Dampf price of its original Quick/Normal/Heavy role.
*/

const V321_DAMPF_BANDS=[
 {min:1,  max:49,      quick:5, normal:6, heavy:7},
 {min:50, max:99,      quick:7, normal:8, heavy:9},
 {min:100,max:149,     quick:9, normal:10,heavy:11},
 {min:150,max:199,     quick:11,normal:12,heavy:13},
 {min:200,max:249,     quick:13,normal:14,heavy:15},
 {min:250,max:299,     quick:15,normal:16,heavy:17},
 {min:300,max:Infinity,quick:17,normal:18,heavy:20}
];

function v321QuestRole(q){
 if(q?.v310Elite)return q.v310BaseRole||'normal';
 const role=String(q?.v309Role||'normal');
 return ['quick','normal','heavy'].includes(role)?role:'normal';
}

function v321QuestDampfBase(q,level=Number(s.level)||1){
 level=Math.max(1,Math.floor(Number(level)||1));
 const band=V321_DAMPF_BANDS.find(x=>level>=x.min&&level<=x.max)||V321_DAMPF_BANDS[0];
 return Math.max(1,Math.floor(Number(band[v321QuestRole(q)]||band.normal)));
}
window.v321QuestDampfBase=v321QuestDampfBase;

/*
  Offers always show their level-scaled BASE cost.
  Active quests are not rewritten after they start.
*/
v271NormalizeQuestOffers=function(){
 if(!Array.isArray(s.quests?.offers))return;
 const level=Math.max(1,Math.floor(Number(s.level)||1));
 s.quests.offers.forEach(q=>{
   if(!q)return;
   const base=v321QuestDampfBase(q,level);
   q.energy=base;
   q.v271DampfCost=true;
   q.v321DampfBase=base;
   q.v321DampfLevel=level;
 });
};

/*
  Correct final-remainder rule:
  - If current Dampf is LESS than the quest cost -> quest cannot start.
  - If paying the quest would leave only 1–6 unusable Dampf -> consume
    the remainder too.
  - Otherwise charge exactly the level/role cost.
*/
v271EffectiveQuestCost=function(q){
 const current=Math.max(0,Math.floor(Number(s.energy)||0));
 if(current<=0)return 0;

 const base=Math.max(1,Math.floor(Number(q?.v321DampfBase ?? v321QuestDampfBase(q))||1));
 if(current<base)return 0;

 const rest=current-base;
 if(rest>=1 && rest<=6)return current;
 return base;
};

/* Re-own the final quest start path so every historical wrapper receives the
   exact actual cost (important for daily Harz / 100-Dampf tracking). */
const v321BaseStartQuest=window.startQuest;
window.startQuest=function(i){
 v271NormalizeQuestOffers();
 const q=s.quests?.offers?.[i];
 if(!q)return v321BaseStartQuest(i);

 const base=v321QuestDampfBase(q);
 q.energy=base;
 q.v321DampfBase=base;

 const cost=v271EffectiveQuestCost(q);
 if(cost<=0){
   return v115Alert(
     `Für diese ${v321QuestRole(q)==='heavy'?'schwere':v321QuestRole(q)==='quick'?'schnelle':'normale'} Quest brauchst du ${base} Dampf.`,
     'Nicht genug Dampf',
     'warn'
   );
 }

 q.energy=cost;
 q.v271ActualDampfCost=cost;
 window.v109PendingQuestEnergy=cost;
 return v321BaseStartQuest(i);
};

/* Final display layer: exact cost + level band on each offer. */
const v321BaseRenderQuests=renderQuests;
renderQuests=function(){
 v271NormalizeQuestOffers();
 const r=v321BaseRenderQuests.apply(this,arguments);

 const energy=Math.max(0,Math.floor(Number(s.energy)||0));
 [...document.querySelectorAll('#questList .quest')].forEach((card,i)=>{
   const q=s.quests?.offers?.[i];
   if(!q)return;

   card.querySelectorAll('.v321-dampf-level').forEach(x=>x.remove());

   const base=v321QuestDampfBase(q);
   const actual=v271EffectiveQuestCost(q);
   const meta=[...card.querySelectorAll('.quest-meta span')]
     .find(x=>/💨|⚡|Dampf/i.test(x.textContent||''));

   if(meta)meta.textContent=`💨 ${actual||base} Dampf`;

   const info=document.createElement('div');
   info.className='v321-dampf-level';
   const role=v321QuestRole(q);
   info.textContent=
     `Dampfkosten Lv. ${Math.max(1,Number(s.level)||1)} · `+
     `${role==='quick'?'Schnell':role==='heavy'?'Schwer':'Normal'}: ${base}`+
     (actual>base?` · Restverbrauch: ${actual}`:'');
   const btn=card.querySelector('button');
   if(btn){
     card.insertBefore(info,btn);
     btn.disabled=!!s.quests?.active || energy<base;
   }else card.appendChild(info);
 });

 requestAnimationFrame(()=>{
   try{v310PaintEliteQuests()}catch(e){}
 });

 return r;
};

/* Also set the canonical base cost while V4.02 balances a quest object. */
const v321BaseBalanceQuest=v316BalanceQuest;
v316BalanceQuest=function(q,level=Number(s.level)||1){
 const r=v321BaseBalanceQuest(q,level);
 if(r){
   r.energy=v321QuestDampfBase(r,level);
   r.v321DampfBase=r.energy;
   r.v321DampfLevel=Math.max(1,Math.floor(Number(level)||1));
 }
 return r;
};

/* Stronger Elite preview wording: no ambiguity about the guarantee. */
const v321BasePaintElite=v310PaintEliteQuests;
v310PaintEliteQuests=function(){
 const r=v321BasePaintElite.apply(this,arguments);
 [...document.querySelectorAll('#questList .quest')].forEach((card,i)=>{
   const q=s.quests?.offers?.[i];
   if(!q?.v310Elite)return;
   const reward=card.querySelector('.v310-elite-reward');
   if(reward){
     reward.innerHTML='🎁 <b>GARANTIERT:</b> 1–3 Harz-Taler + 1 Klassenitem · 72 % Rare (Blau) / 28 % Episch (Lila)';
   }
 });
 return r;
};

const v321BaseRender=render;
render=function(){
 const r=v321BaseRender();
 try{v271NormalizeQuestOffers()}catch(e){}
 
 const line=document.querySelector('#v141VersionLine');
 return r;
};

setTimeout(()=>{
 try{
   v271NormalizeQuestOffers();
   renderQuests();
 }catch(e){console.error('V4.02 quest init',e)}
},420);
