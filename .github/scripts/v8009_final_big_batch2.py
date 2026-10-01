from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="""  /* V6.217: replace the 500ms migration poll with finite reconciliation retries. */
  [500,1800,4200,9000].forEach(ms=>setTimeout(()=>{
    const changed=reconcile(true);
    if(changed){try{v106CheckAchievements(true)}catch(e){} refreshOpenBook()}
    stamp();
  },ms));

  document.addEventListener('DOMContentLoaded',()=>{reconcile(true);stamp()},{once:true});
  window.addEventListener('pageshow',()=>{reconcile(true);stamp()},{passive:true});
  setTimeout(()=>{reconcile(true);stamp()},1000);
  setTimeout(()=>{reconcile(true);stamp()},4200);"""
new="""  /* V8.009: delayed migration retries retired; account-ready/lifecycle own reconciliation. */
  document.addEventListener('DOMContentLoaded',()=>{reconcile(true);stamp()},{once:true});
  window.addEventListener('pageshow',()=>{reconcile(true);stamp()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{const changed=reconcile(true);if(changed){try{v106CheckAchievements(true)}catch(e){} refreshOpenBook()}stamp()},{passive:true});"""
if old not in c: raise SystemExit("v435 startup reconcile block missing")
c=c.replace(old,new,1);changed["v435"]=1

old="""  stamp();
  document.addEventListener('DOMContentLoaded',stamp,{once:true});
  window.addEventListener('pageshow',stamp,{passive:true});
  [250,800,1800,4200].forEach(ms=>setTimeout(stamp,ms));
  setTimeout(stamp,250); /* V4.123: removed useless late clear of already-fired one-shot timeout. */"""
new="""  stamp();
  document.addEventListener('DOMContentLoaded',stamp,{once:true});
  window.addEventListener('pageshow',stamp,{passive:true});
  window.addEventListener('growlegends:account-ready',stamp,{passive:true});"""
if old not in c: raise SystemExit("v452 startup train missing")
c=c.replace(old,new,1);changed["v452"]=1

old="""  stamp();
  document.addEventListener('DOMContentLoaded',()=>{stamp();const uid=uidNow();if(uid&&gateReady(uid))void reconcile('dom')},{once:true});
  window.addEventListener('pageshow',()=>{stamp();const uid=uidNow();if(uid&&gateReady(uid))void reconcile('pageshow')},{passive:true});
  [250,900,2200,5200].forEach(ms=>setTimeout(()=>{stamp();const uid=uidNow();if(uid&&gateReady(uid)&&reconciledUid!==uid)void reconcile('timer')},ms)); /* V4.123: removed useless late clear of already-fired one-shot timeout. */"""
new="""  stamp();
  document.addEventListener('DOMContentLoaded',()=>{stamp();const uid=uidNow();if(uid&&gateReady(uid))void reconcile('dom')},{once:true});
  window.addEventListener('pageshow',()=>{stamp();const uid=uidNow();if(uid&&gateReady(uid))void reconcile('pageshow')},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{stamp();const uid=uidNow();if(uid&&gateReady(uid))void reconcile('account-ready')},{passive:true});"""
if old not in c: raise SystemExit("v453 startup train missing")
c=c.replace(old,new,1);changed["v453"]=1

old="""  cleanup();
  document.addEventListener('DOMContentLoaded',cleanup,{once:true});
  window.addEventListener('pageshow',cleanup,{passive:true});
  [250,900,2200,5200].forEach(ms=>setTimeout(cleanup,ms));
  /* V6.97: 30-second 300ms cleanup polling retired. */"""
new="""  cleanup();
  document.addEventListener('DOMContentLoaded',cleanup,{once:true});
  window.addEventListener('pageshow',cleanup,{passive:true});
  window.addEventListener('growlegends:account-ready',cleanup,{passive:true});
  /* V8.009: delayed startup cleanup train retired. */"""
if old not in c: raise SystemExit("v454 startup train missing")
c=c.replace(old,new,1);changed["v454"]=1

p.write_text(c,encoding="utf-8")
checks={
 "v435_retry_train_removed":"[500,1800,4200,9000]" not in c,
 "v435_book_debounce_kept":"__v435BookRefreshTimer=setTimeout" in c,
 "v435_account_ready_present":"growlegends:account-ready',()=>{const changed=reconcile(true)" in c,
 "v452_retry_train_removed":"[250,800,1800,4200]" not in c,
 "v452_account_status_kept":"v452SecurityText" in c,
 "v453_retry_train_removed":"[250,900,2200,5200].forEach(ms=>setTimeout(()=>{stamp();const uid=uidNow()" not in c,
 "v453_display_only_kept":"profiles is display-only" in c,
 "v454_retry_train_removed":"[250,900,2200,5200].forEach(ms=>setTimeout(cleanup,ms))" not in c,
 "v454_cleanup_kept":"function cleanup()" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH2_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH2-QA",
 "changed":changed,
 "checks":checks,
 "scope":"startup reconciliation/cleanup lifecycle only; gold ledger, account integrity and recovery cleanup behavior preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))