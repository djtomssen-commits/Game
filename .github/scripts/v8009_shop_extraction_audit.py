from pathlib import Path
import re,json
src=Path("beta.html").read_text(encoding="utf-8")
targets=["v466-all-item-art-purchase-fix","v6105-item-variety-and-art-rework","v7063-server-shop-forge-auto-bridge"]
out={}
for sid in targets:
 m=re.search(r'(<script[^>]*id="'+re.escape(sid)+r'"[^>]*>)([\s\S]*?)(</script>)',src,re.I)
 out[sid]={"found":bool(m),"open":m.group(1) if m else "","bytes":len(m.group(2)) if m else 0}
Path("V8009_SHOP_EXTRACTION_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(out,indent=2))
