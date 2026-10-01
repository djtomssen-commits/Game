/* ===== V4.02: migrate player-facing legacy browser confirmations ===== */

/* Class selection */
window.chooseClass=async id=>{
  if(!classes[id])return;
  if(s.classLocked)return v115Alert('Deine Klasse ist bereits festgelegt.','Klasse festgelegt','warn');
  const ok=await v115Confirm(
    `${classes[id].name} wirklich als feste Klasse wählen?\n\nDie Klasse kann später nicht gewechselt werden.`,
    {title:'Klasse wählen',type:'warn',okText:'Klasse wählen'}
  );
  if(!ok)return;
  s.playerClass=id;s.classLocked=true;persist();
};

/* Inventory sale */
window.sellItem=async i=>{
  const it=s.inventory[i];if(!it)return;
  const value=sellValue(it);
  const ok=await v115Confirm(
    `${it.name}\n\nVerkaufspreis: ${value} Gold`,
    {title:'Item verkaufen?',type:'warn',okText:`Für ${value} Gold verkaufen`}
  );
  if(!ok)return;
  s.gold+=value;s.inventory.splice(i,1);persist();
};

/* Equipped item sale */
window.sellEquipped=async sl=>{
  const it=s.equipment?.[sl];if(!it)return;
  const value=sellValue(it);
  const ok=await v115Confirm(
    `${it.name}\n\nDer Gegenstand wird abgelegt und verkauft.\nVerkaufspreis: ${value} Gold`,
    {title:'Angelegtes Item verkaufen?',type:'warn',okText:`Für ${value} Gold verkaufen`}
  );
  if(!ok)return;
  s.gold+=value;s.equipment[sl]=null;persist();
};

/* Daily Dampf refill */
window.v117RefillDampf=async function(){
  if((s.energy||0)>=V026_MAX_DAMPF)return v115Alert('Dein Dampf ist bereits voll: 300/300.','Dampf voll','info');
  if((s.harzTaler||0)<1)return v115Alert('Du hast keinen Harz-Taler mehr.','Zu wenig Harz-Taler','warn');
  const add=Math.min(V026_REFILL,V026_MAX_DAMPF-(s.energy||0));
  const ok=await v115Confirm(
    `Du erhältst +${add} Dampf.\n\nNicht verbrauchter Dampf verfällt beim täglichen Reset.`,
    {title:'Dampf auffüllen?',type:'confirm',okText:'1 Harz-Taler nutzen'}
  );
  if(!ok)return;
  s.harzTaler--;
  s.energy=Math.min(V026_MAX_DAMPF,(s.energy||0)+V026_REFILL);
  persist(false);render();v026PaintDampf();v026AddRefill();
};
function v117BindDampf(){
  const b=document.querySelector('#v026RefillBtn');
  if(b)b.onclick=v117RefillDampf;
}

/* Reset buttons */
async function v117ResetGame(){
  const ok=await v115Confirm(
    'Dein lokaler Spielstand auf diesem Gerät wird gelöscht und Grow Legends startet neu.',
    {title:'Spielstand wirklich zurücksetzen?',type:'error',okText:'Spielstand löschen'}
  );
  if(!ok)return;
  localStorage.removeItem(KEY);OLD_KEYS.forEach(k=>localStorage.removeItem(k));location.reload();
}
function v117BindReset(){
  const a=document.querySelector('#resetBtn');if(a)a.onclick=v117ResetGame;
  const b=document.querySelector('#v029ResetBtn');if(b)b.onclick=v117ResetGame;
}

