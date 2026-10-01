let v269Tickets=[];
let v269LastRewardSeen='';
function v269RewardSeenKey(){return 'v269LastRewardSeen:'+String(v073User?.id||'none')}
function v269LoadRewardSeen(){try{return localStorage.getItem(v269RewardSeenKey())||''}catch(e){return''}}

function v269Esc(x){return typeof v093Esc==='function'?v093Esc(x):String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function v269StatusLabel(x){
 return ({open:'OFFEN',helpful:'HILFREICH',spam:'SPAM',done:'ERLEDIGT'}[x]||String(x||'OFFEN').toUpperCase());
}
function v269OpenTicket(){
 const p=document.querySelector('#v269TicketPanel');if(!p)return;
 p.classList.add('open');p.setAttribute('aria-hidden','false');v269LoadMine();
}
function v269CloseTicket(){
 const p=document.querySelector('#v269TicketPanel');if(!p)return;
 p.classList.remove('open');p.setAttribute('aria-hidden','true');
}
async function v269Ensure(){
 if(typeof v073Init==='function')await v073Init();
 return !!(v073Db&&v073User&&!v073User.is_anonymous);
}
async function v269SendTicket(){
 if(!(await v269Ensure())){v063Toast?.('Account erforderlich','warn','Bitte zuerst anmelden.');return}
 const type=document.querySelector('#v269TicketType')?.value||'other';
 const title=document.querySelector('#v269TicketTitle')?.value.trim()||'';
 const body=document.querySelector('#v269TicketBody')?.value.trim()||'';
 if(title.length<3||body.length<8){v063Toast?.('Ticket unvollständig','warn','Bitte Titel und Beschreibung genauer ausfüllen.');return}
 const btn=document.querySelector('#v269TicketSend');if(btn){btn.disabled=true;btn.textContent='Wird gesendet …'}
 try{
   const payload={
     user_id:v073User.id,
     category:type,title,body,
     character_name:String(s.characterName||'Unbenannt'),
     level:Number(s.level)||1,
     class_id:s.playerClass||null,
     class_name:typeof v072ClassName==='function'?v072ClassName():'',
     game_version:'V4.02'
   };
   const {error}=await v073Db.from('player_tickets').insert(payload);if(error)throw error;
   document.querySelector('#v269TicketTitle').value='';
   document.querySelector('#v269TicketBody').value='';
   v063Toast?.('🎫 Ticket gesendet','success','Danke für deinen Hinweis.');
   await v269LoadMine();
 }catch(e){
   v063Toast?.('Ticket konnte nicht gesendet werden','error',/relation|schema cache/i.test(String(e?.message||''))?'Bitte zuerst V269_TICKET_SYSTEM_SQL.sql in Supabase ausführen.':e?.message||'');
 }finally{if(btn){btn.disabled=false;btn.textContent='📨 Ticket senden'}}
}
async function v308CleanupDoneTickets(){
 if(!v073Db||!v073User||v073User.is_anonymous)return 0;
 try{
   const {data,error}=await v073Db.rpc('v308_cleanup_done_tickets');
   if(error)throw error;
   return Math.max(0,Number(data)||0);
 }catch(e){
   /* SQL may not be installed yet. Loading tickets must still work. */
   return 0;
 }
}

function v308DoneDeleteText(t){
 if(t?.status!=='done'||!t?.reviewed_at)return '';
 const due=new Date(t.reviewed_at).getTime()+24*60*60*1000;
 const left=due-Date.now();
 if(left<=0)return '<div class="tiny" style="margin-top:5px">🗑️ Wird beim nächsten Cleanup gelöscht.</div>';
 const hours=Math.floor(left/3600000);
 const mins=Math.ceil((left%3600000)/60000);
 return `<div class="tiny" style="margin-top:5px">🗑️ Automatische Löschung in ${hours} Std. ${mins} Min.</div>`;
}

async function v269LoadMine(){
 if(!(await v269Ensure()))return;
 void v308CleanupDoneTickets();
 const box=document.querySelector('#v269MyTickets');if(box)box.innerHTML='<div class="empty">Lade Tickets …</div>';
 try{
   const {data,error}=await v073Db.from('player_tickets')
     .select('id,category,title,status,rewarded,rewarded_at,reviewed_at,created_at')
     .eq('user_id',v073User.id).order('created_at',{ascending:false}).limit(15);
   if(error)throw error;v269Tickets=data||[];
   if(box)box.innerHTML=v269Tickets.map(t=>`
     <div class="v269-ticket-row">
       <div class="v269-ticket-top"><b>${v269Esc(t.title)}</b><span class="v269-status">${v269StatusLabel(t.status)}</span></div>
       <div class="tiny">${t.category==='bug'?'🐛 Bug':t.category==='idea'?'💡 Vorschlag':'❓ Sonstiges'} · ${new Date(t.created_at).toLocaleString('de-DE')}</div>
       ${t.rewarded?'<div class="good" style="margin-top:5px">🎁 +1 Harz-Taler für hilfreichen Hinweis</div>':''}
       ${v308DoneDeleteText(t)}
     </div>`).join('')||'<div class="empty">Noch keine Tickets.</div>';
   const newest=v269Tickets.filter(x=>x.rewarded_at).sort((a,b)=>new Date(b.rewarded_at)-new Date(a.rewarded_at))[0];
   if(newest?.rewarded_at){
      v269LastRewardSeen=v269LoadRewardSeen();
    }
   if(newest?.rewarded_at && newest.rewarded_at!==v269LastRewardSeen){
      v269LastRewardSeen=newest.rewarded_at;localStorage.setItem(v269RewardSeenKey(),v269LastRewardSeen);
      v063Toast?.('🎁 Ticket-Belohnung','success','Dein Hinweis war hilfreich: +1 Harz-Taler.');
   }
 }catch(e){
   if(box)box.innerHTML='<div class="empty">Tickets noch nicht verfügbar.</div>';
 }
}

async function v269AdminLoadTickets(){
 if(!v093IsAdmin||!v073Db)return;
 void v308CleanupDoneTickets();
 const box=document.querySelector('#v269AdminTickets');if(!box)return;
 box.innerHTML='<div class="empty">Lade Spieler-Tickets …</div>';
 const {data,error}=await v073Db.from('player_tickets').select('*').order('created_at',{ascending:false}).limit(100);
 if(error){box.innerHTML='<div class="empty">Ticket-SQL noch nicht eingerichtet.</div>';return}
 box.innerHTML=(data||[]).map(t=>`
   <div class="v269-admin-ticket">
     <div class="v269-ticket-top"><b>${t.category==='bug'?'🐛':t.category==='idea'?'💡':'❓'} ${v269Esc(t.title)}</b><span class="v269-status">${v269StatusLabel(t.status)}</span></div>
     <div class="tiny">${v269Esc(t.character_name||'Spieler')} · Lv.${Number(t.level)||1} · ${v269Esc(t.class_name||'')} · ${new Date(t.created_at).toLocaleString('de-DE')}</div>
     <div style="margin-top:7px;font-size:11px;line-height:1.45;white-space:pre-wrap">${v269Esc(t.body)}</div>
     ${t.rewarded?'<div class="good" style="margin-top:6px">🎁 Bereits mit 1 Harz-Taler belohnt</div>':''}
     ${v308DoneDeleteText(t)}
     <div class="v269-admin-actions">
       <button class="btn" onclick="v269AdminAct('${t.id}','helpful_reward')" ${t.rewarded?'disabled':''}>✅ Hilfreich +1 🟢</button>
       <button class="btn secondary" onclick="v269AdminAct('${t.id}','helpful')">👍 Hilfreich</button>
       <button class="btn secondary" onclick="v269AdminAct('${t.id}','done')">✔ Erledigt</button>
       <button class="btn danger" onclick="v269AdminAct('${t.id}','spam')">🚫 Spam</button>
     </div>
   </div>`).join('')||'<div class="empty">Keine Tickets vorhanden.</div>';
}
async function v269AdminAct(id,action){
 if(!v093IsAdmin)return;
 try{
   const {data,error}=await v073Db.rpc('v269_admin_ticket_action',{p_ticket_id:id,p_action:action});if(error)throw error;
   const r=Array.isArray(data)?data[0]:data;
   const doneNow=r?.status==='done';
   v063Toast?.(
     doneNow?'Ticket erledigt':'Ticket aktualisiert',
     'success',
     r?.rewarded?'Spieler erhält 1 Harz-Taler.':doneNow?'Wird nach 24 Stunden automatisch gelöscht.':'Status gespeichert.'
   );
   await v269AdminLoadTickets();
   if(v073User&&!v073User.is_anonymous)await v269LoadMine();
 }catch(e){v063Toast?.('Ticket-Aktion fehlgeschlagen','error',e?.message||'')}
}

/* Insert admin ticket board once, without changing the older admin system. */
function v269InstallAdminBoard(){
 const root=document.querySelector('#v093AdminContent');if(!root||document.querySelector('#v269AdminTicketCard'))return;
 const card=document.createElement('div');card.className='card';card.id='v269AdminTicketCard';card.style.margin='12px 0 0';
 card.innerHTML=`<div class="section-title"><div><h3>🎫 Spieler-Tickets</h3><div class="muted">Bugs, Vorschläge und Hinweise prüfen. Erledigte Tickets werden nach 24 Stunden automatisch gelöscht.</div></div><button class="btn secondary" id="v269AdminTicketRefresh" style="padding:7px 9px">↻</button></div><div id="v269AdminTickets"></div>`;
 root.appendChild(card);document.querySelector('#v269AdminTicketRefresh')?.addEventListener('click',v269AdminLoadTickets);
}
const v269OldAdminLists=v093AdminLoadLists;
v093AdminLoadLists=async function(){
 const r=await v269OldAdminLists();
 if(v093IsAdmin){
   v269InstallAdminBoard();
   await v269AdminLoadTickets();
 }
 return r;
};

document.querySelector('#v269TicketTab')?.addEventListener('click',v269OpenTicket);
document.querySelector('#v269TicketTab')?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')v269OpenTicket()});
document.querySelector('#v269TicketClose')?.addEventListener('click',v269CloseTicket);
document.querySelector('#v269TicketSend')?.addEventListener('click',v269SendTicket);
document.querySelector('#v269TicketRefresh')?.addEventListener('click',v269LoadMine);
setTimeout(()=>{if(v073User&&!v073User.is_anonymous&&document.querySelector('#v269TicketPanel')?.classList.contains('open'))v269LoadMine()},2500);
setInterval(()=>{if(document.hidden)return;if(v073User&&!v073User.is_anonymous&&document.querySelector('#v269TicketPanel')?.classList.contains('open'))v269LoadMine()},120000);
