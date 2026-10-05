(()=>{
'use strict';
if(window.__V8011_HARZ_MACHINE__)return;
window.__V8011_HARZ_MACHINE__=true;

const S={active:false,busy:false,data:null,selected:5,pending:null,rewards:null,info:false,lastError:''};
const one=d=>Array.isArray(d)?d[0]:d;
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const fmt=n=>Math.max(0,Math.round(Number(n)||0)).toLocaleString('de-DE');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function toast(title,type='info',detail=''){
  try{return window.v063Toast?.(title,type,detail)}catch(_){}
}
function panel(){return document.getElementById('v8010LottoPanel')}
function body(){return document.getElementById('v8010LottoBody')}
function bagBody(){return document.getElementById('v7215BagBody')}
function tabs(){return document.querySelectorAll('#bagDealer [data-v8010-tab]')}

function renameDealer(){
  try{
    document.querySelectorAll('#bagDealer .v7219-hero-copy p').forEach(el=>el.textContent='Harz-Automat ist geöffnet. Tütchen & Werbe-Belohnungen folgen später.');
    document.querySelectorAll('#bagDealer [data-v8010-tab="lotto"]').forEach(el=>{el.textContent='Harz-Automat';el.dataset.v8010Tab='machine'});
  }catch(_){}
}
function setTab(tab){
  if(tab!=='machine'){
    toast('Tütchen · Coming Soon','info','Der Harz-Automat ist bereits verfügbar.');
    tab='machine';
  }
  S.active=true;
  tabs().forEach(b=>{
    const bags=b.dataset.v8010Tab==='bags';
    const machine=b.dataset.v8010Tab==='machine';
    b.classList.toggle('active',machine);
    b.classList.toggle('coming-soon',bags);
    b.disabled=bags;
    b.setAttribute('aria-disabled',bags?'true':'false');
    if(bags)b.innerHTML='<span>Tütchen</span><small>COMING SOON</small>';
    else b.textContent='Harz-Automat';
  });
  if(bagBody())bagBody().hidden=true;
  if(panel())panel().hidden=false;
  void load();
}

function tierInfo(stake){
  if(stake===5)return {count:1,headline:'1 Belohnung',sub:'60 % Gold · 25 % Material · 15 % Ausrüstung'};
  if(stake===10)return {count:2,headline:'2 Belohnungen',sub:'45 % Gold · 30 % Material · 25 % Ausrüstung je Ziehung'};
  if(stake===25)return {count:3,headline:'3 Belohnungen',sub:'1× Ausrüstung Blau+ garantiert · danach bessere Chancen'};
  return {count:5,headline:'5 Belohnungen',sub:'1× Ausrüstung Episch+ garantiert · höchste Chancen'};
}
function qualityLabel(q){
  return ({gray:'Normal',green:'Grün',blue:'Blau',purple:'Episch',orange:'Legendär',cyan:'Mythisch',gold:'Gold'})[q]||q||'Belohnung';
}
function chancesHtml(){
  return `<div class="v8011-chances">
    <h3>Chancen &amp; Garantien</h3>
    <div><b>5 Harz-Taler</b><span>1 Belohnung · 60 % Gold · 25 % Material · 15 % Ausrüstung</span><small>Ausrüstung: 55 % Grau · 35 % Grün · 10 % Blau. Material: 70 % Grün · 30 % Blau.</small></div>
    <div><b>10 Harz-Taler</b><span>2 Belohnungen · je 45 % Gold · 30 % Material · 25 % Ausrüstung</span><small>Ausrüstung: 30 % Grau · 45 % Grün · 22 % Blau · 3 % Episch. Material: 25 % Grün · 60 % Blau · 15 % Episch.</small></div>
    <div><b>25 Harz-Taler</b><span>3 Belohnungen · erste Belohnung garantiert Ausrüstung Blau oder besser</span><small>Garantie: 78 % Blau · 20 % Episch · 2 % Legendär. Weitere Ziehungen: 35 % Gold · 30 % Material · 35 % Ausrüstung.</small></div>
    <div><b>50 Harz-Taler</b><span>5 Belohnungen · erste Belohnung garantiert Ausrüstung Episch oder besser</span><small>Garantie: 82 % Episch · 16 % Legendär · 2 % Mythisch. Weitere Ziehungen: 25 % Gold · 25 % Material · 50 % Ausrüstung.</small></div>
    <p>Alle Belohnungen sind ausschließlich virtuelle Spielinhalte. Kein Echtgeldgewinn, keine Auszahlung und kein Spieler-Jackpot.</p>
  </div>`;
}
function rewardHtml(r){
  const q=esc(r?.quality||'');
  const label=esc(r?.label||'Belohnung');
  const icon=esc(r?.icon||'🎁');
  const amount=r?.kind==='gold'?'<strong>'+fmt(r.amount)+' Gold</strong>':'<strong>'+label+'</strong>';
  return `<div class="v8011-reward q-${q}"><div class="v8011-reward-icon">${icon}</div><div>${amount}<small>${esc(qualityLabel(r?.quality))}</small></div></div>`;
}
function rewardsPopup(){
  if(!Array.isArray(S.rewards))return '';
  return `<div class="v8010-popup-backdrop" data-v8011-close>
    <section class="v8010-popup v8011-reward-popup" role="dialog" aria-modal="true">
      <button type="button" class="v8010-popup-close" data-v8011-close>×</button>
      <div class="v8010-popup-title"><small>Grow Legends · Harz-Automat</small><h3>Dein Päckchen</h3></div>
      <div class="v8011-reward-list">${S.rewards.map(rewardHtml).join('')}</div>
      <button type="button" class="btn v8011-ok" data-v8011-close>Belohnungen ansehen ✓</button>
    </section>
  </div>`;
}
function infoPopup(){
  if(!S.info)return '';
  return `<div class="v8010-popup-backdrop" data-v8011-info-close>
    <section class="v8010-popup" role="dialog" aria-modal="true">
      <button type="button" class="v8010-popup-close" data-v8011-info-close>×</button>
      <div class="v8010-popup-title"><small>Grow Legends · Harz-Automat</small><h3>Chancen &amp; Belohnungen</h3></div>
      ${chancesHtml()}
    </section>
  </div>`;
}
function packageHtml(){
  if(!S.pending)return '<div class="v8010-machine-wait">Wähle deinen Einsatz</div>';
  return `<button type="button" class="v8011-package" data-v8011-reveal aria-label="Päckchen öffnen">
    <span>📦</span><b>Päckchen öffnen</b><small>${fmt(S.pending.reward_count)} Belohnung${Number(S.pending.reward_count)===1?'':'en'}</small>
  </button>`;
}
function paint(){
  const root=body();if(!root)return;
  if(!S.data){
    root.innerHTML='<div class="v8010-loading">🎁 Harz-Automat wird geladen …</div>';
    return;
  }
  const harz=Number(S.data.harz)||0;
  const t=tierInfo(S.selected);
  const stakes=[5,10,25,50];
  root.innerHTML=`<div class="v8010-wrap v8011-wrap">
    <section class="v8010-head">
      <div class="v8010-head-copy"><small>Grow Legends · Hinterhof</small><h2>Harz-Automat</h2><p>Harz-Taler einwerfen · Päckchen ziehen · Belohnungen öffnen</p></div>
    </section>

    <div class="v8010-machine v8011-machine">
      <div class="v8010-machine-topinfo"><small>Dein Bestand</small><b>${fmt(harz)} Harz-Taler</b><span>${S.pending?'Päckchen liegt bereit':t.headline}</span></div>
      ${packageHtml()}
    </div>

    <section class="v8011-controls">
      <div class="v8011-stakes">
        ${stakes.map(x=>`<button type="button" data-v8011-stake="${x}" class="${S.selected===x?'active':''}" ${S.pending||S.busy?'disabled':''}>${x}<small>Harz-Taler</small></button>`).join('')}
      </div>
      <div class="v8011-tier-copy"><b>${esc(t.headline)}</b><span>${esc(t.sub)}</span></div>
      <button type="button" class="btn v8011-play" data-v8011-play ${S.pending||S.busy||harz<S.selected?'disabled':''}>
        ${S.pending?'Öffne zuerst dein Päckchen':S.busy?'Automat läuft …':S.selected+' Harz-Taler einwerfen'}
      </button>
      <button type="button" class="v8011-info-btn" data-v8011-info>Chancen &amp; mögliche Belohnungen</button>
      <p class="v8011-note">Je höher der Einsatz, desto mehr Belohnungen und desto bessere Qualitätschancen. Alle Ziehungen werden serverseitig festgelegt.</p>
    </section>
    ${rewardsPopup()}
    ${infoPopup()}
  </div>`;
}

async function load(){
  const x=db();if(!x)return;
  try{
    const {data,error}=await x.rpc('v8011_harz_machine_state');
    if(error)throw error;
    const r=one(data);if(!r?.ok)throw new Error('MACHINE_STATE_FAILED');
    S.data=r;S.pending=r.pending||null;S.lastError='';
    paint();
  }catch(e){
    S.lastError=String(e?.message||e);
    const root=body();if(root)root.innerHTML='<div class="v8010-loading">Harz-Automat konnte nicht geladen werden.</div>';
  }
}
async function play(){
  if(S.busy||S.pending)return;
  const x=db();if(!x)return;
  S.busy=true;paint();
  try{
    const {data,error}=await x.rpc('v8011_harz_machine_play',{p_stake:S.selected});
    if(error)throw error;
    const r=one(data);if(!r?.ok)throw new Error('MACHINE_PLAY_FAILED');
    if(typeof s!=='undefined'&&s)s.harzTaler=Math.max(0,Number(r.harz)||0);
    S.pending={draw_id:r.draw_id,stake:r.stake,reward_count:r.reward_count};
    S.data={...(S.data||{}),harz:r.harz,pending:S.pending};
    try{window.v069SyncCurrencies?.();window.v6213SyncCurrencies?.()}catch(_){}
    try{window.v6111Sfx?.('reward')}catch(_){}
    toast('📦 Päckchen ausgegeben','success','Tippe auf das Päckchen im Ausgabefach.');
  }catch(e){
    const m=String(e?.message||e);
    if(m.includes('INSUFFICIENT_HARZ'))toast('Nicht genug Harz-Taler','warn','Wähle einen kleineren Einsatz.');
    else if(m.includes('MACHINE_PACKAGE_PENDING'))toast('Päckchen wartet','info','Öffne zuerst das Päckchen im Ausgabefach.');
    else toast('Automat nicht verfügbar','error','Die Ziehung konnte nicht abgeschlossen werden.');
    await load();
  }finally{S.busy=false;paint()}
}
async function reveal(){
  if(S.busy||!S.pending?.draw_id)return;
  const x=db();if(!x)return;
  S.busy=true;
  try{
    const {data,error}=await x.rpc('v8011_harz_machine_reveal',{p_draw_id:S.pending.draw_id});
    if(error)throw error;
    const r=one(data);if(!r?.ok)throw new Error('MACHINE_REVEAL_FAILED');
    S.rewards=Array.isArray(r.rewards)?r.rewards:[];
    S.pending=null;
    S.data={...(S.data||{}),pending:null};
    try{await window.v7063ItemStageRefresh?.(true)}catch(_){}
    try{await window.v7077ProgressRefresh?.()}catch(_){}
    try{window.v069SyncCurrencies?.();window.v6213SyncCurrencies?.()}catch(_){}
  }catch(e){
    toast('Päckchen konnte nicht geöffnet werden','error','Bitte versuche es erneut.');
  }finally{S.busy=false;paint()}
}

document.addEventListener('click',e=>{
  const tab=e.target?.closest?.('#bagDealer [data-v8010-tab]');
  if(tab){e.preventDefault();setTab(tab.dataset.v8010Tab);return}
  const stake=e.target?.closest?.('[data-v8011-stake]');
  if(stake){S.selected=Number(stake.dataset.v8011Stake)||5;paint();return}
  if(e.target?.closest?.('[data-v8011-play]')){e.preventDefault();void play();return}
  if(e.target?.closest?.('[data-v8011-reveal]')){e.preventDefault();void reveal();return}
  if(e.target?.closest?.('[data-v8011-info]')){S.info=true;paint();return}
  if(e.target?.closest?.('[data-v8011-info-close]')){S.info=false;paint();return}
  if(e.target?.closest?.('[data-v8011-close]')){S.rewards=null;paint();return}
},true);

window.addEventListener('growlegends:navigation-ready',renameDealer,{passive:true});
window.addEventListener('pageshow',renameDealer,{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  if(String(e?.detail?.id||'')==='bagDealer'){renameDealer();setTab('machine')}
},{passive:true});

window.v8011HarzMachine={open:()=>setTab('machine'),load,diagnostics:()=>({active:S.active,busy:S.busy,selected:S.selected,pending:!!S.pending})};
renameDealer();
setTab('machine');
})();