
(function(){
 'use strict';
 if(window.__V637_QUEST_EXACT_DUNGEON__)return;window.__V637_QUEST_EXACT_DUNGEON__=true;
 function sync(){
  const card=document.getElementById('v636QuestDungeonCard');if(!card)return;
  card.classList.add('v575-combat','v599-clean');
  const bg=card.querySelector('.v600-bg');if(bg)bg.removeAttribute('style');
  const p=document.getElementById('v636QuestPlayerFighter');if(p){const isBar=/Bud-Barbar/i.test(p.textContent||'');p.classList.toggle('v600-barbar',isBar);const img=p.querySelector('.fighter-avatar img');if(img&&isBar){img.classList.remove('v253-player-avatar-img');img.classList.add('v600-barbar-art');img.style.removeProperty('display');img.style.removeProperty('visibility');img.style.removeProperty('opacity')}else if(img&&!isBar){img.classList.remove('v600-barbar-art');img.classList.add('v253-player-avatar-img')}}
  card.querySelectorAll('.v604-skill-chip').forEach(el=>{
   if(el.dataset.v637armed)return;el.dataset.v637armed='1';
   el.style.setProperty('animation','none','important');void el.offsetWidth;
   el.style.setProperty('animation','v604SkillChip 1.55s cubic-bezier(.18,.8,.22,1) 0s 1 normal forwards running','important');
  });
 }
 /* V6.97: global quest visual observer retired. */
 document.addEventListener('click',e=>{if(e.target?.closest?.('#quests,#v636QuestDungeonCard'))requestAnimationFrame(sync)},true);
 window.addEventListener('pageshow',sync,{passive:true});setTimeout(sync,0);
})();
