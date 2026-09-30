from pathlib import Path
import json,re,sys
v440=Path('js/features/guild/legacy/18-v440-quest-guild-xp-final-owner.js').read_text(encoding='utf-8')
v474=Path('js/features/guild/legacy/20-v474-guild-home-authority-script.js').read_text(encoding='utf-8')
v7045=Path('js/features/quest/beta/v7045-atomic-quest-receipt-client.js').read_text(encoding='utf-8')
beta=Path('beta.html').read_text(encoding='utf-8')
m=re.search(r'<script[^>]*id=["\']v6140-central-game-event-bridge["\'][^>]*>(.*?)</script>',beta,re.S|re.I)
v6140=m.group(1) if m else ''
checks={
 'v440_beta_guard_present':"const IS_BETA=String(window.GROW_RELEASE_CHANNEL||'stable')==='beta'" in v440,
 'v440_beta_early_return':"__V8009_QUEST_V440_RETIRED__" in v440 and re.search(r'if\(IS_BETA\)\s*\{[^}]*__V8009_QUEST_V440_RETIRED__[^}]*return;',v440,re.S) is not None,
 'v440_stable_claim_logic_retained':"__v440QuestClaimWrapped" in v440 and "awardQuestGuildXp" in v440,
 'v6140_present':bool(v6140),
 'v6140_quest_completion_source':"BUS.emit('questCompleted'" in v6140,
 'v6140_guild_subscriber':"BUS.on('questCompleted'" in v6140 and ("v474AwardGuildActivity" in v6140 or "v411AwardGuildActivity" in v6140),
 'v474_award_retained':"window.v474AwardGuildActivity=awardGuildActivity" in v474,
 'v7045_authority_retained':"__V7045_ATOMIC_QUEST_CLIENT__" in v7045 and "claimServerQuest" in v7045,
}
failed=[k for k,v in checks.items() if not v]
result={'build':'V8.009-QUEST-V440-BETA-RETIRE-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_V440_BETA_RETIRE_QA.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))
if failed: sys.exit(1)
