/* V4.02: quests display XP as a star icon + number, so decorate that exact UI. */
function v096DecorateQuestXp(){
  document.querySelectorAll('.v096-quest-xp2').forEach(x=>x.remove());
  if(!v094XpEventActive())return;

  document.querySelectorAll('#questList .quest-card').forEach((card,i)=>{
    const q=s.quest?.options?.[i];
    if(!q)return;

    const base=Number(q.v094BaseXp ?? q.xp ?? 0);
    const doubled=base*2;

    /* Find the leaf containing the star reward and its XP number. */
    const leaves=[...card.querySelectorAll('*')].filter(el=>el.children.length===0);
    let reward=leaves.find(el=>{
      const t=(el.textContent||'').trim();
      return (t.includes('⭐') || t.includes('★') || t.includes('☆')) &&
             /\d/.test(t);
    });

    if(!reward){
      /* Fallback: find text that contains the original XP number. */
      reward=leaves.find(el=>{
        const t=(el.textContent||'').trim();
        return t.includes(String(base)) && !/Gold|💰/i.test(t);
      });
    }

    if(!reward)return;

    /* Replace only the displayed XP number where possible. */
    const original=reward.textContent;
    if(original.includes(String(base))){
      reward.textContent=original.replace(String(base),String(doubled));
    }

    const badge=document.createElement('span');
    badge.className='v096-quest-xp2';
    badge.textContent='×2 EXP';
    reward.appendChild(badge);
  });
}

const v096BaseRender=render;
render=function(){
  v096BaseRender();
  
  requestAnimationFrame(v096DecorateQuestXp);
};

document.addEventListener('click',()=>setTimeout(v096DecorateQuestXp,30),true);
try{v096DecorateQuestXp()}catch(e){}
