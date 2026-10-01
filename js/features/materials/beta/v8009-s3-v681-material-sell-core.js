(function(){
'use strict';
if(window.__V681_MATERIAL_SELL__)return;
window.__V681_MATERIAL_SELL__=true;

const SALE_RATE=.40; // Händler kauft Materialien für 40 % des Kaufwerts zurück.

function qNorm(m){
  const q=String(m?.quality||'').toLowerCase();
  if(['gray','green','blue','purple','orange','cyan'].includes(q))return q;
  const r=String(m?.rarity||'').toLowerCase();
  if(/myst|cyan/.test(r))return'cyan';
  if(/legend|orange/.test(r))return'orange';
  if(/epic|purple/.test(r))return'purple';
  if(/rare|blue/.test(r))return'blue';
  if(/green|uncommon/.test(r))return'green';
  return'gray';
}

function purchaseValue(m){
  const stored=Math.round(Number(m?.price)||0);
  if(stored>0)return stored;

  // Fallback für sehr alte/gedroppte Materialien ohne gespeicherten Preis.
  const q=qNorm(m);
  const v=Math.max(1,Number(m?.value)||1);

  if(m?.type==='gem'){
    const mult={gray:1,green:1.45,blue:2.45,purple:4.4,orange:6.2,cyan:8.2}[q]||1;
    return Math.max(10,Math.round((75+v*38)*mult));
  }
  if(m?.type==='scroll'){
    const mult={gray:1,green:1.5,blue:2.6,purple:4.7,orange:6.5,cyan:8.5}[q]||1;
    return Math.max(10,Math.round((95+v*48)*mult));
  }
  return 10;
}

function sellValue(m){
  const buy=purchaseValue(m);
  // Immer klar unter Einkaufspreis, auch bei sehr kleinen Werten.
  return Math.max(1,Math.min(buy-1,Math.floor(buy*SALE_RATE)));
}

window.v681MaterialPurchaseValue=purchaseValue;
window.v681MaterialSellValue=sellValue;

window.v681SellMaterial=async function(index){
  index=Number(index);
  if(!Number.isInteger(index)||index<0)return;

  const m=s?.materials?.[index];
  if(!m||!['gem','scroll'].includes(m.type))return;

  const buy=purchaseValue(m);
  const sell=sellValue(m);
  const type=m.type==='gem'?'Edelstein':'Verzauberungsrolle';

  const ok=typeof v115Confirm==='function'
    ? await v115Confirm(
        `${m.name}\n\nKaufwert: ${buy} Gold\nHändler zahlt: ${sell} Gold (40 %)\n\n${type} wirklich verkaufen?`,
        {title:`${type} verkaufen?`,type:'warn',okText:`Für ${sell} Gold verkaufen`}
      )
    : confirm(`${m.name} für ${sell} Gold verkaufen?`);

  if(!ok)return;

  const current=s?.materials?.[index];
  if(!current)return;

  s.gold=(Number(s.gold)||0)+sell;
  s.materials.splice(index,1);

  try{persist()}catch(e){
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
  }

  try{
    if(typeof v063Toast==='function'){
      v063Toast('💰 Material verkauft','success',`${m.name} · +${sell} Gold`);
    }
  }catch(e){}

  requestAnimationFrame(()=>{
    try{window.v546RenderMaterials?.()}catch(e){}
    try{window.v546ArrangeMaterials?.()}catch(e){}
  });
};

function enhance(){
  const panel=document.querySelector('#character #v030Materials');
  if(!panel)return;

  panel.querySelectorAll('.v546-material-item').forEach(card=>{
    const use=card.querySelector('.v546-use[data-index]');
    if(!use)return;

    const index=Number(use.dataset.index);
    const m=s?.materials?.[index];
    if(!m||!['gem','scroll'].includes(m.type))return;

    // Render läuft häufig neu; Werte deshalb jedes Mal aktuell setzen.
    let value=card.querySelector('.v681-material-value');
    if(!value){
      value=document.createElement('div');
      value.className='v681-material-value';
      const bonus=card.querySelector('.v546-material-bonus');
      if(bonus)bonus.insertAdjacentElement('afterend',value);
      else card.appendChild(value);
    }

    const buy=purchaseValue(m);
    const sell=sellValue(m);
    value.innerHTML=`Kaufwert <b>${buy}</b> · Verkauf <b>💰 ${sell}</b>`;

    let actions=card.querySelector('.v681-material-actions');
    if(!actions){
      actions=document.createElement('div');
      actions.className='v681-material-actions';
      use.insertAdjacentElement('beforebegin',actions);
      actions.appendChild(use);
    }else if(use.parentElement!==actions){
      actions.insertBefore(use,actions.firstChild);
    }

    let btn=actions.querySelector('.v681-sell');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.className='btn v681-sell';
      actions.appendChild(btn);
    }
    btn.dataset.index=String(index);
    btn.innerHTML=`💰 Verkaufen<br>${sell} Gold`;
    btn.onclick=e=>{
      e.preventDefault();
      e.stopPropagation();
      window.v681SellMaterial(btn.dataset.index);
    };
  });
}

// Current material renderer is replaced in V5.46 and also rerenders itself from
// filters/tabs. Observe only this panel so sell controls survive every rerender.
let scheduled=false;
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;enhance()});
}

function observe(){
  const panel=document.querySelector('#character #v030Materials');
  if(!panel)return false;
  /* V7.308: retired subtree MutationObserver. v546RenderMaterials now drives this explicitly. */
  enhance();
  return true;
}
window.v681EnhanceMaterials=enhance;

/* v546RenderMaterials is the single post-render owner for sell controls.
   Keep one initial attach for already-present DOM only. */
document.addEventListener('DOMContentLoaded',observe,{once:true});
})();
