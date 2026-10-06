/* ===== Grow Legends V4.29 Stable =====
   One auth listener. One email handler. One Google handler.
   One cloud resolver. One character creator. One admin poll.
*/

window.__V200_AUTH_READY__=false;

const V200_IDLE_MS=10*60*1000;
const V200_ACCOUNT_SAVE_PREFIX='growLegendsAccountSave:';

let v200AuthBusy=false;
let v200EmailOwnsFinalize=false;
let v200EmailFinalizeUid='';
let v200EmailFinalizeUntil=0;
let v200CloudPromise=null;
let v200CloudPromiseUser=null;
let v200LastCloudStamp=null;
let v200AdminBusy=false;
let v200Deleting=false;
let v200LastActivity=Date.now();
let v200AuthListenerInstalled=false;
let v200Booted=false;

function v200DurableUser(){
  return !!(v073User && !v073User.is_anonymous);
}
window.v200DurableUser=v200DurableUser;

function v200CharacterComplete(){
  return !!(s.playerClass && s.characterNameSet && v071NameValid(s.characterName));
}

function v200ScopedKey(uid){
  return V200_ACCOUNT_SAVE_PREFIX+String(uid||'');
}

/* V8.102: shop stock is server-authoritative and must never travel inside
   whole-account snapshots. Old saves may still contain these fields; strip
   them on every read/write boundary so they cannot overwrite the live shop. */
function v8102StripServerOwnedShopState(obj){
  if(!obj||typeof obj!=='object')return obj;
  try{delete obj.weaponShop;delete obj.magicShop}catch(_){}
  return obj;
}
try{window.v8102StripServerOwnedShopState=v8102StripServerOwnedShopState}catch(_){}

function v200FreshState(uid){
  const fresh=structuredClone(defaultState);
  fresh.playerClass=null;
  fresh.classLocked=false;
  fresh.characterName='';
  fresh.characterNameSet=false;
  fresh.social??={};
  fresh.social.playerId=uid;
  fresh.__accountOwnerId=uid;

  Object.keys(s).forEach(k=>delete s[k]);
  Object.assign(s,JSON.parse(JSON.stringify(fresh)));
  localStorage.setItem(KEY,JSON.stringify(s));
  return s;
}

function v200SaveScopedLocal(){
  if(!v200DurableUser())return;
  try{
    const copy=v8102StripServerOwnedShopState(JSON.parse(JSON.stringify(s)));
    copy.__accountOwnerId=v073User.id;
    localStorage.setItem(v200ScopedKey(v073User.id),JSON.stringify(copy));
  }catch(e){}
}
window.v200SaveScopedLocal=v200SaveScopedLocal;

function v200LoadScopedLocal(uid){
  try{
    const raw=localStorage.getItem(v200ScopedKey(uid));
    if(!raw)return null;
    const data=JSON.parse(raw);
    if(data?.__accountOwnerId && data.__accountOwnerId!==uid)return null;
    return data;
  }catch(e){
    return null;
  }
}

function v200ClearCharacterModals(){
  document.querySelector('#v200CharacterModal')?.remove();
  document.querySelector('#v158ClassModal')?.remove();
  document.querySelector('#v029ClassModal')?.remove();

  const legacy=document.querySelector('#v063Overlay');
  const title=document.querySelector('#v063Title');
  if(legacy?.classList.contains('show') && /Charakter benennen/i.test(title?.textContent||'')){
    legacy.classList.remove('show');
  }

  sessionStorage.removeItem('v071NamePromptOpen');
}

function v200OpenHome(){
  try{
    document.querySelectorAll('.page').forEach(el=>el.classList.remove('active'));
    const world=document.querySelector('#world');
    if(world){
      world.classList.add('active');
      if(typeof v085InstallWorld==='function')v085InstallWorld();
    }
  }catch(e){}

  try{
    if(typeof showPage==='function')showPage('world');
  }catch(e){}

  try{render()}catch(e){}
}

function v200AuthStatus(text,type=''){
  const btn=document.querySelector('#v075EmailAction');
  if(!btn)return;

  let box=document.querySelector('#v200AuthStatus');
  if(!box){
    box=document.createElement('div');
    box.id='v200AuthStatus';
    btn.insertAdjacentElement('afterend',box);
  }

  box.textContent=text||'';
  box.className='';
  box.id='v200AuthStatus';

  if(text){
    box.classList.add('show');
    if(type)box.classList.add(type);
  }
}

function v075SetAuthMode(mode){
  v075AuthMode=mode==='register'?'register':'login';

  const login=document.querySelector('#v075LoginTab');
  const reg=document.querySelector('#v075RegisterTab');
  const action=document.querySelector('#v075EmailAction');
  const google=document.querySelector('#v075GoogleAction');
  const note=document.querySelector('#v075AccountNote');
  const pass=document.querySelector('#v075Password');

  login?.classList.toggle('active',v075AuthMode==='login');
  reg?.classList.toggle('active',v075AuthMode==='register');

  const T=(key,fallback)=>window.GrowI18n?.t?.(key)||fallback;
  if(action)action.textContent=v075AuthMode==='login'?T('login.signIn','Anmelden'):T('login.register','Registrieren');
  if(google)google.textContent=v075AuthMode==='login'?T('login.google','Mit Google anmelden'):T('login.googleRegister','Mit Google registrieren');

  if(note){
    note.textContent=v075AuthMode==='login'
      ?T('login.accountNote','Melde dich an und lade deinen persönlichen Cloud-Spielstand.')
      :T('login.registerNote','Erstelle deinen Account. Charaktername und Klasse wählst du danach genau einmal.');
  }

  if(pass)pass.autocomplete=v075AuthMode==='login'?'current-password':'new-password';
  v200AuthStatus('');
}

