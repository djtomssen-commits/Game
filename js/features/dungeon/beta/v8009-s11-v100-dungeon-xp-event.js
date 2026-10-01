/* ===== V4.02: 2x EXP also applies to dungeon enemies and bosses ===== */

function v100DungeonXp(baseXp){
  const base=Number(baseXp)||0;
  const mult=v094XpEventActive()?2:1;
  return {
    base,
    mult,
    actual:Math.round(base*mult)
  };
}

/* Wrap central addXp only while a dungeon reward is being paid.
   This avoids double-doubling quest EXP. */
let v100DungeonRewardContext=false;
const v100OriginalAddXp=addXp;

addXp=function(amount){
  if(v100DungeonRewardContext){
    const r=v100DungeonXp(amount);
    v100OriginalAddXp(r.actual);

    if(r.mult===2){
      window.v100LastDungeonXpReward=r;
    }else{
      window.v100LastDungeonXpReward=null;
    }
    return;
  }

  return v100OriginalAddXp(amount);
};

/* Detect the real dungeon reward call by wrapping the final dungeon fight installer.
   During victory resolution, any addXp(e.xp) is multiplied here. */
const v100OldInstallFight=v068InstallFight;
v068InstallFight=function(){
  v100OldInstallFight();

  const fightBtn=document.querySelector('#dungeonFightBtn');
  if(!fightBtn || fightBtn.dataset.v100Wrapped==='1')return;
  fightBtn.dataset.v100Wrapped='1';

  const old=fightBtn.onclick;
  if(typeof old==='function'){
    fightBtn.onclick=async function(...args){
      v100DungeonRewardContext=true;
      window.v100LastDungeonXpReward=null;

      try{
        return await old.apply(this,args);
      }finally{
        /* Keep context through synchronous victory payout and immediate microtasks. */
        setTimeout(()=>{
          v100DungeonRewardContext=false;

          const r=window.v100LastDungeonXpReward;
          if(r?.mult===2 && typeof v063Toast==='function'){
            v063Toast(
              '⚡ 2× EXP Event',
              'success',
              `${r.base} EXP ×2 = ${r.actual} EXP im Dungeon`
            );
          }
        },0);
      }
    };
  }
};

/* Fallback: if the current build attaches the fight via addEventListener instead of onclick,
   mark context while a visible dungeon combat button is clicked. */
document.addEventListener('click',e=>{
  const btn=e.target.closest('#dungeonFightBtn,[data-dungeon-fight],.dungeon-fight-btn');
  if(!btn)return;

  v100DungeonRewardContext=true;
  window.v100LastDungeonXpReward=null;

  setTimeout(()=>{
    v100DungeonRewardContext=false;

    const r=window.v100LastDungeonXpReward;
    if(r?.mult===2 && typeof v063Toast==='function'){
      v063Toast(
        '⚡ 2× EXP Event',
        'success',
        `${r.base} EXP ×2 = ${r.actual} EXP im Dungeon`
      );
    }
  },1200);
},true);

/* Visual indicator on dungeon reward text while event is active. */
function v100PaintDungeonXp(){
  document.querySelectorAll('.v100-dungeon-xp2').forEach(x=>x.remove());
  if(!v094XpEventActive())return;

  const root=document.querySelector('#dungeon');
  if(!root)return;

  const leaves=[...root.querySelectorAll('*')].filter(el=>el.children.length===0);

  leaves.forEach(el=>{
    const t=(el.textContent||'').trim();
    if(!/\b(EXP|XP)\b/i.test(t) || !/\d/.test(t))return;

    const m=t.match(/(\d+)\s*(?:EXP|XP)/i) || t.match(/(?:EXP|XP)\s*(\d+)/i);
    if(!m)return;

    const base=Number(m[1])||0;
    if(!base)return;

    const actual=base*2;

    if(/(\d+)\s*(?:EXP|XP)/i.test(t)){
      el.textContent=t.replace(/(\d+)\s*(?:EXP|XP)/i,`${base} EXP → ${actual}`);
    }else{
      el.textContent=t.replace(/(?:EXP|XP)\s*(\d+)/i,`EXP ${base} → ${actual}`);
    }

    const badge=document.createElement('span');
    badge.className='v100-dungeon-xp2';
    badge.textContent='×2';
    el.appendChild(badge);
  });
}

const v100BaseRender=render;
render=function(){
  const r=v100BaseRender();
  /* V6.318: visual XP event decoration may repaint, but the obsolete V068 combat
     installer must never reclaim #fightBtn from the canonical v246 fight owner. */
  if(document.querySelector('#dungeon')?.classList.contains('active'))requestAnimationFrame(v100PaintDungeonXp);
  return r;
};

document.addEventListener('click',e=>{
  if(e.target instanceof Element && e.target.closest('#dungeon,#v247DungeonReward')){
    requestAnimationFrame(v100PaintDungeonXp);
  }
},true);

try{
  v068InstallFight();
  v100PaintDungeonXp();
}catch(e){
  console.error('V4.02 dungeon XP event',e);
}
