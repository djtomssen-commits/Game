from pathlib import Path
import json,sys
s=Path('beta.html').read_text(encoding='utf-8')
checks={
 'book_open_direct':"ensureBook();showMain('ach');renderTitles();return r" in s,
 'book_click_retry_removed':"[data-book],#v106BookBtn'))setTimeout" not in s,
 'book_account_ready_direct':"growlegends:account-ready',()=>{migrate();syncOwnBadges();void syncServerTitles(true)}" in s,
 'book_pageshow_direct':"pageshow',()=>{migrate();syncOwnBadges();void syncServerTitles(false)}" in s,
 'book_startup_retry_removed':"setTimeout(()=>{migrate();syncOwnBadges();void syncServerTitles(false)},1200)" not in s,
 'avatar_title_render_wrap_retired':"window.__V6339_RENDER_WRAP__='retired'" in s,
 'avatar_title_retry_train_removed':'[0,180,900].forEach(ms=>setTimeout(syncAvatarTitle,ms))' not in s,
 'avatar_title_shared_nav':"if(String(e?.detail?.id||'')==='character')syncAvatarTitle()" in s,
 'shift_click_retry_removed':"if(t.closest('[data-screen=\"quests\"],[data-go=\"quests\"]'))setTimeout" not in s,
 'shift_shared_nav':"if(id==='quests'){ensureQuest();if(S.mode==='shift')void loadShift(false)}syncShiftTicker()" in s,
 'shift_startup_retry_removed':'[300,1000,2400].forEach(ms=>setTimeout(install,ms))' not in s,
 'shift_pageshow_direct':"window.addEventListener('pageshow',install" in s,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-BOOK-SHIFT-FAST-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_BOOK_SHIFT_FAST_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
