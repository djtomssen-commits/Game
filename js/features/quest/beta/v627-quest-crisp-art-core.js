
(function(){
 'use strict';
 if(window.__V627_QUEST_CRISP_ART__)return;
 window.__V627_QUEST_CRISP_ART__=true;
 const $=q=>document.querySelector(q);
 function bossInfo(q){
   try{
     if(typeof window.v311BossForQuest==='function')return window.v311BossForQuest(q);
     if(typeof v311BossForQuest==='function')return v311BossForQuest(q);
   }catch(_){}
   return ['👹','Quest-Gegner'];
 }
 function crisp(q){
   try{
     const boss=$('#v311BossAvatar');
     if(!boss||typeof v253MonsterSvg!=='function')return false;
     const info=bossInfo(q),name=String(info?.[1]||'Quest-Gegner');
     const idx=Math.abs(Math.floor(Number(q?.id)||1))%9;
     boss.classList.remove('v615-has-art');
     boss.classList.add('v627-vector-art');
     boss.innerHTML=v253MonsterSvg({name},!!q?.v310Elite,1,idx);
     const nameEl=$('#v311BossName');
     if(nameEl)nameEl.textContent=q?.v310Elite?`ELITE · ${name}`:name;
     return true;
   }catch(e){console.error('V6.27 quest art',e);return false}
 }
 window.v627ApplyQuestEnemyArt=crisp;

 /* V6.26 paints the old enlarged dungeon thumbnail shortly after opening.
    Run after it and replace only the visual art; quest mechanics stay untouched. */
 const old626=window.v626ApplyQuestEnemyArt;
 window.v626ApplyQuestEnemyArt=function(q){
   try{if(typeof old626==='function')old626(q)}catch(_){}
   requestAnimationFrame(()=>crisp(q));
   setTimeout(()=>crisp(q),55);
   return true;
 };

 const preview=window.v625QuestVisualPreview||window.v615QuestVisualPreview;
 if(typeof preview==='function'&&!preview.__v627Crisp){
   const wrapped=async function(){
     const q={id:627,name:'Nebel über dem Gewächshaus',text:'Ein Quest-Gegner versperrt den Weg.',v310Elite:false};
     const out=preview.apply(this,arguments);
     requestAnimationFrame(()=>crisp(q));
     setTimeout(()=>crisp(q),70);
     return await out;
   };
   wrapped.__v627Crisp=true;
   window.v625QuestVisualPreview=wrapped;
   window.v615QuestVisualPreview=wrapped;
 }

 document.addEventListener('click',e=>{
   if(!e.target?.closest?.('[data-v615-quest-preview]'))return;
   const q={id:627,name:'Nebel über dem Gewächshaus',text:'Ein Quest-Gegner versperrt den Weg.',v310Elite:false};
   setTimeout(()=>crisp(q),90);
 },true);
})();
