/* ===== V4.02 comparison on the ACTUAL v057 shop renderer ===== */

function v090Score(it){
  if(!it)return 0;
  try{window.v447ApplyItemCurve?.(it)}catch(e){}
  if(typeof window.v4103TotalCompareScore==='function')return window.v4103TotalCompareScore(it);

  const lock=it?.v429StatLock?.native;
  const base=lock&&typeof lock==='object'?{...lock}:{...(it?.bonus||{})};
  const gem=it?.gem;
  const ench=it?.enchant||(Array.isArray(it?.enchants)&&it.enchants.length?it.enchants[0]:null);
  if(!lock){
    if(gem?.stat&&Number(gem.value))base[gem.stat]=(Number(base[gem.stat])||0)-Number(gem.value);
    if(ench?.effect==='luck'&&Number(ench.value))base.glueck=(Number(base.glueck)||0)-Number(ench.value);
  }

  const cls=String(s?.playerClass||it?.classId||'grower');
  const primary=cls==='scout'?'geschick':(cls==='bruiser'||cls==='summoner')?'intelligenz':'staerke';
  const weights={staerke:.35,geschick:.35,intelligenz:.35,ausdauer:2,glueck:1,ruestung:1.2,armor:1.2};
  weights[primary]=6;
  let total=Object.entries(base).reduce((sum,[k,v])=>sum+(Number(v)||0)*(weights[k]??1),0);

  if(gem?.stat&&Number(gem.value))total+=Number(gem.value)*(weights[gem.stat]??1);
  const v=Number(ench?.value)||0;
  if(ench?.effect==='primaryPct')total+=v*3.2;
  else if(ench?.effect==='crit')total+=v*1.7;
  else if(ench?.effect==='damageReduce')total+=v*2.2;
  else if(ench?.effect==='luck')total+=v;

  return Math.round(total*10)/10;
}

function v090ComparisonHtml(it){
  if(!it?.slot)return '';

  if(it.classId && it.classId!==s.playerClass){
    return `<div class="v090-shop-compare worse">Nicht für deine Klasse</div>`;
  }

  const old=s.equipment?.[it.slot];

  if(!old){
    return `<div class="v090-shop-compare empty">▲ Slot leer · Verbesserung</div>`;
  }

  try{window.v447ApplyItemCurve?.(it);window.v447ApplyItemCurve?.(old)}catch(e){}
  const neu=v090Score(it);
  const alt=v090Score(old);
  const diff=Math.round((neu-alt)*10)/10;

  if(diff>0){
    return `<div class="v090-shop-compare better">▲ BESSER · +${diff} Gesamtwerte</div>`;
  }

  if(diff<0){
    return `<div class="v090-shop-compare worse">▼ SCHLECHTER · ${diff} Gesamtwerte</div>`;
  }

  return `<div class="v090-shop-compare same">= GLEICHWERTIG</div>`;
}

/* Override the actual offer renderer used by V4.02+ */
v057OfferHtml=function(it,i,kind){
  const info=it.type==='gem'
    ? `💎 +${it.value} ${v030StatLabel(it.stat)}`
    : it.type==='scroll'
      ? `✨ ${v030EffectLabel(it.effect,it.value)}`
      : itemBonus(it);

  const comparison=(it.type==='gem'||it.type==='scroll')
    ? ''
    : v090ComparisonHtml(it);

  return `
    <div class="shop-item ${it.rarity||''}">
      <div class="shop-icon">${it.icon||'🎁'}</div>
      <h3>${it.name}</h3>
      <div class="${qualityMeta(it.quality||'gray').color}">
        ${qualityMeta(it.quality||'gray').label}
      </div>
      <div class="tiny" style="margin-top:5px">${info}</div>
      ${comparison}
      <div class="price" style="margin:7px 0">💰 ${it.price} Gold</div>
      <button type="button" class="btn v057-buy" data-kind="${kind}" data-index="${i}">
        Kaufen
      </button>
    </div>`;
};

/* V8.009: duplicate global render -> renderShop repaint retired.
   v057OfferHtml already contains the comparison markup at construction time. */
