from pathlib import Path
import re,json

ROOT=Path(".")
BETA=ROOT/"beta.html"
beta=BETA.read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)

loaded=[]
for src in srcs:
    p=ROOT/src
    if p.exists() and p.suffix.lower()==".js":
        try: loaded.append((src,p.read_text(encoding="utf-8",errors="ignore")))
        except: pass

def strip_comments(txt):
    txt=re.sub(r'/\*[\s\S]*?\*/','',txt)
    txt=re.sub(r'(^|\n)\s*//[^\n]*','\1',txt)
    return re.sub(r'\s+','',txt)

comment_only=[]
tiny_delegates=[]
for src,txt in loaded:
    compact=strip_comments(txt)
    if not compact:
        comment_only.append({"src":src,"bytes":len(txt.encode("utf-8"))})
        continue
    if len(txt.encode("utf-8"))>600:
        continue
    # candidate tiny delegate: at most one exported function/assignment, no timers/listeners/observers/storage/fetch
    dangerous=any(tok in txt for tok in ["addEventListener","setTimeout","setInterval","MutationObserver","ResizeObserver","localStorage","sessionStorage","fetch(","persist(","supabase"])
    if dangerous:
        continue
    names=re.findall(r'window\.([A-Za-z0-9_$]+)\s*=',txt)
    if not names:
        continue
    refs={}
    for name in names:
        hits=[]
        if name in beta: hits.append("beta.html")
        for other,otxt in loaded:
            if other==src: continue
            if name in otxt: hits.append(other)
        refs[name]=hits
    if all(not v for v in refs.values()):
        tiny_delegates.append({"src":src,"bytes":len(txt.encode("utf-8")),"exports":names,"refs":refs,"content":txt[:700]})

payload={
 "build":"V8.009-RUNTIME-NOOP-DELEGATE-SWEEP",
 "loaded_script_count":len(loaded),
 "comment_only_count":len(comment_only),
 "comment_only":comment_only,
 "tiny_unreferenced_delegate_count":len(tiny_delegates),
 "tiny_unreferenced_delegates":tiny_delegates
}
(ROOT/"V8009_RUNTIME_NOOP_DELEGATE_SWEEP.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({
 "loaded_script_count":len(loaded),
 "comment_only_count":len(comment_only),
 "comment_only":comment_only,
 "tiny_unreferenced_delegate_count":len(tiny_delegates),
 "tiny_unreferenced_delegates":[{"src":x["src"],"bytes":x["bytes"],"exports":x["exports"]} for x in tiny_delegates]
},ensure_ascii=False))
