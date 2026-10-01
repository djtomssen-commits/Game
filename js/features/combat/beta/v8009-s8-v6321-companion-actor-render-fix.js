(()=>{
'use strict';
if(window.__V6321_COMPANION_ACTOR_RENDER_FIX__)return;
window.__V6321_COMPANION_ACTOR_RENDER_FIX__=true;
function sanitizeActor(root=document){
  root.querySelectorAll('.v6287-summon-fx').forEach(el=>{
    try{
      el.style.setProperty('overflow','hidden','important');
      el.style.setProperty('contain','layout paint style','important');
      el.style.setProperty('isolation','isolate','important');
      const img=el.querySelector('.v6303-spirit img');
      if(img){
        img.style.setProperty('left','0','important');
        img.style.setProperty('top','0','important');
        img.style.setProperty('width','100%','important');
        img.style.setProperty('height','100%','important');
        img.style.setProperty('max-width','100%','important');
        img.style.setProperty('max-height','100%','important');
        img.style.setProperty('object-fit','cover','important');
        img.style.setProperty('object-position','center center','important');
        img.style.setProperty('transform','none','important');
        img.style.setProperty('-webkit-mask-image','none','important');
        img.style.setProperty('mask-image','none','important');
        img.style.setProperty('clip-path','circle(47% at 50% 50%)','important');
        img.style.setProperty('-webkit-clip-path','circle(47% at 50% 50%)','important');
      }
    }catch(_){ }
  });
}
const mo=new MutationObserver(muts=>{
  let hit=false;
  for(const m of muts){
    for(const n of m.addedNodes||[]){
      if(n&&n.nodeType===1&&((n.matches&&n.matches('.v6287-summon-fx'))||(n.querySelector&&n.querySelector('.v6287-summon-fx')))){hit=true;break}
    }
    if(hit)break;
  }
  if(hit)sanitizeActor(document);
});
try{mo.observe(document.documentElement,{childList:true,subtree:true})}catch(_){ }
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>sanitizeActor(document),{once:true});
else sanitizeActor(document);
window.v6321CompanionActorDiagnostics=()=>({
  version:'V6.321',
  actorCount:document.querySelectorAll('.v6287-summon-fx').length,
  actorClipped:[...document.querySelectorAll('.v6287-summon-fx .v6303-spirit img')].every(img=>(getComputedStyle(img).clipPath||getComputedStyle(img).webkitClipPath||'').includes('circle'))
});
})();