function v200BuildLogin(){
  const overlay=document.querySelector('#v075AuthOverlay');
  const card=overlay?.querySelector('.v075-auth-card');
  if(!overlay||!card)return;

  /* remove old generated wrappers if a cached page brought them along */
  overlay.querySelectorAll(
    '.v148-auth-layout,.v149-auth-stack,.v152-login-stack,.v153-login-stack,'+
    '.v154-login-stack,.v155-login-stack,.v156-login-stack,.v149-class-bg,'+
    '.v152-class-stage,.v153-class-stage,.v154-class-stage'
  ).forEach(el=>{
    if(el.contains(card))overlay.appendChild(card);
    el.remove();
  });

  let stack=overlay.querySelector(':scope > .v200-login-stack');
  if(!stack){
    stack=document.createElement('div');
    stack.className='v200-login-stack';
    overlay.appendChild(stack);
  }
  if(card.parentElement!==stack)stack.prepend(card);

  if(!card.querySelector('.v200-auth-brand')){
    const brand=document.createElement('div');
    brand.className='v200-auth-brand';
    brand.innerHTML=`
      <div class="v200-auth-logo">🌿</div>
      <div class="v200-auth-name">Grow Legends</div>
      <div class="v200-auth-tag">Grow · Gear · Dungeons · Legends</div>`;
    card.prepend(brand);
  }

  let update=stack.querySelector(':scope > .v200-login-info.update');
  if(!update){
    update=document.createElement('section');
    update.className='v200-login-info update';
    stack.appendChild(update);
  }

  let event=stack.querySelector(':scope > .v200-login-info.event');
  if(!event){
    event=document.createElement('section');
    event.className='v200-login-info event';
    stack.appendChild(event);
  }

  v200RenderLoginInfo();
  v075SetAuthMode(v075AuthMode);
}

function v4143SetAuthBoot(active=true,text='Account wird geprüft …'){
  const overlay=document.querySelector('#v075AuthOverlay');
  window.__V4143_AUTH_BOOTING__=!!active;
  if(!overlay)return;

  const label=String(text||'Account wird geprüft …');
  if(active){
    let progress=14;
    if(/Sitzung wird wiederhergestellt/i.test(label))progress=18;
    else if(/Google-Sitzung/i.test(label))progress=36;
    else if(/Account wird geprüft/i.test(label))progress=53;
    else if(/Spielstand wird geladen/i.test(label))progress=78;
    else if(/Synchron|fertig|bereit/i.test(label))progress=92;
    try{window.v660SetBootProgress?.(progress)}catch(_){}
  }else{
    try{window.v660SetBootProgress?.(100)}catch(_){}
    /* V7.284: v4143-restoring itself has display:flex!important.
       Leaving that class behind kept the splash visible forever even after
       the game had already reached first-playable. */
    overlay.classList.remove('v4143-restoring');
  }

  overlay.classList.toggle('v4143-restoring',!!active);
  if(active){
    const t=document.querySelector('#v4143BootText');if(t)t.textContent=label;
    overlay.classList.add('show');
    requestAnimationFrame(()=>{try{window.v660LayoutBootProgress?.()}catch(_){}});
  }
}
window.v4143SetAuthBoot=v4143SetAuthBoot;
setTimeout(()=>{try{window.v4143RefreshBootArt?.()}catch(e){}},0);

function v075Overlay(show=true){
  const overlay=document.querySelector('#v075AuthOverlay');
  if(!overlay)return;
  if(!show){
    v4143SetAuthBoot(false);
    /* V7.284: remove BOTH visibility owners. */
    overlay.classList.remove('show','v4143-restoring');
    return;
  }
  if(window.__V4143_AUTH_BOOTING__===true){
    overlay.classList.add('show','v4143-restoring');
    return;
  }
  overlay.classList.remove('v4143-restoring');
  v200BuildLogin();
  overlay.classList.add('show');
}

async function v200RefreshLoginInfo(){
  if(!v073Db)return;

  try{
    const {data,error}=await v073Db
      .from('game_news')
      .select('*')
      .eq('is_published',true)
      .order('created_at',{ascending:false})
      .limit(5);
    if(!error)window.v093News=data||[];
  }catch(e){}

  try{
    const {data,error}=await v073Db
      .from('game_events')
      .select('*')
      .eq('is_active',true)
      .order('created_at',{ascending:false});
    if(!error)window.v093Events=data||[];
  }catch(e){}

  v200RenderLoginInfo();
}

function v200RenderLoginInfo(){
  const update=document.querySelector('#v075AuthOverlay .v200-login-info.update');
  const event=document.querySelector('#v075AuthOverlay .v200-login-info.event');

  if(update){
    let n=null;
    try{ n=(window.v093News||[]).find(x=>x && x.is_published!==false)||null; }catch(e){}

    const title=n?.title||'V4.29 Stable';
    const version=n?.version||'V4.02';
    const text=n?.body||n?.text||'Technische Stabilisierung von Login, Cloud-Speicherung und Charaktererstellung.';

    update.innerHTML=`
      <div class="v200-info-head">
        <b>📰 Update-News</b>
        <span class="v200-badge">AKTUELL</span>
      </div>
      <div class="v200-info-intro">
        Hier findest du neue Inhalte, Änderungen und wichtige Informationen zu Grow Legends.
      </div>
      <div class="v200-current-update">
        <b>${v073Escape(title)} · ${v073Escape(version)}</b>
        <span>${v073Escape(text)}</span>
      </div>`;
  }

  if(event){
    let events=[];
    try{events=(window.v093Events||[]).filter(x=>x && x.is_active===true);}catch(e){}

    event.innerHTML=events.length
      ? `
        <div class="v200-info-head"><b>🎪 Aktive Events</b><span class="v200-badge">LIVE</span></div>
        ${events.map(ev=>`
          <div class="v200-event-row">
            <b>⚡ ${v073Escape(ev.name||'Aktives Event')}</b>
            <span>${v073Escape(ev.description||'Zeitlich begrenztes Event läuft.')}</span>
          </div>`).join('')}
      `
      : `
        <div class="v200-info-head"><b>🎪 Aktuell kein Event</b><span class="v200-badge">OFF</span></div>
        <div class="v200-info-intro">Sobald ein Event aktiv ist, erscheint es hier automatisch.</div>
      `;
  }
}

/* ===== V4.02 Save Integrity =====
   Goal:
   - Never overwrite a newer account-scoped local checkpoint with an older cloud save.
   - Every gameplay mutation can create an immediate local checkpoint.
   - Cloud writes are serialized and carry revision/timestamp metadata.
*/
let v213SaveRevision=Math.max(0,Number(s.__saveRevision)||0);
let v213Dirty=false;
let v213LastComparable='';
let v213SaveChain=Promise.resolve();
let v213MonitorReady=false;
let v213MonitorTimer=0;

function v213Comparable(obj){
  try{
    const copy=JSON.parse(JSON.stringify(obj||{}));
    delete copy.__savedAt;
    delete copy.__saveRevision;
    return JSON.stringify(copy);
  }catch(e){
    return '';
  }
}

function v213MetaTime(obj){
  const t=Number(obj?.__savedAt)||0;
  return Number.isFinite(t)?t:0;
}

function v213MetaRevision(obj){
  const r=Number(obj?.__saveRevision)||0;
  return Number.isFinite(r)?r:0;
}

