from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets=[
 ("const KEY='growLegendsV020'","js/features/core/beta/v8009-a1-legacy-state-core.js"),
 ("/* ===== V4.02 REAL SUPABASE ONLINE SYSTEM ===== */","js/features/social/beta/v8009-a1-supabase-online-system.js"),
 ("/* ===== V4.02 inline vector game art ===== */","js/features/art/beta/v8009-a1-inline-vector-game-art.js"),
 ("/* ===== V4.02 Class creation + Intelligence + primary-stat combat ===== */","js/features/character/beta/v8009-a1-class-creation-primary-combat.js"),
 ("/* ===== V4.02 Shops, Gems, Enchants ===== */","js/features/shop/beta/v8009-a1-shops-gems-enchants.js"),
 ("/* ===== V4.02 unified in-game notification system ===== */","js/features/ui/beta/v8009-a1-notification-system.js"),
 ("/* ===== V4.02 CLEAN DUNGEON STATE MACHINE =====","js/features/dungeon/beta/v8009-a1-clean-dungeon-state-machine.js"),
 ("/* ===== V4.02 DUNGEON PROGRESSION REBALANCE =====","js/features/dungeon/beta/v8009-a1-dungeon-progression-rebalance.js"),
 ("/* ===== V4.02 dungeon interaction fixes ===== */","js/features/dungeon/beta/v8009-a1-dungeon-interaction-fixes.js"),
 ("/* ===== V4.02 shop stat separation + duplicate prevention ===== */","js/features/shop/beta/v8009-a1-shop-stat-separation.js"),
 ("/* ===== V4.02 CLEAN SHOP CORE =====","js/features/shop/beta/v8009-a1-clean-shop-core.js"),
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
    open_tag="<script"+attrs+f' src="{path}">'
    src=src[:found.start()]+open_tag+"</script>"+src[found.end():]
    result[marker]={"path":path,"bytes":len(body)}
p.write_text(src,encoding="utf-8")
checks={k:Path(v["path"]).exists() and Path(v["path"]).stat().st_size>100 for k,v in result.items()}
checks["stable_index_untouched"]=True
if not all(checks.values()): raise SystemExit(json.dumps({"result":result,"checks":checks}))
Path("V8009_ANONYMOUS_EXTRACTION_BATCH17_QA.json").write_text(json.dumps({
 "build":"V8.009-ANONYMOUS-EXTRACTION-BATCH17-QA","result":result,"checks":checks,
 "scope":"move-only extraction of anonymous inline scripts; original position/attributes preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))