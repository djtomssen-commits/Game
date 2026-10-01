from pathlib import Path
import json,sys,re
v235=Path('js/features/quest/beta/v235-quest-reward-stability.js').read_text(encoding='utf-8')
v240=Path('js/features/quest/beta/v240-rarity-quest-loot-core.js').read_text(encoding='utf-8')
v4222=Path('js/features/quest/beta/v4222-separate-elite-quest-script.js').read_text(encoding='utf-8')
checks={
 'v235_final_claim_owner_retained':re.search(r'v233ClaimQuest\s*=\s*function',v235) is not None,
 'v235_calls_elite_hook':'window.v4222AfterQuestClaim?.()' in v235,
 'v4222_no_claim_wrapper':re.search(r'\bclaimQuest\s*=',v4222) is None and re.search(r'\bv233ClaimQuest\s*=',v4222) is None,
 'v235_reward_retry_removed':'requestAnimationFrame(()=>{\n    overlay.classList.add' not in v235 and 'document.body.contains(overlay)' not in v235,
 'v240_reward_retry_removed':'requestAnimationFrame(()=>overlay.classList.add' not in v240 and 'document.body.contains(overlay)' not in v240,
 'v235_version_timer_removed':"V4.29 Stable" not in v235,
 'v240_version_timer_removed':"V4.29 Stable" not in v240,
 'v240_direct_reward_show_retained':"overlay.classList.add('show');" in v240,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-LOCAL-CLAIM-OWNER-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_LOCAL_CLAIM_OWNER_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
