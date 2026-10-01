(function(){
  const V333_ONLINE_MS=2*60*1000;
  let v333LastRefresh=0;
  let v333Loading=false;

  function v333FriendOnline(p){
    try{
      if(typeof v073User!=='undefined' && v073User && p?.id===v073User.id)return true;
      const ts=new Date(p?.updated_at||'').getTime();
      return Number.isFinite(ts) && (Date.now()-ts)<=V333_ONLINE_MS;
    }catch(e){return false}
  }

  function v333FriendRow(p,actions=''){
    const online=v333FriendOnline(p);
    return `
      <div class="v072-player-row" data-profile-id="${v073Escape(p.id)}">
        <div class="v072-rank">P</div>
        <div>
          <div class="v072-player-name">
            ${v073Escape(p.character_name)}
            <span class="v329-presence ${online?'online':'offline'}">${online?'Online':'Offline'}</span>
          </div>
          <div class="v072-player-sub">
            ${v073Escape(p.class_name||'')} · Lv. ${Number(p.level)||1}
            · Ausrüstung ${Number(p.gear_score)||0}
            · Bosse ${Number(p.bosses)||0}
          </div>
        </div>
        <div class="v073-row-actions">${actions}</div>
      </div>`;
  }

  async function v333ProfileMap(ids){
    ids=[...new Set((ids||[]).filter(Boolean))];
    if(!ids.length)return new Map();

    const {data,error}=await v073Db
      .from('profiles')
      .select('id,character_name,class_id,class_name,level,bosses,gear_score,dungeons,updated_at')
      .in('id',ids);

    if(error){
      console.error('V4.02 friend profile load',error);
      return new Map();
    }
    return new Map((data||[]).map(p=>[p.id,p]));
  }

  /* Only the accepted Nebel-Crew friend list receives presence badges.
     Hall of Haze / player search stays unchanged. */
  v073LoadFriends=async function(){
    const friendsEl=document.querySelector('#v072FriendsList');
    const requestsEl=document.querySelector('#v072RequestsList');
    const countEl=document.querySelector('#v072FriendCount');
    if(!friendsEl||!requestsEl||v333Loading)return;

    if(!(await v073Init()))return;
  if(!v073User?.id)return;
    v333Loading=true;

    try{
      friendsEl.innerHTML='<div class="v072-empty">Lade Freunde...</div>';
      requestsEl.innerHTML='<div class="v072-empty">Lade Anfragen...</div>';

      const {data,error}=await v073Db
        .from('friend_requests')
        .select('id,sender_id,receiver_id,status,created_at')
        .or(`sender_id.eq.${v073User.id},receiver_id.eq.${v073User.id}`)
        .order('created_at',{ascending:false});

      if(error)throw error;

      const rows=data||[];
      const incoming=rows.filter(r=>r.status==='pending' && r.receiver_id===v073User.id);
      const accepted=rows.filter(r=>r.status==='accepted');

      const ids=[
        ...incoming.map(r=>r.sender_id),
        ...accepted.map(r=>r.sender_id===v073User.id?r.receiver_id:r.sender_id)
      ];
      const profiles=await v333ProfileMap(ids);

      requestsEl.innerHTML=incoming.length
        ? incoming.map(r=>{
            const p=profiles.get(r.sender_id)||{id:r.sender_id,character_name:'Spieler',level:1,class_name:''};
            /* Requests intentionally use the normal row without presence. */
            return v073PlayerRow(
              p,
              null,
              `<button class="btn" data-v073-accept="${r.id}">Annehmen</button>
               <button class="btn secondary" data-v073-decline="${r.id}">Ablehnen</button>`
            );
          }).join('')
        : '<div class="v072-empty">Keine offenen Anfragen.</div>';

      const friendProfiles=accepted.map(r=>{
        const other=r.sender_id===v073User.id?r.receiver_id:r.sender_id;
        return profiles.get(other);
      }).filter(Boolean);

      if(countEl)countEl.textContent=`${friendProfiles.length} Freunde`;

      friendsEl.innerHTML=friendProfiles.length
        ? friendProfiles.map(p=>v333FriendRow(
            p,
            `<button class="btn secondary" data-v073-remove="${p.id}">Entfernen</button>`
          )).join('')
        : '<div class="v072-empty">Noch keine Freunde.</div>';

      document.querySelectorAll('[data-v073-accept]').forEach(btn=>{
        btn.onclick=()=>v073AnswerRequest(Number(btn.dataset.v073Accept),'accepted');
      });
      document.querySelectorAll('[data-v073-decline]').forEach(btn=>{
        btn.onclick=()=>v073AnswerRequest(Number(btn.dataset.v073Decline),'declined');
      });
      document.querySelectorAll('[data-v073-remove]').forEach(btn=>{
        btn.onclick=()=>v073RemoveFriend(btn.dataset.v073Remove);
      });

      v333LastRefresh=Date.now();
    }catch(e){
      console.error('V4.02 friends load',e);
      friendsEl.innerHTML='<div class="v072-status-offline">Freundesliste konnte nicht geladen werden.</div>';
      requestsEl.innerHTML='';
    }finally{
      v333Loading=false;
    }
  };

  /* Presence is refreshed while Nebel-Crew is open. The existing V4.02
     heartbeat updates profiles.updated_at once per minute. */
  setInterval(()=>{
    if(document.hidden)return;
    const screen=document.querySelector('#friends');
    if(!screen?.classList.contains('active'))return;
    if(Date.now()-v333LastRefresh<55000)return;
    v073LoadFriends();
  },15000);

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden && document.querySelector('#friends')?.classList.contains('active')){
      setTimeout(v073LoadFriends,350);
    }
  });

  
  const line=document.querySelector('#v141VersionLine');
})();
