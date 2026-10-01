/* ===== V4.02 Shops, Gems, Enchants ===== */
s.materials??=[];s.weaponShop??=[];s.magicShop??=[];
const v030ExtraGear={
 grower:[
  {id:'bb_mace',name:'Verdichteter Harzhammer',slot:'weapon',icon:'🔨',classId:'grower',bonus:{staerke:5,ausdauer:1}},
  {id:'bb_blade',name:'Klingenblatt-Axt',slot:'weapon',icon:'🪓',classId:'grower',bonus:{staerke:6}},
  {id:'bb_shoulders',name:'Dornen-Schulterpanzer',slot:'body',icon:'🛡️',classId:'grower',bonus:{ausdauer:5,staerke:2}},
  {id:'bb_mask',name:'Harzkrieger-Maske',slot:'head',icon:'🥷',classId:'grower',bonus:{staerke:3,ausdauer:3}},
  {id:'bb_greaves',name:'Wurzelstampfer',slot:'boots',icon:'🥾',classId:'grower',bonus:{staerke:3,ausdauer:3}}],
 scout:[
  {id:'bs_crossbow',name:'Ranken-Armbrust',slot:'weapon',icon:'🏹',classId:'scout',bonus:{geschick:6}},
  {id:'bs_knives',name:'Blattklingen',slot:'weapon',icon:'🗡️',classId:'scout',bonus:{geschick:5,glueck:1}},
  {id:'bs_coat',name:'Schattenlaub-Leder',slot:'body',icon:'🥋',classId:'scout',bonus:{geschick:4,ausdauer:3}},
  {id:'bs_mask',name:'Nachtblatt-Maske',slot:'head',icon:'🎭',classId:'scout',bonus:{geschick:4,glueck:2}},
  {id:'bs_steps',name:'Flinkblatt-Stiefel',slot:'boots',icon:'👢',classId:'scout',bonus:{geschick:5,glueck:1}}],
 bruiser:[
  {id:'bm_orb',name:'Nebel-Orb',slot:'weapon',icon:'🔮',classId:'bruiser',bonus:{intelligenz:6}},
  {id:'bm_book',name:'Buch der dichten Wolke',slot:'weapon',icon:'📕',classId:'bruiser',bonus:{intelligenz:5,glueck:1}},
  {id:'bm_mantle',name:'Mantel des Tiefnebels',slot:'body',icon:'🧥',classId:'bruiser',bonus:{intelligenz:4,ausdauer:3}},
  {id:'bm_crown',name:'Krone des Dunstes',slot:'head',icon:'👑',classId:'bruiser',bonus:{intelligenz:4,glueck:2}},
  {id:'bm_shoes',name:'Sporenschweber',slot:'boots',icon:'👞',classId:'bruiser',bonus:{intelligenz:4,geschick:2}}]};
Object.entries(v030ExtraGear).forEach(([c,l])=>classGear[c]=[...(classGear[c]||[]),...l]);
const v030Jewelry=[
 {id:'ring_resin',name:'Harzring',slot:'ring',icon:'💍',bonus:{ausdauer:3}},
 {id:'ring_focus',name:'Fokusring',slot:'ring',icon:'💠',bonus:{glueck:3}},
 {id:'amulet_root',name:'Wurzel-Amulett',slot:'amulet',icon:'📿',bonus:{ausdauer:3,glueck:1}},
 {id:'amulet_mist',name:'Nebel-Amulett',slot:'amulet',icon:'🧿',bonus:{glueck:4}},
 {id:'ring_power',name:'Ring des Harzbrechers',slot:'ring',icon:'💍',classId:'grower',bonus:{staerke:4}},
 {id:'amulet_archer',name:'Grünpfeil-Talisman',slot:'amulet',icon:'📿',classId:'scout',bonus:{geschick:4}},
 {id:'ring_mage',name:'Ring des Nebelzirkels',slot:'ring',icon:'💠',classId:'bruiser',bonus:{intelligenz:4}},
 {id:'ring_harzrufer',name:'Bud-Geister-Ring',slot:'ring',icon:'💍',classId:'summoner',bonus:{intelligenz:4,glueck:1}},
 {id:'amulet_harzrufer',name:'Seelen-Amulett',slot:'amulet',icon:'🧿',classId:'summoner',bonus:{intelligenz:3,ausdauer:2}}];
const v030Gems=[
 {id:'gem_whitewidow',type:'gem',name:'White-Widow-Stein',icon:'🤍',stat:'intelligenz',min:2,max:5},
 {id:'gem_harzkern',type:'gem',name:'Harzkern-Stein',icon:'🟠',stat:'staerke',min:2,max:5},
 {id:'gem_gruenpfeil',type:'gem',name:'Grünpfeil-Stein',icon:'🟢',stat:'geschick',min:2,max:5},
 {id:'gem_wurzel',type:'gem',name:'Wurzel-Stein',icon:'🟤',stat:'ausdauer',min:2,max:5},
 {id:'gem_lucky',type:'gem',name:'Glücksharz-Stein',icon:'🟡',stat:'glueck',min:1,max:4}];
