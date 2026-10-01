(function(){
  const V7221_BAG_ART = {
    current: "assets/v8-inline/d8723279ac61b4e0.webp",
    premium: "assets/v8-inline/8fe8c1cde9fe6262.webp"
  };
  window.v7221BagArt = function(b, isNext){
    b=b||{};
    const t = Number(b.target)||0;
    const title = String(b.title||'').toLowerCase();
    const sub = String(b.subtitle||'').toLowerCase();
    const rarity = String(b.rarity||'').toLowerCase();
    if(isNext) return V7221_BAG_ART.premium;
    if(title.includes('legend')||title.includes('edel')||title.includes('premium')||sub.includes('premium')||rarity==='orange'||rarity==='purple'||t>=10) return V7221_BAG_ART.premium;
    return V7221_BAG_ART.current;
  };
  window.v7219PackHtml = function(b, extra=''){
    b=b||{};
    const isNext = String(extra||'').includes('next');
    const art = window.v7221BagArt(b, isNext);
    const caption = String(b.title || (isNext ? 'Nächstes Tütchen' : 'Tütchen'));
    const target = Math.max(0, Number(b.target)||0);
    const meta = isNext && target ? `${target} bestätigte Videos` : (b.subtitle ? String(b.subtitle) : '');
    return `<div class="v7219-pack ${v7219RarityClass(b.rarity)} ${extra}" style="--bag-art:url('${art}')">
      <div class="v7221-pack-art" aria-hidden="true"></div>
      <div class="v7221-pack-footer">
        <div class="v7221-pack-title">${caption}</div>
        ${meta ? `<div class="v7221-pack-meta">${meta}</div>` : ''}
      </div>
    </div>`;
  };
  const _origOpen = window.v7215BagDealerOpen;
  window.v7215BagDealerOpen = function(){
    const root = document.getElementById('v7215BagBody');
    if(root){
      root.innerHTML = '<div class="v7219-loading-card"><div class="v7219-loading-bag">🌿</div><b>Dealer holt dein Tütchen aus dem Regal …</b><span>Belohnung, Fortschritt und das nächste Tütchen werden geladen.</span></div>';
    }
    return _origOpen ? _origOpen() : window.v7215Load?.(true);
  };
})();
