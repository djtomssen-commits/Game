from pathlib import Path
import re,json

ROOT=Path(".")
BETA=ROOT/"beta.html"
QA=ROOT/"V8009_PURE_UNUSED_DEFINITION_CLEANUP_QA.json"
targets=[
"js/features/legacy-extracted/beta/v685-quest-dampf-display-fix.js",
"js/features/legacy-extracted/beta/v687-pet-title-all-qualities.js",
"js/features/legacy-extracted/beta/v6101-navigation-altcode-performance.js",
"js/features/legacy-extracted/beta/v6261-tower-open-hotfix.js",
"js/features/legacy-extracted/beta/v6270-tower-lobby-fixes-js.js",
"js/features/legacy-extracted/beta/v6271-tower-topbar-lobby-js.js",
"js/features/legacy-extracted/beta/v6322-harzruferin-elite-quest-balance.js",
"js/features/legacy-extracted/beta/v7271-illegal-book-page-stability-diagnostics.js",
]
beta=BETA.read_text(encoding="utf-8")
removed=[]
for src in targets:
    pat=re.compile(r'<script\b[^>]*\bsrc=["\']'+re.escape(src)+r'["\'][^>]*>\s*</script>\s*',re.I)
    beta,n=pat.subn('',beta)
    p=ROOT/src
    existed=p.exists()
    if existed:p.unlink()
    removed.append({"src":src,"links_removed":n,"file_removed":existed})
BETA.write_text(beta,encoding="utf-8")
v467="js/features/dungeon/beta/v8009-s5-v467-hard-live-dungeon-key-authority.js"
v4150="js/features/dungeon/beta/v8009-s10-v4150-live-dungeon-key-authority.js"
external=len(re.findall(r'<script\b[^>]*\bsrc=',beta,re.I))
payload={
 "build":"V8.009-PURE-UNUSED-DEFINITION-CLEANUP-QA",
 "removed_count":len(removed),
 "removed":removed,
 "checks":{
   "no_target_href":all(x["src"] not in beta for x in removed),
   "all_target_files_absent":all(not (ROOT/x["src"]).exists() for x in removed),
   "v467_loaded":v467 in beta and (ROOT/v467).exists(),
   "v4150_absent":v4150 not in beta and not (ROOT/v4150).exists(),
   "external_script_count":external,
   "inline_script_count":len(re.findall(r'<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?</script>',beta,re.I)),
   "inline_style_count":len(re.findall(r'<style\b',beta,re.I))
 }
}
QA.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
c=payload["checks"]
if not c["no_target_href"] or not c["all_target_files_absent"] or not c["v467_loaded"] or not c["v4150_absent"] or c["inline_script_count"] or c["inline_style_count"]:
    raise SystemExit(json.dumps(payload,ensure_ascii=False))
print(json.dumps(payload,ensure_ascii=False))
