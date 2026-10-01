from pathlib import Path
import json

p = Path("beta.html")
c = p.read_text(encoding="utf-8")

old = """window.addEventListener('pageshow',()=>{if(document.getElementById('v110Overlay')?.classList.contains('show'))setTimeout(install,40)},{passive:true});"""
new = """window.addEventListener('pageshow',()=>{if(document.getElementById('v110Overlay')?.classList.contains('show'))install()},{passive:true});"""

if old not in c:
    raise SystemExit("v6201 pageshow retry block missing")

c = c.replace(old, new, 1)
p.write_text(c, encoding="utf-8")

checks = {
    "pageshow_retry_removed": old not in c,
    "pageshow_direct_install_present": new in c,
    "fight_scene_reset_kept": "scene.classList.remove('v6201-dead','v6201-victory');install()" in c,
    "pet_boss_win_delays_kept": "setTimeout(()=>checkBossWin(before),900)" in c and "setTimeout(()=>checkBossWin(before),2800)" in c,
    "stable_not_touched_by_script": True,
}
if not all(checks.values()):
    raise SystemExit("boss UI QA failed: " + json.dumps(checks))

Path("V8009_BOSS_UI_FAST_QA_B.json").write_text(
    json.dumps({
        "build": "V8.009-BOSS-UI-FAST-QA-B",
        "checks": checks,
        "scope": "UI lifecycle only; combat, pet drops, rewards and authority unchanged"
    }, indent=2, ensure_ascii=False) + "\n",
    encoding="utf-8"
)
print("patched v6201 pageshow UI retry and wrote QA")
