
function v133Polish(){
  /* Remove duplicate equipment sub-card completely. */
  document.querySelector('#v130GearInvHead')?.remove();

  /* Remove duplicate materials sub-heading. */
  document.querySelector('#v130MatInvHead')?.remove();

  /* Make the existing empty materials message look intentional. */
  const mats=document.querySelector('#v030Materials');
  if(mats){
    Array.from(mats.querySelectorAll('*')).forEach(el=>{
      const t=(el.textContent||'').trim();
      if(t==='Noch keine Edelsteine oder Rollen.' && !el.classList.contains('v133-material-empty')){
        el.classList.add('v133-material-empty');
        if(el.children.length===0) el.innerHTML='<span>Noch keine Edelsteine oder Rollen.</span>';
      }
    });
  }
  
}
const v133BaseRender=render;
render=function(){
  const r=v133BaseRender();
  if(document.querySelector('#character')?.classList.contains('active'))requestAnimationFrame(v133Polish);
  return r;
};
setTimeout(v133Polish,150);
