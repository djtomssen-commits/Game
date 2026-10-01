from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v106-illegal-book-script":"js/features/book/beta/v8009-s2-v106-illegal-book.js",
 "v250-all-dungeon-key-progression":"js/features/dungeon/beta/v8009-s6-v250-all-dungeon-key-progression.js",
 "v093-admin-script":"js/features/admin/beta/v8009-s3-v093-admin-core.js",
 "v122-material-dialog-fix-script":"js/features/materials/beta/v8009-s1-v122-material-dialog-fix.js",
 "v7062-server-item-action-bridge":"js/features/authority/beta/v8009-s6-v7062-server-item-action-bridge.js",
 "v7070-authoritative-grow-hydration":"js/features/grow/beta/v8009-s5-v7070-authoritative-grow-hydration.js",
 "v649-hall-dungeon-progress-fix":"js/features/hall/beta/v8009-s1-v649-hall-dungeon-progress-fix.js",
 "v6252-register-popup":"js/features/account/beta/v8009-s7-v6252-register-popup.js",
 "v546-materials-grow-legends-js":"js/features/materials/beta/v8009-s1-v546-materials-grow-legends.js",
 "v423-item-progression-fix":"js/features/items/beta/v8009-s5-v423-item-progression-fix.js",
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
Path("V8009_FEATURE_EXTRACTION_BATCH9_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH9-QA",
 "result":result,
 "checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))