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
check(beta.includes('v8009-s1-v4107-systemtechnik.js?v=8363-qa-center-button-beta'),'V8.344 profiler cache not updated');
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
check(beta.includes('v8009-s2-v459-character-hub.js?v=8371-character-same-text-beta'),
  'V8.343 character hub cache key missing');
const characterRenderer=read('js/features/ui/beta/v8009-s2-v086-polish-script.js');
check(characterRenderer.includes('window.v7207CharacterRenderDiagnostics=()')&&
  beta.includes('v8009-s2-v086-polish-script.js?v=8351-short-inventory-idle-beta'),
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
  beta.includes('v8009-s1-v514-heldenquartier-reference.js?v=8371-character-same-text-beta')&&
  beta.includes('v8009-s15-v7157-character-equipment-scroll-stability.js?v=8347-nav-root-diagnostics-beta'),
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
  beta.includes('v8009-s16-v526-heldenquartier-final-ornament.js?v=8348-ornament-skip-settle-beta')&&
  beta.includes('v8009-s2-v7124-character-scroll-summary-owner.js?v=8346-avatar-style-idempotent-beta'),
  'V8.346 character owner cache keys missing');

/* V8.347: protect original Beta-only character text/DOM stability and
   new read-only attribution of nav + post-login boot work. */
const titleOwner=read('js/features/character/beta/v8009-s15-v6339-character-avatar-title.js');
const nameOwner=read('js/features/character/beta/v8009-s16-v275-character-name-source-of-truth.js');
const mobileHero=read('js/features/character/beta/v8009-s16-v515-heldenquartier-mobile-polish.js');
const attrOwner=read('js/features/character/beta/v8009-s15-v537-attribute-reference.js');
const inventoryOrder=read('js/features/character/beta/v8009-s1-v444-character-inventory-order.js');
check(titleOwner.includes('badges[0]?.previousElementSibling===name')&&
  titleOwner.includes('v6339CharacterNavDiagnostics')&&
  nameOwner.includes('title.textContent!==expected')&&
  nameOwner.includes('v275CharacterNavDiagnostics')&&
  mobileHero.includes("label.textContent!==next")&&
  attrOwner.includes('v537CharacterNavDiagnostics')&&
  inventoryOrder.includes('v444CharacterNavDiagnostics')&&
  heroStable.includes('missingRoot:!root'),
  'V8.347 character original DOM idempotence / navigation attribution missing');
check(tech.includes('V8.347 TITEL/NAME/ORDNUNG:')&&
  tech.includes('V8.347 POST-LOGIN BOOT/EXTRAS')&&
  tech.includes("window.v4147BootDiagnostics?.()"),
  'V8.347 attribution for old navigation owners and safe boot durations missing');
check(beta.includes('v8009-s15-v6339-character-avatar-title.js?v=8347-title-dom-stable-beta')&&
  beta.includes('v8009-s16-v275-character-name-source-of-truth.js?v=8347-name-text-idempotent-beta')&&
  beta.includes('v8009-s16-v515-heldenquartier-mobile-polish.js?v=8347-hero-text-idempotent-beta')&&
  beta.includes('v8009-s15-v537-attribute-reference.js?v=8347-attr-marker-stable-beta')&&
  beta.includes('v8009-s1-v444-character-inventory-order.js?v=8347-order-nav-metrics-beta'),
  'V8.347 Beta-only cache activation missing');

/* V8.348: original XP and ring painting owners must not fight over DOM.
   Keep real item/XP changes, full hero repair and server1 fallback intact. */
const xpOwner=read('js/features/progress/beta/v8009-s3-v6167-longterm-xp-balance.js');
const coreOwner=read('js/features/core/beta/v8009-a1-legacy-state-core.js');
const slotOwner=read('js/features/character/beta/v8009-s8-v6102-character-equipment-scroll-fix.js');
const artOwner=read('js/features/character/beta/v8009-s4-v470-character-slot-art-canonical-comparison.js');
const itemOwner=read('js/features/items/beta/v8009-s2-v4103-item-ui-consistency.js');
const ringQualityOwner=read('js/features/character/beta/v8009-s7-v123-character-equipment-redesign.js');
const xpLayoutOwner=read('js/features/legacy-extracted/beta/v511-character-reference-polish-js.js');
const heroFrameOwner=read('js/features/legacy-extracted/beta/v7154-character-frame-stability.js');
check(xpOwner.includes('window.v6167PaintXp=paint')&&
  xpOwner.includes("t.textContent!==text")&&
  coreOwner.includes("typeof window.v6167PaintXp==='function'")&&
  coreOwner.includes("typeof window.v6102PaintEquipmentSlots==='function'"),
  'V8.348 original core XP/slot owner conflicts still present');
check(slotOwner.includes('el.dataset.v6102Rarity')&&
  ringQualityOwner.includes('c!==quality&&el.classList.contains(c)')&&
  itemOwner.includes("img.getAttribute('src')!==u")&&
  artOwner.includes("current.getAttribute('src')===uri"),
  'V8.348 ring quality or artwork DOM still churns');
check(xpLayoutOwner.includes('el.nextElementSibling!==next')&&
  heroFrameOwner.includes('skippedDuplicateHero:skip')&&
  ornamentOwner.includes('apply(true)')&&
  tech.includes('V8.348 XP / RING DOM-CHURN'),
  'V8.348 XP layout stabilization or profiler diagnosis missing');
