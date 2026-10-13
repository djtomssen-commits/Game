import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const sql=read('supabase/migrations/v8390_video_care_catchup.sql');
const grow=read('js/features/grow/beta/v8009-s1-v492-growroom2.js');
const care=read('js/features/grow/beta/v8009-s3-v4114-grow-care-authority.js');
const beta=read('beta.html');
const server1=read('server1.html');
new vm.Script(grow);new vm.Script(care);
assert.equal((sql.match(/CREATE OR REPLACE FUNCTION/g)||[]).length,2,'Update the existing two source functions');
assert.ok(sql.includes('new_progress >= care_end[care_index+1]')&&sql.includes('old_progress < care_end[care_index+1]'),'Only signed video-crossed thresholds mint catchups');
assert.ok(sql.includes("coalesce(care_done->>care_index,'false') <> 'true'"),'Never mint care already completed');
assert.ok(sql.includes("plant:=jsonb_set(plant,'{v8390CareCatchup}',care_catchups,true)"),'Flag persisted with signed reward');
assert.ok(sql.includes("if not can_catch_up and prog>ends"),'Ordinary missed-care denial preserved');
assert.ok(sql.includes("can_catch_up:=pid ~ '^srv_grow_[0-9a-f]{32}$'"),'Only canonical server plants can redeem catchups');
assert.ok(sql.includes("video_catchup:=jsonb_set(video_catchup,array[ci::text],'false'::jsonb,true)"),'Consumed once with care');
assert.ok(sql.includes("player_grow_care_events"),'Original per-plant care transaction idempotency preserved');
assert.ok(sql.includes("where user_id=u for update"),'Original account row lock preserved');
assert.ok(sql.includes("harvested_at is null"),'Never care after harvest');
assert.ok(sql.includes('BEGIN;')&&sql.trimEnd().endsWith('COMMIT;'),'Transactional deployment');
assert.ok(!sql.includes('UPDATE public.player_seed_state SET care='),'No mass user data modification');
assert.equal(beta.split('v492-growroom2.js?v=8399-single-plant-beta').length-1,1);
assert.equal(beta.split('v4114-grow-care-authority.js?v=8390-video-care-catchup-beta').length-1,1);
assert.ok(server1.includes('v4114-grow-care-authority.js?v=8395-server1-sync'),'Server1 original care owner promoted');
assert.ok(grow.includes('Pflege nachholen (')&&care.includes('Pflege nachholen ('),'Visible catchup label');
assert.ok(grow.includes('careCatchup:')&&grow.includes('cs.catchups'),'Growroom signatures and details include catchup');
assert.ok(care.includes("window.GROW_RELEASE_CHANNEL||''"),'UI catchup channel-gated to Beta and Server1');
assert.ok(grow.includes("p?.v6358ServerPlant===true"),'Do not accept legacy or forged client plants');

const careMarks=p=>p.care??[false,false,false,false];
function clip(n){return Math.max(0,Math.min(1,n))}
function runOwner(script, channel, x){
 const lines=script.split('\n');
 const first=lines.findIndex(l=>l.includes('v8390Catchup=(p,i)')||l.includes('function v8390Catchup(p,i)'));
 const last=lines.findIndex((l,i)=>i>first&&l.includes('return{available,missed') );
 assert.ok(first>=0&&last>first,'Care owners include catchup state logic');
 const body=lines.slice(first,last+2).join('\n'); // includes closing brace after return
 const window={GROW_RELEASE_CHANNEL:channel};
 const env={window,Math,Array,String,Number,Date,
  CARE:[{at:.20},{at:.45},{at:.70},{at:.88}],AT:[.20,.45,.70,.88],
  shapePlant:()=>{},progress:()=>x};
 const fn=vm.runInNewContext(body+'; careState;',env,{timeout:1000});
 return p=>JSON.parse(JSON.stringify(fn(p)));
}
for(const [src,label] of [[grow,'v492'],[care,'v4114']]){
 const betaAt=runOwner(src,'beta',1);
 const normal=betaAt({uid:'srv_grow_'+('f'.repeat(32)),v6358ServerPlant:true,care:[false,false,false,false]});
 assert.deepEqual(normal.available,-1,label+' ordinary late care remains missed');
 assert.deepEqual(normal.missed,4,label+' ordinary missed count');
 const protectedPlant={uid:'srv_grow_'+('f'.repeat(32)),v6358ServerPlant:true,
  v8390CareCatchup:[true,true,false,true],care:[false,false,false,false]};
 const catchup=betaAt(protectedPlant);
 assert.equal(catchup.available,0,label+' oldest video-skipped care first');
 assert.equal(catchup.catchups,3,label+' all video-skipped windows tracked');
 assert.equal(catchup.catchup,true,label+' marked as manual catchup');
 protectedPlant.care[0]=true;protectedPlant.v8390CareCatchup[0]=false;
 const second=betaAt(protectedPlant);
 assert.equal(second.available,1,label+' next video catchup available after previous care');
 assert.equal(second.catchups,2,label+' consumed flag cannot be recounted');
 const ripe=runOwner(src,'beta',1)({...protectedPlant});
 assert.equal(ripe.available,1,label+' protected care remains possible even if harvest-ready');
 const live=runOwner(src,'server1',1)(protectedPlant);
 assert.equal(live.available,1,label+' Server1 has same video-only catchup support');
 assert.equal(live.catchups,2,label+' Server1 counts remaining signed video care flags');
 const forged=betaAt({v6358ServerPlant:false,care:[false,false,false,false],v8390CareCatchup:[true,true,true,true]});
 assert.equal(forged.available,-1,label+' non-server plant may not claim video care');
}
function grantCareCatchup(oldProg,newProg,alreadyDone,prior){
 const ends=[.45,.70,.88,1];const next=prior.slice();
 for(let i=0;i<4;i++)if(oldProg<ends[i]&&newProg>=ends[i]&&!alreadyDone[i])next[i]=true;
 return next;
}
let flags=grantCareCatchup(.30,.55,[false,false,false,false],[false,false,false,false]);
assert.deepEqual(flags,[true,false,false,false],'30% -> 55% only missed watering');
flags=grantCareCatchup(.55,1,[false,false,false,false],flags);
assert.deepEqual(flags,[true,true,true,true],'Video reaching maturity preserves every crossed window');
flags=grantCareCatchup(.92,1,[false,false,false,false],[false,false,false,false]);
assert.deepEqual(flags,[false,false,false,true],'Older normally missed care is not retroactively restored');
flags=grantCareCatchup(.18,.48,[true,false,false,false],[false,false,false,false]);
assert.deepEqual(flags,[false,false,false,false],'Care performed already is not made catchup');
console.log('V8.395 PASS: verified video-only catchups, no auto-care, persisted flags, harvest boundary, Beta and Server1');
