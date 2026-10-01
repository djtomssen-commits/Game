/* ===== V4.02 settings account actions repair ===== */

function v225EnsureSettingsAccountActions(){
  const menu=document.querySelector('#v141SettingsMenu');
  if(!menu)return false;

  let accountBox=menu.querySelector('.v141-account-box');

  if(!accountBox){
    accountBox=document.createElement('div');
    accountBox.className='v141-account-box';
    accountBox.innerHTML=`
      <div class="mail" id="v141AccountMail"></div>
      <div class="cloud" id="v141CloudState"></div>
    `;

    const version=menu.querySelector('.v141-version-line');
    if(version)menu.insertBefore(accountBox,version);
    else menu.appendChild(accountBox);
  }

  let actions=menu.querySelector('.v141-settings-actions');

  if(!actions){
    actions=document.createElement('div');
    actions.className='v141-settings-actions';
    actions.innerHTML=`
      <button type="button" class="btn secondary" id="v141Logout">
        🚪 Abmelden
      </button>
      <button type="button" class="btn" id="v141Delete">
        🗑️ Account löschen
      </button>
    `;

    const version=menu.querySelector('.v141-version-line');
    if(version)menu.insertBefore(actions,version);
    else menu.appendChild(actions);
  }

  let version=menu.querySelector('#v141VersionLine');

  if(!version){
    version=document.createElement('div');
    version.className='v141-version-line';
    version.id='v141VersionLine';
    menu.appendChild(version);
  }

  version.textContent='V4.29 Stable';

  const logout=menu.querySelector('#v141Logout');
  if(logout){
    logout.dataset.bound='1';
    logout.onclick=()=>{
      menu.classList.remove('open');

      if(typeof v136Logout==='function'){
        v136Logout('manual');
      }else if(v073Db?.auth){
        v073Db.auth.signOut();
      }
    };
  }

  const del=menu.querySelector('#v141Delete');
  if(del){
    del.dataset.bound='1';
    del.onclick=()=>{
      menu.classList.remove('open');

      if(typeof v141OpenDelete==='function'){
        v141OpenDelete();
      }else{
        v063Toast(
          'Account löschen nicht verfügbar',
          'error',
          'Die Löschfunktion konnte nicht geladen werden.'
        );
      }
    };
  }

  return true;
}


/*
  Wrap the final current settings builder.
  It may reuse an existing wrapper, so repair actions every time.
*/
const v225BaseBuildSettings=v141BuildSettings;
v141BuildSettings=function(){
  const r=v225BaseBuildSettings();

  v225EnsureSettingsAccountActions();

  try{v141RefreshSettingsUi()}catch(e){}

  return r;
};


/*
  Also repair existing already-built menu immediately.
*/
setTimeout(()=>{
  try{
    v141BuildSettings();
    v225EnsureSettingsAccountActions();
  }catch(e){
    console.warn('V4.02 settings repair',e);
  }
},250);


setTimeout(()=>{
  document.querySelectorAll('.version')
    .forEach(el=>el.textContent='V4.29 Stable');
},300);
