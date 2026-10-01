from pathlib import Path
import json,sys,re
v496=Path('js/features/quest/beta/v496-quest-claim-single-payout.js').read_text(encoding='utf-8')
v235=Path('js/features/quest/beta/v235-quest-reward-stability.js').read_text(encoding='utf-8')
v099=Path('js/features/quest/beta/v099-real-quest-xp-fix.js').read_text(encoding='utf-8')
checks={
 'v496_no_claim_assignment':re.search(r'\bclaimQuest\s*=',v496) is None,
 'begin_hook_exported':'window.v496BeginQuestClaim=beginClaim' in v496,
 'finish_hook_exported':'window.v496FinishQuestClaim=finishClaim' in v496,
 'stale_repair_retained':'window.v496RepairStalePaidQuest=repairStalePaidQuest' in v496,
 'v235_calls_begin':'window.v496BeginQuestClaim?.(q)' in v235,
 'v235_blocks_duplicate':'if(payoutTxn?.ok===false)' in v235,
 'v235_calls_finish':'window.v496FinishQuestClaim?.(payoutTxn,paid)' in v235,
 'v496_before_v310_finish':v235.index('v496FinishQuestClaim') < v235.index('v310FinishQuestClaim'),
 'v099_local_claim_basis_retained':re.search(r'\bclaimQuest\s*=\s*function',v099) is not None,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-V496-DIRECT-HOOK-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_V496_DIRECT_HOOK_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
