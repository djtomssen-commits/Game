from pathlib import Path
import re,json,collections
ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)

areas={
 "quest":["/quest/","quest"],
 "dungeon":["/dungeon/","dungeon"],
 "character":["/character/","character","inventory","material"],
 "guild":["/guild/","guild"],
 "tower":["/tower/","tower"],
 "shop":["/shop/","shop"],
 "grow":["/grow/","growroom","grow"],
 "pvp":["/pvp/","haze","nebel"],
 "world":["/world/","world"],
 "pets":["/pets/","pet"],
}
patterns={
 "render_override":re.compile(r'(?<![\w$.])render\s*=\s*(?:async\s*)?function\b'),
 "feature_render_assign":re.compile(r'\b(?:renderShop|renderQuests|renderInventory|v065RenderWorld|v067OpenDungeon|v204Render|v214Render|v247Render|v492Render|v686Render)\s*='),
 "raf":re.compile(r'requestAnimationFrame\s*\('),
 "timeout":re.compile(r'setTimeout\s*\('),
 "interval":re.compile(r'setInterval\s*\('),
 "mutation":re.compile(r'new\s+MutationObserver\b'),
 "resize":re.compile(r'new\s+ResizeObserver\b'),
 "nav":re.compile(r'growlegends:navigation-open-v7119'),
 "dom_write":re.compile(r'\.innerHTML\s*=|\.replaceChildren\s*\('),
}
rows=[]
for order,src in enumerate(srcs):
 p=ROOT/src
 if not p.exists() or p.suffix.lower()!=".js": continue
 txt=p.read_text(encoding="utf-8",errors="ignore")
 low=src.lower()
 matched=[]
 for area,keys in areas.items():
  if any(k in low for k in keys): matched.append(area)
 if not matched: continue
 counts={k:len(v.findall(txt)) for k,v in patterns.items()}
 score=(
   counts["render_override"]*8+counts["feature_render_assign"]*6+
   counts["mutation"]*8+counts["resize"]*6+counts["interval"]*6+
   counts["raf"]*3+counts["timeout"]*2+counts["nav"]*2+
   min(counts["dom_write"],10)
 )
 if score:
  rows.append({"order":order,"src":src,"areas":matched,"bytes":len(txt.encode()),"score":score,"counts":counts})
rows.sort(key=lambda x:(-x["score"],x["order"]))
summary={}
for area in areas:
 items=[r for r in rows if area in r["areas"]]
 summary[area]={
   "script_count":len(items),
   "score":sum(r["score"] for r in items),
   "render_overrides":sum(r["counts"]["render_override"] for r in items),
   "feature_render_assigns":sum(r["counts"]["feature_render_assign"] for r in items),
   "raf":sum(r["counts"]["raf"] for r in items),
   "timeouts":sum(r["counts"]["timeout"] for r in items),
   "intervals":sum(r["counts"]["interval"] for r in items),
   "mutation":sum(r["counts"]["mutation"] for r in items),
   "resize":sum(r["counts"]["resize"] for r in items),
   "nav":sum(r["counts"]["nav"] for r in items),
   "top":items[:20]
 }
payload={"build":"V8.009-SYSTEM-LIFECYCLE-HOTSPOT-AUDIT","external_script_count":len(srcs),"summary":summary,"top_global":rows[:80]}
(ROOT/"V8009_SYSTEM_LIFECYCLE_HOTSPOT_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"external_script_count":len(srcs),"summary":{k:{kk:v for kk,v in val.items() if kk!="top"} for k,val in summary.items()},"top":[{"src":r["src"],"score":r["score"],"areas":r["areas"],"counts":r["counts"]} for r in rows[:30]]},ensure_ascii=False))
