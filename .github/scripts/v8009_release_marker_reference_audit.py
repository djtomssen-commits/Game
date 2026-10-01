from pathlib import Path
import json

ROOT=Path(".")
markers={
"js/features/legacy-extracted/beta/v7096-release-marker.js":["__V7096_RELEASE_FEATURE__"],
"js/features/legacy-extracted/beta/v7099-release-marker.js":["__V7099_COMBAT_AUTHORITY__"],
"js/features/legacy-extracted/beta/v7109-release-marker.js":["__V7109_HOTFIX__"],
"js/features/legacy-extracted/beta/v7110-release-marker.js":["__V7110_HOTFIX__"],
"js/features/legacy-extracted/beta/v7111-release-marker.js":["__V7111_HOTFIX__"],
"js/features/legacy-extracted/beta/v7113-release-marker.js":["__GROW_LEGENDS_RELEASE__","__V7113_CLEANUP__"],
"js/features/legacy-extracted/beta/v7114-release-marker.js":["__GROW_LEGENDS_RELEASE__","__V7114_GOLD_SHOP_RELEASE__","__V7116_GOLD_SHOP_REBALANCE__","__V7115_GOLD_EVENT_BONUS__"],
"js/features/legacy-extracted/beta/v7117-release-marker.js":["__GROW_LEGENDS_RELEASE__","__V7117_DEALER_HUB_RELEASE__","__V7117_GOLD_SHOP_PRICES__"],
"js/features/legacy-extracted/beta/v7159-release-marker.js":["__V7159_RELEASE__"],
"js/features/legacy-extracted/beta/v7160-release-marker.js":["__V7160_RELEASE__"],
"js/features/legacy-extracted/beta/v7161-release-marker.js":["__V7161_RELEASE__"],
}
text_files=[]
for p in ROOT.rglob("*"):
    if not p.is_file(): continue
    if p.suffix.lower() not in {".js",".mjs",".html",".css",".json",".md"}: continue
    try:text_files.append((p.as_posix(),p.read_text(encoding="utf-8",errors="ignore")))
    except:pass

rows=[]
removable=[]
for path,names in markers.items():
    external={}
    for name in names:
        hits=[]
        for q,txt in text_files:
            if q==path: continue
            if name in txt: hits.append(q)
        external[name]=hits
    can_remove=all(not v for v in external.values())
    rows.append({"path":path,"globals":names,"external_references":external,"removable":can_remove})
    if can_remove: removable.append(path)

payload={"build":"V8.009-RELEASE-MARKER-REFERENCE-AUDIT","rows":rows,"removable":removable,"removable_count":len(removable)}
(ROOT/"V8009_RELEASE_MARKER_REFERENCE_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(payload,ensure_ascii=False))
