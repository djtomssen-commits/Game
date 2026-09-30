from pathlib import Path
import re,json

roots=[Path('beta.html'),Path('index.html')]
for d in ('js','css'):
    p=Path(d)
    if p.exists():
        roots += [x for x in p.rglob('*') if x.is_file() and x.suffix.lower() in ('.js','.css','.html')]

terms=[
 'avatarframe','avatar_frame','avatar frame','activeframe','active_frame',
 'selectedframe','selected_frame','equippedframe','equipped_frame',
 'rahmen','frameid','frame_id','framekey','frame_key',
 'profileframe','profile_frame','avatar-frame','avatar_frame',
]
hits=[]
for p in roots:
    txt=p.read_text(encoding='utf-8',errors='ignore')
    low=txt.lower()
    if not any(t in low for t in terms):
        continue
    contexts=[]
    lines=txt.splitlines()
    for i,line in enumerate(lines):
        ll=line.lower()
        if any(t in ll for t in terms):
            contexts.append({'line':i+1,'text':line.strip()[:1800]})
    hits.append({'path':p.as_posix(),'count':len(contexts),'contexts':contexts[:200]})

out={'build':'V8.009-HALL-AVATAR-FRAME-AUDIT','hits':hits}
Path('V8009_HALL_AVATAR_FRAME_AUDIT.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(hits,ensure_ascii=False,indent=2))
