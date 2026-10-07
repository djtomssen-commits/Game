(()=>{
'use strict';
if(window.__V8195_VIP_CLIENT__)return;
window.__V8195_VIP_CLIENT__=true;

const S={state:null,busy:false,lastLoad:0,flight:null,expiryTimer:0};
const PRICES={7:3.99,14:6.99,30:11.99};
const one=d=>Array.isArray(d)?d[0]:d;
const fmt=n=>Math.max(0,Number(n)||0).toLocaleString('de-DE');
const money=n=>Number(n||0).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
const logged=()=>{try{return !!v073User?.id&&!v073User?.is_anonymous}catch(_){return false}};
async function db(){try{if(typeof v073Init==='function')await v073Init();return typeof v073Db!=='undefined'?v073Db:null}catch(_){return null}}
async function rpc(name,args={}){const x=await db();if(!x)throw new Error('SERVER_NOT_READY');const {data,error}=await x.rpc(name,args);if(error)throw error;return one(data)}
function toast(title,type='info',detail=''){try{return window.v063Toast?.(title,type,detail)}catch(_){try{return window.v115Alert?.(detail||title,title,type)}catch(__){}}}
function active(st=S.state){return !!(st?.active&&st?.vip_until&&new Date(st.vip_until).getTime()>Date.now())}
function untilText(st=S.state){if(!active(st))return 'Nicht aktiv';try{return new Date(st.vip_until).toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'})}catch(_){return String(st?.vip_until||'')}}
function remainingText(st=S.state){
 if(!active(st))return 'VIP ist aktuell nicht aktiv.';
 const ms=Math.max(0,new Date(st.vip_until).getTime()-Date.now()),d=Math.floor(ms/86400000),h=Math.floor((ms%86400000)/3600000);
 return d>0?`${d} Tag${d===1?'':'e'} ${h} Std. verbleibend`:`${Math.max(1,h)} Std. verbleibend`;
}
function scheduleExpiry(){
 if(S.expiryTimer){clearTimeout(S.expiryTimer);S.expiryTimer=0}
 if(!active())return;
 const ms=Math.max(1000,new Date(S.state.vip_until).getTime()-Date.now()+1200);
 S.expiryTimer=setTimeout(()=>{S.expiryTimer=0;void load(true)},Math.min(ms,2147483000));
}
function applyState(st){
 if(!st||st.ok!==true)return false;
 S.state=st;window.v8195VipState=st;S.lastLoad=Date.now();scheduleExpiry();render();
 try{window.dispatchEvent(new CustomEvent('growlegends:vip-state',{detail:{state:st}}))}catch(_){}
 try{window.renderShop?.()}catch(_){}
 return true;
}
async function load(force=false){
 if(!logged())return null;
 if(!force&&S.state&&Date.now()-S.lastLoad<15000)return S.state;
 if(S.flight)return S.flight;
 S.flight=(async()=>{try{const r=await rpc('v8195_vip_state');applyState(r);return r}catch(e){console.warn('[V8.195 VIP] state',e);return null}finally{S.flight=null}})();
 return S.flight;
}
function ensurePanel(){
 const h=document.getElementById('harzDealer');if(!h)return null;
 let p=document.getElementById('v8195VipPanel');
 if(!p){p=document.createElement('section');p.id='v8195VipPanel';h.appendChild(p)}
 return p;
}
function packageCard(days,label,best=false){
 const price=PRICES[days]||0;
 return `<article class="v8195-pack ${best?'best':''}">${best?'<div class="v8195-best">BELIEBT</div>':''}<div class="v8195-pack-days"><b>${days}</b><span>Tage VIP</span></div><h3>${label}</h3><div class="v8195-pack-price">${money(price)}</div><button type="button" class="btn gold" data-v8195-buy-vip="${days}">VIP kaufen</button></article>`;
}
function ensureRewardModal(){
 let ov=document.getElementById('v8195VipRewardOverlay');
 if(ov)return ov;
 ov=document.createElement('div');
 ov.id='v8195VipRewardOverlay';
 ov.innerHTML='<div class="v8195-reward-modal" role="dialog" aria-modal="true" aria-labelledby="v8195VipRewardTitle"><button type="button" class="v8195-reward-close" data-v8195-reward-close aria-label="Schließen">×</button><div class="v8195-reward-glow">👑</div><small>VIP-TAGESBONUS</small><h2 id="v8195VipRewardTitle">VIP-Truhe geöffnet!</h2><p>Das war heute in deiner VIP-Truhe:</p><div class="v8195-reward-grid" id="v8195VipRewardGrid"></div><button type="button" class="btn gold v8195-reward-ok" data-v8195-reward-close>Belohnung einsammeln</button></div>';
 document.body.appendChild(ov);
 ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest?.('[data-v8195-reward-close]'))ov.classList.remove('show')});
 return ov;
}
function showDailyReward(r){
 const ov=ensureRewardModal(),grid=ov.querySelector('#v8195VipRewardGrid');
 if(grid)grid.innerHTML=`
  <div class="v8195-reward-card"><i>🟢</i><b>+${fmt(r.harz_awarded)}</b><span>Harz-Taler</span></div>
  <div class="v8195-reward-card"><i>🪙</i><b>+${fmt(r.gold_awarded)}</b><span>Gold</span></div>
  <div class="v8195-reward-card"><i>🧩</i><b>+${fmt(r.fragments_awarded)}</b><span>Samenfragmente</span></div>`;
 try{window.v8144GameplayI18n?.apply?.('v8195VipRewardOverlay')}catch(_){}
 ov.classList.add('show');
}
function render(){
 const p=ensurePanel();if(!p)return;
 const st=S.state,yes=active(st);
 const dh=Math.max(0,Number(st?.daily_harz)||0),df=Math.max(0,Number(st?.daily_fragments)||0);
 const lvl=(()=>{try{return Math.max(1,Number(s?.level)||1)}catch(_){return 1}})();
 const dg=Math.max(0,(Number(st?.daily_gold_base)||0)+lvl*(Number(st?.daily_gold_per_level)||0));
 const weekly=Math.max(0,Number(st?.weekly_xp_bonus_pct)||10);
 const claimed=st&&!st.daily_claim_available;
 const todayClaim=st?.today_claim||null;
 const publicVisible=st?.public_visible!==false;
 p.innerHTML=`
   <div class="v8195-hero">
     <div class="v8195-crown">👑</div>
     <div><small>GROW LEGENDS · VIP</small><h2>${yes?'VIP AKTIV':'VIP-PASS'}</h2><p>${yes?`${remainingText(st)} · aktiv bis ${untilText(st)}`:'Mehr Komfort, tägliche Extras und sichtbares Prestige – ohne Kampfkraft-Bonus.'}</p></div>
   </div>
   <div class="v8195-status ${yes?'active':''}">
     <div><small>STATUS</small><b>${yes?'👑 VIP aktiv':'Kein aktiver VIP-Pass'}</b></div>
     <div><small>WOCHENTRUHE</small><b>+${weekly}% EP</b></div>
     <div><small>SHOP</small><b>${yes?(st?.free_reroll_available?'1× Gratis-Wurf verfügbar':'Gratis-Wurf heute genutzt'):'1×/Tag mit VIP'}</b></div>
   </div>
   <div class="v8195-section-title">VIP-Pakete</div>
   <div class="v8195-pack-grid">
     ${packageCard(7,'VIP Woche')}
     ${packageCard(14,'VIP Zwei Wochen')}
     ${packageCard(30,'VIP Monat',true)}
   </div>
   <div class="v8195-section-title">Deine VIP-Vorteile</div>
   <div class="v8195-benefits">
     <div><i>🎁</i><b>Tägliche VIP-Truhe</b><span>${dh} Harz-Taler · ca. ${fmt(dg)} Gold · ${df} Samenfragmente</span></div>
     <div><i>📦</i><b>+${weekly}% Wochentruhen-EP</b><span>Auf alle Aktivitäten, die Wochentruhen-EP geben.</span></div>
     <div><i>🔄</i><b>1× Shop neu würfeln gratis</b><span>Ein gemeinsamer Freiwurf pro Berliner Tag – Waffen oder Magier/Schmuck.</span></div>
     <div><i>🏷️</i><b>VIP-Titel</b><span>„Grow VIP“ ist nur während aktivem VIP auswählbar.</span></div>
     <div><i>✨</i><b>VIP-Name + Abzeichen</b><span>Kann über den Sichtbarkeitsschalter vollständig verborgen werden.</span></div>
     <div><i>🖼️</i><b>VIP-Kronenrahmen</b><span>Nur während aktivem VIP nutzbar; nach Ablauf automatisch gesperrt.</span></div>
   </div>
   <div class="v8195-actions">
     <div class="v8195-daily">
       <div><small>TÄGLICHER BONUS</small><b>🎁 VIP-Truhe</b><span>Reset täglich nach Europe/Berlin.</span></div>
       <button type="button" class="btn gold" data-v8195-claim ${!yes||S.busy||(claimed&&!todayClaim)?'disabled':''}>${!yes?'VIP erforderlich':claimed&&todayClaim?'Heutige Belohnung ansehen':claimed?'Heute abgeholt':'VIP-Truhe abholen'}</button>
     </div>
     <label class="v8195-privacy ${yes?'':'disabled'}"><span><b>VIP öffentlich anzeigen</b><small>Name, VIP-Abzeichen, VIP-Titel und VIP-Rahmen für andere sichtbar.</small></span><input type="checkbox" data-v8195-visible ${publicVisible?'checked':''} ${!yes||S.busy?'disabled':''}></label>
   </div>
   <div class="v8195-note">VIP-Zeit wird bei einer Verlängerung hinten angehängt. Nach Ablauf enden alle zeitgebundenen VIP-Vorteile automatisch. Keine zusätzlichen Attribute oder Kampfschadens-Boni.</div>
 `;
 try{window.v8144GameplayI18n?.apply?.('harzDealer')}catch(_){}
}
async function claimDaily(){
 if(S.busy||!active())return;
 if(S.state?.daily_claim_available===false&&S.state?.today_claim){showDailyReward(S.state.today_claim);return}
 S.busy=true;render();
 try{
  const r=await rpc('v8195_vip_claim_daily');
  if(!r?.ok)throw new Error(String(r?.reason||'VIP_CLAIM_FAILED'));
  try{
   if(Number.isFinite(Number(r.harz)))s.harzTaler=Math.max(0,Number(r.harz));
   if(Number.isFinite(Number(r.gold)))s.gold=Math.max(0,Number(r.gold));
   s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
   if(Number.isFinite(Number(r.fragments)))s.v488Forge.fragments=Math.max(0,Number(r.fragments));
   localStorage.setItem(KEY,JSON.stringify(s));
  }catch(_){}
  if(r.state)applyState(r.state);else await load(true);
  try{window.v069SyncCurrencies?.();window.v441PaintResources?.();window.v488ForgeRender?.()}catch(_){}
  showDailyReward(r);
 }catch(e){
  const msg=String(e?.message||e);toast('VIP-Truhe nicht abgeholt','error',msg==='ALREADY_CLAIMED'?'Heute bereits abgeholt.':msg);
 }finally{S.busy=false;render()}
}
async function setVisible(v){
 if(S.busy||!active())return;S.busy=true;
 try{
  const r=await rpc('v8195_vip_set_visible',{p_visible:!!v});applyState(r);
  try{await window.v7137FrameRefresh?.()}catch(_){}
  try{await window.v6338VipRefresh?.()}catch(_){}
  toast('VIP-Sichtbarkeit','success',v?'VIP ist öffentlich sichtbar.':'VIP wird für andere Spieler verborgen.');
 }catch(e){toast('VIP-Sichtbarkeit nicht geändert','error',String(e?.message||e));await load(true)}
 finally{S.busy=false;render()}
}
async function buyVip(days){
 if(S.busy)return false;
 if(typeof window.glPlayBuyVip!=='function'){toast('Google Play erforderlich','info','VIP-Pakete können in der Android-App über Google Play gekauft werden.');return false}
 S.busy=true;render();
 try{
  const ok=await window.glPlayBuyVip(Number(days));if(ok)await load(true);return !!ok;
 }finally{S.busy=false;render()}
}
async function openVip(){
 try{v032Go('harzDealer')}catch(_){}
 document.getElementById('harzDealer')?.classList.remove('v7137-frames-open');
 document.getElementById('harzDealer')?.classList.add('v8195-vip-open');
 try{window.v7117DealerHubSync?.()}catch(_){}
 document.querySelectorAll('#harzDealer [data-v7117-tab]').forEach(b=>b.classList.toggle('active',b.dataset.v7117Tab==='vip'));
 await load(true);render();return true;
}
function closeVip(){document.getElementById('harzDealer')?.classList.remove('v8195-vip-open')}
document.addEventListener('click',e=>{
 const t=e.target instanceof Element?e.target:null;if(!t)return;
 const buy=t.closest('[data-v8195-buy-vip]');if(buy){e.preventDefault();void buyVip(Number(buy.dataset.v8195BuyVip));return}
 if(t.closest('[data-v8195-claim]')){e.preventDefault();void claimDaily();return}
 if(t.closest('[data-v8195-reward-close]')){e.preventDefault();document.getElementById('v8195VipRewardOverlay')?.classList.remove('show');return}
},true);
document.addEventListener('change',e=>{const t=e.target;if(t instanceof HTMLInputElement&&t.matches('[data-v8195-visible]'))void setVisible(t.checked)},true);
window.addEventListener('growlegends:account-ready',()=>void load(true),{passive:true});
window.addEventListener('growlegends:first-playable',()=>void load(false),{passive:true});
window.addEventListener('pageshow',()=>void load(false),{passive:true});
window.addEventListener('growlegends:language-changed',render,{passive:true});
window.v8195OpenVip=openVip;
window.v8195CloseVip=closeVip;
window.v8195VipRefresh=load;
window.v8195VipDiagnostics=()=>({version:'V8.195',state:S.state?{active:active(),vip_until:S.state.vip_until,public_visible:S.state.public_visible,daily_claim_available:S.state.daily_claim_available,free_reroll_available:S.state.free_reroll_available}:null,busy:S.busy,serverAuthoritative:true});
try{window.v7117DealerHubSync?.()}catch(_){}
if(logged())void load(false);
})();