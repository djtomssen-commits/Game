/* ===== V4.02 Rarity Economy =====
   Shop: 74% grau / 22% grün / 3.5% blau / 0.5% episch
   Shop: niemals legendär/mystisch
   Dungeon normal: legendär 0.2%
   Dungeon boss: legendär 1%
   Mystisch: ausschließlich Event-Quelle
*/
function v027ShopQuality(){
  const r=Math.random();
  if(r<0.74)return'gray';
  if(r<0.96)return'green';
  if(r<0.995)return'blue';
  return'purple';
}
function v027DungeonQuality(isBoss=false){
  const r=Math.random();
  if(isBoss){
    // Boss still guarantees at least epic quality, but legendary is only 1%.
    return r<0.01?'orange':'purple';
  }
  // Regular dungeon loot: legendary is extremely rare (0.2%).
  if(r<0.52)return'gray';
  if(r<0.82)return'green';
  if(r<0.958)return'blue';
  if(r<0.998)return'purple';
  return'orange';
}
function v027QuestQuality(){
  const r=Math.random();
  // Quest loot never produces legendary or mythic.
  if(r<0.66)return'gray';
  if(r<0.91)return'green';
  if(r<0.992)return'blue';
  return'purple';
}

/* Central rarity source override. */
v024Quality=function(source){
  if(source==='event')return'cyan';
  if(source==='boss')return v027DungeonQuality(true);
  if(source==='dungeon')return v027DungeonQuality(false);
  if(source==='shop')return v027ShopQuality();
  return v027QuestQuality();
};

/* Shop items get deliberately softer stats than dungeon loot at same level. */
function v027ShopItem(base){
  const item=v024Item(base,'shop',v027ShopQuality());
  const q=item.quality||'gray';
  const shopStatFactor={gray:.88,green:.88,blue:.86,purple:.84}[q]||.88;
  Object.keys(item.bonus||{}).forEach(k=>{
    item.bonus[k]=Math.max(1,Math.round(item.bonus[k]*shopStatFactor));
  });
  const rarityPrice={gray:1,green:1.45,blue:2.35,purple:4.8}[q]||1;
  item.price=Math.max(30,Math.round((30+(item.dropLevel||1)*11+Object.values(item.bonus||{}).reduce((a,b)=>a+(+b||0),0)*9)*rarityPrice));
  item.shopItem=true;
  return item;
}

/* Replace shop refresh with rarity-aware offers while keeping class-specific gear. */
refreshShop=function(force=false){
  if(!force && Array.isArray(s.shop) && s.shop.length)return;
  const cls=s.playerClass||'grower';
  const own=classGear[cls]||classGear.grower;
  const otherClasses=['grower','bruiser','scout','frost','summoner'].filter(x=>x!==cls);
  const offers=[];
  for(let i=0;i<6;i++){
    let pool=own;
    // Small chance to see an off-class item, keeping the shop varied.
    if(i>=4 && Math.random()<.25){
      const oc=otherClasses[Math.floor(Math.random()*otherClasses.length)];
      pool=classGear[oc]||own;
    }
    const base=pool[Math.floor(Math.random()*pool.length)];
    offers.push(v027ShopItem(base));
  }
  s.shop=offers;
  persist(false);
};

/* Existing shop stock from older versions is regenerated once,
   preventing old legendary/mystic shop items from surviving the rule change. */
if(!s.v027ShopMigrated){
  s.shop=[];
  refreshShop(true);
  s.v027ShopMigrated=true;
  localStorage.setItem(KEY,JSON.stringify(s));
}

/* Hard safety: if any future shop generation accidentally creates orange/cyan,
   replace it before display/purchase. */
function v027SanitizeShop(){
  if(!Array.isArray(s.shop))s.shop=[];
  let changed=false;
  s.shop=s.shop.map(it=>{
    if(it && (it.quality==='orange'||it.quality==='cyan'||it.rarity==='legendary'||it.rarity==='mythic')){
      changed=true;
      const cls=it.classId||s.playerClass||'grower';
      const pool=classGear[cls]||classGear.grower;
      return v027ShopItem(pool[Math.floor(Math.random()*pool.length)]);
    }
    return it;
  });
  if(changed)persist(false);
}

const v027OldRenderShop=renderShop;
renderShop=function(){
  v027SanitizeShop();
  v027OldRenderShop();
  const host=document.querySelector('#shopItems')?.parentElement || document.querySelector('#shop');
  if(host && !document.querySelector('#v027ShopInfo')){
    const info=document.createElement('div');
    info.id='v027ShopInfo';
    info.className='tiny';
    info.style.margin='8px 0';
    info.innerHTML='🛒 Händler-Chancen: Normal 74% · Gewöhnlich 22% · Rare 3,5% · Episch 0,5% · <b>Legendär/Mystisch niemals im Shop.</b>';
    host.insertBefore(info,host.firstChild);
  }
};

/* Hard safety for mythic: only explicit "event" source can ever create cyan. */
const v027OldItem=v024Item;
v024Item=function(base,source='normal',forced=null){
  if(forced==='cyan' && source!=='event')forced=null;
  const item=v027OldItem(base,source,forced);
  if(source!=='event' && item.quality==='cyan'){
    item.quality='purple';
    item.rarity=qualityMeta('purple').cls;
    item.bonus=v024Bonus(base.bonus,'purple',Math.max(1,s.level||1));
    item.name=item.name.replace(/^Mystisch:/,'Episch:');
  }
  return item;
};

try{v027SanitizeShop();render()}catch(e){console.error('V4.02 rarity economy',e)}
