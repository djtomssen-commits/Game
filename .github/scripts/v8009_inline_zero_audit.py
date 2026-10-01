from pathlib import Path
import re,json,hashlib
s=Path("beta.html").read_text(encoding="utf-8")
scripts=[]
for m in re.finditer(r'<script\b([^>]*)>([\s\S]*?)</script>',s,re.I):
    attrs,body=m.group(1),m.group(2)
    if not re.search(r'\bsrc\s*=',attrs,re.I) and body.strip():
        scripts.append({"attrs":attrs.strip(),"bytes":len(body.encode("utf-8"))})
styles=[{"attrs":m.group(1).strip(),"bytes":len(m.group(2).encode("utf-8"))} for m in re.finditer(r'<style\b([^>]*)>([\s\S]*?)</style>',s,re.I)]
payload={
 "build":"V8.009-INLINE-ZERO-AUDIT",
 "beta_bytes":len(s.encode("utf-8")),
 "remaining_inline_script_count":len(scripts),
 "remaining_inline_style_count":len(styles),
 "remaining_inline_scripts":scripts,
 "remaining_inline_styles":styles,
 "final_grow_care_link_present":bool(re.search(r'<link[^>]*id="v4114-grow-care-css"[^>]*href="v8009-extracted-v4114-grow-care-css\.css"',s,re.I))
}
Path("V8009_INLINE_ZERO_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
if payload["remaining_inline_script_count"] or payload["remaining_inline_style_count"] or not payload["final_grow_care_link_present"]:
    raise SystemExit(json.dumps(payload,ensure_ascii=False))
print(json.dumps(payload,ensure_ascii=False))
