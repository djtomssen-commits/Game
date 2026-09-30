(()=>{'use strict';
if(window.__V7288_HOME_ADAPTIVE_FIT__)return;
window.__V7288_HOME_ADAPTIVE_FIT__=true;
const IS_BETA=String(window.GROW_RELEASE_CHANNEL||'stable')==='beta';

let raf=0,runTimer=0,lastHero=null,lastWidth=0,baseHeight=0;
const HOME_DIAG={scheduleCalls:0,coalesced:0,runCalls:0,baseFitCalls:0,lastReason:'',lastRunAt:0};

function px(n){return `${Math.max(0,Math.round(Number(n)||0))}px`}

function run(){
  runTimer=0;raf=0;
  HOME_DIAG.runCalls++;
  HOME_DIAG.lastRunAt=Date.now();
  const world=document.getElementById('world');
  if(!world||!world.classList.contains('active'))return;
  const hero=world.querySelector('.v366-hero');
  if(!hero)return;
  const profile=hero.querySelector('.v366-profile');
  const motto=hero.querySelector('.v6103-motto');
  const chest=hero.querySelector('.v6239-weekly-chest');
  const welcome=hero.querySelector('.v366-welcome');
  if(!profile||!motto||!chest||!welcome)return;

  const width=Math.round(hero.getBoundingClientRect().width||hero.clientWidth||360);

  /* A rebuilt home or a real width change gets a fresh CSS baseline. */
  if(hero!==lastHero || Math.abs(width-lastWidth)>12 || !baseHeight){
    lastHero=hero;lastWidth=width;
    hero.style.removeProperty('height');
    hero.style.removeProperty('min-height');
    baseHeight=Math.max(300,Math.round(hero.getBoundingClientRect().height||390));
  }

  /* Start every fit from the real CSS baseline. This makes the result deterministic
     and prevents repeated calls from growing the hero forever. */
  hero.style.setProperty('height',px(baseHeight),'important');
  hero.style.setProperty('min-height',px(baseHeight),'important');

  requestAnimationFrame(()=>{
    if(!hero.isConnected)return;

    const hr=hero.getBoundingClientRect();
    const pr=profile.getBoundingClientRect();
    const mr=motto.getBoundingClientRect();
    const cr=chest.getBoundingClientRect();
    const wr=welcome.getBoundingClientRect();

    /* Everything at the bottom of the hero forms one reserved bottom zone.
       This is the piece the previous fit missed: it checked chest vs welcome,
       but not the real height of the character checklist/profile. */
    const bottomTop=Math.min(mr.top,cr.top,wr.top);
    const gap=width<=390?8:10;
    let extra=Math.max(0,Math.ceil((pr.bottom+gap)-bottomTop));

    /* Also protect against enlarged text / accessibility font scaling that can
       make the bottom widgets themselves taller than expected. */
    const lowest=Math.max(mr.bottom,cr.bottom,wr.bottom);
    extra=Math.max(extra,Math.ceil(lowest-(hr.bottom-6)));

    const target=Math.min(560,baseHeight+Math.max(0,extra));
    hero.style.setProperty('height',px(target),'important');
    hero.style.setProperty('min-height',px(target),'important');
    hero.dataset.v7288Fit=`${width}:${baseHeight}:${target}`;
  });
}

function schedule(reason='manual'){
  const why=typeof reason==='string'?reason:String(reason?.type||'event');
  HOME_DIAG.scheduleCalls++;
  HOME_DIAG.lastReason=why;
  if(raf||runTimer)HOME_DIAG.coalesced++;
  cancelAnimationFrame(raf);
  if(runTimer){clearTimeout(runTimer);runTimer=0}
  raf=requestAnimationFrame(()=>{
    raf=0;
    if(!IS_BETA){
      /* Stable keeps the previous V7.308 behavior unchanged. */
      try{window.v7258AdaptiveMobileFitNow?.()}catch(_){}
      runTimer=setTimeout(run,45);
      return;
    }

    /* V8.009 HOME-3: V7258 already owns account/navigation/resize lifecycle.
       Only request its base geometry when this is a freshly rebuilt hero.
       Repeated home settles are coalesced into one height pass. */
    let needsBase=true;
    try{
      const hero=document.querySelector('#world.active .v366-hero');
      needsBase=!hero||!hero.style.getPropertyValue('--v7258-profile-width');
    }catch(_){}
    if(needsBase){
      try{window.v7258AdaptiveMobileFitNow?.();HOME_DIAG.baseFitCalls++}catch(_){}
      runTimer=setTimeout(run,45);
    }else{
      runTimer=setTimeout(run,0);
    }
  });
}
window.v7288HomeAdaptiveFitNow=schedule;

/* V8.009 HOME support layer: layout fitting and narrow targeted refreshes live
   here; visible Startseite content and header routes are owned by the extracted
   beta renderer. */
const v8009HomeHeaderFix={
  goldRedirects:0,
  mailRedirects:0,
  menuGuardInstalls:0,
  menuRebuildsSuppressed:0,
  menuRebuildsAllowed:0,
  worldPostRenderInstalls:0,
  canonicalChecklistOwner:0,
  weeklyWidgetPaints:0,
  weeklyFullRendersAvoided:0,
  weeklyFeedbackEvents:0,
  weatherSignatureSyncs:0,
  weatherCatchupRendersAvoided:0,
  routeAudits:0,
  routeIssues:0,
  growStatusPatches:0,
  growReadyTimerFires:0,
  growWeatherReschedules:0,
  xpDecoratorGuardInstalls:0,
  xpStartupScansDeferred:0,
  xpDeferredRuns:0
};
let v8009XpDeferredTimer=0;
let v8009GrowReadyTimer=0;
let v8009GrowWeatherObserver=null;

function stateNow(){
  try{return (typeof s!=='undefined'&&s)||window.s||null}catch(_){return window.s||null}
}

let weeklyFeedbackUntil=0;

function syncPaintedWeatherSignature(){
  if(!IS_BETA)return false;
  try{
    const world=document.getElementById('world');
    if(!world?.classList.contains('active'))return false;
    const slot=world.querySelector('.glw-home-slot');
    const w=window.GL_WEATHER;
    if(!slot||!w)return false;

    const expectedIcon=String(w.icon||'🌤️');
    const expectedLabel=String(w.label||'Server-Wetter');
    const expectedBonus=String(w?.bonus?.text||'Kein Wetterbonus');
    const expectedTemp=Number.isFinite(Number(w.temp))?`${Math.round(Number(w.temp))} °C`:'';

    const paintedIcon=String(slot.querySelector('.glw-home-icon')?.textContent||'').trim();
    const paintedLabel=String(slot.querySelector('.glw-home-copy b')?.textContent||'').trim();
    const paintedBonus=String(slot.querySelector('.glw-home-copy span')?.textContent||'').trim();
    const paintedTemp=String(slot.querySelector('.glw-home-temp')?.textContent||'').trim();

    /* Only advance V366's signature when the already-mounted weather widget
       visibly matches the current weather state. This prevents a later unrelated
       home refresh from rebuilding the whole Startseite just to catch up a value
       that paintWeatherSlots() already painted. */
    if(paintedIcon!==expectedIcon||paintedLabel!==expectedLabel||paintedBonus!==expectedBonus||paintedTemp!==expectedTemp)return false;

    const sig=String(world.dataset.v366Sig||'');
    const parts=sig.split('~');
    if(parts.length<=28)return false;
    const next=[expectedIcon,expectedLabel,String(Math.round(Number(w.temp)||0)),expectedBonus];
    const changed=parts[25]!==String(w.kind||'')||parts[26]!==expectedLabel||parts[27]!==next[2]||parts[28]!==expectedBonus;
    if(!changed)return false;

    parts[25]=String(w.kind||'');
    parts[26]=expectedLabel;
    parts[27]=next[2];
    parts[28]=expectedBonus;
    world.dataset.v366Sig=parts.join('~');
    v8009HomeHeaderFix.weatherSignatureSyncs++;
    return true;
  }catch(_){return false}
}

function auditHomeRoutes(){
  if(!IS_BETA)return null;
  try{
    const world=document.getElementById('world');
    if(!world?.classList.contains('active'))return null;
    const expected=['quests','dungeon','tower','grow','forge','shop','guild'];
    const present=[...world.querySelectorAll('[data-go]')].map(x=>String(x.dataset.go||''));
    const missing=expected.filter(id=>!present.includes(id));
    const api={
      navigation:typeof window.v032Go==='function',
      forge:typeof window.v488OpenForge==='function'||!!document.getElementById('forge'),
      referral:typeof window.v7129OpenReferral==='function'||!!world.querySelector('[data-referral-open]'),
      worldboss:typeof window.v110Open==='function'||!world.querySelector('[data-boss]:not([disabled])'),
      achievements:typeof window.v106OpenBook==='function'
    };
    const badApis=Object.entries(api).filter(([,ok])=>!ok).map(([k])=>k);
    v8009HomeHeaderFix.routeAudits++;
    v8009HomeHeaderFix.routeIssues+=missing.length+badApis.length;
    return {missing,badApis,present:[...new Set(present)],api};
  }catch(_){return null}
}

function homeGrowSnapshot(now=Date.now()){
  try{
    const canonical=window.v8009HomeGrowSnapshot?.(now);
    if(canonical&&Number.isFinite(Number(canonical.active))&&Number.isFinite(Number(canonical.ready)))return canonical;
    const st=stateNow();
    const plants=Array.isArray(st?.grow?.plants)?st.grow.plants.filter(Boolean):[];
    const wm=Math.max(.80,Math.min(1.30,Number(window.GL_WEATHER?.bonus?.growMul)||1));
    let ready=0,nextAt=0;
    for(const p of plants){
      const start=Number(p?.start)||0;
      const duration=Math.max(0,Number(p?.duration)||0);
      const at=start>0&&duration>0
        ? start+Math.round(duration/wm)
        : Number(p?.readyAt||p?.endsAt||p?.endAt)||0;
      if(at>0&&now>=at)ready++;
      else if(at>now&&(!nextAt||at<nextAt))nextAt=at;
    }
    return {active:plants.length,ready,nextAt,weatherMul:wm};
  }catch(_){return {active:0,ready:0,nextAt:0,weatherMul:1}}
}

function scheduleHomeGrowReady(snapshot){
  if(v8009GrowReadyTimer){clearTimeout(v8009GrowReadyTimer);v8009GrowReadyTimer=0}
  const s=snapshot||homeGrowSnapshot();
  if(!s.nextAt)return;
  const delay=Math.max(80,Math.min(2147480000,s.nextAt-Date.now()+60));
  v8009GrowReadyTimer=setTimeout(()=>{
    v8009GrowReadyTimer=0;
    v8009HomeHeaderFix.growReadyTimerFires++;
    try{patchHomeGrowStatus()}catch(_){}
  },delay);
}

function patchHomeGrowStatus(){
  if(!IS_BETA)return false;
  try{
    const world=document.getElementById('world');
    if(!world?.classList.contains('active'))return false;
    const snap=homeGrowSnapshot();
    const card=world.querySelector('.v366-card.grow .v366-status b');
    const strip=world.querySelector('#v492HomeGrowStatus b');
    let changed=false;

    if(card){
      const txt=`${snap.ready} Pflanze${snap.ready===1?'':'n'} erntereif`;
      if(card.textContent!==txt){card.textContent=txt;changed=true}
    }
    if(strip){
      const txt=snap.active
        ? `🌱 Growroom · ${snap.active} Pflanze${snap.active===1?'':'n'} aktiv${snap.ready?` · ${snap.ready} erntereif`:''}`
        : '🌱 Growroom · Keine Pflanzen aktiv';
      if(strip.textContent!==txt){strip.textContent=txt;changed=true}
    }

    world.dataset.v8009GrowReady=String(snap.ready);
    world.dataset.v8009GrowActive=String(snap.active);
    world.dataset.v8009GrowWeatherMul=String(snap.weatherMul);
    scheduleHomeGrowReady(snap);
    if(changed)v8009HomeHeaderFix.growStatusPatches++;
    return true;
  }catch(_){return false}
}

function installXpDecoratorStartupGuard(){
  if(!IS_BETA)return false;
  try{
    const base=window.v095DecorateXp||globalThis.v095DecorateXp;
    if(typeof base!=='function')return false;
    if(base.__v8009Home13Guard)return true;

    const wrapped=function(){
      /* V8.009 HOME-13: V6251 still asks the old global EXP decorator to
         TreeWalk the whole visible game UI several times during startup.
         While the canonical loading gate is active, defer those identical
         presentation scans and execute one trailing pass after startup quiet.
         Event reward logic itself is untouched. */
      if(window.v7204StartupQuiet?.()){
        v8009HomeHeaderFix.xpStartupScansDeferred++;
        clearTimeout(v8009XpDeferredTimer);
        const wait=Math.max(80,Number(window.v7204StartupQuietRemaining?.()||0)+80);
        v8009XpDeferredTimer=setTimeout(()=>{
          v8009XpDeferredTimer=0;
          v8009HomeHeaderFix.xpDeferredRuns++;
          try{base()}catch(_){}
        },wait);
        return;
      }
      return base.apply(this,arguments);
    };
    wrapped.__v8009Home13Guard=true;
    wrapped.__v8009Base=base;
    window.v095DecorateXp=wrapped;
    try{globalThis.v095DecorateXp=wrapped}catch(_){}
    v8009HomeHeaderFix.xpDecoratorGuardInstalls++;
    return true;
  }catch(_){return false}
}

function installGrowWeatherObserver(){
  if(!IS_BETA||v8009GrowWeatherObserver||!document.body)return false;
  try{
    v8009GrowWeatherObserver=new MutationObserver(list=>{
      if(!list.some(m=>m.type==='attributes'&&m.attributeName==='data-gl-weather'))return;
      v8009HomeHeaderFix.growWeatherReschedules++;
      requestAnimationFrame(()=>{try{patchHomeGrowStatus()}catch(_){}});
    });
    v8009GrowWeatherObserver.observe(document.body,{attributes:true,attributeFilter:['data-gl-weather']});
    return true;
  }catch(_){return false}
}

function patchWeeklyChest(){
  if(!IS_BETA)return false;
  try{
    const world=document.getElementById('world');
    if(!world?.classList.contains('active'))return false;
    const current=world.querySelector('.v6239-weekly-chest');
    const make=window.v6239WeeklyChestHomeHtml;
    if(!current||typeof make!=='function')return false;

    const holder=document.createElement('div');
    holder.innerHTML=String(make()||'').trim();
    const fresh=holder.firstElementChild;
    if(!(fresh instanceof Element)||!fresh.classList.contains('v6239-weekly-chest'))return false;

    current.replaceWith(fresh);
    fresh.onclick=e=>{
      try{e.preventDefault();e.stopPropagation()}catch(_){}
      try{window.v6239OpenWeeklyChest?.()}catch(_){}
    };

    /* V366 stores one complete home signature. Weekly chest is component 24.
       Keep just that component current so the next ordinary world refresh does
       not perform a full catch-up rebuild for an already-painted chest. */
    try{
      const sig=String(world.dataset.v366Sig||'');
      const parts=sig.split('~');
      const weekly=String(window.v6239WeeklyChestSignature?.()||'');
      if(parts.length>24&&weekly){parts[24]=weekly;world.dataset.v366Sig=parts.join('~')}
    }catch(_){}

    v8009HomeHeaderFix.weeklyWidgetPaints++;
    try{schedule('weekly-chest')}catch(_){}
    return true;
  }catch(_){return false}
}

/* V8.009 HOME-16: Frost weapon2 is counted by the canonical renderer.
   The former post-render checklist DOM correction is retired. */
if(IS_BETA)window.__V8009_HOME16_CANONICAL_CHECKLIST__=true;
function installBetaWorldPostRender(){
  if(!IS_BETA)return false;
  try{
    const base=window.v085InstallWorld;
    if(typeof base!=='function')return false;
    if(base.__v8009Home6WorldPost)return true;

    const wrapped=function(){
      const force=arguments[0]===true;
      const active=!!document.getElementById('world')?.classList.contains('active');
      const t=(()=>{try{return performance.now()}catch(_){return Date.now()}})();

      /* HOME-8: live weather already repaints its own mounted widget. Bring only
         the V366 signature in sync before the canonical installer compares it. */
      if(active&&!force&&syncPaintedWeatherSignature()){
        v8009HomeHeaderFix.weatherCatchupRendersAvoided++;
      }

      /* V8.009 HOME-7: server activity feedback used to rebuild the complete
         Startseite just to update Wochen-EXP. The feedback event is dispatched
         in the same task before its queued RAF calls v085InstallWorld(false).
         Consume that one call and repaint only the weekly-chest widget. */
      if(!force&&active&&weeklyFeedbackUntil&&t<=weeklyFeedbackUntil&&patchWeeklyChest()){
        weeklyFeedbackUntil=0;
        v8009HomeHeaderFix.weeklyFullRendersAvoided++;
        try{patchHomeGrowStatus()}catch(_){}
        return false;
      }

      const out=base.apply(this,arguments);
      requestAnimationFrame(()=>{
        try{patchHomeGrowStatus()}catch(_){}
        try{syncPaintedWeatherSignature()}catch(_){}
        try{auditHomeRoutes()}catch(_){}
        try{schedule('world-render')}catch(_){}
      });
      return out;
    };
    wrapped.__v8009Home6WorldPost=true;
    wrapped.__v8009Base=base;
    window.v085InstallWorld=wrapped;
    try{globalThis.v085InstallWorld=wrapped}catch(_){}
    v8009HomeHeaderFix.worldPostRenderInstalls++;
    return true;
  }catch(_){return false}
}

function installBetaMenuReplaceGuard(){
  if(!IS_BETA)return false;
  try{
    const panel=document.getElementById('v032MenuPanel');
    if(!panel)return false;
    if(panel.__v8009Home4ReplaceGuard)return true;

    const nativeReplace=panel.replaceChildren.bind(panel);
    const directIds=root=>{
      try{return [...root.children].filter(x=>x instanceof Element&&x.dataset?.screen).map(x=>String(x.dataset.screen||''))}catch(_){return[]}
    };
    const incomingIds=nodes=>{
      const ids=[];
      const visit=n=>{
        if(!n)return;
        if(n.nodeType===11){
          try{[...n.children].forEach(visit)}catch(_){}
          return;
        }
        if(n instanceof Element&&n.dataset?.screen)ids.push(String(n.dataset.screen||''));
      };
      nodes.forEach(visit);
      return ids;
    };

    panel.replaceChildren=function(...nodes){
      try{
        const current=directIds(panel);
        const incoming=incomingIds(nodes);
        const same=incoming.length===current.length&&incoming.every((id,i)=>id===current[i]);

        /* V8.009 HOME-4: V4148 still blindly replaces the complete menu on
           several lifecycle events. V4149/V7272 already own canonical order,
           weather preservation and icon decoration. If the direct screen list
           is already identical, keep the mounted DOM instead of causing a full
           menu mutation + observer repair cycle. */
        if(same&&incoming.length){
          v8009HomeHeaderFix.menuRebuildsSuppressed++;
          return;
        }
      }catch(_){}
      v8009HomeHeaderFix.menuRebuildsAllowed++;
      return nativeReplace(...nodes);
    };
    panel.__v8009Home4ReplaceGuard=true;
    panel.__v8009Home4NativeReplace=nativeReplace;
    v8009HomeHeaderFix.menuGuardInstalls++;
    return true;
  }catch(_){return false}
}
/* V8.009 HOME-15: HOME-14 extracted the canonical beta header renderer, so
   Gold+ and Nebel-Post are now bound correctly at the owner. The old global
   capture-phase redirect from HOME-1 is retired. */
if(IS_BETA)window.__V8009_HOME15_DIRECT_HEADER_ROUTES__=true;
window.v8009HomeHeaderDiagnostics=()=>({
  version:'V8.009-HOME-16',
  beta:IS_BETA,
  ...v8009HomeHeaderFix,
  fit:{...HOME_DIAG,pendingRaf:!!raf,pendingTimer:!!runTimer},
  events:window.v8009HomeEventDiagnostics?.()||null,
  eventScheduler:window.v8009HomeEventSchedulerDiagnostics?.()||null,
  goldShopApi:typeof window.v7114OpenGoldShop==='function',
  mailScreen:!!document.getElementById('mail'),
  directHeaderRoutes:!!window.__V8009_HOME15_DIRECT_HEADER_ROUTES__,
  canonicalChecklistOwner:!!window.__V8009_HOME16_CANONICAL_CHECKLIST__,
  canonicalGrowSnapshot:typeof window.v8009HomeGrowSnapshot==='function',
  legacyV474HomeRetired:!!window.__V8009_HOME9_V474_HOME_RETIRED__,
  legacyVersionWritesRetired:{
    v380:!!window.__V8009_HOME11_V380_VERSION_RETIRED__,
    v408:!!window.__V8009_HOME10_V408_VERSION_RETIRED__,
    v410:!!window.__V8009_HOME10_V410_VERSION_RETIRED__,
    v411:!!window.__V8009_HOME11_V411_VERSION_RETIRED__
  },
  routeAudit:auditHomeRoutes()
});

/* Beta-only visible build owner. Shared CSS still contains historical version
   pseudo-elements used by stable, so do not edit those shared styles globally. */
function applyBetaVersionStyle(){
 if(!IS_BETA)return;
 try{
   let style=document.getElementById('v8009-home-beta-version');
   if(!style){
     style=document.createElement('style');
     style.id='v8009-home-beta-version';
   }
   style.textContent='html body .app > header .v358-logo::after{content:"V8.009"!important} html body .app > header .v366-ver::after,html body .app > header .v371-logo em::after,html body .app > header .v372-logo em::after,#v372TopbarShell .v372-logo em::after{content:"V8.009"!important}';
   /* Move this beta override to the end after the old V8.001 shared styles. */
   document.head.appendChild(style);
 }catch(_){}
}
if(IS_BETA){
 applyBetaVersionStyle();
 installBetaMenuReplaceGuard();
 installBetaWorldPostRender();
 installGrowWeatherObserver();
 installXpDecoratorStartupGuard();
 requestAnimationFrame(()=>{try{patchHomeGrowStatus()}catch(_){}});
 document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(()=>{applyBetaVersionStyle();installBetaMenuReplaceGuard();installBetaWorldPostRender();installGrowWeatherObserver();installXpDecoratorStartupGuard();patchHomeGrowStatus()}),{once:true});
 window.addEventListener('pageshow',()=>{applyBetaVersionStyle();installBetaMenuReplaceGuard();installBetaWorldPostRender();installGrowWeatherObserver();patchHomeGrowStatus()},{passive:true});
 window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>{applyBetaVersionStyle();installBetaMenuReplaceGuard();installBetaWorldPostRender();installGrowWeatherObserver();patchHomeGrowStatus()},0),{passive:true});
 window.addEventListener('growlegends:extras-ready',()=>setTimeout(()=>{installBetaMenuReplaceGuard();installBetaWorldPostRender()},0),{passive:true});
 window.addEventListener('growlegends:foreground-ready',()=>setTimeout(()=>{installBetaMenuReplaceGuard();installBetaWorldPostRender()},0),{passive:true});
}

