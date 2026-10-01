from pathlib import Path
import re,json
ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)
areas=("quest","character","worldboss","world")
rows=[]
for order,src in enumerate(srcs):
    low=src.lower()
    if not any(f"/{a}/" in low for a in areas): continue
    p=ROOT/src
    if not p.exists() or p.suffix.lower()!=".js": continue
    txt=p.read_text(encoding="utf-8",errors="ignore")
    for m in re.finditer(r'(?<![\w$.])render\s*=\s*(?:async\s*)?function\s*\([^)]*\)\s*\{',txt):
        start=m.start()
        brace=txt.find("{",m.start())
        depth=0; end=None
        for i in range(brace,len(txt)):
            if txt[i]=="{": depth+=1
            elif txt[i]=="}":
                depth-=1
                if depth==0:
                    end=i+1;break
        snippet=txt[max(0,start-350):min(len(txt),(end or start+1200)+350)]
        body=txt[brace+1:(end-1 if end else min(len(txt),brace+1500))]
        risky=any(k in body for k in ["s.","persist(","localStorage","fetch(","supabase","gold","harz","xp","inventory.push","equipment","quest","dungeon","guild","worldboss"])
        rows.append({"order":order,"src":src,"line":txt.count("\n",0,start)+1,"bytes":len(txt.encode()),"risky":risky,"snippet":snippet})
payload={"build":"V8.009-PRESENTATION-RENDER-WRAPPER-AUDIT","count":len(rows),"rows":rows}
(ROOT/"V8009_PRESENTATION_RENDER_WRAPPER_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"count":len(rows),"rows":[{"src":r["src"],"line":r["line"],"risky":r["risky"]} for r in rows]},ensure_ascii=False))
