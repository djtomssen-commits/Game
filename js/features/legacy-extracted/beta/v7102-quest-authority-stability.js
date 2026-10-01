
(()=>{
'use strict';
if(window.__V7102_QUEST_STABILITY__)return;
window.__V7102_QUEST_STABILITY__=true;

const questEnforced=()=>{
 try{return String(window.v7040AuthorityDiagnostics?.()?.domains?.quest||'')==='enforce'}catch(_){return false}
};

try{
 const base=(typeof ensureQuests==='function')?ensureQuests:null;
 if(base&&!base.__v7102ServerOnly){
   const wrapped=function(){
     if(questEnforced()){
       try{
         s.quests=(s?.quests&&typeof s.quests==='object')?s.quests:{offers:[],active:null,eliteOffer:null};
         if(!Array.isArray(s.quests.offers))s.quests.offers=[];
       }catch(_){}
       return s?.quests;
     }
     return base.apply(this,arguments);
   };
   wrapped.__v7102ServerOnly=true;
   ensureQuests=wrapped;window.ensureQuests=wrapped;
 }
}catch(e){console.warn('[V7.109] ensureQuests authority owner',e)}

window.v7102QuestDiagnostics=()=>({
  enforced:questEnforced(),
  activeRun:Number(s?.quests?.active?.serverRunId)||null,
  offers:Array.isArray(s?.quests?.offers)?s.quests.offers.map(x=>String(x?.id||'')):[],
  release:window.__GROW_LEGENDS_RELEASE__||''
});
})();
