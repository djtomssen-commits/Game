(()=>{
'use strict';
if(window.__V7292_RUNTIME_PERFORMANCE__)return;
window.__V7292_RUNTIME_PERFORMANCE__=true;

let materialQueued=false;
function syncMaterials(){
  if(materialQueued)return;
  materialQueued=true;
  requestAnimationFrame(()=>{
    materialQueued=false;
    /* Only touch the materials UI when it is actually present/needed. */
    const panel=document.querySelector('#character #v030Materials');
    if(!panel)return;
    try{window.v681EnhanceMaterials?.()}catch(_){}
    try{window.v683MaterialMultiSell?.enhance?.()}catch(_){}
  });
}
function syncFrost(){
  try{window.v682SyncFrostWeapon?.()}catch(_){}
}

/* One explicit post-render hook replaces two mutually-triggering MutationObservers. */
try{
  const base=window.v546RenderMaterials;
  if(typeof base==='function'&&!base.__v7292PerfHook){
    const wrapped=function(){
      const r=base.apply(this,arguments);
      syncMaterials();
      return r;
    };
    wrapped.__v7292PerfHook=true;
    wrapped.__v7292Base=base;
    window.v546RenderMaterials=wrapped;
    try{v546RenderMaterials=wrapped}catch(_){}
  }
}catch(_){}

/* Frost weapon sync is tied to the actual hero builders instead of observing
   every mutation in the whole character screen. */
for(const name of ['v510BuildCharacter','v514ApplyHeroReference']){
  try{
    const base=window[name];
    if(typeof base!=='function'||base.__v7292PerfHook)continue;
    const wrapped=function(){
      const r=base.apply(this,arguments);
      requestAnimationFrame(syncFrost);
      return r;
    };
    wrapped.__v7292PerfHook=true;
    wrapped.__v7292Base=base;
    window[name]=wrapped;
  }catch(_){}
}

/* Screen/tab events are enough for all three features and avoid background churn. */
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  const id=String(e?.detail?.id||e?.detail?.screen||'');
  if(id==='character'){
    requestAnimationFrame(()=>{
      syncFrost();
      syncMaterials();
    });
  }
},{passive:true});
document.addEventListener('click',e=>{
  if(!(e.target instanceof Element))return;
  if(e.target.closest('#v459CharacterTabs [data-tab="materials"],#v514HeroTabs [data-tab="materials"],#v546MaterialsHeader')){
    setTimeout(syncMaterials,25);
  }
},true);

window.v7292PerformanceDiagnostics=()=>({
  version:'V7.308',
  materialObserversRetired:true,
  characterWideObserverRetired:true,
  materialRenderHook:!!window.v546RenderMaterials?.__v7292PerfHook,
  frostHeroHooks:{
    v510:!!window.v510BuildCharacter?.__v7292PerfHook,
    v514:!!window.v514ApplyHeroReference?.__v7292PerfHook
  }
});
})();
