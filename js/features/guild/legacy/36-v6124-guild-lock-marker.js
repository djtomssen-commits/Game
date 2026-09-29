/* === v6124-guild-lock-marker === */
(()=>{
'use strict';
if(window.__V6124_GUILD_LEAVE_LOCK__)return;
window.__V6124_GUILD_LEAVE_LOCK__=true;
const refresh=()=>{try{window.v6124PaintGuildLock?.()}catch(e){}};
document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(refresh),{once:true});
window.addEventListener('growlegends:account-ready',()=>setTimeout(refresh,120));
window.addEventListener('pageshow',refresh,{passive:true});
window.v6124GuildLockQA=()=>({
  until:Number(s?.guildLeaveLockUntil)||0,
  active:!!window.v6124GuildLockActive?.(),
  remainingMs:Number(window.v6124GuildLockRemaining?.())||0,
  createDisabled:document.getElementById('v254CreateGuild')?.disabled||false
});
})();

