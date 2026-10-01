from pathlib import Path
import re,json,hashlib,collections
p=Path("beta.html")
s=p.read_text(encoding="utf-8")
scripts=[]
for i,m in enumerate(re.finditer(r'<script\b([^>]*)>([\s\S]*?)</script>',s,re.I),1):
    attrs,body=m.group(1),m.group(2)
    srcm=re.search(r'\bsrc\s*=\s*["\']([^"\']+)["\']',attrs,re.I)
    idm=re.search(r'\bid\s*=\s*["\']([^"\']+)["\']',attrs,re.I)
    typm=re.search(r'\btype\s*=\s*["\']([^"\']+)["\']',attrs,re.I)
    scripts.append({"index":i,"id":idm.group(1) if idm else None,"src":srcm.group(1) if srcm else None,"type":typm.group(1) if typm else None,"inline_bytes":len(body.encode()) if not srcm else 0})
styles=[]
for i,m in enumerate(re.finditer(r'<style\b([^>]*)>([\s\S]*?)</style>',s,re.I),1):
    attrs,body=m.group(1),m.group(2)
    idm=re.search(r'\bid\s*=\s*["\']([^"\']+)["\']',attrs,re.I)
    urls=re.findall(r'url\(([^)]+)\)',body,re.I)
    styles.append({"index":i,"id":idm.group(1) if idm else None,"bytes":len(body.encode()),"url_count":len(urls),"urls":urls[:10]})
srcs=[x["src"] for x in scripts if x["src"]]
dups={k:v for k,v in collections.Counter(srcs).items() if v>1}
handlers=re.findall(r'\s(onclick|onchange|onsubmit|oninput|onload|onerror|onkeydown|onkeyup|ontouchstart|ontouchend)\s*=\s*["\']',s,re.I)
payload={
"build":"V8.009-BETA-POST-EXTRACTION-REST-AUDIT",
"beta_bytes":len(s.encode()),
"scripts_total":len(scripts),
"external_scripts":sum(1 for x in scripts if x["src"]),
"remaining_inline_scripts":[x for x in scripts if not x["src"] and x["inline_bytes"]>0],
"style_blocks_total":len(styles),
"style_bytes_total":sum(x["bytes"] for x in styles),
"style_blocks_with_urls":[x for x in styles if x["url_count"]],
"duplicate_script_srcs":dups,
"inline_handler_count":len(handlers),
"inline_handler_types":dict(collections.Counter(x.lower() for x in handlers)),
}
Path("V8009_BETA_POST_EXTRACTION_REST_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(payload,ensure_ascii=False))
