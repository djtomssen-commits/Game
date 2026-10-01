/* ===== V4.02 CENTRAL DUNGEON BALANCE =====

   This replaces the historical per-dungeon balance layers with ONE final
   source of truth for all 20 dungeons / 200 enemies.

   Offline calibration model:
   - level attribute points (+2 per level)
   - class main attributes
   - level-scaled V4.02 items
   - shop rarity/stat factors
   - jewelry
   - gems + scrolls
   - class skills and unlock levels
   - set milestones
   - crit / evade / special attacks
   - under-level damage factors
   - class defensive skills
   - Wundertüte main-stat combat buff
   - Monte-Carlo combat simulation across all three classes

   The literal RNG ceiling is used as a safety ceiling only. The playable
   target is an optimized "strong" build, because perfect purple gear and
   perfect rerolls are technically possible very early and would make a
   ceiling-only game unplayable for normal players.
*/

const V249_DUNGEON_BALANCE=[[[2,745,33],[4,963,40],[6,1139,52],[8,1516,64],[10,1793,75],[12,1993,83],[14,2391,90],[16,2814,101],[18,3232,106],[20,3691,129]],[[20,2977,141],[21,3037,147],[22,3216,151],[23,3622,156],[24,3694,160],[25,4427,164],[26,4676,170],[27,4770,174],[28,4865,178],[30,5239,214]],[[30,4728,184],[31,5166,190],[32,5269,195],[33,5374,200],[34,5728,205],[35,5843,210],[36,6004,215],[37,6124,220],[38,6424,225],[40,7159,270]],[[40,6597,226],[41,6992,232],[42,7455,238],[43,7604,244],[44,7756,250],[45,7911,256],[46,8069,262],[47,8230,269],[48,8426,276],[50,8932,285]],[[50,7745,269],[51,8146,276],[52,8490,283],[53,8660,290],[54,8833,297],[55,9360,304],[56,9547,312],[57,9956,320],[58,10155,328],[60,11085,400]],[[60,9808,347],[61,10004,356],[62,10204,365],[63,10568,374],[64,10779,383],[65,10995,393],[66,11265,403],[67,11664,413],[68,11897,423],[70,12611,455]],[[70,10720,393],[71,10934,403],[72,11347,413],[73,11827,423],[74,12067,434],[75,12375,445],[76,12825,456],[77,13082,467],[78,13731,479],[80,14555,493]],[[80,12589,440],[81,12841,451],[82,13098,462],[83,13360,474],[84,13643,486],[85,13916,498],[86,14194,510],[87,14532,523],[88,14959,536],[90,15857,580]],[[90,14613,486],[91,14905,498],[92,15530,510],[93,15961,523],[94,16280,536],[95,16606,549],[96,16938,563],[97,17571,577],[98,17922,591],[100,18997,621]],[[100,16537,532],[101,16868,545],[102,17205,559],[103,17549,573],[104,17900,587],[105,18258,602],[106,18623,617],[107,19285,632],[108,19671,648],[110,20851,679]],[[110,17833,578],[111,18190,592],[112,18554,607],[113,19267,622],[114,19652,638],[115,20045,654],[116,20446,670],[117,20855,687],[118,21613,704],[120,22910,735]],[[120,19176,628],[121,19560,644],[122,19951,660],[123,20422,676],[124,20830,693],[125,21416,710],[126,21971,728],[127,22410,746],[128,22858,765],[130,24229,792]],[[130,20763,674],[131,21178,691],[132,21782,708],[133,22245,726],[134,22690,744],[135,23144,763],[136,23760,782],[137,24235,802],[138,24720,822],[140,26203,847]],[[140,22056,720],[141,22497,738],[142,23193,756],[143,24658,775],[144,25151,794],[145,25654,814],[146,26167,834],[147,26690,855],[148,27224,876],[150,28857,902]],[[150,23821,766],[151,24297,785],[152,24783,805],[153,25279,825],[154,25785,846],[155,26301,867],[156,26827,889],[157,27364,911],[158,27911,934],[160,29586,962]],[[160,24613,816],[161,25105,836],[162,26123,857],[163,26645,878],[164,27178,900],[165,27722,922],[166,28276,945],[167,28842,969],[168,29419,993],[170,31184,1023]],[[170,26538,862],[171,27069,884],[172,27610,906],[173,28162,929],[174,28725,952],[175,29300,976],[176,29886,1000],[177,30484,1025],[178,31094,1051],[180,31716,1083]],[[180,28261,908],[181,28826,931],[182,29403,954],[183,29991,978],[184,30591,1002],[185,31203,1027],[186,31827,1053],[187,32464,1079],[188,33113,1106],[190,33775,1139]],[[190,29452,954],[191,30041,978],[192,30642,1002],[193,31255,1027],[194,31880,1053],[195,32518,1079],[196,33168,1106],[197,34087,1134],[198,34769,1162],[200,36855,1197]],[[200,30369,1004],[201,31369,1029],[202,31996,1055],[203,32636,1081],[204,33343,1108],[205,34010,1136],[206,34690,1164],[207,35698,1193],[208,36412,1223],[210,37140,1260]]];

