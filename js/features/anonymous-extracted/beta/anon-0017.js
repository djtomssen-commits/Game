

/* ===== V4.02 stable character-name helpers ===== */
s.characterName ??= '';
s.characterNameSet ??= false;

function v071CleanName(value){
  return String(value||'')
    .replace(/[<>]/g,'')
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,18);
}

function v071NameValid(name){
  return v071CleanName(name).length>=2;
}

function v071ApplyNameToUi(){
  const name=v071CleanName(s.characterName);
  if(!name)return;

  ['charName','playerName','heroName'].forEach(id=>{
    const el=document.querySelector('#'+id);
    if(el)el.textContent=name;
  });

  const center=document.querySelector('#character .center-name');
  if(center)center.textContent=name;

  const fighterName=document.querySelector('#playerFighter .fighter-name');
  if(fighterName){
    fighterName.innerHTML=`${name} · Lv. <span id="battleLevel">${s.level}</span>`;
  }
}

/* Compatibility stubs. V4.02 owns character creation centrally. */
function v071RequestExistingName(){ return; }
function v071PatchClassModal(){ return; }
function v071CheckName(){
  if(v071NameValid(s.characterName))s.characterNameSet=true;
}