check(beta.includes('v8009-a1-legacy-state-core.js?v=8375-inventory-core-stable-beta')&&
  beta.includes('v8009-s3-v6167-longterm-xp-balance.js?v=8349-xp-cssom-precision-beta')&&
  beta.includes('v8009-s8-v6102-character-equipment-scroll-fix.js?v=8350-art-backed-icon-signature-beta')&&
  beta.includes('v511-character-reference-polish-js.js?v=8349-xp-node-navigation-diagnostic-beta')&&
  beta.includes('v7154-character-frame-stability.js?v=8348-hero-single-settle-beta')&&
  beta.includes('v8009-s7-v123-character-equipment-redesign.js?v=8348-rarity-classes-stable-beta'),
  'V8.348 Beta XP/ring owner caches not activated');

/* V8.349: prevent CSSOM percent-rewrite jitter; classify real ring rebuilds
   without item payloads; profile original nav owners instead of guessing. */
check(xpOwner.includes('Math.round(pct*1000)/1000')&&
  xpOwner.includes('xpBarPrecisionSkips')&&
  xpOwner.includes('Math.abs(beforePct-pct)<0.00051'),
  'V8.349 CSSOM percentage idempotence missing');
check(slotOwner.includes('ringRebuildTrace')&&
  slotOwner.includes("reason=!previousSig?'initial-slot'")&&
  slotOwner.includes("'item-signature-changed'")&&
  itemOwner.includes('v4103CharacterNavDiagnostics')&&
  itemOwner.includes('card.dataset[k]!==value')&&
  xpLayoutOwner.includes('v511CharacterNavDiagnostics'),
  'V8.349 ring reasons / metadata stability / nav timings missing');
check(tech.includes('V8.349 XP-KORREKTUR:')&&
  tech.includes('V8.349 RING-NEUAUFBAU t+')&&
  tech.includes('V8.349 NAVIGATION REST-OWNER:')&&
  tech.includes('v7154CharacterNavDiagnostics'),
  'V8.349 current profiler telemetry missing');
check(beta.includes('v8009-s2-v4103-item-ui-consistency.js?v=8349-item-dataset-stability-beta')&&
  beta.includes('v8009-s1-v4107-systemtechnik.js?v=8363-qa-center-button-beta')&&
  beta.includes('v8009-s3-v6167-longterm-xp-balance.js?v=8349-xp-cssom-precision-beta'),
  'V8.349 Beta original-owner caches missing');

/* V8.350: raw icon may alternate while canonical visible ring art stays
   identical. Preserve genuine item, image and emoji-fallback changes. */
check(slotOwner.includes('const ringVisualSnapshot=new WeakMap()')&&
  slotOwner.includes('const visualIcon=beta&&visibleArtUri?visibleArtUri:rawIcon')&&
  slotOwner.includes('ringIconOnlyChangesSkipped')&&
  slotOwner.includes('icon:visualIcon,bonus:')&&
  tech.includes('V8.350 RING-ART SINGLE-OWNER:'),
  'V8.350 ring visible-art signature or profiler counter missing');
check(beta.includes('v8009-s8-v6102-character-equipment-scroll-fix.js?v=8350-art-backed-icon-signature-beta')&&
  beta.includes('v8009-s1-v4107-systemtechnik.js?v=8363-qa-center-button-beta')&&
  !read('server1.html').includes('8350-art-backed-icon-signature-beta'),
  'V8.350 Beta only cache activation missing');

/* V8.351: only Beta shortens the existing visible Inventory idle deadline.
   Keep two progressive frames, stale epoch cancellation and Server1 default. */
const v086Staged=read('js/features/ui/beta/v8009-s2-v086-polish-script.js');
check(v086Staged.includes('const idleBudgetMs=beta?96:240')&&
  v086Staged.includes('requestIdleCallback(inventory,{timeout:idleBudgetMs})')&&
  v086Staged.includes('profile.inventoryIdleBudgetMs=idleBudgetMs')&&
  v086Staged.includes('if(!v7207CharacterActive(epoch))return;')&&
  tech.includes("V8.351 Idle-Budget "),
  'V8.351 staged inventory idle deadline or diagnostic missing');
check(beta.includes('v8009-s2-v086-polish-script.js?v=8351-short-inventory-idle-beta')&&
  beta.includes('v8009-s1-v4107-systemtechnik.js?v=8363-qa-center-button-beta')&&
  !read('server1.html').includes('8351-short-inventory-idle-beta'),
  'V8.351 Beta-only progressive-render cache contract missing');

/* V8.352: avoid gem image remounts on identical requested Materials paints.
   Preserve actual amount/art/filter changes and unchanged Server1 behavior. */
const materialsOwner=read('js/features/materials/beta/v8009-s1-v546-materials-grow-legends.js');
check(materialsOwner.includes('const renderedGrids=new WeakMap(),renderedHeaders=new WeakMap()')&&
  materialsOwner.includes('previous.html===html&&previous.grid===grid')&&
  materialsOwner.includes("materialMetric('materialGridNoopSkips')")&&
  materialsOwner.includes('p.innerHTML=html')&&
  materialsOwner.includes('window.v681EnhanceMaterials?.()')&&
  materialsOwner.includes('window.v683MaterialMultiSell?.enhance?.()')&&
  materialsOwner.includes("if(beta())renderedGrids.set(p,"),
  'V8.352 Materials original render ownership / item controls missing');
check(tech.includes('V8.352 MATERIALIEN DOM-CHURN')&&
  tech.includes('V8.352 MATERIALIEN-NEUAUFBAU t+')&&
  tech.includes('materialImageNodesRemovedByRebuild'),
  'V8.352 Materials profiler counters and reasons missing');
