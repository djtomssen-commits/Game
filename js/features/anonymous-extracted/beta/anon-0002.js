
/* ===== V4.02 Dampf UI Cleanup ===== */
const V028_DAMPF_ICON='💨';

function v028ApplyDampfUI(){
  // Top resource label/value
  const energyEl=document.querySelector('#energy');
  if(energyEl){
    energyEl.textContent=`${V028_DAMPF_ICON} ${Math.floor(s.energy||0)}/300`;
    const stat=energyEl.parentElement;
    if(stat){
      // Preserve only the resource label before the <b>
      const first=stat.childNodes[0];
      if(first && first.nodeType===3) first.nodeValue='DAMPF';
    }
  }

  // Quest costs: replace old symbols/text in rendered quest area only.
  const quests=document.querySelector('#quests');
  if(quests){
    quests.querySelectorAll('*').forEach(el=>{
      if(el.children.length===0 && typeof el.textContent==='string'){
        el.textContent=el.textContent
          .replace(/⚡\s*/g,`${V028_DAMPF_ICON} `)
          .replace(/🍀\s*(\d+)/g,`${V028_DAMPF_ICON} $1`)
          .replace(/\bEnergie\b/g,'Dampf');
      }
    });
  }

  // Refill button/labels
  const refill=document.querySelector('#v026RefillBtn');
  if(refill) refill.textContent=`🟢 +20 ${V028_DAMPF_ICON} Dampf`;

  // Any leftover simple "Energie" labels anywhere in the app.
  document.querySelectorAll('body *').forEach(el=>{
    if(el.children.length===0 && typeof el.textContent==='string'){
      el.textContent=el.textContent.replace(/\bEnergie\b/g,'Dampf');
    }
  });
}

// Replace old V4.02 painter if present.
v026PaintDampf=function(){
  const energyEl=document.querySelector('#energy');
  if(energyEl)energyEl.textContent=`${V028_DAMPF_ICON} ${Math.floor(s.energy||0)}/300`;
  v028ApplyDampfUI();
};

// Make sure the UI is cleaned after every render.
const v028OldRender=render;
render=function(){
  v028OldRender();
  v028ApplyDampfUI();
};

try{v028ApplyDampfUI();render()}catch(e){console.error('V4.02 Dampf UI',e)}
