from pathlib import Path
import re,json
ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)
targets=["claimQuest","v233ClaimQuest","v065RenderWorld","v067OpenDungeon","dungeonUnlocked"]
mut={t:[] for t in targets}
def strip_comments(txt):
    txt=re.sub(r'/\*[\s\S]*?\*/','',txt)
    txt=re.sub(r'(^|\n)\s*//[^\n]*','\1',txt)
    return txt
for order,src in enumerate(srcs):
    p=ROOT/src
    if not p.exists() or p.suffix.lower()!=".js": continue
    try: txt=strip_comments(p.read_text(encoding="utf-8",errors="ignore"))
    except: continue
    for t in targets:
        pats=[
          rf'(?<![\w$.]){re.escape(t)}\s*=\s*(?:async\s*)?function\b',
          rf'(?<![\w$.]){re.escape(t)}\s*=\s*(?:async\s*)?\([^)]*\)\s*=>',
          rf'window\.{re.escape(t)}\s*=',
          rf'globalThis\.{re.escape(t)}\s*=',
          rf'(?<![\w$.]){re.escape(t)}\s*=\s*[A-Za-z_$][A-Za-z0-9_$]*\s*;',
        ]
        hits=[]
        for pat in pats:
            for m in re.finditer(pat,txt):
                line=txt.count("\n",0,m.start())+1
                hits.append({"line":line,"match":m.group(0)[:120]})
        if hits:
            mut[t].append({"order":order,"src":src,"hits":hits})
payload={"build":"V8.009-PRECISE-WRAPPER-MUTATION-AUDIT","external_script_count":len(srcs),"targets":mut,"counts":{k:len(v) for k,v in mut.items()}}
(ROOT/"V8009_PRECISE_WRAPPER_MUTATION_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"counts":payload["counts"],"targets":mut},ensure_ascii=False))
