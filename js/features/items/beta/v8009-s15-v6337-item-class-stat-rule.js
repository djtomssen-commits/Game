(()=>{
'use strict';
if(window.__V6337_ITEM_CLASS_STAT_RULE__)return;
window.__V6337_ITEM_CLASS_STAT_RULE__=true;
function clsPrimary(c){return c==='scout'?'geschick':(c==='bruiser'||c==='summoner')?'intelligenz':'staerke'}
function native(it){try{return {...(it?.v429StatLock?.native||{})}}catch(_){return{}}}
function check(it){
 if(!it?.slot)return null;
 try{window.v447ApplyItemCurve?.(it)}catch(_){}
 const n=native(it),c=String(it.classId||s?.playerClass||'grower'),p=clsPrimary(c),q=String(it.quality||'gray').toLowerCase();
 const high=['purple','orange','cyan','prismatic'].includes(q);
 const allowed=new Set([p,'ausdauer',...(high?['glueck']:[])]);
 const keys=Object.keys(n).filter(k=>(Number(n[k])||0)>0);
 return {name:it.name||'',classId:c,quality:q,primary:p,native:n,valid:keys.includes(p)&&keys.includes('ausdauer')&&(high?keys.includes('glueck'):!keys.includes('glueck'))&&keys.every(k=>allowed.has(k))};
}
function normalize(){try{const changed=window.v447NormalizeAllItems?.();if(changed){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}return !!changed}catch(_){return false}}
window.v6337NormalizeItemStats=normalize;
window.v6337ItemStatDiagnostics=()=>{
 const items=[...(Array.isArray(s?.inventory)?s.inventory:[]),...Object.values(s?.equipment||{}),...(Array.isArray(s?.weaponShop)?s.weaponShop:[]),...(Array.isArray(s?.magicShop)?s.magicShop:[])].filter(Boolean);
 const rows=items.map(check).filter(Boolean);return{version:'V6.347',count:rows.length,invalid:rows.filter(x=>!x.valid),sample:rows.slice(0,12)};
};
normalize();
})();
