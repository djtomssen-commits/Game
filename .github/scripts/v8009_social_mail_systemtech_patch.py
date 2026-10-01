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

# V381 Mail: shared navigation lifecycle, no direct v032Go wrapper.
rep(""" const baseGo=v032Go;v032Go=function(id){const r=baseGo.apply(this,arguments);requestAnimationFrame(bind);if(id==='mail')setTimeout(load,0);return r};
 bind();unread();setTimeout(()=>{bind();unread()},500);setInterval(()=>{if(!document.hidden)unread()},60000);""",
""" window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');bind();if(id==='mail')void load()},{passive:true});
 bind();unread();window.addEventListener('growlegends:account-ready',()=>{bind();unread()},{passive:true});setInterval(()=>{if(!document.hidden)unread()},60000);""",
'v381 navigation wrapper')

# V382 Hall/Friends mail buttons: loaders are already canonical decoration points.
rep("""  /* Re-bind after navigation without creating another renderer/observer. */
  const baseGo=v032Go;
  v032Go=function(id){
    const result=baseGo.apply(this,arguments);
    if(id==='hall')setTimeout(v382DecorateHall,40);
    if(id==='friends')setTimeout(v382DecorateFriends,40);
    return result;
  };

  setTimeout(()=>{
    v382DecorateHall();
    v382DecorateFriends();
    v382Version();
  },650);""",
"""  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    const id=String(e?.detail?.id||'');
    if(id==='hall')v382DecorateHall();
    if(id==='friends')v382DecorateFriends();
  },{passive:true});
  v382DecorateHall();
  v382DecorateFriends();""",
'v382 navigation/version timer')

# V383 recipient fix: same shared lifecycle, old version writer removed.
rep("""  const baseGo=v032Go;
  v032Go=function(id){
    const result=baseGo.apply(this,arguments);
    if(id==='hall')setTimeout(()=>v383FixButtons('#v072HallRanking'),60);
    if(id==='friends')setTimeout(()=>v383FixButtons('#v072FriendsList'),60);
    return result;
  };

  setTimeout(()=>{
    v383FixButtons('#v072HallRanking');
    v383FixButtons('#v072FriendsList');
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
    ).forEach(el=>{if(el)el.textContent=VERSION});
    document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11');
  },750);""",
"""  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    const id=String(e?.detail?.id||'');
    if(id==='hall')v383FixButtons('#v072HallRanking');
    if(id==='friends')v383FixButtons('#v072FriendsList');
  },{passive:true});
  v383FixButtons('#v072HallRanking');
  v383FixButtons('#v072FriendsList');""",
'v383 navigation/version timer')

# V6202 Mail tab visual owner: shared navigation replaces observer/retry repair.
rep(""" window.addEventListener('growlegends:account-ready',()=>setTimeout(repair,80));
 document.addEventListener('DOMContentLoaded',repair,{once:true});
 setTimeout(repair,250);
 setTimeout(repair,1000);
 try{
   const mail=document.getElementById('mail');
   if(mail)new MutationObserver(()=>{if(mail.classList.contains('active'))requestAnimationFrame(repair)}).observe(mail,{attributes:true,attributeFilter:['class']});
 }catch(_){}""",
""" window.addEventListener('growlegends:account-ready',repair,{passive:true});
 window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='mail')repair()},{passive:true});
 document.addEventListener('DOMContentLoaded',repair,{once:true});
 window.addEventListener('pageshow',()=>{if(document.getElementById('mail')?.classList.contains('active'))repair()},{passive:true});""",
'v6202 observer/retries')

# Legacy V4102 QA must never run during normal boot.
rep(""" try{if(typeof v141BuildSettings==='function'&&!v141BuildSettings.__v4102){const base=v141BuildSettings;v141BuildSettings=function(){const r=base.apply(this,arguments);setTimeout(ensureUi,0);return r};v141BuildSettings.__v4102=true}}catch(e){}
 ensureUi();setTimeout(()=>{lastReport=runQA();ensureUi();updateBadge()},1800);[0,100,500,1500,5000,15000,30000,46000,60000].forEach(ms=>setTimeout(()=>{stamp();ensureUi()},ms));window.addEventListener('pageshow',()=>{stamp();ensureUi();setTimeout(monitorRuntime,100)},{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden){stamp();ensureUi();monitorRuntime()}},{passive:true});""",
""" try{if(typeof v141BuildSettings==='function'&&!v141BuildSettings.__v4102){const base=v141BuildSettings;v141BuildSettings=function(){const r=base.apply(this,arguments);ensureUi();return r};v141BuildSettings.__v4102=true}}catch(e){}
 ensureUi();window.addEventListener('pageshow',()=>{stamp();ensureUi();monitorRuntime()},{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden){stamp();ensureUi();monitorRuntime()}},{passive:true});""",
'v4102 boot QA/retries')

p.write_text(c,encoding='utf-8')
print('patched:', ', '.join(changes))
