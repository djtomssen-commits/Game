/* V6.112: modern Heldenquartier owns Book/Pet position.
   The old V4.02 mover must never pull the Illegal Book out of .v514-book-host. */
function v107PlaceBook(){
  const btn=document.querySelector('#v106BookBtn');
  if(!btn)return;

  const pet=document.querySelector('#v686PetAlbumBtn');
  const root=document.querySelector('#v510HeroRoot');
  let host=root?.querySelector('.v514-book-host');

  if(root){
    if(!host){
      const stage=root.querySelector('.v510-stage');
      host=document.createElement('div');
      host.className='v514-book-host';
      if(stage)stage.insertAdjacentElement('afterend',host);
      else root.appendChild(host);
    }

    /* Hard DOM order: Illegal Book first, Pet Album second. */
    if(btn.parentElement!==host || host.firstElementChild!==btn){
      host.insertBefore(btn,host.firstElementChild||null);
    }
    if(pet){
      if(pet.parentElement!==host || pet.previousElementSibling!==btn){
        btn.insertAdjacentElement('afterend',pet);
      }
    }
    return;
  }

  /* Fallback for very early boot before the modern hero root exists. */
  const level=document.querySelector('#character .level-shield');
  if(level && btn.previousElementSibling!==level){
    level.insertAdjacentElement('afterend',btn);
  }
}

/* Override installer so future renders never put the book beside the avatar again. */
const v107OldInstallBook=v106InstallBook;
v106InstallBook=function(){
  v107OldInstallBook();
  v107PlaceBook();
};

function v107CharacterBookPlace(){
  try{v107PlaceBook()}catch(_){}
}
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  if(String(e?.detail?.id||'')==='character')v107CharacterBookPlace();
},{passive:true});
window.addEventListener('growlegends:account-ready',()=>{
  if(document.getElementById('character')?.classList.contains('active'))v107CharacterBookPlace();
},{passive:true});
document.addEventListener('DOMContentLoaded',v107CharacterBookPlace,{once:true});
if(document.readyState!=='loading')v107CharacterBookPlace();
