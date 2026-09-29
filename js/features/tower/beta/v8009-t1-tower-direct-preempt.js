(()=>{
'use strict';
if(window.__V7096_TOWER_DIRECT_PREEMPT__)return;
window.__V7096_TOWER_DIRECT_PREEMPT__=true;

/* V8.009-T10G: one-tap authoritative Tower flow + replay cleanup.
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
  arenaWarmQueued:false
});

const COMBAT_SFX=new Set(['hit','crithit','crit','enemyhit','enemy_hit','block','dodge','heal','slash','strike','attack']);

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

function installDoorPreviewPacing(){
 try{
   const base=window.v7298TowerDoorPreview;
   if(typeof base!=='function'||base.__v8009T10G)return false;
   const wrapped=function(run,routeIndex=0,ms=900){
     return base.call(this,run,routeIndex,Math.max(G.doorPreviewMinMs,Number(ms)||0));
   };
   wrapped.__v8009T10G=true;
   wrapped.__v8009Base=base;
   window.v7298TowerDoorPreview=wrapped;
   return true;
 }catch(e){
   G.lastError=String(e?.message||e);
   return false;
 }
}

function installTowerRenderGuard(){
 try{
   const base=window.vTowerRender;
   if(typeof base!=='function'||base.__v8009T10GFlowGuard)return false;
   const wrapped=function(){
     const run=window.s?.tower?.run;
     const mode=String(run?.mode||'');
     const hasBattle=battleDom();

     if(G.routeBusy){
       if(mode==='battle'){
         if(!G.battleSeen){
           G.battleSeen=true;
           G.battleShownAt=now();
         }
         const out=base.apply(this,arguments);

         /* The first fight used to build the V7175 arena lazily on the first
            replay hit. That DOM/layout work is visible as startup stutter.
            Build it immediately after the battle DOM exists, while the replay
            is still in its start delay. Also request image decode up front. */
         if(!G.arenaWarmQueued){
           G.arenaWarmQueued=true;
           requestAnimationFrame(()=>{
             try{
               if(!battleDom())return;
               window.v7175CombatArenaRefresh?.();
               document.querySelectorAll('#tower .vT-battle-stage img').forEach(img=>{
                 try{img.decode?.().catch(()=>{})}catch(_){}
               });
               G.arenaPrewarms++;
             }catch(_){}
           });
         }
         return out;
       }

       /* Server/background snapshots may already contain the post-fight state
          while the visible replay is still running. Do not let them replace
          the combat DOM in the middle of an attack. */
       if(G.battleSeen&&hasBattle){
         G.suppressedRenders++;
         return false;
       }
     }
     return base.apply(this,arguments);
   };
   wrapped.__v8009T10GFlowGuard=true;
   wrapped.__v8009Base=base;
   window.vTowerRender=wrapped;
   G.renderInstalls++;
   return true;
 }catch(e){
   G.lastError=String(e?.message||e);
   return false;
 }
}

function installTowerReplayGuard(){
 try{
   const base=window.v7175CombatReplayStep;
   if(typeof base!=='function'||base.__v8009T10GReplayGuard)return false;
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
   wrapped.__v8009T10GReplayGuard=true;
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
   if(typeof base!=='function'||base.__v8009T10GSfxGuard)return false;
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
   wrapped.__v8009T10GSfxGuard=true;
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
 installDoorPreviewPacing();
 installTowerRenderGuard();
 installTowerReplayGuard();
 installTowerSfxGuard();
}

async function directRoute(idx){
 if(G.routeBusy){G.duplicateTaps++;return false}
 G.battleSeen=false;
 G.battleShownAt=0;
 G.audioBlockUntil=0;
 G.arenaWarmQueued=false;
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
   G.audioBlockUntil=now()+1400;
   setBusy(false);

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
   console.warn('[V8.009-T10G] tower direct route',err);
 }
},true);

installPresentationGuards();
setTimeout(installPresentationGuards,0);
setTimeout(installPresentationGuards,500);
setTimeout(installPresentationGuards,1200);
window.addEventListener('growlegends:account-ready',()=>setTimeout(installPresentationGuards,80),{passive:true});
window.addEventListener('pageshow',()=>setTimeout(installPresentationGuards,80),{passive:true});

window.v8009TowerRouteGuardDiagnostics=()=>({
 ...G,
 version:'V8.009-T10G',
 oneTapFight:true,
 separateFightButton:false,
 previewWrapped:!!window.v7298TowerDoorPreview?.__v8009T10G,
 renderGuard:!!window.vTowerRender?.__v8009T10GFlowGuard,
 sfxGuard:!!window.v6111Sfx?.__v8009T10GSfxGuard,
 replayGuard:!!window.v7175CombatReplayStep?.__v8009T10GReplayGuard,
 firstFightArenaPrewarm:true,
 prematureVictoryOverlayBlocked:true
});
})();