const materialSellOwner=read('js/features/materials/beta/v8009-s3-v681-material-sell-core.js');
const materialMultiOwner=read('js/features/materials/beta/v8009-s2-v683-material-multisell-core.js');
check(materialSellOwner.includes('if(!beta||value.innerHTML!==valueHtml)value.innerHTML=valueHtml')&&
  materialSellOwner.includes('if(!beta||btn.innerHTML!==buttonHtml)btn.innerHTML=buttonHtml'),
  'V8.352 material price / sell-button no-op guards missing');
check(materialMultiOwner.includes('summary.innerHTML!==summaryHtml')&&
  materialMultiOwner.includes('note.textContent!==noteText')&&
  materialMultiOwner.includes("check.getAttribute('aria-pressed')!==pressed"),
  'V8.352 selection card no-op guards missing');
check(beta.includes('v8009-s1-v546-materials-grow-legends.js?v=8352-stable-gem-grid-beta')&&
  beta.includes('v8009-s1-v4107-systemtechnik.js?v=8363-qa-center-button-beta')&&
  beta.includes('v8009-s3-v681-material-sell-core.js?v=8352-stable-material-price-ui-beta')&&
  beta.includes('v8009-s2-v683-material-multisell-core.js?v=8352-stable-material-select-ui-beta')&&
  !read('server1.html').includes('8352-stable-gem-grid-beta')&&
  !read('server1.html').includes('8352-material-grid-churn-profile-beta'),
  'V8.352 Materials Beta cache separation missing');

/* V8.353 Beta: v480 Material auto-action bar is the final owner of its
   text, disabled state and header-relative position. No changes to action. */
const autoMaterialOwner=read('js/features/character/beta/v8009-s3-v480-auto-gear-material.js');
check(autoMaterialOwner.includes("id==='v480MaterialAutoBar'")&&
  autoMaterialOwner.includes("btn.textContent!==buttonText")&&
  autoMaterialOwner.includes("btn.disabled!==disabled")&&
  autoMaterialOwner.includes("description.textContent!==sub")&&
  autoMaterialOwner.includes("panel.insertBefore(bar,hasHeader?header.nextSibling:panel.firstChild)")&&
  autoMaterialOwner.includes('v8353MaterialMetric')&&
  autoMaterialOwner.includes("autoMaterialBarNoopRefreshes")&&
  autoMaterialOwner.includes("autoMaterialBarDisabledChanges")&&
  autoMaterialOwner.includes("autoMaterials,busy||uses===0")&&
  autoMaterialOwner.includes("String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()!=='beta'"),
  'V8.353 canonical v480 material button DOM idempotence or authority action changed');
check(tech.includes('V8.353 AUTO-SOCKELN-BUTTON')&&
  tech.includes('autoMaterialBarTrace')&&
  tech.includes('autoMaterialBarMoves'),
  'V8.353 material auto-action diagnostic missing');
check(beta.includes('v8009-s3-v480-auto-gear-material.js?v=8354-previsible-first-mount-trace-beta')&&
  beta.includes('v8009-s1-v4107-systemtechnik.js?v=8363-qa-center-button-beta')&&
  !read('server1.html').includes('8353-stable-auto-material-button-beta')&&
  !read('server1.html').includes('8353-auto-material-button-diagnostics-beta'),
  'V8.353 must be cache activated only on Beta');

/* V8.354: prepare original Materials grid and Auto-Sockeln action while
   the tab is still hidden. Existing tab refresh after reveal remains. */
const hub354=read('js/features/character/beta/v8009-s2-v459-character-hub.js');
const auto354=read('js/features/character/beta/v8009-s3-v480-auto-gear-material.js');
check(hub354.includes("if(name==='materials'&&String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta')")&&
  hub354.includes('(!wasActive||needsFirstMount)')&&
  hub354.includes('window.v030RenderMaterials?.()')&&
  hub354.includes("window.v480UpdateAutoBars?.('materials')")&&
  hub354.indexOf("window.v480UpdateAutoBars?.('materials')")<hub354.indexOf("shell.querySelectorAll('#v459CharacterTabs button').forEach(b=>b.classList.toggle('active'")&&
  hub354.includes('m.autoMaterialBarHiddenPrepares='),
  'V8.354 hidden Materials warmup must precede tab visibility');
check(auto354.includes("panelActive:!!panel.classList?.contains?.('active')")&&
  tech.includes('V8.359 MATERIALIEN VOR-EINBLENDEN')&&
  tech.includes('Tab bereits sichtbar '),
  'V8.354 Auto-Sockeln visibility trace missing');
check(beta.includes('v8009-s2-v459-character-hub.js?v=8371-character-same-text-beta')&&
  beta.includes('v8009-s3-v480-auto-gear-material.js?v=8354-previsible-first-mount-trace-beta')&&
  beta.includes('v8009-s1-v4107-systemtechnik.js?v=8363-qa-center-button-beta')&&
  !read('server1.html').includes('8354-hidden-material-tab-prepare-beta')&&
  !read('server1.html').includes('8354-material-hidden-prewarm-report-beta'),
  'V8.354 only Beta should activate revised auto-material first mount');

/* V8.355: Beta Material tab no longer animates the whole Character shell
   while the green Auto-Sockeln button is revealed. Sample (read only) the
   first three animation frames, preserving legacy scrolling on Server1. */
