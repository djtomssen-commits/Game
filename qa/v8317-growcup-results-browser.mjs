// V8.317: verify that the existing Grow-Cup owner only changes
// the result tile's hidden state when server-authoritative visibility changes.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
const results=[];
try{
for(const channel of ['beta','server1']){
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e.message||e)));
 await page.setContent('<!doctype html><html><body><main><section id="world" class="screen active"><section class="v366-panel v8310-cup-results-slot" hidden><button data-growcup-results="1"><span data-growcup-results-status>Loading</span></button></section></section></main></body></html>');
 await page.evaluate(channel=>{
  window.GROW_RELEASE_CHANNEL=channel;
  window.v073User={id:'synthetic_user'};
  window.v8210GrowCupEventActive=()=>false;
  window.v085InstallWorld=()=>{};
  window.__qaEvents=[];
  window.__qaState={ok:true,active:false,run:{status:'completed',event_key:'2026-10-08',rank_reward_claimed:false}};
  window.__qaLeaderboard={ok:true,final:true,event_key:'2026-10-08',rows:[{rank:1}]};
  window.v073Db={
   rpc:async name=>{
    await new Promise(r=>setTimeout(r,name.endsWith('_state')?15:45));
    if(name==='v8210_growcup_state')return{data:window.__qaState,error:null};
    if(name==='v8210_growcup_leaderboard')return{data:window.__qaLeaderboard,error:null};
    return{data:null,error:new Error('Unexpected RPC '+name)};
   }
  };
 },channel);
 await page.addScriptTag({path:'js/features/events/beta/v8198-runehunt.js'});
 await page.evaluate(()=>{
  const el=document.querySelector('.v8310-cup-results-slot');
  const obs=new MutationObserver(records=>{
   for(const rec of records){
    if(rec.attributeName!=='hidden')continue;
    window.__qaEvents.push({
      wasHidden:rec.oldValue!==null,
      nowHidden:el.hasAttribute('hidden')
    });
   }
  });
  obs.observe(el,{attributes:true,attributeOldValue:true,attributeFilter:['hidden']});
  window.__qaObserver=obs;
  window.dispatchEvent(new CustomEvent('growlegends:account-ready'));
 });
 await page.waitForFunction(()=>document.querySelector('.v8310-cup-results-slot').hidden===false);
 // Repeated server state updates and home-render notifications must not
 // rewrite the hidden attribute or trigger a second real transition.
 await page.evaluate(()=>{
  for(let i=0;i<5;i++)window.v8310GrowCupResultsPaint();
  window.dispatchEvent(new CustomEvent('growlegends:home-rendered-v8009'));
 });
 await page.waitForTimeout(25);
 const afterLoad=await page.evaluate(()=>({
  events:window.__qaEvents,
  text:document.querySelector('[data-growcup-results-status]').textContent,
  hidden:document.querySelector('.v8310-cup-results-slot').hidden
 }));
 assert.deepEqual(afterLoad.events,[{wasHidden:true,nowHidden:false}],channel+' redundant hidden writes');
 assert.equal(afterLoad.hidden,false);
 assert.ok(afterLoad.text.includes('Rangbelohnung prüfen'));

 // Account-ready can fire again for a later hydration stage of the SAME
 // player: the known final reward slot must not disappear and reappear.
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('growlegends:account-ready')));
 await page.waitForTimeout(130);
 const afterSameAccount=await page.evaluate(()=>({
   events:window.__qaEvents,visible:!document.querySelector('.v8310-cup-results-slot').hidden
 }));
 assert.equal(afterSameAccount.visible,true,channel+' same player ready event must retain the tile');
 assert.equal(afterSameAccount.events.length,1,channel+' duplicate account-ready must not hide Cup');

 // New Thursday active flag: hide exactly once and do not expose claims.
 await page.evaluate(()=>{
   window.v8210GrowCupEventActive=()=>true;
   window.v8310GrowCupResultsPaint();
   window.v8310GrowCupResultsPaint();
 });
 await page.waitForTimeout(10);
 const afterActive=await page.evaluate(()=>({events:window.__qaEvents,hidden:document.querySelector('.v8310-cup-results-slot').hidden}));
 assert.equal(afterActive.hidden,true);
 assert.deepEqual(afterActive.events.slice(-1),[{wasHidden:false,nowHidden:true}]);
 assert.equal(afterActive.events.length,2);

 // Re-enable when event stops: one real transition despite multiple paints.
 await page.evaluate(()=>{
   window.v8210GrowCupEventActive=()=>false;
   window.v8310GrowCupResultsPaint();
   window.v8310GrowCupResultsPaint();
 });
 await page.waitForTimeout(10);
 const afterReturn=await page.evaluate(()=>({events:window.__qaEvents,hidden:document.querySelector('.v8310-cup-results-slot').hidden}));
 assert.equal(afterReturn.hidden,false);
 assert.equal(afterReturn.events.length,3);
 assert.deepEqual(errors,[]);
 results.push({channel,firstLoadTransitions:afterLoad.events.length,
   sameAccountRepeatTransitions:afterSameAccount.events.length-afterLoad.events.length,
   activeHideTransitions:afterActive.events.length-afterSameAccount.events.length,
   returnShowTransitions:afterReturn.events.length-afterActive.events.length,
   status:afterLoad.text,errors:errors.length});
 await page.close();
}
 console.log(JSON.stringify({pass:true,scenarios:results},null,2));
}catch(e){console.error('V8.317 Grow Cup state regression FAILED',e.stack||String(e));process.exitCode=1}
finally{await browser.close();}