/* Recommended level and actual battle stats now come from the same table. */
v025RecommendedLevel=function(dungeonIndex,roomIndex){
  const di=Math.max(0,Math.min(V249_DUNGEON_BALANCE.length-1,Number(dungeonIndex)||0));
  const ri=Math.max(0,Math.min(9,Number(roomIndex)||0));
  return V249_DUNGEON_BALANCE[di][ri][0];
};

v025EnemyStats=function(dungeonIndex,roomIndex,enemy){
  const di=Math.max(0,Math.min(V249_DUNGEON_BALANCE.length-1,Number(dungeonIndex)||0));
  const ri=Math.max(0,Math.min(9,Number(roomIndex)||0));
  const row=V249_DUNGEON_BALANCE[di][ri];
  return {
    rec:row[0],
    hp:row[1],
    attack:row[2]
  };
};


/* ---------- Make advertised combat modifiers actually count ---------- */

/*
  The Wundertüte OG "Hauptattribut +20%" existed visually but its helper was
  never used by the final V4.02 dungeon fight. Apply it centrally to the
  class-specific primary stat.
*/
const v249BasePrimaryStat=v029PrimaryStat;
v029PrimaryStat=function(){
  let value=Number(v249BasePrimaryStat())||0;

  try{
    const buff=typeof v077Buff==='function'?v077Buff():null;
    if(buff?.type==='main'){
      value*=1.20;
    }
  }catch(e){}

  return value;
};


/*
  The skill cards say Fell/Rauchmantel/Tarnblatt reduce incoming damage.
  V4.02's final fight path did not apply those reductions. Apply them through
  the one enemy-damage factor used by that fight. Scroll damage reduction is
  included as well.
*/
const v249BaseEnemyDamageFactor=v060EnemyDamageFactor;
v060EnemyDamageFactor=function(rec){
  let factor=Number(v249BaseEnemyDamageFactor(rec))||1;
  let reduction=0;

  if((s.playerClass==='grower'||s.playerClass==='frost')){
    reduction+=Math.max(0,Number(skillValue('fell'))||0)*.04;
  }else if(s.playerClass==='bruiser'){
    reduction+=Math.max(0,Number(skillValue('mantel'))||0)*.03;
  }else if(s.playerClass==='scout'){
    reduction+=Math.max(0,Number(skillValue('tarn'))||0)*.03;
  }else if(s.playerClass==='summoner'){
    try{reduction+=Math.max(0,Number(v314Summary?.().damageReduce)||0)}catch(_){}
  }

  try{
    if(typeof v030EnchantSum==='function'){
      reduction+=(Math.max(0,Number(v030EnchantSum('damageReduce'))||0)/100);
    }
  }catch(e){}

  reduction=Math.min(.50,reduction);
  return factor*(1-reduction);
};


/* Repaint open dungeon immediately with canonical values. */
setTimeout(()=>{
  try{
    if(document.querySelector('#dungeon')?.classList.contains('active')){
      if(s.dungeon?.layer==='world'){
        v230ShowDungeonWorld();
      }else if(s.dungeon?.view==='map'){
        v244RenderSelectedDungeonMap();
      }else if(s.dungeon?.view==='battle'){
        renderDungeon();
      }
    }
  }catch(e){
    console.error('V4.02 dungeon balance repaint',e);
  }

  document.querySelectorAll('.version')
    .forEach(el=>el.textContent='V4.29 Stable');

  const line=document.querySelector('#v141VersionLine');
},640);
