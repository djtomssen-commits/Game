from pathlib import Path
import re,json

beta=Path('beta.html').read_text(encoding='utf-8')

needles=[
 'quest','elite-quest','elite quest','questpool','renderquest','startquest',
 'completequest','questreward','questtimer','dampf','steam','mission',
]
strong=['quest','questpool','renderquest','startquest','completequest']

def sid(attrs,prefix,pos):
    m=re.search(r'\bid=["\']([^"\']+)["\']',attrs,re.I)
    return m.group(1) if m else f'{prefix}@{pos}'

def metrics(body):
    low=body.lower()
    funcs=sorted(set(re.findall(
      r'\b(?:function\s+|(?:const|let|var)\s+|window\.|globalThis\.)([A-Za-z_$][\w$]*(?:quest|mission)[\w$]*)',
      body,re.I)))
    assigns=[]
    for m in re.finditer(
      r'(?<![\w$])((?:window\.|globalThis\.)?[A-Za-z_$][\w$]*(?:quest|mission)[\w$]*)\s*=(?!=)',
      body,re.I):
        line=body.count('\n',0,m.start())+1
        assigns.append({'name':m.group(1),'line':line})
    return {
      'bytes':len(body.encode()),
      'setTimeout':body.count('setTimeout'),
      'setInterval':body.count('setInterval'),
      'requestAnimationFrame':body.count('requestAnimationFrame'),
      'addEventListener':body.count('addEventListener'),
      'MutationObserver':body.count('MutationObserver'),
      'functions':funcs[:120],
      'assignments':assigns[:120],
      'strong_hits':{n:low.count(n) for n in strong if low.count(n)},
      'all_hits':{n:low.count(n) for n in needles if low.count(n)},
    }

def relevant(id_,body):
    low=(id_+'\n'+body).lower()
    if any(n in low for n in strong):
        return True
    return 'quest' in low and any(x in low for x in ('timer','reward','dampf','steam','elite','guild','render','start','complete'))

scripts=[]
for m in re.finditer(r'<script(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</script\s*>',beta,re.I):
    attrs=m.group('attrs')
    if 'src=' in attrs.lower():
        continue
    body=m.group('body')
    id_=sid(attrs,'script',m.start())
    if not relevant(id_,body):
        continue
    info={'origin':'inline-script','id':id_,'position':m.start(),**metrics(body)}
    snippets=[]
    for i,line in enumerate(body.splitlines()):
        l=line.lower()
        if any(n in l for n in strong) or any(x in l for x in ('settimeout','setinterval','mutationobserver','addeventlistener')):
            snippets.append({'line':i+1,'text':line.strip()[:1200]})
        if len(snippets)>=120:
            break
    info['snippets']=snippets
    scripts.append(info)

styles=[]
for m in re.finditer(r'<style(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</style\s*>',beta,re.I):
    body=m.group('body')
    id_=sid(m.group('attrs'),'style',m.start())
    if not relevant(id_,body):
        continue
    styles.append({
      'origin':'inline-style','id':id_,'position':m.start(),'bytes':len(body.encode()),
      'rules':body.count('{'),
      'strong_hits':{n:body.lower().count(n) for n in strong if body.lower().count(n)}
    })

external_js=[]
for src in re.findall(r'<script[^>]+src=["\']([^"\']+)["\']',beta,re.I):
    p=Path(src.split('?')[0])
    if not p.exists() or p.suffix.lower()!='.js':
        continue
    txt=p.read_text(encoding='utf-8',errors='ignore')
    if not relevant(p.as_posix(),txt):
        continue
    external_js.append({'origin':'external-js','path':p.as_posix(),**metrics(txt)})

external_css=[]
for href in re.findall(r'<link[^>]+href=["\']([^"\']+\.css(?:\?[^"\']*)?)["\']',beta,re.I):
    p=Path(href.split('?')[0])
    if not p.exists():
        continue
    txt=p.read_text(encoding='utf-8',errors='ignore')
    if not relevant(p.as_posix(),txt):
        continue
    external_css.append({
      'origin':'external-css','path':p.as_posix(),'bytes':len(txt.encode()),
      'rules':txt.count('{'),
      'strong_hits':{n:txt.lower().count(n) for n in strong if txt.lower().count(n)}
    })

shortlist=[]
for x in scripts:
    score=0
    idl=x['id'].lower()
    if 'quest' in idl:
        score+=3
    if x['assignments']:
        score+=2
    if x['MutationObserver'] or x['setInterval']:
        score+=2
    if x['requestAnimationFrame'] or x['setTimeout']>=2:
        score+=1
    if x['addEventListener']>=2:
        score+=1
    if any(k in x['functions'] for k in ('renderQuest','startQuest','completeQuest')):
        score+=3
    if score>=4:
        shortlist.append({**x,'score':score})
shortlist.sort(key=lambda x:(-x['score'],-x['bytes']))

report={
 'build':'V8.009-QUEST-SPRINT-1-INVENTORY',
 'scope':'beta only',
 'rules':{
   'stable_untouched':True,
   'no_behavior_change':True,
   'inventory_only':True
 },
 'counts':{
   'inline_scripts':len(scripts),
   'inline_styles':len(styles),
   'external_js':len(external_js),
   'external_css':len(external_css),
   'shortlist':len(shortlist),
 },
 'inline_scripts':scripts,
 'inline_styles':styles,
 'external_js':external_js,
 'external_css':external_css,
 'shortlist':shortlist,
}
Path('V8009_QUEST_SPRINT1_INVENTORY.json').write_text(
    json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({
 'counts':report['counts'],
 'shortlist':[{
   'id':x['id'],'bytes':x['bytes'],'score':x['score'],
   'timeouts':x['setTimeout'],'intervals':x['setInterval'],
   'raf':x['requestAnimationFrame'],'listeners':x['addEventListener'],
   'observers':x['MutationObserver'],'functions':x['functions'][:30],
   'assignments':x['assignments'][:30],
 } for x in shortlist]
},ensure_ascii=False,indent=2))
