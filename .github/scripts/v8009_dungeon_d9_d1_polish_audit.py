from pathlib import Path
import re, json

beta=Path('beta.html').read_text(encoding='utf-8')
ids=[
 'v454-d1-feinschliff-script',
 'v458-d1-road-and-sign-final',
 'v459-d1-right-side-thumb-final-script',
 'v460-d1-thumb-owner-fix-script',
 'v461-d1-node9-collision-fix-script',
 'v463-d1-screenshot-polish-script',
]
out={}
for sid in ids:
    m=re.search(r'<script[^>]*\bid=["\']'+re.escape(sid)+r'["\'][^>]*>(?P<body>[\s\S]*?)</script\s*>',beta,re.I)
    if not m:
        out[sid]={'found':False}
        continue
    body=m.group('body')
    lines=body.splitlines()
    refs=[]
    for i,line in enumerate(lines):
        if any(n in line for n in ('v426RenderDetail','v251RenderDetail','v244RenderSelectedDungeonMap','renderDungeon','setTimeout','requestAnimationFrame','addEventListener')):
            refs.append({'line':i+1,'text':line.strip()[:1200]})
    out[sid]={
      'found':True,
      'bytes':len(body.encode()),
      'setTimeout_count':body.count('setTimeout'),
      'requestAnimationFrame_count':body.count('requestAnimationFrame'),
      'addEventListener_count':body.count('addEventListener'),
      'MutationObserver_count':body.count('MutationObserver'),
      'refs':refs,
      'body':body
    }
Path('V8009_DUNGEON_D9_D1_POLISH_AUDIT.json').write_text(json.dumps({'build':'V8.009-DUNGEON-D9-D1-POLISH-AUDIT','scripts':out},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))
