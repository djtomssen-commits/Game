from pathlib import Path
import re,json
out={}
for name in ('index.html','beta.html'):
    s=Path(name).read_text(encoding='utf-8')
    rows=[]
    for m in re.finditer(r'<script(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</script\s*>',s,re.I):
        attrs=m.group('attrs');body=m.group('body')
        im=re.search(r'\bid=["\']([^"\']+)["\']',attrs,re.I)
        sm=re.search(r'\bsrc=["\']([^"\']+)["\']',attrs,re.I)
        sid=im.group(1) if im else ''
        src=sm.group(1) if sm else ''
        if re.search(r'(boss|guild|gilde)',sid+' '+src,re.I):
            rows.append({'id':sid,'src':src,'inline_bytes':len(body.encode()),'line':s.count('\n',0,m.start())+1})
    out[name]=rows
Path('V8_PHASE3C11_BOSS_AUDIT.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))
