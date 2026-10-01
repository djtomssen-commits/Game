/* ===== V4.02 Material slots + modern selection dialog ===== */

function v122NormalizeSocketState(it){
  if(!it||typeof it!=='object')return it;

  /* Exactly ONE gem */
  if(Array.isArray(it.gems) && it.gems.length){
    if(!it.gem)it.gem=it.gems[it.gems.length-1];
    delete it.gems;
  }

  /* Exactly ONE enchantment */
  if(Array.isArray(it.enchants) && it.enchants.length){
    const keep=it.enchant || it.enchants[it.enchants.length-1];
    it.enchant=keep;
    it.enchants=[keep];
  }else if(it.enchant){
    it.enchants=[it.enchant];
  }else{
    it.enchants=[];
  }

  return it;
}

function v122MigrateAllSockets(){
  let changed=false;
  const fix=it=>{
    if(!it||typeof it!=='object')return;
    const oldGemCount=Array.isArray(it.gems)?it.gems.length:0;
    const oldEnchantCount=Array.isArray(it.enchants)?it.enchants.length:0;

    /*
      If legacy stacked enchants exist, remove stored direct Luck bonuses
      for all discarded enchantments before keeping one.
    */
    if(oldEnchantCount>1){
      const keep=it.enchant || it.enchants[it.enchants.length-1];
      for(const old of it.enchants){
        if(old===keep)continue;
        if(old?.effect==='luck' && old?.value && it.bonus){
          it.bonus.glueck=Math.max(0,(Number(it.bonus.glueck)||0)-(Number(old.value)||0));
        }
      }
      it.enchant=keep;
      it.enchants=[keep];
      changed=true;
    }

    if(oldGemCount>1){
      if(!it.gem)it.gem=it.gems[it.gems.length-1];
      delete it.gems;
      changed=true;
    }

    v122NormalizeSocketState(it);
  };

  Object.values(s.equipment||{}).forEach(fix);
  (s.inventory||[]).forEach(fix);

  if(changed){
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    try{v075ScheduleSave()}catch(e){}
  }
}

