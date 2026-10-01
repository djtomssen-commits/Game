/* ===== V7.037 exact dungeon-loot recovery ledger =====
   Safety-only pilot. No reward is changed, replaced, approved or rejected here.
   The exact browser-created dungeon item is copied to a private recovery ledger
   immediately when generated. Failed uploads stay in a small local retry queue.
*/
(function(){
 'use strict';
 if(window.__V7037_DUNGEON_LOOT_SHADOW__)return;
 window.__V7037_DUNGEON_LOOT_SHADOW__=true;

 const VERSION='V7.037';
 const QUEUE_KEY='growLegends_v7037_dungeonLootPending';
 const seen=typeof WeakSet==='function'?new WeakSet():null;
 let flushing=false;

 function db(){try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}}
 function uid(){try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}}
 function clone(v){try{return JSON.parse(JSON.stringify(v))}catch(_){return null}}
 function queue(){
  try{const x=JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');return Array.isArray(x)?x:[]}catch(_){return []}
 }
 function saveQueue(a){
  try{localStorage.setItem(QUEUE_KEY,JSON.stringify((Array.isArray(a)?a:[]).slice(-50)))}catch(_){}
 }
 function eventId(){
  let r='';try{r=crypto.randomUUID().replaceAll('-','')}catch(_){r=Math.random().toString(36).slice(2)+Date.now().toString(36)}
  return 'v7037_dungeon_loot_'+Date.now()+'_'+r.slice(0,24);
 }
 function context(boss){
  let di=0,ri=0;
  try{
   di=Math.max(0,Math.min(19,Number(s?.dungeon?.selected)||0));
   ri=Math.max(0,Math.min(9,Number(s?.dungeon?.progress?.[di] ?? s?.dungeon?.room ?? 0)||0));
  }catch(_){}
  return {di,ri,boss:!!boss,level:Math.max(1,Math.min(300,Number(s?.level)||1))};
 }
 function remember(item,boss){
  if(!item||typeof item!=='object')return item;
  try{if(seen&&seen.has(item))return item;if(seen)seen.add(item)}catch(_){}
  const snap=clone(item);if(!snap)return item;
  const c=context(boss);
  const a=queue();
  a.push({event_id:eventId(),uid:uid(),dungeon_index:c.di,room_index:c.ri,boss:c.boss,item:snap,level:c.level,created_at:Date.now()});
  saveQueue(a);
  void flush();
  return item;
 }
 async function flush(){
  if(flushing)return false;
  const x=db(),id=uid();if(!x||!id)return false;
  flushing=true;
  try{
   let a=queue(),changed=false;
   for(let i=0;i<a.length;){
    const e=a[i];
    if(e?.uid&&String(e.uid)!==id){i++;continue}
    try{
     const {data,error}=await x.rpc('v7037_shadow_dungeon_loot',{
      p_event_id:String(e.event_id||''),
      p_dungeon_index:Number(e.dungeon_index)||0,
      p_room_index:Number(e.room_index)||0,
      p_boss:!!e.boss,
      p_item:e.item||null,
      p_level:Number(e.level)||1
     });
     if(error)throw error;
     const row=Array.isArray(data)?data[0]:data;
     if(row?.ok || row?.reason==='SHADOW_NOT_ENABLED'){
      a.splice(i,1);changed=true;continue;
     }
     i++;
    }catch(err){
     console.warn('[V7037] dungeon loot shadow retry pending',err);
     break;
    }
   }
   if(changed)saveQueue(a);
   return true;
  }finally{flushing=false}
 }

 /* Boss room: captures the final Legendary item after all active rarity/stat wrappers. */
 try{
  const base=window.v246MakeBossEpic;
  if(typeof base==='function'&&!base.__v7037ShadowWrapped){
   const wrapped=function(){const item=base.apply(this,arguments);return remember(item,true)};
   wrapped.__v7037ShadowWrapped=true;
   window.v246MakeBossEpic=wrapped;
   try{v246MakeBossEpic=wrapped}catch(_){}
  }
 }catch(e){console.warn('[V7037] boss loot wrap',e)}

 /* Rooms 1-9: captures only items generated through the canonical dungeon source. */
 try{
  const base=window.makeClassLoot;
  if(typeof base==='function'&&!base.__v7037ShadowWrapped){
   const wrapped=function(classId,source){
    const item=base.apply(this,arguments);
    if(String(source||'normal')==='dungeon')remember(item,false);
    return item;
   };
   wrapped.__v7037ShadowWrapped=true;
   window.makeClassLoot=wrapped;
   try{makeClassLoot=wrapped}catch(_){}
  }
 }catch(e){console.warn('[V7037] normal dungeon loot wrap',e)}

 window.v7037DungeonLootShadowDiagnostics=()=>({version:VERSION,pending:queue().length,uid:uid()});
 window.v7037DungeonLootShadowFlush=()=>flush();
 window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>void flush(),1200));
 setTimeout(()=>{if(queue().length)void flush()},5000);
})();
