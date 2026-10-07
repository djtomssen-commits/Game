(()=>{
'use strict';
if(String(window.GROW_RELEASE_CHANNEL||'stable').toLowerCase()!=='beta')return;
if(window.__V8210_GROW_CUP__)return;
window.__V8210_GROW_CUP__=true;

const VERSION='V8.211';
const PLANTS={
 seedling:'assets/v7198-base64/49aed1d1c8035f5d2123.webp',
 growth:'assets/v7198-base64/c9ec3c217b81f805555c.webp',
 flower:'assets/v7198-base64/9880ab938246ad3b3dec.webp',
 harvest:'assets/v7198-base64/31d47d1bdc5a6c5800cb.webp'
};
const PHASES=[
 ['Keimung','Start · Feuchte · Temperatur'],
 ['Wachstum','Licht · Wurzeln · Tempo'],
 ['Formung','Training · Krone · Stabilität'],
 ['Blüte','Nährstoffe · Blütenansatz'],
 ['Reifung','Harz · Gewicht · Gesundheit'],
 ['Finish','Spülen · Reife · Ernte']
];
const METRICS=[
 ['quality','Qualität','★'],['yield','Ertrag','⚖'],['resin','Harz','✨'],['genetics','Genetik','🧬'],['health','Gesundheit','♥']
];
const TIER={
 bronze:['🥉','BRONZE'],silver:['🥈','SILBER'],gold:['🥇','GOLD'],master:['💎','MEISTER'],champion:['👑','GROW CHAMPION']
};
const S={state:null,ranking:null,busy:false,opened:false,view:'cup',lastError:'',refreshes:0,starts:0,tunes:0,timer:null,clockOffset:0,boundaryKey:'',draftKey:'',draft:null};
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
function close(){stopClock();overlay().classList.remove('show');S.opened=false}
function wallet(){
 const st=S.state||{};
 return '<div class="v8210-wallet"><span><i>ᚱ</i><b>'+Math.max(0,Number(st.runes)||0)+'</b><small>Runen</small></span><span><i>✦</i><b>'+Math.max(0,Number(st.rune_shards)||0)+'</b><small>Fragmente</small></span></div>';
}
function header(){
 return '<header class="v8210-head"><button type="button" data-cup-close class="v8210-back">←</button><div class="v8210-title"><small>6-STUNDEN-CUP · ALLE 2 WOCHEN</small><b>GROW CUP</b><span>6 Stunden · 6 Pflegefenster · versteckte Pflanzenbedürfnisse</span></div>'+wallet()+'<button type="button" data-cup-close class="v8210-close">×</button></header>'+
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
   '<div class="v8210-lobby-copy"><small>GROW LEGENDS · LIVE GROW CUP</small><h1>6 STUNDEN.<br>DEINE PFLANZE.</h1>'+
   '<p>Ein Cup-Run läuft sechs echte Stunden. In jeder Stunde öffnet sich ab Minute 45 ein 15-Minuten-Pflegefenster. Du regelst Licht, Wasser und Dünger selbst. Die Pflanze verrät dir Hinweise – niemals die perfekte Zahl.</p>'+
   '<div class="v8210-lobby-rules"><span><b>6 h</b><small>Laufzeit</small></span><span><b>6</b><small>Pflegefenster</small></span><span><b>15 m</b><small>je Fenster</small></span><span><b>👑</b><small>ab 92 Punkten</small></span></div>'+
   '<div class="v8210-seed-card"><i>🌱</i><div><small>DIESE CUP-SORTE</small><b>'+esc(st.cup_seed||'Cup-Sorte')+'</b><span>Gleiche Sorte für alle · individuelle Phänotyp-Reaktion</span></div></div>'+
   '<button data-cup-start '+(!active||S.busy?'disabled':'')+'>'+(S.busy?'CUP WIRD VORBEREITET …':'6-STUNDEN-CUP STARTEN')+'</button>'+
   '<em>'+(active?'Der Grow Cup ist geöffnet. Dein persönlicher 6-Stunden-Timer beginnt erst beim Start.':'Nächster Grow Cup: '+esc(fmtDate(st.next_event)))+'</em></div>'+
 '</section>';
}
function ensureDraft(run){
 const key=String(run?.run_id||'')+':'+String(run?.phase||1);
 if(S.draftKey===key&&S.draft)return S.draft;
 const src=run?.phase_record?.status==='submitted'?run.phase_record:(run?.last_settings||{});
 S.draft={
  light:Math.max(0,Math.min(60,Number(src.light_minutes??30))),
  water:Math.max(0,Math.min(400,Number(src.water_ml??120))),
  nutrient:Math.max(0,Math.min(10,Number(src.nutrient_ml??1)))
 };
 S.draftKey=key;
 return S.draft;
}
function timingCard(run){
 const state=String(run?.window_state||'waiting');let title='Pflanze entwickelt sich',sub='Pflegefenster öffnet in',target=run?.decision_opens_at,cls='waiting',ico='⏳';
 if(state==='open'){title='Pflege jetzt nötig';sub='Fenster schließt in';target=run?.phase_ends_at;cls='open';ico='⚠️'}
 if(state==='submitted'){title='Pflege gespeichert';sub='Auswertung in';target=run?.phase_ends_at;cls='submitted';ico='✓'}
 if(state==='processing'){title='Phase wird ausgewertet';sub='Nächste Phase in';target=run?.phase_ends_at;cls='processing';ico='🌿'}
 return '<div class="v8210-timing '+cls+'"><i>'+ico+'</i><div><small>STUNDE '+Number(run?.phase||1)+' / 6</small><b>'+title+'</b><span>'+sub+' <strong data-cup-countdown data-target="'+esc(target||'')+'">'+fmtDuration(leftMs(target))+'</strong></span></div><em>Gesamtlaufzeit <b data-cup-run-time data-target="'+esc(run?.run_ends_at||'')+'">'+fmtDuration(leftMs(run?.run_ends_at))+'</b></em></div>';
}
function clues(run){
 const a=Array.isArray(run?.clues)?run.clues:[];
 return '<div class="v8210-clues"><div class="v8210-clue-head"><span>🌿</span><div><small>PFLANZENBEOBACHTUNG</small><b>Lies die Pflanze, nicht eine Formel.</b></div></div>'+a.map(x=>'<p>'+esc(x)+'</p>').join('')+'</div>';
}
function rangeRow(type,label,ico,min,max,step,value,unit,disabled){
 return '<label class="v8210-range"><div><span><i>'+ico+'</i><b>'+label+'</b></span><strong data-cup-value="'+type+'">'+(type==='nutrient'?Number(value).toFixed(1):Math.round(value))+' '+unit+'</strong></div><input type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+value+'" data-cup-range="'+type+'" '+(disabled?'disabled':'')+'><footer><small>'+min+' '+unit+'</small><small>'+max+' '+unit+'</small></footer></label>';
}
function controls(run){
 const d=ensureDraft(run),state=String(run?.window_state||'waiting'),locked=state!=='open'||S.busy,submitted=state==='submitted';
 return '<div class="v8210-grow-controls '+state+'"><div class="v8210-grow-control-head"><div><small>DEINE EINSTELLUNGEN</small><b>'+(submitted?'Für diese Stunde festgelegt':'Pflege selbst einstellen')+'</b></div><span>'+({waiting:'Noch gesperrt',open:'15-Minuten-Fenster',submitted:'Gespeichert',processing:'Auswertung'}[state]||state)+'</span></div>'+
 rangeRow('light','Lichtzeit','💡',0,60,5,d.light,'Min.',locked)+
 rangeRow('water','Wassermenge','💧',0,400,10,d.water,'ml',locked)+
 rangeRow('nutrient','Düngermenge','🧪',0,10,.5,d.nutrient,'ml',locked)+
 '<div class="v8210-control-note">'+(state==='waiting'?'Die Regler werden ab Minute 45 freigeschaltet. Beobachte bis dahin die Pflanze.':submitted?'Die Werte sind fix. Am Ende der Stunde siehst du die Reaktion.':state==='open'?'Du kannst die drei Werte frei kombinieren. Es gibt keine sichtbare Idealzone.':'Die Stunde ist beendet und wird serverseitig verarbeitet.')+'</div>'+
 '<button class="v8210-submit-care" data-cup-tune '+(locked?'disabled':'')+'>'+(S.busy?'SPEICHERT …':submitted?'PFLEGE FESTGELEGT':'PFLEGE FÜR DIESE STUNDE FESTLEGEN')+'</button></div>';
}
function activeRun(run){
 const phase=Math.max(1,Math.min(6,Number(run.phase)||1)),ph=PHASES[phase-1]||PHASES[0];
 return '<section class="v8210-scene v8210-run">'+phaseRail(run)+
 '<div class="v8210-run-grid"><div class="v8210-stage-panel live">'+plantStage(phase,'active')+
 '<div class="v8210-stage-meta"><small>'+esc(run.cup_seed||'Cup-Sorte')+'</small><b>STUNDE '+phase+' / 6</b><span>'+esc(ph[0])+'</span></div></div>'+
 '<div class="v8210-control">'+timingCard(run)+lastCareResult(run)+
 '<div class="v8210-phase-copy"><small>PHASE '+phase+' · '+esc(ph[0]).toUpperCase()+'</small><h2>'+esc(ph[1])+'</h2><p>Die versteckte Zielzone verändert sich mit Phänotyp, Phase und Mikroklima. Nutze die Hinweise und entscheide selbst.</p></div>'+
 metrics(run)+clues(run)+controls(run)+'</div></div></section>';
}
function rewardTable(){
 return '<div class="v8210-reward-table"><div><b>🥇 Platz 1</b><span>3 Runen · 30 Frag.</span></div><div><b>🥈 Platz 2</b><span>2 Runen · 25 Frag.</span></div><div><b>🥉 Platz 3</b><span>2 Runen · 20 Frag.</span></div><div><b>4–10</b><span>1 Rune · 15 Frag.</span></div><div><b>11–25</b><span>12 Frag.</span></div><div><b>26–50</b><span>8 Frag.</span></div><div><b>51–100</b><span>5 Frag.</span></div></div>';
}
function completed(run){
 const t=TIER[String(run.tier||'bronze')]||TIER.bronze,score=Number(run.final_score||0).toFixed(2),rank=Number(run.rank)||0;
 return '<section class="v8210-scene v8210-finale">'+phaseRail(run)+
   '<div class="v8210-final-grid"><div class="v8210-stage-panel final">'+plantStage(6,'completed')+
     '<div class="v8210-final-medal"><i>'+t[0]+'</i><small>GESAMTWERTUNG</small><b>'+score+'</b><strong>'+t[1]+'</strong></div></div>'+
   '<div class="v8210-final-copy"><small>6-STUNDEN-CUP ABGESCHLOSSEN · '+esc(run.cup_seed||'')+'</small><h1>'+t[0]+' '+t[1]+'</h1><p>Sechs Stunden Pflege wurden in Qualität, Ertrag, Harz, Genetik und Gesundheit zusammengeführt.</p>'+metrics(run)+
   (run.personal_reward_awarded?'<div class="v8210-personal-reward"><i>👑</i><div><b>Grow Champion erreicht</b><span>+1 Verzauberungsrune · +10 Runenfragmente</span></div></div>':'<div class="v8210-personal-note">Ab <b>92,00 Punkten</b> gibt es zusätzlich 1 Verzauberungsrune + 10 Fragmente.</div>')+
   '<div class="v8210-rank-now"><small>AKTUELLER SERVER-RANG</small><b>'+(rank?'#'+rank:'wird geladen …')+'</b><span>Rangbelohnungen werden erst final, wenn alle gestarteten 6-Stunden-Runs beendet sind.</span></div>'+
   (S.ranking?.final===true&&!run.rank_reward_claimed?'<button class="v8210-claim" data-cup-claim>Rangbelohnung abholen</button>':'')+
   '<button class="v8210-secondary" data-cup-ranking>Rangliste ansehen</button></div></div>'+
 '</section>';
}
function ranking(){
 const d=S.ranking||{},rows=Array.isArray(d.rows)?d.rows:[],final=d.final===true;
 return '<section class="v8210-scene v8210-ranking"><div class="v8210-ranking-head"><div><small>'+(final?'FINALE SERVERWERTUNG':'VORLÄUFIGE SERVERWERTUNG')+'</small><h2>🏆 GROW CUP RANGLISTE</h2><p>'+(final?'Der Cup ist abgeschlossen und die Rangbelohnungen sind freigegeben.':'Laufende 6-Stunden-Runs können die Reihenfolge noch verändern.')+'</p></div><button data-cup-refresh '+(S.busy?'disabled':'')+'>↻ Aktualisieren</button></div>'+
 rewardTable()+
 '<div class="v8210-ranking-list">'+(rows.length?rows.map(x=>{const t=TIER[String(x.tier||'bronze')]||TIER.bronze;return '<div class="v8210-rank-row rank-'+Number(x.rank||0)+'"><strong>#'+Number(x.rank||0)+'</strong><i>'+t[0]+'</i><div><b>'+esc(x.player||'Legende')+'</b><small>'+esc(x.cup_seed||'')+' · '+esc(t[1])+'</small></div><em>'+Number(x.final_score||0).toFixed(2)+'</em></div>'}).join(''):'<div class="v8210-empty">Noch keine abgeschlossenen 6-Stunden-Runs.</div>')+'</div>'+
 (!final?'<div class="v8210-ranking-pending">⏳ Rangbelohnungen bleiben bis zum Ende des letzten gültigen Cup-Runs gesperrt.</div>':'')+
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
 if(leftMs(target)<=0&&S.boundaryKey!==key){S.boundaryKey=key;void refresh({paintNow:true})}
}
function startClock(){stopClock();updateClockText();S.timer=setInterval(updateClockText,1000)}
function bindRanges(box){
 box.querySelectorAll('[data-cup-range]').forEach(input=>{
  input.oninput=()=>{
   const k=String(input.dataset.cupRange||''),v=Number(input.value);if(!S.draft)return;
   if(k==='light')S.draft.light=v;if(k==='water')S.draft.water=v;if(k==='nutrient')S.draft.nutrient=v;
   const out=box.querySelector('[data-cup-value="'+k+'"]');
   if(out)out.textContent=(k==='nutrient'?v.toFixed(1):Math.round(v))+' '+(k==='light'?'Min.':'ml');
  };
 });
}
function paint(){
 const box=overlay().querySelector('.v8210-growcup-content');if(!box)return;
 box.innerHTML=header()+'<main class="v8210-main">'+(S.view==='ranking'?ranking():cupBody())+'</main>';
 box.querySelectorAll('[data-cup-close]').forEach(b=>b.onclick=close);
 box.querySelectorAll('[data-cup-view]').forEach(b=>b.onclick=()=>{S.view=String(b.dataset.cupView||'cup');if(S.view==='ranking'&&!S.ranking)void loadRanking();paint()});
 box.querySelector('[data-cup-start]')?.addEventListener('click',start);
 box.querySelector('[data-cup-tune]')?.addEventListener('click',tune);
 box.querySelector('[data-cup-ranking]')?.addEventListener('click',()=>{S.view='ranking';paint();void loadRanking()});
 box.querySelector('[data-cup-refresh]')?.addEventListener('click',()=>void loadRanking(true));
 box.querySelector('[data-cup-claim]')?.addEventListener('click',()=>void claimRank());
 bindRanges(box);
 if(S.opened)startClock();
}
function applyState(r){
 const next=r?.state&&r.ok===false?r.state:r;if(!next?.ok)return false;
 const changed=S.state?.active!==next.active;
 const prevKey=String(S.state?.run?.run_id||'')+':'+String(S.state?.run?.phase||'');
 const nextKey=String(next?.run?.run_id||'')+':'+String(next?.run?.phase||'');
 S.state=next;S.lastError='';S.refreshes++;S.boundaryKey='';
 const serverNow=next?.server_now||next?.run?.server_now;if(serverNow)S.clockOffset=new Date(serverNow).getTime()-Date.now();
 if(prevKey!==nextKey){S.draftKey='';S.draft=null}
 window.dispatchEvent(new CustomEvent('growlegends:growcup-state',{detail:{...next}}));
 if(changed&&document.getElementById('world')?.classList.contains('active')){try{window.v085InstallWorld?.(true)}catch(_){}}
 return true;
}
async function refresh({paintNow=true}={}){
 if(!uid()||!db())return null;
 try{const r=await rpc('v8210_growcup_state');applyState(r);if(paintNow&&S.opened)paint();return r}
 catch(e){S.lastError=String(e?.message||e);console.warn('[V8.211 Grow Cup] state',e);return null}
}
async function loadRanking(force=false){
 if(S.busy&&!force)return null;
 try{const r=await rpc('v8210_growcup_leaderboard',{p_limit:100});if(r?.ok){S.ranking=r;if(S.opened)paint()}return r}
 catch(e){S.lastError=String(e?.message||e);console.warn('[V8.211 Grow Cup] ranking',e);return null}
}
async function open(){S.opened=true;S.view='cup';overlay().classList.add('show');paint();await refresh({paintNow:true});void loadRanking()}
async function start(){
 if(S.busy)return;S.busy=true;paint();
 try{
  const r=await rpc('v8210_growcup_start',{p_request_id:rid('v8211_start')});
  if(r?.ok===false)throw new Error(String(r.reason||'START_REJECTED'));
  applyState(r);S.starts++;toast('6-Stunden-Cup gestartet','success','Erstes Pflegefenster öffnet in 45 Minuten.');
 }catch(e){S.lastError=String(e?.message||e);toast('Grow Cup','error',S.lastError)}
 finally{S.busy=false;paint()}
}
async function tune(){
 const run=S.state?.run,d=ensureDraft(run);if(S.busy||!run||run.window_state!=='open')return;
 S.busy=true;paint();
 try{
  const r=await rpc('v8210_growcup_tune',{
   p_light_minutes:Math.round(d.light),p_water_ml:Math.round(d.water),
   p_nutrient_ml:Number(d.nutrient.toFixed(1)),p_request_id:rid('v8211_tune')
  });
  if(r?.ok===false){
   const reason=String(r.reason||'TUNE_REJECTED');
   if(reason==='CARE_TOO_EARLY')throw new Error('Das Pflegefenster ist noch nicht geöffnet.');
   if(reason==='CARE_WINDOW_CLOSED')throw new Error('Dieses Pflegefenster ist bereits geschlossen.');
   if(reason==='CARE_ALREADY_SET')throw new Error('Die Pflege für diese Stunde wurde bereits festgelegt.');
   throw new Error(reason);
  }
  applyState(r);S.tunes++;toast('Pflege festgelegt','success','Die Wirkung wird am Ende der Stunde ausgewertet.');
 }catch(e){S.lastError=String(e?.message||e);toast('Grow Cup','error',S.lastError)}
 finally{S.busy=false;paint()}
}
async function claimRank(){
 if(S.busy)return;S.busy=true;paint();
 try{
  const r=await rpc('v8210_growcup_claim_rank_reward',{p_request_id:rid('v8211_rank')});
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
window.v8210GrowCupDiagnostics=()=>({version:VERSION,busy:S.busy,opened:S.opened,view:S.view,refreshes:S.refreshes,starts:S.starts,tunes:S.tunes,lastError:S.lastError,state:S.state,ranking:S.ranking});
window.addEventListener('keydown',key);
window.addEventListener('growlegends:account-ready',()=>{stopClock();S.state=null;S.ranking=null;S.draft=null;S.draftKey='';void refresh({paintNow:false})},{passive:true});
window.addEventListener('pageshow',()=>setTimeout(()=>void refresh({paintNow:false}),500),{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',()=>{if(S.opened)close()},{passive:true});
})();