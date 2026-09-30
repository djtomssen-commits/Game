from pathlib import Path
import re, json

html=Path('beta.html').read_text(encoding='utf-8')
tag_re=re.compile(r'<(?P<tag>script|style|link)\b(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</(?P=tag)\s*>|<link\b(?P<linkattrs>[^>]*)>',re.I)
id_re=re.compile(r'\bid=["\']([^"\']+)["\']',re.I)
src_re=re.compile(r'\b(?:src|href)=["\']([^"\']+)["\']',re.I)

canon='js/features/dungeon/beta/v8009-d2-visual-owner.js'
canon_pos=html.find(canon)
if canon_pos<0: raise RuntimeError('canonical visual owner include not found')

needles=(
  'dungeonMapCard','.v261-stage','.v261-bg','.v261-ring','.v261-node',
  'gl-dungeon-map-bg-img','background-image','backgroundImage',
  'v251RenderDetail','v260RenderDetail','v261RenderDetail',
  'v244RenderSelectedDungeonMap','v064RenderMap','renderDungeon'
)

items=[]
for m in tag_re.finditer(html):
    if m.start()<=canon_pos: continue
    tag=(m.group('tag') or 'link').lower()
    attrs=(m.group('attrs') or m.group('linkattrs') or '')
    body=m.group('body') or ''
    im=id_re.search(attrs); sm=src_re.search(attrs)
    ident=im.group(1) if im else ''
    src=sm.group(1) if sm else ''
    hay=(attrs+'\n'+body)
    hits={n:hay.count(n) for n in needles if hay.count(n)}
    if not hits: continue
    timers=sorted(set(int(x) for x in re.findall(r'setTimeout\s*\([\s\S]{0,500}?,\s*(\d{1,5})\s*\)',body)))
    items.append({
      'order':len(items),
      'absolute_pos':m.start(),
      'tag':tag,
      'id':ident,
      'src':src,
      'bytes':len(body.encode()),
      'hits':hits,
      'setTimeout_count':body.count('setTimeout'),
      'setInterval_count':body.count('setInterval'),
      'MutationObserver_count':body.count('MutationObserver'),
      'timers':timers,
      'snippet':'\n'.join([ln for ln in body.splitlines() if any(n in ln for n in needles)][:30])[:8000]
    })

external=[]
for p in sorted(Path('js').rglob('*.js')):
    txt=p.read_text(encoding='utf-8',errors='ignore')
    hits={n:txt.count(n) for n in needles if txt.count(n)}
    if not hits: continue
    if canon in p.as_posix(): continue
    external.append({
      'file':p.as_posix(),
      'hits':hits,
      'setTimeout_count':txt.count('setTimeout'),
      'setInterval_count':txt.count('setInterval'),
      'MutationObserver_count':txt.count('MutationObserver'),
      'timers':sorted(set(int(x) for x in re.findall(r'setTimeout\s*\([\s\S]{0,500}?,\s*(\d{1,5})\s*\)',txt))),
      'snippet':'\n'.join([ln for ln in txt.splitlines() if any(n in ln for n in needles)][:30])[:8000]
    })

report={
 'build':'V8.009-DUNGEON-D5-LAST-WRITER-AUDIT',
 'canonical_include_position':canon_pos,
 'later_inline_or_loaded_tags':items,
 'external_candidates':external
}
Path('V8009_DUNGEON_D5_LAST_WRITER_AUDIT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
