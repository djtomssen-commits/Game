from pathlib import Path
import json,sys,re
v626=Path('js/features/quest/beta/v626-quest-enemy-art-fix-core.js').read_text(encoding='utf-8')
v627=Path('js/features/quest/beta/v627-quest-crisp-art-core.js').read_text(encoding='utf-8')
v636=Path('js/features/quest/beta/v636-quest-dungeon-authority-core.js').read_text(encoding='utf-8')
checks={
 'v626_retired':'__V8009_V626_QUEST_ART_RETIRED__' in v626,
 'v627_retired':'__V8009_V627_QUEST_ART_RETIRED__' in v627,
 'v626_no_runtime_hooks':all(x not in v626 for x in ['setTimeout(','requestAnimationFrame(','addEventListener(','v311PlayFight=']),
 'v627_no_runtime_hooks':all(x not in v627 for x in ['setTimeout(','requestAnimationFrame(','addEventListener(','v626ApplyQuestEnemyArt=']),
 'v636_owns_fight':'window.v311PlayFight=play' in v636,
 'v636_owns_enemy_art':'v6326QuestEnemyArt' in v636 and 'v645-quest-enemy-art' in v636,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-FIGHT-ART-RETIRE-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_FIGHT_ART_RETIRE_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
