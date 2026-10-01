from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v323-profile-dungeon-canonical-fix":"js/features/profile/beta/v8009-s4-v323-profile-dungeon-canonical-fix.js",
 "v4142-admin-systemtechnik-authority":"js/features/admin/beta/v8009-s6-v4142-admin-systemtechnik-authority.js",
 "v139-real-shop-rarity-fix-script":"js/features/shop/beta/v8009-s10-v139-real-shop-rarity-fix.js",
 "v658-header-menu-offset-js":"js/features/ui/beta/v8009-s13-v658-header-menu-offset.js",
 "v090-shop-comparison-fix-script":"js/features/shop/beta/v8009-s10-v090-shop-comparison-fix.js",
 "v335-no-levelup-popup-login":"js/features/account/beta/v8009-s15-v335-no-levelup-popup-login.js",
 "v496-og-retire-fragment-balance-js":"js/features/grow/beta/v8009-s10-v496-og-retire-fragment-balance.js",
 "v245-dungeon2-balance-final":"js/features/dungeon/beta/v8009-s16-v245-dungeon2-balance-final.js",
 "v6243-weekly-chest-audit-fix":"js/features/rewards/beta/v8009-s8-v6243-weekly-chest-audit-fix.js",
 "gl-push-master-switch-controller-v1":"js/features/push/beta/v8009-s4-gl-push-master-switch-controller.js",
 "v102-levelup-observer":"js/features/progress/beta/v8009-s4-v102-levelup-observer.js",
 "v315-new-player-dampf-event-grant-fix":"js/features/quest/beta/v8009-s7-v315-new-player-dampf-event-grant-fix.js",
 "v201-startpage-fix":"js/features/world/beta/v8009-s3-v201-startpage-fix.js",
 "v278-resource-stability-script":"js/features/ui/beta/v8009-s13-v278-resource-stability.js",
 "v7103-shared-combat-presentation":"js/features/combat/beta/v8009-s8-v7103-shared-combat-presentation.js",
 "v7230-server-frame-isolation":"js/features/account/beta/v8009-s15-v7230-server-frame-isolation.js",
 "v7135-absolute-final-version-owner":"js/features/system/beta/v8009-s16-v7135-absolute-final-version-owner.js",
 "v7233-server-scoped-storage":"js/features/account/beta/v8009-s15-v7233-server-scoped-storage.js",
 "v6321-companion-actor-render-fix-js":"js/features/combat/beta/v8009-s8-v6321-companion-actor-render-fix.js",
 "v654-global-header-layout-fix-js":"js/features/ui/beta/v8009-s13-v654-global-header-layout-fix.js",
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
Path("V8009_FEATURE_EXTRACTION_BATCH24_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH24-QA","result":result,"checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))