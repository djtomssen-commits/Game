from pathlib import Path
import re,json
ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)
scope=[s for s in srcs if "/quest/" in s or "/shift/" in s or "quest" in s.lower() or "shift" in s.lower()]
rows=[]
for order,src in enumerate(scope):
 p=ROOT/src
 if not p.exists() or p.suffix.lower()!=".js": continue
 txt=p.read_text(encoding="utf-8",errors="ignore")
 counts={
  "global_render":len(re.findall(r'(?<![\w$.])render\s*=\s*(?:async\s*)?function\b',txt)),
  "quest_render_assign":len(re.findall(r'\b(?:renderQuests|v392RenderQuest|v7130Render|v7130RenderQuest|renderQuest)\w*\s*=|window\.v7130\w*\s*=',txt)),
  "claim_assign":len(re.findall(r'\b(?:claimQuest|v233ClaimQuest)\s*=|window\.(?:claimQuest|v233ClaimQuest)\s*=',txt)),
  "timeouts":len(re.findall(r'\bsetTimeout\s*\(',txt)),
  "intervals":len(re.findall(r'\bsetInterval\s*\(',txt)),
  "raf":len(re.findall(r'\brequestAnimationFrame\s*\(',txt)),
  "mutation":len(re.findall(r'new\s+MutationObserver\b',txt)),
  "nav":len(re.findall(r'growlegends:navigation-open-v7119',txt)),
  "domwrite":len(re.findall(r'\.innerHTML\s*=|\.replaceChildren\s*\(',txt))
 }
 score=counts["global_render"]*8+counts["quest_render_assign"]*7+counts["claim_assign"]*7+counts["mutation"]*8+counts["intervals"]*6+counts["timeouts"]*2+counts["raf"]*2+counts["nav"]*2+min(counts["domwrite"],10)
 if score:rows.append({"order":order,"src":src,"bytes":len(txt.encode()),"score":score,"counts":counts})
rows.sort(key=lambda x:-x["score"])
payload={"build":"V8.009-QUEST-SHIFT-POWER-AUDIT","scope_count":len(scope),"rows":rows}
(ROOT/"V8009_QUEST_SHIFT_POWER_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"scope_count":len(scope),"top":rows[:35]},ensure_ascii=False))
