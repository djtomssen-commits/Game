from pathlib import Path
import re,json
R=Path(".")
beta=(R/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)
scope=[s for s in srcs if any(x in s.lower() for x in ["/pvp/","/hall/","/profile/","haze","nebel"])]
rows=[]
for order,src in enumerate(scope):
 p=R/src.split("?",1)[0]
 if not p.exists() or p.suffix.lower()!=".js":continue
 txt=p.read_text(encoding="utf-8",errors="ignore")
 counts={
  "global_render":len(re.findall(r'(?<![\w$.])render\s*=\s*(?:async\s*)?function\b',txt)),
  "battle_assign":len(re.findall(r'\b(?:v209FinishBattle|v204\w+|fightPvp|startPvp|finishPvp)\s*=|window\.(?:v209FinishBattle|v204\w+)\s*=',txt)),
  "hall_assign":len(re.findall(r'\b(?:renderHall|v326\w+|v431\w+|v438\w+|v6145\w+)\s*=|window\.(?:renderHall|v326\w+|v431\w+|v438\w+|v6145\w+)\s*=',txt)),
  "profile_assign":len(re.findall(r'\b(?:v074OpenProfile|v652\w+|v655\w+)\s*=|window\.(?:v074OpenProfile|v652\w+|v655\w+)\s*=',txt)),
  "timeouts":len(re.findall(r'\bsetTimeout\s*\(',txt)),
  "intervals":len(re.findall(r'\bsetInterval\s*\(',txt)),
  "raf":len(re.findall(r'\brequestAnimationFrame\s*\(',txt)),
  "mutation":len(re.findall(r'new\s+MutationObserver\b',txt)),
  "nav":len(re.findall(r'growlegends:navigation-open-v7119',txt)),
  "domwrite":len(re.findall(r'\.innerHTML\s*=|\.replaceChildren\s*\(',txt))
 }
 score=counts["global_render"]*8+counts["battle_assign"]*8+counts["hall_assign"]*7+counts["profile_assign"]*7+counts["mutation"]*8+counts["intervals"]*6+counts["timeouts"]*2+counts["raf"]*2+counts["nav"]*2+min(counts["domwrite"],10)
 if score:rows.append({"order":order,"src":src,"bytes":len(txt.encode()),"score":score,"counts":counts})
rows.sort(key=lambda x:-x["score"])
payload={"build":"V8.009-PVP-HALL-POWER-AUDIT","scope_count":len(scope),"rows":rows}
(R/"V8009_PVP_HALL_POWER_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"scope_count":len(scope),"top":rows[:35]},ensure_ascii=False))
