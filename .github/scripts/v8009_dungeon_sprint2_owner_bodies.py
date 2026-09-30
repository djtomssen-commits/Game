from pathlib import Path
import re,json
beta=Path('beta.html').read_text(encoding='utf-8')
ids=[
 'v4225-final-10er-owner',
 'v446-dungeon-runtime-root-fix',
 'v447-d9-preview-button-restore',
 'v494-production-dungeon-fix-script',
 'v585-dungeon-safe-owner-core',
 'v4165-dungeon-key-live-battle-index-fix',
 'v458-key-live-unlock',
 'v467-hard-live-dungeon-key-authority',
 'v482-dungeon-paid-timer-owner',
 'v7051-atomic-dungeon-receipt-client',
]
out={}
for sid in ids:
    m=re.search(r'<script[^>]*\bid=["\']'+re.escape(sid)+r'["\'][^>]*>(?P<body>[\s\S]*?)</script\s*>',beta,re.I)
    if not m:
        out[sid]={'found':False};continue
    body=m.group('body')
    out[sid]={
      'found':True,
      'bytes':len(body.encode()),
      'body':body,
    }
Path('V8009_DUNGEON_SPRINT2_OWNER_BODIES.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:{'found':v['found'],'bytes':v.get('bytes')} for k,v in out.items()},ensure_ascii=False,indent=2))
