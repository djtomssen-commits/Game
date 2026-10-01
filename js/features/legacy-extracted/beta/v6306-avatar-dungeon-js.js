
(()=>{
'use strict';
if(window.__V6306_FIX__)return;
window.__V6306_FIX__=true;
function run(){
  const player=document.querySelector('#playerFighter');
  const name=player?.querySelector('.fighter-name');
  if(name){const txt=name.textContent||'';if(/Beschwörerin|Nebel|Harz und Knochen/i.test(txt)){const lvl=(txt.match(/Lv\.\s*\d+/i)||['Lv. 1'])[0];name.textContent='Du · '+lvl}}
  try{
    const stage=document.getElementById('battleStage');
    const title=document.getElementById('enemyName')?.textContent||'';
    if(stage&&/Raum 1|Dungeon 1|Trauermücken/i.test(title)&&!stage.querySelector('.dungeon-scene,.gl-dungeon-bg,[style*="background"]'))stage.classList.add('v6306-dungeon-bg');
  }catch(_){ }
  return true;
}
window.v6306DungeonVisualSync=run;
window.v6306FixQA=()=>({eventLoopsRetired:true,dungeon1Fallback:!!document.getElementById('battleStage')?.classList.contains('v6306-dungeon-bg')});
})();
