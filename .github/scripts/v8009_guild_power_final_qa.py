from pathlib import Path
import re,json
ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
signup=(ROOT/"js/features/guild/beta/v8008-c18-guildboss-replay-owner.js").read_text(encoding="utf-8")
runtime=(ROOT/"js/features/guild/beta/v8008-c25-guildboss-runtime-owner.js").read_text(encoding="utf-8")
visual=(ROOT/"js/features/guild/beta/v8008-c18-guildboss-screen-visual-owner.js").read_text(encoding="utf-8")
grow=(ROOT/"js/features/guild/legacy/50-v7273-guild-grow-core.js").read_text(encoding="utf-8")
legacy=(ROOT/"js/features/guild/legacy/01-v255-daily-guild-boss-core.js").read_text(encoding="utf-8")
war=(ROOT/"js/features/guild/beta/v8008-c25-guildwar-owner.js").read_text(encoding="utf-8")
sql=(ROOT/"V8009_GUILDBOSS_SIGNUP_REWARD_GATE.sql").read_text(encoding="utf-8")

tabs=set(re.findall(r'data-v254-tab=["\']([^"\']+)["\']',beta,re.I))
checks={
 "four_guild_tabs_present": {"overview","growtasks","boss","war"}.issubset(tabs),
 "signup_gate_reads_previous_result":"v7165_get_last_guild_boss_result" in signup,
 "signup_gate_blocks_button":"rewardGate.pending" in signup and "🎁 Erst Belohnung abholen" in signup,
 "signup_gate_server_call_guarded":"if(wanted && await refreshRewardGate(true))" in signup,
 "claim_refreshes_gate":"v7307RefreshBossSignupGate?.(true)" in runtime,
 "public_sql_gate":"public.v7307_set_guild_boss_signup" in sql and "gr.battle_date < d" in sql,
 "server1_sql_gate":"server1.v7307_set_guild_boss_signup" in sql and sql.count("pending_reward")>=4,
 "legacy_signup_wrapper_absent":"v255BaseToggleSignup" not in legacy,
 "legacy_guild_load_wrapper_absent":"v255BaseLoadGuild" not in legacy,
 "boss_visual_retry_burst_absent":"[60,250,800,1800]" not in visual and "setTimeout(buildBossLayout" not in visual,
 "boss_visual_legacy_cleanup_burst_absent":"setTimeout(clean,300)" not in visual and "setTimeout(clean,1200)" not in visual and "setTimeout(clean,2600)" not in visual,
 "replay_bind_retry_absent":"setTimeout(bind,600)" not in signup and "setTimeout(bind,1800)" not in signup,
 "grow_timer_30s":re.search(r'setInterval\([\s\S]*?,30000\);',grow) is not None,
 "war_notice_watch_kept":"noticeWatch" in war and "60000" in war,
 "war_startup_delay_removed":"setTimeout(()=>void loadWar({silent:true}),900)" not in war,
 "zero_inline_js":len(re.findall(r'<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?</script>',beta,re.I))==0,
 "zero_inline_css":len(re.findall(r'<style\b',beta,re.I))==0,
}
payload={"build":"V8.009-GUILD-POWER-FINAL-QA","tabs":sorted(tabs),"checks":checks,"ok":all(checks.values())}
(ROOT/"V8009_GUILD_POWER_FINAL_QA.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(payload,ensure_ascii=False))
if not payload["ok"]: raise SystemExit(1)