check(hub354.includes("behavior:betaMaterial?'instant':'smooth'")&&
  hub354.includes("materialInstantScrolls")&&
  hub354.includes('function v8355MaterialPaintFrames()')&&
  hub354.includes('getComputedStyle(btn)')&&
  hub354.includes('step<3')&&
  hub354.includes('if(betaMaterial&&scroll)try{v8355MaterialPaintFrames()}'),
  'V8.355 Beta Material no-scroll or bounded paint sampling missing');
check(tech.includes('V8.355 MATERIALIEN BUTTON-PAINT:')&&
  tech.includes('V8.355 BUTTON-PAINT t+')&&
  tech.includes('CSS-Animation ')&&
  tech.includes('Transition '),
  'V8.355 Material button computed style and geometry profiler missing');
check(beta.includes('v8009-s2-v459-character-hub.js?v=8371-character-same-text-beta')&&
  beta.includes('v8009-s1-v4107-systemtechnik.js?v=8363-qa-center-button-beta')&&
  !read('server1.html').includes('8355-material-instant-scroll-and-paint-trace-beta')&&
  !read('server1.html').includes('8355-material-paint-frame-report-beta'),
  'V8.355 must activate only on Beta');

/* V8.359: remembered Materials tab may already be active when Character
   reopens. The very first Material AutoBar mount still happens hidden in
   the same synchronous activation; no extra timer, CSS workaround or
   gameplay change. */
check(hub354.includes('const wasActive=!!panel?.classList.contains(\'active\')')&&
  hub354.includes('const needsFirstMount=!bar||bar.parentElement!==panel')&&
  hub354.includes("document.getElementById('character')?.classList.contains('active')")&&
  hub354.includes('if(wasActive)panel.classList.remove(\'active\')')&&
  hub354.includes('finally{if(wasActive)panel.classList.add(\'active\')}')&&
  hub354.includes('m.materialRememberedTabFirstMountPrepares=')&&
  tech.includes("visualCount('materialRememberedTabFirstMountPrepares')")&&
  beta.includes('v8009-s2-v459-character-hub.js?v=8371-character-same-text-beta')&&
  !read('server1.html').includes('8359-remembered-material-prewarm-beta'),
  'V8.359 active remembered material tab must prewarm before first paint on Beta only');

/* V8.360: opt-in Beta one-click page+tab coverage, read-only UI interactions. */
const tabAudit=read('js/system/performance/v8315-page-trace.js');
check(beta.includes('v8315-page-trace.js?v=8376-item-art-reuse-probe-beta')&&
  !read('server1.html').includes('8360-beta-all-tabs-audit')&&
  tech.includes('id="gl8315AllTabs"')&&
  tech.includes('includeTabs:true,extended:true,maxTabsPerScreen:32,maxTabsTotal:130')&&
  tabAudit.includes('async function auditTabs(id,opts)')&&
  tabAudit.includes("const withTabs=options.includeTabs===true")&&
  tabAudit.includes("if(withTabs&&!sweepCancelled)await auditTabs(id,options)")&&
  tabAudit.includes("const tabAttr=/^data-")&&
  tabAudit.includes("if(button.getAttribute('type')?.toLowerCase()==='submit'||button.hasAttribute('formaction'))return null")&&
  tabAudit.includes('tabResults:state.tabResults'),
  'V8.360 Beta semantic tab sweep or isolation missing');
check(tabAudit.includes('function relevantMutation(r,root)')&&
  tabAudit.includes('if(betaAudit()&&!relevantMutation(r,root))continue')&&
  tabAudit.includes('function brokenImageHints(root)')&&
  tabAudit.includes("EXPECTED_TAB_ROUTES[id+':'+candidate.tab]===dest")&&
  tabAudit.includes("typeof window.v7240OpenCaravan==='function'")&&
  tabAudit.includes('if(betaAudit())inspect();')&&
  !read('server1.html').includes('8361-scoped-complete-audit-beta'),
  'V8.361 Beta navigation and screen-attributed mutation auditing missing');
check(tabAudit.includes('function safeDomOwner(node,root)')&&
  tabAudit.includes('function deltaTargets(after,before,max=5)')&&
  tabAudit.includes('idleMutationRecords:')&&
  tabAudit.includes('idleMutationHotspots:')&&
  tabAudit.includes('layoutShiftHotspots:')&&
  tabAudit.includes('if(betaAudit())inspect(); /* caravan becomes visible synchronously')&&
  tabAudit.includes("return {version:betaAudit()?'V8.376':'V8.360'")&&
  !read('server1.html').includes('8362-tab-owner-hotspots-beta'),
  'V8.362 Beta owner and idle-churn profiler contract missing');
check(beta.includes('v8009-s1-v4107-systemtechnik.js?v=8363-qa-center-button-beta')&&
  tech.includes('QA-Zentrale: Komplettprüfung')&&
  tabAudit.includes('function setupNetwork()')&&tabAudit.includes('function teardownNetwork()')&&
  tabAudit.includes('function rectSignature(root)')&&tabAudit.includes('function layoutSample(root)')&&
  tabAudit.includes('function consistencySnapshot()')&&tabAudit.includes('function rankedFindings(pages)')&&
  tabAudit.includes('qaState.extended=withTabs&&options.extended===true')&&
  !read('server1.html').includes('8363-qa-center-beta'),
  'V8.363 Beta QA center missing network, visual, consistency, report or isolation');
/* V8.364: preserve real dynamic numbers, avoid identical Grow/Quest subtree
   destruction, and ignore camera/inner-scroll displacement in GPU warnings. */
