/* Grow Legends V8.243 – Server-1 Bot-Verwaltung.
   Ein einziger Admin-Subowner; kein Render-Wrapper / keine Änderung am Spielablauf.
   RPC prüft die Adminrolle serverseitig. */
(()=>{
 'use strict';
 const P='v8243Bot';
 const $=s=>document.querySelector(s);
 let busy=false;
 let last=null;
 let lastDungeon=null;
 let buildBySlot={};
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
   <div class="v093-admin-actions" style="display:flex;flex-direction:column;align-items:stretch;gap:7px;margin-bottom:10px">
    <style>
     #v8243BotAdmin .v093-admin-actions > .btn {
       display:block !important;width:100% !important;max-width:100% !important;
       min-width:0 !important;min-height:43px !important;height:auto !important;
       padding:10px 12px !important;line-height:1.3 !important;
       white-space:normal !important;overflow-wrap:normal !important;
       word-break:normal !important;hyphens:none !important;
       font-size:14px !important;text-align:center !important;
     }
    </style>
    <button id="${P}Toggle" class="btn secondary" disabled>Autopilot laden …</button>
    <button id="${P}Refresh" class="btn secondary">Aktualisieren</button>
    <button id="${P}Provision" class="btn secondary" disabled>49 Bot-Konten erstellen und starten</button>
   </div>
   <div class="muted" style="font-size:12px;margin-bottom:10px">Pausieren stoppt neue Aktionen. Angelegte Charaktere bleiben zunächst erhalten. Stilllegen ist vollständig umkehrbar und stoppt spätere Bot-Aktionen. Das dauerhafte Löschen des Spielaccounts wird erst nach vollständiger Prüfung von Gilden, PvP, Nachrichten und Käufen freigegeben.</div>
   <div id="${P}Feedback" role="status" style="font-size:12px;margin:8px 0"></div>
   <div id="${P}Trial" class="muted" style="font-size:12px;margin:8px 0">Nebelwolf-Quest-Test wird geladen …</div>
   <div id="${P}DungeonSummary" class="muted" style="font-size:12px;margin:8px 0">Dungeon-Pilot wird geladen …</div>
   <button id="${P}DungeonToggle" class="btn secondary" disabled>Dungeon-Pilot laden …</button>
   <div id="${P}List" style="max-height:440px;overflow:auto"><div class="muted">Bot-Profile werden geladen …</div></div>`;
  parent.appendChild(card);
  $('#'+P+'Refresh').onclick=()=>load();
  $('#'+P+'Provision').onclick=()=>bulkProvision();
  $('#'+P+'Toggle').onclick=()=>{if(last)control(last.enabled?'disable':'enable');};
  $('#'+P+'DungeonToggle').onclick=()=>{if(lastDungeon)dungeonControl(lastDungeon.enabled?'disable':'enable');};
  $('#'+P+'List').addEventListener('click',event=>{
   const btn=event.target.closest('[data-bot-action]');if(!btn||busy)return;
   const slot=Number(btn.dataset.botSlot);const action=btn.dataset.botAction;
   if(!Number.isInteger(slot)||slot<1||slot>50)return;
   if(action==='pause'||action==='resume')control(action,slot);
   else if(action==='archive'||action==='restore')archive(slot,action==='restore');
  });
 }
 async function rpc(payload){const {data,error}=await api().rpc('v8243_bot_admin',payload);if(error)throw error;if(!data?.ok)throw Error(data?.reason||'Unbekannter Fehler');return data;}
 function render(data){
  last=data;
  const ready=Number(data.provisioned)||0,active=Number(data.active)||0;
  const global=$('#'+P+'Toggle');
  if(global){global.disabled=busy||(!data.enabled&&(ready===0||active===0||!data.worker_ready));global.textContent=!data.worker_ready?'Autopilot noch nicht bereit':(data.enabled?'Autopilot ausschalten':'Autopilot einschalten');}
  const provision=$('#'+P+'Provision');
  if(provision){
   provision.disabled=busy||ready>=50||!data.worker_ready;
   provision.textContent=ready>=50?'Alle 50 Bot-Konten angelegt'
     :'Verbleibende '+Math.max(0,50-ready)+' Bots erstellen und starten';
  }
  const summary=$('#'+P+'Summary');
  if(summary)summary.textContent=`Vorbereitet: ${data.configured||0} / 50 · Angelegte Charaktere: ${ready} · Spielbereit: ${active} · Autopilot: ${data.enabled?'EIN':'AUS'}${!data.worker_ready?' (Automatik noch nicht installiert)':''}`;
  const dungeonButton=$('#'+P+'DungeonToggle');
  if(dungeonButton&&lastDungeon)dungeonButton.disabled=busy||(!lastDungeon.enabled&&(!lastDungeon.bot_active||!lastDungeon.scheduler_active));
  const list=$('#'+P+'List');if(!list)return;
  list.innerHTML=(data.agents||[]).map(a=>{
   const canPause=a.lifecycle==='active';
   const canResume=a.lifecycle==='paused'&&!!data.worker_ready;
   const canArchive=a.lifecycle!=='retired';
   const canRestore=a.lifecycle==='retired';
   const action=canPause?'pause':canResume?'resume':'';
   return `<div class="v093-admin-item" style="padding:9px 0;border-bottom:1px solid #72543850">
    <div class="v093-admin-item-top"><b>#${a.slot} ${esc(a.name)}</b><span class="pill">${esc(labels[a.lifecycle]||a.lifecycle)}</span></div>
    <div class="muted" style="font-size:12px">${esc(a.class)} · ${esc(profiles[a.playstyle]||a.playstyle)} · Aktivität ${Math.round(Number(a.intensity||0)*100)} % · ${Number(a.total_actions)||0} Aktionen</div>
    ${a.last_action?'<div class="muted" style="font-size:11px">Letzte Aktion: '+esc(a.last_action)+'</div>':''}
    ${buildBySlot[a.slot]?'<div class="muted" style="font-size:11px">Level '+Number(buildBySlot[a.slot].level||0)+' · Attribute: '+Number(buildBySlot[a.slot].attribute_actions||0)+' · Talente: '+Number(buildBySlot[a.slot].talent_actions||0)+' · Items ausgerüstet: '+Number(buildBySlot[a.slot].equip_actions||0)+' · Freie Punkte: '+Number(buildBySlot[a.slot].available_attributes||0)+' / '+Number(buildBySlot[a.slot].available_talents||0)+'</div>':''}
    ${action?'<button class="btn secondary" style="margin-top:6px" data-bot-action="'+action+'" data-bot-slot="'+Number(a.slot)+'">'+(canPause?'Pausieren':'Fortsetzen')+'</button>':''}
    ${canArchive?'<button class="btn secondary" style="margin:6px 0 0 6px" data-bot-action="archive" data-bot-slot="'+Number(a.slot)+'">Stilllegen</button>':''}
    ${canRestore?'<button class="btn secondary" style="margin-top:6px" data-bot-action="restore" data-bot-slot="'+Number(a.slot)+'">Wiederherstellen</button>':''}
   </div>`;
  }).join('')||'<div class="muted">Keine Bot-Profile vorhanden.</div>';
 }
 async function bulkProvision(){
   if(!authorized()||busy||!last||Number(last.provisioned)>=50)return;
   const pending=Math.max(0,50-Number(last.provisioned||0));
   if(!confirm('Jetzt '+pending+' echte Bot-Konten auf Server 1 anlegen und erst nach vollständiger Einrichtung automatisch für Quests starten? Keine PvP-Kämpfe, Käufe oder Chat-Aktionen. Die Erstellung kann auf dem Handy etwas dauern; bleib auf dieser Seite.'))return;
   busy=true;
   let made=0;
   let message='';
   let success=false;
   try{
    for(let batch=0;batch<11;batch++){
     const {data,error}=await v073Db.functions.invoke('v8256-bot-provision',{body:{limit:5}});
     if(error)throw Error('Kontenerstellung: '+(error.message||String(error)));
     if(!data||!data.ok){
      const failed=(data?.results||[]).find(r=>!r.ok);
      throw Error('Bot #'+String(failed?.slot||'?')+': '+String(failed?.reason||'Fehler bei der Kontoanlage'));
     }
     made+=(data.results||[]).filter(r=>r.ok).length;
     const current=await rpc({p_action:'status'});
     render(current);
     notice('Bot-Konten werden angelegt: '+Number(current.provisioned)+'/50. Bitte diese Seite offen lassen.',true);
     if(Number(current.provisioned)===50){
      const {data:activated,error:activateError}=await api().rpc('v8257_activate_bot_roster');
      if(activateError||!activated?.ok){
       throw Error('Alle 50 Konten sind da, aber Start noch nicht bestätigt: '+(activateError?.message||activated?.reason||'Unbekannt'));
      }
      success=true;
      message='50 von 50 Bot-Konten erfolgreich angelegt und für automatische Quests aktiviert.';
      break;
     }
     if(!data.processed)throw Error('Keine neuen Konten angelegt; bitte Status prüfen.');
    }
    if(!success&&!message)message='Anlage fortgesetzt: '+made+' neue Bots. Bitte erneut ausführen, wenn noch Konten fehlen.';
   }catch(e){
    message='Bot-Anlage unterbrochen nach '+made+' neuen Konten: '+(e?.message||String(e))+'. Bereits erstellte Charaktere bleiben erhalten; erneuter Klick setzt die Anlage fort.';
   }finally{
    busy=false;
    await load();
    notice(message,success);
   }
  }
  async function archive(slot,restore){
  if(!authorized()||busy)return;
  const message=restore
    ?'Bot-Platz '+slot+' wiederherstellen? Der Charakter bleibt erhalten und der Bot wird pausiert.'
    :'Bot-Platz '+slot+' stilllegen? Es werden keine Accounts oder Spielstände gelöscht. Die Aktion ist umkehrbar.';
  if(!confirm(message))return;
  busy=true;
  try{
   const result=await api().rpc('v8250_bot_archive',{p_slot:slot,p_restore:restore});
   if(result.error||!result.data?.ok)throw Error(result.error?.message||'Aktion abgelehnt');
   notice(restore?'Bot wiederhergestellt.':'Bot stillgelegt. Charakterdaten bleiben erhalten.',true);
  }catch(e){notice('Bot-Aktion fehlgeschlagen: '+(e?.message||String(e)));}
  finally{busy=false;last=null;load();}
 }
 function renderDungeon(data){
  lastDungeon=data;
  const el=$('#'+P+'DungeonSummary');
  if(el){
   const lastRun=data.last_run_id
     ?' · Letzter Run #'+Number(data.last_run_id)+' ('+(data.last_won?'Sieg':'Niederlage')+')'
     :' · Noch kein Dungeonversuch';
   el.textContent='Nebelwolf · Dungeon 1 (kostenlose Versuche) · '+(data.enabled?'AKTIV':'AUS')
     +' · Heute '+Number(data.attempts_today||0)+'/2'+lastRun;
  }
  const btn=$('#'+P+'DungeonToggle');
  if(btn){
   btn.textContent=data.enabled?'Dungeon-Pilot ausschalten':'Dungeon-Pilot einschalten';
   btn.disabled=busy||(!data.enabled&&(!data.bot_active||!data.scheduler_active));
  }
 }
 async function dungeonControl(action){
  if(!authorized()||busy||!lastDungeon)return;
  if(action==='enable'&&!confirm('Nebelwolf darf automatisch maximal zwei kostenlose Versuche in Dungeon 1 pro Tag absolvieren. Einschalten?'))return;
  busy=true;
  try{
   const result=await api().rpc('v8253_bot_dungeon_admin',{p_action:action});
   if(result.error||!result.data?.ok)throw Error(result.error?.message||result.data?.reason||'Dungeon-Pilot fehlgeschlagen');
   renderDungeon(result.data);
   notice('Dungeon-Pilot auf Server 1 gespeichert.',true);
  }catch(e){notice('Dungeon-Pilot: '+(e?.message||String(e)));}
  finally{busy=false;if(lastDungeon)renderDungeon(lastDungeon);}
 }
 async function load(){
  if(!authorized()||busy)return;
  install();
  try{
   const data=await rpc({p_action:'status'});
   render(data);notice('');
   const trialEl=$('#'+P+'Trial');
   if(trialEl){
    const result=await api().rpc('v8249_bot_trial_status');
    if(result.error||!result.data?.ok){trialEl.textContent='Quest-Teststatus zurzeit nicht verfügbar.';}
    else{
     const t=result.data.test||{};
     const done=t.phase==='completed';
     trialEl.textContent=done
      ?'Nebelwolf · erster Quest-Test: '+Number(t.xp_awarded||0)+' EXP · '+Number(t.gold_awarded||0)+' Gold · '+Number(t.harz_awarded||0)+' Harz-Taler. Quest-Autopilot: '+(data.enabled&&data.worker_ready?'aktiv':'pausiert')+'.'
      :'Nebelwolf · Quest-Test: '+String(t.phase||'unbekannt')+'. Quest-Autopilot: '+(data.enabled&&data.worker_ready?'aktiv':'pausiert')+'.';
    }
   }
   const d=await api().rpc('v8253_bot_dungeon_admin',{p_action:'status'});
   if(d.error||!d.data?.ok){
    const el=$('#'+P+'DungeonSummary');
    if(el)el.textContent='Dungeon-Pilotstatus nicht verfügbar.';
    lastDungeon=null;
   }else{renderDungeon(d.data);}
   const dev=await api().rpc('v8263_bot_development_status');
   if(!dev.error&&dev.data?.ok){
    buildBySlot={};
    (dev.data.agents||[]).forEach(x=>{buildBySlot[Number(x.slot)]=x;});
    render(data);
   }
  }
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
