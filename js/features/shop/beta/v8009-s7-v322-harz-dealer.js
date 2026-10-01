const V322_HARZ_PACKAGES=[
 {harz:25,price:1.99,label:''},
 {harz:50,price:3.79,label:'Kleiner Bonus'},
 {harz:100,price:6.99,label:'Mehr Harz pro €'},
 {harz:150,price:9.49,label:'Bonus-Paket'},
 {harz:250,price:14.99,label:'Beliebt'},
 {harz:400,price:21.99,label:'Großes Paket'},
 {harz:600,price:29.99,label:'Extra Bonus'},
 {harz:900,price:39.99,label:'Sehr guter Wert'},
 {harz:1300,price:54.99,label:'Mega-Paket'},
 {harz:2000,price:79.99,label:'Bester Wert'}
];
window.V322_HARZ_PACKAGES=V322_HARZ_PACKAGES;
function v322Money(n){return Number(n).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'}
function v322UnitPrice(p){return (p.price/p.harz).toLocaleString('de-DE',{minimumFractionDigits:3,maximumFractionDigits:3})+' € / Harz'}
function v322BaseEquivalent(p){return (p.harz/25)*1.99}
function v322SavingPct(p){const base=v322BaseEquivalent(p);return Math.max(0,Math.round((1-p.price/base)*100))}
function v322RenderDealer(){
 const box=document.querySelector('#v322DealerPackages'),bal=document.querySelector('#v322DealerHarz');
 if(bal)bal.textContent=Math.max(0,Number(s.harzTaler)||0);
 if(!box)return;
 box.innerHTML=V322_HARZ_PACKAGES.map((p,i)=>{const save=v322SavingPct(p),best=i===V322_HARZ_PACKAGES.length-1;return `<div class="v322-pack ${best?'best':''}">${best?'<div class="v322-best">BESTER WERT</div>':''}<div class="v322-pack-amount">🟢 ${p.harz} Harz-Taler</div><div class="v322-pack-price">${v322Money(p.price)}</div><div class="v322-pack-save">${p.label}${save?` · ca. ${save}% günstiger als 25er-Preis`:''}</div><div class="v322-pack-unit">${v322UnitPrice(p)}</div><button class="btn ${best?'gold':''}" type="button" data-v322-buy="${i}">Kaufen</button></div>`}).join('');
 box.querySelectorAll('[data-v322-buy]').forEach(btn=>btn.addEventListener('click',()=>{const idx=Number(btn.dataset.v322Buy);if(typeof window.glPlayBuy==='function')return window.glPlayBuy(idx);v115Alert('Google Play Billing ist in dieser App-Version noch nicht verfügbar.','🟢 Harz-Taler Dealer','warn')}));
}
function v322OpenDealer(){try{return v032Go('harzDealer')}catch(e){try{v322RenderDealer()}catch(_){}}}
window.v322OpenDealer=v322OpenDealer;
function v322InstallMenuEntry(){
 const panel=document.querySelector('#v032MenuPanel');
 if(!panel||panel.querySelector('[data-screen="harzDealer"]'))return;
 const b=document.createElement('button');b.className='top-menu-item';b.dataset.screen='harzDealer';b.innerHTML='<span>🟢</span>Harz &amp; Gold &amp; Rahmen Dealer';b.onclick=()=>v322OpenDealer();panel.appendChild(b);
}
function v322InstallHarzPlus(){
 const card=document.querySelector('.v280-harz-card');
 if(!card||document.querySelector('#v322HarzPlus'))return;
 const b=document.createElement('button');b.type='button';b.id='v322HarzPlus';b.setAttribute('aria-label','Harz-Taler Dealer öffnen');b.textContent='+';b.onclick=e=>{e.preventDefault();e.stopPropagation();v322OpenDealer()};card.appendChild(b);
}
const v322BaseInstallMenu=v032InstallMenu;
v032InstallMenu=function(){const r=v322BaseInstallMenu.apply(this,arguments);v322InstallMenuEntry();v322InstallHarzPlus();return r};
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='harzDealer')v322RenderDealer()});
window.__v322GlobalRenderRetired=true;
try{v322InstallMenuEntry();v322InstallHarzPlus()}catch(e){console.error('V4.02 Harz Dealer init',e)}
document.addEventListener('DOMContentLoaded',()=>{try{v322InstallMenuEntry();v322InstallHarzPlus()}catch(e){}},{once:true});
