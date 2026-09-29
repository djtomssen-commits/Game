from pathlib import Path
import hashlib,re,json

stable_path=Path('index.html')
beta_path=Path('beta.html')
base_path=Path('js/features/guild/legacy/28-v554-guild-reference-owner-js.js')
progress_path=Path('js/features/guild/legacy/30-v556-guild-progress-admin-js.js')
out_path=Path('js/features/guild/beta/v8008-c4-guild-overview-owner.js')
out_path.parent.mkdir(parents=True,exist_ok=True)

stable=stable_path.read_text(encoding='utf-8')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode('utf-8')).hexdigest()
beta_before_sha=hashlib.sha256(beta.encode('utf-8')).hexdigest()
base=base_path.read_text(encoding='utf-8')
progress=progress_path.read_text(encoding='utf-8')

required_base=['installMemberRenderer','renderTop','pairAdmin','installManagementPicker','cleanLegacy']
required_progress=['THRESH','ensureProgress','compactAdmin','v556-progress']
for token in required_base:
    if token not in base: raise RuntimeError(f'base owner missing {token}')
for token in required_progress:
    if token not in progress: raise RuntimeError(f'progress owner missing {token}')

insert=r'''
  const GUILD_XP_THRESH=[0,500,1500,3500,7000,12500,20500,31500,46000,65000,90000,122000,162000,212000,275000,355000,460000,600000,900000,1800000];

  function guildProgressInfo(g){
    const xp=Math.max(0,Math.floor(Number(g?.guild_xp)||0));
    let lv=1;
    for(let i=1;i<GUILD_XP_THRESH.length;i++){if(xp>=GUILD_XP_THRESH[i])lv=i+1;else break}
    lv=Math.max(1,Math.min(20,lv));
    if(lv>=20)return {lv:20,pct:100,text:`${xp.toLocaleString('de-DE')} Gilden-EP · MAX`};
    const hi=GUILD_XP_THRESH[lv];
    const pct=Math.max(0,Math.min(100,((xp/Math.max(1,hi))*100)));
    return {lv,pct,text:`${xp.toLocaleString('de-DE')} / ${hi.toLocaleString('de-DE')} Gilden-EP · noch ${(hi-xp).toLocaleString('de-DE')} bis Level ${lv+1}`};
  }

  function ensureGuildProgress(){
    const st=readState();
    const g=st.guild;
    const hero=document.querySelector('#guild .v554-guild-hero');
    if(!g||!hero)return;
    let box=hero.querySelector(':scope > .v556-progress');
    if(!box){
      box=document.createElement('div');
      box.className='v556-progress';
      hero.appendChild(box);
    }
    const z=guildProgressInfo(g);
    const sig=[z.lv,z.pct.toFixed(2),z.text].join('|');
    if(box.dataset.sig!==sig){
      box.innerHTML=`<div class="v556-progress-head"><span>🏰 GILDENFORTSCHRITT</span><b>Gildenlevel ${z.lv}</b></div><div class="v556-progress-bar"><i style="width:${z.pct.toFixed(2)}%"></i></div><small>${z.text}</small>`;
      box.dataset.sig=sig;
    }
    hero.querySelectorAll('.v554-progress-slot').forEach(x=>x.style.display='none');
    document.querySelectorAll('#guild .v409-guild-progress:not(.v556-progress)').forEach(x=>x.style.display='none');
  }
'''

needle="  function cleanLegacy(){"
if needle not in base:
    raise RuntimeError('cleanLegacy insertion point missing')
merged=base.replace(needle,insert+"\n"+needle,1)

old_paint="  function paint(){renderTop();pairAdmin();installManagementPicker();cleanLegacy()}"
new_paint="  function paint(){renderTop();pairAdmin();installManagementPicker();ensureGuildProgress();cleanLegacy();document.querySelectorAll('#guild #v257RequestsCard .v380-request-note').forEach(x=>x.style.display='none')}"
if old_paint not in merged:
    raise RuntimeError('paint function signature changed')
merged=merged.replace(old_paint,new_paint,1)

listener="  document.addEventListener('click',e=>{if(e.target?.closest?.('[data-screen=\"guild\"],.v254-tab,#v380RefreshGuildRequests'))setTimeout(paint,40)},true);\n"
end_marker="  window.addEventListener('pageshow',()=>{if(document.getElementById('guild')?.classList.contains('active'))requestAnimationFrame(paint)},{passive:true});\n"
if end_marker not in merged:
    raise RuntimeError('pageshow marker missing')
merged=merged.replace(end_marker,end_marker+listener,1)
merged=merged.replace("/* === v554-guild-reference-owner-js === */","/* === V8.008-C4 beta merged guild overview owner: v554 + v556 === */",1)
out_path.write_text(merged,encoding='utf-8')

# Swap only beta to the merged owner and retire the separate v556 load.
owner_id='v554-guild-reference-owner-js'
owner_old='js/features/guild/legacy/28-v554-guild-reference-owner-js.js'
owner_new='js/features/guild/beta/v8008-c4-guild-overview-owner.js'
owner_pat=re.compile(rf'<script[^>]*\bid=["\']{owner_id}["\'][^>]*></script\s*>',re.I)
ms=list(owner_pat.finditer(beta))
if len(ms)!=1: raise RuntimeError(f'expected one v554 beta owner tag, got {len(ms)}')
tag=ms[0].group(0)
if owner_old not in tag: raise RuntimeError('beta v554 owner does not point at expected legacy file')
newtag=tag.replace(owner_old,owner_new)
beta=beta[:ms[0].start()]+newtag+beta[ms[0].end():]

sid='v556-guild-progress-admin-js'
src='js/features/guild/legacy/30-v556-guild-progress-admin-js.js'
pat=re.compile(rf'<script[^>]*\bid=["\']{sid}["\'][^>]*></script\s*>',re.I)
ms=list(pat.finditer(beta))
if len(ms)!=1: raise RuntimeError(f'expected one v556 beta tag, got {len(ms)}')
tag=ms[0].group(0)
if src not in tag: raise RuntimeError('v556 beta source is unexpected')
newtag=re.sub(r'\s+src=["\']'+re.escape(src)+r'["\']','',tag,count=1,flags=re.I)
beta=beta[:ms[0].start()]+newtag+beta[ms[0].end():]

beta=beta.replace("window.GROW_BETA_TECH_BUILD='V8.008-C3'","window.GROW_BETA_TECH_BUILD='V8.008-C4'",1)
if "V8.008-C4" not in beta: raise RuntimeError('beta C4 marker not installed')
beta_path.write_text(beta,encoding='utf-8')

stable_after=stable_path.read_text(encoding='utf-8')
if hashlib.sha256(stable_after.encode('utf-8')).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed during beta-only C4')

report={
 'build':'V8.008-C4-BETA',
 'phase':'3C4',
 'scope':'beta.html + beta-only merged owner',
 'merged_owner':'js/features/guild/beta/v8008-c4-guild-overview-owner.js',
 'merged_from':['v554-guild-reference-owner-js','v556-guild-progress-admin-js'],
 'retired_beta_load':'js/features/guild/legacy/30-v556-guild-progress-admin-js.js',
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':beta_before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode('utf-8')).hexdigest(),
 'gameplay_changed':False,
 'server_authority_changed':False,
}
Path('V8_PHASE3C4_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
