import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const a=JSON.parse(read('qa/v8395-server1-promotion-asset-audit.json'));
const server1=read('server1.html'), beta=read('beta.html');
const sql=read('supabase/migrations/v8395_server1_grow_rewarded_promotion.sql');
const ssv=read('supabase/functions/admob-rewarded-ssv/index.ts');
const grow=read('js/features/grow/beta/v8009-s1-v492-growroom2.js');
const care=read('js/features/grow/beta/v8009-s3-v4114-grow-care-authority.js');
const bridge=read('js/features/authority/beta/v8009-s2-v7065-fail-closed-grow-authority-hotfix.js');
assert.equal(a.version,'V8.395');
assert.equal(a.promotedSharedAssets.length,108);
assert.equal(a.excludedProtectedAssets.length,32);
const escaped=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
for(const p of a.promotedSharedAssets){
 const version=p==='js/features/i18n/v8144-i18n-gameplay.js'?'8396-server1-i18n-tdz':
  p==='js/features/push/beta/v8009-s1-gl-push-scheduling-v2.js'?'8396-server1-push-serialize':
  '8395-server1-sync';
 assert.ok(server1.includes(p+'?v='+version),'Promoted source missing: '+p);
}
for(const p of a.excludedProtectedAssets){
 const links=[...server1.matchAll(/(?:src|href)="([^"]+)"/g)].map(x=>x[1]);
 assert.ok(links.some(x=>x.split('?')[0]===p&&!x.includes('8395-server1-sync')),'Protected class/combat/item source changed: '+p);
}
assert.ok(server1.includes('js/features/account/server1-release-channel.js'),'Server1 world selector remains');
assert.ok(server1.includes('js/features/admin/beta/v8243-admin-bot-management.js'),'Server1 bot manager remains');
assert.ok(!beta.includes('v8395-server1-sync'),'Beta entry is not modified by promotion');
assert.ok(server1.includes('css/features/hall/beta/v8009-s1-v6145-hall-pagination-css.css?v=8395-server1-podium'));
assert.ok(server1.includes('v8383-unified-flight-recorder.js?v=8395-server1-flight'));
assert.equal((sql.match(/CREATE OR REPLACE FUNCTION/g)||[]).length,2,'Only two existing Server1 functions promoted');
assert.ok(sql.includes('CREATE OR REPLACE FUNCTION server1.v8388_grow_rewarded_apply_verified'));
assert.ok(sql.includes('CREATE OR REPLACE FUNCTION server1.v6358_care_plant'));
assert.ok(sql.includes('round(duration_ms*.15/w)'),'15% of original duration');
assert.ok(sql.includes('used>=3'),'At most 3 videos per plant');
assert.ok(sql.includes('v8390CareCatchup'),'Server-signed skipped care is recoverable');
assert.ok(sql.includes('provider_event_id=tid'),'Google transaction deduplication');
assert.ok(sql.includes('FOR UPDATE'),'Canonical server plant row locking');
assert.ok(sql.includes('REVOKE ALL ON FUNCTION server1.v8388_grow_rewarded_apply_verified')&&
 sql.includes('TO service_role'),'Only server-side signed callback may credit time');
assert.ok(!sql.includes('CREATE OR REPLACE FUNCTION public.'),'Beta DB definitions remain untouched');
assert.ok(!sql.includes('UPDATE public.player_seed_state'),'No cross-world write');
assert.ok(ssv.includes('(:server1)?$/.exec(customData)'),'Explicit signed Server1 plant suffix');
assert.ok(ssv.includes('customData.endsWith(":server1")'),'SSV routes by signed world');
assert.ok(ssv.includes('if (!verified) return json({ ok: false, error: "INVALID_SIGNATURE" }, 403)'),'Signature cannot be bypassed');
assert.ok(ssv.includes('WRONG_AD_UNIT')&&ssv.includes('WRONG_REWARD_ITEM'),'AdMob unit/item safeguards retained');
assert.ok(grow.includes("customData:'growlegends_grow25_v1:'+id+(String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='server1'?':server1':'')"),'Server1 native AdMob uses world-scoped signed payload');
assert.ok(grow.includes('v8388EnabledWorld()'),'Both worlds show signed video slot');
assert.ok(bridge.includes("['beta','server1'].includes("),'Both worlds reject stale login RPC');
assert.ok(care.includes("['beta','server1'].includes("),'Both worlds redeem verified care skip');
for(const x of [grow,care,bridge])new vm.Script(x);
console.log('V8.395 PASS: Server1 108 promoted, 32 protected, signed SSV, 15%/3 ads, video-only care, login guard and Beta isolation');
