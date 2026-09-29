/* === v6245-guild-invites === */
(()=>{
'use strict';
if(window.__V6245_GUILD_INVITES__)return;
window.__V6245_GUILD_INVITES__=true;

let incoming=[],sent=[],searchRows=[],loadingIncoming=false,loadingSent=false,searchBusy=false,lastIncomingAt=0,lastSentAt=0;
const INCOMING_TTL=90000,SENT_TTL=120000;
const q=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const num=x=>Math.max(0,Number(x)||0);

function online(){
 try{return !!v073Db&&!!v073User&&!v073User.is_anonymous&&window.__V200_AUTH_READY__===true}catch(_){return false}
}
function manager(){
 try{
   if(typeof v257CanManage==='function')return !!v257CanManage();
   return !!v254Guild&&!!v254Membership&&['leader','officer'].includes(String(v254Membership.role||''));
 }catch(_){return false}
}
function noGuild(){
 try{return !v254Guild&&!v254Membership}catch(_){return true}
}
function avatar(row){
 try{return typeof v080AvatarFor==='function'?v080AvatarFor(row?.class_id||'grower'):''}catch(_){return''}
}
function expiryText(iso){
 const ms=Math.max(0,new Date(iso).getTime()-Date.now());
 if(!ms)return'läuft ab';
 const h=Math.floor(ms/3600000),m=Math.ceil((ms%3600000)/60000);
 if(h>=24)return`${Math.floor(h/24)} Tg. ${h%24} Std.`;
 if(h>0)return`${h} Std. ${m} Min.`;
 return`${Math.max(1,m)} Min.`
}
function errorText(e){
 const s=String(e?.message||e||'Unbekannter Fehler');
 if(/v6245_|function .* does not exist|schema cache/i.test(s))return'Gilden-Einladungen sind serverseitig noch nicht eingerichtet.';
 return s
}

function paintMenuBadge(){
 const count=incoming.length;
 document.querySelectorAll('#v032MenuPanel [data-screen="guild"]').forEach(btn=>{
   let b=btn.querySelector('.v6245-menu-badge');
   if(count){
     if(!b){b=document.createElement('span');b.className='v6245-menu-badge';btn.appendChild(b)}
     b.textContent=count>9?'9+':String(count);
     b.title=`${count} offene Gildeneinladung${count===1?'':'en'}`;
   }else b?.remove();
 });
}

function ensureIncomingCard(){
 const host=q('v254GuildNoGuild');if(!host)return null;
 let card=q('v6245IncomingInvitesCard');
 if(!card){
   card=document.createElement('div');
   card.id='v6245IncomingInvitesCard';
   card.className='v6245-incoming-card';
   const divider=host.querySelector('.v257-divider');
   if(divider)host.insertBefore(card,divider);else host.appendChild(card);
 }
 return card
}

function ensureManagerCard(){
 const overview=q('v254GuildOverview');if(!overview)return null;
 let card=q('v6245GuildInviteCard');
 if(!card){
   card=document.createElement('div');
   card.id='v6245GuildInviteCard';
   card.className='v254-card v254-inner v6245-invite-card';
   card.innerHTML=`
    <div class="section-title">
      <div><h3>👥 Spieler einladen</h3><div class="muted">Anführer und Offiziere können Spieler direkt in die Gilde einladen. Einladungen gelten 48 Stunden.</div></div>
    </div>
    <div class="v6245-search-row">
      <input id="v6245PlayerSearch" maxlength="24" placeholder="Charaktername · mindestens 2 Zeichen">
      <button type="button" class="btn secondary" id="v6245PlayerSearchBtn">Suchen</button>
    </div>
    <div id="v6245PlayerResults" class="v6245-results"><div class="v6245-empty">Suche einen Spieler nach seinem Charakternamen.</div></div>
    <div class="v6245-subhead"><b>📨 Offene Einladungen</b><span id="v6245SentCount">0 offen</span></div>
    <div id="v6245SentInvites" class="v6245-sent"><div class="v6245-empty">Keine offenen Einladungen.</div></div>`;
   const mgmt=q('v257GuildManagement');
   const holder=mgmt?.parentElement||overview;
   holder.appendChild(card);
 }
 if(card.dataset.v6246Bound!=='1'){
   q('v6245PlayerSearchBtn')?.addEventListener('click',searchPlayers);
   q('v6245PlayerSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter')searchPlayers()});
   card.dataset.v6246Bound='1';
 }
 return card
}

