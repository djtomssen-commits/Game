/* === v4144-guild-chat === */
(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 const TABLE='guild_chat_messages';
 let open=false,refreshTimer=0,watchTimer=0,loading=false,watchLoading=false,lastSendAt=0,lastGuildId='';
 const q=id=>document.getElementById(id);
 const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 function online(){try{return !!v073Db&&!!v073User&&!v073User.is_anonymous&&window.__V200_AUTH_READY__===true}catch(e){return false}}
 function guildId(){try{return String(v254Membership?.guild_id||v254Guild?.id||'')}catch(e){return''}}
 function member(){return online()&&!!guildId()&&!!v254Membership&&!!v254Guild}
 function ownId(){try{return String(v073User?.id||'')}catch(e){return''}}
 function guildLabel(){try{return `${v254Guild?.name||'Gilde'}${v254Guild?.tag?` [${v254Guild.tag}]`:''}`}catch(e){return'Gilde'}}
 function setList(html){const box=q('v4144GuildChatList');if(box)box.innerHTML=html}
 function seenKey(gid=guildId()){return `growLegendsGuildChatSeen:${ownId()||'none'}:${String(gid||'none')}`}
 function readSeen(gid){try{return String(localStorage.getItem(seenKey(gid))||'')}catch(e){return''}}
 function writeSeen(id,gid){try{if(id!=null&&String(id)!=='')localStorage.setItem(seenKey(gid),String(id))}catch(e){}}
 function newerId(a,b){try{return BigInt(String(a||0))>BigInt(String(b||0))}catch(e){return String(a||'')!==String(b||'')}}
 function setUnread(on){
  const tab=q('v4144GuildChatTab');if(!tab)return;tab.classList.toggle('v4145-unread',!!on);
  tab.setAttribute('aria-label',on?'Gildenchat öffnen – neue Nachricht':'Gildenchat öffnen');
 }
 function markSeen(rows,gid){const last=Array.isArray(rows)&&rows.length?rows[rows.length-1]:null;if(last?.id!=null)writeSeen(last.id,gid);setUnread(false)}
 function close(){open=false;clearTimeout(refreshTimer);refreshTimer=0;const p=q('v4144GuildChatPanel');if(p){p.classList.remove('open');p.setAttribute('aria-hidden','true')}scheduleWatch(1400)}
 window.v4144CloseGuildChat=close;
 function syncVisibility(){
  const tab=q('v4144GuildChatTab');if(!tab)return false;
  const ok=member();tab.classList.toggle('show',ok);tab.setAttribute('aria-hidden',ok?'false':'true');
  const sub=q('v4144GuildChatGuild');if(sub)sub.textContent=ok?guildLabel():'Nur für Mitglieder deiner Gilde';
  if(!ok){setUnread(false);close()}else if(!open)scheduleWatch(700);
  return ok;
 }
 window.v4144SyncGuildChat=syncVisibility;
 function fmtTime(x){try{const d=new Date(x),today=new Date();const same=d.toDateString()===today.toDateString();return same?d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):d.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}catch(e){return''}}
 function render(rows){
  const box=q('v4144GuildChatList');if(!box)return;
  if(!rows?.length){box.innerHTML='<div class="v4144-chat-empty">Noch keine Nachrichten. Schreib deiner Gilde die erste Nachricht. 🌿</div>';return}
  const me=ownId();
  const visible=rows.filter(r=>{const uid=String(r?.user_id||'');return uid===me||!window.v6144IsBlocked?.(uid)});
  if(!visible.length){box.innerHTML='<div class="v4144-chat-empty">Keine sichtbaren Nachrichten. Nachrichten blockierter Spieler werden ausgeblendet.</div>';return}
  box.innerHTML=visible.map(r=>{const uid=String(r?.user_id||''),name=String(r?.character_name||'Spieler');const canAct=!!uid&&uid!==me&&(!window.v6144CanActOnChatRow||window.v6144CanActOnChatRow(uid,name)!==false);return `<div class="v4144-chat-row ${uid===me?'own':''}" data-v6144-user="${esc(uid)}" data-v6144-msg="${esc(r?.id||'')}" data-v6144-name="${esc(name)}"><div class="v4144-chat-bubble"><div class="v4144-chat-meta"><b>${esc(name)}</b><span class="v6144-chat-meta-right"><span>${esc(fmtTime(r.created_at))}</span>${canAct?`<button type="button" class="v6144-chat-menu-btn" aria-label="Aktionen für ${esc(name)}" title="Melden oder blockieren">⋮</button>`:''}</span></div><div class="v4144-chat-text">${esc(r.body||'')}</div></div></div>`}).join('');
  box.scrollTop=box.scrollHeight;
 }
 function missingTable(e){return /guild_chat_messages|relation.*does not exist|schema cache/i.test(String(e?.message||e||''))}
 async function load({silent=false}={}){
  if(loading||!open||!member())return false;const gid=guildId();if(!gid)return false;loading=true;
  try{
   const {data,error}=await v073Db.from(TABLE).select('id,guild_id,user_id,character_name,body,created_at').eq('guild_id',gid).order('created_at',{ascending:false}).limit(50);
   if(error)throw error;if(!open||gid!==guildId())return false;lastGuildId=gid;const rows=[...(data||[])].reverse();render(rows);markSeen(rows,gid);return true;
  }catch(e){
   console.warn('V4.159 guild chat load',e);
   if(!silent)setList(`<div class="v4144-chat-empty">${missingTable(e)?'Gildenchat ist serverseitig noch nicht eingerichtet.':'Gildenchat konnte gerade nicht geladen werden.'}</div>`);
   return false;
  }finally{loading=false}
 }
 function schedule(){clearTimeout(refreshTimer);refreshTimer=0;if(!open||!member())return;refreshTimer=setTimeout(async()=>{if(open&&!document.hidden){await load({silent:true})}schedule()},12000)}
 async function checkUnread(){
  if(watchLoading||open||document.hidden||!member())return false;const gid=guildId();if(!gid)return false;watchLoading=true;
  try{
   const {data,error}=await v073Db.from(TABLE).select('id,user_id,created_at').eq('guild_id',gid).order('created_at',{ascending:false}).limit(25);
   if(error)throw error;const rows=Array.isArray(data)?data:[];const newest=rows[0]||null;if(!newest){setUnread(false);return true}
   const seen=readSeen(gid);
   if(!seen){writeSeen(newest.id,gid);setUnread(false);return true}
   const unseen=rows.filter(r=>newerId(r?.id,seen));
   const hasVisibleNew=unseen.some(r=>{const uid=String(r?.user_id||'');return uid&&uid!==ownId()&&!window.v6144IsBlocked?.(uid)});
   if(hasVisibleNew)setUnread(true);else{writeSeen(newest.id,gid);setUnread(false)}
   return true;
  }catch(e){if(!missingTable(e))console.warn('V4.159 guild chat unread check',e);return false}
  finally{watchLoading=false}
 }
 function scheduleWatch(delay=12000){
  clearTimeout(watchTimer);watchTimer=0;if(open||document.hidden||!member())return;
  watchTimer=setTimeout(async()=>{if(!open&&!document.hidden)await checkUnread();scheduleWatch(12000)},Math.max(500,Number(delay)||12000));
 }
 async function openPanel(){
  if(!syncVisibility())return;
  try{if(typeof v269CloseTicket==='function')v269CloseTicket()}catch(e){}
  const p=q('v4144GuildChatPanel');if(!p)return;open=true;p.classList.add('open');p.setAttribute('aria-hidden','false');
  const gid=guildId();if(gid!==lastGuildId)setList('<div class="v4144-chat-empty">Chat wird geladen …</div>');
  await load();schedule();if(window.matchMedia?.('(pointer:fine)').matches)setTimeout(()=>q('v4144GuildChatInput')?.focus(),80);
 }
 window.v4144OpenGuildChat=openPanel;
 async function send(){
  if(!member())return close();const input=q('v4144GuildChatInput'),btn=q('v4144GuildChatSend');const body=String(input?.value||'').trim();if(!body)return;
  if(body.length>400){try{v063Toast('Nachricht zu lang','warn','Maximal 400 Zeichen.')}catch(e){}return}
  const moderation=window.v7185Moderation?.check?.(body,'guild_chat');if(moderation?.blocked){try{v063Toast('Nachricht nicht gesendet','warn',moderation.message||'Der Text enthält einen nicht zulässigen Ausdruck.')}catch(e){}return}
  const now=Date.now();if(now-lastSendAt<1200)return;lastSendAt=now;const gid=guildId(),uid=ownId();if(!gid||!uid)return;
  if(btn){btn.disabled=true;btn.textContent='…'}
  try{
   const payload={guild_id:gid,user_id:uid,character_name:String(s?.characterName||'Spieler').trim().slice(0,40)||'Spieler',body};
   const {error}=await v073Db.from(TABLE).insert(payload);if(error)throw error;if(input)input.value='';await load();
  }catch(e){console.warn('V4.159 guild chat send',e);try{const msg=String(e?.message||'');const moderation=/nicht zulässigen Ausdruck|Textchat vorübergehend gesperrt/i.test(msg);v063Toast('Gildenchat','warn',missingTable(e)?'Gildenchat-Tabelle fehlt noch in Supabase.':(moderation?msg:'Nachricht konnte nicht gesendet werden.'))}catch(_){}
  }finally{if(btn){btn.disabled=false;btn.textContent='Senden'}}
 }
 function bind(){
  q('v4144GuildChatTab')?.addEventListener('click',openPanel);q('v4144GuildChatTab')?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openPanel()}});
  q('v4144GuildChatClose')?.addEventListener('click',close);q('v4144GuildChatSend')?.addEventListener('click',send);
  q('v4144GuildChatInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}});
 }
 bind();
 try{
  if(typeof v269OpenTicket==='function'&&!window.__v4144TicketWrap){const base=v269OpenTicket;v269OpenTicket=function(){close();return base.apply(this,arguments)};try{window.v269OpenTicket=v269OpenTicket}catch(e){}window.__v4144TicketWrap=true}
 }catch(e){}
 try{
  if(typeof v254RenderGuild==='function'&&!window.__v4144GuildRenderWrap){const base=v254RenderGuild;v254RenderGuild=function(){const r=base.apply(this,arguments);syncVisibility();return r};try{window.v254RenderGuild=v254RenderGuild}catch(e){}window.__v4144GuildRenderWrap=true}
 }catch(e){}
 try{
  if(typeof v254LoadGuild==='function'&&!window.__v4144GuildLoadWrap){const base=v254LoadGuild;v254LoadGuild=async function(){const r=await base.apply(this,arguments);syncVisibility();setTimeout(()=>{if(open)void load({silent:true});else{void checkUnread();scheduleWatch()}},600);return r};try{window.v254LoadGuild=v254LoadGuild}catch(e){}window.__v4144GuildLoadWrap=true}
 }catch(e){}
 /* V4.159: login bootstrap is owned by the central boot controller. */
 try{
  if(typeof v136Logout==='function'&&!window.__v4144LogoutChatWrap){const base=v136Logout;v136Logout=async function(){clearTimeout(watchTimer);watchTimer=0;setUnread(false);close();const r=await base.apply(this,arguments);syncVisibility();return r};try{window.v136Logout=v136Logout}catch(e){}window.__v4144LogoutChatWrap=true}
 }catch(e){}
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){clearTimeout(refreshTimer);refreshTimer=0;clearTimeout(watchTimer);watchTimer=0}
 },{passive:true});
 window.addEventListener('growlegends:account-ready',()=>{syncVisibility();void checkUnread();scheduleWatch()});
 window.addEventListener('growlegends:foreground-ready',()=>{if(open){void load({silent:true});schedule()}else{syncVisibility();void checkUnread();scheduleWatch()}});
 function stamp(){}
 stamp();
})();

