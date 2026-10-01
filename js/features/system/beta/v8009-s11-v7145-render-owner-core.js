(()=>{
 'use strict';
 if(window.__V7145_RENDER_OWNER__)return;window.__V7145_RENDER_OWNER__=true;
 const VERSION='V7.145';
 document.body?.classList.remove('v7129-referral-frame');

 const active=id=>!!document.getElementById(id)?.classList.contains('active');
 function gate(name,id){
  try{
   const base=window[name]||globalThis[name];if(typeof base!=='function'||base.__v7145Gate)return;
   const w=function(){if(!active(id))return;return base.apply(this,arguments)};
   w.__v7145Gate=true;w.__v7145Base=base;window[name]=w;try{globalThis[name]=w}catch(_){}
  }catch(e){console.warn('[V7.145] render gate',name,e)}
 }
 /* Hidden screens must not rebuild simply because the historical global render() ran. */
 gate('renderGrow','grow');
 gate('renderQuests','quests');
 gate('renderDungeon','dungeon');

 function hookCombat(){
  try{
   const base=window.v311PlayFight||globalThis.v311PlayFight;
   if(typeof base==='function'&&!base.__v7145CombatHook){
    const w=function(){
     const r=base.apply(this,arguments);
     requestAnimationFrame(()=>window.v7141CombatArenaRefresh?.());
     if(r&&typeof r.finally==='function')return r.finally(()=>requestAnimationFrame(()=>window.v7141CombatArenaRefresh?.()));
     return r;
    };
    w.__v7145CombatHook=true;w.__v7145Base=base;window.v311PlayFight=w;try{globalThis.v311PlayFight=w}catch(_){}
   }
  }catch(e){console.warn('[V7.145] quest combat hook',e)}
  try{
   const base=window.vTowerRender;
   if(typeof base==='function'&&!base.__v7145CombatHook){
    const w=function(){const r=base.apply(this,arguments);requestAnimationFrame(()=>window.v7141CombatArenaRefresh?.());return r};
    w.__v7145CombatHook=true;w.__v7145Base=base;window.vTowerRender=w;
   }
  }catch(e){console.warn('[V7.145] tower combat hook',e)}
  /* V7.156: dungeon combat refresh is owned by the canonical dungeon renderer. */
 }
 hookCombat();
 window.addEventListener('growlegends:account-ready',()=>{document.body?.classList.remove('v7129-referral-frame');hookCombat()},{passive:true});

 /* Temporary profiler: zero observers/timers remain after the requested window. */
 window.v7145RenderAudit=function(ms=3000){
  ms=Math.max(500,Math.min(15000,Number(ms)||3000));
  const ids=['world','grow','quests','dungeon','tower'];
  const result={version:VERSION,durationMs:ms,startedAt:Date.now(),screens:{},longTasks:[],totals:{mutationBatches:0,addedNodes:0,removedNodes:0,attributeChanges:0,textChanges:0,fullRebuilds:0}};
  const observers=[];
  ids.forEach(id=>{
   const root=document.getElementById(id);
   const rec=result.screens[id]={active:!!root?.classList.contains('active'),mutationBatches:0,addedNodes:0,removedNodes:0,attributeChanges:0,textChanges:0,fullRebuilds:0};
   if(!root)return;
   const o=new MutationObserver(list=>{
    rec.mutationBatches++;result.totals.mutationBatches++;let add=0,rem=0;
    for(const m of list){
     if(m.type==='childList'){add+=m.addedNodes.length;rem+=m.removedNodes.length}
     else if(m.type==='attributes'){rec.attributeChanges++;result.totals.attributeChanges++}
     else if(m.type==='characterData'){rec.textChanges++;result.totals.textChanges++}
    }
    rec.addedNodes+=add;rec.removedNodes+=rem;result.totals.addedNodes+=add;result.totals.removedNodes+=rem;
    if(add+rem>=20){rec.fullRebuilds++;result.totals.fullRebuilds++}
   });
   o.observe(root,{subtree:true,childList:true,attributes:true,characterData:true});observers.push(o);
  });
  let po=null;
  try{if('PerformanceObserver'in window&&PerformanceObserver.supportedEntryTypes?.includes('longtask')){po=new PerformanceObserver(l=>l.getEntries().forEach(e=>result.longTasks.push({start:Math.round(e.startTime),duration:Math.round(e.duration)})));po.observe({entryTypes:['longtask']})}}catch(_){}
  return new Promise(resolve=>setTimeout(()=>{observers.forEach(o=>o.disconnect());try{po?.disconnect()}catch(_){};result.finishedAt=Date.now();result.longTaskCount=result.longTasks.length;result.longTaskMs=result.longTasks.reduce((a,b)=>a+b.duration,0);window.__V7145_LAST_RENDER_AUDIT__=result;resolve(result)},ms));
 };
 window.v7145RenderDiagnostics=()=>({version:VERSION,historicalSourceAudit:{mainRenderOverrides:146,questRenderOverrides:16,targetScripts:{grow:28,quest:38,dungeon:67,tower:40,worldAvatar:45}},growLocalFingerprintRetired:!!window.__V4120_RETIRED_V7145__,oldReferralCssRetired:true,combat:window.v7141CombatArenaDiagnostics?.()||null,lastAudit:window.__V7145_LAST_RENDER_AUDIT__||null});
 requestAnimationFrame(()=>{hookCombat();if(active('quests'))window.v7141CombatArenaRefresh?.();if(active('tower'))window.v7141CombatArenaRefresh?.();if(active('dungeon'))window.v7141CombatArenaRefresh?.()});
})();
