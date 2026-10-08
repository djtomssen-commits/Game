/* Grow Legends V8.243 – Server-1 Bot-Verwaltung.
   Ein einziger Admin-Subowner; kein Render-Wrapper / keine Änderung am Spielablauf.
   RPC prüft die Adminrolle serverseitig. */
(()=>{
 'use strict';
 const P='v8243Bot';
 const $=s=>document.querySelector(s);
 let busy=false;
 let last=null;
 const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const labels={pending:'Vorbereitet',active:'Aktiv',paused:'Pausiert',retired:'Stillgelegt'};
 const profiles={casual:'Gelegenheit',balanced:'Ausgeglichen',active:'Vielspieler',explorer:'Entdecker',social:'Gilden'};
 function authorized(){return typeof v093IsAdmin!=='undefined'&&v093IsAdmin===true&&typeof v073Db!=='undefined'&&!!v073Db&&typeof v073User!=='undefined'&&!!v073User;}
 function api(){return typeof v073Db.schema==='function'?v073Db.schema('server1'):v073Db;}
 function notice(s,good=false){const el=$('#'+P+'Feedback');if(el){el.textContent=s;el.style.color=good?'#addb89':'#f1a49f';}}
 function install(){
  if(!authorized())return;
  const parent=$('#v093AdminContent');if(!parent||$('#'+P+'Admin'))return;
  const card=document.createElement('div');card.id=P+'Admin';card.className='card';card.style.margin='12px 0';
  card.innerHTML=`
   <div class="section-title"><div><h3>🤖 Bot-Verwaltung · Server 1</h3>
   <div class="muted">50 individuelle Spielprofile · ausschließlich Server 1</div></div></div>
   <div id="${P}Summary" class="muted" style="margin:10px 0">Lade Status …</div>
   <div class="v093-admin-actions" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
    <button id="${P}Toggle" class="btn secondary" disabled>Autopilot laden …</button>
    <button id="${P}Refresh" class="btn secondary">Aktualisieren</button>
   </div>
   <div class="muted" style="font-size:12px;margin-bottom:10px">Pausieren stoppt neue Aktionen. Angelegte Charaktere bleiben zunächst erhalten. Vollständiges Entfernen benötigt einen geprüften Rückbau einschließlich Gilden und PvP.</div>
   <div id="${P}Feedback" role="status" style="font-size:12px;margin:8px 0"></div>
   <div id="${P}List" style="max-height:440px;overflow:auto"><div class="muted">Bot-Profile werden geladen …</div></div>`;
  parent.appendChild(card);
  $('#'+P+'Refresh').onclick=()=>load();
  $('#'+P+'Toggle').onclick=()=>{if(last)control(last.enabled?'disable':'enable');};
  $('#'+P+'List').addEventListener('click',event=>{
   const btn=event.target.closest('[data-bot-action]');if(!btn||busy)return;
   const slot=Number(btn.dataset.botSlot);const action=btn.dataset.botAction;
   if(!Number.isInteger(slot)||slot<1||slot>50)return;
   if(action==='pause'||action==='resume')control(action,slot);
  });
 }
 async function rpc(payload){const {data,error}=await api().rpc('v8243_bot_admin',payload);if(error)throw error;if(!data?.ok)throw Error(data?.reason||'Unbekannter Fehler');return data;}
 function render(data){
  last=data;
  const ready=Number(data.provisioned)||0,active=Number(data.active)||0;
  const global=$('#'+P+'Toggle');
  if(global){global.disabled=busy||ready===0||!data.worker_ready;global.textContent=!data.worker_ready?'Autopilot noch nicht bereit':(data.enabled?'Autopilot ausschalten':'Autopilot einschalten');}
  const summary=$('#'+P+'Summary');
  if(summary)summary.textContent=`Vorbereitet: ${data.configured||0} / 50 · Angelegte Charaktere: ${ready} · Spielbereit: ${active} · Autopilot: ${data.enabled?'EIN':'AUS'}${!data.worker_ready?' (Automatik noch nicht installiert)':''}`;
  const list=$('#'+P+'List');if(!list)return;
  list.innerHTML=(data.agents||[]).map(a=>{
   const canPause=a.lifecycle==='active';
   const canResume=a.lifecycle==='paused';
   const action=canPause?'pause':canResume?'resume':'';
   return `<div class="v093-admin-item" style="padding:9px 0;border-bottom:1px solid #72543850">
    <div class="v093-admin-item-top"><b>#${a.slot} ${esc(a.name)}</b><span class="pill">${esc(labels[a.lifecycle]||a.lifecycle)}</span></div>
    <div class="muted" style="font-size:12px">${esc(a.class)} · ${esc(profiles[a.playstyle]||a.playstyle)} · Aktivität ${Math.round(Number(a.intensity||0)*100)} % · ${Number(a.total_actions)||0} Aktionen</div>
    ${a.last_action?'<div class="muted" style="font-size:11px">Letzte Aktion: '+esc(a.last_action)+'</div>':''}
    ${action?'<button class="btn secondary" style="margin-top:6px" data-bot-action="'+action+'" data-bot-slot="'+Number(a.slot)+'">'+(canPause?'Pausieren':'Fortsetzen')+'</button>':''}
   </div>`;
  }).join('')||'<div class="muted">Keine Bot-Profile vorhanden.</div>';
 }
 async function load(){
  if(!authorized()||busy)return;
  install();
  try{const data=await rpc({p_action:'status'});render(data);notice('');}
  catch(e){notice('Bot-Status konnte nicht geladen werden: '+(e?.message||String(e)));}
 }
 async function control(action,slot){
  if(!authorized()||busy)return;busy=true;
  try{
   if(action==='enable'&&!confirm('Server-1-Autopilot für alle bereiten Bots aktivieren?'))return;
   const data=await rpc({p_action:action,p_slot:slot==null?null:slot});
   render(data);notice('Änderung auf Server 1 gespeichert.',true);
  }catch(e){notice('Aktion fehlgeschlagen: '+(e?.message||String(e)));}
  finally{busy=false;if(last)render(last);}
 }
 window.v8243InstallBotAdmin=install;
 window.v8243LoadBotAdmin=load;
})();
