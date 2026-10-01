from pathlib import Path
import json

src = Path("beta.html").read_text(encoding="utf-8")
lines = src.splitlines()

targets = [
    "v306PaintFirstDailyQuestHarz",
    "v300ReconcileTimedEvents",
    "v301CheckIdle",
    "v322OpenDealer",
    "v6317Observed",
    "v484OpenDailyLogin",
    "v4107Run",
]

out = {"build":"V8.009-REMAINING-INLINE-LIFECYCLE-AUDIT","targets":{}}
for target in targets:
    hits=[]
    for idx,line in enumerate(lines):
        if target in line:
            lo=max(0,idx-8); hi=min(len(lines),idx+9)
            hits.append({
                "line":idx+1,
                "text":line.strip(),
                "context":[{"line":j+1,"text":lines[j].rstrip()} for j in range(lo,hi)]
            })
    out["targets"][target]=hits

Path("V8009_REMAINING_INLINE_LIFECYCLE_AUDIT.json").write_text(
    json.dumps(out,indent=2,ensure_ascii=False)+"\n", encoding="utf-8"
)
print("wrote remaining inline lifecycle audit")
