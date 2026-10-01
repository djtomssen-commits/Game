(()=>{
 'use strict';
 if(window.__V6243_WEEKLY_CHEST_AUDIT__)return;
 window.__V6243_WEEKLY_CHEST_AUDIT__=true;

 function n(v){return Math.max(0,Math.floor(Number(v)||0))}
 function canonicalDungeonCount(data){
   /* v336 keeps this lifetime counter synced from real room progression. */
   const a=n(s?.v106Achievements?.stats?.dungeonWins);
   if(a>0)return a;
   try{
     const done=new Set((s?.dungeon?.completed||[]).map(Number));
     const prog=s?.dungeon?.progress||{};
     const count=Array.isArray(dungeons)?dungeons.length:20;
     let total=0;
     for(let i=0;i<count;i++)total+=done.has(i)?10:Math.max(0,Math.min(9,n(prog[i])));
     return total;
   }catch(_){
     return `${n(data?.dungeonIndex)}:${n(data?.roomIndex)}`
   }
 }

 function installDungeonChestHook(){
   try{
     const base=window.v247ShowDungeonReward||(typeof v247ShowDungeonReward==='function'?v247ShowDungeonReward:null);
     if(typeof base!=='function')return false;
     if(base.__v6243WeeklyChestDungeon)return true;

     const wrapped=function(data){
       const result=base.apply(this,arguments);
       try{
         const di=n(data?.dungeonIndex),ri=n(data?.roomIndex);
         const boss=!!data?.boss||!!data?.enemy?.boss||ri>=9;
         const count=canonicalDungeonCount(data);
         const token=`chest:${count}`;
         window.v6239WeeklyChestActivity?.(
           'dungeon',
           {dungeonIndex:di,roomIndex:ri,boss,winsAfter:count,source:'v247ShowDungeonReward'},
           token
         );
       }catch(e){console.warn('V6.243 weekly chest dungeon XP',e)}
       return result;
     };
     wrapped.__v6243WeeklyChestDungeon=true;
     wrapped.__v6243Base=base;
     window.v247ShowDungeonReward=wrapped;
     try{v247ShowDungeonReward=wrapped}catch(_){}
     return true;
   }catch(e){console.warn('V6.243 install dungeon chest hook',e);return false}
 }

 installDungeonChestHook();
 [80,350,1200,3500].forEach(ms=>setTimeout(installDungeonChestHook,ms));

 window.v6243WeeklyChestAudit=()=>({
   questBus:!!window.GL_EVENTS,
   dungeonCanonical:!!(window.v247ShowDungeonReward?.__v6243WeeklyChestDungeon),
   pvpBus:!!window.GL_EVENTS,
   growBus:!!window.GL_EVENTS,
   growOrder:typeof window.v6239WeeklyChestActivity==='function',
   tower:typeof window.v6239WeeklyChestTowerFloor==='function',
   worldBoss:typeof window.v6239WeeklyChestActivity==='function',
   guildBossBus:!!window.GL_EVENTS,
   chest:window.v6239WeeklyChestDiagnostics?.()||null
 });
})();