/* V8.008-C25 — deferred chat identity/bootstrap owner. */
window.v8008C25InstallChatBootstrap=function(){
  if(window.__V8008_C25_CHAT_BOOT_INSTALLER__)return;
  window.__V8008_C25_CHAT_BOOT_INSTALLER__=true;
/* === v4146-guild-chat-bootstrap-authority === */
(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 let pending=null,pendingUid='';
 function uid(){try{return v073User&&!v073User.is_anonymous&&v073User.id?String(v073User.id):''}catch(e){return''}}
 function ready(){try{return !!uid()&&!!v073Db&&window.__V200_AUTH_READY__===true}catch(e){return false}}
 function sync(){try{return window.v4144SyncGuildChat?.()}catch(e){return false}}
 function sameLoaded(){try{return !!v254Membership?.guild_id&&String(v254Guild?.id||'')===String(v254Membership.guild_id||'')}catch(e){return false}}
 async function ensure(reason='bootstrap'){
  const id=uid();
  if(!id||!ready()){sync();return false}
  if(sameLoaded()){sync();return true}
  if(pending&&pendingUid===id)return pending;
  pendingUid=id;
  pending=(async()=>{
   try{
    const db=v073Db;
    const {data:memberRows,error:memberError}=await db.from('guild_members')
      .select('guild_id,role,attack_signed,defense_signed,boss_signed,joined_at')
      .eq('user_id',id).limit(1);
    if(memberError)throw memberError;
    if(uid()!==id||!ready())return false;
    const mem=Array.isArray(memberRows)?(memberRows[0]||null):null;
    if(!mem?.guild_id){
      try{v254Membership=null;v254Guild=null}catch(e){}
      sync();return false;
    }
    try{v254Membership=mem}catch(e){}
    const {data:guildRows,error:guildError}=await db.from('guilds')
      .select('id,name,tag,leader_id,guild_buds,xp_level,gold_level,guild_xp,created_at')
      .eq('id',mem.guild_id).limit(1);
    if(guildError)throw guildError;
    if(uid()!==id||!ready())return false;
    const guild=Array.isArray(guildRows)?(guildRows[0]||null):null;
    if(!guild){sync();return false}
    try{v254Guild=guild}catch(e){}
    sync();
    return true;
   }catch(e){
    console.warn('V4.159 guild chat identity bootstrap',reason,e);
    sync();return false;
   }finally{
    if(pendingUid===id){pending=null;pendingUid=''}
   }
  })();
  return pending;
 }
 window.v4146EnsureGuildChatIdentity=ensure;
 /* V4.159: central boot controller calls guild identity ensure exactly once per account-ready transition. */
 try{
  if(typeof v136Logout==='function'&&!window.__v4146GuildChatLogoutWrap){
   const base=v136Logout;
   v136Logout=async function(){const r=await base.apply(this,arguments);pending=null;pendingUid='';sync();return r};
   try{window.v136Logout=v136Logout}catch(e){}
   window.__v4146GuildChatLogoutWrap=true;
  }
 }catch(e){}
 /* V4.159: pageshow/visibility/settle retries retired; coordinator owns foreground refresh. */
 function stamp(){}
 stamp();
})();
};
window.v8008C25InstallChatViewport=function(){
  if(window.__V8008_C25_CHAT_VIEW_INSTALLER__)return;
  window.__V8008_C25_CHAT_VIEW_INSTALLER__=true;
/* V8.008-C13 BETA — guild chat viewport/close-button fix only.
   The obsolete V6.310 boss test-removal guard is retired. */
/* === vGuildChatCloseVisibilityFixJs === */
(()=>{
 'use strict';
 const panel=()=>document.getElementById('v4144GuildChatPanel');
 const close=()=>document.getElementById('v4144GuildChatClose');
 function stabilize(){
   const p=panel(),b=close();if(!p||!b)return;
   const vv=window.visualViewport;
   const vw=vv?.width||window.innerWidth||document.documentElement.clientWidth||0;
   const viewportTop=Math.max(0,Number(vv?.offsetTop||0));
   const viewportBottom=viewportTop+Math.max(0,Number(vv?.height||window.innerHeight||document.documentElement.clientHeight||0));
   const header=document.querySelector('.app > header');
   const hr=header?.getBoundingClientRect?.();
   const headerBottom=hr&&Number.isFinite(hr.bottom)?Math.max(0,hr.bottom):0;
   const top=Math.max(viewportTop,headerBottom)+6;
   const height=Math.max(220,viewportBottom-top);

   p.style.setProperty('--v4144-chat-top',`${Math.round(top)}px`);
   p.style.setProperty('--v4144-chat-height',`${Math.round(height)}px`);
   p.style.setProperty('top',`${Math.round(top)}px`,'important');
   p.style.setProperty('height',`${Math.round(height)}px`,'important');
   p.style.setProperty('max-height',`${Math.round(height)}px`,'important');

   b.style.setProperty('display','grid','important');
   b.style.setProperty('visibility','visible','important');
   b.style.setProperty('opacity','1','important');
   b.style.setProperty('pointer-events','auto','important');
   b.style.setProperty('position','absolute','important');
   b.style.setProperty('top','10px','important');

   if(vw<=700){
     p.style.setProperty('left','0','important');
     p.style.setProperty('right','0','important');
     p.style.setProperty('width','100vw','important');
     p.style.setProperty('max-width','100vw','important');
   }else{
     p.style.removeProperty('left');
     p.style.setProperty('right','0','important');
     p.style.setProperty('width','min(94vw,410px)','important');
     p.style.setProperty('max-width','min(94vw,410px)','important');
   }
   if(p.classList.contains('open'))p.scrollTop=0;
 }
 document.getElementById('v4144GuildChatTab')?.addEventListener('click',()=>requestAnimationFrame(stabilize),true);
 window.visualViewport?.addEventListener('resize',()=>{if(panel()?.classList.contains('open'))requestAnimationFrame(stabilize)},{passive:true});
 window.addEventListener('resize',()=>{if(panel()?.classList.contains('open'))requestAnimationFrame(stabilize)},{passive:true});
 window.addEventListener('orientationchange',()=>setTimeout(stabilize,80),{passive:true});
 window.visualViewport?.addEventListener('scroll',()=>{if(panel()?.classList.contains('open'))requestAnimationFrame(stabilize)},{passive:true});
 window.addEventListener('growlegends:foreground-ready',stabilize);
 window.addEventListener('pageshow',stabilize,{passive:true});
 requestAnimationFrame(stabilize);
})();
};
