
/* ===== V4.02: three clearly different quest choices =====
   Every fresh group contains exactly:
   1) SCHNELL  - shortest, cheapest, lower reward
   2) NORMAL   - balanced
   3) SCHWER   - longest, clearly higher XP/Gold
   Quest names are unique inside each group.
*/
const v309QuestRoles=[
 {id:'quick', label:'⚡ SCHNELL', duration:.62, energy:7, xp:.78, gold:.76},
 {id:'normal',label:'⚔️ NORMAL',  duration:1.00, energy:8, xp:1.00, gold:1.00},
 {id:'heavy', label:'☠️ SCHWER',  duration:1.55, energy:8, xp:1.45, gold:1.50}
];
let v309QuestCursor=0;
let v309BatchNames=new Set();
const v309BaseMakeQuest=makeQuest;

function v309PickTemplate(used){
 const pool=(questTemplates||[]).filter(t=>!used.has(t.name));
 const src=pool.length?pool:questTemplates;
 return src[Math.floor(Math.random()*src.length)];
}
function v309IsServerOffer(q){
 return !!(q&&typeof q==='object'&&(q.v7043ServerOffer||q.v6359ServerOffer||/^srv_q_/.test(String(q.id||''))));
}
function v309ApplyRole(q,roleIndex,usedNames){
 /* V7.130: never mutate canonical server-authoritative offers. Historical
    V4.02 role balancing owns local offers only. */
 if(v309IsServerOffer(q))return q;
 const cfg=v309QuestRoles[Math.max(0,Math.min(2,Number(roleIndex)||0))];
 const used=usedNames||new Set();
 const t=v309PickTemplate(used);
 used.add(t.name);

 const level=Math.max(1,Number(s.level)||1);
 const tier=Math.max(1,Math.min(5,Math.floor(level/12)+1));

 /*
   V4.02 canonical quest curve:
   - Time scales linearly from player level: heavy quest = 6 seconds per level, minimum 90 seconds (L50=5 min, L100=10 min, L150=15 min, L300=30 min).
   - XP is tied to the current level-up requirement (level * 100).
   - Gold has linear + gentle nonlinear growth, so high-level quests stay useful.
   Role multipliers preserve QUICK / NORMAL / HEAVY identity.
 */
 const heavyDuration=Math.max(90,level*6);
 const normalDuration=heavyDuration/1.55;
 const baseXp=Math.max(90,Math.round(level*100*.16));
 const baseGold=Math.max(45,Math.round(typeof window.v6168QuestBaseGold==='function'?window.v6168QuestBaseGold(level):(35+level*14+Math.pow(level,1.15)*2.2)));

 q.id=Date.now()+Math.random();
 q.name=t.name;
 q.icon=t.icon;
 q.text=t.text;
 q.tier=tier;
 q.duration=Math.max(15,Math.round(normalDuration*cfg.duration));
 q.energy=cfg.energy;
 q.xp=Math.max(1,Math.round(baseXp*cfg.xp));
 q.gold=Math.max(1,Math.round(baseGold*cfg.gold));
 q.v094BaseXp=q.xp;
 q.v274BaseGold=q.gold;
 q.v271DampfCost=true;
 q.v309Role=cfg.id;
 q.v309RoleLabel=cfg.label;
 q.v309Distinct=true;
 q.v316BalancedAtLevel=level;
 return q;
}

/* All historical places already create offers as three makeQuest() calls.
   Cycling here upgrades all of them without adding a second quest generator. */
makeQuest=function(){
 const role=v309QuestCursor%3;
 if(role===0)v309BatchNames=new Set();
 const q=v309BaseMakeQuest();
 const out=v309ApplyRole(q,role,v309BatchNames);
 v309QuestCursor=(v309QuestCursor+1)%3;
 return out;
};

/* Upgrade the currently visible pre-V4.02 offers once as well. */
function v309EnsureCurrentOffers(){
 const offers=s.quests?.offers;
 if(!Array.isArray(offers)||offers.length!==3||s.quests?.active)return false;
 /* V7.130: these objects are already balanced and identified by the server.
    Rewriting them here used to randomize their ids and made every preflight
    believe the tapped quest had changed. */
 if(offers.every(v309IsServerOffer))return false;

 const valid=offers.every((q,i)=>q?.v309Distinct && q.v309Role===v309QuestRoles[i].id);
 const unique=new Set(offers.map(q=>q?.name)).size===3;
 if(valid&&unique)return false;

 const used=new Set();
 offers.forEach((q,i)=>v309ApplyRole(q||{},i,used));
 try{persist(false)}catch(e){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}
 return true;
}

function v309PaintQuestRoles(){
 const cards=[...document.querySelectorAll('#questList .quest')];
 cards.forEach((card,i)=>{
   const q=s.quests?.offers?.[i];
   if(!q)return;
   card.querySelectorAll('.v309-quest-role').forEach(x=>x.remove());
   const cfg=v309QuestRoles.find(x=>x.id===q.v309Role)||v309QuestRoles[i]||v309QuestRoles[1];
   const badge=document.createElement('div');
   badge.className=`v309-quest-role v309-role-${cfg.id}`;
   badge.textContent=cfg.label;
   card.insertBefore(badge,card.firstChild);
 });

 const active=s.quests?.active;
 const activeCard=document.querySelector('#activeQuest .quest');
 if(active&&activeCard){
   activeCard.querySelectorAll('.v309-quest-role').forEach(x=>x.remove());
   const cfg=v309QuestRoles.find(x=>x.id===active.v309Role);
   if(cfg){
     const badge=document.createElement('div');
     badge.className=`v309-quest-role v309-role-${cfg.id}`;
     badge.textContent=cfg.label;
     activeCard.insertBefore(badge,activeCard.firstChild);
   }
 }
}

v309EnsureCurrentOffers();

window.v309PrepareQuestRender=v309EnsureCurrentOffers;
window.v309ScheduleQuestRolePaint=()=>requestAnimationFrame(v309PaintQuestRoles);

/* Keep rerolled/new offers visibly different immediately. */
setTimeout(()=>{
 try{v309EnsureCurrentOffers();requestAnimationFrame(v309PaintQuestRoles)}catch(e){}
 /* V7.151: no second startup full render. */
 const line=document.querySelector('#v141VersionLine');
},250);
