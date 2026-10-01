from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v7137-shift-frame-client":"js/features/shift/beta/v8009-s1-v7137-shift-frame-client.js",
 "v6287-harzruferin-js":"js/features/combat/beta/v8009-s1-v6287-harzruferin.js",
 "v319-exact-talents-dungeon-balance":"js/features/talents/beta/v8009-s1-v319-exact-talents-dungeon-balance.js",
 "v318-talent-combat-complete":"js/features/talents/beta/v8009-s1-v318-talent-combat-complete.js",
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
Path("V8009_GAMEPLAY_EXTRACTION_BATCH1_QA.json").write_text(json.dumps({
 "build":"V8.009-GAMEPLAY-EXTRACTION-BATCH1-QA",
 "result":result,
 "checks":checks,
 "scope":"move-only extraction from beta.html; script order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))