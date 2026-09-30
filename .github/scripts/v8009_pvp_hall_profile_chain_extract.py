from pathlib import Path
import json

beta=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
ids=[
 'v446-global-combat-power-authority',
 'v652-player-profile-redesign-js',
 'v655-player-profile-load-fix-js',
 'v7137-shift-frame-client',
 'v6338-central-title-system-js',
 'v448-final-ui-power-account-integrity',
 'v4126-power-rpc-diagnostics',
]
out={}
for sid in ids:
    pos=beta.find(sid)
    if pos<0:
        out[sid]={'found':False}
        continue
    start=beta.rfind('<script',0,pos)
    end=beta.find('</script',pos)
    if start<0 or end<0:
        out[sid]={'found':False,'pos':pos}
        continue
    close=beta.find('>',end)
    if close<0:
        out[sid]={'found':False,'pos':pos}
        continue
    tag=beta[start:close+1]
    body_start=tag.find('>')+1
    body_end=tag.lower().rfind('</script')
    body=tag[body_start:body_end]
    out[sid]={'found':True,'pos':pos,'bytes':len(body.encode()),'tag':tag[:tag.find('>')+1],'body':body}
Path('V8009_PVP_HALL_PROFILE_CHAIN.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:{'found':v['found'],'pos':v.get('pos'),'bytes':v.get('bytes')} for k,v in out.items()},ensure_ascii=False,indent=2))
