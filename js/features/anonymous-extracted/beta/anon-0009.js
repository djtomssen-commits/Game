
/* ===== V4.02 MATERIAL APPLY FIX ===== */

function v059EquippedEntries(){
  return Object.entries(s.equipment||{}).filter(([slot,it])=>it && typeof it==='object');
}

function v059ChooseEquippedItem(material){
  const entries=v059EquippedEntries();
  if(!entries.length){
    v115Alert('Du hast noch keinen Gegenstand angelegt. Lege zuerst ein Item an.');
    return null;
  }

  const lines=entries.map(([slot,it],i)=>{
    const gem=it.gem ? ` · 💎 ${it.gem.name}` : '';
    const ench=it.enchant ? ` · 📜 ${it.enchant.name}` : '';
    return `${i+1}: ${it.name}${gem}${ench}`;
  }).join('\n');

  const input=prompt(
    `${material.icon||'✨'} ${material.name} anwenden auf:\n\n${lines}\n\nNummer eingeben:`
  );

  if(input===null)return null;

  const idx=Number(input)-1;
  if(!Number.isInteger(idx) || idx<0 || idx>=entries.length){
    v115Alert('Ungültige Auswahl.');
    return null;
  }

  return entries[idx];
}

function v059RemoveExistingGemBonus(it){
  if(!it?.gem)return;
  const stat=it.gem.stat;
  const val=Number(it.gem.value)||0;
  if(stat && val && it.bonus?.[stat]!=null){
    it.bonus[stat]=Math.max(0,(Number(it.bonus[stat])||0)-val);
  }
}

function v059RemoveExistingEnchantEffect(it){
  if(!it?.enchant)return;

  const e=it.enchant;
  if(e.effect==='luck'){
    const val=Number(e.value)||0;
    if(it.bonus?.glueck!=null){
      it.bonus.glueck=Math.max(0,(Number(it.bonus.glueck)||0)-val);
    }
  }
}

window.v030UseMaterial=function(index){
  const mat=s.materials?.[index];
  if(!mat)return;

  const chosen=v059ChooseEquippedItem(mat);
  if(!chosen)return;

  const [slot,it]=chosen;
  it.bonus??={};

  if(mat.type==='gem'){
    if(it.gem){
      const ok=confirm(
        `Auf ${it.name} steckt bereits ${it.gem.name}.\n\nDurch ${mat.name} ersetzen?`
      );
      if(!ok)return;

      v059RemoveExistingGemBonus(it);
    }

    const stat=mat.stat;
    const value=Number(mat.value)||0;

    if(!stat || value<=0){
      v115Alert('Dieser Edelstein hat ungültige Werte.');
      return;
    }

    it.gem={
      name:mat.name,
      icon:mat.icon||'💎',
      stat,
      value
    };

    it.bonus[stat]=(Number(it.bonus[stat])||0)+value;

    s.equipment[slot]=it;
    s.materials.splice(index,1);

    localStorage.setItem(KEY,JSON.stringify(s));

    if(typeof v054Toast==='function'){
      v054Toast(
        `💎 ${mat.name} eingesetzt`,
        'success',
        `${it.name}: +${value} ${v030StatLabel(stat)}`
      );
    }else{
      v115Alert(`${mat.name} wurde auf ${it.name} angewendet.`);
    }

  }else if(mat.type==='scroll'){
    if(it.enchant){
      const ok=confirm(
        `Auf ${it.name} liegt bereits ${it.enchant.name}.\n\nDurch ${mat.name} ersetzen?`
      );
      if(!ok)return;

      v059RemoveExistingEnchantEffect(it);
    }

    const effect=mat.effect;
    const value=Number(mat.value)||0;

    if(!effect || value<=0){
      v115Alert('Diese Rolle hat ungültige Werte.');
      return;
    }

    it.enchant={
      name:mat.name,
      icon:mat.icon||'📜',
      effect,
      value
    };

    /* Luck is stored directly as stat. Other enchants are read by combat helper. */
    if(effect==='luck'){
      it.bonus.glueck=(Number(it.bonus.glueck)||0)+value;
    }

    s.equipment[slot]=it;
    s.materials.splice(index,1);

    localStorage.setItem(KEY,JSON.stringify(s));

    if(typeof v054Toast==='function'){
      v054Toast(
        `📜 ${mat.name} angewendet`,
        'success',
        `${it.name}: ${v030EffectLabel(effect,value)}`
      );
    }else{
      v115Alert(`${mat.name} wurde auf ${it.name} angewendet.`);
    }

  }else{
    v115Alert('Dieses Material kann nicht angewendet werden.');
    return;
  }

  /* Refresh only relevant UI first */
  try{renderInventory();}catch(e){console.error(e);}
  try{v030Materials();}catch(e){console.error(e);}

  /* Then safe global render */
  try{render();}catch(e){console.error('render after material',e);}
};

/* Combat enchant reader: support both old enchants[] and new single enchant */
v030EnchantSum=function(effect){
  return Object.values(s.equipment||{}).reduce((sum,it)=>{
    if(!it)return sum;

    let total=0;

    if(it.enchant?.effect===effect){
      total+=Number(it.enchant.value)||0;
    }

    if(Array.isArray(it.enchants)){
      total+=it.enchants
        .filter(e=>e?.effect===effect)
        .reduce((a,e)=>a+(Number(e.value)||0),0);
    }

    return sum+total;
  },0);
};

/* Item display: show single gem + single enchant clearly */
const v059BaseItemBonus=itemBonus;
itemBonus=function(it){
  let txt=v059BaseItemBonus(it);

  if(it?.gem){
    const gemText=`💎 ${it.gem.name}: +${it.gem.value} ${v030StatLabel(it.gem.stat)}`;
    if(!txt.includes(it.gem.name))txt += `${txt?' · ':''}${gemText}`;
  }

  if(it?.enchant){
    const enchText=`📜 ${it.enchant.name}: ${v030EffectLabel(it.enchant.effect,it.enchant.value)}`;
    if(!txt.includes(it.enchant.name))txt += `${txt?' · ':''}${enchText}`;
  }

  return txt;
};

/* Rebuild materials panel buttons with direct click handlers */
function v059BindMaterialButtons(){
  const panel=document.querySelector('#v030Materials');
  if(!panel)return;

  panel.querySelectorAll('.inv-item').forEach((card,i)=>{
    const btn=card.querySelector('button');
    if(btn){
      btn.removeAttribute('onclick');
      btn.onclick=()=>window.v030UseMaterial(i);
    }
  });
}

const v059BaseRender=render;
render=function(){
  v059BaseRender();
  
  v059BindMaterialButtons();
};

try{
  render();
}catch(e){
  console.error('V4.02 material apply',e);
}
