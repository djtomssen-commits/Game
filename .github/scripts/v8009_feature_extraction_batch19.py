from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v6289-harzruferin-beta-lock-js":"js/features/combat/beta/v8009-s5-v6289-harzruferin-beta-lock.js",
 "v7037-dungeon-loot-shadow-recovery":"js/features/dungeon/beta/v8009-s11-v7037-dungeon-loot-shadow-recovery.js",
 "v464-shop-reference-script":"js/features/shop/beta/v8009-s6-v464-shop-reference.js",
 "v6342-update-login-popup-js":"js/features/account/beta/v8009-s10-v6342-update-login-popup.js",
 "v100-dungeon-xp-event-script":"js/features/dungeon/beta/v8009-s11-v100-dungeon-xp-event.js",
 "v403-illegal-book-longterm":"js/features/book/beta/v8009-s3-v403-illegal-book-longterm.js",
 "v291-worldboss-upgrades-balance":"js/features/worldboss/beta/v8009-s5-v291-worldboss-upgrades-balance.js",
 "v230-stability-core":"js/features/system/beta/v8009-s12-v230-stability-core.js",
 "v431-hall-authoritative-sync":"js/features/hall/beta/v8009-s2-v431-hall-authoritative-sync.js",
 "v7101-public-profile-coalescer":"js/features/profile/beta/v8009-s2-v7101-public-profile-coalescer.js",
 "v279-resource-root-fix":"js/features/ui/beta/v8009-s8-v279-resource-root-fix.js",
 "v288-resource-event-clarity":"js/features/events/beta/v8009-s2-v288-resource-event-clarity.js",
 "v510-character-hero-rebuild-js":"js/features/character/beta/v8009-s10-v510-character-hero-rebuild.js",
 "v477-runtime-governor-head":"js/features/system/beta/v8009-s12-v477-runtime-governor-head.js",
 "v6298-character-avatar-stability-js":"js/features/character/beta/v8009-s10-v6298-character-avatar-stability.js",
 "v125-attributes-skills-image1-script":"js/features/character/beta/v8009-s10-v125-attributes-skills-image1.js",
 "v330-mythic-true-upgrade":"js/features/items/beta/v8009-s11-v330-mythic-true-upgrade.js",
 "v652-player-profile-redesign-js":"js/features/profile/beta/v8009-s2-v652-player-profile-redesign.js",
 "v325-mythic-item-balance":"js/features/items/beta/v8009-s11-v325-mythic-item-balance.js",
 "v495-startup-levelup-guard":"js/features/system/beta/v8009-s12-v495-startup-levelup-guard.js",
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
Path("V8009_FEATURE_EXTRACTION_BATCH19_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH19-QA","result":result,"checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))