from pathlib import Path
import json,sys
v4127=Path('js/features/quest/beta/v4127-quest-skip-stable.js').read_text(encoding='utf-8')
v229=Path('js/features/quest/beta/v229-live-ui-sync.js').read_text(encoding='utf-8')
checks={
 'shared_nav_listener_present':"growlegends:navigation-open-v7119" in v4127,
 'quest_filter_present':"==='quests'" in v4127,
 'v032go_wrapper_removed':'__v4127Skip' not in v4127 and 'const base=v032Go' not in v4127,
 'skip_owner_retained':'window.v4127EnsureQuestSkip=ensureSkip' in v4127,
 'v229_uses_same_shared_event':"growlegends:navigation-open-v7119" in v229,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-V4127-NAV-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_V4127_NAV_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
