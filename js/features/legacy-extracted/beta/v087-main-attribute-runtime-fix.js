
function v087FixMainAttributeBadge(){
  const candidates=[...document.querySelectorAll('*')].filter(el =>
    el.children.length===0 &&
    (el.textContent||'').trim().toUpperCase()==='HAUPTATTRIBUT'
  );
  candidates.forEach(badge=>{
    badge.style.position='absolute';
    badge.style.right='92px';
    badge.style.top='8px';
    badge.style.zIndex='2';
    badge.style.whiteSpace='nowrap';
    badge.style.pointerEvents='none';

    const row=badge.closest('.stat-row') || badge.parentElement;
    if(row && getComputedStyle(row).position==='static') row.style.position='relative';
  });
}

document.addEventListener('DOMContentLoaded',v087FixMainAttributeBadge,{once:true});
window.addEventListener('pageshow',()=>{if(document.getElementById('character')?.classList.contains('active'))v087FixMainAttributeBadge()},{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')v087FixMainAttributeBadge()},{passive:true});
try{v087FixMainAttributeBadge()}catch(e){console.error('V4.02 main attribute fix',e);}
