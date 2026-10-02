(()=>{
'use strict';
if(window.__V8010_HARZ_LOTTO__)return;
window.__V8010_HARZ_LOTTO__=true;

const S={active:false,busy:false,data:null,picks:new Set(),timer:0,lastError:'',previewDraw:false};
const one=d=>Array.isArray(d)?d[0]:d;
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const fmt=n=>Math.max(0,Math.round(Number(n)||0)).toLocaleString('de-DE');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function toast(title,type='info',detail=''){
  try{if(typeof v063Toast==='function')return v063Toast(title,type,detail)}catch(_){}
  try{if(typeof window.v063Toast==='function')return window.v063Toast(title,type,detail)}catch(_){}
}
function alertBox(msg){
  try{if(typeof v115Alert==='function')return v115Alert(msg)}catch(_){}
  try{window.alert(msg)}catch(_){}
}
async function confirmBox(msg){
  try{if(typeof v063Confirm==='function')return !!(await v063Confirm(msg,'Harz Lotto','25 Harz-Taler einsetzen'))}catch(_){}
  try{return !!window.confirm(msg)}catch(_){return false}
}

function installFinalGrowTheme(){
  let st=document.getElementById('v8010FinalGrowTheme');
  if(st)return;
  st=document.createElement('style');
  st.id='v8010FinalGrowTheme';
  st.textContent=\`
#bagDealer #v8010LottoPanel{
  padding:14px 8px 24px!important;
  border-radius:20px!important;
  background:
    radial-gradient(circle at 50% 0,rgba(132,116,48,.18),transparent 28%),
    linear-gradient(180deg,#122418 0%,#09140d 52%,#061008 100%)!important;
  box-shadow:inset 0 0 0 1px rgba(184,163,73,.18)!important;
}
#bagDealer #v8010LottoPanel .v8010-wrap{gap:16px!important}
#bagDealer #v8010LottoPanel .v8010-head,
#bagDealer #v8010LottoPanel .v8010-card{
  border:1px solid #817137!important;
  border-radius:18px!important;
  background:
    radial-gradient(circle at 86% 0,rgba(122,143,60,.17),transparent 30%),
    linear-gradient(180deg,#1b3020 0%,#0c1b11 72%,#08130d 100%)!important;
  box-shadow:
    inset 0 0 0 1px rgba(255,236,150,.05),
    0 9px 24px rgba(0,0,0,.38)!important;
}
#bagDealer #v8010LottoPanel .v8010-head{
  border-top:3px solid #ab9846!important;
}
#bagDealer #v8010LottoPanel .v8010-head small,
#bagDealer #v8010LottoPanel .v8010-card small{
  color:#c5b66b!important;
  font-weight:900!important;
}
#bagDealer #v8010LottoPanel .v8010-head h2{
  color:#fff1ae!important;
  text-shadow:0 2px 2px #000,0 0 14px rgba(213,190,83,.16)!important;
}
#bagDealer #v8010LottoPanel .v8010-head p,
#bagDealer #v8010LottoPanel .v8010-muted{
  color:#c0cbbd!important;
}
#bagDealer #v8010LottoPanel .v8010-jackpot{
  border:1px solid #b49a45!important;
  border-radius:15px!important;
  background:
    radial-gradient(circle at 50% 0,rgba(224,190,72,.18),transparent 48%),
    linear-gradient(180deg,#4a351c,#27190e)!important;
  box-shadow:inset 0 0 0 1px rgba(255,231,139,.08),0 5px 16px rgba(0,0,0,.35)!important;
}
#bagDealer #v8010LottoPanel .v8010-jackpot b{
  color:#ffe477!important;
  text-shadow:0 2px 3px #000!important;
}
#bagDealer #v8010LottoPanel .v8010-machine{
  border:2px solid #95813b!important;
  box-shadow:0 0 0 3px #132518,0 13px 30px rgba(0,0,0,.48)!important;
}
#bagDealer #v8010LottoPanel .v8010-preview-controls button,
#bagDealer #v8010LottoPanel .v8010-submit,
#bagDealer #v8010LottoPanel .v8010-claim{
  border:1px solid #aa9443!important;
  color:#fff4bd!important;
  background:linear-gradient(180deg,#3d6536,#214529 58%,#15331e)!important;
  box-shadow:inset 0 0 0 1px rgba(255,236,156,.08),0 5px 14px rgba(0,0,0,.34)!important;
  text-shadow:0 2px 2px #000!important;
}
#bagDealer #v8010LottoPanel .v8010-number-grid{
  padding:12px!important;
  border:1px solid rgba(181,159,66,.28)!important;
  border-radius:16px!important;
  background:linear-gradient(180deg,rgba(5,15,9,.7),rgba(3,10,6,.82))!important;
  box-shadow:inset 0 0 18px rgba(0,0,0,.32)!important;
}
#bagDealer #v8010LottoPanel .v8010-number-grid button{
  border-color:rgba(182,168,101,.34)!important;
  background:radial-gradient(circle at 35% 25%,#29392d,#101b14 68%)!important;
  color:#dce4d8!important;
}
#bagDealer #v8010LottoPanel .v8010-number-grid button.selected{
  border-color:#f0d36b!important;
  background:radial-gradient(circle at 33% 25%,#ffe99c,#db303a 55%,#75070d)!important;
  box-shadow:0 0 0 2px rgba(219,188,69,.22),0 4px 10px rgba(0,0,0,.35)!important;
}
#bagDealer #v8010LottoPanel .v8010-pickbar{
  padding:9px 11px!important;
  border:1px solid rgba(175,154,67,.18)!important;
  border-radius:11px!important;
  background:rgba(107,93,39,.1)!important;
}
#bagDealer #v8010LottoPanel .v8010-classes>div{
  border-bottom-color:rgba(193,171,78,.16)!important;
}
#bagDealer #v8010LottoPanel .v8010-classes>div b{color:#efd474!important}
#bagDealer #v8010LottoPanel .v8010-ticket-result{
  border:1px solid rgba(186,164,72,.2)!important;
  background:#08120c!important;
}
#bagDealer .v8010-dealer-tabs{
  border:1px solid #796b32!important;
  background:linear-gradient(180deg,#26351f,#101d13)!important;
  box-shadow:inset 0 0 0 1px rgba(255,238,158,.04),0 7px 18px rgba(0,0,0,.3)!important;
}
#bagDealer .v8010-dealer-tab.active{
  border-color:#b39f4b!important;
  color:#fff0ae!important;
  background:linear-gradient(180deg,#3a6032,#1c3d24 62%,#112b19)!important;
}
\`;
  document.head.appendChild(st);
}

function renameDealerNavigation(){
  try{
    document.querySelectorAll('#v032MenuPanel [data-screen="bagDealer"],#v032MenuPanel [data-target="bagDealer"],[data-screen="bagDealer"]').forEach(el=>{
      const icon=el.querySelector('span');
      if(icon){
        [...el.childNodes].filter(n=>n.nodeType===3).forEach(n=>n.remove());
        el.append(' Hinterhof-Dealer');
      }else{
        el.textContent='🏪 Hinterhof-Dealer';
      }
    });
  }catch(_){}
}
function panel(){return document.getElementById('v8010LottoPanel')}
function body(){return document.getElementById('v8010LottoBody')}
function bagBody(){return document.getElementById('v7215BagBody')}
function tabs(){return document.querySelectorAll('#bagDealer [data-v8010-tab]')}

function setTab(tab){
  S.active=tab==='lotto';
  tabs().forEach(b=>b.classList.toggle('active',b.dataset.v8010Tab===tab));
  const bb=bagBody(), lp=panel();
  if(bb)bb.hidden=S.active;
  if(lp)lp.hidden=!S.active;
  if(S.active){void load();startTimer()} else stopTimer();
}
function startTimer(){
  stopTimer();
  S.timer=window.setInterval(()=>{if(S.active)void load(false)},30000);
}
function stopTimer(){if(S.timer){clearInterval(S.timer);S.timer=0}}

function remaining(iso){
  const ms=new Date(iso).getTime()-Date.now();
  if(!Number.isFinite(ms)||ms<=0)return 'jetzt';
  const total=Math.floor(ms/1000),d=Math.floor(total/86400),h=Math.floor((total%86400)/3600),m=Math.floor((total%3600)/60);
  if(d>0)return `${d} T ${h} Std`;
  if(h>0)return `${h} Std ${m} Min`;
  return `${Math.max(0,m)} Min`;
}
function balls(nums,own=[]){
  const ownSet=new Set((own||[]).map(Number));
  return `<div class="v8010-balls">${(nums||[]).map(n=>`<span class="v8010-ball ${ownSet.has(Number(n))?'hit':''}">${Number(n)}</span>`).join('')}</div>`;
}
function numberGrid(ticket){
  const fixed=Array.isArray(ticket?.numbers)?ticket.numbers.map(Number):null;
  const chosen=fixed?new Set(fixed):S.picks;
  return `<div class="v8010-number-grid">${Array.from({length:50},(_,i)=>i+1).map(n=>
    `<button type="button" data-v8010-number="${n}" class="${chosen.has(n)?'selected':''}" ${fixed||S.busy?'disabled':''}>${n}</button>`
  ).join('')}</div>`;
}
function lastResultHtml(d){
  const draw=d?.last_draw, t=d?.last_ticket;
  if(!draw)return `<section class="v8010-card"><h3>Letzte Ziehung</h3><p class="v8010-muted">Noch keine Ziehung vorhanden.</p></section>`;
  const own=t?.numbers||[];
  const prize=Number(t?.prize||0);
  return `<section class="v8010-card v8010-result">
    <div class="v8010-row"><div><small>Letzte Ziehung</small><h3>${esc(draw.round_id)}</h3></div><b>Pot ${fmt(draw.total_pot)} HT</b></div>
    ${balls(draw.numbers,own)}
    ${t?`<div class="v8010-ticket-result"><span>Deine Zahlen: <b>${own.join(' · ')}</b></span><span>Treffer: <b>${fmt(t.hits)}</b></span><span>Gewinn: <b>${fmt(prize)} HT</b></span></div>
      ${prize>0&&!t.claimed?`<button type="button" class="btn v8010-claim" data-v8010-claim ${S.busy?'disabled':''}>🎁 Belohnung abholen · ${fmt(prize)} HT</button>`:prize>0?'<div class="v8010-claimed">✓ Belohnung abgeholt</div>':'<div class="v8010-no-win">Diesmal kein Gewinn.</div>'}`
      :'<p class="v8010-muted">Du hattest in dieser Runde keinen Schein.</p>'}
    <p class="v8010-carry">Nicht ausgeschüttet: <b>${fmt(draw.carry_out)} HT</b> → nächste Runde</p>
  </section>`;
}
function machineHtml(drawNums){
  const previewNums=[7,12,18,24,29,33];
  const sourceNums=S.previewDraw?previewNums:drawNums;
  const hasDraw=Array.isArray(sourceNums)&&sourceNums.length===6;
  return `<div class="v8010-machine" aria-label="Harz-Lotto Straßenautomat">
    <img class="v8010-machine-image" src="assets/file_00000000e27c8210b37148cc50f5d1af.png?v=8010orig6" alt="" draggable="false">
    ${hasDraw
      ? `<div class="v8010-draw-chute ${S.previewDraw?'preview':''}">${balls(sourceNums)}</div>`
      : '<div class="v8010-machine-wait">Ziehung Dienstag · 19:00</div>'}
  </div>`;
}
function paint(){
  const root=body();if(!root)return;
  const d=S.data;
  if(!d?.ok){
    root.innerHTML=`<div class="v8010-loading">🎟️ ${S.lastError?'Lotto konnte nicht geladen werden.':'Harz Lotto wird geladen …'}</div>`;
    return;
  }
  const r=d.round||{},t=d.ticket;
  const now=Date.now(),close=new Date(r.close_at).getTime(),draw=new Date(r.draw_at).getTime();
  const phase=now<close?'open':now<draw?'locked':'draw';
  const phaseText=phase==='open'? `Tippschluss in ${remaining(r.close_at)}` : phase==='locked'? `Ziehung in ${remaining(r.draw_at)}` : 'Ziehung läuft';
  const fixed=Array.isArray(t?.numbers);
  root.innerHTML=`<div class="v8010-wrap">
    <section class="v8010-head">
      <div><small>Grow Legends · Wochenziehung</small><h2>🔴 Harz Lotto</h2><p>1 Schein pro Woche · 6 aus 50 · Einsatz 25 Harz-Taler</p></div>
      <div class="v8010-jackpot"><small>Aktueller Jackpot</small><b>${fmt(r.jackpot)} HT</b><span>${esc(phaseText)}</span></div>
    </section>
    ${machineHtml(d.last_draw?.numbers)}
    <div class="v8010-preview-controls">
      <button type="button" class="btn secondary" data-v8010-preview>${S.previewDraw?'Test-Ziehung ausblenden':'🎯 Test-Ziehung anzeigen'}</button>
      ${S.previewDraw?'<span>Nur Anzeige-Test · keine echte Ziehung · keine Serveränderung</span>':''}
    </div>
    <section class="v8010-card">
      <div class="v8010-row"><div><small>Runde</small><h3>Ziehung ${esc(r.round_id)}</h3></div><span class="v8010-status ${phase}">${phase==='open'?'Tippen offen':phase==='locked'?'Tipps geschlossen':'Ziehung'}</span></div>
      ${fixed?`<div class="v8010-fixed-note">✓ Dein Schein ist bestätigt und kann nicht mehr geändert werden.</div>`:`<p class="v8010-muted">Markiere genau 6 Zahlen. Nach der Bestätigung sind sie fest.</p>`}
      ${numberGrid(t)}
      <div class="v8010-pickbar"><span>Ausgewählt: <b>${fixed?6:S.picks.size}/6</b></span><span>Einsatz: <b>25 HT</b></span></div>
      ${!fixed?`<button type="button" class="btn v8010-submit" data-v8010-submit ${S.busy||phase!=='open'||S.picks.size!==6?'disabled':''}>Schein für 25 HT bestätigen</button>`:''}
    </section>
    <section class="v8010-card v8010-classes"><h3>Gewinnklassen</h3>
      <div><span>6 Richtige</span><b>70 %</b></div><div><span>5 Richtige</span><b>15 %</b></div><div><span>4 Richtige</span><b>10 %</b></div><div><span>3 Richtige</span><b>5 %</b></div>
      <p>Mehrere Gewinner einer Klasse teilen deren Anteil. Nicht vergebene Anteile und Rundungsreste wandern in den nächsten Jackpot.</p>
    </section>
    ${lastResultHtml(d)}
  </div>`;
}
async function load(repaint=true){
  const x=db();if(!x||!uid()){S.lastError='Nicht angemeldet';paint();return null}
  if(repaint&&!S.data)paint();
  try{
    const {data,error}=await x.rpc('v8010_harz_lotto_state');
    if(error)throw error;
    const r=one(data);if(!r?.ok)throw new Error('LOTTO_STATE_FAILED');
    S.data=r;S.lastError='';
    if(r.ticket?.numbers)S.picks=new Set(r.ticket.numbers.map(Number));
    paint();return r;
  }catch(e){
    S.lastError=String(e?.message||e);console.warn('[V8.010] lotto state',e);paint();return null;
  }
}
async function buy(){
  if(S.busy||S.picks.size!==6)return;
  const picks=[...S.picks].sort((a,b)=>a-b);
  if(!(await confirmBox(`Deine Zahlen: ${picks.join(' · ')}\n\nDer Schein kostet 25 Harz-Taler. Nach Bestätigung können die Zahlen nicht mehr geändert werden.`)))return;
  const x=db();if(!x)return;
  S.busy=true;paint();
  try{
    const {data,error}=await x.rpc('v8010_harz_lotto_buy_ticket',{p_numbers:picks});
    if(error)throw error;
    const r=one(data);if(!r?.ok)throw new Error('LOTTO_BUY_FAILED');
    if(typeof s!=='undefined'&&s)s.harzTaler=Math.max(0,Number(r.harz)||0);
    try{window.v069SyncCurrencies?.();window.v6213SyncCurrencies?.();await window.v7077ProgressRefresh?.()}catch(_){}
    toast('Lottoschein bestätigt','success',`${picks.join(' · ')} · 25 Harz-Taler Einsatz`);
    await load(false);
  }catch(e){
    const m=String(e?.message||e);
    if(m.includes('INSUFFICIENT_HARZ'))alertBox('Du hast nicht genug Harz-Taler für den Lottoschein.');
    else if(m.includes('LOTTO_TICKET_ALREADY_EXISTS'))alertBox('Du hast für diese Woche bereits einen Lottoschein.');
    else if(m.includes('LOTTO_CLOSED'))alertBox('Der Tippschluss für diese Runde ist bereits vorbei.');
    else alertBox('Der Lottoschein konnte nicht bestätigt werden.');
    await load(false);
  }finally{S.busy=false;paint()}
}
async function claim(){
  if(S.busy)return;
  const x=db();if(!x)return;
  S.busy=true;paint();
  try{
    const {data,error}=await x.rpc('v8010_harz_lotto_claim');
    if(error)throw error;
    const r=one(data);if(!r?.ok)throw new Error('LOTTO_CLAIM_FAILED');
    if(typeof s!=='undefined'&&s)s.harzTaler=Math.max(0,Number(r.harz)||0);
    try{window.v069SyncCurrencies?.();window.v6213SyncCurrencies?.();await window.v7077ProgressRefresh?.()}catch(_){}
    try{window.v6111Sfx?.('reward')}catch(_){}
    toast(`+${fmt(r.prize)} Harz-Taler`,'success','Harz-Lotto-Gewinn abgeholt.');
    await load(false);
  }catch(e){console.warn('[V8.010] lotto claim',e);alertBox('Die Lotto-Belohnung konnte nicht abgeholt werden.');await load(false)}
  finally{S.busy=false;paint()}
}

document.addEventListener('click',e=>{
  const tab=e.target?.closest?.('#bagDealer [data-v8010-tab]');
  if(tab){e.preventDefault();setTab(tab.dataset.v8010Tab);return}
  if(!e.target?.closest?.('#v8010LottoPanel'))return;
  const n=e.target.closest('[data-v8010-number]');
  if(n){
    e.preventDefault();
    if(S.data?.ticket?.numbers)return;
    const value=Number(n.dataset.v8010Number);
    if(S.picks.has(value))S.picks.delete(value);
    else if(S.picks.size<6)S.picks.add(value);
    paint();return;
  }
  if(e.target.closest('[data-v8010-preview]')){e.preventDefault();S.previewDraw=!S.previewDraw;paint();return}
  if(e.target.closest('[data-v8010-submit]')){e.preventDefault();void buy();return}
  if(e.target.closest('[data-v8010-claim]')){e.preventDefault();void claim();return}
},true);

window.addEventListener('growlegends:navigation-ready',renameDealerNavigation,{passive:true});
window.addEventListener('pageshow',()=>{installFinalGrowTheme();renameDealerNavigation()},{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  if(String(e?.detail?.id||'')==='bagDealer'&&S.active)void load();
},{passive:true});
window.addEventListener('pagehide',stopTimer,{passive:true});
window.v8010HarzLotto={open:()=>setTab('lotto'),load,preview:(on=true)=>{S.previewDraw=!!on;paint();},diagnostics:()=>({active:S.active,busy:S.busy,previewDraw:S.previewDraw,round:S.data?.round?.round_id||null,picks:[...S.picks]})};
installFinalGrowTheme();
renameDealerNavigation();
paint();
})();