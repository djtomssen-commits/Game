from pathlib import Path
import json,sys
p4121=Path('js/features/quest/beta/v4121-quest-reward-current-item.js').read_text(encoding='utf-8')
p7045=Path('js/features/quest/beta/v7045-atomic-quest-receipt-client.js').read_text(encoding='utf-8')
checks={
 'v4121_no_claim_wrapper':'wrapClaim(' not in p4121 and '__v4121QuestArt' not in p4121,
 'v4121_snapshot_hook':'window.v4121QuestRewardSnapshot=snap' in p4121,
 'v4121_after_hook':'window.v4121AfterQuestClaim' in p4121,
 'v7045_takes_snapshot':'v4121QuestRewardSnapshot' in p7045,
 'v7045_runs_after_hook':'v4121AfterQuestClaim' in p7045,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-REWARD-ART-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_REWARD_ART_QA.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,ensure_ascii=False,indent=2))
if failed: sys.exit(1)
