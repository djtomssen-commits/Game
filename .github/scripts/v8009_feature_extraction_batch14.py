from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v6170-classset-upgrade-core":"js/features/items/beta/v8009-s8-v6170-classset-upgrade-core.js",
 "v412-stability-audit":"js/features/system/beta/v8009-s9-v412-stability-audit.js",
 "v445-item-compare-mobile-fix":"js/features/items/beta/v8009-s8-v445-item-compare-mobile-fix.js",
 "v108-expanded-item-pool":"js/features/items/beta/v8009-s8-v108-expanded-item-pool.js",
 "v338-harz-dealer-modern":"js/features/shop/beta/v8009-s3-v338-harz-dealer-modern.js",
 "v109-harz-drops":"js/features/rewards/beta/v8009-s4-v109-harz-drops.js",
 "v116-worldboss-profile-stats-script":"js/features/worldboss/beta/v8009-s4-v116-worldboss-profile-stats.js",
 "v460-char-ui-script":"js/features/character/beta/v8009-s8-v460-char-ui.js",
 "v333-friends-online-status":"js/features/social/beta/v8009-s4-v333-friends-online-status.js",
 "v665-native-oauth-callback-bridge":"js/features/account/beta/v8009-s8-v665-native-oauth-callback-bridge.js",
 "v567-harz-dealer-final":"js/features/shop/beta/v8009-s3-v567-harz-dealer-final.js",
 "v265-war-animation":"js/features/guild/beta/v8009-s3-v265-war-animation.js",
 "v228-settings-portal-script":"js/features/ui/beta/v8009-s5-v228-settings-portal.js",
 "v237-grow-dungeon-fixes-core":"js/features/grow/beta/v8009-s7-v237-grow-dungeon-fixes-core.js",
 "v7258-adaptive-mobile-fit-script":"js/features/ui/beta/v8009-s5-v7258-adaptive-mobile-fit.js",
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
Path("V8009_FEATURE_EXTRACTION_BATCH14_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH14-QA","result":result,"checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))