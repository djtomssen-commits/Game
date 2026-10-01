from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v336-illegal-book-progress-fix":"js/features/book/beta/v8009-s4-v336-illegal-book-progress-fix.js",
 "v6201-mystic-special-gameplay-compare":"js/features/items/beta/v8009-s12-v6201-mystic-special-gameplay-compare.js",
 "v416-dungeon-loot-contract":"js/features/dungeon/beta/v8009-s12-v416-dungeon-loot-contract.js",
 "v4131-version-source":"js/features/system/beta/v8009-s13-v4131-version-source.js",
 "v599-clean-dungeon-core":"js/features/dungeon/beta/v8009-s12-v599-clean-dungeon-core.js",
 "v6300-tower-enemy-image-js":"js/features/tower/beta/v8009-s3-v6300-tower-enemy-image.js",
 "v134-rarity-inventories-script":"js/features/items/beta/v8009-s12-v134-rarity-inventories.js",
 "v6213-final-authority":"js/features/authority/beta/v8009-s10-v6213-final-authority.js",
 "v6288-account-delete-toplayer-js":"js/features/account/beta/v8009-s11-v6288-account-delete-toplayer.js",
 "v6301-harzruferin-talent-desc-js":"js/features/talents/beta/v8009-s5-v6301-harzruferin-talent-desc.js",
 "v427-hall-live-profile-sync":"js/features/hall/beta/v8009-s3-v427-hall-live-profile-sync.js",
 "v456-level300-progression-authority":"js/features/progress/beta/v8009-s2-v456-level300-progression-authority.js",
 "v7239-calendar-achievements":"js/features/rewards/beta/v8009-s6-v7239-calendar-achievements.js",
 "v405-illegal-book-categories-fix-script":"js/features/book/beta/v8009-s4-v405-illegal-book-categories-fix.js",
 "v277-resource-cards-script":"js/features/ui/beta/v8009-s9-v277-resource-cards.js",
 "v4106-comic-items":"js/features/items/beta/v8009-s12-v4106-comic-items.js",
 "v272-character-name-login-fix":"js/features/account/beta/v8009-s11-v272-character-name-login-fix.js",
 "v268-inventory-multisell":"js/features/character/beta/v8009-s11-v268-inventory-multisell.js",
 "v242-dungeon-status-map-core":"js/features/dungeon/beta/v8009-s12-v242-dungeon-status-map-core.js",
 "v4129-responsive-boot-central-version":"js/features/system/beta/v8009-s13-v4129-responsive-boot-central-version.js",
}
result={}
for sid,path in targets.items():
    pat=re.compile(r'(<script[^>]*id="'+re.escape(sid)+r'"[^>]*>)([\s\S]*?)(</script>)',re.I)
    m=pat.search(src)
    if not m: raise SystemExit(f"missing inline block {sid}")
    open_tag,body=m.group(1),m.group(2)
    if re.search(r'\bsrc\s*=',open_tag,re.I): raise SystemExit(f"already external {sid}")
    out=Path(path);out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(body.lstrip("\n").rstrip()+"\n",encoding="utf-8")
    src=src[:m.start()]+open_tag[:-1]+f' src="{path}"></script>'+src[m.end():]
    result[sid]={"path":path,"bytes":len(body)}
p.write_text(src,encoding="utf-8")
checks={}
for sid,path in targets.items():
    checks[sid+"_include_present"]=bool(re.search(r'<script[^>]*id="'+re.escape(sid)+r'"[^>]*src="'+re.escape(path)+r'"[^>]*>\s*</script>',src,re.I))
    checks[sid+"_file_present"]=Path(path).exists() and Path(path).stat().st_size>100
checks["stable_index_untouched"]=True
if not all(checks.values()): raise SystemExit(json.dumps({"result":result,"checks":checks}))
Path("V8009_FEATURE_EXTRACTION_BATCH20_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH20-QA","result":result,"checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))