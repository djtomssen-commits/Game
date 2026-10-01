from pathlib import Path
import re,json
ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)
guild=[s for s in srcs if "/guild/" in s or "guild" in s.lower()]
rows=[]
for order,src in enumerate(guild):
 p=ROOT/src
 if not p.exists() or p.suffix.lower()!=".js": continue
 txt=p.read_text(encoding="utf-8",errors="ignore")
 counts={
  "renderGuild_assign":len(re.findall(r'\bv254RenderGuild\s*=|window\.v254RenderGuild\s*=',txt)),
  "renderBoss_assign":len(re.findall(r'\bv255RenderBoss\s*=|window\.v255RenderBoss\s*=',txt)),
  "loadBoss_assign":len(re.findall(r'\bv255LoadBoss\s*=|window\.v255LoadBoss\s*=',txt)),
  "war_assign":len(re.findall(r'\bv262(?:Render|Load|Claim|Declare)\w*\s*=|window\.v262\w*\s*=',txt)),
  "tab_hooks":len(re.findall(r'data-v254-tab',txt)),
  "timeouts":len(re.findall(r'\bsetTimeout\s*\(',txt)),
  "intervals":len(re.findall(r'\bsetInterval\s*\(',txt)),
  "raf":len(re.findall(r'\brequestAnimationFrame\s*\(',txt)),
  "mutation":len(re.findall(r'new\s+MutationObserver\b',txt)),
  "global_render":len(re.findall(r'(?<![\w$.])render\s*=\s*(?:async\s*)?function\b',txt))
 }
 score=counts["renderGuild_assign"]*8+counts["renderBoss_assign"]*8+counts["loadBoss_assign"]*8+counts["war_assign"]*6+counts["intervals"]*6+counts["mutation"]*8+counts["timeouts"]*2+counts["raf"]*2+counts["tab_hooks"]
 if score: rows.append({"order":order,"src":src,"bytes":len(txt.encode()),"score":score,"counts":counts})
rows.sort(key=lambda x:-x["score"])
payload={"build":"V8.009-GUILD-POWER-AUDIT","guild_script_count":len(guild),"rows":rows}
(ROOT/"V8009_GUILD_POWER_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"guild_script_count":len(guild),"top":rows[:30]},ensure_ascii=False))
