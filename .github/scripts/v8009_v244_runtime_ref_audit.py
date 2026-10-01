from pathlib import Path
import re,json
ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)
target="js/features/dungeon/beta/v8009-s9-v244-dungeon-detail-map-final.js"
names=["v244DungeonRoomName","v244DungeonRoomLevel","v244RenderSelectedDungeonMap"]
refs={}
for name in names:
 hits=[]
 if name in beta:hits.append("beta.html")
 for src in srcs:
  if src==target:continue
  p=ROOT/src
  if not p.exists() or p.suffix.lower()!=".js":continue
  txt=p.read_text(encoding="utf-8",errors="ignore")
  if name in txt:hits.append(src)
 refs[name]=hits
payload={"build":"V8.009-V244-RUNTIME-REF-AUDIT","target":target,"refs":refs}
(ROOT/"V8009_V244_RUNTIME_REF_AUDIT.json").write_text(json.dumps(payload,indent=2)+"\n",encoding="utf-8")
print(json.dumps(payload))
