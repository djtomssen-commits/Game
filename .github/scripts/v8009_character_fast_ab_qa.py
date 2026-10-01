from pathlib import Path
import json,sys
s=Path('beta.html').read_text(encoding='utf-8')
checks={
 'v4153_render_retired':"window.__v4153Render='retired'" in s and "if(typeof render==='function'&&!window.__v4153Render)" not in s,
 'v4156_render_retired':"window.__v4156Render='retired'" in s and "if(typeof render==='function'&&!window.__v4156Render)" not in s,
 'v533_retry_train_removed':'[120,400,900,1800,3600].forEach(ms=>setTimeout(apply,ms))' not in s,
 'v4140_render_retired':"window.__v4140RenderWrapped='retired'" in s,
 'v4140_retry_train_removed':'[120,500,1400].forEach(ms=>setTimeout(paint,ms))' not in s,
 'v515_render_retired':"window.__v515RenderWrapped='retired'" in s,
 'v515_retry_train_removed':'[80,220,600,1200,2400].forEach(ms=>setTimeout(polish,ms))' not in s,
 'v526_retry_train_removed':'[80,220,600,1400,3000,6000].forEach(ms=>setTimeout(apply,ms))' not in s,
 'v537_retry_train_removed':'[120,500,1400].forEach(ms=>setTimeout(apply,ms))' not in s,
 'v543_retry_train_removed':'[150,600,1600].forEach(ms=>setTimeout(apply,ms))' not in s,
 'v546_retry_train_removed':'[180,700,1700].forEach(ms=>setTimeout(apply,ms))' not in s,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-CHARACTER-FAST-A-B-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_CHARACTER_FAST_AB_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
