(()=>{
'use strict';
if(window.__V6300_TOWER_ENEMY_IMAGE_FIX__)return;
window.__V6300_TOWER_ENEMY_IMAGE_FIX__=true;

function cleanName(v){
  return String(v||'')
    .toLowerCase()
    .replace(/ä/g,'ae')
    .replace(/ö/g,'oe')
    .replace(/ü/g,'ue')
    .replace(/ß/g,'ss');
}

/* Nutzt nur bereits vorhandene Spielassets.
   Dungeon 2 enthält genau diese beiden Gegner als reguläre Vollbilder. */
function canonicalTowerEnemyArt(name){
  const n=cleanName(name);
  try{
    if(n.includes('milbenkrieger')){
      return typeof towerAsset==='function'
        ? towerAsset('v474_dungeon_assets/d2_5.png')
        : 'v474_dungeon_assets/d2_5.png';
    }
    if(n.includes('trauermuecke')){
      return typeof towerAsset==='function'
        ? towerAsset('v474_dungeon_assets/d2_9.png')
        : 'v474_dungeon_assets/d2_9.png';
    }
  }catch(_){}
  return '';
}
window.v6300CanonicalTowerEnemyArt=canonicalTowerEnemyArt;

function state(){
  try{return typeof s!=='undefined'?s:window.s||null}
  catch(_){return window.s||null}
}

function repairCurrentEnemy(){
  const st=state();
  const enemy=st?.tower?.run?.enemy;
  if(!enemy)return false;

  const fixed=canonicalTowerEnemyArt(enemy.name);
  if(!fixed)return false;

  const old=String(enemy.art||'');
  if(old!==fixed){
    enemy.art=fixed;
    try{
      if(typeof saveLocal==='function')saveLocal();
      else localStorage.setItem(KEY,JSON.stringify(st));
    }catch(_){}
  }

  const img=document.querySelector('#tower #vTEnemyFighter img');
  if(img){
    const current=String(img.getAttribute('src')||'');
    if(current!==fixed)img.src=fixed;
    img.style.setProperty('width','auto','important');
    img.style.setProperty('object-fit','contain','important');
    img.style.setProperty('object-position','center bottom','important');
  }

  const prep=document.querySelector('#tower .v6259-prep-enemy');
  if(prep && String(prep.getAttribute('src')||'')!==fixed)prep.src=fixed;

  return old!==fixed;
}
window.v6300RepairCurrentTowerEnemy=repairCurrentEnemy;

/* Future enemies: apply the canonical art immediately after creation. */
try{
  if(typeof makeEnemy==='function'&&!window.__v6300MakeEnemyWrapped){
    const base=makeEnemy;
    const wrapped=function(){
      const enemy=base.apply(this,arguments);
      if(enemy){
        const fixed=canonicalTowerEnemyArt(enemy.name);
        if(fixed)enemy.art=fixed;
      }
      return enemy;
    };
    try{makeEnemy=wrapped}catch(_){}
    window.makeEnemy=wrapped;
    window.__v6300MakeEnemyWrapped=true;
  }
}catch(e){console.warn('V6.300 makeEnemy image fix',e)}

/* Aktiver alter Run + neu gerenderte Kampfansicht reparieren. */
try{
  if(typeof render==='function'&&!window.__v6300RenderWrapped){
    const base=render;
    const wrapped=function(){
      repairCurrentEnemy();
      const r=base.apply(this,arguments);
      requestAnimationFrame(repairCurrentEnemy);
      return r;
    };
    try{render=wrapped}catch(_){}
    window.render=wrapped;
    window.__v6300RenderWrapped=true;
  }
}catch(e){console.warn('V6.300 render image fix',e)}

document.addEventListener('click',e=>{
  const hit=e.target instanceof Element
    ? e.target.closest('[data-screen="tower"],[data-go="tower"],[data-vt-fight],[data-vt-route]')
    : null;
  if(hit)setTimeout(repairCurrentEnemy,60);
},true);

window.addEventListener('growlegends:account-ready',repairCurrentEnemy,{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='tower')repairCurrentEnemy()},{passive:true});

window.v6300TowerEnemyDiagnostics=()=>({
  version:'V6.300',
  enemy:String(state()?.tower?.run?.enemy?.name||''),
  savedArt:String(state()?.tower?.run?.enemy?.art||''),
  canonicalArt:canonicalTowerEnemyArt(state()?.tower?.run?.enemy?.name),
  visibleSrc:String(document.querySelector('#tower #vTEnemyFighter img')?.getAttribute('src')||'')
});
})();
