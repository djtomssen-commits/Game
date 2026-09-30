from pathlib import Path
import re, json

beta=Path('beta.html').read_text(encoding='utf-8')
# Capture likely V468 config/object blocks and bossArt references around them.
hits=[]
for m in re.finditer(r'bossArt\s*[:=]\s*([^,}\n]+)', beta):
    start=max(0,m.start()-1200); end=min(len(beta),m.end()+1200)
    ctx=beta[start:end]
    nums=sorted(set(int(x) for x in re.findall(r'(?:dungeon|d|number|index)\s*[:=\[]?\s*(\d{1,2})',ctx,re.I) if 1<=int(x)<=20))
    hits.append({
      'pos':m.start(),
      'value':m.group(1).strip()[:500],
      'nearby_dungeons':nums,
      'context':ctx[:3000]
    })

# Also extract the __V468_CFG__ assignment/object neighborhood if present.
cfg=[]
for token in ('__V468_CFG__','V468_CFG','v468Cfg'):
    for m in re.finditer(re.escape(token),beta):
        cfg.append({'token':token,'pos':m.start(),'context':beta[max(0,m.start()-4000):min(len(beta),m.start()+18000)]})

report={'build':'V8.009-DUNGEON-D5-ALL-BOSS-FALLBACK-AUDIT','bossArt_hits':hits,'cfg_hits':cfg}
Path('V8009_DUNGEON_D5_ALL_BOSS_FALLBACK_AUDIT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
