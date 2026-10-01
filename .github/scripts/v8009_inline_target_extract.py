from pathlib import Path
import json
s=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
needles=[
"if(typeof v032Go==='function'&&!window.__v4114Go)",
"function attachObservers(){const el=document.getElementById('forge')",
"renderShop=function(){const r=v6320V129BaseShop.apply(this,arguments);requestAnimationFrame(v129PolishDynamicCards);return r};",
"function v131CleanShop(){",
"function v135PaintShop(){",
"if(document.querySelector('#shop')?.classList.contains('active'))requestAnimationFrame(v135PaintShop);"
]
out={}
for n in needles:
 p=s.find(n)
 out[n]=s[max(0,p-1800):p+5000] if p>=0 else 'NOT_FOUND'
Path('V8009_INLINE_TARGET_EXTRACT.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))
