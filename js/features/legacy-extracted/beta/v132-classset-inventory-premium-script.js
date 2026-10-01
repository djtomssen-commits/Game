
function v132Polish(){
  /* Remove "Inventar-System V4.02" / similar technical version text. */
  document.querySelectorAll('#character .card:has(#inventory) .tiny,#character .card:has(#inventory) .muted').forEach(el=>{
    const t=(el.textContent||'').trim();
    if(/^Inventar-System\s+V/i.test(t)) el.classList.add('v132-hide-inventory-version');
  });

  /* Give set bonus rows semantic classes without changing mechanics. */
  const set=document.querySelector('#setBonuses');
  if(set){
    Array.from(set.children).forEach((el,i)=>{
      if(i>0)el.classList.add('set-bonus');
    });
  }

  
}
const v132BaseRender=render;
render=function(){
  const r=v132BaseRender();
  if(document.querySelector('#character')?.classList.contains('active'))requestAnimationFrame(v132Polish);
  return r;
};
setTimeout(v132Polish,160);
