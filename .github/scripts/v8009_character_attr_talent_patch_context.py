from pathlib import Path
import re,json
src=Path("beta.html").read_text(encoding="utf-8")
targets=["v314-talent-tree","v444-character-inventory-order-fix","v514-heldenquartier-reference-js","v543-talents-mobile-tree-js"]
out={}
for sid in targets:
 m=re.search(r'<script[^>]*id="'+re.escape(sid)+r'"[^>]*>([\s\S]*?)</script>',src,re.I)
 if not m: out[sid]={"missing":True};continue
 body=m.group(1)
 snippets=[]
 for needle in ["const v314BaseRender=render","if(typeof render==='function'&&!window.__v444RenderWrapped)","if(typeof render==='function'&&!window.__v514RenderWrapped)","requestAnimationFrame(apply)"]:
  i=body.find(needle)
  if i>=0: snippets.append({"needle":needle,"context":body[max(0,i-900):i+1800]})
 out[sid]=snippets
Path("V8009_CHARACTER_ATTR_TALENT_PATCH_CONTEXT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(out,ensure_ascii=False,indent=2))
