(function(){
  const VERSION='V4.67 Stable', SHORT='V4.67';
  let arranging=false;

  function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}

  /* Final character order:
     1. normal inventory
     2. gem/scroll inventory
     3. HP + combat power
     4. attributes
     Existing nodes are moved, never recreated, so handlers/state stay intact. */
  function arrangeCharacter(){
    if(arranging)return false;
    arranging=true;
    try{
      const character=document.querySelector('#character');
      const bottom=character?.querySelector('.hero-card .char-bottom');
      const combat=bottom?.querySelector(':scope > .combat-row') || bottom?.querySelector('.combat-row');
      const attrs=bottom?.querySelector(':scope > #attrs') || character?.querySelector('#attrs');
      const inventory=character?.querySelector('#inventory')?.closest('.card');
      const materials=character?.querySelector('#v030Materials');
      if(!character||!bottom||!combat||!inventory)return false;

      inventory.classList.add('v442-inventory-card','v444-inventory-first');
      if(inventory.parentElement!==bottom || inventory.nextElementSibling===attrs || inventory.compareDocumentPosition(combat)&Node.DOCUMENT_POSITION_PRECEDING){
        bottom.insertBefore(inventory,combat);
      }

      if(materials){
        materials.classList.add('v444-material-card');
        const title=materials.querySelector('.section-title h2');
        if(title && title.textContent.trim()!=='💎 Edelstein- & Rollen-Inventar'){
          title.textContent='💎 Edelstein- & Rollen-Inventar';
        }
        if(materials.parentElement!==bottom || materials.previousElementSibling!==inventory || materials.nextElementSibling!==combat){
          bottom.insertBefore(materials,combat);
        }
      }

      /* Ensure combat remains before attributes even if an old boot-time mover ran. */
      if(attrs && attrs.parentElement===bottom && combat.nextElementSibling!==attrs){
        bottom.insertBefore(attrs,combat.nextSibling);
      }
      return true;
    }catch(e){
      console.warn('V4.44 character order',e);
      return false;
    }finally{arranging=false}
  }
  window.v444ArrangeCharacter=arrangeCharacter;

  function stamp(){}

  /* Character navigation/layout owns ordering; no global render wrapper. */
  window.__v444RenderWrapped='retired';
  arrangeCharacter();stamp();
  document.addEventListener('DOMContentLoaded',arrangeCharacter,{once:true});
  window.addEventListener('pageshow',()=>{if(document.getElementById('character')?.classList.contains('active'))arrangeCharacter()},{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')arrangeCharacter()},{passive:true});
})();
