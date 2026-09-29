from pathlib import Path
import hashlib,re,json

stable_path=Path('index.html')
beta_path=Path('beta.html')
legacy_path=Path('js/features/guild/legacy/04-v260-real-daily-guild-boss.js')
stable=stable_path.read_text(encoding='utf-8')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode('utf-8')).hexdigest()
beta_before_sha=hashlib.sha256(beta.encode('utf-8')).hexdigest()
legacy=legacy_path.read_text(encoding='utf-8')

for token in ('function v260RoundResolved','function v260MaybeAutoPlay','const v260BossClock','async function v260AnimateDailyBoss'):
    if token not in legacy:
        raise RuntimeError(f'legacy V260 source missing {token}')

out=Path('js/features/guild/beta/v8008-c11-guildboss-runtime-core.js')
out.parent.mkdir(parents=True,exist_ok=True)
runtime=r"""/* V8.008-C11 BETA — Gildenboss runtime core.
   Server result/round state, replay visibility, seen-state and the 20:00 refresh
   remain here. The obsolete V4.02 replay renderer is removed; C7 is the only
   visual replay owner. */
window.__V8008_C11_GUILD_BOSS_RUNTIME__=true;
let v260DailyAnimating=false;

function v260RoundResolved(){
  return !!v255BossRound && ['won','lost'].includes(v255BossRound.status) &&
         Array.isArray(v255BossParticipants) && v255BossParticipants.length>0;
}
function v260RoundKey(){
  const round=v255BossRound||{};
  return String(round.id||round.battle_date||round.created_at||'today');
}
function v260SeenKey(){
  return `gl_v260_boss_seen_${v073User?.id||'user'}_${v260RoundKey()}`;
}
function v260HasSeen(){
  try{return localStorage.getItem(v260SeenKey())==='1'}catch(e){return false}
}
function v260MarkSeen(){
  try{localStorage.setItem(v260SeenKey(),'1')}catch(e){}
}
function v260RenderDailyControls(){
  const watch=document.querySelector('#v260WatchDailyBoss');
  if(watch)watch.style.display=v260RoundResolved()?'':'none';
}
function v260SetRealBossHp(hp,max){
  const h=Math.max(0,Number(hp)||0),m=Math.max(1,Number(max)||1);
  const txt=document.querySelector('#v260BossHpText'),fill=document.querySelector('#v260BossHpFill');
  if(txt)txt.textContent=`${v255Fmt(h)} / ${v255Fmt(m)} HP`;
  if(fill)fill.style.width=`${Math.max(0,Math.min(100,h/m*100))}%`;
}

/* C7 installs the only real replay implementation later in the script chain. */
async function v260AnimateDailyBoss(){ return false; }

function v260MaybeAutoPlay(){
  v260RenderDailyControls();
  const panel=document.querySelector('#v254GuildBoss');
  const guild=document.querySelector('#guild');
  const bossVisible=!!panel && panel.style.display!=='none' && !!guild?.classList.contains('active');
  if(bossVisible && document.visibilityState!=='hidden' && v260RoundResolved() &&
     !v260HasSeen() && !v260DailyAnimating){
    setTimeout(()=>{
      const p=document.querySelector('#v254GuildBoss');
      if(p && p.style.display!=='none' && document.querySelector('#guild')?.classList.contains('active')){
        const replay=window.v260AnimateDailyBoss;
        if(typeof replay==='function')replay();
      }
    },350);
  }
}

document.querySelector('#v260WatchDailyBoss')?.addEventListener('click',()=>{
  const replay=window.v260AnimateDailyBoss;
  if(typeof replay==='function')replay();
});

const v260BaseLoadBoss=v255LoadBoss;
v255LoadBoss=async function(){
  const r=await v260BaseLoadBoss();
  v260MaybeAutoPlay();
  return r;
};

const v260BossClock=setInterval(async()=>{
  if(document.hidden)return;
  const guild=document.querySelector('#guild'),panel=document.querySelector('#v254GuildBoss');
  if(!guild?.classList.contains('active') || !v254Membership || !panel || panel.style.display==='none')return;
  const h=new Date().getHours();
  if(h>=20 && !v260RoundResolved())await v255LoadBoss();
  else v260RenderDailyControls();
},30000);

setTimeout(()=>v260RenderDailyControls(),900);
"""
out.write_text(runtime,encoding='utf-8')

sid='v260-real-daily-guild-boss'
old=legacy_path.as_posix()
new=out.as_posix()
pat=re.compile(rf'<script[^>]*\bid=["\']{re.escape(sid)}["\'][^>]*></script\s*>',re.I)
ms=list(pat.finditer(beta))
if len(ms)!=1: raise RuntimeError(f'{sid}: expected one beta tag, got {len(ms)}')
tag=ms[0].group(0)
if old not in tag: raise RuntimeError(f'{sid}: unexpected beta source')
beta=beta[:ms[0].start()]+tag.replace(old,new)+beta[ms[0].end():]

beta=beta.replace("window.GROW_BETA_TECH_BUILD='V8.008-C10'","window.GROW_BETA_TECH_BUILD='V8.008-C11'",1)
if "V8.008-C11" not in beta: raise RuntimeError('beta C11 marker not installed')
beta_path.write_text(beta,encoding='utf-8')

if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode('utf-8')).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed during beta-only C11')

report={
 'build':'V8.008-C11-BETA',
 'phase':'3C11',
 'scope':'beta.html + beta boss runtime core',
 'replacement':new,
 'retired':'legacy V4.02 v260 replay animation implementation',
 'kept':['round resolved/key/seen state','replay button visibility','boss HP setter','autoplay gate','20:00 refresh clock','v255LoadBoss hook'],
 'final_replay_owner':'js/features/guild/beta/v8008-c7-guildboss-replay-owner.js',
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':beta_before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode('utf-8')).hexdigest(),
 'server_authority_changed':False,
}
Path('V8_PHASE3C11_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
