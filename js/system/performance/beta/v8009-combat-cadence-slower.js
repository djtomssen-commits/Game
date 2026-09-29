(()=>{'use strict';
if(window.__V8009_SLOWER_COMBAT_CADENCE__)return;
window.__V8009_SLOWER_COMBAT_CADENCE__=true;

/* V8.009 T9F BETA · calmer combat cadence + Tower presentation guard.
   Presentation only. Server combat math/state remains authoritative. */
const slowerCadence=()=>({
  frameDelay:840,
  attackDelay:420,
  settleDelay:420,
  visualAttackMs:680,
  visualHitMs:680,
  visualPopMs:1050,
  startDelayMs:220
});
window.v7269DungeonCadence=slowerCadence;
try{v7269DungeonCadence=slowerCadence}catch(_){}

const FLOW=window.__V8009_TOWER_FLOW_GUARD__||(window.__V8009_TOWER_FLOW_GUARD__={
  routeBusy:false,
  battleSeen:false,
  battleShownAt:0,
  startedAt:0,
  duplicateRouteTaps:0,
  suppressedRenders:0,
  extraFxSkipped:0,
  installs:0
});
const sleep=ms=>new Promise(r=>setTimeout(r,Math.max(0,Number(ms)||0)));

function installTowerFlowGuard(){
  FLOW.installs++;

  /* The authoritative route RPC already resolves the combat server-side.
     Keep exactly one route request alive until its replay presentation is done. */
  const route=window.__V7096_TOWER_DIRECT_ROUTE__;
  if(typeof route==='function'&&!route.__v8009FlowGuard){
    const wrapped=async function(idx){
      if(FLOW.routeBusy){
        FLOW.duplicateRouteTaps++;
        return {ok:false,reason:'CLIENT_ROUTE_BUSY',ignored:true};
      }
      FLOW.routeBusy=true;
      FLOW.battleSeen=false;
      FLOW.battleShownAt=0;
      FLOW.startedAt=performance.now();
      try{
        return await route.call(this,idx);
      }finally{
        /* A one-hit server fight must still be visibly perceived as a fight. */
        if(FLOW.battleSeen&&FLOW.battleShownAt){
          const shownFor=performance.now()-FLOW.battleShownAt;
          if(shownFor<2200)await sleep(2200-shownFor);
        }
        FLOW.routeBusy=false;
        setTimeout(()=>{try{window.vTowerRender?.()}catch(_){}},0);
      }
    };
    wrapped.__v8009FlowGuard=true;
    wrapped.__v8009Base=route;
    window.__V7096_TOWER_DIRECT_ROUTE__=wrapped;
  }

  /* Background/server snapshots can arrive while the replay is still running.
     Do not let such a paint replace the combat DOM with the already-resolved
     reward/next-room state before the player has seen the replay. */
  const render=window.vTowerRender;
  if(typeof render==='function'&&!render.__v8009FlowGuard){
    const wrapped=function(){
      const run=window.s?.tower?.run;
      const mode=String(run?.mode||'');
      const battleDom=!!document.querySelector('#tower .vT-battle-stage');
      if(FLOW.routeBusy){
        if(mode==='battle'){
          if(!FLOW.battleSeen){
            FLOW.battleSeen=true;
            FLOW.battleShownAt=performance.now();
          }
          return render.apply(this,arguments);
        }
        if(FLOW.battleSeen&&battleDom){
          FLOW.suppressedRenders++;
          return false;
        }
      }
      return render.apply(this,arguments);
    };
    wrapped.__v8009FlowGuard=true;
    wrapped.__v8009Base=render;
    window.vTowerRender=wrapped;
  }

  /* v7175CombatReplayStep already owns the detailed Tower hit/status renderer.
     The older v6225 bridge feeds the same Tower scene again and creates duplicate
     DOM/effect work. Keep it for all other combat modes, skip only Tower. */
  const extra=window.v6225ExtraHitVisual;
  if(typeof extra==='function'&&!extra.__v8009TowerDedup){
    const wrapped=function(mode){
      if(String(mode||'')==='tower'){
        FLOW.extraFxSkipped++;
        return false;
      }
      return extra.apply(this,arguments);
    };
    wrapped.__v8009TowerDedup=true;
    wrapped.__v8009Base=extra;
    window.v6225ExtraHitVisual=wrapped;
  }
}

installTowerFlowGuard();
setTimeout(installTowerFlowGuard,0);
setTimeout(installTowerFlowGuard,750);
window.addEventListener('growlegends:account-ready',()=>setTimeout(installTowerFlowGuard,80),{passive:true});
window.addEventListener('pageshow',()=>setTimeout(installTowerFlowGuard,80),{passive:true});

window.v8009CombatCadenceDiagnostics=()=>({
  version:'V8.009-T9F-BETA',
  dungeonPvpTower:slowerCadence(),
  towerFlow:{...FLOW},
  towerRouteGuard:!!window.__V7096_TOWER_DIRECT_ROUTE__?.__v8009FlowGuard,
  towerRenderGuard:!!window.vTowerRender?.__v8009FlowGuard,
  towerExtraFxDedup:!!window.v6225ExtraHitVisual?.__v8009TowerDedup,
  guildBossWarMultiplier:1.25
});
})();