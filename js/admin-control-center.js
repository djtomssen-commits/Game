(()=>{
'use strict';
/* V8.290: Standalone authorized Admin UI; all domain reads/writes via admin-only RPC. */
const API='https://egzfmnlqwaixwsyppucp.supabase.co';
const PUBLIC_KEY='sb_publishable_OPSJDLXJUYGY2FLl73n8Jg_yhI-zUvd';
const S={db:null,user:null,server:'beta',page:'overview',player:null,query:'',seq:0};
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','&quot;':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>Number(v||0).toLocaleString('de-DE');
const when=v=>v?new Date(v).toLocaleString('de-DE'):'–';
const srv=()=>S.server==='server1'?'Server 1':'Beta';
const label=(x,c='')=>`<span class="tag ${c}">${esc(x)}</span>`;
const box=(title,html,right='')=>`<section class="panel"><div class="panel-head"><h3>${esc(title)}</h3>${right}</div>${html}</section>`;
const intro=(title,note)=>`<div class="page-intro"><div><h2>${esc(title)}</h2><p>${esc(note)}</p></div><span class="pill">${srv()}</span></div>`;
const line=(a,b)=>`<div class="info-line"><span class="label">${esc(a)}</span><strong>${esc(b??'–')}</strong></div>`;
const card=(t,v,n='',cls='')=>`<article class="metric"><div class="key">${esc(t)}</div><div class="number ${cls}">${fmt(v)}</div><div class="note">${esc(n)}</div></article>`;
const empty=t=>`<div class="empty">${esc(t)}</div>`;
const tbl=(cols,rows)=>`<div class="table-wrap"><table class="data-table"><thead><tr>${cols.map(t=>'<th>'+esc(t)+'</th>').join('')}</tr></thead><tbody>${rows.length?rows.map(r=>'<tr>'+r.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join(''):`<tr><td colspan="${cols.length}">${empty('Keine Einträge')}</td></tr>`}</tbody></table></div>`;
const titles={overview:'Übersicht',players:'Spieler & Charaktere',economy:'Ökonomie',settings:'Einstellungen',security:'Sicherheit & Audit',events:'Events',communications:'Mitteilungen',bots:'Bot-Steuerung',system:'Systemstatus'};
let noticeTimer;
function notice(message,failed=false){const el=$('notice');el.textContent=String(message);el.className='notice visible'+(failed?' error':'');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.classList.remove('visible'),5500)}
function errorText(err){const t=String(err?.message||err||'Unbekannter Fehler');return t.includes('ADMIN_ACCESS_DENIED')?'Zugriff verweigert: Das Konto ist nicht als Grow-Legends-Admin freigeschaltet.':t.includes('SETTING_VERSION_CONFLICT')?'Diese Einstellung wurde zwischenzeitlich geändert. Bitte neu laden.':t}
async function rpc(action,payload={},server=S.server){const {data,error}=await S.db.schema(server==='beta'?'public':'server1').rpc('v8290_admin_console',{p_action:action,p_payload:payload});if(error)throw error;if(!data?.ok)throw new Error(data?.reason||'Admin-Abfrage fehlgeschlagen');return data}
function showApp(show){$('app').classList.toggle('hidden',!show);$('login-screen').classList.toggle('hidden',show)}
async function signIn(e){e.preventDefault();const btn=$('login-button');btn.disabled=true;try{const {data,error}=await S.db.auth.signInWithPassword({email:$('login-email').value.trim(),password:$('login-password').value});if(error)throw error;S.user=data.user;await rpc('whoami');$('login-password').value='';showApp(true);await open('overview')}catch(e){S.user=null;await S.db.auth.signOut().catch(()=>{});showApp(false);notice(errorText(e),true)}finally{btn.disabled=false}}
async function signOut(){await S.db.auth.signOut();S.user=null;S.player=null;showApp(false)}
async function changeServer(next){if(next===S.server)return;try{await rpc('whoami',{},next);S.server=next;S.player=null;document.querySelectorAll('[data-server]').forEach(b=>b.classList.toggle('selected',b.dataset.server===next));$('server-warning').classList.toggle('hidden',next!=='server1');notice('Server: '+srv());await open('overview')}catch(e){notice(errorText(e),true)}}
async function open(page=S.page){
 S.page=page;
 $('page-title').textContent=titles[page]||page;
 $('breadcrumb').textContent=(titles[page]||page).toUpperCase();
 document.querySelectorAll('[data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===page));
 const sequence=++S.seq,scope=S.server;
 $('page-content').innerHTML='<div class="loading">Lade aktuelle Daten vom '+srv()+' …</div>';
 try{const html=await screens[page]();if(S.seq!==sequence||S.server!==scope)return;$('page-content').innerHTML=html;wire(page)}
 catch(e){if(S.seq===sequence){$('page-content').innerHTML=box('Abfrage fehlgeschlagen','<p class="error-text">'+esc(errorText(e))+'</p>');notice(errorText(e),true)}}
}
const screens={
 async overview(){
 const d=await rpc('overview');
 return intro('Spielbetrieb auf einen Blick','Charaktere, Echtgeldkäufe, Sicherheitsmonitoring und Quest-Ökonomie live aus der ausgewählten Umgebung.')+
 `<div class="cards">${card('CHARAKTERE',d.players,'Registrierte Charaktere','accent')}${card('SPIELER OHNE BOT',Math.max(0,d.players-d.bots),'Echte und manuelle Tester')}${card('GOOGLE-PLAY-KÄUFE',d.purchaseCount,'Verifizierte Transaktionen','gold')}${card('WARNUNGEN / 24 H',d.recentAlerts,'Automatisch erkannt',d.recentAlerts?'red':'')}</div>`+
 `<div class="grid-two">${box('Serversicherheit',line('Umgebung',srv())+line('Änderungsprotokolle',fmt(d.auditEvents))+line('Letzter Sicherheitslauf',when(d.lastWatch))+line('Gespeicherte Warnungen',fmt(d.alerts))+line('Aktive Events',fmt(d.activeEvents)),label('SERVERAUTORITATIV'))}${box('Quest-Belohnungen',line('100 verbrauchte Quest-Dampf','0–1 Harz-Taler')+line('Wahrscheinlichkeit',Math.round(Number(d.questDampfChance||0)*100)+' %')+line('Erste Tagesquest','+2 Harz-Taler')+line('Extra-Drop je Quest',(Math.round(Number(d.questBonusChance||0)*1000)/10).toLocaleString('de-DE')+' %')+`<p class="fineprint" style="margin-top:14px">Die Dampf-Chance lässt sich unter Einstellungen ändern.</p>`,label('SERVER-EINSTELLUNG'))}</div>`+
 `<div class="section-spacer"></div>`+box('Schnellaktionen',`<div class="togglebar"><button class="secondary" data-go="players">Spieler suchen</button><button class="secondary" data-go="security">Warnungen prüfen</button><button class="secondary" data-go="settings">Dropchance ändern</button><button class="secondary" data-go="events">Events ansehen</button></div>`);
 },
 async players(){
 const data=S.query.length>=2?(await rpc('players',{query:S.query})).players:[];
 const result=intro('Spieler & Charaktere','Inventar, Ausrüstung, Währungen, Schutzflags, Quest-Dampf und Turm-Statistik pro Account prüfen.')+
 box('Spieler suchen',`<form class="toolbar" id="find-player"><label>Name<input id="find-name" value="${esc(S.query)}" minlength="2" maxlength="80" placeholder="Tomssen, Haxxar …"></label><button type="submit" class="secondary">Suchen</button></form>`+
 tbl(['Spieler','Klasse','Level','Gold','Harz-Taler','Details'],(data||[]).map(x=>[esc(x.name),esc(x.class),fmt(x.level),fmt(x.gold),fmt(x.harz),`<button class="row-link" data-user="${esc(x.id)}" data-name="${esc(x.name)}">Öffnen →</button>`])));
 if(!S.player)return result;
 let d;
 try{d=(await rpc('player',{user_id:S.player.id})).player}catch(e){return result+box('Spielerakte','<p class="error-text">'+esc(errorText(e))+'</p>')}
 S.player.name=d.name;
 const equipped=Object.entries(d.equipment||{}).filter(([,v])=>v).map(([k,v])=>esc(k)+': '+esc(v.name||v.id||'?'));
 return result+'<div class="section-spacer"></div>'+box('Spielerakte: '+d.name,
 `<div class="grid-two"><div>${line('Klasse',d.class)}${line('Level',d.level)}${line('Gold',fmt(d.gold))}${line('Harz-Taler',fmt(d.harz))}${line('Quest-Dampf',fmt(d.questDampf))}${line('Aktueller Dampf',fmt(d.dampf))}</div><div>${line('Inventarslots',Array.isArray(d.inventory)?d.inventory.length:0)}${line('Itemrevision',d.itemRevision)}${line('Turm-Etage',d.towerBest)}${line('Turm-Score',d.towerScore)}${line('Turm-Runs',d.towerRuns)}${line('Items geschützt',d.protected?.items?'Ja':'Prüfen')}</div></div><div class="divider"></div><h3>Ausrüstung</h3><p class="panel-intro" style="margin-top:10px">${equipped.length?equipped.join(' · '):'Keine Items angelegt'}</p><button class="secondary" data-go="economy">Support-Gutschrift vorbereiten →</button>`);
 },
 async economy(){
 return intro('Wirtschaft & Support','Gold und Harz-Taler nur über serverseitig protokollierte, idempotente Gutschriften verändern.')+
 `<div class="grid-two">${box('Gold / Harz-Taler gutschreiben',`
 <div class="warnbox"><strong>Schutz aktiv:</strong> Nur positive Beträge, Pflichtbegründung, Transaktions-ID und ausdrückliche Server-/Spielerbestätigung. Keine Vollspielstand-Schreibvorgänge.</div>
 <p class="readout">Empfänger: ${S.player?esc(S.player.name)+' / '+srv():'Kein Spieler ausgewählt. Bitte zuerst „Spieler & Charaktere“ öffnen.'}</p>
 <form id="grant-form" class="form-grid">
 <label>Gold<input type="number" name="gold" min="0" max="100000" step="1" value="0" required></label>
 <label>Harz-Taler<input type="number" name="harz" min="0" max="250" step="1" value="0" required></label>
 <label class="span2">Begründung (mindestens 10 Zeichen)<textarea name="reason" rows="3" minlength="10" maxlength="400" placeholder="Supportfall / Ticketnummer / Grund" required></textarea></label>
 <label class="span2 inline"><input type="checkbox" name="agree" required> Ich habe Empfänger und ${srv()} kontrolliert.</label>
 <button type="submit" class="primary span2" ${S.player?'':'disabled'}>Gutschrift prüfen und ausführen</button>
 </form>`,label('PROTOKOLLIERT','warn'))}${box('Buchungssicherheit',line('Gold','Kanonischer Server')+line('Harz-Taler','Kanonischer Server')+line('Doppelte Anfragen','Durch Vorgangs-ID verhindert')+line('Angebote & Preise','Keine versteckten Änderungen')+line('Bestandsänderungen','Mit Vorher-/Nachher-Werten')+line('Echtgeldtransaktionen','Google Play / Ledger'),label('RECHTE GEPRÜFT'))}</div>`;
 },
 async settings(){
 const data=(await rpc('settings')).settings||[];
 return intro('Game-Balance & Einstellungen','Aktive Serverparameter ändern, ohne Code manuell zu bearbeiten. Änderungen gelten nur für den ausgewählten Server.')+
 data.map(x=>`<section class="setting-row"><header><h3>${esc(x.title)}</h3>${label(x.editable?'ÄNDERBAR':'NUR LESBAR',x.editable?'':'warn')}</header><p>${esc(x.description)}</p><div class="info-line"><span class="label">Aktuell</span><strong>${(Number(x.value)*100).toLocaleString('de-DE')} %</strong></div>
 ${x.editable?`<form class="setting-form" data-key="${esc(x.key)}" data-rev="${esc(x.revision)}"><label>Chance: <span class="setting-output">${(Math.round(Number(x.value)*1000)/10).toLocaleString('de-DE')} %</span><input name="pct" type="range" min="0" max="${x.key==='quest_bonus_harz_chance'?25:100}" step="0.1" value="${Math.round(Number(x.value)*1000)/10}"></label><div class="actions"><label>Änderungsgrund<input name="reason" minlength="8" maxlength="400" placeholder="Warum anpassen?" required></label><button type="submit" class="primary">Wert speichern</button></div></form>`:'<p class="fineprint">Der Parameter ist noch nicht an einen beschreibbaren Owner-Regler angebunden.</p>'}</section>`).join('')+
 `<h3 class="settings-category">Weitere Einstellungsbereiche (in Vorbereitung)</h3><div class="grid-two">${box('Klassen & Kampf','<p class="panel-intro">Basisattribute, Talente, Gegner-Skalierung, PvP, Dungeon, Turm und Item-Drops benötigen jeweils validierte Balance-Owner.</p>',label('NOCH GESPERRT','blue'))}${box('Spielbetrieb','<p class="panel-intro">Events, Shoppreise, VIP, Grow-Cup, Weltboss und Dampf-Cooldowns folgen als getrennte, versionsgesicherte Einstellungsgruppen.</p>',label('NOCH GESPERRT','blue'))}</div>`;
 },
 async security(){
 const [a,h]=await Promise.all([rpc('alerts'),rpc('audit')]);
 const alerts=a.alerts||[],history=h.changes||[];
 return intro('Sicherheitswache & Audit','Verdächtige Änderungen und historische Werte prüfen. Alle Anzeigen sind ausschließlich lesend.')+
 `<div class="cards">${card('VERDACHTSFÄLLE',alerts.length,'Letzte 60 Warnungen',alerts.length?'red':'accent')}${card('ÄNDERUNGEN',history.length,'Letzte 60 Journalzeilen')}${card('SERVER',S.server==='beta'?0:1,srv())}${card('GEPRÜFTE BEREICHE',4,'Währungen · Items · Grow · Talente','accent')}</div>`+
 box('Verdächtige Bestandsänderungen',alerts.length?alerts.map(x=>`<div class="mini-row"><div><strong>${esc(x.player_name||'Unbekannt')} · ${esc(x.rule)}</strong><div class="desc">${esc(x.domain)} · ${esc(when(x.event_at))} · ${esc(JSON.stringify(x.before_summary))} → ${esc(JSON.stringify(x.after_summary))}</div></div>${label((x.severity||'').toUpperCase(),x.severity==='high'?'red':'warn')}</div>`).join(''):empty('Zurzeit keine protokollierten Verdachtsfälle.'))+
 '<div class="section-spacer"></div>'+box('Letzte Änderungen',tbl(['Zeit','Charakter','Bereich','Revision','Vorher / Nachher'],history.map(x=>[
 esc(when(x.recorded_at)),esc(x.player_name||'–'),esc(x.domain),esc((x.revision_before??'–')+' → '+(x.revision_after??'–')),
 esc(JSON.stringify(x.previous)).slice(0,120)+' → '+esc(JSON.stringify(x.current)).slice(0,120)
 ])));
 },
 async events(){const data=(await rpc('events')).events||[];return intro('Events & Termine','Aktuelle Events auf dem ausgewählten Server. Änderungsaktionen bleiben bis zur Freigabe des Event-Owners gesperrt.')+box('Veranstaltungen',tbl(['Name','Aktiv','Beginn','Ende','Beschreibung'],data.map(x=>[esc(x.name),x.is_active?label('JA'):label('NEIN','warn'),esc(when(x.starts_at)),esc(when(x.ends_at)),esc(x.description).slice(0,110)])))},
 async communications(){const data=(await rpc('broadcasts')).broadcasts||[];return intro('News & Community','Mitteilungen, Umfragen und Nachrichten. Nachrichtenversand erst nach getrennter Vorschau / Empfängerfreigabe.')+box('Mitteilungen',tbl(['Titel','Typ','Veröffentlicht','Zeit'],data.map(x=>[esc(x.title),esc(x.kind),x.is_published?label('JA'):label('ENTWURF','warn'),esc(when(x.created_at))])))},
 async bots(){const d=(await rpc('bot_status')).bots||{};return intro('Bot-Simulation','Bot-System nur kontrolliert steuern. Mutierende Bot-Aktionen sind in Version 1 noch nicht freigegeben.')+`<div class="cards">${card('BOTS',d.count,'In dieser Umgebung','accent')}${card('AKTIV',d.active,'Simulationsspieler')}${card('FEHLER',d.errors,'Zuletzt registriert',d.errors?'red':'')}${card('SERVER',S.server==='server1'?1:0,srv())}</div>`+box('Simulationsstatus',line('Letzte Aktion',when(d.lastAction))+line('Belohnungs-Videos','Für Bots deaktiviert')+`<p class="fineprint">Weitere Steuerbefehle wie Pausieren, Levelvarianten und Balance-Simulation folgen mit Begrenzungen.</p>`)},
 async system(){const d=await rpc('overview');return intro('Systemstatus','Gesicherte Datenbestände und Prüfprozesse beider Umgebungen.')+`<div class="grid-two">${box('Sicherheit',line('Server',srv())+line('Charaktere',fmt(d.players))+line('Auditänderungen',fmt(d.auditEvents))+line('Letzter Prüfjob',when(d.lastWatch))+line('Warnungen / 24 h',fmt(d.recentAlerts)),label('ONLINE'))}${box('Release & Backups',line('Spielstand-Schutz','Kanonische Serverwerte')+line('Gutschriften','Journal / einmalig')+line('Quest-Dampf-Bonus','0 oder 1')+`<p class="fineprint">Cloudflare-Deployment, Backups, App-Release, automatische Rollbacks und Build-Pipeline benötigen ein separates DevOps-Backend; hier nur Status.</p>`,label('AUSBAUSTUFE','blue'))}</div>`}
};
function wire(page){
 document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.go)));
 if(page==='players'){
 $('find-player')?.addEventListener('submit',e=>{e.preventDefault();S.query=$('find-name').value.trim();S.player=null;void open('players')});
 document.querySelectorAll('[data-user]').forEach(b=>b.addEventListener('click',()=>{S.player={id:b.dataset.user,name:b.dataset.name};void open('players')}));
 }
 if(page==='settings')document.querySelectorAll('.setting-form').forEach(f=>{
 f.querySelector('[name=pct]').addEventListener('input',e=>{f.querySelector('.setting-output').textContent=e.target.value+' %'});
 f.addEventListener('submit',async e=>{
 e.preventDefault();const pct=Number(f.querySelector('[name=pct]').value),reason=f.querySelector('[name=reason]').value.trim();
 if(reason.length<8)return notice('Bitte eine aussagekräftige Begründung eingeben.',true);
 if(!confirm(srv()+': Chance wirklich auf '+pct+' % ändern?'))return;
 try{await rpc('set_setting',{key:f.dataset.key,value:pct/100,expected_revision:Number(f.dataset.rev),reason,confirm_server:S.server});notice('Einstellung gespeichert und protokolliert.');await open('settings')}catch(err){notice(errorText(err),true)}
 });
 });
 if(page==='economy')$('grant-form')?.addEventListener('submit',grant);
}
async function grant(e){
 e.preventDefault();
 if(!S.player)return notice('Bitte zuerst einen Spieler auswählen.',true);
 const f=e.currentTarget,form=new FormData(f),gold=Number(form.get('gold')||0),harz=Number(form.get('harz')||0),reason=String(form.get('reason')||'').trim(),word=S.server==='server1'?'SERVER 1':'BETA';
 if(!Number.isSafeInteger(gold)||!Number.isSafeInteger(harz)||gold<0||gold>100000||harz<0||harz>250||(gold===0&&harz===0))return notice('Ungültiger Betrag.',true);
 if(reason.length<10)return notice('Begründung zu kurz.',true);
 if(prompt('Bestätige '+srv()+' / '+S.player.name+' / +'+gold+' Gold / +'+harz+' Harz-Taler.\nGib exakt '+word+' ein:')!==word)return;
 if(!f.dataset.requestId)f.dataset.requestId=crypto.randomUUID();
 const btn=f.querySelector('[type=submit]');btn.disabled=true;
 try{
  await rpc('grant',{request_id:f.dataset.requestId,user_id:S.player.id,confirm_player:S.player.id,confirm_server:S.server,gold,harz,reason});
  delete f.dataset.requestId;notice('Einmalige Gutschrift verbucht.');await open('economy');
 }catch(err){notice('Unklarer Buchungsstatus: '+errorText(err)+'. Gleiche Vorgangs-ID bleibt für sicheren erneuten Versuch erhalten.',true)}
 finally{btn.disabled=false}
}
async function init(){
 if(!window.supabase?.createClient){notice('Admin-Bibliothek konnte nicht geladen werden.',true);return}
 S.db=window.supabase.createClient(API,PUBLIC_KEY,{auth:{storageKey:'grow-legends-admin-v8290',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 $('login-form').addEventListener('submit',signIn);
 $('logout-button').addEventListener('click',signOut);
 $('refresh-button').addEventListener('click',()=>open());
 document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.page)));
 document.querySelectorAll('[data-server]').forEach(b=>b.addEventListener('click',()=>changeServer(b.dataset.server)));
 try{const {data,error}=await S.db.auth.getUser();if(error)throw error;if(data?.user){S.user=data.user;await rpc('whoami');showApp(true);await open('overview')}}catch(e){S.user=null;await S.db.auth.signOut().catch(()=>{});showApp(false)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else void init();
})();