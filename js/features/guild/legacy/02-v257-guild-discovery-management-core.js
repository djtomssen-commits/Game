/* === v257-guild-discovery-management-core === */
/* ===== V4.02 Guild discovery / applications / management ===== */
let v257Requests=[];

function v257CanManage(){
  return ['leader','officer'].includes(v254Membership?.role);
}
function v257IsLeader(){
  return v254Membership?.role==='leader';
}
function v257GuildResultHtml(g){
  const members=Number(g.member_count)||0;
  const max=Number(g.max_members)||20;
  const pending=!!g.request_pending;
  const locked=typeof v6124GuildLockActive==='function'&&v6124GuildLockActive();
  return `<div class="v257-guild-result">
    <div>
      <b><span class="v257-result-tag">[${v254GuildEsc(g.tag||'GL')}]</span>${v254GuildEsc(g.name||'Gilde')}</b>
      <small>👥 ${members}/${max} · ⭐ EXP +${v254BonusPct(g.xp_level)}% · 💰 Gold +${v254BonusPct(g.gold_level)}%</small>
    </div>
    <button type="button" class="btn secondary" data-v257-apply="${g.id}" ${locked||pending||members>=max?'disabled':''}>
      ${locked?`⏳ Gesperrt · ${v6124GuildLockText()}`:pending?'✓ Anfrage gesendet':members>=max?'Gilde voll':'Beitritt anfragen'}
    </button>
  </div>`;
}

async function v257SearchGuilds(){
  const box=document.querySelector('#v257GuildSearchResults');
  if(!box)return;
  if(!(await v254EnsureOnline())){
    box.innerHTML='<div class="v257-search-empty">Für die Gildensuche musst du eingeloggt sein.</div>';
    return;
  }
  const q=String(document.querySelector('#v257GuildSearchInput')?.value||'').trim();
  box.innerHTML='<div class="v257-search-empty">Gilden werden gesucht …</div>';
  const {data,error}=await v073Db.rpc('v257_search_guilds',{p_query:q});
  if(error){
    box.innerHTML=`<div class="v257-search-empty">${v254GuildEsc(error.message||'Suche fehlgeschlagen')}</div>`;
    return;
  }
  const rows=Array.isArray(data)?data:[];
  box.innerHTML=rows.length?rows.map(v257GuildResultHtml).join(''):'<div class="v257-search-empty">Keine passende Gilde gefunden.</div>';
  box.querySelectorAll('[data-v257-apply]').forEach(btn=>{
    btn.onclick=()=>v257ApplyGuild(btn.dataset.v257Apply);
  });
}

async function v257ApplyGuild(guildId){
  if(typeof v6124GuildLockActive==='function'&&v6124GuildLockActive()){
    v6124PaintGuildLock?.();
    return v063Toast('24h Gildensperre aktiv','warn',`Beitritt wieder in ${v6124GuildLockText()} möglich.`);
  }
  if(!(await v254EnsureOnline()))return;
  const {error}=await v073Db.rpc('v257_apply_to_guild',{p_guild:guildId});
  if(error)return v063Toast('Beitrittsanfrage fehlgeschlagen','warn',error.message||'');
  v063Toast('Anfrage gesendet','success','Die Gildenleitung kann deine Bewerbung jetzt annehmen.');
  await v257SearchGuilds();
}

async function v257LoadRequests(){
  v257Requests=[];
  if(!v254Guild||!v257CanManage())return v257RenderRequests();
  const {data,error}=await v073Db.rpc('v257_get_guild_requests');
  if(error){
    console.error('V4.02 request load',error);
    return v257RenderRequests();
  }
  v257Requests=Array.isArray(data)?data:[];
  v257RenderRequests();
}

