
(()=>{
  'use strict';
  window.v6256DisplayDiagnostics=()=>({
    width:window.innerWidth,
    height:window.innerHeight,
    orientation:window.matchMedia?.('(orientation: landscape)')?.matches?'landscape':'portrait',
    narrow420:window.matchMedia?.('(max-width:420px)')?.matches||false,
    shortLandscape:window.matchMedia?.('(orientation:landscape) and (max-height:520px)')?.matches||false,
    dungeonRouteScrollFix:true,
    shortLandscapeMode:true,
    safeAreaViewportFit:document.querySelector('meta[name="viewport"]')?.content||''
  });
})();
