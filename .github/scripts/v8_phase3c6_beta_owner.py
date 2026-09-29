from pathlib import Path
import hashlib,re,json

stable_path=Path('index.html')
beta_path=Path('beta.html')
base_path=Path('js/features/guild/beta/v8008-c5-guild-overview-owner.js')
legacy_path=Path('js/features/guild/legacy/32-v561-guild-first-open-gate-js.js')
out_path=Path('js/features/guild/beta/v8008-c6-guild-overview-owner.js')
out_path.parent.mkdir(parents=True,exist_ok=True)

stable=stable_path.read_text(encoding='utf-8')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode('utf-8')).hexdigest()
beta_before_sha=hashlib.sha256(beta.encode('utf-8')).hexdigest()
base=base_path.read_text(encoding='utf-8')
legacy=legacy_path.read_text(encoding='utf-8')

for token in ('v561GuildLoading','__v561GuildLoadGate','__v561GuildGoGate','needsGate','pending(true)'):
    if token not in legacy:
        raise RuntimeError(f'legacy load-gate owner missing {token}')
for token in ('installMemberRenderer','ensureGuildProgress','syncEmptyRequests'):
    if token not in base:
        raise RuntimeError(f'C5 owner missing {token}')

insert=r'''
  const guildRoot=document.getElementById('guild');
  let guildResolvedKey='';
  let guildActiveLoads=0;

  function guildUserKey(){
    try{
      const u=(typeof v073User!=='undefined'&&v073User)?v073User:null;
      if(!u)return 'unknown';
      return u.is_anonymous?'anonymous':String(u.id||'anonymous');
    }catch(e){return 'unknown'}
  }

  function ensureGuildLoader(){
    if(!guildRoot)return null;
    const shell=guildRoot.querySelector('.v254-guild-shell');
    if(!shell)return null;
    let box=document.getElementById('v561GuildLoading');
    if(!box){
      box=document.createElement('div');
      box.id='v561GuildLoading';
      box.setAttribute('role','status');
      box.setAttribute('aria-live','polite');
      box.innerHTML='<div class="v561-guild-load-title">🌿 Gildendaten werden geladen</div><div class="v561-guild-load-sub">Mitgliedschaft und Gildenstatus werden vom Server geprüft.</div><div class="v561-guild-load-bar" aria-hidden="true"></div>';
      const title=shell.querySelector(':scope > .v554-guild-title');
      if(title)title.insertAdjacentElement('afterend',box); else shell.prepend(box);
    }
    return box;
  }

  function setGuildPending(on){
    if(!guildRoot)return;
    ensureGuildLoader();
    guildRoot.classList.toggle('v561-guild-pending',!!on);
    guildRoot.setAttribute('aria-busy',on?'true':'false');
  }

  function guildNeedsGate(){
    const k=guildUserKey();
    return !guildResolvedKey || k==='unknown' || guildResolvedKey!==k;
  }

  function installGuildLoadGate(){
    if(!guildRoot)return;

    const no=document.getElementById('v254GuildNoGuild');
    if(no && !no.dataset.v561Init){
      no.dataset.v561Init='1';
      no.style.display='none';
    }
    setGuildPending(true);

    if(typeof v254LoadGuild==='function'&&!window.__v561GuildLoadGate){
      const baseLoad=v254LoadGuild;
      const wrappedLoad=async function(){
        if(guildNeedsGate())setGuildPending(true);
        guildActiveLoads++;
        try{
          return await baseLoad.apply(this,arguments);
        }finally{
          guildActiveLoads=Math.max(0,guildActiveLoads-1);
          if(guildActiveLoads===0){
            guildResolvedKey=guildUserKey();
            setGuildPending(false);
          }
        }
      };
      try{v254LoadGuild=wrappedLoad}catch(e){}
      window.v254LoadGuild=wrappedLoad;
      window.__v561GuildLoadGate=true;
    }

    if(typeof v032Go==='function'&&!window.__v561GuildGoGate){
      const baseGo=v032Go;
      const wrappedGo=function(id){
        if(id==='guild'&&guildNeedsGate())setGuildPending(true);
        return baseGo.apply(this,arguments);
      };
      try{v032Go=wrappedGo}catch(e){}
      window.v032Go=wrappedGo;
      window.__v561GuildGoGate=true;
    }

    setTimeout(()=>{
      try{
        const known=(typeof v254Membership!=='undefined'&&v254Membership!==null) ||
                    (typeof v254Guild!=='undefined'&&v254Guild!==null);
        if(known && guildActiveLoads===0){
          guildResolvedKey=guildUserKey();
          setGuildPending(false);
        }
      }catch(e){}
    },700);
  }
'''
marker="  /* V6.120: one deterministic startup pass instead of a repaint burst. */"
if marker not in base:
    raise RuntimeError('C5 insertion marker missing')