function v257RenderRequests(){
  const card=document.querySelector('#v257RequestsCard');
  const list=document.querySelector('#v257GuildRequests');
  const count=document.querySelector('#v257RequestCount');
  if(!card||!list)return;
  card.style.display=v257CanManage()?'':'none';
  if(count)count.textContent=String(v257Requests.length);
  list.innerHTML=v257Requests.length?v257Requests.map(r=>`
    <div class="v257-request">
      <div><b>${v254GuildEsc(r.character_name||'Spieler')}</b><small>${v254GuildEsc(r.class_name||'')} · Lv. ${Number(r.level)||1} · Kampfkraft ${Number(r.combat_power)||0}</small></div>
      <div class="v257-request-actions">
        <button class="v257-mini good" data-v257-accept="${r.id}">✓ Annehmen</button>
        <button class="v257-mini bad" data-v257-reject="${r.id}">✕ Ablehnen</button>
      </div>
    </div>`).join(''):'';

  list.querySelectorAll('[data-v257-accept]').forEach(b=>b.onclick=()=>v257HandleRequest(b.dataset.v257Accept,true));
  list.querySelectorAll('[data-v257-reject]').forEach(b=>b.onclick=()=>v257HandleRequest(b.dataset.v257Reject,false));
}

async function v257HandleRequest(requestId,accept){
  const requestRow=Array.isArray(v257Requests)?v257Requests.find(r=>String(r?.id||'')===String(requestId||'')):null;
  const joinedName=String(requestRow?.character_name||'Spieler').trim().slice(0,40)||'Spieler';
  const guildIdBefore=String(v254Guild?.id||v254Membership?.guild_id||'');
  const {error}=await v073Db.rpc('v257_handle_guild_request',{p_request:requestId,p_accept:accept});
  if(error)return v063Toast('Aktion fehlgeschlagen','warn',error.message||'');
  if(accept&&guildIdBefore){
    try{
      const uid=String(v073User?.id||'');
      if(uid&&v073Db){
        const {error:chatError}=await v073Db.from('guild_chat_messages').insert({guild_id:guildIdBefore,user_id:uid,character_name:joinedName,body:'ist der Gilde beigetreten.'});
        if(chatError)console.warn('V5.27 legacy guild join chat message',chatError);
      }
    }catch(chatError){console.warn('V5.27 legacy guild join chat message',chatError)}
  }
  v063Toast(accept?'Mitglied aufgenommen':'Anfrage abgelehnt','success');
  await v254LoadGuild();
  await v257LoadRequests();
}

function v257RenderManagement(){
  const box=document.querySelector('#v257GuildManagement');
  if(!box)return;
  if(!v254Guild||!v254Membership){box.innerHTML='';return}

  if(v257IsLeader()){
    const others=v254Members.filter(m=>m.user_id!==v073User?.id);
    box.innerHTML=`
      <div class="v257-management-note">Als Anführer kannst du Mitglieder verwalten, Rollen ändern und die Führung übertragen.<br>Die Gilde kann hier auch aufgelöst werden.</div>
      <div class="v257-leader-actions">
        ${others.length?`<div class="v257-transfer-row"><select id="v257TransferTarget">${others.map(m=>{const p=m.profile||{};return `<option value="${m.user_id}">${v254GuildEsc(p.character_name||'Spieler')}</option>`}).join('')}</select><button class="btn secondary" id="v257TransferBtn">Führung übertragen</button></div>`:''}
        <button class="btn v257-danger" id="v257DisbandBtn">🗑️ Gilde auflösen</button>
      </div>`;
    document.querySelector('#v257TransferBtn')?.addEventListener('click',v257TransferLeadership);
    document.querySelector('#v257DisbandBtn')?.addEventListener('click',v257DisbandGuild);
  }else{
    box.innerHTML=`<div class="v257-management-note">Wenn du die Gilde verlässt, verlierst du sofort ihre aktiven EXP-/Gold-Boni.</div><button class="btn v257-danger" id="v257LeaveBtn">🚪 Gilde verlassen</button>`;
    document.querySelector('#v257LeaveBtn')?.addEventListener('click',v257LeaveGuild);
  }

  /* Add role/kick actions directly to rendered member rows for managers. */
  if(v257CanManage()){
    const rows=[...document.querySelectorAll('#v254GuildMembers .v254-member')];
    rows.forEach((row,i)=>{
      const m=v254Members[i];
      if(!m||m.user_id===v073User?.id)return;
      let actions=row.querySelector('.v257-member-actions');
      if(!actions){
        actions=document.createElement('div');
        actions.className='v257-member-actions';
        row.appendChild(actions);
      }
      const role=m.role||'member';
      actions.innerHTML=`
        ${v257IsLeader()?`<button class="v257-mini" data-v257-role="${m.user_id}" data-role="${role==='officer'?'member':'officer'}">${role==='officer'?'Zu Mitglied':'Zum Offizier'}</button>`:''}
        <button class="v257-mini bad" data-v257-kick="${m.user_id}">Entfernen</button>`;
    });
    document.querySelectorAll('[data-v257-role]').forEach(b=>b.onclick=()=>v257SetRole(b.dataset.v257Role,b.dataset.role));
    document.querySelectorAll('[data-v257-kick]').forEach(b=>b.onclick=()=>v257KickMember(b.dataset.v257Kick));
  }
}

