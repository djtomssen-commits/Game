(()=>{
 'use strict';
 window.__V7162_DUNGEON_MAP_FINAL__=Object.freeze({version:'V7.162',legacyV468Painter:false,assetRoot:'v474_dungeon_assets',exactFiles:true});
 function finalize(){
   try{window.glDungeonVisualRefresh?.()}catch(_){ }
   try{
     const card=document.getElementById('dungeonMapCard');
     if(!card||card.style.display==='none')return;
     card.classList.add('gl-dungeon-canonical-map');
   }catch(_){ }
 }
 /* Only lifecycle edges; no observer / no interval / no scroll repaint. */
 document.addEventListener('click',e=>{if(e.target?.closest?.('#dungeon,#dungeonMapCard'))requestAnimationFrame(finalize)},true);
 window.addEventListener('growlegends:foreground-ready',()=>requestAnimationFrame(finalize));
 setTimeout(finalize,0);
 setTimeout(finalize,120);
 try{
   const paintVersion=()=>{
     document.querySelectorAll('.v366-ver,.v371-logo em,.v372-logo em').forEach(el=>{if(el)el.textContent='V7.162'});
   };
   paintVersion();setTimeout(paintVersion,80);
 }catch(_){ }
})();
