// V8.312 browser regression for the real Home renderer and shipped CSS.
// Headless Chromium is not the Android WebView and cannot certify a live FPS improvement.
import assert from 'node:assert/strict';
import path from 'node:path';
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
    window.persist();
  });
  await page.waitForTimeout(140);
  const later=await page.evaluate(()=>window.qaProgress);
  assert.equal(home.progress,channel==='beta'?0:1,channel+' immediate Home should only skip duplicate Beta refresh');
  assert.equal(home.diag,channel==='beta'?1:0,channel+' Beta counter');
  assert.equal(quests.progress,channel==='beta'?1:2,channel+' Quests must keep canonical hydration');
  assert.equal(quests.quest,1,channel+' Quests must keep their screen-specific sync');
  assert.equal(later,channel==='beta'?2:3,channel+' later Home refresh must remain available');
  scenarios.push({channel,hydration:{home,quests,later}});
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
try{
  await run('beta');
  await run('server1');
  await checkDungeonObserverScope('beta');
  await checkDungeonObserverScope('server1');
  await checkPostLoginHomeHydration('beta');
  await checkPostLoginHomeHydration('server1');
  await checkAccountReadyCpuAttribution('beta');
  await checkAccountReadyCpuAttribution('server1');
  assert.deepEqual(failures,[],'uncaught browser errors');
  console.log(JSON.stringify({ok:true,scenarios},null,2));
}catch(e){
  console.error('Browser performance regression FAILED',e.stack||e);
  process.exitCode=1;
}finally{
  await browser.close();
}
