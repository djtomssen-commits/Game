/* ===== V4.02 Admin player value editor ===== */
let v103SelectedPlayer=null;

function v103InstallPlayerAdmin(){
  const adminContent=document.querySelector('#v093AdminContent');
  if(!adminContent || document.querySelector('#v103PlayerAdmin'))return;

  const card=document.createElement('div');
  card.className='card';
  card.id='v103PlayerAdmin';
  card.style.margin='12px 0 0';
  card.innerHTML=`
    <div class="section-title">
      <div>
        <h3>👥 Spieler verwalten</h3>
        <div class="muted">Cloud-Spielstand eines Spielers bearbeiten.</div>
      </div>
    </div>

    <div class="v103-player-search">
      <input id="v103PlayerSearch" class="v093-input" placeholder="Charaktername suchen">
      <button class="btn" id="v103PlayerSearchBtn">Suchen</button>
    </div>

    <div id="v103PlayerResults" class="v103-player-results"></div>

    <div id="v103PlayerEditor" class="v103-editor">
      <div class="v103-player-head">
        <b id="v103PlayerName">Spieler</b>
        <div id="v103PlayerMeta"></div>
      </div>

      <div class="v103-editor-grid">
        <div>
          <label class="v093-label">Level</label>
          <input id="v103Level" class="v093-input" type="number" min="1" max="999">
        </div>
        <div>
          <label class="v093-label">EXP</label>
          <input id="v103Xp" class="v093-input" type="number" min="0">
        </div>
        <div>
          <label class="v093-label">Gold</label>
          <input id="v103Gold" class="v093-input" type="number" min="0">
        </div>
        <div>
          <label class="v093-label">Harz-Taler</label>
          <input id="v103Harz" class="v093-input" type="number" min="0">
        </div>
        <div>
          <label class="v093-label">Dampf</label>
          <input id="v103Energy" class="v093-input" type="number" min="0" max="300">
        </div>
        <div>
          <label class="v093-label">Attributpunkte</label>
          <input id="v103Points" class="v093-input" type="number" min="0">
        </div>
        <div>
          <label class="v093-label">Talentpunkte</label>
          <input id="v103SkillPoints" class="v093-input" type="number" min="0">
        </div>
      </div>

      <button class="btn gold" id="v103SavePlayer" style="width:100%;margin-top:10px">
        Spielerwerte speichern
      </button>

      <div class="v103-warning">
        Änderungen werden im Cloud-Spielstand gespeichert. Ist der Spieler gerade online,
        sollte er danach das Spiel neu laden, damit sein lokaler Stand die Admin-Änderung
        nicht wieder überschreibt.
      </div>
    </div>`;

  adminContent.appendChild(card);

  document.querySelector('#v103PlayerSearchBtn').onclick=v103SearchPlayers;
  document.querySelector('#v103PlayerSearch').addEventListener('keydown',e=>{
    if(e.key==='Enter')v103SearchPlayers();
  });
  document.querySelector('#v103SavePlayer').onclick=v103SavePlayer;
}

async function v103SearchPlayers(){
  if(!v093IsAdmin)return;

  const q=document.querySelector('#v103PlayerSearch')?.value.trim()||'';
  const box=document.querySelector('#v103PlayerResults');
  if(!box)return;

  box.innerHTML='<div class="v072-empty">Spieler werden gesucht...</div>';

  const {data,error}=await v073Db.rpc('admin_search_players',{search_text:q});

  if(error){
    console.error(error);
    box.innerHTML='<div class="v072-status-offline">Spielersuche fehlgeschlagen. Admin-SQL ausführen.</div>';
    return;
  }

  const rows=Array.isArray(data)?data:[];
  box.innerHTML=rows.length?rows.map((p,i)=>`
    <button class="v103-player-result" data-v103-player="${v093Esc(p.user_id)}">
      <b>${v093Esc(p.character_name||'Unbenannt')}</b>
      <span>${v093Esc(p.class_name||'')} · Level ${Number(p.level)||1} · ${v093Esc(p.user_id).slice(0,8)}</span>
    </button>
  `).join(''):'<div class="v072-empty">Kein Spieler gefunden.</div>';

  box.querySelectorAll('[data-v103-player]').forEach(btn=>{
    btn.onclick=()=>v103LoadPlayer(btn.dataset.v103Player,btn);
  });
}

async function v103LoadPlayer(userId,button=null){
  if(!v093IsAdmin)return;

  const {data,error}=await v073Db.rpc('admin_get_player_values',{target_user:userId});

  if(error){
    console.error(error);
    return v063Toast('Spieler konnte nicht geladen werden','error',error.message);
  }

  const p=Array.isArray(data)?data[0]:data;
  if(!p)return v063Toast('Kein Cloud-Spielstand gefunden','warn');

  v103SelectedPlayer=p;

  document.querySelectorAll('.v103-player-result').forEach(x=>x.classList.remove('active'));
  button?.classList.add('active');

  document.querySelector('#v103PlayerName').textContent=p.character_name||'Spieler';
  document.querySelector('#v103PlayerMeta').textContent=`${p.class_name||''} · Spieler-ID ${String(p.user_id).slice(0,8)}`;

  document.querySelector('#v103Level').value=Number(p.level)||1;
  document.querySelector('#v103Xp').value=Number(p.xp)||0;
  document.querySelector('#v103Gold').value=Number(p.gold)||0;
  document.querySelector('#v103Harz').value=Number(p.harz_taler)||0;
  document.querySelector('#v103Energy').value=Number(p.energy)||0;
  document.querySelector('#v103Points').value=Number(p.points)||0;
  document.querySelector('#v103SkillPoints').value=Number(p.skill_points)||0;

  document.querySelector('#v103PlayerEditor').classList.add('show');
}

function v103Number(id,min=0,max=2147483647){
  let n=Math.floor(Number(document.querySelector(id)?.value)||0);
  return Math.max(min,Math.min(max,n));
}

async function v103SavePlayer(){
  if(!v093IsAdmin || !v103SelectedPlayer)return;

  const payload={
    target_user:v103SelectedPlayer.user_id,
    new_level:v103Number('#v103Level',1,999),
    new_xp:v103Number('#v103Xp',0,2000000000),
    new_gold:v103Number('#v103Gold',0,2000000000),
    new_harz_taler:v103Number('#v103Harz',0,2000000000),
    new_energy:v103Number('#v103Energy',0,300),
    new_points:v103Number('#v103Points',0,2000000000),
    new_skill_points:v103Number('#v103SkillPoints',0,2000000000)
  };

  if(!confirm(
    `Spielerwerte für ${v103SelectedPlayer.character_name} wirklich ändern?\n\n`+
    `Level ${payload.new_level}\nGold ${payload.new_gold}\nHarz-Taler ${payload.new_harz_taler}`
  ))return;

  const {data,error}=await v073Db.rpc('admin_update_player_values',payload);

  if(error){
    console.error(error);
    return v063Toast('Änderung fehlgeschlagen','error',error.message);
  }

  v063Toast('Spielerwerte gespeichert','success',`${v103SelectedPlayer.character_name} wurde aktualisiert.`);

  await v103LoadPlayer(v103SelectedPlayer.user_id);
  try{await v073LoadRanking()}catch(e){}
}

const v103OldAdminLoad=v093AdminLoadLists;
v093AdminLoadLists=async function(){
  const result=await v103OldAdminLoad();
  v103InstallPlayerAdmin();
  return result;
};

/* v093AdminLoadLists is the direct owner for installing the player editor. */

try{
  if(v093IsAdmin)v103InstallPlayerAdmin();
}catch(e){console.error('V4.02 player admin',e)}
