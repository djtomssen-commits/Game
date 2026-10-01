
(()=>{
 'use strict';
 window.__V4111_OLD_ART_RUNTIME_RETIRED__=true;
 window.v4111ComicItemArtUri=function(it){
   try{return window.v6107CanonicalItemArt?.(it)||window.v6106RealItemArt?.(it)||window.v466ItemArtUri?.(it)||''}catch(e){return''}
 };
 window.v4111RefreshComicItems=function(scope){
   try{return window.v6107PaintItemSurfaces?.(scope||document.querySelector('.screen.active')||document)}catch(e){return false}
 };
})();
