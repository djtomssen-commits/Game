
function v287RemoveDampfSubtitle(){
  const card=document.querySelector('#energy')?.closest('.stat');
  if(!card)return;
  card.querySelectorAll('.v284-dampf-sub').forEach(el=>el.remove());
}

/* V6.320: duplicate subtitle cleanup no longer wraps the global renderer. */
window.addEventListener('pageshow',()=>requestAnimationFrame(v287RemoveDampfSubtitle),{passive:true});

setTimeout(v287RemoveDampfSubtitle,250);

const v287Line=document.querySelector('#v141VersionLine');
