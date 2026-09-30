from pathlib import Path
import json,sys
v443=Path('js/features/quest/beta/v443-quest-dampf-live-fix.js').read_text(encoding='utf-8')
v7110=Path('js/features/quest/beta/v7110-quest-authority-sync.js').read_text(encoding='utf-8')
checks={
 'hook_retained':'window.v443AfterQuestStart=' in v443,
 'hook_direct_paint':'paintDampf();' in v443.split('window.v443AfterQuestStart=',1)[1].split('};',1)[0],
 'hook_no_settle':'settle();' not in v443.split('window.v443AfterQuestStart=',1)[1].split('};',1)[0],
 'v7110_calls_hook':'window.v443AfterQuestStart?.(beforeEnergy,hadActive)' in v7110,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-V443-POSTSTART-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_V443_POSTSTART_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
