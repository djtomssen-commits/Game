(function(){
  const VERSION='V4.34 Stable', SHORT='V4.34';
  const ATTRS={
    staerke:'stärke',
    geschick:'geschick',
    intelligenz:'intelligenz',
    ausdauer:'ausdauer',
    glueck:'glück'
  };

  function available(){
    return Math.max(0,Math.floor(Number(s?.points)||0));
  }

  function ensureBadge(){
    /* V6.320: legacy v419 badge retired; v4140 owns the visible attribute-point header. */
    document.getElementById('v419AttrPoints')?.remove();
    return null;
  }

  function attrKeyFor(el){
    const txt=String(el?.textContent||'').toLowerCase();
    return Object.keys(ATTRS).find(k=>txt.includes(ATTRS[k]))||null;
  }

  function paint(){
    const pts=available();

    const top=document.querySelector('#points');
    if(top)top.textContent=String(pts);

    const badge=ensureBadge();
    if(badge){
      badge.classList.toggle('v419-empty',pts<1);
      badge.innerHTML=`<span class="v419-label">ATTRIBUTPUNKTE VERFÜGBAR</span><span class="v419-value"><span class="v419-dot"></span>${pts}</span>`;
    }

    const attrs=document.querySelector('#attrs');
    if(attrs){
      [...attrs.children].forEach(row=>{
        const key=attrKeyFor(row);
        if(key){
          let val=0;
          try{val=Math.round(Number(totalAttr(key))||0)}catch(e){val=Math.round(Number(s?.attrs?.[key])||0)}
          const modern=row.querySelector('.v125-attr-value');
          if(modern)modern.textContent=String(val);
          const legacy=row.querySelector('b');
          if(legacy)legacy.textContent=String(val);
        }
        const btn=row.querySelector('button');
        if(btn)btn.disabled=pts<1;
      });
    }
  }
  window.v434PaintAttributePoints=paint;

  /* Outermost attribute-spend owner. Later historical wrappers may remain for
     compatibility, but after they finish the visible state is repainted from s. */
  if(typeof incAttr==='function'&&!window.__v434IncAttrWrapped){
    const baseIncAttr=incAttr;
    incAttr=function(k){
      if(!Object.prototype.hasOwnProperty.call(ATTRS,k))return;
      const before=available();
      if(before<1){paint();return;}
      const r=baseIncAttr.apply(this,arguments);
      paint();
      requestAnimationFrame(paint);
      setTimeout(paint,20);
      setTimeout(paint,90);
      return r;
    };
    try{window.incAttr=incAttr}catch(e){}
    window.__v434IncAttrWrapped=true;
  }

  /* Point gains/spends from level-up/admin/other systems also repaint immediately
     after the normal persistence chain finishes. */
  if(typeof persist==='function'&&!window.__v434PersistWrapped){
    const basePersist=persist;
    persist=function(){
      const r=basePersist.apply(this,arguments);
      paint();
      requestAnimationFrame(paint);
      return r;
    };
    try{window.persist=persist}catch(e){}
    window.__v434PersistWrapped=true;
  }

  /* Safety net for any direct legacy + button that bypasses the global wrapper. */
  document.addEventListener('click',e=>{
    if(!e.target?.closest?.('#attrs button'))return;
    requestAnimationFrame(paint);
    setTimeout(paint,30);
    setTimeout(paint,100);
  },true);

  function stamp(){}

  paint();stamp();
  /* V8.009: delayed startup paints retired; direct spend/persist/lifecycle hooks own updates. */
  document.addEventListener('DOMContentLoaded',()=>{paint();stamp()},{once:true});
  window.addEventListener('pageshow',()=>{paint();stamp()},{passive:true});
  setTimeout(()=>{paint();stamp()},800);
  setTimeout(()=>{paint();stamp()},3500);
})();
