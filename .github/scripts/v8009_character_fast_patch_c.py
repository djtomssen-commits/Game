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

rep("""  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')requestAnimationFrame(apply)});
  apply();
  document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(apply),{once:true});
  window.addEventListener('pageshow',()=>requestAnimationFrame(apply),{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestAnimationFrame(apply)});
  /* V8.009: bounded startup retry train retired. */""",
"""  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')apply()},{passive:true});
  apply();
  document.addEventListener('DOMContentLoaded',apply,{once:true});
  window.addEventListener('pageshow',apply,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply()});
  /* V8.009: direct lifecycle only. */""",
'v526 direct lifecycle')

rep("""      renderInventory=function(){const r=base.apply(this,arguments);requestAnimationFrame(apply);return r};""",
"""      renderInventory=function(){const r=base.apply(this,arguments);apply();return r};""",
'v533 renderInventory direct')

rep("""      window.v459ArrangeCharacter=function(){const r=base.apply(this,arguments);requestAnimationFrame(apply);return r};""",
"""      window.v459ArrangeCharacter=function(){const r=base.apply(this,arguments);apply();return r};""",
'v533 arrange direct')

rep("""  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')requestAnimationFrame(apply)});
  apply();
  document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(apply),{once:true});
  window.addEventListener('pageshow',()=>requestAnimationFrame(apply),{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestAnimationFrame(apply)});
  /* V8.009: renderInventory/arrange/navigation/pageshow own inventory refresh. */""",
"""  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')apply()},{passive:true});
  apply();
  document.addEventListener('DOMContentLoaded',apply,{once:true});
  window.addEventListener('pageshow',apply,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply()});
  /* V8.009: direct renderInventory/arrange/navigation/pageshow lifecycle. */""",
'v533 direct lifecycle')

p.write_text(c,encoding='utf-8')
print('patched:', ', '.join(changes))
