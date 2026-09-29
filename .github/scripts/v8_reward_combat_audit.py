from pathlib import Path
import re,json
files=['index.html','beta.html']
needles=[
 'Keine Gilden-EP für diese Aktivität verbucht',
 'Wochen-Truhen-EP werden geprüft',
 'growlegends:guild-xp-feedback',
 'v7135ActivityFeedbackRefresh',
 'v7165-guild-reward-line',
 'v473AwardDungeonGuildXp',
 'v7308PrepareReward',
 'v7269DungeonCadence',
 'frameDelay:430',
 'attackDelay:215'
]
out={}
for fn in files:
    s=Path(fn).read_text(encoding='utf-8',errors='ignore')
    arr=[]
    for q in needles:
        start=0
        while True:
            i=s.find(q,start)
            if i<0: break
            line=s.count('\n',0,i)+1
            arr.append({'needle':q,'line':line,'snippet':re.sub(r'\s+',' ',s[max(0,i-1000):min(len(s),i+1800)]).strip()})
            start=i+len(q)
            if sum(1 for x in arr if x['needle']==q)>=6: break
    out[fn]=arr
# scan external JS for combat cadence consumers + reward feedback producers
jsrows=[]
for p in Path('js').rglob('*.js'):
    s=p.read_text(encoding='utf-8',errors='ignore')
    hits=[]
    for q in ['v7269DungeonCadence','v7291','growlegends:guild-xp-feedback','v7135ActivityFeedbackRefresh','weekly_xp','weeklyXp','v411_add_guild_activity']:
        if q in s:
            hits.append(q)
    if hits:
        jsrows.append({'path':p.as_posix(),'hits':hits,'bytes':len(s.encode())})
out['external_js']=jsrows
Path('V8_REWARD_COMBAT_AUDIT.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))
