from pathlib import Path
import json,sys
p392=Path('js/features/quest/beta/v392-single-active-quest-script.js').read_text(encoding='utf-8')
p386=Path('js/features/quest/beta/v386-quest-redesign-script.js').read_text(encoding='utf-8')
p6344=Path('js/features/quest/beta/v6344-quest-variety-js.js').read_text(encoding='utf-8')
checks={
 'v392_sync_hook':'window.v392SyncActiveMode=syncActiveMode' in p392,
 'v392_paint_uses_sync':'syncActiveMode();' in p392,
 'v6344_sync_before_base':p6344.find('window.v392SyncActiveMode?.()') < p6344.find('const r=base.apply(this,arguments);'),
 'v386_sync_before_install':'window.v392SyncActiveMode?.()' in p386,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-ACTIVE-VIEW-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_ACTIVE_VIEW_QA.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,ensure_ascii=False,indent=2))
if failed: sys.exit(1)
