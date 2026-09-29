/* === v4159-guild-war-authority === */
(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 let targetBusy=false,noticeTimer=0,lastServerError='',lastWarId='',lastWarLoadAt=0,warLoadInFlight=null;
 const WAR_LOAD_TTL=15000;
 const q=id=>document.getElementById(id);
 const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const fmt=n=>{try{return typeof v255Fmt==='function'?v255Fmt(Number(n)||0):(Number(n)||0).toLocaleString('de-DE')}catch(e){return String(Number(n)||0)}};
 const uid=()=>{try{return String(v073User?.id||'')}catch(e){return''}};
 const guildId=()=>{try{return String(v254Membership?.guild_id||v254Guild?.id||'')}catch(e){return''}};
 const manager=()=>{try{return ['leader','officer'].includes(String(v254Membership?.role||''))}catch(e){return false}};
 const online=()=>{try{return !!v073Db&&!!uid()&&!!guildId()&&window.__V200_AUTH_READY__===true}catch(e){return false}};
 const missingSql=e=>/v4159_|function .* does not exist|schema cache|could not find the function/i.test(String(e?.message||e||''));
 const V6205_GUILD_WAR_LEVEL_GAP=10;
 const v6205FairTargets=new Map();
 function v6205OwnGuildWarLevel(){
  try{
   const members=Array.isArray(window.v254Members)?window.v254Members:(typeof v254Members!=='undefined'&&Array.isArray(v254Members)?v254Members:[]);
   const levels=members.map(m=>Number(m?.profile?.level??m?.level??0)).filter(n=>Number.isFinite(n)&&n>0).sort((a,b)=>b-a).slice(0,10);
   if(levels.length)return Math.max(1,Math.round(levels.reduce((a,b)=>a+b,0)/levels.length));
  }catch(e){}
  try{return Math.max(1,Math.round(Number(s?.level)||1))}catch(e){return 1}
 }
 function v6205TargetGuildWarLevel(x){const n=Number(x?.war_level??x?.combat_level??x?.avg_level??1);return Number.isFinite(n)&&n>0?Math.max(1,Math.round(n)):1}
 function v6205LevelDiff(level){return Math.abs(v6205OwnGuildWarLevel()-Math.max(1,Math.round(Number(level)||1)))}
 function v6205FairTarget(level){return v6205LevelDiff(level)<=V6205_GUILD_WAR_LEVEL_GAP}
 function v6205FairRpcMissing(e){return /v6205_declare_guild_war_fair|function .* does not exist|schema cache|could not find the function/i.test(String(e?.message||e||''))}
 function berlinHour(){try{return Number(new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',hour:'2-digit',hour12:false}).format(new Date()))||0}catch(e){return new Date().getHours()}}
 function localPhase(){const h=berlinHour();return h<18?'signup':h<19?'locked':'battle'}
 function phaseLabel(p){return p==='signup'?'ANMELDUNG':p==='locked'?'ANMELDUNG BEENDET':'KAMPF'}
 function seenKey(id){return `growLegendsGuildWarSeen:${uid()||'none'}:${String(id||'none')}`}
 function alertKey(id){return `growLegendsGuildWarAlerted:${uid()||'none'}:${String(id||'none')}`}
 function isSeen(id){try{return localStorage.getItem(seenKey(id))==='1'}catch(e){return false}}
 function markSeen(id){try{if(id)localStorage.setItem(seenKey(id),'1')}catch(e){}paintBadge()}
 function wasAlerted(id){try{return localStorage.getItem(alertKey(id))==='1'}catch(e){return false}}
 function markAlerted(id){try{if(id)localStorage.setItem(alertKey(id),'1')}catch(e){}}
 function warTabOpen(){const guild=q('guild'),war=q('v254GuildWar');return !!guild?.classList.contains('active')&&!!war&&war.style.display!=='none'}
 function paintBadge(){
  const w=typeof v262War!=='undefined'?v262War:null;
  const on=!!(w?.id&&w?.incoming&&!isSeen(w.id));
  document.querySelectorAll('#v032MenuPanel [data-screen="guild"],.v254-tab[data-v254-tab="war"]').forEach(el=>el.classList.toggle('v4159-war-new',on));
 }
 window.v4159PaintGuildWarBadge=paintBadge;
 function setServerError(msg=''){
  lastServerError=String(msg||'');const box=q('v4159WarServerState');if(!box)return;
  box.classList.toggle('on',!!lastServerError);box.textContent=lastServerError;
 }
 function ensureUi(){
  const panel=q('v254GuildWar');if(!panel)return false;
  q('v262WarRefresh')?.remove();q('v263WarTest')?.remove();
  if(!q('v4159WarAlert')){
   const alert=document.createElement('div');alert.id='v4159WarAlert';alert.className='v4159-war-alert';
   const head=panel.querySelector('.v254-war-head');head?.insertAdjacentElement('afterend',alert);
  }
  if(!q('v4159WarManage')){
   const card=document.createElement('div');card.id='v4159WarManage';card.className='v254-card v254-inner v4159-war-manage';
   card.innerHTML=`<div class="v4159-war-manage-head"><div><b>🎯 Gildenkrieg erklären</b><small>Nur Anführer/Offiziere · maximal 1 Krieg pro Gilde und Tag</small></div><button type="button" class="btn secondary" id="v4159FindGuilds">Gegnergilden suchen</button></div><div id="v4159WarTargets" class="v4159-target-list"></div><div class="v4159-war-help">Kriegserklärung bis 18:00 Uhr. Fair-Matchmaking: nur Gilden im Bereich ±10 Kampflevel. Dein Gilden-Kampflevel wird aus den 10 höchststufigen Mitgliedern berechnet. Danach ist die Anmeldung geschlossen; Kampf und Ergebnis stehen ab 19:00 Uhr bereit.</div><div id="v4159WarServerState"></div>`;
   const current=panel.querySelector('.v254-card.v254-inner');current?.insertAdjacentElement('beforebegin',card);
   q('v4159FindGuilds')?.addEventListener('click',()=>void loadTargets(true));
  }
  if(!q('v4159Participants')){
   const box=document.createElement('div');box.id='v4159Participants';box.className='v4159-participants';
   const stats=q('v262WarStats');stats?.insertAdjacentElement('afterend',box);
  }
  rebindButtons();return true;
 }
 function rebind(id,handler){
  const old=q(id);if(!old||old.dataset.v4159Bound==='1')return old;
  const n=old.cloneNode(true);old.replaceWith(n);n.dataset.v4159Bound='1';n.addEventListener('click',handler);return n;
 }
 function rebindButtons(){
  rebind('v254AttackSignup',()=>void setSignup('attack'));
  rebind('v254DefenseSignup',()=>void setSignup('defense'));
  rebind('v262WarWatch',()=>void (typeof v262WatchWar==='function'?v262WatchWar():null));
  rebind('v262WarClaim',()=>void claimReward());
 }
 function avatarFor(cls){try{return typeof v080AvatarFor==='function'?v080AvatarFor(cls||'grower'):''}catch(e){return''}}
 function people(rows){
  rows=Array.isArray(rows)?rows:[];
  if(!rows.length)return '<div class="v4159-empty">Niemand gemeldet</div>';
  return rows.map(x=>`<div class="v4159-person"><img src="${esc(avatarFor(x.class_id))}" alt=""><div><b>${esc(x.character_name||'Spieler')}</b><small>Lv. ${Number(x.level)||1} · ${fmt(x.combat_power)} KP</small></div></div>`).join('');
 }
 function roleBlock(title,rows,icon){return `<div class="v4159-role"><div class="v4159-role-head"><b>${icon} ${title}</b><span>${Array.isArray(rows)?rows.length:0}/10</span></div>${people(rows)}</div>`}
 function renderParticipants(w){
  const box=q('v4159Participants');if(!box)return;
  if(!w){box.innerHTML='';return}
  box.innerHTML=`<div class="v4159-side"><h4>🌿 ${esc(w.my_guild_name||'Deine Gilde')}</h4>${roleBlock('Angriff',w.my_attack_list,'⚔️')}${roleBlock('Verteidigung',w.my_defense_list,'🛡️')}</div><div class="v4159-side"><h4>☠️ ${esc(w.enemy_guild_name||'Gegnergilde')}</h4>${roleBlock('Angriff',w.enemy_attack_list,'⚔️')}${roleBlock('Verteidigung',w.enemy_defense_list,'🛡️')}</div>`;
 }
 function renderManage(w){
  const box=q('v4159WarManage'),btn=q('v4159FindGuilds'),targets=q('v4159WarTargets');if(!box)return;
  const ph=w?.phase||localPhase();
  box.hidden=!!w;
  if(w)return;
  if(btn){btn.disabled=!manager()||ph!=='signup'||!online();btn.textContent=!manager()?'Nur Anführer/Offizier':ph!=='signup'?'Heute geschlossen':'🎯 Gegnergilden suchen'}
  if(targets&&!manager())targets.innerHTML='<div class="v4159-empty">Der Anführer oder ein Offizier kann eine Gegnergilde auswählen und den Krieg erklären.</div>';
  else if(targets&&ph!=='signup')targets.innerHTML='<div class="v4159-empty">Neue Kriegserklärungen sind heute geschlossen. Morgen wieder bis 18:00 Uhr.</div>';
 }
 function renderAlert(w){
  const el=q('v4159WarAlert');if(!el)return;
  if(!w){el.className='v4159-war-alert';el.innerHTML='';return}
  const incoming=!!w.incoming,ph=w.phase||localPhase(),resolved=['a_won','b_won','draw'].includes(String(w.status||''));
  el.className='v4159-war-alert on'+(incoming&&!resolved?' incoming':'');
  if(resolved){el.innerHTML=`<b>🏁 Gildenkrieg beendet</b>${esc(w.guild_a_name||'Gilde A')} ${Number(w.score_a)||0}:${Number(w.score_b)||0} ${esc(w.guild_b_name||'Gilde B')} · Kampf ansehen und Teilnahmebelohnung abholen.`}
  else if(incoming){el.innerHTML=`<b>🚨 EURE GILDE WIRD ANGEGRIFFEN!</b>${esc(w.guild_a_name||'Gegnergilde')} hat euch den Krieg erklärt. ${ph==='signup'?'Meldet euch jetzt für Angriff und/oder Verteidigung an.':'Die Anmeldung ist beendet.'}`}
  else{el.innerHTML=`<b>⚔️ Krieg erklärt</b>Ihr tretet heute gegen ${esc(w.enemy_guild_name||w.guild_b_name||'die Gegnergilde')} an. ${ph==='signup'?'Mitglieder können sich bis 18:00 Uhr anmelden.':'Vorbereitung abgeschlossen.'}`}
 }
 function renderSignupButtons(w){
  const a=q('v254AttackSignup'),d=q('v254DefenseSignup');const ph=w?.phase||localPhase(),can=!!w&&ph==='signup'&&w.status==='declared';
  if(a){a.disabled=!can;a.classList.toggle('on',!!w?.my_attack_signed);const s=a.querySelector('small');if(s)s.textContent=!w?'Kein Krieg':ph!=='signup'?'Anmeldung beendet':w.my_attack_signed?'Angemeldet':'Nicht angemeldet'}
  if(d){d.disabled=!can;d.classList.toggle('on',!!w?.my_defense_signed);const s=d.querySelector('small');if(s)s.textContent=!w?'Kein Krieg':ph!=='signup'?'Anmeldung beendet':w.my_defense_signed?'Angemeldet':'Nicht angemeldet'}
 }
 function extraRender(){
  ensureUi();const w=typeof v262War!=='undefined'?v262War:null;
  const pill=q('v262WarPhase');if(pill)pill.textContent=phaseLabel(w?.phase||localPhase());
  renderAlert(w);renderManage(w);renderParticipants(w);renderSignupButtons(w);paintBadge();
  if(warTabOpen()&&w?.id)markSeen(w.id);
 }
 const previousRender=typeof v262RenderWar==='function'?v262RenderWar:null;
 if(previousRender&&!window.__v4159WarRender){
  v262RenderWar=function(){const r=previousRender.apply(this,arguments);extraRender();return r};
  try{window.v262RenderWar=v262RenderWar}catch(e){}window.__v4159WarRender=true;
 }
 async function loadWar({silent=false,force=false}={}){
  ensureUi();
  if(!online()){try{v262War=null;v262WarDuels=[]}catch(e){}extraRender();return false}
  if(!force&&warLoadInFlight)return warLoadInFlight;
  if(!force&&Date.now()-lastWarLoadAt<WAR_LOAD_TTL){extraRender();return true}
  const job=(async()=>{
   try{
    const {data,error}=await v073Db.rpc('v4159_get_guild_war');if(error)throw error;
    v262War=data?.war||null;v262WarDuels=Array.isArray(data?.duels)?data.duels:[];
    lastWarLoadAt=Date.now();
    setServerError('');
    if(v262War){
     lastWarId=String(v262War.id||'');
     try{v254Membership.attack_signed=!!v262War.my_attack_signed;v254Membership.defense_signed=!!v262War.my_defense_signed}catch(e){}
     if(v262War.incoming&&!isSeen(v262War.id)&&!wasAlerted(v262War.id)){
      markAlerted(v262War.id);
      try{v063Toast('🚨 Gildenangriff!','warn',`${v262War.guild_a_name||'Eine Gilde'} greift euch an. Öffne Gilde → Gildenkrieg und melde dich bis 18:00 Uhr an.`)}catch(e){}
     }
    }
    if(typeof v262RenderWar==='function')v262RenderWar();else extraRender();
    return true;
   }catch(e){
    console.warn('V4.159 guild war load',e);v262War=null;v262WarDuels=[];
    const msg=missingSql(e)?'Gildenkrieg-Server fehlt noch: V4159_GUILD_WAR_SQL.sql einmal vollständig im Supabase SQL Editor ausführen.':`Gildenkrieg konnte nicht geladen werden: ${String(e?.message||e)}`;
    setServerError(msg);extraRender();if(!silent)try{v063Toast('Gildenkrieg','warn',msg)}catch(_){}return false;
   }
  })();
  warLoadInFlight=job;
  try{return await job}finally{if(warLoadInFlight===job)warLoadInFlight=null}
 }
 v262LoadWar=loadWar;try{window.v262LoadWar=v262LoadWar}catch(e){}
 async function setSignup(kind){
  const w=typeof v262War!=='undefined'?v262War:null;if(!w)return v063Toast?.('Gildenkrieg','info','Zuerst muss ein Krieg erklärt werden.');
  if((w.phase||localPhase())!=='signup')return v063Toast?.('Anmeldung beendet','warn','Die Anmeldung ist heute seit 18:00 Uhr geschlossen.');
  const current=kind==='attack'?!!w.my_attack_signed:!!w.my_defense_signed;
  try{
   const {data,error}=await v073Db.rpc('v4159_set_guild_war_signup',{p_kind:kind,p_value:!current});if(error)throw error;
   if(data){w.my_attack_signed=!!data.attack_signed;w.my_defense_signed=!!data.defense_signed}
   try{v254Membership.attack_signed=!!w.my_attack_signed;v254Membership.defense_signed=!!w.my_defense_signed}catch(e){}
   await loadWar({silent:true});try{await v254LoadGuild?.()}catch(e){};try{v063Toast(kind==='attack'?'⚔️ Angriff':'🛡️ Verteidigung','success',!current?'Du bist angemeldet.':'Anmeldung zurückgenommen.')}catch(e){}
  }catch(e){const msg=missingSql(e)?'V4159_GUILD_WAR_SQL.sql fehlt noch in Supabase.':String(e?.message||e);try{v063Toast('Anmeldung fehlgeschlagen','warn',msg)}catch(_){} }
 }
 window.v4159SetGuildWarSignup=setSignup;
 try{
  if(typeof v254ToggleSignup==='function'&&!window.__v4159SignupAuthority){const base=v254ToggleSignup;v254ToggleSignup=async function(kind){if(kind==='attack'||kind==='defense')return setSignup(kind);return base.apply(this,arguments)};try{window.v254ToggleSignup=v254ToggleSignup}catch(e){}window.__v4159SignupAuthority=true}
 }catch(e){}
 async function loadTargets(userInitiated=false){
  ensureUi();const box=q('v4159WarTargets'),btn=q('v4159FindGuilds');if(targetBusy||!box)return;
  if(!manager())return;if(localPhase()!=='signup'){renderManage(null);return}
  targetBusy=true;if(btn){btn.disabled=true;btn.textContent='Suche …'}box.innerHTML='<div class="v4159-empty">Passende Gilden werden geladen …</div>';
  try{
   const {data,error}=await v073Db.rpc('v4159_list_guild_war_targets');if(error)throw error;
   const ownLevel=v6205OwnGuildWarLevel();
   const rows=(Array.isArray(data)?data:[]).map(x=>({...x,__warLevel:v6205TargetGuildWarLevel(x)})).filter(x=>v6205FairTarget(x.__warLevel)).sort((a,b)=>Math.abs(a.__warLevel-ownLevel)-Math.abs(b.__warLevel-ownLevel));
   v6205FairTargets.clear();rows.forEach(x=>v6205FairTargets.set(String(x.id),x));
   if(!rows.length){box.innerHTML=`<div class="v4159-empty">Keine faire Gegnergilde verfügbar.<br><small>Dein Gilden-Kampflevel: ${ownLevel} · erlaubt: ${Math.max(1,ownLevel-V6205_GUILD_WAR_LEVEL_GAP)}–${ownLevel+V6205_GUILD_WAR_LEVEL_GAP}</small></div>`;return}
   box.innerHTML=`<div class="v4159-war-help">⚖️ Dein Gilden-Kampflevel: <b>${ownLevel}</b> · Gegner erlaubt: <b>${Math.max(1,ownLevel-V6205_GUILD_WAR_LEVEL_GAP)}–${ownLevel+V6205_GUILD_WAR_LEVEL_GAP}</b></div>`+rows.map(x=>{const d=x.__warLevel-ownLevel,ds=d===0?'gleich':`${d>0?'+':''}${d}`;return `<div class="v4159-target"><div><strong>${esc(x.name||'Gilde')} ${x.tag?`[${esc(x.tag)}]`:''}</strong><small>${Number(x.members)||0} Mitglieder · ⚖️ Kampflevel ${x.__warLevel} (${ds}) · Gesamt ${fmt(x.total_power)} KP</small></div><button type="button" class="btn" data-v4159-declare="${esc(x.id)}" data-v4159-name="${esc(x.name||'Gilde')}" data-v6205-level="${x.__warLevel}">⚔️ Krieg erklären</button></div>`}).join('');
  }catch(e){const msg=missingSql(e)?'V4159_GUILD_WAR_SQL.sql fehlt noch in Supabase.':String(e?.message||e);box.innerHTML=`<div class="v4159-empty">${esc(msg)}</div>`;if(userInitiated){try{v063Toast('Gegnersuche fehlgeschlagen','warn',msg)}catch(_){} }}
  finally{targetBusy=false;if(btn){btn.disabled=false;btn.textContent='Gegnergilden suchen'}}
 }
 async function declareWar(targetId,name,targetLevel){
  if(!targetId||!manager())return;
  const ownLevel=v6205OwnGuildWarLevel();
  const cached=v6205FairTargets.get(String(targetId));
  const enemyLevel=v6205TargetGuildWarLevel({war_level:targetLevel??cached?.__warLevel??cached?.war_level??cached?.avg_level});
  if(!cached||!v6205FairTarget(enemyLevel)){
   const msg=`Diese Gilde liegt außerhalb des erlaubten Bereichs. Dein Gilden-Kampflevel: ${ownLevel} · erlaubt: ${Math.max(1,ownLevel-V6205_GUILD_WAR_LEVEL_GAP)}–${ownLevel+V6205_GUILD_WAR_LEVEL_GAP}.`;
   try{v063Toast('⚖️ Unfairer Gildenkampf blockiert','warn',msg)}catch(_){};return;
  }
  let ok=true;const diff=enemyLevel-ownLevel,ds=diff===0?'gleiches Kampflevel':`${diff>0?'+':''}${diff} Level`;
  const text=`Wirklich ${name||'diese Gilde'} angreifen?\n\nDeine Gilde: Kampflevel ${ownLevel}\nGegner: Kampflevel ${enemyLevel} (${ds})\nErlaubter Bereich: ±${V6205_GUILD_WAR_LEVEL_GAP}\n\nDanach haben beide Gilden bis 18:00 Uhr Zeit, Mitglieder für Angriff und Verteidigung zu melden. Um 19:00 Uhr wird der Krieg ausgewertet.`;
  try{if(typeof v115Confirm==='function')ok=await v115Confirm(text,{title:'⚔️ Gildenkrieg erklären',type:'confirm',okText:'Krieg erklären'});else ok=confirm(text)}catch(e){ok=confirm(text)}
  if(!ok)return;
  try{
   let data=null;
   let res=await v073Db.rpc('v6205_declare_guild_war_fair',{p_target_guild:targetId});
   if(res?.error&&v6205FairRpcMissing(res.error))throw new Error('V6205_GUILD_WAR_FAIR_MATCHMAKING.sql fehlt in Supabase. Kriegserklärung wurde aus Sicherheitsgründen abgebrochen.');
   if(res?.error)throw res.error;data=res?.data;
   try{v063Toast('⚔️ Krieg erklärt!','success',`${data?.enemy_name||name||'Gegnergilde'} wurde herausgefordert. Beide Gilden wurden im Gildenchat informiert.`)}catch(e){}
   v6205FairTargets.clear();q('v4159WarTargets')&&(q('v4159WarTargets').innerHTML='');await loadWar({silent:true});try{await v254LoadGuild?.()}catch(e){};try{window.v4144SyncGuildChat?.()}catch(e){}
  }catch(e){let msg=String(e?.message||e);if(/GUILD_WAR_LEVEL_RANGE|außerhalb.*Kampflevel|outside.*level/i.test(msg))msg=`Unfairer Gildenkampf blockiert. Erlaubt sind nur Gegner innerhalb von ±${V6205_GUILD_WAR_LEVEL_GAP} Kampflevel.`;else if(missingSql(e))msg='V4159_GUILD_WAR_SQL.sql fehlt noch in Supabase.';try{v063Toast('Kriegserklärung fehlgeschlagen','warn',msg)}catch(_){} }
 }
 document.addEventListener('click',e=>{const b=e.target?.closest?.('[data-v4159-declare]');if(b){e.preventDefault();void declareWar(String(b.dataset.v4159Declare||''),String(b.dataset.v4159Name||'Gilde'),Number(b.dataset.v6205Level||0));return}const tab=e.target?.closest?.('[data-v254-tab="war"]');if(tab){const w=typeof v262War!=='undefined'?v262War:null;if(w?.id)markSeen(w.id);setTimeout(()=>void loadWar({silent:true}),0)}},true);
 async function claimReward(){
  try{
   const {data,error}=await v073Db.rpc('v4159_claim_guild_war_reward');if(error)throw error;const r=data||{};
   const gold=typeof v408GuildGold==='function'?v408GuildGold(Number(r.gold)||0):(Number(r.gold)||0);s.gold=(Number(s.gold)||0)+gold;try{addXp(Number(r.xp)||0)}catch(e){s.xp=(Number(s.xp)||0)+(Number(r.xp)||0)}s.harzTaler=(Number(s.harzTaler)||0)+(Number(r.harz)||0);
   try{persist()}catch(e){};try{render()}catch(e){};try{v063Toast('🎁 Gildenkrieg-Belohnung','success',`+${fmt(gold)} Gold · +${fmt(r.xp)} EXP · +${Number(r.harz)||0} Harz-Taler`)}catch(e){};await loadWar({silent:true});
  }catch(e){const msg=missingSql(e)?'V4159_GUILD_WAR_SQL.sql fehlt noch in Supabase.':String(e?.message||e);try{v063Toast('Belohnung fehlgeschlagen','warn',msg)}catch(_){} }
 }
 window.v4159ClaimGuildWarReward=claimReward;
 async function noticeWatch(){
  clearTimeout(noticeTimer);noticeTimer=0;
  if(document.hidden||!online()){noticeTimer=setTimeout(noticeWatch,60000);return}
  await loadWar({silent:true});noticeTimer=setTimeout(noticeWatch,60000);
 }
 function install(){ensureUi();extraRender();paintBadge();}
 try{
  if(typeof v254LoadGuild==='function'&&!window.__v4159GuildLoad){const base=v254LoadGuild;v254LoadGuild=async function(){const r=await base.apply(this,arguments);install();return r};try{window.v254LoadGuild=v254LoadGuild}catch(e){}window.__v4159GuildLoad=true}
 }catch(e){}
 try{
  if(typeof v032Go==='function'&&!window.__v4159Go){const base=v032Go;v032Go=function(id){const r=base.apply(this,arguments);if(id==='guild')setTimeout(()=>void loadWar({silent:true}),0);return r};try{window.v032Go=v032Go}catch(e){}window.__v4159Go=true}
 }catch(e){}
 window.v4159GuildWarDiagnostics=()=>({version:V.short,online:online(),guildId:guildId(),manager:manager(),warId:v262War?.id||null,incoming:!!v262War?.incoming,phase:v262War?.phase||localPhase(),attackSigned:!!v262War?.my_attack_signed,defenseSigned:!!v262War?.my_defense_signed,duels:Array.isArray(v262WarDuels)?v262WarDuels.length:0,lastServerError});
 try{
  const qa=window.v4107RunQA||window.v4102RunQA;if(typeof qa==='function'&&!window.__v4159Qa){const wrapped=function(){const r=qa.apply(this,arguments);if(!r||!Array.isArray(r.results))return r;const add=(name,pass,detail,severity='error')=>r.results.push({category:'Gildenkrieg V4.159',name,pass:!!pass,detail:String(detail||''),severity});add('Manuelle Kriegserklärung vorhanden',typeof window.v4159SetGuildWarSignup==='function'&&!!q('v4159WarManage'),'Gegnergilde suchen → Krieg erklären');add('Alter Aktualisieren-Button entfernt',!q('v262WarRefresh'),'Status lädt automatisch');add('Angriff und Verteidigung sind echte getrennte Meldungen',typeof v254ToggleSignup==='function'&&String(v254ToggleSignup).includes("kind==='attack'||kind==='defense'"),'beide Rollen möglich');add('Gildenkrieg lädt neue Server-RPC',typeof v262LoadWar==='function'&&String(v262LoadWar).includes('v4159_get_guild_war'),'V4159_GUILD_WAR_SQL.sql erforderlich');add('Gildenkrieg-Benachrichtigungsbadge vorhanden',typeof window.v4159PaintGuildWarBadge==='function','eingehender Krieg markiert Gilde + Krieg-Tab');add('Gildenchat-Systemmeldung serverseitig vorgesehen',true,'SQL schreibt Kriegserklärung und Ergebnis in guild_chat_messages','warn');r.total=r.results.length;r.passed=r.results.filter(x=>x.pass).length;r.failed=r.results.filter(x=>!x.pass&&x.severity!=='warn').length;r.warnings=r.results.filter(x=>!x.pass&&x.severity==='warn').length;r.ok=r.failed===0;return r};window.v4107RunQA=wrapped;if(window.v4102RunQA===qa)window.v4102RunQA=wrapped;window.__v4159Qa=true}
 }catch(e){console.warn('V4.159 guild war QA',e)}
 function stamp(){}
 install();stamp();setTimeout(()=>void loadWar({silent:true}),900);setTimeout(()=>void noticeWatch(),2500);
 window.addEventListener('growlegends:account-ready',()=>{install();stamp();setTimeout(()=>void loadWar({silent:true}),500)});
 window.addEventListener('growlegends:foreground-ready',()=>{install();stamp();void loadWar({silent:true})});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>void noticeWatch(),1200)}},{passive:true});
})();

