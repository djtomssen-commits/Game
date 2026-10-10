/* Grow Legends V8.383 – passive, admin-visible flight recorder.
   No interval, gameplay changes, database writes, DOM observers or fetch wrappers.
   Actual network outcomes come from the existing V4107 owner. */
(function(){
 'use strict';
 if(window.__GL_FLIGHT_RECORDER__)return;
 var MAX_EVENTS=120,MAX_GROUPS=60,VERSION='V8.383';
 var events=[],groups=[],breadcrumbs=[],lastAction=null,started=Date.now();
 var ui=null,alertNode=null,open=false,scheduled=false,revision=0,shownRevision=-1;
 var nativeError=console.error.bind(console);
 var isAdmin=function(){try{return typeof v093IsAdmin!=='undefined'&&v093IsAdmin===true}catch(_){return false}};
 var channel=function(){return String(window.GROW_RELEASE_CHANNEL||'unknown').toLowerCase()};
 var screen=function(){try{return document.querySelector('section.screen.active')?.id||document.querySelector('.screen.active')?.id||'boot'}catch(_){return 'unknown'}};
 var now=function(){try{return performance.now()}catch(_){return Date.now()}};
 function scrub(value,max){
  var s=String(value==null?'':value);
  s=s.replace(/(?:https?:\/\/)[^\s<>"']+/ig,function(u){try{return new URL(u).pathname}catch(_){return '[URL]'}});
  s=s.replace(/eyJ[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{15,}(?:\.[A-Za-z0-9_\-]{12,})?/g,'[TOKEN]');
  s=s.replace(/(?:bearer|token|apikey|authorization)\s*[:=]\s*[A-Za-z0-9._\-]{12,}/ig,'[REDACTED]');
  s=s.replace(/[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}/g,'[ID]');
  s=s.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[EMAIL]');
  s=s.replace(/[?&](?:access_token|refresh_token|apikey|key|jwt|session)=[^\s&#]+/gi,'?[REDACTED]');
  return s.replace(/[\u0000-\u001f]+/g,' ').slice(0,max||240);
 }
 function safePath(value){
  try{var u=new URL(String(value||''),location.href);return scrub(u.pathname,115)}catch(_){return scrub(value,115).split('?')[0]}
 }
 function breadcrumb(kind,label){
  var item={at:Date.now(),screen:screen(),kind:kind,label:scrub(label,85)};
  breadcrumbs.push(item);if(breadcrumbs.length>40)breadcrumbs.shift();
  if(kind==='action')lastAction=item;
  return item;
 }
 function recentAction(time){
  return lastAction&&time-lastAction.at<=12000?lastAction:null;
 }
 function escapeHtml(x){return String(x==null?'':x).replace(/[&<>"']/g,function(v){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[v]})}
 function fire(kind,level,message,meta){
  try{
   var at=Date.now(),msg=scrub(message,260),place=screen();
   var path=meta&&meta.path?safePath(meta.path):'';
   var type=scrub(kind,42),sev=level==='error'?'error':'warning';
   var unique=meta&&meta.group?scrub(meta.group,90):
    (/^(?:NETWORK_FAILURE|NETWORK_REJECTED|RPC_REJECTED|SLOW_NETWORK)$/.test(type)
      ?path+'|'+String(Number(meta&&meta.status)||0)
      :(path?path+'|':'')+msg.slice(0,90));
   var key=type+'|'+place+'|'+unique;
   var item=groups.find(function(v){return v.key===key});
   if(item){item.count++;item.last=at;item.message=msg;}
   else{
    item={key:key,kind:type,severity:sev,message:msg,screen:place,path:path,first:at,last:at,count:1};
    groups.unshift(item);if(groups.length>MAX_GROUPS)groups.pop();
   }
   var action=recentAction(at);
   if(action){item.action=action.label;item.actionAgeMs=at-action.at}
   var entry={at:at,kind:type,severity:sev,screen:place,detail:msg,path:path,action:action?action.label:null,
    actionAgeMs:action?at-action.at:null,elapsedMs:Math.max(0,Math.round(Number(meta&&meta.elapsedMs)||0))};
   events.push(entry);if(events.length>MAX_EVENTS)events.shift();
   revision++;renderSoon();
  }catch(_){}
 }
 function network(input){
  try{
   var ms=Math.round(Number(input&&input.ms)||0),status=Number(input&&input.status)||0;
   var path=safePath(input&&input.url),method=String(input&&input.method||'GET').toUpperCase();
   var isApi=/\/(?:rest\/v1|auth\/v1|functions\/v1)\//.test(path);
   if(!isApi)return;
   var detail=method+' '+path+' · '+(status||'Netzwerkfehler')+' · '+ms+' ms';
   if(input.failed||status===0||status>=500)fire('NETWORK_FAILURE','error',detail,{path:path,elapsedMs:ms,status:status});
   else if(status===401||status===403||status===429)fire('NETWORK_REJECTED','warning',detail,{path:path,elapsedMs:ms,status:status});
   else if(status>=400&&!input.expectedReject)fire('RPC_REJECTED','warning',detail,{path:path,elapsedMs:ms,status:status});
   else if(ms>=3000)fire('SLOW_NETWORK','warning',detail,{path:path,elapsedMs:ms,status:status});
  }catch(_){}
 }
 function watchdog(row){
  try{
   if(!row||!row.kind||row.kind==='javascript_error'||row.kind==='unhandled_rejection')return;
   var details=row.details||{};
   var detail=scrub(row.kind,80)+' · '+scrub(details.action||details.rpc||details.elapsedMs||details.durationMs||details.message||details.lastError||'',140);
   fire('WATCHDOG_'+row.kind,row.severity==='error'?'error':'warning',detail,{group:row.kind+'|'+scrub(details.action||details.rpc||'',70)});
  }catch(_){}
 }
 function summary(){
  var errs=groups.filter(function(x){return x.severity==='error'});
  var warns=groups.filter(function(x){return x.severity!=='error'});
  return {version:VERSION,channel:channel(),at:Date.now(),uptimeMs:Date.now()-started,
   errors:errs.length,warnings:warns.length,errorOccurrences:errs.reduce(function(n,x){return n+x.count},0),
   warningOccurrences:warns.reduce(function(n,x){return n+x.count},0),
   groups:groups.map(function(x){return Object.assign({},x)}),
   recentEvents:events.slice(-70).map(function(x){return Object.assign({},x)}),
   breadcrumbs:breadcrumbs.slice(-35).map(function(x){return Object.assign({},x)})};
 }
 function renderSoon(){
  if(scheduled)return;scheduled=true;
  var later=typeof requestAnimationFrame==='function'?requestAnimationFrame:function(fn){setTimeout(fn,20)};
  later(function(){scheduled=false;if(isAdmin())render()});
 }
 function ensureUI(){
  if(ui||!isAdmin()||!document.body)return;
  var root=document.createElement('div');root.id='gl8383FlightRecorder';
  root.innerHTML='<button type="button" class="gl8383-pill" aria-label="Diagnosemonitor öffnen">🛡️ Monitor</button>'+
   '<section class="gl8383-panel" role="dialog" aria-label="Grow Legends Flugschreiber" hidden>'+
   '<div class="gl8383-bar"><b>🛡️ Flugschreiber V8.383</b><button type="button" data-gl8383="close">✕</button></div>'+
   '<p class="gl8383-desc">Automatisch während des Spielens · meldet beobachtete Fehler sofort. Zeitlich benachbarte Aktionen sind keine bewiesene Ursache.</p>'+
   '<div class="gl8383-actions"><button type="button" data-gl8383="copy">Bericht kopieren</button><button type="button" data-gl8383="clear">Zurücksetzen</button></div>'+
   '<div class="gl8383-data"></div></section>';
  var style=document.createElement('style');style.id='gl8383FlightStyle';style.textContent=
   '#gl8383FlightRecorder{position:fixed;bottom:calc(10px + env(safe-area-inset-bottom,0px));left:10px;z-index:2147482000;font:12px/1.45 system-ui,sans-serif;color:#f4f5eb;max-width:calc(100vw - 20px)}'+
   '#gl8383FlightRecorder button{font:inherit;cursor:pointer;border:1px solid #7e915a;border-radius:9px;background:#202d1f;color:#f4f5eb;padding:7px 10px}'+
   '#gl8383FlightRecorder .gl8383-pill{box-shadow:0 2px 10px #0009;font-weight:700;background:#253824}'+
   '#gl8383FlightRecorder .gl8383-pill.gl8383-error{background:#741d21;border-color:#f58b83}'+
   '#gl8383FlightRecorder .gl8383-pill.gl8383-warning{background:#584321;border-color:#e4aa51}'+
   '#gl8383FlightRecorder .gl8383-panel{width:min(440px,calc(100vw - 20px));max-height:min(72vh,670px);overflow:auto;background:#101b12;border:2px solid #647c4b;border-radius:14px;padding:12px;box-shadow:0 8px 32px #000d}'+
   '#gl8383FlightRecorder .gl8383-panel[hidden]{display:none}'+
   '#gl8383FlightRecorder .gl8383-bar,.gl8383-actions{display:flex;align-items:center;justify-content:space-between;gap:8px}'+
   '#gl8383FlightRecorder .gl8383-desc{color:#bbcab4;margin:9px 0}'+
   '#gl8383FlightRecorder .gl8383-actions{justify-content:flex-start;margin:8px 0}'+
   '#gl8383FlightRecorder .gl8383-issue{margin:8px 0;padding:9px;border:1px solid #465a3b;border-radius:9px;overflow-wrap:anywhere}'+
   '#gl8383FlightRecorder .gl8383-issue.error{border-color:#a94444}'+
   '#gl8383FlightRecorder .gl8383-issue.warning{border-color:#917044}'+
   '#gl8383FlightRecorder .gl8383-small{color:#b3bca9;font-size:11px}';
  document.head.appendChild(style);document.body.appendChild(root);ui=root;
  root.addEventListener('click',function(e){
   var btn=e.target.closest('button');if(!btn)return;
   var action=btn.dataset.gl8383;
   if(action==='close'){open=false;render();return}
   if(action==='copy'){copyReport();return}
   if(action==='clear'){events.length=0;groups.length=0;breadcrumbs.length=0;lastAction=null;revision++;render();return}
   if(btn.classList.contains('gl8383-pill')){open=!open;render()}
  });
 }
 function render(){
  if(!isAdmin())return;ensureUI();if(!ui)return;
  var q=summary(),pill=ui.querySelector('.gl8383-pill'),panel=ui.querySelector('.gl8383-panel');
  pill.className='gl8383-pill'+(q.errors?' gl8383-error':q.warnings?' gl8383-warning':'');
  pill.textContent=q.errors?'🛡️ '+q.errors+' Fehler':q.warnings?'🛡️ '+q.warnings+' Warnungen':'🛡️ Monitor OK';
  panel.hidden=!open;
  if(!open||shownRevision===revision)return;
  shownRevision=revision;
  var list=ui.querySelector('.gl8383-data');
  var html='<b>'+escapeHtml(q.channel.toUpperCase())+' · '+q.errors+' Fehlergruppen · '+q.warnings+' Warngruppen</b>';
  if(!q.groups.length)html+='<p>Keine technischen Fehler erfasst. Überwachung läuft automatisch im Spiel.</p>';
  q.groups.slice(0,20).forEach(function(x){
   html+='<div class="gl8383-issue '+escapeHtml(x.severity)+'"><b>'+escapeHtml(x.severity==='error'?'FEHLER':'WARNUNG')+' · '+escapeHtml(x.kind)+' · '+x.count+'×</b>'+
    '<div>'+escapeHtml(x.message)+'</div><div class="gl8383-small">'+escapeHtml(x.screen)+' · '+new Date(x.last).toLocaleTimeString('de-DE');
   if(x.action)html+=' · letzte Aktion: '+escapeHtml(x.action)+' ('+x.actionAgeMs+' ms vorher, nur zeitlicher Bezug)';
   html+='</div></div>';
  });
  html+='<p class="gl8383-small">Begrenzt auf '+MAX_EVENTS+' Ereignisse und '+MAX_GROUPS+' Fehlergruppen im Speicher. Keine automatischen Datenbankänderungen, kein Screenshot-Upload.</p>';
  list.innerHTML=html;
 }
 function reportText(){
  var q=summary(),lines=['GROW LEGENDS FLUGSCHREIBER '+VERSION,'Server: '+q.channel,'Dauer: '+Math.round(q.uptimeMs/1000)+' s',
   'Fehlergruppen: '+q.errors+' | Warnungen: '+q.warnings,'',
   'FEHLERGRUPPEN'];
  q.groups.forEach(function(x){lines.push(x.severity.toUpperCase()+' | '+x.count+'x | '+x.screen+' | '+x.kind+' | '+x.message+
   (x.action?' | Vorher: '+x.action+' ('+x.actionAgeMs+' ms; Zeitbezug)':''))});
  lines.push('','ZEITLICHER VERLAUF');
  q.recentEvents.forEach(function(x){lines.push(new Date(x.at).toISOString()+' | '+x.screen+' | '+x.kind+' | '+x.detail)});
  lines.push('','LETZTE AKTIONEN (nur Kontext, kein Ursachenbeweis)');
  q.breadcrumbs.forEach(function(x){lines.push(new Date(x.at).toISOString()+' | '+x.screen+' | '+x.kind+' | '+x.label)});
  try{
   var quests=window.v8381QuestClaimTimings?.()||[];
   lines.push('','QUEST-PHASEN '+quests.length);
   quests.slice(-6).forEach(function(x){lines.push('Claim '+scrub(x.outcome,50)+' | Animation '+String(x.animationEnabled)+' | RPC '+(x.rpcEndMs-x.rpcStartMs)+' ms | Popup t+'+x.popupCallMs+' ms | Abschluss t+'+x.doneMs+' ms')});
  }catch(_){}
  try{
   var attributes=window.v8382AttributeLatencyDiagnostics?.()||[];
   lines.push('','ATTRIBUT-PHASEN '+attributes.length);
   attributes.slice(-8).forEach(function(x){lines.push('Attribut '+scrub(x.status,40)+' | Queue '+x.queueStartMs+' ms | Gate '+(x.gateDoneMs-x.gateStartMs)+' ms | RPC '+(x.rpcDoneMs-x.rpcStartMs)+' ms | Gesamt '+x.doneMs+' ms')});
  }catch(_){}
  return lines.join('\n').slice(0,30000);
 }
 function copyReport(){
  var value=reportText();
  try{
   if(navigator.clipboard?.writeText){navigator.clipboard.writeText(value).then(function(){breadcrumb('monitor','Report kopiert')}).catch(function(){fallbackCopy(value)});return}
  }catch(_){}
  fallbackCopy(value);
 }
 function fallbackCopy(value){
  try{
   var area=document.createElement('textarea');area.value=value;area.style.position='fixed';area.style.opacity='0';
   document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();
  }catch(_){}
 }
 document.addEventListener('click',function(e){
  try{
   if(e.target.closest('#gl8383FlightRecorder'))return;
   var el=e.target.closest('button,[role="button"],[data-screen],[data-v4140-plus],a');
   if(!el)return;
   var label=el.id?'#'+el.id:el.dataset?.screen?'Seite '+el.dataset.screen:el.dataset?.v4140Plus?'Attribut +':el.tagName.toLowerCase();
   breadcrumb('action',label);
   if(!ui&&isAdmin())renderSoon();
  }catch(_){}
 },true);
 window.addEventListener('error',function(e){
  try{
   if(e.target&&e.target!==window){
    var el=e.target,source=el.src||el.href||'';
    if(source)fire('ASSET_LOAD','error',el.tagName+' '+safePath(source),{path:source});
    return;
   }
   var source=safePath(e.filename||'');
   fire('JAVASCRIPT','error',String(e.message||'JavaScript error')+' '+source+':'+Number(e.lineno||0),{path:source});
  }catch(_){}
 },true);
 window.addEventListener('unhandledrejection',function(e){
  try{fire('PROMISE','error',e.reason?.message||'Unbehandelte Promise-Ablehnung',{})}catch(_){}
 });
 console.error=function(){
  try{
   var first=arguments[0];var details=arguments[1];
   if(!String(first||'').includes('V7092 watchdog report')){
    fire('CONSOLE','error',String(first||'console.error')+' '+(details instanceof Error?details.message:''),{});
   }
  }catch(_){}
  return nativeError.apply(console,arguments);
 };
 document.addEventListener('DOMContentLoaded',renderSoon,{once:true});
 window.addEventListener('pageshow',renderSoon,{passive:true});
 window.addEventListener('growlegends:account-ready',renderSoon,{passive:true});
 window.__GL_FLIGHT_RECORDER__=Object.freeze({version:VERSION,network:network,watchdog:watchdog,
  capture:function(kind,level,message){fire(kind,level,message,{})},snapshot:summary,report:reportText,
  mount:renderSoon,open:function(){if(isAdmin()){open=true;render()}},copy:copyReport});
})();