/* Modern material application; covers gem and enchant replacement. */
window.v030UseMaterial=async function(index){
  const mat=s.materials?.[index];if(!mat)return;
  const chosen=(typeof v059ChooseEquippedItem==='function')
    ? v059ChooseEquippedItem(mat)
    : (typeof v030ChooseEquipped==='function'?v030ChooseEquipped(`${mat.icon} ${mat.name} anwenden auf:`):null);
  if(!chosen)return;
  const [slot,it]=chosen;
  it.bonus??={};

  if(mat.type==='gem'){
    if(it.gem){
      const ok=await v115Confirm(
        `Auf ${it.name} steckt bereits ${it.gem.name}.\n\nDer alte Edelstein geht beim Ersetzen verloren.`,
        {title:'Edelstein ersetzen?',type:'warn',okText:`Durch ${mat.name} ersetzen`}
      );
      if(!ok)return;
      if(typeof v059RemoveExistingGemBonus==='function')v059RemoveExistingGemBonus(it);
      else if(it.gem.stat&&it.gem.value)it.bonus[it.gem.stat]=Math.max(0,(it.bonus[it.gem.stat]||0)-it.gem.value);
    }
    const stat=mat.stat,value=Number(mat.value)||0;
    if(!stat||value<=0)return v115Alert('Dieser Edelstein hat ungültige Werte.','Edelstein-Fehler','error');
    it.gem={name:mat.name,icon:mat.icon||'💎',stat,value};
    it.bonus[stat]=(Number(it.bonus[stat])||0)+value;
  }else if(mat.type==='scroll'){
    const old=it.enchant || (Array.isArray(it.enchants)&&it.enchants[0]) || null;
    if(old){
      const ok=await v115Confirm(
        `Auf ${it.name} liegt bereits ${old.name}.\n\nDie alte Verzauberung geht beim Ersetzen verloren.`,
        {title:'Verzauberung ersetzen?',type:'warn',okText:`Durch ${mat.name} ersetzen`}
      );
      if(!ok)return;
      if(typeof v059RemoveExistingEnchantEffect==='function')v059RemoveExistingEnchantEffect(it);
      else if(old.effect==='luck'&&old.value)it.bonus.glueck=Math.max(0,(it.bonus.glueck||0)-old.value);
    }
    const effect=mat.effect,value=Number(mat.value)||0;
    if(!effect||value<=0)return v115Alert('Diese Rolle hat ungültige Werte.','Verzauberungs-Fehler','error');
    it.enchant={name:mat.name,icon:mat.icon||'📜',effect,value};
    it.enchants=[it.enchant];
    if(effect==='luck')it.bonus.glueck=(Number(it.bonus.glueck)||0)+value;
  }else return;

  s.equipment[slot]=it;s.materials.splice(index,1);
  persist();
  if(typeof v063Toast==='function')v063Toast(`${mat.name} eingesetzt`,'success',`${it.name} wurde verbessert.`);
};

/* Fresh-game class modal also uses the new dialog. */
function v117PatchClassModal(){
  document.querySelectorAll('[data-v029-class]').forEach(btn=>{
    if(btn.dataset.v117Bound==='1')return;
    btn.dataset.v117Bound='1';
    btn.onclick=async()=>{
      const id=btn.dataset.v029Class;
      const ok=await v115Confirm(
        `${classes[id].name} wirklich wählen?\n\nDiese Entscheidung ist für diesen Charakter dauerhaft.`,
        {title:'Klasse festlegen',type:'warn',okText:'Klasse wählen'}
      );
      if(!ok)return;
      s.playerClass=id;s.classLocked=true;
      localStorage.setItem(KEY,JSON.stringify(s));
      document.querySelector('#v029ClassModal')?.remove();
      render();
    };
  });
}

/* V4.82: retired obsolete paid-dungeon click interceptor.
   The active v246 fight owner already awaits consumeDungeonAttempt(). The old
   interceptor forced dungeonPass.lastFree=0, which made a Harz-paid fight look
   like a free attempt and restarted the one-hour countdown. */

/* Keep bindings alive after the many historical render wrappers. */
const v117BaseRender=render;
render=function(){
  const result=v117BaseRender();
  
  setTimeout(()=>{v117BindDampf();v117BindReset();v117PatchClassModal()},0);
  return result;
};
setTimeout(()=>{try{v117BindDampf();v117BindReset();v117PatchClassModal()}catch(e){}},700);
