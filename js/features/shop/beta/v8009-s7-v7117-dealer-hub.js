(()=>{
'use strict';
if(window.__V7117_DEALER_HUB__)return;
window.__V7117_DEALER_HUB__=true;

function hubHtml(active){
 return `<div class="v7117-dealer-hub" data-v7117-hub="1">
   <div class="v7117-hub-title"><div class="v7117-hub-emblem">🌿</div><div class="v7117-hub-copy"><small>Grow Legends · Händler</small><b>Harz &amp; Gold &amp; Rahmen Dealer</b></div></div>
   <div class="v7117-tabs">
     <button type="button" class="v7117-tab ${active==='harz'?'active':''}" data-v7117-tab="harz">💎 Harz-Taler</button>
     <button type="button" class="v7117-tab ${active==='gold'?'active':''}" data-v7117-tab="gold">🪙 Gold</button>
     <button type="button" class="v7117-tab ${active==='frames'?'active':''}" data-v7117-tab="frames">🖼️ Avatar-Rahmen</button>
   </div>
 </div>`;
}
function ensureHub(screen,active){
 if(!screen)return false;
 let hub=screen.querySelector(':scope > .v7117-dealer-hub');
 if(!hub){
   screen.insertAdjacentHTML('afterbegin',hubHtml(active));
   hub=screen.querySelector(':scope > .v7117-dealer-hub');
 }
 hub?.querySelectorAll('[data-v7117-tab]').forEach(b=>b.classList.toggle('active',b.dataset.v7117Tab===active));
 return !!hub;
}
function renameMenu(){
 try{
   document.querySelectorAll('#v032MenuPanel [data-screen="harzDealer"],#v032MenuPanel [data-v341-harz-menu="1"]').forEach(el=>{
     const icon=el.querySelector('span');
     if(icon){[...el.childNodes].filter(n=>n.nodeType===3).forEach(n=>n.remove());el.append(' Harz & Gold & Rahmen Dealer')}
     else el.textContent='💎 Harz & Gold & Rahmen Dealer';
   });
 }catch(_){}
}
function ensureLegalFooter(){
 const target=document.querySelector('main')||document.body;
 if(!target)return;
 let footer=document.getElementById('v337LegalFooter');
 if(!footer){
   footer=document.createElement('footer');
   footer.id='v337LegalFooter';
   footer.innerHTML=`© ${new Date().getFullYear()} Grow Legends · Alle Rechte vorbehalten.<br>Grow Legends ist ein eigenständiges Fan-/Indie-Spielprojekt. Genannte Marken, Produktnamen und sonstige Kennzeichen gehören ihren jeweiligen Inhabern.`;
 }
 if(footer.parentElement!==target||target.lastElementChild!==footer)target.appendChild(footer);
}
function sync(){
 const h=document.getElementById('harzDealer');
 const g=document.getElementById('goldShop');
 if(h)ensureHub(h,'harz');
 if(g)ensureHub(g,'gold');
 renameMenu();
 ensureLegalFooter();
}
function closeFrames(){document.getElementById('harzDealer')?.classList.remove('v7137-frames-open')}
function openHarz(){closeFrames();try{return v032Go('harzDealer')}catch(_){sync();return true}}
function openGold(){closeFrames();
 try{if(typeof window.v7114OpenGoldShop==='function')return window.v7114OpenGoldShop()}catch(_){}
 try{return v032Go('goldShop')}catch(_){sync();return true}
}

function openFrames(){
 try{if(typeof window.v7137OpenFrameShop==='function')return window.v7137OpenFrameShop()}catch(_){}
 return openHarz();
}

document.addEventListener('click',e=>{
 const b=e.target?.closest?.('[data-v7117-tab]');if(!b)return;
 e.preventDefault();e.stopPropagation();
 if(b.dataset.v7117Tab==='gold')openGold();
 else if(b.dataset.v7117Tab==='frames')openFrames();
 else openHarz();
},true);

/* V8.009: navigation lifecycle is sufficient; no v032InstallMenu wrapper. */
window.addEventListener('growlegends:navigation-ready',sync,{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='harzDealer'||id==='goldShop')sync()},{passive:true});
window.addEventListener('pageshow',sync,{passive:true});
document.addEventListener('DOMContentLoaded',sync,{once:true});

window.v7117DealerHubSync=sync;
window.v7117OpenDealerTab=tab=>tab==='gold'?openGold():tab==='frames'?openFrames():openHarz();
window.v7117DealerDiagnostics=()=>({
  release:window.__GROW_LEGENDS_RELEASE__||'',
  harzHub:!!document.querySelector('#harzDealer > .v7117-dealer-hub'),
  goldHub:!!document.querySelector('#goldShop > .v7117-dealer-hub'),
  goldShopApi:typeof window.v7114OpenGoldShop==='function',
  goldPrices:window.__V7117_GOLD_SHOP_PRICES__?.harzPrices||[10,50,100,250]
});
sync();
})();
