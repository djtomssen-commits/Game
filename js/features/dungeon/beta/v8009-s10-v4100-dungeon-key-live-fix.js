(()=>{
 'use strict';
 const VERSION='V4.100 Stable',SHORT='V4.100';
 let lastKeySig='';
 let painting=false;

 function stamp(){}

 function normalizeKeys(){
  try{if(typeof v243EnsureDungeonKeyState==='function')v243EnsureDungeonKeyState()}catch(e){}
  s.dungeon=(s.dungeon&&typeof s.dungeon==='object')?s.dungeon:{};
  s.dungeon.keys=(s.dungeon.keys&&typeof s.dungeon.keys==='object')?s.dungeon.keys:{};
  s.dungeon.unlocked=Array.isArray(s.dungeon.unlocked)?s.dungeon.unlocked.map(Number):[0];
  if(!s.dungeon.unlocked.includes(0))s.dungeon.unlocked.push(0);
  Object.keys(s.dungeon.keys).forEach(raw=>{
   const i=Number(raw);
   if(s.dungeon.keys[raw]&&Number.isInteger(i)&&i>0&&!s.dungeon.unlocked.includes(i))s.dungeon.unlocked.push(i);
  });
  s.dungeon.unlocked=[...new Set(s.dungeon.unlocked.filter(Number.isInteger))].sort((a,b)=>a-b);
 }

 function keySig(){
  normalizeKeys();
  const keys=Object.keys(s.dungeon.keys||{}).filter(k=>s.dungeon.keys[k]).map(Number).filter(Number.isInteger).sort((a,b)=>a-b);
  const unlocked=(s.dungeon.unlocked||[]).map(Number).filter(Number.isInteger).sort((a,b)=>a-b);
  return JSON.stringify({keys,unlocked});
 }

 function renderWorld(reason='sync'){
  if(painting)return;
  painting=true;
  try{
   normalizeKeys();
   s.dungeon.layer='world';
   s.dungeon.view='map';
   let ok=false;
   try{if(typeof v251RenderWorld==='function')ok=!!v251RenderWorld()}catch(e){}
   if(!ok)try{if(typeof v230ShowDungeonWorld==='function')ok=!!v230ShowDungeonWorld()}catch(e){}
   if(!ok)try{if(typeof v065RenderWorld==='function'){v065RenderWorld();ok=true}}catch(e){}
   try{if(typeof v242PaintDungeonWorldStatus==='function')v242PaintDungeonWorldStatus()}catch(e){}
   try{if(typeof v250PaintKeyProgress==='function')v250PaintKeyProgress()}catch(e){}
   try{if(typeof v067BindWorldMap==='function')v067BindWorldMap()}catch(e){}
   try{if(typeof renderDungeonTicket==='function')renderDungeonTicket()}catch(e){}
  }catch(e){console.warn('V4.100 dungeon world render',reason,e)}
  finally{painting=false;stamp()}
 }

 function keyChanged(reason='key-change'){
  const now=keySig();
  if(now===lastKeySig)return false;
  lastKeySig=now;
  const dungeonActive=!!document.querySelector('#dungeon')?.classList.contains('active');
  /* Stones are earned outside a dungeon fight. Keep the next visit on the 20er map
     so an old completed selected dungeon cannot own the visible state. */
  if(!dungeonActive){s.dungeon.layer='world';s.dungeon.view='map'}
  queueMicrotask(()=>{if(!document.querySelector('#dungeon')?.classList.contains('active'))renderWorld(reason+'-hidden')});
  return true;
 }

 /* Catch every historical key source at the actual save boundary. */
 try{
  if(typeof persist==='function'&&!persist.__v4100DungeonKeys){
   const basePersist=persist;
   const wrapped=function(){
    const r=basePersist.apply(this,arguments);
    try{keyChanged('persist')}catch(e){}
    return r;
   };
   wrapped.__v4100DungeonKeys=true;
   persist=wrapped;try{window.persist=wrapped}catch(e){}
  }
 }catch(e){console.warn('V4.100 persist wrapper',e)}

 /* Canonical pity grant: synchronize in the same call, before another renderer can
    reuse the previous completed dungeon. */
 try{
  if(typeof v250GrantKey==='function'&&!v250GrantKey.__v4100DungeonKeys){
   const baseGrant=v250GrantKey;
   const wrapped=function(i){
    const r=baseGrant.apply(this,arguments);
    normalizeKeys();
    lastKeySig=keySig();
    if(r){
     s.dungeon.layer='world';s.dungeon.view='map';
     queueMicrotask(()=>renderWorld('grant-'+Number(i)));
     requestAnimationFrame(()=>renderWorld('grant-raf-'+Number(i)));
    }
    return r;
   };
   wrapped.__v4100DungeonKeys=true;
   v250GrantKey=wrapped;try{window.v250GrantKey=wrapped}catch(e){}
  }
 }catch(e){console.warn('V4.100 grant wrapper',e)}

 function wrapClaim(name){
  try{
   let fn=window[name];if(typeof fn!=='function'||fn.__v4100DungeonKeys)return;
   const wrapped=function(){
    const before=keySig();
    let r;
    try{r=fn.apply(this,arguments)}catch(err){setTimeout(()=>keyChanged(name+'-error'),0);throw err}
    const done=()=>{
     normalizeKeys();const after=keySig();
     if(after!==before){lastKeySig=after;s.dungeon.layer='world';s.dungeon.view='map';renderWorld(name+'-done')}
     else keyChanged(name+'-done');
    };
    if(r&&typeof r.then==='function')return r.then(x=>{done();return x},err=>{done();throw err});
    setTimeout(done,0);return r;
   };
   wrapped.__v4100DungeonKeys=true;window[name]=wrapped;
   try{if(name==='claimQuest')claimQuest=wrapped;if(name==='v233ClaimQuest')v233ClaimQuest=wrapped}catch(e){}
  }catch(e){console.warn('V4.100 claim wrapper',name,e)}
 }
 wrapClaim('claimQuest');wrapClaim('v233ClaimQuest');

 /* Final navigation owner: opening Dungeon always means the 20-dungeon overview.
    Do this both before and after the historical wrapper chain. */
 /* V7.121: V4100 navigation wrapper retired. Its grant/claim/persist hooks remain,
    while the later V467 authority owns Dungeon entry before and after navigation. */
 window.__V4100_GO_RETIRED__='v7121-v467';

 lastKeySig=keySig();stamp();
 window.v4100SyncDungeonUnlocks=()=>{normalizeKeys();lastKeySig=keySig();renderWorld('manual')};
 document.addEventListener('growlegends:dungeon-key-changed',()=>{
  normalizeKeys();lastKeySig=keySig();
  const active=!!document.querySelector('#dungeon')?.classList.contains('active');
  const inside=active&&String(s.dungeon?.layer||'world')==='dungeon';
  /* V7.214: a late canonical key/state sync must never throw an active player
     out of the 10-room map or battle back to the 20-dungeon world map. */
  if(inside)return;
  s.dungeon.layer='world';s.dungeon.view='map';renderWorld('event')
});
 window.addEventListener('pageshow',()=>{normalizeKeys();lastKeySig=keySig();stamp()},{passive:true});
})();
