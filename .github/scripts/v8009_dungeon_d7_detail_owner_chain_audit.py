from pathlib import Path
import re, json

names=['v426RenderDetail','v427RenderDetail','v430RenderDetail','v432RenderDetail']

def classify_line(line,name):
    s=line.strip()
    if re.search(r'(?:function\s+'+re.escape(name)+r'\b|(?:window\.)?'+re.escape(name)+r'\s*=)',s):
        return 'definition_or_assignment'
    if re.search(r'(?:window\.)?'+re.escape(name)+r'\s*\(',s):
        return 'call'
    return 'reference'

results=[]

# Inline Beta scripts with script IDs.
beta=Path('beta.html').read_text(encoding='utf-8')
script_re=re.compile(r'<script(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</script\s*>',re.I)
id_re=re.compile(r'\bid=["\']([^"\']+)["\']',re.I)
for m in script_re.finditer(beta):
    if 'src=' in m.group('attrs').lower(): continue
    body=m.group('body')
    if not any(n in body for n in names): continue
    im=id_re.search(m.group('attrs'))
    sid=im.group(1) if im else f'inline@{m.start()}'
    lines=body.splitlines()
    refs=[]
    for i,line in enumerate(lines):
        for n in names:
            if n in line:
                refs.append({
                    'name':n,
                    'line':i+1,
                    'kind':classify_line(line,n),
                    'text':line.strip()[:1200]
                })
    results.append({
      'origin':'beta-inline',
      'path':'beta.html',
      'script_id':sid,
      'bytes':len(body.encode()),
      'refs':refs,
      'timers':{
        'setTimeout':body.count('setTimeout'),
        'setInterval':body.count('setInterval'),
        'MutationObserver':body.count('MutationObserver')
      }
    })

# External JS files.
for p in sorted(Path('js').rglob('*.js')):
    txt=p.read_text(encoding='utf-8',errors='ignore')
    if not any(n in txt for n in names): continue
    refs=[]
    for i,line in enumerate(txt.splitlines()):
        for n in names:
            if n in line:
                refs.append({
                    'name':n,
                    'line':i+1,
                    'kind':classify_line(line,n),
                    'text':line.strip()[:1200]
                })
    results.append({
      'origin':'external-js',
      'path':p.as_posix(),
      'script_id':'',
      'bytes':len(txt.encode()),
      'refs':refs,
      'timers':{
        'setTimeout':txt.count('setTimeout'),
        'setInterval':txt.count('setInterval'),
        'MutationObserver':txt.count('MutationObserver')
      }
    })

summary={}
for n in names:
    defs=[];calls=[];refs=[]
    for r in results:
        for hit in r['refs']:
            if hit['name']!=n: continue
            item={'origin':r['origin'],'path':r['path'],'script_id':r['script_id'],'line':hit['line'],'text':hit['text']}
            if hit['kind']=='definition_or_assignment': defs.append(item)
            elif hit['kind']=='call': calls.append(item)
            else: refs.append(item)
    summary[n]={'definitions_or_assignments':defs,'calls':calls,'references':refs}

report={
  'build':'V8.009-DUNGEON-D7-DETAIL-OWNER-CHAIN-AUDIT',
  'names':names,
  'summary':summary,
  'blocks':results
}
Path('V8009_DUNGEON_D7_DETAIL_OWNER_CHAIN_AUDIT.json').write_text(
  json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'
)
print(json.dumps(report,ensure_ascii=False,indent=2))
