(()=>{
 'use strict';
 if(window.__V6295_HARZ_CORE_FIX__)return;
 window.__V6295_HARZ_CORE_FIX__=true;

 const state=()=>{try{return typeof s!=='undefined'?s:window.s||null}catch(_){return window.s||null}};
 const isHR=()=>String(state()?.playerClass||'')==='summoner';

 function num(fn,fallback=null){
   try{
     const v=Number(fn());
     return Number.isFinite(v)?v:fallback;
   }catch(_){return fallback}
 }

 /* Detect regressions without polling or DOM observers. */
 window.v6295HarzruferinCoreDiagnostics=()=>({
   version:'V6.295',
   active:isHR(),
   primary:num(()=>v029PrimaryStat(),null),
   intelligenz:num(()=>totalAttr('intelligenz'),null),
   ausdauer:num(()=>totalAttr('ausdauer'),null),
   maxHp:num(()=>maxHp(),null),
   combatPower:num(()=>combatPower(),null),
   talentSummary:(()=>{
     try{
       const x=v314Summary();
       return {
         primaryPct:Number(x?.primaryPct)||0,
         hpPct:Number(x?.hpPct)||0,
         damagePct:Number(x?.damagePct)||0,
         summonChance:Number(x?.summonChance)||0,
         summonDamage:Number(x?.summonDamage)||0
       };
     }catch(e){return {error:String(e?.message||e)}}
   })(),
   exactTalentStats:(()=>{
     try{
       const x=v319ExactTalentStats();
       return {
         damagePct:Number(x?.damagePct)||0,
         hpPct:Number(x?.hpPct)||0,
         lifeSteal:Number(x?.lifeSteal)||0,
         summonChance:Number(x?.v6287SummonChance)||0
       };
     }catch(e){return {error:String(e?.message||e)}}
   })()
 });

 /* Repair the character HUD after account load so stale zero values disappear. */
 function refresh(){
   if(!isHR())return;
   try{render?.()}catch(_){}
   try{window.v448PaintPower?.()}catch(_){}
 }
 window.addEventListener('growlegends:account-ready',()=>setTimeout(refresh,80));
})();
