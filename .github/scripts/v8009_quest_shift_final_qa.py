from pathlib import Path
import re,json
ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
v026=(ROOT/"js/features/quest/beta/v8009-a2-daily-dampf-system.js").read_text(encoding="utf-8")
v271=(ROOT/"js/features/quest/beta/v8009-s1-v271-dampf-system.js").read_text(encoding="utf-8")
v284=(ROOT/"js/features/quest/beta/v8009-s6-v284-dampf-card-redesign.js").read_text(encoding="utf-8")
v294=(ROOT/"js/features/quest/beta/v8009-s8-v294-dampf-canonical.js").read_text(encoding="utf-8")
v387=(ROOT/"js/features/quest/beta/v8009-s8-v387-quest-page-final.js").read_text(encoding="utf-8")
v391=(ROOT/"js/features/quest/beta/v8009-s6-v391-quest-page-finished.js").read_text(encoding="utf-8")
v6344=(ROOT/"js/features/quest/beta/v6344-quest-variety-js.js").read_text(encoding="utf-8")
v4124=(ROOT/"js/features/social/beta/v8009-s1-v4124-social-quest-fix.js").read_text(encoding="utf-8")
v235=(ROOT/"js/features/quest/beta/v235-quest-reward-stability.js").read_text(encoding="utf-8")
v7045=(ROOT/"js/features/quest/beta/v7045-atomic-quest-receipt-client.js").read_text(encoding="utf-8")
v7110=(ROOT/"js/features/quest/beta/v7110-quest-authority-sync.js").read_text(encoding="utf-8")
shift=(ROOT/"js/features/shift/beta/v8009-s1-v7137-shift-frame-client.js").read_text(encoding="utf-8")
audit=json.loads((ROOT/"V8009_QUEST_SHIFT_POWER_AUDIT.json").read_text(encoding="utf-8"))

global_render_re=re.compile(r'(?<![\w$.])render\s*=\s*(?:async\s*)?function\b')
checks={
 "v026_no_global_render":not global_render_re.search(v026),
 "v271_no_global_render":not global_render_re.search(v271),
 "v284_no_global_render":not global_render_re.search(v284),
 "v294_final_dampf_render_owner":bool(global_render_re.search(v294)) and "v271PaintDampf" in v294,
 "v387_no_renderquests_wrapper":"baseRenderQuests" not in v387 and "window.v387QuestClean" in v387,
 "v391_no_renderquests_wrapper":"baseRenderQuests" not in v391 and "window.v391QuestFinish" in v391,
 "v6344_calls_folded_helpers":"v387QuestClean" in v6344 and "v391QuestFinish" in v6344 and "v096DecorateQuestXp" in v6344,
 "v6344_no_artificial_lifecycle_timeouts":"setTimeout(" not in v6344,
 "v4124_no_claim_wrapper":"wrapQuestClaim" not in v4124 and "__v4124SeedReward" not in v4124,
 "v235_seed_showcase_integrated":"v4124QuestSeedSnapshot" in v235 and "v4124AppendQuestSeedReward" in v235,
 "v235_completion_event":"GL_EVENTS?.emit?.('questCompleted'" in v235,
 "v7045_no_boot_delay_cascade":"setTimeout(()=>void boot(),320)" not in v7045 and "},950)" not in v7045 and "},3300)" not in v7045,
 "v7045_keeps_rpc_timeout":"RPC_TIMEOUT:" in v7045,
 "v7110_no_lifecycle_settle_delays":"setTimeout(run,420)" not in v7110 and "},700)" not in v7110 and "setTimeout(()=>void sync(false),250)" not in v7110,
 "shift_no_settimeout":"setTimeout(" not in shift,
 "shift_real_ticker_kept":"setInterval(shiftTick,1000)" in shift,
 "shift_avatar_observer_kept":"MutationObserver" in shift,
 "audit_global_render_one":sum(r["counts"]["global_render"] for r in audit["rows"])==1,
 "audit_timeouts_15_or_less":sum(r["counts"]["timeouts"] for r in audit["rows"])<=15,
 "zero_inline_js":len(re.findall(r'<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?</script>',beta,re.I))==0,
 "zero_inline_css":len(re.findall(r'<style\b',beta,re.I))==0
}
payload={"build":"V8.009-QUEST-SHIFT-FINAL-QA","checks":checks,"ok":all(checks.values()),"audit_scope":audit.get("scope_count")}
(ROOT/"V8009_QUEST_SHIFT_FINAL_QA.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(payload,ensure_ascii=False))
if not payload["ok"]: raise SystemExit(1)