function v213BelongsTo(obj,uid){
  if(!obj || typeof obj!=='object')return false;
  return !obj.__accountOwnerId || obj.__accountOwnerId===uid;
}

function v213StampState(){
  if(!v200DurableUser())return;
  v213SaveRevision=Math.max(v213SaveRevision,v213MetaRevision(s))+1;
  s.__saveRevision=v213SaveRevision;
  s.__savedAt=Date.now();
  s.__accountOwnerId=v073User.id;
  s.social??={};
  s.social.playerId=v073User.id;
}

function v213LocalCheckpoint(reason='change'){
  if(!v200DurableUser())return false;
  if(v075ApplyingCloud || v200Deleting)return false;

  v213StampState();
  v213Dirty=true;

  try{
    localStorage.setItem(KEY,JSON.stringify(s));
    v200SaveScopedLocal();
  }catch(e){
    console.warn('V4.02 local checkpoint',e);
  }

  v213LastComparable=v213Comparable(s);

  if(v075CloudLoadedFor===v073User.id && v200CharacterComplete()){
    v075ScheduleSave();
  }
  return true;
}

function v213PickNewestSave(uid,cloudData,scoped,current){
  const candidates=[];

  if(cloudData && v213BelongsTo(cloudData,uid)){
    candidates.push({source:'cloud',data:cloudData});
  }

  if(scoped && v213BelongsTo(scoped,uid)){
    candidates.push({source:'local',data:scoped});
  }

  /*
    Generic KEY is considered only when it is explicitly stamped for this
    exact account. This prevents two Google/email accounts sharing a save.
  */
  if(current && current.__accountOwnerId===uid){
    candidates.push({source:'current',data:current});
  }

  if(!candidates.length)return null;

  const hasMetadata=candidates.some(x=>
    v213MetaTime(x.data)>0 || v213MetaRevision(x.data)>0
  );

  if(!hasMetadata){
    /*
      Legacy saves have no trustworthy timestamp. Keep cloud authoritative.
      From V4.02 onward every mutation gets metadata.
    */
    return candidates.find(x=>x.source==='cloud') || candidates[0];
  }

  candidates.sort((a,b)=>{
    const ta=v213MetaTime(a.data),tb=v213MetaTime(b.data);
    if(tb!==ta)return tb-ta;
    return v213MetaRevision(b.data)-v213MetaRevision(a.data);
  });

  return candidates[0];
}

function v213StartMonitor(){
  if(v213MonitorReady)return;
  v213MonitorReady=true;
  v213LastComparable=v213Comparable(s);

  v213MonitorTimer=setInterval(()=>{
    try{
      /* V7.177: once all gameplay domains are enforced, this historical whole-save
         JSON diff has no authority role and retires itself permanently for the session. */
      const ad=window.v7133AuthorityDiagnostics?.();
      if(ad?.fullAuthority===true){
        clearInterval(v213MonitorTimer);v213MonitorTimer=0;
        window.__V7176_LEGACY_SAVE_MONITOR_RETIRED__=true;
        return;
      }
      if(document.hidden)return;
      if(!v200DurableUser())return;
      if(v075CloudLoadedFor!==v073User.id)return;
      if(v075ApplyingCloud || v200Deleting)return;

      const now=v213Comparable(s);
      if(now && now!==v213LastComparable){
        v213LocalCheckpoint('monitor');
      }
    }catch(e){
      console.warn('V4.02 save monitor',e);
    }
  },2000);
}

async function v075GetCloudSave(){
  if(!v073Db || !v200DurableUser())return null;

  const {data,error}=await v073Db
    .from('player_saves')
    .select('save_data,updated_at')
    .eq('user_id',v073User.id)
    .maybeSingle();

  if(error)throw error;
  return data||null;
}

async function v075ApplyCloudSave(data){
  if(!data || typeof data!=='object' || !v200DurableUser())return false;

  if(data.__accountOwnerId && data.__accountOwnerId!==v073User.id){
    throw new Error('Dieser Cloud-Spielstand gehört zu einem anderen Account.');
  }

  const loaded=v075SanitizeSave(data);
  if(!loaded)return false;
  v8102StripServerOwnedShopState(loaded);

  let liveWeaponShop=null,liveMagicShop=null,shopHydrated=false;
  try{
    const d=window.v7063ItemStageDiagnostics?.();
    shopHydrated=!!(d?.ready&&d?.enabled);
    if(shopHydrated){
      liveWeaponShop=Array.isArray(s?.weaponShop)?JSON.parse(JSON.stringify(s.weaponShop)):[];
      liveMagicShop=Array.isArray(s?.magicShop)?JSON.parse(JSON.stringify(s.magicShop)):[];
    }
  }catch(_){}

  v075ApplyingCloud=true;

  try{
    Object.keys(s).forEach(k=>delete s[k]);
    Object.assign(s,loaded);
    s.weaponShop=shopHydrated?liveWeaponShop:[];
    s.magicShop=shopHydrated?liveMagicShop:[];

    s.social??={};
    s.social.playerId=v073User.id;
    s.__accountOwnerId=v073User.id;

    v213SaveRevision=Math.max(
      v213SaveRevision,
      v213MetaRevision(s)
    );

    localStorage.setItem(KEY,JSON.stringify(s));
    localStorage.setItem('growLegendsPlayerId',v073User.id);

    v075CloudLoadedFor=v073User.id;
    v200SaveScopedLocal();

    v213Dirty=false;
    v213LastComparable=v213Comparable(s);

    try{render()}catch(e){}
    try{
      if(document.getElementById('shop')?.classList.contains('active')){
        if(shopHydrated)window.renderShop?.();
        else void window.v7063ItemStageRefresh?.(true);
      }
    }catch(_){}

    return true;

  }finally{
    v075ApplyingCloud=false;
  }
}

