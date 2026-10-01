/* ===== V4.02 first real event: 2x EXP =====
   An active event whose name contains "EXP" or "Erfahrung"
   activates double quest EXP for all players.
*/
function v094XpEventActive(){
  const now=Date.now();
  return (v093Events||[]).some(ev=>{
    if(!ev?.is_active)return false;
    const start=ev.starts_at?new Date(ev.starts_at).getTime():0;
    const end=ev.ends_at?new Date(ev.ends_at).getTime():Infinity;
    const name=String(ev.name||'').toLowerCase();
    const typeMatches=name.includes('exp') || name.includes('erfahrung');
    return typeMatches && now>=start && now<=end;
  });
}

function v094XpMultiplier(){
  return v094XpEventActive()?2:1;
}

/* Quest rewards are generated in questPool(). Mark base EXP once.
   The actual payout is doubled at claim time, so an event can start/end
   even while a quest is already running. */
if(typeof questPool==='function'){
 const v094OldQuestPool=questPool;
 questPool=function(){
  const list=v094OldQuestPool();
  return (list||[]).map(q=>({
    ...q,
    v094BaseXp:Number(q.v094BaseXp ?? q.xp ?? 0)
  }));
 };
}

/* Override quest finish with the current event multiplier.
   Keeps the existing gold, key stone, drops and energy logic. */
finishQuest=function(){
  const q=s.quest.active;
  if(!q)return;

  const baseXp=Number(q.v094BaseXp ?? q.xp ?? 0);
  const mult=v094XpMultiplier();
  const awardedXp=Math.round(baseXp*mult);

  s.gold+=q.gold;
  s.xp+=awardedXp;
  s.quest.active=null;

  if(Math.random()<0.1){
    const locked=dungeons.map((d,i)=>i).filter(i=>!isDungeonUnlocked(i));
    if(locked.length){
      const idx=locked[Math.floor(Math.random()*locked.length)];
      s.dungeon.keys[idx]=true;
      log(`Du hast beim Questen einen Schlüsselstein für "${dungeons[idx].name}" gefunden!`);
    }
  }

  log(`Quest abgeschlossen: +${q.gold} Gold, +${awardedXp} XP${mult>1?' (2× EXP EVENT!)':''}.`);

  if(Math.random()<0.32){
    const it=makeItem();
    s.inventory.push(it);
    log(`Fund: ${it.name}`);
  }

  save();
  render();

  if(mult>1 && typeof v063Toast==='function'){
    v063Toast('2× EXP Event!','success',`+${awardedXp} Erfahrung statt ${baseXp}`);
  }
};

/* Make active event card explicitly show the gameplay bonus. */
const v094OldActiveEvents=v085ActiveEvents;
v085ActiveEvents=function(){
  const base=v094OldActiveEvents();
  if(!v094XpEventActive())return base;

  return base.replace(
    /(<div class="v085-event-status">AKTIV<\/div>)/g,
    '$1<div class="v094-event-bonus v094-xp-active">⚡ 2× ERFAHRUNG AKTIV</div>'
  );
};

const v094BaseRender=render;
render=function(){
  v094BaseRender();
  

  /* Update visible quest XP previews to show doubled amount while event is live. */
  if(v094XpEventActive()){
    document.querySelectorAll('#questList .quest-card').forEach((card,i)=>{
      const q=s.quest?.options?.[i];
      if(!q)return;
      const xp=Number(q.v094BaseXp ?? q.xp ?? 0)*2;
      const nodes=[...card.querySelectorAll('*')].filter(el=>el.children.length===0);
      nodes.forEach(el=>{
        const t=(el.textContent||'').trim();
        if(/^\+\d+\s*XP$/i.test(t))el.textContent=`+${xp} XP · 2× EVENT`;
      });
    });
  }
};
