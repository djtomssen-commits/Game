from pathlib import Path
import json,sys,re
v4222=Path('js/features/quest/beta/v4222-separate-elite-quest-script.js').read_text(encoding='utf-8')
v233=Path('js/features/quest/beta/v233-quest-reward-final-click.js').read_text(encoding='utf-8')
v7110=Path('js/features/quest/beta/v7110-quest-authority-sync.js').read_text(encoding='utf-8')
checks={
 'claim_hook_exported':'window.v4222AfterQuestClaim=afterClaim' in v4222,
 'start_hook_exported':'window.v4222AfterQuestStart=afterStart' in v4222,
 'no_claim_assign':re.search(r'\bclaimQuest\s*=',v4222) is None,
 'no_v233_claim_assign':re.search(r'\bv233ClaimQuest\s*=',v4222) is None,
 'no_start_assign':re.search(r'\bstartQuest\s*=',v4222) is None,
 'v233_calls_claim_hook':'window.v4222AfterQuestClaim?.()' in v233,
 'v7110_calls_start_hook':'window.v4222AfterQuestStart?.()' in v7110,
 'elite_panel_owner_retained':'window.v4222RenderElitePanel=renderElitePanel' in v4222,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-V4222-HOOK-CONSOLIDATION-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_V4222_HOOK_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
