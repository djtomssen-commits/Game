from pathlib import Path
import re,json

beta=Path('beta.html').read_text(encoding='utf-8')
symbols=['renderQuests','startQuest','claimQuest']

blocks=[]
for m in re.finditer(r'<script(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</script\s*>|<script(?P<srcattrs>[^>]*\bsrc=["\'][^"\']+["\'][^>]*)>\s*</script\s*>',beta,re.I):
    attrs=m.group('attrs') if m.group('attrs') is not None else m.group('srcattrs')
    body=m.group('body') or ''
    srcm=re.search(r'\bsrc=["\']([^"\']+)["\']',attrs or '',re.I)
    idm=re.search(r'\bid=["\']([^"\']+)["\']',attrs or '',re.I)
    src=srcm.group(1).split('?')[0] if srcm else None
    sid=idm.group(1) if idm else None
    origin='inline'
    path=None
    if src:
        p=Path(src)
        if not p.exists() or p.suffix.lower()!='.js':
            continue
        body=p.read_text(encoding='utf-8',errors='ignore')
        origin='external'
        path=p.as_posix()
    label=sid or path or f'inline@{m.start()}'
    hits={}
    for sym in symbols:
        writers=[]
        pats=[
          rf'window\.{sym}\s*=',
          rf'globalThis\.{sym}\s*=',
          rf'(?<![\w$.]){sym}\s*=',
          rf'function\s+{sym}\s*\(',
          rf'\b(?:const|let|var)\s+{sym}\s*=',
        ]
        for pat in pats:
            for q in re.finditer(pat,body):
                writers.append({
                  'line':body.count('\n',0,q.start())+1,
                  'match':q.group(0)
                })
        if writers:
            hits[sym]=writers
    if not hits:
        continue
    blocks.append({
      'document_position':m.start(),
      'origin':origin,
      'id':sid,
      'path':path,
      'label':label,
      'bytes':len(body.encode()),
      'writers':hits,
      'setTimeout':body.count('setTimeout'),
      'setInterval':body.count('setInterval'),
      'requestAnimationFrame':body.count('requestAnimationFrame'),
      'MutationObserver':body.count('MutationObserver'),
      'addEventListener':body.count('addEventListener'),
    })

syms={s:[] for s in symbols}
for b in blocks:
    for s in symbols:
        if s in b['writers']:
            syms[s].append({
              'document_position':b['document_position'],
              'origin':b['origin'],
              'id':b['id'],
              'path':b['path'],
              'label':b['label'],
              'bytes':b['bytes'],
              'writers':b['writers'][s],
              'setTimeout':b['setTimeout'],
              'setInterval':b['setInterval'],
              'requestAnimationFrame':b['requestAnimationFrame'],
              'MutationObserver':b['MutationObserver'],
              'addEventListener':b['addEventListener'],
            })

report={
 'build':'V8.009-QUEST-OWNER-AUDIT',
 'scope':'beta only',
 'symbols':syms,
 'last_writer':{s:(syms[s][-1] if syms[s] else None) for s in symbols},
 'writer_counts':{s:len(syms[s]) for s in symbols},
}
Path('V8009_QUEST_OWNER_AUDIT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({
 'writer_counts':report['writer_counts'],
 'last_writer':{k:(v and v['label']) for k,v in report['last_writer'].items()},
 'tails':{k:[x['label'] for x in v[-12:]] for k,v in syms.items()}
},ensure_ascii=False,indent=2))
