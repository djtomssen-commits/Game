import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const src=readFileSync('js/features/system/beta/v8009-s7-v7092-runtime-watchdog.js','utf8');
const beta=readFileSync('beta.html','utf8');
const live=readFileSync('server1.html','utf8');
new vm.Script(src,{filename:'v7092-runtime-watchdog.js'});
assert.ok(beta.includes('v7092-runtime-watchdog.js?v=8385-phase-aware-beta'),'Beta loads new Watchdog');
assert.ok(!live.includes('v7092-runtime-watchdog.js?v=8385-phase-aware-beta'),'Server1 entry unchanged');
assert.ok(src.includes("['tower_action','tower_fight','dungeon_fight']"),'Only expected combat actions are phase aware');
assert.ok(src.includes("r.phase==='replay'||r.phase==='door_open'"),'Replay is not classified as an ordinary network stall');
assert.ok(src.includes("30000-(now()-r.start)"),'True replay hang retains a 30 second maximum');

function env(channel){
 let ms=0,nextId=0;
 const pending=new Map();
 const fakeDate=class extends Date{static now(){return ms}};
 const element={classList:{contains:()=>false}};
 const document={
  querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null,
  getElementsByTagName:()=>[],visibilityState:'visible'
 };
 const window={GROW_RELEASE_CHANNEL:channel,addEventListener:()=>{}};
 const noop=()=>{};
 const context={window,document,Date:fakeDate,
  performance:{now:()=>ms},setTimeout:(cb,delay)=>{const id=++nextId;pending.set(id,{cb,at:ms+Number(delay)});return id},
  clearTimeout:id=>pending.delete(id),
  setInterval:noop,clearInterval:noop,console:{warn:noop,error:noop,log:noop},
  Math,JSON,Object,Number,String,Array,Map,WeakMap,Set,Promise};
 vm.runInNewContext(src,context,{timeout:2000});
 function advance(t){
  if(t<ms)throw Error('time reversal');
  for(let i=0;i<100;i++){
   const due=[...pending.entries()].filter(([,v])=>v.at<=t).sort((a,b)=>a[1].at-b[1].at)[0];
   if(!due)break;
   ms=due[1].at;pending.delete(due[0]);due[1].cb();
   if(i===99)throw Error('timer storm');
  }
  ms=t;
 }
 return {wd:window.__GL_RUNTIME_WATCHDOG__,advance,get ms(){return ms},pending};
}
const fresh=env('beta');
let turn=fresh.wd.begin('tower_action',{screen:'tower',action:'choose'},{slowMs:2200,stallMs:6500});
fresh.advance(350);turn.phase('server');
fresh.advance(700);turn.phase('replay');
fresh.advance(7000);turn.phase('apply');
fresh.advance(7500);turn.end({ok:true});
let diag=fresh.wd.diagnostics();
assert.ok(!diag.recent.some(x=>x.kind==='stalled_action'),'Normal tower replay cannot generate a false stall');
assert.ok(!diag.recent.some(x=>x.kind==='slow_action'),'Normal replay avoids false slow-server signal');
let done=diag.recent.filter(x=>x.kind==='action').at(-1);
assert.ok(done.replayMs>6000 && done.nonReplayMs<1200,'Recorder accounts for replay separately');

const server=env('beta');
turn=server.wd.begin('tower_action',{screen:'tower',action:'choose'},{slowMs:1500,stallMs:6500});
server.advance(0);turn.phase('server');
server.advance(7000);
diag=server.wd.diagnostics();
assert.ok(diag.recent.some(x=>x.kind==='stalled_action'),'Blocked server retains severe stall signal');
turn.end({ok:false});

const hung=env('beta');
turn=hung.wd.begin('dungeon_fight',{screen:'dungeon'},{slowMs:2200,stallMs:6500});
hung.advance(100);turn.phase('replay');
hung.advance(31000);
diag=hung.wd.diagnostics();
assert.ok(diag.recent.some(x=>x.kind==='stalled_action'),'Replay over 30 seconds remains an error');
turn.end({ok:false});
assert.ok(hung.pending.size<=1,'One-shot replay guard cleaned up');

const prod=env('server1');
turn=prod.wd.begin('tower_action',{screen:'tower'},{slowMs:2200,stallMs:6500});
prod.advance(100);turn.phase('replay');
prod.advance(7000);
assert.ok(prod.wd.diagnostics().recent.some(x=>x.kind==='stalled_action'),'Server1 behavior unaffected');
turn.end();
console.log('V8.385 PASS: Beta replay-aware combat watchdog, 30s real hang detection, server stall, Server1 isolation');
