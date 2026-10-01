(()=>{
'use strict';
if(window.__V6168_GOLD_ECONOMY__)return;window.__V6168_GOLD_ECONOMY__=true;
const MAX=300;
const clampLevel=v=>Math.max(1,Math.min(MAX,Math.floor(Number(v)||1)));
const round10=v=>Math.max(1,Math.round((Number(v)||0)/10)*10);
const round100=v=>Math.max(100,Math.round((Number(v)||0)/100)*100);
const round5000=v=>Math.max(5000,Math.round((Number(v)||0)/5000)*5000);
/* Referenz, kein Limit: normal aktiver Spieler ~500 Gold je Charakterlevel/Tag.
   Mehr Dampf/PvP/Dungeon/Grow bleibt echter Mehrverdienst. */
function daily(level){const lv=clampLevel(level);return round100(Math.max(1000,lv*500))}
function bandMid(level){const lv=clampLevel(level),tier=Math.floor((lv-1)/25),lo=tier*25+1,hi=Math.min(MAX,(tier+1)*25);return Math.round((lo+hi)/2)}
function questBase(level){return round10(daily(level)*.04)}
function quality(it){const q=String(it?.quality||'').toLowerCase(),r=String(it?.rarity||'').toLowerCase();if(['gray','green','blue','purple','orange','cyan'].includes(q))return q;if(/myst|cyan/.test(r))return'cyan';if(/legend|orange/.test(r))return'orange';if(/epic|purple/.test(r))return'purple';if(/rare|blue/.test(r))return'blue';if(/green|uncommon/.test(r))return'green';return'gray'}
function shopPrice(it,level){const lv=clampLevel(level||it?.dropLevel),q=quality(it),pct={gray:.08,green:.12,blue:.22,purple:.40,orange:.70,cyan:1.10}[q]||.08,slot={boots:.90,head:1,ring:.92,body:1.05,amulet:.96,weapon:1.12,weapon2:1.12}[it?.slot]||1;return round10(daily(lv)*pct*slot)}
function prismGold(level){return round5000(daily(bandMid(level))*8)}
function classSetGold(slot,level){const f={boots:.40,head:.50,ring:.65,body:.85,amulet:1.10,weapon:1.45,weapon2:1.45}[slot]||.65;return round100(daily(bandMid(level))*f)}
function setUpgradeGold(slot,level,gap){gap=Math.max(1,Number(gap)||1);const f={boots:.18,head:.22,ring:.25,body:.30,amulet:.34,weapon:.40,weapon2:.40}[slot]||.25;return round100(daily(bandMid(level))*f*(.50+Math.min(2,gap/50)))}
function pvpGold(level,win){return round10(daily(level)*(win?.025:.010))}
function dungeonGold(level,boss){return round10(daily(level)*(boss?.08:.02))}
function growGold(level,growMs,rarity,qMul,pot,mastery){const hours=Math.max(1/60,Number(growMs||60000)/3600000),rar={common:1,uncommon:1.05,rare:1.10,epic:1.18,legendary:1.30}[String(rarity||'common')]||1;/* 4 dauerhaft belegte Slots ~= 20 % eines Referenztages vor Qualitäts-/Upgrade-Boni. */return round10(daily(level)*.20*(hours/24)/4*(Number(qMul)||1)*rar*(Number(pot)||1)*(Number(mastery)||1))}
window.v6168DailyGold=daily;
window.v6168QuestBaseGold=questBase;
window.v6168ShopPrice=shopPrice;
window.v6168PrismGoldCost=prismGold;
window.v6168ClassSetGoldCost=classSetGold;
window.v6168SetUpgradeGoldCost=setUpgradeGold;
window.v6168PvpGold=pvpGold;
window.v6168DungeonGold=dungeonGold;
window.v6168GrowHarvestGold=growGold;

function questGold(q){if(!q)return q;let role=String(q.v309Role||q.v310BaseRole||'normal');if(role==='elite')role=String(q.v310BaseRole||'normal');const mult={quick:.76,normal:1,heavy:1.50}[role]||1;let gold=questBase(s?.level)*mult;if(q.v310Elite)gold*=1.35;q.gold=round10(gold);q.v274BaseGold=q.gold;q.v6168GoldBalanced=true;return q}
/* Final quest generator wrapper: every new offer enters the same economy. */
try{if(typeof makeQuest==='function'&&!makeQuest.__v6168Gold){const base=makeQuest;const wrapped=function(){return questGold(base.apply(this,arguments))};wrapped.__v6168Gold=true;makeQuest=wrapped;window.makeQuest=wrapped}}catch(e){console.warn('V4.168 quest gold',e)}
/* Reprice only unaccepted visible offers. An already running quest keeps the reward shown when it was accepted. */
try{if(Array.isArray(s?.quests?.offers))s.quests.offers.forEach(questGold)}catch(e){}

function repriceShopItem(it){if(!it||typeof it!=='object')return it;if(it.shopItem===true||String(it.source||'').toLowerCase()==='shop'){it.price=shopPrice(it,it.dropLevel||s?.level);it.v6168GoldBalanced=true}return it}
try{if(typeof v027ShopItem==='function'&&!v027ShopItem.__v6168Gold){const base=v027ShopItem;const wrapped=function(){return repriceShopItem(base.apply(this,arguments))};wrapped.__v6168Gold=true;v027ShopItem=wrapped;window.v027ShopItem=wrapped}}catch(e){console.warn('V4.168 shop generator',e)}
try{[s?.weaponShop,s?.magicShop].forEach(arr=>Array.isArray(arr)&&arr.forEach(repriceShopItem))}catch(e){}

/* Keep ordinary selling low; bought shop gear can never be resold above 12 % of paid/current shop price. */
try{if(typeof sellValue==='function'&&!sellValue.__v6168Gold){const base=sellValue;const wrapped=function(it){const normal=Math.max(0,Number(base.apply(this,arguments))||0);if(it&&(it.shopItem===true||String(it.source||'').toLowerCase()==='shop')){const paid=Math.max(0,Number(it.shopPaidPrice??it.price)||0);return Math.max(1,Math.min(normal,Math.round(paid*.12)))}return normal};wrapped.__v6168Gold=true;sellValue=wrapped;window.sellValue=wrapped}}catch(e){console.warn('V4.168 sell guard',e)}

function paint(){try{if(typeof renderShop==='function'&&document.querySelector('#shop.active'))renderShop();if(typeof window.v488ForgeRender==='function'&&document.querySelector('#forge.active'))window.v488ForgeRender()}catch(_){}}
try{persist(false)}catch(_){}
document.addEventListener('DOMContentLoaded',()=>setTimeout(paint,80),{once:true});
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>{try{if(Array.isArray(s?.quests?.offers))s.quests.offers.forEach(questGold);[s?.weaponShop,s?.magicShop].forEach(arr=>Array.isArray(arr)&&arr.forEach(repriceShopItem));persist(false)}catch(_){}paint()},120));
window.v6168GoldEconomyQA=()=>({referenceDaily:{L25:daily(25),L50:daily(50),L80:daily(80),L100:daily(100),L150:daily(150),L200:daily(200),L250:daily(250),L300:daily(300)},shopL80:{gray:shopPrice({quality:'gray',slot:'head'},80),green:shopPrice({quality:'green',slot:'head'},80),blue:shopPrice({quality:'blue',slot:'head'},80),epic:shopPrice({quality:'purple',slot:'head'},80),legendary:shopPrice({quality:'orange',slot:'head'},80)},prism:{L80:prismGold(80),L150:prismGold(150),L300:prismGold(300)},classSetL80:{boots:classSetGold('boots',80),head:classSetGold('head',80),ring:classSetGold('ring',80),body:classSetGold('body',80),amulet:classSetGold('amulet',80),weapon:classSetGold('weapon',80)},noGoldCap:true});
})();
