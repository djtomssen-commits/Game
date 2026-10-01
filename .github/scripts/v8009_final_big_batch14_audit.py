from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=[
 "[0,120,700,2200,6500,20000].forEach(ms=>setTimeout(()=>{installAchievements();installBuffBridge();if(window.GL_EVENTS)installEventDrops();else{installQuestDrops();installDungeonDrops();installPvpDrops();}syncGrowUi();paintIndicators();paintCharacter();stamp()},ms))",
 "function installAchievements",
 "function installBuffBridge",
 "function installEventDrops",
 "function installQuestDrops",
 "function installDungeonDrops",
 "function installPvpDrops",
 "[0,250,900].forEach(ms=>setTimeout(repairCurrentEnemy,ms))",
 "function repairCurrentEnemy",
 "decorateOpenProfile(id)"
]
out={}
for n in needles:
 arr=[];start=0
 while True:
  i=src.find(n,start)
  if i<0:break
  arr.append({"index":i,"context":src[max(0,i-3000):i+6500]})
  start=i+1
 out[n]=arr[:20]
Path("V8009_FINAL_BIG_BATCH14_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print({k:len(v) for k,v in out.items()})