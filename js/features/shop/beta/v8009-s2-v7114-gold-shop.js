(()=>{
'use strict';
if(window.__V7114_GOLD_SHOP__)return;
window.__V7114_GOLD_SHOP__=true;

const S={busy:false,last:null,previous:'world',lastError:''};
const fmt=n=>Math.max(0,Math.round(Number(n)||0)).toLocaleString('de-DE');
const one=d=>Array.isArray(d)?d[0]:d;
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const packIcon=id=>id==='small'?'💰':id==='medium'?'🧰':id==='large'?'🗝️':'👑';

function toast(title,type='info',detail=''){
  try{if(typeof v063Toast==='function')return v063Toast(title,type,detail)}catch(_){ }
  try{if(typeof window.v063Toast==='function')return window.v063Toast(title,type,detail)}catch(_){ }
}
function alertBox(msg){
  try{if(typeof v115Alert==='function')return v115Alert(msg)}catch(_){ }
  try{window.alert(msg)}catch(_){ }
}
async function confirmBuy(pack){
  const eventLine=S.last?.gold_event_active?`\n\n🔥 Gold-Event: +${fmt(S.last.gold_event_bonus_pct||10)} % Eventbonus ist bereits enthalten.`:'';
  const msg=`${fmt(pack.gold)} Gold für ${fmt(pack.harz)} Harz-Taler kaufen?\n\nDie Goldmenge ist an dein aktuelles Level angepasst.${eventLine}`;
  try{
    if(typeof v063Confirm==='function')return !!(await v063Confirm(msg,'Gold kaufen',`${fmt(pack.harz)} Harz-Taler ausgeben`));
  }catch(_){ }
  try{return !!window.confirm(msg)}catch(_){return false}
}
function purchaseId(){
  try{return crypto.randomUUID().replace(/[^A-Za-z0-9_-]/g,'_')}catch(_){return `p_${Date.now()}_${Math.random().toString(36).slice(2,10)}`}
}
function ensureScreen(){
  let root=document.getElementById('goldShop');
  if(root)return root;
  root=document.createElement('section');
  root.id='goldShop';root.className='screen';
  document.querySelector('main')?.appendChild(root);
  return root;
}
function paintLoading(text='Goldlager wird geladen …'){
  const root=ensureScreen();
  root.innerHTML=`<div class="v7114-wrap"><div class="v7114-loading">🪙 ${text}</div></div>`;
  queueMicrotask(()=>window.v7117DealerHubSync?.());
}
function packCard(p,i){
  const enough=Number(S.last?.harz||0)>=Number(p.harz||0);
  return `<article class="v7114-pack ${i>=2?'featured':''}">
    <div class="v7114-pack-top"><div class="v7114-icon">${packIcon(p.id)}</div><div><h3>${p.label}</h3><div class="sub">${i===0?'Schneller Gold-Nachschub':'Mehr Gold pro Harz-Taler'}</div></div></div>
    <div class="v7114-gain">+${fmt(p.gold)} Gold</div>
    ${Number(p.event_bonus_pct)>0?`<div class="v7115-base">Normal ${fmt(p.base_gold)} Gold · Eventbonus eingerechnet</div>`:''}
    <div class="v7114-cost">Preis: <b>🟢 ${fmt(p.harz)} Harz-Taler</b></div>
    ${Number(p.bonus_pct)>0?`<div class="v7114-bonus">+${fmt(p.bonus_pct)} % Paketbonus</div>`:'<div class="v7114-bonus">Basispreis</div>'}
    ${Number(p.event_bonus_pct)>0?`<div class="v7115-event-chip">🔥 +${fmt(p.event_bonus_pct)} % Gold-Event</div>`:''}
    <button type="button" data-v7114-buy="${p.id}" ${S.busy||!enough?'disabled':''}>${enough?`${fmt(p.harz)} Harz ausgeben`:'Zu wenig Harz'}</button>
  </article>`;
}
function paint(){
  const root=ensureScreen(),r=S.last;
  if(!r?.ok){paintLoading(S.lastError?'Serverstand konnte nicht geladen werden.':'Goldlager wird geladen …');return}
  root.innerHTML=`<div class="v7114-wrap">
    <section class="v7114-head">
      <div class="v7114-head-top"><button class="v7114-back" type="button" data-v7114-back>‹</button><div class="v7114-title">
        <div class="v7114-kicker">Harz-Taler eintauschen</div><h2>🪙 Goldlager</h2>
        <p>Kaufe Gold direkt gegen Harz-Taler. Die Menge wächst mit deinem Charakterlevel.</p>
      </div></div>
      <div class="v7114-balances">
        <div class="v7114-balance gold"><small>Dein Gold</small><b>${fmt(r.gold)}</b></div>
        <div class="v7114-balance harz"><small>Harz-Taler</small><b>${fmt(r.harz)}</b></div>
        <div class="v7114-balance"><small>Level</small><b>${fmt(r.level)}</b></div>
      </div>
    </section>
    <div class="v7114-note"><b>Levelskalierung:</b> Grundlage ist dein serverseitiges Tagesgold (${fmt(r.daily_gold)} Gold auf deinem aktuellen Level). Dadurch bleibt der Tausch über das gesamte Spiel sinnvoll, ohne niedrige Level mit Endgame-Gold zu überschwemmen.</div>
    ${r.gold_event_active?`<div class="v7115-event"><b>🔥 GOLD-EVENT AKTIV</b><span>Alle Goldkäufe erhalten zusätzlich +${fmt(r.gold_event_bonus_pct||10)} % Gold.</span></div>`:''}
    <div class="v7114-grid">${(r.packs||[]).map(packCard).join('')}</div>
    <div class="v7114-foot"><button type="button" class="btn secondary" data-v7114-harz>🟢 Harz-Taler holen</button><button type="button" class="btn secondary" data-v7114-back>Zurück</button></div>
  </div>`;
  queueMicrotask(()=>window.v7117DealerHubSync?.());
}
async function load(){
  const x=db();if(!x||!uid()){S.lastError='Nicht angemeldet';paint();return null}
  try{
    const {data,error}=await x.rpc('v7114_gold_shop_state');
    if(error)throw error;
    const r=one(data);if(!r?.ok)throw new Error(String(r?.reason||'GOLD_SHOP_STATE_FAILED'));
    S.last=r;S.lastError='';paint();return r;
  }catch(e){S.lastError=String(e?.message||e);console.warn('[V7.116] gold shop state',e);paint();return null}
}
async function buy(id){
  if(S.busy)return;
  const p=(S.last?.packs||[]).find(x=>String(x.id)===String(id));if(!p)return;
  if(Number(S.last?.harz||0)<Number(p.harz||0)){alertBox('Du hast nicht genug Harz-Taler.');return}
  if(!(await confirmBuy(p)))return;
  const x=db();if(!x)return;
  S.busy=true;paint();
  try{
    const {data,error}=await x.rpc('v7114_buy_gold_pack',{p_pack:String(p.id),p_purchase_id:purchaseId()});
    if(error)throw error;
    const r=one(data);
    if(!r?.ok){
      if(r?.reason==='INSUFFICIENT_HARZ')alertBox(`Zu wenig Harz-Taler. Benötigt: ${fmt(r.required_harz)}.`);
      else alertBox(`Goldkauf fehlgeschlagen: ${String(r?.reason||'Unbekannter Fehler')}`);
      await load();return;
    }
    if(typeof s!=='undefined'&&s){s.gold=Math.max(0,Number(r.gold)||0);s.harzTaler=Math.max(0,Number(r.harz)||0)}
    try{await window.v7077ProgressRefresh?.()}catch(_){ }
    try{window.v069SyncCurrencies?.();window.v6213SyncCurrencies?.()}catch(_){ }
    try{window.v6111Sfx?.('reward')}catch(_){ }
    toast(`+${fmt(r.gained_gold)} Gold`,'success',`${fmt(r.spent_harz)} Harz-Taler ausgegeben.${r.gold_event_active?` · Gold-Event +${fmt(r.gold_event_bonus_pct||10)} %`:''}`);
    await load();
  }catch(e){
    S.lastError=String(e?.message||e);console.warn('[V7.116] gold shop purchase',e);alertBox('Der Goldkauf konnte nicht abgeschlossen werden. Bitte erneut versuchen.');await load();
  }finally{S.busy=false;paint()}
}
function open(){
  const active=document.querySelector('main > .screen.active,.screen.active')?.id||'world';
  if(active&&active!=='goldShop')S.previous=active;
  ensureScreen();
  try{v032Go('goldShop')}catch(_){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));ensureScreen().classList.add('active')}
  paintLoading();void load();return true;
}
function back(){try{v032Go(S.previous||'world')}catch(_){try{v032Go('world')}catch(__){ }} }

