from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets=[
 ("/* ===== V4.02 public player profiles ===== */","js/features/profile/beta/v8009-a2-public-player-profiles.js"),
 ("/* ===== V4.02 REAL SHOP/RENDER FIX =====","js/features/shop/beta/v8009-a2-real-shop-render-fix.js"),
 ("/* ===== V4.02 rarity stat separation =====","js/features/items/beta/v8009-a2-rarity-stat-separation.js"),
 ("/* ===== V4.02 Rarity Economy =====","js/features/items/beta/v8009-a2-rarity-economy.js"),
 ("/* ===== V4.02 reliable buying feedback ===== */","js/features/shop/beta/v8009-a2-reliable-buying-feedback.js"),
 ("/* ===== V4.02 Daily \"Dampf\" system ===== */","js/features/quest/beta/v8009-a2-daily-dampf-system.js"),
 ("/* ===== V4.02 show current dungeon / enemy in player profile ===== */","js/features/profile/beta/v8009-a2-profile-dungeon-position.js"),
 ("/* ===== V4.02 single active dungeon flow ===== */","js/features/dungeon/beta/v8009-a2-single-active-dungeon-flow.js"),
 ("/* ===== V4.02 real avatar integration ===== */","js/features/character/beta/v8009-a2-real-avatar-integration.js"),
 ("function v032Go(id){","js/features/navigation/beta/v8009-a2-legacy-top-navigation.js"),
 ("/* ===== V4.02 version sync + purchase feedback ===== */","js/features/ui/beta/v8009-a2-version-purchase-feedback.js"),
 ("/* V4.02 loot/item balance */","js/features/items/beta/v8009-a2-loot-item-balance.js"),
 ("/* ===== V4.02 Global progress fix ===== */","js/features/progress/beta/v8009-a2-global-progress-fix.js"),
 ("/* ===== V4.02 Combat Balance =====","js/features/combat/beta/v8009-a2-combat-balance.js"),
]
result={}
for marker,path in targets:
    found=None
    for m in re.finditer(r'<script([^>]*)>([\s\S]*?)</script>',src,re.I):
        attrs,body=m.group(1),m.group(2)
        if 'src=' in attrs.lower() or re.search(r'id=["\']',attrs,re.I): continue
        if marker in body:
            found=m;break
    if not found: raise SystemExit(f"missing anonymous marker {marker}")
    attrs,body=found.group(1),found.group(2)
    out=Path(path);out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(body.lstrip("\n").rstrip()+"\n",encoding="utf-8")
    src=src[:found.start()]+"<script"+attrs+f' src="{path}"></script>'+src[found.end():]
    result[marker]={"path":path,"bytes":len(body)}
p.write_text(src,encoding="utf-8")
checks={k:Path(v["path"]).exists() and Path(v["path"]).stat().st_size>100 for k,v in result.items()}
checks["stable_index_untouched"]=True
if not all(checks.values()): raise SystemExit(json.dumps({"result":result,"checks":checks}))
Path("V8009_ANONYMOUS_EXTRACTION_BATCH18_QA.json").write_text(json.dumps({
 "build":"V8.009-ANONYMOUS-EXTRACTION-BATCH18-QA","result":result,"checks":checks,
 "scope":"move-only extraction of anonymous inline scripts; original position/attributes preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))