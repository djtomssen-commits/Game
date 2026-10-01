(function(){
 'use strict';
 if(window.__V608_ANIMATION_QA__)return;
 window.__V608_ANIMATION_QA__=true;

 const CLASS_INFO={
  grower:{name:'Bud-Barbar',icon:'⚔️'},
  scout:{name:'Schütze',icon:'🏹'},
  bruiser:{name:'Bong-Magier',icon:'🔮'},
  frost:{name:'Frost-Todesritter',icon:'❄️'},
  summoner:{name:'Harzruferin',icon:'🕯️'}
 };
 const SPEC={
  barbar_life:{raw:'TREFFER · 555 Schaden · +3 LP · Gegner: 381 Schaden',labels:['LEBENSRAUB +3 LP'],reaction:'heal'},
  barbar_wucht:{raw:'WUCHT · 900 Schaden · Gegner: 100 Schaden',labels:['WUCHT'],reaction:'power'},
  barbar_rage:{raw:'RASEREI · 900 Schaden · Gegner: 100 Schaden',labels:['RASEREI'],reaction:'power'},
  barbar_block:{raw:'TREFFER · 500 Schaden · Gegner: 95 Schaden · BLOCK',labels:['GEBLOCKT'],reaction:'guard'},
  barbar_second:{raw:'TREFFER · 500 Schaden · Gegner: 120 Schaden · +150 LP · ZWEITE LUFT',labels:['ZWEITE LUFT'],reaction:'heal'},
  barbar_save:{raw:'TREFFER · 500 Schaden · Gegner: 200 Schaden · UNKRAUT VERGEHT NICHT · tödlicher Treffer verhindert',labels:['UNKRAUT VERGEHT NICHT'],reaction:'guard'},

  scout_dodge:{raw:'TREFFER · 500 Schaden · Gegner: AUSGEWICHEN · 0 Schaden',labels:['AUSGEWICHEN'],reaction:'dodge'},
  scout_counter:{raw:'TREFFER · 500 Schaden · Gegner: AUSGEWICHEN · Konter 72',labels:['AUSGEWICHEN','KONTER 72'],reaction:'power'},
  scout_salvo:{raw:'SALVE · 142 Schaden · Gegner: 100 Schaden',labels:['SALVE'],reaction:'power'},
  scout_perfect:{raw:'KRIT + PERFEKTER SCHUSS · 250 Schaden · Gegner: 100 Schaden',labels:['PERFEKTER SCHUSS','KRITISCHER TREFFER'],reaction:'power'},
  scout_execute:{raw:'HINRICHTUNG · Gegner unter 20% LP · 250 Schaden',labels:['HINRICHTUNG'],reaction:'power'},

  mage_crit:{raw:'KRIT · 175 Schaden · Gegner: 100 Schaden',labels:['KRITISCHER TREFFER'],reaction:'power'},
  mage_detonation:{raw:'DETONATION · 135 Schaden · Gegner: 100 Schaden',labels:['DETONATION'],reaction:'power'},
  mage_barrier:{raw:'TREFFER · 500 Schaden · Gegner: RAUCHBARRIERE · Restschaden 70',labels:['RAUCHBARRIERE'],reaction:'guard'},
  mage_fog:{raw:'TODESNEBEL + DOT · 112 Schaden · Gegner: 100 Schaden',labels:['TODESNEBEL'],reaction:'power'},
  mage_supernova:{raw:'SUPERNOVA · 300 Schaden · Gegner: 100 Schaden',labels:['SUPERNOVA'],reaction:'power'},
  mage_chain:{raw:'KRIT · 175 Schaden · KETTENREAKTION · Gegner: 100 Schaden',labels:['KETTENREAKTION','KRITISCHER TREFFER'],reaction:'power'},

  frost_mark:{raw:'KÄLTEMARKE · Markenmechanik aktiv · 120 Schaden',labels:['KÄLTEMARKE'],reaction:'power'},
  frost_shatter:{raw:'EISBRUCH · 3 Marken verbraucht · 180 Schaden',labels:['EISBRUCH'],reaction:'power'},
  frost_barrier:{raw:'TREFFER · 500 Schaden · Gegner: REIFBARRIERE · Restschaden 120',labels:['REIFBARRIERE'],reaction:'guard'},
  frost_eternal:{raw:'TREFFER · 500 Schaden · Gegner: EWIGES EIS · +100 LP',labels:['EWIGES EIS'],reaction:'guard'},
  frost_zero:{raw:'ABSOLUTER NULLPUNKT · 300 Schaden · Gegner: 100 Schaden',labels:['ABSOLUTER NULLPUNKT'],reaction:'power'},
  frost_twin:{raw:'ZWILLINGSSCHNITT · 220 Schaden · Gegner: 100 Schaden',labels:['ZWILLINGSSCHNITT'],reaction:'power'}
 };
 const results=new Map();
 let seq=9000;
 let busy=false;
 const delay=ms=>new Promise(r=>setTimeout(r,ms));
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

 function mechTests(){return Array.isArray(window.v606CombatQATests)?window.v606CombatQATests:[]}
 function status(r){
  if(!r)return['idle','NICHT GETESTET'];
  if(r.running)return['run','TEST…'];
  if(r.pass)return['pass','PASS'];
  if(r.mechanicPass)return['warn','ANIMATION FEHLT'];
  return['fail','FEHLER'];
 }
 function render(){
  const root=document.getElementById('v608AnimationQa');if(!root)return;
  const tests=mechTests();
  const by=cls=>tests.filter(t=>t.cls===cls && SPEC[t.id]);
  const done=[...results.values()].filter(x=>!x.running);
  const pass=done.filter(r=>r.pass).length,warn=done.filter(r=>r.mechanicPass&&!r.pass).length,fail=done.filter(r=>!r.mechanicPass).length;
  root.innerHTML=`<div class="v608-head"><div><h3>🎞️ ANIMATIONS-QA · ECHTER KAMPF-RENDERER</h3><div class="v608-note">Prüft den echten V6.04-Dungeon-Renderer: Die echte Klassenmechanik muss PASS sein, das richtige Badge muss tatsächlich im Battle-Stage-DOM erscheinen, sichtbar sein und seine CSS-Animation laufen. Außerdem wird die passende Figurenreaktion geprüft. Der Test läuft offscreen und verändert keinen Save, keinen Dungeonfortschritt und keine Währung.</div></div><div class="v608-actions"><button class="primary" data-v608-all ${busy?'disabled':''}>ALLE ANIMATIONEN TESTEN</button><button data-v608-clear ${busy?'disabled':''}>ERGEBNISSE LÖSCHEN</button></div></div><div class="v608-grid">${Object.entries(CLASS_INFO).map(([cls,ci])=>`<div class="v608-class"><h4>${ci.icon} ${ci.name}</h4>${by(cls).map(t=>{const r=results.get(t.id),[c,l]=status(r);return `<div class="v608-row ${c}"><span>${r?.running?'⏳':r?(r.pass?'✅':'❌'):'•'}</span><div><b>${esc(t.name)}</b><small>${esc(r?.detail||'Noch nicht getestet.')}</small></div><button class="v608-status" data-v608-test="${t.id}" ${busy?'disabled':''}>${l}</button></div>`}).join('')}</div>`).join('')}</div><div class="v608-summary"><b>Ergebnis:</b> ${done.length}/${Object.keys(SPEC).length} getestet · ✅ ${pass} Mechanik + Badge + Animation · ⚠️ ${warn} Mechanik OK, Darstellung fehlerhaft · ❌ ${fail} Mechanikfehler${window.__V446_FIGHTING__?'<br><b>Hinweis:</b> Ein echter Dungeon-Kampf läuft. Animations-QA erst danach starten.':''}</div>`;
 }

 async function startHarness(){
  if(window.__V446_FIGHTING__)throw new Error('Ein echter Dungeon-Kampf läuft gerade. Erst den Kampf beenden.');
  const dungeon=document.getElementById('dungeon');
  const card=document.getElementById('dungeonBattleCard');
  const log=document.getElementById('battleLog');
  const stage=document.getElementById('battleStage');
  if(!dungeon||!card||!log||!stage)throw new Error('Dungeon-Battle-DOM nicht gefunden.');
  const state={dungeonActive:dungeon.classList.contains('active'),dungeonHarness:dungeon.classList.contains('v608-qa-harness'),cardStyle:card.getAttribute('style'),cardClean:card.classList.contains('v599-clean'),log:log.textContent};
  dungeon.classList.add('active','v608-qa-harness');
  card.classList.add('v599-clean');
  card.style.setProperty('display','block','important');
  dungeon.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
  await delay(55);
  let strip=stage.querySelector('.v575-proc-strip');
  if(!strip){strip=document.createElement('div');strip.className='v575-proc-strip';stage.appendChild(strip)}
  return {dungeon,card,log,stage,strip,state};
 }
 function stopHarness(h){
  if(!h)return;
  try{h.log.textContent=h.state.log}catch(_){}
  try{h.strip.querySelectorAll('.v604-skill-chip').forEach(x=>x.remove())}catch(_){}
  try{
   if(h.state.cardStyle==null)h.card.removeAttribute('style');else h.card.setAttribute('style',h.state.cardStyle);
   if(!h.state.cardClean)h.card.classList.remove('v599-clean');
   if(!h.state.dungeonActive)h.dungeon.classList.remove('active');
   if(!h.state.dungeonHarness)h.dungeon.classList.remove('v608-qa-harness');
  }catch(_){}
 }
 function expectedReaction(kind){
  if(kind==='heal')return {target:document.getElementById('playerFighter'),cls:'v604-heal-flash',anim:/v604HealFlash/i};
  if(kind==='dodge')return {target:document.getElementById('playerFighter'),cls:'v604-dodge-flash',anim:/v604DodgeFlash/i};
  if(kind==='guard')return {target:document.getElementById('playerFighter'),cls:'v604-guard-flash',anim:/v604GuardFlash/i};
  if(kind==='power')return {target:document.getElementById('playerFighter'),cls:'v604-power-flash',anim:/v604PowerFlash/i,enemy:document.getElementById('enemyFighter')};
  return null;
 }
 async function visualProbe(h,id,spec){
  h.strip.querySelectorAll('.v604-skill-chip').forEach(x=>x.remove());
  /* V6.14: event-based proof instead of sampling a transient CSS state. */
  const events=[];
  const onStart=ev=>{
   const n=String(ev.animationName||'');
   if(/^v604/i.test(n))events.push({target:ev.target,name:n,time:performance.now()});
  };
  document.addEventListener('animationstart',onStart,true);
  document.addEventListener('webkitAnimationStart',onStart,true);
  const round=++seq;
  try{
   h.log.textContent=`Runde ${round}: ${spec.raw}`;
   await delay(260);
   const chips=[...h.strip.querySelectorAll('.v604-skill-chip')];
   const chipTexts=chips.map(x=>(x.textContent||'').replace(/\s+/g,' ').trim().toUpperCase());
   const missing=spec.labels.filter(label=>!chipTexts.some(t=>t.includes(String(label).toUpperCase())));
   const labelsOk=missing.length===0;
   const chipsAnimated=labelsOk && spec.labels.every(label=>{
    const u=String(label).toUpperCase();
    const el=chips.find(x=>(x.textContent||'').toUpperCase().includes(u));
    if(!el)return false;
    const cs=getComputedStyle(el),r=el.getBoundingClientRect();
    const visible=cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>0&&r.height>0;
    const eventOk=events.some(e=>e.target===el&&/v604SkillChip/i.test(e.name));
    const wa=typeof el.getAnimations==='function'&&el.getAnimations().some(a=>['running','pending','finished'].includes(a.playState));
    const css=/v604SkillChip/i.test(cs.animationName||'');
    const armed=el.dataset.v613Animated==='1';
    return visible && (eventOk||wa||css||armed);
   });
   const rr=expectedReaction(spec.reaction);
   let reactionOk=true,reactionDetail='keine Figurenreaktion erwartet';
   if(rr){
    const cs=rr.target?getComputedStyle(rr.target):null;
    const eventOk=!!(rr.target&&events.some(e=>e.target===rr.target&&rr.anim.test(e.name)));
    const wa=rr.target&&typeof rr.target.getAnimations==='function'&&rr.target.getAnimations().some(a=>['running','pending','finished'].includes(a.playState));
    const clsOk=!!(rr.target&&rr.target.classList.contains(rr.cls));
    reactionOk=!!(rr.target&&(eventOk||wa||(clsOk&&rr.anim.test(cs?.animationName||''))));
    reactionDetail=`${rr.cls}: ${reactionOk?'gestartet':'fehlt'}`;
    if(spec.reaction==='power'){
     const e=rr.enemy,ecs=e?getComputedStyle(e):null;
     const eEvent=!!(e&&events.some(x=>x.target===e&&/v604EnemyHit/i.test(x.name)));
     const eWa=e&&typeof e.getAnimations==='function'&&e.getAnimations().some(a=>['running','pending','finished'].includes(a.playState));
     const eCls=!!(e&&e.classList.contains('v604-hit-flash'));
     const enemyOk=!!(e&&(eEvent||eWa||(eCls&&/v604EnemyHit/i.test(ecs?.animationName||''))));
     reactionOk=reactionOk&&enemyOk;
     reactionDetail+=` · Gegner-Hit: ${enemyOk?'gestartet':'fehlt'}`;
    }
   }
   return {pass:labelsOk&&chipsAnimated&&reactionOk,labelsOk,chipsAnimated,reactionOk,detail:`Badge ${labelsOk?'OK':'FEHLT '+missing.join(', ')} · Animationstart ${chipsAnimated?'OK':'FEHLT'} · ${reactionDetail}`};
  }finally{
   document.removeEventListener('animationstart',onStart,true);
   document.removeEventListener('webkitAnimationStart',onStart,true);
  }
 }

 async function runOne(id,harness){
  const t=mechTests().find(x=>x.id===id),spec=SPEC[id];
  if(!t||!spec)return;
  results.set(id,{running:true});render();
  let mech;
  try{mech=t.run()}catch(e){mech={pass:false,detail:e?.message||String(e)}}
  if(!mech?.pass){results.set(id,{pass:false,mechanicPass:false,detail:`Mechanik FEHLER · ${mech?.detail||''}`});render();return}
  let own=false,h=harness;
  try{
   if(!h){h=await startHarness();own=true}
   const v=await visualProbe(h,id,spec);
   results.set(id,{pass:v.pass,mechanicPass:true,detail:`Mechanik OK · ${v.detail}`});
  }catch(e){results.set(id,{pass:false,mechanicPass:true,detail:`Mechanik OK · Animationsprobe Fehler: ${e?.message||e}`})}
  finally{if(own)stopHarness(h)}
  render();
 }
 async function runAll(){
  if(busy)return;
  if(window.__V446_FIGHTING__){window.v063Toast?.('Erst den laufenden Dungeon-Kampf beenden.','warn');return}
  busy=true;render();
  let h=null;
  try{
   h=await startHarness();
   for(const t of mechTests())if(SPEC[t.id]){await runOne(t.id,h);await delay(520);}
  }catch(e){window.v063Toast?.(`Animations-QA: ${e?.message||e}`,'error')}
  finally{stopHarness(h);busy=false;render()}
 }
 function ensurePanel(){
  const sec=document.getElementById('systemtech');if(!sec)return;
  const main=sec.querySelector('.v4107-main');if(!main)return;
  let panel=document.getElementById('v608AnimationQa');
  if(!panel){panel=document.createElement('div');panel.id='v608AnimationQa';panel.className='v4107-panel';const after=document.getElementById('v606CombatQa');if(after?.parentNode===main)after.after(panel);else main.appendChild(panel)}
  const side=sec.querySelector('.v4107-sidebar');
  if(side&&!side.querySelector('[data-v4107-jump="animationqa"]')){
   const b=document.createElement('button');b.className='v4107-nav';b.dataset.v4107Jump='animationqa';b.innerHTML='<i>🎞️</i>Animations-QA';
   const foot=side.querySelector('.v4107-left-foot');if(foot)side.insertBefore(b,foot);else side.appendChild(b);
  }
  render();
 }
 document.addEventListener('click',e=>{
  const t=e.target.closest?.('[data-v608-test]');if(t){e.preventDefault();runOne(t.dataset.v608Test);return}
  if(e.target.closest?.('[data-v608-all]')){e.preventDefault();runAll();return}
  if(e.target.closest?.('[data-v608-clear]')){e.preventDefault();results.clear();render();return}
  const nav=e.target.closest?.('[data-v4107-jump="animationqa"]');if(nav){e.preventDefault();ensurePanel();document.getElementById('v608AnimationQa')?.scrollIntoView({behavior:'smooth',block:'start'});document.querySelectorAll('#systemtech .v4107-nav').forEach(x=>x.classList.toggle('active',x===nav));return}
 },true);
 try{
  const base=window.v4107OpenSystemtechnik;
  if(typeof base==='function'&&!base.__v608Qa){const w=function(){const r=base.apply(this,arguments);setTimeout(ensurePanel,0);return r};w.__v608Qa=true;window.v4107OpenSystemtechnik=w;window.v4102OpenQA=w}
 }catch(_){ }
 window.v608RunAnimationQA=runAll;
 window.v608AnimationQASpec=SPEC;
 setTimeout(ensurePanel,1500);
 window.addEventListener('pageshow',()=>setTimeout(ensurePanel,600),{passive:true});
})();
