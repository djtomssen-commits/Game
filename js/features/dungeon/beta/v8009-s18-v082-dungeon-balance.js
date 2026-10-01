/* ===== V4.02 Dungeon 1 rebalance =====
   Goal:
   - Lv.14: normally around enemy 5-6
   - enemies 7+ become a real wall
   - final boss aimed around Lv.22-25
   - NO hard per-enemy level lock
*/
const V082_D1_LEVELS=[2,4,7,10,12,14,17,20,22,24];

v025RecommendedLevel=function(di,ri){
  ri=Math.max(0,Math.min(9,Number(ri)||0));
  if(di===0)return V082_D1_LEVELS[ri];
  const start=25+(di-1)*11;
  return start+Math.round(ri*1.15);
};

v025EnemyStats=function(di,ri,enemy){
  ri=Math.max(0,Math.min(9,Number(ri)||0));
  const rec=v025RecommendedLevel(di,ri);
  const boss=ri===9||enemy?.boss;

  if(di===0){
    /* Stronger from enemy 5 onward instead of merely inflating fight duration. */
    const hp      =[120,190,290,420,610,850,1180,1580,2050,2900][ri];
    const attack  =[17,23,31,41,54,70,91,116,143,185][ri];
    const defense =[ 2, 4, 7,11,16,23, 32, 43, 56, 75][ri];
    return {rec,hp,attack,defense};
  }

  const dungeonMult=1+di*.16;
  return {
    rec,
    hp:Math.round((120+rec*28+ri*18)*dungeonMult*(boss?1.48:1)),
    attack:Math.round((12+rec*4.2+ri*1.4)*dungeonMult*(boss?1.25:1)),
    defense:Math.round((rec*1.8+ri*1.1)*dungeonMult)
  };
};

/* Underlevel players lose damage and receive more damage.
   Still no hard lock: a very strong build can beat content early. */
v060PlayerDamageFactor=function(rec){
  const gap=Math.max(0,rec-(Number(s.level)||1));
  if(gap<=0)return 1;
  if(gap===1)return .94;
  return Math.max(.18,.94-(gap-1)*.105);
};

v060EnemyDamageFactor=function(rec){
  const gap=Math.max(0,rec-(Number(s.level)||1));
  if(gap<=0)return 1;
  if(gap===1)return 1.08;
  return Math.min(2.65,1.08+(gap-1)*.12);
};

/* Make sure old enemy requiredLevel metadata is informational only.
   The final V4.02 fight handler intentionally has no per-enemy level gate. */
