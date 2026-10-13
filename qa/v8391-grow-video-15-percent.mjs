import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(p,'utf8');
const prior=read('supabase/migrations/v8390_video_care_catchup.sql');
const migration=read('supabase/migrations/v8391_grow_rewarded_15_percent.sql');
const grow=read('js/features/grow/beta/v8009-s1-v492-growroom2.js');
const beta=read('beta.html'),server1=read('server1.html');
const qaVideo=read('qa/v8388-grow-video-skip.mjs');
const qaCare=read('qa/v8390-video-care-catchup.mjs');
new vm.Script(grow,{filename:'v492-growroom2.js'});

function onlyReward(sql){
 const start=sql.indexOf('CREATE OR REPLACE FUNCTION public.v8388_grow_rewarded_apply_verified');
 const end=sql.indexOf('CREATE OR REPLACE FUNCTION public.v6358_care_plant',start+12);
 assert.ok(start>=0);
 return sql.slice(start,end>=0?end:sql.lastIndexOf('COMMIT;')).trim();
}
const expected=onlyReward(prior)
 .replace('Every ad skips one-quarter of the ORIGINAL growth length.','V8.391: Every signed ad skips 15 percent of the ORIGINAL growth length.')
 .replace('round(duration_ms*.25/w)','round(duration_ms*.15/w)');
assert.equal(onlyReward(migration),expected,'Only percentage and comment changed in existing server function');
assert.equal((migration.match(/CREATE OR REPLACE FUNCTION/g)||[]).length,1,'Only original signed reward function redefined');
assert.ok(migration.trim().startsWith('-- V8.391')&&migration.includes('\nBEGIN;\n')&&migration.trim().endsWith('COMMIT;'),'Transactionally deployed');
assert.ok(migration.includes('v8390CareCatchup'),'Video-based care catchups still minted');
assert.ok(migration.includes("coalesce(care_done->>care_index,'false') <> 'true'"),'No automatic care completion');
assert.ok(migration.includes("used>=3"),'Three video cap unchanged');
assert.ok(migration.includes("provider_event_id=tid"),'Idempotent Google receipt unchanged');
assert.ok(migration.includes("FROM public.player_seed_state"),'Original authoritative player data');
assert.ok(!migration.includes('UPDATE public.player_seed_state SET care='),'No player data migration');
assert.ok(grow.includes('🎬 Pflanzenzeit −15 %'),'Beta button copy');
assert.ok(grow.includes('15 % der ursprünglichen Wachstumszeit'),'Reward popup copy');
assert.ok(!grow.includes('🎬 Pflanzenzeit −25 %'),'No obsolete plant label');
assert.equal(beta.split('v492-growroom2.js?v=8398-single-plant-beta').length-1,1);
assert.equal(server1.includes('8391-grow-video-15-percent-beta'),false,'Server1 entry unchanged');
assert.ok(qaVideo.includes('v492-growroom2.js?v=8397-grow-confirmed-beta'),'V8.388 feature tests kept');
assert.ok(qaCare.includes('v492-growroom2.js?v=8397-grow-confirmed-beta'),'V8.390 care tests kept');

function calculate(originalMs,alreadyElapsedMs,used){
 let remaining=originalMs-alreadyElapsedMs,skipped=0;
 for(let i=0;i<used;i++){
  const oneSkip=Math.min(remaining,Math.max(1,Math.round(originalMs*.15)));
  remaining-=oneSkip;skipped+=oneSkip;
 }
 return {remaining,skipped};
}
assert.deepEqual(calculate(80*60000,30*60000,1),{remaining:38*60000,skipped:12*60000});
assert.deepEqual(calculate(80*60000,30*60000,3),{remaining:14*60000,skipped:36*60000});
assert.deepEqual(calculate(60*60000,58*60000,1),{remaining:0,skipped:2*60000},'Never skip past harvest');
assert.equal(calculate(80*60000,0,3).skipped,36*60000,'Three ads skip 45% maximum of original');
console.log('V8.391 PASS: original server-only 15% duration, 3 uses max 45%, care-catchup untouched, Beta-only copy/cache');
