from pathlib import Path
import json,sys
s=Path('beta.html').read_text(encoding='utf-8')
checks={
 'grow_shared_nav':"__v4114Go" in s and "growlegends:navigation-open-v7119" in s and "syncLedger('grow-open')" in s,
 'grow_old_v032_wrapper_removed':"if(typeof v032Go==='function'&&!window.__v4114Go)" not in s,
 'grow_retry_train_removed':"[250,1500].forEach(ms=>setTimeout(()=>{syncLedger('delayed')" not in s,
 'grow_account_ready_direct':"syncLedger('account-ready');decorateSlots();addQaTests();stamp()" in s,
 'forge_observer_removed':"function attachObservers(){const el=document.getElementById('forge')" not in s,
 'forge_shared_nav':"if(String(e?.detail?.id||'')==='forge')refreshForge()" in s,
 'forge_refresh_owner':"function refreshForge(){try{decorateForge();renderSetIfOpen()}" in s,
 'shop_v129_direct':"v6320V129BaseShop.apply(this,arguments);v129PolishDynamicCards()" in s,
 'shop_v129_timeout_removed':"setTimeout(v129PolishDynamicCards,180)" not in s,
 'shop_v131_scoped':"__v131ShopCleanWrapped" in s and "v131BaseRenderShop=renderShop" in s,
 'shop_v131_global_wrapper_removed':"const v131BaseRender=render;" not in s,
 'shop_v135_scoped':"__v135ShopPaintWrapped" in s and "v135BaseRenderShop=renderShop" in s,
 'shop_v135_global_wrapper_removed':"const v135BaseRender=render;" not in s,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-INLINE-GROW-FORGE-SHOP-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_INLINE_GROW_FORGE_SHOP_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