function v122EnsureSelectOverlay(){
  if(document.querySelector('#v122SelectOverlay'))return;

  const ov=document.createElement('div');
  ov.id='v122SelectOverlay';
  ov.className='v122-select-overlay';
  ov.innerHTML=`
    <div class="v122-select-card">
      <div class="v122-select-head">
        <div class="v122-select-icon" id="v122SelectIcon">💎</div>
        <div class="v122-select-title" id="v122SelectTitle">Gegenstand auswählen</div>
        <div class="v122-select-sub" id="v122SelectSub"></div>
      </div>
      <div class="v122-select-list" id="v122SelectList"></div>
      <div class="v122-select-footer">
        <button type="button" class="btn secondary" id="v122SelectCancel" style="width:100%">Abbrechen</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
}

function v122ChooseEquippedItem(material){
  v122EnsureSelectOverlay();

  const entries=Object.entries(s.equipment||{}).filter(([,it])=>it&&typeof it==='object');

  if(!entries.length){
    v115Alert('Du hast noch keinen Gegenstand angelegt. Lege zuerst ein Item an.','Kein Gegenstand','warn');
    return Promise.resolve(null);
  }

  return new Promise(resolve=>{
    const ov=document.querySelector('#v122SelectOverlay');
    const list=document.querySelector('#v122SelectList');
    const cancel=document.querySelector('#v122SelectCancel');

    document.querySelector('#v122SelectIcon').textContent=material?.icon || (material?.type==='scroll'?'📜':'💎');
    document.querySelector('#v122SelectTitle').textContent=material?.type==='scroll'?'Verzauberung anwenden':'Stein sockeln';
    document.querySelector('#v122SelectSub').textContent=
      `Wähle einen angelegten Gegenstand für ${material?.name||'das Material'}. Pro Item ist genau 1 Stein und 1 Verzauberung möglich.`;

    list.innerHTML='';

    const finish=value=>{
      ov.classList.remove('show');
      cancel.onclick=null;
      resolve(value);
    };

    entries.forEach(([slot,it])=>{
      v122NormalizeSocketState(it);
      const gem=it.gem?`💎 ${it.gem.name}`:'💎 kein Stein';
      const ench=it.enchant?`📜 ${it.enchant.name}`:'📜 keine Verzauberung';

      const btn=document.createElement('button');
      btn.type='button';
      btn.className='v122-select-item';
      btn.innerHTML=`
        <b>${it.icon||'🎁'} ${it.name}</b>
        <span>${gem}<br>${ench}</span>`;
      btn.onclick=()=>finish([slot,it]);
      list.appendChild(btn);
    });

    cancel.onclick=()=>finish(null);
    ov.classList.add('show');
  });
}

/* Remove the effect of the currently installed gem, then replace it. */
function v122RemoveGem(it){
  if(!it?.gem)return;
  const stat=it.gem.stat;
  const val=Number(it.gem.value)||0;
  if(stat && val && it.bonus?.[stat]!=null){
    it.bonus[stat]=Math.max(0,(Number(it.bonus[stat])||0)-val);
  }
  it.gem=null;
}

/* Remove the effect of the ONE current enchantment. */
function v122RemoveEnchant(it){
  v122NormalizeSocketState(it);
  const e=it?.enchant;
  if(!e)return;

  if(e.effect==='luck'){
    const val=Number(e.value)||0;
    if(it.bonus?.glueck!=null){
      it.bonus.glueck=Math.max(0,(Number(it.bonus.glueck)||0)-val);
    }
  }

  it.enchant=null;
  it.enchants=[];
}

/* Final active material handler. No prompt(), alert(), or native confirm(). */
window.v030UseMaterial=async function(index){
  const mat=s.materials?.[index];
  if(!mat)return;

  const chosen=await v122ChooseEquippedItem(mat);
  if(!chosen)return;

  const [slot,it]=chosen;
  it.bonus??={};
  v122NormalizeSocketState(it);

  if(mat.type==='gem'){
    if(it.gem){
      const ok=await v115Confirm(
        `Auf ${it.name} steckt bereits ${it.gem.name}.\n\nPro Gegenstand ist nur 1 Stein erlaubt. Der vorhandene Stein wird ersetzt.`,
        {title:'Stein ersetzen?',type:'warn',okText:`${mat.name} einsetzen`}
      );
      if(!ok)return;
      v122RemoveGem(it);
    }

    const stat=mat.stat;
    const value=Number(mat.value)||0;
    if(!stat||value<=0){
      return v115Alert('Dieser Stein hat ungültige Werte.','Stein-Fehler','error');
    }

    it.gem={
      name:mat.name,
      icon:mat.icon||'💎',
      stat,
      value,
      quality:mat.quality||'gray'
    };
    it.bonus[stat]=(Number(it.bonus[stat])||0)+value;

    s.equipment[slot]=it;
    s.materials.splice(index,1);
    persist();

    if(typeof v063Toast==='function'){
      v063Toast(
        '💎 Stein erfolgreich gesockelt',
        'success',
        `${mat.name} wurde auf ${it.name} eingesetzt · +${value} ${v030StatLabel(stat)}`
      );
    }
  }
  else if(mat.type==='scroll'){
    if(it.enchant || (Array.isArray(it.enchants)&&it.enchants.length)){
      const old=it.enchant || it.enchants[0];
      const ok=await v115Confirm(
        `Auf ${it.name} liegt bereits ${old.name}.\n\nPro Gegenstand ist nur 1 Rollen-Verzauberung erlaubt. Die vorhandene Verzauberung wird ersetzt.`,
        {title:'Verzauberung ersetzen?',type:'warn',okText:`${mat.name} anwenden`}
      );
      if(!ok)return;
      v122RemoveEnchant(it);
    }

    const effect=mat.effect;
    const value=Number(mat.value)||0;
    if(!effect||value<=0){
      return v115Alert('Diese Verzauberungsrolle hat ungültige Werte.','Rollen-Fehler','error');
    }

    const ench={
      name:mat.name,
      icon:mat.icon||'📜',
      effect,
      value,
      quality:mat.quality||'gray'
    };

    /* Keep both schemas synchronized for old combat code, but only ONE entry. */
    it.enchant=ench;
    it.enchants=[ench];

    if(effect==='luck'){
      it.bonus.glueck=(Number(it.bonus.glueck)||0)+value;
    }

    s.equipment[slot]=it;
    s.materials.splice(index,1);
    persist();

    if(typeof v063Toast==='function'){
      v063Toast(
        '📜 Verzauberung erfolgreich',
        'success',
        `${mat.name} wurde auf ${it.name} angewendet · ${v030EffectLabel(effect,value)}`
      );
    }
  }
  else{
    return v115Alert('Dieses Material kann nicht angewendet werden.','Material-Fehler','error');
  }
};

/* Replace legacy chooser names too, so this flow can never fall back to prompt(). */
v059ChooseEquippedItem=function(material){
  return v122ChooseEquippedItem(material);
};
v030Pick=function(){
  v115Alert('Diese alte Auswahl wird nicht mehr verwendet.','Hinweis','info');
  return null;
};

/* Clear any legacy stacked state once on upgrade. */
if(!s.v122SocketMigrated){
  v122MigrateAllSockets();
  s.v122SocketMigrated=true;
  try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
}

/* Materials UI: make the rule explicit. */
const v122OldRenderMaterials=typeof v030RenderMaterials==='function'?v030RenderMaterials:null;
if(v122OldRenderMaterials){
 v030RenderMaterials=function(){
  v122OldRenderMaterials();
  const panel=document.querySelector('#v030Materials');
  const muted=panel?.querySelector('.muted');
  if(muted){
    muted.textContent='Pro Ausrüstungsteil maximal 1 Stein + 1 Rollen-Verzauberung. Neue ersetzen die vorhandenen.';
  }
 };
}

const v122BaseRender=render;
render=function(){
  v122MigrateAllSockets();
  const result=v122BaseRender();
  
  return result;
};

setTimeout(()=>{
  try{
    v122EnsureSelectOverlay();
    v122MigrateAllSockets();
  }catch(e){}
},150);
