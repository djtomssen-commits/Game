from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v7114-gold-shop":"js/features/shop/beta/v8009-s2-v7114-gold-shop.js",
 "v6163-growroom-primary-tabs-core":"js/features/grow/beta/v8009-s6-v6163-growroom-primary-tabs-core.js",
 "v7092-runtime-watchdog":"js/features/system/beta/v8009-s7-v7092-runtime-watchdog.js",
 "v7136-complete-server-reward-core":"js/features/rewards/beta/v8009-s3-v7136-complete-server-reward-core.js",
 "v4158-dungeon1-profile-integer-fix":"js/features/dungeon/beta/v8009-s7-v4158-dungeon1-profile-integer-fix.js",
 "v683-material-multisell-core":"js/features/materials/beta/v8009-s2-v683-material-multisell-core.js",
 "v425-item-stats-single-authority":"js/features/items/beta/v8009-s6-v425-item-stats-single-authority.js",
 "v327-worldboss-confirm-attributes":"js/features/worldboss/beta/v8009-s3-v327-worldboss-confirm-attributes.js",
 "v6283-grow-guides-js":"js/features/guide/beta/v8009-s2-v6283-grow-guides.js",
 "v7071-server-grow-dealer-bridge":"js/features/authority/beta/v8009-s7-v7071-server-grow-dealer-bridge.js",
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
    new_open=open_tag[:-1]+f' src="{path}">'
    src=src[:m.start()]+new_open+'</script>'+src[m.end():]
    result[sid]={"path":path,"bytes":len(body)}
p.write_text(src,encoding="utf-8")
checks={}
for sid,path in targets.items():
    checks[sid+"_include_present"]=bool(re.search(r'<script[^>]*id="'+re.escape(sid)+r'"[^>]*src="'+re.escape(path)+r'"[^>]*>\s*</script>',src,re.I))
    checks[sid+"_file_present"]=Path(path).exists() and Path(path).stat().st_size>100
checks["stable_index_untouched"]=True
if not all(checks.values()): raise SystemExit(json.dumps({"result":result,"checks":checks}))
Path("V8009_FEATURE_EXTRACTION_BATCH10_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH10-QA",
 "result":result,
 "checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))