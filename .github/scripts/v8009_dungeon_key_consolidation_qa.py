from pathlib import Path
import re,json
ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)
targets=["claimQuest","v233ClaimQuest","persist","v065RenderWorld","v067OpenDungeon","dungeonUnlocked"]
counts={t:[] for t in targets}
for order,src in enumerate(srcs):
 p=ROOT/src
 if not p.exists() or p.suffix.lower()!=".js": continue
 try: txt=p.read_text(encoding="utf-8",errors="ignore")
 except: continue
 for t in targets:
  pats=[
   rf'\b{t}\s*=\s*function',
   rf'window\.{t}\s*=',
   rf'const\s+\w+\s*=\s*{t}\b',
   rf'let\s+\w+\s*=\s*window\.{t}\b',
   rf'typeof\s+{t}\s*===',
   rf'typeof\s+window\.{t}\s*===',
  ]
  if any(re.search(pat,txt) for pat in pats):
   counts[t].append({"order":order,"src":src})
removed=[
"js/features/dungeon/beta/v8009-s10-v458-key-live-unlock.js",
"js/features/dungeon/beta/v8009-s10-v4100-dungeon-key-live-fix.js",
"js/features/dungeon/beta/v8009-s10-v4150-live-dungeon-key-authority.js",
"js/features/dungeon/beta/v8009-s9-v497-dungeon-key-immediate-live-unlock.js"
]
v467="js/features/dungeon/beta/v8009-s5-v467-hard-live-dungeon-key-authority.js"
payload={
 "build":"V8.009-DUNGEON-KEY-CONSOLIDATION-QA",
 "external_script_count":len(srcs),
 "wrapper_counts":{k:len(v) for k,v in counts.items()},
 "wrapper_sources":counts,
 "checks":{
   "v467_loaded":v467 in srcs and (ROOT/v467).exists(),
   "removed_layers_absent":all(x not in srcs and not (ROOT/x).exists() for x in removed),
   "inline_script_count":len(re.findall(r'<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?</script>',beta,re.I)),
   "inline_style_count":len(re.findall(r'<style\b',beta,re.I))
 }
}
(ROOT/"V8009_DUNGEON_KEY_CONSOLIDATION_QA.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
if not payload["checks"]["v467_loaded"] or not payload["checks"]["removed_layers_absent"] or payload["checks"]["inline_script_count"] or payload["checks"]["inline_style_count"]:
 raise SystemExit(json.dumps(payload,ensure_ascii=False))
print(json.dumps(payload,ensure_ascii=False))
