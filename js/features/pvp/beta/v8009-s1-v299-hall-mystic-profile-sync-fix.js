
/* V4.02: refresh the public profile equipment payload after login/render so
   Hall of Haze receives mysticSpecial for already-existing characters too. */
async function v299RefreshPublicEquipment(){
  try{
    if(!v073User || typeof v073SyncProfile!=='function')return;
    await v073SyncProfile();
  }catch(e){}
}

/* V4.159: Hall/public-profile mirror refresh is owned by the central boot controller. */


const v299Line=document.querySelector('#v141VersionLine');