const v030Scrolls=[
 {id:'scroll_crit',type:'scroll',name:'Rolle des kritischen Rauchs',icon:'📜',effect:'crit',min:1,max:4},
 {id:'scroll_power',type:'scroll',name:'Rolle der Verstärkung',icon:'📜',effect:'primaryPct',min:2,max:5},
 {id:'scroll_guard',type:'scroll',name:'Rolle der zähen Rinde',icon:'📜',effect:'damageReduce',min:1,max:3},
 {id:'scroll_luck',type:'scroll',name:'Rolle des Glücksnebels',icon:'📜',effect:'luck',min:1,max:3}];
function v030Rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function v030Uid(p){return `${p}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`}
function v030StatLabel(k){return({staerke:'Stärke',geschick:'Geschick',intelligenz:'Intelligenz',ausdauer:'Ausdauer',glueck:'Glück'})[k]||k}
function v030EffectLabel(e,v){return e==='crit'?`+${v}% Krit-Chance`:e==='primaryPct'?`+${v}% Hauptattribut-Schaden`:e==='damageReduce'?`-${v}% erlittener Schaden`:e==='luck'?`+${v} Glück`:`+${v}`}
function v030WeaponBase(){const p=(classGear[s.playerClass||'grower']||[]).filter(x=>['weapon','head','body','boots'].includes(x.slot));return p[Math.floor(Math.random()*p.length)]}
function v030MakeGear(base){const it=v027ShopItem(base);it.shopCategory='gear';it.uid=v030Uid(base.id||'gear');return it}
function v030MakeJewelry(slot=null){const wanted=slot?String(slot).toLowerCase():'';let p=v030Jewelry.filter(x=>(!x.classId||x.classId===s.playerClass)&&(!wanted||String(x.slot||'').toLowerCase()===wanted));if(!p.length)p=v030Jewelry.filter(x=>!x.classId||x.classId===s.playerClass);const b=p[Math.floor(Math.random()*p.length)],it=v027ShopItem(b);it.shopCategory='jewelry';it.uid=v030Uid(b.id);return it}
function v030MakeMaterial(){
 if(Math.random()<.58){const g=v030Gems[Math.floor(Math.random()*v030Gems.length)],q=v027ShopQuality(),boost={gray:0,green:1,blue:2,purple:3}[q]||0,v=v030Rand(g.min,g.max)+boost;return{uid:v030Uid(g.id),baseId:g.id,type:'gem',name:g.name,icon:g.icon,quality:q,rarity:qualityMeta(q).cls,stat:g.stat,value:v,price:Math.round((80+v*35)*({gray:1,green:1.3,blue:2,purple:3.6}[q]||1))}}
 const r=v030Scrolls[Math.floor(Math.random()*v030Scrolls.length)],q=v027ShopQuality(),boost={gray:0,green:0,blue:1,purple:2}[q]||0,v=v030Rand(r.min,r.max)+boost;return{uid:v030Uid(r.id),baseId:r.id,type:'scroll',name:r.name,icon:r.icon,quality:q,rarity:qualityMeta(q).cls,effect:r.effect,value:v,price:Math.round((100+v*45)*({gray:1,green:1.35,blue:2.2,purple:4}[q]||1))}}
function v030Fill(force=false){if(force||s.weaponShop.length!==6)s.weaponShop=Array.from({length:6},()=>v030MakeGear(v030WeaponBase()));const shapeOk=Array.isArray(s.magicShop)&&s.magicShop.length===6&&s.magicShop[0]?.slot==='ring'&&s.magicShop[1]?.slot==='amulet';if(force||!shapeOk)s.magicShop=Array.from({length:6},(_,i)=>i===0?v030MakeJewelry('ring'):i===1?v030MakeJewelry('amulet'):v030MakeMaterial());localStorage.setItem(KEY,JSON.stringify(s))}
if(!s.v030Init){s.weaponShop=[];s.magicShop=[];v030Fill(true);s.v030Init=true;localStorage.setItem(KEY,JSON.stringify(s))}else v030Fill(false);
window.v030BuyWeapon=i=>{const it=s.weaponShop[i];if(!it)return;if(s.gold<it.price)return v115Alert('Zu wenig Gold.');s.gold-=it.price;s.inventory.push({...it,id:it.uid});s.weaponShop[i]=v030MakeGear(v030WeaponBase());persist()};
window.v030BuyMagic=i=>{const it=s.magicShop[i];if(!it)return;if(s.gold<it.price)return v115Alert('Zu wenig Gold.');s.gold-=it.price;if(it.type==='gem'||it.type==='scroll')s.materials.push({...it});else s.inventory.push({...it,id:it.uid});s.magicShop[i]=i===0?v030MakeJewelry('ring'):i===1?v030MakeJewelry('amulet'):v030MakeMaterial();persist()};
function v030Choices(){return Object.entries(s.equipment||{}).filter(([,it])=>!!it)}
function v030Pick(title){const a=v030Choices();if(!a.length){v115Alert('Du hast noch keinen Gegenstand angelegt.');return null}const ans=prompt(`${title}\n\n${a.map(([sl,it],i)=>`${i+1}: ${it.icon||'🎁'} ${it.name}`).join('\n')}\n\nNummer eingeben:`);if(ans===null)return null;const n=Number(ans)-1;if(!Number.isInteger(n)||n<0||n>=a.length){v115Alert('Ungültige Auswahl.');return null}return a[n]}
window.v030UseMaterial=i=>{const m=s.materials[i];if(!m)return;const c=v030Pick(`${m.icon} ${m.name} anwenden auf:`);if(!c)return;const[slot,it]=c;it.bonus??={};
 if(m.type==='gem'){if(it.gem&&!confirm(`Auf diesem Item steckt bereits ${it.gem.name}. Ersetzen?`))return;if(it.gem?.stat&&it.gem?.value)it.bonus[it.gem.stat]=Math.max(0,(it.bonus[it.gem.stat]||0)-it.gem.value);it.gem={name:m.name,stat:m.stat,value:m.value,icon:m.icon};it.bonus[m.stat]=(it.bonus[m.stat]||0)+m.value}
 else{it.enchants??=[];const oi=it.enchants.findIndex(x=>x.effect===m.effect),en={name:m.name,effect:m.effect,value:m.value,icon:m.icon};if(oi>=0){if(!confirm('Diese Verzauberung ist bereits vorhanden. Ersetzen?'))return;it.enchants[oi]=en}else it.enchants.push(en);if(m.effect==='luck')it.bonus.glueck=(it.bonus.glueck||0)+m.value}
 s.equipment[slot]=it;s.materials.splice(i,1);persist()};
