from pathlib import Path
import json,sys
v637=Path('js/features/quest/beta/v637-quest-exact-dungeon-core.js').read_text(encoding='utf-8')
v636=Path('js/features/quest/beta/v636-quest-dungeon-authority-core.js').read_text(encoding='utf-8')
checks={
 'sync_exported':'window.v637SyncQuestDungeon=sync' in v637,
 'no_click_listener':"addEventListener('click'" not in v637,
 'no_pageshow_listener':"addEventListener('pageshow'" not in v637,
 'no_timeout':'setTimeout(' not in v637,
 'no_raf':'requestAnimationFrame(' not in v637,
 'v636_calls_after_root':'window.v637SyncQuestDungeon?.()' in v636,
 'v636_calls_for_chip':v636.count('window.v637SyncQuestDungeon?.()')>=2,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-V637-DIRECT-HOOK-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_V637_DIRECT_HOOK_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
