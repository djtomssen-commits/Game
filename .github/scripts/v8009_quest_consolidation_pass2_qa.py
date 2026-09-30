from pathlib import Path
import json,sys
paths={
 'v386':Path('js/features/quest/beta/v386-quest-redesign-script.js'),
 'v4172':Path('js/features/quest/beta/v4172-quest-rpg-script.js'),
 'v233':Path('js/features/quest/beta/v233-quest-reward-final-click.js'),
 'v6344':Path('js/features/quest/beta/v6344-quest-variety-js.js'),
}
t={k:p.read_text(encoding='utf-8') for k,p in paths.items()}
checks={
 'v386_no_render_writer':'renderQuests=function' not in t['v386'],
 'v386_direct_hook':'window.v386RenderQuestShell' in t['v386'],
 'v4172_no_render_writer':'renderQuests=function' not in t['v4172'],
 'v4172_direct_hook':'window.v4172EnhanceQuestPage' in t['v4172'],
 'v233_no_render_writer':'renderQuests=function' not in t['v233'],
 'v233_direct_hook':'window.v233BindClaimButton' in t['v233'],
 'v6344_calls_v386':'window.v386RenderQuestShell?.()' in t['v6344'],
 'v6344_calls_v4172':'window.v4172EnhanceQuestPage?.()' in t['v6344'],
 'v6344_calls_v233':'window.v233BindClaimButton?.()' in t['v6344'],
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-CONSOLIDATION-PASS2-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_CONSOLIDATION_PASS2_QA.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,ensure_ascii=False,indent=2))
if failed: sys.exit(1)
