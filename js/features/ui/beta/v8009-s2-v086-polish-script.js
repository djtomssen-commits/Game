/* ===== V4.02 greeting, title, artifact cleanup, complete menu ===== */

/* Explicit time-of-day greeting. */
v085Greeting=function(){
  const h=new Date().getHours();
  if(h>=5 && h<11)return 'Guten Morgen';
  if(h>=11 && h<17)return 'Guten Tag';
  if(h>=17 && h<22)return 'Guten Abend';
  return 'Willkommen zurück';
};

function v086PolishBrand(){
  const brand=document.querySelector('.brand h1');
  if(!brand)return;
  brand.className='v086-logo';
  brand.innerHTML=`
    <span class="v086-logo-grow"><span class="v086-logo-leaf">🌿</span>Grow</span>
    <span class="v086-logo-legends">Legends</span>`;
}

/* Removes visible standalone "\n" artifacts that may remain from older appended patches. */
function v086RemoveSlashNArtifacts(){
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const remove=[];
  while(walker.nextNode()){
    const n=walker.currentNode;
    if(/^\s*\\n\s*$/.test(n.nodeValue||''))remove.push(n);
  }
  remove.forEach(n=>n.remove());
}

/* V7.220 Tütchen-Dealer: server-owned progression, upgraded premium layout + native Rewarded-Ad bridge. */
window.__V7215_AD_BAG_MENU_VISIBLE__=true;
const v7215Bag={state:null,busy:false,loading:null,pollTimer:0,lastRevision:-1};
function v7215Db(){try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}}
function v7215Uid(){try{return String(((typeof v073User!=='undefined'&&v073User)||window.v073User||{})?.id||'')}catch(_){return ''}}
function v7215AdsPlugin(){try{return window.Capacitor?.Plugins?.GrowLegendsAds||null}catch(_){return null}}
function v7215Fmt(n){return Math.max(0,Number(n)||0).toLocaleString('de-DE')}
function v7215RewardText(r){r=r||{};const a=[];if(Number(r.gold)>0)a.push(`${v7215Fmt(r.gold)} Gold`);if(Number(r.fragments)>0)a.push(`${v7215Fmt(r.fragments)} Fragmente`);if(Number(r.harz)>0)a.push(`${v7215Fmt(r.harz)} Harz-Taler`);if(Number(r.time)>0)a.push(`${v7215Fmt(r.time)} Zeit-Samen`);return a.join(' · ')||'Belohnung'}
function v7219RarityClass(r){return `v7219-r-${['gray','green','blue','purple','orange'].includes(String(r))?String(r):'gray'}`}
const V7215_BAG_ART=Object.freeze({
 current:"assets/v8-inline/d8723279ac61b4e0.webp",
 premium:"assets/v8-inline/8fe8c1cde9fe6262.webp"
});
function v7215BagArt(b,isNext){
 b=b||{};
 const t=Number(b.target)||0;
 const title=String(b.title||'').toLowerCase();
 const sub=String(b.subtitle||'').toLowerCase();
 const rarity=String(b.rarity||'').toLowerCase();
 if(isNext)return V7215_BAG_ART.premium;
 if(title.includes('legend')||title.includes('edel')||title.includes('premium')||sub.includes('premium')||rarity==='orange'||rarity==='purple'||t>=10)return V7215_BAG_ART.premium;
 return V7215_BAG_ART.current;
}
window.v7221BagArt=v7215BagArt;
function v7219PackHtml(b,extra=''){
 b=b||{};
 const isNext=String(extra||'').includes('next');
 const art=v7215BagArt(b,isNext);
 const caption=String(b.title||(isNext?'Nächstes Tütchen':'Tütchen'));
 const target=Math.max(0,Number(b.target)||0);
 const meta=isNext&&target?`${target} bestätigte Videos`:(b.subtitle?String(b.subtitle):'');
 return `<div class="v7219-pack ${v7219RarityClass(b.rarity)} ${extra}" style="--bag-art:url('${art}')">
   <div class="v7221-pack-art" aria-hidden="true"></div>
   <div class="v7221-pack-footer">
    <div class="v7221-pack-title">${caption}</div>
    ${meta?`<div class="v7221-pack-meta">${meta}</div>`:''}
   </div>
 </div>`;
}
function v7215Paint(){
 const root=document.getElementById('v7215BagBody');if(!root)return;
 const st=v7215Bag.state;
 if(!st?.ok){
   root.innerHTML=`<div class="v7219-error-card"><div class="v7219-loading-bag">📦</div><b>Tütchen konnten nicht geladen werden.</b><span>Tippe auf „Neu laden“. Bleibt die Anzeige hängen, wird meist die Anmeldung oder die Serverantwort neu angestoßen.</span><button type="button" class="btn secondary" id="v7219RetryBtn">↻ Neu laden</button></div>`;
   document.getElementById('v7219RetryBtn')?.addEventListener('click',()=>void v7215Load(true));
   return;
 }
 const b=st.bag||{},next=st.nextBag||{};
 const target=Math.max(1,Number(b.target)||1);
 const progress=Math.max(0,Math.min(target,Number(st.progress)||0));
 const pct=Math.round(progress/target*100);
 const left=Math.max(0,target-progress);
 const native=!!v7215AdsPlugin();
 const test=st.mode==='test';
 const available=!!st.enabled||!!st.adminTestAllowed;
 let button='▶ Werbevideo ansehen';
 let disabled=v7215Bag.busy||!available||!native;
 let status='';
 if(v7215Bag.busy){
   button='⏳ Video / Bestätigung läuft …';
   status='Nach dem vollständigen Video wird dein Fortschritt serverseitig bestätigt.';
 }else if(!available){
   button='🔒 Noch nicht freigeschaltet';
   status='Der Tütchen-Dealer ist für normale Spieler noch nicht freigeschaltet.';
 }else if(!native){
   button='📱 Neuer App-Build erforderlich';
   status='Rewarded-Videos funktionieren nur in der Android-App mit dem Ads-Bridge-Build.';
 }else{
   status=`Noch ${left} ${left===1?'Video':'Videos'}, dann öffnet sich dieses Tütchen.`;
 }
 const today=Math.max(0,Number(st.todayAds)||0);
 const total=Math.max(0,Number(st.totalAds)||0);
 const claims=Math.max(0,Number(st.totalClaims)||0);
 const ringPct=Math.min(100,today*10);
 root.innerHTML=`
  <div class="v7219-main-grid">
   <div class="v7219-board">
    <div class="v7219-board-title">🌿 AKTUELLES TÜTCHEN</div>
    <div class="v7219-current-content">
     ${v7219PackHtml(b)}
     <div class="v7219-fill">
      <h3>Tütchen füllen</h3>
      <div class="v7219-fill-sub">${String(b.subtitle||'Kleine Lieferung')} · Runde ${Number(st.cycle)||1}</div>
      <div class="v7219-progress-line"><b>${progress} / ${target}</b><span>BESTÄTIGTE VIDEOS</span></div>
      <div class="v7219-progress"><i style="width:${pct}%"></i></div>
      <button type="button" class="btn v7219-watch" id="v7215WatchBtn" ${disabled?'disabled':''}>${button}</button>
      <div class="v7219-status" id="v7215Status">${status}</div>
      <div class="v7219-mini">Stufe ${(Number(st.stage)||0)+1} von 5 · ${String(b.title||'Aktuelles Tütchen')} · serverseitig gespeichert.</div>
     </div>
    </div>
   </div>
   <div class="v7219-board v7219-next">
    <div class="v7219-board-title">NÄCHSTES TÜTCHEN</div>
    <div class="v7219-next-inner">
      ${v7219PackHtml(next,'v7219-next-pack')}
      <div class="v7219-next-name">${String(next.title||'Nächste Lieferung')}</div>
      <div class="v7219-next-copy">${Number(next.target)||0} bestätigte Videos · danach wartet das nächste bessere Tütchen.</div>
    </div>
   </div>
  </div>

  <div class="v7219-board v7219-reward-board">
   <div class="v7219-board-title">🎁 STEIGENDE BELOHNUNG</div>
   <div class="v7219-reward-rise">
    <div class="v7219-reward-rise-icon">⬆️</div>
    <div><b>Je weiter du kommst, desto wertvoller wird die Belohnung.</b><span>Der genaue Inhalt und die Mengen werden erst beim Öffnen des Tütchens angezeigt.</span></div>
   </div>
  </div>

  <div class="v7219-lower-grid">
   <div class="v7219-how">
    <h3>📖 So funktioniert’s</h3>
    <div class="v7219-how-list">
      <div class="v7219-how-row"><div class="v7219-how-icon">▶</div><div>Nur vollständig bestätigte Rewarded-Videos zählen.</div></div>
      <div class="v7219-how-row"><div class="v7219-how-icon">☁️</div><div>Dein Fortschritt wird serverseitig gespeichert und bleibt auf anderen Geräten erhalten.</div></div>
      <div class="v7219-how-row"><div class="v7219-how-icon">🎁</div><div>Beim Öffnen wird deine tatsächliche Belohnung angezeigt. Möglich sind Gold, Fragmente, Harz-Taler und Zeit-Samen – die Mengen bleiben vorher verborgen.</div></div>
    </div>
   </div>
   <div class="v7219-today">
    <h3>📅 Heute geschafft</h3>
    <div class="v7219-today-body">
      <div class="v7219-ring" style="--p:${ringPct}"><div><strong>${today}</strong><small>Videos heute</small></div></div>
      <div class="v7219-today-copy">Insgesamt <b>${total}</b> Videos bestätigt.<br><b>${claims}</b> Tütchen geöffnet.</div>
    </div>
   </div>
  </div>
  ${test?'<div class="v7219-test">🧪 TESTBETRIEB · Google-Testanzeigen · keine echten Werbeeinnahmen</div>':''}
 `;
 document.getElementById('v7215WatchBtn')?.addEventListener('click',()=>void v7215Watch());
}
async function v7215Load(force=false){
 if(v7215Bag.loading)return v7215Bag.loading;
 const db=v7215Db(),uid=v7215Uid();
 if(!db||!uid){
   const root=document.getElementById('v7215BagBody');
   if(root&&document.getElementById('bagDealer')?.classList.contains('active')){
     root.innerHTML='<div class="v7219-loading-card"><div class="v7219-loading-bag">📦</div><b>Spielerkonto wird verbunden …</b><span>Der Dealer prüft kurz deine Anmeldung und lädt danach dein aktuelles Tütchen.</span></div>';
   }
   setTimeout(()=>{if(document.getElementById('bagDealer')?.classList.contains('active'))void v7215Load(true)},650);
   return null;
 }
 if(!force&&v7215Bag.state?.ok)return v7215Bag.state;
 v7215Bag.loading=(async()=>{try{const {data,error}=await db.rpc('v7215_ad_bag_state');if(error)throw error;const st=Array.isArray(data)?data[0]:data;v7215Bag.state=st||null;v7215Bag.lastRevision=Number(st?.revision??v7215Bag.lastRevision);const visible=true;if(window.__V7215_AD_BAG_MENU_VISIBLE__!==visible){window.__V7215_AD_BAG_MENU_VISIBLE__=visible;try{v086BuildCompleteMenu()}catch(_){}}v7215Paint();return st}catch(e){console.warn('V7.219 bag state',e);v7215Bag.state=null;v7215Paint();return null}finally{v7215Bag.loading=null}})();return v7215Bag.loading;
}
async function v7215PollAfterReward(oldRevision){
 const started=Date.now();
 while(Date.now()-started<12000){await new Promise(r=>setTimeout(r,750));const st=await v7215Load(true);if(Number(st?.revision)>Number(oldRevision)){return st}}
 return v7215Bag.state;
}
async function v7215Watch(){
 if(v7215Bag.busy)return false;
 const st=await v7215Load(false),plugin=v7215AdsPlugin(),uid=v7215Uid();if(!st?.ok||!plugin||!uid)return false;
 v7215Bag.busy=true;v7215Paint();const oldRev=Number(st.revision)||0;
 try{
   let ad;
   try{ad=await plugin.showRewarded({userId:uid,customData:(String(window.v343CurrentServer||((String(window.GROW_RELEASE_CHANNEL||'stable')==='beta')?'beta':(Date.now()>=Date.parse('2026-10-02T16:00:00+02:00')?'server1':'beta')))==='server1'?'growlegends_adbag_v1:server1':'growlegends_adbag_v1')})}catch(e){throw new Error(String(e?.message||e||'Werbevideo konnte nicht geladen werden.'))}
   if(String(ad?.status||'')!=='rewarded'){
     const msg=String(ad?.status||'')==='closed'?'Video wurde vor der Belohnung geschlossen.':'Keine bestätigte Video-Belohnung erhalten.';
     try{v063Toast?.('Tütchen-Dealer','info',msg)}catch(_){ }
     return false;
   }
   let result=null;
   if(st.mode==='test'&&st.adminTestAllowed){
     const db=v7215Db();const {data,error}=await db.rpc('v7215_ad_bag_admin_test_watch');if(error)throw error;result=Array.isArray(data)?data[0]:data;v7215Bag.state=result;
   }else{
     result=await v7215PollAfterReward(oldRev);
   }
   if(result?.completed&&result?.rewardGranted&&Object.keys(result.rewardGranted).length){
     const msg=`${v7215RewardText(result.rewardGranted)}\n\nDas nächste Tütchen liegt bereit.`;
     try{if(typeof v115Alert==='function')await v115Alert(msg,'📦 Tütchen geöffnet','success');else v063Toast?.('📦 Tütchen geöffnet','success',v7215RewardText(result.rewardGranted))}catch(_){ }
   }else if(Number(result?.revision)<=oldRev&&st.mode!=='test'){
     try{v063Toast?.('Bestätigung läuft','info','AdMob bestätigt das Video serverseitig. Der Fortschritt erscheint automatisch, sobald die Bestätigung eintrifft.')}catch(_){ }
   }
   await v7215Load(true);return true;
 }catch(e){console.warn('V7.219 rewarded ad',e);try{v063Toast?.('Werbevideo nicht gezählt','warn',String(e?.message||e))}catch(_){ }return false}
 finally{v7215Bag.busy=false;v7215Paint()}
}
window.v7215BagDealerOpen=()=>{
 const root=document.getElementById('v7215BagBody');
 if(root)root.innerHTML='<div class="v7219-loading-card"><div class="v7219-loading-bag">🌿</div><b>Dealer holt dein Tütchen aus dem Regal …</b><span>Belohnung, Fortschritt und das nächste Tütchen werden geladen.</span></div>';
 return v7215Load(true);
};
window.v7215BagDealerRefresh=()=>v7215Load(true);
document.getElementById('v7219HelpBtn')?.addEventListener('click',async()=>{
 const msg='Du entscheidest selbst, ob du ein Rewarded-Video ansehen möchtest. Nur vollständig bestätigte Videos erhöhen den Tütchen-Fortschritt. Mit jeder Stufe steigt der Wert der Belohnung. Möglich sind Gold, Fragmente, Harz-Taler und Zeit-Samen; Inhalt und Mengen werden erst beim Öffnen angezeigt und serverseitig gutgeschrieben.';
 try{
   if(typeof v115Alert==='function')await v115Alert(msg,'📦 Tütchen-Dealer','info');
   else if(typeof v063Toast==='function')v063Toast('📦 Tütchen-Dealer','info',msg);
 }catch(_){}
});

