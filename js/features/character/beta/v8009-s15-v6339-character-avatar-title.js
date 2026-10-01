(()=>{
'use strict';
if(window.__V6339_CHARACTER_AVATAR_TITLE__)return;
window.__V6339_CHARACTER_AVATAR_TITLE__=true;

function activeTitle(){
  try{
    if(typeof window.v6338PublicTitle==='function'){
      const x=window.v6338PublicTitle()||{};
      return String(x.label||'').trim();
    }
  }catch(_){ }
  try{return String(s?.v6338Titles?.activeLabel||s?.v686PetAlbum?.activeTitle||'').trim()}catch(_){return ''}
}
function syncAvatarTitle(){
  const root=document.getElementById('character');
  const name=document.getElementById('avatarTitle');
  if(!root||!name)return false;

  root.querySelectorAll('.v6339-avatar-active-title').forEach(n=>n.remove());
  /* Remove the old misplaced own-title badge from the character page only.
     Hall/profile title badges are intentionally untouched. */
  root.querySelectorAll('.v6338-own-title').forEach(n=>n.remove());

  const label=activeTitle();
  if(!label)return true;
  const badge=document.createElement('div');
  badge.className='v6339-avatar-active-title';
  badge.textContent=label;
  name.insertAdjacentElement('afterend',badge);
  return true;
}
window.v6339SyncCharacterAvatarTitle=syncAvatarTitle;

/* Title selection in the Illegalen Buch uses a closure-local setter in V6.342.
   Catch its UI action and repaint after the state has changed. */
document.addEventListener('click',e=>{
  const el=e.target instanceof Element?e.target:null;
  if(!el)return;
  if(el.closest('[data-v6338-select],[data-v6338-clear]'))setTimeout(syncAvatarTitle,0);
  /* Character navigation is owned by growlegends:navigation-open-v7119 below. */
},true);

window.addEventListener('growlegends:account-ready',syncAvatarTitle,{passive:true});
window.addEventListener('pageshow',syncAvatarTitle,{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')syncAvatarTitle()},{passive:true});
window.__V6339_RENDER_WRAP__='retired';
window.v6339CharacterTitleDiagnostics=()=>({
  version:'V6.347',
  active:activeTitle(),
  avatarName:document.getElementById('avatarTitle')?.textContent||'',
  mounted:!!document.querySelector('#character #avatarTitle + .v6339-avatar-active-title')
});
})();
