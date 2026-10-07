(()=>{
'use strict';
if(window.__V7137_SHIFT_FRAME_CLIENT__)return;
window.__V7137_SHIFT_FRAME_CLIENT__=true;
const VERSION='V7.145';
const S={shift:null,frames:null,hours:1,mode:'quest',busy:false,lastShiftReady:'',profileCache:new Map(),shiftFlight:null,frameFlight:null,lastShiftLoad:0,lastFrameLoad:0};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>Math.max(0,Math.floor(Number(v)||0));
const fmt=v=>num(v).toLocaleString('de-DE');
const one=d=>Array.isArray(d)?d[0]:d;
const logged=()=>{try{return !!v073User?.id&&!v073User?.is_anonymous}catch(_){return false}};
async function db(){try{if(typeof v073Init==='function')await v073Init();return (typeof v073Db!=='undefined')?v073Db:null}catch(_){return null}}
async function rpc(name,args={}){const x=await db();if(!x)throw new Error('SERVER_NOT_READY');const {data,error}=await x.rpc(name,args);if(error)throw error;return one(data)}
function toast(title,type='success',detail=''){try{window.v063Toast?.(title,type,detail)}catch(_){}}
function avatarFor(cls){try{return typeof window.v080AvatarFor==='function'?(window.v080AvatarFor(cls)||''):''}catch(_){return''}}
function ownClass(){try{return String(s?.playerClass||'grower')}catch(_){return'grower'}}
function activity(k){return ({growroom:['🌿','Growroom-Schicht','Pflanzen prüfen, Lampen kontrollieren und Töpfe vorbereiten.'],lager:['📦','Kisten & Lager','Lieferungen sortieren und das Lager für die nächste Runde vorbereiten.'],werkstatt:['🔨','Werkstatt-Hilfe','In der Harzschmiede Material und Werkzeug für die Crew vorbereiten.'],markt:['🪙','Nachtmarkt','Am Marktstand aushelfen und Händlerkisten sichern.'],wache:['🌫️','Nebelwache','Die Wege rund um Grünhain im Blick behalten.']})[k]||['🛠️','Schicht','Deine Legende arbeitet eine Schicht.']}
function seedLabel(id){try{return seedTypes?.[id]?.name||String(id||'Samen').replaceAll('_',' ')}catch(_){return String(id||'Samen')}}
function timeText(sec){sec=Math.max(0,Math.ceil(Number(sec)||0));const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return h>0?`${h} Std ${String(m).padStart(2,'0')} Min`:`${m}:${String(s).padStart(2,'0')} Min`}

/* ---------- Quest & Schicht ---------- */
function renameQuestMenu(){
 try{document.querySelectorAll('#v032MenuPanel [data-screen="quests"],.top-menu-panel [data-screen="quests"]').forEach(el=>{const icon=el.querySelector('span');if(icon){[...el.childNodes].filter(n=>n.nodeType===3).forEach(n=>n.remove());el.append(' Quest & Schicht')}else el.textContent='📜 Quest & Schicht'})}catch(_){}
}
function ensureQuest(){
 const q=document.getElementById('quests');if(!q)return null;
 if(!q.querySelector(':scope > .v7137-page-head')){
   [...q.children].forEach(ch=>ch.classList.add('v7137-quest-base'));
   const head=document.createElement('div');head.className='v7137-page-head';head.innerHTML=`<small>Grünhain · Abenteuer & Nebenjob</small><b>QUEST &amp; SCHICHT</b><div class="v7137-tabs"><button type="button" class="v7137-tab active" data-v7137-mode="quest">📜 Quests</button><button type="button" class="v7137-tab" data-v7137-mode="shift">🛠️ Schicht</button></div>`;q.insertBefore(head,q.firstChild);
   const pane=document.createElement('div');pane.className='v7137-shift-pane';pane.id='v7137ShiftPane';q.appendChild(pane);
 }
 q.classList.toggle('v7137-mode-shift',S.mode==='shift');
 q.querySelectorAll('[data-v7137-mode]').forEach(b=>b.classList.toggle('active',b.dataset.v7137Mode===S.mode));
 const old=q.querySelector(':scope > .v7137-quest-base .char-bottom h2');if(old&&old.textContent.trim()==='Aufträge')old.textContent='Quests';
 renameQuestMenu();renderShift();return q;
}
function setQuestMode(mode){S.mode=mode==='shift'?'shift':'quest';const q=ensureQuest();if(!q)return;if(S.mode==='shift')void loadShift(true);}
function idleShiftHtml(){
 const st=S.shift||{},gph=num(st.gold_per_hour||20),h=S.hours,total=gph*h,src=avatarFor(ownClass());
 return `<div class="v7137-shift-hero"><div class="v7137-shift-avatar">${src?`<img src="${esc(src)}" alt="Dein Charakter">`:'🌿'}</div><div class="v7137-shift-copy"><small>Offline-Nebenverdienst</small><h2>Nebel-Schicht</h2><p>Schick deinen Charakter für 1–10 Stunden auf Schicht. Das Gold ist absichtlich niedriger als aktives Spielen. Mit kleiner Chance wartet beim Abholen ein seltener Fund.</p></div></div><div class="v7137-shift-card"><h3>⏱️ Schichtdauer wählen</h3><div class="v7137-shift-muted">Maximal 10 Stunden. Der Bonusfund wird nur einmal pro kompletter Schicht ausgewürfelt.</div><div class="v7137-hour-grid">${Array.from({length:10},(_,i)=>i+1).map(x=>`<button type="button" class="v7137-hour ${x===h?'active':''}" data-v7137-hours="${x}">${x}h</button>`).join('')}</div><div class="v7137-shift-economy"><div class="v7137-shift-stat gold"><small>pro Stunde</small><b>🪙 ${fmt(gph)}</b></div><div class="v7137-shift-stat gold"><small>${h} Stunden</small><b>🪙 ${fmt(total)}</b></div><div class="v7137-shift-stat"><small>Maximal</small><b>10 Std.</b></div></div><button type="button" class="btn gold v7137-shift-btn" data-v7137-start="1">🛠️ ${h}-Std.-Schicht starten</button><div class="v7137-rare-note"><b>Sehr seltene Zusatzfunde:</b> wenige Fragmente, ein normaler Samen, 1 Zeit-Samen oder mit extrem kleiner Chance 1 Harz-Taler. Die Belohnung wird serverseitig festgelegt und erst nach Schichtende ausgezahlt.</div></div>${statsHtml(st)}`;
}
function statsHtml(st){return `<div class="v7137-shift-card"><h3>📋 Schichtbuch</h3><div class="v7137-shift-economy"><div class="v7137-shift-stat"><small>Schichten</small><b>${fmt(st?.completed_shifts)}</b></div><div class="v7137-shift-stat"><small>Stunden</small><b>${fmt(st?.total_hours)}</b></div><div class="v7137-shift-stat"><small>Seltene Funde</small><b>${fmt(st?.rare_finds)}</b></div></div></div>`}
function activeShiftHtml(st){const [ico,name,desc]=activity(st.activity_key),src=avatarFor(ownClass()),start=Date.parse(st.started_at||0),end=Date.parse(st.ends_at||0),now=Date.now(),pct=end>start?Math.max(0,Math.min(100,((now-start)/(end-start))*100)):0;return `<div class="v7137-shift-hero"><div class="v7137-shift-avatar">${src?`<img src="${esc(src)}" alt="Dein Charakter">`:'🌿'}</div><div class="v7137-shift-copy"><small>Schicht läuft</small><h2>${esc(name)}</h2><p>${esc(desc)}</p></div></div><div class="v7137-shift-card v7137-shift-active"><div class="v7137-shift-task"><i>${ico}</i><div><b>${esc(name)} · ${num(st.hours)} Std.</b><span>Voraussichtlicher Lohn: 🪙 ${fmt(st.gold_preview)}</span></div></div><div class="v7137-shift-progress"><i style="width:${pct.toFixed(1)}%"></i></div>${st.ready?`<div class="v7137-shift-countdown">✅ SCHICHT BEENDET</div><button type="button" class="btn gold v7137-shift-btn" data-v7137-claim="1">🎁 Belohnung abholen</button>`:`<div class="v7137-shift-countdown" data-v7137-countdown="1">${timeText(st.seconds_left)}</div><div class="v7137-shift-muted" style="text-align:center">Du bekommst eine Push-Benachrichtigung, sobald die Schicht fertig ist.</div>`}</div>${statsHtml(st)}`}
function renderShift(){const p=document.getElementById('v7137ShiftPane');if(!p){syncShiftTicker();return}if(!logged()){p.innerHTML='<div class="v7137-shift-card"><h3>🔒 Account erforderlich</h3><div class="v7137-shift-muted">Schichten werden serverseitig gespeichert und stehen nur angemeldeten Spielern zur Verfügung.</div></div>';syncShiftTicker();return}if(!S.shift){p.innerHTML='<div class="v7137-shift-card"><h3>Schicht wird synchronisiert …</h3></div>';syncShiftTicker();return}p.innerHTML=S.shift.active?activeShiftHtml(S.shift):idleShiftHtml();syncShiftTicker();}
async function loadShift(force=false){
 if(!logged())return null;
 const now=Date.now();
 if(!force&&S.shift&&now-S.lastShiftLoad<30000){renderShift();return S.shift}
 if(S.shiftFlight)return S.shiftFlight;
 S.shiftFlight=(async()=>{try{const r=await rpc('v7137_shift_state');if(r?.ok){S.shift=r;S.lastShiftLoad=Date.now();renderShift();return r}}catch(e){if(force)toast('Schicht nicht erreichbar','error',String(e?.message||e))}return null})().finally(()=>{S.shiftFlight=null});
 return S.shiftFlight;
}
async function startShift(){if(S.busy)return;S.busy=true;try{const r=await rpc('v7137_start_shift',{p_hours:S.hours});if(!r?.ok)throw new Error(String(r?.reason||'SHIFT_START_FAILED'));S.shift=r;renderShift();toast('🛠️ Schicht gestartet','success',`${S.hours} Std. · Push kommt bei Schichtende.`)}catch(e){toast('Schicht konnte nicht starten','error',String(e?.message||e))}finally{S.busy=false}}
function rewardExtra(r){if(!r?.rare_type)return '<div class="v7137-reward-extra none">Diesmal kein seltener Zusatzfund.</div>';if(r.rare_type==='fragments')return `<div class="v7137-reward-extra">🧩 Seltener Fund: <b>+${num(r.rare_amount)} Fragmente</b></div>`;if(r.rare_type==='time_seed')return `<div class="v7137-reward-extra">⏳ Seltener Fund: <b>+${num(r.rare_amount)} Zeit-Samen</b></div>`;if(r.rare_type==='harz')return `<div class="v7137-reward-extra">💎 Extrem seltener Fund: <b>+${num(r.rare_amount)} Harz-Taler</b></div>`;if(r.rare_type==='seed')return `<div class="v7137-reward-extra">🌰 Seltener Fund: <b>+${num(r.rare_amount)} ${esc(seedLabel(r.seed_id))}</b></div>`;return''}
function showShiftReward(r){let ov=document.getElementById('v7137ShiftReward');if(!ov){ov=document.createElement('div');ov.id='v7137ShiftReward';document.body.appendChild(ov)}const a=activity(r.activity_key);ov.innerHTML=`<div class="v7137-modal"><div class="v7137-modal-head"><div><small style="color:#75c85a">SCHICHT ABGESCHLOSSEN</small><h2>${a[0]} ${esc(a[1])}</h2></div><button class="v7137-close" type="button">×</button></div><div class="v7137-reward-main"><span>${num(r.hours)} Stunden gearbeitet</span><strong>🪙 +${fmt(r.gold_awarded)} Gold</strong></div>${rewardExtra(r)}<button class="btn v7137-shift-btn" type="button" data-v7137-reward-ok="1">Belohnung bestätigen</button></div>`;ov.classList.add('show');ov.querySelector('.v7137-close').onclick=()=>ov.classList.remove('show');ov.querySelector('[data-v7137-reward-ok]').onclick=()=>ov.classList.remove('show');}
async function claimShift(){
 if(S.busy)return;
 const claimId=String(S.shift?.shift_id||'');
 S.busy=true;
 const btn=document.querySelector('#v7137ShiftPane [data-v7137-claim]');
 if(btn){btn.disabled=true;btn.setAttribute('aria-busy','true');btn.textContent='⏳ Belohnung wird gebucht …'}
 try{
  const r=await rpc('v7137_claim_shift');
  if(!r?.ok)throw new Error(String(r?.reason||'SHIFT_CLAIM_FAILED'));
  /* V7.189: duplicate=true is an idempotent server replay, never a second reward. */
  if(r.duplicate){
   S.lastShiftLoad=0;
   await loadShift(true);
   toast('Belohnung bereits abgeholt','success','Serverstand wurde aktualisiert.');
   return;
  }
  /* Retire the ready card immediately. Do not wait for the 30 s shift-state cache. */
  const prev=S.shift||{};
  S.shift={...prev,active:false,ready:false,shift_id:null,claimed_at:new Date().toISOString(),seconds_left:0,
   total_hours:num(r.total_hours),completed_shifts:num(r.completed_shifts),full_ten_shifts:num(r.full_ten_shifts),rare_finds:num(r.rare_finds)};
  S.lastShiftLoad=0;
  S.lastClaimedShift=claimId||String(r.shift_id||'');
  renderShift();
  showShiftReward(r);
  await Promise.allSettled([
   Promise.resolve().then(()=>window.v7077ProgressRefresh?.()),
   Promise.resolve().then(()=>window.v7063ItemStageRefresh?.(true)),
   Promise.resolve().then(()=>window.v7064GrowAuthorityRefresh?.()),
   Promise.resolve().then(()=>window.v7080AchievementRefresh?.(true))
  ]);
  await loadShift(true);
 }catch(e){
  S.lastShiftLoad=0;
  try{await loadShift(true)}catch(_){}
  toast('Belohnung nicht verfügbar','error',String(e?.message||e));
 }finally{
  S.busy=false;
  const b=document.querySelector('#v7137ShiftPane [data-v7137-claim]');
  if(b){b.disabled=false;b.removeAttribute('aria-busy')}
 }
}
function shiftTick(){const st=S.shift;if(!st?.active||st.ready||!st.ends_at){syncShiftTicker();return}const left=Math.max(0,Math.ceil((Date.parse(st.ends_at)-Date.now())/1000));st.seconds_left=left;if(left<=0){st.ready=true;renderShift();const key=String(st.shift_id||'');if(key&&S.lastShiftReady!==key){S.lastShiftReady=key;toast('⏰ Schicht beendet','success','Deine Belohnung wartet.')}}else{const el=document.querySelector('#v7137ShiftPane [data-v7137-countdown]');if(el)el.textContent=timeText(left);const bar=document.querySelector('#v7137ShiftPane .v7137-shift-progress i');const a=Date.parse(st.started_at||0),b=Date.parse(st.ends_at||0);if(bar&&b>a)bar.style.width=`${Math.max(0,Math.min(100,(Date.now()-a)/(b-a)*100)).toFixed(1)}%`;}}
let shiftTicker=0;
function shiftTickerNeeded(){return !document.hidden&&S.mode==='shift'&&!!document.getElementById('quests')?.classList.contains('active')&&!!S.shift?.active&&!S.shift?.ready&&!!S.shift?.ends_at}
function stopShiftTicker(){if(!shiftTicker)return;clearInterval(shiftTicker);shiftTicker=0}
function syncShiftTicker(){if(!shiftTickerNeeded()){stopShiftTicker();return}if(!shiftTicker){shiftTick();shiftTicker=window.setInterval(shiftTick,1000)}}

/* ---------- Avatar frames ---------- */
const V7139_FRAME_ASSETS=Object.freeze({
 ironwood:'assets/avatar_frames/ironwood.png',
 silver_vine:'assets/avatar_frames/silver_vine.png',
 gold_crown:'assets/avatar_frames/gold_crown.png',
 vip_crown:'assets/avatar_frames/gold_crown.png',
 emerald_aura:'assets/avatar_frames/emerald_aura.png',
 haze_ring:'assets/avatar_frames/haze_ring.png',
 resin_flame:'assets/avatar_frames/resin_flame.png',
 prismatic_myth:'assets/avatar_frames/prismatic_myth.png',
 referral_legend:'assets/avatar_frames/referral_legend.png'
});
function frameAssetUrl(id){return V7139_FRAME_ASSETS[String(id||'')]||''}
function frameArtMarkup(id){const src=frameAssetUrl(id);return src?`<img class="v7139-frame-art" src="${esc(src)}" alt="" aria-hidden="true" decoding="async">`:''}
window.v7137FrameArtMarkup=frameArtMarkup;
function applyFrame(el,id){
 if(!el)return;
 const fid=frameAssetUrl(id)?String(id):'';
 el.classList.add('v7137-frame-target');
 const arts=[...el.querySelectorAll(':scope > .v7139-frame-art')];
 const current=String(el.dataset.v7137Frame||'');
 const expected=frameAssetUrl(fid);
 const first=arts[0]||null;
 const firstSrc=first?.getAttribute?.('src')||'';
 if(fid && current===fid && arts.length===1 && firstSrc===expected)return;
 if(!fid && !current && arts.length===0)return;
 arts.forEach(n=>n.remove());
 if(fid){el.dataset.v7137Frame=fid;el.insertAdjacentHTML('beforeend',frameArtMarkup(fid))}
 else delete el.dataset.v7137Frame;
}
function ownPortraitTarget(){return document.querySelector('#character #v510HeroRoot .avatar-scene')||document.querySelector('#character .avatar-scene')||document.querySelector('#character #v510HeroRoot .v41-portrait')||document.querySelector('#character .v41-portrait')}
function applyOwnFrames(){const id=String(S.frames?.active_frame_id||'');document.body?.classList.remove('v7129-referral-frame');applyFrame(ownPortraitTarget(),id);applyFrame(document.querySelector('#world .v366-avatar'),id);applyFrame(document.querySelector('#v072OwnProfile .v646-own-avatar'),id);document.documentElement?.classList.remove('v7154-frame-pending');}
window.v7137ApplyOwnFrames=applyOwnFrames;
async function loadFrames(force=false){
 if(!logged())return null;
 const now=Date.now();
 if(!force&&S.frames&&now-S.lastFrameLoad<60000){applyOwnFrames();return S.frames}
 if(S.frameFlight)return S.frameFlight;
 S.frameFlight=(async()=>{try{const r=await rpc('v7137_avatar_frame_state');if(r?.ok){S.frames=r;S.lastFrameLoad=Date.now();window.__V7137_FRAME_STATE__=r;applyOwnFrames();renderFrameShop();renderFrameSelector();return r}}catch(e){if(force)toast('Rahmen nicht erreichbar','error',String(e?.message||e))}return null})().finally(()=>{S.frameFlight=null});
 return S.frameFlight;
}
function ensureDealerFrameTab(){try{window.v7117DealerHubSync?.()}catch(_){}document.querySelectorAll('#harzDealer .v7117-tabs,#goldShop .v7117-tabs').forEach(t=>{const framesOpen=!!t.closest('#harzDealer.v7137-frames-open');if(framesOpen)t.querySelectorAll('[data-v7117-tab]').forEach(b=>b.classList.toggle('active',b.dataset.v7117Tab==='frames'))});}
function frameDesc(f){if(f.source==='vip')return 'VIP-exklusiv · nur solange dein VIP-Pass aktiv ist.';if(f.source==='referral')return 'Nicht kaufbar · exklusiv aus dem 10-Freunde-Paket.';if(f.effect)return 'Animierter Prestige-Rahmen mit sichtbarem Effekt.';return 'Hochwertiger dauerhafter Prestige-Rahmen.'}
function framePreview(f,cls=''){const src=avatarFor(ownClass()),art=f?.id?frameArtMarkup(f.id):'';return `<div class="v7137-frame-preview v7137-frame-target ${cls}" ${f?.id?`data-v7137-frame="${esc(f.id)}"`:''}><span class="v7140-preview-avatar-clip">${src?`<img class="v7139-preview-avatar" src="${esc(src)}" alt="Rahmen-Vorschau">`:'🌿'}</span>${art}</div>`}
function ensureFrameShop(){const h=document.getElementById('harzDealer');if(!h)return null;let p=document.getElementById('v7137FrameShop');if(!p){p=document.createElement('div');p.id='v7137FrameShop';h.appendChild(p)}return p}
function renderFrameShop(){const p=ensureFrameShop();if(!p||!S.frames)return;const fs=Array.isArray(S.frames.frames)?S.frames.frames:[];p.innerHTML=`<div class="v7137-frame-shop-head"><div><small>PRESTIGE · PERMANENT</small><h2>🖼️ Avatar-Rahmen</h2></div><div class="v7137-frame-balance">Dein Bestand <b>💎 ${fmt(S.frames.harz)}</b></div></div><div class="v7137-frame-guide"><b>So funktioniert es:</b> Einmal gekaufte Rahmen bleiben dauerhaft auf deinem Account. Tippe anschließend auf dein eigenes Avatarbild, um zwischen deinen freigeschalteten Rahmen zu wechseln oder den Rahmen zu deaktivieren. Dein aktiver Rahmen ist auch in der <b>Hall of Haze</b> und im <b>Spielerprofil</b> sichtbar.</div><div class="v7137-frame-grid">${fs.map(f=>`<div class="v7137-frame-card ${f.owned?'owned':''}">${framePreview(f)}<div class="v7137-frame-info"><h3>${esc(f.name)} ${f.effect?'✨':''}</h3><p>${esc(frameDesc(f))}</p><div class="v7137-frame-price ${f.source==='referral'||f.source==='vip'?'v7137-frame-special':''}">${f.source==='vip'?'👑 VIP exklusiv':f.source==='referral'?'🤝 Exklusiv':`💎 ${fmt(f.price)} Harz-Taler`}</div>${f.owned?`<button type="button" class="btn ${f.active?'gold':'secondary'}" data-v7137-set-frame="${esc(f.id)}">${f.active?'Aktiv ✓':'Aktivieren'}</button>`:f.source==='shop'?`<button type="button" class="btn gold" data-v7137-buy-frame="${esc(f.id)}">Kaufen · ${fmt(f.price)} 💎</button>`:`<button type="button" class="btn secondary" disabled>Freund werben</button>`}</div></div>`).join('')}</div>`}
async function openFrameShop(){try{v032Go('harzDealer')}catch(_){}try{window.v7117DealerHubSync?.()}catch(_){}ensureDealerFrameTab();document.getElementById('harzDealer')?.classList.add('v7137-frames-open');document.querySelectorAll('#harzDealer [data-v7117-tab]').forEach(b=>b.classList.toggle('active',b.dataset.v7117Tab==='frames'));await loadFrames(true);moveFooterLast();}
function closeFrameShop(){document.getElementById('harzDealer')?.classList.remove('v7137-frames-open')}
async function buyFrame(id){if(S.busy)return;const f=S.frames?.frames?.find(x=>x.id===id);if(!f||f.owned)return;if(!confirm(`${f.name} für ${fmt(f.price)} Harz-Taler kaufen?\n\nDer Rahmen bleibt dauerhaft auf deinem Account.`))return;S.busy=true;try{const pid=(crypto.randomUUID?.()||`${Date.now()}_${Math.random()}`).replaceAll('-','');const r=await rpc('v7137_buy_avatar_frame',{p_frame_id:id,p_purchase_id:pid});if(!r?.ok){if(r?.reason==='NOT_ENOUGH_HARZ')throw new Error(`Nicht genug Harz-Taler. Benötigt: ${fmt(r.required)}`);throw new Error(String(r?.reason||'PURCHASE_FAILED'))}S.frames=r;toast('🖼️ Rahmen freigeschaltet','success',f.name);try{await window.v7077ProgressRefresh?.()}catch(_){}try{await window.v7080AchievementRefresh?.(true)}catch(_){}renderFrameShop();renderFrameSelector()}catch(e){toast('Kauf fehlgeschlagen','error',String(e?.message||e))}finally{S.busy=false}}
async function setFrame(id){if(S.busy)return;S.busy=true;try{const r=await rpc('v7137_set_avatar_frame',{p_frame_id:id||null});if(!r?.ok)throw new Error(String(r?.reason||'FRAME_SET_FAILED'));S.frames=r;applyOwnFrames();renderFrameShop();renderFrameSelector();try{if(document.getElementById('hall')?.classList.contains('active'))await window.v6145HallRefresh?.()}catch(_){}toast(id?'🖼️ Rahmen aktiviert':'Rahmen deaktiviert','success',id?(r.frames?.find(x=>x.id===id)?.name||'Aktiv'):'Kein Rahmen')}catch(e){toast('Rahmen konnte nicht geändert werden','error',String(e?.message||e))}finally{S.busy=false}}
function ensureFrameSelector(){let ov=document.getElementById('v7137FrameOverlay');if(ov)return ov;ov=document.createElement('div');ov.id='v7137FrameOverlay';ov.innerHTML='<div class="v7137-modal"><div class="v7137-modal-head"><div><small style="color:#75c85a">DEIN LOOK</small><h2>Avatar-Rahmen</h2></div><button class="v7137-close" type="button">×</button></div><div id="v7137FrameSelectBody"></div></div>';document.body.appendChild(ov);ov.querySelector('.v7137-close').onclick=()=>ov.classList.remove('show');ov.addEventListener('click',e=>{if(e.target===ov)ov.classList.remove('show')});return ov}
function renderFrameSelector(){const body=document.getElementById('v7137FrameSelectBody');if(!body||!S.frames)return;const owned=(S.frames.frames||[]).filter(f=>f.owned);body.innerHTML=`<div class="v7137-frame-guide">Hier aktivierst oder deaktivierst du deine dauerhaft freigeschalteten Rahmen. Änderungen sind sofort auch für andere Spieler sichtbar.</div><div class="v7137-frame-select-grid"><button class="v7137-frame-choice ${!S.frames.active_frame_id?'active':''}" data-v7137-set-frame=""><div class="v7137-no-frame">×</div><div><b>Kein Rahmen</b><small>Avatar ohne Prestige-Rahmen anzeigen.</small></div></button>${owned.map(f=>`<button class="v7137-frame-choice ${f.active?'active':''}" data-v7137-set-frame="${esc(f.id)}">${framePreview(f)}<div><b>${esc(f.name)} ${f.effect?'✨':''}</b><small>${f.active?'Aktiv':'Zum Aktivieren antippen'}</small></div></button>`).join('')}</div><button type="button" class="btn gold" data-v7137-open-frame-shop="1" style="width:100%;margin-top:10px">🛒 Zum Rahmen-Shop</button>`}
async function openFrameSelector(){const ov=ensureFrameSelector();ov.classList.add('show');if(!S.frames)ov.querySelector('#v7137FrameSelectBody').innerHTML='<div class="v7137-frame-guide">Rahmen werden synchronisiert …</div>';await loadFrames(true);renderFrameSelector()}

/* Hall of Haze + public player profiles */
async function publicFrameRows(ids){
 ids=[...new Set(ids.map(String).filter(Boolean))].sort();
 if(!ids.length||!logged())return new Map();
 S.profileFrameAt=S.profileFrameAt||new Map();
 S.profileFrameFlights=S.profileFrameFlights||new Map();
 const now=Date.now(),ttl=120000,out=new Map(),missing=[];
 ids.forEach(id=>{const p=S.profileCache.get(id),at=Number(S.profileFrameAt.get(id)||0);if(p&&now-at<ttl)out.set(id,p);else missing.push(id)});
 if(!missing.length)return out;
 const x=await db();if(!x)return out;
 const key=missing.join('|');
 let flight=S.profileFrameFlights.get(key);
 if(!flight){
  flight=(async()=>{
   try{
    const fields=window.__V8195_VIP_CLIENT__===true?'id,class_id,avatar_frame_id,vip_until,vip_visible':'id,class_id,avatar_frame_id';
    const {data,error}=await x.from('profiles').select(fields).in('id',missing);
    if(error)throw error;
    const m=new Map();(data||[]).forEach(p=>{const id=String(p.id);m.set(id,p);S.profileCache.set(id,p);S.profileFrameAt.set(id,Date.now())});
    return m;
   }catch(e){console.warn('[V7.184] public frame rows',e);return new Map()}
   finally{S.profileFrameFlights.delete(key)}
  })();
  S.profileFrameFlights.set(key,flight);
 }
 const fresh=await flight;fresh.forEach((p,id)=>out.set(id,p));return out;
}
function publicVipActive(p){return !!(window.__V8195_VIP_CLIENT__===true&&p?.vip_visible!==false&&p?.vip_until&&new Date(p.vip_until).getTime()>Date.now())}
function publicFrameId(p){const fid=String(p?.avatar_frame_id||'');return fid==='vip_crown'&&!publicVipActive(p)?'':fid}
function markPublicVip(host,p){
 if(!host)return;
 const on=publicVipActive(p);
 host.classList.toggle('v8195-vip-public',on);
}
async function decorateHallFrames(){
 applyOwnFrames();
 if(!document.getElementById('hall')?.classList.contains('active'))return;
 const rows=[...document.querySelectorAll('#hall .v072-player-row[data-profile-id]')];if(!rows.length)return;
 const map=await publicFrameRows(rows.map(r=>r.dataset.profileId));
 rows.forEach(r=>{const p=map.get(String(r.dataset.profileId||''));const av=r.querySelector('.v646-row-avatar');if(av)applyFrame(av,publicFrameId(p));markPublicVip(r,p)});
}
async function decorateOpenProfile(id){
 const sid=String(id||'');if(!sid)return;
 let fid='',profile=null,own=sid===String(v073User?.id||'');
 try{
  if(own){if(!S.frames)await loadFrames(false);fid=String(S.frames?.active_frame_id||'')}
  else{profile=S.profileCache.get(sid);if(!profile){const m=await publicFrameRows([sid]);profile=m.get(sid)||{};S.profileCache.set(sid,profile)}fid=publicFrameId(profile)}
 }catch(_){}
 const root=document.querySelector('#v074ProfileContent');markPublicVip(root,own?(window.v8195VipState||null):profile);
 applyFrame(root?.querySelector('.v652-profile-avatar'),fid);
 requestAnimationFrame(()=>applyFrame(root?.querySelector('.v652-profile-avatar'),fid));
}
function wrapSocial(){
 try{if(typeof window.v074OpenProfile==='function'&&!window.__V7137_PROFILE_WRAP__){const base=window.v074OpenProfile;const w=async function(id){const r=await base.apply(this,arguments);void decorateOpenProfile(id);return r};window.v074OpenProfile=w;try{v074OpenProfile=w}catch(_){}window.__V7137_PROFILE_WRAP__=true}}catch(_){}
 ['v073SearchPlayer','v073LoadFriends'].forEach(name=>{try{const base=window[name]||globalThis[name];if(typeof base!=='function'||base.__v7137)return;const w=async function(){const r=await base.apply(this,arguments);queueMicrotask(()=>void decorateHallFrames());return r};w.__v7137=true;window[name]=w;try{globalThis[name]=w}catch(_){}}catch(_){}});
}

/* Gold page copyright really stays at the bottom. */
function moveFooterLast(){try{const m=document.querySelector('main'),f=document.getElementById('v337LegalFooter');if(m&&f&&f.parentElement===m&&m.lastElementChild!==f)m.appendChild(f)}catch(_){}}
function wrapGoldShop(){try{if(typeof window.v7114OpenGoldShop==='function'&&!window.__V7137_GOLD_WRAP__){const base=window.v7114OpenGoldShop;window.v7114OpenGoldShop=function(){const r=base.apply(this,arguments);queueMicrotask(()=>{ensureDealerFrameTab();moveFooterLast()});return r};window.__V7137_GOLD_WRAP__=true}}catch(_){}}

function installAchievements(){try{if(typeof V106_ACH==='undefined'||!Array.isArray(V106_ACH))return;const add=[['shift1','Erste Schicht','Schließe deine erste Schicht ab.',()=>0,1],['shift10h','Nachtschicht','Arbeite insgesamt 10 Stunden in Schichten.',()=>0,10],['shift50h','Fleißige Legende','Arbeite insgesamt 50 Stunden in Schichten.',()=>0,50],['shift100h','Dauerbrenner','Arbeite insgesamt 100 Stunden in Schichten.',()=>0,100],['shift250h','Schichtmeister','Arbeite insgesamt 250 Stunden in Schichten.',()=>0,250],['shift_full10','Durchgezogen','Schließe eine volle 10-Stunden-Schicht ab.',()=>0,1],['shift_lucky1','Fundstück','Finde deinen ersten seltenen Schicht-Bonus.',()=>0,1],['frame1','Erster Eindruck','Besitze deinen ersten Avatar-Rahmen.',()=>0,1],['frame3','Rahmensammler','Besitze 3 verschiedene Avatar-Rahmen.',()=>0,3],['frame5','Galerist','Besitze 5 verschiedene Avatar-Rahmen.',()=>0,5],['frame7','Prestige-Sammlung','Besitze 7 verschiedene Avatar-Rahmen.',()=>0,7]];add.forEach(a=>{if(!V106_ACH.some(x=>x?.[0]===a[0]))V106_ACH.push(a)})}catch(e){console.warn('[V7.145] achievements',e)}}

/* Captured controls survive all historical render chains. */
document.addEventListener('click',e=>{
 const t=e.target instanceof Element?e.target:null;if(!t)return;
 const mode=t.closest('[data-v7137-mode]');if(mode){e.preventDefault();e.stopPropagation();setQuestMode(mode.dataset.v7137Mode);return}
 const hb=t.closest('[data-v7137-hours]');if(hb){S.hours=Math.max(1,Math.min(10,num(hb.dataset.v7137Hours)||1));renderShift();return}
 if(t.closest('[data-v7137-start]')){e.preventDefault();void startShift();return}
 if(t.closest('[data-v7137-claim]')){e.preventDefault();void claimShift();return}
 const normalTab=t.closest('[data-v7117-tab="harz"],[data-v7117-tab="gold"]');if(normalTab){closeFrameShop();queueMicrotask(()=>{ensureDealerFrameTab();moveFooterLast()})}
 const buy=t.closest('[data-v7137-buy-frame]');if(buy){e.preventDefault();void buyFrame(buy.dataset.v7137BuyFrame);return}
 const set=t.closest('[data-v7137-set-frame]');if(set){e.preventDefault();void setFrame(set.dataset.v7137SetFrame||null);return}
 if(t.closest('[data-v7137-open-frame-shop]')){document.getElementById('v7137FrameOverlay')?.classList.remove('show');void openFrameShop();return}
 if(t.closest('#character #v510HeroRoot .avatar-scene,#world .v366-avatar,#v072OwnProfile .v646-own-avatar')){e.preventDefault();e.stopPropagation();void openFrameSelector();return}
 if(t.closest('[data-screen="quests"],[data-go="quests"]'))return;
 if(t.closest('[data-screen="hall"],[data-go="hall"]'))queueMicrotask(()=>void decorateHallFrames());
 if(t.closest('[data-v7117-tab="gold"],#goldShop'))queueMicrotask(moveFooterLast);
},true);

let v7138AvatarObserver=null;
function watchOwnAvatar(){try{const scene=document.querySelector('#character #v510HeroRoot .avatar-scene')||document.querySelector('#character .avatar-scene');if(!scene||scene.__v7138Watched)return;scene.__v7138Watched=true;v7138AvatarObserver?.disconnect?.();let queued=false;v7138AvatarObserver=new MutationObserver(ms=>{const meaningful=ms.some(m=>[...m.addedNodes,...m.removedNodes].some(n=>!(n instanceof Element)||!n.classList?.contains('v7139-frame-art')));if(!meaningful||queued)return;queued=true;requestAnimationFrame(()=>{queued=false;applyOwnFrames()})});v7138AvatarObserver.observe(scene,{childList:true,subtree:false})}catch(_){}}
function renameDealer7138(){try{const name=window.__V8195_VIP_CLIENT__===true?'Harz & Gold & Rahmen & VIP Dealer':'Harz & Gold & Rahmen Dealer';document.querySelectorAll('#v032MenuPanel [data-screen="harzDealer"],#v032MenuPanel [data-v341-harz-menu="1"],.top-menu-panel [data-screen="harzDealer"]').forEach(el=>{const icon=el.querySelector('span');if(icon){[...el.childNodes].filter(n=>n.nodeType===3).forEach(n=>n.remove());el.append(' '+name)}else el.textContent='💎 '+name});document.querySelectorAll('#harzDealer .v7117-hub-copy b,#goldShop .v7117-hub-copy b').forEach(el=>el.textContent=name);const h=document.querySelector('#harzDealer .v322-dealer-head h2');if(h)h.textContent=name}catch(_){}}
function install(){ensureQuest();ensureDealerFrameTab();ensureFrameShop();wrapSocial();wrapGoldShop();installAchievements();renameQuestMenu();renameDealer7138();moveFooterLast();watchOwnAvatar();document.body?.classList.remove('v7129-referral-frame');if(logged()&&!window.v7204StartupQuiet?.()){void loadShift(false);void loadFrames(false)}queueMicrotask(()=>{applyOwnFrames();if(!window.v7204StartupQuiet?.())void decorateHallFrames()})}
window.addEventListener('growlegends:account-ready',()=>{install();const run=()=>{if(logged()){void loadShift(false);void loadFrames(false)}};if(typeof window.v7204AfterStartupQuiet==='function')window.v7204AfterStartupQuiet(run,1400);else queueMicrotask(run)},{passive:true});
window.addEventListener('growlegends:vip-state',()=>{void loadFrames(true);void decorateHallFrames();renameDealer7138()},{passive:true});
window.addEventListener('pageshow',install,{passive:true});
window.addEventListener('growlegends:navigation-ready',()=>{ensureQuest();ensureDealerFrameTab();renameQuestMenu();renameDealer7138();watchOwnAvatar();applyOwnFrames();moveFooterLast()},{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&logged()&&!window.v7204StartupQuiet?.()){void loadShift(false);void loadFrames(false)}syncShiftTicker()},{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='quests'){ensureQuest();if(S.mode==='shift')void loadShift(false)}syncShiftTicker()},{passive:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();

window.v7137OpenFrameShop=openFrameShop;
window.v7137OpenFrameSelector=openFrameSelector;
window.v7137ShiftRefresh=()=>loadShift(true);
window.v7137FrameRefresh=()=>loadFrames(true);
window.v7137Diagnostics=()=>({version:VERSION,shift:S.shift?{active:!!S.shift.active,ready:!!S.shift.ready,totalHours:num(S.shift.total_hours)}:null,frames:S.frames?{active:S.frames.active_frame_id||null,count:num(S.frames.frame_count)}:null,questMode:S.mode,claimBusy:!!S.busy,lastClaimedShift:S.lastClaimedShift||'',serverAuthoritative:true,claimCacheBypass:true,duplicateReplaySuppressed:true,pushType:'shift_ready'});
})();