function v030EnchantSum(effect){return Object.values(s.equipment||{}).reduce((sum,it)=>sum+(it?.enchants||[]).filter(e=>e.effect===effect).reduce((a,e)=>a+(+e.value||0),0),0)}
const v030BasePrimary=v029PrimaryStat;v029PrimaryStat=function(){return v030BasePrimary()*(1+v030EnchantSum('primaryPct')/100)};
const v030BaseTotal=totalAttr;totalAttr=function(k){let v=v030BaseTotal(k);if(k==='glueck')v+=v030EnchantSum('crit')/1.2;if(k==='ausdauer')v+=v030EnchantSum('damageReduce')*.8;return v};
const v030BaseBonus=itemBonus;itemBonus=function(it){let t=v030BaseBonus(it);if(it?.gem)t+=`${t?' · ':''}${it.gem.icon||'💎'} ${it.gem.name}: +${it.gem.value} ${v030StatLabel(it.gem.stat)}`;if(it?.enchants?.length)t+=`${t?' · ':''}`+it.enchants.map(e=>`${e.icon||'📜'} ${v030EffectLabel(e.effect,e.value)}`).join(' · ');return t};
function v030Offer(it,fn,i){const info=it.type==='gem'?`💎 +${it.value} ${v030StatLabel(it.stat)}`:it.type==='scroll'?`✨ ${v030EffectLabel(it.effect,it.value)}`:itemBonus(it);return`<div class="shop-item ${it.rarity||''}"><div class="shop-icon">${it.icon||'🎁'}</div><h3>${it.name}</h3><div class="${qualityMeta(it.quality||'gray').color}">${qualityMeta(it.quality||'gray').label}</div><div class="tiny" style="margin-top:5px">${info}</div><div class="price" style="margin:7px 0">💰 ${it.price} Gold</div><button class="btn" style="width:100%;padding:8px" onclick="${fn}(${i})">Kaufen</button></div>`}
renderShop=function(){
  /* V8.009: legacy V030 shop DOM producer retired.
     v057/v461 own the live shop; V030 keeps generators/material mechanics only. */
  v030Fill(false);
  return false;
};

function v030Materials(){let p=document.querySelector('#v030Materials'),ch=document.querySelector('#character');if(!ch)return;if(!p){p=document.createElement('div');p.className='card';p.id='v030Materials';ch.appendChild(p)}p.innerHTML=`<div class="section-title"><div><h2>💎 Edelsteine & Rollen</h2><div class="muted">Material auswählen und auf ein angelegtes Item anwenden.</div></div><span class="pill">${s.materials.length}</span></div>${s.materials.length?`<div class="inventory-grid">${s.materials.map((m,i)=>`<div class="inv-item ${m.rarity||''}"><div class="item-name">${m.icon} ${m.name}</div><div class="${qualityMeta(m.quality||'gray').color}">${qualityMeta(m.quality||'gray').label}</div><div class="item-bonus">${m.type==='gem'?`+${m.value} ${v030StatLabel(m.stat)}`:v030EffectLabel(m.effect,m.value)}</div><button class="btn" style="width:100%;padding:8px" onclick="v030UseMaterial(${i})">Auf Item anwenden</button></div>`).join('')}</div>`:'<div class="empty">Noch keine Edelsteine oder Rollen.</div>'}`}
/* V8.009: global render shop/material fan-out retired. Shop navigation/purchase owns renderShop; character material owner owns v030Materials. */
