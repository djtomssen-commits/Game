/* === v254-guild-foundation-core === */
/*
 V4.02 GUILD FOUNDATION
 Server tables are intentionally defined in V254_GUILD_SQL.sql.
 All guild membership, Buds and upgrade purchases are server authoritative.
*/
s.guildUi??={attack:false,defense:false,boss:false};

function v254GuildEsc(v){
  return typeof v073Escape==='function'?v073Escape(v):String(v??'');
}
function v254UpgradeCost(level){
  const costs=[100,300,700,1500,3000,6000,12000,24000];
  return costs[Math.min(costs.length-1,Math.max(0,Number(level)||0))];
}
function v254BonusPct(level){return Math.max(0,Number(level)||0)*2}

let v254Guild=null;
let v254Membership=null;
let v254Members=[];
let v254Loading=false;

/* V6.124: 24h guild lock after voluntarily leaving a guild. */
const V6124_GUILD_LOCK_MS=24*60*60*1000;
s.guildLeaveLockUntil=Math.max(0,Number(s.guildLeaveLockUntil)||0);

function v6124GuildLockUntil(){
  return Math.max(0,Number(s?.guildLeaveLockUntil)||0);
}
function v6124GuildLockRemaining(){
  return Math.max(0,v6124GuildLockUntil()-Date.now());
}
function v6124GuildLockActive(){
  const until=v6124GuildLockUntil();
  if(!until)return false;
  if(until<=Date.now()){
    s.guildLeaveLockUntil=0;
    try{persist(false)}catch(e){}
    return false;
  }
  return true;
}
function v6124GuildLockText(ms=v6124GuildLockRemaining()){
  ms=Math.max(0,Number(ms)||0);
  const mins=Math.ceil(ms/60000);
  const h=Math.floor(mins/60),m=mins%60;
  if(h>0&&m>0)return `${h} Std. ${m} Min.`;
  if(h>0)return `${h} Std.`;
  return `${Math.max(1,m)} Min.`;
}
function v6124PaintGuildLock(){
  const card=document.getElementById('v254GuildNoGuild');
  if(!card)return false;
  let box=document.getElementById('v6124GuildLockBox');
  if(!box){
    box=document.createElement('div');
    box.id='v6124GuildLockBox';
    box.className='v6124-guild-lock';
    const row=card.querySelector('.v254-create-row');
    if(row)row.insertAdjacentElement('beforebegin',box);
    else card.appendChild(box);
  }

  const locked=v6124GuildLockActive();
  box.style.display=locked?'':'none';
  if(locked){
    box.innerHTML=`<div class="v6124-lock-icon">⏳</div><div><b>24h Gildensperre aktiv</b><span>Du hast eine Gilde verlassen. Neue Gilde oder Beitritt wieder in <strong>${v6124GuildLockText()}</strong>.</span></div>`;
  }

  ['v254GuildName','v254GuildTag','v254CreateGuild'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.disabled=locked;
  });

  card.querySelectorAll('[data-v257-apply]').forEach(btn=>{
    if(locked){
      btn.disabled=true;
      btn.dataset.v6124Locked='1';
      btn.textContent=`⏳ Gesperrt · ${v6124GuildLockText()}`;
    }
  });
  return locked;
}
function v6124StartGuildLock(){
  s.guildLeaveLockUntil=Date.now()+V6124_GUILD_LOCK_MS;
  try{persist(false)}catch(e){
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
  }
  try{
    if(typeof v075WriteCloudSave==='function'){
      setTimeout(()=>{try{void v075WriteCloudSave(true)}catch(e){}},0);
    }
  }catch(e){}
  v6124PaintGuildLock();
  return s.guildLeaveLockUntil;
}

window.v6124GuildLockActive=v6124GuildLockActive;
window.v6124GuildLockRemaining=v6124GuildLockRemaining;
window.v6124GuildLockText=v6124GuildLockText;
window.v6124PaintGuildLock=v6124PaintGuildLock;
window.v6124StartGuildLock=v6124StartGuildLock;

async function v254EnsureOnline(){
  if(typeof v073Init!=='function')return false;
  if(!(await v073Init()))return false;
  return !!v073User && !!v073Db && !v073User.is_anonymous;
}

async function v254LoadGuild(){
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

    /* V4.02: guild_members has its FK to auth.users, not profiles.
       Therefore PostgREST cannot embed profiles(...) here. Load both tables
       separately and merge by user id. */
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
        .select('id,character_name,class_id,class_name,level,combat_power')
        .in('id',userIds);
      if(perr)throw perr;
      profileRows=profiles||[];
    }

    const profileMap=new Map(profileRows.map(row=>[row.id,row]));
    v254Members=memberRows.map(row=>({
      ...row,
      profile:profileMap.get(row.user_id)||null
    }));

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
}

