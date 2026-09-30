from pathlib import Path
import json,sys
p=Path('js/features/quest/beta/v4121-quest-reward-current-item.js').read_text(encoding='utf-8')
q=Path('js/features/quest/beta/v7045-atomic-quest-receipt-client.js').read_text(encoding='utf-8')
checks={
 'v4121_after_hook_exported':'window.v4121AfterQuestClaim' in p,
 'v4121_click_retry_retired':"closest?.('#v392ClaimQuest,#claimQuest')" not in p and 'setTimeout(()=>upgrade(null),120)' not in p,
 'v7045_calls_after_hook':'window.v4121AfterQuestClaim?.(rewardArtBefore)' in q,
 'v7045_snapshot_retained':'window.v4121QuestRewardSnapshot?.()' in q,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-V4121-REPAINT-RETIRE-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_V4121_REPAINT_RETIRE_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
