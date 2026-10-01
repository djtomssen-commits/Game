const V141_SETTINGS_KEY='growLegendsSettingsV141';
let v141Deleting=false;

function v141LoadSettings(){
  const base={sound:true,notifications:true,effects:true,pushNotifications:true,energySaver:false};
  try{
    const loaded={...base,...JSON.parse(localStorage.getItem(V141_SETTINGS_KEY)||'{}')};
    // Ingame-Hinweise sind keine Benutzereinstellung mehr. Sie bleiben immer aktiv.
    loaded.notifications=true;
    return loaded;
  }catch(e){return base}
}
let v141Settings=v141LoadSettings();
v141Settings.notifications=true;
window.v6255EnergySaverActive=()=>!!v141Settings.energySaver;

function v141SaveSettings(){
  localStorage.setItem(V141_SETTINGS_KEY,JSON.stringify(v141Settings));
  v141ApplySettings();
}
function v141ApplySettings(){
  document.body.classList.toggle('v141-reduced-effects',!v141Settings.effects);
  document.body.classList.toggle('v6255-energy-saver',!!v141Settings.energySaver);
  document.querySelectorAll('audio,video').forEach(el=>{
    if(el.tagName==='AUDIO')el.muted=!v141Settings.sound;
  });
}

/* Gameplay toasts can be disabled, but warnings/errors remain visible. */
if(typeof v063Toast==='function' && !window.__v141ToastWrapped){
  window.__v141ToastWrapped=true;
  const oldToast=v063Toast;
  v063Toast=function(title,type='info',detail=''){
    const critical=['error','warn','warning'].includes(String(type).toLowerCase());
    if(!v141Settings.notifications && !critical)return;
    return oldToast(title,type,detail);
  };
}

function v141AccountEmail(){
  return v073User?.email || (v073User && !v073User.is_anonymous?'Google-Konto':'Nicht angemeldet');
}
function v141CloudText(){
  if(v073User && !v073User.is_anonymous && v075CloudLoadedFor===v073User.id)return '☁️ Cloud-Spielstand synchronisiert';
  if(v073User && !v073User.is_anonymous)return '☁️ Account verbunden';
  return '☁️ Kein dauerhafter Account';
}

async function v7216RefreshPrivacyButton(){
  const btn=document.querySelector('#v7216PrivacyAds');
  if(!btn)return;
  const ads=window.Capacitor?.Plugins?.GrowLegendsAds||null;
  if(!ads?.privacyStatus){btn.hidden=true;return}
  try{
    const st=await ads.privacyStatus();
    btn.hidden=!st?.privacyOptionsRequired;
  }catch(_){btn.hidden=true}
}