function renderIncoming(){
 const card=ensureIncomingCard();if(!card)return;
 if(!noGuild()||!incoming.length){card.style.display='none';return}
 card.style.display='';
 const locked=typeof v6124GuildLockActive==='function'&&v6124GuildLockActive();
 card.innerHTML=`
  <div class="v6245-incoming-head"><div><h3>🏰 Gilden-Einladungen</h3><div class="muted">Eine Gilde möchte dich aufnehmen.</div></div><span class="pill">${incoming.length}</span></div>
  <div class="v6245-incoming">${incoming.map(r=>`
    <div class="v6245-incoming-row">
      <div class="v6245-guild-icon">🏰</div>
      <div><b>[${esc(r.guild_tag||'GL')}] ${esc(r.guild_name||'Gilde')}</b><small>👥 ${num(r.member_count)}/${num(r.max_members)||20} · eingeladen von ${esc(r.inviter_name||'Gildenleitung')} · noch ${esc(expiryText(r.expires_at))}</small></div>
      <div class="v6245-invite-actions">
        <button class="v6245-mini good" data-v6245-accept="${esc(r.id)}" ${locked?'disabled':''}>${locked?'⏳ Gildensperre':'✓ Annehmen'}</button>
        <button class="v6245-mini bad" data-v6245-reject="${esc(r.id)}">Ablehnen</button>
      </div>
    </div>`).join('')}</div>`;
 card.querySelectorAll('[data-v6245-accept]').forEach(b=>b.onclick=()=>handleInvite(b.dataset.v6245Accept,true));
 card.querySelectorAll('[data-v6245-reject]').forEach(b=>b.onclick=()=>handleInvite(b.dataset.v6245Reject,false));
}

function renderSent(){
 const card=ensureManagerCard();if(!card)return;
 const canManage=manager();
 card.style.display=canManage?'':'none';
 card.toggleAttribute('data-v6246-visible',canManage);
 if(!canManage)return;
 const box=q('v6245SentInvites'),count=q('v6245SentCount');if(count)count.textContent=`${sent.length} offen`;
 if(!box)return;
 box.innerHTML=sent.length?sent.map(r=>`
  <div class="v6245-sent-row">
    <div style="font-size:23px;text-align:center">📨</div>
    <div><b>${esc(r.character_name||'Spieler')}</b><small>${esc(r.class_name||'')} · Lv. ${num(r.level)||1} · Kampfkraft ${num(r.combat_power)} · noch ${esc(expiryText(r.expires_at))}</small></div>
    <div class="v6245-player-actions"><button class="v6245-mini bad" data-v6245-cancel="${esc(r.id)}">Zurückziehen</button></div>
  </div>`).join(''):'<div class="v6245-empty">Keine offenen Einladungen.</div>';
 box.querySelectorAll('[data-v6245-cancel]').forEach(b=>b.onclick=()=>cancelInvite(b.dataset.v6245Cancel));
}

