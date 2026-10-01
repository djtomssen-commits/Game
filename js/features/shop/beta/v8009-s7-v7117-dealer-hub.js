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
function sync(){
 const h=document.getElementById('harzDealer');
 const g=document.getElementById('goldShop');
 if(h)ensureHub(h,'harz');
 if(g)ensureHub(g,'gold');
 renameMenu();
}
function openHarz(){try{return v032Go('harzDealer')}catch(_){sync();return true}}
function openGold(){
 try{if(typeof window.v7114OpenGoldShop==='function')return window.v7114OpenGoldShop()}catch(_){}
 try{return v032Go('goldShop')}catch(_){sync();return true}
}

document.addEventListener('click',e=>{
 const b=e.target?.closest?.('[data-v7117-tab]');if(!b)return;
 e.preventDefault();e.stopPropagation();
 if(b.dataset.v7117Tab==='gold')openGold();else openHarz();
},true);

/* No permanent DOM observer: navigation/menu hooks are enough and avoid runtime overhead. */
try{
 if(typeof v032InstallMenu==='function'&&!window.__V7117_MENU_WRAP__){
   const base=v032InstallMenu;v032InstallMenu=function(){const r=base.apply(this,arguments);queueMicrotask(renameMenu);return r};
   try{window.v032InstallMenu=v032InstallMenu}catch(_){}window.__V7117_MENU_WRAP__=true;
 }
}catch(_){}
window.addEventListener('growlegends:navigation-ready',sync,{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='harzDealer'||id==='goldShop')sync()},{passive:true});
window.addEventListener('pageshow',sync,{passive:true});
document.addEventListener('DOMContentLoaded',sync,{once:true});

window.v7117DealerHubSync=sync;
window.v7117OpenDealerTab=tab=>tab==='gold'?openGold():openHarz();
window.v7117DealerDiagnostics=()=>({
  release:window.__GROW_LEGENDS_RELEASE__||'',
  harzHub:!!document.querySelector('#harzDealer > .v7117-dealer-hub'),
  goldHub:!!document.querySelector('#goldShop > .v7117-dealer-hub'),
  goldShopApi:typeof window.v7114OpenGoldShop==='function',
  goldPrices:window.__V7117_GOLD_SHOP_PRICES__?.harzPrices||[10,50,100,250]
});
sync();
})();
