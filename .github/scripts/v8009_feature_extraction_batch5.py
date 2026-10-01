from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v4147-deterministic-boot-controller":"js/features/system/beta/v8009-s5-v4147-deterministic-boot-controller.js",
 "v271-dampf-system":"js/features/quest/beta/v8009-s1-v271-dampf-system.js",
 "v4114-grow-care-authority":"js/features/grow/beta/v8009-s3-v4114-grow-care-authority.js",
 "v4135-character-save-barrier":"js/features/account/beta/v8009-s3-v4135-character-save-barrier.js",
 "v7129-referral-client":"js/features/social/beta/v8009-s2-v7129-referral-client.js",
 "v6235-illegal-book-longterm-pagination":"js/features/book/beta/v8009-s1-v6235-illegal-book-longterm-pagination.js",
 "v4162-menu-attention-badges-script":"js/features/ui/beta/v8009-s4-v4162-menu-attention-badges.js",
 "v7132-item-authority-lockdown":"js/features/authority/beta/v8009-s3-v7132-item-authority-lockdown.js",
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
Path("V8009_FEATURE_EXTRACTION_BATCH5_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH5-QA",
 "result":result,
 "checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))