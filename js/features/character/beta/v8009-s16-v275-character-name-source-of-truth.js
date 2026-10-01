/* ===== V4.02 Character identity source of truth =====
   Historical renderClassAvatar() writes the class title (e.g. Bong-Magier)
   into #avatarTitle. Direct avatar redraws can happen outside render().
   The saved characterName is now authoritative on every avatar redraw.
*/
function v275PaintCharacterName(){
  const name=v071CleanName(s.characterName||'');
  const cls=classes?.[s.playerClass];
  const title=document.querySelector('#avatarTitle');
  if(title)title.textContent=v071NameValid(name)?name:(cls?.name||'Klasse wählen');

  const sub=document.querySelector('#avatarSubtitle');
  if(sub && cls){
    const flavor={
      grower:'Der Harzbrecher',
      scout:'Jäger des Grünpfeils',
      bruiser:'Meister des Nebelzirkels'
    }[s.playerClass]||'';
    sub.textContent=flavor?`${cls.name} · ${flavor}`:cls.name;
  }
  try{v071ApplyNameToUi()}catch(e){}
}

const v275BaseRenderClassAvatar=renderClassAvatar;
renderClassAvatar=function(){
  const r=v275BaseRenderClassAvatar.apply(this,arguments);
  v275PaintCharacterName();
  return r;
};

window.addEventListener('growlegends:navigation-open-v7119',e=>{
  if(String(e?.detail?.id||'')==='character')v275PaintCharacterName();
},{passive:true});
window.addEventListener('growlegends:account-ready',v275PaintCharacterName,{passive:true});
