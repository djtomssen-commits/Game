(()=>{
'use strict';
if(!['beta','server1'].includes(String(window.GROW_RELEASE_CHANNEL||'stable').toLowerCase()))return;
if(window.__V8210_GROW_CUP__)return;
window.__V8210_GROW_CUP__=true;

const VERSION='V8.220';
const PLANTS={
 seedling:'assets/v7198-base64/49aed1d1c8035f5d2123.webp',
 growth:'assets/v7198-base64/c9ec3c217b81f805555c.webp',
 flower:'assets/v7198-base64/9880ab938246ad3b3dec.webp',
 harvest:'assets/v7198-base64/31d47d1bdc5a6c5800cb.webp'
};
const PHASES=[
 ['Licht','Lichtzeit einstellen'],
 ['Gießen','Wassermenge bestimmen'],
 ['Dünger','Düngermenge dosieren'],
 ['Beschneiden','Schnittstärke festlegen'],
 ['Temperatur','Temperatur einstellen'],
 ['Ernte','Erntezeitpunkt bestimmen']
];
const METRICS=[
 ['quality','Qualität','★'],['yield','Ertrag','⚖'],['resin','Harz','✨'],['genetics','Genetik','🧬'],['health','Gesundheit','♥']
];
const TIER={
 bronze:['🥉','BRONZE'],silver:['🥈','SILBER'],gold:['🥇','GOLD'],master:['💎','MEISTER'],champion:['👑','GROW CHAMPION']
};
const S={state:null,ranking:null,busy:false,opened:false,view:'cup',lastError:'',refreshes:0,starts:0,submits:0,timer:null,clockOffset:0,boundaryKey:'',boundaryRetryAt:0,refreshInFlight:null,draftKey:'',draft:null};
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const one=v=>Array.isArray(v)?v[0]:v;
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function rid(prefix){let r='';try{r=crypto.randomUUID().replaceAll('-','')}catch(_){r=Math.random().toString(36).slice(2)+Date.now().toString(36)}return prefix+'_'+Date.now()+'_'+r.slice(0,24)}
async function rpc(name,args={}){const x=db();if(!x||!uid())throw new Error('SERVER_NOT_READY');const{data,error}=await x.rpc(name,args);if(error)throw error;return one(data)}
function toast(t,type='info',b=''){try{window.v063Toast?.(t,type,b)}catch(_){}}
function fmtDate(v){if(!v)return'—';try{return new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',weekday:'long',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(v))}catch(_){return String(v)}}
function nowMs(){return Date.now()+S.clockOffset}
function leftMs(v){return Math.max(0,new Date(v||0).getTime()-nowMs())}
function fmtDuration(ms){const t=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(t/3600),m=Math.floor((t%3600)/60),s=t%60;return h>0?String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0'):String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
function overlay(){
 let el=document.getElementById('v8210GrowCupOverlay');
 if(el)return el;
 el=document.createElement('div');el.id='v8210GrowCupOverlay';el.className='v8210-growcup-overlay';
 el.innerHTML='<div class="v8210-growcup-shell" role="dialog" aria-modal="true" aria-label="Grow Cup"><div class="v8210-growcup-content"></div></div>';
 document.body.appendChild(el);return el;
}
function stopClock(){if(S.timer){clearInterval(S.timer);S.timer=null}}
function close(){stopClock();overlay().classList.remove('show');document.body.classList.remove('v8210-growcup-open');document.querySelector('#v032MenuPanel')?.classList.remove('open');S.opened=false}
function wallet(){
 const st=S.state||{};
 return '<div class="v8210-wallet"><span><i>ᚱ</i><b>'+Math.max(0,Number(st.runes)||0)+'</b><small>Runen</small></span><span><i>✦</i><b>'+Math.max(0,Number(st.rune_shards)||0)+'</b><small>Fragmente</small></span></div>';
}
function header(){
 return '<header class="v8210-head"><div class="v8210-title"><small>6-STUNDEN-CUP · JEDEN DONNERSTAG</small><b>GROW CUP</b><span>Jede Woche neue Pflanze · 6 neue Sweet Spots · maximal 600 Punkte</span></div>'+wallet()+'<button type="button" data-cup-close class="v8210-close">×</button></header>'+
 '<nav class="v8210-tabs"><button data-cup-view="cup" class="'+(S.view==='cup'?'active':'')+'">🌿 CUP</button><button data-cup-view="ranking" class="'+(S.view==='ranking'?'active':'')+'">🏆 RANGLISTE</button></nav>';
}
function plantStage(phase=1,status='active'){
 const p=Math.max(1,Math.min(6,Number(phase)||1));
 const key=status==='completed'||p>=6?'harvest':p>=4?'flower':p>=2?'growth':'seedling';
 return '<div class="v8210-plant-wrap stage-'+p+' '+(status==='completed'?'complete':'')+'"><div class="v8210-plant-glow"></div><img src="'+PLANTS[key]+'" alt="Cup-Pflanze"><div class="v8210-plant-shadow"></div></div>';
}
function phaseRail(run){
 const phase=Math.max(1,Number(run?.phase)||1),done=run?.status==='completed';
 return '<div class="v8210-phase-rail">'+PHASES.map((x,i)=>{const n=i+1,cls=done||n<phase?'done':n===phase?'current':'';return '<div class="'+cls+'"><i>'+(done||n<phase?'✓':n)+'</i><span>'+esc(x[0])+'</span></div>'}).join('')+'</div>';
}
function metrics(run){
 const m=run?.metrics||{};
 return '<div class="v8210-metrics">'+METRICS.map(([k,label,ico])=>{const v=Math.max(0,Math.min(100,Number(m[k])||0));return '<div><span><i>'+ico+'</i><small>'+label+'</small><b>'+v+'</b></span><em><i style="width:'+v+'%"></i></em></div>'}).join('')+'</div>';
}
function lastCareResult(run){
 const a=Array.isArray(run?.history)?run.history:[],x=[...a].reverse().find(v=>v?.kind==='care_result');
 if(!x)return'';
 const perf=Math.max(0,Math.min(100,Number(x.performance)||0)),feedback=Array.isArray(x.feedback)?x.feedback:[];
 return '<div class="v8210-care-result '+(perf>=80?'great':perf>=60?'ok':'stress')+'"><div class="v8210-care-score"><small>LETZTE PHASE</small><b>'+Math.round(perf)+'</b><span>Pflegewert</span></div><div><b>'+(x.source==='carry'?'Automatisch weitergelaufen':'Pflege ausgewertet')+'</b><p>'+esc(feedback[0]||'Die Pflanze hat sich weiterentwickelt.')+'</p></div></div>';
}
function lobby(){
 const st=S.state||{},active=st.active===true;
 return '<section class="v8210-scene v8210-lobby">'+
  '<div class="v8210-stage-panel">'+plantStage(1,'preview')+'<div class="v8210-stage-badge">🏆 OFFIZIELLE CUP-BÜHNE</div></div>'+
  '<div class="v8210-lobby-copy"><small>GROW LEGENDS · LIVE GROW CUP</small><h1>6 AKTIONEN.<br>600 PUNKTE.</h1>'+
  '<p>Jede Stunde hat genau eine Aufgabe und einen Regler. Für jede Aktion existiert ein versteckter Sweet Spot. Je näher du ihn triffst, desto mehr von 100 Punkten erhältst du. Die Einzelpunkte siehst du erst ganz am Ende.</p>'+
  '<div class="v8210-lobby-rules"><span><b>6 h</b><small>Laufzeit</small></span><span><b>6</b><small>Aktionen</small></span><span><b>100</b><small>Punkte je Aktion</small></span><span><b>600</b><small>Maximum</small></span></div>'+
  '<div class="v8210-seed-card"><i>🌱</i><div><small>DIESE CUP-SORTE</small><b>'+esc(st.cup_seed||'Cup-Sorte')+'</b><span>Jede Woche eine neue Pflanze mit sechs neuen Sweet Spots</span></div></div>'+
  '<div class="v8219-guide"><small>KURZE ANLEITUNG</small><b>So läuft dein Grow Cup</b><div><span><i>1</i>Starte den 6-Stunden-Run.</span><span><i>2</i>Pro Stunde öffnet ab Minute 45 genau ein Pflege-Regler.</span><span><i>3</i>Lies den Pflanzenstatus, entscheide deinen Wert und erhalte nach Aktion 6 deine 600-Punkte-Auswertung.</span></div></div>'+
  '<button data-cup-start '+(!active||S.busy?'disabled':'')+'>'+(S.busy?'CUP WIRD VORBEREITET …':'6-STUNDEN-CUP STARTEN')+'</button>'+
  '<em>'+(active?'Dein persönlicher Timer beginnt erst beim Start. Pro Phase gibt es genau eine Einstellung.':'Nächster Grow Cup: '+esc(fmtDate(st.next_event)))+'</em></div>'+
 '</section>';
}
function decimals(step){return Number(step)%1===0?0:1}
function formatValue(v,action){
 const d=decimals(action?.step||1);
 return Number(v).toFixed(d)+' '+esc(action?.unit||'');
}
function ensureDraft(run){
 const key=String(run?.run_id||'')+':'+String(run?.phase||1);
 if(S.draftKey===key&&S.draft!==null)return S.draft;
 const a=run?.action||{},rec=run?.phase_record;
 let v=rec?.status==='submitted'?Number(rec.value):((Number(a.min)||0)+(Number(a.max)||0))/2;
 const step=Number(a.step)||1,min=Number(a.min)||0,max=Number(a.max)||100;
 v=min+Math.round((v-min)/step)*step;
 S.draft=Math.max(min,Math.min(max,v));S.draftKey=key;return S.draft;
}
function timingCard(run){
 const state=String(run?.window_state||'waiting');let title='Pflanze entwickelt sich',sub='Aktion öffnet in',target=run?.decision_opens_at,cls='waiting',ico='⏳';
 if(state==='open'){title='Aktion jetzt einstellen';sub='Fenster schließt in';target=run?.phase_ends_at;cls='open';ico='⚠️'}
 if(state==='submitted'){title='Einstellung gespeichert';sub='Nächste Phase in';target=run?.phase_ends_at;cls='submitted';ico='✓'}
 if(state==='processing'){title='Phase wird verarbeitet';sub='Nächste Phase in';target=run?.phase_ends_at;cls='processing';ico='🌿'}
 return '<div class="v8210-timing '+cls+'"><i>'+ico+'</i><div><small>STUNDE '+Number(run?.phase||1)+' / 6</small><b>'+title+'</b><span>'+sub+' <strong data-cup-countdown data-target="'+esc(target||'')+'">'+fmtDuration(leftMs(target))+'</strong></span></div><em>Gesamtlaufzeit <b data-cup-run-time data-target="'+esc(run?.run_ends_at||'')+'">'+fmtDuration(leftMs(run?.run_ends_at))+'</b></em></div>';
}
function plantStatus(run){
 const s=run?.plant_status||{};
 if(!s.message)return'';
 return '<div class="v8216-plant-status"><i>🌿</i><div><small>PFLANZENSTATUS</small><b>'+esc(s.message)+'</b><span>Nur ein grober Hinweis – der Sweet Spot bleibt verborgen.</span></div></div>';
}
function actionControl(run){
 const action=run?.action||{},state=String(run?.window_state||'waiting'),locked=state!=='open'||S.busy;
 const value=ensureDraft(run),submitted=state==='submitted';
 return '<div class="v8210-grow-controls '+state+'">'+
  '<div class="v8210-grow-control-head"><div><small>AKTION '+Number(run?.phase||1)+' / 6</small><b>'+esc(action.icon||'🌿')+' '+esc(action.title||'Aktion')+'</b></div><span>Sweet Spot unbekannt</span></div>'+
  '<p class="v8214-action-desc">'+esc(action.description||'Stelle deinen Wert ein.')+'</p>'+
  '<div class="v8214-single-value"><small>DEINE EINSTELLUNG</small><strong data-cup-single-value>'+formatValue(value,action)+'</strong></div>'+
  '<label class="v8210-range v8214-single-range"><input type="range" min="'+Number(action.min||0)+'" max="'+Number(action.max||100)+'" step="'+Number(action.step||1)+'" value="'+value+'" data-cup-single-range '+(locked?'disabled':'')+'><footer><small>'+formatValue(action.min||0,action)+'</small><small>'+formatValue(action.max||100,action)+'</small></footer></label>'+
  '<div class="v8210-control-note">'+(state==='waiting'?'Der Regler wird ab Minute 45 freigeschaltet.':submitted?'Dein Wert ist für diese Phase fix. Wie viele Punkte er bringt, erfährst du erst im Finale.':state==='open'?'Je näher dein Wert am versteckten Sweet Spot liegt, desto mehr von 100 Punkten bekommst du.':'Die Phase wird verarbeitet.')+'</div>'+
  '<button class="v8210-submit-care" data-cup-submit '+(locked?'disabled':'')+'>'+(S.busy?'SPEICHERT …':submitted?'WERT FESTGELEGT':'WERT FESTLEGEN')+'</button>'+
 '</div>';
}
function activeRun(run){
 const phase=Math.max(1,Math.min(6,Number(run.phase)||1)),ph=PHASES[phase-1]||PHASES[0];
 return '<section class="v8210-scene v8210-run">'+phaseRail(run)+
  '<div class="v8210-run-grid"><div class="v8210-stage-panel live">'+plantStage(phase,'active')+
  '<div class="v8210-stage-meta"><small>'+esc(run.cup_seed||'Cup-Sorte')+'</small><b>STUNDE '+phase+' / 6</b><span>'+esc(ph[0])+'</span></div></div>'+
  '<div class="v8210-control">'+timingCard(run)+
  '<div class="v8210-phase-copy"><small>AKTION '+phase+' · '+esc(ph[0]).toUpperCase()+'</small><h2>'+esc(ph[1])+'</h2><p>Nur diese eine Einstellung zählt in dieser Phase. Sweet Spot und Punkte bleiben bis zum Finale verborgen.</p></div>'+
  plantStatus(run)+
  '<div class="v8214-hidden-score"><i>?</i><div><b>Punkte verborgen</b><span>Die komplette Pflanzen- und Punkteauswertung erscheint erst nach Aktion 6.</span></div></div>'+
  actionControl(run)+'</div></div></section>';
}
function rewardTable(){
 return '<div class="v8210-reward-table"><div><b>🥇 Platz 1</b><span>3 Runen · 30 Frag.</span></div><div><b>🥈 Platz 2</b><span>2 Runen · 25 Frag.</span></div><div><b>🥉 Platz 3</b><span>2 Runen · 20 Frag.</span></div><div><b>4–10</b><span>1 Rune · 15 Frag.</span></div><div><b>11–25</b><span>12 Frag.</span></div><div><b>26–50</b><span>8 Frag.</span></div><div><b>51–100</b><span>5 Frag.</span></div></div>';
}
function resultBreakdown(run){
 const rows=Array.isArray(run?.results)?run.results:[];
 return '<div class="v8214-result-list">'+rows.map(r=>{
  const a=r.action||{},score=Math.max(0,Math.min(100,Number(r.score)||0));
  const missed=String(r.status||'')==='missed';
  return '<div class="v8214-result-row '+(missed?'missed':'')+'"><i>'+esc(a.icon||'🌿')+'</i><div><b>'+esc(a.title||('Aktion '+r.phase))+'</b><small>'+(missed?'Verpasst':formatValue(r.value,a))+'</small><em><span style="width:'+score+'%"></span></em></div><strong>'+Math.round(score)+'/100</strong></div>';
 }).join('')+'</div>';
}
function completed(run){
 const t=TIER[String(run.tier||'bronze')]||TIER.bronze,score=Math.round(Number(run.final_score)||0),rank=Number(run.rank)||0;
 return '<section class="v8210-scene v8210-finale">'+phaseRail(run)+
  '<div class="v8210-final-grid"><div class="v8210-stage-panel final">'+plantStage(6,'completed')+
  '<div class="v8210-final-medal"><i>'+t[0]+'</i><small>GESAMTPUNKTE</small><b>'+score+' / 600</b><strong>'+t[1]+'</strong></div></div>'+
  '<div class="v8210-final-copy"><small>6-STUNDEN-CUP ABGESCHLOSSEN · '+esc(run.cup_seed||'')+'</small><h1>'+t[0]+' Ergebnis deiner Pflanze</h1><p>Jede der sechs Aktionen wurde mit maximal 100 Punkten bewertet. Je näher am versteckten Sweet Spot, desto höher die Punktzahl.</p>'+
  resultBreakdown(run)+metrics(run)+
  (run.personal_reward_awarded?'<div class="v8210-personal-reward"><i>👑</i><div><b>Grow Champion erreicht</b><span>552+ Punkte · +1 Verzauberungsrune · +10 Runenfragmente</span></div></div>':'<div class="v8210-personal-note">Ab <b>552 / 600 Punkten</b> gibt es zusätzlich 1 Verzauberungsrune + 10 Fragmente.</div>')+
  '<div class="v8210-rank-now"><small>SERVER-RANGLISTE</small><b>'+(rank?'#'+rank:'wird geladen …')+'</b><span>Dein Rang richtet sich nach deinen Gesamtpunkten.</span></div>'+
  (S.ranking?.final===true&&!run.rank_reward_claimed?'<button class="v8210-claim" data-cup-claim>Rangbelohnung abholen</button>':'')+
  '<button class="v8210-secondary" data-cup-ranking>Rangliste ansehen</button></div></div>'+
 '</section>';
}
function ranking(){
 const d=S.ranking||{},rows=Array.isArray(d.rows)?d.rows:[];
 return '<section class="v8210-scene v8210-ranking"><div class="v8210-ranking-head"><div><small>SERVERWEITE RANGLISTE</small><h2>🏆 GROW CUP RANGLISTE</h2><p>Maximal 600 Punkte. Je näher die sechs Einstellungen an ihren Sweet Spots lagen, desto höher der Rang.</p></div><button data-cup-refresh '+(S.busy?'disabled':'')+'>↻ Aktualisieren</button></div>'+
 rewardTable()+
 '<div class="v8210-ranking-list">'+(rows.length?rows.map(x=>{const t=TIER[String(x.tier||'bronze')]||TIER.bronze;return '<div class="v8210-rank-row rank-'+Number(x.rank||0)+'"><strong>#'+Number(x.rank||0)+'</strong><i>'+t[0]+'</i><div><b>'+esc(x.player||'Legende')+'</b><small>'+esc(x.cup_seed||'')+' · '+esc(t[1])+'</small></div><em>'+Math.round(Number(x.final_score)||0)+' P</em></div>'}).join(''):'<div class="v8210-empty">Noch keine abgeschlossenen 6-Stunden-Runs.</div>')+'</div>'+
 '</section>';
}
function cupBody(){
 const r=S.state?.run;
 if(!r)return lobby();
 if(r.status==='completed')return completed(r);
 return activeRun(r);
}
function updateClockText(){
 if(!S.opened)return;
 overlay().querySelectorAll('[data-cup-countdown],[data-cup-run-time]').forEach(el=>{el.textContent=fmtDuration(leftMs(el.dataset.target))});
 const r=S.state?.run;if(!r||r.status!=='active')return;
 let target='',kind='';
 if(r.window_state==='waiting'){target=r.decision_opens_at;kind='open'}
 else if(r.window_state==='open'||r.window_state==='submitted'||r.window_state==='processing'){target=r.phase_ends_at;kind='end'}
 if(!target)return;
 const key=String(r.run_id)+':'+String(r.phase)+':'+kind+':'+target;
 if(leftMs(target)<=0){
  const now=Date.now();
  if(S.boundaryKey!==key||now>=S.boundaryRetryAt){
   S.boundaryKey=key;
   S.boundaryRetryAt=now+2500;
   void refresh({paintNow:true});
  }
 }
}
function startClock(){stopClock();updateClockText();S.timer=setInterval(updateClockText,1000)}
function resyncClock(){
 if(!S.opened)return;
 startClock();
 void refresh({paintNow:true});
}
function bindSingleRange(box){
 const input=box.querySelector('[data-cup-single-range]');if(!input)return;
 input.oninput=()=>{
  S.draft=Number(input.value);
  const out=box.querySelector('[data-cup-single-value]');
  if(out)out.textContent=formatValue(S.draft,S.state?.run?.action||{});
 };
}
function paint(){
 const box=overlay().querySelector('.v8210-growcup-content');if(!box)return;
 box.innerHTML=header()+'<main class="v8210-main">'+(S.view==='ranking'?ranking():cupBody())+'</main>';
 box.querySelectorAll('[data-cup-close]').forEach(b=>b.onclick=close);
 box.querySelectorAll('[data-cup-view]').forEach(b=>b.onclick=()=>{S.view=String(b.dataset.cupView||'cup');if(S.view==='ranking'&&!S.ranking)void loadRanking();paint()});
 box.querySelector('[data-cup-start]')?.addEventListener('click',start);
 box.querySelector('[data-cup-submit]')?.addEventListener('click',submitAction);
 box.querySelector('[data-cup-ranking]')?.addEventListener('click',()=>{S.view='ranking';paint();void loadRanking()});
 box.querySelector('[data-cup-refresh]')?.addEventListener('click',()=>void loadRanking(true));
 box.querySelector('[data-cup-claim]')?.addEventListener('click',()=>void claimRank());
 bindSingleRange(box);
 if(S.opened)startClock();
}
function applyState(r){
 const next=r?.state&&r.ok===false?r.state:r;if(!next?.ok)return false;
 const changed=S.state?.active!==next.active;
 const prevKey=String(S.state?.run?.run_id||'')+':'+String(S.state?.run?.phase||'');
 const nextKey=String(next?.run?.run_id||'')+':'+String(next?.run?.phase||'');
 S.state=next;S.lastError='';S.refreshes++;
 const serverNow=next?.server_now||next?.run?.server_now;if(serverNow)S.clockOffset=new Date(serverNow).getTime()-Date.now();
 if(prevKey!==nextKey){S.boundaryKey='';S.boundaryRetryAt=0;S.draftKey='';S.draft=null}
 window.dispatchEvent(new CustomEvent('growlegends:growcup-state',{detail:{...next}}));
 if(changed&&document.getElementById('world')?.classList.contains('active')){try{window.v085InstallWorld?.(true)}catch(_){}}
 return true;
}
async function refresh({paintNow=true}={}){
 if(!uid()||!db())return null;
 if(S.refreshInFlight)return S.refreshInFlight;
 S.refreshInFlight=(async()=>{
  try{const r=await rpc('v8210_growcup_state');applyState(r);if(paintNow&&S.opened)paint();return r}
  catch(e){S.lastError=String(e?.message||e);console.warn('[V8.219 Grow Cup] state',e);return null}
  finally{S.refreshInFlight=null}
 })();
 return S.refreshInFlight;
}
async function loadRanking(force=false){
 if(S.busy&&!force)return null;
 try{const r=await rpc('v8210_growcup_leaderboard',{p_limit:100});if(r?.ok){S.ranking=r;if(S.opened)paint()}return r}
 catch(e){S.lastError=String(e?.message||e);console.warn('[V8.219 Grow Cup] ranking',e);return null}
}
function v8229ToggleGlobalMenu(){
 try{
  window.v4148BuildCompleteMenu?.();
  const panel=document.getElementById('v032MenuPanel');
  if(!panel)return false;
  const opening=!(panel.classList.contains('open')||panel.classList.contains('show'));
  panel.classList.toggle('open',opening);
  panel.classList.toggle('show',opening);
  panel.setAttribute('aria-hidden',opening?'false':'true');
  if(opening){
   panel.style.setProperty('display','block','important');
   panel.style.setProperty('visibility','visible','important');
   panel.style.setProperty('opacity','1','important');
   panel.style.setProperty('pointer-events','auto','important');
   panel.style.setProperty('z-index','120001','important');
  }else{
   panel.style.removeProperty('display');
   panel.style.removeProperty('visibility');
   panel.style.removeProperty('opacity');
   panel.style.removeProperty('pointer-events');
   panel.style.removeProperty('z-index');
  }
  return true;
 }catch(err){console.warn('[V8.229 Grow Cup] global menu',err);return false}
}
if(!window.__V8229_GROWCUP_GLOBAL_MENU_GUARD__){
 window.__V8229_GROWCUP_GLOBAL_MENU_GUARD__=true;
 document.addEventListener('click',e=>{
  if(!document.body.classList.contains('v8210-growcup-open'))return;
  const btn=e.target?.closest?.('#v372TopbarShell .v372-menu');
  if(!btn)return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation?.();
  v8229ToggleGlobalMenu();
 },true);
}
async function open(){S.opened=true;S.view='cup';document.body.classList.add('v8210-growcup-open');overlay().classList.add('show');paint();await refresh({paintNow:true});void loadRanking()}
async function start(){
 if(S.busy)return;S.busy=true;paint();
 try{
  const r=await rpc('v8210_growcup_start',{p_request_id:rid('v8214_start')});
  if(r?.ok===false)throw new Error(String(r.reason||'START_REJECTED'));
  applyState(r);S.starts++;toast('6-Stunden-Cup gestartet','success','Aktion 1: Licht · Regler öffnet in 45 Minuten.');
 }catch(e){S.lastError=String(e?.message||e);toast('Grow Cup','error',S.lastError)}
 finally{S.busy=false;paint()}
}
async function submitAction(){
 const run=S.state?.run,value=ensureDraft(run);if(S.busy||!run||run.window_state!=='open')return;
 S.busy=true;paint();
 try{
  const r=await rpc('v8214_growcup_submit',{p_value:Number(value),p_request_id:rid('v8214_submit')});
  if(r?.ok===false){
   const reason=String(r.reason||'SUBMIT_REJECTED');
   if(reason==='CARE_TOO_EARLY')throw new Error('Das Aktionsfenster ist noch nicht geöffnet.');
   if(reason==='CARE_WINDOW_CLOSED')throw new Error('Dieses Aktionsfenster ist bereits geschlossen.');
   if(reason==='CARE_ALREADY_SET')throw new Error('Der Wert für diese Phase wurde bereits festgelegt.');
   if(reason==='VALUE_RANGE'||reason==='VALUE_STEP')throw new Error('Ungültiger Reglerwert.');
   throw new Error(reason);
  }
  applyState(r);S.submits++;toast('Wert festgelegt','success','Punkte werden erst im Finale aufgedeckt.');
 }catch(e){S.lastError=String(e?.message||e);toast('Grow Cup','error',S.lastError)}
 finally{S.busy=false;paint()}
}
async function claimRank(){
 if(S.busy)return;S.busy=true;paint();
 try{
  const r=await rpc('v8210_growcup_claim_rank_reward',{p_request_id:rid('v8214_rank')});
  if(r?.ok===false)throw new Error(String(r.reason||'CLAIM_REJECTED'));
  toast('Cup-Rangbelohnung','success','Platz '+Number(r.rank||0)+' · +'+Number(r.runes_awarded||0)+' Runen · +'+Number(r.shards_awarded||0)+' Fragmente');
  await refresh({paintNow:false});await loadRanking(true);
 }catch(e){
  const m=String(e?.message||e);toast('Rangbelohnung','info',m.includes('RANKING_NOT_FINAL')?'Noch laufende 6-Stunden-Runs – die Rangliste ist noch nicht final.':m);
 }finally{S.busy=false;paint()}
}
function key(e){if(e.key==='Escape'&&S.opened){e.preventDefault();close()}}
window.v8210OpenGrowCup=open;
window.v8210GrowCupRefresh=refresh;
window.v8210GrowCupSnapshot=()=>S.state?JSON.parse(JSON.stringify(S.state)):null;
window.v8210GrowCupClose=close;
window.v8210GrowCupLeaderboard=loadRanking;
window.v8210GrowCupDiagnostics=()=>({version:VERSION,busy:S.busy,opened:S.opened,view:S.view,refreshes:S.refreshes,starts:S.starts,submits:S.submits,lastError:S.lastError,state:S.state,ranking:S.ranking});
window.addEventListener('keydown',key);
window.addEventListener('growlegends:account-ready',()=>{stopClock();S.state=null;S.ranking=null;S.draft=null;S.draftKey='';S.boundaryKey='';S.boundaryRetryAt=0;void refresh({paintNow:false})},{passive:true});
window.addEventListener('pageshow',()=>{if(S.opened)resyncClock();else void refresh({paintNow:false})},{passive:true});
window.addEventListener('focus',()=>{if(S.opened)resyncClock()},{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&S.opened)resyncClock()},{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',()=>{if(S.opened)close()},{passive:true});
})();