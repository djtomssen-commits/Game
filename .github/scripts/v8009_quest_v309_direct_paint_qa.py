from pathlib import Path
import json,sys,re
v309=Path('js/features/quest/beta/v309-distinct-quest-offers.js').read_text(encoding='utf-8')
v6344=Path('js/features/quest/beta/v6344-quest-variety-js.js').read_text(encoding='utf-8')
checks={
 'role_painter_exported':'window.v309PaintQuestRoles=v309PaintQuestRoles' in v309,
 'no_raf':'requestAnimationFrame(' not in v309,
 'no_timeout':'setTimeout(' not in v309,
 'prepare_hook_retained':'window.v309PrepareQuestRender=v309EnsureCurrentOffers' in v309,
 'v6344_calls_role_painter':'window.v309PaintQuestRoles?.()' in v6344,
 'old_schedule_hook_gone':'v309ScheduleQuestRolePaint' not in v6344,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-V309-DIRECT-PAINT-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_V309_DIRECT_PAINT_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
