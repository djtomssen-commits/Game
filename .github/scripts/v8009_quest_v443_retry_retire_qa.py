from pathlib import Path
import json,sys
v443=Path('js/features/quest/beta/v443-quest-dampf-live-fix.js').read_text(encoding='utf-8')
v7110=Path('js/features/quest/beta/v7110-quest-authority-sync.js').read_text(encoding='utf-8')
checks={
 'poststart_hook_retained':'window.v443AfterQuestStart=' in v443,
 'direct_paint_retained':'paintDampf();' in v443,
 'settle_no_raf':'requestAnimationFrame(paintDampf)' not in v443,
 'settle_no_repaint_timeouts':'setTimeout(paintDampf' not in v443,
 'startup_retry_array_removed':'[400,1200,5200,12000]' not in v443,
 'account_ready_direct_paint':"growlegends:account-ready" in v443,
 'v7110_still_calls_hook':'window.v443AfterQuestStart?.(beforeEnergy,hadActive)' in v7110,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-V443-RETRY-RETIRE-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_V443_RETRY_RETIRE_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
