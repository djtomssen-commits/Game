from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old=""" decorate();stamp();[50,250,900,1800,3500,7000,12000,22000,40000,60000].forEach(ms=>setTimeout(()=>{decorate();upgradeLoginReveal();stamp()},ms));window.addEventListener('pageshow',()=>{decorate();stamp()},{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden){decorate();runtimeAudit();stamp()}},{passive:true});"""
new=""" decorate();upgradeLoginReveal();stamp();
 document.addEventListener('DOMContentLoaded',()=>{decorate();upgradeLoginReveal();stamp()},{once:true});
 window.addEventListener('growlegends:account-ready',()=>{decorate();upgradeLoginReveal();stamp()},{passive:true});
 window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='character'||id==='shop'||id==='forge'||id==='harzForge'){decorate();upgradeLoginReveal();stamp()}},{passive:true});
 window.addEventListener('pageshow',()=>{decorate();upgradeLoginReveal();stamp()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){decorate();runtimeAudit();upgradeLoginReveal();stamp()}},{passive:true});"""
if old not in c: raise SystemExit("v4103 long repaint train missing")
c=c.replace(old,new,1);changed["v4103"]=1

old=""" kick();requestAnimationFrame(kick);
 document.addEventListener('DOMContentLoaded',kick,{once:true});
 window.addEventListener('pageshow',kick,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)kick()},{passive:true});
 /* Bounded settle passes only. No MutationObserver and no permanent version repaint loop:
    historical painters cannot create a microtask feedback storm on mobile. */
 [100,500,1800,5000].forEach(ms=>setTimeout(kick,ms));"""
new=""" kick();
 document.addEventListener('DOMContentLoaded',kick,{once:true});
 window.addEventListener('pageshow',kick,{passive:true});
 window.addEventListener('growlegends:account-ready',kick,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)kick()},{passive:true});
 /* V8.009: delayed settle passes retired; account/finalizer lifecycle owns power release. */"""
if old not in c: raise SystemExit("v4129 settle train missing")
c=c.replace(old,new,1);changed["v4129"]=1

p.write_text(c,encoding="utf-8")
checks={
 "v4103_long_train_removed":"[50,250,900,1800,3500,7000,12000,22000,40000,60000]" not in c,
 "v4103_render_hooks_kept":"__v4103Render" in c and "__v4103Inventory" in c and "__v4103Shop" in c,
 "v4103_login_upgrade_kept":"function upgradeLoginReveal()" in c,
 "v4103_account_ready_added":"growlegends:account-ready',()=>{decorate();upgradeLoginReveal();stamp()}" in c,
 "v4103_later_reveal_owner_kept":"#v484Reveal.show" in c and "v4103RenderItemCard" in c,
 "v4129_settle_train_removed":"[100,500,1800,5000].forEach(ms=>setTimeout(kick,ms))" not in c,
 "v4129_finalize_hook_kept":"__v4129FinalizePower" in c,
 "v4129_account_ready_added":"growlegends:account-ready',kick" in c,
 "v4129_visibility_kept":"visibilitychange',()=>{if(!document.hidden)kick()}" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH4_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH4-QA",
 "changed":changed,
 "checks":checks,
 "scope":"item-surface/version-power startup repaint trains only; daily reward item owner and account power finalizer preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))