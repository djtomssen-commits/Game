from pathlib import Path

p=Path("beta.html")
s=p.read_text(encoding="utf-8")
orig=s

def once(old,new,label):
    global s
    c=s.count(old)
    if c!=1:
        raise SystemExit(f"{label}: expected 1 match, got {c}")
    s=s.replace(old,new,1)

def all_expected(old,new,count,label):
    global s
    c=s.count(old)
    if c!=count:
        raise SystemExit(f"{label}: expected {count} matches, got {c}")
    s=s.replace(old,new)

once(
"document.querySelector('#resetBtn').onclick=()=>{if(confirm('Spielstand wirklich löschen?')){localStorage.removeItem(KEY);OLD_KEYS.forEach(k=>localStorage.removeItem(k));location.reload()}};",
"const vCoreResetBtn=document.querySelector('#resetBtn');if(vCoreResetBtn)vCoreResetBtn.onclick=()=>{if(confirm('Spielstand wirklich löschen?')){localStorage.removeItem(KEY);OLD_KEYS.forEach(k=>localStorage.removeItem(k));location.reload()}};",
"reset button null guard"
)

once(
"Object.keys(slotLabels).forEach(sl=>{const el=document.querySelector('#slot-'+sl),it=s.equipment[sl],[ic,la]=slotLabels[sl];el.className='slot'+(it?.rarity?(' '+it.rarity):'');",
"Object.keys(slotLabels).forEach(sl=>{const el=document.querySelector('#slot-'+sl),it=s.equipment[sl],[ic,la]=slotLabels[sl];if(!el)return;el.className='slot'+(it?.rarity?(' '+it.rarity):'');",
"equipment slot null guard"
)

all_expected(
"v030MakeWeaponOffer()",
"v030MakeGear(v030WeaponBase())",
5,
"retired weapon offer generator"
)
all_expected(
"typeof v030MakeWeaponOffer==='function'",
"(typeof v030MakeGear==='function'&&typeof v030WeaponBase==='function')",
2,
"retired weapon offer guard"
)
all_expected(
"v030MakeMaterialOffer()",
"v030MakeMaterial()",
7,
"retired material offer generator"
)
all_expected(
"typeof v030MakeMaterialOffer==='function'",
"typeof v030MakeMaterial==='function'",
3,
"retired material offer guard"
)

once(
"""function v127FreshShop(){
  s.weaponShop=[];
  s.magicShop=[];

  if(typeof v030FillShops==='function'){
    v030FillShops(true);
    return true;
  }
""",
"""function v127FreshShop(){
  s.weaponShop=[];
  s.magicShop=[];

  if(typeof v057FillShops==='function'){
    v057FillShops(true);
    return true;
  }

  if(typeof v030FillShops==='function'){
    v030FillShops(true);
    return true;
  }
""",
"daily reset canonical shop owner"
)

once(
"""const v031OldMaterials=v030RenderMaterials;
v030RenderMaterials=function(){
  v031OldMaterials();
  const panel=document.querySelector('#v030Materials');
  const muted=panel?.querySelector('.muted');
  if(muted)muted.textContent='Pro Ausrüstungsteil: maximal 1 Edelstein + 1 Verzauberung. Neue ersetzen die vorhandenen.';
};""",
"""const v031OldMaterials=typeof v030RenderMaterials==='function'?v030RenderMaterials:null;
if(v031OldMaterials){
 v030RenderMaterials=function(){
  v031OldMaterials();
  const panel=document.querySelector('#v030Materials');
  const muted=panel?.querySelector('.muted');
  if(muted)muted.textContent='Pro Ausrüstungsteil: maximal 1 Edelstein + 1 Verzauberung. Neue ersetzen die vorhandenen.';
 };
}""",
"legacy materials hook"
)

once(
"""const v122OldRenderMaterials=v030RenderMaterials;
v030RenderMaterials=function(){
  v122OldRenderMaterials();
  const panel=document.querySelector('#v030Materials');
  const muted=panel?.querySelector('.muted');
  if(muted){
    muted.textContent='Pro Ausrüstungsteil maximal 1 Stein + 1 Rollen-Verzauberung. Neue ersetzen die vorhandenen.';
  }
};""",
"""const v122OldRenderMaterials=typeof v030RenderMaterials==='function'?v030RenderMaterials:null;
if(v122OldRenderMaterials){
 v030RenderMaterials=function(){
  v122OldRenderMaterials();
  const panel=document.querySelector('#v030Materials');
  const muted=panel?.querySelector('.muted');
  if(muted){
    muted.textContent='Pro Ausrüstungsteil maximal 1 Stein + 1 Rollen-Verzauberung. Neue ersetzen die vorhandenen.';
  }
 };
}""",
"socket materials hook"
)

once(
"""const v094OldQuestPool=questPool;
questPool=function(){
  const list=v094OldQuestPool();
  return (list||[]).map(q=>({
    ...q,
    v094BaseXp:Number(q.v094BaseXp ?? q.xp ?? 0)
  }));
};""",
"""if(typeof questPool==='function'){
 const v094OldQuestPool=questPool;
 questPool=function(){
  const list=v094OldQuestPool();
  return (list||[]).map(q=>({
    ...q,
    v094BaseXp:Number(q.v094BaseXp ?? q.xp ?? 0)
  }));
 };
}""",
"legacy quest pool hook"
)

once(
"  const v332BaseDungeonFight = fightDungeon;\n  fightDungeon = async function(){",
"  const v332BaseDungeonFight = typeof fightDungeon==='function'?fightDungeon:null;\n  if(v332BaseDungeonFight)fightDungeon = async function(){",
"legacy dungeon fight hook"
)

all_expected(
"if(!(await v073Init()))return;",
"if(!(await v073Init()))return;\n  if(!v073User?.id)return;",
13,
"pre-auth social/public queries"
)

if s==orig:
    raise SystemExit("no changes")
p.write_text(s,encoding="utf-8")
print("beta startup stability transform OK")
