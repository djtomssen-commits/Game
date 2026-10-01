/* ===== V4.02 unified in-game notification system ===== */

function v063EnsureUi(){
  if(!document.querySelector('#v063Overlay')){
    const overlay=document.createElement('div');
    overlay.id='v063Overlay';
    overlay.className='v063-overlay';
    overlay.innerHTML=`
      <div class="v063-modal" role="dialog" aria-modal="true" aria-labelledby="v063Title">
        <div class="v063-modal-head" id="v063Title">Hinweis</div>
        <div class="v063-modal-body" id="v063Body"></div>
        <div class="v063-modal-actions" id="v063Actions"></div>
      </div>`;
    document.body.appendChild(overlay);
  }

  if(!document.querySelector('#v063ToastStack')){
    const stack=document.createElement('div');
    stack.id='v063ToastStack';
    stack.className='v063-toast-stack';
    document.body.appendChild(stack);
  }
}

function v063Toast(message,type='success',sub=''){
  v063EnsureUi();
  const stack=document.querySelector('#v063ToastStack');
  const toast=document.createElement('div');
  toast.className=`v063-toast ${type}`;
  toast.innerHTML=`${message}${sub?`<span class="sub">${sub}</span>`:''}`;
  stack.appendChild(toast);

  setTimeout(()=>{
    toast.style.opacity='0';
    toast.style.transform='translateY(5px)';
    toast.style.transition='.18s ease';
    setTimeout(()=>toast.remove(),220);
  },2600);
}

function v063ShowMessage(message,title='Hinweis',type='info'){
  return new Promise(resolve=>{
    v063EnsureUi();
    const overlay=document.querySelector('#v063Overlay');
    const titleEl=document.querySelector('#v063Title');
    const body=document.querySelector('#v063Body');
    const actions=document.querySelector('#v063Actions');

    titleEl.textContent=title;
    body.innerHTML='';
    body.textContent=message;
    actions.className='v063-modal-actions single';
    actions.innerHTML='<button type="button" class="btn" id="v063Ok">OK</button>';

    overlay.classList.add('show');
    document.querySelector('#v063Ok').onclick=()=>{
      overlay.classList.remove('show');
      resolve(true);
    };
  });
}

function v063Confirm(message,title='Bestätigen',okText='Bestätigen',cancelText='Abbrechen'){
  return new Promise(resolve=>{
    v063EnsureUi();
    const overlay=document.querySelector('#v063Overlay');
    document.querySelector('#v063Title').textContent=title;
    const body=document.querySelector('#v063Body');
    const actions=document.querySelector('#v063Actions');

    body.innerHTML='';
    body.textContent=message;

    actions.className='v063-modal-actions';
    actions.innerHTML=`
      <button type="button" class="btn secondary" id="v063Cancel">${cancelText}</button>
      <button type="button" class="btn" id="v063Confirm">${okText}</button>`;

    overlay.classList.add('show');

    document.querySelector('#v063Cancel').onclick=()=>{
      overlay.classList.remove('show');
      resolve(false);
    };
    document.querySelector('#v063Confirm').onclick=()=>{
      overlay.classList.remove('show');
      resolve(true);
    };
  });
}

function v063Prompt(message,title='Auswahl',defaultValue=''){
  return new Promise(resolve=>{
    v063EnsureUi();
    const overlay=document.querySelector('#v063Overlay');
    document.querySelector('#v063Title').textContent=title;
    const body=document.querySelector('#v063Body');
    const actions=document.querySelector('#v063Actions');

    body.innerHTML=`
      <div>${String(message).replace(/\n/g,'<br>')}</div>
      <input id="v063PromptInput" class="v063-input" value="${String(defaultValue??'').replace(/"/g,'&quot;')}" />`;

    actions.className='v063-modal-actions';
    actions.innerHTML=`
      <button type="button" class="btn secondary" id="v063PromptCancel">Abbrechen</button>
      <button type="button" class="btn" id="v063PromptOk">Übernehmen</button>`;

    overlay.classList.add('show');
    const input=document.querySelector('#v063PromptInput');
    setTimeout(()=>input?.focus(),0);

    document.querySelector('#v063PromptCancel').onclick=()=>{
      overlay.classList.remove('show');
      resolve(null);
    };
    document.querySelector('#v063PromptOk').onclick=()=>{
      const value=input.value;
      overlay.classList.remove('show');
      resolve(value);
    };
    input.onkeydown=e=>{
      if(e.key==='Enter'){
        e.preventDefault();
        document.querySelector('#v063PromptOk').click();
      }
    };
  });
}

