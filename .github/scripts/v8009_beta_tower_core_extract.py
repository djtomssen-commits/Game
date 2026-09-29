from pathlib import Path
import re,hashlib,json
stable=Path('index.html').read_text(encoding='utf-8')
beta_path=Path('beta.html')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before=hashlib.sha256(beta.encode()).hexdigest()

pat=re.compile(r'<script([^>]*\bid=["\']vTower-system["\'][^>]*)>([\s\S]*?)</script\s*>',re.I)
m=pat.search(beta)
if not m: raise RuntimeError('vTower-system script not found')
attrs=m.group(1)
body=m.group(2)
if 'src=' in attrs.lower(): raise RuntimeError('vTower-system already externalized')
if len(body.encode())<100000: raise RuntimeError('unexpectedly small tower system block')

out=Path('js/features/tower/beta/v8009-tower-system-owner.js')
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(body.strip()+'\n',encoding='utf-8')
new='<script id="vTower-system" src="js/features/tower/beta/v8009-tower-system-owner.js"></script>'
beta=beta[:m.start()]+new+beta[m.end():]
beta_path.write_text(beta,encoding='utf-8')

if hashlib.sha256(Path('index.html').read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed')

report={
 'build':'V8.009-B2',
 'scope':'beta only',
 'tower_owner':'js/features/tower/beta/v8009-tower-system-owner.js',
 'bytes_extracted':len(body.encode()),
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':before,
 'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest()
}
Path('V8009_BETA_TOWER_CORE_EXTRACT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
