
(function(){
 'use strict';
 if(window.__V626_QUEST_ART_FIX__)return;
 window.__V626_QUEST_ART_FIX__=true;
 const $=q=>document.querySelector(q);
 function cfg(){
   try{return window.__V468_CFG__?.['2']||window.__V468_CFG__?.[2]||null}catch(_){return null}
 }
 function visualIndex(q){
   const txt=`${q?.name||''} ${q?.text||''}`.toLowerCase();
   if(txt.includes('fliege'))return 8;
   if(txt.includes('labor'))return 6;
   if(txt.includes('ungeziefer')||txt.includes('laus'))return 0;
   if(txt.includes('zwerg')||txt.includes('wächter'))return 1;
   if(txt.includes('nebel'))return 7;
   return Math.abs(Math.floor(Number(q?.id)||0))%9;
 }
 function apply(q){
   try{
     const c=cfg(),boss=$('#v311BossAvatar'),arena=$('#v311QuestFight .v311-arena');
     if(!boss||!c)return false;
     const i=visualIndex(q);
     const src=q?.v310Elite?(c.bossArt||c.art?.[8]):c.art?.[i];
     if(!src)return false;
     boss.classList.add('v615-has-art');
     boss.innerHTML=`<img src="${src}" alt="Quest-Gegner" loading="eager" decoding="sync">`;
     if(arena&&c.bg){
       arena.classList.add('v626-dungeon-scene');
       arena.style.setProperty('background-image',`radial-gradient(circle at 50% 43%,rgba(104,229,89,.13),transparent 22%),linear-gradient(180deg,rgba(1,8,5,.03) 0%,rgba(1,6,4,.18) 56%,rgba(1,4,2,.88) 100%),url("${c.bg}")`,'important');
     }
     return true;
   }catch(_){return false}
 }
 window.v626ApplyQuestEnemyArt=apply;
 const base=window.v311PlayFight;
 if(typeof base==='function'&&!base.__v626Art){
   const wrapped=async function(q){
     const out=base.apply(this,arguments);
     requestAnimationFrame(()=>apply(q));
     setTimeout(()=>apply(q),40);
     return await out;
   };
   wrapped.__v626Art=true;
   window.v311PlayFight=wrapped;
   try{v311PlayFight=wrapped}catch(_){}
 }
 const prev=window.v625QuestVisualPreview||window.v615QuestVisualPreview;
 if(typeof prev==='function'){
   const preview=async function(){
     const q={id:626,name:'Nebel über dem Gewächshaus',text:'Ein Quest-Gegner versperrt den Weg.',v310Elite:false};
     const out=prev.call(this,q);
     requestAnimationFrame(()=>apply(q));
     setTimeout(()=>apply(q),40);
     return await out;
   };
   window.v625QuestVisualPreview=preview;
   window.v615QuestVisualPreview=preview;
 }
 window.addEventListener('click',e=>{
   if(!e.target?.closest?.('[data-v615-quest-preview]'))return;
   setTimeout(()=>apply({id:626,name:'Nebel über dem Gewächshaus',text:'Ein Quest-Gegner versperrt den Weg.',v310Elite:false}),70);
 },true);
})();
