(function(){
  'use strict';
  function apply(){
    if(!document.getElementById('character')?.classList.contains('active'))return false;
    const card=document.getElementById('v459AttrCard');
    const panel=document.getElementById('v459PanelAttributes');
    if(!card||!panel)return false;
    const head=card.querySelector(':scope > .v459-panel-head');
    if(head&&!head.classList.contains('v537-attr-head')){
      const points=head.querySelector('#v459AttrPoints')||document.createElement('span');
      points.id='v459AttrPoints';
      head.textContent='';
      head.classList.add('v537-attr-head');
      const wrap=document.createElement('div');wrap.className='v537-attr-title-wrap';
      wrap.innerHTML='<h2 class="v537-attr-title">ATTRIBUTE</h2><div class="v537-attr-sub">DEINE WERTE · STÄRKER WERDEN · MEHR MÖGLICHKEITEN</div>';
      head.append(wrap,points);
    }
    const details=document.getElementById('v459SetDetails');
    const sm=details?.querySelector(':scope > summary');
    if(sm&&!sm.querySelector('.v537-set-title')){
      sm.textContent='';
      const title=document.createElement('span');title.className='v537-set-title';title.textContent='Set-Boni ansehen';
      const sub=document.createElement('span');sub.className='v537-set-sub';sub.textContent='Aktive Boni durch deine Ausrüstung';
      sm.append(title,sub);
    }
    if(String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()!=='beta'||
       card.dataset.attributeLayout!=='reference-v537')
      card.dataset.attributeLayout='reference-v537';
    return true;
  }
  window.v537ApplyAttributes=apply;
  let navTime={at:0,cpuMs:0};
  window.v537CharacterNavDiagnostics=()=>({...navTime});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    if(String(e?.detail?.id||'')!=='character')return;
    const beta=String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta';
    const start=beta?(performance.now?.()||Date.now()):0;
    apply();
    if(beta)navTime={at:Date.now(),cpuMs:Math.round((performance.now?.()||Date.now())-start)};
  });
  apply();
  document.addEventListener('DOMContentLoaded',apply,{once:true});
  window.addEventListener('pageshow',apply,{passive:true});
  document.addEventListener('click',e=>{if(e.target?.closest?.('#v459CharacterTabs [data-tab="attributes"],#v514HeroTabs [data-tab="attributes"]'))requestAnimationFrame(apply)},true);
  /* V8.009: bounded startup retry train retired. */
})();