const sourceI18n=read('js/features/i18n/v8144-i18n-gameplay.js');
const sourceGrow=read('js/features/grow/beta/v8009-s6-v6163-growroom-primary-tabs-core.js');
const sourceQuest=read('js/features/quest/beta/v386-quest-redesign-script.js');
check(beta.includes('v8144-i18n-gameplay.js?v=8364-stable-live-text-beta')&&
  beta.includes('v6163-growroom-primary-tabs-core.js?v=8364-stable-grow-tabs-beta')&&
  beta.includes('v386-quest-redesign-script.js?v=8364-stable-quest-cards-beta')&&
  beta.includes('v8315-page-trace.js?v=8376-item-art-reuse-probe-beta')&&
  !read('server1.html').includes('8364-stable-live-text-beta')&&
  !read('server1.html').includes('8364-stable-quest-cards-beta')&&
  sourceI18n.includes('LAST_APPLIED_TEXT=new WeakMap()')&&
  sourceI18n.includes("if(String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta')")&&
  sourceI18n.indexOf('V8.364 Beta: append these only after P exists')>
   sourceI18n.indexOf('const P={')&&
  sourceI18n.includes('last!==undefined&&last!==existing')&&
  sourceI18n.includes('ORDERED_TRANSLATIONS.set(lang,entries)')&&
  sourceGrow.includes('const lastPanelHtml=new WeakMap()')&&
  sourceGrow.includes('setPanelHtml(panel,')&&
  sourceQuest.includes('const lastQuestHtml=new WeakMap()')&&
  sourceQuest.includes('lastQuestHtml.get(list)===html')&&
  tabAudit.includes('x+=parent.scrollLeft||0;y+=parent.scrollTop||0;'),
  'V8.364 Beta live-text stability / no-op panel renderer / scroll-geometry cache missing');
/* V8.365: the original V492 full-screen owner may be invoked by server
   refreshes while another Grow tab is in front. Identical plant, seed and
   progress state must never destroy the whole .v492-grow subtree again. */
const sourceGrowScene=read('js/features/grow/beta/v8009-s1-v492-growroom2.js');
check(beta.includes('v492-growroom2.js?v=8365-layout-key-beta')&&
 beta.includes('v8315-page-trace.js?v=8376-item-art-reuse-probe-beta')&&
 !read('server1.html').includes('v492-growroom2.js?v=8365-layout-key-beta')&&
 sourceGrowScene.includes('function growLayoutSignature()')&&
 sourceGrowScene.includes('plantPhase:statusSig()')&&
 sourceGrowScene.includes('lastGrowLayout?.key===layoutKey')&&
 sourceGrowScene.includes('V8365_GROW_RENDER_QA.noopRenders++')&&
 sourceGrowScene.includes('if(window.v6163GrowTabs?.active===\'grow\'){livePaint()')&&
 sourceGrowScene.includes('window.v6163GrowTabs?.refresh?.()')&&
 tabAudit.includes('growRenderer:(()=>{try{return window.__V8365_GROW_RENDER_QA__?.()'),
 'V8.365 Beta Growroom canonical remount guard or QA diagnostics missing');

 /* V8.366 Beta: identical VIP/frame state must retain actual HTML nodes,
    but authoritative changes still repaint. Server1 entrypoint unchanged. */
 const vipSource=read('js/features/shop/beta/v8195-vip.js');
 const frameSource=read('js/features/shift/beta/v8009-s1-v7137-shift-frame-client.js');
 check(beta.includes('v8195-vip.js?v=8366-vip-render-noop-beta')&&
   beta.includes('v7137-shift-frame-client.js?v=8366-frame-render-noop-beta')&&
   beta.includes('v8315-page-trace.js?v=8376-item-art-reuse-probe-beta')&&
   read('server1.html').includes('v8195-vip.js?v=8377-server1-perf-reuse')&&
   read('server1.html').includes('v7137-shift-frame-client.js?v=8377-server1-perf-reuse')&&
   vipSource.includes('lastVipPanel!==p||lastVipMarkup!==nextMarkup||!p.firstElementChild')&&
   vipSource.includes('betaVipRender()')&&
   vipSource.includes('window.__V8366_VIP_RENDER_QA__')&&
   frameSource.includes('lastFramePanel!==p||lastFrameMarkup!==nextMarkup||!p.firstElementChild')&&
   frameSource.includes("String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta'")&&
   frameSource.includes('window.__V8366_FRAME_RENDER_QA__')&&
   tabAudit.includes("return {version:betaAudit()?'V8.376':'V8.360'")&&
   tabAudit.includes('renderOwners:{'),
   'V8.366 Beta VIP/frame canonical owner no-op guard or QA diagnostics missing');
/* V8.367 Beta: the Nebelschmied needs ONLY v488 tabs, never a hidden
   Enchant list underneath the active v7240 panel. The normal tab must
   still render on return; Server1 must retain its original flow. */
const forgeOwner=read('js/features/forge/beta/v8009-s1-v488-harzschmiede-core.js');
const nebelforgeOwner=read('js/beta/v7240-beta-gold-features.js');
check(beta.includes('v488-harzschmiede-core.js?v=8367-nebel-light-beta')&&
 beta.includes('v7240-beta-gold-features.js?v=8367-nebel-light-beta')&&
 !read('server1.html').includes('v488-harzschmiede-core.js?v=8367-nebel-light-beta')&&
 !read('server1.html').includes('v7240-beta-gold-features.js?v=8367-nebel-light-beta')&&
 forgeOwner.includes('options?.nebelforge===true')&&
 forgeOwner.includes("nebelLight?'':forgeTab==='enchant'")&&
 forgeOwner.includes("if(next===forgeTab&&!nebelLight)return;")&&
 forgeOwner.includes("if(forgeTab==='enchant'&&!nebelLight)")&&
 nebelforgeOwner.includes('window.v488ForgeRender?.({nebelforge:true})')&&
 tabAudit.includes('window.__V8367_FORGE_QA__?.()'),
 'V8.367 Beta lightweight Nebelschmied shell or QA diagnostics missing');
