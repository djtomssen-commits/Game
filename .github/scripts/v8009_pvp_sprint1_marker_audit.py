# trigger after workflow registration
from pathlib import Path
import json,re

targets={
 'v611':'js/features/pvp/beta/v8009-s1-v611-pvp-stage-fix-core.js',
 'v619':'js/features/pvp/beta/v8009-s1-v619-pvp-dungeon-motion-core.js',
 'v620':'js/features/pvp/beta/v8009-s1-v620-pvp-dungeon-parity-core.js',
 'v672':'js/features/pvp/beta/v8009-s1-v672-pvp-effect-parity-core.js',
 'v7155':'js/features/pvp/beta/v8009-s1-v7155-pvp-hall-cleanup-marker.js',
}
symbols={
 'v611':['__V611_PVP_STAGE_FIX__','v611PvpVisualPreview'],
 'v619':['__V619_PVP_DUNGEON_MOTION__'],
 'v620':['__V620_PVP_DUNGEON_PARITY__','v620PvpVisualPreview'],
 'v672':['__V672_PVP_EFFECT_PARITY__'],
 'v7155':['__V7155_PVP_HALL_CLEANUP__'],
}
scan=[]
for root in ('beta.html','index.html'):
    p=Path(root)
    if p.exists(): scan.append(p)
for d in ('js','css','.github'):
    root=Path(d)
    if root.exists():
        scan += [p for p in root.rglob('*') if p.is_file() and p.suffix.lower() in ('.js','.css','.html','.py','.yml','.yaml','.json','.md')]

report={}
for key,path in targets.items():
    own=Path(path).read_text(encoding='utf-8',errors='ignore')
    refs=[]
    for p in scan:
        if p.as_posix()==path: continue
        txt=p.read_text(encoding='utf-8',errors='ignore')
        for sym in symbols[key]:
            if sym in txt:
                refs.append({
                  'symbol':sym,'path':p.as_posix(),'count':txt.count(sym),
                  'lines':[i+1 for i,l in enumerate(txt.splitlines()) if sym in l][:20]
                })
    report[key]={
      'file':path,'bytes':len(own.encode()),'symbols':symbols[key],
      'external_refs':refs,
      'safe_to_unload':len(refs)==0
    }

out={'build':'V8.009-PVP-SPRINT-1-MARKER-AUDIT','targets':report}
Path('V8009_PVP_SPRINT1_MARKER_AUDIT.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
