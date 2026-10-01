from pathlib import Path
import json

p=Path("beta.html")
c=p.read_text(encoding="utf-8")

old="""const v306BaseRenderQuests=renderQuests;
renderQuests=function(){
 const r=v306BaseRenderQuests.apply(this,arguments);
 requestAnimationFrame(v306PaintFirstDailyQuestHarz);
 return r;
};
/* Reward popup is opened after claimQuest has marked firstQuest=true.
   Remove the three labels immediately after that successful payout. */
if(typeof v235ShowQuestReward==='function'){
 const v306BaseShowQuestReward=v235ShowQuestReward;
 v235ShowQuestReward=function(before){
  const r=v306BaseShowQuestReward.apply(this,arguments);
  requestAnimationFrame(v306PaintFirstDailyQuestHarz);
  return r;
 };
}
setTimeout(v306PaintFirstDailyQuestHarz,300);"""

new="""window.v306PaintFirstDailyQuestHarz=v306PaintFirstDailyQuestHarz;"""

if old not in c:
    raise SystemExit("v306 legacy repaint block missing")

c=c.replace(old,new,1)
p.write_text(c,encoding="utf-8")

checks={
 "v306_export_present":new in c,
 "v306_render_wrapper_removed":"const v306BaseRenderQuests=renderQuests;" not in c,
 "v306_reward_wrapper_removed":"const v306BaseShowQuestReward=v235ShowQuestReward;" not in c,
 "v306_raf_removed":"requestAnimationFrame(v306PaintFirstDailyQuestHarz)" not in c,
 "v306_startup_timeout_removed":"setTimeout(v306PaintFirstDailyQuestHarz,300)" not in c,
 "daily_bonus_text_kept":"Erste Quest heute: +2 Harz-Taler garantiert" in c,
}
if not all(checks.values()):
    raise SystemExit("v306 QA failed: "+json.dumps(checks))

Path("V8009_QUEST_V306_DIRECT_HOOK_QA.json").write_text(
 json.dumps({
   "build":"V8.009-QUEST-V306-DIRECT-HOOK-QA",
   "checks":checks,
   "scope":"presentation lifecycle only; +2 Harz reward logic unchanged"
 },indent=2,ensure_ascii=False)+"\n",
 encoding="utf-8"
)
print("retired v306 repaint wrappers")
