
/* ===== V4.02 REAL quest XP event fix =====
   The actual quest completion path is claimQuest(), not finishQuest().
*/
claimQuest=function(){
  const q=s.quests.active;
  if(!q || Date.now()<q.ends)return;

  const bonus=Math.random()<Math.min(.35,.08+totalAttr('glueck')*.01);

  const baseXp=Number(q.v094BaseXp ?? q.xp ?? 0);
  const xpMult=v094XpEventActive()?2:1;
  const actualXp=Math.round(baseXp*xpMult);

  s.gold+=q.gold;
  addXp(actualXp);

  let msg=`Auftrag geschafft: +${actualXp} EXP, +${q.gold} Gold.`;
  if(xpMult===2){
    msg=`Auftrag geschafft: ${baseXp} EXP ×2 = ${actualXp} EXP, +${q.gold} Gold.`;
  }

  /* Keep the existing next-dungeon key logic. */
  try{
    const nextIdx=(s.dungeon?.completed||[]).length;
    if(nextIdx>0 && nextIdx<dungeons.length){
      const d=dungeons[nextIdx];
      const prevDone=(s.dungeon.completed||[]).includes(nextIdx-1);
      const levelOk=s.level>=d.minLevel;
      const alreadyKey=!!s.dungeon.keys?.[nextIdx];

      if(prevDone && levelOk && !alreadyKey){
        const keyChance=Math.min(.30,.08+totalAttr('glueck')*.01);
        if(Math.random()<keyChance){
          s.dungeon.keys[nextIdx]=true;
          msg+=` Schlüsselstein für "${d.name}" gefunden!`;
        }
      }
    }
  }catch(e){
    console.error('V4.02 dungeon key logic',e);
  }

  /* Existing random item reward behavior. */
  if(bonus){
    try{
      const it=makeItem();
      s.inventory.push(it);
      msg+=` Fund: ${it.name}.`;
    }catch(e){}
  }

  s.quests.active=null;
  s.quests.offers=[makeQuest(),makeQuest(),makeQuest()];

  persist(false);
  render();

  if(typeof v063Toast==='function'){
    if(xpMult===2){
      v063Toast(
        '⚡ 2× EXP Event',
        'success',
        `${baseXp} EXP ×2 = ${actualXp} EXP erhalten`
      );
    }else{
      v063Toast('Quest abgeschlossen','success',`${actualXp} EXP erhalten`);
    }
  }else{
    v115Alert(msg);
  }

  log(msg);
};

/* Make active quest card and offers explicitly show base -> doubled value. */
function v099PaintQuestXp(){
  const active=v094XpEventActive();

  document.querySelectorAll('#quests .v099-xp-event').forEach(x=>x.remove());

  if(!active)return;

  /* Quest offers */
  document.querySelectorAll('#questList .quest').forEach((card,i)=>{
    const q=s.quests?.offers?.[i];
    if(!q)return;

    const base=Number(q.v094BaseXp ?? q.xp ?? 0);
    const actual=base*2;

    const spans=[...card.querySelectorAll('.quest-meta span')];
    const xpSpan=spans.find(el=>/\bEXP\b/i.test(el.textContent||''));

    if(xpSpan){
      xpSpan.textContent=`EXP ${base} → ${actual}`;
      const badge=document.createElement('span');
      badge.className='v095-xp2 v099-xp-event';
      badge.textContent='×2';
      xpSpan.appendChild(badge);
    }
  });

  /* Running quest */
  const q=s.quests?.active;
  if(q){
    const base=Number(q.v094BaseXp ?? q.xp ?? 0);
    const actual=base*2;
    const spans=[...document.querySelectorAll('#activeQuest .quest-meta span')];
    const xpSpan=spans.find(el=>/\b(EXP|XP)\b/i.test(el.textContent||''));
    if(xpSpan){
      xpSpan.textContent=`EXP ${base} → ${actual}`;
      const badge=document.createElement('span');
      badge.className='v095-xp2 v099-xp-event';
      badge.textContent='×2';
      xpSpan.appendChild(badge);
    }
  }
}

/* V8.009 Quest consolidation:
   v6344 is the canonical Quest render owner and calls this painter directly.
   Do not wrap global render() or attach a document-wide click repaint here. */
window.v099PaintQuestXp=v099PaintQuestXp;
