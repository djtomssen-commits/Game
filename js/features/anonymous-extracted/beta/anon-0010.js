
/* ===== V4.02 combat hotfix =====
   V4.02 called damagePop(), but the game helper is named popDamage().
   This stopped the async combat loop immediately after the player's first hit.
*/
const v061OldPopDamage=popDamage;
popDamage=function(el,text){
  if(!el)return;
  return v061OldPopDamage(el,text);
};

const v061OldAnimClass=animClass;
animClass=function(el,cl,ms=400){
  if(!el)return;
  return v061OldAnimClass(el,cl,ms);
};

/* V4.123: obsolete version-only render wrapper retired. */
