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

  const label=activeTitle();
  /* V8.347: stable Beta title must not be destroyed and recreated on each
     navigation. Rebuild only when title, anchor, or duplicate/legacy nodes differ.
     Keep the original full-repair path for unexpected DOM or title changes. */
  if(String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta'){
    const badges=root.querySelectorAll('.v6339-avatar-active-title');
    const legacy=root.querySelectorAll('.v6338-own-title');
    if(legacy.length===0&&badges.length===(label?1:0)&&
       (!label||(badges[0]?.textContent===label&&badges[0]?.previousElementSibling===name)))
      return true;
  }
  root.querySelectorAll('.v6339-avatar-active-title').forEach(n=>n.remove());
  /* Remove the old misplaced own-title badge from the character page only.
     Hall/profile title badges are intentionally untouched. */
  root.querySelectorAll('.v6338-own-title').forEach(n=>n.remove());
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
let navTime={at:0,cpuMs:0};
window.v6339CharacterNavDiagnostics=()=>({...navTime});
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  if(String(e?.detail?.id||'')!=='character')return;
  const beta=String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta';
  const start=beta?(performance.now?.()||Date.now()):0;
  syncAvatarTitle();
  if(beta)navTime={at:Date.now(),cpuMs:Math.round((performance.now?.()||Date.now())-start)};
},{passive:true});
window.__V6339_RENDER_WRAP__='retired';
window.v6339CharacterTitleDiagnostics=()=>({
  version:'V6.347',
  active:activeTitle(),
  avatarName:document.getElementById('avatarTitle')?.textContent||'',
  mounted:!!document.querySelector('#character #avatarTitle + .v6339-avatar-active-title')
});
})();
