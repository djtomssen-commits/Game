from pathlib import Path
import re,json
root=Path(".")
beta=(root/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)
rows=[]
for order,src in enumerate(srcs):
    p=root/src
    if not p.exists() or p.suffix.lower()!=".js": continue
    txt=p.read_text(encoding="utf-8",errors="ignore")
    if "GL_EVENTS" in txt or "__V6140_EVENT_BUS__" in txt:
        rows.append({
          "order":order,
          "src":src,
          "has_gl_events":"GL_EVENTS" in txt,
          "sets_gl_events":bool(re.search(r'(?:window\.)?GL_EVENTS\s*=',txt)),
          "has_bus_flag":"__V6140_EVENT_BUS__" in txt,
          "sets_bus_flag":bool(re.search(r'__V6140_EVENT_BUS__\s*=',txt))
        })
payload={"build":"V8.009-EVENT-BUS-ORDER-AUDIT","rows":rows}
(root/"V8009_EVENT_BUS_ORDER_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(payload,ensure_ascii=False))
