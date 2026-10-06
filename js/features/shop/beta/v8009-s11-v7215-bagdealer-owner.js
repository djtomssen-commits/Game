(()=>{
'use strict';
if(window.__V7215_BAG_DEALER_OWNER__)return;
window.__V7215_BAG_DEALER_OWNER__=true;

const BAG_ART={
  normal:'assets/v8-inline/d8723279ac61b4e0.webp',
  premium:'assets/v8-inline/8fe8c1cde9fe6262.webp'
};
const S={active:false,busy:false,data:null,lastError:'',help:false};
const one=d=>Array.isArray(d)?d[0]:d;
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const fmt=n=>Math.max(0,Math.round(Number(n)||0).toLocaleString('de-DE'));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const screen=()=>document.getElementById('bagDealer');
const body=()=>document.getElementById('v7215BagBody');
const machine=()=>document.getElementById('v8010LottoPanel');

function toast(title,type='info',detail=''){
  try{return window.v063Toast?.(title,type,detail)}catch(_){}
}
function rarityClass(r){
  const q=String(r||'gray').toLowerCase();
  return 'q-'+(['gray','green','blue','purple','orange'].includes(q)?q:'gray');
}
function artFor(b,isNext=false){
  const q=String(b?.rarity||'').toLowerCase();
  const stage=Number(b?.stage)||0;
  return isNext||q==='purple'||q==='orange'||stage>=3?BAG_ART.premium:BAG_ART.normal;
}
function rewardLine(r){
  r=r||{};
  const parts=[];
  const gold=Math.max(0,Number(r.gold)||0);
  const fragments=Math.max(0,Number(r.fragments)||0);
  const harz=Math.max(0,Number(r.harz)||0);
  const time=Math.max(0,Number(r.time)||0);
  if(gold)parts.push(fmt(gold)+' Gold');
  if(fragments)parts.push(fmt(fragments)+' Fragmente');
  if(harz)parts.push(fmt(harz)+' Harz-Taler');
  if(time)parts.push(fmt(time)+' Zeit-Samen');
  return parts.length?parts.join(' · '):'Virtuelle Spielbelohnung';
}
function packHtml(b,isNext=false){
  b=b||{};
  const title=esc(b.title||(isNext?'Nächstes Tütchen':'Tütchen'));
  const subtitle=esc(b.subtitle||'');
  const target=Math.max(1,Number(b.target)||1);
  const art=artFor(b,isNext);
  return `<div class="v7219-pack ${rarityClass(b.rarity)} ${isNext?'next':''}" style="--bag-art:url('${art}')">
    <div class="v7221-pack-art" aria-hidden="true"></div>
    <div class="v7221-pack-footer">
      <div class="v7221-pack-title">${title}</div>
      <div class="v7221-pack-meta">${subtitle}${isNext?' · '+target+' Anzeigen':''}</div>
    </div>
  </div>`;
}
function progressPct(){
  const b=S.data?.bag||{};
  const target=Math.max(1,Number(b.target)||1);
  return Math.max(0,Math.min(100,Math.round((Math.max(0,Number(S.data?.progress)||0)/target)*100)));
}
function isNative(){
  try{return !!window.Capacitor?.Plugins?.GrowLegendsAds?.showRewarded}catch(_){return false}
}
function statusCopy(){
  if(!S.data?.enabled)return 'Werbe-Belohnungen sind derzeit serverseitig deaktiviert.';
  if(S.data.mode==='test'&&S.data.adminTestAllowed)return 'Testmodus aktiv · Admin-Test kann ohne echte Auszahlung an Google Ads geprüft werden.';
  if(S.data.mode==='test')return 'Testmodus aktiv. Produktive Rewarded Ads sind noch nicht freigeschaltet.';
  if(!isNative())return 'Rewarded Ads sind nur in der Android-App verfügbar.';
  return 'Vollständig angesehene Rewarded Ads zählen jeweils genau einmal.';
}
function helpHtml(){
  if(!S.help)return '';
  return `<div class="v7215-help-backdrop" data-v7215-help-close>
    <section class="v7215-help-modal" role="dialog" aria-modal="true">
      <button type="button" class="v7215-help-close" data-v7215-help-close>×</button>
      <h3>So funktionieren Tütchen</h3>
      <p>Du schaust freiwillig eine Rewarded Ad. Nur eine vollständig bestätigte Anzeige erhöht den serverseitigen Fortschritt um 1.</p>
      <p>Ist die für das aktuelle Tütchen nötige Anzahl erreicht, wird die Belohnung automatisch serverseitig gutgeschrieben und das nächste Tütchen beginnt.</p>
      <p>Mehrere Runden an einem Tag bleiben möglich, die Belohnungen werden danach stufenweise reduziert. Die aktuelle Reduktion siehst du direkt im Dealer.</p>
      <button type="button" class="btn secondary" data-v7215-help-close>Verstanden</button>
    </section>
  </div>`;
}
function paint(){
  const root=body();if(!root)return;
  if(!S.data){
    root.innerHTML='<div class="v7219-loading-card"><div class="v7219-loading-bag">🌿</div><b>Dealer bereitet dein Tütchen vor …</b><span>Fortschritt wird serverseitig geladen.</span></div>';
    return;
  }
  const b=S.data.bag||{}, next=S.data.nextBag||{};
  const target=Math.max(1,Number(b.target)||1);
  const progress=Math.max(0,Number(S.data.progress)||0);
  const pct=progressPct();
  const reward=b.reward||{};
  const canAdminTest=S.data.mode==='test'&&!!S.data.adminTestAllowed;
  const canNative=S.data.mode==='prod'&&isNative();
  const canWatch=!!S.data.enabled&&(canAdminTest||canNative)&&!S.busy;
  root.innerHTML=`<div class="v7219-main-grid">
    <section class="v7219-board">
      <div class="v7219-board-title">Aktuelles Tütchen</div>
      <div class="v7219-current-content">
        ${packHtml(b,false)}
        <div class="v7219-fill">
          <h3>${esc(b.title||'Tütchen')}</h3>
          <div class="v7219-fill-sub">${esc(b.subtitle||'')}</div>
          <div class="v7219-progress-line"><b>${progress} / ${target}</b><span>Anzeigen</span></div>
          <div class="v7219-progress" aria-label="Fortschritt ${pct} Prozent"><i style="width:${pct}%"></i></div>
          <div class="v7215-round-meta">
            <span>Runde heute <b>${Math.max(1,Number(S.data.dailyRound)||1)}</b></span>
            <span>Belohnungsfaktor <b>${Math.max(0,Number(S.data.roundRewardPct)||0)} %</b></span>
          </div>
          <button type="button" class="btn v7219-watch" data-v7215-watch ${canWatch?'':'disabled'}>
            ${S.busy?'Anzeige läuft …':canAdminTest?'Test-Anzeige simulieren':'Rewarded Ad ansehen'}
          </button>
          <div class="v7219-status">${esc(statusCopy())}</div>
          <div class="v7219-mini">Mögliche aktuelle Tütchen-Belohnung: ${esc(rewardLine(reward))}</div>
        </div>
      </div>
    </section>

    <aside class="v7219-board v7219-next">
      <div class="v7219-board-title">Danach</div>
      <div class="v7219-next-inner">
        ${packHtml(next,true)}
        <div class="v7219-next-name">${esc(next.title||'Nächstes Tütchen')}</div>
        <div class="v7219-next-copy">${esc(rewardLine(next.reward||{}))}</div>
      </div>
    </aside>
  </div>

  <section class="v7219-how">
    <h3>So funktioniert es</h3>
    <div class="v7219-how-list">
      <div class="v7219-how-row"><b>1.</b><span>Rewarded Ad freiwillig starten.</span></div>
      <div class="v7219-how-row"><b>2.</b><span>Nur vollständig bestätigte Anzeigen zählen.</span></div>
      <div class="v7219-how-row"><b>3.</b><span>Beim Ziel schreibt der Server die Tütchen-Belohnung automatisch gut.</span></div>
    </div>
  </section>
  ${helpHtml()}`;
}
async function load(){
  const x=db();if(!x)return;
  try{
    const {data,error}=await x.rpc('v7215_ad_bag_state');
    if(error)throw error;
    const r=one(data);if(!r?.ok)throw new Error('AD_BAG_STATE_FAILED');
    S.data=r;S.lastError='';paint();
  }catch(e){
    S.lastError=String(e?.message||e);
    const root=body();if(root)root.innerHTML='<div class="v7219-loading-card"><b>Tütchen konnten nicht geladen werden.</b><span>Bitte später erneut versuchen.</span></div>';
  }
}
async function adminTestWatch(){
  const x=db();if(!x)return;
  const {data,error}=await x.rpc('v7215_ad_bag_admin_test_watch');
  if(error)throw error;
  return one(data);
}
async function nativeWatch(){
  const ads=window.Capacitor?.Plugins?.GrowLegendsAds;
  if(!ads?.showRewarded)throw new Error('NATIVE_REWARDED_UNAVAILABLE');
  const result=await ads.showRewarded({placement:'ad_bag'});
  if(result?.rewarded===false||result?.completed===false)throw new Error('AD_NOT_COMPLETED');
  return result;
}
async function watch(){
  if(S.busy||!S.data?.enabled)return;
  S.busy=true;paint();
  try{
    const before=Number(S.data.totalAds)||0;
    if(S.data.mode==='test'){
      if(!S.data.adminTestAllowed)throw new Error('TEST_ADMIN_ONLY');
      await adminTestWatch();
    }else{
      await nativeWatch();
    }
    await load();
    const after=Number(S.data?.totalAds)||0;
    if(after>before){
      toast('Tütchen-Fortschritt +1','success','Die Anzeige wurde serverseitig bestätigt.');
      try{window.v069SyncCurrencies?.();window.v6213SyncCurrencies?.()}catch(_){}
      try{await window.v7063ItemStageRefresh?.(true)}catch(_){}
      try{await window.v7077ProgressRefresh?.()}catch(_){}
    }else if(S.data.mode==='prod'){
      toast('Bestätigung wird verarbeitet','info','Die Anzeige wurde beendet. Der Server bestätigt die Belohnung separat.');
    }
  }catch(e){
    const m=String(e?.message||e);
    if(m.includes('TEST_ADMIN_ONLY'))toast('Tütchen noch im Testmodus','info','Produktive Rewarded Ads sind noch nicht freigeschaltet.');
    else if(m.includes('AD_NOT_COMPLETED'))toast('Keine Belohnung','info','Nur vollständig angesehene Anzeigen zählen.');
    else if(m.includes('NATIVE_REWARDED_UNAVAILABLE'))toast('Nur in der Android-App','info','Rewarded Ads sind im Browser nicht verfügbar.');
    else toast('Anzeige nicht verfügbar','error','Der Rewarded-Ad-Vorgang konnte nicht abgeschlossen werden.');
  }finally{S.busy=false;paint()}
}
function open(){
  S.active=true;
  if(body())body().hidden=false;
  if(machine())machine().hidden=true;
  screen()?.querySelectorAll('[data-v8010-tab]').forEach(b=>{
    const bags=b.dataset.v8010Tab==='bags';
    b.classList.toggle('active',bags);
    b.setAttribute('aria-selected',bags?'true':'false');
  });
  void load();
}
function close(){
  S.active=false;
  if(body())body().hidden=true;
}
function bind(){
  const help=document.getElementById('v7219HelpBtn');
  if(help&&!help.dataset.v7215Bound){help.dataset.v7215Bound='1';help.addEventListener('click',()=>{S.help=true;paint()})}
}

document.addEventListener('click',e=>{
  if(e.target?.closest?.('[data-v7215-watch]')){e.preventDefault();void watch();return}
  if(e.target?.closest?.('[data-v7215-help-close]')){e.preventDefault();S.help=false;paint();return}
},true);
window.addEventListener('growlegends:navigation-ready',bind,{passive:true});
window.addEventListener('pageshow',bind,{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='bagDealer')bind()},{passive:true});
document.addEventListener('DOMContentLoaded',bind,{once:true});

window.v7215BagDealer={
  open,close,load,watch,
  diagnostics:()=>({active:S.active,busy:S.busy,loaded:!!S.data,mode:S.data?.mode||'',enabled:!!S.data?.enabled,nativeRewarded:isNative(),lastError:S.lastError})
};
window.v7215BagDealerOpen=open;
window.v7215Load=load;
bind();
})();