window.addEventListener('growlegends:first-playable',()=>queueMicrotask(()=>void v7215Load(true)),{passive:true});
window.addEventListener('growlegends:account-ready',()=>{v7215Bag.state=null;v7215Bag.lastRevision=-1;window.__V7215_AD_BAG_MENU_VISIBLE__=true;queueMicrotask(()=>void v7215Load(true))},{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&document.getElementById('bagDealer')?.classList.contains('active'))queueMicrotask(()=>void v7215Load(true))},{passive:true});

/* Rebuild menu from every actual game screen, so no page can silently go missing. */
function v086BuildCompleteMenu(){
  let wrap=document.querySelector('#v032TopMenu');
  if(!wrap){
    try{v032InstallMenu()}catch(e){}
    wrap=document.querySelector('#v032TopMenu');
  }
  const panel=wrap?.querySelector('.top-menu-panel');
  if(!panel)return;

  const pages=[
    ['world','⌂','Startseite'],
    ['character','🧙','Charakter'],
    ['grow','🌱','Growroom'],
    ['quests','📜','Quest & Schicht'],
    ['dungeon','⚔️','Dungeons'],
    ['shop','🛒','Händler'],
    ...(window.__V7215_AD_BAG_MENU_VISIBLE__?[['bagDealer','📦','Tütchen-Dealer']]:[]),
    ['hall','🏆','Hall of Haze'],
    ['friends','🤝','Nebel-Crew']
  ].filter(([id])=>document.querySelector('#'+id));

  panel.innerHTML=pages.map(([id,icon,label],i)=>`
    ${i===6?'<div class="v086-menu-separator"></div>':''}
    <button class="top-menu-item ${document.querySelector('#'+id)?.classList.contains('active')?'active':''}" data-screen="${id}">
      <span>${icon}</span>${label}
    </button>`).join('');

  panel.querySelectorAll('.top-menu-item').forEach(btn=>{
    btn.onclick=()=>v032Go(btn.dataset.screen);
  });
}

