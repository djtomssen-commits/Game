(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 const boot=window.__V4147_BOOT__={phase:'parsed',uid:'',seq:0,startedAt:Date.now(),finalizeStartedAt:0,accountReadyAt:0,playableAt:0,splashGateMs:0,accountToPlayableMs:0,extrasReadyAt:0,finalizeMs:0,extrasMs:0,lastReason:'parse',tasks:{},errors:[],foregroundAt:0,quietUntil:0};
 let extrasPromise=null,extrasUid='',foregroundTimer=0;
 function quietRemaining(){return Math.max(0,Number(window.__V7204_STARTUP_QUIET_UNTIL__||0)-Date.now())}
 function startupQuiet(){return quietRemaining()>0}
 function afterStartupQuiet(fn,extra=0){const run=()=>{try{fn()}catch(e){console.warn('V7.207 deferred boot task',e)}};const wait=quietRemaining()+Math.max(0,Number(extra)||0);if(wait>0)return setTimeout(run,wait);run();return 0}
 window.v7204StartupQuiet=startupQuiet;window.v7204StartupQuietRemaining=quietRemaining;window.v7204AfterStartupQuiet=afterStartupQuiet;
 window.v7206StartupBusy=()=>window.__V7210_BOOT_PENDING__===true||window.__V7206_CANONICAL_LOGIN_RUNNING__===true||window.__V7206_FIRST_PLAYABLE_PENDING__===true;
 window.__V7205_SPLASH_GATE__=true;
 function uid(){try{return v073User&&!v073User.is_anonymous&&v073User.id?String(v073User.id):''}catch(e){return''}}
 function characterComplete(){
  try{return typeof v200CharacterComplete==='function'?!!v200CharacterComplete():!!(s?.characterName&&s?.playerClass)}catch(_){return false}
 }
 function verified(id=uid()){
  try{
   if(!id||window.__V200_AUTH_READY__!==true)return false;
   if(typeof window.v452AccountVerified==='function'&&!window.v452AccountVerified(id))return false;
   const owner=String(s?.__accountOwnerId||''),social=String(s?.social?.playerId||''),cloud=String(typeof v075CloudLoadedFor==='undefined'?'':v075CloudLoadedFor||'');
   return (!owner||owner===id)&&(!social||social===id)&&cloud===id;
  }catch(e){return false}
 }
 function setPhase(name,reason=''){boot.phase=name;boot.uid=uid();boot.lastReason=reason||boot.lastReason;try{document.documentElement.dataset.v4147Boot=name}catch(e){}}
 function emit(name,detail={}){try{window.dispatchEvent(new CustomEvent(name,{detail:{uid:uid(),phase:boot.phase,...detail}}))}catch(e){}}
 async function waitFirstPlayable(id=uid(),reason='login'){
  id=String(id||uid());if(!id||!verified(id))return false;
  const completeCharacter=()=>{try{return typeof v200CharacterComplete==='function'?!!v200CharacterComplete():!!(s?.characterName&&s?.playerClass)}catch(_){return false}};
  /* New accounts must reach character creation immediately; they do not have a
     canonical gameplay snapshot yet. */
  if(!completeCharacter()){
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   return true;
  }
  const started=performance.now?.()||Date.now();let lastMutation=started,lastLong=started;
  let mo=null,po=null;const root=document.querySelector('.app')||document.querySelector('main')||document.body;
  try{if(root&&typeof MutationObserver!=='undefined'){mo=new MutationObserver(()=>{lastMutation=performance.now?.()||Date.now()});mo.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']})}}catch(_){}
  try{if(typeof PerformanceObserver!=='undefined'&&PerformanceObserver.supportedEntryTypes?.includes?.('longtask')){po=new PerformanceObserver(()=>{lastLong=performance.now?.()||Date.now()});po.observe({entryTypes:['longtask']})}}catch(_){}
  const criticalReady=()=>{
   try{
    if(uid()!==id||!verified(id))return false;
    if(!Number(window.__V7204_CANONICAL_LOGIN_AT__||0))return false;
    if(window.__V7203_LOGIN_DUNGEON_READY__!==true)return false;
    const world=document.getElementById('world');if(!world)return false;
    return true;
   }catch(_){return false}
  };
  try{window.v4143SetAuthBoot?.(true,'Spiel wird vorbereitet …');window.v660SetBootProgress?.(94)}catch(_){}
  try{
   /* Account-ready still wakes several historical zero/short-delay painters. Let
      those finish behind the loading artwork, then release on an actually quiet
      main-thread/DOM window instead of exposing a half-settled start page. */
   const minimum=650,stableFor=180,maximum=2600;
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   for(;;){
    const now=performance.now?.()||Date.now(),elapsed=now-started;
    if(elapsed>=minimum&&criticalReady()&&now-lastMutation>=stableFor&&now-lastLong>=stableFor){
     await new Promise(r=>{if(typeof requestIdleCallback==='function')requestIdleCallback(()=>r(),{timeout:280});else setTimeout(r,60)});
     await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
     const end=performance.now?.()||Date.now();
     if(criticalReady()&&end-lastMutation>=stableFor&&end-lastLong>=stableFor){try{window.v660SetBootProgress?.(99)}catch(_){};return true}
    }
    if(elapsed>=maximum)return criticalReady();
    await new Promise(r=>setTimeout(r,45));
   }
  }finally{try{mo?.disconnect()}catch(_){}try{po?.disconnect()}catch(_){}}
 }
 window.v7205WaitFirstPlayable=waitFirstPlayable;
 async function task(name,fn){
  const started=performance.now?.()||Date.now();boot.tasks[name]={state:'running',startedAt:Date.now()};
  try{const value=await fn();boot.tasks[name]={state:'ok',ms:Math.round((performance.now?.()||Date.now())-started),at:Date.now()};return value}
  catch(e){const msg=String(e?.message||e||'Fehler');boot.tasks[name]={state:'error',ms:Math.round((performance.now?.()||Date.now())-started),at:Date.now(),error:msg};boot.errors.push({at:Date.now(),task:name,error:msg});while(boot.errors.length>20)boot.errors.shift();console.warn('V4.159 boot task',name,e);return false}
 }
 async function runExtras(id,reason='login'){
  id=String(id||uid());if(!id||!verified(id)||!characterComplete())return false;if(extrasPromise&&extrasUid===id)return extrasPromise;
  extrasUid=id;const started=performance.now?.()||Date.now();setPhase('extras',reason);
  extrasPromise=(async()=>{
   const jobs=[
    ['guild-chat',async()=>typeof window.v4146EnsureGuildChatIdentity==='function'?await window.v4146EnsureGuildChatIdentity('v4147-'+reason):true],
    ['events',async()=>typeof v276RefreshEventsForCurrentCharacter==='function'?await v276RefreshEventsForCurrentCharacter():true],
    ['admin',async()=>{if(typeof v093CheckAdmin!=='function')return true;const ok=await v093CheckAdmin();try{window.v4142SyncAdminSystemtechnik?.()}catch(e){}if(ok&&typeof v093AdminLoadLists==='function')setTimeout(()=>{void v093AdminLoadLists()},0);return ok}],
    ['public-profile',async()=>typeof v299RefreshPublicEquipment==='function'?await v299RefreshPublicEquipment():true]
   ];
   for(const [name,fn] of jobs){
    if(uid()!==id||!verified(id))return false;
    await new Promise(r=>{if(typeof requestIdleCallback==='function')requestIdleCallback(()=>r(),{timeout:900});else setTimeout(r,120)});
    await task(name,fn);
   }
   if(uid()!==id||!verified(id))return false;
   try{window.v4144SyncGuildChat?.()}catch(e){}try{window.v4129ReleaseOwnedPower?.(id)}catch(e){}try{window.v4142SyncAdminSystemtechnik?.()}catch(e){}
   boot.extrasReadyAt=Date.now();boot.extrasMs=Math.round((performance.now?.()||Date.now())-started);setPhase('ready',reason);emit('growlegends:extras-ready',{reason});return true;
  })().finally(()=>{if(extrasUid===id){extrasPromise=null;extrasUid=''}});
  return extrasPromise;
 }
 function accountReady(id,reason='login'){
  id=String(id||uid());if(!id||!verified(id))return false;boot.accountReadyAt=Date.now();
  /* A brand-new authenticated account is ready for CHARACTER CREATION, not yet
     for gameplay-domain listeners. Do not emit account-ready until the atomic
     character transaction has created those domains. */
  if(!characterComplete()){setPhase('character-create',reason);return true}
  try{window.v7051ResetAccountScope?.('canonical-login')}catch(_){}
  try{window.v7080ResetAccountScope?.()}catch(_){}
  window.__V7204_STARTUP_QUIET_UNTIL__=Math.max(Number(window.__V7204_STARTUP_QUIET_UNTIL__||0),Date.now()+3200);boot.quietUntil=Number(window.__V7204_STARTUP_QUIET_UNTIL__||0);
  setPhase('account-ready',reason);emit('growlegends:account-ready',{reason});
  requestAnimationFrame(()=>{if(uid()!==id||!verified(id)||!characterComplete())return;try{window.v4129ReleaseOwnedPower?.(id)}catch(e){}try{window.v4140AttributeDiagnostics?.()}catch(e){}});
  return true;
 }
 function foreground(reason='foreground'){
  clearTimeout(foregroundTimer);const run=async()=>{const id=uid();if(!id||!verified(id)||!characterComplete())return;boot.foregroundAt=Date.now();try{await window.v4146EnsureGuildChatIdentity?.('v4147-'+reason)}catch(e){}try{window.v4144SyncGuildChat?.()}catch(e){}try{window.v4142SyncAdminSystemtechnik?.()}catch(e){}try{window.v4129ReleaseOwnedPower?.(id)}catch(e){}emit('growlegends:foreground-ready',{reason})};
  foregroundTimer=setTimeout(()=>afterStartupQuiet(()=>void run(),80),80);
 }
 window.v4147RunExtras=()=>runExtras(uid(),'manual');
 window.v4147BootDiagnostics=()=>({version:V.short,phase:boot.phase,uid:uid(),verified:verified(),authReady:window.__V200_AUTH_READY__===true,cloudLoaded:String(typeof v075CloudLoadedFor==='undefined'?'':v075CloudLoadedFor||''),finalizeStartedAt:boot.finalizeStartedAt,accountReadyAt:boot.accountReadyAt,playableAt:boot.playableAt,splashGateMs:boot.splashGateMs,accountToPlayableMs:boot.accountToPlayableMs,extrasReadyAt:boot.extrasReadyAt,finalizeMs:boot.finalizeMs,extrasMs:boot.extrasMs,tasks:JSON.parse(JSON.stringify(boot.tasks||{})),errors:[...(boot.errors||[])],foregroundAt:boot.foregroundAt,quietUntil:Number(window.__V7204_STARTUP_QUIET_UNTIL__||0),quietRemaining:quietRemaining(),startupBusy:window.v7206StartupBusy?.()||false});
 try{
  if(typeof v200FinalizeUser==='function'&&!window.__v4147FinalizeOwner){
   const base=v200FinalizeUser;v200FinalizeUser=async function(user){
    const id=String(user?.id||''),started=performance.now?.()||Date.now();
    boot.seq++;boot.finalizeStartedAt=Date.now();window.__V7206_CANONICAL_LOGIN_RUNNING__=true;window.__V7206_FIRST_PLAYABLE_PENDING__=true;setPhase('account-resolving','finalize');
    try{
     const r=await base.apply(this,arguments);boot.finalizeMs=Math.round((performance.now?.()||Date.now())-started);window.__V7206_CANONICAL_LOGIN_RUNNING__=false;
     if(r&&id&&uid()===id&&verified(id)){
      accountReady(id,'finalize');setPhase('first-frame-settle','finalize');const settleStart=performance.now?.()||Date.now();await waitFirstPlayable(id,'finalize');boot.splashGateMs=Math.round((performance.now?.()||Date.now())-settleStart);
      if(uid()===id&&verified(id)){
       boot.playableAt=Date.now();boot.accountToPlayableMs=Math.max(0,boot.playableAt-Number(boot.accountReadyAt||boot.playableAt));window.__V7206_FIRST_PLAYABLE_PENDING__=false;window.__V7210_BOOT_PENDING__=false;setPhase('playable','finalize');
       try{v075Overlay(false)}catch(_){}
       emit('growlegends:first-playable',{reason:'finalize',finalizeMs:boot.finalizeMs,splashGateMs:boot.splashGateMs,accountToPlayableMs:boot.accountToPlayableMs});
       try{window.__GL_RUNTIME_WATCHDOG__?.report?.('startup_playable','info',{finalizeMs:boot.finalizeMs,splashGateMs:boot.splashGateMs,accountToPlayableMs:boot.accountToPlayableMs,totalFromFinalizeMs:Math.max(0,boot.playableAt-boot.finalizeStartedAt),quietRemainingMs:quietRemaining(),deferredAccountReady:Number(window.v7214AccountReadyQueueDiagnostics?.().queued||0),accountReadyQueue:window.v7214AccountReadyQueueDiagnostics?.()||null},{screen:'world',incidentKey:'startup-v7214'})}catch(_){}
       setTimeout(()=>{if(uid()!==id||!verified(id))return;const go=()=>void runExtras(id,'post-playable');if(typeof requestIdleCallback==='function')requestIdleCallback(go,{timeout:2200});else setTimeout(go,250)},1200);
      }
     }
     return r;
    }finally{
     window.__V7206_CANONICAL_LOGIN_RUNNING__=false;
     if(uid()!==id||!verified(id))window.__V7206_FIRST_PLAYABLE_PENDING__=false;
    }
   };
   try{window.v200FinalizeUser=v200FinalizeUser}catch(e){}window.__v4147FinalizeOwner=true;
  }
 }catch(e){console.warn('V4.159 finalizer owner',e)}
 window.addEventListener('pageshow',()=>foreground('pageshow'),{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)foreground('visible')},{passive:true});
 window.addEventListener('focus',()=>foreground('focus'),{passive:true});
 queueMicrotask(()=>{const id=uid();if(id&&verified(id)){accountReady(id,'late-install');if(window.__V7206_CANONICAL_LOGIN_RUNNING__!==true&&window.__V7206_FIRST_PLAYABLE_PENDING__!==true)window.__V7210_BOOT_PENDING__=false}});
 function stamp(){}
 stamp();
})();
