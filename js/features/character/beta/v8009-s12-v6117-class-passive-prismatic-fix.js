(()=>{
'use strict';
if(window.__V6117_CLASS_PASSIVE_PRISMATIC_FIX__)return;
window.__V6117_CLASS_PASSIVE_PRISMATIC_FIX__=true;

function repair(){
  const character=document.getElementById('character');
  if(!character)return false;

  try{window.v4156PaintClassPassive?.()}catch(e){}
  try{window.v514ApplyHeroReference?.()}catch(e){}

  const root=document.getElementById('v510HeroRoot');
  const host=root?.querySelector('.v514-passive-host');
  let passive=document.getElementById('v4156ClassPassive');

  /* In case an older render removed the node entirely, recreate it through
     the authoritative painter, then place it in the visible final host. */
  if(!passive){
    try{window.v4156PaintClassPassive?.()}catch(e){}
    passive=document.getElementById('v4156ClassPassive');
  }
  if(host&&passive&&passive.parentElement!==host)host.appendChild(passive);

  return !!(host&&passive&&passive.parentElement===host);
}
window.v6117RepairClassPassive=repair;

function wrap(name){
  try{
    const fn=window[name];
    if(typeof fn!=='function'||fn.__v6117Passive)return;
    const wrapped=function(){
      const r=fn.apply(this,arguments);
      Promise.resolve(r).finally(()=>{
        requestAnimationFrame(()=>{
          try{window.v6102PaintEquipmentSlots?.()}catch(e){}
          repair();
        });
      });
      return r;
    };
    wrapped.__v6117Passive=true;
    window[name]=wrapped;
    try{
      if(name==='equip')equip=wrapped;
      if(name==='unequip')unequip=wrapped;
      if(name==='sellEquipped')sellEquipped=wrapped;
    }catch(e){}
  }catch(e){}
}

['equip','unequip','sellEquipped'].forEach(wrap);

/* Harzschmiede can create a prismatic item and immediately trigger character
   refresh paths. Repair once after an actual craft as well. */
try{
  if(typeof window.v488ForgeRender==='function'&&!window.v488ForgeRender.__v6117Passive){
    const base=window.v488ForgeRender;
    const wrapped=function(){
      const r=base.apply(this,arguments);
      if(document.getElementById('character')?.classList.contains('active')){
        requestAnimationFrame(repair);
      }
      return r;
    };
    wrapped.__v6117Passive=true;
    window.v488ForgeRender=wrapped;
  }
}catch(e){}

/* V7.119: character entry joins the shared post-navigation refresh frame. */
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')repair()});
window.__v6117Go='v7119-event';

document.addEventListener('DOMContentLoaded',repair,{once:true});
window.addEventListener('pageshow',()=>{
  if(document.getElementById('character')?.classList.contains('active'))repair();
},{passive:true});
window.addEventListener('growlegends:account-ready',repair,{passive:true});

window.v6117ClassPassiveQA=()=>({
  exists:!!document.getElementById('v4156ClassPassive'),
  hostExists:!!document.querySelector('#v510HeroRoot .v514-passive-host'),
  inVisibleHost:
    document.getElementById('v4156ClassPassive')?.parentElement===
    document.querySelector('#v510HeroRoot .v514-passive-host'),
  secondaryHidden:(()=>{
    const el=document.querySelector('#v510HeroRoot .v510-secondary');
    if(!el)return null;
    try{return getComputedStyle(el).display==='none'}catch(e){return null}
  })(),
  prismaticEquipped:Object.values(s?.equipment||{}).some(it=>it?.v488Prismatic===true||String(it?.quality||'').toLowerCase()==='prismatic')
});
})();
