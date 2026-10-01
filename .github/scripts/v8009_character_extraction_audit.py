from pathlib import Path
import re,json
src=Path("beta.html").read_text(encoding="utf-8")
targets=["v4140-attribute-display-owner","v543-talents-mobile-tree-js","v444-character-inventory-order-fix","v514-heldenquartier-reference-js"]
out={}
for sid in targets:
 m=re.search(r'(<script[^>]*id="'+re.escape(sid)+r'"[^>]*>)([\s\S]*?)(</script>)',src,re.I)
 out[sid]={
   "found":bool(m),
   "open":m.group(1) if m else "",
   "bytes":len(m.group(2)) if m else 0,
   "first":(m.group(2)[:600] if m else ""),
   "last":(m.group(2)[-600:] if m else "")
 }
Path("V8009_CHARACTER_EXTRACTION_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(out,indent=2,ensure_ascii=False))