/* V6.101: fast navigation. Do not run the giant global render() chain. */
const v086OldGo=v032Go;

function v6101CommonHud(){
  const put=(sel,val)=>{try{const el=document.querySelector(sel);if(el)el.textContent=String(val??'')}catch(e){}};
  try{regenEnergy?.()}catch(e){}
  try{
    put('#level',s?.level);put('#charLevel',s?.level);put('#battleLevel',s?.level);
    put('#xp',`${Number(s?.xp)||0}/${typeof xpNeed==='function'?xpNeed():0}`);
    put('#gold',Number(s?.gold)||0);put('#shopGold',Number(s?.gold)||0);
    put('#shopHarz',Number(s?.harzTaler)||0);put('#points',Number(s?.points)||0);
    const cap=typeof v271DampfCap==='function'?v271DampfCap():100;
    put('#energy',`${Number(s?.energy)||0}/${cap}`);
    const cp=typeof combatPower==='function'?combatPower():0;
    put('#power',cp);put('#charPower',cp);
    put('#charHp',typeof maxHp==='function'?maxHp():0);
    if(typeof dungeonWaitText==='function')put('#dungeonTicketText',dungeonWaitText());
  }catch(e){}
}

let v7207CharacterRenderEpoch=0;
function v7207CharacterActive(epoch){
  return epoch===v7207CharacterRenderEpoch&&document.getElementById('character')?.classList.contains('active');
}
function v7207TimedCharacterStage(profile,name,fn){
  const t=performance.now?.()||Date.now();
  try{fn?.()}catch(e){console.warn('V7.207 character stage',name,e)}
  profile[name]=Math.round((performance.now?.()||Date.now())-t);
}
function v7207RenderCharacterProgressive(){
  const epoch=++v7207CharacterRenderEpoch,started=performance.now?.()||Date.now(),profile={};
  /* Above-the-fold identity is the only character work allowed in the first
     navigation frame. The large talent/inventory trees are presentation-only
     and are split across later frames so tapping Held never blocks the UI. */
  v7207TimedCharacterStage(profile,'avatar',()=>renderClassAvatar?.());
  requestAnimationFrame(()=>{
    if(!v7207CharacterActive(epoch))return;
    v7207TimedCharacterStage(profile,'set',()=>renderSetPanel?.());
    v7207TimedCharacterStage(profile,'classes',()=>renderClasses?.());
    requestAnimationFrame(()=>{
      if(!v7207CharacterActive(epoch))return;
      v7207TimedCharacterStage(profile,'skills',()=>renderSkillTree?.());
      const inventory=()=>{
        if(!v7207CharacterActive(epoch))return;
        v7207TimedCharacterStage(profile,'inventory',()=>renderInventory?.());
        profile.total=Math.round((performance.now?.()||Date.now())-started);
        try{window.__GL_RUNTIME_WATCHDOG__?.report?.('character_render_profile','info',profile,{screen:'character',incidentKey:'progressive-v7207'})}catch(_){}
      };
      if(typeof requestIdleCallback==='function')requestIdleCallback(inventory,{timeout:240});
      else setTimeout(inventory,32);
    });
  });
}
window.v7207RenderCharacterProgressive=v7207RenderCharacterProgressive;

