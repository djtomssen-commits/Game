from pathlib import Path
import re,json

beta=Path('beta.html').read_text(encoding='utf-8')
alias_names=('v426RenderDetail','v427RenderDetail')
style_needles=('v426-ref-d1','v454','v458','v459','v460','v461','v463')

def classify(line,name):
    s=line.strip()
    if re.search(r'(?:function\s+'+re.escape(name)+r'\b|(?:window\.)?'+re.escape(name)+r'\s*=)',s):
        return 'definition_or_assignment'
    if re.search(r'(?:window\.)?'+re.escape(name)+r'\s*\(',s):
        return 'call'
    return 'reference'

alias_hits=[]

# Active inline beta scripts.
for m in re.finditer(r'<script(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</script\s*>',beta,re.I):
    if 'src=' in m.group('attrs').lower(): continue
    body=m.group('body')
    if not any(n in body for n in alias_names): continue
    im=re.search(r'\bid=["\']([^"\']+)["\']',m.group('attrs'),re.I)
    sid=im.group(1) if im else f'inline@{m.start()}'
    for i,line in enumerate(body.splitlines()):
        for n in alias_names:
            if n in line:
                alias_hits.append({'origin':'beta-inline','script_id':sid,'path':'beta.html','name':n,'line':i+1,'kind':classify(line,n),'text':line.strip()[:1200]})

# Active external JS loaded by Beta.
srcs=set(re.findall(r'<script[^>]+src=["\']([^"\']+)["\']',beta,re.I))
for src in sorted(srcs):
    p=Path(src.split('?')[0])
    if not p.exists() or p.suffix.lower()!='.js': continue
    txt=p.read_text(encoding='utf-8',errors='ignore')
    if not any(n in txt for n in alias_names): continue
    for i,line in enumerate(txt.splitlines()):
        for n in alias_names:
            if n in line:
                alias_hits.append({'origin':'beta-external','script_id':'','path':p.as_posix(),'name':n,'line':i+1,'kind':classify(line,n),'text':line.strip()[:1200]})

# D1 styles active in beta, inline or external.
style_hits=[]
for m in re.finditer(r'<style(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</style\s*>',beta,re.I):
    body=m.group('body')
    if not any(n in body for n in style_needles): continue
    im=re.search(r'\bid=["\']([^"\']+)["\']',m.group('attrs'),re.I)
    sid=im.group(1) if im else f'inline-style@{m.start()}'
    matched=[n for n in style_needles if n in body]
    style_hits.append({'origin':'beta-inline-style','id':sid,'path':'beta.html','bytes':len(body.encode()),'needles':matched,'sample':'\n'.join([x for x in body.splitlines() if any(n in x for n in style_needles)][:80])[:12000]})

hrefs=set(re.findall(r'<link[^>]+href=["\']([^"\']+\.css(?:\?[^"\']*)?)["\']',beta,re.I))
for href in sorted(hrefs):
    p=Path(href.split('?')[0])
    if not p.exists(): continue
    txt=p.read_text(encoding='utf-8',errors='ignore')
    if not any(n in txt for n in style_needles): continue
    matched=[n for n in style_needles if n in txt]
    style_hits.append({'origin':'beta-external-css','id':'','path':p.as_posix(),'bytes':len(txt.encode()),'needles':matched,'sample':'\n'.join([x for x in txt.splitlines() if any(n in x for n in style_needles)][:80])[:12000]})

summary={}
for name in alias_names:
    rows=[x for x in alias_hits if x['name']==name]
    summary[name]={
      'calls':[x for x in rows if x['kind']=='call'],
      'definitions_or_assignments':[x for x in rows if x['kind']=='definition_or_assignment'],
      'references':[x for x in rows if x['kind']=='reference']
    }

report={
  'build':'V8.009-DUNGEON-D10-ALIAS-STYLE-AUDIT',
  'alias_summary':summary,
  'active_alias_hits':alias_hits,
  'active_d1_style_hits':style_hits
}
Path('V8009_DUNGEON_D10_ALIAS_STYLE_AUDIT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
