from pathlib import Path
import re,json
R=Path(".")
beta=(R/"beta.html").read_text(encoding="utf-8")
v492=(R/"js/features/grow/beta/v8009-s1-v492-growroom2.js").read_text(encoding="utf-8")
v4114=(R/"js/features/grow/beta/v8009-s3-v4114-grow-care-authority.js").read_text(encoding="utf-8")
v6163=(R/"js/features/grow/beta/v8009-s6-v6163-growroom-primary-tabs-core.js").read_text(encoding="utf-8")
v430=(R/"js/features/grow/beta/v8009-s8-v430-growroom-max-level-authority.js").read_text(encoding="utf-8")
v6160=(R/"js/features/grow/beta/v8009-s1-v6160-grow-contracts-core.js").read_text(encoding="utf-8")
v6130=(R/"js/features/character/beta/v8009-s3-v6130-genetics-classset-core.js").read_text(encoding="utf-8")
v6282=(R/"js/features/grow/beta/v8009-s2-v6282-grow-economy.js").read_text(encoding="utf-8")
v7070=(R/"js/features/grow/beta/v8009-s5-v7070-authoritative-grow-hydration.js").read_text(encoding="utf-8")
v7071=(R/"js/features/authority/beta/v8009-s7-v7071-server-grow-dealer-bridge.js").read_text(encoding="utf-8")

tabs=set(re.findall(r'data-v6163-tab=["\']([^"\']+)["\']',v6163,re.I))
checks={
 "four_tabs_present":{"grow","stock","genetics","orders"}.issubset(tabs),
 "v492_uses_event_bus":"function installEventDrops()" in v492 and "GL_EVENTS.on('questCompleted'" in v492 and "GL_EVENTS.on('dungeonWon'" in v492 and "GL_EVENTS.on('pvpWon'" in v492,
 "v492_legacy_cross_feature_wrappers_removed":"function installQuestDrops" not in v492 and "function installDungeonDrops" not in v492 and "function installPvpDrops" not in v492,
 "v492_one_interval":v492.count("setInterval(")==1,
 "v492_retry_burst_removed":"[0,120,700,2200,6500,20000]" not in v492,
 "v492_seed_inventory_delays_removed":"setTimeout(()=>v495CloseSeedInventory(),45)" not in v492 and "setTimeout(()=>v495RenderSeedInventory(),90)" not in v492,
 "care_authority_kept":"window.v4114CarePlant=doCare" in v4114 and "window.v7067ServerCare" in v4114,
 "care_has_no_settimeout":"setTimeout(" not in v4114,
 "tabs_no_settimeout":"setTimeout(" not in v6163,
 "tabs_no_raf":"requestAnimationFrame(" not in v6163,
 "tabs_observer_kept":"MutationObserver" in v6163,
 "maxlevel_no_retry_timers":"setTimeout(" not in v430,
 "orders_no_settimeout":"setTimeout(" not in v6160,
 "genetics_no_settimeout":"setTimeout(" not in v6130,
 "stock_only_real_interval":"setTimeout(" not in v6282 and "setInterval(" in v6282 and "60000" in v6282,
 "dealer_bridge_no_settimeout":"setTimeout(" not in v7071,
 "hydration_render_guard_kept":"__V7070_RENDER_GUARD__" in v7070 and "v7070GrowHydrationRefresh" in v7070,
 "zero_inline_js":len(re.findall(r'<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?</script>',beta,re.I))==0,
 "zero_inline_css":len(re.findall(r'<style\b',beta,re.I))==0
}
payload={"build":"V8.009-GROWROOM-FOUR-TAB-FINAL-QA","tabs":sorted(tabs),"checks":checks,"ok":all(checks.values())}
(R/"V8009_GROWROOM_FOUR_TAB_FINAL_QA.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(payload,ensure_ascii=False))
if not payload["ok"]: raise SystemExit(1)