merged=base.replace(marker,insert+"\n"+marker,1)

startup="  setTimeout(()=>{try{if(typeof v254RenderGuild==='function')v254RenderGuild()}catch(e){}},80);"
if startup not in merged:
    raise RuntimeError('startup hook missing')
merged=merged.replace(startup,"  installGuildLoadGate();\n"+startup,1)
merged=merged.replace(
    "/* === V8.008-C5 beta merged guild overview owner: v554 + v556 + v559 === */",
    "/* === V8.008-C6 beta merged guild overview owner: v554 + v556 + v559 + v561 === */",
    1
)
out_path.write_text(merged,encoding='utf-8')

owner_id='v554-guild-reference-owner-js'
old_owner='js/features/guild/beta/v8008-c5-guild-overview-owner.js'
new_owner='js/features/guild/beta/v8008-c6-guild-overview-owner.js'
opat=re.compile(rf'<script[^>]*\bid=["\']{owner_id}["\'][^>]*></script\s*>',re.I)
ms=list(opat.finditer(beta))
if len(ms)!=1: raise RuntimeError(f'expected one beta v554 owner tag, got {len(ms)}')
tag=ms[0].group(0)
if old_owner not in tag: raise RuntimeError('beta v554 does not point at expected C5 owner')
beta=beta[:ms[0].start()]+tag.replace(old_owner,new_owner)+beta[ms[0].end():]

sid='v561-guild-first-open-gate-js'
src='js/features/guild/legacy/32-v561-guild-first-open-gate-js.js'
pat=re.compile(rf'<script[^>]*\bid=["\']{sid}["\'][^>]*></script\s*>',re.I)
ms=list(pat.finditer(beta))
if len(ms)!=1: raise RuntimeError(f'expected one v561 beta tag, got {len(ms)}')
tag=ms[0].group(0)
if src not in tag: raise RuntimeError('v561 beta source is unexpected')
newtag=re.sub(r'\s+src=["\']'+re.escape(src)+r'["\']','',tag,count=1,flags=re.I)
beta=beta[:ms[0].start()]+newtag+beta[ms[0].end():]

beta=beta.replace("window.GROW_BETA_TECH_BUILD='V8.008-C5'","window.GROW_BETA_TECH_BUILD='V8.008-C6'",1)
if "V8.008-C6" not in beta: raise RuntimeError('beta C6 marker not installed')
beta_path.write_text(beta,encoding='utf-8')

stable_after=stable_path.read_text(encoding='utf-8')
if hashlib.sha256(stable_after.encode('utf-8')).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed during beta-only C6')

report={
 'build':'V8.008-C6-BETA',
 'phase':'3C6',
 'scope':'beta.html + beta-only merged owner',
 'merged_owner':new_owner,
 'merged_from':['v554-guild-reference-owner-js','v556-guild-progress-admin-js','v559-guild-final-fixes-js','v561-guild-first-open-gate-js'],
 'retired_beta_load':src,
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':beta_before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode('utf-8')).hexdigest(),
 'gameplay_changed':False,
 'server_authority_changed':False,
}
Path('V8_PHASE3C6_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
