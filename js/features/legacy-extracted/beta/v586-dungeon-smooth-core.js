
(function(){
  'use strict';
  if(window.__V586_DUNGEON_SMOOTH__)return;
  window.__V586_DUNGEON_SMOOTH__=true;

  const legacyAnim=window.animClass;
  const legacyPop=window.popDamage;
  const inDungeon=el=>!!el?.closest?.('#dungeonBattleCard,#v209PvpBattleOverlay,#tower,#v111BossScene');

  function lightAnim(el,cl,ms=400){
    if(!el)return;
    el.classList.remove(cl);
    requestAnimationFrame(()=>{
      if(!el.isConnected)return;
      el.classList.add(cl);
      setTimeout(()=>{try{el.classList.remove(cl)}catch(_){ }},ms);
    });
  }

  window.animClass=function(el,cl,ms=400){
    if(inDungeon(el))return lightAnim(el,cl,ms);
    return typeof legacyAnim==='function'?legacyAnim.apply(this,arguments):undefined;
  };
  try{animClass=window.animClass}catch(_){ }

  window.popDamage=function(el,text){
    if(!inDungeon(el))return typeof legacyPop==='function'?legacyPop.apply(this,arguments):undefined;
    if(!el)return;
    el.textContent=text;
    const crit=/!$/.test(String(text||''));
    if(crit)el.classList.add('v252-crit');
    lightAnim(el,'pop',650);
    if(crit)setTimeout(()=>{try{el.classList.remove('v252-crit')}catch(_){ }},700);
  };
  try{popDamage=window.popDamage}catch(_){ }
})();
