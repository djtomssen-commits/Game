import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root=process.cwd();
const htmlPath=path.join(root,'index.html');
const html=fs.readFileSync(htmlPath,'utf8');
const failures=[];
const notes=[];

function check(ok,label,detail=''){
  if(ok) notes.push('OK  '+label+(detail?' — '+detail:''));
  else failures.push(label+(detail?' — '+detail:''));
}

const requiredScreens=['world','character','quests','dungeon','grow','guild','pvp','shop','bagDealer'];
for(const id of requiredScreens){
  check(new RegExp('id=["\\\']'+id+'["\\\']').test(html),'screen:'+id);
}
/* Tower is installed/owned by the tower runtime chain and may not be static in the
   base HTML at the same point as the ordinary screens. Verify the canonical owner
   plus its target contract instead of demanding a static section node. */
const towerOwnerRel='js/features/tower/beta/v8009-t1-tower-direct-preempt.js';
check(html.includes(towerOwnerRel),'tower owner loaded');
const towerOwner=fs.readFileSync(path.join(root,towerOwnerRel),'utf8');
check(towerOwner.includes("getElementById('tower')")||towerOwner.includes('#tower'),'tower target contract');

const requiredMarkers=[
  ['auth core','js/features/account/beta/v8009-s1-v200-stable-core.js?v=8102shopsavestrip1'],
  ['account isolation','js/features/account/beta/v8009-s8-v145-account-isolation-fix.js?v=8102shopsavestrip1'],
  ['atomic boot','js/features/system/beta/v8009-s14-v224-atomic-boot-release.js?v=8088criticalboot1'],
  ['save owner','js/features/account/beta/v8009-s1-v4136-account-save-owner.js?v=8102shopsavestrip1'],
  ['account authority','js/features/account/beta/v8009-s1-v4139-account-switch-authority.js'],
  ['idle logout','js/features/account/beta/v8009-s13-v301-auth-idle-hard-lock.js'],
  ['harz machine JS','js/features/shop/beta/v8010-harz-lotto.js?v=8012rewards1'],
  ['harz machine CSS','v8010-harz-lotto-v2.css?v=8011machine4']
];
for(const [label,needle] of requiredMarkers)check(html.includes(needle),label);

check(html.includes('<h2>Hinterhof-Dealer</h2>'),'dealer current title');
check(html.includes('Harz-Automat ist geöffnet. Tütchen &amp; Werbe-Belohnungen folgen später.'),'dealer current copy');
check(html.includes('data-v8010-tab="bags"')&&html.includes('COMING SOON'),'bags remain coming-soon');
check(!html.includes('Schau freiwillige Werbevideos, fülle besondere Tütchen'),'old visible bag-ad copy absent');
check(!html.includes('6 aus 50'),'old lotto 6/50 absent');
check(!html.includes('Dienstag 19'),'old lotto Tuesday draw absent');

const refs=[...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["']/gi)]
  .map(m=>m[1])
  .filter(x=>!/^https?:\/\//i.test(x)&&!/^data:/i.test(x)&&!x.startsWith('#'));
const local=[...new Set(refs.map(x=>x.split('?')[0]))];
for(const rel of local){
  const p=path.join(root,rel);
  check(fs.existsSync(p),'asset exists',rel);
}

const jsFiles=local.filter(x=>x.endsWith('.js'));
for(const rel of jsFiles){
  try{
    execFileSync(process.execPath,['--check',path.join(root,rel)],{stdio:'pipe'});
    notes.push('OK  syntax:'+rel);
  }catch(e){
    const detail=String(e?.stderr||e?.stdout||e?.message||'').trim().split('\n').slice(0,6).join(' | ');
    failures.push('syntax:'+rel+(detail?' — '+detail:''));
  }
}

const criticalOwners=[
  'js/features/account/beta/v8009-s1-v200-stable-core.js',
  'js/features/account/beta/v8009-s1-v4136-account-save-owner.js',
  'js/features/account/beta/v8009-s1-v4139-account-switch-authority.js',
  'js/features/account/beta/v8009-s13-v301-auth-idle-hard-lock.js',
  'js/features/shop/beta/v8010-harz-lotto.js'
];
for(const rel of criticalOwners){
  const p=path.join(root,rel);
  if(!fs.existsSync(p)){failures.push('critical owner missing:'+rel);continue}
  const c=fs.readFileSync(p,'utf8');
  check(!/<<<<<<<|=======|>>>>>>>/.test(c),'no merge markers',rel);
}

const authority=fs.readFileSync(path.join(root,'js/features/account/beta/v8009-s1-v4139-account-switch-authority.js'),'utf8');
check(authority.includes('v4139ReportPlayerQa'),'player QA reporter present');
check(authority.includes('v4139ReportRuntimeError'),'runtime reporter present');
check(authority.includes('v4139AccountStateHealthCheck'),'account health check present');

const saveOwner=fs.readFileSync(path.join(root,'js/features/account/beta/v8009-s1-v4136-account-save-owner.js'),'utf8');
check(saveOwner.includes('__V4136_LOGOUT_PREPARING__'),'idle/relogin logout preparation guard');
check(saveOwner.includes('logoutPromise'),'single-flight logout guard');

console.log('Grow Legends synthetic player smoke (no account / no character)');
console.log('Checks passed:',notes.length);
if(failures.length){
  console.error('\nFAILURES ('+failures.length+')');
  failures.forEach(x=>console.error(' - '+x));
  process.exit(1);
}
console.log('Result: PASS');
