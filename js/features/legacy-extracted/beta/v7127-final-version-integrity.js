
(()=>{
 const V=Object.freeze({short:'V7.159',label:'V7.159 Stable',number:'7.159'});
 window.GROW_LEGENDS_VERSION=V;window.__GROW_LEGENDS_RELEASE__=V.short;
 const paint=()=>{
  try{document.querySelectorAll('.version').forEach(el=>el.textContent=V.short)}catch(_){}
  try{document.querySelectorAll('.v372-logo em,.v371-logo em,.v366-ver').forEach(el=>{if(el.tagName!=='STYLE')el.textContent=V.short})}catch(_){}
 };
 paint();window.addEventListener('pageshow',paint,{passive:true});window.addEventListener('growlegends:account-ready',paint,{passive:true});
})();
