from pathlib import Path
import re,json
s=Path("beta.html").read_text(encoding="utf-8")
styles=[]
for i,m in enumerate(re.finditer(r'<style\b([^>]*)>([\s\S]*?)</style>',s,re.I),1):
    attrs,body=m.group(1),m.group(2)
    idm=re.search(r'\bid=["\']([^"\']+)["\']',attrs,re.I)
    styles.append({
      "index":i,
      "id":idm.group(1) if idm else None,
      "bytes":len(body.encode("utf-8")),
      "has_url":bool(re.search(r'url\s*\(',body,re.I)),
      "attrs":attrs.strip()
    })
payload={
 "build":"V8.009-MEGA32-POST-AUDIT",
 "beta_bytes":len(s.encode("utf-8")),
 "remaining_inline_style_count":len(styles),
 "remaining_inline_style_bytes":sum(x["bytes"] for x in styles),
 "remaining_styles":styles
}
Path("V8009_MEGA32_POST_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(payload,ensure_ascii=False))
