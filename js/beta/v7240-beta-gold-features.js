(()=>{
'use strict';
if(window.__V7240_BETA_GOLD_FEATURES__)return;
window.__V7240_BETA_GOLD_FEATURES__=true;
if(!['beta','server1'].includes(String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()))return;

const VERSION='V7.273';
const fmt=v=>Math.max(0,Math.round(Number(v)||0)).toLocaleString('de-DE');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LAB={
 staerke:'Stärke',ausdauer:'Ausdauer',geschick:'Geschick',intelligenz:'Intelligenz',glueck:'Glück'
};
const ICON={staerke:'💪',ausdauer:'❤️',geschick:'🏹',intelligenz:'🧠',glueck:'🍀'};



const V7248_BRAND_BG="assets/v8-inline/3b369bef7debb315.png";
const S={
 forge:null,forgeItemId:'',focus:'',forgeBusy:false,lastForge:null,forgeError:'',
 forgeRequestId:'',forgeRequestKey:'',
 caravan:null,caravanBusy:false,resolution:null,caravanError:'',
 caravanAutoTimer:0,caravanAutoToken:0,caravanRewardKey:''
};

function authUser(){
 try{if(typeof v073User!=='undefined'&&v073User)return v073User}catch(_){}
 try{return window.v073User||null}catch(_){return null}
}
function logged(){
 const u=authUser();
 return !!(u?.id&&!u?.is_anonymous);
}
function toast(t,type='info',d=''){try{window.v063Toast?.(t,type,d)}catch(_){}}
function requestId(prefix='v8009'){
 try{return `${prefix}_${crypto.randomUUID().replaceAll('-','')}`}catch(_){return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,12)}`}
}
function art(it){
 try{
  const u=window.v466ItemArtUri?.(it)||window.v4115ComicItemArtUri?.(it)||window.v4106ComicItemArtUri?.(it)||'';
  if(u)return `<img src="${esc(u)}" alt="${esc(it?.name||'Item')}">`;
 }catch(_){}
 return `<span class="fallback">${esc(it?.icon||'⚔️')}</span>`;
}
function itemId(it){return String(it?.id||it?.uid||'')}
function syncGold(g){
 try{s.gold=Math.max(0,Number(g)||0)}catch(_){}
 try{v069SyncCurrencies?.()}catch(_){}
 try{v441PaintResources?.()}catch(_){}
}
function syncCaravanResources(x){
 if(!x)return;
 syncGold(x.gold);
 try{
  s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
  s.v488Forge.fragments=Math.max(0,Number(x.fragments)||0);
  s.timeSeeds=Math.max(0,Number(x.timeSeeds)||0);
 }catch(_){}
}
function syncForgeItem(r){
 if(!r?.item)return;
 try{
  const iid=itemId(r.item);
  const inv=Array.isArray(s.inventory)?s.inventory:[];
  const ix=inv.findIndex(x=>itemId(x)===iid);
  if(ix>=0)inv[ix]=r.item;
  else if(r.slot&&s.equipment?.[r.slot])s.equipment[r.slot]=r.item;
  syncGold(r.gold);
 }catch(_){}
}

/* ------------------------- Nebelschmied ------------------------- */
async function loadForge(force=false){
 if(S.forge&&!force)return S.forge;
 S.forgeError='';
 if(!logged()){S.forgeError='Dein Account ist noch nicht vollständig geladen.';return null}
 if(typeof v073Db==='undefined'||!v073Db){S.forgeError='Keine Verbindung zur Spieldatenbank.';return null}
 try{
  const {data,error}=await v073Db.rpc('v7240_nebelforge_state');
  if(error)throw error;
  S.forge=Array.isArray(data)?data[0]:data;
  if(!S.forge?.ok)throw new Error('Nebelschmied-State ungültig');
  const items=Array.isArray(S.forge.items)?S.forge.items:[];
  if(!items.some(x=>x.id===S.forgeItemId))S.forgeItemId=items[0]?.id||'';
  const cur=items.find(x=>x.id===S.forgeItemId);
  const keys=Object.keys(cur?.native||{}).filter(k=>LAB[k]);
  if(!keys.includes(S.focus))S.focus=keys[0]||'';
  syncGold(S.forge.gold);
  return S.forge;
 }catch(e){
  console.warn('[V7.273] nebelforge state',e);
  S.forgeError=String(e?.message||e||'Nebelschmied konnte nicht geladen werden.');
  toast('Nebelschmied nicht erreichbar','warn',S.forgeError);
  return null
 }
}
function forgeItem(){return (S.forge?.items||[]).find(x=>x.id===S.forgeItemId)||null}
function statGrid(native){
 const rows=Object.entries(native||{}).filter(([k])=>LAB[k]);
 return `<div class="v7240-stat-grid">${rows.map(([k,v])=>`<div class="v7240-stat"><small>${ICON[k]||'◆'} ${esc(LAB[k]||k)}</small><b>${fmt(v)}</b></div>`).join('')}</div>`;
}
function forgePanelHtml(){
 const f=S.forge,items=Array.isArray(f?.items)?f.items:[],x=forgeItem();
 if(!f){
  const msg=S.forgeError
   ?`<div class="v7240-loading"><b style="display:block;color:#f0c36f;margin-bottom:7px">🔥 Nebelschmied konnte nicht laden</b>${esc(S.forgeError)}<br><button class="v7240-reroll" data-v7241-forge-retry style="margin-top:12px;max-width:280px">Erneut laden</button></div>`
   :'<div class="v7240-loading">🔥 Nebelschmied wird geladen …</div>';
  return `<div id="v7240Nebelforge">${msg}</div>`;
 }
 if(!x)return `<div id="v7240Nebelforge"><div class="v7240-loading">Keine Ausrüstung gefunden, die neu geschmiedet werden kann.</div></div>`;
 const keys=Object.keys(x.native||{}).filter(k=>LAB[k]);
 return `<div id="v7240Nebelforge" class="${S.lastForge?'v7240-hit':''}">
   <div class="v7240-forge-scene">
     <div class="v7240-forge-head">
       <div class="v7240-forge-title"><b>🔥 Nebelschmied</b></div>
       <div class="v7240-forge-wallet">🪙 ${fmt(f.gold)}</div>
     </div>
     <div class="v7240-item-stage">${art(x.item)}</div>
     <div class="v7240-forge-copy">
       <b>${esc(x.name)}</b>
       <small>Der Schmied verteilt nur die natürlichen Itemwerte neu. Gesamtwert, Seltenheit, Level, Edelstein, Rolle und Spezialeffekte bleiben erhalten.</small>
     </div>
   </div>
   <div class="v7240-forge-control">
     <div class="v7240-forge-items">
       <div class="v7240-forge-section-title">Ausrüstung auswählen</div>
       <div class="v7240-forge-list">${items.map(it=>`<button class="v7240-forge-item ${it.id===x.id?'active':''}" data-v7240-forge-item="${esc(it.id)}"><div class="top"><span class="art">${art(it.item)}</span><span><b>${esc(it.name)}</b><small>${it.place==='equipment'?'Angelegt':'Inventar'} · ${fmt(it.rerolls)}× geschmiedet</small></span></div></button>`).join('')}</div>
     </div>
     <div class="v7240-forge-detail">
       <div class="v7240-forge-section-title">Aktuelle natürliche Werte</div>
       ${statGrid(x.native)}
       <div class="v7240-focus-title">WUNSCHRICHTUNG · wird stärker gewichtet, aber nicht garantiert</div>
       <div class="v7240-focuses">${keys.map(k=>`<button class="v7240-focus ${S.focus===k?'active':''}" data-v7240-focus="${k}">${ICON[k]||'◆'} ${esc(LAB[k])}</button>`).join('')}</div>
       <div class="v7240-costbox">
         <small>NÄCHSTER SCHMIEDEVERSUCH · Kosten steigen pro Item</small>
         <strong>🪙 ${fmt(x.cost)} Gold</strong>
         <button class="v7240-reroll" data-v7240-reroll ${S.forgeBusy||Number(f.gold)<Number(x.cost)?'disabled':''}>🔥 ITEM NEU SCHMIEDEN</button>
         <div class="v7240-resultline">${S.lastForge&&S.lastForge.itemId===x.id?`Letzter Versuch: ${Object.entries(S.lastForge.newNative||{}).filter(([k])=>LAB[k]).map(([k,v])=>`${LAB[k]} ${fmt(v)}`).join(' · ')}`:`Der Gesamtwert wird nicht erhöht – du jagst die bessere Verteilung.`}</div>
       </div>
     </div>
   </div>
 </div>`;
}
async function renderForgePanel(){
 const body=document.querySelector('#forge .v667-forge-body');if(!body)return;
 let p=body.querySelector('#v7240Nebelforge');
 if(!p){p=document.createElement('div');p.id='v7240Nebelforge';body.appendChild(p)}
 if(!S.forge)p.innerHTML='<div class="v7240-loading">🔥 Nebelschmied wird geladen …</div>';
 await loadForge(false);
 const old=body.querySelector('#v7240Nebelforge');if(old)old.outerHTML=forgePanelHtml();
 bindForgePanel();
}
function bindForgePanel(){
 const p=document.getElementById('v7240Nebelforge');if(!p)return;
 p.querySelector('[data-v7241-forge-retry]')?.addEventListener('click',async()=>{
  S.forge=null;S.forgeError='';await loadForge(true);renderForgePanel();
 });
 p.querySelectorAll('[data-v7240-forge-item]').forEach(b=>b.onclick=()=>{
  S.forgeItemId=b.dataset.v7240ForgeItem||'';S.lastForge=null;
  const x=forgeItem(),keys=Object.keys(x?.native||{}).filter(k=>LAB[k]);S.focus=keys[0]||'';
  renderForgePanel();
 });
 p.querySelectorAll('[data-v7240-focus]').forEach(b=>b.onclick=()=>{S.focus=b.dataset.v7240Focus||'';renderForgePanel()});
 p.querySelector('[data-v7240-reroll]')?.addEventListener('click',()=>void doForgeReroll());
}
async function doForgeReroll(){
 if(S.forgeBusy)return;
 const x=forgeItem();if(!x)return;
 let ok=true;
 try{
  ok=typeof v115Confirm==='function'
   ?await v115Confirm(`${x.name}\n\n${fmt(x.cost)} Gold ausgeben und die natürlichen Werte neu verteilen?\n\nGesamtwert, Edelstein und Verzauberung bleiben erhalten.`,{title:'🔥 Nebelschmied',type:'warn',okText:`Für ${fmt(x.cost)} Gold schmieden`})
   :window.confirm(`${x.name} für ${fmt(x.cost)} Gold neu schmieden?`);
 }catch(_){ok=false}
 if(!ok)return;
 S.forgeBusy=true;renderForgePanel();
 try{
  const requestKey=`${x.id}|${S.focus||''}`;
  if(!S.forgeRequestId||S.forgeRequestKey!==requestKey){
    S.forgeRequestId=requestId('v8009_nebelforge');
    S.forgeRequestKey=requestKey;
  }
  const {data,error}=await v073Db.rpc('v8009_nebelforge_reroll',{p_item_id:x.id,p_focus_stat:S.focus||null,p_request_id:S.forgeRequestId});
  if(error)throw error;
  const r=Array.isArray(data)?data[0]:data;
  if(!r?.ok)throw new Error('Schmiedevorgang fehlgeschlagen');
  S.forgeRequestId='';S.forgeRequestKey='';
  syncForgeItem(r);S.lastForge=r;S.forge=null;
  try{window.v6111Sfx?.('forge')}catch(_){}
  await loadForge(true);renderForgePanel();
  setTimeout(()=>document.getElementById('v7240Nebelforge')?.classList.remove('v7240-hit'),850);
  toast(r?.duplicate?'🔥 Schmiedevorgang bereits bestätigt':'🔥 Neu geschmiedet','success',`${x.name} · ${fmt(r.cost)} Gold`);
 }catch(e){
  console.warn('[V7.273] nebelforge reroll',e);
  toast('Schmieden fehlgeschlagen','warn',String(e?.message||e));
 }finally{S.forgeBusy=false;renderForgePanel()}
}
async function openNebelforge(){
 const forge=document.getElementById('forge');if(!forge)return false;
 if(!forge.classList.contains('active')){try{v032Go('forge')}catch(_){}}
 /* V8.009: v488 owns the full three-tab shell. Build that shell once,
    then switch only the forge body into the server-owned Nebelschmied view. */
 forge.classList.remove('v7240-nebel-open');
 try{window.v488ForgeRender?.()}catch(_){}
 forge.classList.add('v7240-nebel-open');
 forge.querySelectorAll('.v667-tabs [data-v667-tab]').forEach(x=>x.classList.toggle('active',x.dataset.v667Tab==='nebelforge'));
 S.forge=null;S.forgeError='';
 await renderForgePanel();
 return true;
}

/* ------------------------- Nebelkarawane ------------------------- */
const META={
 ambush:{tag:'⚔️ HINTERHALT',title:'Räuber im Nebel',text:'Maskierte Plünderer blockieren die Straße. Sie haben deine Ladung bereits im Blick.',img:'assets/v7195-base64/1fb10cd5477636707061.webp',
  choices:[['fight','⚔️ Durchbrechen','60 % Chance auf etwas Gold + Fragmente. Bei Niederlage verlierst du 20 % deiner bisherigen Goldladung.'],['hide','🌫️ Im Nebel warten','Sicher. Nur ein kleiner Goldfund, dafür kein Ladungsverlust.']]},
 trader:{tag:'🛒 FAHRENDER DEALER',title:'Der Händler ohne Namen',text:'Ein gepanzerter Wagen öffnet seine Seitenklappe. Niemand fragt, woher die Ware stammt.',img:'assets/v7195-base64/d7febd02e0a8451b1b68.webp',
  choices:[['deal','🤝 Seltene Ware kaufen','Zusätzlich 8 % des Eintritts zahlen. Dafür sichere Fragmente und eine routenabhängige Chance auf einen Zeit-Samen.'],['gamble','🎲 Schattenhandel','45 % Chance auf moderates Gold. Bei Pech verlierst du 15 % deiner bisherigen Goldladung.']]},
 chest:{tag:'📦 FUNDORT',title:'Kiste am Straßenrand',text:'Eine schwere Kiste liegt halb im Schlamm. Zu offensichtlich – oder genau deshalb echt?',img:'assets/v7195-base64/06f5b41251d19dfe186a.webp',
  choices:[['open','🔓 Aufbrechen','Sehr seltene Jackpot-Chance. Meist nur moderates Gold + Fragmente; manchmal fast leer.'],['leave','🚶 Weiterfahren','Kein Risiko. Dafür nur ein sehr kleiner sicherer Goldfund.']]},
 shortcut:{tag:'🛣️ ABKÜRZUNG',title:'Die versunkene Nebenroute',text:'Der Weg durch den alten Growbezirk spart Stunden – wenn der Wagen nicht stecken bleibt.',img:'assets/v7195-base64/145298215b1b7ed53710.webp',
  choices:[['rush','🔥 Durchziehen','60 % Chance auf moderates Gold und eventuell einen Zeit-Samen. Bei Pech 10 % Ladungsverlust.'],['detour','🧭 Umweg nehmen','Sicher. Sehr kleiner Goldfund, kein Ladungsverlust.']]},
 fog:{tag:'🌫️ DICHTER NEBEL',title:'Kein Wegweiser mehr',text:'Die Straße verschwindet vollständig. Ein Fremder bietet an, euch durch den Nebel zu führen.',img:'assets/v7195-base64/5b5e276b2e07a7eea793.webp',
  choices:[['guide','🕯️ Führer bezahlen','Zusätzlich 6 % des Eintritts zahlen. Dafür sicher ein kleiner Goldfund + Fragmente.'],['through','🌫️ Allein durch','45 % Chance auf moderates Gold. Bei Misserfolg kein Fund, aber kein Ladungsverlust.']]},
 hermit:{tag:'🧙 EINSIEDLER',title:'Der Mann unter der Brücke',text:'Zwischen alten Lampen und Pflanzenkisten sitzt ein Händler, der nur in Rätseln spricht.',img:'assets/v7195-base64/b03e902fb4a2ae00ad63.webp',
  choices:[['buy','⏳ Omen kaufen','Zusätzlich 8 % des Eintritts zahlen. Garantierter Zeit-Samen plus Fragmente.'],['listen','👂 Geschichte anhören','Kostenlos. Kleine Fragmente und eine geringe Chance auf einen Zeit-Samen.']]}
};
async function loadCaravan(force=false){
 if(S.caravan&&!force)return S.caravan;
 S.caravanError='';
 if(!logged()){S.caravanError='Dein Account ist noch nicht vollständig geladen.';return null}
 if(typeof v073Db==='undefined'||!v073Db){S.caravanError='Keine Verbindung zur Spieldatenbank.';return null}
 try{
  const {data,error}=await v073Db.rpc('v7240_caravan_state');
  if(error)throw error;
  S.caravan=Array.isArray(data)?data[0]:data;
  v7266TrackActiveRun(S.caravan?.run);
  syncCaravanResources(S.caravan);return S.caravan;
 }catch(e){
  console.warn('[V7.273] caravan state',e);
  S.caravanError=String(e?.message||e||'Nebelkarawane konnte nicht geladen werden.');
  toast('Nebelkarawane nicht erreichbar','warn',S.caravanError);
  return null
 }
}
function ensureCaravanSection(){
 let sec=document.getElementById('caravan');
 if(!sec){
  sec=document.createElement('section');sec.id='caravan';sec.className='screen';
  const host=document.querySelector('main')||document.querySelector('.content')||document.body;
  host.appendChild(sec);
  const legal=document.getElementById('v337LegalFooter');if(legal&&legal.parentElement===host)host.appendChild(legal);
 }
 return sec;
}
function tierUi(tier){
 const id=String(tier||'spur');
 if(id==='kingpin')return{icon:'👑',name:'Königsroute',risk:'HOCH',riskCls:'high',seed:28};
 if(id==='convoy')return{icon:'🚚',name:'Schmuggler-Konvoi',risk:'MITTEL',riskCls:'med',seed:18};
 return{icon:'🌫️',name:'Nebelspur',risk:'NIEDRIG',riskCls:'',seed:10};
}
function routeHtml(run){
 const n=Math.max(0,Math.min(5,Number(run?.station)||0));
 return `<div class="v7245-path">${[0,1,2,3,4].map(i=>`<div class="v7245-path-node ${i<n?'done':i===n&&n<5?'current':''}"><span>${i<n?'✓':i+1}</span><small>${i===n&&n<5?'JETZT':''}</small></div>`).join('')}</div>`;
}
function cargoHtml(run){
 const raw=Math.max(0,Number(run?.cargoGold)||0);
 const cap=Math.max(0,Number(run?.goldCap)||0);
 const shown=cap>0?Math.min(raw,cap):raw;
 const pct=Math.max(0,Number(run?.goldCapPct)||0);
 const spent=Math.max(0,Number(run?.extraSpent)||0);
 return `<div class="v7245-cargo-bar">
  <div class="v7245-cargo"><small>GOLDLADUNG</small><b>🪙 ${fmt(shown)}</b></div>
  <div class="v7245-cargo"><small>MAX. GOLDFUND</small><b>${fmt(pct)} %</b></div>
  <div class="v7245-cargo"><small>FRAGMENTE ×${fmt(run?.fragmentMult||1)}</small><b>💠 ${fmt(run?.fragments)}</b></div>
  <div class="v7245-cargo"><small>ZUSATZAUSGABEN</small><b>🪙 ${fmt(spent)}</b></div>
 </div>`;
}
function historyHtml(run){
 const rows=Array.isArray(run?.history)?run.history:[];
 if(!rows.length)return '';
 return `<details class="v7245-history"><summary>📜 Reiseprotokoll · ${rows.length} Station${rows.length===1?'':'en'}</summary><div class="v7245-history-list">${rows.map((h,i)=>{
   const m=META[h.type]||{};
   const delta=[
    Number(h.goldDelta)>0?`🪙 +${fmt(h.goldDelta)}`:'',
    Number(h.fragmentsDelta)>0?`💠 +${fmt(h.fragmentsDelta)}`:'',
    Number(h.timeSeedsDelta)>0?`⏳ +${fmt(h.timeSeedsDelta)}`:'',
    Number(h.extraSpend)>0?`🪙 −${fmt(h.extraSpend)}`:''
   ].filter(Boolean).join(' · ');
   return `<div class="v7245-history-row"><span class="num">${i+1}</span><span><b>${esc(m.title||h.type||'Station')}</b><small>${esc(h.result||'')}</small></span><em>${delta||'—'}</em></div>`;
 }).join('')}</div></details>`;
}
function choicePresentation(type,id,run){
 const entry=Math.max(1,Number(run?.entryCost)||1);
 const costPct={
  'trader:deal':8,'fog:guide':6,'hermit:buy':8
 }[`${type}:${id}`]||0;
 const riskIds=new Set(['fight','gamble','open','rush','through']);
 if(costPct)return{tag:`KOSTET ~ ${fmt(Math.round(entry*costPct/100))} GOLD`,cls:'cost'};
 if(riskIds.has(id))return{tag:'RISIKO',cls:'risk'};
 return{tag:'SICHER',cls:''};
}
function v7247ChoiceLoot(type,id){
 const m={
  'ambush:fight':['🪙 Gold','💠 Fragmente','⚠ Ladung'],
  'ambush:hide':['🪙 kleiner Fund','✓ sicher'],
  'trader:deal':['💠 Fragmente','⏳ Chance','🪙 Kosten'],
  'trader:gamble':['🪙 Gold','⚠ Ladung'],
  'chest:open':['🪙 Gold','💠 Fragmente','✦ Jackpot'],
  'chest:leave':['🪙 kleiner Fund','✓ sicher'],
  'shortcut:rush':['🪙 Gold','⏳ Chance','⚠ Ladung'],
  'shortcut:detour':['🪙 kleiner Fund','✓ sicher'],
  'fog:guide':['💠 Fragmente','🪙 kleiner Fund','🪙 Kosten'],
  'fog:through':['🪙 Gold','⚠ Fehlschlag'],
  'hermit:buy':['⏳ garantiert','💠 Fragmente','🪙 Kosten'],
  'hermit:listen':['💠 Fragmente','⏳ kleine Chance']
 };
 return m[`${type}:${id}`]||['🎁 Beute'];
}
function v7247ResultMood(r){
 const gain=(Number(r?.goldDelta)||0)+(Number(r?.fragmentsDelta)||0)*50+(Number(r?.timeSeedsDelta)||0)*500;
 if(gain>0)return{icon:'✨',title:'Beute gesichert',bad:false};
 if(Number(r?.extraSpend)>0)return{icon:'🤝',title:'Deal abgeschlossen',bad:false};
 return{icon:'🌫️',title:'Knapp weitergekommen',bad:true};
}
function v7247RouteArt(tier){
 if(tier==='kingpin')return META.ambush.img;
 if(tier==='convoy')return META.trader.img;
 return META.fog.img;
}
function v7247ClearAuto(){
 if(S.caravanAutoTimer){clearTimeout(S.caravanAutoTimer);S.caravanAutoTimer=0}
}
function v7247ScheduleAuto(){
 v7247ClearAuto();
 const token=++S.caravanAutoToken;
 if(!S.resolution)return;
 S.caravanAutoTimer=setTimeout(()=>{
  if(token!==S.caravanAutoToken)return;
  S.caravanAutoTimer=0;
  S.resolution=null;
  renderCaravan();
  try{document.getElementById('caravan')?.scrollIntoView({block:'start',behavior:'smooth'})}catch(_){}
 },2800);
}

function v7254RewardKey(run){
 if(!run||run.status!=='complete')return '';
 return [run.id||run.run_id||'',run.updated_at||'',run.started_at||run.created_at||'',run.tier||'',run.entryCost||0,run.cargoGold||0,run.fragments||0,run.timeSeeds||0,run.extraSpent||0].join('|');
}
function v7266RunIdentity(run){
 if(!run)return '';
 return [run.id||run.run_id||'',run.started_at||run.created_at||'',run.tier||'',run.entryCost||0].join('|');
}
function v7266RewardOwner(){
 return String(S.caravan?.run?.user_id||S.caravan?.user_id||window.v073User?.id||window.currentUser?.id||'beta');
}
function v7266RewardStorageKey(kind){
 return `growLegends:caravanReward:${v7266RewardOwner()}:${kind}`;
}
function v7266ReadRewardStore(kind){
 try{return String(localStorage.getItem(v7266RewardStorageKey(kind))||'')}catch(_){return ''}
}
function v7266WriteRewardStore(kind,value){
 try{value?localStorage.setItem(v7266RewardStorageKey(kind),String(value)):localStorage.removeItem(v7266RewardStorageKey(kind))}catch(_){}
}
function v7266TrackActiveRun(run){
 if(!run||run.status!=='active')return;
 const id=v7266RunIdentity(run);
 if(id)v7266WriteRewardStore('active',id);
}
function v7254RewardPopupText(run){
 const safeGold=Math.min(Number(run?.cargoGold)||0,Number(run?.goldCap)||Number(run?.cargoGold)||0);
 return `Deine Karawane ist zurück.\n\n🪙 Gold: ${fmt(safeGold)}\n💠 Fragmente: ${fmt(run?.fragments||0)}\n🌱 Zeit-Samen: ${fmt(run?.timeSeeds||0)}\n\nEintritt: 🪙 ${fmt(run?.entryCost||0)}${Number(run?.extraSpent||0)>0?`\nZusatzausgaben: 🪙 ${fmt(run?.extraSpent||0)}`:''}`;
}
function v7254MaybeShowCompletionReward(){
 const run=S.caravan?.run;
 if(!run||run.status!=='complete')return;
 const key=v7254RewardKey(run);
 if(!key)return;
 const seen=v7266ReadRewardStore('seen');
 if(S.caravanRewardKey===key||seen===key)return;
 const active=v7266ReadRewardStore('active');
 const runId=v7266RunIdentity(run);
 /* Historical completion after login/page-open: mark it seen silently.
    Only a run that was previously observed as active may create a popup. */
 if(!runId||active!==runId){
  S.caravanRewardKey=key;
  v7266WriteRewardStore('seen',key);
  return;
 }
 S.caravanRewardKey=key;
 v7266WriteRewardStore('seen',key);
 v7266WriteRewardStore('active','');
 const text=v7254RewardPopupText(run);
 setTimeout(async()=>{
  try{
   if(typeof v115Alert==='function')await v115Alert(text,'🚚 Belohnung erhalten','success');
   else toast('🚚 Belohnung erhalten','success',text.replace(/\n+/g,' · '));
  }catch(_){
   toast('🚚 Belohnung erhalten','success',text.replace(/\n+/g,' · '));
  }
 },120);
}

function v7248StationTypes(run){
 const src=Array.isArray(run?.stations)&&run.stations.length?run.stations.map(x=>String(x?.type||'fog')):[];
 const fallback=['ambush','fog','trader','shortcut','chest'];
 const out=(src.length?src:fallback).slice(0,5);
 while(out.length<5)out.push(fallback[out.length%fallback.length]);
 return out;
}
function v7248HeroBg(){return V7248_BRAND_BG}
function v7248ChoiceModel(type,id,run){
 const entry=Math.max(1,Number(run?.entryCost)||1);
 const goldCost=n=>`~ ${fmt(Math.round(entry*n/100))}`;
 const map={
  'ambush:hide':{title:'Ausweichen',desc:'Durch den Nebel schleichen und unbemerkt passieren.',btn:'Leise weiter',risk:'Geringes Risiko',cls:'safe',icon:'🍃',art:META.shortcut.img,rewards:[['🪙','500 – 1.500','Gold'],['💠','1 – 3','Fragmente'],['🌱','1','Zeit-Samen']]},
  'ambush:fight':{title:'Kämpfen',desc:'Den Räubern die Stirn bieten und deine Ladung verteidigen.',btn:'Angriff wagen',risk:'Hohes Risiko',cls:'risk',icon:'⚔️',art:META.ambush.img,rewards:[['🪙','1.500 – 5.000','Gold'],['💠','3 – 8','Fragmente'],['🌱','2 – 4','Zeit-Samen']]},
  'fog:guide':{title:'Führer bezahlen',desc:'Einen Ortskundigen anheuern und sicher durch den Nebel kommen.',btn:'Führer nehmen',risk:`Kosten ${goldCost(6)} Gold`,cls:'cost',icon:'🕯️',art:META.fog.img,rewards:[['🪙','300 – 1.200','Gold'],['💠','2 – 5','Fragmente'],['🌱','0 – 1','Zeit-Samen']]},
  'fog:through':{title:'Allein durch',desc:'Auf dein Glück setzen und ohne Hilfe weiterziehen.',btn:'Allein weiter',risk:'Mittleres Risiko',cls:'risk',icon:'🌫️',art:META.fog.img,rewards:[['🪙','800 – 2.800','Gold'],['💠','1 – 3','Fragmente'],['🌱','0 – 1','Zeit-Samen']]},
  'trader:deal':{title:'Deal eingehen',desc:'Seltene Ware kaufen und auf wertvolle Funde hoffen.',btn:'Deal schließen',risk:`Kosten ${goldCost(8)} Gold`,cls:'cost',icon:'🤝',art:META.trader.img,rewards:[['🪙','0 – 1.200','Gold'],['💠','3 – 7','Fragmente'],['🌱','0 – 1','Zeit-Samen']]},
  'trader:gamble':{title:'Schattenhandel',desc:'Mit Risiko verhandeln und auf einen dicken Goldfund spekulieren.',btn:'Deal riskieren',risk:'Hohes Risiko',cls:'risk',icon:'🎲',art:META.trader.img,rewards:[['🪙','1.200 – 4.200','Gold'],['💠','1 – 3','Fragmente'],['🌱','0 – 1','Zeit-Samen']]},
  'chest:open':{title:'Kiste knacken',desc:'Die schwere Kiste öffnen und auf einen Jackpot hoffen.',btn:'Kiste öffnen',risk:'Mittleres Risiko',cls:'risk',icon:'📦',art:META.chest.img,rewards:[['🪙','700 – 4.800','Gold'],['💠','2 – 6','Fragmente'],['🌱','0 – 2','Zeit-Samen']]},
  'chest:leave':{title:'Vorbeifahren',desc:'Kein Risiko eingehen und nur einen kleinen Fund mitnehmen.',btn:'Weiterrollen',risk:'Sicher',cls:'safe',icon:'🚚',art:META.chest.img,rewards:[['🪙','200 – 900','Gold'],['💠','0 – 2','Fragmente'],['🌱','0','Zeit-Samen']]},
  'shortcut:rush':{title:'Durchziehen',desc:'Die Abkürzung im Volltempo nehmen und Zeit sowie Beute gewinnen.',btn:'Jetzt durchziehen',risk:'Hohes Risiko',cls:'risk',icon:'🔥',art:META.shortcut.img,rewards:[['🪙','1.000 – 3.600','Gold'],['💠','2 – 5','Fragmente'],['🌱','0 – 2','Zeit-Samen']]},
  'shortcut:detour':{title:'Umweg nehmen',desc:'Langsamer, aber ohne Ladungsverlust zum Ziel.',btn:'Sicher fahren',risk:'Geringes Risiko',cls:'safe',icon:'🧭',art:META.shortcut.img,rewards:[['🪙','300 – 1.100','Gold'],['💠','1 – 2','Fragmente'],['🌱','0 – 1','Zeit-Samen']]},
  'hermit:buy':{title:'Omen kaufen',desc:'Die Prophezeiung des Einsiedlers bezahlen und sichere Extras mitnehmen.',btn:'Omen nehmen',risk:`Kosten ${goldCost(8)} Gold`,cls:'cost',icon:'🔮',art:META.hermit.img,rewards:[['🪙','0 – 800','Gold'],['💠','2 – 5','Fragmente'],['🌱','1','Zeit-Samen']]},
  'hermit:listen':{title:'Geschichte anhören',desc:'Dem Einsiedler zuhören und kleine Funde ohne Kosten mitnehmen.',btn:'Geschichte hören',risk:'Sicher',cls:'safe',icon:'👂',art:META.hermit.img,rewards:[['🪙','0 – 500','Gold'],['💠','1 – 3','Fragmente'],['🌱','0 – 1','Zeit-Samen']]}
 };
 return map[`${type}:${id}`]||{title:'Option wählen',desc:'Triff deine Entscheidung für die nächste Etappe.',btn:'Auswählen',risk:'Abenteuer',cls:'safe',icon:'🌿',art:(META[type]||META.fog).img,rewards:[['🪙','?','Gold'],['💠','?','Fragmente'],['🌱','?','Zeit-Samen']]};
}
function v7248ResultMood(r){
 const score=(Number(r?.goldDelta)||0)+(Number(r?.fragmentsDelta)||0)*120+(Number(r?.timeSeedsDelta)||0)*800-(Number(r?.extraSpend)||0);
 if(score>1600)return{icon:'🏆',title:'Starke Beute',bad:false};
 if(score>0)return{icon:'✨',title:'Beute gesichert',bad:false};
 if(Number(r?.extraSpend)>0)return{icon:'🤝',title:'Deal abgeschlossen',bad:false};
 return{icon:'🌫️',title:'Knapp weitergekommen',bad:true};
}
function v7248RoutePitch(t){
 const u=tierUi(t.id);
 if(t.id==='kingpin')return{
  desc:'Die prestigeträchtigste Route durch die gefährlichsten Nebelgebiete.',
  reward:'Große Goldfunde · Fragmente ×4 · beste Zeit-Samen-Chance',
  art:META.ambush.img,badge:`${u.risk}ES RISIKO · AB LEVEL ${fmt(t.level)}`
 };
 if(t.id==='convoy')return{
  desc:'Mehr Einsatz, mehr Spannung und deutlich bessere Materialbeute.',
  reward:'Starke Goldfunde · Fragmente ×2 · verbesserte Zeit-Samen-Chance',
  art:META.trader.img,badge:`${u.risk}ES RISIKO · AB LEVEL ${fmt(t.level)}`
 };
 return{
  desc:'Der schnelle Einstieg für regelmäßige Touren durch den Nebel.',
  reward:'Solide Goldfunde · Fragmente ×1 · Zeit-Samen möglich',
  art:META.fog.img,badge:`${u.risk}ES RISIKO · AB LEVEL ${fmt(t.level)}`
 };
}
function tiersHtml(c){
 return `<div class="v7249-routes">${(c.tiers||[]).map(t=>{
   const u=tierUi(t.id),locked=Number(c.level)<Number(t.level);
   const desc=t.id==='kingpin'
    ?'Endgame-Route mit den stärksten Materialchancen.'
    :t.id==='convoy'
      ?'Mehr Einsatz für bessere Fragmente und Zeit-Samen.'
      :'Solider Einstieg für regelmäßige Touren.';
   return `<article class="v7249-route ${locked?'locked':''}">
     <div><h4>${esc(t.name)}</h4><p>${esc(desc)}</p><div class="v7249-route-tags"><span>${u.risk}ES RISIKO</span><span>💠 ×${fmt(t.fragmentMult||1)}</span><span>🌱 bis ${fmt(u.seed)} %</span><span>🪙 bis ${fmt(t.goldCapPct)} %</span></div></div>
     <div class="v7249-route-side"><b>🪙 ${fmt(t.cost)}</b><button data-v7240-start="${esc(t.id)}" ${locked||Number(c.gold)<Number(t.cost)?'disabled':''}>${locked?`AB LV. ${fmt(t.level)}`:'STARTEN'}</button></div>
   </article>`;
 }).join('')}</div>`;
}

function v7249Progress(run){
 const list=v7248StationTypes(run);
 const idx=Math.max(0,Math.min(4,Number(run?.station)||0));
 const currentType=list[idx]||'fog';
 return `<div class="v7249-progress"><div class="v7253-progress-row">${list.map((typ,i)=>{
   const cls=i<idx?'done':i===idx?'current':'';
   return `<div class="v7249-step ${cls}"><div class="v7249-step-circle">${i<idx?'✓':i+1}</div></div>`;
 }).join('')}</div><div class="v7253-current-stop"><span>STATION ${idx+1}/5</span><b>${esc((META[currentType]||META.fog).title)}</b></div></div>`;
}
function v7249ChoiceCard(type,id,run){
 const c=v7248ChoiceModel(type,id,run);
 return `<article class="v7249-action ${c.cls}" data-v7240-choice="${esc(id)}" role="button" tabindex="0">
   <div class="v7249-action-head"><span class="v7249-action-icon">${c.icon}</span><h4>${esc(c.title)}</h4></div>
   <p>${esc(c.desc)}</p>
   <div class="v7249-risk ${c.cls==='safe'?'':c.cls}">${esc(c.risk)}</div>
   <div class="v7249-loot-label">Mögliche Beute</div>
   <div class="v7249-loot">${c.rewards.map(([ico,val,label])=>`<div class="v7249-reward"><span class="ico">${ico}</span><b>${esc(val)}</b><span>${esc(label)}</span></div>`).join('')}</div>
   <div class="v7249-action-btn">${esc(c.btn)}</div>
 </article>`;
}
function caravanBanner(c,run=null){
 const active=run?.status==='active';
 if(!active)return '';
 return `<div class="v7249-live"><div class="v7249-live-left">${active?`<span class="v7249-pill station">🚚 ${esc(tierUi(run?.tier).name)} · Station ${Math.min(5,(Number(run?.station)||0)+1)}/5</span>`:''}</div><span class="v7249-pill gold">🪙 ${fmt(c?.gold||0)}</span></div>`;
}

function v7250Hero(run,c){
 const active=run?.status==='active';
 const route=active?tierUi(run?.tier):null;
 const routeName=route?route.name:'Nebelkarawane';
 const station=active?`${Math.min(5,(Number(run?.station)||0)+1)}/5`:'Routenwahl';
 const desc=active
   ? 'Fünf Stationen. Wertvolle Beute. Deine Entscheidungen bestimmen den Weg.'
   : 'Wähle eine Route und schicke deine Karawane durch den Nebel.';
 const stats=active
   ? `<span>🚚 ${esc(routeName)}</span><span>📍 ${esc(station)}</span><span>🪙 Ladung ${fmt(run.cargoGold||0)}</span><span>💠 ${fmt(run.fragments||0)}</span><span>🌱 ${fmt(run.timeSeeds||0)}</span>`
   : `<span>🪙 Gold ${fmt(c?.gold||0)}</span><span>5 Stationen</span><span>3 Routen</span><span>Mehr Risiko = mehr Beute</span>`;
 return `<div class="v7250-hero"><span class="kicker">🌿 GROW LEGENDS · HANDELSROUTEN</span><h1>Nebelkarawane</h1><p>${esc(desc)}</p><div class="v7250-hero-stats">${stats}</div></div>`;
}

function caravanHtml(){
 const c=S.caravan;
 if(!c){
   const msg=S.caravanError?`<div class="v7240-loading"><b>Karawane konnte nicht laden</b><br>${esc(S.caravanError)}<br><button class="v7245-main-btn" data-v7241-caravan-retry style="margin-top:12px">Erneut laden</button></div>`:'<div class="v7240-loading">🚚 Nebelkarawane wird geladen …</div>';
   return `<div class="v7249-page">${msg}</div>`;
 }
 const run=c.run;
 const stageStart=`<div class="v7249-page"><section class="v7249-stage ${!run||run.status!=='active'?'v7254-route-select':'v7254-live-run'}"><img class="v7249-bg" src="${V7248_BRAND_BG}" alt="" aria-hidden="true"><div class="v7250-topmask"></div><div class="v7250-footmask"></div>${caravanBanner(c,run)}${v7250Hero(run,c)}`;
 const stageEnd=`</section></div>`;

 if(!run||run.status!=='active'){
   return `${stageStart}
     ${tiersHtml(c)}
   ${stageEnd}`;
 }

 const idx=Math.max(0,Math.min(4,Number(run.station)||0));
 const typ=run?.stations?.[Math.min(idx,4)]?.type||run?.lastResult?.type||'fog';
 const m=META[typ]||META.fog;

 if(S.resolution){
   const r=S.resolution,mood=v7248ResultMood(r);
   const loot=[
    Number(r.goldDelta)>0?`🪙 +${fmt(r.goldDelta)}`:'',
    Number(r.fragmentsDelta)>0?`💠 +${fmt(r.fragmentsDelta)}`:'',
    Number(r.timeSeedsDelta)>0?`🌱 +${fmt(r.timeSeedsDelta)}`:'',
    Number(r.extraSpend)>0?`🪙 −${fmt(r.extraSpend)}`:''
   ].filter(Boolean);
   return `${stageStart}
    ${v7249Progress(run)}
    <div class="v7249-encounter"><div><small>AKTUELLE BEGEGNUNG</small><h3>${esc(m.title)}</h3><p>${esc(m.text)}</p></div></div>
    <div class="v7249-result"><div class="v7249-result-panel ${mood.bad?'bad':''}"><div class="v7249-result-icon">${mood.icon}</div><small>ERGEBNIS</small><h3>${mood.title}</h3><p>${esc(r.text||'Die Karawane zieht weiter.')}</p><div class="v7249-result-loot">${(loot.length?loot:['Keine zusätzliche Beute']).map(x=>`<span>${esc(x)}</span>`).join('')}</div><div class="v7249-auto"><i></i><button data-v7247-skip>${run.status==='complete'?'Tourabschluss wird geöffnet …':'Karawane fährt automatisch weiter …'} · antippen zum Überspringen</button></div></div></div>
    <div class="v7249-bottom"><div class="v7249-status"><span class="ico">🚚</span><div><small>Ladung</small><b>🪙 ${fmt(run.cargoGold||0)} · 💠 ${fmt(run.fragments||0)} · 🌱 ${fmt(run.timeSeeds||0)}</b><p>Die Beute wird am Ende der Tour gesichert.</p></div></div><div class="v7249-status"><span class="ico">⏳</span><div><small>Max. Goldfund</small><b>${fmt(run.goldCapPct||0)} %</b></div></div></div>
   ${stageEnd}`;
 }

 const cards=(m.choices||[]).map(([id])=>v7249ChoiceCard(typ,id,run)).join('');
 return `${stageStart}
   ${v7249Progress(run)}
   <div class="v7249-encounter"><div><small>AKTUELLE BEGEGNUNG</small><h3>${esc(m.title)}</h3><p>${esc(m.text)}</p></div></div>
   <div class="v7249-actions">${cards}</div>
   <div class="v7249-bottom"><div class="v7249-status"><span class="ico">🚚</span><div><small>Ladung</small><b>🪙 ${fmt(run.cargoGold||0)} · 💠 ${fmt(run.fragments||0)} · 🌱 ${fmt(run.timeSeeds||0)}</b><p>Sichere Ankunft bringt deine Beute nach Hause.</p></div></div><div class="v7249-status"><span class="ico">⏳</span><div><small>Max. Goldfund</small><b>${fmt(run.goldCapPct||0)} %</b></div></div></div>
 ${stageEnd}`;
}

async function renderCaravan(){
 const sec=ensureCaravanSection();
 sec.innerHTML=caravanHtml();
 bindCaravan();
 v7254MaybeShowCompletionReward();
 if(S.resolution)v7247ScheduleAuto();else v7247ClearAuto();
}
function bindCaravan(){
 const sec=document.getElementById('caravan');if(!sec)return;
 sec.querySelector('[data-v7241-caravan-retry]')?.addEventListener('click',async()=>{
  S.caravan=null;S.caravanError='';await loadCaravan(true);renderCaravan();
 });
 sec.querySelectorAll('[data-v7240-start]').forEach(b=>b.onclick=()=>void startCaravan(b.dataset.v7240Start));
 sec.querySelectorAll('[data-v7240-choice]').forEach(card=>{
  const go=()=>void chooseCaravan(card.dataset.v7240Choice);
  card.addEventListener('click',go);
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
 });
 sec.querySelector('[data-v7247-skip]')?.addEventListener('click',()=>{
  v7247ClearAuto();S.caravanAutoToken++;S.resolution=null;renderCaravan();
 });
}
async function startCaravan(tier){
 if(S.caravanBusy)return;
 S.caravanBusy=true;
 try{
  const t=(S.caravan?.tiers||[]).find(x=>x.id===tier);
  let ok=true;
  if(t){
   ok=typeof v115Confirm==='function'
    ?await v115Confirm(`${t.name}\n\nEinsatz: ${fmt(t.cost)} Gold\nGold-Fund: bis ${fmt(t.goldCapPct)} %\nFragment-Bonus: ×${fmt(t.fragmentMult||1)}\n\nDie Tour hat 5 zufällige Stationen mit unterschiedlichen Chancen auf Gold, Fragmente und Zeit-Samen.`,{title:'🚚 Nebelkarawane starten?',type:'warn',okText:`Für ${fmt(t.cost)} Gold losfahren`})
    :window.confirm(`${t.name} für ${fmt(t.cost)} Gold starten?`);
  }
  if(!ok)return;
  const {data,error}=await v073Db.rpc('v7240_caravan_start',{p_tier:tier});
  if(error)throw error;
  S.caravan=Array.isArray(data)?data[0]:data;S.resolution=null;v7266TrackActiveRun(S.caravan?.run);syncCaravanResources(S.caravan);
  try{window.v6111Sfx?.('click')}catch(_){}
 }catch(e){console.warn('[V7.273] caravan start',e);toast('Tour konnte nicht starten','warn',String(e?.message||e))}
 finally{S.caravanBusy=false;renderCaravan()}
}
async function chooseCaravan(choice){
 if(S.caravanBusy)return;
 S.caravanBusy=true;
 try{
  const sec=document.getElementById('caravan');sec?.classList.add('v7247-resolving');sec?.classList.add('v7248-resolving');sec?.classList.add('v7249-resolving');
  const {data,error}=await v073Db.rpc('v7240_caravan_choose',{p_choice:choice});
  if(error)throw error;
  const r=Array.isArray(data)?data[0]:data;
  S.caravan=r;S.resolution=r?.resolution||null;v7266TrackActiveRun(r?.run);syncCaravanResources(r);
  try{window.v6111Sfx?.(Number(r?.resolution?.goldDelta)>0?'reward':'click')}catch(_){}
 }catch(e){console.warn('[V7.273] caravan choose',e);toast('Entscheidung fehlgeschlagen','warn',String(e?.message||e))}
 finally{
  S.caravanBusy=false;
  document.getElementById('caravan')?.classList.remove('v7247-resolving');
  document.getElementById('caravan')?.classList.remove('v7248-resolving');
  document.getElementById('caravan')?.classList.remove('v7249-resolving');
  renderCaravan()
 }
}
async function openCaravan(){
 v7247ClearAuto();S.caravanAutoToken++;
 ensureCaravanSection();
 document.querySelectorAll('.screen').forEach(el=>el.classList.remove('active'));
 document.getElementById('caravan')?.classList.add('active');
 try{document.getElementById('v032MenuPanel')?.classList.remove('show','open','active')}catch(_){}
 S.caravan=null;S.resolution=null;
 await loadCaravan(true);renderCaravan();
 window.scrollTo?.({top:0,behavior:'instant'});
 return true;
}
function ensureMenu(){
 const p=document.getElementById('v032MenuPanel');if(!p)return;
 let b=p.querySelector('[data-screen="caravan"]');
 if(!b){
  b=document.createElement('button');b.type='button';b.className='top-menu-item';b.dataset.screen='caravan';
  b.innerHTML='<span>🚚</span>Nebelkarawane';
  const tower=p.querySelector('[data-screen="tower"]');
  if(tower?.nextSibling)p.insertBefore(b,tower.nextSibling);else p.appendChild(b);
  b.onclick=e=>{e.preventDefault();e.stopPropagation();void openCaravan()};
 }
}

/* Integration with the canonical navigation/menu shared by Beta and Server 1. */
try{
 const base=window.v032Go;
 if(typeof base==='function'&&!base.__v7240Caravan){
  const w=function(id){if(id==='caravan')return openCaravan();const r=base.apply(this,arguments);document.getElementById('caravan')?.classList.remove('active');return r};
  w.__v7240Caravan=true;window.v032Go=w;try{v032Go=w}catch(_){}
 }
}catch(e){console.warn('[V7.273] caravan nav',e)}
try{
 const base=window.v4149BuildCompleteMenu;
 if(typeof base==='function'&&!base.__v7240Caravan){
  const w=function(){const r=base.apply(this,arguments);queueMicrotask(ensureMenu);return r};
  w.__v7240Caravan=true;window.v4149BuildCompleteMenu=w;
 }
}catch(_){}

/* Original forge tabs return ownership to the normal forge. */
document.addEventListener('click',e=>{
 const t=e.target instanceof Element?e.target.closest('#forge [data-v667-tab]'):null;
 if(t&&t.dataset.v667Tab!=='nebelforge'){
  document.getElementById('forge')?.classList.remove('v7240-nebel-open');
  document.getElementById('v7240Nebelforge')?.remove();
 }
 if(e.target instanceof Element&&e.target.closest('#v032MenuBtn,#v032MenuToggle')){
  requestAnimationFrame(()=>{
   ensureCaravanSection();ensureMenu();
   try{window.v4149BuildCompleteMenu?.(true)}catch(_){}
  });
 }
},true);

window.addEventListener('growlegends:navigation-open-v7119',e=>{
 const id=String(e?.detail?.id||'');
 if(id==='forge'&&document.getElementById('forge')?.classList.contains('v7240-nebel-open'))queueMicrotask(()=>void renderForgePanel());
 if(id!=='caravan')document.getElementById('caravan')?.classList.remove('active');
},{passive:true});
window.addEventListener('growlegends:account-ready',()=>{
 queueMicrotask(async()=>{
  ensureCaravanSection();ensureMenu();
  try{window.v4149BuildCompleteMenu?.(true)}catch(_){}
  if(document.getElementById('forge')?.classList.contains('v7240-nebel-open')){
   S.forge=null;S.forgeError='';await loadForge(true);renderForgePanel();
  }
  if(document.getElementById('caravan')?.classList.contains('active')){
   S.caravan=null;S.caravanError='';await loadCaravan(true);renderCaravan();
  }
 });
},{passive:true});
window.addEventListener('pageshow',()=>{
 ensureCaravanSection();ensureMenu();
 try{window.v4149BuildCompleteMenu?.(true)}catch(_){}
},{passive:true});
document.addEventListener('DOMContentLoaded',()=>{
 ensureCaravanSection();ensureMenu();
 try{window.v4149BuildCompleteMenu?.(true)}catch(_){}
},{once:true});
[250,900,2200].forEach(ms=>setTimeout(()=>{
 ensureCaravanSection();ensureMenu();
 try{window.v4149BuildCompleteMenu?.(true)}catch(_){}
},ms));

window.v7240OpenCaravan=openCaravan;
window.v7240OpenNebelforge=openNebelforge;
window.v7240BetaGoldDiagnostics=()=>({
 version:VERSION,beta:true,forgeTab:!!document.querySelector('#forge [data-v667-tab="nebelforge"]'),
 caravanMenu:!!document.querySelector('#v032MenuPanel [data-screen="caravan"]'),
 caravanScreen:!!document.getElementById('caravan'),
 forgeState:!!S.forge,caravanState:!!S.caravan,
 nebelforgeTab:!!document.querySelector('#forge .v667-tabs [data-v667-tab="nebelforge"]'),
 caravanNav:!!document.querySelector('#v032MenuPanel [data-screen="caravan"]'),
 caravanRewardSeen:v7266ReadRewardStore('seen'),
 caravanRewardActive:v7266ReadRewardStore('active'),
 bagDealerNav:!!document.querySelector('#v032MenuPanel [data-screen="bagDealer"]'),
 legacyForgeSuppressed:!!document.getElementById('forge')?.classList.contains('v7240-nebel-open')
});
})();
