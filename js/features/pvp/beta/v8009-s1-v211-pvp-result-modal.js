
/* ===== V4.02 PvP result confirmation ===== */

let v211ResultOpen=false;

function v211EnsureResultUi(){
  if(document.querySelector('#v211PvpResultOverlay'))return;

  const overlay=document.createElement('div');
  overlay.id='v211PvpResultOverlay';
  overlay.innerHTML=`
    <div class="v211-result-card" id="v211PvpResultCard">
      <div class="v211-result-head">
        <div class="v211-result-icon" id="v211ResultIcon">🏆</div>
        <div class="v211-result-title" id="v211ResultTitle">SIEG</div>
        <div class="v211-result-sub" id="v211ResultSub"></div>
      </div>

      <div class="v211-loot">
        <div class="v211-loot-title">🎁 BELOHNUNG</div>

        <div class="v211-loot-grid">
          <div class="v211-loot-item">
            <span>Gold</span>
            <b id="v211LootGold">+0</b>
          </div>

          <div class="v211-loot-item">
            <span>Erfahrung</span>
            <b id="v211LootXp">+0</b>
          </div>

          <div class="v211-loot-item buds">
            <span>PvP-Buds</span>
            <b id="v211LootBuds">+0</b>
          </div>
        </div>
      </div>

      <button type="button" class="btn" id="v211PvpResultConfirm">
        Bestätigen
      </button>
    </div>`;

  document.body.appendChild(overlay);

  document.querySelector('#v211PvpResultConfirm').onclick=async()=>{
    if(!v211ResultOpen)return;

    v211ResultOpen=false;
    overlay.classList.remove('show');

    /*
      Battle overlay must be closed only AFTER result confirmation.
    */
    document.querySelector('#v209PvpBattleOverlay')?.classList.remove('show');

    v204Opponent=null;
    v204BattleBusy=false;

    /*
      Explicitly return through central navigation.
    */
    v032Go('pvp');

    try{
      v204CooldownLeft=await v204LoadCooldown();
      await v204RefreshStats();
    }catch(e){
      console.warn('V4.02 PvP return refresh',e);
    }

    window.scrollTo({top:0,behavior:'auto'});
  };
}

function v211ShowResult(win,enemy,gold,xp,buds){
  v211EnsureResultUi();

  const overlay=document.querySelector('#v211PvpResultOverlay');
  const card=document.querySelector('#v211PvpResultCard');

  card.className=`v211-result-card ${win?'win':'loss'}`;

  document.querySelector('#v211ResultIcon').textContent=win?'🏆':'💀';
  document.querySelector('#v211ResultTitle').textContent=win?'SIEG':'NIEDERLAGE';

  document.querySelector('#v211ResultSub').textContent=win
    ?`${enemy.character_name} wurde besiegt.`
    :`${enemy.character_name} hat den Kampf gewonnen.`;

  document.querySelector('#v211LootGold').textContent=`+${Math.max(0,Number(gold)||0)}`;
  document.querySelector('#v211LootXp').textContent=`+${Math.max(0,Number(xp)||0)}`;
  document.querySelector('#v211LootBuds').textContent=win
    ?`+${Math.max(0,Number(buds)||0)}`
    :'0';

  /*
    Important on mobile:
    make result visible independent of scroll position inside battle overlay.
  */
  v211ResultOpen=true;
  overlay.classList.add('show');
}

/* V8.009: superseded v209FinishBattle payout implementation retired.
   v216 is the sole legacy finish-flow owner; v211 only owns result UI. */

/*
  If an old result box from V4.02 exists, keep it hidden.
  V4.02 uses a fixed overlay so it cannot sit below the fold.
*/
function v211HideOldBattleResult(){
  const old=document.querySelector('#v209BattleResult');
  if(old){
    old.className='v209-result';
    old.style.display='none';
  }
}

const v211BaseOpenBattle=v209OpenBattle;
v209OpenBattle=function(enemy){
  v211EnsureResultUi();

  const result=v211BaseOpenBattle(enemy);

  v211ResultOpen=false;
  document.querySelector('#v211PvpResultOverlay')?.classList.remove('show');

  v211HideOldBattleResult();

  return result;
};

/* V7.113: retired render wrapper whose only job was an obsolete version paint. */

queueMicrotask(()=>{v211EnsureResultUi();v211HideOldBattleResult()});
