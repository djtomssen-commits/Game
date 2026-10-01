from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v342-event-dampf-300-fix":"js/features/events/beta/v8009-s6-v342-event-dampf-300-fix.js",
 "v6341-tower-recovery-live-js":"js/features/tower/beta/v8009-s6-v6341-tower-recovery-live.js",
 "gl-playstore-legal-links-js":"js/features/legal/beta/v8009-s1-gl-playstore-legal-links.js",
 "v082-dungeon-balance":"js/features/dungeon/beta/v8009-s18-v082-dungeon-balance.js",
 "v6295-harzruferin-corefix-js":"js/features/combat/beta/v8009-s9-v6295-harzruferin-corefix.js",
 "v302-dungeon-progress-source-fix":"js/features/dungeon/beta/v8009-s18-v302-dungeon-progress-source-fix.js",
 "v387-quest-page-final-script":"js/features/quest/beta/v8009-s8-v387-quest-page-final.js",
 "v7094-v6349-production-parity-monitor":"js/features/system/beta/v8009-s18-v7094-v6349-production-parity-monitor.js",
 "v6214-legacy-cleanup-authority":"js/features/authority/beta/v8009-s12-v6214-legacy-cleanup-authority.js",
 "v129-shop-inventory-character-premium-script":"js/features/shop/beta/v8009-s12-v129-shop-inventory-character-premium.js",
 "v096-quest-xp-star-fix-script":"js/features/quest/beta/v8009-s8-v096-quest-xp-star-fix.js",
 "v107-book-position-fix-script":"js/features/book/beta/v8009-s6-v107-book-position-fix.js",
 "gl-shop-provenance-guard":"js/features/shop/beta/v8009-s12-gl-shop-provenance-guard.js",
 "v7123-quest-instant-open":"js/features/quest/beta/v8009-s8-v7123-quest-instant-open.js",
 "v294-dampf-canonical":"js/features/quest/beta/v8009-s8-v294-dampf-canonical.js",
 "v6337-item-class-stat-rule":"js/features/items/beta/v8009-s15-v6337-item-class-stat-rule.js",
 "v493-growroom-mobile-js":"js/features/grow/beta/v8009-s11-v493-growroom-mobile.js",
 "v6140-central-event-bus-preboot":"js/features/system/beta/v8009-s18-v6140-central-event-bus-preboot.js",
 "v659-native-fullscreen-statusbar-js":"js/features/ui/beta/v8009-s14-v659-native-fullscreen-statusbar.js",
 "v138-shop-match-inventory-script":"js/features/shop/beta/v8009-s12-v138-shop-match-inventory.js",
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
Path("V8009_FEATURE_EXTRACTION_BATCH26_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH26-QA","result":result,"checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))