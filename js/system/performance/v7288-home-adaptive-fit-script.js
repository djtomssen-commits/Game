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

/* V8.009 HOME-1: the current V366 home header still carries two historical
   routes: Gold+ opens the item shop and the mail icon opens friends. Capture
   those clicks before the old inline onclick handlers so the visible home
   controls use their intended destinations. */
const v8009HomeHeaderFix={
  goldRedirects:0,
  mailRedirects:0,
  menuGuardInstalls:0,
  menuRebuildsSuppressed:0,
  menuRebuildsAllowed:0,
  worldRenderGuardInstalls:0,
  worldRenderCalls:0,
  worldRenderBurstsSuppressed:0
};

function installBetaWorldRenderGuard(){
  if(!IS_BETA)return false;
  try{
    const base=window.v085InstallWorld;
    if(typeof base!=='function')return false;
    if(base.__v8009Home5WorldGuard)return true;

    let lastFalseAt=0;
    const wrapped=function(){
      const force=arguments[0]===true;
      const active=!!document.getElementById('world')?.classList.contains('active');
      const t=performance?.now?.()||Date.now();

      /* V8.009 HOME-5: several server/lifecycle owners can ask the old V085
         home installer to rebuild the already-mounted Startseite in the same
         short UI burst. Keep the first rebuild, but drop only subsequent
         non-forced calls inside 120 ms. Forced/navigation renders are never
         suppressed. This removes duplicate DOM churn without caching state. */
      if(!force&&active&&lastFalseAt&&t-lastFalseAt<120){
        v8009HomeHeaderFix.worldRenderBurstsSuppressed++;
        return false;
      }

      if(!force&&active)lastFalseAt=t;
      v8009HomeHeaderFix.worldRenderCalls++;
      const out=base.apply(this,arguments);
      try{schedule('world-render')}catch(_){}
      return out;
    };
    wrapped.__v8009Home5WorldGuard=true;
    wrapped.__v8009Base=base;
    window.v085InstallWorld=wrapped;
    try{globalThis.v085InstallWorld=wrapped}catch(_){}
    v8009HomeHeaderFix.worldRenderGuardInstalls++;
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
if(IS_BETA)document.addEventListener('click',e=>{
  try{
    const t=e.target instanceof Element?e.target:null;
    if(!t)return;
    const gold=t.closest('.v366-topbar [data-plus="gold"]');
    if(gold){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      v8009HomeHeaderFix.goldRedirects++;
      if(typeof window.v7114OpenGoldShop==='function')window.v7114OpenGoldShop();
      else if(typeof window.v7117OpenDealerTab==='function')window.v7117OpenDealerTab('gold');
      else if(typeof window.v032Go==='function')window.v032Go('goldShop');
      return;
    }
    const mail=t.closest('.v366-topbar [data-head="mail"]');
    if(mail){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      v8009HomeHeaderFix.mailRedirects++;
      if(typeof window.v032Go==='function')window.v032Go('mail');
    }
  }catch(_){}
},true);
window.v8009HomeHeaderDiagnostics=()=>({
  version:'V8.009-HOME-5',
  beta:IS_BETA,
  ...v8009HomeHeaderFix,
  fit:{...HOME_DIAG,pendingRaf:!!raf,pendingTimer:!!runTimer},
  goldShopApi:typeof window.v7114OpenGoldShop==='function',
  mailScreen:!!document.getElementById('mail')
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
 installBetaWorldRenderGuard();
 document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(()=>{applyBetaVersionStyle();installBetaMenuReplaceGuard();installBetaWorldRenderGuard()}),{once:true});
 window.addEventListener('pageshow',()=>{applyBetaVersionStyle();installBetaMenuReplaceGuard();installBetaWorldRenderGuard()},{passive:true});
 window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>{applyBetaVersionStyle();installBetaMenuReplaceGuard();installBetaWorldRenderGuard()},0),{passive:true});
 window.addEventListener('growlegends:extras-ready',()=>setTimeout(()=>{installBetaMenuReplaceGuard();installBetaWorldRenderGuard()},0),{passive:true});
 window.addEventListener('growlegends:foreground-ready',()=>setTimeout(()=>{installBetaMenuReplaceGuard();installBetaWorldRenderGuard()},0),{passive:true});
}

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

if(IS_BETA)setTimeout(()=>{installBetaMenuReplaceGuard();installBetaWorldRenderGuard()},0);
schedule('boot');
})();
