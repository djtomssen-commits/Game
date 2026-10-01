
/* ===== V4.02: exactly 1 gem + 1 enchant per item ===== */
window.v030UseMaterial=function(i){
  const mat=s.materials[i];
  if(!mat)return;
  const chosen=v030ChooseEquipped(`${mat.icon} ${mat.name} anwenden auf:`);
  if(!chosen)return;
  const [slot,it]=chosen;
  it.bonus??={};

  if(mat.type==='gem'){
    if(it.gem){
      if(!confirm(`Auf diesem Item steckt bereits ${it.gem.name}. Der alte Edelstein wird ersetzt. Fortfahren?`))return;
      if(it.gem.stat && it.gem.value) it.bonus[it.gem.stat]=Math.max(0,(it.bonus[it.gem.stat]||0)-it.gem.value);
    }
    it.gem={name:mat.name,stat:mat.stat,value:mat.value,icon:mat.icon};
    it.bonus[mat.stat]=(it.bonus[mat.stat]||0)+mat.value;
  }else if(mat.type==='scroll'){
    if(Array.isArray(it.enchants) && it.enchants.length){
      if(!confirm(`Auf diesem Item liegt bereits ${it.enchants[0].name}. Die alte Verzauberung wird ersetzt. Fortfahren?`))return;
      const old=it.enchants[0];
      if(old.effect==='luck' && old.value) it.bonus.glueck=Math.max(0,(it.bonus.glueck||0)-old.value);
    }
    const ench={name:mat.name,effect:mat.effect,value:mat.value,icon:mat.icon};
    it.enchants=[ench];
    if(mat.effect==='luck') it.bonus.glueck=(it.bonus.glueck||0)+mat.value;
  }
  s.equipment[slot]=it;
  s.materials.splice(i,1);
  persist();
};

/* Migrate any older stacked enchantments down to one per item. */
(function(){
  let changed=false;
  Object.values(s.equipment||{}).forEach(it=>{
    if(it && Array.isArray(it.enchants) && it.enchants.length>1){
      const keep=it.enchants[it.enchants.length-1];
      for(const old of it.enchants.slice(0,-1)){
        if(old.effect==='luck' && old.value && it.bonus) it.bonus.glueck=Math.max(0,(it.bonus.glueck||0)-old.value);
      }
      it.enchants=[keep]; changed=true;
    }
  });
  (s.inventory||[]).forEach(it=>{ if(it && Array.isArray(it.enchants) && it.enchants.length>1){it.enchants=[it.enchants[it.enchants.length-1]];changed=true;} });
  if(changed)localStorage.setItem(KEY,JSON.stringify(s));
})();

/* Clarify the rule in the materials UI. */
const v031OldMaterials=typeof v030RenderMaterials==='function'?v030RenderMaterials:null;
if(v031OldMaterials){
 v030RenderMaterials=function(){
  v031OldMaterials();
  const panel=document.querySelector('#v030Materials');
  const muted=panel?.querySelector('.muted');
  if(muted)muted.textContent='Pro Ausrüstungsteil: maximal 1 Edelstein + 1 Verzauberung. Neue ersetzen die vorhandenen.';
 };
}
try{render()}catch(e){console.error('V4.02',e)}
