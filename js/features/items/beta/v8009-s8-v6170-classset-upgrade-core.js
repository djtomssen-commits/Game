(()=>{
 'use strict';
 if(window.__V6170_CLASSSET_UPGRADE__)return;window.__V6170_CLASSSET_UPGRADE__=true;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmt=v=>Math.max(0,Math.round(Number(v)||0)).toLocaleString('de-DE');
 function setItems(){
   const out=[];Object.entries(s?.equipment||{}).forEach(([slot,it])=>{if(it?.setId)out.push({item:it,where:'equip',slot})});
   (s?.inventory||[]).forEach((it,index)=>{if(it?.setId)out.push({item:it,where:'inv',index})});return out;
 }
 function findItem(id){for(const [slot,it] of Object.entries(s?.equipment||{}))if(it?.id===id)return{item:it,where:'equip',slot};const i=(s?.inventory||[]).findIndex(it=>it?.id===id);return i>=0?{item:s.inventory[i],where:'inv',index:i}:null}
 function costs(it){const level=Math.max(1,Number(s?.level)||1),old=Math.max(1,Number(it?.dropLevel)||1),gap=Math.max(0,level-old),slotBase={boots:18,head:24,ring:28,body:36,amulet:42,weapon:52}[it?.slot]||28;return{gap,fragments:Math.max(0,Math.round(slotBase*(1+gap/100))),gold:Math.max(0,Math.round(typeof window.v6168SetUpgradeGoldCost==='function'?window.v6168SetUpgradeGoldCost(it?.slot,level,gap):((3500+slotBase*260)*(1+level/240+gap/120))))}}
 function extrasInto(native,it){const out={...native},gem=it?.gem,e=(Array.isArray(it?.enchants)&&it.enchants.length?it.enchants[0]:it?.enchant);if(gem?.stat&&Number(gem.value))out[gem.stat]=(Number(out[gem.stat])||0)+Number(gem.value);if(e?.effect==='luck'&&Number(e.value))out.glueck=(Number(out.glueck)||0)+Number(e.value);return out}
 function upgradeHtml(){
   const level=Math.max(1,Number(s?.level)||1),rows=setItems().filter(x=>Math.max(1,Number(x.item?.dropLevel)||1)<level);
   if(!rows.length)return `<div id="v6170SetUpgrade"><h4>⬆️ Klassenset-Aufwertung</h4><p>Alle vorhandenen Set-Teile sind bereits auf deinem aktuellen Level. Einmal hergestellte Set-Teile müssen nicht neu über Genetik/PvP gebaut werden.</p></div>`;
   return `<div id="v6170SetUpgrade"><h4>⬆️ Klassenset-Aufwertung</h4><p>Alte Set-Teile auf das aktuelle Charakterlevel bringen. <b>Keine neue Essenz und keine neuen PvP-Buds</b> – nur Gold + Samenfragmente. Stein und Verzauberung bleiben erhalten.</p><div class="v6170-upgrade-list">${rows.map(({item})=>{const c=costs(item),ok=(Number(s?.gold)||0)>=c.gold&&(Number(s?.v488Forge?.fragments)||0)>=c.fragments;return `<div class="v6170-upgrade-item"><b>${esc(item.name||'Set-Teil')}</b><small>Lv.${Math.max(1,Number(item.dropLevel)||1)} → Lv.${level}<br>💠 ${fmt(c.fragments)} Fragmente · 🪙 ${fmt(c.gold)} Gold</small><button data-v6170-upgrade="${esc(item.id)}" ${ok?'':'disabled'}>Auf aktuelles Level aufwerten</button></div>`}).join('')}</div></div>`;
 }
 function inject(){const p=document.querySelector('#v6130ClassSetPanel');if(!p)return;const old=p.querySelector('#v6170SetUpgrade');if(old)old.remove();p.insertAdjacentHTML('beforeend',upgradeHtml())}
 async function doUpgrade(id){
   const ref=findItem(id);if(!ref)return;const it=ref.item,level=Math.max(1,Number(s?.level)||1),oldLevel=Math.max(1,Number(it?.dropLevel)||1);if(oldLevel>=level)return;
   const c=costs(it),fr=Math.max(0,Number(s?.v488Forge?.fragments)||0),gold=Math.max(0,Number(s?.gold)||0);if(fr<c.fragments||gold<c.gold)return;
   let ok=true;try{ok=typeof v115Confirm==='function'?await v115Confirm(`${it.name} von Level ${oldLevel} auf Level ${level} aufwerten?\n\n${c.fragments} Samenfragmente\n${c.gold} Gold\n\nStein und Verzauberung bleiben erhalten.`,{title:'Klassenset aufwerten',type:'confirm',okText:'Aufwerten'}):window.confirm('Klassenset aufwerten?')}catch(_){ok=false}if(!ok)return;
   const live=findItem(id);if(!live)return;const x=live.item,cc=costs(x),liveFr=Math.max(0,Number(s?.v488Forge?.fragments)||0),liveGold=Math.max(0,Number(s?.gold)||0);if(liveFr<cc.fragments||liveGold<cc.gold)return;
   const cls=(typeof v6170SetClass==='function'?v6170SetClass(x.setId||x.classId):String(x.setId||x.classId||'grower')),competitor=(s?.equipment?.[x.slot]&&s.equipment[x.slot]!==x)?s.equipment[x.slot]:null;
   let native=typeof v6170BuildSetBonus==='function'?v6170BuildSetBonus(cls,x.slot,level,competitor):{};
   const oldNative=typeof v6170SetNativeBonus==='function'?v6170SetNativeBonus(x):{};Object.entries(oldNative).forEach(([k,v])=>native[k]=Math.max(Number(native[k])||0,Number(v)||0));
   s.v488Forge.fragments=liveFr-cc.fragments;s.gold=liveGold-cc.gold;x.bonus=extrasInto(native,x);x.dropLevel=level;x.v6170ForgeLevel=level;x.v6170Guaranteed=true;x.v6170MinNativeTotal=Math.max(Number(x.v6170MinNativeTotal)||0,Object.values(native).reduce((n,v)=>n+(Number(v)||0),0));x.name=String(x.name||'Set-Teil').replace(/\s*\[Lv\.\d+\]\s*$/,'')+` [Lv.${level}]`;
   try{persist(false)}catch(_){}try{v069SyncCurrencies?.()}catch(_){}try{v441PaintResources?.()}catch(_){}try{render?.()}catch(_){}try{v063Toast?.('⬆️ Klassenset aufgewertet','success',`${x.name} · Stein und Rolle behalten`)}catch(_){}setTimeout(inject,30)
 }
 document.addEventListener('click',e=>{const b=e.target instanceof Element?e.target.closest('[data-v6170-upgrade]'):null;if(!b)return;e.preventDefault();void doUpgrade(b.dataset.v6170Upgrade)},true);
 const mo=new MutationObserver(()=>{if(document.querySelector('#v6130ClassSetPanel')&&!document.querySelector('#v6170SetUpgrade'))queueMicrotask(inject)});const v7291SetHost=document.getElementById('character');if(v7291SetHost)mo.observe(v7291SetHost,{childList:true,subtree:true});
 document.addEventListener('click',e=>{if(e.target instanceof Element&&e.target.closest('[data-v6130-settab]'))setTimeout(inject,35)},true);
 window.v6170RefreshSetUpgrade=inject;window.v6170UpgradeSetItem=doUpgrade;
})();
