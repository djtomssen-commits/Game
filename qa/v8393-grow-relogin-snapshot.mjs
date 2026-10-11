import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(path,'utf8');
const owner=read('js/features/authority/beta/v8009-s2-v7065-fail-closed-grow-authority-hotfix.js');
const ui=read('js/features/grow/beta/v8009-s1-v492-growroom2.js');
const beta=read('beta.html'),server1=read('server1.html');
const podium=read('css/features/hall/beta/v8009-s1-v6145-hall-pagination-css.css');
new vm.Script(owner);new vm.Script(ui);
assert.ok(owner.includes("GROW_SESSION_CHANGED_DURING_REFRESH"),'Same-session race protected');
assert.ok(owner.includes('v8393SnapshotCurrent()'),'Readiness checks actual state identity');
assert.ok(ui.includes('canonicalGrow?.snapshotCurrent'),'Direct Grow view blocks stale state');
assert.ok(beta.includes('v7065-fail-closed-grow-authority-hotfix.js?v=8394-login-abort-benign-beta'));
assert.ok(beta.includes('v492-growroom2.js?v=8393-relogin-canonical-beta'));
assert.ok(!server1.includes('8393-relogin-canonical-beta'),'No Server1 activation');
assert.ok(beta.includes('8392-top3-medals-beta'),'Hall beta-specific owner');
assert.ok(!server1.includes('8392-top3-medals-beta'),'Old hall skin remains on server1');
for(const color of ['#ffd45a','#d0e0eb','#e49a63'])assert.ok(podium.includes(color));
assert.ok(ui.includes('🎬 Pflanzenzeit −15 %'),'Video duration unchanged');

function setup(channel='beta'){
 const listeners=new Map();
 const state={grow:{roomLevel:1,equipment:{lamp:0,pots:0},plants:[]}};
 let onRpc=async()=>({ok:true,plants:[],grow_seeds:{},grow_state:{room_level:4,lamp_level:5,pots_level:5}});
 const win={
  GROW_RELEASE_CHANNEL:channel,
  v7081UseAuthority:()=>true,
  v7206StartupBusy:()=>false,
  addEventListener:(name,fn)=>{const arr=listeners.get(name)||[];arr.push(fn);listeners.set(name,arr)},
  setTimeout:()=>0
 };
 const sandbox={window:win,s:state,v073User:{id:'accountA',is_anonymous:false},
  v073Db:{rpc:async()=>({data:await onRpc(),error:null})},
  document:{getElementById:()=>null},setInterval:()=>0,setTimeout:()=>0,clearTimeout:()=>{},
  console:{warn:()=>{}},Promise,Date,Math,JSON,Number,Array,Map,String,Error};
 vm.runInNewContext(owner,sandbox);
 return {win,state,sandbox,listeners,setRpc:fn=>{onRpc=fn}};
}

const t=setup();
assert.equal(t.win.v7065GrowAuthorityDiagnostics().ready,false,'Not ready before first canonical read');
await t.win.v7065GrowAuthorityRefresh();
assert.equal(t.state.grow.roomLevel,4,'Room level from server');
assert.equal(t.state.grow.equipment.lamp,5,'Lamp upgrade from server');
assert.equal(t.state.grow.equipment.pots,5,'Pots upgrade from server');
assert.equal(t.win.v7065GrowAuthorityDiagnostics().ready,true,'Server snapshot current');

// Regression: same account, but login replaced object with default values.
t.state.grow={roomLevel:1,equipment:{lamp:0,pots:0},plants:[]};
assert.equal(t.win.v7065GrowAuthorityDiagnostics().ready,false,'Same-uid fresh shell cannot masquerade as ready');
assert.equal(t.win.v7065GrowAuthorityDiagnostics().snapshotCurrent,false);
await t.win.v7065GrowAuthorityRefresh();
assert.equal(t.state.grow.roomLevel,4,'Recovered room upgrade');
assert.equal(t.state.grow.equipment.lamp,5,'Recovered lamp upgrade');
assert.equal(t.win.v7065GrowAuthorityDiagnostics().ready,true);

const emit=(name)=>{for(const fn of t.listeners.get(name)||[])fn({detail:{reason:'logout'}})};
emit('growlegends:account-transition-reset');
assert.equal(t.win.v7065GrowAuthorityDiagnostics().ready,false,'Logout revokes canonical ready');
assert.equal(t.win.v7065GrowAuthorityDiagnostics().enabled,false);

// A late response from an earlier login must not be applied after reset.
let resolveDelayed;
t.setRpc(()=>new Promise(resolve=>{resolveDelayed=resolve}));
const pending=t.win.v7065GrowAuthorityRefresh();
await Promise.resolve();await Promise.resolve();
emit('growlegends:account-transition-reset');
t.state.grow={roomLevel:1,equipment:{lamp:0,pots:0},plants:[]};
resolveDelayed({ok:true,plants:[],grow_seeds:{},grow_state:{room_level:4,lamp_level:5,pots_level:5}});
assert.equal(await pending,null,'Stale same-uid RPC result rejected');
assert.equal(t.win.v7065GrowAuthorityDiagnostics().lastError,'','Expected session invalidation is not a bridge error');
assert.equal(t.win.v7065GrowAuthorityDiagnostics().expectedSessionAborts,1,'Expected invalidations remain measurable in diagnostics');
assert.equal(t.state.grow.roomLevel,1,'Stale reply never applies');
assert.equal(t.win.v7065GrowAuthorityDiagnostics().ready,false);
t.setRpc(async()=>({ok:true,plants:[{uid:'srv_grow_'+ 'a'.repeat(32)}],grow_seeds:{},grow_state:{room_level:4,lamp_level:5,pots_level:5}}));
await t.win.v7065GrowAuthorityRefresh();
assert.equal(t.state.grow.roomLevel,4,'New session hydration recovers slots');
assert.equal(t.state.grow.plants.length,1,'New session hydration recovers plants');
assert.equal(t.win.v7065GrowAuthorityDiagnostics().ready,true);

// The server must not make a missing upgrade payload appear as a fresh zero.
t.setRpc(async()=>({ok:true,plants:[],grow_seeds:{},grow_state:{room_level:4,lamp_level:null,pots_level:5}}));
assert.equal(await t.win.v7065GrowAuthorityRefresh(),null,'Incomplete snapshot rejected');
assert.equal(t.state.grow.equipment.lamp,5,'No zero from incomplete response');

// No activation on Server1 even though canonical code asset is shared.
const live=setup('server1');
await live.win.v7065GrowAuthorityRefresh();
live.state.grow={roomLevel:1,equipment:{lamp:0,pots:0},plants:[]};
assert.equal(live.win.v7065GrowAuthorityDiagnostics().snapshotCurrent,true,'Server1 original ready semantics unchanged');
console.log('V8.393 PASS: Growroom snapshot / re-login / stale RPC / missing upgrades / Beta-only Hall');
