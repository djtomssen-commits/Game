from pathlib import Path
import json,re,sys

p321=Path('js/features/quest/beta/v321-elite-hard-guarantee-dampf-scale.js').read_text(encoding='utf-8')
p443=Path('js/features/quest/beta/v443-quest-dampf-live-fix.js').read_text(encoding='utf-8')
p7110=Path('js/features/quest/beta/v7110-quest-authority-sync.js').read_text(encoding='utf-8')

checks={
 'v321_no_start_writer':'window.startQuest=function' not in p321,
 'v321_local_preflight_hook':'window.v321PrepareLocalQuestStart' in p321,
 'v443_no_start_writer':'window.startQuest=function' not in p443,
 'v443_post_start_hook':'window.v443AfterQuestStart' in p443,
 'v7110_calls_v321':'window.v321PrepareLocalQuestStart?.(i)' in p7110,
 'v7110_calls_v443':'window.v443AfterQuestStart?.(beforeEnergy,hadActive)' in p7110,
 'v7110_still_start_owner':'window.startQuest=wrapped' in p7110,
 'server_branch_preflight_guard':'if(!enforced())' in p7110,
}
failed=[k for k,v in checks.items() if not v]
report={'build':'V8.009-QUEST-START-CHAIN-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_START_CHAIN_QA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
if failed: sys.exit(1)