function v075ResolveCloudAfterLogin(){
  if(!v200DurableUser() || !v073Db)return false;

  const uid=v073User.id;

  if(v200CloudPromise && v200CloudPromiseUser===uid){
    return v200CloudPromise;
  }

  v200CloudPromiseUser=uid;

  v200CloudPromise=(async()=>{
    try{
      /*
        Save is locked until the resolver has finished.
        No render-triggered auto-save may write before this point.
      */
      v075CloudLoadedFor=null;
      v213Dirty=false;

      const cloud=await v075GetCloudSave();
      const scoped=v200LoadScopedLocal(uid);

      let current=null;
      try{
        if(s?.__accountOwnerId===uid){
          current=JSON.parse(JSON.stringify(s));
        }
      }catch(e){}

      const chosen=v213PickNewestSave(
        uid,
        cloud?.save_data||null,
        scoped,
        current
      );

      if(chosen?.data && Object.keys(chosen.data).length){
        await v075ApplyCloudSave(chosen.data);

        v200LastCloudStamp=cloud?.updated_at||null;
        v213SaveRevision=Math.max(
          v213SaveRevision,
          v213MetaRevision(chosen.data)
        );
        v213LastComparable=v213Comparable(s);

        /*
          If local was newer than cloud, immediately repair cloud from the
          selected local checkpoint before normal gameplay continues.
        */
        if(chosen.source!=='cloud'){
          v075CloudLoadedFor=uid;
          await v075WriteCloudSave(true);
        }

        if(v200CharacterComplete()){
          await v073SyncProfile(true);
        }

        v075CloudLoadedFor=uid;
        v200SaveScopedLocal();
        v213StartMonitor();
        return true;
      }

      /*
        No save anywhere: create a fresh account state, but do not overwrite
        anything belonging to another user.
      */
      v200FreshState(uid);
      v213StampState();
      v075CloudLoadedFor=uid;
      v200LastCloudStamp=null;
      v200SaveScopedLocal();
      v213LastComparable=v213Comparable(s);
      v213StartMonitor();

      return true;

    }catch(e){
      console.error('V4.02 cloud resolve',e);
      v063Toast(
        'Cloud-Spielstand konnte nicht geladen werden',
        'error',
        e?.message||''
      );
      return false;

    }finally{
      v200CloudPromise=null;
      v200CloudPromiseUser=null;
    }
  })();

  return v200CloudPromise;
}

async function v075WriteCloudSave(force=false){
  if(!v200DurableUser() || !v073Db || v075ApplyingCloud || v200Deleting){
    return false;
  }

  if(!v200CharacterComplete())return false;

  if(!force && v075CloudLoadedFor!==v073User.id){
    return false;
  }

  const uid=v073User.id;

  /*
    Every outgoing save receives an explicit revision/time stamp.
    This makes future index updates able to decide which copy is newer.
  */
  if(v213Dirty || !v213MetaTime(s)){
    v213StampState();
  }

  const snapshot=v8102StripServerOwnedShopState(JSON.parse(JSON.stringify(s)));
  snapshot.__accountOwnerId=uid;
  snapshot.social??={};
  snapshot.social.playerId=uid;

  const doWrite=async()=>{
    if(!v200DurableUser() || v073User.id!==uid || v200Deleting)return false;

    v075Saving=true;

    try{
      const profileOk=await v073SyncProfile(true);
      if(!profileOk)return false;

      const {error}=await v073Db
        .from('player_saves')
        .upsert({
          user_id:uid,
          save_data:snapshot,
          updated_at:new Date().toISOString()
        },{onConflict:'user_id'});

      if(error)throw error;

      const {data:stamp,error:stampError}=await v073Db
        .from('player_saves')
        .select('updated_at')
        .eq('user_id',uid)
        .maybeSingle();

      if(stampError)throw stampError;

      v200LastCloudStamp=stamp?.updated_at||v200LastCloudStamp;
      v075CloudLoadedFor=uid;

      /*
        Mark clean only if state did not change again while this request
        was in flight. Otherwise the next queued save will carry the newer copy.
      */
      if(v213Comparable(snapshot)===v213Comparable(s)){
        v213Dirty=false;
      }

      v200SaveScopedLocal();
      v213LastComparable=v213Comparable(s);

      return true;

    }catch(e){
      console.error('V4.02 cloud save',e);
      v213Dirty=true;
      v063Toast(
        'Cloud-Speicherung fehlgeschlagen',
        'error',
        e?.message||''
      );
      return false;

    }finally{
      v075Saving=false;
    }
  };

  /*
    Serialize writes. The old implementation discarded a save request when
    another save was already running.
  */
  v213SaveChain=v213SaveChain.then(doWrite,doWrite);
  return v213SaveChain;
}

function v075ScheduleSave(){
  clearTimeout(v075SaveTimer);

  if(!v200DurableUser() || !v200CharacterComplete())return;
  if(v075CloudLoadedFor!==v073User.id)return;

  v075SaveTimer=setTimeout(()=>{
    v075WriteCloudSave(false);
  },450);
}

async function v200NameAvailable(name){
  if(!v073Db || !v200DurableUser())return true;

  try{
    const {data,error}=await v073Db
      .from('profiles')
      .select('id,character_name')
      .ilike('character_name',name)
      .limit(10);

    if(error)throw error;

    return !(data||[]).some(row=>
      row.id!==v073User.id &&
      String(row.character_name||'').toLocaleLowerCase()===name.toLocaleLowerCase()
    );
  }catch(e){
    console.warn('V4.02 name availability',e);
    return true;
  }
}

