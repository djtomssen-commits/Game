from pathlib import Path
import re,json

beta=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
out={}

# Script execution order around v6145 and v7137.
tags=[]
for order,m in enumerate(re.finditer(r'<script(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</script\s*>',beta,re.I)):
    attrs=m.group('attrs')
    srcm=re.search(r'''\bsrc=["']([^"']+)["']''',attrs,re.I)
    idm=re.search(r'''\bid=["']([^"']+)["']''',attrs,re.I)
    label=srcm.group(1) if srcm else (idm.group(1) if idm else f'inline@{m.start()}')
    body=m.group('body')
    if srcm:
        p=Path(srcm.group(1).split('?')[0])
        if p.exists() and p.suffix.lower()=='.js':
            body=p.read_text(encoding='utf-8',errors='ignore')
    if any(k in label for k in ('v6145','7137')) or any(k in body for k in ('v7137FrameArtMarkup','frameAssetUrl','frameArtMarkup')):
        tags.append({'order':order,'label':label,'attrs':attrs[:500]})
out['order']=tags

# v7137 helper body.
for needle in ('function frameAssetUrl','function frameArtMarkup','window.v7137FrameArtMarkup'):
    i=beta.find(needle)
    out[needle]={'pos':i,'snippet':beta[max(0,i-1800):min(len(beta),i+5000)] if i>=0 else ''}

# Existing v6145 podium CSS.
i=beta.find('.v6145-podium-avatar')
out['podium_css_pos']=i
out['podium_css']=beta[max(0,i-4000):min(len(beta),i+6500)] if i>=0 else ''

# Avatar source helper.
for needle in ('function v080AvatarFor','const v080AvatarFor','v080AvatarFor='):
    i=beta.find(needle)
    if i>=0:
        out['avatar_helper']={'needle':needle,'pos':i,'snippet':beta[max(0,i-1500):min(len(beta),i+4500)]}
        break

Path('V8009_HALL_AVATAR_FRAME_ROOT_AUDIT.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'order':tags,'podium_css_pos':i,'helper_positions':{k:v.get('pos') for k,v in out.items() if isinstance(v,dict) and 'pos' in v}},ensure_ascii=False,indent=2))
