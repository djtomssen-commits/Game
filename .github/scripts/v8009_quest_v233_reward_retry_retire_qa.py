from pathlib import Path
import json,sys
v233=Path('js/features/quest/beta/v233-quest-reward-final-click.js').read_text(encoding='utf-8')
checks={
 'reward_presenter_retained':'function v233ShowActualQuestReward(snapshot)' in v233,
 'single_show_retained':"overlay.classList.add('show');" in v233,
 'reward_raf_retry_removed':"requestAnimationFrame(()=>{\n    overlay.classList.add('show');" not in v233,
 'reward_timeout_retry_removed':"setTimeout(()=>{\n    if(document.body.contains(overlay))" not in v233,
 'claim_function_retained':'function v233ClaimQuest()' in v233,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-V233-REWARD-RETRY-RETIRE-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_V233_REWARD_RETRY_RETIRE_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
