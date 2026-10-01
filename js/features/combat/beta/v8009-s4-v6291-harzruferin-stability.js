(()=>{
 'use strict';
 if(window.__V6291_HARZ_STABILITY__)return;
 window.__V6291_HARZ_STABILITY__=true;

 const state=()=>{try{return typeof s!=='undefined'?s:window.s||null}catch(_){return window.s||null}};
 const isSummoner=()=>String(state()?.playerClass||'')==='summoner';

 function cleanForeignCompanions(){
   document.body?.classList.toggle('v6291-summoner-active',isSummoner());
   if(!isSummoner()){
     document.querySelectorAll('.v6287-summon-roster,.v6287-summon-fx').forEach(n=>n.remove());
   }
 }

 /* Dungeon 1 is the universal start dungeon. Repair only invalid/stale states;
    a legitimately completed boss (progress 9) remains completed. */
 function repairDungeonOne(){
   const st=state();if(!st)return false;
   st.dungeon=(st.dungeon&&typeof st.dungeon==='object')?st.dungeon:{};
   st.dungeon.progress=(st.dungeon.progress&&typeof st.dungeon.progress==='object')?st.dungeon.progress:{};
   st.dungeon.completed=Array.isArray(st.dungeon.completed)?st.dungeon.completed.map(Number).filter(Number.isInteger):[];
   st.dungeon.unlocked=Array.isArray(st.dungeon.unlocked)?st.dungeon.unlocked.map(Number).filter(Number.isInteger):[];
   let changed=false;
   if(!st.dungeon.unlocked.includes(0)){st.dungeon.unlocked.unshift(0);changed=true}
   const p0=Math.max(0,Math.min(9,Number(st.dungeon.progress?.[0])||0));
   st.dungeon.progress[0]=p0;
   /* A stale "completed" flag without boss progress must never seal D1. */
   if(p0<9&&st.dungeon.completed.includes(0)){
     st.dungeon.completed=st.dungeon.completed.filter(x=>x!==0);
     changed=true;
   }
   if(st.dungeon.selected==null||!Number.isFinite(Number(st.dungeon.selected))){
     st.dungeon.selected=0;changed=true;
   }
   if(changed){
     try{localStorage.setItem(KEY,JSON.stringify(st))}catch(_){}
     try{persist?.(false)}catch(_){}
   }
   return changed;
 }
 window.v6291RepairDungeonOne=repairDungeonOne;

 /* Last authority: D1 has no key gate and is available whenever it is not
    genuinely completed. */
 /* V8.009: final dungeonUnlocked wrapping retired; v4165 already guarantees D1/key truth. */
 /* V8.009: final dungeonAvailable wrapping retired; repairDungeonOne stays lifecycle-driven. */

 /* PvP/Hall class parsing also needs to preserve the fifth class. */
 try{
   if(typeof v204ClassIdFromProfile==='function'&&!window.__v6291PvpClass){
     const base=v204ClassIdFromProfile;
     const wrapped=function(p){
       const id=String(p?.class_id||'').toLowerCase(),nm=String(p?.class_name||'').toLowerCase();
       if(id==='summoner'||nm.includes('harzruferin')||nm.includes('harzrufer'))return'summoner';
       return base.apply(this,arguments);
     };
     try{v204ClassIdFromProfile=wrapped}catch(_){}
     window.v204ClassIdFromProfile=wrapped;
     window.__v6291PvpClass=true;
   }
 }catch(_){}

 function refresh(){
   cleanForeignCompanions();
   repairDungeonOne();
   try{if(document.getElementById('hall')?.classList.contains('active'))window.v646DecorateHall?.()}catch(_){}
 }

 document.addEventListener('click',e=>{
   const nav=e.target instanceof Element?e.target.closest('[data-screen],[data-go],[data-v085-go]'):null;
   if(!nav)return;
   const id=nav.dataset.screen||nav.dataset.go||nav.dataset.v085Go||'';
   if(id==='dungeon')repairDungeonOne();
   setTimeout(refresh,0);
 },true);

 window.addEventListener('growlegends:account-ready',()=>setTimeout(refresh,50));
 window.addEventListener('pageshow',()=>setTimeout(refresh,50),{passive:true});
 window.addEventListener('growlegends:foreground-ready',refresh,{passive:true});

 window.v6291Diagnostics=()=>({
   version:'V6.291',
   class:String(state()?.playerClass||''),
   summoner:isSummoner(),
   companionNodes:document.querySelectorAll('.v6287-summon-roster,.v6287-summon-fx').length,
   dungeon1Unlocked:typeof dungeonUnlocked==='function'?dungeonUnlocked(0):null,
   dungeon1Available:typeof dungeonAvailable==='function'?dungeonAvailable(0):null,
   dungeon1Progress:Number(state()?.dungeon?.progress?.[0])||0,
   dungeon1Completed:Array.isArray(state()?.dungeon?.completed)&&state().dungeon.completed.includes(0)
 });
})();
