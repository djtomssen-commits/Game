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

# v567: navigation + canonical dealer renderer are sufficient; remove global render/retry layer.
rep(""" window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='harzDealer')ensure()});
 const oldRender=window.render; if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);if(document.querySelector('#harzDealer')?.classList.contains('active'))requestAnimationFrame(ensure);return r};
 const oldDealer=window.v322RenderDealer;if(typeof oldDealer==='function')window.v322RenderDealer=function(){const r=oldDealer.apply(this,arguments);requestAnimationFrame(ensure);return r};
 setTimeout(ensure,60);setTimeout(ensure,450);setTimeout(ensure,1400);""",
""" window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='harzDealer')ensure()},{passive:true});
 const oldDealer=window.v322RenderDealer;if(typeof oldDealer==='function'&&!oldDealer.__v567Ensure){const wrapped=function(){const r=oldDealer.apply(this,arguments);ensure();return r};wrapped.__v567Ensure=true;window.v322RenderDealer=wrapped}
 ensure();""",
'v567 global render/retries')

# v322: its menu installer already wraps the actual menu owner; navigation owns dealer render.
rep("""const v322BaseRender=render;
render=function(){const r=v322BaseRender();v322InstallMenuEntry();v322InstallHarzPlus();if(document.querySelector('#harzDealer')?.classList.contains('active'))v322RenderDealer();const line=document.querySelector('#v141VersionLine');return r};
setTimeout(()=>{try{v322InstallMenuEntry();v322InstallHarzPlus()}catch(e){console.error('V4.02 Harz Dealer init',e)}},350);""",
"""window.__v322GlobalRenderRetired=true;
try{v322InstallMenuEntry();v322InstallHarzPlus()}catch(e){console.error('V4.02 Harz Dealer init',e)}
document.addEventListener('DOMContentLoaded',()=>{try{v322InstallMenuEntry();v322InstallHarzPlus()}catch(e){}},{once:true});""",
'v322 global render/init timeout')

# v339: direct dealer renderer + shared navigation already repaint the final layout.
rep(""" const baseRender=render;
 render=function(){
   const r=baseRender.apply(this,arguments);
   if(document.querySelector('#harzDealer')?.classList.contains('active'))requestAnimationFrame(buildDealer);
   return r;
 };
 window.addEventListener('growlegends:navigation-open-v7119',e=>{
   if(String(e?.detail?.id||'')==='harzDealer')buildDealer();
 });

 function version(){
   document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version]').forEach(el=>{if(el)el.textContent=V339_VERSION});
 }
 setTimeout(()=>{buildDealer();version()},250);
 setTimeout(()=>{buildDealer();version()},1200);""",
""" window.__v339GlobalRenderRetired=true;
 window.addEventListener('growlegends:navigation-open-v7119',e=>{
   if(String(e?.detail?.id||'')==='harzDealer')buildDealer();
 },{passive:true});
 buildDealer();""",
'v339 global render/retries/version writer')

p.write_text(c,encoding='utf-8')
print('patched:', ', '.join(changes))
