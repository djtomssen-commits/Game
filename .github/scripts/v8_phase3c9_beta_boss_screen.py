from pathlib import Path
import hashlib,re,json

stable_path=Path('index.html')
beta_path=Path('beta.html')
stable=stable_path.read_text(encoding='utf-8')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode('utf-8')).hexdigest()
beta_before_sha=hashlib.sha256(beta.encode('utf-8')).hexdigest()

stage_src='js/features/guild/legacy/14-v414-guild-boss-longterm.js'
layout_src='js/features/guild/legacy/33-v562-guild-boss-reference-js.js'
stage=Path(stage_src).read_text(encoding='utf-8').strip()
layout=Path(layout_src).read_text(encoding='utf-8').strip()

if not stage.startswith('/* === v414-guild-boss-longterm === */'):
    raise RuntimeError('unexpected v414 source')
if 'function buildBossLayout()' not in layout or '__v562BossRenderWrapped' not in layout:
    raise RuntimeError('unexpected v562 source')

# Keep V4.14 execution exactly at its old position. Convert only V5.62's
# self-executing wrapper into a late installer, called at its original marker.
m=re.match(r'(?s)(/\* === v562-guild-boss-reference-js === \*/\s*)\(function\(\)\{(.*)\}\)\(\);\s*$',layout)
if not m:
    raise RuntimeError('could not transform v562 IIFE')
layout_body=m.group(2).strip()

owner=f"""/* V8.008-C9 BETA — guild boss screen owner.
   V4.14 stage/meta logic executes here at its original load position.
   V5.62 reference layout is installed later through v8008C9InstallReferenceLayout()
   at the original V5.62 marker, preserving wrapper order. */

{stage}

window.v8008C9InstallReferenceLayout=function(){{
  if(window.__V8008_C9_REFERENCE_LAYOUT_INSTALLED__)return;
  window.__V8008_C9_REFERENCE_LAYOUT_INSTALLED__=true;
{layout_body}
}};
"""
out='js/features/guild/beta/v8008-c9-guildboss-screen-owner.js'
Path(out).parent.mkdir(parents=True,exist_ok=True)
Path(out).write_text(owner,encoding='utf-8')

def replace_external(html,sid,old_src,new_tag):
    pat=re.compile(rf'<script[^>]*\bid=["\']{re.escape(sid)}["\'][^>]*></script\s*>',re.I)
    ms=list(pat.finditer(html))
    if len(ms)!=1: raise RuntimeError(f'{sid}: expected one tag, got {len(ms)}')
    tag=ms[0].group(0)
    if old_src not in tag: raise RuntimeError(f'{sid}: expected src missing')
    return html[:ms[0].start()]+new_tag+html[ms[0].end():]

beta=replace_external(
  beta,
  'v414-guild-boss-longterm',
  stage_src,
  '<script id="v414-guild-boss-longterm" src="'+out+'"></script>'
)
beta=replace_external(
  beta,
  'v562-guild-boss-reference-js',
  layout_src,
  '<script id="v562-guild-boss-reference-js">window.v8008C9InstallReferenceLayout?.();</script>'
)

beta=beta.replace("window.GROW_BETA_TECH_BUILD='V8.008-C8'","window.GROW_BETA_TECH_BUILD='V8.008-C9'",1)
if "V8.008-C9" not in beta:
    raise RuntimeError('beta C9 marker not installed')
beta_path.write_text(beta,encoding='utf-8')

if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode('utf-8')).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed during beta-only C9')

report={
 'build':'V8.008-C9-BETA',
 'phase':'3C9',
 'scope':'beta.html + beta-only guild boss screen owner',
 'owner':out,
 'merged':['v414-guild-boss-longterm','v562-guild-boss-reference-js'],
 'timing_preserved':{
   'v414':'executes at original v414 script position',
   'v562':'installer invoked at original v562 script position'
 },
 'retired_separate_load':layout_src,
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':beta_before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode('utf-8')).hexdigest(),
 'gameplay_changed':False,
 'server_authority_changed':False,
}
Path('V8_PHASE3C9_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
