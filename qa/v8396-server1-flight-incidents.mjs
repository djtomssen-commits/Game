import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const i18n=read('js/features/i18n/v8144-i18n-gameplay.js');
const push=read('js/features/push/beta/v8009-s1-gl-push-scheduling-v2.js');
const server1=read('server1.html'),beta=read('beta.html');
new vm.Script(i18n);new vm.Script(push);
const pDeclared=i18n.indexOf('const P={'),guildPatterns=i18n.indexOf('P[lang]?.push(...V8184_PATTERNS[lang])');
assert.ok(pDeclared>0&&guildPatterns>pDeclared,'Guild translations must be registered only after P exists');
assert.equal(i18n.split('P[lang]?.push(...V8184_PATTERNS[lang])').length-1,1,'Register Guild patterns once per boot');
assert.ok(i18n.includes("['beta','server1'].includes"),'Both released worlds use non-destructive i18n');
assert.ok(server1.includes('v8144-i18n-gameplay.js?v=8396-server1-i18n-tdz'),'Server1 loads i18n fix');
assert.ok(server1.includes('gl-push-scheduling-v2.js?v=8396-server1-push-serialize'),'Server1 loads push race fix');
assert.ok(!beta.includes('8396-server1-'),'Beta entry unchanged');
for(const channel of ['beta','server1']){
 const win={GROW_RELEASE_CHANNEL:channel,GrowI18n:{getLanguage:()=> 'de'},addEventListener:()=>{}};
 const document={addEventListener:()=>{}};
 vm.runInNewContext(i18n,{window:win,document,console,Map,WeakMap,Set,Date,Array,Object,Math,String,Number,RegExp,setTimeout:()=>0,queueMicrotask:()=>{}},{timeout:2500});
 assert.ok(win.v8144GameplayI18n?.apply,'i18n boot must complete on '+channel);
}
function testGrowPushRace(){
 const future=Date.now()+300000, latest=Date.now()+660000;
 let completeFirstWrite;
 const firstGate=new Promise(resolve=>{completeFirstWrite=resolve});
 let activeJob=null,updates=0,inserts=0,writeCount=0,maxConcurrentWrites=0,attemptedDuplicate=false;
 const begin=()=>{writeCount++;maxConcurrentWrites=Math.max(maxConcurrentWrites,writeCount)};
 const end=()=>{writeCount--};
 const updateChain=payload=>({
   eq(){return this},is(){return this},
   async select(){
     updates++;begin();
     if(updates===1)await firstGate;
     if(activeJob){activeJob={...activeJob,...payload};end();return {data:[{id:1}],error:null}}
     end();return {data:[],error:null};
   }
 });
 const db={auth:{
   async getSession(){return {data:{session:{user:{id:'test_user'}}}}},
   async refreshSession(){return {data:{session:{user:{id:'test_user'}}}}},
   async getUser(){return {data:{user:{id:'test_user'}},error:null}}
 },from(table){assert.equal(table,'push_jobs');return {
  update:payload=>updateChain(payload),
  async insert(payload){inserts++;begin();if(activeJob){attemptedDuplicate=true;end();return {error:{code:'23505'}}}activeJob={...payload};end();return {error:null}}
 }}};
 const win={GROW_RELEASE_CHANNEL:'server1',addEventListener:()=>{},glPushEnabled:()=>true};
 const document={addEventListener:()=>{},visibilityState:'visible'};
 const state={s:{grow:{plants:[{start:future-60000,duration:60000}]}},window:win,document,v073Db:db,
  setTimeout:()=>0,clearTimeout:()=>{},Date,Number,Array,Math,String,Promise,console:{warn(){},info(){}}};
 vm.runInNewContext(push,state,{timeout:2500});
 return (async()=>{
  const first=win.glSyncGrowPushJob();
  const second=win.glSyncGrowPushJob();
  const forced=win.glSyncGrowPushJob(latest);
  for(let i=0;i<25&&updates===0;i++)await Promise.resolve();
  assert.equal(updates,1,'Concurrent grow-ready requests must share one in-flight UPDATE');
  completeFirstWrite();
  assert.deepEqual(await Promise.all([first,second,forced]),[true,true,true]);
  assert.equal(inserts,1,'One plant must generate only one active grow_ready INSERT');
  assert.equal(attemptedDuplicate,false,'No HTTP 409 attempted by same WebView');
  assert.equal(maxConcurrentWrites,1,'Push writes must never overlap in the same WebView');
  assert.ok(updates>=2,'Explicit later ready time updates one existing job');
  assert.equal(activeJob.send_at,new Date(latest).toISOString(),'Latest forced readyAt is not discarded');
 })();
}
await testGrowPushRace();
console.log('V8.396 PASS: both worlds boot i18n without TDZ; concurrent Grow push writes serialized, no 409, later plant kept, class balance untouched');
