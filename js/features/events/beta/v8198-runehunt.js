(()=>{
'use strict';
if(String(window.GROW_RELEASE_CHANNEL||'stable').toLowerCase()!=='beta')return;
if(window.__V8198_RUNEHUNT__)return;
window.__V8198_RUNEHUNT__=true;

const VERSION='V8.202';
const S={state:null,busy:false,opened:false,lastError:'',refreshes:0,starts:0,doors:0,actions:0,timer:null};
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const one=v=>Array.isArray(v)?v[0]:v;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function rid(prefix){let r='';try{r=crypto.randomUUID().replaceAll('-','')}catch(_){r=Math.random().toString(36).slice(2)+Date.now().toString(36)}return prefix+'_'+Date.now()+'_'+r.slice(0,24)}
async function rpc(name,args={}){const x=db();if(!x||!uid())throw new Error('SERVER_NOT_READY');const{data,error}=await x.rpc(name,args);if(error)throw error;return one(data)}
function toast(t,type='info',b=''){try{window.v063Toast?.(t,type,b)}catch(_){}}
function fmtDate(v){if(!v)return'—';try{return new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',weekday:'long',day:'2-digit',month:'2-digit'}).format(new Date(String(v)+'T12:00:00+02:00'))}catch(_){return String(v)}}
function fmtWait(v){if(!v)return'00:00';const ms=Math.max(0,new Date(v).getTime()-Date.now());const m=Math.floor(ms/60000),s=Math.floor((ms%60000)/1000);return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
function zone(room){return Math.max(1,Math.min(4,Math.ceil((Number(room)||1)/25)))}
function overlay(){
 let el=document.getElementById('v8198RuneOverlay');
 if(el)return el;
 el=document.createElement('div');el.id='v8198RuneOverlay';el.className='v8198-rune-overlay';
 el.innerHTML='<div class="v8198-rune-shell" role="dialog" aria-modal="true" aria-label="Runenjagd"><div class="v8198-rune-content"></div></div>';
 document.body.appendChild(el);return el;
}
function clearTimer(){if(S.timer){clearTimeout(S.timer);S.timer=null}}
function close(){clearTimer();overlay().classList.remove('show');S.opened=false}
function wallet(){
 const st=S.state||{};
 return '<div class="v8202-wallet"><span><i>ᚱ</i><b>'+Math.max(0,Number(st.runes)||0)+'</b><small>Runen</small></span><span><i>✦</i><b>'+Math.max(0,Number(st.rune_shards)||0)+'</b><small>Splitter</small></span></div>';
}
function header(){
 const r=S.state?.run;
 return '<header class="v8202-head"><button type="button" data-close class="v8202-back">←</button><div class="v8202-title"><small>RUNENJAGD · LEGENDÄRER RUN</small><b>DER VERGESSENE PFAD</b><span>'+(r?'Raum '+r.room_no+' von 100':'Ein Run · 100 Räume · eine Verzauberungsrune')+'</span></div>'+wallet()+'<button type="button" data-close class="v8202-close">×</button></header>';
}
function milestones(r){
 const room=Math.max(1,Number(r?.room_no)||1);
 return '<div class="v8202-milestones">'+[25,50,75,100].map(n=>'<div class="'+(room>n?'done':room===n?'current':'')+'"><i>'+n+'</i><span>'+(n===100?'Endboss':'Wächter')+'</span></div>').join('')+'</div>';
}
function hpBar(r){
 const hp=Math.max(0,Math.min(100,Number(r?.hp)||0));
 return '<div class="v8202-hp"><div><small>RUNENLEBEN</small><b>'+hp+' / 100</b></div><span><i style="width:'+hp+'%"></i></span></div>';
}
function effects(r){
 const blocks=[];
 const add=(arr,cls)=>{(Array.isArray(arr)?arr:[]).forEach(e=>blocks.push('<span class="'+cls+'"><i>'+(cls==='blessing'?'✦':cls==='curse'?'☠':'◆')+'</i><b>'+esc(e.label||e.id)+'</b>'+(e.tier?'<em>II'.slice(0,Math.max(1,Number(e.tier)))+'</em>':'')+(e.charges?'<small>'+e.charges+'</small>':'')+'</span>'))};
 add(r?.blessings,'blessing');add(r?.curses,'curse');add(r?.pacts,'pact');
 return '<div class="v8202-effects">'+(blocks.length?blocks.join(''):'<span class="empty">Noch keine Segen, Flüche oder Pakte.</span>')+'</div>';
}
function lastResult(r){
 const x=r?.last_result;if(!x||x.kind==='start'||x.kind==='door')return'';
 const bits=[];if(Number(x.damage))bits.push('-'+x.damage+' HP');if(Number(x.heal))bits.push('+'+x.heal+' HP');if(Number(x.dust_gain))bits.push('+'+x.dust_gain+' Staub');if(Number(x.keys_gain))bits.push('+'+x.keys_gain+' Schlüssel');
 return '<div class="v8202-result '+(x.success===false?'bad':'good')+'"><i>'+(x.success===false?'⚠':'✦')+'</i><div><b>'+esc(x.title||'Ereignis')+'</b><small>'+esc(x.text||'')+'</small>'+(bits.length?'<span>'+esc(bits.join(' · '))+'</span>':'')+'</div></div>';
}
function hud(r){return '<div class="v8202-hud">'+hpBar(r)+'<div><small>SCHLÜSSEL</small><b>⚿ '+Math.max(0,Number(r?.keys)||0)+'</b></div><div><small>RUNENSTAUB</small><b>✦ '+Math.max(0,Number(r?.dust)||0)+'</b></div><div><small>RAUM</small><b>'+Math.max(1,Number(r?.room_no)||1)+' / 100</b></div></div>'+milestones(r)+effects(r)+lastResult(r)}
function lobby(){
 const st=S.state||{},active=st.active===true,r=st.run;
 if(r?.status==='completed')return completed(r);
 return '<section class="v8202-scene v8202-lobby '+(active?'active':'closed')+'"><div class="v8202-lobby-portal"><div class="ring r1"></div><div class="ring r2"></div><div class="ring r3"></div><i>ᚱ</i></div><div class="v8202-lobby-copy"><small>ALLE 2 WOCHEN · NUR SONNTAGS</small><h1>100 RÄUME.<br>EINE RUNE.</h1><p>Hinter jeder Pforte kann etwas anderes warten: Monster, Truhen, Segen, Flüche, Schlüssel oder eine seltene goldene Kammer. Jeder 25. Raum gehört einem Wächter.</p><div class="v8202-lobby-rules"><span><b>100</b><small>Räume</small></span><span><b>3</b><small>Zwischenbosse</small></span><span><b>1</b><small>Endboss</small></span><span><b>1ᚱ</b><small>garantiert bei Sieg</small></span></div><button data-start '+(!active||S.busy?'disabled':'')+'>'+(S.busy?'DAS TOR ÖFFNET SICH …':r?'RUN FORTSETZEN':'RUNENJAGD BETRETEN')+'</button><em>'+(active?'Das Runentor ist geöffnet.':'Nächste Runenjagd: '+esc(fmtDate(st.next_event)))+'</em></div></section>';
}
function doorCard(d,r){
 const status=String(d?.status||'open'),locked=status==='locked',blocked=status==='blocked',canKey=(Number(r?.keys)||0)>=Math.max(1,Number(d?.key_cost)||1);
 const dis=blocked||(locked&&!canKey)||S.busy;
 const state=blocked?'ZUGEMAUERT':locked?(canKey?'1 SCHLÜSSEL VERWENDEN':'SCHLÜSSEL FEHLT'):'ÖFFNEN';
 return '<button class="v8202-door '+esc(d?.style||'stone')+' '+status+'" data-door="'+esc(d?.id||'')+'" '+(dis?'disabled':'')+'><div class="v8202-door-art"><span class="runes">ᚠ ᛏ ᛉ ᚱ ᚾ</span><i>'+(d?.style==='gold'?'✦':d?.style==='ember'?'ᛏ':d?.style==='root'?'ᚠ':d?.style==='mist'?'ᛉ':'ᚱ')+'</i><div class="seal"></div>'+(locked?'<b class="lock">⚿</b>':'')+(blocked?'<b class="wall">✕</b>':'')+'</div><div class="v8202-door-copy"><small>'+esc(status==='open'?'UNVERSIEGELTE PFORTE':status==='locked'?'VERSIEGELTE PFORTE':'VERSCHÜTTETER WEG')+'</small><b>'+esc(d?.label||'Runenpforte')+'</b><p>'+esc(d?.hint||'')+'</p><em>'+state+'</em></div></button>';
}
function corridor(r){
 const doors=Array.isArray(r?.doors)?r.doors:[];
 return '<section class="v8202-scene v8202-run zone'+zone(r?.room_no)+'">'+hud(r)+'<div class="v8202-room-head"><small>RAUM '+r.room_no+' VON 100</small><h2>'+(doors.length===1?'DAS WÄCHTERTOR':'WELCHE PFORTE?')+'</h2><p>'+(doors.length===1?'Dieser Raum lässt dir keine Wahl. Hinter dem Tor wartet ein Wächter.':'Du kennst nur die Spuren vor den Türen. Was dahinter liegt, erfährst du erst nach dem Öffnen.')+'</p></div><div class="v8202-doors '+(doors.length===1?'single':'')+'">'+doors.map(d=>doorCard(d,r)).join('')+'</div></section>';
}
function encounterActions(e,r){
 const t=String(e?.type||'');
 if(t==='monster')return [['fight','⚔','Kämpfen','Du gewinnst Staub und eventuell einen Schlüssel, verlierst aber Runenleben.'],['flee','➤','Fliehen','Du entkommst möglicherweise ohne Schaden, bekommst aber keine Beute.']];
 if(t==='miniboss'||t==='finalboss')return [['fight','⚔',t==='finalboss'?'Endboss angreifen':'Wächter angreifen','Kein Rückzug. Der Weg führt nur durch diesen Kampf.']];
 if(t==='chest'||t==='golden')return [['open','▣','Truhe öffnen',t==='golden'?'Große Menge Runenstaub und erhöhte Schlüsselchance.':'Runenstaub und vielleicht ein Schlüssel.']];
 if(t==='key')return [['take','⚿','Runenschlüssel nehmen','Öffnet später eine versiegelte Pforte.']];
 if(t==='heal')return [['drink','✚','Runenwasser trinken','Stellt Runenleben wieder her.'],['leave','→','Weitergehen','Brunnen unberührt lassen.']];
 if(t==='blessing')return [['take','✦','Segen annehmen',e.text||'Temporärer Vorteil.'],['leave','→','Zurücklassen','Ohne diesen Effekt weitergehen.']];
 if(t==='curse')return [['endure','☠','Fluch ertragen',e.text||'Temporärer Nachteil.'],['seal','⚿','Mit Schlüssel versiegeln','Verbraucht 1 Runenschlüssel und verhindert den Fluch.']];
 if(t==='trap')return [['brace','⬡','Schutzrune setzen','Versuche, den Runenstoß abzufangen.'],['dash','➤','Durchbrechen','Versuche, zwischen den Pulsen hindurchzukommen.']];
 if(t==='pact')return (Array.isArray(e.options)?e.options:[]).map(o=>[o.id,'◆',o.label,o.text]);
 return [['continue','→','Weiter','Der Raum bleibt still.']];
}
function encounter(r){
 const e=r?.encounter||{},t=String(e.type||'empty'),art=e.art?'<img src="'+esc(e.art)+'" alt="">':'<i>'+(t==='chest'?'▣':t==='golden'?'✦':t==='blessing'?'✥':t==='curse'?'☠':t==='heal'?'✚':t==='trap'?'⚠':t==='key'?'⚿':t==='pact'?'◆':'ᚱ')+'</i>';
 return '<section class="v8202-scene v8202-run zone'+zone(r?.room_no)+' encounter-'+esc(t)+'">'+hud(r)+'<div class="v8202-encounter"><div class="v8202-encounter-art"><div class="orbit o1"></div><div class="orbit o2"></div>'+art+'</div><div class="v8202-encounter-panel"><small>RAUM '+r.room_no+' · '+esc(t.toUpperCase())+'</small><h2>'+esc(e.title||'Unbekannter Raum')+'</h2><p>'+esc(e.text||'')+'</p><div class="v8202-actions">'+encounterActions(e,r).map(a=>'<button data-action="'+esc(a[0])+'" '+(S.busy?'disabled':'')+'><i>'+esc(a[1])+'</i><span><b>'+esc(a[2])+'</b><small>'+esc(a[3])+'</small></span><em>›</em></button>').join('')+'</div></div></div></section>';
}
function downed(r){
 clearTimer();S.timer=setTimeout(()=>{if(S.opened){void refresh({paintNow:true})}},1000);
 return '<section class="v8202-scene v8202-downed zone'+zone(r?.room_no)+'">'+hud(r)+'<div class="v8202-downed-core"><i>ᚾ</i><small>RUNENLEBEN ERLOSCHEN</small><h2>Die Runen stellen dich wieder her.</h2><b>'+fmtWait(r.revive_at)+'</b><p>Dein Run bleibt exakt in Raum '+r.room_no+' gespeichert. Nach Ablauf des Timers stehst du mit vollem Runenleben wieder auf.</p><button data-close>Run verlassen</button></div></section>';
}
function completed(r){
 const x=r?.last_result||{};
 return '<section class="v8202-scene v8202-complete"><div class="v8202-complete-core"><div class="v8202-final-rune"><div class="ring a"></div><div class="ring b"></div><i>ᚱ</i></div><small>RAUM 100 GESCHAFFT</small><h1>DER RUNENKERN GEHÖRT DIR</h1><p>Du hast alle hundert Räume durchquert und den Hüter des Runenkerns besiegt.</p><div class="v8202-final-loot"><span><i>ᚱ</i><b>+1</b><small>Verzauberungsrune</small></span><span><i>✦</i><b>+'+Math.max(0,Number(x.shards_awarded)||0)+'</b><small>Runensplitter</small></span><span><i>✧</i><b>'+Math.max(0,Number(r.dust)||0)+'</b><small>Staub gesammelt</small></span></div><button data-close>Runenjagd verlassen</button><em>Der nächste Run beginnt erst beim nächsten Runenjagd-Event.</em></div></section>';
}
function body(){
 const st=S.state||{},r=st.run;
 if(!r)return lobby();
 if(r.status==='completed')return completed(r);
 if(r.status==='downed')return downed(r);
 if(r.encounter)return encounter(r);
 return corridor(r);
}
function paint(){
 clearTimer();const box=overlay().querySelector('.v8198-rune-content');if(!box)return;
 box.innerHTML=header()+'<main class="v8202-main">'+body()+'</main>';
 box.querySelectorAll('[data-close]').forEach(b=>b.onclick=close);
 box.querySelector('[data-start]')?.addEventListener('click',start);
 box.querySelectorAll('[data-door]').forEach(b=>b.onclick=()=>choose(String(b.dataset.door||'')));
 box.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>act(String(b.dataset.action||'')));
}
function applyState(r){
 const next=r?.state&&r.ok===false?r.state:r;if(!next?.ok)return false;
 const changed=S.state?.active!==next.active;S.state=next;S.lastError='';S.refreshes++;
 window.dispatchEvent(new CustomEvent('growlegends:runehunt-state',{detail:{...next}}));
 if(changed&&document.getElementById('world')?.classList.contains('active')){try{window.v085InstallWorld?.(true)}catch(_){}}
 return true;
}
async function refresh({paintNow=true}={}){
 if(!uid()||!db())return null;
 try{const r=await rpc('v8202_runehunt_state');applyState(r);if(paintNow&&S.opened)paint();return r}catch(e){S.lastError=String(e?.message||e);console.warn('[V8202] state',e);return null}
}
async function open(){S.opened=true;overlay().classList.add('show');paint();await refresh({paintNow:true})}
async function start(){
 if(S.busy)return;S.busy=true;paint();
 try{const r=await rpc('v8202_runehunt_start',{p_request_id:rid('v8202_start')});if(r?.ok===false)throw new Error(String(r.reason||'START_REJECTED'));applyState(r);S.starts++}
 catch(e){S.lastError=String(e?.message||e);toast('Runenjagd','error',S.lastError)}
 finally{S.busy=false;paint()}
}
async function choose(id){
 if(S.busy||!id)return;S.busy=true;paint();
 try{const r=await rpc('v8202_runehunt_choose',{p_door_id:id,p_request_id:rid('v8202_door')});if(r?.ok===false)throw new Error(String(r.reason||'DOOR_REJECTED'));applyState(r);S.doors++}
 catch(e){S.lastError=String(e?.message||e);toast('Pforte','error',S.lastError)}
 finally{S.busy=false;paint()}
}
async function act(id){
 if(S.busy||!id)return;S.busy=true;paint();
 try{const r=await rpc('v8202_runehunt_action',{p_action:id,p_request_id:rid('v8202_action')});if(r?.ok===false)throw new Error(String(r.reason||'ACTION_REJECTED'));applyState(r);S.actions++;if(r?.run?.status==='completed')toast('Runenjagd abgeschlossen','success','Verzauberungsrune erhalten.');else if(r?.run?.status==='downed')toast('Runenleben aufgebraucht','warn','Der Run bleibt gespeichert.')}
 catch(e){S.lastError=String(e?.message||e);toast('Runenjagd','error',S.lastError)}
 finally{S.busy=false;paint()}
}
function key(e){if(e.key==='Escape'&&S.opened){e.preventDefault();close()}}
window.v8198OpenRuneHunt=open;
window.v8198RuneHuntRefresh=refresh;
window.v8198RuneHuntSnapshot=()=>S.state?JSON.parse(JSON.stringify(S.state)):null;
window.v8198RuneHuntClose=close;
window.v8198RuneHuntDiagnostics=()=>({version:VERSION,busy:S.busy,opened:S.opened,refreshes:S.refreshes,starts:S.starts,doors:S.doors,actions:S.actions,lastError:S.lastError,state:S.state});
window.addEventListener('keydown',key);
window.addEventListener('growlegends:account-ready',()=>{S.state=null;void refresh({paintNow:false})},{passive:true});
window.addEventListener('pageshow',()=>setTimeout(()=>void refresh({paintNow:false}),500),{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',()=>{if(S.opened)close()},{passive:true});
})();