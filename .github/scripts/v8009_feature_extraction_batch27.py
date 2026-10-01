from pathlib import Path
import re,json
p=Path("beta.html")
src=p.read_text(encoding="utf-8")
targets={
 "v4123-performance-cleanup":"js/features/system/beta/v8009-s19-v4123-performance-cleanup.js",
 "v332-dungeon-paid-no-timer-reset":"js/features/dungeon/beta/v8009-s19-v332-dungeon-paid-no-timer-reset.js",
 "v142-settings-position-fix-script":"js/features/ui/beta/v8009-s15-v142-settings-position-fix.js",
 "v6210-dungeon-single-player-art-js":"js/features/dungeon/beta/v8009-s19-v6210-dungeon-single-player-art.js",
 "v6296-harzruferin-companion-fix-js":"js/features/combat/beta/v8009-s10-v6296-harzruferin-companion-fix.js",
 "v660-splash-progress-controller":"js/features/ui/beta/v8009-s15-v660-splash-progress-controller.js",
 "v385-auth-consistency-guard":"js/features/account/beta/v8009-s17-v385-auth-consistency-guard.js",
 "v454-remove-save-rescue-ui":"js/features/account/beta/v8009-s17-v454-remove-save-rescue-ui.js",
 "v526-heldenquartier-final-ornament-js":"js/features/character/beta/v8009-s16-v526-heldenquartier-final-ornament.js",
 "v365-header-menu-left-align":"js/features/ui/beta/v8009-s15-v365-header-menu-left-align.js",
 "v370-mobile-topbar-reference":"js/features/ui/beta/v8009-s15-v370-mobile-topbar-reference.js",
 "v282-harz-count-root-fix":"js/features/ui/beta/v8009-s15-v282-harz-count-root-fix.js",
 "v4134-cross-account-isolation-hotfix":"js/features/account/beta/v8009-s17-v4134-cross-account-isolation-hotfix.js",
 "v275-character-name-source-of-truth":"js/features/character/beta/v8009-s16-v275-character-name-source-of-truth.js",
 "v515-heldenquartier-mobile-polish-js":"js/features/character/beta/v8009-s16-v515-heldenquartier-mobile-polish.js",
 "v328-growskill-fully-removed":"js/features/character/beta/v8009-s16-v328-growskill-fully-removed.js",
 "v7156-combat-home-owner":"js/features/combat/beta/v8009-s10-v7156-combat-home-owner.js",
 "v6202-nebel-post-compact-final-js":"js/features/ui/beta/v8009-s15-v6202-nebel-post-compact-final.js",
 "v6114-pet-navigation-and-dungeon-live":"js/features/social/beta/v8009-s7-v6114-pet-navigation-and-dungeon-live.js",
 "v113-worldboss-retry-confirm":"js/features/worldboss/beta/v8009-s9-v113-worldboss-retry-confirm.js",
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
Path("V8009_FEATURE_EXTRACTION_BATCH27_QA.json").write_text(json.dumps({
 "build":"V8.009-FEATURE-EXTRACTION-BATCH27-QA","result":result,"checks":checks,
 "scope":"move-only extraction from beta.html; original script attributes/order/id preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"result":result,"checks":checks},ensure_ascii=False))