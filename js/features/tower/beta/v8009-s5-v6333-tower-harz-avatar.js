(()=>{
'use strict';
if(window.__V6333_TOWER_HARZ_AVATAR__)return;
window.__V6333_TOWER_HARZ_AVATAR__=true;
window.V6333_HARZ_TOWER_AVATAR='assets/v7198-base64/11e78462c9373c3e267d.webp';
function state(){try{return typeof s!=='undefined'?s:window.s||null}catch(_){return window.s||null}}
function repair(){
  if(String(state()?.playerClass||'')!=='summoner')return false;
  const stage=document.querySelector('#tower .v6259-battle');
  const fighter=document.querySelector('#tower #vTPlayerFighter');
  if(!stage||!fighter)return false;
  stage.classList.add('v6294-summoner-tower');
  fighter.querySelectorAll(':scope > .v6327-tower-player-art').forEach(n=>n.remove());
  let img=fighter.querySelector(':scope > img.v6333-tower-harz-avatar');
  if(!img){
    fighter.querySelectorAll(':scope > img').forEach(n=>n.remove());
    img=document.createElement('img');
    img.className='v6333-tower-harz-avatar';
    img.alt='Harzruferin';
    img.decoding='sync';
    img.loading='eager';
    fighter.insertBefore(img,fighter.firstChild);
  }
  if(img.getAttribute('src')!==window.V6333_HARZ_TOWER_AVATAR)img.setAttribute('src',window.V6333_HARZ_TOWER_AVATAR);
  fighter.querySelectorAll(':scope > img').forEach(n=>{if(n!==img)n.remove()});
  return true;
}
window.v6333RepairTowerHarzAvatar=repair;
document.addEventListener('click',e=>{
  if(e.target?.closest?.('[data-vt-fight],[data-vt-route],[data-screen="tower"],[data-go="tower"]')){requestAnimationFrame(repair);setTimeout(repair,90)}
},true);
window.addEventListener('growlegends:account-ready',()=>setTimeout(repair,80));
window.addEventListener('pageshow',()=>setTimeout(repair,80),{passive:true});
setTimeout(repair,180);
window.v6333TowerHarzAvatarDiagnostics=()=>({
  version:'V6.334',
  playerClass:String(state()?.playerClass||''),
  dedicatedImgs:document.querySelectorAll('#tower #vTPlayerFighter>img.v6333-tower-harz-avatar').length,
  legacyLayers:document.querySelectorAll('#tower #vTPlayerFighter>.v6327-tower-player-art').length,
  directImgs:document.querySelectorAll('#tower #vTPlayerFighter>img').length
});
})();
