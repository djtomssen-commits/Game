from pathlib import Path
import json,re

beta=Path("beta.html").read_text(encoding="utf-8")
paths={
 "v411":"js/features/guild/legacy/13-v411-guild-xp-system.js",
 "v440":"js/features/guild/legacy/18-v440-quest-guild-xp-final-owner.js",
 "v474":"js/features/guild/legacy/20-v474-guild-home-authority-script.js",
 "v7045":"js/features/quest/beta/v7045-atomic-quest-receipt-client.js",
}
src={k:Path(v).read_text(encoding="utf-8") for k,v in paths.items()}

m=re.search(r'<script[^>]*id=["\']v6140-central-game-event-bridge["\'][^>]*>(.*?)</script>',beta,re.S|re.I)
v6140=m.group(1) if m else ""

def count(s,needle): return s.count(needle)
def has(s,needle): return needle in s

result={
 "build":"V8.009-QUEST-CLAIM-GUILD-AUDIT",
 "v6140_found":bool(v6140),
 "v6140_bytes":len(v6140.encode("utf-8")),
 "v6140":{
   "claim_writers":count(v6140,"claimQuest=")+count(v6140,"window.claimQuest="),
   "v233_writers":count(v6140,"v233ClaimQuest=")+count(v6140,"window.v233ClaimQuest="),
   "calls_v474_award":has(v6140,"v474AwardGuildActivity"),
   "calls_v411_award":has(v6140,"v411AwardGuildActivity"),
   "dispatches_custom_event":("dispatchEvent" in v6140),
   "quest_mentions":len(re.findall(r"quest",v6140,re.I)),
   "guild_mentions":len(re.findall(r"guild",v6140,re.I)),
 },
 "layers":{
   k:{
     "claim_writers":count(s,"claimQuest=")+count(s,"window.claimQuest="),
     "v233_writers":count(s,"v233ClaimQuest=")+count(s,"window.v233ClaimQuest="),
     "calls_v474_award":has(s,"v474AwardGuildActivity"),
     "calls_v411_award":has(s,"v411AwardGuildActivity"),
     "has_beta_guard":("IS_BETA" in s),
     "event_bus_guard":("__V6140_EVENT_BUS__" in s),
   } for k,s in src.items()
 },
 "v6140_excerpt":[line.strip() for line in v6140.splitlines() if any(x in line for x in (
   "claimQuest","v233ClaimQuest","quest","guild","dispatchEvent","CustomEvent"
 ))][:120],
}
Path("V8009_QUEST_CLAIM_GUILD_AUDIT.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps(result,ensure_ascii=False,indent=2))
