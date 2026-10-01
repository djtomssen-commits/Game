from pathlib import Path
import re,json
R=Path(".")
beta=(R/"beta.html").read_text(encoding="utf-8")
audit=json.loads((R/"V8009_PVP_HALL_POWER_AUDIT.json").read_text(encoding="utf-8"))
v204=(R/"js/features/pvp/beta/v8009-s1-v204-pvp-system.js").read_text(encoding="utf-8")
v205=(R/"js/features/pvp/beta/v8009-s1-v205-pvp-bud-reward.js").read_text(encoding="utf-8")
v206=(R/"js/features/pvp/beta/v8009-s1-v206-pvp-start-fix.js").read_text(encoding="utf-8")
v207=(R/"js/features/pvp/beta/v8009-s1-v207-pvp-state-fix.js").read_text(encoding="utf-8")
v209=(R/"js/features/pvp/beta/v8009-s1-v209-pvp-dungeon-battle.js").read_text(encoding="utf-8")
v211=(R/"js/features/pvp/beta/v8009-s1-v211-pvp-result-modal.js").read_text(encoding="utf-8")
v216=(R/"js/features/pvp/beta/v8009-s1-v216-pvp-finish-flow-fix.js").read_text(encoding="utf-8")
v6145=(R/"js/features/pvp/beta/v8009-s1-v6145-hall-pagination-js.js").read_text(encoding="utf-8")
v649=(R/"js/features/hall/beta/v8009-s1-v649-hall-dungeon-progress-fix.js").read_text(encoding="utf-8")
v652=(R/"js/features/profile/beta/v8009-s2-v652-player-profile-redesign.js").read_text(encoding="utf-8")
v655=(R/"js/features/profile/beta/v8009-s1-v655-player-profile-load-fix.js").read_text(encoding="utf-8")
v7053=(R/"js/features/pvp/beta/v8009-s1-v7053-atomic-pvp-client-bridge.js").read_text(encoding="utf-8")
battlelog=(R/"js/features/pvp/beta/v8009-s1-v6200-pvp-battlelog-core.js").read_text(encoding="utf-8")
global_render_re=re.compile(r'(?<![\w$.])render\s*=\s*(?:async\s*)?function\b')
checks={
 "audit_global_render_zero":sum(r["counts"]["global_render"] for r in audit["rows"])==0,
 "audit_timeouts_reduced":sum(r["counts"]["timeouts"] for r in audit["rows"])<=47,
 "v204_no_full_page_tick":"if(document.querySelector('#pvp')?.classList.contains('active'))v204RenderPage()" not in v204,
 "v204_real_cooldown_interval_kept":"setInterval(" in v204 and "v204CooldownLeft" in v204,
 "v205_no_global_render":not global_render_re.search(v205),
 "v206_no_global_render":not global_render_re.search(v206),
 "v207_no_global_render":not global_render_re.search(v207),
 "v209_no_global_render":not global_render_re.search(v209),
 "v211_duplicate_finish_removed":"v209FinishBattle=async function" not in v211,
 "v216_legacy_finish_owner_kept":"v209FinishBattle=async function" in v216,
 "v7053_server_router_kept":"const routedFight=function(){if(enforced())return runServerPvp()" in v7053,
 "v7053_retry_burst_removed":"[80,420,1300]" not in v7053 and "},4200)" not in v7053,
 "v7053_rpc_timeouts_kept":"RPC_TIMEOUT:" in v7053,
 "hall_v6145_owner":"v073LoadRanking=loadRanking" in v6145,
 "hall_v649_ranking_wrapper_removed":"__v649RankingWrapped" not in v649,
 "hall_v649_targeted_sync":"v649SyncDungeonProgress=write" in v649,
 "profile_v652_wrapper_removed":"__v652PlayerProfileWrapped" not in v652,
 "profile_v652_observer_kept":"MutationObserver" in v652,
 "profile_v655_final_owner":"v074OpenProfile=robustOpen" in v655 and "window.v074OpenProfile=robustOpen" in v655,
 "profile_deadlines_kept":"function deadline(promise,ms)" in v655,
 "battlelog_real_replay_timer_kept":"function sleep(ms)" in battlelog and "setInterval(" in battlelog,
 "zero_inline_js":len(re.findall(r'<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?</script>',beta,re.I))==0,
 "zero_inline_css":len(re.findall(r'<style\b',beta,re.I))==0
}
payload={"build":"V8.009-PVP-HALL-PROFILE-FINAL-QA","checks":checks,"ok":all(checks.values())}
(R/"V8009_PVP_HALL_PROFILE_FINAL_QA.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(payload,ensure_ascii=False))
if not payload["ok"]: raise SystemExit(1)
