
(function(){
  'use strict';
  function apply(){
    const c=document.getElementById('character'); if(!c)return;
    /* v459 is allowed to build the panels once, then loses layout ownership. */
    c.classList.add('v504-character-final');
    c.classList.remove('v501-character-redesign','v502-character-redesign','v503-character-reference');
    try{
      const banners=[...c.children].filter(el=>el!==c.querySelector(':scope > .hero-card') && /Heldenquartier/i.test(el.textContent||'') && !el.id?.startsWith('v459'));
      banners.forEach(el=>{ if(el.classList.contains('v052-scene-banner')||el.classList.contains('v052-character')) el.style.display='none'; });
    }catch(e){}
  }
  window.__V504_CHARACTER_OWNER__=true;
  window.v504ApplyCharacter=apply;
  apply();
  document.addEventListener('DOMContentLoaded',apply,{once:true});
  window.addEventListener('pageshow',apply,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply()});
})();
