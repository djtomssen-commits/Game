from pathlib import Path
import json,sys
p=Path('js/features/quest/beta/gl-quest-ready-push-v1.js').read_text(encoding='utf-8')
p7110=Path('js/features/quest/beta/v7110-quest-authority-sync.js').read_text(encoding='utf-8')
p7045=Path('js/features/quest/beta/v7045-atomic-quest-receipt-client.js').read_text(encoding='utf-8')
checks={
 'push_no_start_wrapper':'window.startQuest=wrapped' not in p,
 'push_no_skip_wrapper':'window.v316SkipActiveQuest=wrapped' not in p,
 'push_no_claim_wrapper':'claimQuest=wrapped' not in p,
 'push_globals_kept':'window.glSyncQuestPushJob=syncQuestPush' in p and 'window.glCancelQuestPushJob=cancelQuestPush' in p,
 'v7110_start_schedules_push':'glSyncQuestPushJob' in p7110,
 'v7045_claim_cancels_push':'glCancelQuestPushJob' in p7045,
 'v7045_skip_cancels_push':'if(!enforced())' in p7045 and 'glCancelQuestPushJob' in p7045,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-PUSH-CHAIN-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_PUSH_CHAIN_QA.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,ensure_ascii=False,indent=2))
if failed: sys.exit(1)
