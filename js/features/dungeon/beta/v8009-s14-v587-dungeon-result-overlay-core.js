(function(){
  'use strict';
  if(window.__V587_DUNGEON_RESULT_OVERLAY__)return;
  window.__V587_DUNGEON_RESULT_OVERLAY__=true;

  function esc(v){return String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

  window.v587ShowDungeonDefeat=function(data){
    const overlay=(typeof window.v247EnsureDungeonReward==='function')
      ? window.v247EnsureDungeonReward()
      : (typeof v247EnsureDungeonReward==='function'?v247EnsureDungeonReward():null);
    if(!overlay)return;

    overlay.classList.add('v587-defeat');
    const icon=overlay.querySelector('.v231-quest-icon');
    const title=overlay.querySelector('.v231-quest-title');
    const name=overlay.querySelector('#v247DungeonRewardName');
    const xp=overlay.querySelector('#v247DungeonRewardXp');
    const gold=overlay.querySelector('#v247DungeonRewardGold');
    const extra=overlay.querySelector('#v247DungeonRewardExtra');
    const ok=overlay.querySelector('#v247DungeonRewardOk');

    if(icon)icon.textContent='💀';
    if(title)title.textContent='NIEDERLAGE';
    const enemyName=data?.enemy?.name||'Dungeon-Gegner';
    if(name)name.textContent=`${enemyName} · Dungeon ${Number(data?.dungeonIndex||0)+1}`;
    if(xp)xp.textContent='+0';
    if(gold)gold.textContent='+0';
    if(extra)extra.innerHTML=`<div class="v247-dungeon-line">Der Gegner war zu stark. Verbessere Attribute oder Ausrüstung und versuche es erneut.</div>`;

    if(ok){
      ok.textContent='Zurück zur Dungeon-Karte';
      ok.onclick=()=>{
        overlay.classList.remove('show','v587-defeat');
        try{
          s.dungeon.layer='dungeon';
          s.dungeon.view='map';
          const loot=document.querySelector('#loot');
          if(loot)loot.innerHTML='';
          persist(false);
          if(typeof renderDungeon==='function')renderDungeon();
          else if(typeof v244RenderSelectedDungeonMap==='function')v244RenderSelectedDungeonMap();
          window.scrollTo({top:0,behavior:'smooth'});
        }catch(e){console.error('V5.87 Zurück zur Dungeon-Karte',e)}
      };
    }

    overlay.classList.add('show');
    requestAnimationFrame(()=>overlay.classList.add('show'));
  };

  /* v247ShowDungeonReward directly clears defeat state; no reward wrapper needed. */
})();