function v029ShowClassChoice(){
  if(!window.__V200_AUTH_READY__)return;
  if(!v200DurableUser())return;
  if(v075CloudLoadedFor!==v073User.id)return;

  if(v200CharacterComplete()){
    v200ClearCharacterModals();
    return;
  }

  if(document.querySelector('#v200CharacterModal'))return;
  v200ClearCharacterModals();

  const modal=document.createElement('div');
  modal.id='v200CharacterModal';
  modal.innerHTML=`
    <div class="v200-character-card">
      <h2>Erstelle deine Legende</h2>
      <div class="v200-character-sub">
        Gib deinen Charakternamen ein und wähle deine Klasse. Dieser Schritt erscheint nur einmal.
      </div>

      <div class="v200-character-name">
        <label>Charaktername</label>
        <input id="v200CharacterName" maxlength="18" autocomplete="off" placeholder="Deinen Namen eingeben">
        <div id="v200CharacterNameStatus">2–18 Zeichen · muss einzigartig sein</div>
      </div>

      <div class="v200-class-grid">
        ${Object.entries(classes).map(([id,c])=>`
          <button type="button" class="v200-class" data-v200-class="${id}">
            <img src="${v080AvatarFor(id)}" alt="${v073Escape(c.name)}">
            <div class="v200-class-copy">
              <b>${v073Escape(c.name)}</b>
              <span>${v073Escape(c.text||'')}</span>
            </div>
          </button>`).join('')}
      </div>
    </div>`;

  document.body.appendChild(modal);

  const input=modal.querySelector('#v200CharacterName');
  const status=modal.querySelector('#v200CharacterNameStatus');

  modal.querySelectorAll('[data-v200-class]').forEach(btn=>{
    btn.onclick=async()=>{
      const name=v071CleanName(input?.value);

      if(!v071NameValid(name)){
        status.className='error';
        status.textContent='Bitte einen Namen mit 2–18 Zeichen eingeben.';
        input?.focus();
        return;
      }

      const moderation=window.v7185Moderation?.check?.(name,'character_name');
      if(moderation?.blocked){
        status.className='error';
        status.textContent=moderation.message||'Dieser Charaktername ist nicht zulässig.';
        input?.focus();
        return;
      }

      modal.querySelectorAll('[data-v200-class]').forEach(x=>x.disabled=true);
      status.className='';
      status.textContent='Name wird geprüft …';

      if(!(await v200NameAvailable(name))){
        modal.querySelectorAll('[data-v200-class]').forEach(x=>x.disabled=false);
        status.className='error';
        status.textContent='Dieser Charaktername ist bereits vergeben.';
        input?.focus();
        return;
      }

      const classId=btn.dataset.v200Class;
      const ok=await v115Confirm(
        `${classes[classId].name} als Klasse für ${name} wählen?\n\nDie Klasse kann später nicht gewechselt werden.`,
        {title:'Charakter erstellen',type:'warn',okText:'Charakter erstellen'}
      );

      if(!ok){
        modal.querySelectorAll('[data-v200-class]').forEach(x=>x.disabled=false);
        status.textContent='2–18 Zeichen · muss einzigartig sein';
        return;
      }

      s.playerClass=classId;
      s.classLocked=true;
      s.characterName=name;
      s.characterNameSet=true;
      s.social??={};
      s.social.playerId=v073User.id;
      s.__accountOwnerId=v073User.id;

      localStorage.setItem(KEY,JSON.stringify(s));

      /* close immediately; async saves happen after UI is gone */
      v200ClearCharacterModals();

      const profileOk=await v073SyncProfile(true);
      if(profileOk){
        await v075WriteCloudSave(true);
      }

      v071ApplyNameToUi();
      v200OpenHome();
      v063Toast(`${name} wurde erstellt`,'success',`${classes[classId].name} · Willkommen bei Grow Legends`);
    };
  });

  setTimeout(()=>input?.focus(),60);
}

async function v200FinalizeUser(user){
  if(!user || user.is_anonymous || v200Deleting || window.__V301_LOGOUT_IN_PROGRESS__ || window.__V4136_LOGOUT_PREPARING__)return false;

  v073User=user;
  v073Ready=true;
  s.social??={};
  s.social.playerId=user.id;
  localStorage.setItem('growLegendsPlayerId',user.id);

  const ok=await v075ResolveCloudAfterLogin();
  if(!ok)return false;

  window.__V200_AUTH_READY__=true;
  /* V7.207: keep the loading artwork above the app until the deterministic
     boot owner confirms the first playable frame. Without the final owner
     (legacy/standalone fallback), retain the historical immediate release. */
  if(!window.__V7205_SPLASH_GATE__)v075Overlay(false);

  if(v200CharacterComplete()){
    s.characterNameSet=true;
    v200ClearCharacterModals();
    localStorage.setItem(KEY,JSON.stringify(s));
    v200OpenHome();
  }else{
    v200ClearCharacterModals();
    setTimeout(()=>v029ShowClassChoice(),80);
  }

  try{v141BuildSettings()}catch(e){}
  return true;
}

function v200LoginReadyFor(user){
  const id=String(user?.id||'');
  if(!id)return false;
  try{
    if(String(v073User?.id||'')!==id)return false;
    if(window.__V200_AUTH_READY__!==true)return false;
    if(String(typeof v075CloudLoadedFor==='undefined'?'':v075CloudLoadedFor||'')!==id)return false;
    if(typeof window.v452AccountVerified==='function'&&!window.v452AccountVerified(id))return false;
    return true;
  }catch(e){return false}
}

async function v200FinalizeAuthenticatedLogin(user){
  const id=String(user?.id||'');
  if(!id)return false;
  let firstError=null;

  try{
    const first=await v200FinalizeUser(user);
    if(first||v200LoginReadyFor(user))return true;
  }catch(e){
    firstError=e;
    console.warn('V4.02 first login finalize failed; waiting for active auth transition',e);
  }

  /* A prior INITIAL_SESSION / token-refresh transition for the same account may still
     be finishing. Do not turn a successful password login into a false auth failure. */
  for(let i=0;i<20;i++){
    if(v200LoginReadyFor(user))return true;
    await new Promise(resolve=>setTimeout(resolve,75));
  }

  /* Confirm the Supabase session is still valid, then retry the SAME canonical
     finalizer once. This replaces the former manual logout + second login workaround. */
  let sessionUser=user;
  try{
    const {data,error}=await v073Db.auth.getSession();
    if(error)throw error;
    const current=data?.session?.user||null;
    if(!current||String(current.id||'')!==id)throw new Error('Anmeldesitzung ist nicht mehr aktiv.');
    sessionUser=current;
  }catch(e){
    if(firstError)throw firstError;
    throw e;
  }

  try{
    const second=await v200FinalizeUser(sessionUser);
    if(second||v200LoginReadyFor(sessionUser))return true;
  }catch(e){
    console.error('V4.02 login finalize retry',e);
    if(firstError)throw firstError;
    throw e;
  }

  if(firstError)throw firstError;
  return false;
}

