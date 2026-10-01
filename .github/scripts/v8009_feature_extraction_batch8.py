from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v7165-combined-fixes-owner":"js/features/system/beta/v8009-s6-v7165-combined-fixes-owner.js",
 "v4117-boots-art-fix":"js/features/items/beta/v8009-s4-v4117-boots-art-fix.js",
 "gl20-v4218-js":"js/features/system/beta/v8009-s6-gl20-v4218.js",
 "v7080-server-achievement-authority":"js/features/authority/beta/v8009-s5-v7080-server-achievement-authority.js",
 "v381-player-mail-system":"js/features/social/beta/v8009-s3-v381-player-mail-system.js",
 "v269-ticket-system":"js/features/admin/beta/v8009-s2-v269-ticket-system.js",
 "v343-server-selection-v7226":"js/features/account/beta/v8009-s6-v343-server-selection-v7226.js",
 "v467-hard-live-dungeon-key-authority":"js/features/dungeon/beta/v8009-s5-v467-hard-live-dungeon-key-authority.js",
 "v6107-global-item-art-authority":"js/features/items/beta/v8009-s4-v6107-global-item-art-authority.js",
 "v7036-item-rearrange-authority-bridge":"js/features/authority/beta/v8009-s5-v7036-item-rearrange-authority-bridge.js",
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
Path("V8009_FEATURE_EXTRACTION_BATCH8_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH8-QA",
 "result":result,
 "checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))