from pathlib import Path
import json,sys
v496=Path('js/features/quest/beta/v496-quest-claim-single-payout.js').read_text(encoding='utf-8')
v6344=Path('js/features/quest/beta/v6344-quest-variety-js.js').read_text(encoding='utf-8')
checks={
 'single_payout_guard_retained':'alreadyPaid(q)' in v496 and 'markPaid(q)' in v496,
 'repair_export_retained':'window.v496RepairStalePaidQuest=repairStalePaidQuest' in v496,
 'canonical_renderer_calls_repair':'window.v496RepairStalePaidQuest?.()' in v6344,
 'paid_delayed_render_removed':"setTimeout(()=>{\n            try{if(typeof renderQuests==='function')renderQuests()}catch(e){}\n          },80)" not in v496,
 'paid_raf_render_removed':"requestAnimationFrame(()=>{\n            try{if(typeof renderQuests==='function')renderQuests()}catch(e){}\n          });" not in v496,
 'stale_sync_render_present':"setClaimUiBusy(true,'Bereits abgeholt');\n          try{if(typeof renderQuests==='function')renderQuests()}catch(e){}" in v496,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-V496-REPAINT-RETIRE-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_V496_REPAINT_RETIRE_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
