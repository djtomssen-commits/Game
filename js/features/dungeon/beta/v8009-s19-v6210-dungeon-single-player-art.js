(()=>{
 'use strict';
 if(window.__V6210_DUNGEON_SINGLE_PLAYER_ART__)return;
 window.__V6210_DUNGEON_SINGLE_PLAYER_ART__=true;
 function clean(force=false){
  if(!force&&!document.getElementById('dungeon')?.classList.contains('active'))return false;
  const fighter=document.getElementById('playerFighter');
  const avatar=fighter?.querySelector('.fighter-avatar');
  if(!fighter||!avatar)return false;
  avatar.style.setProperty('background-image','none','important');
  avatar.style.setProperty('background-color','transparent','important');
  let canonical=avatar.querySelector(':scope > img.gl-dungeon-player-art');
  if(!canonical){
   const candidate=avatar.querySelector(':scope > img.v253-player-avatar-img');
   if(candidate){candidate.classList.add('gl-dungeon-player-art');canonical=candidate}
  }
  const fallback=avatar.querySelector(':scope > .gl-dungeon-player-fallback');
  [...avatar.children].forEach(n=>{if(n!==canonical&&n!==fallback)n.remove()});
  [...avatar.childNodes].forEach(n=>{if(n.nodeType===Node.TEXT_NODE&&String(n.nodeValue||'').trim())n.remove()});
  if(canonical){
   canonical.classList.remove('v600-barbar-art');
   canonical.classList.add('v253-player-avatar-img','gl-dungeon-player-art');
   canonical.hidden=false;
   canonical.style.removeProperty('display');canonical.style.removeProperty('visibility');canonical.style.removeProperty('opacity');
  }
  return true;
 }
 window.v6210DungeonSinglePlayerArtClean=()=>clean(true);
})();
