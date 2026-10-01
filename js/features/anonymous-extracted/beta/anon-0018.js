
/* ===== V4.02 social frontend foundation ===== */

s.social ??= {};
s.social.playerId ??= localStorage.getItem('growLegendsPlayerId') || crypto.randomUUID();
s.social.friends ??= [];
s.social.requests ??= [];
s.social.pending ??= [];
localStorage.setItem('growLegendsPlayerId',s.social.playerId);
localStorage.setItem(KEY,JSON.stringify(s));

/*
  Online adapter.
  In V4.02 intentionally disabled until a real backend is configured.
  Frontend is complete so backend integration can be added without redesign.
*/
const V072_ONLINE = {
  enabled:false,
  baseUrl:'',
  apiKey:''
};

function v072ClassName(){
  return classes?.[s.playerClass]?.name || 'Unbekannt';
}

function v072GearScore(){
  return Object.values(s.equipment||{}).reduce((sum,it)=>{
    if(!it)return sum;
    const bonus=Object.values(it.bonus||{}).reduce((a,b)=>a+(Number(b)||0),0);
    const rarity={gray:1,green:2,blue:4,purple:7,orange:11,cyan:16}[it.quality||'gray']||1;
    return sum+bonus+rarity;
  },0);
}

function v072Profile(){
  return {
    id:s.social.playerId,
    name:v071CleanName(s.characterName)||'Unbenannt',
    classId:s.playerClass,
    className:v072ClassName(),
    level:Number(s.level)||1,
    bosses:Number(s.story?.bossesDefeated)||0,
    gearScore:v072GearScore(),
    dungeon:Number(s.dungeon?.completed?.length)||0
  };
}

function v072OnlineState(){
  const el=document.querySelector('#v072OnlineState');
  if(!el)return;
  if(V072_ONLINE.enabled){
    el.textContent='ONLINE';
    el.classList.add('v072-online');
    el.classList.remove('v072-offline');
  }else{
    el.textContent='BACKEND OFFLINE';
    el.classList.add('v072-offline');
    el.classList.remove('v072-online');
  }
}

function v072RenderOwnProfile(){
  const el=document.querySelector('#v072OwnProfile');
  if(!el)return;
  const p=v072Profile();

  el.innerHTML=`
    <div class="v072-profile-name">${p.name}</div>
    <div class="v072-profile-meta">${p.className} · Spieler-ID ${p.id.slice(0,8)}</div>
    <div class="v072-profile-stats">
      <div class="v072-profile-stat"><span>Level</span><b>${p.level}</b></div>
      <div class="v072-profile-stat"><span>Bosse</span><b>${p.bosses}</b></div>
      <div class="v072-profile-stat"><span>Ausrüstung</span><b>${p.gearScore}</b></div>
      <div class="v072-profile-stat"><span>Dungeons</span><b>${p.dungeon}</b></div>
    </div>`;
}

function v072RenderRanking(){
  const el=document.querySelector('#v072HallRanking');
  if(!el)return;

  if(!V072_ONLINE.enabled){
    el.innerHTML=`
      <div class="v072-status-offline">
        <b>Online-Rangliste vorbereitet.</b><br>
        Für echte andere Spieler fehlt nur noch die gemeinsame Datenbank.
        Dein eigenes Profil und deine Spieler-ID sind bereits angelegt.
      </div>`;
    return;
  }
}

function v072RenderSearchPanel(){
  const el=document.querySelector('#v072HallSearch');
  if(!el)return;
  el.innerHTML=`
    <div class="v072-friend-actions">
      <input id="v072HallSearchInput" class="v071-name-input" placeholder="Spielername suchen">
      <button class="btn" id="v072HallSearchBtn">Suchen</button>
    </div>
    <div id="v072HallSearchResults"></div>`;

  const btn=document.querySelector('#v072HallSearchBtn');
  if(btn)btn.onclick=()=>v072SearchPlayer(
    document.querySelector('#v072HallSearchInput')?.value||'',
    '#v072HallSearchResults'
  );
}

