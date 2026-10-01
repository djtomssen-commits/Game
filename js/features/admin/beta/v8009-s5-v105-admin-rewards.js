/* ===== V4.02 Admin rewards ===== */
function v105InstallRewards(){
  const editor=document.querySelector('#v103PlayerEditor');
  if(!editor || document.querySelector('#v105Rewards'))return;

  const box=document.createElement('div');
  box.id='v105Rewards';
  box.className='v105-rewards';
  box.innerHTML=`
    <div class="section-title">
      <div>
        <h3>🎁 Belohnung senden</h3>
        <div class="muted">Wird zum bestehenden Spielstand addiert.</div>
      </div>
    </div>

    <div class="v105-reward-grid">
      <div>
        <label class="v093-label">Gold</label>
        <input id="v105RewardGold" class="v093-input" type="number" min="0" value="0">
      </div>
      <div>
        <label class="v093-label">Harz-Taler</label>
        <input id="v105RewardHarz" class="v093-input" type="number" min="0" value="0">
      </div>
      <div>
        <label class="v093-label">Legendäre Samen</label>
        <input id="v105RewardSeeds" class="v093-input" type="number" min="0" value="0">
      </div>
    </div>

    <button id="v105SendReward" class="btn gold" style="width:100%;margin-top:10px">
      🎁 Belohnung senden
    </button>

    <div class="v105-reward-note">
      Die Werte werden addiert, nicht ersetzt. Der Spieler erhält die Änderung über die
      Cloud-Synchronisierung aus V4.02.
    </div>`;

  editor.appendChild(box);
  document.querySelector('#v105SendReward').onclick=v105SendReward;
}

async function v105SendReward(){
  if(!v093IsAdmin || !v103SelectedPlayer)return;

  const gold=v103Number('#v105RewardGold',0,2000000000);
  const harz=v103Number('#v105RewardHarz',0,2000000000);
  const seeds=v103Number('#v105RewardSeeds',0,1000000);

  if(gold===0 && harz===0 && seeds===0){
    return v063Toast('Keine Belohnung gewählt','warn','Trage mindestens einen Wert ein.');
  }

  if(!confirm(
    `Belohnung an ${v103SelectedPlayer.character_name} senden?\n\n`+
    `Gold: +${gold}\nHarz-Taler: +${harz}\nLegendäre Samen: +${seeds}`
  ))return;

  const {data,error}=await v073Db.rpc('admin_grant_player_reward',{
    target_user:v103SelectedPlayer.user_id,
    add_gold:gold,
    add_harz_taler:harz,
    add_legendary_seeds:seeds
  });

  if(error){
    console.error(error);
    return v063Toast('Belohnung fehlgeschlagen','error',error.message);
  }

  document.querySelector('#v105RewardGold').value=0;
  document.querySelector('#v105RewardHarz').value=0;
  document.querySelector('#v105RewardSeeds').value=0;

  v063Toast(
    '🎁 Belohnung gesendet',
    'success',
    `${v103SelectedPlayer.character_name} erhält die Belohnung.`
  );

  await v103LoadPlayer(v103SelectedPlayer.user_id);
}

const v105OldInstallPlayerAdmin=v103InstallPlayerAdmin;
v103InstallPlayerAdmin=function(){
  v105OldInstallPlayerAdmin();
  v105InstallRewards();
};

/* Player-admin installation is the only lifecycle owner for rewards.
   No global render hook: v103InstallPlayerAdmin() installs this surface exactly once. */
try{if(v093IsAdmin){v103InstallPlayerAdmin();v105InstallRewards()}}catch(e){}
