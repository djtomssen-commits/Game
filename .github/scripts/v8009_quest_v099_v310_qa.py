from pathlib import Path
import json,sys,re
v099=Path('js/features/quest/beta/v099-real-quest-xp-fix.js').read_text(encoding='utf-8')
v310=Path('js/features/quest/beta/v310-elite-quests.js').read_text(encoding='utf-8')
v235=Path('js/features/quest/beta/v235-quest-reward-stability.js').read_text(encoding='utf-8')
v6344=Path('js/features/quest/beta/v6344-quest-variety-js.js').read_text(encoding='utf-8')
checks={
 'v099_local_claim_retained':re.search(r'\bclaimQuest\s*=\s*function',v099) is not None,
 'v099_painter_exported':'window.v099PaintQuestXp=v099PaintQuestXp' in v099,
 'v099_global_render_wrapper_removed':'v099BaseRender' not in v099 and re.search(r'\brender\s*=\s*function',v099) is None,
 'v099_click_repaint_removed':"document.addEventListener('click'" not in v099 and 'setTimeout(v099PaintQuestXp' not in v099,
 'v6344_calls_xp_painter':'window.v099PaintQuestXp?.()' in v6344,
 'v310_no_claim_assignment':re.search(r'\bclaimQuest\s*=',v310) is None,
 'v310_begin_finish_hooks':'window.v310BeginQuestClaim=v310BeginQuestClaim' in v310 and 'window.v310FinishQuestClaim=v310FinishQuestClaim' in v310,
 'v235_calls_v310_hooks':'window.v310BeginQuestClaim?.()' in v235 and 'window.v310FinishQuestClaim?.(eliteTxn,paid)' in v235,
 'elite_chance_6pct':'const V310_ELITE_CHANCE=.06' in v310,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-V099-V310-CONSOLIDATION-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_V099_V310_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
