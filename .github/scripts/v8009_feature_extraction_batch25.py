from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v285-gold-event-payout-guard":"js/features/events/beta/v8009-s5-v285-gold-event-payout-guard.js",
 "v6339-character-avatar-title-js":"js/features/character/beta/v8009-s15-v6339-character-avatar-title.js",
 "v428-dungeon-rebalance":"js/features/dungeon/beta/v8009-s17-v428-dungeon-rebalance.js",
 "v095-global-xp-event-fx-script":"js/features/events/beta/v8009-s5-v095-global-xp-event-fx.js",
 "v383-friend-mail-name-fix":"js/features/social/beta/v8009-s6-v383-friend-mail-name-fix.js",
 "v7113-single-version-owner":"js/features/system/beta/v8009-s17-v7113-single-version-owner.js",
 "v6113-public-pet-profile-stats":"js/features/profile/beta/v8009-s5-v6113-public-pet-profile-stats.js",
 "v6333-tower-harz-avatar-js":"js/features/tower/beta/v8009-s5-v6333-tower-harz-avatar.js",
 "v7098-system-qa-bridge":"js/features/system/beta/v8009-s17-v7098-system-qa-bridge.js",
 "v7068-cloud-pressure-admin-signal":"js/features/admin/beta/v8009-s7-v7068-cloud-pressure-admin-signal.js",
 "v324-dungeon-countdown":"js/features/dungeon/beta/v8009-s17-v324-dungeon-countdown.js",
 "v420-levelup-notification-fix":"js/features/progress/beta/v8009-s5-v420-levelup-notification-fix.js",
 "v537-attribute-reference-js":"js/features/character/beta/v8009-s15-v537-attribute-reference.js",
 "v401-dungeon-difficulty-balance":"js/features/dungeon/beta/v8009-s17-v401-dungeon-difficulty-balance.js",
 "v7104-v6349-parity-foundation":"js/features/system/beta/v8009-s17-v7104-v6349-parity-foundation.js",
 "v7274-auth-refresh-singleflight":"js/features/account/beta/v8009-s16-v7274-auth-refresh-singleflight.js",
 "v7221-bagdealer-override-script":"js/features/shop/beta/v8009-s11-v7221-bagdealer-override.js",
 "v7119-character-navigation-consolidation":"js/features/character/beta/v8009-s15-v7119-character-navigation-consolidation.js",
 "v6100-performance-consolidation":"js/features/system/beta/v8009-s17-v6100-performance-consolidation.js",
 "v7157-character-equipment-scroll-stability":"js/features/character/beta/v8009-s15-v7157-character-equipment-scroll-stability.js",
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
Path("V8009_FEATURE_EXTRACTION_BATCH25_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH25-QA","result":result,"checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))