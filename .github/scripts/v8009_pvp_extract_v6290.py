from pathlib import Path
import re,json
beta=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
sid='v6290-performance-hall-fix-js'
m=re.search(r'<script[^>]*\bid=["\']'+re.escape(sid)+r'["\'][^>]*>(?P<body>[\s\S]*?)</script\s*>',beta,re.I)
if not m:
    raise SystemExit('v6290 block not found')
body=m.group('body')
out={'id':sid,'bytes':len(body.encode()),'body':body}
Path('V8009_PVP_V6290_BODY.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(body)
