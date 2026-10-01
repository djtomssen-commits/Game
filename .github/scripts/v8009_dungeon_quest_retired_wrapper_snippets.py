from pathlib import Path
import re,json

ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)
targets=["claimQuest","v233ClaimQuest","persist","v065RenderWorld","v067OpenDungeon","dungeonUnlocked"]
rows=[]
for src in srcs:
    if "/dungeon/" not in src and "/quest/" not in src and "legacy-extracted" not in src:
        continue
    p=ROOT/src
    if not p.exists() or p.suffix.lower()!=".js": continue
    txt=p.read_text(encoding="utf-8",errors="ignore")
    lines=txt.splitlines()
    for i,line in enumerate(lines):
        low=line.lower()
        if "retired" not in low and "superseded" not in low and "obsolete" not in low:
            continue
        lo=max(0,i-8); hi=min(len(lines),i+14)
        snippet="\n".join(f"{j+1}: {lines[j]}" for j in range(lo,hi))
        touched=[t for t in targets if t in snippet]
        if touched:
            rows.append({"src":src,"line":i+1,"touched":touched,"snippet":snippet})
payload={"build":"V8.009-DUNGEON-QUEST-RETIRED-WRAPPER-SNIPPETS","count":len(rows),"rows":rows}
(ROOT/"V8009_DUNGEON_QUEST_RETIRED_WRAPPER_SNIPPETS.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"count":len(rows),"rows":rows},ensure_ascii=False))
