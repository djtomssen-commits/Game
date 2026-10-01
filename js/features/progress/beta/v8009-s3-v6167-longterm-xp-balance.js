(()=>{
'use strict';
if(window.__V6167_LONGTERM_XP__)return;window.__V6167_LONGTERM_XP__=true;
const MAX=300, DIVISOR=57;
/*
  Zielkorridor aus der kompletten aktuellen Ökonomie:
  - Casual: ca. 12-15 Monate
  - normal aktiv: ca. 9-12 Monate
  - sehr aktiv: ca. 6-8 Monate

  Wichtig: Es gibt KEIN Tages-XP-Limit und KEIN Activity-Cap.
  Mehr Dampf / PvP / Dungeons / Events bleiben echte Mehrleistung.
  Die steigende Levelanforderung sorgt nur dafür, dass 150-300 langfristig bleibt.
*/
function needFor(level){
  const lv=Math.max(1,Math.min(MAX,Math.floor(Number(level)||1)));
  if(lv>=MAX)return 0;
  return Math.max(100,Math.round((100*lv*(1+lv/DIVISOR))/10)*10);
}
window.v6167XpNeedFor=needFor;
/* Final global owner. Core addXp resolves xpNeed dynamically, therefore every
   historical source and modifier automatically uses the same requirement. */
try{
  xpNeed=function(){return Number(s?.level)>=MAX?0:needFor(s?.level)};
  window.xpNeed=xpNeed;
}catch(e){console.warn('V4.167 xpNeed install',e)}

function paint(){
  try{
    const lv=Math.max(1,Math.min(MAX,Math.floor(Number(s?.level)||1)));
    if(lv>=MAX){
      if(Number(s.xp)!==0)s.xp=0;
      const t=document.querySelector('#centerXpText');if(t)t.textContent='MAX LEVEL · 300';
      const f=document.querySelector('#centerXpFill');if(f)f.style.width='100%';
      const x=document.querySelector('#xp');if(x)x.textContent='MAX';
      return;
    }
    const need=needFor(lv),cur=Math.max(0,Number(s?.xp)||0),pct=Math.max(0,Math.min(100,cur/need*100));
    const t=document.querySelector('#centerXpText');if(t)t.textContent=`${Math.round(cur).toLocaleString('de-DE')} / ${need.toLocaleString('de-DE')}`;
    const f=document.querySelector('#centerXpFill');if(f)f.style.width=pct+'%';
    const x=document.querySelector('#xp');if(x)x.textContent=`${Math.round(cur)}/${need}`;
  }catch(e){}
}

/* Existing render chain owns every other UI system. We only repaint XP after it. */
try{
  if(typeof render==='function'&&!render.__v6167XpPaint){
    const base=render;
    const wrapped=function(){const r=base.apply(this,arguments);paint();return r};
    wrapped.__v6167XpPaint=true;render=wrapped;window.render=wrapped;
  }
}catch(e){console.warn('V4.167 render paint',e)}

/* QA/simulation only; it never changes player state. The daily coefficients model
   the present mix of quest, dungeon, PvP and side rewards, not a hard cap. */
function projectedDays(coeff){
  coeff=Math.max(1,Number(coeff)||330);
  let days=0;
  for(let lv=1;lv<MAX;lv++)days+=needFor(lv)/(coeff*lv);
  return Math.round(days);
}
window.v6167XpBalanceQA=()=>({
  divisor:DIVISOR,
  requirements:{L1:needFor(1),L25:needFor(25),L50:needFor(50),L80:needFor(80),L100:needFor(100),L150:needFor(150),L200:needFor(200),L250:needFor(250),L299:needFor(299)},
  targetDays:{casual:projectedDays(250),normal:projectedDays(330),veryActive:projectedDays(500)},
  noDailyCap:true,
  loginXpDecoupled:true,
  growContractXpDecoupled:true
});
paint();
document.addEventListener('DOMContentLoaded',paint,{once:true});
window.addEventListener('pageshow',paint,{passive:true});
window.addEventListener('growlegends:account-ready',paint,{passive:true});
})();
