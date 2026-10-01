(()=>{
'use strict';
if(window.__V7096_TOWER_DIRECT_PREEMPT__)return;
window.__V7096_TOWER_DIRECT_PREEMPT__=true;

/* V8.009-T10J: one-tap authoritative Tower flow + replay cleanup.
   Door choice -> shorter door opening -> automatic server replay.
   Presentation-only guards; server combat math/rewards stay untouched. */
const G=window.__V8009_TOWER_ROUTE_GUARD__||(window.__V8009_TOWER_ROUTE_GUARD__={
  routeBusy:false,duplicateTaps:0,chooseCalls:0,lastError:'',doorPreviewMinMs:900
});
Object.assign(G,{
  battleSeen:!!G.battleSeen,
  battleShownAt:Number(G.battleShownAt)||0,
  suppressedRenders:Number(G.suppressedRenders)||0,
  suppressedLateSfx:Number(G.suppressedLateSfx)||0,
  audioBlockUntil:Number(G.audioBlockUntil)||0,
  renderInstalls:Number(G.renderInstalls)||0,
  sfxInstalls:Number(G.sfxInstalls)||0,
  replayInstalls:Number(G.replayInstalls)||0,
  terminalResultsSuppressed:Number(G.terminalResultsSuppressed)||0,
  arenaPrewarms:Number(G.arenaPrewarms)||0,
  previewDecodes:Number(G.previewDecodes)||0,
  cadenceInstalls:Number(G.cadenceInstalls)||0,
  previewCalls:Number(G.previewCalls)||0,
  suppressedDuplicatePreviews:Number(G.suppressedDuplicatePreviews)||0,
  startupQueueFightGuards:Number(G.startupQueueFightGuards)||0,
  arenaWarmQueued:false
});

const COMBAT_SFX=new Set(['hit','crithit','crit','enemyhit','enemy_hit','block','dodge','heal','slash','strike','attack']);
const IMPACT_SFX=new Set(['hit','crithit','crit','enemyhit','enemy_hit','block','dodge','slash','strike','attack']);

function now(){
 try{return performance.now()}catch(_){return Date.now()}
}
function towerActive(){
 try{return !!document.getElementById('tower')?.classList.contains('active')}catch(_){return false}
}
function battleDom(){
 try{return !!document.querySelector('#tower .vT-battle-stage,#tower .v6259-battle-stage,#tower [data-vt-battle]')}catch(_){return false}
}

function setBusy(on){
 G.routeBusy=!!on;
 try{
   document.querySelectorAll('#tower [data-vt-route]').forEach(b=>{
     b.disabled=G.routeBusy;
     if(G.routeBusy)b.setAttribute('aria-busy','true');
     else b.removeAttribute('aria-busy');
   });
 }catch(_){}
}

function installTowerCadence(){
 try{
   const current=window.v7269DungeonCadence;
   if(typeof current==='function'&&current.__v8009T10JTowerCadence)return true;
   const towerCadence=()=>({
     frameDelay:900,
     attackDelay:440,
     settleDelay:460,
     visualAttackMs:700,
     visualHitMs:700,
     visualPopMs:1000,
     startDelayMs:250
   });
   towerCadence.__v8009T10JTowerCadence=true;
   towerCadence.__v8009Base=current;
   window.v7269DungeonCadence=towerCadence;
   try{v7269DungeonCadence=towerCadence}catch(_){}
   G.cadenceInstalls++;
   return true;
 }catch(e){
   G.lastError=String(e?.message||e);
   return false;
 }
}

function installDoorPreviewPacing(){
 try{
   const base=window.v7298TowerDoorPreview;
   if(typeof base!=='function'||base.__v8009T10J)return false;
   const wrapped=function(run,routeIndex=0,ms=900){
     /* A single authoritative route is allowed to paint the door preview once.
        The recording showed a second late preview replacing the already-running
        battle for ~2 seconds. That write bypasses vTowerRender, so the render
        guard cannot catch it. Drop every duplicate/late preview for this route. */
     if(G.routeBusy){
       if(G.previewCalls>=1||G.battleSeen||battleDom()){
         G.suppressedDuplicatePreviews++;
         return Promise.resolve(false);
       }
       G.previewCalls++;
     }

     const out=base.call(this,run,routeIndex,Math.max(G.doorPreviewMinMs,Number(ms)||0));

     /* Use the door-opening window to decode the selected enemy image before
        the battle starts. Cold image decode on the very first run otherwise
        lands on the first attack frames and is visible as a short stutter. */
     requestAnimationFrame(()=>{
       try{
         document.querySelectorAll('#tower .v6281-enter-enemy img').forEach(img=>{
           try{
             const p=img.decode?.();
             if(p&&typeof p.then==='function')p.then(()=>{G.previewDecodes++}).catch(()=>{});
           }catch(_){}
         });
       }catch(_){}
     });
     return out;
   };
   wrapped.__v8009T10J=true;
   wrapped.__v8009Base=base;
   window.v7298TowerDoorPreview=wrapped;
   return true;
 }catch(e){
   G.lastError=String(e?.message||e);
   return false;
 }
}

function installTowerReplayGuard(){
 try{
   const base=window.v7175CombatReplayStep;
   if(typeof base!=='function'||base.__v8009T10JReplayGuard)return false;
   const wrapped=function(mode,event){
     if(String(mode||'')==='tower'&&G.routeBusy&&event&&typeof event==='object'){
       const e={...event};
       let terminal=false;
       for(const key of ['enemy_hp','enemyHp','defenderHp']){
         if(Object.prototype.hasOwnProperty.call(e,key)&&Number.isFinite(Number(e[key]))&&Number(e[key])<=0){
           e[key]=1;terminal=true;
         }
       }
       for(const key of ['player_hp','playerHp','attackerHp']){
         if(Object.prototype.hasOwnProperty.call(e,key)&&Number.isFinite(Number(e[key]))&&Number(e[key])<=0){
           e[key]=1;terminal=true;
         }
       }
       if(terminal)G.terminalResultsSuppressed++;
       return base.call(this,mode,e);
     }
     return base.apply(this,arguments);
   };
   wrapped.__v8009T10JReplayGuard=true;
   wrapped.__v8009Base=base;
   window.v7175CombatReplayStep=wrapped;
   try{window.v7169CombatReplayStep=wrapped}catch(_){}
   G.replayInstalls++;
   return true;
 }catch(e){
   G.lastError=String(e?.message||e);
   return false;
 }
}

function installTowerSfxGuard(){
 try{
   const base=window.v6111Sfx;
   if(typeof base!=='function'||base.__v8009T10JSfxGuard)return false;
   const wrapped=function(name){
     const key=String(name||'').replace(/[^a-z0-9_]/gi,'').toLowerCase();
     if(COMBAT_SFX.has(key)){
       const active=towerActive();
       const hasBattle=battleDom();
       const resultVisible=!!document.querySelector('#tower .v7158-result.show');

       /* A visible V7175 result means the visual fight is already over. Any
          combat SFX arriving after that point is stale and must not leak. */
       if(resultVisible){
         G.suppressedLateSfx++;
         return false;
       }

       /* The recording showed impact sounds continuing on the Tower reward
          screen after the battle DOM had already disappeared. Never allow an
          impact/attack SFX on an active Tower screen unless the battle stage
          itself is still mounted. */
       if(active&&!hasBattle&&IMPACT_SFX.has(key)){
         G.suppressedLateSfx++;
         return false;
       }

       /* If the Tower replay is still resolving but the user has already left
          the Tower screen, never leak a delayed hit into the next screen. */
       if(G.routeBusy&&!active){
         G.suppressedLateSfx++;
         return false;
       }

       /* After the replay finishes, old visual/audio timers can fire for a
          fraction of a second. Only block those stale combat sounds when the
          Tower combat DOM is already gone. */
       if(!G.routeBusy&&now()<G.audioBlockUntil&&!hasBattle){
         G.suppressedLateSfx++;
         return false;
       }
     }
     return base.apply(this,arguments);
   };
   wrapped.__v8009T10JSfxGuard=true;
   wrapped.__v8009Base=base;
   window.v6111Sfx=wrapped;
   G.sfxInstalls++;
   return true;
 }catch(e){
   G.lastError=String(e?.message||e);
   return false;
 }
}

function installPresentationGuards(){
 installTowerCadence();
 installDoorPreviewPacing();
 installTowerReplayGuard();
 installTowerSfxGuard();
}

async function directRoute(idx){
 if(G.routeBusy){G.duplicateTaps++;return false}
 G.battleSeen=false;
 G.battleShownAt=0;
 G.audioBlockUntil=0;
 G.previewCalls=0;
 G.arenaWarmQueued=false;

 /* V7.214's deferred account-ready queue checks this historical flag before
    draining startup jobs. The authoritative Tower replay never set it, so up
    to ~149 queued login listeners were draining every ~45 ms through the first
    fight. Keep that queue parked for the complete door + replay window. */
 try{window.__V7085_TOWER_FIGHTING__=true;G.startupQueueFightGuards++}catch(_){}
 setBusy(true);G.chooseCalls++;

 try{
   installPresentationGuards();
   try{window.v7175CombatReset?.('tower')}catch(_){}

   let fn=window.__V7096_TOWER_DIRECT_ROUTE__;
   if(typeof fn!=='function'){
     await new Promise(resolve=>setTimeout(resolve,0));
     fn=window.__V7096_TOWER_DIRECT_ROUTE__;
   }
   if(typeof fn!=='function')throw new Error('TOWER_ROUTE_OWNER_NOT_READY');

   const result=fn(String(idx??'0'));
   if(result&&typeof result.then==='function')await result;
   G.lastError='';
   return true;
 }catch(e){
   G.lastError=String(e?.message||e);
   try{window.v063Toast?.('Turm-Server nicht erreichbar','error',G.lastError)}catch(_){}
   return false;
 }finally{
   /* Kill trailing replay FX/timers before the result/next-room view becomes
      authoritative again. This also stops late hit sounds after combat. */
   try{window.v7175CombatReset?.('tower')}catch(_){}
   G.audioBlockUntil=now()+2200;
   setBusy(false);
   try{window.__V7085_TOWER_FIGHTING__=false}catch(_){}

   /* A render may have been deliberately suppressed while the replay was
      visible. Paint the final server state once, after the guard is released. */
   requestAnimationFrame(()=>{
     try{window.vTowerRender?.()}catch(_){}
   });
 }
}

window.addEventListener('click',e=>{
 try{
   const t=e.target instanceof Element?e.target:null;
   const b=t?.closest?.('#tower [data-vt-route]');
   if(!b||!window.v7081UseAuthority?.('tower'))return;
   e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
   if(G.routeBusy||b.disabled){G.duplicateTaps++;return}
   void directRoute(String(b.dataset.vtRoute||'0'));
 }catch(err){
   G.lastError=String(err?.message||err);
   setBusy(false);
   console.warn('[V8.009-T10J] tower direct route',err);
 }
},true);

installPresentationGuards();
const reinstallPresentationGuards=()=>queueMicrotask(installPresentationGuards);
if(document.readyState==='loading'){
 document.addEventListener('DOMContentLoaded',reinstallPresentationGuards,{once:true});
}else{
 reinstallPresentationGuards();
}
window.addEventListener('growlegends:account-ready',reinstallPresentationGuards,{passive:true});
window.addEventListener('pageshow',reinstallPresentationGuards,{passive:true});

window.v8009TowerRouteGuardDiagnostics=()=>({
 ...G,
 version:'V8.009-T10J',
 oneTapFight:true,
 separateFightButton:false,
 previewWrapped:!!window.v7298TowerDoorPreview?.__v8009T10J,
 renderGuard:'canonical-vTowerRender',
 sfxGuard:!!window.v6111Sfx?.__v8009T10JSfxGuard,
 replayGuard:!!window.v7175CombatReplayStep?.__v8009T10JReplayGuard,
 firstFightArenaPrewarm:true,
 firstFightDoorDecode:true,
 towerCadenceLocked:true,
 impactSfxRequiresBattleDom:true,
 singleDoorPreviewPerRoute:true,
 lateDoorPreviewBlocked:true,
 startupAccountReadyQueueBlockedDuringFight:true,
 prematureVictoryOverlayBlocked:true
});
})();
