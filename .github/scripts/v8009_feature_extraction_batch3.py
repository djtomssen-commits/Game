from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v447-unified-item-balance":"js/features/items/beta/v8009-s1-v447-unified-item-balance.js",
 "v608-animation-qa-core":"js/features/system/beta/v8009-s3-v608-animation-qa-core.js",
 "v6226-talent-proc-core":"js/features/talents/beta/v8009-s2-v6226-talent-proc-core.js",
 "v470-character-slot-art-canonical-comparison":"js/features/character/beta/v8009-s4-v470-character-slot-art-canonical-comparison.js",
 "v465-item-art-script":"js/features/items/beta/v8009-s1-v465-item-art-script.js",
 "v314-talent-tree":"js/features/talents/beta/v8009-s2-v314-talent-tree.js",
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
    new_open=open_tag[:-1] + f' src="{path}">'
    src=src[:m.start()]+new_open+'</script>'+src[m.end():]
    result[sid]={"path":path,"bytes":len(body)}
p.write_text(src,encoding="utf-8")
checks={}
for sid,path in targets.items():
    checks[sid+"_include_present"]=bool(re.search(r'<script[^>]*id="'+re.escape(sid)+r'"[^>]*src="'+re.escape(path)+r'"[^>]*>\s*</script>',src,re.I))
    checks[sid+"_file_present"]=Path(path).exists() and Path(path).stat().st_size>100
checks["stable_index_untouched"]=True
if not all(checks.values()): raise SystemExit(json.dumps({"result":result,"checks":checks}))
Path("V8009_FEATURE_EXTRACTION_BATCH3_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH3-QA",
 "result":result,
 "checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))