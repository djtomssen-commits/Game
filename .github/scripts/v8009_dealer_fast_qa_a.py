from pathlib import Path
import json,sys
s=Path('beta.html').read_text(encoding='utf-8')
checks={
 'v567_global_render_removed':"const oldRender=window.render; if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);if(document.querySelector('#harzDealer')?.classList.contains('active'))requestAnimationFrame(ensure);return r};" not in s,
 'v567_direct_dealer_hook':"wrapped.__v567Ensure=true" in s,
 'v567_retry_train_removed':"setTimeout(ensure,60);setTimeout(ensure,450);setTimeout(ensure,1400)" not in s,
 'v322_global_render_retired':"window.__v322GlobalRenderRetired=true" in s,
 'v322_nav_owner_retained':"if(String(e?.detail?.id||'')==='harzDealer')v322RenderDealer()" in s,
 'v322_menu_owner_retained':"v032InstallMenu=function(){const r=v322BaseInstallMenu.apply(this,arguments);v322InstallMenuEntry();v322InstallHarzPlus();return r};" in s,
 'v339_global_render_retired':"window.__v339GlobalRenderRetired=true" in s,
 'v339_direct_dealer_hook_retained':"window.v322RenderDealer=function()" in s and "buildDealer();" in s,
 'v339_retry_train_removed':"setTimeout(()=>{buildDealer();version()},250)" not in s and "setTimeout(()=>{buildDealer();version()},1200)" not in s,
 'play_recovery_retained':"function v7236RecoveryBurst()" in s and "recoverPending" in s,
 'bag_dealer_reload_retained':"document.getElementById('bagDealer')?.classList.contains('active')" in s,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-DEALER-FAST-QA-A','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_DEALER_FAST_QA_A.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
