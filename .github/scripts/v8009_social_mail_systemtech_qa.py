from pathlib import Path
import json,sys
s=Path('beta.html').read_text(encoding='utf-8')
checks={
 'v381_shared_nav':"growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');bind();if(id==='mail')void load()" in s,
 'v381_old_go_removed':"const baseGo=v032Go;v032Go=function(id){const r=baseGo.apply(this,arguments);requestAnimationFrame(bind);if(id==='mail')setTimeout(load,0);return r};" not in s,
 'v381_unread_poll_retained':"setInterval(()=>{if(!document.hidden)unread()},60000)" in s,
 'v382_shared_nav':"if(id==='hall')v382DecorateHall();" in s and "if(id==='friends')v382DecorateFriends();" in s,
 'v382_old_go_removed':"if(id==='friends')setTimeout(v382DecorateFriends,40)" not in s,
 'v383_shared_nav':"if(id==='friends')v383FixButtons('#v072FriendsList');" in s,
 'v383_old_go_removed':"if(id==='friends')setTimeout(()=>v383FixButtons('#v072FriendsList'),60)" not in s,
 'v6202_observer_removed':"if(mail)new MutationObserver(()=>{if(mail.classList.contains('active'))requestAnimationFrame(repair)}" not in s,
 'v6202_retries_removed':"setTimeout(repair,250)" not in s and "setTimeout(repair,1000)" not in s,
 'v4102_boot_qa_removed':"setTimeout(()=>{lastReport=runQA();ensureUi();updateBadge()},1800)" not in s,
 'v4102_retry_train_removed':"[0,100,500,1500,5000,15000,30000,46000,60000]" not in s,
 'v4107_admin_guard_retained':"id==='systemtech'&&(typeof v093IsAdmin==='undefined'||v093IsAdmin!==true)" in s,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-SOCIAL-MAIL-SYSTEMTECH-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_SOCIAL_MAIL_SYSTEMTECH_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
