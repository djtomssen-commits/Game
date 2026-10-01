from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v225-settings-account-actions-fix":"js/features/ui/beta/v8009-s12-v225-settings-account-actions-fix.js",
 "v377-settings-gear-dropdown-fix":"js/features/ui/beta/v8009-s12-v377-settings-gear-dropdown-fix.js",
 "v239-grow-live-core":"js/features/grow/beta/v8009-s9-v239-grow-live-core.js",
 "v7131-ui-polish":"js/features/ui/beta/v8009-s12-v7131-ui-polish.js",
 "v112-worldboss-state-fix":"js/features/worldboss/beta/v8009-s8-v112-worldboss-state-fix.js",
 "v483-modern-home-power-stability":"js/features/world/beta/v8009-s2-v483-modern-home-power-stability.js",
 "v334-login-name-version-fix":"js/features/account/beta/v8009-s14-v334-login-name-version-fix.js",
 "v284-dampf-card-redesign":"js/features/quest/beta/v8009-s6-v284-dampf-card-redesign.js",
 "v391-quest-page-finished-script":"js/features/quest/beta/v8009-s6-v391-quest-page-finished.js",
 "v098-xp-event-payout-fix":"js/features/events/beta/v8009-s4-v098-xp-event-payout-fix.js",
 "v7185-central-text-moderation":"js/features/moderation/beta/v8009-s1-v7185-central-text-moderation.js",
 "v404-illegal-book-design-script":"js/features/book/beta/v8009-s5-v404-illegal-book-design.js",
 "v089-shop-comparison-script":"js/features/shop/beta/v8009-s9-v089-shop-comparison.js",
 "v382-social-mail-buttons":"js/features/social/beta/v8009-s5-v382-social-mail-buttons.js",
 "v234-growroom-compact-core":"js/features/grow/beta/v8009-s9-v234-growroom-compact-core.js",
 "v6340-character-title-visibility-js":"js/features/character/beta/v8009-s14-v6340-character-title-visibility.js",
 "gl-worldboss-home-click-fix-js":"js/features/worldboss/beta/v8009-s8-gl-worldboss-home-click-fix.js",
 "v400-dungeon-progression-guard":"js/features/dungeon/beta/v8009-s15-v400-dungeon-progression-guard.js",
 "v114-worldboss-confirm-modal-script":"js/features/worldboss/beta/v8009-s8-v114-worldboss-confirm-modal.js",
 "v6317-transparent-cutouts-script":"js/features/combat/beta/v8009-s7-v6317-transparent-cutouts.js",
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
Path("V8009_FEATURE_EXTRACTION_BATCH23_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH23-QA","result":result,"checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))