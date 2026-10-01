from pathlib import Path
import re,json
ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)
scope=[s for s in srcs if "/grow/" in s.lower() or re.search(r'(?:^|/|[-_])(?:genetics?|growroom|seed|grow)(?:[-_.]|$)',s.lower())]
rows=[]
for order,src in enumerate(scope):
 p=ROOT/src
 if not p.exists() or p.suffix.lower()!=".js":continue
 txt=p.read_text(encoding="utf-8",errors="ignore")
 counts={
  "global_render":len(re.findall(r'(?<![\w$.])render\s*=\s*(?:async\s*)?function\b',txt)),
  "grow_render_assign":len(re.findall(r'\b(?:renderGrow|v232Render|v492Render|v6163Render|renderGrowroom)\w*\s*=|window\.v(?:232|492|6163)\w*\s*=',txt)),
  "care_assign":len(re.findall(r'\b(?:v4114\w+|waterPlant|carePlant|harvestPlant)\s*=|window\.(?:v4114\w+|waterPlant|carePlant|harvestPlant)\s*=',txt)),
  "timeouts":len(re.findall(r'\bsetTimeout\s*\(',txt)),
  "intervals":len(re.findall(r'\bsetInterval\s*\(',txt)),
  "raf":len(re.findall(r'\brequestAnimationFrame\s*\(',txt)),
  "mutation":len(re.findall(r'new\s+MutationObserver\b',txt)),
  "nav":len(re.findall(r'growlegends:navigation-open-v7119',txt)),
  "domwrite":len(re.findall(r'\.innerHTML\s*=|\.replaceChildren\s*\(',txt))
 }
 score=counts["global_render"]*8+counts["grow_render_assign"]*7+counts["care_assign"]*7+counts["mutation"]*8+counts["intervals"]*6+counts["timeouts"]*2+counts["raf"]*2+counts["nav"]*2+min(counts["domwrite"],10)
 if score:rows.append({"order":order,"src":src,"bytes":len(txt.encode()),"score":score,"counts":counts})
rows.sort(key=lambda x:-x["score"])
payload={"build":"V8.009-GROWROOM-POWER-AUDIT","scope_count":len(scope),"rows":rows}
(ROOT/"V8009_GROWROOM_POWER_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"scope_count":len(scope),"top":rows[:30]},ensure_ascii=False))
