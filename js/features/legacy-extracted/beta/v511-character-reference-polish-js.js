
(function(){
  function reorder(){
    const center=document.querySelector('#v510HeroRoot .v510-center');
    if(!center)return;
    const portrait=center.querySelector('.v510-portrait');
    const name=document.getElementById('avatarTitle');
    const sub=document.getElementById('avatarSubtitle');
    const level=center.querySelector('.level-shield');
    const xp=center.querySelector('.center-xp');
    /* V6.115: don't move the Illegal Book. V5.14 owns Book + Pet. */
    const ordered=[portrait,name,sub,level,xp].filter(Boolean);
    if(String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta'){
      /* V8.348: moving an already ordered XP bar resets compositor state and
         visibly shifts the hero stage. Only correct a genuinely wrong order. */
      for(let i=ordered.length-1;i>=0;i--){
        const next=ordered[i+1]||null,el=ordered[i];
        if(el.parentElement!==center||el.nextElementSibling!==next)
          {center.insertBefore(el,next);
            if(el===xp){
              const v=window.__V8348_VISUAL_METRICS__||(window.__V8348_VISUAL_METRICS__={});
              v.xpNodeMoves=(Number(v.xpNodeMoves)||0)+1;
            }
          }
      }
    }else ordered.forEach(n=>center.appendChild(n));
  }
  reorder();
  document.addEventListener('DOMContentLoaded',reorder,{once:true});
  window.addEventListener('pageshow',()=>{if(document.getElementById('character')?.classList.contains('active'))reorder()},{passive:true});
  let navTime={at:0,cpuMs:0};
  window.v511CharacterNavDiagnostics=()=>({...navTime});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    if(String(e?.detail?.id||'')!=='character')return;
    const beta=String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta';
    const start=beta?(performance.now?.()||Date.now()):0;
    reorder();
    if(beta)navTime={at:Date.now(),cpuMs:Math.round((performance.now?.()||Date.now())-start)};
  },{passive:true});
})();
