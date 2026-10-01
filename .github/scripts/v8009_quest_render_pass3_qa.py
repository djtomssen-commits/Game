from pathlib import Path
import json,sys
p309=Path('js/features/quest/beta/v309-distinct-quest-offers.js').read_text(encoding='utf-8')
p316=Path('js/features/quest/beta/v316-quest-balance-skip.js').read_text(encoding='utf-8')
p496=Path('js/features/quest/beta/v496-quest-claim-single-payout.js').read_text(encoding='utf-8')
p6344=Path('js/features/quest/beta/v6344-quest-variety-js.js').read_text(encoding='utf-8')
checks={
 'v309_no_render_writer':'renderQuests=function' not in p309,
 'v309_prepare_hook':'window.v309PrepareQuestRender' in p309,
 'v309_direct_paint_hook':'window.v309PaintQuestRoles' in p309,
 'v316_no_render_writer':'renderQuests=function' not in p316,
 'v316_prepare_hook':'window.v316PrepareQuestRender' in p316,
 'v316_legacy_skip_paint_retired':'window.v316ScheduleSkipPaint=()=>{}' in p316,
 'v496_no_render_writer':'wrappedRender' not in p496 and '__v496QuestRenderGuard' not in p496,
 'v496_repair_hook':'window.v496RepairStalePaidQuest' in p496,
 'v6344_pre_v496':'window.v496RepairStalePaidQuest?.()' in p6344,
 'v6344_pre_v316':'window.v316PrepareQuestRender?.()' in p6344,
 'v6344_pre_v309':'window.v309PrepareQuestRender?.()' in p6344,
 'v6344_post_v309_direct':'window.v309PaintQuestRoles?.()' in p6344,
 'v6344_post_skip_direct':'window.v4127EnsureQuestSkip?.()' in p6344,
}
failed=[k for k,v in checks.items() if not v]
report={'build':'V8.009-QUEST-RENDER-PASS3-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_RENDER_PASS3_QA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
if failed: sys.exit(1)
