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
  window.fetch=async()=>new Response('simulated failure',{status:503});
  document.querySelector('#character [data-tab="materials"]').addEventListener('click',
   ()=>{void fetch('/rest/v1/qa_probe?secret=never_export')},{once:true});
  const result=await GL_PAGE_AUDIT.sweep({ids:['character'],dwellMs:170,
   tabDwellMs:250,includeTabs:true,extended:true});
  const restored=window.fetch!==originalFetch&&window.fetch.name!=='wrappedFetch';
  window.fetch=originalFetch;
  return {result,restored};
 });
 assert.equal(qaCenter.restored,true,'opt-in fetch instrumentation was not restored');
 assert.equal(qaCenter.result.version,'V8.364','QA Center version missing');
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
  return {dynamicGerman,dynamicAfterSwitch,sameQuestCards,changedQuestCards,sameOrders};
 });
 assert.equal(ownerCheck.dynamicGerman,'2.000','German i18n reset updated dynamic stat');
 assert.equal(ownerCheck.dynamicAfterSwitch,'2.000','language switch reset current dynamic stat');
 assert.ok(ownerCheck.sameQuestCards,'identical Quest cards were remounted');
 assert.ok(ownerCheck.changedQuestCards,'changed quest offers did not rerender');
 assert.ok(ownerCheck.sameOrders,'identical server-authoritative Grow orders were remounted');
 await ownerPage.close();
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
