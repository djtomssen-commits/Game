from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v498-growroom-persistence-fix":"js/features/grow/beta/v8009-s7-v498-growroom-persistence-fix.js",
 "v6201-worldboss-real-art-script":"js/features/worldboss/beta/v8009-s4-v6201-worldboss-real-art.js",
 "v438-hall-live-row-authority":"js/features/hall/beta/v8009-s2-v438-hall-live-row-authority.js",
 "v497-dungeon-key-immediate-live-unlock":"js/features/dungeon/beta/v8009-s9-v497-dungeon-key-immediate-live-unlock.js",
 "v252-modern-animated-dungeon-combat-core":"js/features/dungeon/beta/v8009-s9-v252-modern-animated-dungeon-combat-core.js",
 "v244-dungeon-detail-map-final":"js/features/dungeon/beta/v8009-s9-v244-dungeon-detail-map-final.js",
 "v117-modern-confirm-migration":"js/features/ui/beta/v8009-s5-v117-modern-confirm-migration.js",
 "v121-rarity-value-fix":"js/features/items/beta/v8009-s8-v121-rarity-value-fix.js"
}
result={}
for sid,path in targets.items():
    m=re.search(r'(<script[^>]*id="'+re.escape(sid)+r'"[^>]*>)([\s\S]*?)(</script>)',src,re.I)
    if not m: raise SystemExit(f"missing {sid}")
    open_tag,body=m.group(1),m.group(2)
    if re.search(r'\bsrc\s*=',open_tag,re.I): raise SystemExit(f"external {sid}")
    out=Path(path);out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(body.lstrip("\n").rstrip()+"\n",encoding="utf-8")
    src=src[:m.start()]+open_tag[:-1]+f' src="{path}"></script>'+src[m.end():]
    result[sid]={"path":path,"bytes":len(body)}
p.write_text(src,encoding="utf-8")
Path("V8009_FEATURE_EXTRACTION_BATCH12A_QA.json").write_text(json.dumps({"build":"V8.009-FEATURE-EXTRACTION-BATCH12A-QA","result":result},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(result,ensure_ascii=False))
