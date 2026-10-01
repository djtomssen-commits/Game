from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v494-production-dungeon-fix-script":"js/features/dungeon/beta/v8009-s10-v494-production-dungeon-fix.js",
 "v7079-pet-server-authority":"js/features/pets/beta/v8009-s2-v7079-pet-server-authority.js",
 "v458-key-live-unlock":"js/features/dungeon/beta/v8009-s10-v458-key-live-unlock.js",
 "v6102-character-equipment-scroll-fix":"js/features/character/beta/v8009-s8-v6102-character-equipment-scroll-fix.js",
 "v7272-navigation-pictogram-js":"js/features/ui/beta/v8009-s7-v7272-navigation-pictogram.js",
 "v111-worldboss-visual-fix-script":"js/features/worldboss/beta/v8009-s5-v111-worldboss-visual-fix.js",
 "v4100-dungeon-key-live-fix":"js/features/dungeon/beta/v8009-s10-v4100-dungeon-key-live-fix.js",
 "v085-world-dashboard-script":"js/features/world/beta/v8009-s1-v085-world-dashboard.js",
 "v145-account-isolation-fix":"js/features/account/beta/v8009-s8-v145-account-isolation-fix.js",
 "v4150-live-dungeon-key-authority":"js/features/dungeon/beta/v8009-s10-v4150-live-dungeon-key-authority.js",
 "v7144-responsiveness-dungeon-core":"js/features/dungeon/beta/v8009-s10-v7144-responsiveness-dungeon-core.js",
 "v684-inventory-rarity-final-core":"js/features/character/beta/v8009-s8-v684-inventory-rarity-final-core.js"
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
Path("V8009_FEATURE_EXTRACTION_BATCH13_QA.json").write_text(json.dumps({"build":"V8.009-FEATURE-EXTRACTION-BATCH13-QA","result":result},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(result,ensure_ascii=False))
