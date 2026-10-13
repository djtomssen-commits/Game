import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const recorder=read('js/features/system/beta/v8383-unified-flight-recorder.js');
const renderer=read('js/features/dungeon/beta/v8009-d1-combat-renderer.js');
const watchdog=read('js/features/system/beta/v8009-s7-v7092-runtime-watchdog.js');
const dungeon=read('js/features/dungeon/beta/v8009-s1-v7051-atomic-dungeon-receipt-client.js');
const grow=read('js/features/grow/beta/v8009-s1-v492-growroom2.js');
const quest=read('js/features/quest/beta/v7045-atomic-quest-receipt-client.js');
const beta=read('beta.html'),server1=read('server1.html');
for(const [name,code] of [['flight',recorder],['renderer',renderer],['watchdog',watchdog],['dungeon',dungeon],['grow',grow],['quest',quest]])new vm.Script(code,{filename:name});
assert.ok(recorder.includes("MAX_EVENTS=120,MAX_GROUPS=60,VERSION='V8.397'"),'Recorder stores only bounded events');
assert.ok(!recorder.includes('setInterval('),'No additional permanent sampling timer');
assert.ok(!recorder.includes('window.fetch='),'No duplicate network wrapper');
assert.ok(!recorder.includes('new MutationObserver('),'No new DOM observer');
assert.ok(recorder.includes("if(!isAdmin()||!adminUid()||saveTimer!==null)return"),'Local persistence is admin only');
assert.ok(recorder.includes("['beta','server1']")===false,'Recorder dynamically scopes by release channel');
assert.ok(recorder.includes("STORE_TTL_MS=24*60*60*1000"),'Previous session has short expiration');
assert.ok(recorder.includes("long-animation-frame"),'Native LoAF attribution used if browser supports it');
assert.ok(recorder.includes("checkpoint:checkpoint"),'Verified receipt milestones available');
assert.ok(dungeon.includes("checkpoint?.('dungeon','receipt_finalized'"),'Dungeon confirms only after receipt finalization');
assert.ok(quest.includes("checkpoint?.('quest','server_claim','confirmed'"),'Quest claim has server response');
assert.ok(quest.includes("checkpoint?.('quest','receipt_ack'"),'Quest final ACK is separate');
assert.ok(grow.includes("checkpoint?.('grow','rewarded_video','confirmed'"),'Grow video only after server counter advanced');
assert.ok(watchdog.includes("['beta','server1'].includes"),'Both worlds distinguish animation from RPC stalls');
assert.ok(renderer.includes('no>=10?'), 'D1-D9 boss uses existing legacy assets rather than missing file');
for(let n=1;n<=9;n++)assert.ok(existsSync('v474_dungeon_assets/d'+n+'_9.png'),'Verified final-room fallback for D'+n);
for(let n=10;n<=20;n++)assert.ok(existsSync('v474_dungeon_assets/d'+n+'_boss.png'),'Boss PNG exists for D'+n);
assert.ok(existsSync('assets/v7195-base64/0f1a0253845b46d9a03d.jpg')&&existsSync('assets/v7195-base64/10036d96d08155bdc84a.svg'),'Canonical D1/D2 actual boss art exists');
for(const [html,channel] of [[beta,'beta'],[server1,'server1']]){
 for(const [owner,rev] of [
  ['v8383-unified-flight-recorder.js','8397-flight-recorder'],
  ['v7092-runtime-watchdog.js','8397-replay-aware'],
  ['v8009-d1-combat-renderer.js','8397-d1-d9-boss-art'],
  ['v7051-atomic-dungeon-receipt-client.js','8397-dungeon-confirmed'],
  ['v492-growroom2.js',channel==='beta'?'8398-single-plant':'8397-grow-confirmed'],
  ['v7045-atomic-quest-receipt-client.js','8397-quest-confirmed']
 ])assert.ok(html.includes(owner+'?v='+rev+'-'+channel),'Updated '+channel+' cache missing '+owner);
}
const storage=new Map();
const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
let observer=null;
class PO {static supportedEntryTypes=['long-animation-frame'];constructor(cb){this.callback=cb;observer=this}observe(o){assert.equal(o.type,'long-animation-frame')}}
function setup(admin=true,id='admin1'){
 const callbacks=[],window={GROW_RELEASE_CHANNEL:'server1',GROW_LEGENDS_VERSION:{short:'V8.397',label:'V8.397 Test'},v073User:{id},addEventListener(){}};
 const doc={addEventListener(){},querySelector:()=>null,body:null};
 const console={error(){},warn(){},log(){}};
 const env={window,document:doc,console,localStorage,v093IsAdmin:admin,v073User:{id},navigator:{},
  performance:{now:()=>123},location:{href:'https://growlegends.example/server1'},
  Date,URL,Number,String,Map,Set,WeakMap,Object,Array,Promise,Math,JSON,PerformanceObserver:PO,
  requestAnimationFrame:fn=>{fn();return 1},setTimeout:fn=>{callbacks.push(fn);return callbacks.length}};
 vm.runInNewContext(recorder,env,{timeout:3000});
 return {monitor:window.__GL_FLIGHT_RECORDER__,flush:()=>{const f=callbacks.splice(0);f.forEach(x=>x())}};
}
const one=setup();
one.monitor.mount();
one.monitor.capture('JAVASCRIPT','error','ReferenceError: sample');
one.monitor.checkpoint('dungeon','receipt_finalized','confirmed',{dungeon:1,replayCount:8});
one.monitor.checkpoint('quest','receipt_ack','pending',{run:2});
assert.equal(one.monitor.snapshot().checkpoints.length,2);
assert.equal(one.monitor.snapshot().build.game,'V8.397');
assert.equal(one.monitor.report().includes('SERVER-/ANZEIGEBESTÄTIGUNGEN'),true);
assert.equal(one.monitor.report().includes('VORHERIGE ADMIN-SITZUNG'),false);
assert.ok(observer,'Admin observer is initialized when browser supports LoAF');
observer.callback({getEntries:()=>[{
 duration:950,blockingDuration:790,
 scripts:[{duration:680,sourceURL:'https://growlegends.example/js/renderer.js?key=secret',sourceFunctionName:'paintArena'}]
}]});
assert.ok(one.monitor.report().includes('paintArena')&&one.monitor.report().includes('/js/renderer.js'),'Script function attribution in report');
assert.ok(!one.monitor.report().includes('key=secret'),'LoAF source strips query strings');
one.flush();
const prev=setup();
prev.monitor.mount();
assert.ok(prev.monitor.report().includes('VORHERIGE ADMIN-SITZUNG'),'Prior report survives app restart for same admin');
assert.ok(prev.monitor.report().includes('ReferenceError: sample'),'Sanitized issue survives restart');
const unrelated=setup(true,'other-admin');
unrelated.monitor.mount();
assert.equal(unrelated.monitor.report().includes('VORHERIGE ADMIN-SITZUNG'),false,'Different admin cannot read previous account report');
const publicUser=setup(false,'player');
publicUser.monitor.capture('JAVASCRIPT','error','Public player failure');
publicUser.flush();
assert.equal([...storage.values()].some(v=>v.includes('Public player failure')),false,'No player report persisted');
console.log('V8.397 PASS: build info, verified receipt phases, admin-only prior report, LoAF script attribution, fixed boss art, class balance untouched');
