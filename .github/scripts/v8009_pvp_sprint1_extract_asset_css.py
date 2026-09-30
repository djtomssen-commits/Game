from pathlib import Path
import re,json,hashlib

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8')
stable=stable_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before_bytes=len(beta.encode())

targets=[
 ('v549-pvp-grow-legends-css','css/features/pvp/beta/v8009-s1-v549-pvp-grow-legends-css.css'),
 ('v550-pvp-hero-cleanup-css','css/features/pvp/beta/v8009-s1-v550-pvp-hero-cleanup-css.css'),
 ('v611-pvp-stage-fix-css','css/features/pvp/beta/v8009-s1-v611-pvp-stage-fix-css.css'),
]

done=[]
for sid,out in targets:
    pat=re.compile(
      r'<style(?P<attrs>[^>]*)\bid=["\']'+re.escape(sid)+r'["\'](?P<attrs2>[^>]*)>'
      r'(?P<body>[\s\S]*?)</style\s*>',re.I
    )
    ms=list(pat.finditer(beta))
    if len(ms)!=1: raise RuntimeError(f'expected one style {sid}, got {len(ms)}')
    m=ms[0]; body=m.group('body')

    urls=re.findall(r'url\s*\((["\']?)(assets/[^)"\']+)\1\)',body,re.I)
    if not urls:
        raise RuntimeError(f'expected relative assets URLs in {sid}')

    rewritten=re.sub(
      r'url\s*\((["\']?)(assets/[^)"\']+)\1\)',
      lambda mm: f'url({mm.group(1)}../../../../{mm.group(2)}{mm.group(1)})',
      body,
      flags=re.I
    )

    # Verify every rewritten target exists at repo root.
    for _,asset in urls:
        if not Path(asset).exists():
            raise RuntimeError(f'missing asset for {sid}: {asset}')
        if f'../../../../{asset}' not in rewritten:
            raise RuntimeError(f'asset rewrite missing for {sid}: {asset}')

    p=Path(out);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(rewritten,encoding='utf-8')
    beta=beta[:m.start()]+f'<link id="{sid}" rel="stylesheet" href="{out}">'+beta[m.end():]
    done.append({
      'id':sid,'file':out,'original_bytes':len(body.encode()),
      'rewritten_bytes':len(rewritten.encode()),
      'original_sha256':hashlib.sha256(body.encode()).hexdigest(),
      'rewritten_sha256':hashlib.sha256(rewritten.encode()).hexdigest(),
      'assets':[x[1] for x in urls]
    })

for x in done:
    if beta.count(x['file'])!=1: raise RuntimeError(f'include count !=1: {x["file"]}')
    if re.search(r'<style[^>]*\bid=["\']'+re.escape(x['id'])+r'["\']',beta,re.I):
        raise RuntimeError(f'inline style remains: {x["id"]}')

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('Stable/index.html changed')

report={
 'build':'V8.009-PVP-SPRINT-1-ASSET-CSS',
 'scope':'beta only',
 'stable_unchanged':True,
 'extracted':done,
 'count':len(done),
 'beta_before_bytes':before_bytes,
 'beta_after_bytes':len(beta.encode()),
 'css_behavior_change':'path rewrite only; visual rules unchanged',
 'gameplay_changed':False,
 'server_authority_changed':False
}
Path('V8009_PVP_SPRINT1_ASSET_CSS.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
