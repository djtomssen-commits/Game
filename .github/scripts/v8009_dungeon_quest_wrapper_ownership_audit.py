from pathlib import Path
import re,json

ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)

rows=[]
targets=("claimQuest","v233ClaimQuest","persist","v065RenderWorld","v067OpenDungeon","dungeonUnlocked","renderInventory")
for order,src in enumerate(srcs):
    if not ("/dungeon/" in src or "/quest/" in src or "legacy-extracted" in src):
        continue
    p=ROOT/src
    if not p.exists() or p.suffix.lower()!=".js": continue
    try: txt=p.read_text(encoding="utf-8",errors="ignore")
    except: continue
    touched=[]
    for name in targets:
        patterns=[
            rf'\b{name}\s*=\s*function',
            rf'window\.{name}\s*=',
            rf'const\s+\w+\s*=\s*{name}\b',
            rf'let\s+\w+\s*=\s*window\.{name}\b',
            rf'typeof\s+{name}\s*===',
            rf'typeof\s+window\.{name}\s*===',
        ]
        if any(re.search(pat,txt) for pat in patterns):
            touched.append(name)
    if not touched: continue
    flags={
      "canonical":bool(re.search(r'canonical|single .*owner|final .*owner|authority',txt,re.I)),
      "retired":bool(re.search(r'retired|superseded|obsolete',txt,re.I)),
      "wraps":bool(re.search(r'base\w*\s*=|const\s+\w*Base\w*\s*=|apply\(this,arguments\)',txt))
    }
    rows.append({"order":order,"src":src,"bytes":len(txt.encode()),"touched":touched,"flags":flags})

by_target={}
for t in targets:
    by_target[t]=[r for r in rows if t in r["touched"]]

payload={"build":"V8.009-DUNGEON-QUEST-WRAPPER-OWNERSHIP-AUDIT","targets":by_target,"rows":rows}
(ROOT/"V8009_DUNGEON_QUEST_WRAPPER_OWNERSHIP_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({t:[{"order":r["order"],"src":r["src"],"flags":r["flags"]} for r in rs] for t,rs in by_target.items()},ensure_ascii=False))
