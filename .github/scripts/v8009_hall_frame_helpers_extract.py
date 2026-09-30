from pathlib import Path
import json

beta=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
needles=['function frameArtMarkup','function applyFrame','async function publicFrameRows','async function decorateHallFrames']
out={}
for needle in needles:
    i=beta.find(needle)
    if i<0:
        out[needle]={'found':False}
        continue
    start=max(0,beta.rfind('\n',0,i-1)-1000)
    end=min(len(beta),i+5000)
    out[needle]={'found':True,'pos':i,'snippet':beta[start:end]}
Path('V8009_HALL_FRAME_HELPERS.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:{'found':v['found'],'pos':v.get('pos')} for k,v in out.items()},ensure_ascii=False,indent=2))
