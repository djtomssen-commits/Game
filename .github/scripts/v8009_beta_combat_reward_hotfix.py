from pathlib import Path
import hashlib,json

stable_path=Path('index.html')
beta_path=Path('beta.html')
stable=stable_path.read_text(encoding='utf-8')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before=hashlib.sha256(beta.encode()).hexdigest()

tags=[
 '<script id="v8009-combat-cadence-slower" src="js/system/performance/beta/v8009-combat-cadence-slower.js"></script>',
 '<script id="v8009-dungeon-reward-feedback" src="js/features/rewards/beta/v8009-dungeon-reward-feedback.js"></script>'
]
for tag in tags:
    src=tag.split('src="',1)[1].split('"',1)[0]
    if src in beta: continue
    pos=beta.lower().rfind('</body>')
    if pos<0: raise RuntimeError('beta </body> missing')
    beta=beta[:pos]+tag+'\n'+beta[pos:]

if "window.GROW_BETA_TECH_BUILD='V8.008-C25'" in beta:
    beta=beta.replace("window.GROW_BETA_TECH_BUILD='V8.008-C25'","window.GROW_BETA_TECH_BUILD='V8.009-B1'",1)
elif "window.GROW_BETA_TECH_BUILD='V8.009-B1'" not in beta:
    raise RuntimeError('expected beta tech marker not found')

beta_path.write_text(beta,encoding='utf-8')
after_stable=hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()
if after_stable!=stable_sha: raise RuntimeError('index.html changed')

report={
 'build':'V8.009-B1',
 'scope':'beta only',
 'changes':[
   'Dungeon/PvP/Tower combat cadence slowed to 600ms per replay event',
   'Guildboss/Guildwar timing slowed by 25%',
   'Dungeon reward window resolves exact weekly-chest and guild XP from server'
 ],
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':before,
 'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest()
}
Path('V8009_BETA_COMBAT_REWARD_HOTFIX.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
