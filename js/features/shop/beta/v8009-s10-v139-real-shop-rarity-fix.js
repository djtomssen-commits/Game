/* Rendert direkt die Funktion, die der aktuelle Händler wirklich benutzt. */
function v139QualityClass(q){
  return {
    gray:'v139-gray',
    green:'v139-green',
    blue:'v139-blue',
    purple:'v139-purple',
    orange:'v139-orange',
    cyan:'v139-cyan'
  }[q]||'v139-gray';
}

function v139ActualOffer(it,i,kind){
  const q=it?.quality||'gray';
  const info=it.type==='gem'
    ? `💎 +${it.value} ${v030StatLabel(it.stat)}`
    : it.type==='scroll'
      ? `✨ ${v030EffectLabel(it.effect,it.value)}`
      : itemBonus(it);

  const comparison=(it.type==='gem'||it.type==='scroll')
    ? ''
    : (typeof v090ComparisonHtml==='function' ? v090ComparisonHtml(it) :
       typeof v089ShopComparison==='function' ? v089ShopComparison(it) : '');

  const qm=qualityMeta(q);

  return `
    <div class="shop-item ${it.rarity||''} ${v139QualityClass(q)}">
      <div class="shop-icon">${it.icon||'🎁'}</div>
      <h3>${it.name}</h3>
      <div class="v139-quality">${qm.label}</div>
      <div class="tiny" style="margin-top:5px">${info}</div>
      ${comparison}
      <div class="price" style="margin:7px 0">💰 ${it.price} Gold</div>
      <button type="button" class="btn v057-buy" data-kind="${kind}" data-index="${i}">Kaufen</button>
    </div>`;
}

/* Override NACH V4.02: das ist die tatsächlich verwendete Funktion. */
v057OfferHtml=v139ActualOffer;

/* Auch ältere Renderer, falls irgendwo noch benutzt. */
v030Offer=function(it,fn,i){
  const q=it?.quality||'gray';
  const info=it.type==='gem'
    ? `💎 +${it.value} ${v030StatLabel(it.stat)}`
    : it.type==='scroll'
      ? `✨ ${v030EffectLabel(it.effect,it.value)}`
      : itemBonus(it);
  const comparison=(it.type==='gem'||it.type==='scroll')?'':(typeof v090ComparisonHtml==='function'?v090ComparisonHtml(it):'');
  return `
    <div class="shop-item ${it.rarity||''} ${v139QualityClass(q)}">
      <div class="shop-icon">${it.icon||'🎁'}</div>
      <h3>${it.name}</h3>
      <div class="v139-quality">${qualityMeta(q).label}</div>
      <div class="tiny" style="margin-top:5px">${info}</div>
      ${comparison}
      <div class="price" style="margin:7px 0">💰 ${it.price} Gold</div>
      <button class="btn" style="width:100%;padding:8px" onclick="${fn}(${i})">Kaufen</button>
    </div>`;
};

function v139RepaintShop(){
  try{renderShop()}catch(e){console.error('V4.02 shop repaint',e)}
  
}

const v139BaseRender=render;
render=function(){
  const r=v139BaseRender();
  if(document.querySelector('#shop')?.classList.contains('active'))requestAnimationFrame(v139RepaintShop);
  return r;
};

setTimeout(v139RepaintShop,180);
