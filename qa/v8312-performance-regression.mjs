// V8.312: static performance regression for BOTH shipped entrypoints.
// Not a mobile WebView/CPU/GPU benchmark and not an authenticated gameplay test.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const errors=[];
const check=(ok,label)=>{if(!ok)errors.push(label)};
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const attr=(tag,name)=>{
  const match=tag.match(new RegExp(name+'="([^"]+)"','i'));
  return match?.[1]||'';
};
const normalize=(ref)=>{
  const name=decodeURIComponent(ref.split('?')[0].split('#')[0]);
  return name.startsWith('./')?name.slice(2):name;
};
const scriptFiles=new Set(),cssFiles=new Set(),entryMetrics=[];
for(const entry of ['beta.html','server1.html']){
  const html=read(entry);
  const scriptPaths=[],cssPaths=[];
  for(const item of html.matchAll(/<(?:script|link)\b[^>]*>/gi)){
    const tag=item[0];
    if(/^<script\b/i.test(tag)){
      const src=attr(tag,'src');
      if(src&&!/^https?:|^data:/i.test(src))scriptPaths.push(normalize(src));
    }else if(attr(tag,'rel').toLowerCase()==='stylesheet'){
      const href=attr(tag,'href');
      if(href&&!/^https?:|^data:/i.test(href))cssPaths.push(normalize(href));
    }
  }
  check(new Set(scriptPaths).size===scriptPaths.length,entry+' duplicate JS');
  check(new Set(cssPaths).size===cssPaths.length,entry+' duplicate CSS');
  const homeCache=entry==='beta.html'?'8337-retire-legacy-hud-menu-beta':'8315-trace-hook';
  check(html.includes('v8009-home-renderer.js?v='+homeCache),entry+' home cache');
  if(entry==='beta.html')check(html.includes('v7288-home-adaptive-fit-script.js?v=8326-beta-height-stable'),entry+' fit cache');
  check(html.includes('v6118-event-x2-worldboss-design-css.css?v=8312-home-perf1'),entry+' boss cache');
  scriptPaths.forEach(x=>scriptFiles.add(x));
  cssPaths.forEach(x=>cssFiles.add(x));
  entryMetrics.push({entry,scripts:scriptPaths.length,styles:cssPaths.length});
}
const missing=[],badSyntax=[];
let jsBytes=0,cssBytes=0;
const areas=new Map();
for(const file of [...scriptFiles].sort()){
  if(!fs.existsSync(file)){missing.push(file);continue}
  const source=read(file);
  const bytes=Buffer.byteLength(source);
  jsBytes+=bytes;
  const area=file.match(/(?:^|\/)features\/([^/]+)/)?.[1]||'other';
  const rec=areas.get(area)||{scripts:0,bytes:0};
  rec.scripts++;rec.bytes+=bytes;areas.set(area,rec);
  try{new vm.Script(source,{filename:file})}
  catch(e){badSyntax.push(file+': '+String(e.message||e).slice(0,120))}
}
for(const file of [...cssFiles].sort()){
  if(!fs.existsSync(file)){missing.push(file);continue}
  cssBytes+=fs.statSync(file).size;
}
check(missing.length===0,'Missing assets: '+missing.slice(0,8).join(', '));
check(badSyntax.length===0,'JS syntax failures: '+badSyntax.slice(0,8).join('; '));
const beta=read('beta.html');
const home=read('js/features/home/beta/v8009-home-renderer.js');
const homeFit=read('js/system/performance/v7288-home-adaptive-fit-script.js');
const boss=read('v8009-extracted-v6118-event-x2-worldboss-design-css.css');
const bossCard=read('v8009-extracted-v6123-worldboss-slot-feinschliff-css.css');
check(home.includes("s?.energy,'wallet-header','wallet-header'"),'Wallet-only repaint path regressed');
check(home.includes('diagnostics.energyDirectPatches++'),'Energy patch missing');
check(home.includes('i===17||i===18')&&home.includes('previous[17]'),'Event signature positions moved');
check(homeFit.includes('parts[24]=weekly')&&homeFit.includes('parts[25]'),'Home signature consumer changed');
check(home.split('setTimeout(()=>repairHomeTitles(),450)').length===2,'Duplicate home title retries');
check(home.includes('v366-panel v8310-cup-results-slot'),'Grow Cup tile contract changed');
check(home.includes('diagnostics.currentGridRetentions++')&&home.includes('retainCurrentGridDuringRefresh'),'Stable Aktuelles owner missing');
check(home.includes('world.dataset.v8314CurrentAccount'),'Account-safe grid invalidation missing');
check(boss.includes('animation:none!important')&&boss.includes('animation:v6118LiveDot'),'Boss shadow paint fix regressed');
check(bossCard.includes('flex:0 0 32px!important'),'Boss action-button contract changed');
check(home.includes("if(!force&&!world.classList.contains('active'))"),'Inactive-world guard removed');
/* V8.337: no shadow V366 Home HUD or diagnostic serialization hot loops. */
const capabilities=read('js/features/account/beta/v8009-s12-v7081-account-capability-gate.js');
const bridge=read('js/features/authority/beta/v8009-s1-v7042-unified-authority-bridge.js');
const hudCss=read('v8009-extracted-v372-authoritative-header-css.css');
const hudJs=read('js/features/ui/beta/v8009-s7-v372-authoritative-header.js');
check(home.includes('legacy.remove()')&&!home.includes("bar.innerHTML="),'Beta Home still builds an obsolete second header');
check(capabilities.includes('caps:{...C.caps}')&&!capabilities.includes('JSON.parse(JSON.stringify(C))'),'Capability diagnostics still stringify+parse every call');
check(bridge.includes('diagnosticRowSnapshot')&&bridge.includes('freezeDiagnosticValue'),'Authority diagnostics still deep-clone every read');
check(hudCss.includes('html body.v8011-beta-unified-headers.v371-game-ui .app > header,'),'Beta legacy header still reserves layout space');
check(hudJs.includes("panel.classList.remove('open','show')")&&hudJs.includes("panel.style.removeProperty(prop)"),'Navigation does not clear ghost menu inline display');
check(hudJs.includes("legacy.style.setProperty('display','none','important')"),'V8.338 must eliminate old header inline-important layout footprint');
const tech=read('js/features/system/beta/v8009-s1-v4107-systemtechnik.js');
check(tech.includes("const basename=match[1].split('/').pop().split(/[?#]/)[0]"),'V8.338 must resolve JSON caller cache-query URLs and SDK bundles');
check(beta.includes('v8009-s1-v4107-systemtechnik.js?v=8346-loaf-phases-navigation-beta'),'V8.344 profiler cache not updated');
check(tech.includes('const longShort=long.filter(x=>x.ms>=50&&x.ms<100).length')&&
  tech.includes('...longPrint.map(x=>'),'V8.340 profiler must print measured 50-99ms long tasks');
