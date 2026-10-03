(function(){
 'use strict';
 if(window.__V606_COMBAT_QA__)return;
 window.__V606_COMBAT_QA__=true;

 /* This wrapper adds only an event label when the established Barbar defense
    resolver actually reduced incoming damage. It does not change the damage. */
 try{
  if(typeof v318ResolveEnemyAttack==='function'&&!window.__v606DefenseLabels){
   const base=v318ResolveEnemyAttack;
   v318ResolveEnemyAttack=function(st,ctx){
    const id=String(s?.playerClass||'');
    const before=Math.max(0,Number(ctx?.damage)||0);
    const out=base.apply(this,arguments)||{};
    if(id==='grower' && Number(out.damage)<before && !/AUSGEWICHEN|BLOCK/i.test(String(out.text||''))){
      out.text=(out.text||'Gegner trifft')+' · BLOCK';
    }
    return out;
   };
   try{window.v318ResolveEnemyAttack=v318ResolveEnemyAttack}catch(_){}
   window.__v606DefenseLabels=true;
  }
 }catch(e){console.error('V6.06 defense labels',e)}

 const CLASS_INFO={
  grower:{name:'Bud-Barbar',icon:'⚔️'},
  scout:{name:'Schütze',icon:'🏹'},
  bruiser:{name:'Bong-Magier',icon:'🔮'},
  frost:{name:'Frost-Todesritter',icon:'❄️'},
  summoner:{name:'Harzruferin',icon:'🕯️'}
 };
 const tests=[];
 const add=(id,cls,name,run)=>tests.push({id,cls,name,run});
 const ctx=(o={})=>Object.assign({baseDamage:100,enemyHp:500,enemyMax:500,playerHp:600,playerMax:1000,baseCrit:0,setCrit:0,baseWucht:0,baseDouble:0,setDoubleDamage:0},o);
 const key=(b,k,i)=>`${b}:${k}:${i}`;
 const M=(b,i)=>({[key(b,'m',i)]:1});
 const S=(b,i,n=10)=>({[key(b,'s',i)]:n});
 const merge=(...a)=>Object.assign({},...a);

 function withSandbox(cls,ranks,randoms,fn){
  if(window.__V446_FIGHTING__)throw new Error('Ein echter Dungeon-Kampf läuft gerade. Erst den Kampf beenden.');
  const oldClass=s?.playerClass;
  const oldRank=window.v314Rank;
  const oldRandom=Math.random;
  let q=Array.isArray(randoms)?randoms.slice():[.99];
  const fakeRank=function(branch,kind,i){const v=ranks?.[key(branch,kind,i)];return v==null?0:Number(v)||0};
  try{
   s.playerClass=cls;
   try{v314Rank=fakeRank}catch(_){}
   try{window.v314Rank=fakeRank}catch(_){}
   Math.random=()=>q.length?Number(q.shift()):.99;
   return fn();
  }finally{
   Math.random=oldRandom;
   s.playerClass=oldClass;
   try{v314Rank=oldRank}catch(_){}
   try{window.v314Rank=oldRank}catch(_){}
  }
 }
 function state(cls,max=1000){return v318NewCombatState('dungeon',max)}
 function ptest(cls,ranks,randoms,prep,input,check){
  return withSandbox(cls,ranks,randoms,()=>{const st=state(cls,input?.playerMax||1000);if(prep)prep(st);const r=v318ResolvePlayerAttack(st,ctx(input));return check(r,st)});
 }
 function etest(cls,ranks,randoms,prep,input,check){
  return withSandbox(cls,ranks,randoms,()=>{const st=state(cls,input?.playerMax||1000);st.lastBaseDamage=100;if(prep)prep(st);const r=v318ResolveEnemyAttack(st,{damage:100,playerHp:600,playerMax:1000,...input});return check(r,st)});
 }
 const ok=(pass,detail,visual=true)=>({pass:!!pass,visual:!!visual,detail:String(detail||'')});

 /* V6.07 QA FIX: deterministic Math.random queues below follow the exact
   resolver call order. This changes QA only, never combat chances or damage. */
/* Barbar */
 add('barbar_life','grower','Lebensraub',()=>ptest('grower',S('rage',1,10),[.99,.99,.99,.99],null,{playerHp:500},r=>ok(r.heal>0,`Heilung ${r.heal} LP · ${r.text}`,r.heal>0)));
 add('barbar_wucht','grower','Wucht',()=>ptest('grower',{},[.99,0,.99,.99],null,{baseWucht:1},r=>ok(r.wucht&&/WUCHT/i.test(r.text),`${r.text} · ${r.damage} Schaden`,/WUCHT/i.test(r.text))));
 add('barbar_rage','grower','Raserei',()=>ptest('grower',S('rage',0,10),[.99,.99,0,.99],null,{},r=>ok(r.multi&&/RASEREI/i.test(r.text),`${r.text} · Mehrfachtreffer ${r.multi?'ja':'nein'}`,/RASEREI/i.test(r.text))));
 add('barbar_block','grower','Block / Schadensreduktion',()=>etest('grower',S('tank',1,10),[.99],null,{damage:100},r=>ok(r.damage<100&&/BLOCK/i.test(r.text),`${100-r.damage} Schaden geblockt · ${r.text}`,/BLOCK/i.test(r.text))));
 add('barbar_second','grower','Zweite Luft',()=>etest('grower',M('tank',2),[.99],null,{damage:120,playerHp:200,playerMax:1000},r=>ok(r.heal>0&&/ZWEITE LUFT/i.test(r.text),`+${r.heal} LP · ${r.text}`,/ZWEITE LUFT/i.test(r.text))));
 add('barbar_save','grower','Unkraut vergeht nicht',()=>etest('grower',M('tank',6),[.99],null,{damage:200,playerHp:80,playerMax:1000},r=>ok(r.preventLethal&&/UNKRAUT VERGEHT NICHT/i.test(r.text),`${r.text} · tödlicher Treffer verhindert`,/UNKRAUT VERGEHT NICHT/i.test(r.text))));

 /* Scout */
 add('scout_dodge','scout','Ausweichen',()=>etest('scout',{},[.99],st=>{st.guaranteedDodge=true},{damage:150},r=>ok(r.damage===0&&/AUSGEWICHEN/i.test(r.text),`${r.text} · 0 Schaden`,/AUSGEWICHEN/i.test(r.text))));
 add('scout_counter','scout','Konter',()=>etest('scout',M('dodge',1),[0],st=>{st.guaranteedDodge=true;st.lastBaseDamage=120},{damage:150},r=>ok(r.damage===0&&r.counterDamage>0,`AUSGEWICHEN · Konter ${r.counterDamage}`,r.counterDamage>0)));
 add('scout_salvo','scout','Salve',()=>ptest('scout',M('salvo',0),[.99,0,.99,.99,.99],st=>{st.attackCount=9},{},r=>ok(r.multi&&/SALVE/i.test(r.text),`${r.text} · ${r.damage} Schaden`,/SALVE/i.test(r.text))));
 /* V7.111 QA: dungeon crit chance is capped at 40%; use a deterministic low roll so this test validates the +10pp aimed-shot crit multiplier instead of accidentally testing the cap. */
 add('scout_aimed','scout','Gezielter Schuss',()=>ptest('scout',M('precision',1),[0,.99,.99,.99],null,{baseCrit:1},r=>ok(r.crit&&r.damage===185,`Garantierter Crit: ${r.damage} Schaden · erwartet 185`,true)));
 add('scout_perfect','scout','Perfekter Schuss',()=>ptest('scout',M('precision',6),[.99,.99,.99,.99],null,{},r=>ok(r.crit&&/PERFEKTER SCHUSS/i.test(r.text),`${r.text} · ${r.damage} Schaden`,/PERFEKTER SCHUSS/i.test(r.text))));
 add('scout_execute','scout','Hinrichtung',()=>ptest('scout',M('precision',5),[.99,.99,.99],null,{enemyHp:50,enemyMax:500},r=>ok(/HINRICHTUNG/i.test(r.text),`${r.text} · Gegner unter 20% LP`,/HINRICHTUNG/i.test(r.text))));

 /* Mage */
 add('mage_crit','bruiser','Kritischer Treffer',()=>ptest('bruiser',{},[0,.99,.99,.99,.99],null,{baseCrit:1},r=>ok(r.crit&&/KRIT/i.test(r.text),`${r.text} · ${r.damage} Schaden`,/KRIT/i.test(r.text))));
 add('mage_detonation','bruiser','Detonation',()=>ptest('bruiser',M('magic',1),[.99,.99,0,.99],null,{},r=>ok(/DETONATION/i.test(r.text),`${r.text} · ${r.damage} Schaden`,/DETONATION/i.test(r.text))));
 add('mage_barrier','bruiser','Rauchbarriere',()=>etest('bruiser',M('smoke',3),[.99],null,{damage:220,playerHp:300,playerMax:1000},r=>ok(/RAUCHBARRIERE/i.test(r.text)&&r.damage<220,`${r.text} · Restschaden ${r.damage}`,/RAUCHBARRIERE/i.test(r.text))));
 add('mage_fog','bruiser','Todesnebel',()=>ptest('bruiser',M('smoke',6),[.99,.99,.99,.99],null,{},r=>ok(/TODESNEBEL/i.test(r.text),`${r.text} · ${r.damage} Schaden`,/TODESNEBEL/i.test(r.text))));
 add('mage_supernova','bruiser','Supernova',()=>ptest('bruiser',M('magic',6),[.99,.99,.99,.99],null,{},r=>ok(/SUPERNOVA/i.test(r.text),`${r.text} · ${r.damage} Schaden`,/SUPERNOVA/i.test(r.text))));
 add('mage_chain','bruiser','Kettenreaktion',()=>ptest('bruiser',M('critmagic',6),[0,.99,.99,.99,0,.99],null,{baseCrit:1},r=>ok(/KETTENREAKTION/i.test(r.text),`${r.text} · ${r.damage} Schaden`,/KETTENREAKTION/i.test(r.text))));

 /* Frost */
 add('frost_mark','frost','Kältemarke',()=>ptest('frost',M('frostblade',0),[.99,.99],st=>{st.attackCount=5},{},r=>ok(/KÄLTEMARKE|DOPPELREIF/i.test(r.text),`${r.text} · Markenmechanik aktiv`,/KÄLTEMARKE|DOPPELREIF/i.test(r.text))));
 add('frost_shatter','frost','Eisbruch',()=>ptest('frost',M('frostblade',2),[.99,.99],st=>{st.frostMarks=3},{},r=>ok(/EISBRUCH/i.test(r.text),`${r.text} · 3 Marken verbraucht`,/EISBRUCH/i.test(r.text))));
 add('frost_barrier','frost','Reifbarriere',()=>etest('frost',M('iceguard',0),[.99],null,{damage:180,playerHp:700,playerMax:1000},r=>ok(/REIFBARRIERE/i.test(r.text)&&r.damage<180,`${r.text} · Restschaden ${r.damage}`,/REIFBARRIERE/i.test(r.text))));
 add('frost_eternal','frost','Ewiges Eis',()=>etest('frost',M('iceguard',6),[.99],null,{damage:220,playerHp:200,playerMax:1000},r=>ok(/EWIGES EIS/i.test(r.text),`${r.text} · Heilung ${r.heal}`,/EWIGES EIS/i.test(r.text))));
 add('frost_zero','frost','Absoluter Nullpunkt',()=>ptest('frost',merge(M('frostblade',2),M('frostblade',6)),[.99,.99],st=>{st.frostMarks=3},{},r=>ok(/ABSOLUTER NULLPUNKT/i.test(r.text),`${r.text} · ${r.damage} Schaden`,/ABSOLUTER NULLPUNKT/i.test(r.text))));
 add('frost_twin','frost','Zwillingsschnitt',()=>ptest('frost',M('deathpact',0),[.99,.99],st=>{st.attackCount=4},{},r=>ok(/ZWILLINGSSCHNITT/i.test(r.text),`${r.text} · ${r.damage} Schaden`,/ZWILLINGSSCHNITT/i.test(r.text))));



 /* Harzruferin */
 add('summoner_call','summoner','Ruf aus dem Dunst',()=>ptest('summoner',{},[.99,.30,.99],st=>{st.v6287NoSummon=4},{},r=>ok(!!r.v6287Summon&&/BUD-GEIST|KNOCHENKNECHT|PILZSPORE|NEBELKRÄHE/i.test(r.text),`${r.text} · Begleiter ${r.v6287Summon?.name||'-'}`,!!r.v6287Summon)));
 add('summoner_curse','summoner','Fluchnebel',()=>ptest('summoner',S('curse',0,10),[.99,0,.99],null,{},r=>ok(/FLUCHNEBEL/i.test(r.text)&&!!r.v6302CurseApplied,`${r.text} · DOT ${r.v6302CurseApplied?.damage||0}`,/FLUCHNEBEL/i.test(r.text))));
 add('summoner_soul','summoner','Seelenraub',()=>ptest('summoner',S('soul',0,10),[.99,.99],null,{playerHp:400},r=>ok(r.heal>0&&/SEELENRAUB/i.test(r.text),`${r.text} · +${r.heal} LP`,/SEELENRAUB/i.test(r.text))));
 add('summoner_second','summoner','Zweiter Ruf / Geisterchor',()=>ptest('summoner',M('summon',6),[.99,.05,.99,0,.35],st=>{st.v6287NoSummon=4},{},r=>ok(!!r.v6287SecondSummon,/DIE TOTEN GÄRTNERN MIT|ZWEITER RUF|GEISTERCHOR/i.test(r.text)?`${r.text} · ${r.v6287SecondSummon?.name||''}`:'Zweitbeschwörung ohne sichtbaren Talent-Tag',/DIE TOTEN GÄRTNERN MIT|ZWEITER RUF|GEISTERCHOR/i.test(r.text))));
 add('summoner_save','summoner','Nicht ganz tot',()=>etest('summoner',M('soul',6),[.99],null,{damage:300,playerHp:80,playerMax:1000},r=>ok(r.preventLethal&&/NICHT GANZ TOT/i.test(r.text),`${r.text} · tödlicher Treffer verhindert`,/NICHT GANZ TOT/i.test(r.text))));

 /* Talent coverage contract: every normal node contributes to the combat/stat
    resolver. Milestones are either passive/conditional modifiers or named
    active procs. Named active procs are covered by deterministic QA rows. */
 const V606_TALENT_COVERAGE={
  normal_nodes:{grower:21,scout:21,bruiser:21,frost:21,summoner:21,total:105,mapped:105},
  milestone_nodes:{grower:21,scout:21,bruiser:21,frost:21,summoner:21,total:105,mapped:105},
  active_visual_tests:{
   grower:['Lebensraub','Wucht','Raserei','Block / Schadensreduktion','Zweite Luft','Unkraut vergeht nicht'],
   scout:['Ausweichen','Konter','Salve','Gezielter Schuss','Perfekter Schuss','Hinrichtung'],
   bruiser:['Kritischer Treffer','Detonation','Rauchbarriere','Todesnebel','Supernova','Kettenreaktion'],
   frost:['Kältemarke','Eisbruch','Reifbarriere','Ewiges Eis','Absoluter Nullpunkt','Zwillingsschnitt'],
   summoner:['Ruf aus dem Dunst','Fluchnebel','Seelenraub','Zweiter Ruf / Geisterchor','Nicht ganz tot']
  }
 };
 window.v606TalentCoverage=()=>JSON.parse(JSON.stringify(V606_TALENT_COVERAGE));

 /* Read-only live fight telemetry. It wraps the existing canonical resolver
    once and only records its returned values. No combat value is changed. */
 const V606_TEL_KEY='v8097_beta_combat_telemetry';
 const v606TelState=new WeakMap();
 const v606TelLoad=()=>{try{const a=JSON.parse(localStorage.getItem(V606_TEL_KEY)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}};
 const v606TelSave=rows=>{try{localStorage.setItem(V606_TEL_KEY,JSON.stringify(rows.slice(-300)))}catch(_){}};
 const v606TelAttrs=()=>{const o={};for(const k of ['staerke','geschick','intelligenz','ausdauer','glueck','ruestung']){try{o[k]=Number(totalAttr?.(k))||0}catch(_){o[k]=0}}return o};
 const v606TelTalents=()=>{try{return JSON.parse(JSON.stringify(s?.v314Talents?.[s?.playerClass]||{}))}catch(_){return{}}};
 function v606TelFight(st){
  let x=v606TelState.get(st);
  if(x)return x;
  x={
   id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
   started_at:new Date().toISOString(),
   mode:String(st?.mode||'unknown'),
   class_id:String(s?.playerClass||'unknown'),
   level:Number(s?.level)||0,
   max_hp:Number(st?.maxHp)||0,
   attrs:v606TelAttrs(),
   talents:v606TelTalents(),
   rounds:0,player_attacks:0,enemy_attacks:0,
   damage_done:0,damage_taken:0,healing:0,counter_damage:0,
   crits:0,dodges:0,procs:{},events:[]
  };
  v606TelState.set(st,x);return x;
 }
 function v606TelTags(text){
  return String(text||'').split(/\s*\+\s*|\s*·\s*/).map(x=>x.trim()).filter(Boolean);
 }
 function v606TelProc(x,text){
  for(const tag of v606TelTags(text)){
   if(/^(TREFFER|Gegner trifft)$/i.test(tag))continue;
   x.procs[tag]=(Number(x.procs[tag])||0)+1;
  }
 }
 function v606TelFinish(st,x,won,reason){
  if(x.finished_at)return;
  x.finished_at=new Date().toISOString();x.won=!!won;x.finish_reason=String(reason||'');
  const rows=v606TelLoad();rows.push(x);v606TelSave(rows);
  try{window.dispatchEvent(new CustomEvent('growlegends:combat-telemetry',{detail:{...x,events:x.events.slice(-20)}}))}catch(_){}
 }
 try{
  if(typeof v318ResolvePlayerAttack==='function'&&!window.__v606LiveTelemetryAttack){
   const baseAttack=v318ResolvePlayerAttack;
   v318ResolvePlayerAttack=function(st,ctx){
    const r=baseAttack.apply(this,arguments)||{};
    try{
     if(st&&String(st.mode||'')!=='qa'){
      const x=v606TelFight(st);x.player_attacks++;x.rounds=Math.max(x.rounds,Number(st.attackCount)||x.player_attacks);
      x.damage_done+=Math.max(0,Number(r.damage)||0);x.healing+=Math.max(0,Number(r.heal)||0);if(r.crit)x.crits++;
      v606TelProc(x,r.text);
      x.events.push({round:Number(st.attackCount)||x.player_attacks,side:'player',damage:Math.max(0,Number(r.damage)||0),heal:Math.max(0,Number(r.heal)||0),text:String(r.text||'TREFFER')});
      if(x.events.length>80)x.events=x.events.slice(-80);
      if((Number(r.damage)||0)>=Math.max(0,Number(ctx?.enemyHp)||0))v606TelFinish(st,x,true,'enemy_hp_zero');
     }
    }catch(e){console.warn('[V606] telemetry attack',e)}
    return r;
   };
   try{window.v318ResolvePlayerAttack=v318ResolvePlayerAttack}catch(_){}
   window.__v606LiveTelemetryAttack=true;
  }
  if(typeof v318ResolveEnemyAttack==='function'&&!window.__v606LiveTelemetryDefense){
   const baseDefense=v318ResolveEnemyAttack;
   v318ResolveEnemyAttack=function(st,ctx){
    const r=baseDefense.apply(this,arguments)||{};
    try{
     if(st&&String(st.mode||'')!=='qa'){
      const x=v606TelFight(st);x.enemy_attacks++;x.damage_taken+=Math.max(0,Number(r.damage)||0);x.healing+=Math.max(0,Number(r.heal)||0);x.counter_damage+=Math.max(0,Number(r.counterDamage)||0);
      if(/AUSGEWICHEN/i.test(String(r.text||'')))x.dodges++;
      v606TelProc(x,r.text);
      x.events.push({round:Number(st.enemyAttackCount)||x.enemy_attacks,side:'enemy',damage:Math.max(0,Number(r.damage)||0),heal:Math.max(0,Number(r.heal)||0),counter:Math.max(0,Number(r.counterDamage)||0),text:String(r.text||'Gegner trifft')});
      if(x.events.length>80)x.events=x.events.slice(-80);
      const hpAfter=Math.max(0,(Number(ctx?.playerHp)||0)+(Number(r.heal)||0)-(Number(r.damage)||0));
      if(hpAfter<=0&&!r.preventLethal)v606TelFinish(st,x,false,'player_hp_zero');
     }
    }catch(e){console.warn('[V606] telemetry defense',e)}
    return r;
   };
   try{window.v318ResolveEnemyAttack=v318ResolveEnemyAttack}catch(_){}
   window.__v606LiveTelemetryDefense=true;
  }
 }catch(e){console.error('[V606] live telemetry install',e)}
 window.v606CombatTelemetry=()=>v606TelLoad();
 window.v606CombatTelemetrySummary=()=>{
  const rows=v606TelLoad(),by={};
  for(const r of rows){const k=String(r.class_id||'unknown');const b=by[k]||(by[k]={fights:0,wins:0,rounds:0,damage_done:0,damage_taken:0,healing:0});b.fights++;b.wins+=r.won?1:0;b.rounds+=Number(r.rounds)||0;b.damage_done+=Number(r.damage_done)||0;b.damage_taken+=Number(r.damage_taken)||0;b.healing+=Number(r.healing)||0}
  for(const b of Object.values(by)){b.win_rate=b.fights?b.wins/b.fights:0;b.avg_rounds=b.fights?b.rounds/b.fights:0}
  return {version:'V8.097',stored_fights:rows.length,max_fights:300,by_class:by};
 };
 window.v606ClearCombatTelemetry=()=>{try{localStorage.removeItem(V606_TEL_KEY)}catch(_){}return true};
 const results=new Map();
 function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 function status(r){if(!r)return['idle','NICHT GETESTET'];if(r.pass&&r.visual)return['pass','PASS'];if(r.pass)return['warn','MECHANIK OK'];return['fail','FEHLER']}
 function render(){
  const root=document.getElementById('v606CombatQa');if(!root)return;
  const by=cls=>tests.filter(t=>t.cls===cls);
  const done=[...results.values()],pass=done.filter(r=>r.pass&&r.visual).length,warn=done.filter(r=>r.pass&&!r.visual).length,fail=done.filter(r=>!r.pass).length;
  root.innerHTML=`<div class="v606-head"><div><h3>⚔️ KAMPF-QA · KLASSEN & TALENTE</h3><div class="v606-note">Deterministische Tests der echten Kampf-Resolver. Kein Dungeon-Versuch, kein Gold, kein Harz-Taler, kein Fortschritt und kein Save werden verändert.</div></div><div class="v606-actions"><button class="primary" data-v606-all>ALLE TESTEN</button><button data-v606-clear>ERGEBNISSE LÖSCHEN</button></div></div><div class="v606-grid">${Object.entries(CLASS_INFO).map(([cls,ci])=>`<div class="v606-class"><h4>${ci.icon} ${ci.name}</h4>${by(cls).map(t=>{const r=results.get(t.id),[c,l]=status(r);return `<div class="v606-row ${c}" data-v606-row="${t.id}"><span>${r?(r.pass?'✅':'❌'):'•'}</span><div><b>${esc(t.name)}</b><small>${esc(r?.detail||'Noch nicht getestet.')}</small></div><button class="v606-status" data-v606-test="${t.id}">${l}</button></div>`}).join('')}</div>`).join('')}</div><div class="v606-summary"><b>Ergebnis:</b> ${done.length}/${tests.length} getestet · ✅ ${pass} vollständig · ⚠️ ${warn} Mechanik ohne bestätigte Anzeige · ❌ ${fail} Fehler${window.__V446_FIGHTING__?'<br><b>Hinweis:</b> Ein echter Dungeon-Kampf läuft. QA erst danach starten.':''}</div>`;
 }
 function runOne(id){
  const t=tests.find(x=>x.id===id);if(!t)return;
  try{results.set(id,t.run())}catch(e){results.set(id,{pass:false,visual:false,detail:e?.message||String(e)})}
  render();
 }
 function runAll(){
  if(window.__V446_FIGHTING__){window.v063Toast?.('Erst den laufenden Dungeon-Kampf beenden.','warn');return}
  for(const t of tests){try{results.set(t.id,t.run())}catch(e){results.set(t.id,{pass:false,visual:false,detail:e?.message||String(e)})}}
  render();
 }
 function ensurePanel(){
  const sec=document.getElementById('systemtech');if(!sec)return;
  const main=sec.querySelector('.v4107-main');if(!main)return;
  let panel=document.getElementById('v606CombatQa');
  if(!panel){panel=document.createElement('div');panel.id='v606CombatQa';panel.className='v4107-panel';main.appendChild(panel)}
  const side=sec.querySelector('.v4107-sidebar');
  if(side&&!side.querySelector('[data-v4107-jump="combatqa"]')){
   const b=document.createElement('button');b.className='v4107-nav';b.dataset.v4107Jump='combatqa';b.innerHTML='<i>⚔️</i>Kampf-QA';
   const foot=side.querySelector('.v4107-left-foot');if(foot)side.insertBefore(b,foot);else side.appendChild(b);
  }
  render();
 }
 document.addEventListener('click',e=>{
  const t=e.target.closest?.('[data-v606-test]');if(t){e.preventDefault();runOne(t.dataset.v606Test);return}
  if(e.target.closest?.('[data-v606-all]')){e.preventDefault();runAll();return}
  if(e.target.closest?.('[data-v606-clear]')){e.preventDefault();results.clear();render();return}
  const nav=e.target.closest?.('[data-v4107-jump="combatqa"]');if(nav){e.preventDefault();ensurePanel();document.getElementById('v606CombatQa')?.scrollIntoView({behavior:'smooth',block:'start'});document.querySelectorAll('#systemtech .v4107-nav').forEach(x=>x.classList.toggle('active',x===nav));return}
 },true);
 try{
  const base=window.v4107OpenSystemtechnik;
  if(typeof base==='function'&&!base.__v606Qa){const w=function(){const r=base.apply(this,arguments);setTimeout(ensurePanel,0);return r};w.__v606Qa=true;window.v4107OpenSystemtechnik=w;window.v4102OpenQA=w}
 }catch(_){}
 window.v606RunCombatQA=runAll;
 window.v606CombatQATests=tests;
 setTimeout(ensurePanel,1200);
 window.addEventListener('pageshow',()=>setTimeout(ensurePanel,500),{passive:true});
})();
