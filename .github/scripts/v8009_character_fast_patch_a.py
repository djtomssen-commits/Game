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

rep(""" /* Repaint after every established render/navigation without introducing polling. */
 try{
  if(typeof render==='function'&&!window.__v4153Render){const base=render;render=function(){const r=base.apply(this,arguments);if(document.getElementById('character')?.classList.contains('active'))requestAnimationFrame(()=>refreshAll('render-character'));return r};try{window.render=render}catch(e){}window.__v4153Render=true}
 }catch(e){}
 try{
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')refreshAll('nav-character')});window.__v4153Go='v7119-event'
 }catch(e){}""",
""" /* V8.009: shared character lifecycle owns repaint; no global render wrapper. */
 try{
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')refreshAll('nav-character')},{passive:true});window.__v4153Go='v7119-event';window.__v4153Render='retired'
 }catch(e){}""",
'v4153 global render wrapper')

rep(""" try{
  if(typeof render==='function'&&!window.__v4156Render){const b=render;render=function(){const r=b.apply(this,arguments);if(document.getElementById('character')?.classList.contains('active'))requestAnimationFrame(paintPassive);stamp();return r};try{window.render=render}catch(e){}window.__v4156Render=true}
 }catch(e){}
 try{
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character'){paintPassive();stamp()}});window.__v4156Go='v7119-event'
 }catch(e){}""",
""" try{
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character'){paintPassive();stamp()}},{passive:true});window.__v4156Go='v7119-event';window.__v4156Render='retired'
 }catch(e){}""",
'v4156 global render wrapper')

rep("""  [120,400,900,1800,3600].forEach(ms=>setTimeout(apply,ms));""",
"""  /* V8.009: renderInventory/arrange/navigation/pageshow own inventory refresh. */""",
'v533 startup retry train')

p.write_text(c,encoding='utf-8')
print('patched:', ', '.join(changes))
