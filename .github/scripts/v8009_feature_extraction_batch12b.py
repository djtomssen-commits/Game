from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v461-shop-redesign-script":"js/features/shop/beta/v8009-s4-v461-shop-redesign.js",
 "v6168-central-gold-economy":"js/features/economy/beta/v8009-s1-v6168-central-gold-economy.js",
 "v6140-central-game-event-bridge":"js/features/events/beta/v8009-s1-v6140-central-game-event-bridge.js",
 "v115-global-ui-dialogs-script":"js/features/ui/beta/v8009-s6-v115-global-ui-dialogs.js",
 "gl-worldboss-ready-push-v2":"js/features/push/beta/v8009-s3-gl-worldboss-ready-push.js",
 "v435-illegal-book-gold-lifetime-fix":"js/features/book/beta/v8009-s3-v435-illegal-book-gold-lifetime-fix.js",
 "v430-growroom-max-level-authority":"js/features/grow/beta/v8009-s8-v430-growroom-max-level-authority.js",
 "v6211-popup-reliability":"js/features/ui/beta/v8009-s6-v6211-popup-reliability.js"
}
result={}
for sid,path in targets.items():
    m=re.search(r'(<script[^>]*id="'+re.escape(sid)+r'"[^>]*>)([\s\S]*?)(</script>)',src,re.I)
    if not m: raise SystemExit(f"missing {sid}")
    open_tag,body=m.group(1),m.group(2)
    if re.search(r'\bsrc\s*=',open_tag,re.I): raise SystemExit(f"external {sid}")
    out=Path(path);out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(body.lstrip("\n").rstrip()+"\n",encoding="utf-8")
    src=src[:m.start()]+open_tag[:-1]+f' src="{path}"></script>'+src[m.end():]
    result[sid]={"path":path,"bytes":len(body)}
p.write_text(src,encoding="utf-8")
Path("V8009_FEATURE_EXTRACTION_BATCH12B_QA.json").write_text(json.dumps({"build":"V8.009-FEATURE-EXTRACTION-BATCH12B-QA","result":result},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(result,ensure_ascii=False))
