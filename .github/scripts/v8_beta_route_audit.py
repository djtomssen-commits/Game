from pathlib import Path
import hashlib,json,re
out={}
for name in ("index.html","beta.html","tester.html"):
    p=Path(name)
    s=p.read_text(encoding="utf-8",errors="replace")
    out[name]={
      "bytes":p.stat().st_size,
      "sha256":hashlib.sha256(s.encode("utf-8")).hexdigest(),
      "release_channels":re.findall(r"GROW_RELEASE_CHANNEL\s*=\s*['\"]([^'\"]+)",s),
      "mentions_beta_html":"beta.html" in s,
      "mentions_tester_html":"tester.html" in s,
      "mentions_server1":len(re.findall(r"server1",s,re.I)),
      "mentions_beta":len(re.findall(r"\bbeta\b",s,re.I)),
      "location_redirects":re.findall(r"(?:location(?:\.href)?|location\.replace)\s*(?:=|\()\s*['\"]([^'\"]+)",s)[:20],
      "title":(re.search(r"<title[^>]*>([\s\S]*?)</title>",s,re.I).group(1).strip() if re.search(r"<title[^>]*>([\s\S]*?)</title>",s,re.I) else None),
      "head_excerpt":s[:1000],
    }
Path("V8_BETA_ROUTE_AUDIT.json").write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({k:{x:v[x] for x in ("bytes","release_channels","mentions_beta_html","mentions_tester_html","mentions_server1","mentions_beta","location_redirects","title")} for k,v in out.items()},ensure_ascii=False,indent=2))