/* V8.368 Beta: item enchantment FX must reuse existing badges/effects on
   unchanged level. Equipment + inventory get updated only when necessary;
   the Server1 original entrypoint and game backend stay unchanged. */
const fxOwner=read('js/features/forge/beta/v8198-enchanting.js');
check(beta.includes('v8198-enchanting.js?v=8368-character-fx-beta')&&
 beta.includes('v8315-page-trace.js?v=8376-item-art-reuse-probe-beta')&&
 !read('server1.html').includes('v8198-enchanting.js?v=8368-character-fx-beta')&&
 fxOwner.includes('V8368_ITEM_FX_QA.noopRenders++')&&
 fxOwner.includes("const beta=String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta'")&&
 fxOwner.includes("if(matching){V8368_ITEM_FX_QA.noopRenders++;return}")&&
 tabAudit.includes('window.__V8368_ITEM_FX_QA__?.()'),
 'V8.368 Beta item FX canonical no-op protection/counters or Server1 separation missing');



/* V8.369 Beta: v470 comparison painter must not repeatedly remove/readd
   identical v460-* state classes or title attributes on every v459 tab refresh.
   Preserve server1 historical behavior and allow real score/class changes. */
check(
 beta.includes('v470-character-slot-art-canonical-comparison.js?v=8374-comparison-diagnostics-beta')&&
 !read('server1.html').includes('v470-character-slot-art-canonical-comparison.js?v=8369-comparison-noop-beta')&&
 artOwner.includes('V8369_COMPARE_QA.classNoops++')&&
 artOwner.includes("const wanted=!!c&&css==='v460-'+c.state")&&
 artOwner.includes('card.classList.contains(css)===wanted')&&
 artOwner.includes("card.title!==value")&&
 tabAudit.includes('window.__V8369_COMPARE_QA__?.()'),
 'V8.369 Beta comparison class/title no-op guard or Server1 separation missing');

/* V8.370: classify text rewrites versus element churn during Beta QA only. */
check(
 beta.includes('v8315-page-trace.js?v=8376-item-art-reuse-probe-beta')&&
 !read('server1.html').includes('v8315-page-trace.js?v=8376-item-art-reuse-probe-beta')&&
 tabAudit.includes("['character','harzDealer','forge'].includes(current)")&&
 tabAudit.includes('if(identicalText)t.identicalText++')&&
 tabAudit.includes('mutationDetail:(()=>{const out={};')&&
 tabAudit.includes('qaState.extended'),
 'V8.370 childList type diagnostics or beta-only opt-in guard missing');
/* V8.371 Beta: direct original UI-owner guards, diagnostic stack caller
   only in opted-in QA and with restoration at stop. Server1 stays untouched. */
check(beta.includes('v8009-s2-v459-character-hub.js?v=8371-character-same-text-beta')&&
 beta.includes('v8009-s1-v514-heldenquartier-reference.js?v=8371-character-same-text-beta')&&
 heroRef.includes('lvl.textContent!==levelText')&&
 characterHub.includes('const paintCount=(el,next)=>')&&
 characterHub.includes('el.textContent!==next')&&
 !read('server1.html').includes('8371-character-same-text-beta'),
 'V8.371 canonical Character no-op guards missing');
check(beta.includes('v8315-page-trace.js?v=8376-item-art-reuse-probe-beta')&&
 !read('server1.html').includes('v8315-page-trace.js?v=8376-item-art-reuse-probe-beta')&&
 tabAudit.includes('function installTextOriginTrace()')&&
 tabAudit.includes('function teardownTextOriginTrace()')&&
 tabAudit.includes('Object.defineProperty(Node.prototype')&&
 tabAudit.includes("if(qaState.extended){setupNetwork();installTextOriginTrace();}")&&
 tabAudit.includes('teardownNetwork();teardownTextOriginTrace();')&&
 tabAudit.includes('textWriters:Object.entries('),
 'V8.371 opt-in diagnostic text setter hook or cleanup incomplete');
/* V8.372 Beta: original Dampf cleanup triggered cross-screen childList
   churn via textContent=unchanged. Verify targeted source and server1 guard. */
const dampfOwner=read('js/features/anonymous-extracted/beta/anon-0002.js');
const rarityOwner=read('js/features/character/beta/v8009-s8-v684-inventory-rarity-final-core.js');
check(beta.includes('anon-0002.js?v=8372-dampf-text-noop-beta')&&
 beta.includes('v684-inventory-rarity-final-core.js?v=8372-rarity-label-noop-beta')&&
 !read('server1.html').includes('8372-dampf-text-noop-beta')&&
 !read('server1.html').includes('8372-rarity-label-noop-beta')&&
 dampfOwner.includes('function v028WriteText(el,value)')&&
 dampfOwner.includes('canonical!==original')&&
 dampfOwner.includes("original.includes('Energie')")&&
 dampfOwner.includes("el.textContent!==value")&&
 dampfOwner.includes('v028WriteText(energyEl')&&
 rarityOwner.includes('badge.textContent!==LABEL[q]')&&
 rarityOwner.includes('__GROW_SERVER1_PERFORMANCE_V8376__'),
 'V8.372 canonical Dampf text guard / inventory rarity guard or Server1 isolation missing');
