/* ===== V4.02 show whether shop gear is better than equipped ===== */

function v089ItemScore(it){
  if(!it)return 0;

  let score=0;
  const weights={
    staerke:1,
    geschick:1,
    intelligenz:1,
    ausdauer:1,
    glueck:.8,

  };

  Object.entries(it.bonus||{}).forEach(([k,v])=>{
    score+=(Number(v)||0)*(weights[k]??1);
  });

  /* Include gem/enchant bonuses already stored on the item. */
  if(it.gem?.value)score+=(Number(it.gem.value)||0);
  (it.enchants||[]).forEach(e=>{
    if(e.effect==='primaryPct')score+=(Number(e.value)||0)*1.4;
    else if(e.effect==='crit')score+=(Number(e.value)||0)*1.0;
    else if(e.effect==='damageReduce')score+=(Number(e.value)||0)*1.1;
    else score+=(Number(e.value)||0)*.8;
  });

  return Math.round(score*10)/10;
}

function v089ShopComparison(it){
  if(!it?.slot)return '';

  if(it.classId && it.classId!==s.playerClass){
    return `<div class="v089-shop-compare worse">Nicht für deine Klasse</div>`;
  }

  const equipped=s.equipment?.[it.slot];

  if(!equipped){
    return `<div class="v089-shop-compare empty">▲ Slot leer · Verbesserung möglich</div>`;
  }

  const newScore=v089ItemScore(it);
  const oldScore=v089ItemScore(equipped);
  const diff=Math.round((newScore-oldScore)*10)/10;

  if(diff>0){
    return `<div class="v089-shop-compare better">▲ BESSER · +${diff} Gesamtwerte</div>`;
  }

  if(diff<0){
    return `<div class="v089-shop-compare worse">▼ SCHLECHTER · ${diff} Gesamtwerte</div>`;
  }

  return `<div class="v089-shop-compare same">= GLEICHWERTIG</div>`;
}

/* Replace the current shop offer renderer so comparison appears on every gear/jewelry card.
   Materials like gems/scrolls stay unchanged. */
v030Offer=function(it,fn,i){
  const info=it.type==='gem'
    ? `💎 +${it.value} ${v030StatLabel(it.stat)}`
    : it.type==='scroll'
      ? `✨ ${v030EffectLabel(it.effect,it.value)}`
      : itemBonus(it);

  const compare=(it.type==='gem'||it.type==='scroll')
    ? ''
    : v089ShopComparison(it);

  return `
    <div class="shop-item ${it.rarity||''}">
      <div class="shop-icon">${it.icon||'🎁'}</div>
      <h3>${it.name}</h3>
      <div class="${qualityMeta(it.quality||'gray').color}">
        ${qualityMeta(it.quality||'gray').label}
      </div>
      <div class="tiny" style="margin-top:5px">${info}</div>
      ${compare}
      <div class="price" style="margin:7px 0">💰 ${it.price} Gold</div>
      <button class="btn" style="width:100%;padding:8px" onclick="${fn}(${i})">Kaufen</button>
    </div>`;
};

/* V8.009: global render -> renderShop wrapper retired.
   Comparison is generated directly by the active offer renderer and therefore
   does not need a second full shop rebuild after every global render. */
