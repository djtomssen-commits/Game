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

# v6338: book open wrapper direct instead of delayed repaint.
rep("""try{
 const old=window.v106OpenBook||v106OpenBook;
 if(typeof old==='function'&&!window.__V6338_BOOK_WRAPPED__){const wrapped=function(){const r=old.apply(this,arguments);setTimeout(()=>{ensureBook();showMain('ach');renderTitles()},120);return r};window.v106OpenBook=wrapped;try{v106OpenBook=wrapped}catch(_){ }window.__V6338_BOOK_WRAPPED__=true}
}catch(_){ }
document.addEventListener('click',e=>{if(e.target?.closest?.('[data-book],#v106BookBtn'))setTimeout(()=>{ensureBook();showMain('ach');renderTitles()},150);if(e.target?.closest?.('[data-screen="character"],[data-go="character"],[data-screen="hall"],[data-go="hall"]'))setTimeout(syncOwnBadges,120)},true);
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>{migrate();syncOwnBadges();void syncServerTitles(true)},700));
window.addEventListener('pageshow',()=>setTimeout(()=>{migrate();syncOwnBadges();void syncServerTitles(false)},400),{passive:true});
setTimeout(()=>{migrate();syncOwnBadges();void syncServerTitles(false)},1200);""",
"""try{
 const old=window.v106OpenBook||v106OpenBook;
 if(typeof old==='function'&&!window.__V6338_BOOK_WRAPPED__){const wrapped=function(){const r=old.apply(this,arguments);ensureBook();showMain('ach');renderTitles();return r};window.v106OpenBook=wrapped;try{v106OpenBook=wrapped}catch(_){ }window.__V6338_BOOK_WRAPPED__=true}
}catch(_){ }
window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='character'||id==='hall')syncOwnBadges()},{passive:true});
window.addEventListener('growlegends:account-ready',()=>{migrate();syncOwnBadges();void syncServerTitles(true)},{passive:true});
window.addEventListener('pageshow',()=>{migrate();syncOwnBadges();void syncServerTitles(false)},{passive:true});""",
'v6338 book/title lifecycle')

# v6339: remove global render wrapper + retry train, use character shared nav.
rep("""window.addEventListener('growlegends:account-ready',()=>setTimeout(syncAvatarTitle,140));
window.addEventListener('pageshow',()=>setTimeout(syncAvatarTitle,120),{passive:true});
window.addEventListener('growlegends:navigation-ready',()=>setTimeout(syncAvatarTitle,80),{passive:true});

/* Repaint after the final render chain so older avatar identity painters cannot
   move/overwrite the title placement. */
try{
  if(typeof render==='function'&&!window.__V6339_RENDER_WRAP__){
    const base=render;
    const wrapped=function(){const r=base.apply(this,arguments);requestAnimationFrame(syncAvatarTitle);return r};
    window.__V6339_RENDER_WRAP__=true;
    try{render=wrapped}catch(_){ }
    try{window.render=wrapped}catch(_){ }
  }
}catch(_){ }

[0,180,900].forEach(ms=>setTimeout(syncAvatarTitle,ms));""",
"""window.addEventListener('growlegends:account-ready',syncAvatarTitle,{passive:true});
window.addEventListener('pageshow',syncAvatarTitle,{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')syncAvatarTitle()},{passive:true});
window.__V6339_RENDER_WRAP__='retired';""",
'v6339 avatar title lifecycle')

# v7137 shift/frame: remove click-timeout quest refresh and startup retry train.
rep(""" if(t.closest('[data-screen="quests"],[data-go="quests"]'))setTimeout(()=>{ensureQuest();if(S.mode==='shift')void loadShift(false)},0);""",
""" if(t.closest('[data-screen="quests"],[data-go="quests"]'))return;""",
'v7137 quest click retry')

rep("""window.addEventListener('pageshow',()=>setTimeout(install,350),{passive:true});
window.addEventListener('growlegends:navigation-ready',()=>setTimeout(()=>{ensureQuest();ensureDealerFrameTab();renameQuestMenu();renameDealer7138();watchOwnAvatar();applyOwnFrames();moveFooterLast()},80),{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&logged()&&!window.v7204StartupQuiet?.()){void loadShift(false);void loadFrames(false)}syncShiftTicker()},{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',()=>setTimeout(syncShiftTicker,0),{passive:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
[300,1000,2400].forEach(ms=>setTimeout(install,ms));""",
"""window.addEventListener('pageshow',install,{passive:true});
window.addEventListener('growlegends:navigation-ready',()=>{ensureQuest();ensureDealerFrameTab();renameQuestMenu();renameDealer7138();watchOwnAvatar();applyOwnFrames();moveFooterLast()},{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&logged()&&!window.v7204StartupQuiet?.()){void loadShift(false);void loadFrames(false)}syncShiftTicker()},{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='quests'){ensureQuest();if(S.mode==='shift')void loadShift(false)}syncShiftTicker()},{passive:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();""",
'v7137 shift lifecycle')

p.write_text(c,encoding='utf-8')
print('patched:', ', '.join(changes))

# trigger: book-shift
