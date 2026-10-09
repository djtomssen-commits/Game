/* ===== V4.02 Character identity source of truth =====
   Historical renderClassAvatar() writes the class title (e.g. Bong-Magier)
   into #avatarTitle. Direct avatar redraws can happen outside render().
   The saved characterName is now authoritative on every avatar redraw.
*/
function v275PaintCharacterName(){
  const name=v071CleanName(s.characterName||'');
  const cls=classes?.[s.playerClass];
  const title=document.querySelector('#avatarTitle');
  if(title){
    const expected=v071NameValid(name)?name:(cls?.name||'Klasse wählen');
    if(String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()!=='beta'||title.textContent!==expected)
      title.textContent=expected;
  }

  const sub=document.querySelector('#avatarSubtitle');
  if(sub && cls){
    const flavor={
      grower:'Der Harzbrecher',
      scout:'Jäger des Grünpfeils',
      bruiser:'Meister des Nebelzirkels'
    }[s.playerClass]||'';
    const expected=flavor?`${cls.name} · ${flavor}`:cls.name;
    if(String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()!=='beta'||sub.textContent!==expected)
      sub.textContent=expected;
  }
  try{v071ApplyNameToUi()}catch(e){}
}

const v275BaseRenderClassAvatar=renderClassAvatar;
renderClassAvatar=function(){
  const r=v275BaseRenderClassAvatar.apply(this,arguments);
  v275PaintCharacterName();
  return r;
};

let v275NavTime={at:0,cpuMs:0};
window.v275CharacterNavDiagnostics=()=>({...v275NavTime});
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  if(String(e?.detail?.id||'')!=='character')return;
  const beta=String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta';
  const start=beta?(performance.now?.()||Date.now()):0;
  v275PaintCharacterName();
  if(beta)v275NavTime={at:Date.now(),cpuMs:Math.round((performance.now?.()||Date.now())-start)};
},{passive:true});
window.addEventListener('growlegends:account-ready',v275PaintCharacterName,{passive:true});
