from pathlib import Path
p=Path('beta.html')
c=p.read_text(encoding='utf-8')
changes=[]

def rep(old,new,label):
    global c
    if old not in c:
        raise SystemExit(f'MISSING: {label}')
    c=c.replace(old,new,1)
    changes.append(label)

# v4140: canonical attribute owner already has nav/tab/direct spend hooks.
rep(""" /* This is the final UI owner: historical renderers may run, but only this five-row output survives. */
 try{if(typeof render==='function'&&!window.__v4140RenderWrapped){const base=render;render=function(){const r=base.apply(this,arguments);paint();return r};try{window.render=render}catch(e){}window.__v4140RenderWrapped=true}}catch(e){}
 window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')paint()});window.__v4140GoWrapped='v7119-event';""",
""" /* V8.009: direct character lifecycle owns the canonical five-row output. */
 window.__v4140RenderWrapped='retired';
 window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')paint()},{passive:true});window.__v4140GoWrapped='v7119-event';""",
'v4140 global render wrapper')

rep(""" [120,500,1400].forEach(ms=>setTimeout(paint,ms));""",
""" /* V8.009: startup retry train retired; direct lifecycle hooks are sufficient. */""",
'v4140 retries')

# v515: replace global render wrapper + retry train with navigation lifecycle.
rep("""  [80,220,600,1200,2400].forEach(ms=>setTimeout(polish,ms));
  try{
    if(typeof render==='function'&&!window.__v515RenderWrapped){
      const base=render;render=function(){const r=base.apply(this,arguments);if(document.getElementById('character')?.classList.contains('active'))requestAnimationFrame(polish);return r};
      try{window.render=render}catch(e){}window.__v515RenderWrapped=true;
    }
  }catch(e){}""",
"""  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')requestAnimationFrame(polish)},{passive:true});
  window.__v515RenderWrapped='retired';""",
'v515 render/retries')

# v526: nav/dom/pageshow/visibility already own it.
rep("""  [80,220,600,1400,3000,6000].forEach(ms=>setTimeout(apply,ms));""",
"""  /* V8.009: bounded startup retry train retired. */""",
'v526 retries')

# v537 attribute reference layout: nav/tab/dom/pageshow already own it.
rep("""  [120,500,1400].forEach(ms=>setTimeout(apply,ms));""",
"""  /* V8.009: bounded startup retry train retired. */""",
'v537 retries')

# v543 talent reference layout: nav/tab/dom/pageshow already own it.
rep("""  [150,600,1600].forEach(ms=>setTimeout(apply,ms));""",
"""  /* V8.009: bounded startup retry train retired. */""",
'v543 retries')

# v546 materials layout: nav/tab/dom/pageshow + direct arrange/autobar wrappers already own it.
rep("""  [180,700,1700].forEach(ms=>setTimeout(apply,ms));""",
"""  /* V8.009: bounded startup retry train retired. */""",
'v546 retries')

p.write_text(c,encoding='utf-8')
print('patched:', ', '.join(changes))