async function v257LeaveGuild(){
  if(!confirm('Gilde wirklich verlassen?\n\nDanach gilt eine 24-Stunden-Gildensperre. In dieser Zeit kannst du keiner anderen Gilde beitreten und keine neue Gilde gründen.'))return;
  const {error}=await v073Db.rpc('v257_leave_guild');
  if(error)return v063Toast('Gilde konnte nicht verlassen werden','warn',error.message||'');

  v6124StartGuildLock();
  v063Toast('Gilde verlassen','success','24h Gildensperre aktiviert.');

  v254Guild=null;v254Membership=null;v254Members=[];
  v254RenderGuild();
  await v257SearchGuilds();
  v6124PaintGuildLock();
}
async function v257KickMember(userId){
  if(!confirm('Dieses Mitglied wirklich aus der Gilde entfernen?'))return;
  const {error}=await v073Db.rpc('v257_kick_guild_member',{p_user:userId});
  if(error)return v063Toast('Mitglied konnte nicht entfernt werden','warn',error.message||'');
  v063Toast('Mitglied entfernt','success');
  await v254LoadGuild();
}
async function v257SetRole(userId,role){
  const {error}=await v073Db.rpc('v257_set_guild_role',{p_user:userId,p_role:role});
  if(error)return v063Toast('Rolle konnte nicht geändert werden','warn',error.message||'');
  v063Toast('Gildenrolle geändert','success');
  await v254LoadGuild();
}
async function v257TransferLeadership(){
  const userId=document.querySelector('#v257TransferTarget')?.value;
  if(!userId||!confirm('Führung wirklich an dieses Mitglied übertragen?'))return;
  const {error}=await v073Db.rpc('v257_transfer_guild_leadership',{p_user:userId});
  if(error)return v063Toast('Führung konnte nicht übertragen werden','warn',error.message||'');
  v063Toast('Führung übertragen','success');
  await v254LoadGuild();
}
async function v257DisbandGuild(){
  if(!confirm('Gilde wirklich endgültig auflösen? Alle Mitglieder werden entfernt.'))return;
  if(!confirm('Letzte Bestätigung: Gilde auflösen?'))return;
  const {error}=await v073Db.rpc('v257_disband_guild');
  if(error)return v063Toast('Gilde konnte nicht aufgelöst werden','warn',error.message||'');
  v063Toast('Gilde aufgelöst','success');
  v254Guild=null;v254Membership=null;v254Members=[];
  v254RenderGuild();
  await v257SearchGuilds();
}

/* Integrate with existing V4.02 loader/render without adding another render() owner. */
const v257BaseLoadGuild=v254LoadGuild;
v254LoadGuild=async function(){
  await v257BaseLoadGuild();
  if(v254Guild){
    await v257LoadRequests();
    v257RenderManagement();
  }else{
    v257RenderRequests();
    v257RenderManagement();
  }
};

/* Guild cleanup Phase 2: management is called directly by the canonical v254RenderGuild owner. */

function v257BindGuildManagement(){
  document.querySelector('#v257GuildSearchBtn')?.addEventListener('click',v257SearchGuilds);
  document.querySelector('#v257GuildSearchInput')?.addEventListener('keydown',e=>{
    if(e.key==='Enter')v257SearchGuilds();
  });
}
setTimeout(()=>{
  v257BindGuildManagement();
  if(!window.v7206StartupBusy?.()&&!v254Guild&&document.getElementById('guild')?.classList.contains('active'))v257SearchGuilds();
  
  const line=document.querySelector('#v141VersionLine');
},760);