/* V8.377 Server1: explicit feature-gated, UI-only source promotion.
   Original Beta behavior and gameplay/class balance entrypoints stay intact. */
const server1PerfEntry=read('server1.html');
const promotedPerfSources=[
 "js/features/grow/beta/v8009-s6-v6163-growroom-primary-tabs-core.js",
 "js/features/quest/beta/v386-quest-redesign-script.js",
 "js/features/grow/beta/v8009-s1-v492-growroom2.js",
 "js/features/shop/beta/v8195-vip.js",
 "js/features/shift/beta/v8009-s1-v7137-shift-frame-client.js",
 "js/features/forge/beta/v8009-s1-v488-harzschmiede-core.js",
 "js/beta/v7240-beta-gold-features.js",
 "js/features/forge/beta/v8198-enchanting.js",
 "js/features/character/beta/v8009-s4-v470-character-slot-art-canonical-comparison.js",
 "js/features/character/beta/v8009-s1-v514-heldenquartier-reference.js",
 "js/features/character/beta/v8009-s2-v459-character-hub.js",
 "js/features/anonymous-extracted/beta/anon-0002.js",
 "js/features/character/beta/v8009-s8-v684-inventory-rarity-final-core.js",
 "js/features/pets/beta/v8009-s1-v688-pet-drop-system-core.js",
 "js/features/pets/beta/v8009-s1-v686-pet-album-core.js",
 "js/features/character/beta/v8009-s7-v533-inventory-reference.js",
 "js/features/core/beta/v8009-a1-legacy-state-core.js",
 "js/features/items/beta/v8009-s13-v468-single-item-art-owner.js",
 "js/features/items/beta/v8009-s4-v6107-global-item-art-authority.js"
];
const perfS1Flag='__GROW_SERVER1_PERFORMANCE_V8376__';
check(
 server1PerfEntry.includes('<script>window.'+perfS1Flag+'=true;</script>')&&
 !beta.includes('<script>window.'+perfS1Flag+'=true;</script>')&&
 promotedPerfSources.every(p=>
   server1PerfEntry.includes(p+'?v=8377-server1-perf-reuse')&&
   read(p).includes(perfS1Flag)
 )&&
 !server1PerfEntry.includes('v8144-i18n-gameplay.js?v=8364-stable-live-text-beta')&&
 !server1PerfEntry.includes('v8315-page-trace.js?v=8376-item-art-reuse-probe-beta')&&
 server1PerfEntry.includes('js/features/account/server1-release-channel.js'),
 'V8.377 Server1 original-source performance gate/cache/source list or channel separation missing'
);

/* V8.376: two independent original item art owners must reuse the same
   source URL regardless of relative/absolute browser URL normalization.
   Never change the historical Server 1 behavior. */
const coreArtOwner=read('js/features/items/beta/v8009-s13-v468-single-item-art-owner.js');
const globalArtOwner=read('js/features/items/beta/v8009-s4-v6107-global-item-art-authority.js');
check(
 beta.includes('v468-single-item-art-owner.js?v=8376-same-source-art-reuse-beta')&&
 beta.includes('v6107-global-item-art-authority.js?v=8376-adopt-art-node-beta')&&
 beta.includes('v8315-page-trace.js?v=8376-item-art-reuse-probe-beta')&&
 !read('server1.html').includes('8376-same-source-art-reuse-beta')&&
 !read('server1.html').includes('8376-adopt-art-node-beta')&&
 coreArtOwner.includes("current.getAttribute('src')===uri||current.src===uri")&&
 globalArtOwner.includes("img.v6107-item-art,:scope > img.v466-item-art")&&
 globalArtOwner.includes("cur.classList.add('v466-item-art','v6107-item-art','v6108-quality-art')")&&
 tabAudit.includes('itemArtReuse:(()=>{try{return {v468:window.__V8376_V468_ART_QA__')&&
 tabAudit.includes("return {version:betaAudit()?'V8.376':'V8.360'"),
 'V8.376 original item-image DOM owners or Beta-only cache/QA missing'
);

/* V8.375 Beta: state-identical core inventory re-renders previously
   destroyed all cards, causing 112 missing final flags with zero changed keys.
   Verify the fix is directly in the canonical base renderer, Beta-isolated. */
check(beta.includes('v8009-a1-legacy-state-core.js?v=8375-inventory-core-stable-beta')&&
 beta.includes('v8315-page-trace.js?v=8376-item-art-reuse-probe-beta')&&
 !read('server1.html').includes('8375-inventory-core-stable-beta')&&
 !read('server1.html').includes('8375-inventory-core-probe-beta')&&
 coreOwner.includes('function v8375InventorySignature()')&&
 coreOwner.includes('v8375InventoryQA.noops++')&&
 coreOwner.includes('v8375InventoryPaintCache?.grid===grid')&&
 coreOwner.includes('grid.querySelectorAll(\':scope > .inv-item\').length===s.inventory.length')&&
 coreOwner.includes('if(beta)v8375InventoryPaintCache={box,grid,signature:v8375InventorySignature()}')&&
 tabAudit.includes('inventoryCore:(()=>{try{return window.__V8375_INVENTORY_CORE_QA__?.()'),
 'V8.375 canonical inventory unchanged DOM reuse or Beta-only diagnostics missing');

