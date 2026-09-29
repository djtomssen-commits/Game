from pathlib import Path
import hashlib,re,json

stable_path=Path('index.html')
beta_path=Path('beta.html')
base_path=Path('js/features/guild/beta/v8008-c11-guildboss-runtime-core.js')
late_path=Path('js/features/guild/legacy/22-v4118-care-guildboss-fix.js')
stable=stable_path.read_text(encoding='utf-8')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode('utf-8')).hexdigest()
beta_before_sha=hashlib.sha256(beta.encode('utf-8')).hexdigest()
base=base_path.read_text(encoding='utf-8').rstrip()
late=late_path.read_text(encoding='utf-8').strip()

if 'window.__V8008_C11_GUILD_BOSS_RUNTIME__=true;' not in base:
    raise RuntimeError('unexpected C11 runtime core')
for token in ('function refreshBoss()','function qaWrap()','v4114DecorateCareSlots'):
    if token not in late:
        raise RuntimeError(f'legacy V4118 bridge missing {token}')

m=re.match(r"(?s)/\* === v4118-care-guildboss-fix === \*/\s*\(\(\)=>\{(.*)\}\)\(\);\s*$",late)
if not m:
    raise RuntimeError('could not transform V4118 IIFE')
late_body=m.group(1).strip()

out=Path('js/features/guild/beta/v8008-c12-guildboss-runtime-core.js')
out.parent.mkdir(parents=True,exist_ok=True)
merged=base.replace(
    'window.__V8008_C11_GUILD_BOSS_RUNTIME__=true;',
    'window.__V8008_C11_GUILD_BOSS_RUNTIME__=true;\nwindow.__V8008_C12_GUILD_BOSS_RUNTIME__=true;',
    1
)
merged += f"""

/* V8.008-C12 — late compatibility bridge.
   Installed at the original V4.118 script position so QA/grow-care timing and
   foreground/pageshow refresh behavior remain unchanged without another file load. */
window.v8008C12InstallLateBridge=function(){{
  if(window.__V8008_C12_LATE_BRIDGE_INSTALLED__)return;
  window.__V8008_C12_LATE_BRIDGE_INSTALLED__=true;
{late_body}
}};
"""
out.write_text(merged,encoding='utf-8')

def swap_external(html,sid,old_src,new_src):
    pat=re.compile(rf'<script[^>]*\bid=["\']{re.escape(sid)}["\'][^>]*></script\s*>',re.I)
    ms=list(pat.finditer(html))
    if len(ms)!=1: raise RuntimeError(f'{sid}: expected one tag, got {len(ms)}')
    tag=ms[0].group(0)
    if old_src not in tag: raise RuntimeError(f'{sid}: expected source missing')
    return html[:ms[0].start()]+tag.replace(old_src,new_src)+html[ms[0].end():]

beta=swap_external(
    beta,
    'v260-real-daily-guild-boss',
    base_path.as_posix(),
    out.as_posix()
)

sid='v4118-care-guildboss-fix'
pat=re.compile(rf'<script[^>]*\bid=["\']{sid}["\'][^>]*></script\s*>',re.I)
ms=list(pat.finditer(beta))
if len(ms)!=1: raise RuntimeError(f'{sid}: expected one tag, got {len(ms)}')
tag=ms[0].group(0)
if late_path.as_posix() not in tag: raise RuntimeError('V4118 source unexpected')
newtag='<script id="v4118-care-guildboss-fix">window.v8008C12InstallLateBridge?.();</script>'
beta=beta[:ms[0].start()]+newtag+beta[ms[0].end():]

beta=beta.replace("window.GROW_BETA_TECH_BUILD='V8.008-C11'","window.GROW_BETA_TECH_BUILD='V8.008-C12'",1)
if "V8.008-C12" not in beta: raise RuntimeError('beta C12 marker not installed')
beta_path.write_text(beta,encoding='utf-8')

if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode('utf-8')).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed during beta-only C12')

report={
 'build':'V8.008-C12-BETA',
 'phase':'3C12',
 'scope':'beta.html + consolidated boss runtime core',
 'owner':out.as_posix(),
 'merged_from':['v8008-c11-guildboss-runtime-core','v4118-care-guildboss-fix'],
 'late_install_position_preserved':'v4118-care-guildboss-fix marker',
 'retired_separate_load':late_path.as_posix(),
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':beta_before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode('utf-8')).hexdigest(),
 'server_authority_changed':False,
 'gameplay_changed':False,
}
Path('V8_PHASE3C12_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
