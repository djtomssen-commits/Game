/* ===== V4.02 version sync + purchase feedback ===== */

function v037SyncVersion(){
  document.querySelectorAll('.version').forEach(el=>{
    el.textContent='V4.29 Stable';
  });
}

function v037Toast(msg,type='success'){
  let t=document.querySelector('#v037Toast');
  if(!t){
    t=document.createElement('div');
    t.id='v037Toast';
    t.className='v037-toast';
    document.body.appendChild(t);
  }
  t.className=`v037-toast ${type}`;
  t.textContent=msg;
  clearTimeout(window._v037ToastTimer);
  requestAnimationFrame(()=>t.classList.add('show'));
  window._v037ToastTimer=setTimeout(()=>t.classList.remove('show'),2400);
}

function v037BoughtMessage(it,destination='Inventar'){
  const name=it?.name||'Gegenstand';
  v037Toast(`✅ ${name} gekauft und im ${destination} abgelegt.`,'success');
}
function v037NoGold(){
  v037Toast('❌ Nicht genug Gold für diesen Kauf.','error');
}

/* Standard legacy shop purchase */
window.buy=function(id){
  const pool=[...(typeof items!=='undefined'?items:[]),...(typeof allClassGear!=='undefined'?allClassGear:[])];
  const it=pool.find(x=>x.id===id);
  if(!it)return;
  if(s.gold<it.price){
    v037NoGold();
    return;
  }
  s.gold-=it.price;
  const bought={...it,id:`${it.id}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`};
  s.inventory.push(bought);
  v037BoughtMessage(bought,'Inventar');
  persist();
};

/* V4.02 weapons/armor rotating shop */
window.v030BuyWeapon=function(i){
  const it=s.weaponShop?.[i];
  if(!it)return;
  if(s.gold<it.price){
    v037NoGold();
    return;
  }
  s.gold-=it.price;
  const bought={...it,id:it.uid||`gear_${Date.now()}_${Math.random().toString(36).slice(2,7)}`};
  s.inventory.push(bought);
  s.weaponShop[i]=v030MakeGear(v030WeaponBase());
  v037BoughtMessage(bought,'Inventar');
  persist();
};

/* Jewelry, gems, enchant scrolls */
window.v030BuyMagic=function(i){
  const it=s.magicShop?.[i];
  if(!it)return;
  if(s.gold<it.price){
    v037NoGold();
    return;
  }
  s.gold-=it.price;

  if(it.type==='gem'||it.type==='scroll'){
    const bought={...it};
    s.materials.push(bought);
    s.magicShop[i]=(i<2?v030MakeJewelryOffer():v030MakeMaterial());
    v037BoughtMessage(bought,'Material-Inventar');
  }else{
    const bought={...it,id:it.uid||`jewel_${Date.now()}_${Math.random().toString(36).slice(2,7)}`};
    s.inventory.push(bought);
    s.magicShop[i]=(i<2?v030MakeJewelryOffer():v030MakeMaterial());
    v037BoughtMessage(bought,'Inventar');
  }
  persist();
};

/* Seed shop feedback */
const v037OldBuySeedAction = buySeedAction;
buySeedAction=function(id){
  const x=seedTypes[id];
  if(!x)return;
  if(s.gold<x.buy){
    v037NoGold();
    return;
  }
  s.gold-=x.buy;
  s.grow.seeds[id]=(s.grow.seeds[id]||0)+1;
  v037Toast(`✅ ${x.name} gekauft. Vorrat: ${s.grow.seeds[id]}`,'success');
  growMessage(`${x.name}: 1 Samen gekauft.`);
  persist();
};
window.buySeed=buySeedAction;

/* Grow upgrades: explicit purchase messages */
upgradeGrowAction=function(k){
  s.grow.equipment??={lamp:0,pots:0};
  const lv=s.grow.equipment[k]||0;
  const c=(k==='lamp'?120:130)+lv*(k==='lamp'?140:150);
  if(s.gold<c){
    v037NoGold();
    return;
  }
  s.gold-=c;
  s.grow.equipment[k]=lv+1;
  const label=k==='lamp'?'Lampe':'Töpfe';
  v037Toast(`✅ ${label} auf Level ${lv+1} verbessert.`,'success');
  growMessage(`${label} auf Level ${lv+1} verbessert.`);
  persist();
};
window.upgradeGrowEquip=upgradeGrowAction;

upgradeRoomAction=function(){
  const c=150*s.grow.roomLevel;
  if(s.gold<c){
    v037NoGold();
    return;
  }
  s.gold-=c;
  s.grow.roomLevel++;
  v037Toast(`✅ Growroom auf Level ${s.grow.roomLevel} verbessert.`,'success');
  growMessage(`Growroom auf Level ${s.grow.roomLevel} verbessert.`);
  persist();
};

/* V6.320: obsolete version-only render wrapper retired. Purchase handlers above remain active. */
