(()=>{
 'use strict';
 if(window.__V6293_SUMMONER_PARITY__)return;
 window.__V6293_SUMMONER_PARITY__=true;

 const CLASS_IDS=['grower','scout','bruiser','frost','summoner'];
 const state=()=>{try{return typeof s!=='undefined'?s:window.s||null}catch(_){return window.s||null}};
 const cls=()=>String(state()?.playerClass||'grower');
 const n=v=>Number.isFinite(Number(v))?Number(v):0;

 function normalizeCore(){
   const st=state();if(!st)return false;
   let changed=false;

   if(!st.attrs||typeof st.attrs!=='object'){st.attrs={};changed=true}
   const defaults={staerke:5,geschick:5,intelligenz:5,ausdauer:5,glueck:5,growSkill:1};
   Object.entries(defaults).forEach(([k,v])=>{
     if(!Number.isFinite(Number(st.attrs[k]))){st.attrs[k]=v;changed=true}
   });

   if(!st.equipment||typeof st.equipment!=='object'){st.equipment={};changed=true}
   ['head','weapon','weapon2','ring','body','boots','amulet'].forEach(k=>{
     if(!Object.prototype.hasOwnProperty.call(st.equipment,k)){st.equipment[k]=null;changed=true}
   });

   if(!st.classSkills||typeof st.classSkills!=='object'){st.classSkills={};changed=true}
   if(!Number.isFinite(Number(st.level))||Number(st.level)<1){st.level=1;changed=true}
   if(!CLASS_IDS.includes(String(st.playerClass||'')) && st.playerClass!=null){
     /* Never silently convert an unknown class into Barbar. Leave it visible for diagnosis. */
     console.warn('V6.293 unknown playerClass',st.playerClass);
   }

   if(changed){
     try{localStorage.setItem(KEY,JSON.stringify(st))}catch(_){}
   }
   return changed;
 }
 window.v6293NormalizeClassState=normalizeCore;

 function primaryKey(id=cls()){
   if(id==='scout')return'geschick';
   if(id==='bruiser'||id==='summoner')return'intelligenz';
   return'staerke';
 }
 window.v6293PrimaryKey=primaryKey;

 function safeTotalAttr(k){
   normalizeCore();
   const st=state();if(!st)return 0;
   let v=n(st.attrs?.[k]);
   try{v+=n(typeof classes!=='undefined'?classes?.[st.playerClass]?.bonus?.[k]:0)}catch(_){}
   try{
     Object.values(st.equipment||{}).forEach(it=>{
       if(it?.bonus&&Number.isFinite(Number(it.bonus[k])))v+=Number(it.bonus[k]);
     });
   }catch(_){}
   try{if(typeof setBonusValue==='function')v+=n(setBonusValue(k))}catch(e){console.warn('V6.293 set bonus power',e)}
   return v;
 }
 window.v6293TotalAttr=safeTotalAttr;

 function canonicalPower(){
   const st=state();if(!st)return 0;
   normalizeCore();
   const pk=primaryKey(st.playerClass);
   const power=Math.round(
     safeTotalAttr(pk)*6 +
     safeTotalAttr('ausdauer')*2 +
     safeTotalAttr('glueck') +
     Math.max(1,n(st.level))*6
   );
   /* A completed character can never legitimately have zero combat power. */
   return Math.max(6,Number.isFinite(power)?power:6);
 }
 window.v6293CombatPower=canonicalPower;

 /* Final combat-power authority for every historical UI/profile wrapper. */
 try{combatPower=canonicalPower}catch(_){}
 window.combatPower=canonicalPower;
 try{v074CombatPower=canonicalPower}catch(_){}
 window.v074CombatPower=canonicalPower;
 window.v446CombatPower=canonicalPower;

 /* Five-class set bonus parity. */
 const priorSet=typeof setBonusValue==='function'?setBonusValue:null;
 if(priorSet&&!window.__v6293SetBonus){
   const wrapped=function(kind){
     if(cls()!=='summoner')return priorSet.apply(this,arguments);
     let count=0;
     try{count=typeof equippedSetCount==='function'?n(equippedSetCount('summoner')):0}catch(_){}
     if(kind==='intelligenz'&&count>=2)return 5;
     if(kind==='summonChance'&&count>=4)return .05;
     if(kind==='summonDamage'&&count>=6)return .20;
     /* Summoner must not inherit Barbar/Mage/Scout/Frost set mechanics. */
     if(['staerke','geschick','wuchtChance','doubleChance','doubleDamage','frostMarkChance'].includes(kind))return 0;
     return 0;
   };
   try{setBonusValue=wrapped}catch(_){}
   window.setBonusValue=wrapped;
   window.__v6293SetBonus=true;
 }

 /* Direct passive map parity: some legacy code reads V4156_CLASS_PASSIVES directly. */
 try{
   const current=(window.V4156_CLASS_PASSIVES&&typeof window.V4156_CLASS_PASSIVES==='object')
     ? {...window.V4156_CLASS_PASSIVES}
     : {};
   current.summoner={
     name:'Ruf aus dem Dunst',
     text:'10 % Grundchance auf einen Begleiter. Nach 4 Angriffen ohne Ruf ist der nächste garantiert.',
     summonChance:.10
   };
   window.V4156_CLASS_PASSIVES=Object.freeze(current);
 }catch(_){}

 function paintPower(){
   const cp=canonicalPower();
   ['#power','#charPower','#v358Power','#v110Cp'].forEach(sel=>{
     const el=document.querySelector(sel);if(el&&el.textContent!==String(cp))el.textContent=String(cp);
   });
   try{window.v448PaintPower?.()}catch(_){}
   return cp;
 }

 function refresh(){
   normalizeCore();
   paintPower();
 }

 /* Equipment, attributes and level changes all use established render/navigation paths. */
 try{
   if(typeof render==='function'&&!window.__v6293Render){
     const base=render;
     const wrapped=function(){
       const r=base.apply(this,arguments);
       requestAnimationFrame(refresh);
       return r;
     };
     try{render=wrapped}catch(_){}
     window.render=wrapped;
     window.__v6293Render=true;
   }
 }catch(_){}

 document.addEventListener('click',e=>{
   const hit=e.target instanceof Element
     ? e.target.closest('[data-equip],[data-unequip],[data-v459-equip],[data-v459-unequip],[data-screen="character"]')
     : null;
   if(hit)setTimeout(refresh,0);
 },true);

 window.addEventListener('growlegends:account-ready',()=>setTimeout(refresh,50));
 window.addEventListener('pageshow',()=>setTimeout(refresh,50),{passive:true});
 window.addEventListener('growlegends:foreground-ready',refresh,{passive:true});

 window.v6293ClassParityDiagnostics=()=>({
   version:'V6.293',
   classId:cls(),
   knownClass:CLASS_IDS.includes(cls()),
   primary:primaryKey(),
   attributes:{
     staerke:safeTotalAttr('staerke'),
     geschick:safeTotalAttr('geschick'),
     intelligenz:safeTotalAttr('intelligenz'),
     ausdauer:safeTotalAttr('ausdauer'),
     glueck:safeTotalAttr('glueck')
   },
   combatPower:canonicalPower(),
   equipment:Object.fromEntries(Object.entries(state()?.equipment||{}).map(([k,v])=>[k,v?.name||null])),
   gearTemplates:typeof classGear!=='undefined'?(classGear[cls()]||[]).length:0,
   skills:typeof skillDefs!=='undefined'?(skillDefs[cls()]||[]).map(x=>x.id):[],
   talentBranches:typeof V314_BRANCHES!=='undefined'?(V314_BRANCHES[cls()]||[]).map(x=>x.id):[],
   classSet:typeof classSets!=='undefined'?classSets[cls()]?.name||null:null
 });
})();
