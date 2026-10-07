(()=>{
'use strict';
if(String(window.GROW_RELEASE_CHANNEL||'stable').toLowerCase()!=='beta')return;
if(window.__V8198_RUNEHUNT__)return;
window.__V8198_RUNEHUNT__=true;

const VERSION='V8.199';
const S={state:null,busy:false,lastError:'',refreshes:0,starts:0,doors:0,actions:0,opened:false};
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const one=v=>Array.isArray(v)?v[0]:v;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function requestId(prefix){
 let r='';try{r=crypto.randomUUID().replaceAll('-','')}catch(_){r=Math.random().toString(36).slice(2)+Date.now().toString(36)}
 return prefix+'_'+Date.now()+'_'+r.slice(0,24);
}
async function rpc(name,args={}){
 const x=db();if(!x||!uid())throw new Error('SERVER_NOT_READY');
 const {data,error}=await x.rpc(name,args);if(error)throw error;
 return one(data);
}
function fmtDate(v){
 if(!v)return '—';
 try{return new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',weekday:'long',day:'2-digit',month:'2-digit'}).format(new Date(String(v)+'T12:00:00+02:00'))}catch(_){return String(v)}
}
function toast(title,type='info',body=''){try{window.v063Toast?.(title,type,body)}catch(_){}}
function overlay(){
 let el=document.getElementById('v8198RuneOverlay');
 if(el)return el;
 el=document.createElement('div');
 el.id='v8198RuneOverlay';
 el.className='v8198-rune-overlay';
 el.innerHTML='<div class="v8198-rune-shell" role="dialog" aria-modal="true" aria-label="Runenjagd"><div class="v8198-rune-content"></div></div>';
 document.body.appendChild(el);
 el.addEventListener('click',e=>{if(e.target===el)close()});
 return el;
}
function close(){
 const el=document.getElementById('v8198RuneOverlay');
 if(el)el.classList.remove('show');
 S.opened=false;
}
function roomProgress(run){
 const n=Math.max(1,Math.min(10,Number(run?.room_no)||1));
 return '<div class="v8199-room-track">'+Array.from({length:10},(_,i)=>{
   const x=i+1,cls=x<n?'done':x===n?'current':'';
   return '<i class="'+cls+'"><span>'+(x===10?'ᚱ':x)+'</span></i>';
 }).join('')+'</div>';
}
function hud(run){
 const life=Math.max(0,Number(run?.life)||0),keys=Math.max(0,Number(run?.keys)||0),ess=Math.max(0,Number(run?.essence)||0);
 return '<div class="v8199-hud">'+
   '<div class="v8199-hud-life"><small>RUNENLEBEN</small><span>'+Array.from({length:3},(_,i)=>'<i class="'+(i<life?'on':'')+'">◆</i>').join('')+'</span></div>'+
   '<div><small>SCHLÜSSEL</small><b>⚿ '+keys+'</b></div>'+
   '<div><small>ESSENZ</small><b>✦ '+ess+'</b></div>'+
   '<div><small>RAUM</small><b>'+Math.max(1,Number(run?.room_no)||1)+' / 10</b></div>'+
 '</div>';
}
function topbar(){
 const st=S.state||{},run=st.run||null;
 return '<header class="v8199-exp-head">'+
   '<button type="button" class="v8199-exp-back" data-v8199-close aria-label="Zurück zur Startseite">←</button>'+
   '<div class="v8199-exp-title"><small>SONNTAGS · ALLE 2 WOCHEN</small><b>RUNENJAGD</b><span>'+(run?.status==='active'?'Expedition läuft':'Das vergessene Runentor')+'</span></div>'+
   '<div class="v8199-exp-wallet"><span><i>ᚱ</i><b>'+Math.max(0,Number(st.runes)||0)+'</b></span><span><i>✦</i><b>'+Math.max(0,Number(st.rune_shards)||0)+'</b></span></div>'+
   '<button type="button" class="v8199-exp-close" data-v8199-close aria-label="Schließen">×</button>'+
 '</header>';
}
function lastResult(run){
 const r=run?.last_result;
 if(!r||r.kind==='start'||r.kind==='door'||r.kind==='run_end')return '';
 const parts=[];
 if(Number(r.delta_essence))parts.push((Number(r.delta_essence)>0?'+':'')+Number(r.delta_essence)+' Essenz');
 if(Number(r.delta_keys))parts.push((Number(r.delta_keys)>0?'+':'')+Number(r.delta_keys)+' Schlüssel');
 if(Number(r.delta_life))parts.push((Number(r.delta_life)>0?'+':'')+Number(r.delta_life)+' Leben');
 return '<div class="v8199-result-flash '+(r.success===false?'bad':'good')+'"><i>'+(r.success===false?'⚠':'✦')+'</i><div><b>'+esc(r.title||'Raum abgeschlossen')+'</b><small>'+esc(r.text||'')+'</small>'+(parts.length?'<span>'+esc(parts.join(' · '))+'</span>':'')+'</div></div>';
}
function doorHtml(door,side){
 const theme=esc(door?.theme||'void'),label=esc(door?.label||'Runenpforte'),hint=esc(door?.hint||'Etwas wartet dahinter.'),mark=esc(door?.mark||'ᚱ');
 return '<button type="button" class="v8199-door '+theme+' '+side+'" data-v8199-door="'+esc(door?.id||side)+'" '+(S.busy?'disabled':'')+'>'+
  '<div class="v8199-door-stone"><span class="v8199-door-runes">ᚠ ᛉ ᛏ ᚾ ᚱ</span><i>'+mark+'</i><div class="v8199-door-seal"></div></div>'+
  '<div class="v8199-door-copy"><small>'+esc(side==='left'?'LINKE PFORTE':'RECHTE PFORTE')+'</small><b>'+label+'</b><span>'+hint+'</span><em>'+(S.busy?'Siegel wird gelöst …':'Pforte öffnen')+'</em></div>'+
 '</button>';
}
function corridor(run){
 const doors=Array.isArray(run?.doors)?run.doors:[];
 return '<section class="v8199-exp-scene v8199-corridor theme-'+esc(doors[0]?.theme||'void')+'">'+
   '<div class="v8199-scene-fog f1"></div><div class="v8199-scene-fog f2"></div>'+
   roomProgress(run)+hud(run)+
   '<div class="v8199-room-intro"><small>RAUM '+Math.max(1,Number(run?.room_no)||1)+' VON 10</small><h2>'+(Number(run?.room_no)===10?'DAS HEILIGTUM':'WÄHLE DEINE PFORTE')+'</h2><p>'+(Number(run?.room_no)===10?'Hinter einer der beiden Pforten wartet der Abschlusskreis.':'Du siehst nur die Spuren vor der Tür. Was wirklich dahinter liegt, erfährst du erst nach dem Öffnen.')+'</p></div>'+
   lastResult(run)+
   '<div class="v8199-doors">'+doors.map((d,i)=>doorHtml(d,i===0?'left':'right')).join('')+'</div>'+
 '</section>';
}
function eventArt(ev){
 const type=String(ev?.type||'echo');
 const icons={chest:'▣',shrine:'✥',trap:'⚠',puzzle:'ᚱ',key:'⚿',echo:'◉',vault:'⬢',sanctum:'ᛟ'};
 return '<div class="v8199-event-art type-'+esc(type)+'"><div class="v8199-event-orbit o1"></div><div class="v8199-event-orbit o2"></div><i>'+esc(icons[type]||'ᚱ')+'</i><span>'+esc(ev?.title||'Runenraum')+'</span></div>';
}
function eventRoom(run){
 const ev=run?.event||{},opts=Array.isArray(ev.options)?ev.options:[];
 return '<section class="v8199-exp-scene v8199-event-room theme-'+esc(ev.theme||'void')+' type-'+esc(ev.type||'echo')+'">'+
  '<div class="v8199-scene-fog f1"></div><div class="v8199-scene-fog f2"></div>'+
  roomProgress(run)+hud(run)+
  '<div class="v8199-event-layout">'+
   '<div class="v8199-event-visual">'+eventArt(ev)+'</div>'+
   '<div class="v8199-event-panel"><small>RAUM '+Math.max(1,Number(run?.room_no)||1)+' · '+esc(String(ev.type||'EREIGNIS').toUpperCase())+'</small><h2>'+esc(ev.title||'Unbekannter Raum')+'</h2><p>'+esc(ev.text||'Die Runen warten auf deine Entscheidung.')+'</p>'+
    '<div class="v8199-actions">'+opts.map(o=>'<button type="button" data-v8199-action="'+esc(o.id||'')+'" '+(S.busy?'disabled':'')+'><i>'+esc(o.icon||'ᚱ')+'</i><span><b>'+esc(o.label||'Aktion')+'</b><small>'+esc(o.sub||'')+'</small></span><em>›</em></button>').join('')+'</div>'+
   '</div>'+
  '</div>'+
 '</section>';
}
function endRun(run){
 const r=run?.last_result||{},won=run?.status==='completed';
 const shards=Math.max(0,Number(r.shards_awarded)||0),runes=Math.max(0,Number(r.runes_awarded)||0),bonus=Math.max(0,Number(r.completion_shards)||0);
 return '<section class="v8199-exp-scene v8199-end '+(won?'won':'failed')+'">'+
   '<div class="v8199-end-glyph"><div class="v8199-end-ring r1"></div><div class="v8199-end-ring r2"></div><i>'+(won?'ᛟ':'ᚾ')+'</i></div>'+
   '<small>'+(won?'EXPEDITION VOLLENDET':'EXPEDITION BEENDET')+'</small>'+
   '<h2>'+esc(r.title||(won?'Runenheiligtum bezwungen':'Der Run ist beendet'))+'</h2>'+
   '<p>'+esc(r.text||'')+'</p>'+
   '<div class="v8199-end-loot"><span><i>✦</i><b>+'+shards+'</b><small>Runensplitter</small></span><span class="'+(runes?'rare':'')+'"><i>ᚱ</i><b>+'+runes+'</b><small>Verzauberungsrune</small></span>'+(bonus?'<span><i>◆</i><b>+'+bonus+'</b><small>Abschlussbonus</small></span>':'')+'</div>'+
   '<div class="v8199-end-actions"><button type="button" data-v8199-new '+((Number(S.state?.runs_left)||0)<=0||S.busy?'disabled':'')+'>'+(Number(S.state?.runs_left)>0?'Nächste Expedition starten':'Alle 5 Expeditionen verbraucht')+'</button><button type="button" class="ghost" data-v8199-close>Zur Startseite</button></div>'+
 '</section>';
}
function lobby(){
 const st=S.state||{},active=st.active===true,left=Math.max(0,Number(st.runs_left)||0),used=Math.max(0,Number(st.runs_used)||0),run=st.run;
 const last=run&&run.status!=='active'?run.last_result:null;
 return '<section class="v8199-exp-scene v8199-lobby '+(active?'active':'closed')+'">'+
   '<div class="v8199-lobby-stars"></div><div class="v8199-lobby-fog"></div>'+
   '<div class="v8199-portal-xl"><div class="v8199-portal-ring p1"></div><div class="v8199-portal-ring p2"></div><div class="v8199-portal-ring p3"></div><div class="v8199-portal-core"><i>ᚱ</i></div></div>'+
   '<div class="v8199-lobby-copy"><small>RUNENEXPEDITION</small><h1>'+(active?'DAS TOR IST OFFEN':'DAS TOR RUHT')+'</h1><p>Eine Expedition führt durch 10 unbekannte Räume. Hinter jeder Pforte wartet ein anderes Ereignis.</p>'+
    '<div class="v8199-lobby-stats"><span><small>Versuche</small><b>'+left+' / 5 frei</b></span><span><small>Verbraucht</small><b>'+used+' / 5</b></span><span><small>Nächste reguläre Jagd</small><b>'+esc(fmtDate(st.next_event))+'</b></span></div>'+
    (last?'<div class="v8199-last-run"><b>'+esc(last.title||'Letzter Run')+'</b><span>'+esc(last.text||'')+'</span></div>':'')+
    '<button type="button" class="v8199-start" data-v8199-start '+(!active||left<=0||S.busy?'disabled':'')+'>'+(S.busy?'RUNENTOR WIRD GEÖFFNET …':left>0?'EXPEDITION STARTEN':'KEINE EXPEDITIONEN ÜBRIG')+'</button>'+
    '<small class="v8199-lobby-note">Start verbraucht 1 von 5 Expeditionen. Ein laufender Run kann jederzeit geschlossen und später fortgesetzt werden.</small>'+
   '</div>'+
  '</section>';
}
function bodyHtml(){
 const run=S.state?.run||null;
 if(run?.status==='active'&&run?.event)return eventRoom(run);
 if(run?.status==='active')return corridor(run);
 if(run&&(run.status==='completed'||run.status==='failed'))return endRun(run);
 return lobby();
}
function html(){return topbar()+'<main class="v8199-exp-main">'+bodyHtml()+'</main>'}
function paint(){
 const el=overlay(),box=el.querySelector('.v8198-rune-content');if(!box)return;
 box.innerHTML=html();
 box.querySelectorAll('[data-v8199-close]').forEach(b=>b.onclick=close);
 box.querySelector('[data-v8199-start]')?.addEventListener('click',startRun);
 box.querySelector('[data-v8199-new]')?.addEventListener('click',startRun);
 box.querySelectorAll('[data-v8199-door]').forEach(b=>b.onclick=()=>chooseDoor(String(b.dataset.v8199Door||'')));
 box.querySelectorAll('[data-v8199-action]').forEach(b=>b.onclick=()=>act(String(b.dataset.v8199Action||'')));
}
function applyState(r){
 const next=r?.state&&r.ok===false?r.state:r;
 if(!next?.ok)return false;
 const wasActive=S.state?.active===true;
 S.state=next;S.lastError='';S.refreshes++;
 window.dispatchEvent(new CustomEvent('growlegends:runehunt-state',{detail:{...next}}));
 if(wasActive!==!!next.active&&document.getElementById('world')?.classList.contains('active')){
   try{window.v085InstallWorld?.(true)}catch(_){}
 }
 return true;
}
async function refresh({paintNow=true}={}){
 if(!uid()||!db())return null;
 try{
  const r=await rpc('v8199_runehunt_state');
  applyState(r);
  if(paintNow&&S.opened)paint();
  return r;
 }catch(e){S.lastError=String(e?.message||e);console.warn('[V8199] runehunt state',e);return null}
}
async function open(){
 S.opened=true;
 const el=overlay();el.classList.add('show');paint();
 await refresh({paintNow:true});
}
async function startRun(){
 if(S.busy)return;S.busy=true;paint();
 try{
  const r=await rpc('v8199_runehunt_start',{p_request_id:requestId('v8199_start')});
  if(r?.ok===false)throw new Error(String(r.reason||'START_REJECTED'));
  applyState(r);S.starts++;
 }catch(e){S.lastError=String(e?.message||e);toast('Runenjagd','error',S.lastError)}
 finally{S.busy=false;paint()}
}
async function chooseDoor(id){
 if(S.busy||!id)return;S.busy=true;paint();
 try{
  const r=await rpc('v8199_runehunt_choose',{p_door_id:id,p_request_id:requestId('v8199_door')});
  if(r?.ok===false)throw new Error(String(r.reason||'DOOR_REJECTED'));
  applyState(r);S.doors++;
 }catch(e){S.lastError=String(e?.message||e);toast('Pforte blockiert','error',S.lastError)}
 finally{S.busy=false;paint()}
}
async function act(id){
 if(S.busy||!id)return;S.busy=true;paint();
 try{
  const r=await rpc('v8199_runehunt_action',{p_action:id,p_request_id:requestId('v8199_action')});
  if(r?.ok===false)throw new Error(String(r.reason||'ACTION_REJECTED'));
  applyState(r);S.actions++;
  const end=r?.run?.last_result;
  if(r?.run?.status==='completed')toast('Expedition vollendet','success',(Number(end?.runes_awarded)||0)>0?'Seltene Verzauberungsrune gefunden!':'Das Runenheiligtum ist abgeschlossen.');
  else if(r?.run?.status==='failed')toast('Expedition beendet','warn','Dein Runenleben ist aufgebraucht.');
 }catch(e){S.lastError=String(e?.message||e);toast('Runenaktion fehlgeschlagen','error',S.lastError)}
 finally{S.busy=false;paint()}
}
function onKey(e){if(e.key==='Escape'&&S.opened){e.preventDefault();close()}}
window.v8198OpenRuneHunt=open;
window.v8198RuneHuntRefresh=refresh;
window.v8198RuneHuntSnapshot=()=>S.state?JSON.parse(JSON.stringify(S.state)):null;
window.v8198RuneHuntClose=close;
window.v8198RuneHuntDiagnostics=()=>({version:VERSION,busy:S.busy,opened:S.opened,refreshes:S.refreshes,starts:S.starts,doors:S.doors,actions:S.actions,lastError:S.lastError,state:S.state});
window.addEventListener('keydown',onKey);
window.addEventListener('growlegends:account-ready',()=>{S.state=null;S.lastError='';void refresh({paintNow:false})},{passive:true});
window.addEventListener('pageshow',()=>setTimeout(()=>void refresh({paintNow:false}),500),{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',()=>{if(S.opened)close()},{passive:true});
})();