function v141BuildSettings(){
  let wrap=document.querySelector('#v141SettingsWrap');
  if(!wrap){
    wrap=document.createElement('div');
    wrap.id='v141SettingsWrap';
    wrap.innerHTML=`
      <button type="button" id="v141SettingsBtn"><span class="gear">⚙️</span><span>Einstellungen</span></button>
      <div id="v141SettingsMenu">
        <div class="v141-settings-head">
          <div><b>⚙️ Einstellungen</b><span>Grow Legends</span></div>
        </div>

        <label class="v141-setting-row">
          <span class="v141-setting-icon">🔊</span>
          <span class="v141-setting-copy"><b>Sound</b><span>Spielsounds ein- oder ausschalten.</span></span>
          <input class="v141-switch" id="v141Sound" type="checkbox">
        </label>

        <label class="v141-setting-row" id="v141PushRow">
          <span class="v141-setting-icon">📲</span>
          <span class="v141-setting-copy"><b>Handy-Push</b><span>Android-Benachrichtigungen für Quest, Growroom, Dungeon, PvP und Weltboss – auch außerhalb des Spiels.</span></span>
          <input class="v141-switch" id="v141PushNotifications" type="checkbox">
        </label>

        <label class="v141-setting-row">
          <span class="v141-setting-icon">✨</span>
          <span class="v141-setting-copy"><b>Grafik-Effekte</b><span>Glow und Animationen. Ausschalten spart Leistung.</span></span>
          <input class="v141-switch" id="v141Effects" type="checkbox">
        </label>

        <label class="v141-setting-row">
          <span class="v141-setting-icon">🔋</span>
          <span class="v141-setting-copy"><b>Energiesparmodus</b><span>Weniger Hintergrund-Aktualisierungen und GPU-Effekte. Spielmechanik und Kampfwerte bleiben gleich.</span></span>
          <input class="v141-switch" id="v6255EnergySaver" type="checkbox">
        </label>

        <div class="v141-account-box">
          <div class="mail" id="v141AccountMail"></div>
          <div class="cloud" id="v141CloudState"></div>
        </div>

        <div class="v141-settings-actions">
          <button type="button" class="btn secondary" id="v7216PrivacyAds" hidden>🛡️ Datenschutzoptionen</button>
          <button type="button" class="btn secondary" id="v141Logout">🚪 Abmelden</button>
          <button type="button" class="btn" id="v141Delete">🗑️ Account löschen</button>
        </div>

        <div class="v141-version-line" id="v141VersionLine">V4.29 Stable</div>
      </div>`;
  }

  const version=[...document.querySelectorAll('.version')][0];
  const power=[...document.querySelectorAll('header *,.topbar *,.header *')]
    .find(el=>/Kampfkraft/i.test(el.textContent||'') && el.children.length<=3);

  if(version){
    const row=version.parentElement;
    if(row && wrap.parentElement!==row){
      if(power && power.parentElement===row)row.insertBefore(wrap,power);
      else version.insertAdjacentElement('afterend',wrap);
    }
  }

  const btn=document.querySelector('#v141SettingsBtn');
  btn?.classList.toggle('show',!!(v073User && !v073User.is_anonymous));

  const menu=document.querySelector('#v141SettingsMenu');
  if(btn && !btn.dataset.bound){
    btn.dataset.bound='1';
    btn.onclick=e=>{
      e.stopPropagation();
      menu?.classList.toggle('open');
      v141RefreshSettingsUi();
    };
  }

  const sound=document.querySelector('#v141Sound');
  const pushNotifications=document.querySelector('#v141PushNotifications');
  const effects=document.querySelector('#v141Effects');
  const energySaver=document.querySelector('#v6255EnergySaver');

  if(sound && !sound.dataset.bound){
    sound.dataset.bound='1';
    sound.onchange=()=>{v141Settings.sound=sound.checked;v141SaveSettings()};
  }
  if(pushNotifications && !pushNotifications.dataset.bound){
    pushNotifications.dataset.bound='1';
    pushNotifications.onchange=()=>{
      v141Settings.pushNotifications=pushNotifications.checked;
      v141SaveSettings();
      if(typeof window.glSetPushEnabled==='function')void window.glSetPushEnabled(pushNotifications.checked);
    };
  }
  if(effects && !effects.dataset.bound){
    effects.dataset.bound='1';
    effects.onchange=()=>{v141Settings.effects=effects.checked;v141SaveSettings()};
  }
  if(energySaver && !energySaver.dataset.bound){
    energySaver.dataset.bound='1';
    energySaver.onchange=()=>{v141Settings.energySaver=energySaver.checked;v141SaveSettings()};
  }

  const privacyAds=document.querySelector('#v7216PrivacyAds');
  if(privacyAds && !privacyAds.dataset.bound){
    privacyAds.dataset.bound='1';
    privacyAds.onclick=async()=>{
      const ads=window.Capacitor?.Plugins?.GrowLegendsAds||null;
      if(!ads?.showPrivacyOptions){
        v063Toast?.('Datenschutzoptionen','info','Nur in der Android-App verfügbar.');
        return;
      }
      privacyAds.disabled=true;
      try{
        await ads.showPrivacyOptions();
        v063Toast?.('Datenschutzoptionen','success','Deine Werbe-Datenschutzeinstellungen wurden aktualisiert.');
      }catch(e){
        v063Toast?.('Datenschutzoptionen','error',e?.message||'Konnte nicht geöffnet werden.');
      }finally{
        privacyAds.disabled=false;
        void v7216RefreshPrivacyButton();
      }
    };
  }
  void v7216RefreshPrivacyButton();

  const logout=document.querySelector('#v141Logout');
  if(logout && !logout.dataset.bound){
    logout.dataset.bound='1';
    logout.onclick=()=>{
      menu?.classList.remove('open');
      v136Logout('manual');
    };
  }

  const del=document.querySelector('#v141Delete');
  if(del && !del.dataset.bound){
    del.dataset.bound='1';
    del.onclick=()=>{
      menu?.classList.remove('open');
      v141OpenDelete();
    };
  }

  v141RefreshSettingsUi();
}
function v141RefreshSettingsUi(){
  const sound=document.querySelector('#v141Sound');
  const pushNotifications=document.querySelector('#v141PushNotifications');
  const effects=document.querySelector('#v141Effects');
  const energySaver=document.querySelector('#v6255EnergySaver');
  if(sound)sound.checked=!!v141Settings.sound;
  if(pushNotifications)pushNotifications.checked=v141Settings.pushNotifications!==false;
  if(effects)effects.checked=!!v141Settings.effects;
  if(energySaver)energySaver.checked=!!v141Settings.energySaver;

  const mail=document.querySelector('#v141AccountMail');
  const cloud=document.querySelector('#v141CloudState');
  if(mail)mail.textContent=`Account: ${v141AccountEmail()}`;
  if(cloud)cloud.textContent=v141CloudText();
  void v7216RefreshPrivacyButton();
}