/* --- Replace the important user-facing flows with in-game UI --- */

/* Dungeon extra attempt */
consumeDungeonAttempt=async function(){
  if(freeDungeonReady()){
    s.dungeonPass.lastFree=Date.now();
    return true;
  }

  if(s.harzTaler>=1){
    const ok=await v063Confirm(
      'Dein Gratisversuch ist noch nicht bereit.\n\nMöchtest du 1 Harz-Taler für einen weiteren Dungeon-Versuch ausgeben?',
      'Weiterer Dungeon-Versuch',
      '1 Harz-Taler ausgeben'
    );
    if(!ok)return false;
    s.harzTaler--;
    return true;
  }

  v063Toast(
    '❌ Kein Dungeon-Versuch verfügbar',
    'error',
    'Warte auf den Gratisversuch oder besorge Harz-Taler.'
  );
  return false;
};

/* Material application: custom in-game selection instead of browser prompt */
function v063ChooseEquippedItem(material){
  return new Promise(resolve=>{
    const entries=Object.entries(s.equipment||{}).filter(([slot,it])=>it&&typeof it==='object');

    if(!entries.length){
      v063Toast('❌ Kein Item angelegt','error','Lege zuerst einen Gegenstand an.');
      resolve(null);
      return;
    }

    v063EnsureUi();
    const overlay=document.querySelector('#v063Overlay');
    document.querySelector('#v063Title').textContent=`${material.icon||'✨'} ${material.name} anwenden`;

    const body=document.querySelector('#v063Body');
    const actions=document.querySelector('#v063Actions');

    body.innerHTML=`
      <div style="margin-bottom:9px">Wähle ein angelegtes Item:</div>
      <div id="v063EquipChoices" style="display:grid;gap:7px"></div>`;

    const choices=body.querySelector('#v063EquipChoices');

    entries.forEach(([slot,it],i)=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='btn secondary';
      btn.style.textAlign='left';
      btn.innerHTML=`${it.name}<br><span class="tiny">${itemBonus(it)}</span>`;
      btn.onclick=()=>{
        overlay.classList.remove('show');
        resolve([slot,it]);
      };
      choices.appendChild(btn);
    });

    actions.className='v063-modal-actions single';
    actions.innerHTML='<button type="button" class="btn secondary" id="v063EquipCancel">Abbrechen</button>';

    document.querySelector('#v063EquipCancel').onclick=()=>{
      overlay.classList.remove('show');
      resolve(null);
    };

    overlay.classList.add('show');
  });
}

