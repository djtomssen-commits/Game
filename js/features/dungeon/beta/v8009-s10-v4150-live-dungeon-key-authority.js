(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 let repaintQueued=false,lastReason='startup';
 function ensure(){
  try{
   s.dungeon=(s.dungeon&&typeof s.dungeon==='object')?s.dungeon:{};
   s.dungeon.keys=(s.dungeon.keys&&typeof s.dungeon.keys==='object')?s.dungeon.keys:{};
   s.dungeon.unlocked=Array.isArray(s.dungeon.unlocked)?s.dungeon.unlocked.map(Number).filter(Number.isInteger):[];
   s.dungeon.completed=Array.isArray(s.dungeon.completed)?s.dungeon.completed.map(Number).filter(Number.isInteger):[];
   s.dungeon.progress=(s.dungeon.progress&&typeof s.dungeon.progress==='object')?s.dungeon.progress:{};
   if(!s.dungeon.unlocked.includes(0))s.dungeon.unlocked.push(0);
   const max=Array.isArray(dungeons)?dungeons.length:20;
   for(let i=1;i<max;i++){
    const key=!!s.dungeon.keys[i]||!!s.dungeon.keys[String(i)];
    const unlocked=s.dungeon.unlocked.includes(i);
    if(key&&!unlocked)s.dungeon.unlocked.push(i);
    if(unlocked&&!key)s.dungeon.keys[i]=true;
    if((key||unlocked)&&s.dungeon.progress[i]==null)s.dungeon.progress[i]=0;
   }
   s.dungeon.unlocked=[...new Set(s.dungeon.unlocked.map(Number).filter(Number.isInteger))].sort((a,b)=>a-b);
   return true;
  }catch(e){console.warn('V4.159 dungeon key normalize',e);return false}
 }
 function has(i){
  i=Number(i);if(i===0)return true;ensure();
  return !!s.dungeon.keys?.[i]||!!s.dungeon.keys?.[String(i)]||s.dungeon.unlocked.includes(i);
 }
 function sig(){
  ensure();
  const keys=Object.keys(s.dungeon.keys||{}).filter(k=>s.dungeon.keys[k]).map(Number).filter(Number.isInteger).sort((a,b)=>a-b);
  return JSON.stringify({keys,unlocked:(s.dungeon.unlocked||[]).slice().sort((a,b)=>a-b)});
 }
 function persistKeys(){
  try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
  try{if(typeof v075ScheduleSave==='function')v075ScheduleSave()}catch(e){}
  try{if(typeof v200SaveScopedLocal==='function')v200SaveScopedLocal()}catch(e){}
 }
 function repaint(reason='key-change'){
  lastReason=reason;ensure();
  try{
   const screen=document.getElementById('dungeon');
   const active=!!screen?.classList.contains('active');
   const layer=String(s.dungeon?.layer||'world');
   if(active&&layer==='world'){
    if(typeof v251RenderWorld==='function')v251RenderWorld();
    else if(typeof v230ShowDungeonWorld==='function')v230ShowDungeonWorld();
    else if(typeof v065RenderWorld==='function')v065RenderWorld();
   }
   if(active){
    try{v242PaintDungeonWorldStatus?.()}catch(e){}
    try{v250PaintKeyProgress?.()}catch(e){}
    try{v067BindWorldMap?.()}catch(e){}
   }
  }catch(e){console.warn('V4.159 dungeon live repaint',reason,e)}
 }
 function changed(before,reason){
  ensure();const after=sig();if(after===before)return false;
  persistKeys();
  try{document.dispatchEvent(new CustomEvent('growlegends:dungeon-key-changed',{detail:{reason,version:V.short}}))}catch(e){}
  if(!repaintQueued){
   repaintQueued=true;
   queueMicrotask(()=>{repaintQueued=false;repaint(reason+'-micro')});
  }
  requestAnimationFrame(()=>repaint(reason+'-raf'));
  setTimeout(()=>repaint(reason+'-120'),120);
  return true;
 }
 // Final availability source: key[] and unlocked[] are one truth immediately, never only after reload.
 try{dungeonUnlocked=has;window.dungeonUnlocked=has}catch(e){}
 try{if(typeof v243HasDungeonKey==='function'){v243HasDungeonKey=has;window.v243HasDungeonKey=has}}catch(e){}
 try{if(typeof v250HasKey==='function'){v250HasKey=has;window.v250HasKey=has}}catch(e){}
 // Canonical pity/key grant: normalize, persist and repaint in the same transaction.
 try{
  if(typeof v250GrantKey==='function'&&!window.__v4150GrantWrapped){
   const base=v250GrantKey;
   const wrapped=function(i){const before=sig();const r=base.apply(this,arguments);changed(before,'grant-'+Number(i));return r};
   try{v250GrantKey=wrapped}catch(e){}window.v250GrantKey=wrapped;window.__v4150GrantWrapped=true;
  }
 }catch(e){console.warn('V4.159 grant hook',e)}
 function wrapClaim(name){
  try{
   const fn=window[name];if(typeof fn!=='function'||fn.__v4150KeyWrapped)return;
   const wrapped=function(){
    const before=sig();let r;
    try{r=fn.apply(this,arguments)}catch(err){changed(before,name+'-throw');throw err}
    if(r&&typeof r.then==='function')return r.then(x=>{changed(before,name);return x},err=>{changed(before,name+'-reject');throw err});
    changed(before,name);return r;
   };
   wrapped.__v4150KeyWrapped=true;window[name]=wrapped;
   try{if(name==='claimQuest')claimQuest=wrapped;if(name==='v233ClaimQuest')v233ClaimQuest=wrapped}catch(e){}
  }catch(e){console.warn('V4.159 claim hook',name,e)}
 }
 wrapClaim('claimQuest');wrapClaim('v233ClaimQuest');
 // Opening Dungeons always normalizes first and paints the current live state after the existing navigation chain.
 try{
  if(typeof v032Go==='function'&&!window.__v4150DungeonGoWrapped){
   const base=v032Go;
   const wrapped=function(id){if(id==='dungeon')ensure();const r=base.apply(this,arguments);if(id==='dungeon'){requestAnimationFrame(()=>repaint('open-dungeon'));setTimeout(()=>repaint('open-dungeon-100'),100)}return r};
   try{v032Go=wrapped}catch(e){}window.v032Go=wrapped;window.__v4150DungeonGoWrapped=true;
  }
 }catch(e){console.warn('V4.159 dungeon navigation hook',e)}
 window.v4150SyncDungeonKeys=()=>{const before=sig();ensure();persistKeys();repaint('manual');return{before,after:sig()}};
 window.v4150DungeonKeyDiagnostics=()=>({version:V.short,signature:sig(),unlocked:[...(s.dungeon?.unlocked||[])],keys:{...(s.dungeon?.keys||{})},lastReason,watcherRetired:!window.__V467_KEY_WATCHER__});
 function stamp(){}
 ensure();stamp();
 window.addEventListener('growlegends:account-ready',()=>{ensure();repaint('account-ready')});
})();
