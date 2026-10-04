/* ===== V8.100 Retired local Harz reward owner =====
   Quest and Dungeon Harz rewards are server-authoritative.
   Historical client-side random/guaranteed Harz minting was removed so an old
   handler can never create a transient or persistent local currency delta.
*/
window.__V109_LOCAL_HARZ_REWARDS_RETIRED__=true;
window.v109ResetDaily=()=>false;
window.v109PendingQuestEnergy=0;
