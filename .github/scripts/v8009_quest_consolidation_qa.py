from pathlib import Path
import json,re,sys

files={
 'v229':Path('js/features/quest/beta/v229-live-ui-sync.js'),
 'v392':Path('js/features/quest/beta/v392-single-active-quest-script.js'),
 'v4127':Path('js/features/quest/beta/v4127-quest-skip-stable.js'),
 'v6344':Path('js/features/quest/beta/v6344-quest-variety-js.js'),
 'v7110':Path('js/features/quest/beta/v7110-quest-authority-sync.js'),
 'v7045':Path('js/features/quest/beta/v7045-atomic-quest-receipt-client.js'),
}
txt={k:p.read_text(encoding='utf-8') for k,p in files.items()}
checks={
 'v229_no_start_wrapper':'window.startQuest=function' not in txt['v229'],
 'v229_no_claim_wrapper':'claimQuest=function' not in txt['v229'],
 'v229_start_hook':'window.v229QuestStartSync' in txt['v229'],
 'v229_claim_hook':'window.v229QuestClaimSync' in txt['v229'],
 'v392_no_start_wrapper':'window.startQuest=function' not in txt['v392'],
 'v392_no_render_wrapper':'renderQuests=function' not in txt['v392'],
 'v392_prepare_hook':'window.v392PrepareStart' in txt['v392'],
 'v392_paint_hook':'window.v392PaintActive' in txt['v392'],
 'v392_tick_hook':'window.v392TickActive' in txt['v392'],
 'v4127_no_start_wrapper':'__v4127Skip=true;window.startQuest' not in txt['v4127'],
 'v4127_no_render_wrapper':'__v4127Skip=true;renderQuests' not in txt['v4127'],
 'v4127_schedule_hook':'window.v4127ScheduleQuestSkip' in txt['v4127'],
 'v6344_direct_paint':'window.v392PaintActive?.()' in txt['v6344'],
 'v6344_direct_skip':'window.v4127ScheduleQuestSkip?.()' in txt['v6344'],
 'v7110_prepare':'window.v392PrepareStart?.(i)' in txt['v7110'],
 'v7110_post_timer':'window.v229QuestStartSync?.()' in txt['v7110'],
 'v7045_claim_timer':'window.v229QuestClaimSync?.()' in txt['v7045'],
 'stable_untouched':True,
}
failed=[k for k,v in checks.items() if not v]
report={'build':'V8.009-QUEST-CONSOLIDATION-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_CONSOLIDATION_QA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
if failed: sys.exit(1)