function v254MemberHtml(m){
  const p=m.profile || (Array.isArray(m.profiles)?m.profiles[0]:m.profiles);
  const cls=p?.class_id||'grower';
  const avatar=typeof v080AvatarFor==='function'?v080AvatarFor(cls):'';
  const role=m.role==='leader'?'Anführer':m.role==='officer'?'Offizier':'Mitglied';
  return `<div class="v254-member">
    <img src="${v254GuildEsc(avatar)}" alt="">
    <div><b>${v254GuildEsc(p?.character_name||'Spieler')}</b><small>${v254GuildEsc(p?.class_name||'')} · Lv. ${Number(p?.level)||1} · ${role}</small></div>
    <div class="v254-member-flags">
      <span class="v254-flag ${m.attack_signed?'on':''}">⚔ ${m.attack_signed?'Angriff':'—'}</span>
      <span class="v254-flag ${m.defense_signed?'on':''}">🛡 ${m.defense_signed?'Verteidigung':'—'}</span>
      <span class="v254-flag ${m.boss_signed?'on':''}">👹 ${m.boss_signed?'Boss':'—'}</span>
    </div>
  </div>`;
}

function v254RenderGuild(){
  const no=document.querySelector('#v254GuildNoGuild');
  const dash=document.querySelector('#v254GuildDashboard');
  if(!no||!dash)return;

  const has=!!v254Guild&&!!v254Membership;
  no.style.display=has?'none':'';
  dash.style.display=has?'':'none';

  if(!has){
    v6124PaintGuildLock();
    return;
  }

  const buds=Number(v254Guild.guild_buds)||0;
  const xp=Number(v254Guild.xp_level)||0;
  const gold=Number(v254Guild.gold_level)||0;

  ['v254GuildBuds','v254GuildBudsTop'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.textContent=buds;
  });
  document.querySelector('#v254GuildNameView').textContent=v254Guild.name||'Gilde';
  document.querySelector('#v254GuildTagView').textContent=`[${v254Guild.tag||'GL'}]`;
  document.querySelector('#v254GuildMeta').textContent=`${v254Members.length} Mitglieder`;
  document.querySelector('#v254XpBonus').textContent=`Stufe ${xp} · +${v254BonusPct(xp)}%`;
  document.querySelector('#v254GoldBonus').textContent=`Stufe ${gold} · +${v254BonusPct(gold)}%`;
  document.querySelector('#v254UpgradeXp').textContent=`${v254UpgradeCost(xp)} 🌿`;
  document.querySelector('#v254UpgradeGold').textContent=`${v254UpgradeCost(gold)} 🌿`;
  /* V6.120: Anführer -> Offiziere -> Mitglieder, then highest level first. */
  const v6120RoleRank={leader:0,officer:1,member:2};
  const v6120Members=[...v254Members].sort((a,b)=>{
    const ra=v6120RoleRank[String(a?.role||'member')]??9;
    const rb=v6120RoleRank[String(b?.role||'member')]??9;
    if(ra!==rb)return ra-rb;
    const la=Number(a?.profile?.level)||0;
    const lb=Number(b?.profile?.level)||0;
    if(la!==lb)return lb-la;
    return String(a?.profile?.character_name||'').localeCompare(String(b?.profile?.character_name||''),'de');
  });
  document.querySelector('#v254GuildMembers').innerHTML=v6120Members.length?v6120Members.map(v254MemberHtml).join(''):'<div class="empty">Noch keine Mitglieder.</div>';

  const attack=!!v254Membership.attack_signed;
  const defense=!!v254Membership.defense_signed;
  try{setTimeout(()=>window.v6245RefreshGuildInvites?.({silent:true}),0)}catch(_){}
  const boss=!!v254Membership.boss_signed;
  const a=document.querySelector('#v254AttackSignup'),d=document.querySelector('#v254DefenseSignup'),b=document.querySelector('#v254BossSignup');
  if(a){a.classList.toggle('on',attack);a.querySelector('small').textContent=attack?'Angemeldet':'Nicht angemeldet'}
  if(d){d.classList.toggle('on',defense);d.querySelector('small').textContent=defense?'Angemeldet':'Nicht angemeldet'}
  if(b){b.textContent=boss?'✓ Für Gildenboss angemeldet':'👹 Für Gildenboss anmelden'}
  const count=v254Members.filter(x=>x.boss_signed).length;
  const ce=document.querySelector('#v254BossCount');if(ce)ce.textContent=count;

  /* Guild cleanup Phase 2: direct owners instead of two render wrappers. */
  try{if(typeof v257RenderManagement==='function')v257RenderManagement()}catch(e){console.warn('Guild management paint',e)}
  try{if(typeof window.v408PaintGuildUpgrades==='function')window.v408PaintGuildUpgrades()}catch(e){console.warn('Guild upgrade paint',e)}
}

