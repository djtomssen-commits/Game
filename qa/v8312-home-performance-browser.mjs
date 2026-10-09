// V8.312 browser regression for the real Home renderer and shipped CSS.
// Headless Chromium is not the Android WebView and cannot certify a live FPS improvement.
import assert from 'node:assert/strict';
import path from 'node:path';
import {readFileSync} from 'node:fs';
const {chromium}=await import('playwright');
const root=process.cwd();
const file=p=>path.join(root,p);
const browser=await chromium.launch({headless:true});
const failures=[];
const scenarios=[];
async function run(channel){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  page.on('pageerror',e=>failures.push(channel+': '+e.message));
  await page.setContent('<!doctype html><html><head></head><body><div class="app"><header></header><main><div id="world" class="active"></div><div id="quests"></div></main></div></body></html>');
  await page.evaluate(channel=>{
    window.GROW_RELEASE_CHANNEL=channel;
    window.s={characterName:'PerformanceQA',playerClass:'grower',level:30,xp:5,energy:60,
      gold:200,harzTaler:10,points:0,skillPoints:0,attrs:{},equipment:{},quests:{offers:[]},
      grow:{plants:[]},social:{playerId:'perf-qa'}};
    window.v073User={id:'perf-qa'};
    window.classSets={};
    window.v093Events=[];
    window.v093LoadPublicContent=async()=>true;
    window.v094XpEventActive=()=>false;
    window.v274GoldEventActive=()=>false;
    window.v271DampfEventActive=()=>false;
    window.v271ActiveDampfEvent=()=>null;
    window.v271DampfCap=()=>100;
    window.v110MysticEventActive=()=>true;
    window.v120ActiveWorldBossEvent=()=>({active:true});
    window.v110ResetDay=()=>{};
    window.v110Open=()=>{};
    window.v032Go=()=>{};
    window.v080AvatarFor=()=>'/assets/fake-avatar.png';
    window.v081DungeonPosition=()=>({dungeonNumber:2,enemyNumber:4});
    window.v6104PetUnseen=()=>0;
    window.v085InstallWorld=()=>{};
    window.v085WorldHtml=()=>{};
    window.v6239WeeklyChestSignature=()=> 'qa-weekly';
    window.v6239WeeklyChestHomeHtml=()=> '<div class="v6239-weekly-chest"></div>';
    window.v6239OpenWeeklyChest=()=>{};
    window.v106OpenBook=()=>{};
    window.v488OpenForge=()=>{};
    window.v8144GameplayI18n={apply(){}};
  },channel);
  for(const stylesheet of [
    'v8009-extracted-v366-world-reference-rebuild-css.css',
    'v8009-extracted-v523-approved-home-comic-css.css',
    'v8009-extracted-v524-approved-home-strong-css.css',
    'v8009-extracted-v690-world-wood-comic-css.css',
    'v8009-extracted-v6118-event-x2-worldboss-design-css.css',
    'v8009-extracted-v6123-worldboss-slot-feinschliff-css.css',
    'css/features/events/beta/v8306-growcup-home-results.css'
  ])await page.addStyleTag({path:file(stylesheet)});
  await page.addScriptTag({path:file('js/features/home/beta/v8009-home-renderer.js')});
  await page.waitForSelector('#world .v366-world');
  const baseline=await page.evaluate(()=>({
    hero:document.querySelector('#world .v366-hero'),
    full:window.v8009HomeEventDiagnostics().fullRenders
  })).catch(()=>null);
  assert.ok(baseline,channel+' must render the home');
  if(channel==='beta'){
    assert.equal(await page.locator('.app > header .v366-topbar').count(),0,
      'V8.337 Beta Home must not create the retired V366 header');
    await page.addStyleTag({path:file('v8009-extracted-v372-authoritative-header-css.css')});
    const legacyDisplay=await page.evaluate(()=>{
      document.body.classList.add('v8011-beta-unified-headers','v371-game-ui');
      return getComputedStyle(document.querySelector('.app > header')).display;
    });
    assert.equal(legacyDisplay,'none','V8.337 authoritative CSS must eliminate legacy header layout space');
  }
  const eventLayers=await page.evaluate(()=>{
    /* V8.336: include the genuine body-level HUD DOM shape in the fixture,
       rather than testing only the hidden legacy .app > header. */
    const shell=document.createElement('div');
    shell.id='v372TopbarShell';
    shell.innerHTML='<div class="v372-topbar">QA HUD</div>';
    document.body.insertBefore(shell,document.body.firstChild);
    const result=window.v8334HomeEventTopDiagnostics?.()||null;
    shell.remove();
    return result;
  });
  if(channel==='beta'){
    assert.ok(eventLayers?.childOrder?.some(x=>x.includes('v690-events-card')),
      'Beta should expose bounded event top hit-test without modifying the world');
    assert.equal(eventLayers?.hitBands?.length,4,'V8.335 samples actual 8px band above Events');
    assert.ok(eventLayers?.paintCandidates?.some(x=>x.startsWith('events:')),
      'V8.335 reports the Events paint owner, including CSS shadows');
    assert.ok(eventLayers?.paintCandidates?.some(x=>x.startsWith('hud-shell:')),
      'V8.336 identifies the actual body-level v372 header owner');
    assert.ok(eventLayers?.paintCandidates?.some(x=>x.startsWith('hud-topbar:')),
      'V8.336 distinguishes the visible HUD from legacy header markup');
    assert.ok(eventLayers?.paintCandidates?.some(x=>x.includes('/display=')),
      'V8.336 includes computed display/visibility to avoid false overlap attribution');
  }
  else assert.equal(eventLayers,null,'Event layer diagnostics must stay Beta-only');
  const values=await page.evaluate(()=>{
    const world=document.getElementById('world');
    const hero=world.querySelector('.v366-hero');
    const full=()=>window.v8009HomeEventDiagnostics().fullRenders;
    const begin=full();
    const currentRow=world.querySelector('.v366-lower');
    const currentHeading=world.querySelector('.v690-current-title');
    const currentCup=world.querySelector('.v8310-cup-results-slot');
    hero.style.setProperty('--v7258-profile-width','188px');
    hero.style.setProperty('height','490px','important');
    hero.style.setProperty('min-height','490px','important');
    s.gold+=55;s.harzTaler+=12;
    v085InstallWorld(false);
    const wallet={sameHero:world.querySelector('.v366-hero')===hero,fullDelta:full()-begin};
    s.energy=95;
    v085InstallWorld(false);
    const energy={sameHero:world.querySelector('.v366-hero')===hero,
      text:world.querySelector('.v366-card.quest .v366-status b')?.textContent||'',
      fullDelta:full()-begin};
    s.xp+=10;
    v085InstallWorld(false);
    const xpHero=world.querySelector('.v366-hero');
    const xp={differentHero:xpHero!==hero,fullDelta:full()-begin,
      fitTransferred:xpHero.style.getPropertyValue('--v7258-profile-width')==='188px'&&
        xpHero.style.getPropertyValue('height')==='490px',
      sameCurrentRow:world.querySelector('.v366-lower')===currentRow,
      sameCurrentHeading:world.querySelector('.v690-current-title')===currentHeading,
      sameCupResults:world.querySelector('.v8310-cup-results-slot')===currentCup};
    s.tower={season:{bestFloor:4,bestScore:0}};
    v085InstallWorld(false);
    const tower={sameHero:world.querySelector('.v366-hero')===xpHero,
      heroRetentions:window.v8009HomeEventDiagnostics().heroRetentions};
    /* A true change inside Aktuelles must repaint its content, not freeze a
       retained card indefinitely. Account changes must replace stale results. */
    window.GL_WEATHER={kind:'sun',icon:'☀️',label:'Sonne',temp:23,bonus:{text:'Ertrag +5 %'}};
    v085InstallWorld(false);
    const weather={replacedCurrentRow:world.querySelector('.v366-lower')!==currentRow,
      updated:world.querySelector('.vHome-weather-card')?.textContent.includes('Sonne')};
    const cupBeforeAccount=world.querySelector('.v8310-cup-results-slot');
    window.v073User={id:'qa-other'};
    s.social={...s.social,playerId:'qa-other'};
    v085InstallWorld(false);
    const account={freshCup:world.querySelector('.v8310-cup-results-slot')!==cupBeforeAccount};
    const cup=world.querySelector('.v8310-cup-results-slot');
    cup.removeAttribute('hidden'); 
    const boss=world.querySelector('.v366-feature.boss');
    const button=boss.querySelector('.v366-go');
    const heights={boss:boss.getBoundingClientRect().height,cup:cup.getBoundingClientRect().height,
      buttonBottom:button.getBoundingClientRect().bottom,bossBottom:boss.getBoundingClientRect().bottom,
      buttonHeight:button.getBoundingClientRect().height};
    return {wallet,energy,xp,tower,weather,account,heights,diag:window.v8009HomeEventDiagnostics()};
  });
  assert.equal(values.wallet.sameHero,true,channel+' wallet should not replace home hero');
  assert.equal(values.wallet.fullDelta,0,channel+' wallet should avoid full render');
  assert.equal(values.energy.sameHero,true,channel+' Dampf should keep home hero');
  assert.equal(values.energy.text,'95/100 Dampf',channel+' Dampf should update quest card');
  assert.equal(values.energy.fullDelta,0,channel+' Dampf should avoid full render');
  assert.equal(values.xp.differentHero,true,channel+' XP should still refresh home');
  assert.equal(values.xp.fitTransferred,channel==='beta',channel+' geometry transfer must be Beta-only');
  assert.equal(values.tower.sameHero,channel==='beta',channel+' unrelated tower progress should preserve only the Beta home hero');
  if(channel==='beta')assert.ok(values.tower.heroRetentions>0,'Beta must record a retained unchanged hero');
  assert.equal(values.xp.fullDelta,1,channel+' XP must trigger exactly one full render');
  assert.equal(values.xp.sameCurrentRow,true,channel+' XP must not repaint Aktuelles');
  assert.equal(values.xp.sameCurrentHeading,true,channel+' XP must not flash Aktuelles heading');
  assert.equal(values.xp.sameCupResults,true,channel+' XP must preserve async Cup result slot');
  assert.equal(values.weather.replacedCurrentRow,true,channel+' weather change must refresh actual Current content');
  assert.equal(values.weather.updated,true,channel+' new weather must be displayed');
  assert.equal(values.account.freshCup,true,channel+' account switch must not keep other account reward UI');
  assert.ok(Math.abs(values.heights.boss-values.heights.cup)<=2,channel+' Cup/Boss heights differ '+JSON.stringify(values.heights));
  assert.ok(values.heights.buttonHeight>=28,channel+' boss CTA too small');
  assert.ok(values.heights.buttonBottom<=values.heights.bossBottom-1,channel+' boss CTA is clipped '+JSON.stringify(values.heights));
  scenarios.push({channel,...values});
  await page.close();
}
async function checkDungeonObserverScope(channel){
  const page=await browser.newPage();
  await page.setContent('<!doctype html><html><body><div id="world" class="active"></div><section id="dungeon"></section></body></html>');
  await page.evaluate(channel=>{
    window.GROW_RELEASE_CHANNEL=channel;
    window.s={dungeon:{selected:6,view:'map'}};
    window.qaDungeonLiveObservers=new Set();
    const baseObserve=MutationObserver.prototype.observe;
    const baseDisconnect=MutationObserver.prototype.disconnect;
    MutationObserver.prototype.observe=function(root,options){
      const result=baseObserve.call(this,root,options);
      if(root.id==='dungeon')window.qaDungeonLiveObservers.add(this);
      return result;
    };
    MutationObserver.prototype.disconnect=function(){
      window.qaDungeonLiveObservers.delete(this);
      return baseDisconnect.call(this);
    };
  },channel);
  await page.addScriptTag({path:file('js/features/legacy-extracted/beta/v434-d7-clean-boss-script.js')});
  await page.addScriptTag({path:file('js/features/dungeon/beta/v8009-d5-final-detail-seal.js')});
  await page.waitForTimeout(70);
  const initial=await page.evaluate(()=>qaDungeonLiveObservers.size);
  await page.evaluate(()=>{
    document.getElementById('world').classList.remove('active');
    document.getElementById('dungeon').classList.add('active');
    window.dispatchEvent(new CustomEvent('growlegends:navigation-open-v7119',{detail:{id:'dungeon'}}));
  });
  await page.waitForTimeout(140);
  const active=await page.evaluate(()=>qaDungeonLiveObservers.size);
  await page.evaluate(()=>{
    document.getElementById('dungeon').classList.remove('active');
    document.getElementById('world').classList.add('active');
    window.dispatchEvent(new CustomEvent('growlegends:navigation-open-v7119',{detail:{id:'world'}}));
  });
  await page.waitForTimeout(70);
  const after=await page.evaluate(()=>qaDungeonLiveObservers.size);
  assert.equal(initial,channel==='beta'?0:2,channel+' inactive Dungeon observers at boot');
  assert.equal(active,2,channel+' Dungeon requires both image guardians while open');
  assert.equal(after,channel==='beta'?0:2,channel+' after navigating back to Home');
  scenarios.push({channel,dungeonObservers:{initial,active,after}});
  await page.close();
}
async function checkPostLoginHomeHydration(channel){
  const page=await browser.newPage();
  await page.setContent('<!doctype html><html><body><main><section id="world" class="screen active"></section><section id="quests" class="screen"></section></main></body></html>');
  await page.evaluate(channel=>{
    window.GROW_RELEASE_CHANNEL=channel;
    window.s={social:{playerId:'qa-hydrate'},dungeon:{selected:0}};
    window.v073User={id:'qa-hydrate'};
    window.v452AccountVerified=()=>true;
    window.__V7204_CANONICAL_LOGIN_AT__=Date.now();
    window.__V7203_LOGIN_DUNGEON_READY__=true;
    window.persist=()=>true;
    window.qaProgress=0;
    window.qaQuest=0;
    window.v7077ProgressRefresh=async()=>{window.qaProgress++;return true};
    window.v7110SyncQuestAuthority=async()=>{window.qaQuest++;return true};
    window.v7040AuthorityDiagnostics=()=>({domains:{}});
    window.v7040AuthorityRefresh=async()=>true;
    window.v7081CapabilitiesRefresh=async()=>true;
  },channel);
  await page.addScriptTag({path:file('js/features/authority/beta/v8009-s2-v7133-global-gameplay-authority-lockdown.js')});
  await page.evaluate(()=>window.persist());
  await page.waitForTimeout(140);
  const home=await page.evaluate(()=>({progress:window.qaProgress,diag:window.v7133AuthorityDiagnostics().homePostLoginHydratesSuppressed}));
  await page.evaluate(()=>{
    window.__V7204_CANONICAL_LOGIN_AT__=Date.now()-20000;
    window.v7214AccountReadyQueueDiagnostics=()=>({queued:19});
    window.persist();
  });
  await page.waitForTimeout(140);
  const queued=await page.evaluate(()=>({
    progress:window.qaProgress,
    suppressed:window.v7133AuthorityDiagnostics().homeQueueHydratesSuppressed,
    trace:window.v7133AuthorityDiagnostics().hydrationTrace.slice(-1)[0]
  }));
  await page.evaluate(()=>{
    document.getElementById('world').classList.remove('active');
    document.getElementById('quests').classList.add('active');
    window.persist();
  });
  await page.waitForTimeout(140);
  const quests=await page.evaluate(()=>({progress:window.qaProgress,quest:window.qaQuest}));
  await page.evaluate(()=>{
    document.getElementById('quests').classList.remove('active');
    document.getElementById('world').classList.add('active');
    window.__V7204_CANONICAL_LOGIN_AT__=Date.now()-30000;
    window.v7214AccountReadyQueueDiagnostics=()=>({queued:0});
    window.persist();
  });
  await page.waitForTimeout(140);
  const later=await page.evaluate(()=>window.qaProgress);
  assert.equal(home.progress,channel==='beta'?0:1,channel+' immediate Home should only skip duplicate Beta refresh');
  assert.equal(home.diag,channel==='beta'?1:0,channel+' Beta counter');
  assert.equal(queued.progress,channel==='beta'?0:2,channel+' pending login queue should only skip redundant Beta Home refresh');
  assert.equal(queued.suppressed,channel==='beta'?1:0,channel+' queue-specific suppression count');
  assert.equal(queued.trace?.reason,channel==='beta'?'persist':undefined,channel+' Beta-only trace reason');
  assert.equal(quests.progress,channel==='beta'?1:3,channel+' Quests must keep canonical hydration');
  assert.equal(quests.quest,1,channel+' Quests must keep their screen-specific sync');
  assert.equal(later,channel==='beta'?2:4,channel+' later Home refresh must remain available');
  scenarios.push({channel,hydration:{home,queued,quests,later}});
  await page.close();
}
async function checkAccountReadyCpuAttribution(channel){
  const page=await browser.newPage();
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.evaluate(channel=>{
    window.GROW_RELEASE_CHANNEL=channel;
    window.__V7210_BOOT_PENDING__=true;
  },channel);
  await page.addScriptTag({path:file('js/features/system/beta/v8009-s13-v4131-version-source.js')});
  await page.evaluate(()=>{
    window.addEventListener('growlegends:account-ready',()=>{
      const start=performance.now();
      while(performance.now()-start<12){}
    });
    window.dispatchEvent(new CustomEvent('growlegends:account-ready'));
    window.__V7210_BOOT_PENDING__=false;
    window.dispatchEvent(new CustomEvent('growlegends:first-playable'));
  });
  await page.waitForTimeout(850);
  const d=await page.evaluate(()=>window.v7214AccountReadyQueueDiagnostics());
  assert.equal(d.drained,1,channel+' deferred account-ready callback must execute once');
  if(channel==='beta'){
    assert.ok(d.callbackCpuMs>=8,channel+' should record synchronous listener CPU');
    assert.ok(d.callbackOwners?.some(x=>x.calls===1&&x.cpuMs>=8),channel+' should expose per-owner timing');
  }else{
    assert.equal(d.callbackOwners,null,channel+' must retain uninstrumented Server1 callback path');
  }
  scenarios.push({channel,accountReady:{drained:d.drained,cpuMs:d.callbackCpuMs,owners:d.callbackOwners}});
  await page.close();
}
async function checkEnchantAliasConsistency(){
 const page=await browser.newPage();
 await page.setContent('<!doctype html><html><body><div id="v372Gold"></div></body></html>');
 await page.evaluate(()=>{
  window.GROW_RELEASE_CHANNEL='beta';
  window.v073User={id:'qa-enchant'};
  window.s={inventory:[],equipment:{},social:{playerId:'qa-enchant'}};
  window.qaCalls=0;
  window.v073Db={rpc:()=>{window.qaCalls++;throw Error('Unexpected RPC')}};
  const make=(i)=>{
   const base={id:'test-item-'+i,bonus:{staerke:i+3}};
   if(i<27)return {...base,enchants:null};
   return {...base,enchants:[{name:'Example',effect:'luck',value:i}]};
  };
  window.qaServerItems=Array.from({length:31},(_,i)=>make(i));
  window.s.inventory=window.qaServerItems.map((x,i)=>
   i<27?{...x,enchants:[]}:{...x,enchants:undefined,enchant:{name:'Example',effect:'luck',value:i}});
 });
 await page.addScriptTag({path:file('js/features/system/beta/v8330-data-consistency-watch.js')});
 await page.evaluate(()=>window.v8330ObserveCanonical('items',{inventory:window.qaServerItems,equipment:{}}));
 await page.waitForTimeout(1650);
 const equal=await page.evaluate(()=>window.v8330DataConsistencyReport());
 assert.equal(equal.issues.length,0,'Empty [] vs null on 27 of 31 inventory items and a single enchant vs one-item array must be equivalent');
 await page.evaluate(()=>{
  const x=window.s.inventory[30];x.enchant={...x.enchant,value:x.enchant.value+1};
  window.v8330DataConsistencyCheck();
 });
 await page.waitForTimeout(650);
 const changed=await page.evaluate(()=>{
  window.v8330DataConsistencyCheck();
  return window.v8330DataConsistencyReport();
 });
 const issue=changed.issues.find(x=>x.key==='inventory:runtime');
 assert.ok(issue,'Changed enchantment must still raise one warning');
 assert.equal(issue.expected,31,'Must keep total server item count');
 assert.equal(issue.actual,31,'Must keep total local item count');
 assert.equal(issue.changed,1,'Only one enchanted item is semantically changed');
 assert.deepEqual(issue.fields,['Verzauberung'],'Only real enchantment changes should appear');
 assert.match(issue.detail,/anderer Inhalt: 1/,'Explain that the enchantment content differs, not missing ownership');
 const rpc=await page.evaluate(()=>window.qaCalls);
 assert.equal(rpc,0,'No network reads allowed for consistency comparison');
 scenarios.push({channel:'beta',enchantNormalization:{noFalsePositiveFor27:equal.issues.length===0,realChangeDetected:issue.changed===1,extraRpcs:rpc}});
 await page.close();
}
async function checkReadOnlyConsistencyWatch(channel){
  const page=await browser.newPage();
  const origin='https://guard-test.invalid/';
  await page.route(origin,route=>route.fulfill({status:200,contentType:'text/html',body:
   '<!doctype html><html><body><div id="v372Gold">1.997</div><div id="v372Harz">8</div><div id="v372Dampf">100/100</div><div id="charPower">1.997</div></body></html>'}));
  await page.goto(origin);
  await page.evaluate(channel=>{
    window.GROW_RELEASE_CHANNEL=channel;
    window.KEY='gl-v8330-qa';
    window.v073User={id:'qa-consistency'};
    window.s={gold:1997,harzTaler:8,energy:100,level:5,xp:50,
      inventory:[{id:'item-1',bonus:{strength:2}}],equipment:{weapon:null},social:{playerId:'qa-consistency'}};
    window.localStorage.setItem(window.KEY,JSON.stringify(window.s));
    window.v073Db={rpc:()=>{window.qaRpcCalls++;throw Error('Watch must not issue an RPC')}};
    window.qaRpcCalls=0;
  },channel);
  await page.addScriptTag({path:file('js/features/system/beta/v8330-data-consistency-watch.js')});
  if(channel==='server1'){
    const guardAbsent=await page.evaluate(()=>typeof window.v8330ObserveCanonical==='undefined');
    assert.equal(guardAbsent,true,'Server1 must have no V8.330 watcher even if module is loaded');
    scenarios.push({channel,consistencyWatch:'not-installed'});
    await page.close();return;
  }
  await page.evaluate(()=>{
    window.v8330ObserveCanonical('progress',{gold:1997,harz:8,level:5,xp:50});
    window.v8330ObserveCanonical('quest',{energy:100});
    window.v8330ObserveCanonical('items',{inventory:window.s.inventory,equipment:window.s.equipment});
  });
  await page.waitForTimeout(1540);
  const clean=await page.evaluate(()=>window.v8330DataConsistencyReport());
  assert.equal(clean.issues.length,0,'Formatted 1.997 and canonical item/energy should not false-alarm');
  assert.equal(clean.observations,3,'Three canonical owners should be counted');
  /* V8.331: reordered keys inside the same semantic server bonus must not
     cause same-count inventory false positives. */
  await page.evaluate(()=>{
    window.s.inventory=[{id:'item-1',bonus:{endurance:2,strength:2}}];
    window.v8330ObserveCanonical('items',{
      inventory:[{id:'item-1',bonus:{strength:2,endurance:2}}],
      equipment:{weapon:null}
    });
  });
  await page.waitForTimeout(1550);
  const reordered=await page.evaluate(()=>window.v8330DataConsistencyReport());
  assert.equal(reordered.issues.length,0,'Reordered equivalent item bonus keys must not trigger inventory drift');

  await page.evaluate(()=>{
    window.s.energy=100;
    document.getElementById('v372Dampf').textContent='100/100';
    window.v8330ObserveCanonical('refill',{energy:100,harz:8});
    // Simulate a stale local painter overwriting an already confirmed refill.
    window.s.energy=0;
    document.getElementById('v372Dampf').textContent='0/100';
    window.localStorage.setItem(window.KEY,JSON.stringify(window.s));
  });
  await page.waitForTimeout(1550);
  const mismatch=await page.evaluate(()=>window.v8330DataConsistencyReport());
  assert.ok(mismatch.issues.some(x=>x.key==='energy:runtime'&&x.expected===100&&x.actual===0),
    'Persistent Dampf mismatch must be recorded');
  assert.ok(mismatch.issues.some(x=>x.key==='energy:topbar'),
    'Confirmed Dampf vs visible Topbar mismatch must be recorded');

  await page.evaluate(()=>{
    window.s.energy=100;
    document.getElementById('v372Dampf').textContent='100/100';
    window.v8330ObserveCanonical('items',{inventory:[{id:'item-1',bonus:{strength:2}}],equipment:{weapon:null}});
    window.s.inventory=[{id:'item-1',bonus:{strength:55}}];
    window.localStorage.setItem(window.KEY,JSON.stringify(window.s));
  });
  await page.waitForTimeout(1550);
  const items=await page.evaluate(()=>window.v8330DataConsistencyReport());
  assert.ok(items.issues.some(x=>x.key==='inventory:runtime'),
    'Silent item-stat overwrite without new canonical server item response must be flagged');
  assert.ok(items.issues.some(x=>x.key==='inventory:runtime'&&x.changed===1&&x.fields.includes('Bonuswerte')),
    'Same-count inventory drift must identify affected item count and category');
  const issueCount=items.issues.filter(x=>x.key==='inventory:runtime').length;
  await page.evaluate(()=>{
    window.v8330ObserveCanonical('items',{inventory:[{id:'item-1',bonus:{strength:2}}],equipment:{weapon:null}});
    window.s.inventory=[{id:'item-1',bonus:{strength:55}}];
  });
  await page.waitForTimeout(1550);
  const repeated=await page.evaluate(()=>window.v8330DataConsistencyReport());
  assert.equal(repeated.issues.filter(x=>x.key==='inventory:runtime').length,issueCount,
    'Repeated identical inventory difference must not be logged as a new incident');

  await page.evaluate(()=>{
    window.v073User={id:'qa-second'};
    window.s={gold:25,harzTaler:4,energy:50,inventory:[],equipment:{},social:{playerId:'qa-second'}};
    document.getElementById('v372Gold').textContent='25';
    document.getElementById('v372Harz').textContent='4';
    document.getElementById('v372Dampf').textContent='50/100';
    window.localStorage.setItem(window.KEY,JSON.stringify(window.s));
    window.v8330ObserveCanonical('progress',{gold:25,harz:4});
    window.v8330ObserveCanonical('quest',{energy:50});
  });
  await page.waitForTimeout(1540);
  const switched=await page.evaluate(()=>({
    report:window.v8330DataConsistencyReport(),rpc:window.qaRpcCalls,
    text:window.v8330DataConsistencyText()
  }));
  assert.ok(switched.report.accountSwitches>=1,'Account switch must invalidate previous comparison baselines');
  assert.equal(switched.report.issues.length,0,'Account switch must clear previous account warning history');
  assert.equal(switched.report.lastConfirmed.energy.value,50,'Second account must own new canonical energy snapshot');
  assert.equal(switched.rpc,0,'Read-only watcher must perform zero server RPCs');
  assert.equal(switched.text.includes('qa-second'),false,'Report must not disclose user IDs');
  assert.equal(switched.text.includes('item-1'),false,'Report must not disclose item IDs');
  scenarios.push({channel,consistencyWatch:{
    observations:switched.report.observations,
    initialIssues:clean.issues.length,
    energyDetected:mismatch.issues.some(x=>x.key==='energy:runtime'),
    itemDetected:items.issues.some(x=>x.key==='inventory:runtime'),
    keyOrderFalseAlarm:reordered.issues.length,
    itemCategory:items.issues.find(x=>x.key==='inventory:runtime')?.fields,
    duplicates:repeated.issues.filter(x=>x.key==='inventory:runtime').length,
    accountSwitches:switched.report.accountSwitches,
    rpc:switched.rpc
  }});
  await page.close();
}
async function checkSampledJsonProfile(){
  const full=readFileSync(file('js/features/system/beta/v8009-s1-v4107-systemtechnik.js'),'utf8');
  const from=full.indexOf('function startRuntimeCpuProbe(){');
  const to=full.indexOf('function stopRuntimeProfiler(){',from);
  assert.ok(from>0&&to>from,'Current sampled JSON profiler functions exist');
  assert.ok(source.includes('match[1]')&&source.includes("':'+match[2]"),
    'V8.336 returns caller filename+line without URL or payload');
  const source=full.slice(from,to);
  const page=await browser.newPage();
  await page.route('https://sampled-profile-test.invalid/',route=>route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><html><body></body></html>'}));
  await page.goto('https://sampled-profile-test.invalid/');
  await page.evaluate(()=>{
    window.GROW_RELEASE_CHANNEL='beta';
    window.runtimeProfile={startPerf:performance.now(),cpuProbe:null};
    window.currentScreenId=()=> 'world';
    window.qaOriginalParse=JSON.parse;
    window.qaOriginalStringify=JSON.stringify;
    window.qaOriginalSetItem=Storage.prototype.setItem;
  });
  await page.addScriptTag({content:source+';window.qaStartSampledProbe=startRuntimeCpuProbe;window.qaStopSampledProbe=stopRuntimeCpuProbe;'});
  const out=await page.evaluate(()=>{
    runtimeProfile.cpuProbe=qaStartSampledProbe();
    for(let i=0;i<8192;i++){JSON.parse('{"ok":1}');JSON.stringify({ok:1})}
    localStorage.setItem('v8334-qa-probe','yes');
    const result=qaStopSampledProbe();
    return {parseRestored:JSON.parse===qaOriginalParse,
      stringifyRestored:JSON.stringify===qaOriginalStringify,
      storageRestored:Storage.prototype.setItem===qaOriginalSetItem,
      parse:result.entries['JSON.parse'],
      stringify:result.entries['JSON.stringify'],
      storage:result.entries['Storage.setItem']};
  });
  assert.ok(out.parseRestored&&out.stringifyRestored&&out.storageRestored,
    'All native methods must restore when profiler stops');
  assert.ok(out.parse.calls>=8192&&out.stringify.calls>=8192,'Sampler must count all JSON calls');
  assert.ok(out.parse.samples>=2&&out.stringify.samples>=2,'Sampler only times 1 in 256 calls');
  assert.ok(out.parse.samples<out.parse.calls/100,'Hot path should avoid timing every JSON call');
  assert.ok(out.parse.ownerSamples>=2&&out.stringify.ownerSamples>=2,
    'V8.335 caller sampling must continue at 4096 and 8192 calls, not stop at first 100 timing probes');
  assert.ok(Object.keys(out.parse.buckets||{}).length>=1,'V8.335 approximate call buckets available');
  assert.ok(out.storage.calls>=1,'Storage setter remains observable');
  scenarios.push({channel:'beta',jsonSampling:{calls:out.parse.calls,samples:out.parse.samples,
    restored:true,storageWrites:out.storage.calls}});
  await page.close();
}
async function checkDiagnosticReadHotPaths(){
 const page=await browser.newPage();
 await page.setContent('<!doctype html><html><body></body></html>');
 await page.evaluate(()=>{
   window.GROW_RELEASE_CHANNEL='beta';
   window.v073User={id:'qa-diagnostic'};
   window.s={inventory:[],equipment:{},grow:{}};
   window.v073Db={rpc:async name=>{
     if(name==='v7081_client_capabilities')return {data:{ok:true,caps:{items:true}}};
     return {data:{enabled:true,domains:{progress:'off'},extra:{nested:{marker:42}}}};
   }};
 });
 await page.addScriptTag({path:file('js/features/authority/beta/v8009-s1-v7042-unified-authority-bridge.js')});
 await page.addScriptTag({path:file('js/features/account/beta/v8009-s12-v7081-account-capability-gate.js')});
 await page.evaluate(async()=>{await window.v7040AuthorityRefresh(false)});
 const result=await page.evaluate(()=>{
   const oldParse=JSON.parse,oldStringify=JSON.stringify;
   let parses=0,stringifies=0;
   JSON.parse=function(){parses++;return oldParse.apply(this,arguments)};
   JSON.stringify=function(){stringifies++;return oldStringify.apply(this,arguments)};
   try{
     for(let i=0;i<10000;i++){
       window.v7040AuthorityDiagnostics();
       window.v7081CapabilitiesDiagnostics();
     }
     const d=window.v7040AuthorityDiagnostics();
     const c=window.v7081CapabilitiesDiagnostics();
     d.domains.progress='changed-externally';
     c.caps.items='changed-externally';
     return {parses,stringifies,frozenRow:Object.isFrozen(d.lastRow),
       nestedFrozen:Object.isFrozen(d.lastRow?.extra?.nested),
       isolatedDomains:window.v7040AuthorityDiagnostics().domains.progress==='off',
       isolatedCaps:window.v7081CapabilitiesDiagnostics().caps.items!=='changed-externally'};
   }finally{JSON.parse=oldParse;JSON.stringify=oldStringify}
 });
 assert.ok(result.parses<=4&&result.stringifies<=4,
   'V8.337 diagnostics must not JSON deep-clone on each of 10k reads');
 assert.ok(result.frozenRow&&result.nestedFrozen,'Memoized authority row must be immutable');
 assert.ok(result.isolatedDomains&&result.isolatedCaps,
   'Diagnostics snapshots must not modify canonical authority state');
 scenarios.push({channel:'beta',diagnosticsHotPath:result});
 await page.close();
}
async function checkGhostMenuNavigation(){
 const page=await browser.newPage();
 await page.setContent('<!doctype html><html><body><div id="v032MenuPanel" class="top-menu-panel open show" style="display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;z-index:120001!important"></div><section id="world" class="screen active"></section></body></html>');
 await page.evaluate(()=>{window.GROW_RELEASE_CHANNEL='beta';window.s={gold:1,harzTaler:2,energy:50}});
 await page.addStyleTag({path:file('v8009-extracted-v372-authoritative-header-css.css')});
 await page.addScriptTag({path:file('js/features/ui/beta/v8009-s7-v372-authoritative-header.js')});
 const result=await page.evaluate(()=>{
   window.dispatchEvent(new CustomEvent('growlegends:navigation-open-v7119',{detail:{id:'world'}}));
   const panel=document.getElementById('v032MenuPanel');
   return {open:panel.classList.contains('open')||panel.classList.contains('show'),
     inlineDisplay:panel.style.getPropertyValue('display'),
     inlinePointer:panel.style.getPropertyValue('pointer-events'),
     ariaHidden:panel.getAttribute('aria-hidden'),
     computedDisplay:getComputedStyle(panel).display,
     hud:!!document.getElementById('v372TopbarShell')};
 });
 assert.ok(result.hud&&!result.open&&!result.inlineDisplay&&!result.inlinePointer&&result.ariaHidden==='true'&&result.computedDisplay==='none',
   'V8.337 world navigation must remove the ghost menu overlay from the visible layout');
 scenarios.push({channel:'beta',ghostMenuNavigation:result});
 await page.close();
}
async function checkPowerPaintEfficiency(channel){
 const page=await browser.newPage();
 await page.setContent('<!doctype html><html><body><main><div id="world" class="screen active"><div class="v366-power"><b>0</b></div></div></main><b id="power"></b><b id="charPower"></b><b id="v358Power"></b><b id="v110Cp"></b></body></html>');
 await page.evaluate(channel=>{
  window.GROW_RELEASE_CHANNEL=channel;
  window.qaPower=1997;
  window.combatPower=()=>window.qaPower;
  window.render=()=>{window.qaRenderCount=(window.qaRenderCount||0)+1};
  window.v032Go=()=>true;
  window.qaPowerMutations=0;
  const observer=new MutationObserver(records=>{window.qaPowerMutations+=records.length});
  observer.observe(document.getElementById('charPower'),{childList:true,characterData:true,subtree:true});
 },channel);
 await page.addScriptTag({path:file('js/features/system/beta/v8009-s10-v4126-power-rpc-diagnostics.js')});
 await page.waitForTimeout(50);
 await page.evaluate(()=>{
  const before=window.qaPowerMutations;
  for(let i=0;i<16;i++)window.render();
  window.v032Go('world');
  window.qaRenderMutationsBefore=before;
 });
 await page.waitForTimeout(130);
 const stable=await page.evaluate(()=>({
  diagnostics:window.v4125PowerPaintDiagnostics(),
  power:document.getElementById('charPower').textContent,
  home:document.querySelector('.v366-power b').textContent,
  mutations:window.qaPowerMutations
 }));
 if(channel==='beta'){
  assert.ok(stable.diagnostics.coalesced>=15,'Beta should merge repeated rendering repaints into one animation frame');
  assert.ok(stable.diagnostics.writes<=10,'Beta should not repaint unchanged power nodes after every render');
  assert.equal(stable.mutations,1,'Repeated same-value power renders should not wake character MutationObserver');
 }else{
  assert.equal(stable.diagnostics.coalesced,0,'Server1 retains pre-existing render behavior');
  assert.ok(stable.mutations>4,'Server1 remains unmodified');
 }
 await page.evaluate(()=>{
  window.qaPower=2111;
  window.v4125PaintStablePower();
 });
 const changed=await page.evaluate(()=>({
  power:document.getElementById('charPower').textContent,
  home:document.querySelector('.v366-power b').textContent,
  diag:window.v4125PowerPaintDiagnostics()
 }));
 assert.equal(changed.power,'2111',channel+' must still update current power immediately');
 assert.equal(changed.home,channel==='beta'?'2.111':'2111',channel+' home formatted power correctness');
 scenarios.push({channel,powerPaint:{
  coalesced:stable.diagnostics.coalesced,
  writes:stable.diagnostics.writes,mutations:stable.mutations,
  changed:changed.power,formatted:changed.home
 }});
 await page.close();
}
try{
  await run('beta');
  await run('server1');
  await checkDungeonObserverScope('beta');
  await checkDungeonObserverScope('server1');
  await checkPostLoginHomeHydration('beta');
  await checkPostLoginHomeHydration('server1');
  await checkAccountReadyCpuAttribution('beta');
  await checkAccountReadyCpuAttribution('server1');
  await checkReadOnlyConsistencyWatch('beta');
  await checkReadOnlyConsistencyWatch('server1');
  await checkEnchantAliasConsistency();
  await checkPowerPaintEfficiency('beta');
  await checkPowerPaintEfficiency('server1');
  await checkSampledJsonProfile();
  await checkDiagnosticReadHotPaths();
  await checkGhostMenuNavigation();
  assert.deepEqual(failures,[],'uncaught browser errors');
  console.log(JSON.stringify({ok:true,scenarios},null,2));
}catch(e){
  console.error('Browser performance regression FAILED',e.stack||e);
  process.exitCode=1;
}finally{
  await browser.close();
}