check(tech.includes("'LONGTASK-BEREICHE: 50–99 ms '"),'V8.340 profiler must explain longtask thresholds');
check(!tech.includes('...long.filter(x=>x.ms>=100).slice(-25).map(x=>'),
  'V8.340 profiler must not hide 50-99ms entries after counting them');
/* V8.339: never use v7133AuthorityDiagnostics inside the v4139 diagnostic
   because v7133 includes v4139LoginAuthorityDiagnostics in its own result. */
const accountOwner=read('js/features/account/beta/v8009-s1-v4139-account-switch-authority.js');
const domainsStart=accountOwner.indexOf('function authorityDomains(){');
const domainsEnd=accountOwner.indexOf('\n function allAuthorityEnforced()',domainsStart);
const domainsBody=accountOwner.slice(domainsStart,domainsEnd);
check(domainsStart>=0&&domainsEnd>domainsStart,'V8.339 account domain function missing');
check(domainsBody.includes('try{return window.v7040AuthorityDiagnostics?.()?.domains||{}}')&&
  !/try\s*\{\s*return\s+window\.v7133AuthorityDiagnostics/.test(domainsBody),
  'V8.339 account domain gate must read v7040 directly, not recursive v7133');
check(beta.includes('v8009-s1-v4139-account-switch-authority.js?v=8339-break-diag-cycle-beta'),
  'V8.339 account diagnostic fix missing cache bust');
/* V8.341: v4149 and v7119 must not dispatch duplicate CHARACTER events. */
const navOwner=read('js/features/system/beta/v8009-s8-v4149-final-navigation-render-authority.js');
check(navOwner.includes("if(!(id==='character'&&window.__V7119_CHARACTER_NAV_CONSOLIDATION__===true))"),
  'V8.341 character navigation deduplication was removed');
check(beta.includes('v8009-s8-v4149-final-navigation-render-authority.js?v=8341-single-character-nav-beta'),
  'V8.341 final navigation owner cache key missing');
/* V8.342: canonical character hub must keep unchanged item/icon DOM intact,
   avoid the duplicate tab refresh within renderInventory and character nav. */
const characterHub=read('js/features/character/beta/v8009-s2-v459-character-hub.js');
check(characterHub.includes('if(name.childElementCount!==2||!existingText||existingText.textContent!==display||!correctArt)')&&
  characterHub.includes('if(lv.textContent!==levelText)lv.textContent=levelText'),
  'V8.342 inventory still destroys unchanged art/name DOM nodes');
check(characterHub.includes("if(!layout()){")&&
  !characterHub.includes("layout();\n      if(activeTab()==='inventory')refreshTab('inventory');"),
  'V8.342 renderInventory is still refreshing the tab twice');
check(beta.includes('v8009-s2-v459-character-hub.js?v=8343-nav-event-owner-beta'),
  'V8.343 character hub cache key missing');
const characterRenderer=read('js/features/ui/beta/v8009-s2-v086-polish-script.js');
check(characterRenderer.includes('window.v7207CharacterRenderDiagnostics=()')&&
  beta.includes('v8009-s2-v086-polish-script.js?v=8346-character-idle-stage-beta'),
  'V8.342 character render-stage metrics or JS cache missing');
check(tech.includes('CHARAKTER RENDER-STUFEN (V8.342')&&
  tech.includes('freshCharacterRender'),
  'V8.342 Systemtechnik character render-stage readout missing');
/* V8.343 prevent second Frost-owned hub traversal for one shared event only. */
const frostOwner=read('js/features/character/beta/v8009-s3-v4153-frost-class-avatar-authority.js');
const postNavOwner=read('js/features/character/beta/v8009-s15-v7119-character-navigation-consolidation.js');
check(characterHub.includes("e.__v8343CharacterHubRefreshed=hubReady||!!document.getElementById('v459CharacterShell')")&&
  frostOwner.includes("refreshAll('nav-character',e.__v8343CharacterHubRefreshed===true)")&&
  frostOwner.includes('if(!skipDuplicateHub){'),
  'V8.343 two character owners still render the same inventory on navigation');
check(postNavOwner.includes('v7119CharacterNavEventDiagnostics')&&
  tech.includes('CHARAKTER-NAVIGATION LISTENER (V8.343')&&
  tech.includes('v4153CharacterNavDiagnostics')&&
  tech.includes('v459CharacterNavDiagnostics'),
  'V8.343 character navigation listener timing attribution missing');
check(beta.includes('v8009-s3-v4153-frost-class-avatar-authority.js?v=8343-frost-nav-light-beta')&&
  beta.includes('v8009-s15-v7119-character-navigation-consolidation.js?v=8343-nav-listener-metrics-beta'),
  'V8.343 Frost and postnav owner cache not updated');
/* V8.344 avoid v510/v514 double character layout within later v7157. */
const heroBuild=read('js/features/character/beta/v8009-s10-v510-character-hero-rebuild.js');
const heroRef=read('js/features/character/beta/v8009-s1-v514-heldenquartier-reference.js');
const heroStable=read('js/features/character/beta/v8009-s15-v7157-character-equipment-scroll-stability.js');
check(heroStable.includes("fromCharacterNavigation&&window.__v510GoWrapped==='v7119-event'")&&
  heroStable.includes("fromCharacterNavigation&&window.__v514GoWrapped==='v7119-event'")&&
  heroStable.includes("if(String(e?.detail?.id||'')==='character')stable(true)")&&
  heroStable.includes("window.v7157CharacterStableSettle=stable"),
  'V8.344 character hero stability must skip already performed nav builds but retain explicit full recovery');
check(heroBuild.includes('v510CharacterNavDiagnostics')&&heroRef.includes('v514CharacterNavDiagnostics')&&
  heroStable.includes('v7157CharacterNavDiagnostics')&&
  tech.includes('V8.344 HELDENQUARTIER:'),
  'V8.344 character hero owner listener timing reporting missing');
check(beta.includes('v8009-s10-v510-character-hero-rebuild.js?v=8344-nav-timing-beta')&&
  beta.includes('v8009-s1-v514-heldenquartier-reference.js?v=8344-nav-timing-beta')&&
  beta.includes('v8009-s15-v7157-character-equipment-scroll-stability.js?v=8344-no-duplicate-hero-beta'),
  'V8.344 character hero owners cache not updated');



/* V8.345/346: single original owner and opt-in profiler regression. */
const passiveOwner=read('js/features/character/beta/v8009-s2-v4156-class-identity-balance.js');
const passiveRepair=read('js/features/character/beta/v8009-s12-v6117-class-passive-prismatic-fix.js');
const donorOwner=read('js/features/character/beta/v8009-s8-v460-char-ui.js');
const ornamentOwner=read('js/features/character/beta/v8009-s16-v526-heldenquartier-final-ornament.js');
const summaryOwner=read('js/features/character/beta/v8009-s2-v7124-character-scroll-summary-owner.js');
check(passiveOwner.includes('box.innerHTML!==markup')&&passiveRepair.includes('repair(true)')&&
  passiveRepair.includes("window.__v514GoWrapped==='v7119-event'")&&
  tech.includes('V8.345 KLASSENPASSIVE:'),
  'V8.345 passive owner single-navigation behavior missing');
check(beta.includes('v8009-s2-v4156-class-identity-balance.js?v=8345-passive-idempotent-beta')&&
  beta.includes('v8009-s12-v6117-class-passive-prismatic-fix.js?v=8345-passive-single-owner-beta'),
  'V8.345 passive cache not active');
check(donorOwner.includes("typeof window.v515PolishHero==='function'")&&
  ornamentOwner.includes("root.getAttribute('data-hero-layout')==='reference-v7124'")&&
  summaryOwner.includes("img.style.getPropertyPriority(k)!=='important'")&&
  donorOwner.includes('v460CharacterNavDiagnostics')&&
  ornamentOwner.includes('v526CharacterNavDiagnostics')&&
  summaryOwner.includes('v7124CharacterNavDiagnostics'),
  'V8.346 original owner DOM idempotence / timing missing');
check(tech.includes('LOAF-PHASEN Scripts gesamt')&&
  tech.includes('V8.346 WEITERE NAV-OWNER:')&&
  tech.includes('Inventar-Idle-Warten')&&
  characterRenderer.includes('profile.inventoryWaitMs=')&&
  characterRenderer.includes('profile.secondFrameWaitMs='),
  'V8.346 LoAF phase or deferred inventory timing missing');
check(beta.includes('v8009-s8-v460-char-ui.js?v=8346-donor-single-owner-beta')&&
  beta.includes('v8009-s16-v526-heldenquartier-final-ornament.js?v=8346-hero-layout-idempotent-beta')&&
  beta.includes('v8009-s2-v7124-character-scroll-summary-owner.js?v=8346-avatar-style-idempotent-beta'),
  'V8.346 character owner cache keys missing');

check(beta.includes('v8009-s12-v7081-account-capability-gate.js?v=8337-flat-diag-beta'),'Beta capability hotpath cache not updated');
check(beta.includes('v8009-s1-v7042-unified-authority-bridge.js?v=8337-memo-diag-beta'),'Beta bridge hotpath cache not updated');
check(beta.includes('v8009-extracted-v372-authoritative-header-css.css?v=8337-legacy-flow-beta'),'Beta retired header CSS cache not updated');
check(beta.includes('v8009-s7-v372-authoritative-header.js?v=8338-retire-header-flow-beta'),'Beta menu owner cache not updated');

const largest=[...areas].map(([area,v])=>({area,...v})).sort((a,b)=>b.bytes-a.bytes).slice(0,12);
const report={version:'V8.312',time:new Date().toISOString(),entryMetrics,
  uniqueJs:scriptFiles.size,uniqueCss:cssFiles.size,jsBytes,cssBytes,largest,
  missingAssets:missing.length,syntaxErrors:badSyntax.length,errors,pass:errors.length===0};
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exitCode=1;
