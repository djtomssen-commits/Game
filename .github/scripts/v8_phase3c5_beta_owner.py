from pathlib import Path
import hashlib,re,json

stable_path=Path('index.html')
beta_path=Path('beta.html')
base_path=Path('js/features/guild/beta/v8008-c4-guild-overview-owner.js')
legacy_path=Path('js/features/guild/legacy/31-v559-guild-final-fixes-js.js')
out_path=Path('js/features/guild/beta/v8008-c5-guild-overview-owner.js')
out_path.parent.mkdir(parents=True,exist_ok=True)

stable=stable_path.read_text(encoding='utf-8')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode('utf-8')).hexdigest()
beta_before_sha=hashlib.sha256(beta.encode('utf-8')).hexdigest()
base=base_path.read_text(encoding='utf-8')
legacy=legacy_path.read_text(encoding='utf-8')

for token in ('syncEmptyRequests','v559-no-requests','__v6120RequestEmptyHook'):
    if token not in legacy:
        raise RuntimeError(f'legacy request-state owner missing {token}')
for token in ('installMemberRenderer','ensureGuildProgress','installManagementPicker'):
    if token not in base:
        raise RuntimeError(f'C4 owner missing {token}')

insert=r'''
  function syncEmptyRequests(){
    const card=document.querySelector('#guild #v257RequestsCard');
    const list=document.querySelector('#guild #v257GuildRequests');
    const count=document.querySelector('#guild #v257RequestCount');
    if(!card||!list)return;
    const hasRequest=!!list.querySelector('.v257-request');
    const empty=list.querySelector('.v257-search-empty');
    const emptyText=String(empty?.textContent||'').trim().toLowerCase();
    const n=Number.parseInt(String(count?.textContent||'0').trim(),10)||0;
    const trulyEmpty=!hasRequest && n===0 && emptyText.includes('keine offenen beitrittsanfragen');
    card.classList.toggle('v559-no-requests',trulyEmpty);
  }
'''
needle="  function cleanLegacy(){"
if needle not in base:
    raise RuntimeError('cleanLegacy insertion point missing')
merged=base.replace(needle,insert+"\n"+needle,1)

old_paint="  function paint(){renderTop();pairAdmin();installManagementPicker();ensureGuildProgress();cleanLegacy();document.querySelectorAll('#guild #v257RequestsCard .v380-request-note').forEach(x=>x.style.display='none')}"
new_paint="  function paint(){renderTop();pairAdmin();installManagementPicker();ensureGuildProgress();syncEmptyRequests();cleanLegacy();document.querySelectorAll('#guild #v257RequestsCard .v380-request-note').forEach(x=>x.style.display='none')}"
if old_paint not in merged:
    raise RuntimeError('C4 paint signature changed')
merged=merged.replace(old_paint,new_paint,1)

hook=r'''
  if(typeof v257RenderRequests==='function'&&!window.__v6120RequestEmptyHook){
    const baseRequests=v257RenderRequests;
    const wrappedRequests=function(){
      const r=baseRequests.apply(this,arguments);
      requestAnimationFrame(syncEmptyRequests);
      return r;
    };
    try{v257RenderRequests=wrappedRequests}catch(e){}
    window.v257RenderRequests=wrappedRequests;
    window.__v6120RequestEmptyHook=true;
  }
'''
marker="  /* V6.120: one deterministic startup pass instead of a repaint burst. */"
if marker not in merged:
    raise RuntimeError('hook insertion marker missing')
merged=merged.replace(marker,hook+"\n"+marker,1)
merged=merged.replace(
    "/* === V8.008-C4 beta merged guild overview owner: v554 + v556 === */",
    "/* === V8.008-C5 beta merged guild overview owner: v554 + v556 + v559 === */",
    1
)
out_path.write_text(merged,encoding='utf-8')

owner_id='v554-guild-reference-owner-js'
old_owner='js/features/guild/beta/v8008-c4-guild-overview-owner.js'
new_owner='js/features/guild/beta/v8008-c5-guild-overview-owner.js'
opat=re.compile(rf'<script[^>]*\bid=["\']{owner_id}["\'][^>]*></script\s*>',re.I)
ms=list(opat.finditer(beta))
if len(ms)!=1: raise RuntimeError(f'expected one beta v554 owner tag, got {len(ms)}')
tag=ms[0].group(0)
if old_owner not in tag: raise RuntimeError('beta v554 does not point at expected C4 owner')
beta=beta[:ms[0].start()]+tag.replace(old_owner,new_owner)+beta[ms[0].end():]

sid='v559-guild-final-fixes-js'
src='js/features/guild/legacy/31-v559-guild-final-fixes-js.js'
pat=re.compile(rf'<script[^>]*\bid=["\']{sid}["\'][^>]*></script\s*>',re.I)
ms=list(pat.finditer(beta))
if len(ms)!=1: raise RuntimeError(f'expected one v559 beta tag, got {len(ms)}')
tag=ms[0].group(0)
if src not in tag: raise RuntimeError('v559 beta source is unexpected')
newtag=re.sub(r'\s+src=["\']'+re.escape(src)+r'["\']','',tag,count=1,flags=re.I)
beta=beta[:ms[0].start()]+newtag+beta[ms[0].end():]

beta=beta.replace("window.GROW_BETA_TECH_BUILD='V8.008-C4'","window.GROW_BETA_TECH_BUILD='V8.008-C5'",1)
if "V8.008-C5" not in beta: raise RuntimeError('beta C5 marker not installed')
beta_path.write_text(beta,encoding='utf-8')

stable_after=stable_path.read_text(encoding='utf-8')
if hashlib.sha256(stable_after.encode('utf-8')).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed during beta-only C5')

report={
 'build':'V8.008-C5-BETA',
 'phase':'3C5',
 'scope':'beta.html + beta-only merged owner',
 'merged_owner':new_owner,
 'merged_from':['v554-guild-reference-owner-js','v556-guild-progress-admin-js','v559-guild-final-fixes-js'],
 'retired_beta_load':src,
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':beta_before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode('utf-8')).hexdigest(),
 'gameplay_changed':False,
 'server_authority_changed':False,
}
Path('V8_PHASE3C5_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