function renderSearch(){
 const box=q('v6245PlayerResults');if(!box)return;
 if(searchBusy){box.innerHTML='<div class="v6245-empty">Spieler werden gesucht …</div>';return}
 if(!searchRows.length){box.innerHTML='<div class="v6245-empty">Keine passenden Spieler gefunden.</div>';return}
 box.innerHTML=searchRows.map(r=>{
   const inGuild=!!r.current_guild_id,pending=!!r.invite_pending,applied=!!r.join_request_pending;
   const disabled=inGuild||pending||applied;
   const label=inGuild?`In ${esc(r.current_guild_name||'einer Gilde')}`:applied?'Bewerbung offen':pending?'✓ Eingeladen':'Einladen';
   const av=avatar(r);
   return `<div class="v6245-player">
     ${av?`<img src="${esc(av)}" alt="">`:'<div class="v6245-guild-icon">🧙</div>'}
     <div><b>${esc(r.character_name||'Spieler')}</b><small>${esc(r.class_name||'')} · Lv. ${num(r.level)||1} · Kampfkraft ${num(r.combat_power)}${inGuild?` · ${esc(r.current_guild_name||'Gilde')}`:''}</small></div>
     <div class="v6245-player-actions"><button class="v6245-mini ${disabled?'':'good'}" data-v6245-invite="${esc(r.id)}" ${disabled?'disabled':''}>${label}</button></div>
   </div>`
 }).join('');
 box.querySelectorAll('[data-v6245-invite]:not([disabled])').forEach(b=>b.onclick=()=>invitePlayer(b.dataset.v6245Invite));
}

async function loadIncoming({silent=true,force=false}={}){
 if(!online()){incoming=[];paintMenuBadge();renderIncoming();return false}
 if(!force&&Date.now()-lastIncomingAt<INCOMING_TTL){paintMenuBadge();renderIncoming();return true}
 if(loadingIncoming)return false
 loadingIncoming=true;
 try{
   const {data,error}=await v073Db.rpc('v6245_get_my_guild_invites');
   if(error)throw error;
   incoming=Array.isArray(data)?data:[];lastIncomingAt=Date.now();
   paintMenuBadge();renderIncoming();
   return true
 }catch(e){
   console.warn('V6.245 incoming guild invites',e);
   incoming=[];paintMenuBadge();renderIncoming();
   if(!silent)v063Toast?.('Einladungen konnten nicht geladen werden','warn',errorText(e));
   return false
 }finally{loadingIncoming=false}
}

async function loadSent({silent=true,force=false}={}){
 if(!online()||!manager()){sent=[];renderSent();return false}
 if(!force&&Date.now()-lastSentAt<SENT_TTL){renderSent();return true}
 if(loadingSent)return false
 loadingSent=true;
 try{
   const {data,error}=await v073Db.rpc('v6245_get_sent_guild_invites');
   if(error)throw error;
   sent=Array.isArray(data)?data:[];lastSentAt=Date.now();
   renderSent();return true
 }catch(e){
   console.warn('V6.245 sent guild invites',e);sent=[];renderSent();
   if(!silent)v063Toast?.('Offene Einladungen konnten nicht geladen werden','warn',errorText(e));
   return false
 }finally{loadingSent=false}
}

async function searchPlayers(){
 if(!online()||!manager())return;
 const input=q('v6245PlayerSearch'),term=String(input?.value||'').trim();
 if(term.length<2)return v063Toast?.('Spielersuche','warn','Bitte mindestens 2 Zeichen eingeben.');
 searchBusy=true;searchRows=[];renderSearch();
 try{
   const {data,error}=await v073Db.rpc('v6245_search_players',{p_query:term});
   if(error)throw error;
   searchRows=Array.isArray(data)?data:[];
 }catch(e){
   console.warn('V6.245 player search',e);
   v063Toast?.('Spielersuche fehlgeschlagen','warn',errorText(e));
 }finally{searchBusy=false;renderSearch()}
}

async function invitePlayer(userId){
 if(!online()||!manager()||!userId)return;
 try{
   const {error}=await v073Db.rpc('v6245_invite_player',{p_user:userId});
   if(error)throw error;
   v063Toast?.('Gildeneinladung gesendet','success','Der Spieler kann die Einladung 48 Stunden lang annehmen.');
   await Promise.allSettled([loadSent({silent:true}),searchPlayers()]);
 }catch(e){v063Toast?.('Einladung fehlgeschlagen','warn',errorText(e))}
}

