from pathlib import Path
import json,sys
v4121=Path('js/features/quest/beta/v4121-quest-reward-current-item.js').read_text(encoding='utf-8')
v7045=Path('js/features/quest/beta/v7045-atomic-quest-receipt-client.js').read_text(encoding='utf-8')
checks={
 'hook_exported':'window.v4121AfterQuestClaim=before=>' in v4121,
 'hook_direct_upgrade':'upgrade(before);' in v4121,
 'no_raf':'requestAnimationFrame(' not in v4121,
 'no_timeout':'setTimeout(' not in v4121,
 'claim_owner_calls_hook':'window.v4121AfterQuestClaim?.(rewardArtBefore)' in v7045,
 'snapshot_retained':'window.v4121QuestRewardSnapshot=snap' in v4121,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-V4121-SYNC-ART-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_V4121_SYNC_ART_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
