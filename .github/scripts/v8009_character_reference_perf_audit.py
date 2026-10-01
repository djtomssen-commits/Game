from pathlib import Path
import re,json
ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)
loaded=[]
for src in srcs:
    p=ROOT/src
    if p.exists() and p.suffix.lower()==".js":
        try: loaded.append((src,p.read_text(encoding="utf-8",errors="ignore")))
        except: pass

delegates={
"js/features/legacy-extracted/beta/v517-heldenquartier-reference-finish-js.js":["v517ApplyHero"],
"js/features/legacy-extracted/beta/v519-heldenquartier-reference-alignment-js.js":["v519ApplyHero"],
"js/features/legacy-extracted/beta/v521-heldenquartier-reference-frame-js.js":["v521ApplyHero"],
}
rows=[]
for path,names in delegates.items():
    refs={}
    for name in names:
        hits=[]
        if name in beta: hits.append("beta.html")
        for q,txt in loaded:
            if q==path: continue
            if name in txt: hits.append(q)
        refs[name]=hits
    rows.append({"path":path,"runtime_references":refs,"removable":all(not v for v in refs.values())})

perf=[]
for src,txt in loaded:
    low=src.lower()
    if not any(k in low for k in ["character","material","heldenquartier","inventory"]): continue
    perf.append({
      "src":src,
      "bytes":len(txt.encode("utf-8")),
      "requestAnimationFrame":len(re.findall(r'\brequestAnimationFrame\s*\(',txt)),
      "setTimeout":len(re.findall(r'\bsetTimeout\s*\(',txt)),
      "setInterval":len(re.findall(r'\bsetInterval\s*\(',txt)),
      "MutationObserver":len(re.findall(r'\bMutationObserver\b',txt)),
      "ResizeObserver":len(re.findall(r'\bResizeObserver\b',txt)),
      "scrollListeners":len(re.findall(r'addEventListener\s*\(\s*["\'](?:scroll|touchmove)["\']',txt,re.I)),
      "clickListeners":len(re.findall(r'addEventListener\s*\(\s*["\']click["\']',txt,re.I)),
      "navigationHooks":txt.count("growlegends:navigation-open-v7119")
    })
perf.sort(key=lambda x:-(x["requestAnimationFrame"]+x["setTimeout"]+3*x["setInterval"]+5*x["MutationObserver"]+5*x["ResizeObserver"]+5*x["scrollListeners"]))

payload={
 "build":"V8.009-CHARACTER-REFERENCE-AND-PERF-AUDIT",
 "delegate_rows":rows,
 "removable_delegates":[x["path"] for x in rows if x["removable"]],
 "character_perf":perf,
 "loaded_character_script_count":len(perf)
}
(ROOT/"V8009_CHARACTER_REFERENCE_AND_PERF_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({
 "removable_delegates":payload["removable_delegates"],
 "loaded_character_script_count":len(perf),
 "top_perf":perf[:20]
},ensure_ascii=False))
