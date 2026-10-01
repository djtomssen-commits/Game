
(()=>{
  'use strict';
  const overlay=document.querySelector('#v074ProfileOverlay');
  if(!overlay)return;

  function syncOpenState(){
    const open=overlay.classList.contains('show');
    document.body?.classList.toggle('v653-profile-open',open);

    /* Shorten only the visible label, never the underlying dungeon value. */
    if(open){
      const content=document.querySelector('#v074ProfileContent');
      const topGrid=content?.querySelector(':scope > .v326-profile-grid');
      if(topGrid){
        [...topGrid.querySelectorAll(':scope > .v326-profile-stat span')].forEach(span=>{
          const current=(span.textContent||'').trim();
          if(/Abgeschlossen/i.test(current) && current!=='🏁 Abgeschlossen'){
            span.textContent='🏁 Abgeschlossen';
          }
        });
      }
    }
  }

  new MutationObserver(syncOpenState).observe(overlay,{attributes:true,attributeFilter:['class']});
  const content=document.querySelector('#v074ProfileContent');
  if(content)new MutationObserver(syncOpenState).observe(content,{childList:true,subtree:true});
  syncOpenState();
})();
