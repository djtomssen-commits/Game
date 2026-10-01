/* ===== V4.02 Dungeon event rewards + Gold marker scope =====
   - EXP event doubles actual dungeon XP.
   - Gold event doubles actual dungeon Gold.
   - Reward modal shows the doubled amounts.
   - Gold x2 marker is limited to reward displays, never costs such as
     "Neue Aufträge – 10 Gold".
*/

/* Decorate the dungeon reward modal only when the corresponding reward
   was actually doubled. */
if(typeof v247ShowDungeonReward==='function'){
  const v286BaseShowDungeonReward=v247ShowDungeonReward;
  v247ShowDungeonReward=function(data){
    const r=v286BaseShowDungeonReward(data);

    try{
      const overlay=document.querySelector('#v247DungeonReward');
      if(!overlay)return r;

      overlay.querySelectorAll('.v286-event-x2').forEach(x=>x.remove());

      const xp=overlay.querySelector('#v247DungeonRewardXp');
      const gold=overlay.querySelector('#v247DungeonRewardGold');

      if(
        xp &&
        typeof v094XpEventActive==='function' &&
        v094XpEventActive() &&
        Number(data?.xp)>Number(data?.baseXp)
      ){
        const badge=document.createElement('span');
        badge.className='v286-event-x2';
        badge.textContent='×2';
        xp.appendChild(badge);
      }

      if(
        gold &&
        typeof v274GoldEventActive==='function' &&
        v274GoldEventActive() &&
        Number(data?.gold)>Number(data?.baseGold)
      ){
        const badge=document.createElement('span');
        badge.className='v286-event-x2';
        badge.textContent='×2';
        gold.appendChild(badge);
      }
    }catch(e){}

    return r;
  };
}

/* Replace the broad V4.02 Gold text walker.
   x2 is an EVENT REWARD marker, not a generic marker for every word "Gold".
   This prevents false x2 labels on reroll costs, shop prices, etc. */
v276DecorateGold=function(){
  document.querySelectorAll('.v276-gold2').forEach(el=>el.remove());
  document.querySelectorAll('.v276-gold-text-active')
    .forEach(el=>el.classList.remove('v276-gold-text-active'));

  if(!v274GoldEventActive()){
    try{v277PrepareResourceCards()}catch(e){}
    return;
  }

  /* Top resource card: one event indicator. */
  const topGold=document.querySelector('#gold');
  if(topGold){
    topGold.classList.add('v276-gold-text-active');
    const badge=document.createElement('span');
    badge.className='v276-gold2';
    badge.textContent='×2';
    badge.title='2× Gold-Event aktiv';
    topGold.appendChild(badge);
  }

  /* Quest offers: reward Gold only. */
  document.querySelectorAll('#questList .quest').forEach((card,i)=>{
    const q=s.quests?.offers?.[i];
    if(!q)return;

    const base=Math.max(0,Number(q.v274BaseGold ?? q.gold)||0);
    q.v274BaseGold=base;

    const reward=[...card.querySelectorAll('.quest-meta span')]
      .find(el=>/💰|Gold/i.test(el.textContent||''));

    if(reward){
      reward.textContent=`💰 ${base*2} Gold`;
      reward.classList.add('v276-gold-text-active');

      const badge=document.createElement('span');
      badge.className='v276-gold2';
      badge.textContent='×2';
      badge.title='2× Gold-Event Belohnung';
      reward.appendChild(badge);
    }
  });

  /* Active/completed quest reward areas may contain Gold reward text.
     Buttons and costs are deliberately excluded. */
  document.querySelectorAll(
    '#activeQuest .quest-meta span,#v231QuestReward .v231-reward-value'
  ).forEach(el=>{
    if(!/Gold|💰/i.test(el.textContent||''))return;
    if(el.closest('button'))return;
    el.classList.add('v276-gold-text-active');
    if(!el.querySelector(':scope > .v276-gold2')){
      const badge=document.createElement('span');
      badge.className='v276-gold2';
      badge.textContent='×2';
      el.appendChild(badge);
    }
  });

  try{v277PrepareResourceCards()}catch(e){}
};

/* Keep quest decorator consistent with the scoped Gold rule. */
v276DecorateQuestGold=function(){
  if(!v274GoldEventActive())return;

  document.querySelectorAll('#questList .quest').forEach((card,i)=>{
    const q=s.quests?.offers?.[i];
    if(!q)return;

    const base=Math.max(0,Number(q.v274BaseGold ?? q.gold)||0);
    q.v274BaseGold=base;

    const gold=[...card.querySelectorAll('.quest-meta span')]
      .find(el=>/💰|Gold/i.test(el.textContent||''));

    if(gold){
      gold.textContent=`💰 ${base*2} Gold`;
      gold.classList.add('v276-gold-text-active');

      const badge=document.createElement('span');
      badge.className='v276-gold2';
      badge.textContent='×2';
      badge.title='2× Gold-Event Belohnung';
      gold.appendChild(badge);
    }
  });
};

/* Rebind the V4.02 fight owner once so the patched payout code is active
   immediately on the current dungeon screen. */
try{
  if(typeof v246InstallFight==='function')v246InstallFight();
}catch(e){}

const v286BaseRender=render;
render=function(){
  const r=v286BaseRender();

  requestAnimationFrame(()=>{
    try{v276DecorateGold()}catch(e){}
  });

  
  const line=document.querySelector('#v141VersionLine');

  return r;
};


const v286Line=document.querySelector('#v141VersionLine');
