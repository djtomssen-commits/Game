from pathlib import Path
import re,json

beta=Path('beta.html').read_text(encoding='utf-8')

renderer_names=[
 'renderDungeon','v251RenderDetail','v244RenderSelectedDungeonMap','v064RenderMap',
 'v261RenderDetail','v251RenderWorld','v426RenderDetail','v427RenderDetail',
]
dungeon_needles=[
 'dungeonMapCard','.v261-','v261-','dungeonFighter','enemyFighter','playerFighter',
 'gl-dungeon-','growlegends:dungeon','dungeon-detail','dungeon map','Dungeon',
]

def id_from(attrs,prefix,pos):
    m=re.search(r'\bid=["\']([^"\']+)["\']',attrs,re.I)
    return m.group(1) if m else f'{prefix}@{pos}'

def metrics(body):
    return {
      'bytes':len(body.encode()),
      'setTimeout':body.count('setTimeout'),
      'setInterval':body.count('setInterval'),
      'requestAnimationFrame':body.count('requestAnimationFrame'),
      'addEventListener':body.count('addEventListener'),
      'MutationObserver':body.count('MutationObserver'),
      'render_refs':{n:body.count(n) for n in renderer_names if body.count(n)},
      'danger_signals':{
        'assign_renderDungeon':len(re.findall(r'(?:window\.)?renderDungeon\s*=',body)),
        'wrap_renderDungeon':len(re.findall(r'(?:const|let|var)\s+\w+\s*=\s*(?:window\.)?renderDungeon',body)),
        'assign_v251':len(re.findall(r'(?:window\.)?v251RenderDetail\s*=',body)),
        'assign_v244':len(re.findall(r'(?:window\.)?v244RenderSelectedDungeonMap\s*=',body)),
        'assign_v064':len(re.findall(r'(?:window\.)?v064RenderMap\s*=',body)),
        'assign_v261':len(re.findall(r'(?:window\.)?v261RenderDetail\s*=',body)),
      }
    }

scripts=[]
for m in re.finditer(r'<script(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</script\s*>',beta,re.I):
    attrs=m.group('attrs')
    if 'src=' in attrs.lower(): continue
    body=m.group('body')
    if not any(n.lower() in body.lower() for n in dungeon_needles): continue
    info={'origin':'inline-script','id':id_from(attrs,'script',m.start()),'position':m.start(),**metrics(body)}
    lines=[]
    for i,line in enumerate(body.splitlines()):
        if (
          any(n in line for n in renderer_names)
          or 'setTimeout' in line or 'setInterval' in line or 'MutationObserver' in line
          or 'addEventListener' in line
        ):
            lines.append({'line':i+1,'text':line.strip()[:900]})
        if len(lines)>=40: break
    info['snippets']=lines
    scripts.append(info)

styles=[]
for m in re.finditer(r'<style(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</style\s*>',beta,re.I):
    attrs=m.group('attrs');body=m.group('body')
    if not any(n in body for n in ('#dungeonMapCard','.v261-','.v426-ref-d1','.gl-dungeon-')): continue
    styles.append({
      'origin':'inline-style',
      'id':id_from(attrs,'style',m.start()),
      'position':m.start(),
      'bytes':len(body.encode()),
      'selectors':len(re.findall(r'\{',body)),
      'd1':body.count('v426-ref-d1'),
      'v261':body.count('.v261-'),
      'gl':body.count('.gl-dungeon-'),
    })

external_js=[]
for src in re.findall(r'<script[^>]+src=["\']([^"\']+)["\']',beta,re.I):
    p=Path(src.split('?')[0])
    if not p.exists() or p.suffix.lower()!='.js': continue
    txt=p.read_text(encoding='utf-8',errors='ignore')
    if not any(n.lower() in txt.lower() for n in dungeon_needles): continue
    external_js.append({'origin':'external-js','path':p.as_posix(),**metrics(txt)})

external_css=[]
for href in re.findall(r'<link[^>]+href=["\']([^"\']+\.css(?:\?[^"\']*)?)["\']',beta,re.I):
    p=Path(href.split('?')[0])
    if not p.exists(): continue
    txt=p.read_text(encoding='utf-8',errors='ignore')
    if not any(n in txt for n in ('#dungeonMapCard','.v261-','.v426-ref-d1','.gl-dungeon-')): continue
    external_css.append({
      'origin':'external-css','path':p.as_posix(),'bytes':len(txt.encode()),
      'selectors':len(re.findall(r'\{',txt)),
      'd1':txt.count('v426-ref-d1'),'v261':txt.count('.v261-'),'gl':txt.count('.gl-dungeon-'),
    })

# Heuristic shortlist: active inline scripts that still monkey-patch render ownership
# or install delayed/observer-based Dungeon repaints.
shortlist=[]
for x in scripts:
    danger=sum(x['danger_signals'].values())
    delayed=x['setTimeout']+x['setInterval']+x['MutationObserver']
    if danger or (delayed and x['render_refs']):
        shortlist.append(x)

report={
 'build':'V8.009-DUNGEON-SPRINT-2-INVENTORY',
 'active_inline_dungeon_scripts':scripts,
 'active_inline_dungeon_styles':styles,
 'active_external_dungeon_js':external_js,
 'active_external_dungeon_css':external_css,
 'shortlist':shortlist,
 'counts':{
   'inline_scripts':len(scripts),
   'inline_styles':len(styles),
   'external_js':len(external_js),
   'external_css':len(external_css),
   'shortlist':len(shortlist),
 }
}
Path('V8009_DUNGEON_SPRINT2_INVENTORY.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({
 'counts':report['counts'],
 'shortlist':[{
   'id':x['id'],'bytes':x['bytes'],'timers':x['setTimeout'],'intervals':x['setInterval'],
   'raf':x['requestAnimationFrame'],'listeners':x['addEventListener'],'observer':x['MutationObserver'],
   'render_refs':x['render_refs'],'danger':x['danger_signals']
 } for x in shortlist]
},ensure_ascii=False,indent=2))
