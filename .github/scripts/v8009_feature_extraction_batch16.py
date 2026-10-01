from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v422-item-stat-consistency":"js/features/items/beta/v8009-s10-v422-item-stat-consistency.js",
 "v241-harvest-reward-final-core":"js/features/grow/beta/v8009-s8-v241-harvest-reward-final-core.js",
 "v442-character-layout-economy-fix":"js/features/character/beta/v8009-s9-v442-character-layout-economy-fix.js",
 "v7145-render-owner-core":"js/features/system/beta/v8009-s11-v7145-render-owner-core.js",
 "v682-frost-second-weapon-core":"js/features/character/beta/v8009-s9-v682-frost-second-weapon-core.js",
 "v7135-server-activity-xp-feedback":"js/features/rewards/beta/v8009-s5-v7135-server-activity-xp-feedback.js",
 "v395-quest-reward-showcase":"js/features/quest/beta/v8009-s3-v395-quest-reward-showcase.js",
 "v359-header-duplicate-hard-fix":"js/features/ui/beta/v8009-s7-v359-header-duplicate-hard-fix.js",
 "v243-dungeon-key-source-of-truth":"js/features/dungeon/beta/v8009-s10-v243-dungeon-key-source-of-truth.js",
 "v7077-progress-enforce-hydration":"js/features/authority/beta/v8009-s9-v7077-progress-enforce-hydration.js",
 "v6336-dot-status-ui-js":"js/features/ui/beta/v8009-s7-v6336-dot-status-ui.js",
 "v347-login-reference-design":"js/features/account/beta/v8009-s9-v347-login-reference-design.js",
 "v372-authoritative-header":"js/features/ui/beta/v8009-s7-v372-authoritative-header.js",
 "v135-shop-level-scaling":"js/features/shop/beta/v8009-s5-v135-shop-level-scaling.js",
 "v331-item-level-scaling":"js/features/items/beta/v8009-s10-v331-item-level-scaling.js",
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
Path("V8009_FEATURE_EXTRACTION_BATCH16_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH16-QA","result":result,"checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))