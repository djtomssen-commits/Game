
/* ===== V4.02 Dampf fix =====
   The original game calls regenEnergy() from render() and every second.
   V4.02 disabled regen(), but NOT regenEnergy(). Therefore old 1 Dampf/3 min
   regeneration could still run, especially after reload/inactivity.
   Dampf is now strictly daily-reset + Harz refill only.
*/
regenEnergy=function(){
  /* V7.177: authenticated authoritative accounts never run legacy local Dampf logic. */
  try{if(typeof v026ServerOwned==='function'&&v026ServerOwned())return false}catch(_){}
  v026DailyReset(false);
  s.lastEnergy=Date.now();
  try{v026PaintDampf()}catch(e){}
  return true;
};
regenEnergy.__v7173ServerGuard=true;
try{window.regenEnergy=regenEnergy}catch(_){}

/* Keep the timestamp current before saving, so old timestamps can never
   accumulate regeneration if an older wrapper executes. */
s.lastEnergy=Date.now();
localStorage.setItem(KEY,JSON.stringify(s));

/* V4.123: Dampf fix remains active; obsolete version-only render wrapper retired. */
