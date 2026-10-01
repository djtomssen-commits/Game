/* V4.02: robust 2x EXP payout.
   The previous V4.02 finishQuest override was later shadowed by another
   quest completion path. We now apply the multiplier at the central XP
   state change, but ONLY while a quest reward is being paid. */
let v098QuestRewardPaying=false;

function v098AddQuestXp(baseXp){
  const base=Number(baseXp)||0;
  const mult=v094XpEventActive()?2:1;
  const actual=Math.round(base*mult);
  s.xp+=actual;
  return {base,actual,mult};
}

/* Final quest completion override — placed last in the file deliberately. */
finishQuest=function(){
  const q=s.quest.active;
  if(!q)return;

  const baseXp=Number(q.v094BaseXp ?? q.xp ?? 0);
  const result=v098AddQuestXp(baseXp);

  s.gold+=Number(q.gold)||0;
  s.quest.active=null;

  if(Math.random()<0.1){
    const locked=dungeons.map((d,i)=>i).filter(i=>!isDungeonUnlocked(i));
    if(locked.length){
      const idx=locked[Math.floor(Math.random()*locked.length)];
      s.dungeon.keys[idx]=true;
      log(`Du hast beim Questen einen Schlüsselstein für "${dungeons[idx].name}" gefunden!`);
    }
  }

  log(`Quest abgeschlossen: +${q.gold} Gold, +${result.actual} EXP${result.mult===2?` (2× Event; Basis ${result.base})`:''}.`);

  if(Math.random()<0.32){
    const it=makeItem();
    s.inventory.push(it);
    log(`Fund: ${it.name}`);
  }

  save();
  render();

  if(typeof v063Toast==='function'){
    if(result.mult===2){
      v063Toast('⚡ 2× EXP Event','success',`${result.base} EXP → ${result.actual} EXP erhalten`);
    }else{
      v063Toast('Quest abgeschlossen','success',`${result.actual} EXP erhalten`);
    }
  }
};

/* Quest preview: never silently replace the base number.
   Show base → actual so payout can be verified before starting. */
function v098QuestPreview(){
  document.querySelectorAll('.v098-xp-preview').forEach(x=>x.remove());
  if(!v094XpEventActive())return;

  document.querySelectorAll('#questList .quest-card').forEach((card,i)=>{
    const q=s.quest?.options?.[i];
    if(!q)return;
    const base=Number(q.v094BaseXp ?? q.xp ?? 0);
    const actual=base*2;

    const leaves=[...card.querySelectorAll('*')].filter(el=>el.children.length===0);
    const reward=leaves.find(el=>{
      const t=(el.textContent||'').trim();
      return /\bEXP\b/i.test(t) && /\d/.test(t);
    });
    if(!reward)return;

    /* Normalize whatever V4.02/97 painted. */
    reward.textContent=`EXP ${base} → ${actual}`;

    const badge=document.createElement('span');
    badge.className='v095-xp2 v098-xp-preview';
    badge.textContent='×2';
    reward.appendChild(badge);
  });
}

const v098BaseRender=render;
render=function(){
  v098BaseRender();
  
  requestAnimationFrame(v098QuestPreview);
};

document.addEventListener('click',()=>setTimeout(v098QuestPreview,40),true);
