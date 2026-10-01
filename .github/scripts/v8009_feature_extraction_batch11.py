from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v585-dungeon-safe-owner-core":"js/features/dungeon/beta/v8009-s8-v585-dungeon-safe-owner-core.js",
 "v433-dungeon-resource-consistency":"js/features/dungeon/beta/v8009-s8-v433-dungeon-resource-consistency.js",
 "v320-talent-point-details":"js/features/talents/beta/v8009-s3-v320-talent-point-details.js",
 "v236-dungeon-key-balance-core":"js/features/dungeon/beta/v8009-s8-v236-dungeon-key-balance-core.js",
 "v4149-final-navigation-render-authority":"js/features/system/beta/v8009-s8-v4149-final-navigation-render-authority.js",
 "v429-immutable-item-stats":"js/features/items/beta/v8009-s7-v429-immutable-item-stats.js",
 "v127-midnight-reset-system":"js/features/system/beta/v8009-s8-v127-midnight-reset-system.js",
 "v103-admin-player-editor-script":"js/features/admin/beta/v8009-s4-v103-admin-player-editor.js",
 "v249-central-dungeon-balance":"js/features/dungeon/beta/v8009-s8-v249-central-dungeon-balance.js",
 "v4115-authoritative-comic-items":"js/features/items/beta/v8009-s7-v4115-authoritative-comic-items.js",
 "v123-character-equipment-redesign-script":"js/features/character/beta/v8009-s7-v123-character-equipment-redesign.js",
 "v441-resource-live-authority":"js/features/authority/beta/v8009-s8-v441-resource-live-authority.js",
 "v274-events-gold-mystic-presets":"js/features/admin/beta/v8009-s4-v274-events-gold-mystic-presets.js",
 "v533-inventory-reference-js":"js/features/character/beta/v8009-s7-v533-inventory-reference.js",
 "v6293-harzruferin-parity-js":"js/features/combat/beta/v8009-s3-v6293-harzruferin-parity.js",
 "gl-dungeon-ready-push-v1":"js/features/push/beta/v8009-s2-gl-dungeon-ready-push.js",
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
Path("V8009_FEATURE_EXTRACTION_BATCH11_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH11-QA","result":result,"checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))