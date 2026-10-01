(function(){
 const VERSION='V4.29 Stable';
 let inbox=[],sent=[],loading=false,unreadBusy=false;
 const esc=s=>typeof v073Escape==='function'?v073Escape(String(s??'')):String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const fmt=d=>{try{return new Date(d).toLocaleString('de-DE',{dateStyle:'short',timeStyle:'short'})}catch(e){return ''}};
 async function online(){return typeof v073Init==='function' && await v073Init() && v073User?.id && v073Db}
 function badge(n){
   const gear=document.querySelector('#v372TopbarShell [data-head="mail"]'); if(!gear)return;
   let b=gear.querySelector('#v381MailBadge'); if(!b){b=document.createElement('span');b.id='v381MailBadge';gear.appendChild(b)}
   n=Math.max(0,Number(n)||0); b.textContent=n>99?'99+':String(n); b.style.display=n?'flex':'none'; gear.setAttribute('aria-label',n?`Nachrichten, ${n} ungelesen`:'Nachrichten');
 }
 async function unread(){
   if(unreadBusy)return;
   if(!(await online()))return badge(0);
   unreadBusy=true;
   try{
     const {count,error}=await v073Db.from('player_messages').select('id',{count:'exact',head:true}).eq('receiver_id',v073User.id).eq('is_read',false).is('deleted_by_receiver',false);
     if(error){console.warn('V4.02 unread',error);return}
     badge(count||0); const p=document.querySelector('#v381UnreadPill');if(p)p.textContent=`${count||0} ungelesen`;
   }finally{unreadBusy=false}
 }
 function row(m,box){
   const other=box==='in'?m.sender:m.receiver;
   const name=String(other?.character_name||'Spieler');
   const initial=(name.trim().charAt(0)||'?').toUpperCase();
   const unreadClass=box==='in'&&!m.is_read?'unread':'';
   return `<div class="v381-msg ${unreadClass}" data-v381-open="${esc(m.id)}" data-box="${box}">
     <div class="v677-mail-avatar" aria-hidden="true"><span>${esc(initial)}</span></div>
     <div class="v677-mail-copy">
       <b>${box==='in'?'Von':'An'}: ${esc(name)}</b>
       <small>${fmt(m.created_at)}</small>
       <div class="v381-preview">${esc(m.body||'')}</div>
     </div>
     <div class="v381-msg-actions">
       ${box==='in'&&!m.is_read?'<span class="v381-dot" title="Ungelesen"></span>':''}
       <span class="v677-open-arrow" aria-hidden="true">›</span>
     </div>
   </div>`
 }
 function render(){
   const i=document.querySelector('#v381Inbox'),s=document.querySelector('#v381Sent'); if(!i||!s)return;
   i.innerHTML=inbox.length?inbox.map(m=>row(m,'in')).join(''):'<div class="v381-empty">Keine Nachrichten im Eingang.</div>';
   s.innerHTML=sent.length?sent.map(m=>row(m,'out')).join(''):'<div class="v381-empty">Noch keine Nachrichten gesendet.</div>';
   document.querySelectorAll('[data-v381-open]').forEach(el=>el.onclick=e=>{if(e.target.closest('[data-v381-delete]'))return;openMessage(el.dataset.v381Open,el.dataset.box)});
   document.querySelectorAll('[data-v381-delete]').forEach(b=>b.onclick=e=>{e.stopPropagation();remove(b.dataset.v381Delete,b.dataset.box)});
 }
 async function load(){
   if(loading||!(await online()))return; loading=true;
   try{
     const cols='id,sender_id,receiver_id,body,is_read,created_at,deleted_by_sender,deleted_by_receiver';
     const [a,b]=await Promise.all([
       v073Db.from('player_messages').select(cols).eq('receiver_id',v073User.id).is('deleted_by_receiver',false).order('created_at',{ascending:false}).limit(100),
       v073Db.from('player_messages').select(cols).eq('sender_id',v073User.id).is('deleted_by_sender',false).order('created_at',{ascending:false}).limit(100)
     ]);
     if(a.error)throw a.error;if(b.error)throw b.error;
     const ids=[...(a.data||[]).map(x=>x.sender_id),...(b.data||[]).map(x=>x.receiver_id)].filter(Boolean);
     let profiles=[]; if(ids.length){const r=await v073Db.from('profiles').select('id,character_name').in('id',[...new Set(ids)]);if(r.error)throw r.error;profiles=r.data||[]}
     const map=new Map(profiles.map(p=>[p.id,p])); inbox=(a.data||[]).map(x=>({...x,sender:map.get(x.sender_id)}));sent=(b.data||[]).map(x=>({...x,receiver:map.get(x.receiver_id)})); render();await unread();
   }catch(e){console.error('V4.02 mail load',e);const i=document.querySelector('#v381Inbox');if(i)i.innerHTML='<div class="v381-empty">Postfach konnte nicht geladen werden. Falls das Nachrichtensystem neu eingerichtet wird, muss zuerst die V4.02-SQL in Supabase ausgeführt werden.</div>'}
   finally{loading=false}
 }
 async function send(){
   const name=String(document.querySelector('#v381Recipient')?.value||'').trim(),body=String(document.querySelector('#v381Body')?.value||'').trim();
   if(!name)return v063Toast?.('Empfänger fehlt','warn','Bitte einen Charakternamen eingeben.');if(!body)return v063Toast?.('Nachricht leer','warn');if(body.length>1000)return v063Toast?.('Nachricht zu lang','warn','Maximal 1000 Zeichen.');
   const moderation=window.v7185Moderation?.check?.(body,'private_message');if(moderation?.blocked)return v063Toast?.('Nachricht nicht gesendet','warn',moderation.message||'Der Text enthält einen nicht zulässigen Ausdruck.');
   if(!(await online()))return;
   const {data,error}=await v073Db.rpc('v384_send_message',{p_recipient_name:name,p_body:body});
   if(error){
     const setup=/v384_send_message|function .* does not exist|schema cache/i.test(String(error.message||''));
     return v063Toast?.('Nachricht konnte nicht gesendet werden','warn',setup?'Bitte zuerst V384_SECURITY_SQL.sql in Supabase ausführen.':(error.message||''));
   }
   const receiverName=data?.receiver_name||name;
   document.querySelector('#v381Body').value='';document.querySelector('#v381Chars').textContent='0 / 1000';v063Toast?.('Nachricht gesendet','success',`An ${receiverName}`);await load();tab('sent');
 }
 async function remove(id,box){if(!(await online()))return;const {error}=await v073Db.rpc('v384_delete_message',{p_message_id:Number(id)});if(error)return v063Toast?.('Nachricht konnte nicht gelöscht werden','warn',/v384_delete_message|function .* does not exist|schema cache/i.test(String(error.message||''))?'Bitte zuerst V384_SECURITY_SQL.sql in Supabase ausführen.':(error.message||''));await load()}
 async function openMessage(id,box){
   const m=(box==='in'?inbox:sent).find(x=>String(x.id)===String(id));if(!m)return;
   if(box==='in'&&!m.is_read){const {error}=await v073Db.rpc('v384_mark_message_read',{p_message_id:Number(id)});if(!error){m.is_read=true;render();unread()}else{console.warn('V4.02 mark read',error)}}
   const other=box==='in'?m.sender:m.receiver;const modal=document.createElement('div');modal.className='v381-modal';modal.innerHTML=`<div class="v381-modal-card"><div class="v381-modal-head"><div><b>${box==='in'?'Von':'An'}: ${esc(other?.character_name||'Spieler')}</b><div class="v381-modal-meta">${fmt(m.created_at)}</div></div><button class="btn secondary" data-close>✕</button></div><div class="v381-modal-body">${esc(m.body||'')}</div><div class="v381-modal-actions">${box==='in'?`<button class="btn secondary" data-reply>Antworten</button>`:''}<button class="btn secondary" data-delete>Löschen</button></div></div>`;document.body.appendChild(modal);
   const close=()=>modal.remove();modal.querySelector('[data-close]').onclick=close;modal.onclick=e=>{if(e.target===modal)close()};modal.querySelector('[data-delete]').onclick=async()=>{await remove(id,box);close()};
   modal.querySelector('[data-reply]')?.addEventListener('click',()=>{close();tab('compose');document.querySelector('#v381Recipient').value=other?.character_name||'';document.querySelector('#v381Body').focus()});
 }
 function tab(which){document.querySelectorAll('[data-v381-tab]').forEach(b=>b.classList.toggle('active',b.dataset.v381Tab===which));[['inbox','v381Inbox'],['sent','v381Sent'],['compose','v381Compose'],['battlelog','v6200BattleLogPanel']].forEach(([k,id])=>{const e=document.getElementById(id);if(e){const on=k===which;e.classList.toggle('v677-active-panel',on);e.style.display=on?'':'none'}});if(which==='battlelog')try{window.v6200LoadBattleLog?.()}catch(_){}}
 function bind(){
   document.querySelectorAll('[data-v381-tab]').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.onclick=()=>tab(b.dataset.v381Tab)});
   const sendBtn=document.querySelector('#v381Send');if(sendBtn&&!sendBtn.dataset.bound){sendBtn.dataset.bound='1';sendBtn.onclick=send}
   const body=document.querySelector('#v381Body');if(body&&!body.dataset.bound){body.dataset.bound='1';body.oninput=()=>{document.querySelector('#v381Chars').textContent=`${body.value.length} / 1000`}}
   const mail=document.querySelector('#v372TopbarShell [data-head="mail"]');if(mail&&!mail.dataset.v381Bound){mail.dataset.v381Bound='1';mail.onclick=()=>v032Go('mail')}
 }
 window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');bind();if(id==='mail')void load()},{passive:true});
 bind();unread();window.addEventListener('growlegends:account-ready',()=>{bind();unread()},{passive:true});setInterval(()=>{if(!document.hidden)unread()},60000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)unread()});
 document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version').forEach(el=>{if(el)el.textContent=VERSION});document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11');
})();
