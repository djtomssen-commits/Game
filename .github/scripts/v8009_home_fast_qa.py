from pathlib import Path
import json,sys
h=Path('js/features/home/beta/v8009-home-renderer.js').read_text(encoding='utf-8')
checks={
 'shared_nav':"growlegends:navigation-open-v7119" in h,
 'no_v032go_wrapper':"const baseGo=v032Go" not in h and "v032Go=function(id)" not in h,
 'header_on_nav':'buildHeader();' in h.split("growlegends:navigation-open-v7119",1)[1],
 'world_direct_on_nav':"if(id==='world')installWorld(false);" in h,
 'character_tab_delay_retained':"requestAnimationFrame(()=>{activate();setTimeout(activate,40)})" in h,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-HOME-FAST-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_HOME_FAST_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