async function cancelInvite(inviteId){
 if(!online()||!manager()||!inviteId)return;
 try{
   const {error}=await v073Db.rpc('v6245_cancel_guild_invite',{p_invite:inviteId});
   if(error)throw error;
   v063Toast?.('Einladung zurückgezogen','success');
   await loadSent({silent:true});
   if(String(q('v6245PlayerSearch')?.value||'').trim().length>=2)await searchPlayers();
 }catch(e){v063Toast?.('Einladung konnte nicht zurückgezogen werden','warn',errorText(e))}
}

async function handleInvite(inviteId,accept){
 if(!online()||!inviteId)return;
 if(accept&&typeof v6124GuildLockActive==='function'&&v6124GuildLockActive()){
   v6124PaintGuildLock?.();
   return v063Toast?.('24h Gildensperre aktiv','warn',`Beitritt wieder in ${v6124GuildLockText?.()||'Kürze'} möglich.`);
 }
 try{
   const {error}=await v073Db.rpc('v6245_handle_guild_invite',{p_invite:inviteId,p_accept:!!accept});
   if(error)throw error;
   if(accept){
     incoming=[];paintMenuBadge();
     v063Toast?.('Gildeneinladung angenommen','success','Willkommen in deiner neuen Gilde!');
     try{await v254LoadGuild()}catch(_){}
     try{window.v4144SyncGuildChat?.()}catch(_){}
   }else{
     v063Toast?.('Einladung abgelehnt','success');
     await loadIncoming({silent:true});
   }
   await refresh({silent:true});
 }catch(e){v063Toast?.(accept?'Beitritt fehlgeschlagen':'Ablehnen fehlgeschlagen','warn',errorText(e))}
}

async function refresh({silent=true,force=false}={}){
 ensureIncomingCard();ensureManagerCard();
 const jobs=[loadIncoming({silent,force})];
 if(manager())jobs.push(loadSent({silent,force}));
 else{sent=[];renderSent()}
 await Promise.allSettled(jobs);
 renderIncoming();paintMenuBadge();
}

function installLoadHook(){
 try{
   const fn=typeof v254LoadGuild==='function'?v254LoadGuild:null;
   if(!fn||fn.__v6245Invites)return;
   const wrapped=async function(){
     const r=await fn.apply(this,arguments);
     setTimeout(()=>{if(document.querySelector('#guild')?.classList.contains('active'))void refresh({silent:true})},700);
     return r
   };
   wrapped.__v6245Invites=true;
   v254LoadGuild=wrapped;window.v254LoadGuild=wrapped;
 }catch(e){console.warn('V6.245 guild load hook',e)}
}

function installNavHook(){
 if(window.__V6245_GUILD_NAV__)return;window.__V6245_GUILD_NAV__=true;
 document.addEventListener('click',e=>{
   const guildBtn=e.target?.closest?.('#v032MenuPanel [data-screen="guild"],[data-go="guild"]');
   if(guildBtn)setTimeout(()=>void refresh({silent:true}),750);
 },true);
}

window.v6245RefreshGuildInvites=refresh;
window.v6245GuildInviteDiagnostics=()=>({
 online:online(),manager:manager(),guildId:String(v254Guild?.id||v254Membership?.guild_id||''),
 incoming:incoming.length,sent:sent.length,searchResults:searchRows.length,lastIncomingAt,lastSentAt,incomingTtlMs:INCOMING_TTL,sentTtlMs:SENT_TTL,
 serverFunctions:['v6245_search_players','v6245_invite_player','v6245_get_my_guild_invites','v6245_get_sent_guild_invites','v6245_cancel_guild_invite','v6245_handle_guild_invite']
});

installLoadHook();installNavHook();
setTimeout(()=>void refresh({silent:true}),650);
setTimeout(()=>{installLoadHook();void refresh({silent:true})},2200);
window.addEventListener('growlegends:account-ready',()=>{
 incoming=[];sent=[];searchRows=[];lastIncomingAt=0;lastSentAt=0;paintMenuBadge();
 setTimeout(()=>{installLoadHook();void refresh({silent:true,force:true})},250)
});
window.addEventListener('pageshow',()=>setTimeout(()=>void refresh({silent:true}),180),{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>void loadIncoming({silent:true}),250)},{passive:true});
})();