/* V8.374 Beta: original Pet Album book-host mover must not reparent
   already ordered buttons. V470 tracks the reason for flag remounts without
   altering score calculations, and only the Beta QA report exposes it. */
const petAlbumCore=read('js/features/pets/beta/v8009-s1-v686-pet-album-core.js');
check(beta.includes('v686-pet-album-core.js?v=8374-book-host-noop-beta')&&
 beta.includes('v470-character-slot-art-canonical-comparison.js?v=8374-comparison-diagnostics-beta')&&
 beta.includes('v8315-page-trace.js?v=8376-item-art-reuse-probe-beta')&&
 !read('server1.html').includes('8374-book-host-noop-beta')&&
 !read('server1.html').includes('8374-comparison-diagnostics-beta')&&
 petAlbumCore.includes('if(book.parentElement!==host||host.firstElementChild!==book)')&&
 petAlbumCore.includes('if(btn.parentElement!==host||btn.previousElementSibling!==book)')&&
 artOwner.includes('V8374_COMPARE_REBUILDS.missingFinal++')&&
 artOwner.includes('V8374_COMPARE_REBUILDS.changedKey++')&&
 tabAudit.includes('comparisonRebuilds:(()=>{try{return window.__V8374_COMPARE_REBUILDS__')&&
 tabAudit.includes("return {version:betaAudit()?'V8.376':'V8.360'"),
 'V8.374 Beta original Pet Album DOM move guard or comparison cause counters missing');

/* V8.373: DOM leaf reuse in canonical inventory/pet owners, Beta only.
   Server1 still follows unchanged legacy loops and no backend state mutations. */
const setMarkSource=read('js/features/items/beta/v8009-s13-v468-single-item-art-owner.js');
const emptySource=read('js/features/character/beta/v8009-s7-v533-inventory-reference.js');
const petSource=read('js/features/pets/beta/v8009-s1-v688-pet-drop-system-core.js');
check(beta.includes('v468-single-item-art-owner.js?v=8376-same-source-art-reuse-beta')&&
 beta.includes('v533-inventory-reference.js?v=8373-empty-slot-reuse-beta')&&
 beta.includes('v688-pet-drop-system-core.js?v=8373-pet-label-noop-beta')&&
 !read('server1.html').includes('8373-set-marker-reuse-beta')&&
 !read('server1.html').includes('8373-empty-slot-reuse-beta')&&
 !read('server1.html').includes('8373-pet-label-noop-beta')&&
 setMarkSource.includes("if(mark.textContent!==label)mark.textContent=label")&&
 setMarkSource.includes('if(!hasSet){mark?.remove()}')&&
 emptySource.includes("for(let i=emptySlots.length-1;i>=target;i--)emptySlots[i].remove()")&&
 emptySource.includes('for(let i=emptySlots.length;i<target;i++)')&&
 petSource.includes('info.textContent!==next')&&
 tabAudit.includes("return {version:betaAudit()?'V8.376':'V8.360'"),
 'V8.373 original inventory/pet DOM no-op guards, QA-version or Server1 isolation missing');
check(beta.includes('v8009-s12-v7081-account-capability-gate.js?v=8337-flat-diag-beta'),'Beta capability hotpath cache not updated');
check(beta.includes('v8009-s1-v7042-unified-authority-bridge.js?v=8337-memo-diag-beta'),'Beta bridge hotpath cache not updated');
check(beta.includes('v8009-extracted-v372-authoritative-header-css.css?v=8337-legacy-flow-beta'),'Beta retired header CSS cache not updated');
check(beta.includes('v8009-s7-v372-authoritative-header.js?v=8338-retire-header-flow-beta'),'Beta menu owner cache not updated');

/* V8.382: canonical Server1-only attribute action diagnostics. */
const attrOwner=read('js/features/authority/beta/v8009-s2-v7033-build-authority-bridge.js');
const systemtechOwner=read('js/features/system/beta/v8009-s1-v4107-systemtechnik.js');
const liveHtml=read('server1.html');
check(attrOwner.split("rpc('v6357_spend_attribute'").length===2,'Attribute spend must keep one canonical RPC');
check(attrOwner.includes('window.v8382AttributeLatencyDiagnostics')&&attrOwner.includes("attributeTiming.length>8"),'Bounded attribute trace missing');
check(attrOwner.includes("trace?stamp:null")&&attrOwner.includes("trace.status='bestätigt'"),'Attribute diagnostics not tied to real canonical action');
check(attrOwner.includes("String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='server1'"),'Attribute instrumentation not Server1-only');
check(systemtechOwner.includes('v8382AttributeTimingCard')&&systemtechOwner.includes('V8.382 ATTRIBUT-EINZELMESSUNG'),'Systemtechnik attribute panel missing');
check(liveHtml.includes('v7033-build-authority-bridge.js?v=8382-attr-stage-trace-server1')&&liveHtml.includes('v4107-systemtechnik.js?v=8382-attribute-timing-server1'),'Server1 attribute trace cache missing');
check(!beta.includes('8382-attr-stage-trace-server1')&&!beta.includes('8382-attribute-timing-server1'),'Beta entry must remain unchanged');
const largest=[...areas].map(([area,v])=>({area,...v})).sort((a,b)=>b.bytes-a.bytes).slice(0,12);
const report={version:'V8.312',time:new Date().toISOString(),entryMetrics,
  uniqueJs:scriptFiles.size,uniqueCss:cssFiles.size,jsBytes,cssBytes,largest,
  missingAssets:missing.length,syntaxErrors:badSyntax.length,errors,pass:errors.length===0};
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exitCode=1;
