
(()=>{
'use strict';
if(window.__V6324_DUNGEON_ENEMY_POSE_FIX__)return;
window.__V6324_DUNGEON_ENEMY_POSE_FIX__=true;
const CLASS_MAP={'säurefalter':'gl-dungeon-pose-saeurefalter'};
const ALL=[...new Set(Object.values(CLASS_MAP))];
const slug=s=>String(s||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').trim();
function apply(){
  const fighter=document.getElementById('enemyFighter');
  const avatar=fighter?.querySelector('.fighter-avatar');
  if(!fighter||!avatar)return false;
  fighter.classList.remove(...ALL);
  const name=(document.getElementById('enemyBattleName')?.textContent||document.getElementById('enemyName')?.textContent||'').trim();
  const cls=CLASS_MAP[slug(name)];if(cls)fighter.classList.add(cls);
  avatar.style.setProperty('background-image','none','important');
  avatar.style.setProperty('background','transparent','important');
  return true;
}
window.v6324DungeonEnemyPoseSync=apply;
window.v6324DungeonEnemyPoseDiagnostics=()=>({version:'V7.156',observerRetired:true,enemyName:(document.getElementById('enemyBattleName')?.textContent||'').trim(),fighterClasses:document.getElementById('enemyFighter')?.className||''});
})();
