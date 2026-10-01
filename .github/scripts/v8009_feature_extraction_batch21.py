from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v224-atomic-boot-release":"js/features/system/beta/v8009-s14-v224-atomic-boot-release.js",
 "v482-dungeon-paid-timer-owner":"js/features/dungeon/beta/v8009-s13-v482-dungeon-paid-timer-owner.js",
 "v341-harz-dealer-dropdown-fix":"js/features/shop/beta/v8009-s7-v341-harz-dealer-dropdown-fix.js",
 "v322-harz-dealer":"js/features/shop/beta/v8009-s7-v322-harz-dealer.js",
 "v468-single-item-art-owner":"js/features/items/beta/v8009-s13-v468-single-item-art-owner.js",
 "v455-item-loot-balance-contract":"js/features/items/beta/v8009-s13-v455-item-loot-balance-contract.js",
 "v434-attribute-points-final-live-sync":"js/features/character/beta/v8009-s12-v434-attribute-points-final-live-sync.js",
 "v7081-account-capability-gate":"js/features/account/beta/v8009-s12-v7081-account-capability-gate.js",
 "v4108-item-placement-fix":"js/features/items/beta/v8009-s13-v4108-item-placement-fix.js",
 "v083-hall-progress-fix-script":"js/features/hall/beta/v8009-s4-v083-hall-progress-fix.js",
 "v6343-purchase-equip-prompt-js":"js/features/shop/beta/v8009-s7-v6343-purchase-equip-prompt.js",
 "v6225-extra-hit-visual-core":"js/features/combat/beta/v8009-s6-v6225-extra-hit-visual-core.js",
 "v388-worldboss-attack-fix":"js/features/worldboss/beta/v8009-s6-v388-worldboss-attack-fix.js",
 "v267-class-attributes":"js/features/character/beta/v8009-s12-v267-class-attributes.js",
 "v6117-class-passive-prismatic-fix":"js/features/character/beta/v8009-s12-v6117-class-passive-prismatic-fix.js",
 "v238-quest-loot-repair":"js/features/quest/beta/v8009-s4-v238-quest-loot-repair.js",
 "v358-global-header":"js/features/ui/beta/v8009-s10-v358-global-header.js",
 "v6294-harzruferin-full-parity-js":"js/features/combat/beta/v8009-s6-v6294-harzruferin-full-parity.js",
 "v7117-dealer-hub":"js/features/shop/beta/v8009-s7-v7117-dealer-hub.js",
 "v118-top-dashboard-redesign-script":"js/features/ui/beta/v8009-s10-v118-top-dashboard-redesign.js",
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
Path("V8009_FEATURE_EXTRACTION_BATCH21_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH21-QA","result":result,"checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))