
(function(){
'use strict';
if(window.__V7259_RESPONSIVE_DIAGNOSTICS__)return;
window.__V7259_RESPONSIVE_DIAGNOSTICS__=true;
window.v7259ResponsiveDiagnostics=function(){
 const active=[...document.querySelectorAll('.screen.active')];
 const vw=document.documentElement.clientWidth||window.innerWidth||0;
 const issues=[];
 active.forEach(screen=>{
  const sr=screen.getBoundingClientRect();
  [...screen.querySelectorAll('*')].forEach(el=>{
   const cs=getComputedStyle(el);
   if(cs.position==='fixed'||cs.display==='none'||cs.visibility==='hidden')return;
   const r=el.getBoundingClientRect();
   if(r.width>vw+4||r.right>vw+4||r.left<-4){
    issues.push({screen:screen.id||screen.className,tag:el.tagName,id:el.id||'',className:String(el.className||'').slice(0,120),left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),viewport:vw});
   }
  });
 });
 return {version:'V7.276',viewport:vw,activeScreens:active.map(x=>x.id),issues:issues.slice(0,80),count:issues.length};
};
})();
