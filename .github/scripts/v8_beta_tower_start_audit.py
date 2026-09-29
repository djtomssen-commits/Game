from pathlib import Path
import re,json
s=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
rows=[]
for m in re.finditer(r'<script(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</script\s*>',s,re.I):
    attrs=m.group('attrs');body=m.group('body')
    im=re.search(r'\bid=["\']([^"\']+)["\']',attrs,re.I)
    sm=re.search(r'\bsrc=["\']([^"\']+)["\']',attrs,re.I)
    sid=im.group(1) if im else ''
    src=sm.group(1) if sm else ''
    hay=sid+' '+src+' '+body[:1200]
    if re.search(r'(tower|turm|v62[0-9]{2}|v71[0-9]{2}|v72[0-9]{2})',hay,re.I):
        if re.search(r'(tower|turm)',hay,re.I) or any(x in body for x in ('vTowerRender','routeView(','startView(','towerTab','data-vt-start','Anbau-Turm')):
            rows.append({'id':sid,'src':src,'line':s.count('\n',0,m.start())+1,'bytes':len(body.encode()),'excerpt':re.sub(r'\s+',' ',body.strip())[:5000]})
styles=[]
for m in re.finditer(r'<style(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</style\s*>',s,re.I):
    attrs=m.group('attrs');body=m.group('body')
    im=re.search(r'\bid=["\']([^"\']+)["\']',attrs,re.I)
    sid=im.group(1) if im else ''
    if re.search(r'(tower|turm)',sid+' '+body[:1000],re.I):
        styles.append({'id':sid,'line':s.count('\n',0,m.start())+1,'bytes':len(body.encode()),'excerpt':re.sub(r'\s+',' ',body.strip())[:3500]})
Path('V8_BETA_TOWER_START_AUDIT.json').write_text(json.dumps({'scripts':rows,'styles':styles},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'scripts':rows,'styles':styles},ensure_ascii=False,indent=2))
