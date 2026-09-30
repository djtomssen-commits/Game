from pathlib import Path
import re,json

beta=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
owner_names=[
 'v073LoadRanking','v073ProfilePayload','v073SyncProfile','v073PlayerRow',
 'v074OpenProfile','v072RenderOwnProfile',
 'v204FindOpponent','v204Fight','v209OpenBattle','v032Go'
]
selected=[
 'v8009-s1-v326-hall-profile-canonical.js',
 'v8009-s1-v424-hall-combat-power-fix.js',
 'v8009-s1-v437-pvp-combat-power-canonical.js',
 'v8009-s1-v646-hall-template-js.js',
 'v8009-s1-vPvpBudsHallSyncFix.js',
 'v8009-s1-v6145-hall-pagination-js.js',
 'v8009-s1-v549-pvp-grow-legends-js.js',
 'v8009-s1-v7053-atomic-pvp-client-bridge.js',
]

src_re=re.compile(r'<script[^>]+src=["\']([^"\']+)["\']',re.I)
srcs=src_re.findall(beta)
order={Path(src.split('?')[0]).name:i for i,src in enumerate(srcs)}

def classify_line(line,name):
    s=line.strip()
    # exact assignment, not comparison
    if re.search(r'(?<![\w$])(?:window\.)?'+re.escape(name)+r'\s*=(?!=)',s):
        return 'assignment'
    if re.search(r'\b'+re.escape(name)+r'\s*\(',s):
        return 'call'
    return 'reference'

files=[]
for name in selected:
    matches=list(Path('js/features/pvp/beta').glob('*'+name.split('v8009-s1-',1)[-1]))
    if not matches:
        p=Path('js/features/pvp/beta')/name
    else:
        p=matches[0]
    if not p.exists():
        files.append({'file':str(p),'missing':True});continue
    txt=p.read_text(encoding='utf-8',errors='ignore')
    refs=[]
    for i,line in enumerate(txt.splitlines()):
        for owner in owner_names:
            if owner in line:
                refs.append({
                  'name':owner,'line':i+1,'kind':classify_line(line,owner),
                  'text':line.strip()[:1200]
                })
    files.append({
      'file':p.as_posix(),
      'basename':p.name,
      'include_order':order.get(p.name,-1),
      'bytes':len(txt.encode()),
      'refs':refs,
      'markers':sorted(set(re.findall(r'__v[A-Za-z0-9_]+',txt)))[:100],
      'setTimeout':txt.count('setTimeout'),
      'setInterval':txt.count('setInterval'),
      'requestAnimationFrame':txt.count('requestAnimationFrame'),
      'addEventListener':txt.count('addEventListener'),
      'MutationObserver':txt.count('MutationObserver'),
    })

timeline={}
for owner in owner_names:
    events=[]
    for f in files:
        for r in f.get('refs',[]):
            if r['name']==owner:
                events.append({
                  'file':f.get('file'),'include_order':f.get('include_order',-1),
                  'line':r['line'],'kind':r['kind'],'text':r['text']
                })
    events.sort(key=lambda x:(x['include_order'],x['line']))
    timeline[owner]=events

# Exact dead-wrapper hypotheses that can be checked mechanically.
def has_assign(file_suffix,owner):
    return any(
      f.get('basename','').endswith(file_suffix)
      and any(r['name']==owner and r['kind']=='assignment' for r in f.get('refs',[]))
      for f in files
    )

hypotheses={
 'v6145_is_final_ranking_owner':False,
 'v424_ranking_wrapper_superseded':False,
 'pvp_buds_ranking_wrapper_superseded':False,
}
ranking_assign=[e for e in timeline['v073LoadRanking'] if e['kind']=='assignment']
if ranking_assign:
    final=ranking_assign[-1]
    hypotheses['v6145_is_final_ranking_owner']='v6145-hall-pagination-js' in final['file']
    if hypotheses['v6145_is_final_ranking_owner']:
        hypotheses['v424_ranking_wrapper_superseded']=any('v424-hall-combat-power-fix' in e['file'] for e in ranking_assign[:-1])
        hypotheses['pvp_buds_ranking_wrapper_superseded']=any('vPvpBudsHallSyncFix' in e['file'] for e in ranking_assign[:-1])

report={
 'build':'V8.009-PVP-SPRINT-1-OWNER-AUDIT',
 'selected_files':files,
 'timeline':timeline,
 'hypotheses':hypotheses,
 'script_count':len(srcs),
}
Path('V8009_PVP_SPRINT1_OWNER_AUDIT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({
 'hypotheses':hypotheses,
 'timeline':{k:[{'file':x['file'],'order':x['include_order'],'line':x['line'],'kind':x['kind'],'text':x['text']} for x in v] for k,v in timeline.items()},
},ensure_ascii=False,indent=2))
