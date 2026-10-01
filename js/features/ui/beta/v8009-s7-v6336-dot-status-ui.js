(()=>{
'use strict';
if(window.__V6336_DOT_STATUS_UI__)return;
window.__V6336_DOT_STATUS_UI__=true;

function visibleStage(){
  const qs=['#tower .v6259-battle','#battleStage','#v636QuestDungeonCard .battle-stage','#v636QuestDungeonCard','#v111BossScene','#pvp .v209-battle-stage','#pvp .battle-stage','.v209-battle-stage','.battle-stage'];
  for(const q of qs){const el=document.querySelector(q);if(el&&el.getClientRects().length)return el}
  return null;
}
function enemyHost(stage){
  const qs=['#vTEnemyFighter','#v636QuestEnemyFighter','#enemyFighter','#v209EnemyFighter','.v209-fighter.enemy','.fighter.enemy-side','.v6201-boss-art','.v111-colossus'];
  for(const q of qs){const el=stage?.querySelector?.(q)||document.querySelector(q);if(el&&el.getClientRects().length)return el}
  return null;
}
function ensurePosition(host){if(host&&getComputedStyle(host).position==='static')host.style.position='relative'}
function pop(host,type,tick){
  if(!host||!(Number(tick)>0))return;
  const el=document.createElement('span');
  el.className=`v6336-dot-pop v6336-dot-pop-${type}`;
  el.textContent=type==='curse'?`🌫️ -${Math.max(1,Math.round(tick))}`:`☁️ -${Math.max(1,Math.round(tick))}`;
  host.appendChild(el);setTimeout(()=>el.remove(),900);
}
function syncCurse(stage,st,tick=0){
  stage=stage||visibleStage();const host=enemyHost(stage);if(!host)return;
  ensurePosition(host);
  let badge=host.querySelector(':scope > .v6336-enemy-dot-curse');
  const dot=st?.v6302CurseDot;
  if(dot&&Number(dot.rounds)>0){
    if(!badge){badge=document.createElement('div');badge.className='v6336-enemy-dot v6336-enemy-dot-curse';host.appendChild(badge)}
    const spore=!!host.querySelector(':scope > .v6335-enemy-dot');
    badge.style.setProperty('top',spore?'34px':'4px','important');
    badge.innerHTML=`<b>🌫️ FLUCHNEBEL</b><small>${Math.max(0,Number(dot.rounds)||0)} R. · ${Math.max(1,Math.round(Number(dot.damage)||1))} DOT</small>`;
  }else if(badge){
    if(Number(tick)>0)setTimeout(()=>badge.remove(),650);else badge.remove();
  }
  pop(host,'curse',tick);
}
function syncSmoke(stage,st,tick=0){
  stage=stage||visibleStage();const host=enemyHost(stage);if(!host)return;
  ensurePosition(host);
  let badge=host.querySelector(':scope > .v6336-enemy-dot-smoke');
  const dots=Array.isArray(st?.dot)?st.dot.filter(d=>Number(d?.rounds)>0&&Number(d?.damage)>0):[];
  if(dots.length){
    if(!badge){badge=document.createElement('div');badge.className='v6336-enemy-dot v6336-enemy-dot-smoke';host.appendChild(badge)}
    const rounds=Math.max(...dots.map(d=>Math.max(0,Number(d.rounds)||0)));
    const perTick=dots.reduce((a,d)=>a+Math.max(0,Number(d.damage)||0),0);
    const stacks=dots.length>1?`${dots.length} STAPEL · `:'';
    badge.innerHTML=`<b>☁️ RAUCHSCHADEN</b><small>${stacks}${rounds} R. · ${Math.max(1,Math.round(perTick))} DOT</small>`;
  }else if(badge){
    if(Number(tick)>0)setTimeout(()=>badge.remove(),650);else badge.remove();
  }
  pop(host,'smoke',tick);
}

const prev=typeof window.v318ResolvePlayerAttack==='function'?window.v318ResolvePlayerAttack:(typeof v318ResolvePlayerAttack==='function'?v318ResolvePlayerAttack:null);
if(prev){
  const wrapped=function(st,ctx){
    const r=prev.apply(this,arguments)||{};
    const cls=String((window.s||globalThis.s||{}).playerClass||'');
    if(cls==='summoner'){
      const curseTick=Math.max(0,Number(r.v6302CurseTick)||0);
      setTimeout(()=>syncCurse(visibleStage(),st,curseTick),45);
      document.querySelectorAll('.v6336-enemy-dot-smoke').forEach(n=>n.remove());
    }else if(cls==='bruiser'){
      const smokeTick=Math.max(0,Number(r.v6336SmokeDotTick)||0);
      setTimeout(()=>syncSmoke(visibleStage(),st,smokeTick),45);
      document.querySelectorAll('.v6336-enemy-dot-curse').forEach(n=>n.remove());
    }else{
      document.querySelectorAll('.v6336-enemy-dot-curse,.v6336-enemy-dot-smoke').forEach(n=>n.remove());
    }
    return r;
  };
  try{v318ResolvePlayerAttack=wrapped}catch(_){ }
  window.v318ResolvePlayerAttack=wrapped;
}

window.v6336DotStatusDiagnostics=()=>({
  version:'V6.347',
  curseBadges:document.querySelectorAll('.v6336-enemy-dot-curse').length,
  smokeBadges:document.querySelectorAll('.v6336-enemy-dot-smoke').length,
  sporeBadges:document.querySelectorAll('.v6335-enemy-dot').length,
  dotPops:document.querySelectorAll('.v6336-dot-pop,.v6335-dot-pop').length
});
})();
