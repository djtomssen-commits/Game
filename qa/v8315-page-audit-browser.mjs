// V8.315: deterministic browser test of the opt-in recorder itself.
// Synthetic navigation verifies instrumentation for all primary screens;
// it is NOT an authenticated end-to-end gameplay or Android GPU test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
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
 assert.equal(manual.running,false);
 assert.equal(await page.locator('#v8315PerfDock').count(),0,'debug dock must be removed');
 const sweep=await page.evaluate(()=>GL_PAGE_AUDIT.sweep({dwellMs:170}));
 assert.equal(sweep.running,false);
 assert.equal(sweep.totalScreens,17,'automatic run must measure all 17 screens');
 assert.equal(sweep.sweepDone,17,'all synthetic routes should be active');
 assert.ok(sweep.pages.every(x=>x.visits>0),'every screen should have a visit');
 assert.ok(sweep.pages.every(x=>x.durationMs>=0),'invalid duration');
 assert.ok(errors.length===0,errors.join('; '));
 fs.mkdirSync('qa/reports',{recursive:true});
 fs.writeFileSync('qa/reports/v8315-per-page-browser.json',JSON.stringify({
  type:'synthetic-instrumentation-validation',world,manual,automatic:sweep
 },null,2)+'\n');
 await page.screenshot({path:'qa/reports/v8315-per-page-browser.png',fullPage:false});
 console.log(JSON.stringify({pass:true,manualWorld:{
   currentReplacements:world.aktuellesReplacements,
   visibilityChanges:world.visibilityChanges,renderMarks:world.renderMarks
 },automatic:{screens:sweep.totalScreens,passed:sweep.sweepDone,ids:sweep.pages.map(x=>x.screen)},
 pageErrors:errors.length},null,2));
}catch(e){
 console.error('V8.315 page recorder browser integration FAILED',e.stack||String(e));
 process.exitCode=1;
}finally{await browser.close();}
