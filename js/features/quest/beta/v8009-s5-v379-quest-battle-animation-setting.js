(function(){
  const VERSION='V4.29 Stable';

  /* Existing users get the current behavior by default: animation ON. */
  if(typeof v141Settings==='object' &&
     typeof v141Settings.questBattleAnimation!=='boolean'){
    v141Settings.questBattleAnimation=true;
    try{localStorage.setItem(V141_SETTINGS_KEY,JSON.stringify(v141Settings))}catch(e){}
  }

  function v379EnsureSettingRow(){
    const menu=document.querySelector('#v141SettingsMenu');
    if(!menu)return;

    let row=document.querySelector('#v379QuestBattleRow');
    if(!row){
      row=document.createElement('label');
      row.id='v379QuestBattleRow';
      row.className='v141-setting-row';
      row.innerHTML=`
        <span class="v141-setting-icon">⚔️</span>
        <span class="v141-setting-copy">
          <b>Kampfanimation nach Quest</b>
          <span>Zeigt vor der Quest-Belohnung den kurzen Kampf gegen den Quest-Gegner.</span>
        </span>
        <input class="v141-switch" id="v379QuestBattleToggle" type="checkbox">
      `;

      const account=menu.querySelector('.v141-account-box');
      if(account)menu.insertBefore(row,account);
      else{
        const actions=menu.querySelector('.v141-settings-actions');
        if(actions)menu.insertBefore(row,actions);
        else menu.appendChild(row);
      }
    }

    const toggle=document.querySelector('#v379QuestBattleToggle');
    if(toggle && toggle.dataset.bound!=='1'){
      toggle.dataset.bound='1';
      toggle.onchange=()=>{
        v141Settings.questBattleAnimation=!!toggle.checked;
        try{v141SaveSettings()}catch(e){
          try{localStorage.setItem(V141_SETTINGS_KEY,JSON.stringify(v141Settings))}catch(_){}
        }
      };
    }
    if(toggle)toggle.checked=v141Settings.questBattleAnimation!==false;
  }

  /* Keep the switch present whenever the existing settings builder runs. */
  const baseBuild=v141BuildSettings;
  v141BuildSettings=function(){
    const r=baseBuild.apply(this,arguments);
    v379EnsureSettingRow();
    return r;
  };

  const baseRefresh=v141RefreshSettingsUi;
  v141RefreshSettingsUi=function(){
    const r=baseRefresh.apply(this,arguments);
    v379EnsureSettingRow();
    const toggle=document.querySelector('#v379QuestBattleToggle');
    if(toggle)toggle.checked=v141Settings.questBattleAnimation!==false;
    return r;
  };

  /*
    V4.02 owns the post-quest finale. Do not bypass its reward wrapper.
    When disabled, only the visual fight resolves immediately; the exact same
    canonical payout path then continues, including Harz, Elite loot, items,
    keys, achievements and reward popup.
  */
  const baseQuestFight=v311PlayFight;
  v311PlayFight=async function(q){
    if(v141Settings.questBattleAnimation===false)return;
    return baseQuestFight.apply(this,arguments);
  };

  v379EnsureSettingRow();

  document.querySelectorAll(
    '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
  ).forEach(el=>{if(el)el.textContent=VERSION});
  document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11');

  setTimeout(v379EnsureSettingRow,300);
})();
