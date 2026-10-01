
/* ===== V4.02 Quest duration curve =====
   User target:
   Heavy quest L150 = 5:00
   Heavy quest L300 = 10:00
   Linear rule: heavy = 2 sec * level.
   Normal/Quick keep V4.02 ratios.
*/
function v317QuestDurations(level=Number(s.level)||1){
 level=Math.max(1,Math.floor(Number(level)||1));
 const heavy=Math.max(30,level*2);
 const normal=Math.max(15,Math.round(heavy/1.55));
 const quick=Math.max(15,Math.round(normal*.62));
 return {quick,normal,heavy};
}
window.v317QuestDurations=v317QuestDurations;

/* V4.123: quest duration curve remains active; obsolete version-only render wrapper retired. */
