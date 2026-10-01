/* ===== V4.02 character-name/login integrity fix =====
   1) Character screen must show the character name, never replace it with class title.
   2) Profile sync updates an existing own profile instead of blindly upserting.
   3) On login, an existing own profile can repair a missing character name in an older/incomplete save.
*/

async function v272OwnProfile(){
  if(!v073Db || !v073User || v073User.is_anonymous)return null;
  try{
    const {data,error}=await v073Db
      .from('profiles')
      .select('id,character_name,class_id,class_name,level')
      .eq('id',v073User.id)
      .maybeSingle();
    if(error)throw error;
    return data||null;
  }catch(e){
    console.warn('V4.02 own profile read',e);
    return null;
  }
}

/* Existing own profile is authoritative for the name only when the save lost it. */
async function v272RepairNameFromOwnProfile(){
  /* V4.159 ACCOUNT RULE: profiles is a public/social mirror only.
     It must never create/repair the authoritative character identity. */
  return false;
}


/* Replace profile sync with an update-first path for the logged-in user's row. */

/* Replace profile sync with an update-first path for the logged-in user's row. */
v073SyncProfile=async function(force=false){
  if(window.__V200_AUTH_READY__!==true)return false;
  try{
    if(typeof window.v7101SyncPublicProfile==='function'){
      return !!(await window.v7101SyncPublicProfile(!!force));
    }
  }catch(e){
    console.warn('[V7.109] canonical profile sync',e);
  }
  return false;
}

/* Repair incomplete legacy/cloud state before deciding whether character creation is needed. */
const v272BaseFinalizeUser=v200FinalizeUser;
v200FinalizeUser=async function(user){
  if(!user || user.is_anonymous || v200Deleting)return false;

  v073User=user;
  v073Ready=true;
  s.social??={};
  s.social.playerId=user.id;
  localStorage.setItem('growLegendsPlayerId',user.id);

  const ok=await v075ResolveCloudAfterLogin();
  if(!ok)return false;

  /* V4.159: profiles is a public mirror only. Do not block login with a second
     profile read and never hydrate name/class from profiles during account switching. */

  window.__V200_AUTH_READY__=true;
  v075Overlay(false);

  if(v200CharacterComplete()){
    s.characterNameSet=true;
    v200ClearCharacterModals();
    localStorage.setItem(KEY,JSON.stringify(s));
    v200OpenHome();
  }else{
    v200ClearCharacterModals();
    setTimeout(()=>v029ShowClassChoice(),80);
  }

  try{v141BuildSettings()}catch(e){}
  return true;
};

function v272PaintCharacterIdentity(){
  const name=v071CleanName(s.characterName||'');
  const cls=classes?.[s.playerClass];
  const title=document.querySelector('#avatarTitle');
  const sub=document.querySelector('#avatarSubtitle');

  if(title){
    title.textContent=v071NameValid(name)?name:(cls?.name||'Klasse wählen');
  }

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

/* Historical renderClassAvatar writes the class name into #avatarTitle.
   Paint the real character identity after every final render. */
const v272BaseRender=render;
render=function(){
  const r=v272BaseRender();
  requestAnimationFrame(v272PaintCharacterIdentity);
  
  const line=document.querySelector('#v141VersionLine');
  return r;
};

setTimeout(()=>{
  try{v272PaintCharacterIdentity()}catch(e){}
  
  const line=document.querySelector('#v141VersionLine');
},1800);
