
function v101ShowLevelUp(oldLevel,newLevel,skillGain){
  document.querySelectorAll('.v101-levelup').forEach(x=>x.remove());

  const box=document.createElement('div');
  box.className='v101-levelup';
  box.innerHTML=`
    <div class="v101-levelup-title">LEVEL UP!</div>
    <div class="v101-levelup-level">Level ${oldLevel} → ${newLevel}</div>
    <div class="v101-levelup-sub">+${skillGain} Skillpunkt${skillGain===1?'':'e'}</div>
  `;
  document.body.appendChild(box);
  setTimeout(()=>box.remove(),3400);
}

/* Wrap the central XP function so every source can trigger the notification. */
const v101OriginalAddXp=addXp;
addXp=function(n){
  const oldLevel=Number(s.level)||1;
  const oldSkills=Number(s.skillPoints ?? s.skill ?? 0)||0;

  const result=v101OriginalAddXp(n);

  const newLevel=Number(s.level)||1;
  const newSkills=Number(s.skillPoints ?? s.skill ?? 0)||0;

  if(newLevel>oldLevel){
    const gain=Math.max(1,newSkills-oldSkills || (newLevel-oldLevel));
    v101ShowLevelUp(oldLevel,newLevel,gain);

    if(typeof v063Toast==='function'){
      v063Toast('🎉 Level Up!','success',`Du bist jetzt Level ${newLevel}.`);
    }
  }

  return result;
};

/* V7.113: retired pure pass-through render wrapper (V101). */
