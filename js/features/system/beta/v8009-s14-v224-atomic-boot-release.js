/* ===== V4.02 atomic boot =====
   Old renderers may execute internally, but the user cannot see them.
   Reveal only after current account state + current home are ready.
*/

let v224Released=false;

function v224BuildCurrentUi(){
  try{
    /* Old visible world/reset paths stay dead. */
    try{v029MoveReset=function(){}}catch(e){}
    try{v032InstallWorldMap=function(){}}catch(e){}

    document.querySelector('#v029ResetWorld')?.remove();
    document.querySelector('#resetBtn')?.closest('.card')?.remove();
    document.querySelectorAll('#world > .world-hero,#world > .world-grid')
      .forEach(el=>el.remove());

    /* Current start page only. */
    if(typeof v085InstallWorld==='function'){
      v085InstallWorld();
    }

    try{
      if(typeof v111InstallWorldBossCard==='function'){
        v111InstallWorldBossCard();
      }
    }catch(e){}

    /* Current header values from actual state. */
    try{
      const power=document.querySelector('#power');
      const gold=document.querySelector('#gold');
      const points=document.querySelector('#points');
      const energy=document.querySelector('#energy');
      const harz=document.querySelector('#topHarz');

      if(power)power.textContent=typeof combatPower==='function'?combatPower():'—';
      if(gold)gold.textContent=Number(s.gold)||0;
      if(points)points.textContent=Number(s.points)||0;
      if(energy)energy.textContent=`💨 ${Math.floor(Number(s.energy)||0)}/100`;
      if(harz)harz.textContent=Number(s.harzTaler)||0;
    }catch(e){}

    document.querySelectorAll('.version')
      .forEach(el=>el.textContent='V4.29 Stable');

    return true;
  }catch(e){
    console.error('V4.02 build current UI',e);
    return false;
  }
}

function v224Release(){
  if(v224Released && document.documentElement.classList.contains('v224-app-ready'))return;

  try{
    v224BuildCurrentUi();
  }catch(e){}

  v224Released=true;

  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      document.documentElement.classList.add('v224-app-ready');
    });
  });
}

/*
  Best path: release only after durable user + cloud state are ready.
*/
function v224TryRelease(){
  if(v224Released)return true;

  try{
    if(
      typeof v200DurableUser==='function' &&
      v200DurableUser() &&
      v075CloudLoadedFor===v073User.id &&
      typeof v200CharacterComplete==='function' &&
      v200CharacterComplete()
    ){
      v224Release();
      return true;
    }
  }catch(e){}

  return false;
}

/*
  Wrap finalizer once, at the very end of the file.
*/
if(typeof v200FinalizeUser==='function'){
  const v224BaseFinalizeUser=v200FinalizeUser;

  v200FinalizeUser=async function(user){
    const result=await v224BaseFinalizeUser(user);

    if(
      typeof v200DurableUser==='function' &&
      v200DurableUser() &&
      v075CloudLoadedFor===v073User.id &&
      typeof v200CharacterComplete==='function' &&
      v200CharacterComplete()
    ){
      v224Release();
    }

    return result;
  };
}

/*
  Existing restored sessions.
  One-shot attempts only.
*/
setTimeout(v224TryRelease,150);
setTimeout(v224TryRelease,400);
setTimeout(v224TryRelease,800);

/*
  Failsafe for unexpected auth timing:
  build current UI then reveal, never show legacy state.
*/
setTimeout(()=>{
  if(!v224Released){
    /* V4.159: an unresolved/login state stays behind the auth overlay. Never reveal
       an old character just because authentication took longer than 1.6 seconds. */
    try{document.documentElement.classList.remove('v224-app-ready');v075Overlay(true)}catch(e){}
  }
},1600);
