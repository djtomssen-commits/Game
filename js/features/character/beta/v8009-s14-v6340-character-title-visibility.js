(()=>{
'use strict';
if(window.__V6340_CHARACTER_TITLE_VISIBILITY__)return;
window.__V6340_CHARACTER_TITLE_VISIBILITY__=true;

function v6340ActiveLabel(){
  try{
    if(typeof window.v6338PublicTitle==='function'){
      const x=window.v6338PublicTitle()||{};
      const label=String(x.label||'').trim();
      if(label)return label;
    }
  }catch(_){ }
  try{return String(s?.v6338Titles?.activeLabel||s?.v686PetAlbum?.activeTitle||'').trim()}catch(_){return ''}
}
function v6340SyncCharacterTitle(){
  const root=document.getElementById('character');
  const sub=document.getElementById('avatarSubtitle');
  if(!root||!sub)return false;

  /* Kill every retired spacer/badge, including one recreated by an older callback. */
  root.querySelectorAll('.v6339-avatar-active-title').forEach(n=>n.remove());
  root.querySelectorAll('.v6338-own-title').forEach(n=>n.remove());

  const label=v6340ActiveLabel();
  if(label){
    sub.classList.add('v6340-has-active-title');
    sub.setAttribute('data-v6340-title','👑 '+label);
  }else{
    sub.classList.remove('v6340-has-active-title');
    sub.removeAttribute('data-v6340-title');
  }
  return true;
}
window.v6340SyncCharacterTitle=v6340SyncCharacterTitle;
/* Any external caller of the old public hook now lands on the canonical painter. */
window.v6339SyncCharacterAvatarTitle=v6340SyncCharacterTitle;

document.addEventListener('click',e=>{
  const el=e.target instanceof Element?e.target:null;
  if(!el)return;
  if(el.closest('[data-v6338-select],[data-v6338-clear]'))setTimeout(v6340SyncCharacterTitle,20);
  if(el.closest('[data-screen="character"],[data-go="character"],#character'))setTimeout(v6340SyncCharacterTitle,120);
},true);
window.addEventListener('growlegends:account-ready',v6340SyncCharacterTitle,{passive:true});
window.addEventListener('pageshow',v6340SyncCharacterTitle,{passive:true});
window.addEventListener('growlegends:navigation-ready',v6340SyncCharacterTitle,{passive:true});

try{
  if(typeof render==='function'&&!window.__V6340_RENDER_WRAP__){
    const base=render;
    const wrapped=function(){
      const r=base.apply(this,arguments);
      requestAnimationFrame(()=>requestAnimationFrame(v6340SyncCharacterTitle));
      return r;
    };
    window.__V6340_RENDER_WRAP__=true;
    try{render=wrapped}catch(_){ }
    try{window.render=wrapped}catch(_){ }
  }
}catch(_){ }


window.v6340CharacterTitleDiagnostics=()=>({
  version:'V6.347',
  active:v6340ActiveLabel(),
  titleAttr:document.getElementById('avatarSubtitle')?.getAttribute('data-v6340-title')||'',
  oldSpacerCount:document.querySelectorAll('#character .v6339-avatar-active-title').length
});
})();
