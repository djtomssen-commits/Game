from pathlib import Path
import re, json

beta=Path('beta.html').read_text(encoding='utf-8')
ids=['v467-d2-direct-style','v467-d2-direct-script','v468-dungeon-master-style','v473-direct-master-assets-style']
out=[]
for sid in ids:
    m=re.search(r'<(?P<tag>script|style)[^>]*\bid=["\']'+re.escape(sid)+r'["\'][^>]*>(?P<body>[\s\S]*?)</(?P=tag)\s*>',beta,re.I)
    if not m:
        out.append({'id':sid,'found':False})
        continue
    body=m.group('body')
    out.append({
      'id':sid,
      'found':True,
      'tag':m.group('tag').lower(),
      'bytes':len(body.encode()),
      'body':body,
      'mentions':{
        'applyD2':body.count('applyD2'),
        'renderDungeon':body.count('renderDungeon'),
        'v261':body.count('v261'),
        'background':body.lower().count('background'),
        'setTimeout':body.count('setTimeout'),
        'MutationObserver':body.count('MutationObserver'),
      }
    })
Path('V8009_DUNGEON_D5_D2_SPECIFIC_AUDIT.json').write_text(json.dumps({'build':'V8.009-DUNGEON-D5-D2-SPECIFIC-AUDIT','blocks':out},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for item in out:
    print('\n===== '+item['id']+' =====')
    print(item.get('body',''))
