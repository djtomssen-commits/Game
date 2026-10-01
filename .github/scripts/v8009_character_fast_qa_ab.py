from pathlib import Path
import json,sys
s=Path('beta.html').read_text(encoding='utf-8')
checks={
 'v4153_global_render_retired':"window.__v4153Render='retired'" in s and "__v4153Render){const base=render" not in s,
 'v4153_shared_nav':"refreshAll('nav-character')" in s,
 'v4156_global_render_retired':"window.__v4156Render='retired'" in s and "__v4156Render){const b=render" not in s,
 'v4156_shared_nav':"__v4156Go='v7119-event'" in s,
 'v533_retry_train_removed':"[120,400,900,1800,3600].forEach(ms=>setTimeout(apply,ms))" not in s,
 'v533_render_inventory_hook_retained':"__v533InventoryWrapped" in s,
 'v4140_global_render_retired':"window.__v4140RenderWrapped='retired'" in s and "__v4140RenderWrapped){const base=render" not in s,
 'v4140_nav_retained':"__v4140GoWrapped='v7119-event'" in s,
 'v4140_retry_train_removed':"[120,500,1400].forEach(ms=>setTimeout(paint,ms))" not in s,
 'v515_global_render_retired':"window.__v515RenderWrapped='retired'" in s,
 'v515_nav_added':"__v515RenderWrapped='retired'" in s and "requestAnimationFrame(polish)" in s,
 'v526_retry_train_removed':"[80,220,600,1400,3000,6000].forEach(ms=>setTimeout(apply,ms))" not in s,
 'v537_retry_train_removed':"[120,500,1400].forEach(ms=>setTimeout(apply,ms))" not in s,
 'v543_retry_train_removed':"[150,600,1600].forEach(ms=>setTimeout(apply,ms))" not in s,
 'v546_retry_train_removed':"[180,700,1700].forEach(ms=>setTimeout(apply,ms))" not in s,
 'v126_autorepair_still_retired':"__V7126_V126_AUTOREPAIR_RETIRED__=true" in s,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-CHARACTER-FAST-QA-AB','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_CHARACTER_FAST_QA_AB.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
