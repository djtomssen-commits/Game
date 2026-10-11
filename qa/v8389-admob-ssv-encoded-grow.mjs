import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {generateKeyPairSync,sign,verify} from 'node:crypto';

const source=readFileSync('supabase/functions/admob-rewarded-ssv/index.ts','utf8');
assert.ok(source.includes('let verified = await verifySignature(content, signature, keyId);'),'Original signed-raw verification stays first');
assert.ok(source.includes('/(?:^|&)custom_data=growlegends_grow25_v1%3[aA]/.test(content)'),'Fallback is restricted to encoded Grow SSV');
assert.ok(source.includes('await verifySignature(decodeURIComponent(content), signature, keyId)'),'Google getQuery decoded bytes are checked using ECDSA');
assert.ok(source.includes('if (!verified) return json({ ok: false, error: "INVALID_SIGNATURE" }, 403)'),'Fail closed');
assert.ok(source.includes('if (configuredSuffix !== adUnit && configuredUnit !== adUnit)'),'Unit guard remains');
assert.ok(source.includes('if (settings.reward_item && String(settings.reward_item) !== rewardItem)'),'Reward-item guard remains');
assert.ok(source.includes('v8388_grow_rewarded_apply_verified'),'Server-owned grow mutation retained');
assert.ok(source.includes('transactionId.length < 8'),'Transaction guard remains');

const keys=generateKeyPairSync('ec',{namedCurve:'prime256v1'});
const body='ad_network=1&ad_unit=2&custom_data=growlegends_grow25_v1:srv_grow_'+'a'.repeat(32)+
 '&reward_amount=1&reward_item=grow_bag&timestamp=123456789&transaction_id=000123456789&user_id=example';
const encoded=body.replace(':','%3A');
const signature=sign('sha256',Buffer.from(body,'utf8'),{key:keys.privateKey,dsaEncoding:'der'});
const check=bytes=>verify('sha256',Buffer.from(bytes,'utf8'),keys.publicKey,signature);
assert.equal(check(encoded),false,'Percent-encoded colon changes signed bytes');
assert.equal(check(decodeURIComponent(encoded)),true,'Decoded query matches Google URI.getQuery()');
assert.equal(check(decodeURIComponent(encoded.replace('reward_amount=1','reward_amount=9'))),false,'Tampering still fails');
assert.equal(check(body),true,'Legacy unencoded signed payload remains valid');
const legacy='ad_network=1&custom_data=growlegends_quest25_v1&timestamp=123456789';
const questSignature=sign('sha256',Buffer.from(legacy),{key:keys.privateKey,dsaEncoding:'der'});
assert.equal(verify('sha256',Buffer.from(legacy),keys.publicKey,questSignature),true);
console.log('V8.389 PASS: Google-percent-decoded Grow callback, genuine signature, tamper rejection, unchanged quest/adbag checks');
