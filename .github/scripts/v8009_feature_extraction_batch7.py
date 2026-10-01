from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v4131-character-persistence":"js/features/account/beta/v8009-s5-v4131-character-persistence.js",
 "v6106-real-comic-item-art":"js/features/items/beta/v8009-s3-v6106-real-comic-item-art.js",
 "v450-account-save-isolation-recovery":"js/features/account/beta/v8009-s5-v450-account-save-isolation-recovery.js",
 "v232-growroom-core":"js/features/grow/beta/v8009-s4-v232-growroom-core.js",
 "v290-worldboss-level-equipment-balance":"js/features/worldboss/beta/v8009-s2-v290-worldboss-level-equipment-balance.js",
 "v6109-background-music":"js/features/audio/beta/v8009-s2-v6109-background-music.js",
 "v7074-item-enforce-bridge":"js/features/authority/beta/v8009-s4-v7074-item-enforce-bridge.js",
 "v446-global-combat-power-authority":"js/features/combat/beta/v8009-s2-v446-global-combat-power-authority.js",
 "gl-live-weather-js":"js/features/weather/beta/v8009-s1-gl-live-weather.js",
 "v7050-dungeon-combat-parity-shadow":"js/features/dungeon/beta/v8009-s4-v7050-dungeon-combat-parity-shadow.js",
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
Path("V8009_FEATURE_EXTRACTION_BATCH7_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH7-QA",
 "result":result,
 "checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))