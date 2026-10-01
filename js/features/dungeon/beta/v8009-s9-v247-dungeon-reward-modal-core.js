/* ===== V4.02 Dungeon reward presentation ===== */
function v247Esc(v){
  try{return typeof v240Esc==='function'?v240Esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  catch(_){return String(v??'')}
}

function v247EnsureDungeonReward(){
  let overlay=document.querySelector('#v247DungeonReward');
  if(overlay)return overlay;

  overlay=document.createElement('div');
  overlay.id='v247DungeonReward';

  overlay.innerHTML=`
    <div class="v231-quest-card">
      <div class="v231-quest-head">
        <div class="v231-quest-icon">⚔️</div>
        <div class="v231-quest-title">GEGNER BESIEGT</div>
        <div class="v231-quest-name" id="v247DungeonRewardName"></div>
      </div>

      <div class="v231-quest-loot">
        <div>
          <span>Erfahrung</span>
          <b id="v247DungeonRewardXp">+0</b>
        </div>
        <div>
          <span>Gold</span>
          <b id="v247DungeonRewardGold">+0</b>
        </div>
      </div>

      <div class="v247-dungeon-extra" id="v247DungeonRewardExtra"></div>

      <button type="button" class="btn" id="v247DungeonRewardOk">
        Belohnung bestätigen
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  return overlay;
}


function v247ReturnAfterDungeonReward(data){
  const overlay=document.querySelector('#v247DungeonReward');
  if(overlay)overlay.classList.remove('show');

  /*
    Boss completion returns to the 20-dungeon world because the dungeon
    is now permanently sealed. Normal victories return to its 10-room map.
  */
  if(data?.boss){
    try{
      v237ReturnToDungeonWorld();
    }catch(e){
      s.dungeon.layer='world';
      s.dungeon.view='map';
      try{v230ShowDungeonWorld()}catch(_){}
    }
    return;
  }

  s.dungeon.layer='dungeon';
  s.dungeon.view='map';

  const loot=document.querySelector('#loot');
  if(loot)loot.innerHTML='';

  /* V7.184: the dungeon receipt already committed and hydrated canonical
     server state. Re-persisting the whole historical client object here only
     wakes old save/render wrappers and makes the reward confirmation feel slow. */
  const serverOwned=!!window.v7081UseAuthority?.('dungeon');
  if(!serverOwned){try{persist(false)}catch(e){}}

  window.scrollTo({top:0,left:0,behavior:'auto'});
  requestAnimationFrame(()=>{
    try{
      if(typeof renderDungeon==='function')renderDungeon();
      else v244RenderSelectedDungeonMap();
    }catch(e){
      try{v244RenderSelectedDungeonMap()}catch(_){}
    }
  });
}


function v247ShowDungeonReward(data){
  try{window.v6111Sfx?.('reward')}catch(e){}
  const overlay=v247EnsureDungeonReward();
  overlay.classList.remove('v587-defeat');

  const icon=overlay.querySelector('.v231-quest-icon');
  const title=overlay.querySelector('.v231-quest-title');
  const name=overlay.querySelector('#v247DungeonRewardName');
  const xp=overlay.querySelector('#v247DungeonRewardXp');
  const gold=overlay.querySelector('#v247DungeonRewardGold');
  const extra=overlay.querySelector('#v247DungeonRewardExtra');
  const ok=overlay.querySelector('#v247DungeonRewardOk');

  if(icon)icon.textContent=data?.boss?'👑':'⚔️';
  if(title){
    title.textContent=data?.title
      ||(data?.boss?'DUNGEON ABGESCHLOSSEN':'GEGNER BESIEGT');
  }

  const dungeon=dungeons?.[Number(data?.dungeonIndex)];
  const enemy=data?.enemy;

  if(name){
    name.textContent=data?.boss
      ?`${dungeon?.name||'Dungeon'} · ${enemy?.name||'Boss'}`
      :`${enemy?.name||'Gegner'} · Dungeon ${Number(data?.dungeonIndex)+1}`;
  }

  if(xp){
    xp.textContent=`+${Math.max(0,Number(data?.xp)||0)}`;
  }

  if(gold){
    gold.textContent=`+${Math.max(0,Number(data?.gold)||0)}`;
  }

  const rows=[];

  if(data?.boss){
    rows.push(`
      <div class="v247-dungeon-line v247-boss">
        ${v247Esc(data?.bossRewardText||'🟠 Boss-Belohnung · garantiert 1 legendäres Klassenitem')}
      </div>
    `);
  }

  if(data?.item){
    try{
      rows.push(v240ItemRewardHtml(data.item));
    }catch(e){
      rows.push(`
        <div class="v247-dungeon-line">
          🎁 ${v247Esc(data.item.name||'Item gefunden')}
        </div>
      `);
    }
  }else if(!data?.boss){
    rows.push(`
      <div class="v247-dungeon-line">
        Keine zusätzliche Item-Beute gefunden.
      </div>
    `);
  }

  if(Number(data?.harz)>0){
    rows.push(`
      <div class="v247-dungeon-line v247-harz">
        🟢 +${Number(data.harz)} Harz-Taler
      </div>
    `);
  }
  if(Number(data?.fragments)>0){
    rows.push(`<div class="v247-dungeon-line">💠 +${Number(data.fragments)} Fragmente</div>`);
  }
  if(data?.seedLabel){
    rows.push(`<div class="v247-dungeon-line">🌰 Samen gefunden: ${v247Esc(data.seedLabel)}</div>`);
  }
  if(data?.petLabel){
    rows.push(`<div class="v247-dungeon-line">🐾 Pet gefunden: ${v247Esc(data.petLabel)}</div>`);
  }
  if(data?.guildXpHtml){
    rows.push(String(data.guildXpHtml));
  }

  if(data?.boss){
    rows.push(`
      <div class="v247-dungeon-line v247-complete">
        ⛓️ Dungeon abgeschlossen · Eingang dauerhaft versiegelt
      </div>
    `);
  }

  if(extra){
    extra.innerHTML=rows.join('');
  }

  if(ok){
    ok.textContent=data?.boss
      ?'Belohnung bestätigen · Zur Dungeon-Karte'
      :'Belohnung bestätigen · Zur 10er-Karte';

    ok.onclick=()=>{
      v247ReturnAfterDungeonReward(data);
    };
  }

  overlay.classList.add('show');

  try{
    renderInventory();
    v240RepairInventoryRarity();
  }catch(e){}
}
