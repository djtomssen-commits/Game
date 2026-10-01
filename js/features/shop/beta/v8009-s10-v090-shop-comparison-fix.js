/* ===== V4.02 comparison on the ACTUAL v057 shop renderer ===== */

function v090Score(it){
  if(!it)return 0;

  const weights={
    staerke:1,
    geschick:1,
    intelligenz:1,
    ausdauer:1,
    glueck:.8,

  };

  let total=0;
  Object.entries(it.bonus||{}).forEach(([k,v])=>{
    total+=(Number(v)||0)*(weights[k]??1);
  });

  if(it.gem?.value)total+=(Number(it.gem.value)||0);

  const enchants=Array.isArray(it.enchants)
    ? it.enchants
    : it.enchant ? [it.enchant] : [];

  enchants.forEach(e=>{
    const v=Number(e?.value)||0;
    if(e?.effect==='primaryPct')total+=v*1.4;
    else if(e?.effect==='crit')total+=v;
    else if(e?.effect==='damageReduce')total+=v*1.1;
    else total+=v*.8;
  });

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

const v090BaseRender=render;
render=function(){
  v090BaseRender();
  
  try{renderShop()}catch(e){console.error('V4.02 shop comparison',e)}
};

try{renderShop()}catch(e){}