/* Capture before historical header handlers that still send Gold+ to the item shop. */
document.addEventListener('click',e=>{
  const plus=e.target?.closest?.('#v372TopbarShell [data-plus="gold"],#v371TopbarShell [data-v371-plus="gold"],[data-v366-plus="gold"]');
  if(plus){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();open();return}
  const root=e.target?.closest?.('#goldShop');if(!root)return;
  const buyBtn=e.target.closest('[data-v7114-buy]');if(buyBtn){e.preventDefault();void buy(buyBtn.dataset.v7114Buy);return}
  if(e.target.closest('[data-v7114-back]')){e.preventDefault();back();return}
  if(e.target.closest('[data-v7114-harz]')){e.preventDefault();try{v032Go('harzDealer')}catch(_){ }return}
},true);

window.v7114OpenGoldShop=open;
window.v7114GoldShopDiagnostics=()=>({
  ready:!!S.last?.ok,busy:S.busy,lastError:S.lastError,
  packs:(S.last?.packs||[]).map(p=>({id:p.id,harz:p.harz,gold:p.gold,baseGold:p.base_gold,bonus:p.bonus_pct,eventBonus:p.event_bonus_pct})),
  goldEventActive:!!S.last?.gold_event_active,goldEventBonus:Number(S.last?.gold_event_bonus_pct||0),
  authority:!!window.v7081UseAuthority?.('progress')
});
ensureScreen();
})();
