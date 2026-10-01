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

candidates=[]
for src,txt in loaded:
    if len(txt.encode("utf-8"))>900: continue
    bad=[
      "addEventListener","setTimeout","setInterval","requestAnimationFrame","MutationObserver","ResizeObserver",
      "localStorage","sessionStorage","fetch(","persist(","supabase","XMLHttpRequest","WebSocket",
      "appendChild","replaceChildren","innerHTML=","textContent=","classList.","style.","remove()",
      "s.","s[","s =","s=","claimQuest","v233ClaimQuest","render(","render=","window.render=",
      "dungeonUnlocked","v065RenderWorld","v067OpenDungeon","equip=","unequip="
    ]
    if any(x in txt for x in bad): continue
    # only assignments/function definitions on window/constants/IIFE; no obvious invocation of game functions
    exports=sorted(set(re.findall(r'window\.([A-Za-z_$][A-Za-z0-9_$]*)\s*=',txt)))
    if not exports: continue
    refs={}
    for name in exports:
        hits=[]
        if name in beta: hits.append("beta.html")
        for other,otxt in loaded:
            if other==src: continue
            if name in otxt: hits.append(other)
        refs[name]=hits
    if any(refs[n] for n in exports): continue
    # exclude likely config/contract globals even if currently unreferenced
    protected=any(k in src.lower() for k in [
      "bootstrap","version","quality-order","referral","contract","authority","policy","capabilit",
      "server","integrity","isolation","release"
    ])
    if protected: continue
    candidates.append({"src":src,"bytes":len(txt.encode("utf-8")),"exports":exports,"content":txt[:1200]})

payload={"build":"V8.009-PURE-UNUSED-DEFINITION-SWEEP","count":len(candidates),"candidates":candidates}
(ROOT/"V8009_PURE_UNUSED_DEFINITION_SWEEP.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"count":len(candidates),"candidates":[{"src":x["src"],"bytes":x["bytes"],"exports":x["exports"]} for x in candidates]},ensure_ascii=False))
