(()=>{
 'use strict';
 const VERSION='V4.99 Stable',SHORT='V4.99';
 const SNAP_KEY='growLegendsGrowPlantsV498';
 function snapKey(){return SNAP_KEY+':'+owner()}

 function clone(v){try{return JSON.parse(JSON.stringify(v))}catch(e){return null}}
 function plantCount(arr){return Array.isArray(arr)?arr.filter(Boolean).length:0}
 function owner(){return String(s?.__accountOwnerId||s?.social?.playerId||'local')}
 function seedExists(id){
   try{return !!(seedTypes&&seedTypes[id])}catch(e){return !!id}
 }
 function normalizePlant(p,i=0){
   if(!p||typeof p!=='object')return null;
   const out={...p};
   let seed=String(out.seed||out.seedId||'moss');
   if(!seedExists(seed))seed='moss';
   const now=Date.now();
   const start=Number(out.start);
   const fallbackGrow=(()=>{try{return Number(seedTypes?.[seed]?.growMs)||60000}catch(e){return 60000}})();
   const duration=Number(out.duration);
   out.seed=seed;
   delete out.seedId;
   out.start=Number.isFinite(start)&&start>0?start:now;
   out.duration=Math.max(1000,Number.isFinite(duration)&&duration>0?duration:fallbackGrow);
   out.uid=String(out.uid||`v498_${out.start}_${i}_${Math.random().toString(36).slice(2,7)}`);
   out.care=Array.isArray(out.care)?[0,1,2,3].map(n=>!!out.care[n]):[false,false,false,false];
   out.mutation=(out.mutation==null||typeof out.mutation==='string')?out.mutation:null;
   out.mutationChecked=!!out.mutationChecked;
   return out;
 }
 function normalizePlants(arr){
   if(!Array.isArray(arr))return [];
   return arr.map((p,i)=>normalizePlant(p,i));
 }
 function snapshotObject(plants){
   return {
     owner:owner(),
     revision:Math.max(0,Number(s?.__saveRevision)||0),
     savedAt:Date.now(),
     plants:normalizePlants(clone(plants)||[]),
     selectedPlantUid:String(s?.grow?.v492?.selectedPlantUid||'')
   };
 }
 function writeSnapshot(plants=s?.grow?.plants){
   if(window.v7081UseAuthority?.('grow'))return;
   try{localStorage.setItem(snapKey(),JSON.stringify(snapshotObject(plants)))}catch(e){}
 }
 function readSnapshot(){
   try{
     const x=JSON.parse(localStorage.getItem(snapKey())||'null');
     if(!x||x.owner!==owner()||!Array.isArray(x.plants))return null;
     return x;
   }catch(e){return null}
 }
 function restore(plants,selected=''){
   if(!Array.isArray(plants)||!plantCount(plants))return false;
   s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};
   s.grow.plants=normalizePlants(clone(plants)||[]);
   s.grow.v492=(s.grow.v492&&typeof s.grow.v492==='object')?s.grow.v492:{};
   const ids=new Set(s.grow.plants.filter(Boolean).map(p=>p.uid));
   s.grow.v492.selectedPlantUid=ids.has(selected)?selected:(s.grow.plants.find(Boolean)?.uid||'');
   return true;
 }

 /* V4.97 still called the original V4.02 normalizer on every persist().
    That old function reduced each plant to {start,duration,seed} and silently
    discarded uid/care/mutation. Preserve the complete modern plant record. */
 try{
   if(typeof normalizeState==='function'&&!normalizeState.__v498){
     const baseNormalize=normalizeState;
     const wrapped=function(){
       const before=normalizePlants(clone(s?.grow?.plants)||[]);
       const selected=String(s?.grow?.v492?.selectedPlantUid||'');
       const r=baseNormalize.apply(this,arguments);
       if(Array.isArray(before)){
         s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};
         s.grow.plants=before;
         s.grow.v492=(s.grow.v492&&typeof s.grow.v492==='object')?s.grow.v492:{};
         if(selected)s.grow.v492.selectedPlantUid=selected;
       }
       return r;
     };
     wrapped.__v498=true;
     normalizeState=wrapped;
     try{window.normalizeState=wrapped}catch(e){}
   }
 }catch(e){console.warn('V4.99 normalizeState guard',e)}

 /* Persist the exact plant state after every normal game save. This also means
    intentional harvest/reset writes an empty snapshot, so old plants are not
    resurrected later. */
 try{
   if(typeof persist==='function'&&!persist.__v498){
     const basePersist=persist;
     const wrapped=function(){
       const r=basePersist.apply(this,arguments);
       writeSnapshot(s?.grow?.plants);
       return r;
     };
     wrapped.__v498=true;
     persist=wrapped;
     try{window.persist=wrapped}catch(e){}
   }
 }catch(e){console.warn('V4.99 persist guard',e)}

 /* Exact bug guard: navigation is not allowed to turn a non-empty Growroom into
    an empty one. We keep the pre-navigation array in memory and restore it if
    any historical render/navigation layer unexpectedly clears it. */
 try{
   if(typeof v032Go==='function'&&!v032Go.__v498){
     const baseGo=v032Go;
     const wrapped=function(id){
       const before=normalizePlants(clone(s?.grow?.plants)||[]);
       const selected=String(s?.grow?.v492?.selectedPlantUid||'');
       const had=plantCount(before)>0;
       const r=baseGo.apply(this,arguments);
       if(had&&plantCount(s?.grow?.plants)===0){
         restore(before,selected);
         try{persist(false)}catch(e){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}
         if(id==='grow')try{renderGrow()}catch(e){}
         console.warn('V4.99 restored Growroom plants after navigation');
       }else{
         writeSnapshot(s?.grow?.plants);
       }
       return r;
     };
     wrapped.__v498=true;
     v032Go=wrapped;
     try{window.v032Go=wrapped}catch(e){}
   }
 }catch(e){console.warn('V4.99 navigation guard',e)}

 /* If a previous render already blanked the array in this session, use the
    newest same-account snapshot only when it is at least as new as the state. */
 function repairFromSnapshot(){
   if(window.v7081UseAuthority?.('grow'))return false;
   try{
     if(plantCount(s?.grow?.plants)>0){writeSnapshot(s.grow.plants);return false}
     const snap=readSnapshot();if(!snap||plantCount(snap.plants)===0)return false;
     const currentRev=Math.max(0,Number(s?.__saveRevision)||0);
     if(Number(snap.revision||0)<currentRev)return false;
     if(!restore(snap.plants,snap.selectedPlantUid))return false;
     try{persist(false)}catch(e){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}
     try{renderGrow()}catch(e){}
     return true;
   }catch(e){console.warn('V4.99 snapshot repair',e);return false}
 }
 window.v498RepairGrowPlants=repairFromSnapshot;

 function stamp(){}

 writeSnapshot(s?.grow?.plants);
 stamp();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){repairFromSnapshot();stamp()}},{passive:true});
 window.addEventListener('pageshow',()=>{repairFromSnapshot();stamp()},{passive:true});
 [250,1000,3500,12000].forEach(ms=>setTimeout(()=>{repairFromSnapshot();stamp()},ms));
})();