function v072RenderTabs(){
  document.querySelectorAll('.v072-tab').forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll('.v072-tab').forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');

      const tab=btn.dataset.v072Tab;
      document.querySelector('#v072HallRanking').style.display=tab==='ranking'?'':'none';
      document.querySelector('#v072HallSearch').style.display=tab==='search'?'':'none';
    };
  });
}

function v072SearchPlayer(name,targetSelector){
  const target=document.querySelector(targetSelector);
  if(!target)return;

  name=String(name||'').trim();

  if(name.length<2){
    v063Toast('Mindestens 2 Zeichen eingeben','warn');
    return;
  }

  if(!V072_ONLINE.enabled){
    target.innerHTML=`
      <div class="v072-status-offline">
        Die Spielersuche ist technisch vorbereitet, aber noch nicht mit dem Online-Backend verbunden.
      </div>`;
    return;
  }
}

function v072RenderFriends(){
  const friends=document.querySelector('#v072FriendsList');
  const requests=document.querySelector('#v072RequestsList');
  const count=document.querySelector('#v072FriendCount');
  if(!friends||!requests)return;

  count.textContent=`${s.social.friends.length} Freunde`;

  friends.innerHTML=s.social.friends.length
    ? s.social.friends.map(f=>`
        <div class="v072-player-row">
          <div class="v072-rank">F</div>
          <div>
            <div class="v072-player-name">${f.name||'Spieler'}</div>
            <div class="v072-player-sub">${f.className||''} · Lv. ${f.level||1}</div>
          </div>
          <button class="btn secondary" disabled>Profil</button>
        </div>`).join('')
    : '<div class="v072-empty">Noch keine Freunde.</div>';

  requests.innerHTML=s.social.requests.length
    ? s.social.requests.map(r=>`
        <div class="v072-player-row">
          <div class="v072-rank">?</div>
          <div>
            <div class="v072-player-name">${r.name||'Spieler'}</div>
            <div class="v072-player-sub">Freundschaftsanfrage</div>
          </div>
          <button class="btn secondary" disabled>Antworten</button>
        </div>`).join('')
    : '<div class="v072-empty">Keine offenen Anfragen.</div>';
}

function v072BindFriendSearch(){
  const btn=document.querySelector('#v072FriendSearchBtn');
  if(!btn)return;
  btn.onclick=()=>{
    const name=document.querySelector('#v072FriendSearchInput')?.value||'';
    v072SearchPlayer(name,'#v072FriendSearchResults');
  };
}

function v072AddMenuItems(){
  const panel=document.querySelector('.top-menu-panel');
  if(!panel)return;

  if(!panel.querySelector('[data-screen="hall"]')){
    const btn=document.createElement('button');
    btn.className='top-menu-item';
    btn.dataset.screen='hall';
    btn.innerHTML='<span>🏆</span> Hall of Haze';
    panel.appendChild(btn);
  }

  if(!panel.querySelector('[data-screen="friends"]')){
    const btn=document.createElement('button');
    btn.className='top-menu-item';
    btn.dataset.screen='friends';
    btn.innerHTML='<span>🤝</span> Nebel-Crew';
    panel.appendChild(btn);
  }

  panel.querySelectorAll('[data-screen="hall"],[data-screen="friends"]').forEach(btn=>{
    btn.onclick=e=>{
      e?.preventDefault?.();
      e?.stopPropagation?.();
      const id=String(btn.dataset.screen||'');
      if(id&&typeof v032Go==='function')v032Go(id);
    };
  });
}

function v072RenderSocial(){
  v072OnlineState();
  v072RenderOwnProfile();
  v072RenderRanking();
  v072RenderSearchPanel();
  v072RenderTabs();
  v072RenderFriends();
  v072BindFriendSearch();
  v072AddMenuItems();
}

/* V8.009 Friends/Mail: the Social foundation is static bootstrap only.
   Dynamic Hall/Friends data is owned by v4130 and shared v032Go navigation. */
try{
  v072RenderSocial();
}catch(e){
  console.error('V4.02 social system',e);
}
