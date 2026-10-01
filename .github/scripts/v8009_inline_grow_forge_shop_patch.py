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

rep("""try{if(typeof v032Go==='function'&&!window.__v4114Go){const base=v032Go;v032Go=function(id){const r=base.apply(this,arguments);if(id==='grow')setTimeout(()=>{const changed=syncLedger('grow-open');if(changed)try{persist(false)}catch(e){};decorateSlots()},60);return r};try{window.v032Go=v032Go}catch(e){}window.__v4114Go=true}}catch(e){}""",
"""try{if(!window.__v4114Go){window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')!=='grow')return;const changed=syncLedger('grow-open');if(changed)try{persist(false)}catch(_){};decorateSlots()},{passive:true});window.__v4114Go=true}}catch(e){}""",
'v4114 shared navigation')

rep("""[250,1500].forEach(ms=>setTimeout(()=>{syncLedger('delayed');decorateSlots();addQaTests();stamp()},ms));""",
"""window.addEventListener('growlegends:account-ready',()=>{syncLedger('account-ready');decorateSlots();addQaTests();stamp()},{passive:true});""",
'v4114 startup retries')

rep("""document.addEventListener('click',e=>{const t=e.target instanceof Element?e.target:null;if(!t)return;if(t.closest('[data-v6130-open]')){e.preventDefault();return openLab()}if(t.closest('[data-v6130-cross]')){e.preventDefault();return beginCross(t.closest('[data-v6130-cross]').dataset.v6130Cross)}if(t.closest('[data-v6130-settab]')){e.preventDefault();e.stopPropagation();return openSetPanel()}if(t.closest('[data-v6130-craft]')){e.preventDefault();return void craftSet(t.closest('[data-v6130-craft]').dataset.v6130Craft)}if(t.closest('#forge [data-v667-tab]')){document.querySelector('#forge .v667-forge-body')?.classList.remove('v6130-set-mode');setTimeout(decorateForge,20)}},true);
function attachObservers(){const el=document.getElementById('forge');if(!el||el.dataset.v6130Observed)return;el.dataset.v6130Observed='1';let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;try{decorateForge()}catch(_){}})}).observe(el,{childList:true,subtree:true});try{decorateForge()}catch(_){}}
state();installAchievements();attachObservers();decorateForge();stamp();
document.addEventListener('DOMContentLoaded',()=>{state();installAchievements();attachObservers();decorateForge();stamp()},{once:true});
window.addEventListener('pageshow',()=>{attachObservers();decorateForge();stamp()},{passive:true});
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>{state();installAchievements();decorateGrow();decorateForge();stamp()},80));""",
"""document.addEventListener('click',e=>{const t=e.target instanceof Element?e.target:null;if(!t)return;if(t.closest('[data-v6130-open]')){e.preventDefault();return openLab()}if(t.closest('[data-v6130-cross]')){e.preventDefault();return beginCross(t.closest('[data-v6130-cross]').dataset.v6130Cross)}if(t.closest('[data-v6130-settab]')){e.preventDefault();e.stopPropagation();return openSetPanel()}if(t.closest('[data-v6130-craft]')){e.preventDefault();return void craftSet(t.closest('[data-v6130-craft]').dataset.v6130Craft)}if(t.closest('#forge [data-v667-tab]')){document.querySelector('#forge .v667-forge-body')?.classList.remove('v6130-set-mode');decorateForge()}},true);
function refreshForge(){try{decorateForge();renderSetIfOpen()}catch(_){}}
state();installAchievements();refreshForge();stamp();
document.addEventListener('DOMContentLoaded',()=>{state();installAchievements();refreshForge();stamp()},{once:true});
window.addEventListener('pageshow',()=>{refreshForge();stamp()},{passive:true});
window.addEventListener('growlegends:account-ready',()=>{state();installAchievements();decorateGrow();refreshForge();stamp()},{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='forge')refreshForge()},{passive:true});""",
'v6130 observer retirement')

rep("""renderShop=function(){const r=v6320V129BaseShop.apply(this,arguments);requestAnimationFrame(v129PolishDynamicCards);return r};""",
"""renderShop=function(){const r=v6320V129BaseShop.apply(this,arguments);v129PolishDynamicCards();return r};""",
'v129 direct polish')

rep("""setTimeout(v129PolishDynamicCards,180);""","""v129PolishDynamicCards();""",'v129 startup timeout')

rep("""const v131BaseRender=render;
render=function(){
  const r=v131BaseRender();
  if(document.querySelector('#shop')?.classList.contains('active'))requestAnimationFrame(v131CleanShop);
  return r;
};
setTimeout(v131CleanShop,120);""",
"""if(typeof renderShop==='function'&&!window.__v131ShopCleanWrapped){
  const v131BaseRenderShop=renderShop;
  renderShop=function(){const r=v131BaseRenderShop.apply(this,arguments);v131CleanShop();return r};
  try{window.renderShop=renderShop}catch(_){}
  window.__v131ShopCleanWrapped=true;
}
v131CleanShop();
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='shop')v131CleanShop()},{passive:true});""",
'v131 shop scoped cleanup')

rep("""const v135BaseRender=render;
render=function(){
  const r=v135BaseRender();
  if(document.querySelector('#shop')?.classList.contains('active'))requestAnimationFrame(v135PaintShop);
  return r;
};
setTimeout(v135PaintShop,150);""",
"""if(typeof renderShop==='function'&&!window.__v135ShopPaintWrapped){
  const v135BaseRenderShop=renderShop;
  renderShop=function(){const r=v135BaseRenderShop.apply(this,arguments);v135PaintShop();return r};
  try{window.renderShop=renderShop}catch(_){}
  window.__v135ShopPaintWrapped=true;
}
v135PaintShop();
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='shop')v135PaintShop()},{passive:true});""",
'v135 shop scoped paint')

p.write_text(c,encoding='utf-8')
print('patched:', ', '.join(changes))

# trigger: 2026-10-01
