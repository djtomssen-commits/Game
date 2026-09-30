from pathlib import Path
import re,json

beta=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
ids=[
 'v446-global-combat-power-authority',
 'v652-player-profile-redesign-js',
 'v655-player-profile-load-fix-js',
 'v7137-shift-frame-client',
 'v6338-central-title-system-js',
]
out={}
for sid in ids:
    m=re.search(r"""<script[^>]*\\bid=["']"""+re.escape(sid)+r"""["'][^>]*>(?P<body>[\\s\\S]*?)</script\\s*>""",beta,re.I)
    if not m:
        out[sid]={'found':False};continue
    body=m.group('body')
    out[sid]={'found':True,'bytes':len(body.encode()),'body':body}
Path('V8009_PVP_HALL_PROFILE_CHAIN.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:{'found':v['found'],'bytes':v.get('bytes')} for k,v in out.items()},ensure_ascii=False,indent=2))
