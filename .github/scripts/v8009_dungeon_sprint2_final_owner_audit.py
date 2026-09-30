from pathlib import Path
import re,json

beta=Path('beta.html').read_text(encoding='utf-8')
names=['renderDungeon','v251RenderDetail','v244RenderSelectedDungeonMap','v064RenderMap','v261RenderDetail']
known_critical={
 'v246-dungeon-final-fight-reward-fix':'fight/reward owner',
 'v247-dungeon-reward-modal-core':'reward modal owner',
 'v428-dungeon-rebalance':'balance/repaint compatibility',
 'v458-key-live-unlock':'key live unlock',
 'v467-hard-live-dungeon-key-authority':'key authority',
 'v482-dungeon-paid-timer-owner':'paid/free timer ownership',
 'v494-production-dungeon-fix-script':'production live battle entry',
 'v497-dungeon-key-immediate-live-unlock':'key live repaint',
 'v7051-atomic-dungeon-receipt-client':'server receipt authority',
 'v4165-dungeon-key-live-battle-index-fix':'key/battle index authority',
}
retired_expected={
 'v4225-final-10er-owner',
 'v447-d9-preview-button-restore',
}

def sid(attrs,pos):
    m=re.search(r'\bid=["\']([^"\']+)["\']',attrs,re.I)
    return m.group(1) if m else f'inline@{pos}'

def assignments(body):
    out=[]
    pats={
      'renderDungeon':r'(?<![\w$])(?:window\.)?renderDungeon\s*=',
      'v251RenderDetail':r'(?<![\w$])(?:window\.)?v251RenderDetail\s*=',
      'v244RenderSelectedDungeonMap':r'(?<![\w$])(?:window\.)?v244RenderSelectedDungeonMap\s*=',
      'v064RenderMap':r'(?<![\w$])(?:window\.)?v064RenderMap\s*=',
      'v261RenderDetail':r'(?<![\w$])(?:window\.)?v261RenderDetail\s*=',
    }
    lines=body.splitlines()
    for name,pat in pats.items():
        rx=re.compile(pat)
        for i,line in enumerate(lines):
            if rx.search(line):
                out.append({'name':name,'line':i+1,'text':line.strip()[:1200]})
    return out

owners=[]
for m in re.finditer(r'<script(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</script\s*>',beta,re.I):
    attrs=m.group('attrs')
    if 'src=' in attrs.lower(): continue
    body=m.group('body')
    a=assignments(body)
    if not a: continue
    id_=sid(attrs,m.start())
    owners.append({
      'id':id_,
      'bytes':len(body.encode()),
      'assignments':a,
      'category':known_critical.get(id_,'unclassified'),
      'markers':[x for x in re.findall(r'__v\d+[A-Za-z0-9_]*',body) if x][:20],
      'render_calls':body.count('renderDungeon(')+body.count('renderDungeon?.('),
      'setTimeout':body.count('setTimeout'),
      'setInterval':body.count('setInterval'),
      'listeners':body.count('addEventListener'),
      'observer':body.count('MutationObserver'),
    })

external=[]
for src in re.findall(r'<script[^>]+src=["\']([^"\']+)["\']',beta,re.I):
    p=Path(src.split('?')[0])
    if not p.exists() or p.suffix.lower()!='.js': continue
    txt=p.read_text(encoding='utf-8',errors='ignore')
    a=assignments(txt)
    if a:
        external.append({'path':p.as_posix(),'bytes':len(txt.encode()),'assignments':a})

retired_present=[]
for id_ in retired_expected:
    if re.search(r'<script[^>]*\bid=["\']'+re.escape(id_)+r'["\']',beta,re.I):
        retired_present.append(id_)

report={
 'build':'V8.009-DUNGEON-SPRINT-2-FINAL-OWNER-AUDIT',
 'inline_owner_assigners':owners,
 'external_owner_assigners':external,
 'unclassified_inline':[x for x in owners if x['category']=='unclassified'],
 'critical_inline':[x for x in owners if x['category']!='unclassified'],
 'retired_owner_ids_still_active':retired_present,
 'counts':{
   'inline_owner_assigners':len(owners),
   'external_owner_assigners':len(external),
   'unclassified_inline':len([x for x in owners if x['category']=='unclassified']),
   'critical_inline':len([x for x in owners if x['category']!='unclassified']),
 }
}
Path('V8009_DUNGEON_SPRINT2_FINAL_OWNER_AUDIT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({
 'counts':report['counts'],
 'unclassified_inline':report['unclassified_inline'],
 'critical_inline':[{'id':x['id'],'category':x['category'],'assignments':x['assignments']} for x in report['critical_inline']],
 'external_owner_assigners':external,
 'retired_owner_ids_still_active':retired_present,
},ensure_ascii=False,indent=2))
