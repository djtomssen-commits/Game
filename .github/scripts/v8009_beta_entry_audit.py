from pathlib import Path
import json,re,hashlib

out={}
for name in ('beta.html','tester.html','index.html'):
    p=Path(name)
    txt=p.read_text(encoding='utf-8',errors='ignore') if p.exists() else ''
    out[name]={
      'exists':p.exists(),
      'bytes':len(txt.encode()),
      'sha256':hashlib.sha256(txt.encode()).hexdigest() if p.exists() else None,
      'hits':{
        'v6145_include':txt.find('v8009-s1-v6145-hall-pagination-js.js'),
        'v6145_cache':txt.find('v8009-s1-v6145-hall-pagination-js.js?v=8009-top3-owner2'),
        'podium_portrait':txt.find('v6145-podium-portrait'),
        'v7230':txt.find('v7230-server-frame-isolation'),
        'beta_html':txt.find('beta.html'),
        'tester_html':txt.find('tester.html'),
        'iframe':txt.lower().find('<iframe'),
        'location_href':txt.find('location.href'),
        'window_location':txt.find('window.location'),
      },
      'script_srcs':[x for x in re.findall(r'<script[^>]+src=["\']([^"\']+)["\']',txt,re.I) if 'v6145' in x or 'beta' in x or 'tester' in x][:50],
    }

# Useful tester snippets around route/redirect references.
txt=Path('tester.html').read_text(encoding='utf-8',errors='ignore') if Path('tester.html').exists() else ''
snips=[]
for needle in ('beta.html','location.href','window.location','<iframe','v6145','Hall of Haze','HALL OF HAZE'):
    pos=0
    while True:
        i=txt.find(needle,pos)
        if i<0: break
        snips.append({'needle':needle,'pos':i,'snippet':txt[max(0,i-500):min(len(txt),i+1200)]})
        pos=i+len(needle)
        if len(snips)>=40: break
    if len(snips)>=40: break
out['tester_snippets']=snips

Path('V8009_BETA_ENTRY_AUDIT.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))
