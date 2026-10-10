// V8.315: deterministic browser test of the opt-in recorder itself.
// Synthetic navigation verifies instrumentation for all primary screens;
// it is NOT an authenticated end-to-end gameplay or Android GPU test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
const systemtechSource=fs.readFileSync(path.join(process.cwd(),'js/features/system/beta/v8009-s1-v4107-systemtechnik.js'),'utf8');
assert.ok(systemtechSource.includes('id="gl8315ManualStart"')&&systemtechSource.includes('id="gl8315AllPages"')&&systemtechSource.includes('id="gl8315LastReport"'),'Canonical Systemtechnik page must expose 3 perf controls');
assert.ok(systemtechSource.indexOf('id="gl8315AllPages"')>systemtechSource.indexOf('id="glProfilerStart"'),'17-page control must appear below existing 30-second profiler');
assert.ok(systemtechSource.includes("profiler.sweep({dwellMs:2500})"),'Systemtechnik 17-page button must be bound to trace');
assert.ok(systemtechSource.includes("profiler.start()"),'Systemtechnik manual button must be bound to trace');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];
page.on('pageerror',e=>errors.push(String(e.message||e)));
try{
 await page.setContent('<!doctype html><html><head><style>.screen{display:none}.screen.active{display:block}</style></head><body><main id="app"></main></body></html>');
 await page.addScriptTag({path:path.join(process.cwd(),'js/system/performance/v8315-page-trace.js')});
 const inactive=await page.evaluate(()=>{
  const pages=window.GL_PAGE_AUDIT.screenIds();
  for(const id of pages){
   const section=document.createElement('section');
   section.id=id;section.className='screen';
   section.innerHTML='<h2>Testseite</h2><article class="page-card">Testinhalt</article>';
   if(id==='world'){
     section.innerHTML='<div class="v366-world"><h2 class="v690-current-title">Aktuelles</h2><section class="v366-lower"><div class="v8310-cup-results-slot">Cup</div></section></div>';
   }
   document.querySelector('main').appendChild(section);
  }
  document.getElementById('world').classList.add('active');
  window.v032Go=id=>{
   document.querySelectorAll('.screen.active').forEach(x=>x.classList.remove('active'));
   document.getElementById(id)?.classList.add('active');
   window.dispatchEvent(new CustomEvent('growlegends:navigation-open-v7119',{detail:{id}}));
  };
  return {pages:pages.length,running:window.GL_PAGE_AUDIT.report().running,dock:!!document.getElementById('v8315PerfDock')};
 });
 assert.equal(inactive.pages,17);
 assert.equal(inactive.running,false);
 assert.equal(inactive.dock,false,'Profiler must be dormant by default');
 await page.evaluate(()=>{
  GL_PAGE_AUDIT.start();
  GL_PAGE_AUDIT.renderMark('world','full',{owner:'test'});
  const tab=document.createElement('button');tab.dataset.tab='current';tab.textContent='QA Tab';
  document.querySelector('#world').appendChild(tab);tab.click();
  document.querySelector('.v690-current-title').setAttribute('style','opacity:0.9');
  const grid=document.querySelector('.v366-lower');
  grid.replaceWith(grid.cloneNode(true));
 });
 await page.waitForTimeout(520);
 const manual=await page.evaluate(()=>GL_PAGE_AUDIT.stop('qa'));
 const world=manual.pages.find(x=>x.screen==='world');
 assert.ok(world,'world not measured');
 assert.equal(world.renderMarks.full,1,'canonical Home marker not counted');
 assert.ok(world.aktuellesReplacements>=1,'Aktuelles DOM removal not detected');
 assert.ok(world.visibilityChanges>=1,'visibility change not detected');
 assert.equal(world.tabClicks.current,1,'tab click instrumentation missing');
 assert.equal(manual.running,false);
 assert.equal(await page.locator('#v8315PerfDock').count(),0,'debug dock must be removed');
 const sweep=await page.evaluate(()=>GL_PAGE_AUDIT.sweep({dwellMs:170}));
 assert.equal(sweep.running,false);
 assert.equal(sweep.totalScreens,17,'automatic run must measure all 17 screens');
 assert.equal(sweep.sweepDone,17,'all synthetic routes should be active');
 assert.ok(sweep.pages.every(x=>x.visits>0),'every screen should have a visit');
 assert.ok(sweep.pages.every(x=>x.durationMs>=0),'invalid duration');
 // New users start the sweep from Systemtechnik. Its navigation fixture must
 // not count the admin screen as an 18th gameplay page.
 const systemtechSweep=await page.evaluate(async()=>{
   const sec=document.createElement('section');sec.id='systemtech';sec.className='screen';sec.innerHTML='<h2>Systemtechnik</h2>';document.querySelector('main').appendChild(sec);
   v032Go('systemtech');
   return await GL_PAGE_AUDIT.sweep({dwellMs:170});
 });
 assert.equal(systemtechSweep.totalScreens,17,'Systemtechnik must not count as an 18th gameplay screen');
 assert.equal(systemtechSweep.sweepDone,17,'sweep from Systemtechnik must cover 17 screens');
 // V8.360: semantic page+tab scan, nested sub-tabs, disabled and payment safety.
 await page.evaluate(()=>{
  window.GROW_RELEASE_CHANNEL='beta';window.__qaActionClicks=0;
  document.getElementById('character').innerHTML=
   '<div class="tabs"><button data-tab="inventory">Inventar</button><button data-tab="materials">Materialien</button></div>'+
   '<div id="qaChild" hidden><div role="tablist"><button role="tab" data-subtab="gems">Edelsteine</button><button role="tab" data-subtab="scrolls">Schriftrollen</button></div></div>'+
   '<button id="purchase" type="button">Harz-Taler kaufen</button>';
  document.querySelector('#character [data-tab="materials"]').onclick=()=>{document.getElementById('qaChild').hidden=false};
  document.getElementById('purchase').onclick=()=>window.__qaActionClicks++;
  document.getElementById('guild').innerHTML=
   '<div class="tabs"><button data-v254-tab="overview">Übersicht</button><button data-v254-tab="boss">Gildenboss</button><button data-v254-tab="war" disabled>Krieg</button></div>';
  document.getElementById('bagDealer').innerHTML=
   '<div role="tablist"><button role="tab" data-v8010-tab="bags">Tütchen</button><button role="tab" data-v8010-tab="machine">Automat</button></div>';
 });
 const allTabs=await page.evaluate(()=>GL_PAGE_AUDIT.sweep({ids:['character','guild','bagDealer'],dwellMs:170,tabDwellMs:250,includeTabs:true}));
 assert.equal(allTabs.sweepDone,3,'tab sweep should visit all 3 requested screens');
 assert.ok(allTabs.tabSweepDone>=8,'at least eight active semantic tabs should be tested');
 assert.ok(allTabs.tabResults.some(x=>x.screen==='character'&&x.tab==='scrolls'),'nested scrolls tab missed');
 assert.ok(allTabs.tabResults.some(x=>x.screen==='guild'&&x.tab==='boss'),'guild boss tab missed');
 assert.ok(allTabs.tabSkipped.some(x=>x.screen==='guild'&&x.tab==='war'&&x.reason==='disabled'),'disabled tab not documented');
 assert.equal(await page.evaluate(()=>window.__qaActionClicks),0,'payment button was clicked');
 assert.ok(allTabs.tabResults.every(x=>x.durationMs>=0&&Array.isArray(x.warnings)),'tab measurements incomplete');
 assert.ok(allTabs.tabResults.every(x=>Number.isFinite(x.idleMutationRecords)&&
   Number.isFinite(x.idleNodesRemoved)&&Array.isArray(x.mutationHotspots)&&
   Array.isArray(x.idleMutationHotspots)&&Array.isArray(x.layoutShiftHotspots)),
   'V8.362 per-tab owner and idle measurements missing');
 // V8.361: a real async Caravan owner and a linked Gold Shop route
 // must not be mistaken for a missing/failed primary screen.
 await page.evaluate(()=>{
  const gold=document.createElement('section');gold.id='goldShop';gold.className='screen';
  gold.innerHTML='<h2>Gold-Shop</h2>';document.querySelector('main').appendChild(gold);
  window.v7240OpenCaravan=async()=>{
   await new Promise(resolve=>setTimeout(resolve,85));
   v032Go('caravan');return true;
  };
  document.getElementById('harzDealer').innerHTML='<div class="v7117-tabs">'+
   '<button type="button" data-v7117-tab="harz">Harz</button>'+
   '<button type="button" data-v7117-tab="gold">Gold</button></div>';
  document.querySelector('#harzDealer [data-v7117-tab="gold"]').onclick=()=>v032Go('goldShop');
 });
 const linked=await page.evaluate(()=>GL_PAGE_AUDIT.sweep({
  ids:['caravan','harzDealer'],dwellMs:170,tabDwellMs:250,includeTabs:true
 }));
 assert.equal(linked.sweepDone,2,'Caravan must be measured as an actually opened screen');
 assert.ok(linked.primaryScreens>=2,'requested primary screens must appear even when starting from another gameplay screen');
 assert.ok(linked.pages.some(x=>x.screen==='caravan'&&x.visits>0),'Caravan page visit missing');
 assert.ok(linked.pages.find(x=>x.screen==='caravan')?.durationMs>=150,'Async Caravan dwell was lost');
 assert.ok(linked.linkedScreens.includes('goldShop'),'linked Gold Shop must be named in the report');
 assert.ok(linked.tabResults.some(x=>x.screen==='harzDealer'&&x.tab==='gold'&&x.status==='linked_screen'),
   'Gold Shop navigation is expected, not a broken Harz Dealer tab');
 assert.equal(linked.tabResults.filter(x=>x.status==='unexpected_navigation').length,0,'unexpected tab routing');
 await page.evaluate(()=>{window.GROW_RELEASE_CHANNEL='beta';GL_PAGE_AUDIT.start();v032Go('character')});
 await page.waitForTimeout(450);
 const scopeStart=await page.evaluate(()=>GL_PAGE_AUDIT.report().pages.find(x=>x.screen==='character').mutationRecords);
 await page.evaluate(()=>{for(let i=0;i<40;i++)document.querySelector('#world .v366-lower').textContent='Background '+i});
 await page.waitForTimeout(80);
 const scopeEnd=await page.evaluate(()=>GL_PAGE_AUDIT.stop('qa_scope').pages.find(x=>x.screen==='character').mutationRecords);
 assert.equal(scopeEnd,scopeStart,'inactive World DOM mutations must not be billed to Character');
 // V8.363: only in an explicitly opted-in Beta QA run, trace HTTP status
 // without ever recording query strings, request bodies or tokens.
 const qaCenter=await page.evaluate(async()=>{
  window.GROW_RELEASE_CHANNEL='beta';
  const originalFetch=window.fetch;
  const originalTextSetter=Object.getOwnPropertyDescriptor(Node.prototype,'textContent').set;
  window.fetch=async()=>new Response('simulated failure',{status:503});
  const domProbe=document.createElement('span');
  domProbe.className='v8315-qa-text-probe';domProbe.textContent='test-only';
  document.querySelector('#character').appendChild(domProbe);
  document.querySelector('#character [data-tab="materials"]').addEventListener('click',
   ()=>{domProbe.textContent='test-only';void fetch('/rest/v1/qa_probe?secret=never_export')},{once:true});
  const result=await GL_PAGE_AUDIT.sweep({ids:['character'],dwellMs:170,
   tabDwellMs:250,includeTabs:true,extended:true});
  const restored=window.fetch!==originalFetch&&window.fetch.name!=='wrappedFetch';
  const restoredText=Object.getOwnPropertyDescriptor(Node.prototype,'textContent').set===originalTextSetter;
  window.fetch=originalFetch;
  return {result,restored,restoredText};
 });
 assert.equal(qaCenter.restored,true,'opt-in fetch instrumentation was not restored');
 assert.equal(qaCenter.restoredText,true,'V8.371 textContent instrumentation was not restored');
 assert.equal(qaCenter.result.version,'V8.375','QA Center version missing');
 assert.ok(qaCenter.result.qaCenter.mutationDetail?.character?.identicalText>=1,
  'V8.370 same-text childList replacement classification missing');
 assert.ok(qaCenter.result.qaCenter.mutationDetail?.character?.textWriters?.some(x=>x.attempts>=1),
  'V8.371 synthetic unchanged text source attribution missing');
 assert.ok(qaCenter.result.qaCenter.mutationDetail?.character?.textOnly>=1,
  'V8.370 synthetic text-only rewrite classification missing');
 assert.ok(qaCenter.result.qaCenter.network.errors>=1,'QA network errors were not collected');
 assert.ok(qaCenter.result.qaCenter.network.endpoints.some(x=>x.endpoint==='REST qa_probe'&&x.failures>=1),
  'sanitized failed REST request missing: '+JSON.stringify(qaCenter.result.qaCenter.network.endpoints));
 assert.ok(qaCenter.result.qaCenter.findings.some(x=>x.code==='rpc_http_failures'),
  'ranked network findings missing');
 assert.ok(qaCenter.result.tabResults.every(x=>x.layoutAudit&&x.idleVisualDelta),
  'tab layout / visual stability diagnostics missing');
 assert.ok(!JSON.stringify(qaCenter.result).includes('never_export'),
  'sensitive URL query was stored in QA report');
 // V8.319: the 30-second profiler must read the real V477 counters
 // rather than the retired __V4106_TECH__ store. Synthetic, no real account.
 const profilerStart=systemtechSource.indexOf('/* V8.319: canonical opt-in');
 const profilerEnd=systemtechSource.indexOf('const clone=v=>',profilerStart);
 assert.ok(profilerStart>=0&&profilerEnd>profilerStart,'V8.319 canonical profiler owner missing');
 const profilerModule=systemtechSource.slice(profilerStart,profilerEnd);
 await page.evaluate(()=>{
   window.currentScreenId=()=>document.querySelector('.screen.active')?.id||'unknown';
   window.GROW_RELEASE_CHANNEL='server1';
   window.__qaProfileIntervals=[{id:21,site:'qa-owner.js',callback:'tick',actualDelay:2000,
     requestedDelay:2000,calls:2,cpuMs:10,maxMs:5,active:true}];
   window.__qaProfileObservers=[{key:1,site:'qa-render.js',targets:['world'],batches:1,records:2,active:true}];
   window.__V477_RUNTIME_PROFILE_SNAPSHOT__=()=>({
     intervals:window.__qaProfileIntervals,observers:window.__qaProfileObservers
   });
   const box=document.createElement('div');box.id='glRuntimeProfiler';
   box.innerHTML=['glProfilerStatus','glProfilerStart','glProfilerStop','glProfilerCopy','glProfilerBody']
     .map(id=>'<div id="'+id+'"></div>').join('');
   document.body.appendChild(box);
 });
 await page.addScriptTag({content:profilerModule});
 const profilerSmoke=await page.evaluate(()=>{
   const started=startRuntimeProfiler(),duplicate=startRuntimeProfiler();
   window.__qaProfileIntervals[0].calls+=7;
   window.__qaProfileIntervals[0].cpuMs+=450;
   window.__qaProfileObservers[0].records+=175;
   window.__qaProfileObservers[0].batches+=9;
   const report=stopRuntimeProfiler();
   return {started,duplicate,report,stopped:!runtimeProfile.running,
     startReady:!document.getElementById('glProfilerStart').disabled,
     stopDisabled:document.getElementById('glProfilerStop').disabled};
 });
 assert.ok(profilerSmoke.started&&!profilerSmoke.duplicate&&profilerSmoke.stopped);
 assert.ok(profilerSmoke.startReady&&profilerSmoke.stopDisabled,'30s profiler buttons did not reset');
 assert.ok(profilerSmoke.report.includes('SERVER1'),'Profiler report must use real release channel');
 assert.ok(profilerSmoke.report.includes('CPU 450.0 ms | Aufrufe 7'),'V477 real timer delta missing');
 assert.ok(profilerSmoke.report.includes('Records 175 | Batches 9'),'V477 real observer delta missing');
 assert.ok(profilerSmoke.report.includes('Long-Task-Quelle:'),'Profiler must declare its long-task source');
 await page.locator('#glRuntimeProfiler').evaluate(el=>el.remove());
 // V8.364: real original Beta owners must not overwrite live dynamic stats,
 // remount identical Quest/Grow panels or call normal scrolling "flicker".
 const ownerPage=await browser.newPage({viewport:{width:390,height:844}});
 await ownerPage.setContent('<!doctype html><html><body>'+
  '<section id="quests" class="screen active"><div class="quest-list"></div>'+
  '<div id="qaTranslate">VIP kaufen</div><span id="qaValue">1.997</span></section>'+
  '<section id="grow" class="screen"><div class="v492-grow"><div class="v492-sign"></div></div></section></body></html>');
 await ownerPage.evaluate(()=>{
  window.GROW_RELEASE_CHANNEL='beta';
  window.__qaLanguage='de';
  window.GrowI18n={getLanguage:()=>window.__qaLanguage};
  window.s={level:10,quests:{offers:[{title:'Quest A',duration:60,energy:3,xp:10,gold:20}]},grow:{v492:{bag:[]}}};
  window.v094XpEventActive=()=>false;
  window.v274GoldEventActive=()=>false;
  window.v7081UseAuthority=()=>false;
  window.v6160GrowContracts={state:()=>({contracts:[]})};
  window.v6160RenderBoardHtml=()=>'<div id="qaOrders">Aufträge</div>';
 });
 const ownerErrors=[];ownerPage.on('pageerror',e=>ownerErrors.push(String(e.stack||e.message||e)));
 await ownerPage.addScriptTag({path:path.join(process.cwd(),'js/features/i18n/v8144-i18n-gameplay.js')});
 const bootI18n=await ownerPage.evaluate(()=>({
  hasG:!!window.GrowI18n,gate:window.__V8144_GAMEPLAY_I18N__,bridge:!!window.v8144GameplayI18n
 }));
 assert.ok(bootI18n.bridge,'Original i18n bridge failed to initialize: '+JSON.stringify({bootI18n,ownerErrors}));
 await ownerPage.addScriptTag({path:path.join(process.cwd(),'js/features/quest/beta/v386-quest-redesign-script.js')});
 await ownerPage.addScriptTag({path:path.join(process.cwd(),'js/features/grow/beta/v8009-s6-v6163-growroom-primary-tabs-core.js')});
 const ownerCheck=await ownerPage.evaluate(()=>{
  const value=document.getElementById('qaValue').firstChild;
  window.v8144GameplayI18n.apply('quests');
  value.nodeValue='2.000';
  window.v8144GameplayI18n.apply('quests');
  const dynamicGerman=value.nodeValue;
  window.__qaLanguage='en';window.v8144GameplayI18n.apply('quests');
  const englishLabel=document.getElementById('qaTranslate').textContent;
  const root=document.getElementById('quests'),mo=new MutationObserver(()=>{});
  mo.observe(root,{subtree:true,characterData:true});
  window.v8144GameplayI18n.apply('quests');
  window.v8144GameplayI18n.apply('quests');
  const identicalTranslationsSkipped=mo.takeRecords().length===0;mo.disconnect();
  window.__qaLanguage='de';window.v8144GameplayI18n.apply('quests');
  const dynamicAfterSwitch=value.nodeValue;
  window.v386RenderQuestShell();
  const list=document.querySelector('#quests .v386-list'),first=list.firstElementChild;
  window.v386RenderQuestShell();
  const sameQuestCards=first===list.firstElementChild;
  window.s.quests.offers[0].title='Quest B';
  window.v386RenderQuestShell();
  const changedQuestCards=first!==list.firstElementChild&&list.textContent.includes('Quest B');
  window.v6163GrowTabs.mountNow();window.v6163GrowTabs.open('orders');
  const panel=document.getElementById('v6163Inline'),before=panel.firstElementChild;
  window.v6163GrowTabs.refresh();
  const sameOrders=before===panel.firstElementChild;
  return {dynamicGerman,dynamicAfterSwitch,englishLabel,identicalTranslationsSkipped,sameQuestCards,changedQuestCards,sameOrders};
 });
 assert.equal(ownerCheck.dynamicGerman,'2.000','German i18n reset updated dynamic stat');
 assert.equal(ownerCheck.dynamicAfterSwitch,'2.000','language switch reset current dynamic stat');
 assert.equal(ownerCheck.englishLabel,'Buy VIP','translated gameplay text not applied');
 assert.ok(ownerCheck.identicalTranslationsSkipped,'identical English text was rewritten repeatedly');
 assert.ok(ownerCheck.sameQuestCards,'identical Quest cards were remounted');
 assert.ok(ownerCheck.changedQuestCards,'changed quest offers did not rerender');
 assert.ok(ownerCheck.sameOrders,'identical server-authoritative Grow orders were remounted');
 await ownerPage.close();

 // V8.365: run the actual v492 Growroom source in an isolated Beta page.
 // Multiple identical render() calls must retain the same DOM; changed
 // server resources must rebuild; stage/timer livePaint remains functional.
 const growPage=await browser.newPage({viewport:{width:390,height:844}});
 const growErrors=[];growPage.on('pageerror',e=>growErrors.push(String(e.stack||e.message||e)));
 await growPage.setContent('<!doctype html><html><body>'+
  '<section id="grow" class="screen active"></section>'+
  '<section id="character" class="screen"></section><section id="world" class="screen"></section></body></html>');
 await growPage.evaluate(()=>{
  window.GROW_RELEASE_CHANNEL='beta';window.renderGrow=()=>{};window.seedTypes={};
  window.s={level:20,gold:1500,playerClass:'scout',grow:{
   roomLevel:1,equipment:{lamp:0,pots:0},seeds:{moss:2},
   plants:[{uid:'qa_plant',seed:'moss',start:Date.now()-20000,duration:100000,care:[false,false,false,false]}],
   v492:{selectedSeed:'moss',selectedPlantUid:'qa_plant'}
  },v488Forge:{fragments:8}};
  window.persist=()=>{};
  window.v7081UseAuthority=()=>false;
  window.GL_WEATHER={bonus:{growMul:1,yieldMul:1}};
  window.__qaRefresh=0;
  window.v6163GrowTabs={active:'orders',mountNow:()=>{},refresh:()=>{window.__qaRefresh++}};
  window.v8144GameplayI18n={apply:()=>{}};
 });
 await growPage.addScriptTag({path:path.join(process.cwd(),'js/features/grow/beta/v8009-s1-v492-growroom2.js')});
 const growOwner=await growPage.evaluate(()=>{
  const before=document.querySelector('#grow .v492-grow'),diagBefore=window.__V8365_GROW_RENDER_QA__?.();
  window.renderGrow();
  const noOpStable=before===document.querySelector('#grow .v492-grow');
  const diagNoop=window.__V8365_GROW_RENDER_QA__?.();
  window.s.grow.seeds.moss=3;
  window.renderGrow();
  const after=document.querySelector('#grow .v492-grow');
  const stockChanged=after!==before&&after.querySelector('[data-v492-seed="moss"] .stock')?.textContent==='×3';
  window.v6163GrowTabs.active='grow';
  const beforeTime=after.querySelector('[data-v492-time]')?.textContent;
  window.renderGrow();
  const liveStable=after===document.querySelector('#grow .v492-grow');
  const afterTime=after.querySelector('[data-v492-time]')?.textContent;
  return {noOpStable,stockChanged,liveStable,liveTimer:!!beforeTime&&!!afterTime,
   diagBefore,diagNoop,diagEnd:window.__V8365_GROW_RENDER_QA__?.(),refreshes:window.__qaRefresh};
 });
 assert.deepEqual(growErrors,[],'Growroom canonical renderer boot error');
 assert.ok(growOwner.noOpStable&&growOwner.stockChanged&&growOwner.liveStable&&growOwner.liveTimer,
  'V8.365 Grow source stability failed: '+JSON.stringify(growOwner));
 assert.ok(growOwner.diagNoop?.noopRenders>growOwner.diagBefore?.noopRenders&&
   growOwner.diagEnd?.fullRenders>=2&&growOwner.diagEnd?.livePaints>=1,
  'V8.365 Growroom full-vs-live render accounting failed: '+JSON.stringify(growOwner));
 await growPage.close();

  // V8.366: actual VIP owner: unchanged state retains buttons; changed
  // confirmed state must repaint the real visible control tree.
  const vipPage=await browser.newPage({viewport:{width:390,height:844}});
  const vipErrors=[];vipPage.on('pageerror',e=>vipErrors.push(String(e.stack||e.message||e)));
  await vipPage.setContent('<!doctype html><html><body><main><section id="harzDealer" class="screen active"></section></main></body></html>');
  await vipPage.evaluate(()=>{
   window.GROW_RELEASE_CHANNEL='beta';
   window.s={level:10,gold:300,harzTaler:20};
   window.v073User={id:'qa',is_anonymous:false};
   window.v073Init=async()=>{};
   window.__qaVip={ok:true,active:false,daily_harz:2,daily_fragments:1,weekly_xp_bonus_pct:10,public_visible:true};
   window.v073Db={rpc:async()=>({data:{...window.__qaVip}})};
   window.v032Go=()=>{};
   window.v8144GameplayI18n={apply:()=>{}};
   window.v7117DealerHubSync=()=>{};
   window.renderShop=()=>{};
  });
  await vipPage.addScriptTag({path:path.join(process.cwd(),'js/features/shop/beta/v8195-vip.js')});
  const vipOwner=await vipPage.evaluate(async()=>{
   await window.v8195VipRefresh(true);
   const root=document.getElementById('v8195VipPanel');
   const hero=root.querySelector('.v8195-hero');
   const button=root.querySelector('[data-v8195-buy-vip="7"]');
   const before=window.__V8366_VIP_RENDER_QA__();
   await window.v8195VipRefresh(true);
   const stillHero=root.querySelector('.v8195-hero')===hero;
   const stillButton=root.querySelector('[data-v8195-buy-vip="7"]')===button;
   const after=window.__V8366_VIP_RENDER_QA__();
   window.__qaVip={...window.__qaVip,active:true,vip_until:new Date(Date.now()+2*86400000).toISOString(),pending_chests:2};
   await window.v8195VipRefresh(true);
   const newHero=root.querySelector('.v8195-hero')!==hero;
   const updated=root.textContent.includes('VIP AKTIV')&&root.textContent.includes('2 VIP-Truhen abholen');
   const final=window.__V8366_VIP_RENDER_QA__();
   return {stillHero,stillButton,newHero,updated,before,after,final};
  });
  assert.deepEqual(vipErrors,[],'V8.366 canonical VIP renderer boot errors');
  assert.ok(vipOwner.stillHero&&vipOwner.stillButton&&vipOwner.after.noopRenders>vipOwner.before.noopRenders,
   'V8.366 identical VIP refresh remounted buttons: '+JSON.stringify(vipOwner));
  assert.ok(vipOwner.newHero&&vipOwner.updated&&vipOwner.final.fullRenders>vipOwner.after.fullRenders,
   'V8.366 changed VIP state did not update authoritative controls: '+JSON.stringify(vipOwner));
  await vipPage.close();

  // V8.367: run real V488/V7240 owners. The Nebelschmied only needs
  // its tab shell; leaving Enchant and returning to it must still work.
  const forgePage=await browser.newPage({viewport:{width:390,height:844}});
  const forgeErrors=[];forgePage.on('pageerror',e=>forgeErrors.push(String(e.stack||e.message||e)));
  await forgePage.setContent('<!doctype html><html><body><main>'+
   '<section id="forge" class="screen active"></section><section id="world" class="screen"></section>'+
   '<section id="character" class="screen"></section></main></body></html>');
  await forgePage.evaluate(()=>{
   window.GROW_RELEASE_CHANNEL='beta';
   window.s={level:30,gold:4500,inventory:[],equipment:{},v488Forge:{fragments:225}};
   window.v073User={id:'qa-forge',is_anonymous:false};
   window.v073Db={rpc:async()=>({data:{ok:true,items:[],gold:4500},error:null})};
   window.v032Go=()=>{};
   window.__qaEnchantBuilds=0;
   window.v8198EnchantForgeHtml=()=>{window.__qaEnchantBuilds++;return '<section class="v8198-enchant-shell"><button type="button" data-v8198-enchant>Verzaubern</button></section>'};
   window.v8198BindEnchantForge=()=>{};
   window.v8144GameplayI18n={apply:()=>{}};
  });
  await forgePage.addScriptTag({path:path.join(process.cwd(),'js/features/forge/beta/v8009-s1-v488-harzschmiede-core.js')});
  await forgePage.addScriptTag({path:path.join(process.cwd(),'js/beta/v7240-beta-gold-features.js')});
  const forgeOwner=await forgePage.evaluate(async()=>{
   const forge=document.getElementById('forge');
   forge.querySelector('[data-v667-tab="enchant"]').click();
   const start=!!forge.querySelector('.v8198-enchant-shell');
   const enchantBuildsBefore=window.__qaEnchantBuilds;
   await window.v7240OpenNebelforge();
   const inNebelforge=forge.classList.contains('v7240-nebel-open')&&!!forge.querySelector('#v7240Nebelforge');
   const hiddenEnchantSkipped=!forge.querySelector('.v8198-enchant-shell')&&window.__qaEnchantBuilds===enchantBuildsBefore;
   const before=window.__V8367_FORGE_QA__?.();
   forge.querySelector('[data-v667-tab="enchant"]').click();
   const restored=!!forge.querySelector('.v8198-enchant-shell')&&!forge.classList.contains('v7240-nebel-open');
   const after=window.__V8367_FORGE_QA__?.();
   return {start,inNebelforge,hiddenEnchantSkipped,restored,enchantBuildsBefore,before,after};
  });
  assert.deepEqual(forgeErrors,[],'V8.367 canonical Forge + Nebelschmied boot errors');
  assert.ok(forgeOwner.start&&forgeOwner.inNebelforge&&forgeOwner.hiddenEnchantSkipped&&forgeOwner.restored,
   'V8.367 Nebelschmied hidden Enchant view persisted or tab return failed: '+JSON.stringify(forgeOwner));
  assert.ok(forgeOwner.before?.lightNebelforgeShells>=1&&
   forgeOwner.after?.enchantPanelsBuilt>forgeOwner.before?.enchantPanelsBuilt,
   'V8.367 lightweight forge shell counters failed: '+JSON.stringify(forgeOwner));
  // V8.368: exercise the actual runic FX owner on a real Character item
  // surface, including unchanged item, changed enchant level and unenchanted.
  await forgePage.addScriptTag({path:path.join(process.cwd(),'js/features/forge/beta/v8198-enchanting.js')});
  const itemFx=await forgePage.evaluate(()=>{
   const card=document.createElement('div');
   card.className='inv-item v460-worse';
   document.getElementById('character').appendChild(card);
   const make=n=>({v8198Enchant:{level:n}});
   const paint=window.v8198ApplyItemFx;
   paint(card,make(2));
   const badge=card.querySelector(':scope > .v8198-plus-badge');
   const effect=card.querySelector(':scope > .v8198-item-fx');
   const observe=new MutationObserver(()=>{});
   observe.observe(card,{subtree:true,attributes:true,childList:true,characterData:true});
   paint(card,make(2));
   const steady=badge===card.querySelector(':scope > .v8198-plus-badge')&&
     effect===card.querySelector(':scope > .v8198-item-fx')&&
     observe.takeRecords().length===0;
   paint(card,make(3));
   const changed=card.querySelector(':scope > .v8198-plus-badge')?.textContent==='+3'&&
    card.classList.contains('v8198-e3')&&!card.classList.contains('v8198-e2');
   paint(card,make(0));
   const clean=!card.querySelector(':scope > .v8198-plus-badge')&&
    !card.querySelector(':scope > .v8198-item-fx')&&
    !card.hasAttribute('data-v8198-enchant');
   const before=window.__V8368_ITEM_FX_QA__?.();
   paint(card,make(0));
   const noopClear=window.__V8368_ITEM_FX_QA__?.().noopRenders>before.noopRenders;
   observe.disconnect();
   return {steady,changed,clean,noopClear,qa:window.__V8368_ITEM_FX_QA__?.()};
  });
  assert.ok(itemFx.steady&&itemFx.changed&&itemFx.clean&&itemFx.noopClear,
   'V8.368 item FX stable render or enchanted level transition failed: '+JSON.stringify(itemFx));
  assert.ok(itemFx.qa?.noopRenders>=2&&itemFx.qa?.fullRenders>=3,
   'V8.368 character item FX counter mismatch: '+JSON.stringify(itemFx));
  // V8.369: run the original V470 inventory comparison owner. An unchanged
  // score must retain the flag AND produce zero DOM mutation records.
  // A true comparison change or missing item must still fully update.
  await forgePage.evaluate(()=>{
   document.getElementById('character').innerHTML=
    '<div id="inventory"><div class="inventory-grid"><div class="inv-item"></div></div></div>';
   window.s.inventory=[{slot:'head',bonus:{staerke:2}}];
   window.s.equipment={head:{slot:'head',bonus:{staerke:10}}};
   window.v4103TotalCompareScore=it=>Number(it?.bonus?.staerke)||0;
  });
  await forgePage.addScriptTag({path:path.join(process.cwd(),
   'js/features/character/beta/v8009-s4-v470-character-slot-art-canonical-comparison.js')});
  const comparePaint=await forgePage.evaluate(()=>{
   const card=document.querySelector('#character #inventory .inv-item');
   const paint=window.v470PaintInventoryComparisons;
   paint();
   const initialWorse=card.classList.contains('v460-worse');
   const flag=card.querySelector('.v470-final-compare');
   const obs=new MutationObserver(()=>{});
   obs.observe(card,{attributes:true,subtree:true,childList:true,characterData:true});
   paint();
   const stable=obs.takeRecords().length===0&&flag===card.querySelector('.v470-final-compare');
   const counts=window.__V8369_COMPARE_QA__?.();
   window.s.inventory[0].bonus.staerke=20;
   paint();
   const changed=card.classList.contains('v460-better')&&
    !card.classList.contains('v460-worse')&&
    !!card.querySelector('.v470-final-compare')&&
    card.querySelector('.v470-final-compare')!==flag;
   window.s.inventory[0]=null;
   paint();
   const cleared=!card.querySelector('.v460-compare-flag')&&
    !card.classList.contains('v460-better')&&!card.classList.contains('v460-worse');
   // Server1 still takes the original remove+add and repeated title path.
   window.GROW_RELEASE_CHANNEL='server1';
   window.s.inventory[0]={slot:'head',bonus:{staerke:2}};
   paint();obs.takeRecords();
   paint();
   const server1Unchanged=obs.takeRecords().length>0;
   obs.disconnect();window.GROW_RELEASE_CHANNEL='beta';
   const causes=window.__V8374_COMPARE_REBUILDS__?.();
   return {initialWorse,stable,changed,cleared,server1Unchanged,counts,causes};
  });
  assert.ok(comparePaint.initialWorse&&comparePaint.stable&&comparePaint.changed&&
   comparePaint.cleared&&comparePaint.server1Unchanged&&comparePaint.counts?.classNoops>0&&
   comparePaint.counts?.titleNoops>0&&
   comparePaint.causes?.stable>0&&comparePaint.causes?.missingFinal>0&&
   comparePaint.causes?.changedKey>0,
   'V8.369 canonical Character compare no-op/update/Server1 regression: '+JSON.stringify(comparePaint));
  await forgePage.close();




 // V8.372: execute the original shared Dampf renderer in Chromium.
 // Beta must not cause childList replacements in completely unrelated
 // Harz-Dealer and Forge leaves; real label changes must still render.
 const dampfPage=await browser.newPage();
 dampfPage.on('pageerror',e=>errors.push('dampf: '+String(e.message||e)));
 await dampfPage.setContent('<!doctype html><html><body>'+
  '<div id="resources">Energie <b id="energy">old</b></div>'+
  '<section id="quests"><span id="qaQuest">⚡ Energie 3</span></section>'+
  '<button id="v026RefillBtn">Refill</button>'+
  '<section id="forge"><span class="v488-leg">Legendär</span></section>'+
  '<section id="harzDealer"><span class="v567-pack-main">Harz Paket</span></section>'+
  '<span id="qaDynamic">Energie 7</span></body></html>');
 await dampfPage.evaluate(()=>{
  window.GROW_RELEASE_CHANNEL='beta';
  window.s={energy:91};window.__renderCalls=0;
  window.render=function(){window.__renderCalls++};
  window.v026PaintDampf=function(){};
 });
 await dampfPage.addScriptTag({path:path.join(process.cwd(),'js/features/anonymous-extracted/beta/anon-0002.js')});
 const dampfResult=await dampfPage.evaluate(()=>{
  const target=[document.querySelector('.v488-leg'),document.querySelector('.v567-pack-main')];
  const observer=new MutationObserver(()=>{});
  observer.observe(document.body,{subtree:true,childList:true});
  render();render();render();
  const betaWrites=observer.takeRecords().filter(r=>target.includes(r.target)).length;
  document.getElementById('qaDynamic').textContent='Energie 9';
  render();
  const dynamicText=document.getElementById('qaDynamic').textContent;
  s.energy=142;v026PaintDampf();
  const energyText=document.getElementById('energy').textContent;
  observer.takeRecords();
  window.GROW_RELEASE_CHANNEL='server1';
  render();
  const legacyWrites=observer.takeRecords().filter(r=>target.includes(r.target)).length;
  observer.disconnect();
  return {betaWrites,legacyWrites,dynamicText,energyText,questText:document.getElementById('qaQuest').textContent};
 });
 assert.equal(dampfResult.betaWrites,0,'V8.372 Beta Dampf pass still replaces unrelated labels');
 assert.ok(dampfResult.legacyWrites>=2,'V8.372 Server1 historical Dampf writes changed');
 assert.equal(dampfResult.dynamicText,'Dampf 9','V8.372 dynamic Energie label is not converted');
 assert.equal(dampfResult.energyText,'💨 142/300','V8.372 Dampf balance did not refresh');
 assert.ok(dampfResult.questText.includes('Dampf'),'V8.372 Quest energy localization lost');
 await dampfPage.close();

 // Original rarity owner: unchanged label keeps its text node, but a real
 // quality change still replaces it. Server1 retains the legacy behavior.
 const rarityPage=await browser.newPage();
 rarityPage.on('pageerror',e=>errors.push('rarity: '+String(e.message||e)));
 await rarityPage.setContent('<!doctype html><html><body><section id="character">'+
  '<div id="inventory"><div class="inventory-grid"><div class="inv-item" data-v459-index="0">'+
  '<span class="rarity-badge">Episch</span></div></div></div></section></body></html>');
 await rarityPage.evaluate(()=>{
  window.GROW_RELEASE_CHANNEL='beta';
  window.s={inventory:[{name:'Prüfitem',quality:'purple'}],equipment:{}};
 });
 await rarityPage.addScriptTag({path:path.join(process.cwd(),'js/features/character/beta/v8009-s8-v684-inventory-rarity-final-core.js')});
 const rarityResult=await rarityPage.evaluate(()=>{
  const badge=document.querySelector('.rarity-badge');
  const observer=new MutationObserver(()=>{});
  observer.observe(badge,{childList:true});
  window.v240RepairInventoryRarity();window.v240RepairInventoryRarity();
  const identical=observer.takeRecords().length;
  s.inventory[0].quality='orange';
  window.v240RepairInventoryRarity();
  const changed=observer.takeRecords().length;
  const value=badge.textContent;
  window.GROW_RELEASE_CHANNEL='server1';
  window.v240RepairInventoryRarity();
  const legacy=observer.takeRecords().length;
  observer.disconnect();
  return {identical,changed,value,legacy};
 });
 assert.equal(rarityResult.identical,0,'V8.372 original rarity owner still rewrites same label on Beta');
 assert.ok(rarityResult.changed>=1&&rarityResult.value==='Legendär','V8.372 rarity change was suppressed');
 assert.ok(rarityResult.legacy>=1,'V8.372 Server1 original rarity logic changed');
 await rarityPage.close();


 // V8.373: authentic inventory V468 set-marker owner keeps node identity
 // across renders and updates/removes it when underlying item state changes.
 const markerPage=await browser.newPage();
 markerPage.on('pageerror',e=>errors.push('v468: '+String(e.message||e)));
 await markerPage.setContent('<!doctype html><html><body><section id="character" class="active"><div id="inventory">'+
   '<div class="inventory-grid"><div class="inv-item"><div class="v459-inv-icon"></div></div></div>'+
   '</div></section></body></html>');
 await markerPage.evaluate(()=>{
   window.GROW_RELEASE_CHANNEL='beta';window.s={inventory:[{name:'Set-Item',quality:'purple',setId:'set-a'}]};
   window.renderInventory=()=>{};window.v466ItemArtUri=()=>'';window.v459CompactInventory=()=>{};
 });
 await markerPage.addScriptTag({path:path.join(process.cwd(),'js/features/items/beta/v8009-s13-v468-single-item-art-owner.js')});
 const markerResult=await markerPage.evaluate(()=>{
   const card=document.querySelector('.inv-item'),first=card.querySelector('.v466-set-mark');
   const obs=new MutationObserver(()=>{});obs.observe(card,{subtree:true,childList:true});
   renderInventory();renderInventory();
   const stable=!!first&&card.querySelector('.v466-set-mark')===first&&obs.takeRecords().length===0;
   s.inventory[0].quality='cyan';renderInventory();
   const upgraded=card.querySelector('.v466-set-mark')===first&&first.textContent==='MYTHIC SET';
   obs.takeRecords();delete s.inventory[0].setId;renderInventory();
   const removed=!card.querySelector('.v466-set-mark')&&obs.takeRecords().length>0;
   s.inventory[0].setId='set-a';renderInventory();obs.takeRecords();
   window.GROW_RELEASE_CHANNEL='server1';renderInventory();
   const legacy=obs.takeRecords().length>=2;
   obs.disconnect();return{stable,upgraded,removed,legacy};
 });
 assert.ok(markerResult.stable&&markerResult.upgraded&&markerResult.removed&&markerResult.legacy,
  'V8.373 original V468 set marker stable/update/removal/Server1: '+JSON.stringify(markerResult));
 await markerPage.close();

 // V8.373: original V533 empty-slot owner preserves placeholder node identity.
 // A real filter change must add/remove placeholders; Server1 still rebuilds.
 const emptyPage=await browser.newPage();
 emptyPage.on('pageerror',e=>errors.push('v533: '+String(e.message||e)));
 await emptyPage.setContent('<!doctype html><html><body><section id="character" class="active">'+
   '<div class="card"><div id="inventory"><div class="inventory-grid">'+
   '<div class="inv-item">Item</div></div></div></div></section></body></html>');
 await emptyPage.evaluate(()=>{
   window.GROW_RELEASE_CHANNEL='beta';window.s={inventory:[{name:'Helm',slot:'head'}]};
 });
 await emptyPage.addScriptTag({path:path.join(process.cwd(),'js/features/character/beta/v8009-s7-v533-inventory-reference.js')});
 const emptyResult=await emptyPage.evaluate(()=>{
   const grid=document.querySelector('.inventory-grid');
   v533ApplyInventory();
   const before=[...grid.querySelectorAll(':scope > .v533-empty-slot')];
   const obs=new MutationObserver(()=>{});obs.observe(grid,{childList:true,subtree:true});
   v533ApplyInventory();v533ApplyInventory();
   const stable=before.length===5&&before.every((x,i)=>grid.querySelectorAll(':scope > .v533-empty-slot')[i]===x)&&obs.takeRecords().length===0;
   const btn=grid.querySelector('[data-v533-filter="weapon"]');btn.click();
   const filtered=grid.querySelectorAll(':scope > .v533-empty-slot').length===6;
   obs.takeRecords();v533ApplyInventory();
   const filteredStable=obs.takeRecords().length===0;
   window.GROW_RELEASE_CHANNEL='server1';v533ApplyInventory();
   const legacy=obs.takeRecords().length>0;
   obs.disconnect();return{stable,filtered,filteredStable,legacy};
 });
 assert.ok(emptyResult.stable&&emptyResult.filtered&&emptyResult.filteredStable&&emptyResult.legacy,
  'V8.373 original V533 empty-slot stable/filter/Server1 regression: '+JSON.stringify(emptyResult));
 await emptyPage.close();

 // V8.374: the original V686 pet button placement is a repeated synchronous
 // book installation hook. Beta must keep already ordered button DOM nodes
 // untouched, reorder only after a real displacement, Server1 keeps old moves.
 const bookPage=await browser.newPage();
 bookPage.on('pageerror',e=>errors.push('v686-book: '+String(e.message||e)));
 await bookPage.setContent('<!doctype html><html><body><section id="character" class="active">'+
  '<div class="v514-book-host"><button id="v106BookBtn">Illegales Buch</button>'+
  '<button id="v686PetAlbumBtn"><span class="info">Pets</span></button></div></section></body></html>');
 await bookPage.evaluate(()=>{
  window.GROW_RELEASE_CHANNEL='beta';window.s={};
  window.v106InstallBook=function(){return true};
 });
 await bookPage.addScriptTag({path:path.join(process.cwd(),
  'js/features/pets/beta/v8009-s1-v686-pet-album-core.js')});
 const bookResult=await bookPage.evaluate(async()=>{
  const host=document.querySelector('.v514-book-host');
  const book=document.getElementById('v106BookBtn'),pet=document.getElementById('v686PetAlbumBtn');
  const obs=new MutationObserver(()=>{});obs.observe(host,{childList:true});
  v106InstallBook();await Promise.resolve();v106InstallBook();await Promise.resolve();
  const stable=obs.takeRecords().length===0&&host.firstElementChild===book&&book.nextElementSibling===pet;
  host.insertBefore(pet,book);obs.takeRecords();
  v106InstallBook();await Promise.resolve();
  const fixed=host.firstElementChild===book&&book.nextElementSibling===pet&&obs.takeRecords().length>0;
  window.GROW_RELEASE_CHANNEL='server1';v106InstallBook();await Promise.resolve();
  const legacy=obs.takeRecords().length>=2;
  obs.disconnect();return{stable,fixed,legacy};
 });
 assert.ok(bookResult.stable&&bookResult.fixed&&bookResult.legacy,
  'V8.374 original V686 stable book-host/fix displaced pair/Server1: '+JSON.stringify(bookResult));
 await bookPage.close();

 // V8.375: browser-execute the authentic renderInventory() from the
 // V8009 core (not a reimplementation) with minimal surrounding game state.
 // Identical state must preserve each card and its flags across base renders.
 const coreSrc=fs.readFileSync(path.join(process.cwd(),
  'js/features/core/beta/v8009-a1-legacy-state-core.js'),'utf8');
 const coreStart=coreSrc.indexOf('/* V8.375 Beta: canonical inventory render');
 const coreEnd=coreSrc.indexOf('\nfunction render(){regenEnergy();',coreStart);
 assert.ok(coreStart>0&&coreEnd>coreStart,'V8.375 original inventory renderer block not found');
 const corePage=await browser.newPage();
 corePage.on('pageerror',e=>errors.push('v8375-inventory: '+String(e.message||e)));
 await corePage.setContent('<!doctype html><html><body>'+
  '<div id="invCount"></div><div id="inventory"></div></body></html>');
 await corePage.evaluate(()=>{
  window.GROW_RELEASE_CHANNEL='beta';
  window.s={level:50,playerClass:'warrior',inventory:[
   {slot:'head',name:'Test Helm',icon:'🪖',bonus:{staerke:2},price:10}
  ],equipment:{head:{slot:'head',name:'Alter Helm',bonus:{staerke:10}}}};
  window.normalizeItem=it=>it;
  window.itemBonus=it=>String(it?.bonus?.staerke??0);
  window.sellValue=it=>Number(it?.price||0);
  window.comparison=it=>'<span class="worse">'+
   ((Number(it?.bonus?.staerke)||0)-(Number(window.s.equipment?.head?.bonus?.staerke)||0))+'</span>';
 });
 await corePage.addScriptTag({content:coreSrc.slice(coreStart,coreEnd)});
 const coreInventory=await corePage.evaluate(()=>{
  const box=document.getElementById('inventory'),paint=window.renderInventory;
  const getCard=()=>box.querySelector('.inv-item');
  paint();const initial=getCard();
  const originalMarker=document.createElement('div');originalMarker.className='v470-final-compare';
  initial.appendChild(originalMarker);
  const obs=new MutationObserver(()=>{});obs.observe(box,{childList:true,subtree:true,characterData:true});
  paint();const stable=obs.takeRecords().length===0&&getCard()===initial&&
   getCard().querySelector('.v470-final-compare')===originalMarker;
  window.s.equipment.head.bonus.staerke=20;paint();
  const equipmentUpdate=obs.takeRecords().length>0&&getCard()!==initial&&
   getCard().querySelector('.compare').textContent.includes('-18');
  const second=getCard();
  window.s.inventory[0].bonus.staerke=7;paint();
  const itemUpdate=obs.takeRecords().length>0&&getCard()!==second;
  window.s.inventory.push({slot:'ring',name:'Zweiter Ring',icon:'💍',bonus:{staerke:2},price:15});
  paint();const listUpdate=box.querySelectorAll('.inv-item').length===2;
  box.replaceChildren();paint();const recovered=box.querySelectorAll('.inv-item').length===2;
  window.GROW_RELEASE_CHANNEL='server1';const legacyBefore=getCard();
  paint();const legacy=getCard()!==legacyBefore;
  obs.disconnect();
  return {stable,equipmentUpdate,itemUpdate,listUpdate,recovered,legacy,
   metrics:window.__V8375_INVENTORY_CORE_QA__?.()};
 });
 assert.ok(coreInventory.stable&&coreInventory.equipmentUpdate&&coreInventory.itemUpdate&&
  coreInventory.listUpdate&&coreInventory.recovered&&coreInventory.legacy&&
  coreInventory.metrics?.noops>=1&&coreInventory.metrics?.fullRenders>=4,
  'V8.375 authentic core inventory stable/change/reset/Server1: '+JSON.stringify(coreInventory));
 await corePage.close();

 assert.ok(errors.length===0,errors.join('; '));
 fs.mkdirSync('qa/reports',{recursive:true});
 fs.writeFileSync('qa/reports/v8315-per-page-browser.json',JSON.stringify({
  type:'synthetic-instrumentation-validation',world,manual,automatic:sweep,allTabs,linked,qaCenter:{network:qaCenter.result.qaCenter.network,counts:qaCenter.result.qaCenter.counts}
 },null,2)+'\n');
 await page.screenshot({path:'qa/reports/v8315-per-page-browser.png',fullPage:false});
 console.log(JSON.stringify({pass:true,manualWorld:{
   currentReplacements:world.aktuellesReplacements,
   visibilityChanges:world.visibilityChanges,renderMarks:world.renderMarks
 },automatic:{screens:sweep.totalScreens,passed:sweep.sweepDone,ids:sweep.pages.map(x=>x.screen)},
 allTabs:{screens:allTabs.sweepDone,tabs:allTabs.tabSweepDone,skipped:allTabs.tabSkipped.length},
 scopedMutations:{before:scopeStart,after:scopeEnd},linked:{screens:linked.sweepDone,goldShop:linked.linkedScreens},
 qaCenter:{networkErrors:qaCenter.result.qaCenter.network.errors,findings:qaCenter.result.qaCenter.findings.length},
 pageErrors:errors.length},null,2));
}catch(e){
 console.error('V8.315 page recorder browser integration FAILED',e.stack||String(e));
 process.exitCode=1;
}finally{await browser.close();}
