
(()=>{
'use strict';

/* Remove only the extra lore text from avatar captions.
   The class description remains available in class information. */
function v6305AvatarClean(){
 try{
  const sub=document.getElementById('avatarSubtitle');
  if(sub && String(sub.textContent).includes('Herrin von Nebel')){
    sub.textContent='Harzruferin';
  }
 }catch(_){}
}

/* Make sure all current combat scenes get the scene fallback. */
function v6305Scene(){
 try{
  document.querySelectorAll('#battleStage,.battle-stage').forEach(el=>{
    el.classList.add('v6305-scene-ready');
  });
 }catch(_){}
}
window.addEventListener('pageshow',()=>{v6305AvatarClean();v6305Scene()});
document.addEventListener('click',()=>setTimeout(()=>{
 v6305AvatarClean();v6305Scene();
},80),true);
})();
