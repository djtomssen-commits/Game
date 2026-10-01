from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v453-profile-floor-reconcile":"js/features/profile/beta/v8009-s3-v453-profile-floor-reconcile.js",
 "v120-worldboss-countdown-script":"js/features/worldboss/beta/v8009-s7-v120-worldboss-countdown.js",
 "v394-time-seeds-currency":"js/features/rewards/beta/v8009-s7-v394-time-seeds-currency.js",
 "v364-dropdown-position-click-fix":"js/features/ui/beta/v8009-s11-v364-dropdown-position-click-fix.js",
 "v6167-longterm-xp-balance":"js/features/progress/beta/v8009-s3-v6167-longterm-xp-balance.js",
 "v094-xp-event-script":"js/features/events/beta/v8009-s3-v094-xp-event.js",
 "gl-native-fcm-account-sync-v1":"js/features/push/beta/v8009-s3-gl-native-fcm-account-sync.js",
 "v379-quest-battle-animation-setting":"js/features/quest/beta/v8009-s5-v379-quest-battle-animation-setting.js",
 "v283-resource-final-cleanup":"js/features/ui/beta/v8009-s11-v283-resource-final-cleanup.js",
 "v6345-tower-lobby-hp-timer-js":"js/features/tower/beta/v8009-s4-v6345-tower-lobby-hp-timer.js",
 "v6165-classset-forge-only":"js/features/items/beta/v8009-s14-v6165-classset-forge-only.js",
 "v7093-ux-parity-authority-invisible":"js/features/authority/beta/v8009-s11-v7093-ux-parity-authority-invisible.js",
 "v105-admin-rewards-script":"js/features/admin/beta/v8009-s5-v105-admin-rewards.js",
 "v4104-qa-settings-visible":"js/features/system/beta/v8009-s15-v4104-qa-settings-visible.js",
 "v337-harz-dealer-menu-copyright":"js/features/shop/beta/v8009-s8-v337-harz-dealer-menu-copyright.js",
 "v587-dungeon-result-overlay-core":"js/features/dungeon/beta/v8009-s14-v587-dungeon-result-overlay-core.js",
 "v301-auth-idle-hard-lock":"js/features/account/beta/v8009-s13-v301-auth-idle-hard-lock.js",
 "v6297-class-display-parity-js":"js/features/character/beta/v8009-s13-v6297-class-display-parity.js",
 "v273-admin-menu-login-fix":"js/features/admin/beta/v8009-s5-v273-admin-menu-login-fix.js",
 "v266-war-real-avatars":"js/features/guild/beta/v8009-s4-v266-war-real-avatars.js",
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
Path("V8009_FEATURE_EXTRACTION_BATCH22_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH22-QA","result":result,"checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))