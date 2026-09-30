import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const {chromium}=await import(process.env.GROW_HOME_PLAYWRIGHT||'playwright');
const root=process.cwd();
const file=p=>path.join(root,p);
const html=fs.readFileSync(file('beta.html'),'utf8');
const grant=html.match(/function v271SyncDampfEvent\(\)\{[\s\S]*?\n\}\n\nfunction v271PaintDampf/)[0].split('\n\nfunction v271PaintDampf')[0];
const browser=await chromium.launch({headless:true});
const checks=[];
const errors=[];

async function fixture(time,{quiet=0,channel='beta',helper=true,playerClass='grower',renderer=file('js/features/home/beta/v8009-home-renderer.js')}={}){
 const page=await browser.newPage({viewport:{width:390,height:844}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date(time)});
 await page.setContent('<!doctype html><html><head><style id="legacy-version-css">html body .app > header .v366-ver::after{content:"V8.001"!important}</style></head><body><div class="app"><header></header><main><div id="world" class="active"></div><div id="quests"></div></main></div></body></html>');
 await page.evaluate(({quiet,channel,playerClass})=>{
  window.GROW_RELEASE_CHANNEL=channel;
  window.s={characterName:'QA',playerClass:'grower',level:30,xp:5,energy:60,gold:200,harzTaler:10,points:0,skillPoints:0,attrs:{},equipment:{},quests:{offers:[]},grow:{plants:[]},social:{playerId:'qa-a'}};
  s.playerClass=playerClass;
  window.v073User={id:'qa-a'};
  window.classSets={};
  window.v093Events=[];window.v271EventDataReady=false;
  window.qa={quests:0,gold:0,xp:0,paints:0,persists:0,bossOpens:0,intervals:0,nav:[],goldShop:0};
  window.qaQuietUntil=Date.now()+quiet;
  window.v7204StartupQuietRemaining=()=>Math.max(0,qaQuietUntil-Date.now());
  window.v7204StartupQuiet=()=>v7204StartupQuietRemaining()>0;
  const nativeInterval=window.setInterval.bind(window);
  window.setInterval=(...args)=>{qa.intervals++;return nativeInterval(...args)};
  window.v094XpEventActive=()=>false;window.v274GoldEventActive=()=>false;
  window.v271DampfEventActive=()=>false;window.v271ActiveDampfEvent=()=>null;
  window.v110MysticEventActive=()=>false;window.v120ActiveWorldBossEvent=()=>null;
  window.v271DampfCap=()=>v271DampfEventActive()?300:100;
  window.v271PaintDampf=()=>{qa.paints++;s.energy=Math.min(v271DampfCap(),s.energy)};
  window.v093LoadPublicContent=async()=>true;
  window.persist=()=>{qa.persists++};window.v063Toast=()=>{};
  window.renderQuests=()=>{qa.quests++};
  window.v276DecorateGold=()=>{qa.gold++};window.v095DecorateXp=()=>{qa.xp++};
  window.v032Go=id=>{qa.nav.push(String(id||''))};window.v7114OpenGoldShop=()=>{qa.goldShop++};window.v085InstallWorld=()=>{};window.v085WorldHtml=()=>'';
  window.v110Open=()=>{qa.bossOpens++};
  window.vTowerWednesdayEventInfo=()=>({active:new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Berlin',weekday:'short'}).format(new Date())==='Wed',name:'Mutationssturm',icon:'🧬'});
 },{quiet,channel,playerClass});
 await page.addScriptTag({content:grant});
 await page.addScriptTag({path:renderer});
 await page.addScriptTag({path:file('js/features/events/beta/v8009-weekend-events.js')});
 if(helper)await page.addScriptTag({path:file('js/system/performance/v7288-home-adaptive-fit-script.js')});
 return page;
}

async function state(page){
 return page.evaluate(()=>({
  labels:[...document.querySelectorAll('.v6115-event-row b')].map(x=>x.textContent),
  cards:document.querySelectorAll('.v690-events-card').length,
  empty:document.querySelectorAll('.v6115-no-events').length,
  bossDisabled:document.querySelector('[data-boss]')?.disabled,
  bossGoal:document.querySelector('.v366-goals .v366-goal:nth-child(3) span')?.textContent,
  currentCount:document.querySelector('.v690-current-title small')?.textContent,
  energy:s.energy,xp:s.xp,gold:s.gold,harz:s.harzTaler,qa:{...qa},
  renderer:window.v8009HomeEventDiagnostics?.(),scheduler:window.v8009HomeEventSchedulerDiagnostics?.(),
  sameWorld:window.qaWorld===document.querySelector('.v366-world'),
  sameHero:window.qaHero===document.querySelector('.v366-hero')
 }));
}

try{
 // Use the real per-character Dampf grant. UI coalescing must not delay it.
 const startup=await fixture('2026-09-18T08:00:00+02:00',{quiet:2000});
 assert.equal((await state(startup)).energy,300,'Dampf grant must happen before UI quiet ends');
 await startup.evaluate(()=>{
  s.energy=230;
  for(let i=0;i<10;i++)v6251ApplyAutomaticWeekendEvents({redraw:true});
  window.dispatchEvent(new Event('growlegends:account-ready'));
 });
 assert.equal((await state(startup)).energy,230,'Repeated signals must not refill the same grant');
 await startup.clock.runFor(1800);
 await startup.evaluate(()=>{qaQuietUntil=Date.now()+2200});
 await startup.clock.runFor(1700);
 assert.equal((await state(startup)).scheduler.uiRuns,0,'An extended loading gate must keep UI deferred');
 await startup.clock.runFor(1000);
 let st=await state(startup);
 assert.equal(st.scheduler.uiRuns,1,'Startup signals should produce one UI refresh');
 assert.equal(st.qa.intervals,0,'The event owner must not install polling');
 assert.deepEqual(st.labels,['GOLD EVENT','300 DAMPF EVENT']);
 assert.equal(st.cards,1);
 await startup.clock.runFor(60000);
 assert.equal((await state(startup)).scheduler.uiRuns,1,'Idle time must not run the retired poll');
 await startup.evaluate(()=>{
  s={...s,energy:60,v271DampfEventGrantKey:'',social:{playerId:'qa-b'}};
  v073User={id:'qa-b'};
  window.dispatchEvent(new Event('growlegends:account-ready'));
 });
 assert.equal((await state(startup)).energy,300,'A newly hydrated account gets its own grant immediately');
 checks.push('startup coalescing, extended quiet, immediate once-per-account Dampf grant, no idle poll');
 await startup.close();

 const boundaries=[
  ['2026-09-24T23:59:59+02:00',['EXP EVENT','SMARAGD KOLOSS'],false,true],
  ['2026-09-27T23:59:59+02:00',[],true,true],
  ['2026-09-29T23:59:59+02:00',['TURM-ANOMALIE'],true,true],
  ['2026-09-30T23:59:59+02:00',[],true,true],
  ['2026-09-17T23:59:59+02:00',['GOLD EVENT','300 DAMPF EVENT'],true,false],
  ['2026-09-20T23:59:59+02:00',[],true,false]
 ];
 for(const [date,expected,closed,preserve] of boundaries){
  const page=await fixture(date);
  await page.clock.runFor(300);
  await page.evaluate(()=>{window.qaWorld=document.querySelector('.v366-world');window.qaHero=document.querySelector('.v366-hero')});
  const before=await state(page);
  await page.clock.runFor(1700);
  const after=await state(page);
  assert.deepEqual(after.labels,expected,date+' event labels');
  assert.equal(after.cards,1,date+' single event card');
  assert.equal(after.empty,expected.length?0:1,date+' empty-state count');
  assert.equal(after.currentCount,expected.length?`${expected.length} aktiv`:'Alles ruhig');
  assert.equal(after.bossDisabled,closed,date+' worldboss availability');
  if(preserve){
   assert.equal(after.sameWorld,true,date+' preserve home root');
   assert.equal(after.sameHero,true,date+' preserve hero');
   assert.equal(after.renderer.fullRenders,before.renderer.fullRenders,date+' no full event-only repaint');
  }
  assert.equal(after.xp,5);assert.equal(after.gold,200);assert.equal(after.harz,10);
  if(!closed){
   await page.evaluate(()=>document.querySelector('[data-boss]').click());
   assert.equal((await state(page)).qa.bossOpens,1,'Patched worldboss button must retain its handler');
  }
  if(expected.includes('300 DAMPF EVENT'))assert.equal(after.energy,300);
  if(date==='2026-09-20T23:59:59+02:00')assert.equal(after.energy,100,'Dampf expiry must retain the canonical clamp');
  checks.push('boundary '+date+' -> '+(expected.join(', ')||'no event')+(preserve?' (home retained)':''));
  await page.close();
 }

 const dst=await fixture('2026-10-23T00:01:00+02:00');
 assert.equal((await state(dst)).scheduler.nextBoundaryAt,Date.parse('2026-10-26T00:00:00+01:00'),'DST weekend must end at Berlin midnight, after 73 hours');
 checks.push('Berlin DST boundary');
 await dst.close();

 const resume=await fixture('2026-09-24T12:00:00+02:00');
 await resume.clock.runFor(300);
 const oldRuns=(await state(resume)).scheduler.uiRuns;
 await resume.evaluate(()=>{
  window.qaHidden=true;
  Object.defineProperty(document,'hidden',{get:()=>qaHidden,configurable:true});
  document.dispatchEvent(new Event('visibilitychange'));
 });
 assert.equal((await state(resume)).scheduler.pendingBoundaryTimer,false);
 await resume.clock.setSystemTime(new Date('2026-09-25T12:00:00+02:00'));
 await resume.clock.runFor(5000);
 assert.equal((await state(resume)).scheduler.uiRuns,oldRuns,'No hidden UI work');
 await resume.evaluate(()=>{
  qaHidden=false;document.dispatchEvent(new Event('visibilitychange'));
  window.dispatchEvent(new Event('growlegends:foreground-ready'));
 });
 await resume.clock.runFor(300);
 st=await state(resume);
 assert.deepEqual(st.labels,['EXP EVENT','SMARAGD KOLOSS']);
 assert.equal(st.scheduler.uiRuns,oldRuns+1,'Resume signals must coalesce');
 assert.equal(st.scheduler.pendingBoundaryTimer,true);
 checks.push('background suspension and current events on resume');
 await resume.close();

 const progress=await fixture('2026-09-25T12:00:00+02:00');
 await progress.clock.runFor(300);
 await progress.evaluate(()=>{
  window.qaHero=document.querySelector('.v366-hero');
  s.xp=9;s.gold=350;s.energy=50;
  v085InstallWorld(false);
 });
 st=await state(progress);
 assert.equal(st.sameHero,false,'Real character changes must still render the home');
 assert.equal(st.xp,9);assert.equal(st.gold,350);assert.equal(st.energy,50);
 assert.match(await progress.locator('.v366-xptxt').textContent(),/^9 \/ /);
 checks.push('real character/resource changes still render immediately');
 await progress.close();

 const routes=await fixture('2026-09-30T12:00:00+02:00',{helper:false});
 await routes.locator('.v366-topbar [data-plus="gold"]').click();
 await routes.locator('.v366-topbar [data-head="mail"]').click();
 const routeState=await routes.evaluate(()=>({goldShop:qa.goldShop,nav:[...qa.nav],diag:window.v8009HomeEventDiagnostics?.()}));
 assert.equal(routeState.goldShop,1,'Gold+ must be owned directly by the beta header renderer');
 assert.ok(routeState.nav.includes('mail'),'Mail icon must open Nebel-Post directly');
 assert.ok(!routeState.nav.includes('shop')&&!routeState.nav.includes('friends'),'Retired legacy header routes must not fire');
 assert.equal(routeState.diag?.goldDirectOpens,1);
 assert.equal(routeState.diag?.mailDirectOpens,1);
 checks.push('home header owns Gold+ and Nebel-Post routes without helper capture');
 await routes.close();

 const canonical=await fixture('2026-09-30T12:00:00+02:00',{playerClass:'frost',helper:false});
 await canonical.evaluate(()=>{
  const done=()=>({gem:{id:'g'},enchant:{id:'e'}});
  s.equipment={head:done(),weapon:done(),weapon2:{},ring:done(),body:done(),boots:done(),amulet:done()};
  GL_WEATHER={kind:'rain',icon:'🌧️',label:'Regen',temp:17,bonus:{text:'Schnelleres Wachstum',growMul:1.30}};
  const now=Date.now();
  s.grow={plants:[
   {start:now-900,duration:1000},
   {start:now-100,duration:1000}
  ]};
  v085InstallWorld(false);
 });
 const canonicalState=await canonical.evaluate(()=>{
  const rows=[...document.querySelectorAll('.vHome-check-row[data-char-tab="materials"]')];
  const enchant=rows.find(r=>/verzaubert/i.test(r.querySelector('span')?.textContent||''))?.querySelector('b')?.textContent;
  const gem=rows.find(r=>/stein|gesockelt/i.test(r.querySelector('span')?.textContent||''))?.querySelector('b')?.textContent;
  return {
   enchant,gem,
   growCard:document.querySelector('.v366-card.grow .v366-status b')?.textContent,
   growStrip:document.querySelector('#v492HomeGrowStatus b')?.textContent,
   snapshot:window.v8009HomeGrowSnapshot?.()
  };
 });
 assert.equal(canonicalState.enchant,'6/7','Frost checklist must include weapon2 in canonical renderer');
 assert.equal(canonicalState.gem,'6/7','Frost gem checklist must include weapon2 in canonical renderer');
 assert.equal(canonicalState.growCard,'1 Pflanze erntereif','Weather-aware readiness must be correct before helper patches');
 assert.equal(canonicalState.growStrip,'🌱 Growroom · 2 Pflanzen aktiv · 1 erntereif','Grow strip must show active and ready plants directly');
 assert.deepEqual({active:canonicalState.snapshot.active,ready:canonicalState.snapshot.ready},{active:2,ready:1});
 checks.push('canonical renderer owns Frost 7-slot checklist and weather-aware Growroom status');
 await canonical.close();
 const versionOwner=await fixture('2026-09-30T12:00:00+02:00',{helper:false});
 await versionOwner.evaluate(()=>{
  const legacy=document.createElement('div');legacy.id='topVersion';legacy.textContent='SERVER-VERSION-SENTINEL';document.body.appendChild(legacy);
  window.v032Go('world');
 });
 await versionOwner.clock.runFor(100);
 await versionOwner.evaluate(()=>{
  window.dispatchEvent(new Event('pageshow'));
  window.dispatchEvent(new Event('growlegends:account-ready'));
 });
 const versionState=await versionOwner.evaluate(()=>({
  header:document.querySelector('.v366-ver')?.textContent,
  visible:getComputedStyle(document.querySelector('.v366-ver'),'::after').content,
  styleCount:document.querySelectorAll('#v8009-home-beta-version').length,
  legacy:document.getElementById('topVersion')?.textContent,
  diag:window.v8009HomeEventDiagnostics?.()
 }));
 assert.equal(versionState.header,'V8.009','Canonical beta header must own the current build label');
 assert.equal(versionState.visible,'"V8.009"','Canonical renderer must override historical V8.001 pseudo-element CSS');
 assert.equal(versionState.styleCount,1,'Version override style must be installed exactly once');
 assert.equal(versionState.legacy,'SERVER-VERSION-SENTINEL','Home renderer must not rewrite unrelated legacy version nodes');
 assert.equal(versionState.diag?.version,'V8.009-HOME-18');
 assert.equal(versionState.diag?.versionStyleInstalls,1);
 checks.push('canonical home renderer owns visible V8.009 style without lifecycle rewrites');
 await versionOwner.close();
 const stable=await fixture('2026-09-18T12:00:00+02:00',{channel:'stable',helper:false});
 const isolated=await stable.evaluate(()=>({scheduler:window.__V6251_AUTO_WEEKEND_EVENTS__,renderer:window.v8009HomeEventDiagnostics,energy:s.energy,content:document.getElementById('world').innerHTML}));
 assert.deepEqual(isolated,{scheduler:undefined,renderer:undefined,energy:60,content:''});
 checks.push('beta owner guards leave stable state and DOM untouched');
 await stable.close();

 if(process.env.GROW_HOME_BASELINE_RENDERER){
  const markup=page=>page.evaluate(()=>document.querySelector('.v366-world').innerHTML.replace(/>\s+</g,'><').trim());
  for(const playerClass of ['grower','scout','bruiser','frost','summoner']){
   for(const date of ['2026-09-30T12:00:00+02:00','2026-09-18T12:00:00+02:00','2026-09-25T12:00:00+02:00']){
    const before=await fixture(date,{playerClass,renderer:process.env.GROW_HOME_BASELINE_RENDERER});
    const after=await fixture(date,{playerClass});
    await before.clock.runFor(300);await after.clock.runFor(300);
    assert.equal(await markup(after),await markup(before),`${playerClass} ${date} existing home markup`);
    await before.close();await after.close();
   }
  }
  checks.push('existing home markup matches HOME-13 for five classes across Wednesday and both weekend pairs');
 }

 assert.deepEqual(errors,[],'No browser errors');
 console.log(JSON.stringify({ok:true,checks,browserErrors:errors},null,2));
}finally{
 await browser.close();
}
