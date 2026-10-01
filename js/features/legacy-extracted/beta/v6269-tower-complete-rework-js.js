
(()=>{
 'use strict';
 if(window.__V6269_TOWER_MUTATION_CAP__)return;
 window.__V6269_TOWER_MUTATION_CAP__=true;
 const CAP=6;
 function normalizeMutationCap(){
   try{
     const r=window.s?.tower?.run;
     if(!r)return false;
     if(Array.isArray(r.buffs)&&r.buffs.length>CAP){
       r.buffs=[...new Set(r.buffs)].slice(0,CAP);
       r.mutationChoices=[];
       r.geneticsComplete=true;
       try{typeof save==='function'&&save(false)}catch(_){}
       return true;
     }
   }catch(_){}
   return false;
 }
 window.v6269NormalizeTowerMutationCap=normalizeMutationCap;
})();
