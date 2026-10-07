(()=>{
'use strict';
if(String(window.GROW_RELEASE_CHANNEL||'stable').toLowerCase()!=='beta')return;
if(window.__V8198_RUNEHUNT__)return;
window.__V8198_RUNEHUNT__=true;

const VERSION='V8.198';
const S={state:null,busy:false,lastReward:null,lastError:'',refreshes:0,runs:0};
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const one=v=>Array.isArray(v)?v[0]:v;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function requestId(prefix){
 let r='';try{r=crypto.randomUUID().replaceAll('-','')}catch(_){r=Math.random().toString(36).slice(2)+Date.now().toString(36)}
 return `${prefix}_${Date.now()}_${r.slice(0,24)}`;
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
function overlay(){
 let el=document.getElementById('v8198RuneOverlay');
 if(el)return el;
 el=document.createElement('div');
 el.id='v8198RuneOverlay';
 el.className='v8198-rune-overlay';
 el.innerHTML='<div class="v8198-rune-shell" role="dialog" aria-modal="true" aria-label="Runenjagd"><button class="v8198-rune-close" type="button" aria-label="Schließen">×</button><div class="v8198-rune-content"></div></div>';
 document.body.appendChild(el);
 el.querySelector('.v8198-rune-close').onclick=close;
 el.addEventListener('click',e=>{if(e.target===el)close()});
 return el;
}
function close(){document.getElementById('v8198RuneOverlay')?.classList.remove('show')}
function stateHtml(){
 const st=S.state||{};
 const active=st.active===true;
 const used=Math.max(0,Number(st.runs_used)||0),left=Math.max(0,Number(st.runs_left)||0);
 const runes=Math.max(0,Number(st.runes)||0),shards=Math.max(0,Number(st.rune_shards)||0);
 const reward=S.lastReward;
 const sigils=[
  ['verdant','ᚠ','Smaragd-Siegel','Alte Wurzeln öffnen den Pfad.'],
  ['ember','ᛏ','Glut-Siegel','Runenfeuer brennt durch den Nebel.'],
  ['void','ᛉ','Nebel-Siegel','Ein stilles Zeichen im schwarzen Dunst.']
 ];
 return `
 <header class="v8198-rune-head">
  <div><small>SONNTAGS · ALLE 2 WOCHEN</small><h2>RUNENJAGD</h2><p>Fünf Expeditionen. Drei Siegel. Gleiche Chancen – der Weg ist deine Wahl.</p></div>
  <div class="v8198-rune-wallet"><span><i>ᚱ</i><b>${runes}</b><small>Runen</small></span><span><i>✦</i><b>${shards}</b><small>Splitter</small></span></div>
 </header>
 <section class="v8198-portal-stage ${active?'active':'closed'}">
  <div class="v8198-portal">
   <div class="v8198-portal-ring r1"></div><div class="v8198-portal-ring r2"></div><div class="v8198-portal-ring r3"></div>
   <div class="v8198-portal-core"><span>ᚱ</span></div>
  </div>
  <div class="v8198-rune-status">
   <b>${active?'DAS RUNENTOR IST OFFEN':'DAS RUNENTOR RUHT'}</b>
   <span>${active?`${left} von 5 Expeditionen verbleiben`:`Nächste Jagd: ${esc(fmtDate(st.next_event))}`}</span>
   <div class="v8198-run-pips">${Array.from({length:5},(_,i)=>`<i class="${i<used?'done':''}"></i>`).join('')}</div>
  </div>
 </section>
 ${reward?`<section class="v8198-rune-reward ${Number(reward.runes_awarded)>0?'legendary':''}"><small>LETZTER FUND</small><b>${Number(reward.runes_awarded)>0?'VERZAUBERUNGSRUNE GEFUNDEN':'RUNENSPLITTER GEBORGEN'}</b><div><span>✦ +${Number(reward.shards_awarded)||0} Splitter</span>${Number(reward.runes_awarded)>0?`<span>ᚱ +${Number(reward.runes_awarded)} Rune</span>`:''}${Number(reward.completion_shards)>0?'<span>◆ +3 Abschlussbonus</span>':''}</div></section>`:''}
 <section class="v8198-sigil-grid">
  ${sigils.map(([id,rune,name,desc])=>`<button type="button" class="v8198-sigil ${id}" data-v8198-sigil="${id}" ${(!active||left<=0||S.busy)?'disabled':''}><i>${rune}</i><b>${name}</b><small>${desc}</small><span>${S.busy?'Portal wird gelesen …':left>0?'Expedition starten':'Keine Versuche übrig'}</span></button>`).join('')}
 </section>
 <footer class="v8198-rune-foot">
  <div><b>Seltene Beute</b><span>Jede Expedition gibt Runensplitter. Eine vollständige Rune bleibt selten.</span></div>
  <button type="button" data-v8198-fuse ${shards<10||S.busy?'disabled':''}>10 Splitter → 1 Rune</button>
 </footer>`;
}
function paint(){
 const el=overlay(),box=el.querySelector('.v8198-rune-content');if(!box)return;
 box.innerHTML=stateHtml();
 box.querySelectorAll('[data-v8198-sigil]').forEach(b=>b.onclick=()=>run(String(b.dataset.v8198Sigil||'')));
 box.querySelector('[data-v8198-fuse]')?.addEventListener('click',fuse);
}
async function refresh({paintNow=true}={}){
 if(!uid()||!db())return null;
 try{
  const r=await rpc('v8198_runehunt_state');
  if(r?.ok){S.state=r;S.lastError='';S.refreshes++;if(paintNow&&document.getElementById('v8198RuneOverlay')?.classList.contains('show'))paint();window.dispatchEvent(new CustomEvent('growlegends:runehunt-state',{detail:{...r}}));}
  return r;
 }catch(e){S.lastError=String(e?.message||e);console.warn('[V8198] runehunt state',e);return null}
}
async function open(){
 const el=overlay();el.classList.add('show');S.lastReward=null;paint();await refresh({paintNow:true});
}
async function run(sigil){
 if(S.busy)return;S.busy=true;paint();
 try{
  const r=await rpc('v8198_runehunt_run',{p_sigil:sigil,p_request_id:requestId('v8198_hunt')});
  if(!r?.ok)throw new Error(String(r?.reason||'RUNEHUNT_REJECTED'));
  S.lastReward=r;S.runs++;S.state={...(S.state||{}),...r,active:true};
  try{window.v063Toast?.('Runenjagd','success',Number(r.runes_awarded)>0?'Seltene Verzauberungsrune gefunden!':`+${Number(r.shards_awarded)||0} Runensplitter`)}catch(_){}
 }catch(e){
  S.lastError=String(e?.message||e);
  try{window.v063Toast?.('Runenjagd','error',S.lastError)}catch(_){}
 }finally{S.busy=false;await refresh({paintNow:false});paint()}
}
async function fuse(){
 if(S.busy)return;S.busy=true;paint();
 try{
  const r=await rpc('v8198_fuse_rune',{p_request_id:requestId('v8198_fuse')});
  if(!r?.ok)throw new Error(String(r?.reason||'FUSE_REJECTED'));
  S.state={...(S.state||{}),...r};
  try{window.v063Toast?.('ᚱ Verzauberungsrune','success','10 Runensplitter wurden zu 1 Rune verschmolzen.')}catch(_){}
 }catch(e){S.lastError=String(e?.message||e);try{window.v063Toast?.('Runenverschmelzung','error',S.lastError)}catch(_){}}
 finally{S.busy=false;await refresh({paintNow:false});paint()}
}
window.v8198OpenRuneHunt=open;
window.v8198RuneHuntRefresh=refresh;
window.v8198RuneHuntSnapshot=()=>S.state?JSON.parse(JSON.stringify(S.state)):null;
window.v8198RuneHuntDiagnostics=()=>({version:VERSION,busy:S.busy,refreshes:S.refreshes,runs:S.runs,lastError:S.lastError,state:S.state});
window.addEventListener('growlegends:account-ready',()=>{S.state=null;S.lastReward=null;void refresh({paintNow:false})},{passive:true});
window.addEventListener('pageshow',()=>setTimeout(()=>void refresh({paintNow:false}),500),{passive:true});
})();
