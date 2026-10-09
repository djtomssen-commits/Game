(function(){
  'use strict';
  function ensureDecor(){
    const c=document.getElementById('character');
    if(!c)return;
    const root=c.querySelector('#v510HeroRoot');
    if(!root)return;
    if(!root.querySelector('.v526-vine.left')){
      const l=document.createElement('i');l.className='v526-vine left';l.setAttribute('aria-hidden','true');root.appendChild(l);
      const r=document.createElement('i');r.className='v526-vine right';r.setAttribute('aria-hidden','true');root.appendChild(r);
    }
    if(!root.querySelector('.v526-corner.tl')){
      ['tl','tr','bl','br'].forEach(pos=>{const el=document.createElement('i');el.className='v526-corner '+pos;el.setAttribute('aria-hidden','true');root.appendChild(el)});
    }
    /* V7124 is the later authoritative marker; Beta must not alternate it. */
    const beta=String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta';
    if(!beta||!(window.__V7124_CHARACTER_SUMMARY_OWNER__&&
        root.getAttribute('data-hero-layout')==='reference-v7124')){
      if(!beta||root.getAttribute('data-hero-layout')!=='reference-v526')
        root.setAttribute('data-hero-layout','reference-v526');
    }
  }
  function apply(fromCharacterNavigation=false){
    if(!document.getElementById('character')?.classList.contains('active'))return false;
    /* v525 delegates to v7154, which rebuilds the hero. Original v510/v514
       have already handled this navigation before the ornamental listener. */
    const skipOldSettle=fromCharacterNavigation&&
      String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta'&&
      window.__v510GoWrapped==='v7119-event'&&
      window.__v514GoWrapped==='v7119-event'&&
      !!document.querySelector('#character #v510HeroRoot .v510-layout');
    if(!skipOldSettle)try{window.v525ApplyHero?.()}catch(e){}
    ensureDecor();
  }
  window.v526ApplyHero=apply;
  let navTime={at:0,cpuMs:0};
  window.v526CharacterNavDiagnostics=()=>({...navTime});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    if(String(e?.detail?.id||'')!=='character')return;
    const beta=String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta';
    const start=beta?(performance.now?.()||Date.now()):0;
    apply(true);
    if(beta)navTime={at:Date.now(),cpuMs:Math.round((performance.now?.()||Date.now())-start)};
  },{passive:true});
  apply();
  document.addEventListener('DOMContentLoaded',apply,{once:true});
  window.addEventListener('pageshow',apply,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply()});
  /* V8.009: direct lifecycle only. */
})();
