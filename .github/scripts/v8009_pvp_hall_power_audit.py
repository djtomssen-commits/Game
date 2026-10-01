from pathlib import Path
import re,json
R=Path(".")
beta=(R/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)
scope=[s for s in srcs if any(x in s.lower() for x in ["/pvp/","/hall/","/profile/"]) or "public-profile" in s.lower()]
rows=[]
for order,src in enumerate(scope):
 p=R/src.split("?")[0]
 if not p.exists() or p.suffix.lower()!=".js":continue
 txt=p.read_text(encoding="utf-8",errors="ignore")
 counts={
  "global_render":len(re.findall(r'(?<![\w$.])render\s*=\s*(?:async\s*)?function\b',txt)),
  "hall_assign":len(re.findall(r'\b(?:renderHall|v\d+RenderHall|v\d+LoadHall|openHall)\w*\s*=|window\.v\w*Hall\w*\s*=',txt)),
  "pvp_assign":len(re.findall(r'\b(?:startPvp|finishPvp|v\d+Pvp\w*|v\d+StartPvp|v\d+FinishPvp)\s*=|window\.v\w*Pvp\w*\s*=',txt,re.I)),
  "profile_assign":len(re.findall(r'\bv074OpenProfile\s*=|window\.v074OpenProfile\s*=|\bv\d+\w*Profile\w*\s*=',txt)),
  "timeouts":len(re.findall(r'\bsetTimeout\s*\(',txt)),
  "intervals":len(re.findall(r'\bsetInterval\s*\(',txt)),
  "raf":len(re.findall(r'\brequestAnimationFrame\s*\(',txt)),
  "mutation":len(re.findall(r'new\s+MutationObserver\b',txt)),
  "nav":len(re.findall(r'growlegends:navigation-open-v7119',txt)),
  "domwrite":len(re.findall(r'\.innerHTML\s*=|\.replaceChildren\s*\(',txt))
 }
 score=counts["global_render"]*8+counts["hall_assign"]*7+counts["pvp_assign"]*7+counts["profile_assign"]*6+counts["mutation"]*8+counts["intervals"]*6+counts["timeouts"]*2+counts["raf"]*2+counts["nav"]*2+min(counts["domwrite"],10)
 if score:rows.append({"order":order,"src":src,"score":score,"counts":counts,"bytes":len(txt.encode())})
rows.sort(key=lambda x:-x["score"])
payload={"build":"V8.009-PVP-HALL-POWER-AUDIT","scope_count":len(scope),"rows":rows}
(R/"V8009_PVP_HALL_POWER_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"scope_count":len(scope),"top":rows[:35]},ensure_ascii=False))
