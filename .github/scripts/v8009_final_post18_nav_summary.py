from pathlib import Path
import re
src=Path("beta.html").read_text(encoding="utf-8")
for m in re.finditer(r"v032Go\s*=\s*function|const\s+\w+\s*=\s*v032Go",src):
    i=m.start()
    pre=src[max(0,i-3500):i]
    # nearest script id
    ids=re.findall(r'<script[^>]*id="([^"]+)"',pre,re.I)
    sid=ids[-1] if ids else "unknown"
    ctx=src[max(0,i-450):i+900].replace("\n"," ")
    if "application/x-grow-legends-retired" in ctx: continue
    print("SCRIPT",sid,"INDEX",i)
    print(ctx)
    print("---")
