from pathlib import Path
import json,sys,re
entry=Path('js/features/tower/beta/v8009-t1-tower-entry.js').read_text(encoding='utf-8')
sysf=Path('js/features/tower/beta/v8009-t1-tower-system.js').read_text(encoding='utf-8')
pre=Path('js/features/tower/beta/v8009-t1-tower-direct-preempt.js').read_text(encoding='utf-8')
checks={
 'entry_retired':'__V8009_TOWER_ENTRY_RETIRED__' in entry,
 'entry_no_observer':'MutationObserver' not in entry,
 'entry_no_timers':'setTimeout(' not in entry and 'requestAnimationFrame(' not in entry,
 'system_shared_nav':"growlegends:navigation-open-v7119" in sysf,
 'system_no_v032go_wrap':"const base=v032Go;v032Go=function(id)" not in sysf,
 'system_direct_tower_render':"try{render()}catch(err)" in sysf,
 'system_account_menu_direct':"window.addEventListener('growlegends:account-ready',add)" in sysf,
 'system_pageshow_menu_direct':"window.addEventListener('pageshow',add" in sysf,
 'early_preempt_retries_retained':'setTimeout(installPresentationGuards,500)' in pre and 'setTimeout(installPresentationGuards,1200)' in pre,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-TOWER-FAST-BATCH-A-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_TOWER_FAST_BATCH_A_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
