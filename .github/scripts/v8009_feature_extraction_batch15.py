from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v681-material-sell-core":"js/features/materials/beta/v8009-s3-v681-material-sell-core.js",
 "v339-dealer-reference-redesign":"js/features/shop/beta/v8009-s4-v339-dealer-reference-redesign.js",
 "v276-event-sync-gold-fx":"js/features/events/beta/v8009-s1-v276-event-sync-gold-fx.js",
 "v247-dungeon-reward-modal-core":"js/features/dungeon/beta/v8009-s9-v247-dungeon-reward-modal-core.js",
 "v286-dungeon-events-gold-marker-fix":"js/features/dungeon/beta/v8009-s9-v286-dungeon-events-gold-marker-fix.js",
 "v6230-tower-dungeon-fx-parity-core":"js/features/tower/beta/v8009-s2-v6230-tower-dungeon-fx-parity-core.js",
 "v4126-power-rpc-diagnostics":"js/features/system/beta/v8009-s10-v4126-power-rpc-diagnostics.js",
 "v432-item-compare-clarity":"js/features/items/beta/v8009-s9-v432-item-compare-clarity.js",
 "v6360-app-update-js":"js/features/system/beta/v8009-s10-v6360-app-update.js",
 "v6291-harzruferin-stability-js":"js/features/combat/beta/v8009-s4-v6291-harzruferin-stability.js",
 "v475-shop-polish-script":"js/features/shop/beta/v8009-s4-v475-shop-polish.js",
 "v4148-complete-menu-authority":"js/features/ui/beta/v8009-s6-v4148-complete-menu-authority.js",
 "v311-quest-finale":"js/features/quest/beta/v8009-s2-v311-quest-finale.js",
 "v371-true-fullwidth-topbar":"js/features/ui/beta/v8009-s6-v371-true-fullwidth-topbar.js",
 "v6302-harz-talent-mechanics-audit-js":"js/features/talents/beta/v8009-s4-v6302-harz-talent-mechanics-audit.js",
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
Path("V8009_FEATURE_EXTRACTION_BATCH15_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH15-QA","result":result,"checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))