async function v254CreateGuild(){
  if(v6124GuildLockActive()){
    v6124PaintGuildLock();
    return v063Toast('24h Gildensperre aktiv','warn',`Neue Gilde in ${v6124GuildLockText()} möglich.`);
  }
  const name=String(document.querySelector('#v254GuildName')?.value||'').trim();
  const tag=String(document.querySelector('#v254GuildTag')?.value||'').trim().toUpperCase();
  if(name.length<3||name.length>24)return v063Toast('Gildenname ungültig','warn','3–24 Zeichen.');
  if(!/^[A-Z0-9ÄÖÜ]{2,5}$/i.test(tag))return v063Toast('Gilden-Tag ungültig','warn','2–5 Buchstaben/Zahlen.');
  const modName=window.v7185Moderation?.check?.(name,'guild_name');
  const modTag=window.v7185Moderation?.check?.(tag,'guild_tag');
  if(modName?.blocked||modTag?.blocked)return v063Toast('Gildenname nicht zulässig','warn',(modName||modTag).message||'Bitte einen anderen Namen oder Tag wählen.');
  if(!(await v254EnsureOnline()))return v063Toast('Account erforderlich','warn');

  const {error}=await v073Db.rpc('v254_create_guild',{p_name:name,p_tag:tag});
  if(error)return v063Toast('Gilde konnte nicht gegründet werden','error',error.message||'');
  v063Toast('Gilde gegründet','success',`${name} [${tag}]`);
  await v254LoadGuild();
}

async function v254ToggleSignup(kind){
  if(!v254Membership||!(await v254EnsureOnline()))return;
  const field={attack:'attack_signed',defense:'defense_signed',boss:'boss_signed'}[kind];
  if(!field)return;
  const next=!v254Membership[field];
  const {error}=await v073Db.rpc('v254_set_guild_signup',{p_kind:kind,p_value:next});
  if(error)return v063Toast('Anmeldung fehlgeschlagen','error',error.message||'');
  v254Membership[field]=next;
  await v254LoadGuild();
}

async function v254BuyUpgrade(kind){
  if(!v254Guild||!(await v254EnsureOnline()))return;
  const {data,error}=await v073Db.rpc('v254_buy_guild_upgrade',{p_kind:kind});
  if(error)return v063Toast('Upgrade nicht möglich','warn',error.message||'');
  v063Toast('Gildenbonus verbessert','success',kind==='xp'?'Mehr EXP für alle Mitglieder.':'Mehr Gold für alle Mitglieder.');
  await v254LoadGuild();
}

function v254BindGuild(){
  document.querySelector('#v254CreateGuild')?.addEventListener('click',v254CreateGuild);
  document.querySelector('#v254AttackSignup')?.addEventListener('click',()=>v254ToggleSignup('attack'));
  document.querySelector('#v254DefenseSignup')?.addEventListener('click',()=>v254ToggleSignup('defense'));
  document.querySelector('#v254BossSignup')?.addEventListener('click',()=>v254ToggleSignup('boss'));
  document.querySelector('#v254UpgradeXp')?.addEventListener('click',()=>v254BuyUpgrade('xp'));
  document.querySelector('#v254UpgradeGold')?.addEventListener('click',()=>v254BuyUpgrade('gold'));
  document.querySelectorAll('[data-v254-tab]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('[data-v254-tab]').forEach(x=>x.classList.toggle('active',x===btn));
      const tab=btn.dataset.v254Tab;
      document.querySelector('#v254GuildOverview').style.display=tab==='overview'?'':'none';
      document.querySelector('#v254GuildBoss').style.display=tab==='boss'?'':'none';
      document.querySelector('#v254GuildWar').style.display=tab==='war'?'':'none';
    });
  });
}

/* Add Guild to the existing complete menu. */
const v254BaseMenu=v086BuildCompleteMenu;
v086BuildCompleteMenu=function(){
  v254BaseMenu();
  const panel=document.querySelector('#v032MenuPanel');
  if(!panel||panel.querySelector('[data-screen="guild"]'))return;
  const hall=panel.querySelector('[data-screen="hall"]');
  const btn=document.createElement('button');
  btn.className='top-menu-item';
  btn.dataset.screen='guild';
  btn.innerHTML='<span>🏰</span>Gilde';
  btn.onclick=()=>v032Go('guild');
  if(hall)panel.insertBefore(btn,hall);else panel.appendChild(btn);
};

/* Open/refresh Guild screen without changing existing navigation behavior. */
const v254BaseGo=v032Go;
v032Go=function(id){
  const r=v254BaseGo(id);
  if(id==='guild')setTimeout(v254LoadGuild,0);
  return r;
};

setTimeout(()=>{
  v254BindGuild();
  try{v086BuildCompleteMenu()}catch(e){}
  
  const line=document.querySelector('#v141VersionLine');
},700);

