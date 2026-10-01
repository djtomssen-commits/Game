from pathlib import Path
import re,json
ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)
orphans=[]
for p in sorted((ROOT/"js/features/legacy-extracted/beta").glob("*.js")):
    rel=p.as_posix()
    if rel not in srcs: orphans.append(rel)
for p in sorted((ROOT/"js/features/anonymous-extracted/beta").glob("*.js")):
    rel=p.as_posix()
    if rel not in srcs: orphans.append(rel)
payload={"build":"V8.009-POST-RUNTIME-CLEANUP-AUDIT","external_script_count":len(srcs),"inline_script_count":len(re.findall(r'<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?</script>',beta,re.I)),"inline_style_count":len(re.findall(r'<style\b',beta,re.I)),"orphan_extracted_js_count":len(orphans),"orphan_extracted_js":orphans}
(ROOT/"V8009_POST_RUNTIME_CLEANUP_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(payload,ensure_ascii=False))
