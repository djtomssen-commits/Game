/* V4.02 loot/item balance */
const V024_RARITY={
 gray:{m:1.00,s:1.00},green:{m:1.18,s:1.25},blue:{m:1.42,s:1.65},
 purple:{m:1.78,s:2.25},orange:{m:2.25,s:3.20},cyan:{m:2.75,s:4.20}
};
function v024Scale(level){return 1+(Math.max(1,level)-1)*.115}
function v024Bonus(b,q,l){const o={};const m=(V024_RARITY[q]||V024_RARITY.gray).m*v024Scale(l);Object.entries(b||{}).forEach(([k,v])=>o[k]=Math.max(1,Math.round(v*m)));return o}
function v024Quality(source){
 const r=Math.random();
 if(source==='event')return'cyan';
 if(source==='boss')return r<.08?'orange':'purple';
 if(source==='dungeon'){if(r<.50)return'gray';if(r<.80)return'green';if(r<.955)return'blue';if(r<.995)return'purple';return'orange'}
 if(r<.58)return'gray';if(r<.86)return'green';if(r<.975)return'blue';return'purple'
}
function v024Item(base,source='normal',forced=null){
 const l=Math.max(1,s.level||1),q=forced||v024Quality(source),qm=qualityMeta(q);
 const n=String(base.name||'Ausrüstung').replace(/^(Normal|Gewöhnlich|Rare|Episch|Legendär|Mystisch):\s*/,'').replace(/\s*\[Lv\.\d+\]\s*$/,'');
 return {...base,id:`${base.id||'loot'}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,price:0,name:`${qm.label}: ${n} [Lv.${l}]`,quality:q,rarity:qm.cls,dropLevel:l,bonus:v024Bonus(base.bonus,q,l)}
}
makeClassLoot=function(classId,source='normal'){
 const pool=classGear[classId]||classGear.grower,base=pool[Math.floor(Math.random()*pool.length)];
 return {...v024Item(base,source),classId}
};
makeLoot=function(base,source='normal'){return v024Item(base,source)};
const v024OldSet=makeSetItem;
makeSetItem=function(classId,slot){
 const x=v024OldSet(classId,slot),l=Math.max(1,s.level||1);
 x.dropLevel=l;x.quality='purple';x.rarity='epic';x.bonus=v024Bonus(x.bonus,'purple',l);x.name=String(x.name).replace(/\[Lv\.\d+\]/,`[Lv.${l}]`);return x
};
sellValue=function(it){
 const map={'common-gray':'gray','uncommon':'green','rare':'blue','epic':'purple','legendary':'orange','mythic':'cyan'};
 const q=it?.quality||map[it?.rarity]||'gray',rm=V024_RARITY[q]||V024_RARITY.gray,l=Math.max(1,+it?.dropLevel||1);
 const st=Object.values(it?.bonus||{}).reduce((a,b)=>a+(+b||0),0);
 return Math.max(8,Math.round((18+l*5+st*7)*rm.s))
};
comparison=function(it){
 if(!it)return'';const old=s.equipment?.[it.slot],score=x=>Object.values(x?.bonus||{}).reduce((a,b)=>a+(+b||0),0);
 if(!old)return`<span class="better">▲ Freier Slot · Item Lv.${it.dropLevel||1}</span>`;
 const d=score(it)-score(old),lv=`Lv.${it.dropLevel||1} vs Lv.${old.dropLevel||1}`;
 return d>0?`<span class="better">▲ +${d} Gesamtwerte · ${lv}</span>`:d<0?`<span class="worse">▼ ${d} Gesamtwerte · ${lv}</span>`:`<span class="same">= Gleiche Gesamtwerte · ${lv}</span>`
};
if(!s.v024Migrated){
 const norm=it=>{if(!it)return it;it.dropLevel??=Math.max(1,s.level||1);if(!it.quality){const m={'common-gray':'gray','uncommon':'green','rare':'blue','epic':'purple','legendary':'orange','mythic':'cyan'};it.quality=m[it.rarity]||'gray'}it.rarity=qualityMeta(it.quality).cls;return it};
 s.inventory=(s.inventory||[]).map(norm);Object.keys(s.equipment||{}).forEach(k=>s.equipment[k]=norm(s.equipment[k]));s.v024Migrated=true;localStorage.setItem(KEY,JSON.stringify(s))
}
try{persist(false);render()}catch(e){console.error('V4.02',e)}
