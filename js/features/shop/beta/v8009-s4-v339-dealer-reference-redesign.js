(function(){
 const V339_VERSION='V4.29 Stable';

 function money(n){
   try{return Number(n).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'}
   catch(e){return n+' €'}
 }

 function featuredCard(p, idx, title, icon, featured){
   return `<div class="v339-showcase ${featured?'featured':''}">
     ${featured?'<div class="v339-ribbon">BESTSELLER</div>':''}
     <div class="v339-pack-art">${icon}</div>
     <h3>${title}</h3>
     <div class="qty">${p.harz} Harz-Taler</div>
     <div class="unit">${v322UnitPrice(p)}</div>
     <button type="button" data-v339-buy="${idx}">${money(p.price)}</button>
   </div>`;
 }

 function buildDealer(){
   const screen=document.querySelector('#harzDealer');
   const card=screen?.querySelector('.v322-dealer-card');
   const packages=screen?.querySelector('#v322DealerPackages');
   if(!screen||!card||!packages)return;

   let shell=screen.querySelector('.v339-shop-shell');
   if(!shell){
     shell=document.createElement('div');
     shell.className='v339-shop-shell';

     const top=document.createElement('div');
     top.innerHTML=`
       <div class="v339-hero">
         <h1 class="v339-title">Harz <span>Dealer</span></h1>
         <div class="v339-tagline">Deine Abkürzung zu mehr Fortschritt.</div>
         <p class="v339-desc">Harz-Taler geben dir zusätzliche Möglichkeiten im Spiel. Wähle das Paket, das zu dir passt – größere Pakete bieten mehr Harz für dein Geld.</p>
         <div class="v339-current">💎 Dein Bestand: <b id="v339Balance">0</b> Harz-Taler</div>
         <div class="v339-dealer-art" aria-hidden="true">
           <div class="v339-dealer-body"></div>
           <div class="v339-hood"><i class="v339-eye a"></i><i class="v339-eye b"></i></div>
           <div class="v339-potion"></div>
         </div>
       </div>
       <div class="v339-benefit-strip">
         <div class="v339-mini"><div class="v339-mini-icon">⚡</div><div><b>Sofort einsetzbar</b><small>Für zusätzliche Dungeon-Kämpfe und Komfortfunktionen.</small></div></div>
         <div class="v339-mini"><div class="v339-mini-icon">🛡️</div><div><b>Fair & transparent</b><small>Paketgröße, Preis und Preis pro Harz werden klar angezeigt.</small></div></div>
         <div class="v339-mini"><div class="v339-mini-icon">💜</div><div><b>Unterstützt das Spiel</b><small>Premium-Käufe sollen die Weiterentwicklung unterstützen.</small></div></div>
         <div class="v339-mini"><div class="v339-mini-icon">♛</div><div><b>Besserer Wert</b><small>Große Pakete haben den niedrigeren Preis pro Harz-Taler.</small></div></div>
       </div>
       <div class="v339-content">
         <div class="v339-section-title">Beliebte Angebote</div>
         <div class="v339-top" id="v339Top"></div>
         <div class="v339-section-title">Harz-Taler Pakete</div>
         <div id="v339PackagesSlot"></div>
         <div class="v339-lower">
           <div><b>💎 Wofür Harz-Taler?</b><span>Zusätzliche Dungeon-Versuche, Shop-Komfort und weitere Premium-Funktionen, die im Spiel freigeschaltet sind.</span></div>
           <div><b>🔒 Zahlung</b><span>Der echte Zahlungsanbieter ist aktuell noch nicht verbunden. Es wird derzeit kein Echtgeld eingezogen.</span></div>
           <div><b>❓ Hinweis</b><span>Beim Klick auf Kaufen wird momentan nur die bestehende Info angezeigt und kein Harz gutgeschrieben.</span></div>
         </div>
         <div id="v339NoteSlot"></div>
         <div class="v339-thanks">💜 Vielen Dank für deine Unterstützung – gemeinsam wächst Grow Legends weiter.</div>
       </div>
     `;
     card.parentNode.insertBefore(shell,card);
     card.style.display='none';

     const slot=top.querySelector('#v339PackagesSlot');
     slot.appendChild(packages);
     const note=card.querySelector('.v322-pay-note');
     if(note)top.querySelector('#v339NoteSlot').appendChild(note);
     shell.appendChild(top);
   }

   if(typeof V322_HARZ_PACKAGES!=='undefined'){
     const top=screen.querySelector('#v339Top');
     if(top){
       const picks=[
         {idx:0,title:'Starter Paket',icon:'🧪',featured:false},
         {idx:4,title:'Abenteurer Paket',icon:'💎',featured:true},
         {idx:9,title:'Legenden Paket',icon:'🧰',featured:false}
       ];
       top.innerHTML=picks.map(x=>featuredCard(V322_HARZ_PACKAGES[x.idx],x.idx,x.title,x.icon,x.featured)).join('');
       top.querySelectorAll('[data-v339-buy]').forEach(btn=>btn.onclick=()=>{
         const target=packages.querySelector(`[data-v322-buy="${btn.dataset.v339Buy}"]`);
         if(target)target.click();
       });
     }
   }
   const bal=screen.querySelector('#v339Balance');
   if(bal)bal.textContent=Math.max(0,Number(s.harzTaler)||0).toLocaleString('de-DE');
 }

 const baseDealer=window.v322RenderDealer;
 if(typeof baseDealer==='function'){
   window.v322RenderDealer=function(){
     const r=baseDealer.apply(this,arguments);
     buildDealer();
     return r;
   };
 }
 window.__v339GlobalRenderRetired=true;
 window.addEventListener('growlegends:navigation-open-v7119',e=>{
   if(String(e?.detail?.id||'')==='harzDealer')buildDealer();
 },{passive:true});
 buildDealer();
})();
