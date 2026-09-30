from pathlib import Path
import json,sys
v233=Path('js/features/quest/beta/v233-quest-reward-final-click.js').read_text(encoding='utf-8')
v392=Path('js/features/quest/beta/v392-single-active-quest-script.js').read_text(encoding='utf-8')
v6344=Path('js/features/quest/beta/v6344-quest-variety-js.js').read_text(encoding='utf-8')
checks={
 'v233_claim_function_retained':'function v233ClaimQuest()' in v233,
 'v233_reward_presenter_retained':'function v233ShowActualQuestReward(snapshot)' in v233,
 'legacy_capture_listener_removed':"target.closest('#claimQuest')" not in v233 and 'stopImmediatePropagation' not in v233,
 'compat_hook_retained':'window.v233BindClaimButton=()=>{}' in v233,
 'v392_direct_claim_owner':"v233ClaimQuest" in v392 and "v392ClaimQuest" in v392,
 'canonical_renderer_hook_still_safe':'window.v233BindClaimButton?.()' in v6344,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-V233-CAPTURE-RETIRE-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_V233_CAPTURE_RETIRE_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
