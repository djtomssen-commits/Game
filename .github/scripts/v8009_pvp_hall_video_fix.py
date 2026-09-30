from pathlib import Path
import hashlib,json,re

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8',errors='ignore')
stable=stable_path.read_text(encoding='utf-8',errors='ignore')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before=len(beta.encode())

def replace_once(old,new,label):
    global beta
    n=beta.count(old)
    if n!=1:
        raise RuntimeError(f'{label}: expected 1 match, got {n}')
    beta=beta.replace(old,new,1)

# V6.55 final profile loader: mark the target profile before any async paint.
replace_once(
"""  function showLoading(){
    const {overlay,content,modal}=overlayParts();
    if(!overlay||!content)return false;
    overlay.classList.add('show');
    if(modal)modal.scrollTop=0;
    content.innerHTML=`""",
"""  function showLoading(id){
    const {overlay,content,modal}=overlayParts();
    if(!overlay||!content)return false;
    overlay.classList.add('show');
    if(modal)modal.scrollTop=0;
    content.dataset.profileId=String(id||'');
    content.innerHTML=`""",
'v655 showLoading profile identity'
)

replace_once(
"""  function renderProfile(p){
    const {content,modal}=overlayParts();
    if(!content||!p)return;
    const pos=dungeonPos(p);""",
"""  function renderProfile(p){
    const {content,modal}=overlayParts();
    if(!content||!p)return;
    content.dataset.profileId=String(p.id||'');
    const pos=dungeonPos(p);""",
'v655 renderProfile profile identity'
)

replace_once(
"""  async function robustOpen(id){
    const mySeq=++requestSeq;
    if(!showLoading())return;""",
"""  async function robustOpen(id){
    const mySeq=++requestSeq;
    if(!showLoading(id))return;""",
'v655 robustOpen loading identity'
)

# V4.48 global power painter: own card is always local, open modal only if it is own.
old448="""        document.querySelectorAll('#v072OwnProfile .v326-profile-stat,#v072OwnProfile .v072-profile-stat,#v074ProfileContent .v326-profile-stat,#v074ProfileContent .v072-profile-stat,#v074ProfileContent .v074-power').forEach(box=>{
          if(/Kampf(?:kraft|wert)/i.test(box.textContent||'')){const b=box.querySelector('b');if(b)setText(b,cp)}
        });"""
new448="""        document.querySelectorAll('#v072OwnProfile .v326-profile-stat,#v072OwnProfile .v072-profile-stat').forEach(box=>{
          if(/Kampf(?:kraft|wert)/i.test(box.textContent||'')){const b=box.querySelector('b');if(b)setText(b,cp)}
        });
        const openProfile=document.querySelector('#v074ProfileContent');
        if(openProfile&&String(openProfile.dataset.profileId||'')===uid){
          openProfile.querySelectorAll('.v326-profile-stat,.v072-profile-stat,.v074-power').forEach(box=>{
            if(/Kampf(?:kraft|wert)/i.test(box.textContent||'')){const b=box.querySelector('b');if(b)setText(b,cp)}
          });
        }"""
replace_once(old448,new448,'v448 foreign profile power guard')

# V4.126 stable-power painter: same ownership guard.
old4126="""    document.querySelectorAll('#v072OwnProfile .v072-profile-stat,#v074ProfileContent .v326-profile-stat,#v074ProfileContent .v072-profile-stat').forEach(box=>{
     if(/Kampf(?:kraft|wert)/i.test(box.textContent||'')){const b=box.querySelector('b');if(b)b.textContent=cp}
    });"""
new4126="""    document.querySelectorAll('#v072OwnProfile .v072-profile-stat').forEach(box=>{
     if(/Kampf(?:kraft|wert)/i.test(box.textContent||'')){const b=box.querySelector('b');if(b)b.textContent=cp}
    });
    const openProfile=document.querySelector('#v074ProfileContent');
    if(openProfile&&String(openProfile.dataset.profileId||'')===own){
     openProfile.querySelectorAll('.v326-profile-stat,.v072-profile-stat').forEach(box=>{
      if(/Kampf(?:kraft|wert)/i.test(box.textContent||'')){const b=box.querySelector('b');if(b)b.textContent=cp}
     });
    }"""
replace_once(old4126,new4126,'v4126 foreign profile power guard')

# Structural guards.
for required in (
    "content.dataset.profileId=String(id||'')",
    "content.dataset.profileId=String(p.id||'')",
    "if(!showLoading(id))return",
    "String(openProfile.dataset.profileId||'')===uid",
    "String(openProfile.dataset.profileId||'')===own",
):
    if required not in beta:
        raise RuntimeError('required Hall video fix missing: '+required)

for forbidden in (
    "#v072OwnProfile .v326-profile-stat,#v072OwnProfile .v072-profile-stat,#v074ProfileContent .v326-profile-stat",
    "#v072OwnProfile .v072-profile-stat,#v074ProfileContent .v326-profile-stat",
):
    if forbidden in beta:
        raise RuntimeError('unguarded foreign profile power selector remains: '+forbidden)

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8',errors='ignore').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('Stable/index.html changed')

report={
 'build':'V8.009-PVP-HALL-VIDEO-FIX',
 'scope':'beta only',
 'stable_unchanged':True,
 'fixes':[
   'v655 marks opened profile identity before loading and render',
   'v448 local power painter updates modal only for own profile',
   'v4126 stable power painter updates modal only for own profile',
   'v4130 own Hall renderer directly invokes v646 decorator'
 ],
 'beta_before_bytes':before,
 'beta_after_bytes':len(beta.encode()),
 'gameplay_changed':False,
 'matchmaking_changed':False,
 'combat_math_changed':False,
 'cooldown_changed':False,
 'rewards_changed':False,
 'server_authority_changed':False
}
Path('V8009_PVP_HALL_VIDEO_FIX.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
