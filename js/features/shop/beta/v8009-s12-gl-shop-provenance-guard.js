(()=>{'use strict';
 if(window.__GL_SHOP_PROVENANCE_GUARD__)return;window.__GL_SHOP_PROVENANCE_GUARD__=true;
 function tag(it){if(!it||typeof it!=='object')return it;it.shopItem=true;it.source='shop';if(it.shopPaidPrice==null&&Number(it.price)>0)it.shopPaidPrice=Number(it.price);return it}
 function repair(){let changed=false;for(const it of (s?.inventory||[])){if(it?.shopItem===true&&String(it.source||'').toLowerCase()!=='shop'){it.source='shop';if(it.shopPaidPrice==null&&Number(it.price)>0)it.shopPaidPrice=Number(it.price);changed=true}}if(changed){try{persist(false)}catch(_){}}}
 function wrap(name,arrName){const base=window[name];if(typeof base!=='function'||base.__glShopSource)return;const fn=function(i){try{tag(s?.[arrName]?.[Number(i)])}catch(_){}return base.apply(this,arguments)};fn.__glShopSource=true;window[name]=fn;try{if(name==='v030BuyWeapon')v030BuyWeapon=fn;if(name==='v030BuyMagic')v030BuyMagic=fn}catch(_){}}
 function install(){try{(s?.weaponShop||[]).forEach(tag);(s?.magicShop||[]).forEach(tag);repair();wrap('v030BuyWeapon','weaponShop');wrap('v030BuyMagic','magicShop')}catch(_){}}
 install();document.addEventListener('DOMContentLoaded',install,{once:true});window.addEventListener('growlegends:account-ready',()=>setTimeout(install,60));window.addEventListener('pageshow',()=>setTimeout(install,60),{passive:true});
 window.vShopProvenanceQA=()=>({weaponTagged:(s?.weaponShop||[]).every(x=>!x||x.shopItem===true),magicTagged:(s?.magicShop||[]).every(x=>!x||x.shopItem===true),oldInventoryTagged:(s?.inventory||[]).filter(x=>x?.shopItem===true).every(x=>String(x.source||'').toLowerCase()==='shop')});
})();
