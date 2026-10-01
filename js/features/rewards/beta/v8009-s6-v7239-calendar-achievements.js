(()=>{
'use strict';
if(window.__V7239_CALENDAR_ACHIEVEMENTS__)return;
window.__V7239_CALENDAR_ACHIEVEMENTS__=true;

const VERSION='V7.273';
const CAL=[
 ['calendar_newyear','Neues Jahr, neuer Grow','Logge dich am 1. Januar ein.'],
 ['calendar_valentine','Harzige Liebe','Logge dich am 14. Februar ein.'],
 ['calendar_april','Kein Aprilscherz','Logge dich am 1. April ein.'],
 ['calendar_420','Vier-Zwanzig','Logge dich am 20. April ein.'],
 ['calendar_summer','Längster Growtag','Logge dich am 21. Juni ein.'],
 ['calendar_halloween','Nebel der Nacht','Logge dich an Halloween (31. Oktober) ein.'],
 ['calendar_nikolaus','Stiefel voller Harz','Logge dich an Nikolaus (6. Dezember) ein.'],
 ['calendar_christmas','Grüne Weihnachten','Logge dich zwischen 24. und 26. Dezember ein.'],
 ['calendar_silvester','Letzte Ernte','Logge dich an Silvester (31. Dezember) ein.']
];
const titleById=Object.fromEntries(CAL.map(x=>[x[0],x[1]]));
let busy=false,lastRun=0;

function installDefs(){
 try{
  if(typeof V106_ACH==='undefined'||!Array.isArray(V106_ACH))return false;
  for(const [id,title,desc] of CAL){
   if(!V106_ACH.some(x=>String(x?.[0])===id))V106_ACH.push([id,title,desc,()=>0,1]);
  }
  return true;
 }catch(e){console.warn('[V7.273] calendar defs',e);return false}
}
function logged(){
 try{return !!(window.v073User?.id&&!window.v073User?.is_anonymous)}catch(_){return false}
}
function clone(v){try{return JSON.parse(JSON.stringify(v))}catch(_){return v}}
function attrName(){try{return window.v106MainAttrName?.()||'Hauptattribut'}catch(_){return'Hauptattribut'}}

async function claim(show=true){
 if(busy||!logged())return null;
 if(Date.now()-lastRun<2500)return null;
 lastRun=Date.now();busy=true;installDefs();
 try{
  if(typeof v073Db==='undefined'||!v073Db)return null;
  const {data,error}=await v073Db.rpc('v7239_calendar_achievement_claim');
  if(error)throw error;
  const r=Array.isArray(data)?data[0]:data;
  if(!r?.ok)return r;

  if(r.done&&typeof r.done==='object'&&typeof s!=='undefined'&&s){
   s.v106Achievements=(s.v106Achievements&&typeof s.v106Achievements==='object')?s.v106Achievements:{};
   s.v106Achievements.done=clone(r.done);
   s.v106Achievements.stats=(s.v106Achievements.stats&&typeof s.v106Achievements.stats==='object')?s.v106Achievements.stats:{};
   try{if(typeof KEY!=='undefined'&&KEY)localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
  }

  const unlocked=Array.isArray(r.unlocked)?r.unlocked.map(String):[];
  if(show&&unlocked.length){
   try{window.v6111Sfx?.('achievement')}catch(_){}
   unlocked.forEach((id,i)=>setTimeout(()=>{
    try{
     window.v063Toast?.('🏆 Kalender-Erfolg!','success',`${titleById[id]||id} · +1 ${attrName()}`);
    }catch(_){}
   },80+i*180));
  }

  try{window.v446PaintCombatPower?.()}catch(_){}
  if(document.querySelector('#v106Overlay.show')){
   try{window.v106OpenBook?.()}catch(_){}
  }

  /* Let the canonical V7080 cache absorb the newly claimed server state silently.
     Its force refresh intentionally has a 15s minimum interval. */
  setTimeout(()=>{try{void window.v7080AchievementRefresh?.(false)}catch(_){}},16050);
  return r;
 }catch(e){
  console.warn('[V7.273] calendar achievement claim',e);
  return null;
 }finally{busy=false}
}

window.v7239CalendarAchievementClaim=claim;
window.v7239CalendarAchievements=()=>clone(CAL);

installDefs();
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>void claim(true),900),{passive:true});
window.addEventListener('pageshow',()=>setTimeout(()=>void claim(true),1500),{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>void claim(true),700)},{passive:true});
setTimeout(installDefs,600);
})();
