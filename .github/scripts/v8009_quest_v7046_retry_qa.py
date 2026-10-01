from pathlib import Path
import json,sys
v7046=Path('js/features/quest/beta/v7046-quest-event-duplicate-reward-guard.js').read_text(encoding='utf-8')
checks={
 'guard_function_retained':'function markAtomicQuestOwners()' in v7046,
 'initial_mark_retained':'markAtomicQuestOwners();' in v7046,
 'account_ready_retained':"growlegends:account-ready" in v7046,
 'pageshow_retained':"addEventListener('pageshow'" in v7046,
 'domcontentloaded_retained':"DOMContentLoaded" in v7046,
 'startup_retry_array_removed':'[50,180,500,1400,3200]' not in v7046,
 'no_timeout':'setTimeout(' not in v7046,
 'marker_logic_retained':'__v6140EventSource=true' in v7046 and '__v7046ServerQuestOwner=true' in v7046,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-V7046-RETRY-RETIRE-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_V7046_RETRY_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
