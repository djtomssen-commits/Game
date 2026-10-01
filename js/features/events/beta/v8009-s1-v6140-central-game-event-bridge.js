(()=>{
'use strict';
if(window.__V6140_EVENT_BRIDGE__)return;window.__V6140_EVENT_BRIDGE__=true;
const V=window.GROW_LEGENDS_VERSION||{short:'V4.164',label:'V4.164 Stable',number:'4.164'};const VERSION=V.label,SHORT=V.short,BUS=window.GL_EVENTS;
if(!BUS){console.error('V4.161: central event bus missing');return}
const n=v=>Math.max(0,Number(v)||0);
function questLite(q){if(!q||typeof q!=='object')return null;return{id:q.id??null,uid:q.uid??null,name:String(q.name||''),ends:Number(q.ends)||0,v310Elite:!!q.v310Elite,v309Role:q.v309Role||'',v310BaseRole:q.v310BaseRole||'',v392Kind:q.v392Kind||'',gold:Number(q.gold)||0,xp:Number(q.xp)||0}}
function questElite(q){return !!q&&(!!q.v310Elite||/elite/i.test(String(q.v309Role||q.v310BaseRole||q.v392Kind||'')))}
function questToken(q){return q?String(q.id??q.uid??q.name??'quest')+'|'+String(Number(q.ends)||0):''}
function dungeonWins(){try{return typeof v336CanonicalDungeonWins==='function'?n(v336CanonicalDungeonWins()):n(s?.v106Achievements?.stats?.dungeonWins)}catch(_){return 0}}
function dungeonPos(){try{const dp=typeof v074DungeonProgress==='function'?v074DungeonProgress():{completed:[...(s?.dungeon?.completed||[])],progress:{...(s?.dungeon?.progress||{})},selected:Number(s?.dungeon?.selected)||0,room:Number(s?.dungeon?.room)||0};if(typeof v081DungeonPosition==='function')return v081DungeonPosition(dp)}catch(_){}return{dungeonNumber:(Number(s?.dungeon?.selected)||0)+1,enemyNumber:(Number(s?.dungeon?.room)||0)+1}}
/* V8.009: Quest source wrappers retired.
   v235 emits questCompleted directly on the preboot GL_EVENTS bus after a
   successful Local/Mirror claim. Server-enforced Quest side effects stay in v7045. */
function installDungeonSource(){try{if(typeof fightDungeon!=='function'||fightDungeon.__v6140EventSource)return;const fn=fightDungeon;const wrapped=function(){const before=dungeonWins(),pos=dungeonPos(),pg=window.__v688GoldContext,px=window.__v688XpContext;window.__v688GoldContext='dungeon';window.__v688XpContext='dungeon';let r;try{r=fn.apply(this,arguments)}catch(e){window.__v688GoldContext=pg;window.__v688XpContext=px;throw e}
 const done=()=>{try{const after=dungeonWins();if(after>before){const dn=Math.max(1,Number(pos?.dungeonNumber)||1),en=Math.max(1,Number(pos?.enemyNumber)||1);BUS.emit('dungeonWon',{dungeonNumber:dn,enemyNumber:en,boss:en>=10,winsBefore:before,winsAfter:after},String(after))}}finally{window.__v688GoldContext=pg;window.__v688XpContext=px}};
 if(r&&typeof r.then==='function')return r.then(v=>{done();return v},e=>{done();throw e});done();return r};wrapped.__v6140EventSource=true;fightDungeon=wrapped;window.fightDungeon=wrapped}catch(e){console.warn('V4.161 install dungeon source',e)}}
function installPvpSource(){try{if(typeof v209FinishBattle!=='function'||v209FinishBattle.__v6140EventSource)return;const fn=v209FinishBattle;const wrapped=function(win,enemy){const bf=n(s?.v204Pvp?.fights),bw=n(s?.v204Pvp?.wins),r=fn.apply(this,arguments);const done=()=>{if(!win)return;const af=n(s?.v204Pvp?.fights),aw=n(s?.v204Pvp?.wins),enemyId=String(enemy?.id||enemy?.user_id||enemy?.name||s?.v204Pvp?.lastOpponent||'');const token=(af||aw)?`${af}|${aw}|${enemyId}`:`${Date.now()}|${enemyId}`;BUS.emit('pvpWon',{enemy:enemy||null,fightsBefore:bf,fightsAfter:af,winsBefore:bw,winsAfter:aw},token)};if(r&&typeof r.then==='function')return r.then(v=>{done();return v},e=>{throw e});done();return r};wrapped.__v6140EventSource=true;v209FinishBattle=wrapped;window.v209FinishBattle=wrapped}catch(e){console.warn('V4.161 install pvp source',e)}}
function installSubscribers(){if(window.__V6140_CORE_SUBSCRIBERS__)return;window.__V6140_CORE_SUBSCRIBERS__=true;
 BUS.on('questCompleted',ev=>{try{if(typeof window.v474AwardGuildActivity==='function')window.v474AwardGuildActivity('quest','event:'+ev.token);else window.v411AwardGuildActivity?.('quest')}catch(_){}try{v106CheckAchievements?.()}catch(_){}});
 BUS.on('dungeonWon',()=>{try{window.v411AwardGuildActivity?.('dungeon')}catch(_){}try{v106CheckAchievements?.()}catch(_){}});
 BUS.on('pvpWon',ev=>{try{if(typeof window.v474AwardGuildActivity==='function')window.v474AwardGuildActivity('pvp_win','event:'+ev.token);else window.v411AwardGuildActivity?.('pvp_win')}catch(_){}try{v106CheckAchievements?.()}catch(_){}});
 BUS.on('growHarvested',ev=>{try{window.v688PetGrowHarvest?.(ev.plants||[])}catch(e){console.warn('V4.161 pet grow listener',e)}try{v106CheckAchievements?.()}catch(_){}});
 BUS.on('guildBossWon',()=>{try{window.v411AwardGuildActivity?.('guild_boss')}catch(_){}try{v106CheckAchievements?.()}catch(_){}});
}
function stamp(){}
installSubscribers();installDungeonSource();installPvpSource();stamp();
document.addEventListener('DOMContentLoaded',()=>{installDungeonSource();installPvpSource();stamp()},{once:true});
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>{installDungeonSource();installPvpSource();stamp()},120));
window.v6140EventQA=()=>({version:VERSION,bus:BUS.stats(),sources:{quest:'v235-local-event',dungeon:!!window.fightDungeon?.__v6140EventSource,pvp:!!window.v209FinishBattle?.__v6140EventSource},legacyRewardWrappersSuppressed:!!window.__V6140_EVENT_BUS__});
})();
