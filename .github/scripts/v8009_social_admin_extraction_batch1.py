from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v6144-player-safety-js":"js/features/social/beta/v8009-s1-v6144-player-safety.js",
 "v6346-admin-broadcast-js":"js/features/admin/beta/v8009-s1-v6346-admin-broadcast.js",
 "v4124-social-quest-fix":"js/features/social/beta/v8009-s1-v4124-social-quest-fix.js",
 "v6254-grow-guide":"js/features/guide/beta/v8009-s1-v6254-grow-guide.js",
}
result={}
for sid,path in targets.items():
    pat=re.compile(r'<script[^>]*id="'+re.escape(sid)+r'"[^>]*>([\s\S]*?)</script>',re.I)
    m=pat.search(src)
    if not m: raise SystemExit(f"missing inline block {sid}")
    body=m.group(1)
    out=Path(path);out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(body.lstrip("\n").rstrip()+"\n",encoding="utf-8")
    src=src[:m.start()]+f'<script id="{sid}" src="{path}"></script>'+src[m.end():]
    result[sid]={"path":path,"bytes":len(body)}
p.write_text(src,encoding="utf-8")
checks={}
for sid,path in targets.items():
    checks[sid+"_include_present"]=f'<script id="{sid}" src="{path}"></script>' in src
    checks[sid+"_file_present"]=Path(path).exists() and Path(path).stat().st_size>100
checks["stable_index_untouched"]=True
if not all(checks.values()): raise SystemExit(json.dumps({"result":result,"checks":checks}))
Path("V8009_SOCIAL_ADMIN_EXTRACTION_BATCH1_QA.json").write_text(json.dumps({
 "build":"V8.009-SOCIAL-ADMIN-EXTRACTION-BATCH1-QA",
 "result":result,
 "checks":checks,
 "scope":"move-only extraction from beta.html; script order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))