function v141OpenDelete(){
  const ov=document.querySelector('#v141DeleteOverlay');
  const input=document.querySelector('#v141DeleteInput');
  const confirm=document.querySelector('#v141DeleteConfirm');
  if(input)input.value='';
  if(confirm)confirm.disabled=true;
  ov?.classList.add('show');
  ov?.setAttribute('aria-hidden','false');
  setTimeout(()=>input?.focus(),80);
}
function v141CloseDelete(){
  document.querySelector('#v141DeleteOverlay')?.classList.remove('show');
  document.querySelector('#v141DeleteOverlay')?.setAttribute('aria-hidden','true');
}

async function v141DeleteAccessibleGameData(uid){
  const errs=[];

  const del=async(table,column)=>{
    try{
      const {error}=await v073Db.from(table).delete().eq(column,uid);
      if(error)errs.push(`${table}.${column}: ${error.message}`);
    }catch(e){errs.push(`${table}.${column}: ${e.message||e}`)}
  };

  /* Delete relations first, then profile/save. RLS decides what the user may delete. */
  await del('friend_requests','sender_id');
  await del('friend_requests','receiver_id');
  await del('pvp_attacks','attacker_id');
  await del('pvp_attacks','defender_id');
  await del('player_saves','user_id');
  await del('profiles','id');

  return errs;
}

async function v141DeleteAccount(){
  if(v141Deleting)return;
  const input=document.querySelector('#v141DeleteInput');
  const btn=document.querySelector('#v141DeleteConfirm');
  if(String(input?.value||'')!=='DELETE')return;
  if(!v073Db||!v073User||v073User.is_anonymous){
    v063Toast('Account-Löschung nicht möglich','error','Kein angemeldeter Account gefunden.');
    return;
  }

  v141Deleting=true;
  if(btn){btn.disabled=true;btn.textContent='Wird gelöscht…';}

  const uid=v073User.id;
  try{
    /* Secure server-side Auth deletion.
       Requires the supplied SQL RPC delete_my_account() to exist. */
    const {error:rpcError}=await v073Db.rpc('delete_my_account');

    if(rpcError){
      /* Do NOT pretend the Auth account was deleted if the secure RPC is absent. */
      console.error('delete_my_account RPC',rpcError);
      throw new Error(
        'Die sichere Account-Löschfunktion ist in Supabase noch nicht installiert. '
        +'Führe einmal die mitgelieferte V141_ACCOUNT_DELETE_SQL.sql aus.'
      );
    }

    /* RPC deletes auth user and game rows. Clean local state afterwards. */
    try{localStorage.removeItem(KEY)}catch(e){}
    try{localStorage.removeItem('growLegendsPlayerId')}catch(e){}
    try{sessionStorage.removeItem('growLegendsGoogleLoginPending')}catch(e){}

    v073User=null;
    v073Ready=false;
    v075CloudLoadedFor=null;

    v141CloseDelete();
    v075SetAuthMode('login');
    v075Overlay(true);

    if(typeof v063Toast==='function'){
      v063Toast('Account gelöscht','success','Account und Grow-Legends-Spielstand wurden dauerhaft entfernt.');
    }
  }catch(e){
    console.error('V4.02 account delete',e);
    if(typeof v063Toast==='function'){
      v063Toast('Account konnte nicht gelöscht werden','error',e?.message||'Unbekannter Fehler');
    }
  }finally{
    v141Deleting=false;
    if(btn){btn.textContent='Account endgültig löschen';btn.disabled=String(input?.value||'')!=='DELETE';}
  }
}

document.addEventListener('click',e=>{
  const wrap=document.querySelector('#v141SettingsWrap');
  if(wrap && !wrap.contains(e.target))document.querySelector('#v141SettingsMenu')?.classList.remove('open');
});

setTimeout(()=>{
  const input=document.querySelector('#v141DeleteInput');
  const confirm=document.querySelector('#v141DeleteConfirm');
  const cancel=document.querySelector('#v141DeleteCancel');

  if(input){
    input.addEventListener('input',()=>{
      if(confirm)confirm.disabled=input.value!=='DELETE';
    });
  }
  if(confirm)confirm.onclick=v141DeleteAccount;
  if(cancel)cancel.onclick=v141CloseDelete;
},0);

const v141BaseRender=render;
render=function(){
  const r=v141BaseRender();
  
  requestAnimationFrame(()=>{
    v141BuildSettings();
    v141ApplySettings();
  });
  return r;
};

setTimeout(()=>{
  v141BuildSettings();
  v141ApplySettings();
},220);
