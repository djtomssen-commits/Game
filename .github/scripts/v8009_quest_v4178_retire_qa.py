from pathlib import Path
import json,sys
v4178=Path('js/features/quest/beta/v4178-quest-live-hard-fix.js').read_text(encoding='utf-8')
v229=Path('js/features/quest/beta/v229-live-ui-sync.js').read_text(encoding='utf-8')
v392=Path('js/features/quest/beta/v392-single-active-quest-script.js').read_text(encoding='utf-8')
checks={
 'v4178_retired_marker':'__V8009_V4178_QUEST_LIVE_RETIRED__' in v4178,
 'v4178_no_interval':'setInterval(' not in v4178,
 'v4178_no_nav_wrapper':'v032Go' not in v4178,
 'v4178_no_repaint_timers':'setTimeout(' not in v4178 and 'requestAnimationFrame(' not in v4178,
 'v229_timer_owner_retained':'setInterval(' in v229 and 'v229UpdateQuestTimer' in v229,
 'v229_shared_nav_retained':'growlegends:navigation-open-v7119' in v229,
 'v392_tick_owner_retained':'window.v392TickActive=tickActive' in v392,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-V4178-RETIRE-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_V4178_RETIRE_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