async function v200EmailAuth(){
  if(v200AuthBusy)return;
  if(window.__V301_LOGOUT_IN_PROGRESS__ || window.__V4136_LOGOUT_PREPARING__){
    v200AuthStatus('Abmeldung wird abgeschlossen …');
    return;
  }

  const email=String(document.querySelector('#v075Email')?.value||'').trim();
  const password=String(document.querySelector('#v075Password')?.value||'');
  const mode=v075AuthMode;

  if(!email || !email.includes('@')){
    v200AuthStatus('Bitte eine gültige E-Mail-Adresse eingeben.','error');
    return;
  }
  if(password.length<6){
    v200AuthStatus('Das Passwort muss mindestens 6 Zeichen haben.','error');
    return;
  }

  v200AuthBusy=true;
  v200EmailOwnsFinalize=true;
  let v200AuthSucceeded=false;
  const btn=document.querySelector('#v075EmailAction');
  if(btn){
    btn.disabled=true;
    btn.textContent=mode==='register'?'Account wird erstellt…':'Anmeldung läuft…';
  }

  v200AuthStatus(mode==='register'?'Registrierung wird gesendet …':'Anmeldedaten werden geprüft …');

  try{
    if(!(await v073Init()) || !v073Db)throw new Error('Supabase ist nicht erreichbar.');

    if(mode==='register'){
      /* EXACTLY ONE signUp call per user click. No retry loop. */
      const {data,error}=await v073Db.auth.signUp({
        email,
        password,
        options:{data:{grow_legends_registration:true}}
      });

      if(error)throw error;

      if(data?.session?.user){
        v200AuthSucceeded=true;
        v200EmailFinalizeUid=String(data.session.user.id||'');
        v200EmailFinalizeUntil=Date.now()+5000;
        v200AuthStatus('Account erstellt. Charaktererstellung wird geöffnet …','success');
        const finalized=await v200FinalizeUser(data.session.user);
        if(finalized===false)throw new Error('Spielstand konnte nach der Registrierung nicht geladen werden.');
      }else if(data?.user){
        v200AuthStatus(
          'Registrierung erfolgreich. Bitte bestätige die E-Mail in deinem Postfach und melde dich danach an.',
          'success'
        );
        v063Toast('Registrierung erfolgreich','success','Bitte bestätige deine E-Mail und melde dich danach an.');
      }else{
        throw new Error('Supabase hat keinen Benutzer zurückgegeben.');
      }
    }else{
      const {data,error}=await v073Db.auth.signInWithPassword({email,password});
      if(error)throw error;
      if(!data?.user)throw new Error('Keine Benutzersitzung erhalten.');

      v200AuthSucceeded=true;
      v200EmailFinalizeUid=String(data.user.id||'');
      v200EmailFinalizeUntil=Date.now()+5000;
      v200AuthStatus('Anmeldung erfolgreich. Spielstand wird geladen …','success');
      const finalized=await v200FinalizeAuthenticatedLogin(data.user);
      if(finalized===false)throw new Error('Spielstand konnte nach der Anmeldung nicht geladen werden.');
    }
  }catch(e){
    const raw=String(e?.message||e||'Unbekannter Fehler');
    let msg=raw;

    if(/rate limit|too many|429/i.test(raw)){
      msg='Supabase hat Registrierungen wegen zu vieler vorheriger Versuche vorübergehend begrenzt. Bitte später erneut versuchen. V4.02 sendet pro Klick nur noch genau eine Anfrage.';
    }else if(/already registered|already been registered|user already registered/i.test(raw)){
      msg='Für diese E-Mail existiert bereits ein Account. Bitte „Anmelden“ verwenden.';
    }else if(/invalid login credentials/i.test(raw)){
      msg='E-Mail oder Passwort ist falsch.';
    }

    console.error('V4.02 email auth',e);
    if(v200AuthSucceeded){
      try{v4143SetAuthBoot(false)}catch(_){}
      try{v075SetAuthMode('login');v075Overlay(true)}catch(_){}
      v200AuthStatus(msg,'error');
      v063Toast('Spielstand konnte nicht geladen werden','error',msg);
    }else{
      v200AuthStatus(msg,'error');
      v063Toast(mode==='register'?'Registrierung fehlgeschlagen':'Anmeldung fehlgeschlagen','error',msg);
    }
  }finally{
    v200EmailOwnsFinalize=false;
    v200AuthBusy=false;
    if(btn){
      btn.disabled=false;
      btn.textContent=v075AuthMode==='register'?(window.GrowI18n?.t?.('login.register')||'Registrieren'):(window.GrowI18n?.t?.('login.signIn')||'Anmelden');
    }
  }
}

async function v200GoogleAuth(){
  if(v200AuthBusy)return;
  if(window.__V301_LOGOUT_IN_PROGRESS__ || window.__V4136_LOGOUT_PREPARING__){
    v200AuthStatus('Abmeldung wird abgeschlossen …');
    return;
  }
  v200AuthBusy=true;

  try{
    if(!(await v073Init()) || !v073Db)throw new Error('Supabase ist nicht erreichbar.');

    sessionStorage.setItem('v200OAuthPending','1');

    const {error}=await v073Db.auth.signInWithOAuth({
      provider:'google',
      options:{
        redirectTo:(()=>{
          try{
            const u=new URL(window.location.href);
            if(u.searchParams.get('gl_native')==='1') return 'de.growlegends.app://auth-callback';
          }catch(e){}
          try{
            const C=window.Capacitor;
            if(C && typeof C.isNativePlatform==='function' && C.isNativePlatform()){
              return 'de.growlegends.app://auth-callback';
            }
          }catch(e){}
          return V075_SITE_URL;
        })(),
        queryParams:{prompt:'select_account'}
      }
    });

    if(error)throw error;
  }catch(e){
    sessionStorage.removeItem('v200OAuthPending');
    v200AuthBusy=false;
    v200AuthStatus(e?.message||'Google-Anmeldung fehlgeschlagen.','error');
    v063Toast('Google-Anmeldung fehlgeschlagen','error',e?.message||'');
  }
}

v075EmailLogin=v200EmailAuth;
v075Google=v200GoogleAuth;

function v075BindAuthUi(){
  const login=document.querySelector('#v075LoginTab');
  const reg=document.querySelector('#v075RegisterTab');
  const email=document.querySelector('#v075EmailAction');
  const google=document.querySelector('#v075GoogleAction');

  if(login)login.onclick=()=>v075SetAuthMode('login');
  if(reg)reg.onclick=()=>v075SetAuthMode('register');
  if(email)email.onclick=v200EmailAuth;
  if(google)google.onclick=v200GoogleAuth;
}

