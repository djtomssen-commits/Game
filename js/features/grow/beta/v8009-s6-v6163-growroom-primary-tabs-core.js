(()=>{
'use strict';
if(window.__V6163_GROWROOM_PRIMARY_TABS__)return;
window.__V6163_GROWROOM_PRIMARY_TABS__=true;
const V=window.GROW_LEGENDS_VERSION||{short:'V4.164',label:'V4.164 Stable',number:'4.164'};
try{window.GROW_LEGENDS_VERSION=Object.freeze(V)}catch(_){window.GROW_LEGENDS_VERSION=V}
const STORE='growLegends:growTab:v6163';
let active='grow',mountQueued=false,lastRoot=null,ordersLoadPromise=null,lastOrdersLoadAt=0;
try{const x=sessionStorage.getItem(STORE);if(['grow','stock','genetics','orders'].includes(x))active=x}catch(_){}
const $=(s,r=document)=>r?.querySelector?.(s)||null;
function growRoot(){return $('#grow .v492-grow')}
function contractSnapshot(){try{return window.v6160GrowContracts?.state?.()||null}catch(_){return null}}
function geneticsSnapshot(){try{return window.v6130QA?.()||null}catch(_){return null}}
function stats(){
 const c=contractSnapshot(),g=geneticsSnapshot();
 const rows=Array.isArray(c?.contracts)?c.contracts:[];
 return {done:rows.filter(x=>x?.completed).length,ready:rows.filter(x=>x?.completed&&!x?.claimed).length,pending:!!g?.pending,crosses:Number(g?.totalCrosses)||0,essences:Number(g?.totalEssences)||0};
}
function tabsHtml(){return `<div class="v6163-tabs" role="tablist" aria-label="Growroom Bereiche">
 <button type="button" class="v6163-tab" data-v6163-tab="grow" role="tab"><span class="v6163-ico">🌱</span><b>Growroom</b><small>PFLANZEN · PFLEGE · ERNTE</small></button>
 <button type="button" class="v6163-tab" data-v6163-tab="stock" role="tab"><span class="v6163-ico">🎒</span><b>Blütenlager</b><small>LAGER · DEALER · VEREDELN</small><i class="v6282-stock-badge">0</i></button>
 <button type="button" class="v6163-tab" data-v6163-tab="genetics" role="tab"><span class="v6163-ico">🧬</span><b>Genetik</b><small>KREUZUNGEN · HYBRIDE · ESSENZEN</small><i class="v6163-dot" hidden></i></button>
 <button type="button" class="v6163-tab" data-v6163-tab="orders" role="tab"><span class="v6163-ico">📋</span><b>Aufträge</b><small>TÄGLICHE GROW-AUFGABEN</small><i class="v6163-badge">0/6</i></button>
 </div>`}
function paintTabs(root=growRoot()){
 if(!root)return;const st=stats();
 root.querySelectorAll('[data-v6163-tab]').forEach(b=>{const on=b.dataset.v6163Tab===active;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false')});
 const ob=$('[data-v6163-tab="orders"]',root),badge=$('.v6163-badge',ob);if(badge)badge.textContent=`${Math.max(0,Math.min(6,st.done))}/6`;ob?.classList.toggle('v6163-has-ready',st.ready>0);
 const gb=$('[data-v6163-tab="genetics"]',root),dot=$('.v6163-dot',gb);if(dot)dot.hidden=!st.pending;gb?.classList.toggle('v6163-has-ready',st.pending);
 const sb=$('[data-v6163-tab="stock"]',root),stockBadge=$('.v6282-stock-badge',sb);if(stockBadge)stockBadge.textContent=String(Math.max(0,Number(s?.grow?.v492?.bag?.length)||0));
}
function markBase(root){
 [...root.children].forEach(el=>{if(el.classList.contains('v492-sign')||el.classList.contains('v6163-tabs')||el.id==='v6163Inline')return;el.classList.add('v6163-base')});
}
function copyGenetics(panel){
 const g=geneticsSnapshot(),html=typeof window.v6130RenderLabHtml==='function'?window.v6130RenderLabHtml():'';
 panel.innerHTML=`<div class="v6163-inline-head"><div><h3>🧬 Genetik-Labor</h3><small>KREUZEN · HYBRID ZIEHEN · ESSENZ GEWINNEN</small></div><div class="v6163-inline-meta">${g?.pending?'KREUZUNG AKTIV':`${Number(g?.totalCrosses)||0} Kreuzungen · ${Number(g?.totalEssences)||0} Essenzen`}</div></div><div class="v6163-inline-genetics">${html||'<div class="v6130-help">Genetikdaten werden geladen …</div>'}</div>`;
}
function copyOrders(panel){
 const c=contractSnapshot(),rows=Array.isArray(c?.contracts)?c.contracts:[],canonicalRows=Array.isArray(window.__V7208_GROW_ORDERS_CANONICAL__?.contracts)?window.__V7208_GROW_ORDERS_CANONICAL__.contracts:[];
 if(window.v7081UseAuthority?.('grow')&&(canonicalRows.length!==6||rows.length!==6)){
  panel.innerHTML='<div class="v6163-inline-head"><div><h3>📋 Grow-Aufträge</h3><small>TÄGLICH NEU · SERVERAUTORITATIV</small></div><div class="v6163-inline-meta">Server …</div></div><div class="v6163-inline-orders"><div class="v6160-note">Grow-Aufträge werden vom Server geladen …</div></div>';
  const now=Date.now();if(!ordersLoadPromise&&now-lastOrdersLoadAt>900){lastOrdersLoadAt=now;ordersLoadPromise=Promise.resolve(window.v7065GrowAuthorityRefresh?.()).catch(()=>null).finally(()=>{ordersLoadPromise=null;if(active==='orders')queueMicrotask(refreshActive)})}
  return;
 }
 const ready=rows.filter(x=>x?.completed&&!x?.claimed).length,html=typeof window.v6160RenderBoardHtml==='function'?window.v6160RenderBoardHtml():'';
 panel.innerHTML=`<div class="v6163-inline-head"><div><h3>📋 Grow-Aufträge</h3><small>TÄGLICH NEU · LEICHT BIS MEISTERAUFTRAG</small></div><div class="v6163-inline-meta">${ready?`🎁 ${ready} abholbereit`:`${rows.filter(x=>x?.completed).length}/6 geschafft`}</div></div><div class="v6163-inline-orders">${html||'<div class="v6160-note">Grow-Aufträge werden geladen …</div>'}</div>`;
}
function copyStock(panel){
 const api=window.v6282GrowEconomy;
 panel.innerHTML=api?.render?api.render():'<div class="v6160-note">Blütenlager wird geladen …</div>';
}
function applyView(root=growRoot()){
 if(!root)return;markBase(root);paintTabs(root);const panel=$('#v6163Inline',root);if(!panel)return;
 const inGrow=active==='grow';root.querySelectorAll(':scope > .v6163-base').forEach(el=>el.classList.toggle('v6163-hidden',!inGrow));
 panel.hidden=inGrow;if(inGrow){panel.innerHTML='';return}
 if(active==='stock')copyStock(panel);else if(active==='genetics')copyGenetics(panel);else copyOrders(panel);
 try{window.v6283GrowGuide?.refresh?.()}catch(_){}
}
function mount(){mountQueued=false;const root=growRoot();if(!root)return;lastRoot=root;let tabs=$(':scope > .v6163-tabs',root);if(!tabs){const sign=$(':scope > .v492-sign',root);if(!sign)return;sign.insertAdjacentHTML('afterend',tabsHtml());tabs=$(':scope > .v6163-tabs',root)}let panel=$(':scope > #v6163Inline',root);if(!panel){panel=document.createElement('div');panel.id='v6163Inline';panel.hidden=true;tabs.insertAdjacentElement('afterend',panel)}applyView(root)}
function queueMount(){if(mountQueued)return;mountQueued=true;queueMicrotask(mount)}
function setTab(tab){if(!['grow','stock','genetics','orders'].includes(tab))return;active=tab;try{sessionStorage.setItem(STORE,tab)}catch(_){}applyView()}
function refreshActive(){const root=growRoot();if(!root)return;paintTabs(root);if(active!=='grow')applyView(root)}
function attach(){const host=document.getElementById('grow');if(!host||host.dataset.v6163Observed==='1')return;host.dataset.v6163Observed='1';let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;queueMount()})}).observe(host,{childList:true,subtree:false});queueMount()}
function stamp(){}
document.addEventListener('click',e=>{const t=e.target instanceof Element?e.target:null;if(!t)return;const tab=t.closest('[data-v6163-tab]');if(tab){e.preventDefault();e.stopPropagation();return setTab(tab.dataset.v6163Tab)}if(t.closest('#v6163Inline [data-v6130-cross],#v6163Inline [data-v6160-claim],#v6163Inline [data-v6160-reroll]'))queueMicrotask(refreshActive)},true);
try{window.GL_EVENTS?.on?.('growHarvested',()=>queueMicrotask(refreshActive))}catch(_){}
document.addEventListener('DOMContentLoaded',()=>{attach();queueMount();stamp()},{once:true});
window.addEventListener('growlegends:account-ready',()=>{attach();queueMount();stamp()});
window.addEventListener('pageshow',()=>{attach();queueMount();stamp()},{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='grow'){attach();queueMount();stamp()}},{passive:true});
window.v6163GrowTabs={open:setTab,refresh:refreshActive,mountNow:mount,get active(){return active}};
window.v6163QA=()=>({version:V.label,active,tabbar:!!document.querySelector('#grow .v6163-tabs'),inline:!!document.querySelector('#v6163Inline'),oldGeneticsButtonHidden:!!document.querySelector('#grow [data-v6130-open]'),oldOrdersButtonHidden:!!document.querySelector('#grow [data-v6160-open]'),stats:stats()});
})();