function v6101RenderOpenedScreen(id){
  v6101CommonHud();
  try{
    switch(String(id||'')){
      case 'world':
        if(typeof v085InstallWorld==='function')v085InstallWorld(false);
        break;
      case 'character':
        v7207RenderCharacterProgressive();
        break;
      case 'grow':
        try{renderGrow?.()}catch(e){}
        break;
      case 'quests':
        try{ensureQuests?.()}catch(e){}
        try{renderQuests?.()}catch(e){}
        break;
      case 'dungeon':
        try{renderDungeon?.()}catch(e){}
        break;
      case 'shop':
        try{renderShop?.()}catch(e){}
        break;
      case 'bagDealer':
        try{window.v7215BagDealerOpen?.()}catch(e){console.warn('V7.219 bag dealer open',e)}
        break;
    }
  }catch(e){console.warn('V6.101 screen render',id,e)}
}
window.v6101RenderOpenedScreen=v6101RenderOpenedScreen;

v032Go=function(id){
  const target=document.querySelector('#'+id);
  if(!target)return;
  document.querySelectorAll('.screen.active').forEach(x=>x.classList.remove('active'));
  target.classList.add('active');
  document.querySelectorAll('.top-menu-item').forEach(x=>x.classList.toggle('active',x.dataset.screen===id));
  document.querySelector('#v032MenuPanel')?.classList.remove('open');
  try{window.scrollTo(0,0)}catch(e){}
  requestAnimationFrame(()=>v6101RenderOpenedScreen(id));
};

/* V6.320: global render wrapper retired. Brand/menu are static shell work, not frame/render work. */
try{
  v086PolishBrand();
  v086RemoveSlashNArtifacts();
  v086BuildCompleteMenu();
}catch(e){console.error('V6.320 shell polish',e)}
document.addEventListener('DOMContentLoaded',()=>{try{v086PolishBrand();v086BuildCompleteMenu()}catch(e){}},{once:true});
window.addEventListener('pageshow',()=>{try{v086PolishBrand();v086BuildCompleteMenu()}catch(e){}},{passive:true});
