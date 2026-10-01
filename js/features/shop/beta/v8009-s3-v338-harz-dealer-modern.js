(function(){
  const V338_VERSION='V4.29 Stable';

  function v338Saving(p){
    try{return Math.max(0,Math.round((1-(p.price/((p.harz/25)*1.99)))*100))}catch(e){return 0}
  }

  function v338ModernizeDealer(){
    const screen=document.querySelector('#harzDealer');
    if(!screen)return;
    const card=screen.querySelector('.v322-dealer-card');
    const box=screen.querySelector('#v322DealerPackages');
    const oldHead=screen.querySelector('.v322-dealer-head');
    if(!card||!box)return;

    if(!screen.querySelector('.v338-hero')){
      const hero=document.createElement('div');
      hero.className='v338-hero';
      hero.innerHTML=`
        <div class="v338-hero-main">
          <div class="v338-title-wrap">
            <div class="v338-kicker">✦ PREMIUM-WÄHRUNG · GROW LEGENDS</div>
            <h2 class="v338-title">Harz Dealer</h2>
            <p class="v338-sub">Hol dir Harz-Taler für zusätzliche Dungeon-Versuche, Komfortfunktionen und besondere Spielmomente. Größere Pakete bieten einen besseren Preis pro Harz-Taler.</p>
          </div>
          <div class="v338-balance">
            <span>Dein Bestand</span>
            <strong><span id="v338DealerHarz">0</span> 💎</strong>
          </div>
        </div>
        <div class="v338-benefits">
          <div class="v338-benefit"><b>⚔️ Sofort weiterspielen</b><small>Zusätzliche Dungeon-Versuche ohne auf den kostenlosen Timer zu warten.</small></div>
          <div class="v338-benefit"><b>✨ Besserer Paketwert</b><small>Je größer das Paket, desto günstiger wird ein einzelner Harz-Taler.</small></div>
          <div class="v338-benefit"><b>🌿 Unterstützt das Projekt</b><small>Premium-Käufe sollen die Weiterentwicklung von Grow Legends unterstützen.</small></div>
        </div>
      `;
      card.insertBefore(hero,oldHead||card.firstChild);
      if(oldHead)oldHead.style.display='none';
    }

    if(!screen.querySelector('.v338-featured') && typeof V322_HARZ_PACKAGES!=='undefined'){
      const p=V322_HARZ_PACKAGES[4]||V322_HARZ_PACKAGES[0];
      const idx=V322_HARZ_PACKAGES.indexOf(p);
      const featured=document.createElement('div');
      featured.className='v338-featured';
      featured.innerHTML=`
        <div class="v338-section-label">Beliebtes Paket</div>
        <div class="v338-feature-card">
          <div>
            <h3>💎 ${p.harz} Harz-Taler</h3>
            <p>Ein ausgewogenes Paket für Spieler, die regelmäßig Dungeons, Events und Komfortfunktionen nutzen.</p>
          </div>
          <div class="v338-feature-price">
            <div class="amt">${p.harz} Harz</div>
            <div class="price">${v322Money(p.price)}</div>
            <div class="save">${v338Saving(p)>0?`ca. ${v338Saving(p)}% günstiger als der 25er-Preis`:'Guter Einstieg'}</div>
            <button type="button" class="btn gold" data-v338-feature-buy="${idx}" style="margin-top:9px;min-width:150px">Paket ansehen</button>
          </div>
        </div>
      `;
      box.parentNode.insertBefore(featured,box);
      featured.querySelector('[data-v338-feature-buy]')?.addEventListener('click',()=>{
        const target=box.querySelector(`[data-v322-buy="${idx}"]`);
        if(target){
          target.closest('.v322-pack')?.scrollIntoView({behavior:'smooth',block:'center'});
          target.closest('.v322-pack')?.animate(
            [{transform:'scale(1)'},{transform:'scale(1.025)'},{transform:'scale(1)'}],
            {duration:520,easing:'ease-out'}
          );
        }
      });
    }

    if(!screen.querySelector('.v338-bottom-info')){
      const info=document.createElement('div');
      info.className='v338-bottom-info';
      info.innerHTML=`
        <div class="v338-info-box"><b>🛡️ Transparente Preise</b><span>Preis, Paketgröße und Preis pro Harz-Taler werden direkt angezeigt.</span></div>
        <div class="v338-info-box"><b>⏱️ Direkt verfügbar</b><span>Sobald eine echte Zahlungsanbindung eingerichtet ist, sollen gekaufte Harz-Taler unmittelbar verfügbar sein.</span></div>
        <div class="v338-info-box"><b>ℹ️ Aktueller Status</b><span>Der Zahlungsanbieter ist noch nicht verbunden. Der Kaufen-Button führt deshalb derzeit keine Echtgeldzahlung aus.</span></div>
      `;
      const note=screen.querySelector('.v322-pay-note');
      if(note)note.parentNode.insertBefore(info,note);
      else card.appendChild(info);
    }

    const bal=Math.max(0,Number(s.harzTaler)||0);
    const balNew=screen.querySelector('#v338DealerHarz');
    if(balNew)balNew.textContent=bal.toLocaleString('de-DE');
  }

  /* V8.009: retired. v567 is the canonical Harz dealer visual owner.
     Keep this file only for legacy function compatibility; do not rebuild hidden
     dealer DOM or rewrite the global version from old V4.29 lifecycle hooks. */
  window.__V338_DEALER_VISUAL_OWNER__='retired-v567';
})();
