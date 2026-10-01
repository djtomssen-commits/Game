from pathlib import Path
import re,json
ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
p235=(ROOT/"js/features/quest/beta/v235-quest-reward-stability.js").read_text(encoding="utf-8")
p6140=(ROOT/"js/features/events/beta/v8009-s1-v6140-central-game-event-bridge.js").read_text(encoding="utf-8")
pre=(ROOT/"js/features/system/beta/v8009-s18-v6140-central-event-bus-preboot.js").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)
def order(path):
    try:return srcs.index(path)
    except ValueError:return -1
checks={
 "preboot_bus_present":"window.__V6140_EVENT_BUS__=true" in pre and "window.GL_EVENTS=" in pre,
 "preboot_loaded_early":0 <= order("js/features/system/beta/v8009-s18-v6140-central-event-bus-preboot.js") < order("js/features/quest/beta/v235-quest-reward-stability.js"),
 "v235_emits_quest_completed":"GL_EVENTS?.emit?.('questCompleted'" in p235 and "source:'v235-local'" in p235,
 "v6140_no_quest_source_wrapper":"function installQuestSource" not in p6140 and "__v6140EventSource" not in p6140,
 "v6140_subscribes_quest_completed":"BUS.on('questCompleted'" in p6140,
 "v6140_keeps_dungeon_source":"function installDungeonSource" in p6140,
 "v6140_keeps_pvp_source":"function installPvpSource" in p6140,
 "zero_inline_js":len(re.findall(r'<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?</script>',beta,re.I))==0,
 "zero_inline_css":len(re.findall(r'<style\b',beta,re.I))==0
}
payload={"build":"V8.009-QUEST-COMPLETION-EVENT-QA","external_script_count":len(srcs),"orders":{"preboot":order("js/features/system/beta/v8009-s18-v6140-central-event-bus-preboot.js"),"v235":order("js/features/quest/beta/v235-quest-reward-stability.js"),"v6140":order("js/features/events/beta/v8009-s1-v6140-central-game-event-bridge.js")},"checks":checks}
(ROOT/"V8009_QUEST_COMPLETION_EVENT_QA.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
if not all(checks.values()): raise SystemExit(json.dumps(payload,ensure_ascii=False))
print(json.dumps(payload,ensure_ascii=False))
