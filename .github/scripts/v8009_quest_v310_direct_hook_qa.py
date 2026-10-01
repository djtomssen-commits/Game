from pathlib import Path
import json,sys,re
v310=Path('js/features/quest/beta/v310-elite-quests.js').read_text(encoding='utf-8')
v235=Path('js/features/quest/beta/v235-quest-reward-stability.js').read_text(encoding='utf-8')
checks={
 'v310_no_claim_assignment':re.search(r'\bclaimQuest\s*=',v310) is None,
 'begin_hook_exported':'window.v310BeginQuestClaim=v310BeginQuestClaim' in v310,
 'finish_hook_exported':'window.v310FinishQuestClaim=v310FinishQuestClaim' in v310,
 'elite_chance_unchanged':'const V310_ELITE_CHANCE=.06' in v310,
 'elite_reward_unchanged':'const harz=1+Math.floor(Math.random()*3)' in v310 and "Math.random()<.72?'blue':'purple'" in v310,
 'makequest_window_retained':'if(v310CompletionOfferWindow)' in v310,
 'v235_calls_begin':'window.v310BeginQuestClaim?.()' in v235,
 'v235_calls_finish':'window.v310FinishQuestClaim?.(eliteTxn,paid)' in v235,
 'finish_before_v4222':v235.index('v310FinishQuestClaim') < v235.index('v4222AfterQuestClaim'),
 'startup_repaint_removed':'setTimeout(' not in v310 and 'requestAnimationFrame(' not in v310,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-V310-DIRECT-HOOK-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_V310_DIRECT_HOOK_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
