from pathlib import Path
import re,json
beta=Path('beta.html').read_text(encoding='utf-8')
sid='v426-pos-fix'
m=re.search(r'<script[^>]*\bid=["\']'+re.escape(sid)+r'["\'][^>]*>(?P<body>[\s\S]*?)</script\s*>',beta,re.I)
if not m: raise SystemExit('v426-pos-fix not found')
body=m.group('body')
Path('V8009_DUNGEON_SPRINT2_V426_POS.json').write_text(json.dumps({'id':sid,'bytes':len(body.encode()),'body':body},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(body)
