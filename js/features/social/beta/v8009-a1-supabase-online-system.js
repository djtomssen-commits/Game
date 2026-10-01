/* ===== V4.02 REAL SUPABASE ONLINE SYSTEM ===== */

const V073_SUPABASE_URL = 'https://egzfmnlqwaixwsyppucp.supabase.co';
const V073_SUPABASE_KEY = 'sb_publishable_OPSJDLXJUYGY2FLl73n8Jg_yhI-zUvd';

let v073Db = null;
let v073User = null;
let v073Ready = false;
let v073InitPromise = null;
let v073LastProfileJson = '';
let v073SocialLoading = false;

/* V4.02 adapter now becomes live */
V072_ONLINE.enabled = true;
V072_ONLINE.baseUrl = V073_SUPABASE_URL;
V072_ONLINE.apiKey = V073_SUPABASE_KEY;

function v073Escape(s){
  return String(s??'')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

function v073SetState(text,online=false){
  const el=document.querySelector('#v072OnlineState');
  if(!el)return;
  el.innerHTML=`<span class="${online?'v073-online-dot':'v073-offline-dot'}"></span>${text}`;
  el.classList.toggle('v072-online',online);
  el.classList.toggle('v072-offline',!online);
}


async function v073Init(){
  if(v073InitPromise)return v073InitPromise;

  v073InitPromise=(async()=>{
    try{
      v073SetState('VERBINDE...',false);

      if(!window.supabase?.createClient){
        throw new Error('Supabase-Bibliothek konnte nicht geladen werden.');
      }

      if(!v073Db){
        const v073StoredServer=localStorage.getItem('growLegendsSelectedServer');
        const v073SelectedServer=String(window.GROW_RELEASE_CHANNEL==='beta'?'beta':(Date.now()>=Date.parse('2026-10-02T16:00:00+02:00')?'server1':(v073StoredServer||'beta')));
        const v073DbSchema=v073SelectedServer==='server1'?'server1':'public';
        window.__GROW_DB_SCHEMA__=v073DbSchema;
        v073Db=window.supabase.createClient(
          V073_SUPABASE_URL,
          V073_SUPABASE_KEY,
          {
            db:{schema:v073DbSchema},
            auth:{
              persistSession:true,
              autoRefreshToken:true,
              detectSessionInUrl:true
            }
          }
        );
      }

      const {data:{session},error}=await v073Db.auth.getSession();
      if(error)throw error;

      v073User=session?.user||null;
      v073Ready=true;

      if(v073User && !v073User.is_anonymous){
        s.social??={};
        s.social.playerId=v073User.id;
        localStorage.setItem('growLegendsPlayerId',v073User.id);
        v073SetState('ONLINE',true);
      }else{
        v073SetState('ACCOUNT ERFORDERLICH',false);
      }

      return true;
    }catch(e){
      console.error('Supabase init',e);
      v073Ready=false;
      v073SetState('OFFLINE',false);
      if(typeof v063Toast==='function'){
        v063Toast('Online-Verbindung fehlgeschlagen','error',e?.message||'Supabase nicht erreichbar.');
      }
      return false;
    }
  })();

  return v073InitPromise;
}

function v073ProfilePayload(){
  const p=v072Profile();
  return {
    id:v073User?.id || p.id,
    character_name:v071CleanName(s.characterName)||'Unbenannt',
    class_id:s.playerClass||null,
    class_name:v072ClassName(),
    level:Number(s.level)||1,
    bosses:Number(s.story?.bossesDefeated)||0,
    gear_score:v072GearScore(),
    dungeons:Number(s.dungeon?.completed?.length)||0,
    updated_at:new Date().toISOString()
  };
}

async function v073SyncProfile(force=false){
  if(window.__V200_AUTH_READY__!==true)return false;
  if(!v073Ready || !v073User || !v073Db)return false;
  if(!s.characterNameSet || !v071NameValid(s.characterName))return false;

  const payload=v073ProfilePayload();
  const comparable={...payload};
  delete comparable.updated_at;
  const json=JSON.stringify(comparable);

  if(!force && json===v073LastProfileJson)return true;

  const {error}=await v073Db
    .from('profiles')
    .upsert(payload,{onConflict:'id'});

  if(error){
    console.error('Profile sync',error);

    if(error.code==='23505' || String(error.message||'').toLowerCase().includes('duplicate')){
      v063Toast(
        'Charaktername bereits vergeben',
        'error',
        'Für Online-Spieler muss jeder Name eindeutig sein.'
      );
    }
    return false;
  }

  v073LastProfileJson=json;
  return true;
}

function v073RankClass(i){
  if(i===0)return 'v073-rank-gold';
  if(i===1)return 'v073-rank-silver';
  if(i===2)return 'v073-rank-bronze';
  return '';
}

function v073PlayerRow(p,i=null,actions=''){
  const rank=i===null?'':`<div class="v072-rank ${v073RankClass(i)}">${i+1}</div>`;
  const left=i===null?'<div class="v072-rank">P</div>':rank;

  return `
    <div class="v072-player-row" data-profile-id="${v073Escape(p.id)}">
      ${left}
      <div>
        <div class="v072-player-name">${v073Escape(p.character_name)}</div>
        <div class="v072-player-sub">
          ${v073Escape(p.class_name||'')} · Lv. ${Number(p.level)||1}
          · Ausrüstung ${Number(p.gear_score)||0}
          · Bosse ${Number(p.bosses)||0}
        </div>
      </div>
      <div class="v073-row-actions">${actions}</div>
    </div>`;
}

async function v073LoadRanking(){
  const el=document.querySelector('#v072HallRanking');
  if(!el)return;

  if(!(await v073Init())){
    el.innerHTML='<div class="v072-status-offline">Online-Rangliste momentan nicht erreichbar.</div>';
    return;
  }

  el.innerHTML='<div class="v072-empty">Rangliste wird geladen...</div>';

  const {data,error}=await v073Db
    .from('profiles')
    .select('id,character_name,class_id,class_name,level,bosses,gear_score,dungeons')
    .order('level',{ascending:false})
    .order('gear_score',{ascending:false})
    .limit(50);

  if(error){
    console.error(error);
    el.innerHTML='<div class="v072-status-offline">Rangliste konnte nicht geladen werden.</div>';
    return;
  }

  el.innerHTML=(data||[]).length
    ? data.map((p,i)=>v073PlayerRow(
        p,
        i,
        p.id===v073User.id
          ? '<span class="pill">DU</span>'
          : `<button class="btn secondary" data-v073-add="${p.id}" data-name="${v073Escape(p.character_name)}">Freund</button>`
      )).join('')
    : '<div class="v072-empty">Noch keine Spieler in der Hall of Haze.</div>';

  v073BindAddButtons(el);
}

async function v073SearchPlayer(name,targetSelector){
  const target=document.querySelector(targetSelector);
  if(!target)return;

  name=String(name||'').trim();
  if(name.length<2){
    v063Toast('Mindestens 2 Zeichen eingeben','warn');
    return;
  }

  if(!(await v073Init()))return;
  if(!v073User?.id)return;

  target.innerHTML='<div class="v072-empty">Suche...</div>';

  const safe=name.replace(/[%_,]/g,'');
  const {data,error}=await v073Db
    .from('profiles')
    .select('id,character_name,class_id,class_name,level,bosses,gear_score,dungeons')
    .ilike('character_name',`%${safe}%`)
    .limit(20);

  if(error){
    console.error(error);
    target.innerHTML='<div class="v072-status-offline">Suche fehlgeschlagen.</div>';
    return;
  }

  const rows=(data||[]).filter(p=>p.id!==v073User.id);

  target.innerHTML=rows.length
    ? rows.map(p=>v073PlayerRow(
        p,
        null,
        `<button class="btn" data-v073-add="${p.id}" data-name="${v073Escape(p.character_name)}">Anfrage senden</button>`
      )).join('')
    : '<div class="v072-empty">Keinen Spieler gefunden.</div>';

  v073BindAddButtons(target);
}

async function v073SendFriendRequest(receiverId,name='Spieler'){
  if(!(await v073Init()))return;
  if(!v073User?.id)return;
  if(receiverId===v073User.id)return;

  /* Prevent same or reverse duplicate request. */
  const {data:existing,error:findErr}=await v073Db
    .from('friend_requests')
    .select('id,status,sender_id,receiver_id')
    .or(`and(sender_id.eq.${v073User.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${v073User.id})`)
    .limit(5);

  if(findErr){
    console.error(findErr);
    v063Toast('Freundschaftsanfrage fehlgeschlagen','error');
    return;
  }

  const accepted=(existing||[]).find(x=>x.status==='accepted');
  if(accepted){
    v063Toast(`${name} ist bereits in deiner Nebel-Crew`,'warn');
    return;
  }

  const incoming=(existing||[]).find(
    x=>x.status==='pending' && x.receiver_id===v073User.id
  );
  if(incoming){
    v063Toast(`${name} hat dir bereits eine Anfrage geschickt`,'warn','Öffne Nebel-Crew.');
    return;
  }

  const pending=(existing||[]).find(x=>x.status==='pending');
  if(pending){
    v063Toast('Anfrage bereits gesendet','warn',name);
    return;
  }

  const {error}=await v073Db
    .from('friend_requests')
    .insert({
      sender_id:v073User.id,
      receiver_id:receiverId,
      status:'pending'
    });

  if(error){
    console.error(error);
    v063Toast('Anfrage konnte nicht gesendet werden','error');
    return;
  }

  v063Toast('Freundschaftsanfrage gesendet','success',name);
}

function v073BindAddButtons(root=document){
  root.querySelectorAll('[data-v073-add]').forEach(btn=>{
    btn.onclick=()=>v073SendFriendRequest(
      btn.dataset.v073Add,
      btn.dataset.name||'Spieler'
    );
  });
}

async function v073ProfileMap(ids){
  ids=[...new Set(ids.filter(Boolean))];
  if(!ids.length)return new Map();

  const {data,error}=await v073Db
    .from('profiles')
    .select('id,character_name,class_id,class_name,level,bosses,gear_score,dungeons')
    .in('id',ids);

  if(error){
    console.error(error);
    return new Map();
  }

  return new Map((data||[]).map(p=>[p.id,p]));
}

async function v073LoadFriends(){
  const friendsEl=document.querySelector('#v072FriendsList');
  const requestsEl=document.querySelector('#v072RequestsList');
  const countEl=document.querySelector('#v072FriendCount');
  if(!friendsEl||!requestsEl)return;

  if(!(await v073Init()))return;
  if(!v073User?.id)return;

  friendsEl.innerHTML='<div class="v072-empty">Lade Freunde...</div>';
  requestsEl.innerHTML='<div class="v072-empty">Lade Anfragen...</div>';

  const {data,error}=await v073Db
    .from('friend_requests')
    .select('id,sender_id,receiver_id,status,created_at')
    .or(`sender_id.eq.${v073User.id},receiver_id.eq.${v073User.id}`)
    .order('created_at',{ascending:false});

  if(error){
    console.error(error);
    friendsEl.innerHTML='<div class="v072-status-offline">Freundesliste konnte nicht geladen werden.</div>';
    requestsEl.innerHTML='';
    return;
  }

  const rows=data||[];
  const incoming=rows.filter(
    r=>r.status==='pending' && r.receiver_id===v073User.id
  );
  const accepted=rows.filter(r=>r.status==='accepted');

  const ids=[
    ...incoming.map(r=>r.sender_id),
    ...accepted.map(r=>r.sender_id===v073User.id?r.receiver_id:r.sender_id)
  ];

  const profiles=await v073ProfileMap(ids);

  requestsEl.innerHTML=incoming.length
    ? incoming.map(r=>{
        const p=profiles.get(r.sender_id)||{character_name:'Spieler',level:1,class_name:''};
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

  countEl.textContent=`${friendProfiles.length} Freunde`;

  friendsEl.innerHTML=friendProfiles.length
    ? friendProfiles.map(p=>v073PlayerRow(
        p,
        null,
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
}

async function v073AnswerRequest(id,status){
  if(!(await v073Init()))return;
  if(!v073User?.id)return;

  const {error}=await v073Db
    .from('friend_requests')
    .update({status})
    .eq('id',id);

  if(error){
    console.error(error);
    v063Toast('Anfrage konnte nicht bearbeitet werden','error');
    return;
  }

  v063Toast(
    status==='accepted'?'Freund hinzugefügt':'Anfrage abgelehnt',
    status==='accepted'?'success':'warn'
  );
  await v073LoadFriends();
}

async function v073RemoveFriend(otherId){
  if(!(await v073Init()))return;
  if(!v073User?.id)return;

  const ok=await v063Confirm(
    'Diesen Spieler wirklich aus deiner Nebel-Crew entfernen?',
    'Freund entfernen',
    'Entfernen'
  );
  if(!ok)return;

  const {data,error:findErr}=await v073Db
    .from('friend_requests')
    .select('id,status,sender_id,receiver_id')
    .eq('status','accepted')
    .or(`and(sender_id.eq.${v073User.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${v073User.id})`);

  if(findErr){
    console.error(findErr);
    return;
  }

  for(const row of data||[]){
    const {error}=await v073Db
      .from('friend_requests')
      .delete()
      .eq('id',row.id);

    if(error)console.error(error);
  }

  v063Toast('Freund entfernt','success');
  await v073LoadFriends();
}

/* Replace V4.02 offline placeholders with live functions. */
v072SearchPlayer=v073SearchPlayer;
v072RenderRanking=function(){
  const el=document.querySelector('#v072HallRanking');
  if(el)el.innerHTML='<div class="v072-empty">Rangliste wird geladen...</div>';
  v073LoadRanking();
};
v072RenderFriends=function(){
  const friends=document.querySelector('#v072FriendsList');
  const requests=document.querySelector('#v072RequestsList');
  if(friends)friends.innerHTML='<div class="v072-empty">Lade Freunde...</div>';
  if(requests)requests.innerHTML='<div class="v072-empty">Lade Anfragen...</div>';
  v073LoadFriends();
};

/* V8.009: Hall/Friends entry refresh is owned by the final v4130 navigation lifecycle.
   The old v072AddMenuItems wrapper and its 0-ms repaint lane are retired. */

/* V8.009: profile dirty-check has a real data lifecycle instead of wrapping
   the global app render. The payload comparison in v073SyncProfile prevents
   unnecessary writes; presence heartbeat remains independently owned by v329. */
function v073ScheduleProfileSync(force=false){
  if(window.__V200_AUTH_READY__!==true)return false;
  if(!v073Ready || !v073User || v073User.is_anonymous)return false;
  if(!s.playerClass || !s.characterNameSet || !v071NameValid(s.characterName))return false;
  queueMicrotask(()=>{try{void v073SyncProfile(!!force)}catch(_){}});
  return true;
}
window.v073ScheduleProfileSync=v073ScheduleProfileSync;
window.addEventListener('growlegends:account-ready',()=>v073ScheduleProfileSync(true),{passive:true});
window.addEventListener('growlegends:foreground-ready',()=>v073ScheduleProfileSync(false),{passive:true});
window.addEventListener('pageshow',()=>v073ScheduleProfileSync(false),{passive:true});
setInterval(()=>{if(!document.hidden)v073ScheduleProfileSync(false)},60000);

window.addEventListener('online',()=>{
  v073InitPromise=null;
  v073Ready=false;
  v073Init().then(ok=>{
    if(ok && v073User && !v073User.is_anonymous){
      v073SyncProfile(true);
      if(document.querySelector('#hall')?.classList.contains('active'))v073LoadRanking();
      if(document.querySelector('#friends')?.classList.contains('active'))v073LoadFriends();
    }
  });
});

window.addEventListener('offline',()=>{
  v073SetState('OFFLINE',false);
});

/* V4.02: initialize DB client only. Auth lifecycle starts once, later. */
v073Init().catch(e=>console.error('V4.02 initial Supabase init',e));
