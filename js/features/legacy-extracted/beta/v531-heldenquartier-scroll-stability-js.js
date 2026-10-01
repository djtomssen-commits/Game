
(()=>{
'use strict';
function harden(){
  try{if(typeof window.v7124HardenCharacterAvatar==='function')return window.v7124HardenCharacterAvatar()}catch(_){ }
  const img=document.querySelector('#character #v510HeroRoot .v080-class-avatar-img');
  if(img){img.loading='eager';img.decoding='sync';try{img.fetchPriority='high'}catch(_){}}
  return !!img;
}
window.v126RepairCharacter=function(force=false){return force?harden():false};
window.v531HardenHero=harden;
})();
