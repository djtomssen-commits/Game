import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const source=read('js/features/book/beta/v8009-s2-v106-illegal-book.js');
const beta=read('beta.html'),live=read('server1.html');
new vm.Script(source,{filename:'v106-illegal-book.js'});
assert.equal(beta.split('v106-illegal-book.js?v=8387-achievement-snapshot-beta').length-1,1,'Beta cache missing');
assert.equal(live.includes('v106-illegal-book.js?v=8387-achievement-snapshot-beta'),false,'Server1 must retain old entry');
assert.ok(source.includes('v8387AttributeAchievementCount'), 'Original V106 source must use authoritative count');
assert.ok(source.includes('String(d.serverUid||\'\')===currentUid'), 'Account isolation required');
assert.ok(source.includes('String(window.GROW_RELEASE_CHANNEL||\'\').toLowerCase()!==\'beta\''),'Beta-only behavior');

function run(channel){
 const s={playerClass:'grower',v106Achievements:{done:{},stats:{}}};
 const serverDone=Object.fromEntries(Array.from({length:64},(_,i)=>['achievement_'+i,{at:1}]));
 const diag={ready:false,enforce:false,serverUid:'userA',serverDone};
 const window={GROW_RELEASE_CHANNEL:channel,v073User:{id:'userA'},
  v7080AchievementDiagnostics:()=>diag,addEventListener:()=>{}};
 const document={hidden:false,readyState:'loading',addEventListener:()=>{},querySelector:()=>null};
 const state={s,window,document,plantSelectedSeed:()=>{},claimQuest:()=>{},
  totalAttr:(k)=>k==='staerke'?452.28:255,setInterval:()=>0,
  setTimeout:()=>0,localStorage:{setItem(){}},Math,Number,String,Object,
  Array,JSON,Date,console:{warn(){},error(){},log(){}}};
 vm.runInNewContext(source,state,{timeout:2500});
 return {state,s,window,diag,serverDone};
}
const betaApp=run('beta');
const {state,s,diag,serverDone}=betaApp;
assert.equal(state.totalAttr('staerke'),452.28,'Fallback before server authority ready remains unchanged');
s.v106Achievements.done={...serverDone};diag.ready=true;diag.enforce=true;
assert.equal(state.totalAttr('staerke'),516.28,'Authoritative successes included exactly once');
s.v106Achievements={done:{},stats:{}};
assert.equal(state.totalAttr('staerke'),516.28,'Transient local hydration may not erase 64 confirmed successes');
assert.equal(state.totalAttr('ausdauer'),255,'Success count applies only to the main attribute');
assert.equal(Object.keys(s.v106Achievements.done).length,0,'Diagnostic calculator never modifies player state');
diag.serverUid='otherUser';
assert.equal(state.totalAttr('staerke'),452.28,'Never use another account server snapshot');
diag.serverUid='userA';diag.enforce=false;
assert.equal(state.totalAttr('staerke'),452.28,'Fallback preserves previous client-only mode');
const liveApp=run('server1');
liveApp.s.v106Achievements.done={};
liveApp.diag.ready=true;liveApp.diag.enforce=true;
assert.equal(liveApp.state.totalAttr('staerke'),452.28,'Server1 keeps original local calculation');
console.log('V8.387 PASS: canonical achievement contribution, hydration stability, no reward mutation, account/channel isolation');
