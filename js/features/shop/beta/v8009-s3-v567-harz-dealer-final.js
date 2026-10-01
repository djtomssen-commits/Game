(function(){
 const IMG_STARTER='assets/v7198-base64/64815769f6cf68f3464c.webp', IMG_ADV='assets/v7198-base64/9889a4a56e643e934d9f.webp', IMG_LEGEND='assets/v7198-base64/16257f4b3d74359ca1e3.webp';
 const LOWER=[0,1,2,3,4,5,6,7,8,9];
 function money(n){try{return Number(n).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'}catch(e){return n+' €'}}
 function buy(idx){if(typeof window.glPlayBuy==='function')return window.glPlayBuy(idx);const p=window.V322_HARZ_PACKAGES?.[idx]||V322_HARZ_PACKAGES?.[idx];if(!p)return;v115Alert('Google Play Billing ist in dieser App-Version noch nicht verfügbar.','💎 Harz Dealer','warn')}
 function saving(p){try{return v322SavingPct(p)}catch(e){const base=(p.harz/25)*1.99;return Math.max(0,Math.round((1-p.price/base)*100))}}
 function feature(p,idx,title,img,cls='',ribbon=''){return `<div class="v567-feature ${cls}">${ribbon?`<div class="v567-ribbon">${ribbon}</div>`:''}<img class="v567-feature-img" src="${img}" alt=""><h3>${title}</h3><div class="qty">${p.harz} Harz-Taler</div><div class="unit">${v322UnitPrice(p)}</div><button type="button" data-v567-buy="${idx}">${money(p.price)}</button></div>`}
 function smallArt(idx){if(idx===0)return `<img src="${IMG_STARTER}" alt="">`;if(idx===3)return `<img src="${IMG_ADV}" alt="">`;if(idx>=8)return `<img src="${IMG_LEGEND}" alt="">`;return '💎'}
 function pack(p,idx){const sv=saving(p);const best=idx===9;return `<div class="v567-pack ${best?'best':''}">${best?'<div class="v567-best">BESTER WERT</div>':''}<div class="v567-pack-art">${smallArt(idx)}</div><div class="v567-pack-main">${p.harz} Harz-Taler</div><div class="v567-pack-price">${money(p.price)}</div><div class="v567-pack-meta">${p.label||''}${sv?` · +${sv}% Wert`:''}</div><button type="button" data-v567-buy="${idx}">Kaufen</button></div>`}
 function ensure(){
   const screen=document.querySelector('#harzDealer'); if(!screen)return;
   screen.querySelectorAll('.v339-shop-shell,.v338-hero,.v338-featured,.v338-bottom-info').forEach(el=>el.style.display='none');
   const oldCard=screen.querySelector('.v322-dealer-card'); if(oldCard)oldCard.style.display='none';
   let shell=screen.querySelector('.v567-shell');
   if(!shell){
     shell=document.createElement('div');shell.className='v567-shell';
     shell.innerHTML=`
       <div class="v567-titlebar"><h1>HARZ &amp; GOLD DEALER</h1></div>
       <div class="v567-hero"><div class="v567-hero-art"></div><div class="v567-hero-copy"><div class="v567-kicker">💎 PREMIUM-WÄHRUNG</div><div class="v567-tag">Deine Abkürzung zu mehr Fortschritt.</div><div class="v567-desc">Harz-Taler geben dir zusätzliche Möglichkeiten im Spiel. Wähle das Paket, das zu dir passt – größere Pakete bieten mehr Harz für dein Geld.</div><div class="v567-balance">💎 Dein Bestand: <strong id="v567Balance">0</strong> Harz-Taler</div></div></div>
       <div class="v567-benefits"><div class="v567-benefit"><i>⚡</i><div><b>Sofort einsetzbar</b><span>Dungeon-Kämpfe und Komfortfunktionen.</span></div></div><div class="v567-benefit"><i>🛡️</i><div><b>Fair & transparent</b><span>Paket, Preis und Wert klar sichtbar.</span></div></div><div class="v567-benefit"><i>💚</i><div><b>Unterstützt das Spiel</b><span>Premium-Käufe unterstützen die Weiterentwicklung.</span></div></div><div class="v567-benefit"><i>♛</i><div><b>Besserer Wert</b><span>Größere Pakete bieten mehr Harz pro Euro.</span></div></div></div>
       <div class="v567-content"><div class="v567-section-title">Beliebte Angebote</div><div class="v567-featured" id="v567Featured"></div><div class="v567-section-title">Harz-Taler Pakete</div><div class="v567-pack-grid" id="v567Packs"></div><div class="v567-info"><div><b>💎 Wofür Harz-Taler?</b><span>Zusätzliche Dungeon-Versuche, Shop-Komfort und weitere Premium-Funktionen.</span></div><div><b>🔒 Zahlung</b><span>Sichere Zahlung über Google Play. Harz-Taler werden erst nach serverseitig bestätigtem Kauf gutgeschrieben.</span></div><div><b>❓ Hinweis</b><span>Käufe werden deinem angemeldeten Grow-Legends-Account gutgeschrieben.</span></div></div><div class="v567-thanks">💚 Vielen Dank für deine Unterstützung – gemeinsam wächst Grow Legends weiter.</div></div>`;
     screen.appendChild(shell);
   }
   const packs=typeof V322_HARZ_PACKAGES!=='undefined'?V322_HARZ_PACKAGES:[];
   if(packs.length){
     shell.querySelector('#v567Featured').innerHTML=feature(packs[0],0,'Starter Paket',IMG_STARTER)+feature(packs[4],4,'Abenteurer Paket',IMG_ADV,'purple','BESTSELLER')+feature(packs[9],9,'Legenden Paket',IMG_LEGEND,'gold','BESTER WERT');
     shell.querySelector('#v567Packs').innerHTML=LOWER.map(i=>pack(packs[i],i)).join('');
     shell.querySelectorAll('[data-v567-buy]').forEach(btn=>btn.onclick=()=>buy(Number(btn.dataset.v567Buy)));
   }
   const bal=shell.querySelector('#v567Balance');if(bal)bal.textContent=Math.max(0,Number(s.harzTaler)||0).toLocaleString('de-DE');
 }
 window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='harzDealer')ensure()},{passive:true});
 const oldDealer=window.v322RenderDealer;if(typeof oldDealer==='function'&&!oldDealer.__v567Ensure){const wrapped=function(){const r=oldDealer.apply(this,arguments);ensure();return r};wrapped.__v567Ensure=true;window.v322RenderDealer=wrapped}
 ensure();
})();