async function v136Logout(reason='manual'){
 if(v200Deleting || window.__V301_LOGOUT_IN_PROGRESS__)return;
 window.__V301_LOGOUT_IN_PROGRESS__=true;

 /* Lock the app immediately. Never leave a stale interactive game visible
    while cloud-save/signOut is still awaiting network work. */
 window.__V200_AUTH_READY__=false;
 try{
  document.documentElement.classList.remove('v224-app-ready');
  v075SetAuthMode('login');
  v075Overlay(true);
  const ov=document.querySelector('#v075AuthOverlay');
  if(ov){
   ov.style.pointerEvents='auto';
   ov.style.visibility='visible';
   ov.style.opacity='1';
  }
 }catch(e){}

 try{
  /* Save the authoritative state before ending the local Supabase session. */
  if(v200DurableUser() && v200CharacterComplete()){
   try{v200SaveScopedLocal()}catch(e){}
   await v075WriteCloudSave(true);
  }
  if(v073Db){
   await v073Db.auth.signOut({scope:'local'});
  }
 }catch(e){
  console.warn('V4.02 logout',e);
 }finally{
  /*
    V4.02 hard local logout:
    Supabase signOut may fail or a mobile browser may resume in the middle of
    the request. The browser must still end in ONE unambiguous logged-out state.
  */
  try{v200ClearSupabaseAuthStorage()}catch(e){}

  v073User=null;
  v073Ready=false;
  v073InitPromise=null;
  v073LastProfileJson='';
  v075CloudLoadedFor=null;
  v200LastCloudStamp=null;
  window.__V200_AUTH_READY__=false;
  v200CloudPromise=null;
  v200CloudPromiseUser=null;
  v200AuthBusy=false;

  localStorage.removeItem('growLegendsPlayerId');
  sessionStorage.removeItem('v200OAuthPending');
  sessionStorage.removeItem('v301LastActivity');

  v200ClearCharacterModals();
  v075SetAuthMode('login');
  v075Overlay(true);

  const ov=document.querySelector('#v075AuthOverlay');
  if(ov){
    ov.classList.add('show');
    ov.style.pointerEvents='auto';
    ov.style.visibility='visible';
    ov.style.opacity='1';
  }

  try{v141BuildSettings()}catch(e){}
  try{v073SetState('ACCOUNT ERFORDERLICH',false)}catch(e){}

  if(typeof v063Toast==='function'){
   v063Toast(
    reason==='idle'?'Automatisch abgemeldet':'Abgemeldet',
    reason==='idle'?'warn':'success',
    reason==='idle'
      ?'Du wurdest nach 10 Minuten Inaktivität vollständig abgemeldet.'
      :'Deine Sitzung wurde vollständig beendet.'
   );
  }

  /* Release only after every local auth flag/storage entry was cleared. */
  window.__V301_LOGOUT_IN_PROGRESS__=false;
 }
}

function v200ClearSupabaseAuthStorage(){
  try{
    const keys=[];
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(k && (/^sb-.*-auth-token$/i.test(k)||/supabase.*auth/i.test(k)))keys.push(k);
    }
    keys.forEach(k=>localStorage.removeItem(k));
  }catch(e){}

  try{
    const keys=[];
    for(let i=0;i<sessionStorage.length;i++){
      const k=sessionStorage.key(i);
      if(k && (/^sb-.*-auth-token$/i.test(k)||/supabase.*auth/i.test(k)||/v200OAuthPending/i.test(k)))keys.push(k);
    }
    keys.forEach(k=>sessionStorage.removeItem(k));
  }catch(e){}
}

async function v141DeleteAccount(){
  if(v200Deleting)return;

  const input=document.querySelector('#v141DeleteInput');
  const btn=document.querySelector('#v141DeleteConfirm');

  if(String(input?.value||'').trim()!=='DELETE')return;
  if(!v073Db || !v200DurableUser()){
    v063Toast('Account-Löschung nicht möglich','error','Kein angemeldeter Account gefunden.');
    return;
  }

  v200Deleting=true;
  const uid=v073User.id;

  if(btn){
    btn.disabled=true;
    btn.textContent='Account wird gelöscht…';
  }

  try{
    const {error}=await v073Db.rpc('delete_my_account');
    if(error)throw error;

    try{await v073Db.auth.signOut({scope:'local'});}catch(e){}

    localStorage.removeItem(KEY);
    localStorage.removeItem('growLegendsPlayerId');
    localStorage.removeItem(v200ScopedKey(uid));
    v200ClearSupabaseAuthStorage();

    v073User=null;
    v075CloudLoadedFor=null;
    v200LastCloudStamp=null;
    window.__V200_AUTH_READY__=false;

    v200FreshState('');
    localStorage.removeItem(KEY);

    v200ClearCharacterModals();
    v141CloseDelete();
    v075SetAuthMode('login');
    v075Overlay(true);

    v063Toast('Account gelöscht','success','Account, Cloud-Spielstand und lokale Sitzung wurden vollständig entfernt.');
  }catch(e){
    console.error('V4.02 delete account',e);
    v063Toast('Account konnte nicht gelöscht werden','error',e?.message||'');
  }finally{
    v200Deleting=false;
    if(btn){
      btn.textContent='Account endgültig löschen';
      btn.disabled=String(input?.value||'').trim()!=='DELETE';
    }
  }
}

/* Keep settings delete UI bound to final function. */
function v200BindSettings(){
  const input=document.querySelector('#v141DeleteInput');
  const confirm=document.querySelector('#v141DeleteConfirm');
  const cancel=document.querySelector('#v141DeleteCancel');

  if(input){
    input.oninput=()=>{
      if(confirm)confirm.disabled=input.value.trim()!=='DELETE';
    };
  }
  if(confirm)confirm.onclick=v141DeleteAccount;
  if(cancel)cancel.onclick=v141CloseDelete;

  const version=document.querySelector('#v141VersionLine');
}

/* One admin poll, content-aware. */
function v200ComparableSave(obj){
  try{
    const copy=JSON.parse(JSON.stringify(obj||{}));
    delete copy.__accountOwnerId;
    if(copy.social)delete copy.social.playerId;
    return JSON.stringify(copy);
  }catch(e){
    return '';
  }
}

async function v200AdminPoll(){
  if(document.hidden)return;
  if(v200AdminBusy || v200Deleting || !v200DurableUser() || !v073Db)return;
  if(v075CloudLoadedFor!==v073User.id)return;

  v200AdminBusy=true;
  try{
    const {data,error}=await v073Db
      .from('player_saves')
      .select('save_data,updated_at')
      .eq('user_id',v073User.id)
      .maybeSingle();

    if(error || !data?.save_data || !data?.updated_at)return;

    if(!v200LastCloudStamp){
      v200LastCloudStamp=data.updated_at;
      return;
    }

    const remote=new Date(data.updated_at).getTime();
    const known=new Date(v200LastCloudStamp).getTime();
    if(!Number.isFinite(remote)||!Number.isFinite(known)||remote<=known+250)return;

    if(v200ComparableSave(data.save_data)===v200ComparableSave(s)){
      v200LastCloudStamp=data.updated_at;
      return;
    }

    clearTimeout(v075SaveTimer);
    await v075ApplyCloudSave(data.save_data);
    v200LastCloudStamp=data.updated_at;

    v063Toast('🛡️ Admin-Änderung übernommen','success','Deine Spielerwerte wurden vom Server aktualisiert.');
    await v073SyncProfile(true);
  }catch(e){
    console.error('V4.02 admin poll',e);
  }finally{
    v200AdminBusy=false;
  }
}

