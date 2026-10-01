
(()=>{
'use strict';
async function finalSync(force=false){
  try{return !!(await window.v7101SyncPublicProfile?.(!!force))}catch(e){console.warn('[V7.109] profile owner',e);return false}
}
try{v073SyncProfile=finalSync}catch(_){}
window.v073SyncProfile=finalSync;

/* Historical mirror helpers may still be called by old render/persist wrappers.
   They now only queue the canonical server mirror. */
window.v446SyncCombatPower=(force=false)=>{window.v7101SchedulePublicProfileSync?.(!!force);return Promise.resolve(true)};
window.v649SyncDungeonProgress=(force=false)=>{window.v7101SchedulePublicProfileSync?.(!!force);return Promise.resolve(true)};
window.vTowerSync=(force=false)=>{window.v7101SchedulePublicProfileSync?.(!!force);return Promise.resolve(true)};
window.vPvpBudsHallSync=(force=false)=>{window.v7101SchedulePublicProfileSync?.(!!force);return Promise.resolve(true)};
})();
