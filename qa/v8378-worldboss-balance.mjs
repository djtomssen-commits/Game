import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const sql=read('ops/database/v8378_beta_worldboss_full_upgrades.sql');
const js=read('js/features/worldboss/beta/v8009-s5-v291-worldboss-upgrades-balance.js');
const beta=read('beta.html'),live=read('server1.html');
assert.match(sql,/FUNCTION recovery_private\.v7104_worldboss_v6349_combat/);
assert.doesNotMatch(sql,/FUNCTION server1_private/);
assert.match(sql,/power\(\(gem_count::numeric\/6\.0\)\*\(enchant_count::numeric\/6\.0\),2\)/);
assert.match(sql,/ideal_damage\*11\.5/);
assert.match(sql,/ideal_hp\*\.125/);
assert.match(js,/\.54\+\.70\*pair\*pair\+\.08\*upgradeRatio/);
assert.match(js,/\['beta','server1'\]\.includes\(String\(window\.GROW_RELEASE_CHANNEL/);
assert.match(beta,/v291-worldboss-upgrades-balance\.js\?v=8378-full-upgrades-worldboss-beta/);
assert.doesNotMatch(live,/8378-full-upgrades-worldboss-beta/);
assert.match(live,/v291-worldboss-upgrades-balance\\.js\\?v=8378-worldboss-full-upgrades-server1/);
const sqlServer1=read('ops/database/v8378_server1_worldboss_full_upgrades.sql');
assert.match(sqlServer1,/FUNCTION server1_private\\.v7104_worldboss_v6349_combat/);
assert.doesNotMatch(sqlServer1,/FUNCTION recovery_private/);
for(const modelSql of [sql,sqlServer1]){
  assert.match(modelSql,/power\\(\\(gem_count::numeric\\/6\\.0\\)\\*\\(enchant_count::numeric\\/6\\.0\\),2\\)/);
  assert.match(modelSql,/ideal_damage\\*11\\.5/);
  assert.match(modelSql,/ideal_hp\\*\\.125/);
}
assert.doesNotMatch(sqlServer1,/INVENTORY_NOT_UPGRADED|MISSING_GEMS|MISSING_ENCHANTS/);
const mul=(g,e,q=.7)=>.54+.70*Math.pow((g/6)*(e/6),2)+.08*(.55*q*g/6+.45*q*e/6);
assert.ok(mul(0,0)<mul(5,5)&&mul(5,5)<mul(6,6));
assert.ok(mul(6,0)<mul(6,5)&&mul(0,6)<mul(5,6));
console.log('V8.378 Beta + Server1 authoritative formula, client preview, no-gate regression PASS');