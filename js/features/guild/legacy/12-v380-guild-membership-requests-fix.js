/* === v380-guild-membership-requests-fix === */
(function(){
  const VERSION='V4.29 Stable';
  let loadPromise=null;

  function v380Version(){
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
    ).forEach(el=>{if(el)el.textContent=VERSION});
    document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11');
  }

  /*
    Final guild loader:
    - coalesces overlapping calls instead of returning early with stale/null state
    - avoids maybeSingle() being the single point of failure
    - renders "no guild" only after the server membership lookup has really completed
  */
  async function v380LoadGuildCore(){
    if(!(await v254EnsureOnline())){
      v254Guild=null;v254Membership=null;v254Members=[];
      v254RenderGuild();
      return;
    }

    const {data:memberRows,error:memberError}=await v073Db
      .from('guild_members')
      .select('guild_id,role,attack_signed,defense_signed,boss_signed,joined_at')
      .eq('user_id',v073User.id)
      .limit(2);

    if(memberError)throw memberError;

    const rows=Array.isArray(memberRows)?memberRows:[];
    const membership=rows[0]||null;

    /* Defensive: one account should never have multiple guild memberships. */
    if(rows.length>1){
      console.warn('V4.02: multiple guild memberships detected for user',v073User.id);
    }

    v254Membership=membership;

    if(!membership?.guild_id){
      v254Guild=null;v254Members=[];
      v254RenderGuild();
      v380RenderRequests();
      return;
    }

    /* V7.184: guild header and member list are independent once membership is
       known. Fetch them in parallel so first paint waits for the slower request,
       not the sum of both network round-trips. */
    const [guildRes,membersRes]=await Promise.all([
      v073Db.from('guilds')
        .select('id,name,tag,leader_id,guild_buds,xp_level,gold_level,guild_xp,created_at')
        .eq('id',membership.guild_id)
        .limit(1),
      v073Db.from('guild_members')
        .select('user_id,role,attack_signed,defense_signed,boss_signed,joined_at')
        .eq('guild_id',membership.guild_id)
        .order('joined_at',{ascending:true})
    ]);

    if(guildRes.error)throw guildRes.error;
    if(membersRes.error)throw membersRes.error;
    v254Guild=Array.isArray(guildRes.data)?(guildRes.data[0]||null):null;

    if(!v254Guild){
      throw new Error('Die Gildenmitgliedschaft existiert, aber die zugehörige Gilde wurde nicht gefunden.');
    }

    const guildMembers=Array.isArray(membersRes.data)?membersRes.data:[];
    const ids=guildMembers.map(x=>x.user_id).filter(Boolean);
    let profiles=[];

    if(ids.length){
      const {data,error}=await v073Db
        .from('profiles')
        .select('id,character_name,class_id,class_name,level,combat_power,updated_at')
        .in('id',ids);
      if(error)throw error;
      profiles=Array.isArray(data)?data:[];
    }

    const profileMap=new Map(profiles.map(p=>[p.id,p]));
    v254Members=guildMembers.map(m=>({...m,profile:profileMap.get(m.user_id)||null}));

    v254RenderGuild();
    try{v257RenderManagement()}catch(e){}
    /* V7.184: join requests are management metadata, not first-paint data.
       Render the guild immediately and refresh requests after the stable paint. */
    const later=()=>setTimeout(()=>void v380LoadRequests(false),100);
    if(typeof requestAnimationFrame==='function')requestAnimationFrame(later);else later();
  }

  v254LoadGuild=async function(){
    if(loadPromise)return loadPromise;

    loadPromise=(async()=>{
      try{
        await v380LoadGuildCore();
      }catch(e){
        console.error('V4.02 guild load',e);
        /*
          Important: do not falsely tell an existing member "no guild" just because
          a network/RLS/backend read failed. Show a loading/error state instead.
        */
        const no=document.querySelector('#v254GuildNoGuild');
        const dash=document.querySelector('#v254GuildDashboard');
        if(no){
          no.style.display='';
          no.innerHTML=`
            <div class="card">
              <div class="section-title"><div><h3>🏰 Gilde konnte nicht geladen werden</h3>
              <div class="muted">Deine Mitgliedschaft konnte gerade nicht sicher vom Server gelesen werden.</div></div></div>
              <button type="button" class="btn secondary" id="v380GuildRetry">Erneut laden</button>
            </div>`;
          document.querySelector('#v380GuildRetry')?.addEventListener('click',()=>v254LoadGuild());
        }
        if(dash)dash.style.display='none';
        if(typeof v063Toast==='function'){
          v063Toast('Gilde konnte nicht geladen werden','warn',e?.message||'Serverfehler');
        }
      }finally{
        loadPromise=null;
        v380Version();
      }
    })();

    return loadPromise;
  };

  function v380EnsureRequestsCard(){
    const card=document.querySelector('#v257RequestsCard');
    if(!card)return null;

    const manager=!!v254Guild && ['leader','officer'].includes(v254Membership?.role);
    card.classList.toggle('v380-visible',manager);
    card.style.display=manager?'':'none';

    if(manager && !card.querySelector('.v380-request-note')){
      const list=card.querySelector('#v257GuildRequests');
      const note=document.createElement('div');
      note.className='v380-request-note';
      note.textContent='Hier erscheinen Beitrittsanfragen anderer Spieler. Anführer und Offiziere können sie annehmen oder ablehnen.';
      if(list)card.insertBefore(note,list);
    }

    if(manager && !card.querySelector('#v380RefreshGuildRequests')){
      const btn=document.createElement('button');
      btn.type='button';
      btn.id='v380RefreshGuildRequests';
      btn.className='btn secondary v380-request-refresh';
      btn.textContent='↻ Anfragen aktualisieren';
      const head=card.querySelector('.section-title');
      if(head)head.appendChild(btn);
      btn.onclick=()=>v380LoadRequests(true);
    }
    return card;
  }

  async function v380LoadRequests(manual=false){
    v257Requests=[];
    const manager=!!v254Guild && ['leader','officer'].includes(v254Membership?.role);
    v380EnsureRequestsCard();

    if(!manager){
      try{v257RenderRequests()}catch(e){}
      return;
    }

    const list=document.querySelector('#v257GuildRequests');
    if(list)list.innerHTML='<div class="v257-search-empty">Beitrittsanfragen werden geladen …</div>';

    const {data,error}=await v073Db.rpc('v257_get_guild_requests');
    if(error){
      console.error('V4.02 request load',error);
      if(list)list.innerHTML=`<div class="v257-search-empty">Anfragen konnten nicht geladen werden: ${v254GuildEsc(error.message||'Serverfehler')}</div>`;
      if(manual && typeof v063Toast==='function'){
        v063Toast('Gildenanfragen konnten nicht geladen werden','warn',error.message||'');
      }
      return;
    }

    v257Requests=Array.isArray(data)?data:[];
    v380RenderRequests();
  }

  function v380RenderRequests(){
    const card=v380EnsureRequestsCard();
    const list=document.querySelector('#v257GuildRequests');
    const count=document.querySelector('#v257RequestCount');
    const manager=!!v254Guild && ['leader','officer'].includes(v254Membership?.role);

    if(!card||!list)return;
    card.style.display=manager?'':'none';
    if(!manager)return;

    if(count)count.textContent=String(v257Requests.length);

    list.innerHTML=v257Requests.length?v257Requests.map(r=>`
      <div class="v257-request">
        <div>
          <b>${v254GuildEsc(r.character_name||'Spieler')}</b>
          <small>${v254GuildEsc(r.class_name||'')} · Lv. ${Number(r.level)||1} · Kampfkraft ${Number(r.combat_power)||0}</small>
        </div>
        <div class="v257-request-actions">
          <button class="v257-mini good" data-v380-accept="${r.id}">✓ Annehmen</button>
          <button class="v257-mini bad" data-v380-reject="${r.id}">✕ Ablehnen</button>
        </div>
      </div>`).join(''):'';

    list.querySelectorAll('[data-v380-accept]').forEach(btn=>{
      btn.onclick=()=>v380HandleRequest(btn.dataset.v380Accept,true);
    });
    list.querySelectorAll('[data-v380-reject]').forEach(btn=>{
      btn.onclick=()=>v380HandleRequest(btn.dataset.v380Reject,false);
    });
  }

  async function v380HandleRequest(id,accept){
    /* V5.27: remember the applicant before the server RPC consumes the request. */
    const requestRow=Array.isArray(v257Requests)?v257Requests.find(r=>String(r?.id||'')===String(id||'')):null;
    const joinedName=String(requestRow?.character_name||'Spieler').trim().slice(0,40)||'Spieler';
    const guildIdBefore=String(v254Guild?.id||v254Membership?.guild_id||'');

    const {error}=await v073Db.rpc('v257_handle_guild_request',{
      p_request:id,
      p_accept:accept
    });
    if(error){
      if(typeof v063Toast==='function')v063Toast('Aktion fehlgeschlagen','warn',error.message||'');
      return;
    }

    /* Only a successful acceptance creates the one-time guild-chat system line.
       Chat failures must never roll back/block the actual membership change. */
    if(accept&&guildIdBefore){
      try{
        const uid=String(v073User?.id||'');
        if(uid&&v073Db){
          const payload={
            guild_id:guildIdBefore,
            user_id:uid,
            character_name:joinedName,
            body:'ist der Gilde beigetreten.'
          };
          const {error:chatError}=await v073Db.from('guild_chat_messages').insert(payload);
          if(chatError)console.warn('V5.27 guild join chat message',chatError);
        }
      }catch(chatError){console.warn('V5.27 guild join chat message',chatError)}
    }

    if(typeof v063Toast==='function'){
      v063Toast(accept?'Mitglied aufgenommen':'Anfrage abgelehnt','success');
    }
    await v254LoadGuild();
    if(accept){try{window.v4144SyncGuildChat?.()}catch(e){}}
  }

  /* Replace only request rendering/loading; backend RPCs remain authoritative. */
  v257LoadRequests=v380LoadRequests;
  v257RenderRequests=v380RenderRequests;
  v257HandleRequest=v380HandleRequest;

  /* Always refresh when the guild page is opened. */
  const baseGo=v032Go;
  v032Go=function(id){
    const r=baseGo.apply(this,arguments);
    if(id==='guild'){
      setTimeout(()=>v254LoadGuild(),0);
    }
    return r;
  };

  setTimeout(()=>{
    if(document.querySelector('#guild')?.classList.contains('active'))v254LoadGuild();
    else v380EnsureRequestsCard();
    v380Version();
  },350);
})();