function v200InstallAuthListener(){
  if(v200AuthListenerInstalled || !v073Db)return;
  v200AuthListenerInstalled=true;

  v073Db.auth.onAuthStateChange((event,session)=>{
    const user=session?.user||null;
    if((window.__V301_LOGOUT_IN_PROGRESS__ || window.__V4136_LOGOUT_PREPARING__) && event!=='SIGNED_OUT')return;

    if(event==='SIGNED_OUT'){
      if(!v200Deleting){
        v073User=null;v075CloudLoadedFor=null;window.__V200_AUTH_READY__=false;
        try{window.v4139NeutralizeAccountRuntime?.('signed-out')}catch(e){}
      }
      return;
    }

    if(!user || user.is_anonymous)return;
    const nextId=String(user.id||'');
    const currentId=String(v073User?.id||'');

    /* Password/email auth owns this finalize. Supabase also emits SIGNED_IN,
       so the listener must not launch a second finalizer for the same action. */
    if(event==='SIGNED_IN' && (
      v200EmailOwnsFinalize ||
      (nextId && nextId===v200EmailFinalizeUid && Date.now()<v200EmailFinalizeUntil)
    )){
      v073User=user;
      v073Ready=true;
      return;
    }

    /* V7.284: v200Boot / OAuth return owns initial-session resolution.
       Token refreshes only refresh the auth object and must never launch another
       canonical resolver while the splash/login finalizer is already running. */
    if(event==='TOKEN_REFRESHED'||event==='INITIAL_SESSION'||event==='USER_UPDATED'){
      v073User=user;v073Ready=true;return;
    }
    if(currentId===nextId && (
      window.__V200_AUTH_READY__===true ||
      window.__V7206_CANONICAL_LOGIN_RUNNING__===true ||
      window.__V7206_FIRST_PLAYABLE_PENDING__===true
    )){
      v073User=user;v073Ready=true;return;
    }

    setTimeout(()=>v200FinalizeUser(user),0);
  });
}


async function v200HandleOAuthReturn(){
  if(!v073Db)return false;

  const u=new URL(window.location.href);
  const code=u.searchParams.get('code');
  const hasReturn=!!(
    code ||
    u.searchParams.get('error') ||
    u.hash.includes('access_token') ||
    sessionStorage.getItem('v200OAuthPending')
  );

  if(!hasReturn)return false;

  const authError=u.searchParams.get('error_description')||u.searchParams.get('error');
  if(authError){
    sessionStorage.removeItem('v200OAuthPending');
    v200AuthStatus(authError,'error');
    return false;
  }

  let {data:{session},error}=await v073Db.auth.getSession();
  if(error)throw error;

  if(!session && code && typeof v073Db.auth.exchangeCodeForSession==='function'){
    const exchanged=await v073Db.auth.exchangeCodeForSession(code);
    if(exchanged.error)throw exchanged.error;
    session=exchanged.data?.session||null;
  }

  if(session?.user){
    sessionStorage.removeItem('v200OAuthPending');

    try{
      ['code','error','error_code','error_description'].forEach(k=>u.searchParams.delete(k));
      u.hash='';
      history.replaceState({},document.title,u.pathname+(u.search||''));
    }catch(e){}

    await v200FinalizeUser(session.user);
    return true;
  }

  return false;
}

/* One render wrapper for online persistence/UI maintenance. */
const v200BaseRender=render;
render=function(){
  const r=v200BaseRender();

  

  if(v200DurableUser() && v200CharacterComplete() && v075CloudLoadedFor===v073User.id){
    const ad=(()=>{try{return window.v7133AuthorityDiagnostics?.()||null}catch(_){return null}})();
    if(ad?.fullAuthority!==true)v075ScheduleSave();
  }

  requestAnimationFrame(()=>{
    if(v200CharacterComplete())v200ClearCharacterModals();
    v200BindSettings();
    try{v141BuildSettings()}catch(e){}
  });

  return r;
};

/* Idle tracking is owned by V4.02 below. */

/* Admin polling: one interval only. */
setInterval(()=>{if(!document.hidden)v200AdminPoll()},10000);

async function v200Boot(){
  if(v200Booted)return;
  v200Booted=true;

  /* V4.159: on refresh, show a neutral loading state until the persisted session
     and its account-owned player_saves row have been resolved. */
  try{window.v660ResetBootProgress?.()}catch(_){}
  v4143SetAuthBoot(true,'Sitzung wird wiederhergestellt …');
  v075BindAuthUi();
  v200BindSettings();

  const ok=await v073Init();
  if(!ok){
    v4143SetAuthBoot(false);
    v075SetAuthMode('login');
    v075Overlay(true);
    try{void v200RefreshLoginInfo()}catch(e){}
    return;
  }

  v200InstallAuthListener();

  try{
    v4143SetAuthBoot(true,'Google-Sitzung wird geprüft …');
    if(await v200HandleOAuthReturn()){v075Overlay(false);return;}
  }catch(e){
    console.error('V4.159 OAuth return',e);
    v200AuthStatus(e?.message||'Google-Anmeldung konnte nicht abgeschlossen werden.','error');
  }

  v4143SetAuthBoot(true,'Account wird geprüft …');
  const {data:{session},error}=await v073Db.auth.getSession();
  if(error)console.error('V4.02 session restore',error);

  if(session?.user && !session.user.is_anonymous){
    v4143SetAuthBoot(true,'Spielstand wird geladen …');
    const loaded=await v200FinalizeUser(session.user);
    if(loaded){v075Overlay(false);return;}
    v4143SetAuthBoot(false);
    v075SetAuthMode('login');
    v075Overlay(true);
    try{void v200RefreshLoginInfo()}catch(e){}
    return;
  }

  v073User=null;
  window.__V200_AUTH_READY__=false;
  v4143SetAuthBoot(false);
  v075SetAuthMode('login');
  v075Overlay(true);
  /* Login decoration is no longer on the session-restore critical path. */
  try{void v200RefreshLoginInfo()}catch(e){}
}

/* V4.159: do NOT start auth/cloud resolution while the HTML parser is still loading
   hundreds of later compatibility patches. Starting here used to create a race where a
   refresh could resolve the account with an OLD save picker before the final account
   isolation owner existed. Start only after the complete document has been parsed. */
function v4137StartBoot(){
  v200Boot().catch(e=>{
    console.error('V4.159 boot',e);
    v200AuthStatus(e?.message||'Startfehler','error');
    try{v4143SetAuthBoot(false)}catch(_){}
    v075SetAuthMode('login');
    v075Overlay(true);
    try{void v200RefreshLoginInfo()}catch(_){}
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',v4137StartBoot,{once:true});
else setTimeout(v4137StartBoot,0);
