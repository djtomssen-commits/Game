from pathlib import Path
import re,json
R=Path(".")
beta=(R/"beta.html").read_text(encoding="utf-8")
v492=(R/"js/features/grow/beta/v8009-s1-v492-growroom2.js").read_text(encoding="utf-8")
v4114=(R/"js/features/grow/beta/v8009-s3-v4114-grow-care-authority.js").read_text(encoding="utf-8")
v6160=(R/"js/features/grow/beta/v8009-s1-v6160-grow-contracts-core.js").read_text(encoding="utf-8")
v6163=(R/"js/features/grow/beta/v8009-s6-v6163-growroom-primary-tabs-core.js").read_text(encoding="utf-8")
v6130=(R/"js/features/character/beta/v8009-s3-v6130-genetics-classset-core.js").read_text(encoding="utf-8")
v6282=(R/"js/features/grow/beta/v8009-s2-v6282-grow-economy.js").read_text(encoding="utf-8")
v6283=(R/"js/features/guide/beta/v8009-s2-v6283-grow-guides.js").read_text(encoding="utf-8")
v430=(R/"js/features/grow/beta/v8009-s8-v430-growroom-max-level-authority.js").read_text(encoding="utf-8")
v241=(R/"js/features/grow/beta/v8009-s8-v241-harvest-reward-final-core.js").read_text(encoding="utf-8")
v7065=(R/"js/features/authority/beta/v8009-s2-v7065-fail-closed-grow-authority-hotfix.js").read_text(encoding="utf-8")
css497=(R/"v8009-extracted-v497-plant-art-economy-css.css").read_text(encoding="utf-8")
css493=(R/"v8009-extracted-v493-growroom-mobile-css.css").read_text(encoding="utf-8")

tabs=set(re.findall(r'data-v6163-tab=["\']([^"\']+)["\']',v6163,re.I))
checks={
 "four_tabs":tabs=={"grow","stock","genetics","orders"},
 "v492_event_bus_only":"installQuestDrops" not in v492 and "installDungeonDrops" not in v492 and "installPvpDrops" not in v492 and "installEventDrops()" in v492,
 "v492_no_startup_retry_array":"[0,120,700,2200,6500,20000]" not in v492,
 "v492_single_interval":v492.count("setInterval(")==1,
 "v4114_no_timeout":"setTimeout(" not in v4114,
 "v6160_no_timeout":"setTimeout(" not in v6160,
 "v430_no_timeout":"setTimeout(" not in v430,
 "v6163_no_timeout_or_raf":"setTimeout(" not in v6163 and "requestAnimationFrame(" not in v6163,
 "v6163_one_observer":v6163.count("MutationObserver")==1,
 "v6283_no_observer_or_raf":"MutationObserver" not in v6283 and "requestAnimationFrame(" not in v6283,
 "v241_no_popup_retries":"setTimeout(" not in v241 and "requestAnimationFrame(" not in v241,
 "genetics_event_bus":"GL_EVENTS.on('growHarvested'" in v6130,
 "stock_real_timer_kept":"setInterval(()=>{if(window.v6163GrowTabs?.active==='stock')refresh()},60000)" in v6282,
 "authority_gate_kept":"__V7065_GROW_SERVER_MODE__" in v7065 and "v7067ServerCare" in v7065,
 "plant_art_contained":"max-width:78%" in css497 and "object-fit:contain" in css497,
 "plant_stage_scaled":"v497-stage-seedling{height:44px}" in css497 and "v497-stage-harvest{height:64px}" in css497,
 "mobile_stage_scaled":"v497-stage-seedling{height:40px}" in css497 and "v497-stage-harvest{height:58px}" in css497,
 "empty_pot_scaled":"font-size:24px" in css493,
 "zero_inline_js":len(re.findall(r'<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?</script>',beta,re.I))==0,
 "zero_inline_css":len(re.findall(r'<style\b',beta,re.I))==0
}
payload={"build":"V8.009-GROWROOM-FINAL-QA","tabs":sorted(tabs),"checks":checks,"ok":all(checks.values())}
(R/"V8009_GROWROOM_FINAL_QA.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(payload,ensure_ascii=False))
if not payload["ok"]: raise SystemExit(1)
