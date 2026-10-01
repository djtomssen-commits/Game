(()=>{
'use strict';
if(window.__V6201_MYSTIC_SPECIALS__)return;
window.__V6201_MYSTIC_SPECIALS__=true;

const KNOWN=new Set(['mainPct','hpPct','critChance','critDamage','wuchtChance','doubleChance','dodgeChance','damagePct','damageReduce','lifeSteal','armorPen']);
const CAPS={primaryPct:.40,hpPct:.62,critChance:.40,critDamage:.95,wuchtChance:.40,doubleChance:.40,dodgeChance:.40,damagePct:.62,damageReduce:.38,lifeSteal:.12,armorPen:.35};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
function primaryKey(){const c=String(s?.playerClass||'grower');return c==='scout'?'geschick':(c==='bruiser'||c==='summoner')?'intelligenz':'staerke'}
function mystic(it){const sp=it?.mysticSpecial||it?.mystic_special||it?.special;return sp&&typeof sp==='object'?sp:null}
function slotFactor(slot){return String(s?.playerClass||'')==='frost'&&slot==='weapon2'?.10:1}
function equippedBonus(){
 const out={};
 try{
  Object.entries(s?.equipment||{}).forEach(([slot,it])=>{
   const sp=mystic(it),key=String(sp?.key||''),value=Math.max(0,Number(sp?.value)||0)*slotFactor(slot);
   if(!sp||!KNOWN.has(key)||!value)return;
   const target=key==='mainPct'?'primaryPct':key;
   out[target]=(Number(out[target])||0)+value;
  });
 }catch(e){}
 return out;
}
window.v6201MysticEquippedBonuses=equippedBonus;

/* Item comparison intentionally ignores gems and enchantment rolls, but mystic
   specials belong to the item itself and therefore DO count. Values below are
   converted to a conservative attribute-equivalent so BESSER/SCHLECHTER matches
   the real build impact instead of looking only at naked item points. */
window.v6201MysticCompareValue=function(it){
 const sp=mystic(it);if(!sp)return 0;
 const key=String(sp.key||''),v=Math.max(0,Number(sp.value)||0);if(!v)return 0;
 let primary=50,endurance=30,level=Math.max(1,Number(s?.level)||1),crit=.12;
 try{primary=Math.max(1,Number(totalAttr(primaryKey()))||1)}catch(e){}
 try{endurance=Math.max(1,Number(totalAttr('ausdauer'))||1)}catch(e){}
 try{if(typeof v267CritChance==='function')crit=clamp(Number(v267CritChance())/100,0,.40)}catch(e){}
 const hpEq=Math.max(1,(80+endurance*8+level*5)/8);
 switch(key){
  case 'mainPct': return primary*v;
  case 'hpPct': return hpEq*v;
  case 'critChance': return primary*v*.75;
  case 'critDamage': return primary*v*Math.max(.08,crit);
  case 'wuchtChance': return primary*v*.55;
  case 'doubleChance': return primary*v*.45;
  case 'dodgeChance': return hpEq*v*.80;
  case 'damagePct': return primary*v;
  case 'damageReduce': return hpEq*v*.90;
  case 'lifeSteal': return primary*v*.55;
  case 'armorPen': return primary*v*.50;
  default: return 0;
 }
};

/* Final central passive-stat bridge. This makes the same mystic effect that is
   valued by the comparison actually active in every modern combat consumer. */
try{
 if(typeof v319ExactTalentStats==='function'&&!v319ExactTalentStats.__v6201Mystic){
  const base=v319ExactTalentStats;
  const wrapped=function(){
   const o={...(base.apply(this,arguments)||{})},m=equippedBonus();
   Object.entries(m).forEach(([k,v])=>{o[k]=(Number(o[k])||0)+Number(v||0)});
   Object.entries(CAPS).forEach(([k,cap])=>{if(k in o)o[k]=clamp(o[k],0,cap)});
   return o;
  };
  wrapped.__v6201Mystic=true;
  v319ExactTalentStats=wrapped;
  try{window.v319ExactTalentStats=wrapped}catch(e){}
 }
}catch(e){console.warn('V6.201 mystic gameplay bridge',e)}

window.v6201MysticQA=()=>({
 equipped:equippedBonus(),
 compareValue:Object.fromEntries(Object.entries(s?.equipment||{}).filter(([,it])=>!!mystic(it)).map(([slot,it])=>[slot,Math.round((window.v6201MysticCompareValue(it)||0)*100)/100])),
 exactStats:(()=>{try{return typeof v319ExactTalentStats==='function'?v319ExactTalentStats():null}catch(e){return null}})()
});

/* Repaint with the now-installed helper. V4.70's compare function looks this up
   dynamically, so inventory/shop flags use mystic-aware values without counting
   socket stones or enchantment rolls. */
try{if(typeof render==='function')setTimeout(()=>render(),0)}catch(e){}
})();
