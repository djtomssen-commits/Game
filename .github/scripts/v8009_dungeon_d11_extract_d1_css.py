from pathlib import Path
import re, json, hashlib

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8')
stable=stable_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before_bytes=len(beta.encode())
before_sha=hashlib.sha256(beta.encode()).hexdigest()

targets=[
 ('v426-exact-reference-layout','css/features/dungeon/beta/v8009-d11-v426-exact-reference-layout.css'),
 ('v454-d1-feinschliff','css/features/dungeon/beta/v8009-d11-v454-d1-feinschliff.css'),
 ('v455-d1-feinschliff-2','css/features/dungeon/beta/v8009-d11-v455-d1-feinschliff-2.css'),
 ('v456-d1-reference-alignment-final','css/features/dungeon/beta/v8009-d11-v456-d1-reference-alignment-final.css'),
 ('v457-d1-clean-overlay-final','css/features/dungeon/beta/v8009-d11-v457-d1-clean-overlay-final.css'),
 ('v458-d1-clean-background-final','css/features/dungeon/beta/v8009-d11-v458-d1-clean-background-final.css'),
 ('v459-d1-right-side-thumb-final','css/features/dungeon/beta/v8009-d11-v459-d1-right-side-thumb-final.css'),
 ('v460-d1-thumb-owner-fix','css/features/dungeon/beta/v8009-d11-v460-d1-thumb-owner-fix.css'),
 ('v461-d1-node9-collision-fix','css/features/dungeon/beta/v8009-d11-v461-d1-node9-collision-fix.css'),
 ('v463-d1-screenshot-polish','css/features/dungeon/beta/v8009-d11-v463-d1-screenshot-polish.css'),
 ('v464-d1-boss-micro-position','css/features/dungeon/beta/v8009-d11-v464-d1-boss-micro-position.css'),
]

manifest=[]
positions=[]
for sid,out_path in targets:
    pat=re.compile(
      r'<style(?P<attrs>[^>]*)\bid=["\']'+re.escape(sid)+r'["\'](?P<attrs2>[^>]*)>'
      r'(?P<body>[\s\S]*?)</style\s*>',
      re.I
    )
    matches=list(pat.finditer(beta))
    if len(matches)!=1:
        raise RuntimeError(f'expected exactly one style {sid}, got {len(matches)}')
    m=matches[0]
    body=m.group('body')
    positions.append((sid,m.start()))
    out=Path(out_path)
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(body,encoding='utf-8')
    manifest.append({
      'id':sid,
      'file':out_path,
      'bytes':len(body.encode()),
      'sha256':hashlib.sha256(body.encode()).hexdigest(),
      'original_position':m.start()
    })
    link=f'<link id="{sid}" rel="stylesheet" href="{out_path}">'
    beta=beta[:m.start()]+link+beta[m.end():]

# Validate source order is unchanged by comparing positions of external hrefs.
last=-1
for sid,out_path in targets:
    pos=beta.find(out_path)
    if pos<0:
        raise RuntimeError(f'extracted href missing: {out_path}')
    if pos<=last:
        raise RuntimeError('D1 CSS source order changed')
    last=pos
    if beta.count(out_path)!=1:
        raise RuntimeError(f'extracted href count != 1: {out_path}')
    if re.search(r'<style[^>]*\bid=["\']'+re.escape(sid)+r'["\']',beta,re.I):
        raise RuntimeError(f'inline style remains: {sid}')

beta_path.write_text(beta,encoding='utf-8')

if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('Stable/index.html changed')

# Verify every external file exactly matches its original body hash.
for item in manifest:
    txt=Path(item['file']).read_text(encoding='utf-8')
    if hashlib.sha256(txt.encode()).hexdigest()!=item['sha256']:
        raise RuntimeError(f'hash mismatch after write: {item["file"]}')

report={
  'build':'V8.009-DUNGEON-D11-BETA',
  'phase':'Extract active D1 CSS cascade from beta.html without rule changes',
  'scope':'beta only',
  'stable_unchanged':True,
  'source_order_preserved':True,
  'block_count':len(manifest),
  'blocks':manifest,
  'beta_before_bytes':before_bytes,
  'beta_after_bytes':len(beta.encode()),
  'beta_before_sha256':before_sha,
  'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
  'css_rules_changed':False,
  'gameplay_changed':False,
  'combat_math_changed':False,
  'rewards_changed':False,
  'server_authority_changed':False
}
Path('V8009_DUNGEON_D11_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
