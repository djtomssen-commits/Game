
/* V4.02 visual-only continuation */
function v053Polish(){
  /* V4.123: version paint retired. */

  document.querySelectorAll('.btn,.stat,.shop-item,.inv-item,.quest,.skill-card,.grow-slot,.world-map-place,.dungeon-node').forEach(el=>{
    el.style.willChange='transform';
  });
}

const v053BaseRender=render;
render=function(){
  v053BaseRender();
  v053Polish();
};

try{
  v053Polish();
  render();
}catch(e){
  console.error('V4.02 premium detail',e);
}
