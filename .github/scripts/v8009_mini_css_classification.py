from pathlib import Path
import re,json
files=sorted(Path(".").glob("v8009-extracted-*.css"))
mini=[]
for p in files:
    b=p.read_bytes()
    if len(b)>300: continue
    txt=b.decode("utf-8",errors="ignore")
    stripped=re.sub(r'/\*[\s\S]*?\*/','',txt)
    stripped=re.sub(r'\s+','',stripped)
    effective=bool(stripped)
    rule_blocks=len(re.findall(r'[^@][^{]+\{[^}]*\}',txt,re.S))
    at_rules=len(re.findall(r'@[a-zA-Z-]+',txt))
    mini.append({
      "path":p.as_posix(),
      "bytes":len(b),
      "effective_after_comment_strip":effective,
      "rule_blocks":rule_blocks,
      "at_rules":at_rules,
      "content":txt[:500]
    })
marker=[x for x in mini if not x["effective_after_comment_strip"]]
real=[x for x in mini if x["effective_after_comment_strip"]]
payload={
 "build":"V8.009-MINI-CSS-CLASSIFICATION",
 "mini_total":len(mini),
 "marker_comment_only":marker,
 "marker_comment_only_count":len(marker),
 "real_css":real,
 "real_css_count":len(real)
}
Path("V8009_MINI_CSS_CLASSIFICATION.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(payload,ensure_ascii=False))