window.v030UseMaterial=async function(index){
  const mat=s.materials?.[index];
  if(!mat)return;

  const chosen=await v063ChooseEquippedItem(mat);
  if(!chosen)return;

  const [slot,it]=chosen;
  it.bonus??={};

  if(mat.type==='gem'){
    if(it.gem){
      const ok=await v063Confirm(
        `Auf ${it.name} steckt bereits ${it.gem.name}.\n\nMöchtest du ihn durch ${mat.name} ersetzen?`,
        'Edelstein ersetzen',
        'Ersetzen'
      );
      if(!ok)return;
      if(typeof v059RemoveExistingGemBonus==='function')v059RemoveExistingGemBonus(it);
    }

    const stat=mat.stat;
    const value=Number(mat.value)||0;
    if(!stat||value<=0){
      v063Toast('❌ Ungültiger Edelstein','error');
      return;
    }

    it.gem={name:mat.name,icon:mat.icon||'💎',stat,value};
    it.bonus[stat]=(Number(it.bonus[stat])||0)+value;

    s.equipment[slot]=it;
    s.materials.splice(index,1);
    localStorage.setItem(KEY,JSON.stringify(s));

    v063Toast(`💎 ${mat.name} eingesetzt`,'success',`${it.name}: +${value} ${v030StatLabel(stat)}`);

  }else if(mat.type==='scroll'){
    if(it.enchant){
      const ok=await v063Confirm(
        `Auf ${it.name} liegt bereits ${it.enchant.name}.\n\nMöchtest du sie durch ${mat.name} ersetzen?`,
        'Verzauberung ersetzen',
        'Ersetzen'
      );
      if(!ok)return;
      if(typeof v059RemoveExistingEnchantEffect==='function')v059RemoveExistingEnchantEffect(it);
    }

    const effect=mat.effect;
    const value=Number(mat.value)||0;
    if(!effect||value<=0){
      v063Toast('❌ Ungültige Verzauberungsrolle','error');
      return;
    }

    it.enchant={name:mat.name,icon:mat.icon||'📜',effect,value};
    if(effect==='luck')it.bonus.glueck=(Number(it.bonus.glueck)||0)+value;

    s.equipment[slot]=it;
    s.materials.splice(index,1);
    localStorage.setItem(KEY,JSON.stringify(s));

    v063Toast(`📜 ${mat.name} angewendet`,'success',`${it.name}: ${v030EffectLabel(effect,value)}`);
  }

  try{renderInventory();}catch(e){}
  try{v030Materials();}catch(e){}
  try{render();}catch(e){}
};

/* New game reset */
function v063BindResetButtons(){
  document.querySelectorAll('#v029ResetBtn,#resetBtn').forEach(btn=>{
    btn.onclick=async()=>{
      const ok=await v063Confirm(
        'Dein kompletter Spielstand wird gelöscht. Danach startest du neu und wählst eine Klasse.',
        'Spielstand zurücksetzen',
        'Spielstand löschen'
      );
      if(!ok)return;

      localStorage.removeItem(KEY);
      try{OLD_KEYS.forEach(k=>localStorage.removeItem(k));}catch(e){}
      location.reload();
    };
  });
}

/* Class choice confirmation */
function v063PatchClassChoice(){
  document.querySelectorAll('[data-v029-class]').forEach(btn=>{
    if(btn.dataset.v063Bound)return;
    btn.dataset.v063Bound='1';

    btn.onclick=async()=>{
      const id=btn.dataset.v029Class;
      const ok=await v063Confirm(
        `${classes[id].name} wirklich wählen?\n\nDie Klasse kann später in diesem Spielstand nicht gewechselt werden.`,
        'Klasse wählen',
        `${classes[id].name} wählen`
      );
      if(!ok)return;

      s.playerClass=id;
      s.classLocked=true;
      localStorage.setItem(KEY,JSON.stringify(s));
      document.querySelector('#v029ClassModal')?.remove();
      render();
    };
  });
}

/* Shop failures / successes standardize on V4.02 toast */
v054Toast=v063Toast;
v054NotEnoughGold=function(){
  v063Toast('❌ Nicht genug Gold','error','Du kannst diesen Gegenstand noch nicht kaufen.');
};
v054Purchased=function(item,destination='Inventar'){
  v063Toast(`✅ ${item?.name||'Gegenstand'} gekauft`,'success',`Liegt jetzt im ${destination}.`);
};

/* Grow / seed warning helpers */
function v063PatchGrowFeedback(){
  const oldPlant=window.plantSeed;
  if(typeof oldPlant==='function' && !window.v063PlantWrapped){
    window.v063PlantWrapped=true;
  }
}

/* Generic fallback for any remaining native alert calls executed after this patch.
   We intentionally DO NOT override confirm/prompt globally because those are synchronous APIs.
   Important confirm/prompt flows above were migrated to async in-game dialogs. */
window.alert=function(message){
  v063Toast(`ℹ️ ${String(message)}`,'warn');
};

function v063AuditNativeDialogs(){
  /* Remaining native confirm/prompt in old unreachable/legacy handlers may still exist in source,
     but current primary flows are patched above. */
}

const v063BaseRender=render;
render=function(){
  v063BaseRender();
  v063EnsureUi();
  v063BindResetButtons();
  v063PatchClassChoice();
  
};

try{
  v063EnsureUi();
  render();
}catch(e){
  console.error('V4.02 notification system',e);
}
