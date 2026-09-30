from pathlib import Path
import re,json
beta=Path('beta.html').read_text(encoding='utf-8')
ids=['v426-reference-owner','v427-d6-clean-script','v428-d6-final-owner','v429-d6-scenic-owner','v430-d6-10er-final-script','v432-d7-final-script']
out={}
for sid in ids:
    m=re.search(r'<script[^>]*\bid=["\']'+re.escape(sid)+r'["\'][^>]*>(?P<body>[\s\S]*?)</script\s*>',beta,re.I)
    if not m: out[sid]={'found':False}; continue
    body=m.group('body')
    out[sid]={'found':True,'bytes':len(body.encode()),'body':body}
Path('V8009_DUNGEON_D7_OWNER_BODIES.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))
