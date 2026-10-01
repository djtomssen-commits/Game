from pathlib import Path
import json,sys,re
v316=Path('js/features/quest/beta/v316-quest-balance-skip.js').read_text(encoding='utf-8')
v4127=Path('js/features/quest/beta/v4127-quest-skip-stable.js').read_text(encoding='utf-8')
v229=Path('js/features/quest/beta/v229-live-ui-sync.js').read_text(encoding='utf-8')
checks={
 'v316_no_render_wrapper':re.search(r'(?<![\w.])render\s*=\s*function',v316) is None,
 'v316_prepare_retained':'window.v316PrepareQuestRender=v316BalanceVisibleOffers' in v316,
 'v4127_no_raf':'requestAnimationFrame(' not in v4127,
 'v4127_direct_ensure':'return ensureSkip()' in v4127,
 'v4127_owner_retained':'window.v4127EnsureQuestSkip=ensureSkip' in v4127,
 'v229_start_sync_direct':'window.v229QuestStartSync=()=>v229UpdateQuestTimer()' in v229,
 'v229_claim_sync_direct':'v229UpdateQuestTimer();' in v229.split('window.v229QuestClaimSync=',1)[1].split('};',1)[0],
 'v229_quest_timer_retained':'setInterval(' in v229 and 'v229UpdateQuestTimer' in v229,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-FAST-BATCH-A-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_FAST_BATCH_A_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
