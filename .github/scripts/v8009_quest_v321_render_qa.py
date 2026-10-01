from pathlib import Path
import json,sys,re
v321=Path('js/features/quest/beta/v321-elite-hard-guarantee-dampf-scale.js').read_text(encoding='utf-8')
v6344=Path('js/features/quest/beta/v6344-quest-variety-js.js').read_text(encoding='utf-8')
checks={
 'no_renderquests_assignment':re.search(r'\brenderQuests\s*=\s*function',v321) is None,
 'no_global_render_assignment':re.search(r'\brender\s*=\s*function',v321) is None,
 'prepare_hook_exported':'window.v321PrepareQuestRender=v321PrepareQuestRender' in v321,
 'paint_hook_exported':'window.v321PaintQuestCosts=v321PaintQuestCosts' in v321,
 'no_raf':'requestAnimationFrame(' not in v321,
 'dampf_curve_retained':'const V321_DAMPF_BANDS=' in v321 and 'v271EffectiveQuestCost=function' in v321,
 'elite_guarantee_retained':'window.v321FinalizeEliteReward=v321FinalizeEliteReward' in v321,
 'v6344_calls_prepare':'window.v321PrepareQuestRender?.()' in v6344,
 'v6344_calls_paint':'window.v321PaintQuestCosts?.()' in v6344,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-V321-RENDER-CONSOLIDATION-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_V321_RENDER_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
