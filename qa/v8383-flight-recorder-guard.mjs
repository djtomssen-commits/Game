import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=p=>readFileSync(p,'utf8');
const src=read('js/features/system/beta/v8383-unified-flight-recorder.js');
const beta=read('beta.html');
const server1=read('server1.html');
const tech=read('js/features/system/beta/v8009-s1-v4107-systemtechnik.js');
const watchdog=read('js/features/system/beta/v8009-s7-v7092-runtime-watchdog.js');
new vm.Script(src,{filename:'v8383-unified-flight-recorder.js'});

assert.equal(beta.split('id="v8383-unified-flight-recorder"').length-1,1,'Single Beta entry');
assert.equal(beta.split('v8383-unified-flight-recorder.js?v=8383-flight-beta').length-1,1,'Beta cache key');
assert.equal(server1.includes('v8383-unified-flight-recorder'),false,'Server1 remains unchanged');
assert.ok(tech.includes('window.__GL_FLIGHT_RECORDER__?.network?.({url,ms,status,method,failed:!ok&&status===0,expectedReject:expectedRpcReject})'),'Reuse the existing network observation');
assert.ok(watchdog.includes('window.__GL_FLIGHT_RECORDER__?.watchdog?.({kind,severity,details})'),'Reuse the existing server watchdog');
assert.equal(src.includes('setInterval('),false,'No extra recurring monitor timer');
assert.equal(src.includes('new MutationObserver('),false,'No recursive DOM monitor');
assert.equal(src.includes('window.fetch='),false,'No competing network transport wrapper');
assert.ok(src.includes('typeof v093IsAdmin'),'No user-facing error widget for non-admin users');
assert.ok(src.includes('role="dialog"')&&src.includes('Bericht kopieren'),'Admin can inspect and share diagnostics');
assert.ok(src.includes('MAX_EVENTS=120,MAX_GROUPS=60'),'Bounded telemetry memory');

const listeners={};
const fakeWindow={
 GROW_RELEASE_CHANNEL:'beta',
 addEventListener:(name,cb)=>{listeners[name]??=[];listeners[name].push(cb)},
 matchMedia:()=>({matches:false})
};
const fakeDocument={
 addEventListener:()=>{},
 querySelector:()=>null,
 body:null,
};
const fakeConsole={error:()=>{},warn:()=>{},log:()=>{}};
const env={window:fakeWindow,document:fakeDocument,performance:{now:()=>1000},
 location:{href:'https://example.org/tester'},URL,Date,Number,String,Object,Array,
 console:fakeConsole,requestAnimationFrame:()=>{},setTimeout:()=>{},navigator:{}};
vm.runInNewContext(src,env,{timeout:2500});
const monitor=fakeWindow.__GL_FLIGHT_RECORDER__;
assert.equal(monitor.version,'V8.383');
assert.equal(monitor.snapshot().errors,0);

monitor.network({url:'https://supabase.example/rest/v1/rpc/v6357_spend_attribute?apikey=SECRET',ms:3100,status:503,method:'POST'});
monitor.network({url:'https://supabase.example/rest/v1/rpc/v6357_spend_attribute?apikey=SECRET',ms:2800,status:503,method:'POST'});
assert.equal(monitor.snapshot().errors,1,'Same endpoint failures deduplicated');
assert.equal(monitor.snapshot().groups[0].count,2,'Repeated failures counted');
assert.equal(monitor.report().includes('SECRET'),false,'No query-string secrets in diagnostic exports');
monitor.capture('JAVASCRIPT','error','ReferenceError: missing variable');
monitor.capture('JAVASCRIPT','error','TypeError: different failure');
assert.equal(monitor.snapshot().errors,3,'Different JS errors remain separate incidents');
monitor.network({url:'https://supabase.example/rest/v1/rpc/v7077_progress_state',ms:3500,status:200,method:'GET'});
assert.equal(monitor.snapshot().warnings,1,'Slow successful RPC classified as warning');
monitor.watchdog({kind:'stalled_action',severity:'error',details:{action:'attribute_point',elapsedMs:5000}});
assert.equal(monitor.snapshot().errors,4,'Existing watchdog incident incorporated');
assert.ok(monitor.report().includes('ZEITLICHER VERLAUF'),'Copy report provides ordered incident history');
console.log('V8.383 PASS: Beta-only, syntax, single transport owner, watchdog integration, incident dedup, export and sensitive-URL redaction');
