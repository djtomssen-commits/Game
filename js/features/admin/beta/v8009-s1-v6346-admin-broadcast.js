(()=>{
'use strict';
if(window.__V6346_ADMIN_BROADCASTS__)return;
window.__V6346_ADMIN_BROADCASTS__=true;

const VERSION='V6.347';
const A={rows:[],recipients:[],names:new Map()};
let checkedUser='',sessionLoaded=false,checking=false,queue=[],active=null;
function esc(v){try{return typeof v073Escape==='function'?v073Escape(String(v??'')):String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}catch(_){return String(v??'')}}
function db(){try{return typeof v073Db!=='undefined'&&v073Db?v073Db:null}catch(_){return null}}
function uid(){try{return v073User&&!v073User.is_anonymous&&v073User.id?String(v073User.id):''}catch(_){return''}}
function admin(){try{return typeof v093IsAdmin!=='undefined'&&!!v093IsAdmin}catch(_){return false}}
function toast(t,type='info',d=''){try{if(typeof v063Toast==='function')return v063Toast(t,type,d)}catch(_){}}
function closeNode(id){const n=document.getElementById(id);if(!n)return;n.classList.remove('show');setTimeout(()=>n.remove(),170)}
function fmtDate(v){try{return new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(v))}catch(_){return''}}

function ensureAdminCard(){
 const host=document.getElementById('v093AdminContent');if(!host||document.getElementById('v6346AdminBroadcastCard'))return !!host;
 const card=document.createElement('div');card.className='card v6346-broadcast-card';card.id='v6346AdminBroadcastCard';
 card.innerHTML=`<div class="section-title"><div><h3>📣 Spieler-Nachrichten & Umfragen</h3><div class="muted">Einmaliges Login-Popup an alle aktuell registrierten Spieler senden. Antworten und Abstimmungen werden hier gesammelt.</div></div></div>
 <div class="v6346-type-row"><div><label class="v093-label">Art</label><select id="v6346Kind" class="v093-input"><option value="message">💌 Nachricht</option><option value="poll">📊 Umfrage</option></select></div><div><label class="v093-label">Titel</label><input id="v6346Title" class="v093-input" maxlength="120" placeholder="z. B. Was wünscht ihr euch als Nächstes?"></div></div>
 <label class="v093-label">Nachricht / Frage</label><textarea id="v6346Body" class="v093-input v093-textarea" maxlength="3000" placeholder="Text für alle Spieler"></textarea>
 <div id="v6346PollOptions" class="v6346-poll-options" style="display:none"><label class="v093-label">Antwortmöglichkeiten · eine pro Zeile · 2–6</label><textarea id="v6346Options" class="v093-input v093-textarea" placeholder="Ja\nNein\nVielleicht"></textarea></div>
 <label class="v093-toggle"><input id="v6346AllowComment" type="checkbox" checked><span id="v6346AllowCommentText">Spieler dürfen antworten</span></label>
 <button class="btn" id="v6346Send" style="width:100%;margin-top:10px">📣 An alle Spieler senden</button>
 <div id="v6346AdminList" class="v6346-admin-list"><div class="empty">Nachrichten werden geladen …</div></div>`;
 host.appendChild(card);
 const kind=card.querySelector('#v6346Kind');kind.onchange=()=>{
   const poll=kind.value==='poll';card.querySelector('#v6346PollOptions').style.display=poll?'block':'none';
   card.querySelector('#v6346AllowCommentText').textContent=poll?'Optionales Textfeld zusätzlich zur Abstimmung erlauben':'Spieler dürfen auf die Nachricht antworten';
 };
 card.querySelector('#v6346Send').onclick=()=>void sendAdminBroadcast();
 return true;
}

async function sendAdminBroadcast(){
 if(!admin())return;
 const x=db();if(!x)return toast('Datenbank nicht bereit','warn');
 const kind=document.getElementById('v6346Kind')?.value||'message';
 const title=document.getElementById('v6346Title')?.value.trim()||'';
 const body=document.getElementById('v6346Body')?.value.trim()||'';
 const allow=!!document.getElementById('v6346AllowComment')?.checked;
 const options=kind==='poll'?(document.getElementById('v6346Options')?.value||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean).slice(0,7):[];
 if(!title||!body)return toast('Titel und Nachricht fehlen','warn');
 if(kind==='poll'&&(options.length<2||options.length>6))return toast('Umfrage braucht 2–6 Antwortmöglichkeiten','warn');
 const btn=document.getElementById('v6346Send');if(btn)btn.disabled=true;
 try{
   const {data,error}=await x.rpc('v6346_admin_create_broadcast',{p_kind:kind,p_title:title,p_body:body,p_options:options,p_allow_comment:allow});
   if(error)throw error;
   document.getElementById('v6346Title').value='';document.getElementById('v6346Body').value='';
   const op=document.getElementById('v6346Options');if(op)op.value='';
   toast(kind==='poll'?'📊 Umfrage gesendet':'💌 Nachricht gesendet','success',`${Number(data?.recipients)||0} Spieler erhalten sie beim nächsten Login.`);
   await loadAdminBroadcasts();
 }catch(e){toast('Senden fehlgeschlagen','error',String(e?.message||e))}
 finally{if(btn)btn.disabled=false}
}

function statsFor(id){
 const rr=A.recipients.filter(r=>String(r.broadcast_id)===String(id));
 return {all:rr.length,seen:rr.filter(r=>r.seen_at).length,answers:rr.filter(r=>r.responded_at).length,rows:rr};
}
function optionLabel(b,i){const a=Array.isArray(b?.poll_options)?b.poll_options:[];return a[i]??`Option ${Number(i)+1}`}
function adminRowHtml(b){
 const st=statsFor(b.id),isPoll=b.kind==='poll',opts=Array.isArray(b.poll_options)?b.poll_options:[];
 const votes=st.rows.filter(r=>r.responded_at&&Number.isInteger(r.option_index));
 const optionHtml=isPoll?`<div class="v6346-option-results">${opts.map((o,i)=>{const n=votes.filter(r=>Number(r.option_index)===i).length,p=votes.length?Math.round(n/votes.length*100):0;return `<div class="v6346-option-result"><span>${esc(o)}</span><div class="v6346-option-track"><i style="width:${p}%"></i></div><b>${n}</b></div>`}).join('')}</div>`:'';
 return `<div class="v6346-admin-row"><div class="v6346-admin-head"><div><b>${isPoll?'📊':'💌'} ${esc(b.title)}</b><div class="tiny">${fmtDate(b.created_at)}</div></div><span class="pill">${b.is_published?'AKTIV':'GESTOPPT'}</span></div><div class="v6346-admin-body">${esc(b.body)}</div><div class="v6346-admin-meta"><span>Empfänger ${st.all}</span><span>Gesehen ${st.seen}</span><span>${isPoll?'Stimmen':'Antworten'} ${st.answers}</span>${b.allow_comment?'<span>Textantwort aktiv</span>':''}</div>${optionHtml}<div class="v6346-admin-actions"><button class="btn secondary" data-v6346-results="${b.id}">📋 Ergebnisse</button><button class="btn secondary" data-v6346-toggle="${b.id}" data-state="${b.is_published?'0':'1'}">${b.is_published?'Stoppen':'Aktivieren'}</button><button class="btn danger" data-v6346-delete="${b.id}">Löschen</button></div></div>`;
}
async function loadAdminBroadcasts(){
 ensureAdminCard();if(!admin())return false;const x=db();if(!x)return false;
 const list=document.getElementById('v6346AdminList');
 try{
   const br=await x.from('admin_broadcasts').select('id,kind,title,body,poll_options,allow_comment,is_published,created_at').order('created_at',{ascending:false}).limit(30);
   if(br.error)throw br.error;A.rows=br.data||[];
   const ids=A.rows.map(r=>r.id);A.recipients=[];A.names.clear();
   if(ids.length){
     const rr=await x.from('admin_broadcast_recipients').select('broadcast_id,user_id,seen_at,option_index,comment,responded_at').in('broadcast_id',ids);
     if(rr.error)throw rr.error;A.recipients=rr.data||[];
     const uids=[...new Set(A.recipients.map(r=>r.user_id).filter(Boolean))];
     if(uids.length){const pr=await x.from('profiles').select('id,character_name').in('id',uids);if(!pr.error)(pr.data||[]).forEach(p=>A.names.set(String(p.id),p.character_name||'Spieler'))}
   }
   if(list)list.innerHTML=A.rows.length?A.rows.map(adminRowHtml).join(''):'<div class="empty">Noch keine Spieler-Nachrichten oder Umfragen.</div>';
   bindAdminList();return true;
 }catch(e){if(list)list.innerHTML=`<div class="empty">Laden fehlgeschlagen: ${esc(e?.message||e)}</div>`;return false}
}
function bindAdminList(){
 const list=document.getElementById('v6346AdminList');if(!list)return;
 list.querySelectorAll('[data-v6346-results]').forEach(b=>b.onclick=()=>openResults(b.dataset.v6346Results));
 list.querySelectorAll('[data-v6346-toggle]').forEach(b=>b.onclick=()=>void toggleBroadcast(b.dataset.v6346Toggle,b.dataset.state==='1'));
 list.querySelectorAll('[data-v6346-delete]').forEach(b=>b.onclick=()=>void deleteBroadcast(b.dataset.v6346Delete));
}
async function toggleBroadcast(id,state){const x=db();if(!x||!admin())return;const {error}=await x.rpc('v6346_admin_set_broadcast_published',{p_broadcast_id:id,p_published:!!state});if(error)return toast('Änderung fehlgeschlagen','error',error.message);await loadAdminBroadcasts()}
async function deleteBroadcast(id){
 if(!admin())return;let ok=true;try{ok=typeof v115Confirm==='function'?await v115Confirm('Nachricht/Umfrage wirklich löschen? Dabei werden auch alle Antworten und Stimmen gelöscht.',{title:'Admin-Nachricht löschen',type:'warn',okText:'Löschen'}):confirm('Wirklich löschen?')}catch(_){ok=false}if(!ok)return;
 const x=db();if(!x)return;const {error}=await x.rpc('v6346_admin_delete_broadcast',{p_broadcast_id:id});if(error)return toast('Löschen fehlgeschlagen','error',error.message);await loadAdminBroadcasts();
}
function openResults(id){
 const b=A.rows.find(x=>String(x.id)===String(id));if(!b)return;document.getElementById('v6346ResultsPopup')?.remove();
 const st=statsFor(id),isPoll=b.kind==='poll',votes=st.rows.filter(r=>r.responded_at&&Number.isInteger(r.option_index)),opts=Array.isArray(b.poll_options)?b.poll_options:[];
 const bars=isPoll?`<div class="v6346-option-results">${opts.map((o,i)=>{const n=votes.filter(r=>Number(r.option_index)===i).length,p=votes.length?Math.round(n/votes.length*100):0;return `<div class="v6346-option-result"><span>${esc(o)}</span><div class="v6346-option-track"><i style="width:${p}%"></i></div><b>${n} · ${p}%</b></div>`}).join('')}</div>`:'';
 const answerRows=st.rows.filter(r=>r.responded_at).sort((a,b)=>new Date(b.responded_at)-new Date(a.responded_at));
 const answers=answerRows.length?answerRows.map(r=>`<div class="v6346-response"><b>${esc(A.names.get(String(r.user_id))||'Spieler')}</b><small>${isPoll?`Stimme: ${esc(optionLabel(b,Number(r.option_index)))}`:'Antwort'} · ${fmtDate(r.responded_at)}</small>${r.comment?`<p>${esc(r.comment)}</p>`:''}</div>`).join(''):'<div class="empty">Noch keine Antworten.</div>';
 const ov=document.createElement('div');ov.id='v6346ResultsPopup';ov.innerHTML=`<section class="v6346-results-card"><button class="v6346-close" aria-label="Schließen">×</button><div class="v6346-kicker">ADMIN · ${isPoll?'UMFRAGEERGEBNIS':'ANTWORTEN'}</div><h2>${esc(b.title)}</h2><div class="v6346-results-summary"><span>Empfänger ${st.all}</span><span>Gesehen ${st.seen}</span><span>${isPoll?'Stimmen':'Antworten'} ${st.answers}</span></div>${bars}<div class="v6346-response-list">${answers}</div></section>`;document.body.appendChild(ov);requestAnimationFrame(()=>ov.classList.add('show'));ov.querySelector('.v6346-close').onclick=()=>closeNode('v6346ResultsPopup');ov.addEventListener('click',e=>{if(e.target===ov)closeNode('v6346ResultsPopup')});
}

async function fetchPending(){
 const user=uid(),x=db();if(!user||!x)return [];
 const rr=await x.from('admin_broadcast_recipients').select('broadcast_id,seen_at,responded_at').eq('user_id',user).is('seen_at',null).limit(20);
 if(rr.error)throw rr.error;const ids=(rr.data||[]).map(r=>r.broadcast_id);if(!ids.length)return [];
 const br=await x.from('admin_broadcasts').select('id,kind,title,body,poll_options,allow_comment,is_published,created_at').in('id',ids).eq('is_published',true);
 if(br.error)throw br.error;return (br.data||[]).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
}
async function markSeen(id){const x=db();if(!x)return false;try{const {error}=await x.rpc('v6346_mark_broadcast_seen',{p_broadcast_id:id});if(error)throw error;return true}catch(e){console.warn('V6.347 broadcast seen',e);return false}}
async function submitResponse(b,optionIndex,comment){
 const x=db();if(!x)return false;try{const {data,error}=await x.rpc('v6346_submit_broadcast_response',{p_broadcast_id:b.id,p_option_index:optionIndex,p_comment:String(comment||'')});if(error)throw error;if(data?.ok===false&&data?.reason==='already_responded')return true;return !!data?.ok}catch(e){toast('Antwort konnte nicht gespeichert werden','error',String(e?.message||e));return false}
}
function showNext(){
 if(active||document.getElementById('v6346BroadcastPopup'))return;
 if(document.getElementById('v6342UpdatePopup'))return setTimeout(showNext,500);
 const b=queue.shift();if(!b)return;active=b;mountBroadcast(b);
}
function finishPopup(){active=null;closeNode('v6346BroadcastPopup');setTimeout(showNext,220)}
function mountBroadcast(b){
 const isPoll=b.kind==='poll',opts=Array.isArray(b.poll_options)?b.poll_options:[];let selected=null;
 const ov=document.createElement('div');ov.id='v6346BroadcastPopup';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
 ov.innerHTML=`<section class="v6346-card"><button class="v6346-close" aria-label="Ohne Antwort schließen">×</button><div class="v6346-kicker">${isPoll?'📊 UMFRAGE VOM GROW-LEGENDS-TEAM':'💌 NACHRICHT VOM GROW-LEGENDS-TEAM'}</div><h2>${esc(b.title)}</h2><div class="v6346-body">${esc(b.body)}</div>${isPoll?`<div class="v6346-options">${opts.map((o,i)=>`<button type="button" class="v6346-option" data-v6346-option="${i}">${esc(o)}</button>`).join('')}</div>`:''}${b.allow_comment?`<label class="v093-label">${isPoll?'Optional noch etwas dazu schreiben':'Antwort an das Team'}</label><textarea id="v6346PlayerComment" maxlength="1000" placeholder="${isPoll?'Optionaler Kommentar …':'Deine Antwort …'}"></textarea>`:''}<div class="v6346-actions"><button type="button" class="btn secondary v6346-skip">Ohne Antwort schließen</button><button type="button" class="btn v6346-submit">${isPoll?'✅ Abstimmen':'📨 Antwort senden'}</button></div><div class="v6346-note">Diese Nachricht wird deinem Account nur einmal beim Login angezeigt.</div></section>`;
 document.body.appendChild(ov);requestAnimationFrame(()=>ov.classList.add('show'));
 ov.querySelectorAll('[data-v6346-option]').forEach(btn=>btn.onclick=()=>{selected=Number(btn.dataset.v6346Option);ov.querySelectorAll('[data-v6346-option]').forEach(x=>x.classList.toggle('selected',x===btn))});
 const skip=async()=>{await markSeen(b.id);finishPopup()};
 ov.querySelector('.v6346-skip').onclick=()=>void skip();ov.querySelector('.v6346-close').onclick=()=>void skip();
 ov.querySelector('.v6346-submit').onclick=async e=>{
   const comment=ov.querySelector('#v6346PlayerComment')?.value.trim()||'';
   if(isPoll&&selected===null)return toast('Bitte eine Antwort auswählen','warn');
   if(!isPoll&&b.allow_comment&&!comment)return toast('Bitte eine Antwort schreiben','warn');
   e.currentTarget.disabled=true;
   const ok=await submitResponse(b,isPoll?selected:null,comment);
   if(ok){toast(isPoll?'📊 Stimme gespeichert':'💌 Antwort gesendet','success','Danke für dein Feedback.');finishPopup()}else e.currentTarget.disabled=false;
 };
}
async function checkLoginBroadcasts(){
 const user=uid();if(!user)return false;
 if(checkedUser!==user){checkedUser=user;sessionLoaded=false;queue=[];active=null}
 if(sessionLoaded||checking)return false;checking=true;
 try{queue=await fetchPending();sessionLoaded=true;if(queue.length)setTimeout(showNext,200);return queue.length>0}catch(e){console.warn('V6.347 pending broadcasts',e);return false}finally{checking=false}
}
function schedulePlayer(ms=1800){setTimeout(()=>{if(document.hidden)return;void checkLoginBroadcasts()},ms)}
window.addEventListener('growlegends:account-ready',()=>schedulePlayer(1900));
window.addEventListener('pageshow',()=>schedulePlayer(2600),{passive:true});
setTimeout(()=>schedulePlayer(0),4200);

try{
 const base=(typeof v093AdminLoadLists==='function')?v093AdminLoadLists:null;
 if(base&&!window.__V6346_ADMIN_LOAD_WRAP__){
   const wrapped=async function(){const r=await base.apply(this,arguments);ensureAdminCard();if(admin())await loadAdminBroadcasts();return r};
   try{v093AdminLoadLists=wrapped}catch(_){ }try{window.v093AdminLoadLists=wrapped}catch(_){ }window.__V6346_ADMIN_LOAD_WRAP__=true;
 }
}catch(_){ }
/* v093AdminLoadLists is the sole admin-card/load owner. */
window.v6346BroadcastDiagnostics=()=>({version:VERSION,userId:uid(),sessionLoaded,pending:queue.length,active:active?.id||'',admin:admin(),adminRows:A.rows.length});
window.v6346AdminLoadBroadcasts=loadAdminBroadcasts;
})();
