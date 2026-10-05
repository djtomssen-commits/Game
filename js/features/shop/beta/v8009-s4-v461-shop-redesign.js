(function(){
  const VERSION='V4.67 Stable',SHORT='V4.67';
  function n(v){return Number(v)||0}
  function fmt(v){return n(v).toLocaleString('de-DE')}
  function syncVersion(){
    try{document.querySelectorAll('.version').forEach(el=>el.textContent=VERSION)}catch(e){}
    try{document.title=document.title.replace(/V4\.(59|60|61)/g,'V4.67')}catch(e){}
  }
  function refillOne(which){
    if(n(s?.harzTaler)<1){
      try{
        if(typeof v054Toast==='function')return v054Toast('❌ Du brauchst 1 Harz-Taler','error');
        if(typeof v115Alert==='function')return v115Alert('Du brauchst 1 Harz-Taler.');
      }catch(e){}
      return;
    }
    s.harzTaler=n(s.harzTaler)-1;
    if(which==='weapon')s.weaponShop=[];
    if(which==='magic')s.magicShop=[];
    try{
      if(typeof v057FillShops==='function')v057FillShops(false);
      else if(typeof v030Fill==='function')v030Fill(false);
    }catch(e){console.error('V4.67 refillOne fill',which,e)}
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    try{if(typeof v075ScheduleSave==='function')v075ScheduleSave()}catch(e){}
    try{renderShop()}catch(e){console.error('V4.67 refillOne render',e)}
    try{if(typeof window.v441PaintResources==='function')window.v441PaintResources()}catch(e){}
    try{
      if(typeof v054Toast==='function'){
        const msg=which==='weapon'?'⚔️ Waffenhändler neu gewürfelt':'💎 Schmuckhändler neu gewürfelt';
        const sub=which==='weapon'?'1 Harz-Taler verwendet. Waffen & Rüstung wurden ersetzt.':'1 Harz-Taler verwendet. Schmuck, Edelsteine und Rollen wurden ersetzt.';
        v054Toast(msg,'success',sub);
      }
    }catch(e){}
  }
  window.v461RerollShopSection=refillOne;

  let v461ServerShopRefreshPending=false;
  function v461ServerShopReady(){
    try{
      const uid=String((typeof v073User!=='undefined'&&v073User?.id)||'');
      if(!uid)return true;
      if(typeof window.v7063ItemStageDiagnostics!=='function')return false;
      const d=window.v7063ItemStageDiagnostics();
      return !!(d?.ready&&d?.enabled);
    }catch(_){return false}
  }
  function v461RequestServerShop(){
    if(v461ServerShopRefreshPending)return;
    if(typeof window.v7063ItemStageRefresh!=='function')return;
    v461ServerShopRefreshPending=true;
    Promise.resolve(window.v7063ItemStageRefresh(true))
      .catch(()=>false)
      .finally(()=>{
        v461ServerShopRefreshPending=false;
        try{
          if(document.getElementById('shop')?.classList.contains('active'))window.renderShop?.();
        }catch(_){}
      });
  }
  function v461LoadingHtml(){
    return `
      <div class="v461-shop-head">
        <div>
          <h2>⚔️ Waffen & Rüstung</h2>
          <div class="muted">Händlerbestand wird mit dem Server abgeglichen …</div>
        </div>
        <div class="v461-shop-count">…</div>
      </div>
      <div class="empty" style="padding:22px 12px;text-align:center">⏳ Händlerangebote werden geladen …</div>`;
  }

  function bindBuys(scope){
    (scope||document).querySelectorAll('.v057-buy').forEach(btn=>{
      const i=Number(btn.dataset.index);
      btn.onclick=()=>{
        if(btn.dataset.kind==='weapon')window.v030BuyWeapon(i);
        else window.v030BuyMagic(i);
      };
    });
  }

  const baseOffer=window.v057OfferHtml;
  function upgradedOffer(it,i,kind){
    return baseOffer?baseOffer(it,i,kind):'';
  }

  renderShop=function(){
    try{if(typeof v057FillShops==='function')v057FillShops(false)}catch(e){}
    const shop=document.querySelector('#shop');
    if(!shop)return;

    /* V8.102 canonical shop ownership:
       #shop is an empty shell in beta/server1 HTML. Only the current v461/v464
       structures may exist as direct children. Any other direct child is a
       legacy producer and must not survive a canonical render. */
    const allowedDirectIds=new Set(['v461ShopHero','v464ShopTabs','v057GearShopCard','v030MagicShop']);
    [...shop.children].forEach(el=>{
      if(!allowedDirectIds.has(String(el.id||'')))el.remove();
    });

    let gearCard=document.querySelector('#v057GearShopCard');
    if(!gearCard){
      gearCard=document.createElement('div');
      gearCard.className='card v461-shop-card';
      gearCard.id='v057GearShopCard';
      shop.appendChild(gearCard);
    }
    gearCard.className='card v461-shop-card';

    let hero=document.querySelector('#v461ShopHero');
    if(!hero){
      hero=document.createElement('div');
      hero.id='v461ShopHero';
      hero.className='card v461-shop-hero';
      shop.insertBefore(hero,shop.firstChild);
    }
    hero.innerHTML=`
      <div class="v461-shop-kicker">🏪 Händlergasse</div>
      <h2>Nebelmarkt von Grünhain</h2>
      <div class="muted">Mehr Übersicht, weniger Leerlauf. Zwei getrennte Händlerbereiche mit eigenem Neu-Würfeln: einmal für Waffen & Rüstung und einmal für Schmuck, Edelsteine & Rollen.</div>
      <div class="v461-shop-resource-row">
        <div class="v461-shop-resource">🪙 Gold <b id="shopGold">${fmt(s.gold)}</b></div>
        <div class="v461-shop-resource">🟢 Harz-Taler <b id="shopHarz">${fmt(s.harzTaler)}</b></div>
      </div>`;

    const v461StockReady=Array.isArray(s?.weaponShop)&&s.weaponShop.length>0&&Array.isArray(s?.magicShop)&&s.magicShop.length>0;
    if(!v461ServerShopReady()||!v461StockReady){
      gearCard.innerHTML=v461LoadingHtml();
      let magic=document.querySelector('#v030MagicShop');
      if(!magic){
        magic=document.createElement('div');
        magic.className='card v461-shop-card';
        magic.id='v030MagicShop';
        shop.appendChild(magic);
      }
      magic.className='card v461-shop-card';
      magic.innerHTML=`
        <div class="v461-shop-head">
          <div>
            <h2>💎 Schmuck, Edelsteine & Rollen</h2>
            <div class="muted">Händlerbestand wird mit dem Server abgeglichen …</div>
          </div>
          <div class="v461-shop-count">…</div>
        </div>
        <div class="empty" style="padding:22px 12px;text-align:center">⏳ Händlerangebote werden geladen …</div>`;
      v461RequestServerShop();
      syncVersion();
      try{if(typeof window.v441PaintResources==='function')window.v441PaintResources()}catch(e){}
      return true;
    }

    gearCard.innerHTML=`
      <div class="v461-shop-head">
        <div>
          <h2>⚔️ Waffen & Rüstung</h2>
          <div class="muted">Direkt für Kämpfe. Nach dem Kauf wird nur der gekaufte Slot ersetzt.</div>
        </div>
        <div class="v461-shop-count">${(s.weaponShop||[]).length} Angebote</div>
      </div>
      <div class="v461-shop-grid-wrap">
        <div class="shop-grid" id="v057WeaponGrid">
          ${(s.weaponShop||[]).map((it,i)=>upgradedOffer(it,i,'weapon')).join('')}
        </div>
      </div>
      <div class="v461-shop-actions">
        <button type="button" class="btn secondary v461-reroll-gear" id="v461RerollGear">🔄 Waffen & Rüstung neu würfeln · 1 🟢</button>
        <div class="v461-shop-note">Nur dieser Bereich wird neu gewürfelt.</div>
      </div>`;

    let magic=document.querySelector('#v030MagicShop');
    if(!magic){
      magic=document.createElement('div');
      magic.className='card v461-shop-card';
      magic.id='v030MagicShop';
      shop.appendChild(magic);
    }
    magic.className='card v461-shop-card';
    magic.innerHTML=`
      <div class="v461-shop-head">
        <div>
          <h2>💎 Schmuck, Edelsteine & Rollen</h2>
          <div class="muted">Ringe, Amulette, Sockelsteine und Verzauberungen. Ein Item kann 1 Stein und 1 Rolle tragen.</div>
        </div>
        <div class="v461-shop-count">${(s.magicShop||[]).length} Angebote</div>
      </div>
      <div class="v461-shop-grid-wrap">
        <div class="shop-grid" id="v057MagicGrid">
          ${(s.magicShop||[]).map((it,i)=>upgradedOffer(it,i,'magic')).join('')}
        </div>
      </div>
      <div class="v461-shop-actions">
        <button type="button" class="btn secondary v461-reroll-magic" id="v461RerollMagic">🔄 Schmuck & Materialien neu würfeln · 1 🟢</button>
        <div class="v461-shop-note">Nur dieser Bereich wird neu gewürfelt.</div>
      </div>`;

    bindBuys(shop);
    const gearBtn=document.querySelector('#v461RerollGear');
    const magicBtn=document.querySelector('#v461RerollMagic');
    if(gearBtn)gearBtn.onclick=()=>refillOne('weapon');
    if(magicBtn)magicBtn.onclick=()=>refillOne('magic');

    /* Hide now-obsolete legacy reroll buttons if they still exist somewhere. */
    document.querySelectorAll('#v057Reroll,#v030RefreshAll,#v030Refresh,#refreshShop').forEach(el=>{
      el.style.display='none';
    });

    syncVersion();
    try{if(typeof window.v441PaintResources==='function')window.v441PaintResources()}catch(e){}
    return true;
  };
  window.renderShop=renderShop;

  /* V8.009: delayed 80 ms startup repaint retired; v464 performs the immediate canonical shop render. */
  try{syncVersion()}catch(e){}
  window.addEventListener('growlegends:account-ready',()=>{try{syncVersion()}catch(e){}},{passive:true});
})();