window.addEventListener('growlegends:guild-xp-feedback',e=>{
  if(!IS_BETA)return;
  try{
    if(!document.getElementById('world')?.classList.contains('active'))return;
    const xp=Number(e?.detail?.weeklyXp);
    if(!Number.isFinite(xp))return;
    v8009HomeHeaderFix.weeklyFeedbackEvents++;
    const t=(()=>{try{return performance.now()}catch(_){return Date.now()}})();
    weeklyFeedbackUntil=t+250;
    requestAnimationFrame(()=>{try{patchWeeklyChest()}catch(_){}});
  }catch(_){}
},{passive:true});

window.addEventListener('resize',()=>schedule('resize'),{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(()=>schedule('orientationchange'),150),{passive:true});
window.addEventListener('pageshow',()=>setTimeout(()=>schedule('pageshow'),80),{passive:true});
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>schedule('account-ready'),100),{passive:true});
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>schedule('dom-ready'),50),{once:true});
document.addEventListener('click',e=>{
  if(e.target instanceof Element && e.target.closest('[data-screen="world"],[data-go="world"]')){
    setTimeout(()=>schedule('world-click'),120);
  }
},true);

/* V7.308 performance: the 1.6 s layout-measurement poll is retired. */
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  const id=String(e?.detail?.id||e?.detail?.screen||'');
  if(!id||id==='world')setTimeout(()=>schedule('navigation-world'),70);
},{passive:true});

if(IS_BETA)setTimeout(()=>{installBetaMenuReplaceGuard();installBetaWorldPostRender();installGrowWeatherObserver();installXpDecoratorStartupGuard();patchHomeGrowStatus()},0);
schedule('boot');
})();
