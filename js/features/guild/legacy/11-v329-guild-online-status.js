/* === v329-guild-online-status === */
(function(){
  const V329_ONLINE_MS = 2 * 60 * 1000;
  let v329HeartbeatBusy=false;
  let v329LastGuildRefresh=0;

  function v329IsOnline(m){
    try{
      if(typeof v073User!=='undefined' && v073User && String(m?.user_id||'')===String(v073User.id||''))return true;
      const stamp=m?.profile?.updated_at;
      if(!stamp)return false;
      const ts=new Date(stamp).getTime();
      return Number.isFinite(ts) && (Date.now()-ts)<=V329_ONLINE_MS;
    }catch(e){return false}
  }

  /* V6.119: the final V5.54 guild renderer lives outside this IIFE.
     Export the presence authority explicitly instead of relying on a scoped name. */
  window.v329IsOnline=v329IsOnline;
  window.v329PresenceHeartbeat=v329PresenceHeartbeat;

  async function v329PresenceHeartbeat(){
    if(v329HeartbeatBusy || document.hidden)return;
    if(typeof v073Ready==='undefined' || !v073Ready || !v073User || !v073Db || v073User.is_anonymous)return;
    v329HeartbeatBusy=true;
    try{
      const now=new Date().toISOString();
      const {error}=await window.v7101ProfileUpdate({updated_at:now})
        .eq('id',v073User.id);
      if(error)throw error;

      /* Keep local guild cache immediately in sync without waiting for reload. */
      if(Array.isArray(v254Members)){
        const own=v254Members.find(x=>String(x.user_id||'')===String(v073User.id||''));
        if(own){
          own.profile??={id:v073User.id};
          own.profile.updated_at=now;
        }
      }

      /* Don't wait for the next full guild reload to show our own green badge. */
      try{
        const ownRow=document.querySelector(`#guild .v254-member[data-v554-user="${CSS.escape(String(v073User.id||''))}"]`);
        const badge=ownRow?.querySelector('.v329-presence');
        if(badge){
          badge.classList.remove('offline');
          badge.classList.add('online');
          badge.innerHTML='<i></i><span>Online</span>';
        }
      }catch(_){}
    }catch(e){
      console.warn('V4.02 presence heartbeat',e);
    }finally{
      v329HeartbeatBusy=false;
    }
  }

  /* Override guild load so member profiles include updated_at. */
  v254LoadGuild=async function(){
    if(v254Loading)return;
    v254Loading=true;
    try{
      if(!(await v254EnsureOnline())){
        v254Guild=null;v254Membership=null;v254Members=[];
        v254RenderGuild();
        return;
      }

      const {data:membership,error:me}=await v073Db
        .from('guild_members')
        .select('guild_id,role,attack_signed,defense_signed,boss_signed,joined_at')
        .eq('user_id',v073User.id)
        .maybeSingle();
      if(me)throw me;

      v254Membership=membership||null;
      if(!membership){
        v254Guild=null;v254Members=[];
        v254RenderGuild();
        return;
      }

      const {data:guild,error:ge}=await v073Db
        .from('guilds')
        .select('id,name,tag,leader_id,guild_buds,xp_level,gold_level,guild_xp,created_at')
        .eq('id',membership.guild_id)
        .maybeSingle();
      if(ge)throw ge;
      v254Guild=guild||null;

      const {data:members,error:merr}=await v073Db
        .from('guild_members')
        .select('user_id,role,attack_signed,defense_signed,boss_signed,joined_at')
        .eq('guild_id',membership.guild_id)
        .order('joined_at',{ascending:true});
      if(merr)throw merr;

      const memberRows=members||[];
      const userIds=memberRows.map(x=>x.user_id).filter(Boolean);
      let profileRows=[];
      if(userIds.length){
        const {data:profiles,error:perr}=await v073Db
          .from('profiles')
          .select('id,character_name,class_id,class_name,level,combat_power,updated_at')
          .in('id',userIds);
        if(perr)throw perr;
        profileRows=profiles||[];
      }

      const profileMap=new Map(profileRows.map(row=>[row.id,row]));
      v254Members=memberRows.map(row=>({
        ...row,
        profile:profileMap.get(row.user_id)||null
      }));

      v329LastGuildRefresh=Date.now();
      v254RenderGuild();
    }catch(e){
      console.error('V4.02 guild load',e);
      if(typeof v063Toast==='function'){
        const sqlMissing=/relation.*guild|guild_members|does not exist/i.test(String(e?.message||''));
        v063Toast('Gilden noch nicht bereit','warn',sqlMissing?'Bitte V254_GUILD_SQL.sql einmal in Supabase ausführen.':(e?.message||'Gildendaten konnten nicht geladen werden.'));
      }
      v254Guild=null;v254Membership=null;v254Members=[];
      v254RenderGuild();
    }finally{v254Loading=false}
  };

  /* Guild member cards are the only place where presence is shown. */
  v254MemberHtml=function(m){
    const p=m.profile || (Array.isArray(m.profiles)?m.profiles[0]:m.profiles);
    const cls=p?.class_id||'grower';
    const avatar=typeof v080AvatarFor==='function'?v080AvatarFor(cls):'';
    const role=m.role==='leader'?'Anführer':m.role==='officer'?'Offizier':'Mitglied';
    const online=v329IsOnline(m);
    return `<div class="v254-member">
      <img src="${v254GuildEsc(avatar)}" alt="">
      <div>
        <b>${v254GuildEsc(p?.character_name||'Spieler')}
          <span class="v329-presence ${online?'online':'offline'}">${online?'Online':'Offline'}</span>
        </b>
        <small>${v254GuildEsc(p?.class_name||'')} · Lv. ${Number(p?.level)||1} · ${role}</small>
      </div>
      <div class="v254-member-flags">
        <span class="v254-flag ${m.attack_signed?'on':''}">⚔ ${m.attack_signed?'Angriff':'—'}</span>
        <span class="v254-flag ${m.defense_signed?'on':''}">🛡 ${m.defense_signed?'Verteidigung':'—'}</span>
        <span class="v254-flag ${m.boss_signed?'on':''}">👹 ${m.boss_signed?'Boss':'—'}</span>
      </div>
    </div>`;
  };

  /* Ping once per minute. A player is online for at most two minutes after
     the last successful ping, so crashes/closed tabs cannot leave "online"
     stuck forever. */
  /* V6.120: one cadence for heartbeat + visible member refresh. */
  setInterval(()=>{
    if(document.hidden)return;
    v329PresenceHeartbeat();
    try{window.v6124PaintGuildLock?.()}catch(e){}
    const guild=document.querySelector('#guild');
    if(!guild?.classList.contains('active'))return;
    if(Date.now()-v329LastGuildRefresh<55000)return;
    v254LoadGuild();
  },60000);
  setTimeout(v329PresenceHeartbeat,1200);

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden){
      v329PresenceHeartbeat();
      if(document.querySelector('#guild')?.classList.contains('active'))setTimeout(v254LoadGuild,250);
    }
  });

  
  const line=document.querySelector('#v141VersionLine');
})();

